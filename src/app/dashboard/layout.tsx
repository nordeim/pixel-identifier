import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getUsage, getVisitorSegmentCounts, hasRecentIdentifications } from '@/lib/analytics'
import { formatPrice } from '@/lib/plans'
import { requireUser } from '@/lib/analytics'
import { SidebarShell } from '@/components/dashboard/sidebar-shell'
import { Topbar } from '@/components/dashboard/topbar'

/**
 * Dashboard chrome. The session check here is a UX redirect; every server
 * action and API route re-validates the session independently (the
 * scandihaven "gate is UX only" rule — real authz happens at the mutation).
 */
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser(await getServerSession(authOptions))

  const [usage, unread, visitorsCounts] = await Promise.all([
    getUsage(user.id),
    hasRecentIdentifications(user.id),
    getVisitorSegmentCounts(user.id),
  ])
  const usageProps = {
    planName: usage.plan.name,
    used: usage.used,
    limit: usage.limit,
    percent: usage.percent,
    period: usage.period,
    overage: usage.overage,
    overageCostLabel: formatPrice(usage.overageCostCents),
  }

  return (
    <div className="flex min-h-screen bg-app">
      {/* Desktop sidebar (collapsible to an icon rail) */}
      <SidebarShell usage={usageProps} />

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          email={user.email}
          usage={usageProps}
          unread={unread}
          initialVisitorsCounts={visitorsCounts}
        />
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  )
}
