import type { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { getPlan } from '@/lib/plans'
import { DomainsPanel } from '@/components/dashboard/domains-panel'
import type { DomainDto } from '@/actions/domains'

export const metadata: Metadata = {
  title: 'Domains',
}

export const dynamic = 'force-dynamic'

export default async function DomainsPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/login')

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { plan: true },
  })
  const plan = getPlan(user?.plan ?? 'free')

  const sites = await db.site.findMany({
    where: { userId: session.user.id },
    select: {
      id: true,
      domain: true,
      status: true,
      createdAt: true,
      visitors: { select: { id: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  const domains: DomainDto[] = sites.map((site) => ({
    id: site.id,
    domain: site.domain,
    status: site.status,
    createdAt: site.createdAt.toISOString(),
    visitorCount: site.visitors.length,
  }))

  return (
    <DomainsPanel domains={domains} domainLimit={plan.domainLimit} planName={plan.name} />
  )
}
