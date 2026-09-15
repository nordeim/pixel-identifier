import { beforeEach, describe, expect, it } from 'vitest'
import { db } from '@/lib/db'
import { getTopPages } from '@/lib/analytics'

async function seed() {
  const user = await db.user.create({
    data: {
      email: `toppages-${crypto.randomUUID()}@test.example`,
      passwordHash: 'not-a-real-hash',
    },
  })
  const site = await db.site.create({
    data: {
      userId: user.id,
      domain: 'top.example',
      siteKey: `px_${crypto.randomUUID().replace(/-/g, '').slice(0, 16)}`,
    },
  })
  const visitor = await db.visitor.create({
    data: { siteId: site.id, anonymousId: 'v_top_0001' },
  })

  async function events(...specs: [path: string, count: number][]) {
    for (const [path, count] of specs) {
      for (let i = 0; i < count; i++) {
        await db.event.create({
          data: {
            siteId: site.id,
            visitorId: visitor.id,
            name: 'pageview',
            path,
          },
        })
      }
    }
  }

  return { user, events }
}

/**
 * Round-4 plan R4: getTopPages must aggregate in SQL (groupBy) while keeping
 * the exact return contract: top 5 by views, deterministic order, pageview
 * events only, scoped to the caller's sites.
 */
describe('getTopPages (SQL groupBy, contract preserved)', () => {
  beforeEach(async () => {
    await db.user.deleteMany()
  })

  it('counts views per path, ordered by views desc, capped at 5', async () => {
    const { user, events } = await seed()
    await events(
      ['/', 7],
      ['/pricing', 5],
      ['/blog/a', 3],
      ['/blog/b', 2],
      ['/docs', 1],
      ['/about', 1],
    )

    const pages = await getTopPages(user.id)
    expect(pages).toHaveLength(5)
    expect(pages[0]).toEqual({ path: '/', views: 7 })
    expect(pages[1]).toEqual({ path: '/pricing', views: 5 })
    expect(pages[2]).toEqual({ path: '/blog/a', views: 3 })
    expect(pages[3]).toEqual({ path: '/blog/b', views: 2 })
    // Tie between /docs and /about (1 view each) — deterministic by path.
    expect(['/about', '/docs']).toContain(pages[4].path)
    expect(pages[4].views).toBe(1)
  })

  it('breaks view-count ties deterministically by path asc', async () => {
    const { user, events } = await seed()
    await events(['/z-page', 2], ['/a-page', 2], ['/m-page', 2])

    const pages = await getTopPages(user.id)
    expect(pages.map((page) => page.path)).toEqual(['/a-page', '/m-page', '/z-page'])
  })

  it('ignores identification events', async () => {
    const { user, events } = await seed()
    await events(['/', 3])

    const site = await db.site.findFirstOrThrow({ where: { userId: user.id } })
    const visitor = await db.visitor.findFirstOrThrow({ where: { siteId: site.id } })
    await db.event.create({
      data: { siteId: site.id, visitorId: visitor.id, name: 'identification', path: '/checkout' },
    })

    const pages = await getTopPages(user.id)
    expect(pages).toEqual([{ path: '/', views: 3 }])
  })

  it('returns an empty array for a user with no events', async () => {
    const user = await db.user.create({
      data: {
        email: `toppages-${crypto.randomUUID()}@test.example`,
        passwordHash: 'not-a-real-hash',
      },
    })
    expect(await getTopPages(user.id)).toEqual([])
  })

  it('never leaks another user’s pages', async () => {
    const { user, events } = await seed()
    await events(['/mine', 4])

    const stranger = await db.user.create({
      data: {
        email: `stranger-${crypto.randomUUID()}@test.example`,
        passwordHash: 'not-a-real-hash',
      },
    })

    expect(await getTopPages(stranger.id)).toEqual([])
    expect(await getTopPages(user.id)).toEqual([{ path: '/mine', views: 4 }])
  })
})
