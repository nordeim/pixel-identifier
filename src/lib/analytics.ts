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
    where: { site: { userId }, name: 'identification' },
    select: {
      id: true,
      path: true,
      createdAt: true,
      visitor: { select: { email: true, confidence: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  })
  return events
    .filter((e) => e.visitor.email !== null)
    .map((e) => ({
      id: e.id,
      email: e.visitor.email as string,
      path: e.path,
      confidence: e.visitor.confidence,
      createdAt: e.createdAt,
    }))
}
