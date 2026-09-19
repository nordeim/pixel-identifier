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
  // R7-F1: pageviews from the IDENTIFIED visitor — the feed must keep
  // showing the anonymous id for those rows (the live never rewrites a
  // pageview row into an email, even after the visitor is identified).
  await db.event.create({
    data: {
      siteId: site.id,
      visitorId: visitorIdentified.id,
      name: 'pageview',
      path: '/identified-pageview',
      createdAt: new Date(base + 101 * 60_000),
    },
  })
  return user
}

describe('listActivity (F-25/R22-F6: 50-per-page offset pagination, shared query)', () => {
  beforeEach(async () => {
    await db.user.deleteMany()
  })

  it('returns the newest 50-event page with the exact count', async () => {
    const user = await seed()

    const first = await listActivity(user.id)

    expect(first.events).toHaveLength(50)
    expect(first.count).toBe(101)
    expect(first.pageCount).toBe(3)
    // Newest first.
    expect(first.events[0].path).toBe('/identified-pageview')
    expect(first.events[0].name).toBe('pageview')
    // Identified visitors show email; anonymous show truncated id.
    const identified = first.events.find((e) => e.name === 'identification')
    expect(identified?.email).toBe('known@activity.example')
    expect(identified?.anonymousId).toBeNull()
    const anonymous = first.events.find((e) => e.name === 'pageview' && e.path.startsWith('/page-'))
    expect(anonymous?.anonymousId).toBe('v_act_anonym')
    expect(anonymous?.email).toBeNull()
  })

  it('R7-F1: pageview rows from identified visitors show the anonymous id, not the email', async () => {
    const user = await seed()

    const first = await listActivity(user.id)

    // The newest event is a pageview from the identified visitor.
    const pageview = first.events[0]
    expect(pageview.path).toBe('/identified-pageview')
    expect(pageview.name).toBe('pageview')
    expect(pageview.email).toBeNull()
    expect(pageview.anonymousId).toBe('v_act_identi') // 12-char truncation

    // Identification rows still carry the email.
    const identification = first.events.find((e) => e.name === 'identification')
    expect(identification?.email).toBe('known@activity.example')
    expect(identification?.anonymousId).toBeNull()
  })

  it('pages by offset with no overlap (the live\'s range model)', async () => {
    const user = await seed()

    const first = await listActivity(user.id)
    const second = await listActivity(user.id, { page: 1 })
    const third = await listActivity(user.id, { page: 2 })

    expect(second.events).toHaveLength(50)
    expect(second.events[0].path).toBe('/page-50')
    expect(third.events).toHaveLength(1)
    expect(third.events[0].path).toBe('/page-0')
    // Contiguous, no overlap, still descending.
    const firstIds = new Set(first.events.map((e) => e.id))
    expect(second.events.every((e) => !firstIds.has(e.id))).toBe(true)
    const secondIds = new Set(second.events.map((e) => e.id))
    expect(third.events.every((e) => !secondIds.has(e.id))).toBe(true)
  })

  it('scopes strictly to the requesting user', async () => {
    const user = await seed()
    const stranger = await db.user.create({
      data: { email: `stranger-${crypto.randomUUID()}@test.example`, passwordHash: 'x' },
    })
    const result = await listActivity(stranger.id)
    expect(result.events).toHaveLength(0)
    expect(result.count).toBe(0)
    expect(result.pageCount).toBe(0)
    void user
  })
})
