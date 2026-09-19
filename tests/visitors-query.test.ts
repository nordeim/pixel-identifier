import { beforeEach, describe, expect, it } from 'vitest'
import { db } from '@/lib/db'
import { getVisitorSegmentCounts, listVisitors } from '@/lib/analytics'

async function seed() {
  const user = await db.user.create({
    data: {
      email: `visitors-${crypto.randomUUID()}@test.example`,
      passwordHash: 'not-a-real-hash',
    },
  })
  const site = await db.site.create({
    data: {
      userId: user.id,
      domain: 'shop.example',
      siteKey: `px_${crypto.randomUUID().replace(/-/g, '').slice(0, 16)}`,
    },
  })

  const visitors = []
  for (let i = 0; i < 60; i++) {
    const isIdentified = i < 20
    const isCompany = isIdentified && i < 8
    visitors.push({
      siteId: site.id,
      anonymousId: `v_seed_${i.toString().padStart(4, '0')}`,
      email: isIdentified
        ? isCompany
          ? `contact${i}@company${i}.example`
          : `person${i}@mail.example`
        : null,
      type: isIdentified ? (isCompany ? 'company' : 'individual') : null,
      companyName: isCompany ? `Company ${i} Ltd` : null,
      city: isCompany ? 'San Francisco' : null,
      state: isCompany ? 'CA' : null,
      country: isCompany ? 'US' : null,
      source: i % 3 === 0 ? 'search' : i % 3 === 1 ? 'direct' : 'social',
      confidence: isIdentified ? 70 + (i % 3) * 10 : null, // 70 / 80 / 90
      pageviews: 1 + (i % 5),
      firstSeen: new Date(Date.now() - (100 - i) * 86_400_000),
      lastSeen: new Date(Date.now() - i * 60_000), // newest first = i ascending
    })
  }
  await db.visitor.createMany({ data: visitors })
  return { user, site }
}

