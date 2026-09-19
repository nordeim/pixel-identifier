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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label} className="shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6 pt-5 pb-4 px-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {kpi.label}
                </span>
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <kpi.icon className="h-4 w-4 text-primary" />
                </div>
              </div>
              <div className="text-3xl font-display font-bold tracking-tight">
                {kpi.value}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-muted-foreground">{kpi.sub}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="shadow-sm lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">
              Visitor Identification Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TrendChart data={trend} />
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Top Pages</CardTitle>
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
                    className="flex items-center justify-between py-2 border-b border-border last:border-0"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-xs font-mono text-muted-foreground w-4">
                        {index + 1}
                      </span>
                      <span className="text-sm font-medium truncate">
                        {page.path}
                      </span>
                    </div>
                    {/* R6-H1: the live's big number is the identified count;
                        total views rides along as the small label. */}
                    <div className="text-right shrink-0 ml-3">
                      <div className="text-sm font-semibold">
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
        {/* R11: the live's table-card header is a raw div (not CardHeader) —
            space-y-1.5 p-6 + flex-row justify-between, with the View-all
            link as a direct child (text-primary hover:underline gap-1).
            R16: the body is p-0 (the overflow-x-auto div is the direct
            child — the live's CardContent pattern). */}
        <div className="space-y-1.5 p-6 flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base">
            Recent Identifications
          </CardTitle>
          <Link
            href="/dashboard/visitors"
            className="text-xs text-primary hover:underline flex items-center gap-1"
          >
            View all
            <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
          </Link>
        </div>
        <CardContent className="p-0">
          {recent.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">
              No identifications yet. Install your pixel to get started.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left p-3 px-5 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Email</th>
                    <th className="text-left p-3 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Page</th>
                    <th className="text-left p-3 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Confidence</th>
                    <th className="text-right p-3 px-5 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((item) => (
                    <tr key={item.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                      <td className="p-3 px-5">
                        <div className="flex items-center gap-3">
                          <div className="h-7 w-7 rounded-full gradient-primary flex items-center justify-center text-[10px] font-bold text-primary-foreground shrink-0">
                            {initialsForEmail(item.email)}
                          </div>
                          <span className="text-sm font-medium">{item.email}</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className="text-sm text-muted-foreground font-mono">
                          {item.path}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          {/* Live confidence: plain neon bar + 12px label (R6-M1,
                              R16: div-rooted like the live). */}
                          <div className="h-1.5 w-12 rounded-full bg-muted overflow-hidden">
                            <div
                              className="h-full rounded-full bg-neon-green"
                              style={{ width: `${item.confidence ?? 0}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium">
                            {item.confidence}%
                          </span>
                        </div>
                      </td>
                      <td className="p-3 px-5 text-right text-sm text-muted-foreground">
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
