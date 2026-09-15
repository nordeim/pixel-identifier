import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

/**
 * Live feed API — polled by the Activity Log page. Returns the latest
 * events across all of the signed-in user's sites.
 */
export const dynamic = 'force-dynamic'

export async function GET(_request: NextRequest): Promise<NextResponse> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'UNAUTHENTICATED' }, { status: 401 })
  }

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

  return NextResponse.json({
    events: events.map((event) => ({
      id: event.id,
      name: event.name,
      domain: event.site.domain,
      path: event.path,
      email: event.visitor.email,
      anonymousId: event.visitor.email ? null : event.visitor.anonymousId.slice(0, 12),
      createdAt: event.createdAt.toISOString(),
    })),
  })
}
