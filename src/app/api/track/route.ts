import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { trackPayloadSchema } from '@/lib/validation'
import { resolveIdentity, sourceFromReferrer } from '@/lib/identification'
import { getPlan } from '@/lib/plans'
import { randomBytes } from 'crypto'

/**
 * Pixel ingestion endpoint.
 *
 * Accepts beacons from the collector script installed on customer sites:
 * POST /api/track with a text/plain JSON body (sendBeacon-compatible, so no
 * CORS preflight is required). Responds 204 with permissive CORS since the
 * visitor id travels in the payload, not in credentials.
 */

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
} as const

/** In-memory fixed-window limiter (scandihaven ADR-005 pattern). */
const RATE_LIMIT = 120 // events per window per site key
const WINDOW_MS = 60_000
const rateBuckets = new Map<string, { count: number; windowStart: number }>()

function rateLimited(key: string): boolean {
  const now = Date.now()
  const bucket = rateBuckets.get(key)
  if (!bucket || now - bucket.windowStart >= WINDOW_MS) {
    rateBuckets.set(key, { count: 1, windowStart: now })
    return false
  }
  bucket.count += 1
  return bucket.count > RATE_LIMIT
}

/** Periodically drop stale buckets so the map cannot grow unbounded. */
function sweepRateBuckets(): void {
  if (rateBuckets.size < 10_000) return
  const now = Date.now()
  for (const [key, bucket] of rateBuckets) {
    if (now - bucket.windowStart >= WINDOW_MS * 2) rateBuckets.delete(key)
  }
}

function hostnameOf(url: string | undefined): string | null {
  if (!url) return null
  try {
    return new URL(url).hostname.replace(/^www\./i, '').toLowerCase()
  } catch {
    return null
  }
}

function matchesDomain(hostname: string, domain: string): boolean {
  return hostname === domain || hostname.endsWith(`.${domain}`)
}

export async function OPTIONS(): Promise<NextResponse> {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS })
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  sweepRateBuckets()

  let raw: string
  try {
    raw = await request.text()
  } catch {
    return new NextResponse(null, { status: 204, headers: CORS_HEADERS })
  }

  let json: unknown
  try {
    json = JSON.parse(raw)
  } catch {
    return new NextResponse(null, { status: 204, headers: CORS_HEADERS })
  }

  const parsed = trackPayloadSchema.safeParse(json)
  if (!parsed.success) {
    return new NextResponse(null, { status: 204, headers: CORS_HEADERS })
  }
  const payload = parsed.data

  if (rateLimited(payload.k)) {
    return new NextResponse(null, {
      status: 429,
      headers: { ...CORS_HEADERS, 'Retry-After': '10' },
    })
  }

  const site = await db.site.findUnique({
    where: { siteKey: payload.k },
    include: { user: { select: { id: true, plan: true, identificationsUsed: true, usagePeriodStart: true } } },
  })
  if (!site) {
    // Unknown key: 204 rather than 404 so probes cannot enumerate site keys.
    return new NextResponse(null, { status: 204, headers: CORS_HEADERS })
  }

  const now = new Date()
  const pageHostname = hostnameOf(payload.u)

  // Verify the registered domain the first time we see traffic from it.
  const shouldVerify =
    site.status !== 'verified' &&
    pageHostname !== null &&
    matchesDomain(pageHostname, site.domain)
  if (shouldVerify || site.lastEventAt === null) {
    await db.site.update({
      where: { id: site.id },
      data: {
        status: shouldVerify ? 'verified' : site.status,
        lastEventAt: now,
      },
    })
  } else {
    await db.site.update({ where: { id: site.id }, data: { lastEventAt: now } })
  }

  const anonymousId = payload.v && payload.v.length >= 8 ? payload.v : randomBytes(12).toString('hex')

  const visitor = await db.visitor.upsert({
    where: { siteId_anonymousId: { siteId: site.id, anonymousId } },
    create: {
      siteId: site.id,
      anonymousId,
      source: sourceFromReferrer(payload.r ?? ''),
      firstSeen: now,
      lastSeen: now,
      pageviews: 1,
    },
    update: {
      lastSeen: now,
      pageviews: { increment: 1 },
    },
  })

  await db.event.create({
    data: {
      siteId: site.id,
      visitorId: visitor.id,
      name: 'pageview',
      path: payload.p || '/',
      pageUrl: payload.u ?? null,
      referrer: payload.r || null,
      userAgent: request.headers.get('user-agent')?.slice(0, 500) ?? null,
    },
  })

  // Identity resolution for not-yet-identified visitors, gated by plan quota.
  if (visitor.email === null) {
    const plan = getPlan(site.user.plan)
    let used = site.user.identificationsUsed
    let periodStart = site.user.usagePeriodStart

    if (plan.limitPeriod === 'monthly') {
      const elapsedDays = (now.getTime() - periodStart.getTime()) / 86_400_000
      if (elapsedDays >= 30) {
        used = 0
        periodStart = now
        await db.user.update({
          where: { id: site.user.id },
          data: { identificationsUsed: 0, usagePeriodStart: now },
        })
      }
    }

    if (used < plan.identificationLimit) {
      const identity = resolveIdentity(anonymousId, site.siteKey)
      if (identity) {
        await db.visitor.update({
          where: { id: visitor.id },
          data: {
            email: identity.email,
            type: identity.type,
            companyName: identity.companyName,
            confidence: identity.confidence,
          },
        })
        await db.event.create({
          data: {
            siteId: site.id,
            visitorId: visitor.id,
            name: 'identification',
            path: payload.p || '/',
            pageUrl: payload.u ?? null,
            referrer: payload.r || null,
            userAgent: request.headers.get('user-agent')?.slice(0, 500) ?? null,
          },
        })
        await db.user.update({
          where: { id: site.user.id },
          data: { identificationsUsed: { increment: 1 }, usagePeriodStart: periodStart },
        })
      }
    }
  }

  return new NextResponse(null, { status: 204, headers: CORS_HEADERS })
}
