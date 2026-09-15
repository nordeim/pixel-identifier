import type { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { ActivityFeed, type ActivityEvent } from '@/components/dashboard/activity-feed'

export const metadata: Metadata = {
  title: 'Activity Log',
}

export const dynamic = 'force-dynamic'

export default async function ActivityPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/login')

  const events = await db.event.findMany({
    where: { site: { userId: session.user.id } },
    select: {
      id: true,
      name: true,
      path: true,
      createdAt: true,
      visitor: { select: { email: true, anonymousId: true } },
      site: { select: { domain: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 60,
  })

  const initialEvents: ActivityEvent[] = events.map((event) => ({
    id: event.id,
    name: event.name,
    domain: event.site.domain,
    path: event.path,
    email: event.visitor.email,
    anonymousId: event.visitor.email ? null : event.visitor.anonymousId.slice(0, 12),
    createdAt: event.createdAt.toISOString(),
  }))

  return <ActivityFeed initialEvents={initialEvents} />
}
