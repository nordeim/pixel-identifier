import type { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { getPlan } from '@/lib/plans'
import { listDomainsAction } from '@/actions/domains'
import { DomainsPanel } from '@/components/dashboard/domains-panel'

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

  // Single query path (F-36): the page consumes the action's _count-backed
  // list instead of duplicating the Prisma query.
  const domains = await listDomainsAction()

  return <DomainsPanel domains={domains} domainLimit={plan.domainLimit} planName={plan.name} />
}
