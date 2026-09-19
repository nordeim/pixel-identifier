import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { GET } from '@/app/api/export/route'

/**
 * R21 F1 — the live's CSV export byte format (plan:
 * docs/plans/2026-09-19-round21-functional-export-parity.md).
 *
 * The live builds the CSV client-side (bundle: index-nhmKaUsm.js, fn W):
 *   header: Type,Name,Detail,Confidence,Source,Location,First Seen,Last Seen,Status
 *   rows:   ${Company|Individual},${label},${sublabel},${b2c?X%:—},
 *           ${b2c?identType:IP Lookup},${location||—},${en-US short date},
 *           ${relative lastSeen},${status}
 *   join: \n (LF) · NO BOM · NO quoting · filename pixelco-visitors-YYYY-MM-DD.csv
 *   scope: ?ids= present → that selection (header-only file when empty);
 *          absent → the whole account.
 * The relative Last Seen and the 1-hour active status are computed at
 * export time; tests pin them through the public format helpers.
 */

let sessionUserId: string | null = null

vi.mock('next-auth', () => ({
  getServerSession: vi.fn(async () =>
    sessionUserId ? { user: { id: sessionUserId } } : null,
  ),
}))

async function seedVisitors(userId: string, domain: string) {
  const site = await db.site.create({
    data: {
      userId,
      domain,
      siteKey: `px_${crypto.randomUUID().replace(/-/g, '').slice(0, 16)}`,
    },
  })
  await db.visitor.createMany({
    data: [
      {
        siteId: site.id,
        anonymousId: 'v_r21_0001',
        email: 'marcus.smith@acmecorp.com',
        type: 'individual',
        source: 'direct',
        confidence: 85,
        pageviews: 3,
        firstSeen: new Date('2026-09-10T00:00:00Z'),
        lastSeen: new Date('2026-09-15T00:00:00Z'),
      },
      {
        siteId: site.id,
        anonymousId: 'v_r21_0002',
        email: 'ops@alibaba.com',
        type: 'company',
        companyName: 'Alibaba (US) Technology Co., Ltd.',
        city: 'Hong Kong',
        state: 'Hong Kong',
        country: 'HK',
        source: 'ip-lookup',
        confidence: null,
        pageviews: 2,
        firstSeen: new Date('2026-09-05T00:00:00Z'),
        lastSeen: new Date('2026-09-12T00:00:00Z'),
      },
    ],
  })
  return site
}

function exportRequest(url: string): NextRequest {
  return new Request(url, { method: 'GET' }) as unknown as NextRequest
}

