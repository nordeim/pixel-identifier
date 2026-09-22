import { describe, expect, it, vi } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { PlanPanel } from '@/components/dashboard/plan-panel'

/**
 * R26-F1 pins — the dashboard Pricing & Plan panel's POPULAR badge.
 *
 * Live-verified 2026-09-23 (11th probe generation): the live's Growth card
 * header renders a new-gen Badge (ui/badge.tsx base + default variant)
 * with the gradient-first consumer tail, in BOTH billing states (monthly
 * + annual) and both viewports (1280 + 375):
 *
 *   <div class="flex items-center justify-between">
 *     <h3 class="font-semibold tracking-tight font-display text-lg">Growth</h3>
 *     <div class="inline-flex items-center rounded-full font-semibold transition-colors
 *       focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2
 *       border-transparent bg-primary hover:bg-primary/80 gradient-primary
 *       text-primary-foreground border-0 text-[10px] px-2 py-0.5">POPULAR</div>
 *   </div>
 *
 * The R15 audit pinned "no POPULAR badge" off the old build served during
 * the rolling-deploy window; the current live DOM disproves it (the app
 * bundle hash is unchanged since R20, so the badge was always in the
 * bundle). These pins replace the disproven negative in
 * tests/shell-parity.test.tsx.
 */

// R17-F2 seam: PlanPanel imports the server action — mock the module so
// the render never pulls next-auth/db into the component test.
vi.mock('@/actions/settings', () => ({
  changePlanAction: vi.fn(),
  updateProfileAction: vi.fn(),
  deleteAccountAction: vi.fn(),
}))

const LIVE_BADGE_CLASS =
  'inline-flex items-center rounded-full font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary hover:bg-primary/80 gradient-primary text-primary-foreground border-0 text-[10px] px-2 py-0.5'

function renderPanel() {
  return renderToStaticMarkup(
    <PlanPanel
      currentPlan="free"
      used={1}
      limit={100}
      percent={1}
      period="lifetime"
      overage={0}
      overageCostLabel="$15.00"
    />,
  )
}

/** Slice a plan card out of the panel markup: from its root div (which
 *  PRECEDES the h3 in the DOM) to the next card's root. */
function cardSlice(html: string, name: string): string {
  const h3 = `<h3 class="font-semibold tracking-tight font-display text-lg">${name}</h3>`
  const h3At = html.indexOf(h3)
  expect(h3At).toBeGreaterThan(-1)
  const rootAt = html.lastIndexOf('class="rounded-lg border', h3At)
  expect(rootAt).toBeGreaterThan(-1)
  // walk back to the opening "<div " of the root
  const openAt = html.lastIndexOf('<div ', rootAt)
  const nextRoot = html.indexOf('class="rounded-lg border', h3At)
  const end = nextRoot === -1 ? html.length : html.lastIndexOf('<div ', nextRoot)
  return html.slice(openAt, end)
}

describe('R26 F1 — the pricing POPULAR badge (live-verbatim)', () => {
  const html = renderPanel()

  it('renders exactly one POPULAR badge, on the popular (Growth) card', () => {
    expect(html.match(/>POPULAR</g) ?? []).toHaveLength(1)
    const growth = cardSlice(html, 'Growth')
    expect(growth).toContain('>POPULAR</div>')
  })

  it('rides the new-gen Badge string with the gradient-first consumer tail (byte-exact)', () => {
    const growth = cardSlice(html, 'Growth')
    expect(growth).toContain(`class="${LIVE_BADGE_CLASS}">POPULAR</div>`)
  })

  it('sits in the header row after the h3, on the live structure', () => {
    const growth = cardSlice(html, 'Growth')
    expect(growth).toContain(
      '<div class="flex items-center justify-between"><h3 class="font-semibold tracking-tight font-display text-lg">Growth</h3><div class="inline-flex items-center rounded-full',
    )
  })

  it('keeps the popular card root + top bar (the R15 pins hold)', () => {
    const growth = cardSlice(html, 'Growth')
    expect(growth).toContain(
      'class="rounded-lg border bg-card text-card-foreground relative overflow-hidden transition-all hover:shadow-lg flex flex-col h-full border-primary shadow-md ring-1 ring-primary/20 scale-[1.02]"',
    )
    expect(growth).toContain(
      'class="absolute top-0 left-0 right-0 h-1 gradient-primary"',
    )
  })

  it('renders no badge on the Free / Starter / Scale cards', () => {
    for (const name of ['Free', 'Starter', 'Scale']) {
      const card = cardSlice(html, name)
      expect(card).not.toContain('POPULAR')
      // …and their headers still ship the h3-only justify-between row.
      expect(card).toContain(
        '<div class="flex items-center justify-between"><h3 class="font-semibold tracking-tight font-display text-lg">',
      )
    }
  })
})
