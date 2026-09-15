import { beforeEach, describe, expect, it } from 'vitest'
import { db } from '@/lib/db'
import { getPlan } from '@/lib/plans'
import { consumeIdentification, resetMonthlyWindowIfNeeded } from '@/lib/quota'
import { getUsage } from '@/lib/analytics'

const DAY_MS = 86_400_000

async function createUser(overrides: {
  plan?: string
  identificationsUsed?: number
  usagePeriodStart?: Date
} = {}) {
  return db.user.create({
    data: {
      email: `quota-${crypto.randomUUID()}@test.example`,
      passwordHash: 'not-a-real-hash',
      plan: overrides.plan ?? 'free',
      identificationsUsed: overrides.identificationsUsed ?? 0,
      usagePeriodStart: overrides.usagePeriodStart ?? new Date(),
    },
  })
}

async function reload(userId: string) {
  return db.user.findUniqueOrThrow({
    where: { id: userId },
    select: { identificationsUsed: true, usagePeriodStart: true },
  })
}

describe('consumeIdentification', () => {
  beforeEach(async () => {
    await db.user.deleteMany()
  })

  it('consumes quota for a free user below the limit', async () => {
    const user = await createUser({ identificationsUsed: 40 })
    const allowed = await consumeIdentification(user.id, getPlan('free'))
    expect(allowed).toBe(true)
    expect((await reload(user.id)).identificationsUsed).toBe(41)
  })

  it('refuses consumption for a free user at the lifetime limit', async () => {
    const user = await createUser({ identificationsUsed: 100 })
    const allowed = await consumeIdentification(user.id, getPlan('free'))
    expect(allowed).toBe(false)
    expect((await reload(user.id)).identificationsUsed).toBe(100)
  })

  it('allows exactly `limit` concurrent consumptions — never overshoots (race Prove-It)', async () => {
    const user = await createUser({ identificationsUsed: 0 })
    const free = getPlan('free')
    const results = await Promise.all(
      Array.from({ length: free.identificationLimit + 10 }, () =>
        consumeIdentification(user.id, free),
      ),
    )
    const successes = results.filter(Boolean).length
    expect(successes).toBe(free.identificationLimit)
    expect((await reload(user.id)).identificationsUsed).toBe(free.identificationLimit)
  })

  it('caps monthly plans at their limit (pre-overage behaviour)', async () => {
    const user = await createUser({ plan: 'growth', identificationsUsed: 1500 })
    const allowed = await consumeIdentification(user.id, getPlan('growth'))
    expect(allowed).toBe(false)
    expect((await reload(user.id)).identificationsUsed).toBe(1500)
  })
})

describe('resetMonthlyWindowIfNeeded', () => {
  beforeEach(async () => {
    await db.user.deleteMany()
  })

  it('persists the reset when the 30-day window has elapsed', async () => {
    const staleStart = new Date(Date.now() - 31 * DAY_MS)
    const user = await createUser({
      plan: 'growth',
      identificationsUsed: 250,
      usagePeriodStart: staleStart,
    })

    const snapshot = await resetMonthlyWindowIfNeeded(user.id, getPlan('growth'), {
      used: 250,
      periodStart: staleStart,
    })

    expect(snapshot.used).toBe(0)
    const persisted = await reload(user.id)
    expect(persisted.identificationsUsed).toBe(0)
    expect(persisted.usagePeriodStart.getTime()).toBeGreaterThan(Date.now() - 60_000)
  })

  it('keeps the window untouched before 30 days have elapsed', async () => {
    const recentStart = new Date(Date.now() - 5 * DAY_MS)
    const user = await createUser({
      plan: 'starter',
      identificationsUsed: 120,
      usagePeriodStart: recentStart,
    })

    const snapshot = await resetMonthlyWindowIfNeeded(user.id, getPlan('starter'), {
      used: 120,
      periodStart: recentStart,
    })

    expect(snapshot.used).toBe(120)
    expect(snapshot.periodStart).toEqual(recentStart)
    const persisted = await reload(user.id)
    expect(persisted.identificationsUsed).toBe(120)
    expect(persisted.usagePeriodStart).toEqual(recentStart)
  })

  it('is a no-op for lifetime (free) plans', async () => {
    const ancientStart = new Date(Date.now() - 400 * DAY_MS)
    const user = await createUser({
      plan: 'free',
      identificationsUsed: 90,
      usagePeriodStart: ancientStart,
    })

    const snapshot = await resetMonthlyWindowIfNeeded(user.id, getPlan('free'), {
      used: 90,
      periodStart: ancientStart,
    })

    expect(snapshot.used).toBe(90)
    expect((await reload(user.id)).identificationsUsed).toBe(90)
  })
})

describe('getUsage (F-03: display reset must persist)', () => {
  beforeEach(async () => {
    await db.user.deleteMany()
  })

  it('returns the reset window AND persists it to the database', async () => {
    const user = await createUser({
      plan: 'growth',
      identificationsUsed: 900,
      usagePeriodStart: new Date(Date.now() - 45 * DAY_MS),
    })

    const usage = await getUsage(user.id)
    expect(usage.used).toBe(0)
    expect(usage.percent).toBe(0)
    expect(usage.period).toBe('monthly')

    const persisted = await reload(user.id)
    expect(persisted.identificationsUsed).toBe(0)
    expect(persisted.usagePeriodStart.getTime()).toBeGreaterThan(Date.now() - 60_000)
  })

  it('falls back to free-plan usage for a missing user', async () => {
    const usage = await getUsage('does-not-exist')
    expect(usage.plan.id).toBe('free')
    expect(usage.used).toBe(0)
    expect(usage.limit).toBe(100)
    expect(usage.period).toBe('lifetime')
  })
})
