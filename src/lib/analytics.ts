import 'server-only'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { getPlan, type Plan } from '@/lib/plans'
import { resetMonthlyWindowIfNeeded } from '@/lib/quota'
import type { Session } from 'next-auth'

/** Narrow session shape used across the dashboard. */
export interface DashUser {
  id: string
  email: string
  name: string | null
}

/**
 * Single session guard for dashboard pages (F-36): resolves the session into
 * a DashUser or redirects to /login. Pages must still treat this as a UX
 * redirect — every server action and API route re-validates independently.
 */
export async function requireUser(session: Session | null): Promise<DashUser> {
  if (!session?.user?.id || !session.user.email) {
    redirect('/login')
  }
  return { id: session.user.id, email: session.user.email, name: session.user.name ?? null }
}

export interface UsageInfo {
  plan: Plan
  used: number
  limit: number
  percent: number
  period: 'lifetime' | 'monthly'
  /** Identifications beyond the allowance on a paid plan this period. */
  overage: number
  /** Overage list price in cents (overage × plan.overagePrice). */
  overageCostCents: number
}

/**
 * Bell unread flag (round-4 plan S5): true iff an identification resolved
 * within the last 7 days on any of the user's sites. Backs the topbar's
 * hot-pink dot — a real signal, never decorative.
 */
export async function hasRecentIdentifications(userId: string): Promise<boolean> {
  const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  const count = await db.event.count({
    where: {
      name: 'identification',
      createdAt: { gte: cutoff },
      site: { userId },
    },
  })
  return count > 0
}

export async function getUsage(userId: string): Promise<UsageInfo> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { id: true, plan: true, identificationsUsed: true, usagePeriodStart: true },
  })
  const plan = getPlan(user?.plan ?? 'free')

  // The monthly reset is PERSISTED here (not display-only) so the sidebar,
  // pricing page and the ingest path always agree on the same window.
  const snapshot = user
    ? await resetMonthlyWindowIfNeeded(user.id, plan, {
        used: user.identificationsUsed,
        periodStart: user.usagePeriodStart,
      })
    : { used: 0, periodStart: new Date() }

  const limit = plan.identificationLimit
  const percent = limit > 0 ? Math.min(100, Math.round((snapshot.used / limit) * 100)) : 0
  const overage = plan.limitPeriod === 'monthly' ? Math.max(0, snapshot.used - limit) : 0
  return {
    plan,
    used: snapshot.used,
    limit,
    percent,
    period: plan.limitPeriod,
    overage,
    overageCostCents: overage * plan.overagePrice,
  }
}

export interface OverviewStats {
  totalVisitors: number
  emailsIdentified: number
  newThisWeek: number
  lastWeek: number
  matchRate: number
  /** All registered domains — the live KPI value; the sub-line shows verified. */
  activeDomains: number
  verifiedDomains: number
  pendingDomains: number
}

export async function getOverviewStats(userId: string): Promise<OverviewStats> {
  const weekAgo = new Date(Date.now() - 7 * 86_400_000)
  const twoWeeksAgo = new Date(Date.now() - 14 * 86_400_000)

  const [totalVisitors, emailsIdentified, newThisWeek, lastWeek, sites] = await Promise.all([
    db.visitor.count({ where: { site: { userId } } }),
    db.visitor.count({ where: { site: { userId }, email: { not: null } } }),
    db.visitor.count({ where: { site: { userId }, firstSeen: { gte: weekAgo } } }),
    db.visitor.count({
      where: { site: { userId }, firstSeen: { gte: twoWeeksAgo, lt: weekAgo } },
    }),
    db.site.findMany({ where: { userId }, select: { status: true } }),
  ])

  const verifiedDomains = sites.filter((s) => s.status === 'verified').length

  return {
    totalVisitors,
    emailsIdentified,
    newThisWeek,
    lastWeek,
    matchRate: totalVisitors > 0 ? Math.round((emailsIdentified / totalVisitors) * 1000) / 10 : 0,
    // Live semantics (R5-M2): the KPI value is the total domain count; the
    // card sub-line renders "N verified". Pending domains stay reportable.
    activeDomains: sites.length,
    verifiedDomains,
    pendingDomains: sites.length - verifiedDomains,
  }
}

export interface TrendPoint {
  date: string // YYYY-MM-DD
  label: string // Sep 2
  pageviews: number
  identified: number
}

export async function getTrend(userId: string, days = 14): Promise<TrendPoint[]> {
  // Anchor the window to UTC midnight and bucket by UTC date keys, so the
  // chart is identical on every server regardless of its local timezone
  // (F-04: local-midnight anchoring shifted buckets by one day on servers
  // running ahead of UTC).
  const now = new Date()
  const todayUtcMidnight = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  const since = new Date(todayUtcMidnight - (days - 1) * 86_400_000)

  const events = await db.event.findMany({
    where: { site: { userId }, createdAt: { gte: since } },
    select: { name: true, createdAt: true },
  })

  const buckets = new Map<string, TrendPoint>()
  for (let i = 0; i < days; i++) {
    const d = new Date(since.getTime() + i * 86_400_000)
    const key = d.toISOString().slice(0, 10)
    buckets.set(key, {
      date: key,
      label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' }),
      pageviews: 0,
      identified: 0,
    })
  }

  for (const event of events) {
    const key = event.createdAt.toISOString().slice(0, 10)
    const bucket = buckets.get(key)
    if (!bucket) continue
    if (event.name === 'identification') bucket.identified += 1
    else bucket.pageviews += 1
  }

  return [...buckets.values()]
}

