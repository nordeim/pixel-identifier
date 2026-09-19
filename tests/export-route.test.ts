import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { GET } from '@/app/api/export/route'

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
  const mine = await db.visitor.createMany({
    data: [
      { siteId: site.id, anonymousId: 'v_exp_0001', email: `one@${domain}`, type: 'individual', confidence: 90 },
      { siteId: site.id, anonymousId: 'v_exp_0002', email: `two@${domain}`, type: 'individual', confidence: 80 },
      { siteId: site.id, anonymousId: 'v_exp_0003', email: null }, // anonymous: never exported
    ],
  })
  return { site, count: mine.count }
}

function exportRequest(url: string): NextRequest {
  return new Request(url, { method: 'GET' }) as unknown as NextRequest
}

describe('GET /api/export', () => {
  beforeEach(async () => {
    sessionUserId = null
    await db.user.deleteMany()
  })

  it('requires a session', async () => {
    const response = await GET(exportRequest('http://localhost:3000/api/export'))
    expect(response.status).toBe(401)
  })

  it('emits the live\'s byte format (R21-F1: 9 columns, LF, no BOM, raw values)', async () => {
    const user = await db.user.create({
      data: { email: `export-${crypto.randomUUID()}@test.example`, passwordHash: 'x' },
    })
    sessionUserId = user.id
    await seedVisitors(user.id, 'export.example')

    const response = await GET(exportRequest('http://localhost:3000/api/export'))
    expect(response.status).toBe(200)
    expect(response.headers.get('content-type')).toBe('text/csv; charset=utf-8')

    // R21-F1: NO BOM — the live's Blob ships plain text.
    const raw = Buffer.from(await response.arrayBuffer())
    expect(raw.subarray(0, 3)).not.toEqual(Buffer.from([0xef, 0xbb, 0xbf]))
    const text = raw.toString('utf-8')

    // The live's exact 9-column header + LF lines.
    expect(text.startsWith('Type,Name,Detail,Confidence,Source,Location,First Seen,Last Seen,Status')).toBe(true)
    expect(text).not.toContain('\r\n')
    expect(text).toContain('one@export.example')
    expect(text).toContain('two@export.example')
    // Anonymous visitors are never exported.
    expect(text).not.toContain('v_exp_0003')
  })

  it('restricts ?ids= to the session user’s own visitors', async () => {
    const mine = await db.user.create({
      data: { email: `mine-${crypto.randomUUID()}@test.example`, passwordHash: 'x' },
    })
    const other = await db.user.create({
      data: { email: `other-${crypto.randomUUID()}@test.example`, passwordHash: 'x' },
    })
    const mineSeeded = await seedVisitors(mine.id, 'mine.example')
    const otherSeeded = await seedVisitors(other.id, 'other.example')

    const myVisitor = await db.visitor.findFirstOrThrow({
      where: { anonymousId: 'v_exp_0001', siteId: mineSeeded.site.id },
      select: { id: true },
    })
    const otherVisitor = await db.visitor.findFirstOrThrow({
      where: { anonymousId: 'v_exp_0001', siteId: otherSeeded.site.id },
      select: { id: true },
    })

    sessionUserId = mine.id
    const response = await GET(
      exportRequest(
        `http://localhost:3000/api/export?ids=${myVisitor.id},${otherVisitor.id}`,
      ),
    )
    expect(response.status).toBe(200)
    const text = await response.text()
    // My selected visitor is present; the other user's visitor is silently
    // dropped by the ownership scope, and my unselected visitor is absent.
    expect(text).toContain('one@mine.example')
    expect(text).not.toContain('two@mine.example')
    expect(text).not.toContain('one@other.example')
  })

  it('ignores malformed ids when the param is absent-equivalent (full export)', async () => {
    // Historical behavior kept for the param-ABSENT contract: a fully
    // malformed list yields no valid ids but the param IS present, so the
    // scope is the (empty) selection — the live exports D=[] → header-only.
    const user = await db.user.create({
      data: { email: `mal-${crypto.randomUUID()}@test.example`, passwordHash: 'x' },
    })
    sessionUserId = user.id
    await seedVisitors(user.id, 'malformed.example')

    const response = await GET(exportRequest('http://localhost:3000/api/export?ids=,,,not-an-id,,'))
    expect(response.status).toBe(200)
    const text = await response.text()
    // R21-F1: selection scope — the header-only file (no rows).
    expect(text.split('\n').filter(Boolean)).toHaveLength(1)
    expect(text.startsWith('Type,Name,Detail,Confidence')).toBe(true)
  })
})
