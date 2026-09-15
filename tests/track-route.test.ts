import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { POST } from '@/app/api/track/route'
import { resolveIdentity } from '@/lib/identification'
import { trackPayloadSchema } from '@/lib/validation'

async function createUser(overrides: { plan?: string; identificationsUsed?: number } = {}) {
  return db.user.create({
    data: {
      email: `track-${crypto.randomUUID()}@test.example`,
      passwordHash: 'not-a-real-hash',
      plan: overrides.plan ?? 'free',
      identificationsUsed: overrides.identificationsUsed ?? 0,
    },
  })
}

async function createSite(userId: string, domain: string) {
  const siteKey = `px_${crypto.randomUUID().replace(/-/g, '').slice(0, 16)}`
  return db.site.create({ data: { userId, domain, siteKey } })
}

function beacon(siteKey: string, pageUrl: string, visitorId: string): NextRequest {
  return new Request('http://collector.test/api/track', {
    method: 'POST',
    headers: { 'content-type': 'text/plain;charset=UTF-8', 'user-agent': 'vitest-agent' },
    body: JSON.stringify({ k: siteKey, u: pageUrl, p: '/', r: '', v: visitorId }),
  }) as unknown as NextRequest
}

async function send(siteKey: string, pageUrl: string, visitorId: string): Promise<Response> {
  return POST(beacon(siteKey, pageUrl, visitorId))
}

/** Deterministic resolver: find a visitor id that resolves for this site key. */
function resolvingVisitorId(siteKey: string): string {
  for (let i = 0; i < 5_000; i++) {
    const candidate = `v_resolve_${i.toString().padStart(5, '0')}`
    if (resolveIdentity(candidate, siteKey)) return candidate
  }
  throw new Error('no resolving visitor id found')
}

/** Deterministic resolver: find a visitor id that does NOT resolve. */
function anonymousVisitorId(siteKey: string): string {
  for (let i = 0; i < 5_000; i++) {
    const candidate = `v_anon_${i.toString().padStart(5, '0')}`
    if (!resolveIdentity(candidate, siteKey)) return candidate
  }
  throw new Error('no anonymous visitor id found')
}

async function counts() {
  const [visitors, events] = await Promise.all([db.visitor.count(), db.event.count()])
  return { visitors, events }
}

describe('POST /api/track (F-13: ingestion gated on hostname)', () => {
  beforeEach(async () => {
    await db.user.deleteMany()
  })

  it('ingests a beacon whose hostname matches the registered domain', async () => {
    const user = await createUser()
    const site = await createSite(user.id, 'tracked.example')

    const response = await send(site.siteKey, 'https://tracked.example/pricing', 'v_abc_def_ghi')

    expect(response.status).toBe(204)
    const { visitors, events } = await counts()
    expect(visitors).toBe(1)
    expect(events).toBe(1)
  })

  it('accepts www and subdomain variants of the registered domain', async () => {
    const user = await createUser()
    const site = await createSite(user.id, 'tracked.example')

    await send(site.siteKey, 'https://www.tracked.example/', 'v_www_visitor')
    await send(site.siteKey, 'https://blog.tracked.example/post', 'v_sub_visitor')

    const { visitors } = await counts()
    expect(visitors).toBe(2)
  })

  it('rejects beacons from a foreign hostname — no rows, no verification', async () => {
    const user = await createUser()
    const site = await createSite(user.id, 'tracked.example')

    const response = await send(site.siteKey, 'https://evil.example/', 'v_attacker_1')

    expect(response.status).toBe(204)
    expect(await counts()).toEqual({ visitors: 0, events: 0 })
    const unchanged = await db.site.findUniqueOrThrow({ where: { id: site.id } })
    expect(unchanged.status).toBe('pending')
    expect(unchanged.lastEventAt).toBeNull()
  })

  it('rejects beacons with no page URL at all', async () => {
    const user = await createUser()
    const site = await createSite(user.id, 'tracked.example')

    const request = new Request('http://collector.test/api/track', {
      method: 'POST',
      headers: { 'content-type': 'text/plain;charset=UTF-8' },
      body: JSON.stringify({ k: site.siteKey, p: '/', r: '', v: 'v_no_url_visitor' }),
    }) as unknown as NextRequest
    const response = await POST(request)

    expect(response.status).toBe(204)
    expect(await counts()).toEqual({ visitors: 0, events: 0 })
  })

  it('returns 204 without rows for an unknown site key (anti-enumeration)', async () => {
    await createUser()
    const response = await send('px_doesnotexist00', 'https://tracked.example/', 'v_probe_1234')
    expect(response.status).toBe(204)
    expect(await counts()).toEqual({ visitors: 0, events: 0 })
  })

  it('auto-verifies a pending site on the first matching beacon', async () => {
    const user = await createUser()
    const site = await createSite(user.id, 'tracked.example')

    await send(site.siteKey, 'https://tracked.example/', 'v_verify_me_1')

    const updated = await db.site.findUniqueOrThrow({ where: { id: site.id } })
    expect(updated.status).toBe('verified')
    expect(updated.lastEventAt).not.toBeNull()
  })

  it('a foreign hostname can NEVER flip verification, even for a verified site', async () => {
    const user = await createUser()
    const site = await createSite(user.id, 'tracked.example')
    await db.site.update({ where: { id: site.id }, data: { status: 'pending' } })

    await send(site.siteKey, 'https://not-the-registered.example/', 'v_spoof_1234')

    const updated = await db.site.findUniqueOrThrow({ where: { id: site.id } })
    expect(updated.status).toBe('pending')
  })
})