describe('GET /api/export — the live byte format (R21 F1)', () => {
  beforeEach(async () => {
    sessionUserId = null
    await db.user.deleteMany()
  })

  it('requires a session', async () => {
    const response = await GET(exportRequest('http://localhost:3000/api/export'))
    expect(response.status).toBe(401)
  })

  it('emits the live 9-column header, LF lines, no BOM, no quoting', async () => {
    const user = await db.user.create({
      data: { email: `r21-${crypto.randomUUID()}@test.example`, passwordHash: 'x' },
    })
    sessionUserId = user.id
    await seedVisitors(user.id, 'r21.example')

    const response = await GET(exportRequest('http://localhost:3000/api/export'))
    expect(response.status).toBe(200)
    expect(response.headers.get('content-type')).toBe('text/csv; charset=utf-8')

    const raw = Buffer.from(await response.arrayBuffer())
    // NO BOM — the live's Blob ships plain text.
    expect(raw.subarray(0, 3)).not.toEqual(Buffer.from([0xef, 0xbb, 0xbf]))
    const text = raw.toString('utf-8')

    // The live's exact header row.
    expect(text.startsWith('Type,Name,Detail,Confidence,Source,Location,First Seen,Last Seen,Status')).toBe(true)

    // LF line endings (the live joins with \n) — no CRLF anywhere.
    expect(text).not.toContain('\r\n')

    // The row count: header + 2 seeded rows, nothing else (no trailing
    // newline — the live joins with \n).
    const lines = text.split('\n')
    expect(lines).toHaveLength(3)
    expect(lines[0]).toBe('Type,Name,Detail,Confidence,Source,Location,First Seen,Last Seen,Status')
    expect(lines[1].startsWith('Individual,')).toBe(true)
    expect(lines[2].startsWith('Company,')).toBe(true)
  })

  it('maps rows per the live template (types, —, IP Lookup, location, dates)', async () => {
    const user = await db.user.create({
      data: { email: `r21b-${crypto.randomUUID()}@test.example`, passwordHash: 'x' },
    })
    sessionUserId = user.id
    await seedVisitors(user.id, 'r21b.example')

    const response = await GET(exportRequest('http://localhost:3000/api/export'))
    const text = await response.text()
    const lines = text.split('\n').filter(Boolean)
    const individual = lines.find((l) => l.startsWith('Individual,marcus.smith@acmecorp.com,'))
    const company = lines.find((l) => l.startsWith('Company,Alibaba (US) Technology Co., Ltd.,'))
    expect(individual).toBeTruthy()
    expect(company).toBeTruthy()

    // b2c: sublabel = site domain, confidence 85%, identType direct,
    // location "—" (individuals carry no geo), en-US short First Seen.
    // NOTE: the live embeds the date RAW (unquoted) — its comma makes the
    // row 10 fields; the clone replicates the byte format exactly.
    expect(individual).toMatch(
      /^Individual,marcus\.smith@acmecorp\.com,r21b\.example,85%,direct,—,Sep 10, 2026,\d+d ago,inactive$/,
    )

    // b2b: sublabel = the company email's domain, confidence —,
    // source IP Lookup, joined geo location, date comma raw.
    expect(company).toMatch(
      /^Company,Alibaba \(US\) Technology Co\., Ltd\.,alibaba\.com,—,IP Lookup,Hong Kong, Hong Kong, HK,Sep 5, 2026,\d+d ago,inactive$/,
    )
  })

  it('names the file like the live (pixelco-visitors-YYYY-MM-DD.csv)', async () => {
    const user = await db.user.create({
      data: { email: `r21c-${crypto.randomUUID()}@test.example`, passwordHash: 'x' },
    })
    sessionUserId = user.id
    await seedVisitors(user.id, 'r21c.example')

    const response = await GET(exportRequest('http://localhost:3000/api/export'))
    const disposition = response.headers.get('content-disposition')
    expect(disposition).toMatch(
      /^attachment; filename="pixelco-visitors-\d{4}-\d{2}-\d{2}\.csv"$/,
    )
  })

  it('scopes to the ids selection when the param is present (header-only when empty)', async () => {
    const user = await db.user.create({
      data: { email: `r21d-${crypto.randomUUID()}@test.example`, passwordHash: 'x' },
    })
    sessionUserId = user.id
    const site = await seedVisitors(user.id, 'r21d.example')
    const mine = await db.visitor.findFirstOrThrow({
      where: { anonymousId: 'v_r21_0001', siteId: site.id },
      select: { id: true },
    })

    const selected = await GET(
      exportRequest(`http://localhost:3000/api/export?ids=${mine.id}`),
    )
    const text = await selected.text()
    expect(text.split('\n').filter(Boolean)).toHaveLength(2)
    expect(text).toContain('marcus.smith@acmecorp.com')
    expect(text).not.toContain('Alibaba')

    // An ids param with NO valid ids = an empty selection = the header-only
    // file (the live exports D=[] → just the header line).
    const empty = await GET(exportRequest('http://localhost:3000/api/export?ids=none'))
    const emptyText = await empty.text()
    expect(emptyText.split('\n').filter(Boolean)).toHaveLength(1)
    expect(emptyText.startsWith('Type,Name,Detail,Confidence')).toBe(true)
  })

  it('restricts ?ids= to the session user’s own visitors', async () => {
    const mine = await db.user.create({
      data: { email: `r21e-${crypto.randomUUID()}@test.example`, passwordHash: 'x' },
    })
    const other = await db.user.create({
      data: { email: `r21f-${crypto.randomUUID()}@test.example`, passwordHash: 'x' },
    })
    const mineSite = await seedVisitors(mine.id, 'r21e.example')
    const otherSite = await seedVisitors(other.id, 'r21f.example')
    const myVisitor = await db.visitor.findFirstOrThrow({
      where: { anonymousId: 'v_r21_0001', siteId: mineSite.id },
      select: { id: true },
    })
    const otherVisitor = await db.visitor.findFirstOrThrow({
      where: { anonymousId: 'v_r21_0001', siteId: otherSite.id },
      select: { id: true },
    })

    sessionUserId = mine.id
    const response = await GET(
      exportRequest(`http://localhost:3000/api/export?ids=${myVisitor.id},${otherVisitor.id}`),
    )
    const text = await response.text()
    expect(text).toContain('r21e.example')
    expect(text).not.toContain('r21f.example')
  })
})
