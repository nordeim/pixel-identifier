import 'server-only'
import { db } from '@/lib/db'
import type { Plan } from '@/lib/plans'

/**
 * Quota accounting — the ONLY module allowed to mutate identificationsUsed.
 *
 * Both write paths are guarded so they stay correct under concurrent beacons:
 *  - the monthly window reset is conditioned on the stale anchor it read, so
 *    a concurrent reset cannot double-apply;
 *  - consumption is a single conditional UPDATE (`used < limit`), so exactly
 *    `limit` concurrent consumptions can ever succeed — no check-then-write
 *    race, no transaction required.
 */

export interface QuotaSnapshot {
  used: number
  periodStart: Date
}

const WINDOW_DAYS = 30

/**
 * Persist the rolling monthly reset when 30 days have elapsed. Returns the
 * effective {used, periodStart} the caller should reason with — which equals
 * the persisted state after this call.
 */
export async function resetMonthlyWindowIfNeeded(
  userId: string,
  plan: Plan,
  current: QuotaSnapshot,
): Promise<QuotaSnapshot> {
  if (plan.limitPeriod !== 'monthly') return current

  const elapsedDays = (Date.now() - current.periodStart.getTime()) / 86_400_000
  if (elapsedDays < WINDOW_DAYS) return current

  const now = new Date()
  // Guard on the stale anchor so only one concurrent request applies the
  // reset; the loser re-reads the already-reset state.
  const applied = await db.user.updateMany({
    where: { id: userId, usagePeriodStart: current.periodStart },
    data: { identificationsUsed: 0, usagePeriodStart: now },
  })
  if (applied.count === 1) return { used: 0, periodStart: now }

  const fresh = await db.user.findUnique({
    where: { id: userId },
    select: { identificationsUsed: true, usagePeriodStart: true },
  })
  return fresh
    ? { used: fresh.identificationsUsed, periodStart: fresh.usagePeriodStart }
    : { used: 0, periodStart: now }
}

/**
 * Atomically consume one identification slot.
 *
 * Monthly (paid) plans keep identifying past their allowance — the extra
 * identifications are counted and billed at the plan's per-identification
 * rate (see the plan-panel copy), so consumption is unconditional.
 *
 * The free lifetime plan hard-stops: a single conditional UPDATE
 * (`used < limit`) guarantees exactly `limit` successful consumptions can
 * ever happen, even under fully concurrent beacons.
 */
export async function consumeIdentification(userId: string, plan: Plan): Promise<boolean> {
  if (plan.limitPeriod === 'monthly') {
    await db.user.update({
      where: { id: userId },
      data: { identificationsUsed: { increment: 1 } },
    })
    return true
  }

  const consumed = await db.user.updateMany({
    where: { id: userId, identificationsUsed: { lt: plan.identificationLimit } },
    data: { identificationsUsed: { increment: 1 } },
  })
  return consumed.count === 1
}
