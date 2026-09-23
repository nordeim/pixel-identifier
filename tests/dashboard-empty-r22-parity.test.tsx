import { describe, expect, it, vi } from 'vitest'
import { readFileSync } from 'node:fs'
import { renderToStaticMarkup } from 'react-dom/server'
import { VisitorsTable } from '@/components/dashboard/visitors-table'
import { DomainsPanel } from '@/components/dashboard/domains-panel'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => '/dashboard/visitors',
}))
vi.mock('next-auth/react', () => ({ signOut: vi.fn() }))

/**
 * R22 first-run/empty-state parity pins (plan:
 * docs/plans/2026-09-19-round22-firstrun-activity-parity.md).
 *
 * Evidence base: the live's app bundle (empty branches decoded) + runtime
 * confirmation on the live visitors page (no-match search → the "identified
 * yet" message with the table REPLACED by the p).
 */

const visitorsTable = readFileSync('src/components/dashboard/visitors-table.tsx', 'utf-8')
const dashboardPage = readFileSync('src/app/dashboard/page.tsx', 'utf-8')
const _domainsPanel = readFileSync('src/components/dashboard/domains-panel.tsx', 'utf-8')
const installPage = readFileSync('src/app/dashboard/install/page.tsx', 'utf-8')

function renderTable(overrides: Record<string, unknown> = {}) {
  return renderToStaticMarkup(
    <VisitorsTable
      visitors={[]}
      total={0}
      page={1}
      pageCount={1}
      counts={{ all: 0, individual: 0, company: 0 }}
      filters={{ q: '', type: 'all', confidence: 'all', source: 'all' }}
      {...overrides}
    />,
  )
}

describe('R22 F1 — visitors empty state (the live branch)', () => {
  it('renders the empty p REPLACING the table when the filtered total is 0', () => {
    const html = renderTable()
    expect(html).toContain(
      'class="text-sm text-muted-foreground py-12 text-center"',
    )
    expect(html).toContain(
      'No visitors identified yet. Install your pixel to get started.',
    )
    expect(html).not.toContain('<table')
    expect(html).not.toContain('<td')
  })

  it('switches to the filter message when the total is non-zero but the page is empty', () => {
    const html = renderTable({ total: 14, counts: { all: 14, individual: 12, company: 2 } })
    expect(html).toContain('No visitors match your filters.')
    expect(html).not.toContain('No visitors identified yet.')
  })

  it('retires the old clone-authored strings', () => {
    expect(visitorsTable).not.toContain('No visitors yet.')
    expect(visitorsTable).not.toContain('match the current filters')
  })
})

describe('R22 F10 — visitors search placeholder varies by tab', () => {
  it('b2b tab renders "Search companies..."', () => {
    const html = renderTable({ filters: { q: '', type: 'company', confidence: 'all', source: 'all' } })
    expect(html).toContain('placeholder="Search companies..."')
  })

  it('other tabs render "Search emails, companies..."', () => {
    const html = renderTable({ filters: { q: '', type: 'all', confidence: 'all', source: 'all' } })
    expect(html).toContain('placeholder="Search emails, companies..."')
    const b2c = renderTable({ filters: { q: '', type: 'individual', confidence: 'all', source: 'all' } })
    expect(b2c).toContain('placeholder="Search emails, companies..."')
  })
})

describe('R22 F3/F5 — dashboard empty orders (top pages py-8, text-first)', () => {
  it('Top Pages empty renders py-8 with "No page data yet"', () => {
    expect(dashboardPage).toContain("py-8")
    expect(dashboardPage).toContain('No page data yet')
    // the live's emission order is text-utility-first
    expect(dashboardPage).toContain(
      'className="text-sm text-muted-foreground py-8 text-center"',
    )
  })

  it('Recent Identifications empty ships the live text-first order', () => {
    expect(dashboardPage).toContain(
      'className="text-sm text-muted-foreground py-12 text-center"',
    )
    expect(dashboardPage).toContain('No identifications yet. Install your pixel to get started.')
  })
})

describe('R22 F4 — domains empty state (direct div in the p-0 card)', () => {
  const emptyDomains = renderToStaticMarkup(<DomainsPanel domains={[]} />)

  it('renders the live div (text-center first) with the pinned string', () => {
    expect(emptyDomains).toContain(
      'class="text-center py-12 text-sm text-muted-foreground"',
    )
    expect(emptyDomains).toContain('No domains yet. Add one above to get started.')
  })

  it('keeps the p-0 card content (no padded CardContent wrapper)', () => {
    expect(emptyDomains).toContain('class="p-0"')
    expect(emptyDomains).not.toContain('py-12 text-center p-6')
    // the empty branch is a div, not a p
    expect(emptyDomains).toContain('<div class="text-center py-12 text-sm text-muted-foreground">')
  })
})

describe('R22 F7 — install page zero-domain branch (the live interstitial)', () => {
  it('renders the live zero-sites header copy', () => {
    expect(installPage).toContain('Add a domain first to get your tracking snippet.')
    expect(installPage).toContain(
      'You need to register a domain before installing the pixel.',
    )
  })

  it('renders the live card + hero CTA structure (not a custom icon card)', () => {
    // the live: CardContent "pt-6 text-center py-12" + p mb-4 + hero asChild link
    expect(installPage).toContain('pt-6 text-center py-12')
    expect(installPage).toContain('text-sm text-muted-foreground mb-4')
    expect(installPage).toContain('<Link href="/dashboard/domains">Add a Domain</Link>')
    // the clone-authored interstitial is retired
    expect(installPage).not.toContain('Add a domain first</h2>')
    expect(installPage).not.toContain('Go to Domains')
  })

  it('renders the domain switcher only when multiple sites exist', () => {
    // R30-F3: the switcher gate moved into the client island — repointed.
    const island = readFileSync(
      'src/components/dashboard/install-panels.tsx',
      'utf-8',
    )
    expect(island).toMatch(/sites\.length > 1|domains={sites\.length > 1/)
  })
})

describe('R22 F7c — install copy button (Copied! + uncolored check)', () => {
  const copyButton = readFileSync('src/components/dashboard/copy-button.tsx', 'utf-8')

  it('uses the live "Copied!" label', () => {
    expect(copyButton).toContain('Copied!')
    expect(copyButton).not.toContain('Copied\n')
  })

  it('ships no color on the check glyph (the live has none here)', () => {
    expect(copyButton).not.toContain('text-neon-green')
  })
})
