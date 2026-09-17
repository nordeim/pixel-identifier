import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getUsage, getVisitorSegmentCounts, hasRecentIdentifications } from '@/lib/analytics'
import { formatPrice } from '@/lib/plans'
import { requireUser } from '@/lib/analytics'
import { SidebarShell } from '@/components/dashboard/sidebar-shell'
import { Topbar } from '@/components/dashboard/topbar'
import { appSeoMetadata } from '@/lib/app-seo'

// R14-F9: the live app bundle ships its own og block (og:title "Pixelco",
// "Visitor identification platform dashboard", its 1920×1080 social image,
// large twitter card, no canonical/og:url/og:locale) — distinct from the
// marketing head. Tab titles stay per-page via the root template (R13).
export const metadata = appSeoMetadata()

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
    <div className="min-h-screen flex w-full bg-muted/30">
      {/* Desktop sidebar (collapsible to an icon rail) */}
      <SidebarShell usage={usageProps} />

      <div className="flex-1 flex flex-col">
        <Topbar
          email={user.email}
          usage={usageProps}
          unread={unread}
          initialVisitorsCounts={visitorsCounts}
        />
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  )
}
