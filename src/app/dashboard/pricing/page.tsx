import type { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getUsage, requireUser } from '@/lib/analytics'
import { formatPrice, type PlanId } from '@/lib/plans'
import { PlanPanel } from '@/components/dashboard/plan-panel'

export const metadata: Metadata = {
  title: 'Pricing & Plan',
}

export const dynamic = 'force-dynamic'

export default async function PricingPage() {
  const user = await requireUser(await getServerSession(authOptions))

  const usage = await getUsage(user.id)

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
