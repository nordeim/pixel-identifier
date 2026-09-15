import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

/** Liveness + DB readiness probe. */
export const dynamic = 'force-dynamic'

export async function GET(): Promise<NextResponse> {
  try {
    await db.$queryRaw`SELECT 1`
    return NextResponse.json({ status: 'ok', db: 'up' })
  } catch {
    return NextResponse.json({ status: 'degraded', db: 'down' }, { status: 503 })
  }
}
