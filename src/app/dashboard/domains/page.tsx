import type { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { requireUser } from '@/lib/analytics'
import { listDomainsAction } from '@/actions/domains'
import { DomainsPanel } from '@/components/dashboard/domains-panel'

export const metadata: Metadata = {
  title: 'Domains',
}

export const dynamic = 'force-dynamic'

export default async function DomainsPage() {
  await requireUser(await getServerSession(authOptions))

  // Single query path (F-36): the page consumes the action's _count-backed
  // list instead of duplicating the Prisma query.
  const domains = await listDomainsAction()

  return <DomainsPanel domains={domains} />
}
