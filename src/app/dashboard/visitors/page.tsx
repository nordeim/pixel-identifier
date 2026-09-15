import type { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { VisitorsTable, type VisitorRow } from '@/components/dashboard/visitors-table'

export const metadata: Metadata = {
  title: 'Visitors',
}

export const dynamic = 'force-dynamic'

export default async function VisitorsPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/login')

  const visitors = await db.visitor.findMany({
    where: { site: { userId: session.user.id } },
    select: {
      id: true,
      email: true,
      anonymousId: true,
      type: true,
      companyName: true,
      source: true,
      confidence: true,
      status: true,
      pageviews: true,
      firstSeen: true,
      lastSeen: true,
      site: { select: { domain: true } },
    },
    orderBy: { lastSeen: 'desc' },
    take: 500,
  })

  const rows: VisitorRow[] = visitors.map((visitor) => ({
    id: visitor.id,
    email: visitor.email,
    anonymousId: visitor.anonymousId,
    type: visitor.type,
    companyName: visitor.companyName,
    source: visitor.source,
    confidence: visitor.confidence,
    status: visitor.status,
    pageviews: visitor.pageviews,
    firstSeen: visitor.firstSeen.toISOString(),
    lastSeen: visitor.lastSeen.toISOString(),
    domain: visitor.site.domain,
  }))

  return <VisitorsTable visitors={rows} />
}
