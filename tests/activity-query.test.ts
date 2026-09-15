import { beforeEach, describe, expect, it } from 'vitest'
import { db } from '@/lib/db'
import { listActivity } from '@/lib/analytics'

async function seed() {
  const user = await db.user.create({
    data: {
      email: `activity-${crypto.randomUUID()}@test.example`,
      passwordHash: 'not-a-real-hash',
    },
  })
  const site = await db.site.create({
    data: {
      userId: user.id,
      domain: 'activity.example',
      siteKey: `px_${crypto.randomUUID().replace(/-/g, '').slice(0, 16)}`,
    },
  })
  const visitorIdentified = await db.visitor.create({
    data: { siteId: site.id, anonymousId: 'v_act_identified_1', email: 'known@activity.example' },
  })
  const visitorAnon = await db.visitor.create({
    data: { siteId: site.id, anonymousId: 'v_act_anonymous_0011' },
  })

  // 100 events with strictly distinct timestamps (newest last).
  const base = Date.now() - 200 * 60_000
  for (let i = 0; i < 100; i++) {
    const identified = i % 10 === 0
    await db.event.create({
      data: {
        siteId: site.id,
        visitorId: identified ? visitorIdentified.id : visitorAnon.id,
        name: identified ? 'identification' : 'pageview',
        path: `/page-${i}`,
        createdAt: new Date(base + i * 60_000),
      },
    })
  }
  return user
}

describe('listActivity (F-25: cursor pagination, shared query)', () => {
  beforeEach(async () => {
    await db.user.deleteMany()
  })

  it('returns the newest page with a nextCursor', async () => {
    const user = await seed()

    const first = await listActivity(user.id, { take: 60 })

    expect(first.events).toHaveLength(60)
    expect(first.nextCursor).not.toBeNull()
    // Newest first.
    expect(first.events[0].path).toBe('/page-99')
    expect(first.events[0].name).toBe('pageview')
    // Identified visitors show email; anonymous show truncated id.
    const identified = first.events.find((e) => e.name === 'identification')
    expect(identified?.email).toBe('known@activity.example')
    expect(identified?.anonymousId).toBeNull()
    const anonymous = first.events.find((e) => e.name === 'pageview')
    expect(anonymous?.anonymousId).toBe('v_act_anonym')
    expect(anonymous?.email).toBeNull()
  })

  it('walks the cursor to the remaining events', async () => {
    const user = await seed()

    const first = await listActivity(user.id, { take: 60 })
    const second = await listActivity(user.id, { take: 60, cursor: first.nextCursor ?? undefined })

    expect(second.events).toHaveLength(40)
    expect(second.nextCursor).toBeNull()
    // Contiguous, no overlap, still descending.
    expect(second.events[0].path).toBe('/page-39')
    expect(second.events[39].path).toBe('/page-0')
    const firstIds = new Set(first.events.map((e) => e.id))
    expect(second.events.every((e) => !firstIds.has(e.id))).toBe(true)
  })

  it('scopes strictly to the requesting user', async () => {
    const user = await seed()
    const stranger = await db.user.create({
      data: { email: `stranger-${crypto.randomUUID()}@test.example`, passwordHash: 'x' },
    })
    const result = await listActivity(stranger.id, { take: 60 })
    expect(result.events).toHaveLength(0)
    expect(result.nextCursor).toBeNull()
    void user
  })
})
