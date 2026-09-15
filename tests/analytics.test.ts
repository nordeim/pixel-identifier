import { beforeEach, describe, expect, it } from 'vitest'
import { db } from '@/lib/db'
import { getOverviewStats, getTrend } from '@/lib/analytics'

async function seed() {
  const user = await db.user.create({
    data: {
      email: `analytics-${crypto.randomUUID()}@test.example`,
      passwordHash: 'not-a-real-hash',
    },
  })
  return user
}

async function addSite(userId: string, domain: string, status: 'pending' | 'verified') {
  return db.site.create({
    data: {
      userId,
      domain,
      status,
      siteKey: `px_${crypto.randomUUID().replace(/-/g, '').slice(0, 16)}`,
    },
  })
}

describe('getOverviewStats (R5-M2: Active Domains KPI matches live)', () => {
  beforeEach(async () => {
    await db.user.deleteMany()
  })

  it('counts ALL domains as the KPI value, verified reported in the sub-line', async () => {
    const user = await seed()
    await addSite(user.id, 'live.example', 'verified')
    await addSite(user.id, 'staged.example', 'pending')

    const stats = await getOverviewStats(user.id)

    // Live observation: the KPI shows the total domain count (2) with the
    // sub-line "1 verified" — not the verified count as the value.
    expect(stats.activeDomains).toBe(2)
    expect(stats.verifiedDomains).toBe(1)
    expect(stats.pendingDomains).toBe(1)
  })

  it('returns zeros for a user with nothing', async () => {
    const user = await seed()
    const stats = await getOverviewStats(user.id)
    expect(stats.totalVisitors).toBe(0)
    expect(stats.matchRate).toBe(0)
    expect(stats.activeDomains).toBe(0)
  })
})

describe('getTrend (F-04: UTC-consistent day buckets)', () => {
  beforeEach(async () => {
    await db.user.deleteMany()
  })

  it('labels every bucket with its own UTC date key', async () => {
    const user = await seed()
    const site = await addSite(user.id, 'trend.example', 'verified')
    const visitor = await db.visitor.create({
      data: { siteId: site.id, anonymousId: 'v_trend_0001' },
    })
    // One pageview right now.
    await db.event.create({
      data: {
        siteId: site.id,
        visitorId: visitor.id,
        name: 'pageview',
        path: '/',
        createdAt: new Date(),
      },
    })

    const trend = await getTrend(user.id, 14)
    expect(trend).toHaveLength(14)

    // Bucket key and label must name the same day.
    for (const bucket of trend) {
      const fromKey = new Date(`${bucket.date}T12:00:00Z`).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        timeZone: 'UTC',
      })
      expect(bucket.label).toBe(fromKey)
    }

    // Today's (UTC) bucket carries the pageview.
    const todayKey = new Date().toISOString().slice(0, 10)
    const today = trend.find((bucket) => bucket.date === todayKey)
    expect(today?.pageviews).toBe(1)
    expect(trend.reduce((sum, bucket) => sum + bucket.pageviews, 0)).toBe(1)
  })

  it('stays UTC-aligned on a server running ahead of UTC (TZ=Asia/Singapore)', async () => {
    const user = await seed()
    const site = await addSite(user.id, 'tz.example', 'verified')
    const visitor = await db.visitor.create({
      data: { siteId: site.id, anonymousId: 'v_tz_000001' },
    })
    // An event at 20:00 UTC — already "tomorrow" in Singapore local time.
    const stamped = new Date()
    stamped.setUTCHours(20, 0, 0, 0)
    if (stamped.getTime() > Date.now()) stamped.setUTCDate(stamped.getUTCDate() - 1)
    await db.event.create({
      data: {
        siteId: site.id,
        visitorId: visitor.id,
        name: 'pageview',
        path: '/',
        createdAt: stamped,
      },
    })

    process.env.TZ = 'Asia/Singapore'
    try {
      const trend = await getTrend(user.id, 14)
      // The event must sit in the bucket whose key is its UTC date.
      const eventDay = stamped.toISOString().slice(0, 10)
      const bucket = trend.find((b) => b.date === eventDay)
      expect(bucket?.pageviews).toBe(1)
      // Every label still matches its own UTC key.
      for (const b of trend) {
        const fromKey = new Date(`${b.date}T12:00:00Z`).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          timeZone: 'UTC',
        })
        expect(b.label).toBe(fromKey)
      }
    } finally {
      process.env.TZ = 'UTC'
    }
  })
})
