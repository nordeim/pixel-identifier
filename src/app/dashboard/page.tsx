import type { Metadata } from 'next'
import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { ArrowUpRight, Eye, Globe, Mail, UserPlus } from 'lucide-react'
import { authOptions } from '@/lib/auth'
import {
  requireUser,
  getOverviewStats,
  getTrend,
  getTopPages,
  getRecentIdentifications,
} from '@/lib/analytics'
import { TrendChart } from '@/components/dashboard/trend-chart'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { initialsForEmail, relativeTime } from '@/lib/format'

export const metadata: Metadata = {
  title: 'Overview',
}

export const dynamic = 'force-dynamic'

export default async function OverviewPage() {
  const user = await requireUser(await getServerSession(authOptions))

  const userId = user.id
  const [stats, trend, topPages, recent] = await Promise.all([
    getOverviewStats(userId),
    getTrend(userId),
    getTopPages(userId),
    getRecentIdentifications(userId),
  ])

  const kpis = [
    {
      label: 'Total Visitors',
      value: stats.totalVisitors.toLocaleString(),
      sub: 'All time',
      icon: Eye,
    },
    {
      label: 'Emails Identified',
      value: stats.emailsIdentified.toLocaleString(),
      sub: `${stats.matchRate.toFixed(1)}% match rate`,
      icon: Mail,
    },
    {
      label: 'New This Week',
      value: stats.newThisWeek.toLocaleString(),
      sub: `vs. ${stats.lastWeek} last week`,
      icon: UserPlus,
    },
    {
      label: 'Active Domains',
      value: stats.activeDomains.toString(),
      sub:
        stats.pendingDomains > 0
          ? `${stats.pendingDomains} pending review`
          : `${stats.verifiedDomains} verified`,
      icon: Globe,
    },
  ]

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label} className="shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {kpi.label}
                </p>
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15" aria-hidden="true">
                  <kpi.icon className="h-4 w-4 text-amber-600" />
                </span>
              </div>
              <p className="mt-3 text-3xl font-extrabold tabular-nums tracking-tight text-foreground">
                {kpi.value}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">{kpi.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="shadow-sm lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold text-foreground">
              Visitor Identification Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TrendChart data={trend} />
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold text-foreground">Top Pages</CardTitle>
          </CardHeader>
          <CardContent>
            {topPages.length === 0 ? (
              <p className="py-12 text-center text-sm text-muted-foreground">
                No page data yet
              </p>
            ) : (
              <ol className="space-y-3">
                {topPages.map((page, index) => (
                  <li key={page.path} className="flex items-baseline gap-3">
                    <span className="text-xs font-semibold tabular-nums text-muted-foreground">
                      {index + 1}
                    </span>
                    <span className="min-w-0 flex-1 truncate font-mono text-sm text-foreground">
                      {page.path}
                    </span>
                    <span className="ml-auto shrink-0 text-right">
                      <span className="block text-sm font-bold tabular-nums text-foreground">
                        {page.views}
                      </span>
                      <span className="block text-[11px] text-muted-foreground">
                        {page.views === 1 ? 'view' : 'views'}
                      </span>
                    </span>
                  </li>
                ))}
              </ol>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="flex-row items-center justify-between pb-2">
          <CardTitle className="text-base font-bold text-foreground">
            Recent Identifications
          </CardTitle>
          <Link
            href="/dashboard/visitors"
            className="flex items-center gap-0.5 text-xs font-semibold text-amber-600 hover:text-amber-700 focus-brand"
          >
            View all
            <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
          </Link>
        </CardHeader>
        <CardContent>
          {recent.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">
              No identifications yet. Install your pixel to get started.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <th scope="col" className="pb-3 pr-4 font-semibold">Email</th>
                    <th scope="col" className="pb-3 pr-4 font-semibold">Page</th>
                    <th scope="col" className="pb-3 pr-4 font-semibold">Confidence</th>
                    <th scope="col" className="pb-3 font-semibold">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((item) => (
                    <tr key={item.id} className="border-b border-border/60 last:border-0">
                      <td className="py-3 pr-4">
                        <span className="flex items-center gap-2.5">
                          <span
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-extrabold text-white"
                            aria-hidden="true"
                          >
                            {initialsForEmail(item.email)}
                          </span>
                          <span className="truncate font-medium text-foreground">{item.email}</span>
                        </span>
                      </td>
                      <td className="py-3 pr-4 font-mono text-xs text-muted-foreground">
                        {item.path}
                      </td>
                      <td className="py-3 pr-4">
                        <span className="flex items-center gap-2">
                          <Progress
                            value={item.confidence ?? 0}
                            className="h-1.5 w-16 [&>div]:bg-teal-500"
                            aria-hidden="true"
                          />
                          <span className="text-xs font-semibold tabular-nums text-foreground">
                            {item.confidence}%
                          </span>
                        </span>
                      </td>
                      <td className="py-3 text-xs text-muted-foreground">
                        {relativeTime(item.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
