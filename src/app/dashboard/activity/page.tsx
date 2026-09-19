import type { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { listActivity, requireUser } from '@/lib/analytics'
import { ActivityFeed } from '@/components/dashboard/activity-feed'

export const metadata: Metadata = {
  title: 'Activity Log',
}

export const dynamic = 'force-dynamic'

export default async function ActivityPage() {
  const user = await requireUser(await getServerSession(authOptions))

  // R22-F6: the server renders page 0 (50 events) + the exact count for
  // the footer decision; older pages are client fetches on footer clicks.
  const initial = await listActivity(user.id)

  return <ActivityFeed initialEvents={initial.events} totalCount={initial.count} />
}
