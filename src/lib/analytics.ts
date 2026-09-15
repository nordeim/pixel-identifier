import 'server-only'
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

export async function requireUser(session: Session | null): Promise<DashUser> {
  if (!session?.user?.id || !session.user.email) {
    throw new Error('UNAUTHENTICATED')
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
  activeDomains: number
  verifiedDomains: number
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

  return {
    totalVisitors,
    emailsIdentified,
    newThisWeek,
    lastWeek,
    matchRate: totalVisitors > 0 ? Math.round((emailsIdentified / totalVisitors) * 1000) / 10 : 0,
    activeDomains: sites.length,
    verifiedDomains: sites.filter((s) => s.status === 'verified').length,
  }
}

export interface TrendPoint {
  date: string // YYYY-MM-DD
  label: string // Sep 2
  pageviews: number
  identified: number
}

export async function getTrend(userId: string, days = 14): Promise<TrendPoint[]> {
  const since = new Date(Date.now() - (days - 1) * 86_400_000)
  since.setHours(0, 0, 0, 0)

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
      label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
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
}

export async function getTopPages(userId: string, limit = 5): Promise<TopPage[]> {
  const events = await db.event.findMany({
    where: { site: { userId }, name: 'pageview' },
    select: { path: true },
  })
  const counts = new Map<string, number>()
  for (const event of events) {
    counts.set(event.path, (counts.get(event.path) ?? 0) + 1)
  }
  return [...counts.entries()]
    .map(([path, views]) => ({ path, views }))
    .sort((a, b) => b.views - a.views)
    .slice(0, limit)
}

export interface VisitorListItem {
  id: string
  email: string | null
  anonymousId: string
  type: string | null
  companyName: string | null
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
  minConfidence?: number
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
 */
export async function listVisitors(
  userId: string,
  query: VisitorListQuery = {},
): Promise<VisitorListResult> {
  const page = Math.max(1, query.page ?? 1)
  const pageSize = Math.min(100, Math.max(1, query.pageSize ?? 25))

  const base = { site: { userId } }
  const filters: Record<string, unknown>[] = [base]

  if (query.q) {
    const q = query.q.trim()
    if (q) {
      filters.push({
        OR: [
          { email: { contains: q } },
          { companyName: { contains: q } },
          { anonymousId: { contains: q } },
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
  if (typeof query.minConfidence === 'number') {
    filters.push({ confidence: { gte: query.minConfidence } })
  }
  if (query.source) {
    filters.push({ source: query.source })
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
  /** Cursor for the next older page; null when the log is exhausted. */
  nextCursor: string | null
}

/**
 * Activity-log query (F-25): the API route and the page share this single
 * seam. Cursor pagination keeps older history reachable — the fixed
 * 60-event window used to make anything older permanently invisible.
 */
export async function listActivity(
  userId: string,
  opts: { take?: number; cursor?: string } = {},
): Promise<ActivityPage> {
  const take = Math.min(100, Math.max(1, opts.take ?? 60))
  const events = await db.event.findMany({
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
    take: take + 1,
    ...(opts.cursor ? { cursor: { id: opts.cursor }, skip: 1 } : {}),
  })

  const hasMore = events.length > take
  const page = hasMore ? events.slice(0, take) : events

  return {
    events: page.map((event) => ({
      id: event.id,
      name: event.name,
      domain: event.site.domain,
      path: event.path,
      email: event.visitor.email,
      anonymousId: event.visitor.email ? null : event.visitor.anonymousId.slice(0, 12),
      createdAt: event.createdAt.toISOString(),
    })),
    nextCursor: hasMore ? page[page.length - 1].id : null,
  }
}
