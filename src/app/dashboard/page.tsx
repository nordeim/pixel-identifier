import type { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { ArrowRight, Eye, Globe, Mail, UserPlus } from 'lucide-react'
import { authOptions } from '@/lib/auth'
import {
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
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/login')

  const userId = session.user.id
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
            <p className="text-xs text-muted-foreground">Last 14 days</p>
          </CardHeader>
          <CardContent>
            <TrendChart data={trend} />
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold text-foreground">Top Pages</CardTitle>
            <p className="text-xs text-muted-foreground">By pageviews</p>
          </CardHeader>
          <CardContent>
            {topPages.length === 0 ? (
              <p className="py-12 text-center text-sm text-muted-foreground">
                No page data yet
              </p>
            ) : (
              <ol className="space-y-3">
                {topPages.map((page, index) => (
                  <li key={page.path} className="flex items-center gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground">
                      {index + 1}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-mono text-sm text-foreground">
                        {page.path}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {page.views} {page.views === 1 ? 'view' : 'views'}
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
          <div>
            <CardTitle className="text-base font-bold text-foreground">
              Recent Identifications
            </CardTitle>
            <p className="text-xs text-muted-foreground">Latest emails resolved</p>
          </div>
          <a
            href="/dashboard/visitors"
            className="flex items-center gap-1 text-sm font-semibold text-amber-600 hover:text-amber-700 focus-brand"
          >
            View all
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </a>
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
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-extrabold text-primary-foreground"
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
                          <Progress value={item.confidence ?? 0} className="h-1.5 w-16" aria-hidden="true" />
                          <span className="text-xs font-semibold tabular-nums text-teal-600">
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
