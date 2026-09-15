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

  it('exports identified visitors with a BOM and RFC 4180 rows', async () => {
    const user = await db.user.create({
      data: { email: `export-${crypto.randomUUID()}@test.example`, passwordHash: 'x' },
    })
    sessionUserId = user.id
    await seedVisitors(user.id, 'export.example')

    const response = await GET(exportRequest('http://localhost:3000/api/export'))
    expect(response.status).toBe(200)
    expect(response.headers.get('content-type')).toContain('text/csv')

    // Response.text() strips a leading BOM per the Fetch spec, so assert the
    // raw bytes: the CSV must start with EF BB BF for Excel to detect UTF-8.
    const raw = Buffer.from(await response.arrayBuffer())
    expect(raw.subarray(0, 3)).toEqual(Buffer.from([0xef, 0xbb, 0xbf]))
    const text = raw.subarray(3).toString('utf-8')
    expect(text).toContain('Email,Type,Company,Confidence')
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

  it('ignores malformed ids', async () => {
    const user = await db.user.create({
      data: { email: `mal-${crypto.randomUUID()}@test.example`, passwordHash: 'x' },
    })
    sessionUserId = user.id
    await seedVisitors(user.id, 'malformed.example')

    const response = await GET(exportRequest('http://localhost:3000/api/export?ids=,,,not-an-id,,'))
    expect(response.status).toBe(200)
    const text = await response.text()
    expect(text).toContain('one@malformed.example')
    expect(text).toContain('two@malformed.example')
  })
})