export interface TopPage {
  path: string
  views: number
  /** Identification events resolved on this page (live: the big row number). */
  identified: number
}

export async function getTopPages(userId: string, limit = 5): Promise<TopPage[]> {
  // Aggregated in SQL (round-4 plan R4): no more loading every pageview
  // row into JS. Ties break deterministically by path ascending.
  const [pageviews, identifications] = await Promise.all([
    db.event.groupBy({
      by: ['path'],
      where: { site: { userId }, name: 'pageview' },
      _count: { _all: true },
      orderBy: [{ _count: { path: 'desc' } }, { path: 'asc' }],
      take: limit,
    }),
    // R6-H1: the live's Top Pages shows the identified count per page as the
    // big number — a second groupBy over identification events enriches the
    // ranked rows without loading any event rows into JS.
    db.event.groupBy({
      by: ['path'],
      where: { site: { userId }, name: 'identification' },
      _count: { _all: true },
    }),
  ])

  const identifiedByPath = new Map(
    identifications.map((row) => [row.path, row._count._all]),
  )
  return pageviews.map((row) => ({
    path: row.path,
    views: row._count._all,
    identified: identifiedByPath.get(row.path) ?? 0,
  }))
}

export interface VisitorSegmentCounts {
  individual: number
  company: number
}

/**
 * Global identified-visitor segment counts for the Visitors topbar subtitle
 * (R6-C1): fetched server-side in the dashboard layout so the subtitle is
 * real HTML on first paint — the client store only refreshes it after
 * filter changes. Mirrors the `counts` tail of `listVisitors` (identified
 * visitors only, ownership-scoped) without loading any rows.
 */
export async function getVisitorSegmentCounts(
  userId: string,
): Promise<VisitorSegmentCounts> {
  const [individual, company] = await Promise.all([
    db.visitor.count({
      where: { site: { userId }, email: { not: null }, type: 'individual' },
    }),
    db.visitor.count({
      where: { site: { userId }, email: { not: null }, type: 'company' },
    }),
  ])
  return { individual, company }
}

export interface VisitorListItem {
  id: string
  email: string | null
  anonymousId: string
  type: string | null
  companyName: string | null
  city: string | null
  state: string | null
  country: string | null
  source: string
  confidence: number | null
  status: string
  pageviews: number
  firstSeen: string
  lastSeen: string
  domain: string
}

export interface VisitorListQuery {
  /** Substring search over email, company, domain and anonymous id. */
  q?: string
  type?: 'individual' | 'company'
  /** R21-F3: the live's confidence BANDS — high (>=85), medium (70-84), low (<70); null-confidence companies match no band. */
  confidenceBand?: 'high' | 'medium' | 'low'
  /** R21-F4: the identification source (direct|network). Companies are unaffected (the live's b2b query ignores the source filter). */
  source?: string
  page?: number
  pageSize?: number
}

export interface VisitorListResult {
  rows: VisitorListItem[]
  total: number
  page: number
  pageCount: number
  /** Global segment counts (independent of the active filters). */
  counts: { all: number; individual: number; company: number }
}

const VISITOR_SELECT = {
  id: true,
  email: true,
  anonymousId: true,
  type: true,
  companyName: true,
  city: true,
  state: true,
  country: true,
  source: true,
  confidence: true,
  status: true,
  pageviews: true,
  firstSeen: true,
  lastSeen: true,
  site: { select: { domain: true } },
} as const

/**
 * Server-side visitor list with search, filters, pagination and true counts
 * (F-24). SQLite's LIKE comparison is ASCII-case-insensitive, so `contains`
 * gives case-insensitive matching on the default collation.
 *
 * Scope (R5-H4): like the live product, the list shows IDENTIFIED visitors
 * only — anonymous traffic stays in the Overview totals and the activity
 * feed. Every count below therefore also excludes anonymous visitors.
 */
