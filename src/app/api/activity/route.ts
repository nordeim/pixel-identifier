import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { listActivity } from '@/lib/analytics'

/**
 * Activity Log API — the live's pagination model (R22-F6): 50 events per
 * offset page (`?page=`, 0-based), plus the exact count and pageCount for
 * the feed's prev/next footer. The live polls nothing; pages are fetched
 * on footer clicks only.
 */
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest): Promise<NextResponse> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'UNAUTHENTICATED' }, { status: 401 })
  }

  const raw = new URL(request.url).searchParams.get('page') ?? '0'
  const parsed = Number.parseInt(raw, 10)
  const page = Number.isFinite(parsed) && parsed >= 0 ? parsed : 0
  const result = await listActivity(session.user.id, { page })
  return NextResponse.json(result)
}
