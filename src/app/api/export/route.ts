import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { csvCell } from '@/lib/format'

/** CSV export of identified visitors ("Export All" on the Visitors page). */
export const dynamic = 'force-dynamic'

const CSV_HEADER = [
  'Email',
  'Type',
  'Company',
  'Confidence',
  'Source',
  'Pageviews',
  'First Seen',
  'Last Seen',
  'Domain',
].join(',')

export async function GET(_request: NextRequest): Promise<NextResponse> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'UNAUTHENTICATED' }, { status: 401 })
  }

  const visitors = await db.visitor.findMany({
    where: { site: { userId: session.user.id }, email: { not: null } },
    select: {
      email: true,
      type: true,
      companyName: true,
      confidence: true,
      source: true,
      pageviews: true,
      firstSeen: true,
      lastSeen: true,
      site: { select: { domain: true } },
    },
    orderBy: { lastSeen: 'desc' },
  })

  const rows = visitors.map((v) =>
    [
      csvCell(v.email),
      csvCell(v.type ?? 'individual'),
      csvCell(v.companyName ?? ''),
      csvCell(v.confidence ?? ''),
      csvCell(v.source),
      csvCell(v.pageviews),
      csvCell(v.firstSeen.toISOString()),
      csvCell(v.lastSeen.toISOString()),
      csvCell(v.site.domain),
    ].join(','),
  )

  const csv = [CSV_HEADER, ...rows].join('\r\n')

  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="pixelco-visitors-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  })
}