export async function listVisitors(
  userId: string,
  query: VisitorListQuery = {},
): Promise<VisitorListResult> {
  const page = Math.max(1, query.page ?? 1)
  const pageSize = Math.min(100, Math.max(1, query.pageSize ?? 25))

  const base = { site: { userId }, email: { not: null } }
  const filters: Record<string, unknown>[] = [base]

  if (query.q) {
    const q = query.q.trim()
    if (q) {
      filters.push({
        OR: [
          { email: { contains: q } },
          { companyName: { contains: q } },
          { site: { domain: { contains: q } } },
        ],
      })
    }
  }
  if (query.type === 'individual') {
    filters.push({ email: { not: null }, type: 'individual' })
  } else if (query.type === 'company') {
    filters.push({ type: 'company' })
  }
  // R21-F3: the live's band semantics (index-nhmKaUsm.js):
  // high -> gte 85; medium -> gte 70 AND lt 85; low -> lt 70.
  // Prisma comparisons exclude nulls, so null-confidence companies match
  // no band — mirroring the live's b2b rows (confidence null).
  if (query.confidenceBand === 'high') {
    filters.push({ confidence: { gte: 85 } })
  } else if (query.confidenceBand === 'medium') {
    filters.push({ confidence: { gte: 70, lt: 85 } })
  } else if (query.confidenceBand === 'low') {
    filters.push({ confidence: { lt: 70 } })
  }
  // R21-F4: the source filter describes INDIVIDUAL identification sources;
  // company rows stay visible (the live's b2b query ignores the filter).
  if (query.source) {
    filters.push({ OR: [{ type: 'company' }, { source: query.source }] })
  }
  const where = { AND: filters }

  const [visitors, total, all, individual, company] = await Promise.all([
    db.visitor.findMany({
      where,
      select: VISITOR_SELECT,
      orderBy: { lastSeen: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    db.visitor.count({ where }),
    db.visitor.count({ where: base }),
    db.visitor.count({ where: { ...base, email: { not: null }, type: 'individual' } }),
    db.visitor.count({ where: { ...base, type: 'company' } }),
  ])

  return {
    rows: visitors.map((visitor) => ({
      id: visitor.id,
      email: visitor.email,
      anonymousId: visitor.anonymousId,
      type: visitor.type,
      companyName: visitor.companyName,
      city: visitor.city,
      state: visitor.state,
      country: visitor.country,
      source: visitor.source,
      confidence: visitor.confidence,
      status: visitor.status,
      pageviews: visitor.pageviews,
      firstSeen: visitor.firstSeen.toISOString(),
      lastSeen: visitor.lastSeen.toISOString(),
      domain: visitor.site.domain,
    })),
    total,
    page,
    pageCount: Math.max(1, Math.ceil(total / pageSize)),
    counts: { all, individual, company },
  }
}

export interface RecentIdentification {
  id: string
  email: string
  path: string
  confidence: number | null
  createdAt: Date
}

export async function getRecentIdentifications(
  userId: string,
  limit = 5,
): Promise<RecentIdentification[]> {
  const events = await db.event.findMany({
    where: { site: { userId }, name: 'identification', visitor: { email: { not: null } } },
    select: {
      id: true,
      path: true,
      createdAt: true,
      visitor: { select: { email: true, confidence: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  })
  return events.map((e) => ({
    id: e.id,
    email: e.visitor.email as string,
    path: e.path,
    confidence: e.visitor.confidence,
    createdAt: e.createdAt,
  }))
}

export interface ActivityListItem {
  id: string
  name: string
  domain: string
  path: string
  email: string | null
  anonymousId: string | null
  createdAt: string
}

export interface ActivityPage {
  events: ActivityListItem[]
  /** Total event count across the user's sites (the footer's "N"). */
  count: number
  /** ceil(count / 50) — the live's page math (no max(1)). */
  pageCount: number
}

/**
 * Activity-log query (F-25/R22-F6): the API route and the page share this
 * single seam. The live's model is OFFSET pagination — 50 events per page
 * (its bundle's Jc=50), `count exact`, ordered created_at desc; the page
 * index never touches the URL.
 */
export async function listActivity(
  userId: string,
  opts: { page?: number } = {},
): Promise<ActivityPage> {
  // R22-F6: the live's page size (Jc = 50 in its app bundle).
  const pageSize = 50
  const page = Math.max(0, opts.page ?? 0)

  const [events, count] = await Promise.all([
    db.event.findMany({
      where: { site: { userId } },
      select: {
        id: true,
        name: true,
        path: true,
        createdAt: true,
        visitor: { select: { email: true, anonymousId: true } },
        site: { select: { domain: true } },
      },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      skip: page * pageSize,
      take: pageSize,
    }),
    db.event.count({ where: { site: { userId } } }),
  ])

  return {
    events: events.map((event) => {
      // R7-F1: the row identity depends on the EVENT type, not the visitor's
      // current state — pageview rows always show the (truncated) anonymous
      // id, identification rows show the email. Joining the visitor's email
      // onto pageviews rewrites history once a visitor is identified.
      const isIdentification = event.name === 'identification'
      return {
        id: event.id,
        name: event.name,
        domain: event.site.domain,
        path: event.path,
        email: isIdentification ? event.visitor.email : null,
        anonymousId: isIdentification ? null : event.visitor.anonymousId.slice(0, 12),
        createdAt: event.createdAt.toISOString(),
      }
    }),
    count,
    pageCount: Math.ceil(count / pageSize),
  }
}
