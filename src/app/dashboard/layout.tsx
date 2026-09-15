import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getUsage } from '@/lib/analytics'
import { formatPrice } from '@/lib/plans'
import { SidebarNav } from '@/components/dashboard/sidebar-nav'
import { Topbar } from '@/components/dashboard/topbar'

/**
 * Dashboard chrome. The session check here is a UX redirect; every server
 * action and API route re-validates the session independently (the
 * scandihaven "gate is UX only" rule — real authz happens at the mutation).
 */
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id || !session.user.email) {
    redirect('/login')
  }

  const usage = await getUsage(session.user.id)
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
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 border-r border-border bg-card lg:block">
        <div className="sticky top-0 h-screen">
          <SidebarNav usage={usageProps} />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar email={session.user.email} usage={usageProps} />
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  )
}
