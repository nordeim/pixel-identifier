import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { listActivity } from '@/lib/analytics'

/**
 * Live feed API — polled by the Activity Log page. Returns the latest
 * events across all of the signed-in user's sites, or the page AFTER the
 * given `?cursor=` (event id) so the feed can page through history.
 */
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest): Promise<NextResponse> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'UNAUTHENTICATED' }, { status: 401 })
  }

  const cursor = new URL(request.url).searchParams.get('cursor') ?? undefined
  const page = await listActivity(session.user.id, { cursor })
  return NextResponse.json(page)
}
