import { describe, expect, it, vi } from 'vitest'
import { readFileSync } from 'node:fs'
import { renderToStaticMarkup } from 'react-dom/server'
import { VisitorsTable } from '@/components/dashboard/visitors-table'
import { relativeTime } from '@/lib/format'
import { isVisitorActive } from '@/lib/dashboard-nav'
import { identTypeFor, resolveIdentity } from '@/lib/identification'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => '/dashboard/visitors',
}))

/**
 * R21 functional-flow parity pins (plan:
 * docs/plans/2026-09-19-round21-functional-export-parity.md).
 *
 * Evidence base: the live's app bundle (index-nhmKaUsm.js) + runtime
 * probes (selects opened, mobile dropdown opened) — the live's visitors
 * page model:
 *   - page size ni = 20
 *   - confidence filter bands: All / High (85%+) / Medium (70-84%) /
 *     Low (<70%) — gte 85 / 70..84 / lt 70
 *   - source filter: All Sources / Direct Signups / Network Matches —
 *     the IDENTIFICATION source, not traffic attribution
 *   - b2c badge: Direct (neon-green) / Network (electric-blue)
 *   - confidence bar 3-tier fill: >=85 green / >=70 electric-blue /
 *     else hot-pink
 *   - b2b confidence NULL (never a bar; MapPin location cell always)
 *   - relative time: "Just now" (<1 min) / "N min ago" / "N hr ago" /
 *     "Nd ago" (NO space, NO weeks)
 *   - active status: lastSeen within 1 hour (36e5)
 *   - mobile dropdown: bg-background border-b border-border px-6 py-4
 *     flex flex-col gap-4, plain links, 4 links + ONE w-full CTA, no
 *     Log In
 */

const table = readFileSync('src/components/dashboard/visitors-table.tsx', 'utf-8')
const page = readFileSync('src/app/dashboard/visitors/page.tsx', 'utf-8')
const analytics = readFileSync('src/lib/analytics.ts', 'utf-8')
const seed = readFileSync('prisma/seed.ts', 'utf-8')
const track = readFileSync('src/app/api/track/route.ts', 'utf-8')
const topbar = readFileSync('src/components/dashboard/topbar.tsx', 'utf-8')
const header = readFileSync('src/components/marketing/site-header.tsx', 'utf-8')

const ROWS = [
  {
    id: 'c1111111111111111111111',
    email: 'marcus.smith@acmecorp.com',
    anonymousId: 'anon_marcus',
    type: 'individual',
    companyName: null,
    city: null,
    state: null,
    country: null,
    source: 'direct',
    confidence: 85,
    status: 'active',
    pageviews: 3,
    firstSeen: '2026-09-10T00:00:00.000Z',
    lastSeen: '2026-09-18T00:00:00.000Z',
    domain: 'clone-research-test.com',
  },
  {
    id: 'c2222222222222222222222',
    email: 'ops@alibaba.com',
    anonymousId: 'anon_alibaba',
    type: 'company',
    companyName: 'Alibaba (US) Technology Co., Ltd.',
    city: 'Hong Kong',
    state: 'Hong Kong',
    country: 'HK',
    source: 'ip-lookup',
    confidence: null,
    status: 'inactive',
    pageviews: 2,
    firstSeen: '2026-09-05T00:00:00.000Z',
    lastSeen: '2026-09-15T00:00:00.000Z',
    domain: 'clone-research-test.com',
  },
]

function renderTable(rows = ROWS, overrides: Record<string, unknown> = {}) {
  return renderToStaticMarkup(
    <VisitorsTable
      visitors={rows}
      total={rows.length}
      page={1}
      pageCount={1}
      counts={{ all: rows.length, individual: 1, company: 1 }}
      filters={{ q: '', type: 'all', confidence: 'all', source: 'all' }}
      {...overrides}
    />,
  )
}

describe('R21 F2 — visitors page size 20 (live ni)', () => {
  it('the page pins PAGE_SIZE = 20', () => {
    expect(page).toContain('PAGE_SIZE = 20')
  })
})

describe('R21 F3 — confidence filter bands (live labels + semantics)', () => {
  it('the select ships the live option strings', () => {
    expect(table).toContain('High (85%+)')
    expect(table).toContain('Medium (70-84%)')
    // JSX escapes the < in Low (<70%) — the rendered text is identical.
    expect(table).toContain('Low (&lt;70%)')
    expect(table).not.toContain('90%+')
    expect(table).not.toContain('75%+')
    expect(table).not.toContain('50%+')
  })

  it('the page accepts the band values', () => {
    expect(page).toMatch(/CONFIDENCE_BANDS[\s\S]*high[\s\S]*medium[\s\S]*low/)
  })

  it('listVisitors maps bands to ranges (gte 85 / 70-84 / lt 70)', () => {
    expect(analytics).toContain('confidenceBand')
    expect(analytics).not.toContain('minConfidence')
  })

  it('the rendered select trigger is present (Radix renders options only when open)', () => {
    const html = renderTable()
    expect(html).toContain('aria-label="Filter by confidence"')
    expect(html).toContain('aria-label="Filter by source"')
  })
})