describe('POST /api/track (quota + overage at the route level)', () => {
  beforeEach(async () => {
    await db.user.deleteMany()
  })

  it('identifies a resolving visitor on a paid plan already at its limit (overage)', async () => {
    const user = await createUser({ plan: 'growth', identificationsUsed: 1500 })
    const site = await createSite(user.id, 'paid.example')
    const vid = resolvingVisitorId(site.siteKey)

    await send(site.siteKey, 'https://paid.example/', vid)

    const visitor = await db.visitor.findFirstOrThrow({ where: { anonymousId: vid } })
    expect(visitor.email).not.toBeNull()
    const fresh = await db.user.findUniqueOrThrow({ where: { id: user.id } })
    expect(fresh.identificationsUsed).toBe(1501)
    const identEvents = await db.event.count({ where: { name: 'identification' } })
    expect(identEvents).toBe(1)
  })

  it('does NOT identify on the free plan at its lifetime limit', async () => {
    const user = await createUser({ plan: 'free', identificationsUsed: 100 })
    const site = await createSite(user.id, 'free.example')
    const vid = resolvingVisitorId(site.siteKey)

    await send(site.siteKey, 'https://free.example/', vid)

    const visitor = await db.visitor.findFirstOrThrow({ where: { anonymousId: vid } })
    expect(visitor.email).toBeNull()
    const fresh = await db.user.findUniqueOrThrow({ where: { id: user.id } })
    expect(fresh.identificationsUsed).toBe(100)
    const identEvents = await db.event.count({ where: { name: 'identification' } })
    expect(identEvents).toBe(0)
  })

  it('counts pageviews for anonymous visitors without consuming quota', async () => {
    const user = await createUser({ plan: 'free', identificationsUsed: 0 })
    const site = await createSite(user.id, 'anon.example')
    const vid = anonymousVisitorId(site.siteKey)

    await send(site.siteKey, 'https://anon.example/', vid)

    const visitor = await db.visitor.findFirstOrThrow({ where: { anonymousId: vid } })
    expect(visitor.pageviews).toBe(1)
    expect(visitor.email).toBeNull()
    const fresh = await db.user.findUniqueOrThrow({ where: { id: user.id } })
    expect(fresh.identificationsUsed).toBe(0)
  })

  it('upserts: repeat beacons from the same visitor increment pageviews only', async () => {
    const user = await createUser()
    const site = await createSite(user.id, 'repeat.example')
    const vid = anonymousVisitorId(site.siteKey)

    await send(site.siteKey, 'https://repeat.example/a', vid)
    await send(site.siteKey, 'https://repeat.example/b', vid)

    const visitor = await db.visitor.findFirstOrThrow({ where: { anonymousId: vid } })
    expect(visitor.pageviews).toBe(2)
    expect(await db.visitor.count()).toBe(1)
    expect(await db.event.count({ where: { name: 'pageview' } })).toBe(2)
  })
})

describe('POST /api/track (beacon contract)', () => {
  beforeEach(async () => {
    await db.user.deleteMany()
  })

  it('answers 429 with Retry-After matching the 60s window (F-10)', async () => {
    // Freeze Date so every beacon lands in the SAME rate-limit window even
    // if the DB work slows under CPU contention — the window must never
    // expire mid-test.
    vi.useFakeTimers({ toFake: ['Date'] })
    try {
      const user = await createUser()
      const site = await createSite(user.id, 'flood.example')
      const vid = anonymousVisitorId(site.siteKey)

      let rateLimited: Response | null = null
      for (let i = 0; i <= 120; i++) {
        const response = await send(site.siteKey, 'https://flood.example/', vid)
        if (response.status === 429) {
          rateLimited = response
          break
        }
      }
      expect(rateLimited).not.toBeNull()
      expect(rateLimited?.headers.get('retry-after')).toBe('60')
    } finally {
      vi.useRealTimers()
    }
  })

  it('never answers 500 when a write fails mid-ingest (F-08)', async () => {
    const user = await createUser()
    const site = await createSite(user.id, 'broken.example')

    const upsert = vi.spyOn(db.visitor, 'upsert').mockRejectedValue(new Error('SQLITE_BUSY'))
    const response = await send(site.siteKey, 'https://broken.example/', 'v_broken_1234')
    upsert.mockRestore()

    expect(response.status).toBe(204)
  })

  it('tolerates garbage bodies with a silent 204', async () => {
    const request = new Request('http://collector.test/api/track', {
      method: 'POST',
      headers: { 'content-type': 'text/plain;charset=UTF-8' },
      body: 'this is not json',
    }) as unknown as NextRequest
    const response = await POST(request)
    expect(response.status).toBe(204)
  })
})

describe('trackPayloadSchema (F-11/F-21: data minimization)', () => {
  it('strips legacy title/screen fields instead of rejecting them', () => {
    const parsed = trackPayloadSchema.safeParse({
      k: 'px_legacy1234',
      u: 'https://tracked.example/',
      p: '/',
      r: '',
      t: 'Legacy page title',
      v: 'v_legacy_1234',
      w: 1920,
      h: 1080,
    })
    expect(parsed.success).toBe(true)
    if (parsed.success) {
      expect(parsed.data).not.toHaveProperty('t')
      expect(parsed.data).not.toHaveProperty('w')
      expect(parsed.data).not.toHaveProperty('h')
    }
  })

  it('applies the documented defaults', () => {
    const parsed = trackPayloadSchema.safeParse({ k: 'px_defaults123' })
    expect(parsed.success).toBe(true)
    if (parsed.success) {
      expect(parsed.data.p).toBe('/')
      expect(parsed.data.r).toBe('')
    }
  })
})
