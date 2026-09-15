import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { csvCell } from '@/lib/format'

/**
 * CSV export of identified visitors ("Export All" / "Export Selected" on the
 * Visitors page). Accepts an optional `?ids=` list (comma-separated visitor
 * ids, capped) — always re-scoped to the session user's own visitors, so a
 * foreign id is silently dropped rather than leaked.
 */
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

const MAX_SELECTED = 500
const CUID_LIKE = /^c[a-z0-9]{20,}$/

export async function GET(request: NextRequest): Promise<NextResponse> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'UNAUTHENTICATED' }, { status: 401 })
  }

  // Optional explicit selection (?ids=id1,id2). Malformed ids are ignored
  // (a list with no valid ids at all degrades to export-all); ownership is
  // enforced by the `site: { userId }` scope below.
  const idsParam = new URL(request.url).searchParams.get('ids')
  const selectedIds = idsParam
    ? idsParam
        .split(',')
        .map((id) => id.trim())
        .filter((id) => CUID_LIKE.test(id))
        .slice(0, MAX_SELECTED)
    : null
  const idFilter = selectedIds && selectedIds.length > 0 ? { id: { in: selectedIds } } : {}

  const visitors = await db.visitor.findMany({
    where: {
      site: { userId: session.user.id },
      email: { not: null },
      ...idFilter,
    },
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

  // UTF-8 BOM so Excel detects the encoding instead of guessing latin-1.
  const csv = '\ufeff' + [CSV_HEADER, ...rows].join('\r\n')

  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="pixelco-visitors-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  })
}