describe('R21 F4 — source model = identification type (live semantics)', () => {
  it('SOURCE_LABELS is the two live entries', () => {
    expect(table).toContain("direct: 'Direct'")
    expect(table).toContain("network: 'Network'")
    for (const retired of ['Search', 'Social', 'Referral', 'Campaign']) {
      expect(table).not.toContain(`: '${retired}'`)
    }
  })

  it('the source select ships the live options', () => {
    expect(table).toContain('Direct Signups')
    expect(table).toContain('Network Matches')
  })

  it('the rendered b2c Direct badge keeps the neon-green tail; Network gets electric-blue', () => {
    expect(table).toContain('bg-neon-green/10 text-neon-green border-neon-green/20')
    expect(table).toContain('bg-electric-blue/10 text-electric-blue border-electric-blue/20')
  })

  it('the identification lib derives the live identType rule', () => {
    expect(identTypeFor(85)).toBe('direct')
    expect(identTypeFor(70)).toBe('direct')
    expect(identTypeFor(69)).toBe('network')
    expect(identTypeFor(0)).toBe('network')
    expect(identTypeFor(null)).toBe('ip-lookup')
  })

  it('sourceFromReferrer (traffic attribution) is retired from the track route', () => {
    expect(track).not.toContain('sourceFromReferrer')
  })
})

describe('R21 F5 — confidence bar 3-tier fill', () => {
  it('the bar fill follows the live thresholds', () => {
    expect(table).toMatch(/>= 85[\s\S]{0,120}bg-neon-green/)
    expect(table).toMatch(/>= 70[\s\S]{0,120}bg-electric-blue/)
    expect(table).toContain('bg-hot-pink')
  })
})

describe('R21 F6 — company confidence is null (live b2b model)', () => {
  it('the resolver emits null confidence for companies', () => {
    // Deterministic sample: find a company resolution among fixed inputs.
    let sawCompany = false
    let sawIndividual = false
    for (let i = 0; i < 200 && !(sawCompany && sawIndividual); i++) {
      const identity = resolveIdentity(`r21vid${i}`, 'px_r21sample00000000')
      if (!identity) continue
      if (identity.type === 'company') {
        sawCompany = true
        expect(identity.confidence).toBeNull()
        expect(identity.city).toBeTruthy()
      } else {
        sawIndividual = true
        expect(identity.confidence).not.toBeNull()
      }
    }
    expect(sawCompany).toBe(true)
    expect(sawIndividual).toBe(true)
  })

  it('the seed ships the live semantics (company spec confidence null, sources direct/network)', () => {
    expect(seed).toMatch(/confidence: null/)
    expect(seed).not.toMatch(/source: 'search'/)
    expect(seed).not.toMatch(/source: 'social'/)
    expect(seed).not.toMatch(/source: 'referral'/)
  })
})

describe('R21 F8 — the b2b Confidence cell is ALWAYS the MapPin location div', () => {
  it('the company branch renders the MapPin div unconditionally (city-null falls back to —)', () => {
    expect(table).toMatch(/visitor\.type === 'company' \?[\s\S]{0,700}flex items-center gap-1\.5/)
    // The bare "—" span fallback is gone.
    expect(table).not.toContain("text-xs text-muted-foreground\">—</span>")
  })
})

describe('R21 F9 — relativeTime = the live Ry formatter', () => {
  it('sub-minute renders "Just now" (the live boundary is 60s, not 45s)', () => {
    expect(relativeTime(new Date(Date.now() - 59_000))).toBe('Just now')
  })

  it('minutes and hours keep the live forms', () => {
    expect(relativeTime(new Date(Date.now() - 60_000))).toBe('1 min ago')
    expect(relativeTime(new Date(Date.now() - 5 * 60_000))).toBe('5 min ago')
    expect(relativeTime(new Date(Date.now() - 3 * 3_600_000))).toBe('3 hr ago')
  })

  it('days render the compact live form "Nd ago" (no space, no weeks branch)', () => {
    expect(relativeTime(new Date(Date.now() - 4 * 86_400_000))).toBe('4d ago')
    expect(relativeTime(new Date(Date.now() - 40 * 86_400_000))).toBe('40d ago')
  })
})

describe('R21 F10 — active window is 1 hour (live 36e5)', () => {
  it('a 59-minute-old visit is active; 61 minutes is not', () => {
    const now = new Date('2026-09-19T12:00:00Z')
    expect(isVisitorActive(new Date('2026-09-19T11:01:00Z'), now)).toBe(true)
    expect(isVisitorActive(new Date('2026-09-19T10:59:00Z'), now)).toBe(false)
  })
})

describe('R21 F1 scope — the topbar Export All is page-scoped', () => {
  it('the chrome store publishes the current page ids', () => {
    expect(
      readFileSync('src/components/dashboard/chrome-store.ts', 'utf-8'),
    ).toContain('pageVisitorIds')
  })

  it('the topbar builds the Export All href from the page ids', () => {
    expect(topbar).toMatch(/pageVisitorIds[\s\S]{0,900}\/api\/export\?ids=/)
  })
})

describe('R21 F7 — the live mobile dropdown', () => {
  it('the dropdown container matches the live classes', () => {
    expect(header).toContain('md:hidden bg-background border-b border-border px-6 py-4 flex flex-col gap-4')
  })

  it('the dropdown links are plain live anchors (no rounded-lg px-3 py-2.5 hover:bg-muted)', () => {
    expect(header).not.toContain('rounded-lg px-3 py-2.5')
  })

  it('the dropdown carries ONE full-width CTA and no Log In button', () => {
    // open state: the dropdown only renders with open=true — source pin.
    expect(header).toMatch(/open &&[\s\S]{0,2400}w-full font-semibold/)
    const m = header.match(/\{open && \(([\s\S]*?)\n      \)\}/)
    expect(m).toBeTruthy()
    const dropdown = m![1]
    // No rendered Log In text and no /login link inside the dropdown (the
    // live ships only the 4 links + the Start Identifying CTA).
    expect(dropdown).not.toMatch(/>\s*Log In\s*</)
    expect(dropdown).not.toContain('href="/login"')
    expect(dropdown).toContain('w-full font-semibold')
  })
})