describe('listVisitors (F-24: server-side search, filters, pagination)', () => {
  beforeEach(async () => {
    await db.user.deleteMany()
  })

  it('lists IDENTIFIED visitors only, like the live product (R5-H4)', async () => {
    const { user } = await seed()

    const page1 = await listVisitors(user.id, { page: 1, pageSize: 25 })
    expect(page1.rows).toHaveLength(20)
    expect(page1.rows.every((r) => r.email !== null)).toBe(true)
    expect(page1.total).toBe(20)
    expect(page1.pageCount).toBe(1)
    expect(page1.page).toBe(1)
    // Counts come from DB aggregates, not the loaded page.
    expect(page1.counts).toEqual({ all: 20, individual: 12, company: 8 })
  })

  it('orders by lastSeen descending', async () => {
    const { user } = await seed()
    const { rows } = await listVisitors(user.id, { page: 1, pageSize: 5 })
    expect(rows[0].anonymousId).toBe('v_seed_0000')
    expect(rows[4].anonymousId).toBe('v_seed_0004')
  })

  it('searches case-insensitively across email and company', async () => {
    const { user } = await seed()

    const byEmail = await listVisitors(user.id, { q: 'PERSON12@', page: 1, pageSize: 25 })
    expect(byEmail.total).toBe(1)
    expect(byEmail.rows[0].email).toBe('person12@mail.example')

    const byCompany = await listVisitors(user.id, { q: 'company 3 ', page: 1, pageSize: 25 })
    expect(byCompany.total).toBe(1)
    expect(byCompany.rows[0].companyName).toBe('Company 3 Ltd')

    // Anonymous ids are no longer searchable: the live list shows
    // identified visitors only.
    const byAnonId = await listVisitors(user.id, { q: 'v_seed_0042', page: 1, pageSize: 25 })
    expect(byAnonId.total).toBe(0)
  })

  it('filters by segment, confidence band and source (R21 live semantics)', async () => {
    const { user } = await seed()

    const companies = await listVisitors(user.id, { type: 'company', page: 1, pageSize: 25 })
    expect(companies.total).toBe(8)
    expect(companies.rows.every((r) => r.type === 'company')).toBe(true)

    // R21-F3: the live's bands — high gte 85, medium 70-84, low lt 70.
    // Identified visitors have confidence 70/80/90 evenly (i%3).
    const high = await listVisitors(user.id, { confidenceBand: 'high', page: 1, pageSize: 25 })
    expect(high.rows.every((r) => (r.confidence ?? 0) >= 85)).toBe(true)
    const medium = await listVisitors(user.id, { confidenceBand: 'medium', page: 1, pageSize: 25 })
    expect(medium.rows.every((r) => (r.confidence ?? 0) >= 70 && (r.confidence ?? 0) < 85)).toBe(true)
    expect(medium.total).toBe(14)
    const low = await listVisitors(user.id, { confidenceBand: 'low', page: 1, pageSize: 25 })
    expect(low.total).toBe(0)

    // R21-F4: the source filter scopes individuals; company rows stay
    // visible (the live's b2b query ignores the source filter).
    const direct = await listVisitors(user.id, { source: 'direct', page: 1, pageSize: 25 })
    expect(
      direct.rows.every((r) => r.type === 'company' || r.source === 'direct'),
    ).toBe(true)
  })

  it('combines filters with pagination', async () => {
    const { user } = await seed()
    const result = await listVisitors(user.id, {
      type: 'individual',
      confidenceBand: 'medium',
      page: 1,
      pageSize: 5,
    })
    expect(result.rows).toHaveLength(5)
    expect(result.total).toBe(8)
    expect(result.pageCount).toBe(2)
  })

  it('exposes the B2B location fields for company display (R5-H4)', async () => {
    const { user } = await seed()
    const companies = await listVisitors(user.id, { type: 'company', page: 1, pageSize: 25 })
    expect(companies.rows.length).toBe(8)
    for (const row of companies.rows) {
      expect(`${row.city}, ${row.state}, ${row.country}`).toBe('San Francisco, CA, US')
    }

    const individuals = await listVisitors(user.id, { type: 'individual', page: 1, pageSize: 25 })
    for (const row of individuals.rows) {
      expect(row.city).toBeNull()
      expect(row.country).toBeNull()
    }
  })

  it('clamps out-of-range pages safely', async () => {
    const { user } = await seed()
    const result = await listVisitors(user.id, { page: 99, pageSize: 25 })
    expect(result.rows).toHaveLength(0)
    expect(result.page).toBe(99)
  })
})

describe('getVisitorSegmentCounts (R6-C1: server-rendered topbar subtitle)', () => {
  beforeEach(async () => {
    await db.user.deleteMany()
  })

  it('counts identified individuals and companies across all of the user’s sites', async () => {
    const { user } = await seed()

    const counts = await getVisitorSegmentCounts(user.id)
    // The seed creates 12 identified individuals and 8 identified companies;
    // the 40 anonymous visitors must not count toward either segment.
    expect(counts).toEqual({ individual: 12, company: 8 })
  })

  it('never leaks another user’s visitors', async () => {
    const { user } = await seed()

    const stranger = await db.user.create({
      data: {
        email: `stranger-${crypto.randomUUID()}@test.example`,
        passwordHash: 'not-a-real-hash',
      },
    })

    expect(await getVisitorSegmentCounts(stranger.id)).toEqual({
      individual: 0,
      company: 0,
    })
    expect(await getVisitorSegmentCounts(user.id)).toEqual({ individual: 12, company: 8 })
  })

  it('returns zeros for a user with no visitors at all', async () => {
    const user = await db.user.create({
      data: {
        email: `empty-${crypto.randomUUID()}@test.example`,
        passwordHash: 'not-a-real-hash',
      },
    })
    expect(await getVisitorSegmentCounts(user.id)).toEqual({ individual: 0, company: 0 })
  })
})
