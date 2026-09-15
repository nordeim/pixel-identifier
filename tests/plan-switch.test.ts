import { beforeEach, describe, expect, it, vi } from 'vitest'
import { db } from '@/lib/db'
import { changePlanAction } from '@/actions/settings'

let sessionUserId: string | null = null

vi.mock('next-auth', () => ({
  getServerSession: vi.fn(async () =>
    sessionUserId ? { user: { id: sessionUserId } } : null,
  ),
}))

const DAY_MS = 86_400_000

async function createUser(overrides: {
  plan?: string
  identificationsUsed?: number
  usagePeriodStart?: Date
} = {}) {
  return db.user.create({
    data: {
      email: `plan-${crypto.randomUUID()}@test.example`,
      passwordHash: 'not-a-real-hash',
      plan: overrides.plan ?? 'free',
      identificationsUsed: overrides.identificationsUsed ?? 0,
      usagePeriodStart: overrides.usagePeriodStart ?? new Date(),
    },
  })
}

async function createSite(userId: string, domain: string) {
  return db.site.create({
    data: {
      userId,
      domain,
      siteKey: `px_${crypto.randomUUID().replace(/-/g, '').slice(0, 16)}`,
    },
  })
}

function planForm(plan: string, cycle: string): FormData {
  const form = new FormData()
  form.set('plan', plan)
  form.set('cycle', cycle)
  return form
}

describe('changePlanAction (F-17: switching must not reset usage)', () => {
  beforeEach(async () => {
    sessionUserId = null
    await db.user.deleteMany()
  })

  it('keeps the used counter when upgrading tiers', async () => {
    const oldAnchor = new Date(Date.now() - 10 * DAY_MS)
    const user = await createUser({
      plan: 'free',
      identificationsUsed: 40,
      usagePeriodStart: oldAnchor,
    })
    sessionUserId = user.id

    const result = await changePlanAction(null, planForm('growth', 'annual'))

    expect(result.ok).toBe(true)
    const persisted = await db.user.findUniqueOrThrow({
      where: { id: user.id },
      select: { plan: true, billingCycle: true, identificationsUsed: true, usagePeriodStart: true },
    })
    expect(persisted.plan).toBe('growth')
    expect(persisted.billingCycle).toBe('annual')
    expect(persisted.identificationsUsed).toBe(40) // NOT reset
    expect(persisted.usagePeriodStart.getTime()).toBeGreaterThan(Date.now() - 60_000)
  })

  it('keeps the used counter when downgrading tiers', async () => {
    const user = await createUser({ plan: 'growth', identificationsUsed: 700 })
    sessionUserId = user.id

    const result = await changePlanAction(null, planForm('free', 'monthly'))

    expect(result.ok).toBe(true)
    const persisted = await db.user.findUniqueOrThrow({
      where: { id: user.id },
      select: { plan: true, identificationsUsed: true },
    })
    expect(persisted.plan).toBe('free')
    expect(persisted.identificationsUsed).toBe(700) // NOT reset
  })

  it('does not extend the window on a cycle-only switch', async () => {
    const anchor = new Date(Date.now() - 10 * DAY_MS)
    const user = await createUser({
      plan: 'growth',
      identificationsUsed: 200,
      usagePeriodStart: anchor,
    })
    sessionUserId = user.id

    const result = await changePlanAction(null, planForm('growth', 'annual'))

    expect(result.ok).toBe(true)
    const persisted = await db.user.findUniqueOrThrow({
      where: { id: user.id },
      select: { usagePeriodStart: true },
    })
    expect(persisted.usagePeriodStart).toEqual(anchor) // anchor untouched
  })

  it('blocks downgrades below the current domain count', async () => {
    const user = await createUser({ plan: 'scale' })
    sessionUserId = user.id
    await createSite(user.id, 'one.example')
    await createSite(user.id, 'two.example')
    await createSite(user.id, 'three.example')

    const result = await changePlanAction(null, planForm('free', 'monthly'))

    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error.code).toBe('VALIDATION')
    const persisted = await db.user.findUniqueOrThrow({
      where: { id: user.id },
      select: { plan: true },
    })
    expect(persisted.plan).toBe('scale') // unchanged
  })

  it('rejects unauthenticated calls', async () => {
    sessionUserId = null
    const result = await changePlanAction(null, planForm('growth', 'monthly'))
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error.code).toBe('UNAUTHENTICATED')
  })
})
