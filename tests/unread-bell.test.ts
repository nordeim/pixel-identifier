import { beforeEach, describe, expect, it } from 'vitest'
import { db } from '@/lib/db'
import { hasRecentIdentifications } from '@/lib/analytics'

async function seedUserWithEvent(eventName: string, ageDays: number) {
  const user = await db.user.create({
    data: {
      email: `bell-${crypto.randomUUID()}@test.example`,
      passwordHash: 'not-a-real-hash',
    },
  })
  const site = await db.site.create({
    data: {
      userId: user.id,
      domain: 'bell.example',
      siteKey: `px_${crypto.randomUUID().replace(/-/g, '').slice(0, 16)}`,
    },
  })
  const visitor = await db.visitor.create({
    data: {
      siteId: site.id,
      anonymousId: `bell_${crypto.randomUUID().slice(0, 8)}`,
      email: 'someone@mail.example',
      type: 'individual',
      source: 'direct',
      confidence: 90,
    },
  })
  await db.event.create({
    data: {
      siteId: site.id,
      visitorId: visitor.id,
      name: eventName,
      path: '/',
      createdAt: new Date(Date.now() - ageDays * 86_400_000),
    },
  })
  return user
}

/** Round-4 plan S5: the bell dot must reflect real recent identifications. */
describe('hasRecentIdentifications', () => {
  beforeEach(async () => {
    await db.user.deleteMany()
  })

  it('is true when an identification resolved within the last 7 days', async () => {
    const user = await seedUserWithEvent('identification', 1)
    expect(await hasRecentIdentifications(user.id)).toBe(true)
  })

  it('is false when the newest identification is older than 7 days', async () => {
    const user = await seedUserWithEvent('identification', 10)
    expect(await hasRecentIdentifications(user.id)).toBe(false)
  })

  it('ignores pageview events regardless of recency', async () => {
    const user = await seedUserWithEvent('pageview', 0)
    expect(await hasRecentIdentifications(user.id)).toBe(false)
  })

  it('is false for a user with no events', async () => {
    const user = await db.user.create({
      data: {
        email: `bell-${crypto.randomUUID()}@test.example`,
        passwordHash: 'not-a-real-hash',
      },
    })
    expect(await hasRecentIdentifications(user.id)).toBe(false)
  })
})
