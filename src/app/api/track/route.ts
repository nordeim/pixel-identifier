import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { trackPayloadSchema } from '@/lib/validation'
import { resolveIdentity, sourceFromReferrer } from '@/lib/identification'
import { getPlan } from '@/lib/plans'
import { consumeIdentification, resetMonthlyWindowIfNeeded } from '@/lib/quota'
import { randomBytes } from 'crypto'

/**
 * Pixel ingestion endpoint.
 *
 * Accepts beacons from the collector script installed on customer sites:
 * POST /api/track with a text/plain JSON body (sendBeacon-compatible, so no
 * CORS preflight is required). Responds 204 with permissive CORS since the
 * visitor id travels in the payload, not in credentials.
 *
 * Ingestion contract:
 *  - beacons are only ingested from the registered domain (hostname gate);
 *  - errors are contained to a silent 204 — a beacon must never disturb the
 *    customer's page or their ad blockers' consoles;
 *  - every failure mode (bad JSON, unknown key, foreign host, DB error) is
 *    indistinguishable from success to the caller.
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

function silentOk(): NextResponse {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS })
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
    return silentOk()
  }

  let json: unknown
  try {
    json = JSON.parse(raw)
  } catch {
    return silentOk()
  }

  const parsed = trackPayloadSchema.safeParse(json)
  if (!parsed.success) {
    return silentOk()
  }
  const payload = parsed.data

  if (rateLimited(payload.k)) {
    return new NextResponse(null, {
      status: 429,
      // The window is 60s — a client honouring this header retries into a
      // fresh window instead of hammering the current one.
      headers: { ...CORS_HEADERS, 'Retry-After': String(WINDOW_MS / 1000) },
    })
  }

  try {
    const site = await db.site.findUnique({
      where: { siteKey: payload.k },
      include: { user: { select: { id: true, plan: true, identificationsUsed: true, usagePeriodStart: true } } },
    })
    if (!site) {
      // Unknown key: 204 rather than 404 so probes cannot enumerate site keys.
      return silentOk()
    }

    const pageHostname = hostnameOf(payload.u)
    // Hostname gate: only beacons from the registered domain (or a
    // subdomain of it) are ingested. Anything else — a spoofed key on a
    // foreign site, a payload without a URL — is dropped before any write,
    // so forged beacons can neither burn the owner's quota nor flip
    // verification.
    if (!pageHostname || !matchesDomain(pageHostname, site.domain)) {
      return silentOk()
    }

    const now = new Date()

    // Verify the registered domain the first time we see traffic from it.
    const shouldVerify = site.status !== 'verified' && matchesDomain(pageHostname, site.domain)
    await db.site.update({
      where: { id: site.id },
      data: {
        status: shouldVerify ? 'verified' : site.status,
        lastEventAt: now,
      },
    })

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
      // Lazily persist the rolling monthly reset before quota reasoning.
      await resetMonthlyWindowIfNeeded(site.user.id, plan, {
        used: site.user.identificationsUsed,
        periodStart: site.user.usagePeriodStart,
      })

      const identity = resolveIdentity(anonymousId, site.siteKey)
      if (identity) {
        // Claim the visitor first: exactly one concurrent beacon may turn an
        // anonymous visitor into an identified one.
        const claimed = await db.visitor.updateMany({
          where: { id: visitor.id, email: null },
          data: {
            email: identity.email,
            type: identity.type,
            companyName: identity.companyName,
            confidence: identity.confidence,
          },
        })
        if (claimed.count === 1) {
          const consumed = await consumeIdentification(site.user.id, plan)
          if (consumed) {
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
          } else {
            // Quota exhausted between claim and consume: undo the claim (the
            // where-clause targets the exact email we wrote, so a concurrent
            // winner can never be wiped) so an identification is never shown
            // without being counted.
            await db.visitor.updateMany({
              where: { id: visitor.id, email: identity.email },
              data: { email: null, type: null, companyName: null, confidence: null },
            })
          }
        }
      }
    }
  } catch (error) {
    // Beacon contract: ingest failures are logged and swallowed. sendBeacon
    // callers cannot see response bodies anyway, and a 500 would only pollute
    // logs and lose the pageview silently either way.
    console.error('[track] ingest failed', error)
  }

  return silentOk()
}
