import type { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { listActivity } from '@/lib/analytics'
import { ActivityFeed } from '@/components/dashboard/activity-feed'

export const metadata: Metadata = {
  title: 'Activity Log',
}

export const dynamic = 'force-dynamic'

export default async function ActivityPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/login')

  const initial = await listActivity(session.user.id)

  return <ActivityFeed initialEvents={initial.events} initialCursor={initial.nextCursor} />
}
