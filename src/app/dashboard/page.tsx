import type { Metadata } from 'next'
import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { ArrowUpRight, Eye, Globe, Mail, Users } from 'lucide-react'
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
      icon: Users,
    },
    {
      label: 'Active Domains',
      value: stats.activeDomains.toString(),
      // Live semantics: the value is the total domain count; the sub-line
      // reports verified domains ("1 verified" with a pending domain present).
      sub: `${stats.verifiedDomains} verified`,
      icon: Globe,
    },
  ]

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label} className="shadow-sm">
            <CardContent className="p-6 pt-5 pb-4 px-5">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium tracking-wider text-muted-foreground">
                  {kpi.label}
                </p>
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10" aria-hidden="true">
                  <kpi.icon className="h-4 w-4 text-primary" />
                </span>
              </div>
              <p className="mt-3 text-3xl font-display font-bold tabular-nums tracking-tight text-foreground">
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
            <CardTitle className="font-display text-base font-semibold tracking-tight text-foreground">
              Visitor Identification Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TrendChart data={trend} />
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="font-display text-base font-semibold tracking-tight text-foreground">Top Pages</CardTitle>
          </CardHeader>
          <CardContent>
            {topPages.length === 0 ? (
              <p className="py-12 text-center text-sm text-muted-foreground">
                No page data yet
              </p>
            ) : (
              <div className="space-y-3">
                {topPages.map((page, index) => (
                  <div
                    key={page.path}
                    className="flex items-center justify-between border-b border-border py-2 last:border-0"
                  >
                    <div className="flex min-w-0 items-center gap-2.5">
                      <span className="w-4 font-mono text-xs text-muted-foreground">
                        {index + 1}
                      </span>
                      <span className="truncate text-sm font-medium text-foreground">
                        {page.path}
                      </span>
                    </div>
                    {/* R6-H1: the live's big number is the identified count;
                        total views rides along as the small label. */}
                    <div className="ml-3 shrink-0 text-right">
                      <div className="text-sm font-semibold text-foreground">
                        {page.identified}
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        {page.views === 1 ? '1 view' : `${page.views} views`}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="font-display text-base font-semibold tracking-tight text-foreground">
            Recent Identifications
          </CardTitle>
          <div data-slot="card-action" className="self-center">
            <Link
              href="/dashboard/visitors"
              className="flex items-center gap-0.5 text-xs font-semibold text-amber-600 hover:text-amber-700 focus-brand"
            >
              View all
              <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
            </Link>
          </div>
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
                            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full gradient-primary text-[10px] font-bold text-white"
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
                            className="h-1.5 w-16 [&>div]:bg-neon-green"
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
