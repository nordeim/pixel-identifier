import type { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { getUsage } from '@/lib/analytics'
import { formatPrice, type PlanId } from '@/lib/plans'
import { PlanPanel } from '@/components/dashboard/plan-panel'

export const metadata: Metadata = {
  title: 'Pricing & Plan',
}

export const dynamic = 'force-dynamic'

export default async function PricingPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/login')

  const usage = await getUsage(session.user.id)

  return (
    <PlanPanel
      currentPlan={usage.plan.id as PlanId}
      used={usage.used}
      limit={usage.limit}
      percent={usage.percent}
      period={usage.period}
      overage={usage.overage}
      overageCostLabel={formatPrice(usage.overageCostCents)}
    />
  )
}
