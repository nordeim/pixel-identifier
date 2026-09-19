import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { formatDate, relativeTime } from '@/lib/format'
import { isVisitorActive } from '@/lib/dashboard-nav'

/**
 * CSV export of identified visitors ("Export All" / "Export (N)" on the
 * Visitors page).
 *
 * R21-F1: the byte format is the LIVE's (decoded from its app bundle,
 * index-nhmKaUsm.js, function W):
 *   header: Type,Name,Detail,Confidence,Source,Location,First Seen,Last Seen,Status
 *   rows:   Company|Individual, name, detail, X%|—, identType|IP Lookup,
 *           location|—, en-US short date, RELATIVE last-seen, active|inactive
 *   joined with \n (LF), NO BOM, NO quoting (the live embeds raw template
 *   values — its en-US date's comma ships unquoted, producing the same
 *   ragged row; the clone replicates the byte format faithfully).
 * The mechanism stays a server route (invisible to the user); the live's
 * W() runs client-side as a Blob download.
 *
 * Scope — the live exports the current tab's CURRENT PAGE rows, or the
 * selected subset: `r.size>0 ? D.filter(selected) : D`. The topbar passes
 * the ids (selection or page — see chrome-store); the `?ids=` param being
 * PRESENT means selection scope (an empty/invalid list exports the
 * header-only file, matching the live's D=[] case); absent = full export.
 */
export const dynamic = 'force-dynamic'

const CSV_HEADER =
  'Type,Name,Detail,Confidence,Source,Location,First Seen,Last Seen,Status'

const MAX_SELECTED = 500
const CUID_LIKE = /^c[a-z0-9]{20,}$/

export async function GET(request: NextRequest): Promise<NextResponse> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'UNAUTHENTICATED' }, { status: 401 })
  }

  // Optional explicit selection (?ids=id1,id2 — the current page or the
  // checked rows). Malformed ids are ignored; ownership is enforced by the
  // `site: { userId }` scope below so a foreign id is silently dropped.
  // The param being PRESENT (even with no valid ids) means selection scope —
  // an empty selection exports the header-only file, matching the live's
  // D=[] case; an absent param is the full export.
  const idsParam = new URL(request.url).searchParams.get('ids')
  const selectionScope = idsParam !== null
  const selectedIds = selectionScope
    ? idsParam!
        .split(',')
        .map((id) => id.trim())
        .filter((id) => CUID_LIKE.test(id))
        .slice(0, MAX_SELECTED)
    : null
  const idFilter = selectionScope ? { id: { in: selectedIds ?? [] } } : {}

  const visitors = await db.visitor.findMany({
    where: {
      site: { userId: session.user.id },
      email: { not: null },
      ...idFilter,
    },
    select: {
      email: true,
      anonymousId: true,
      type: true,
      companyName: true,
      city: true,
      state: true,
      country: true,
      source: true,
      confidence: true,
      firstSeen: true,
      lastSeen: true,
      site: { select: { domain: true } },
    },
    orderBy: { lastSeen: 'desc' },
  })

  // The live's row template, per type:
  //   b2c: Individual, email, site domain, confidence%, identType, — (no geo),
  //        en-US short first-seen, RELATIVE last-seen, computed status
  //   b2b: Company, company name (|| Unknown), the company email's domain, —,
  //        IP Lookup, joined geo (|| —), same dates, same status
  const rows = visitors.map((v) => {
    const isCompany = v.type === 'company'
    const lastSeen = v.lastSeen
    return [
      isCompany ? 'Company' : 'Individual',
      isCompany ? v.companyName || 'Unknown' : v.email || `${v.anonymousId.slice(0, 12)}...`,
      isCompany
        ? (v.email ?? '').split('@')[1] ?? ''
        : v.site.domain,
      isCompany ? '—' : `${v.confidence ?? 0}%`,
      isCompany ? 'IP Lookup' : v.source,
      isCompany
        ? [v.city, v.state, v.country].filter(Boolean).join(', ') || '—'
        : '—',
      formatDate(v.firstSeen),
      relativeTime(lastSeen),
      isVisitorActive(lastSeen) ? 'active' : 'inactive',
    ].join(',')
  })

  // LF join, NO BOM, NO quoting — the live's Blob is plain text joined
  // with \n (the live's dates embed their comma raw; replicated exactly).
  const csv = [CSV_HEADER, ...rows].join('\n')

  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="pixelco-visitors-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  })
}
