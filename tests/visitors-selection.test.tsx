import { afterEach, describe, expect, it, vi } from 'vitest'
import { readFileSync } from 'node:fs'
import { renderToStaticMarkup } from 'react-dom/server'
import { Topbar } from '@/components/dashboard/topbar'
import { publishSelectedVisitorIds } from '@/components/dashboard/chrome-store'
import { VisitorsTable } from '@/components/dashboard/visitors-table'

/**
 * R11 selection UX parity: on the live visitors page, checking rows swaps
 * the topbar Export button to "Export (N)" (gradient sm button, ids-scoped
 * href) and appends an "N selected" text-xs span to the filter row — there
 * is NO separate "Export Selected" button row above the tabs.
 */

vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
  usePathname: () => '/dashboard/visitors',
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}))

vi.mock('next-auth/react', () => ({ signOut: vi.fn() }))

const usage = {
  planName: 'free',
  used: 3,
  limit: 100,
  percent: 3,
  period: 'lifetime' as const,
  overage: 0,
  overageCostLabel: '$0.00',
}

function renderTopbar() {
  return renderToStaticMarkup(
    <Topbar
      email="demo@pixelco.local"
      usage={usage}
      unread={false}
      initialVisitorsCounts={{ individual: 2, company: 1 }}
    />,
  )
}

describe('topbar Export swap (R11 live parity)', () => {
  afterEach(() => publishSelectedVisitorIds([]))

  it('renders Export All with the live gradient sm classes when nothing is selected', () => {
    const html = renderTopbar()
    expect(html).toContain('Export All')
    expect(html).not.toContain('Export (')
    // The live's sm-gradient chrome — R24 F8 renders the full byte tail
    // (variant-free recipe; no hidden/sm:inline-flex — visible on mobile).
    expect(html).toContain(
      'gradient-primary text-primary-foreground shadow-lg glow-primary',
    )
    expect(html).toContain('h-9 rounded-md px-3')
    expect(html).toContain('transition-all duration-300 font-semibold')
    expect(html).not.toContain('sm:inline-flex')
  })

  it('swaps to Export (N) when rows are selected (R24 F8: a real button; the ids scope the click target)', () => {
    publishSelectedVisitorIds(['v1', 'v2'])

    const html = renderTopbar()
    expect(html).toContain('Export (2)')
    expect(html).not.toContain('Export All')
    // R24 F8: the live's Export is a <button> whose click handler navigates
    // — the ids scoping lives in the onClick closure, not a rendered href.
    expect(html).toMatch(/<button[^>]*class="[^"]*gradient-primary/)
    expect(html).not.toContain('<a href="/api/export')
    const source = readFileSync('src/components/dashboard/topbar.tsx', 'utf-8')
    expect(source).toContain('/api/export?ids=${selectedVisitorIds.join(\',\')}')
  })
})

describe('visitors table selection chrome (R11 live parity)', () => {
  it('renders no standalone Export Selected row (the topbar owns the action)', () => {
    const html = renderToStaticMarkup(
      <VisitorsTable
        visitors={[]}
        total={0}
        page={1}
        pageCount={1}
        counts={{ all: 0, individual: 0, company: 0 }}
        filters={{ q: '', type: 'all', confidence: 'all', source: 'all' }}
      />,
    )
    expect(html).not.toContain('Export Selected')
    // The live filter widths: confidence w-44, source w-40. R16: the base
    // carries h-10 (no consumer duplicate — twMerge would displace it);
    // the width lands in the consumer tail.
    expect(html).toMatch(/line-clamp-1 w-44" aria-label="Filter by confidence"/)
    expect(html).toMatch(/line-clamp-1 w-40" aria-label="Filter by source"/)
  })
})
