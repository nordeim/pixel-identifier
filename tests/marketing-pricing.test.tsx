import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { PricingSection } from '@/components/marketing/pricing-section'

/**
 * R10-F4 regression test: the live marketing pricing section — extracted
 * verbatim from a fresh (no-interaction) page load —
 *
 *   - DEFAULTS TO ANNUAL: the toggle is an iOS switch (`button` with
 *     `relative w-14 h-7 rounded-full bg-primary` + knob
 *     `absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white shadow
 *     translate-x-7`, aria-label "Toggle annual pricing") sitting between
 *     "Monthly" (muted) and "Annual" + `Save 20%` (text-accent) labels in
 *     `flex items-center justify-center gap-3 mt-8`. Default prices are the
 *     floored annual table ($63/$199/$639).
 *   - Free card CTA is SECONDARY-styled (bg-secondary) with the text
 *     "Free Tier" — no gradient, no arrow. Growth keeps the gradient CTA
 *     ("Get Started"); all others are secondary "Get Started".
 *   - Base cards: `relative rounded-xl p-7 border border-border shadow-card
 *     bg-card` (p-7 + shadow-card, no flex-col). Growth card:
 *     `border-2 border-primary shadow-elevated bg-background p-7` + the
 *     POPULAR pill (left-anchored? no — centered on live too).
 */

const html = renderToStaticMarkup(<PricingSection />)

describe('PricingSection (R10-F4 live DOM parity)', () => {
  it('defaults to annual pricing (floored $63/$199/$639 render on first paint)', () => {
    expect(html).toContain('$63')
    expect(html).toContain('$199')
    expect(html).toContain('$639')
    expect(html).not.toContain('$79')
    expect(html).not.toContain('$249')
    expect(html).not.toContain('$799')
    expect(html).toContain('billed annually')
  })

  it('renders the live iOS switch toggle with the Save 20% label', () => {
    expect(html).toContain('w-14 h-7 rounded-full')
    expect(html).toContain('absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white shadow')
    expect(html).toContain('translate-x-7')
    expect(html).toContain('aria-label="Toggle annual pricing"')
    expect(html).toContain('flex items-center justify-center gap-3 mt-8')
    expect(html).toContain('Save 20%')
    expect(html).toContain('text-accent')
    // The old segmented pill control is gone.
    expect(html).not.toContain('inline-flex items-center rounded-full border border-border bg-card p-1')
  })

  it('renders the live card chrome (p-7, shadow-card, no flex-col)', () => {
    expect(html).toContain('relative rounded-xl p-7 border border-border shadow-card bg-card')
    expect(html).toContain('border-2 border-primary shadow-elevated bg-background')
    expect(html).not.toContain('flex flex-col')
    expect(html).not.toContain('p-6 shadow-sm')
  })

  it('renders the live CTA matrix (Free = secondary "Free Tier"; Growth = gradient + Zap)', () => {
    expect(html).toContain('>Free Tier<')
    // The Growth CTA leads with a Zap and carries NO trailing arrow.
    const growthCard = html.slice(html.indexOf('>Growth<'), html.indexOf('>Scale<'))
    expect(growthCard).toContain('gradient-cta')
    expect(growthCard).toContain('lucide lucide-zap mr-1.5 h-4 w-4')
    expect(growthCard.indexOf('lucide-zap')).toBeLessThan(growthCard.indexOf('>Get Started<'))
    expect(growthCard).not.toContain('lucide-arrow-right')
    // The Free CTA is secondary-styled with a trailing arrow, not the
    // gradient — and the $0 price carries no "/mo" suffix on the live.
    const freeCard = html.slice(html.indexOf('>Free<'), html.indexOf('>Starter<'))
    expect(freeCard).toContain('bg-secondary')
    expect(freeCard).not.toContain('gradient-cta')
    expect(freeCard).toContain('lucide-arrow-right')
    expect(freeCard).not.toContain('/mo')
  })

  it('keeps the live kicker/h2 typography', () => {
    expect(html).toContain('text-xs font-semibold text-primary uppercase tracking-widest')
    // The live's section h2 is font-bold (the price values stay
    // font-extrabold, so the negative is scoped to the h2 class string).
    expect(html).toContain('text-3xl sm:text-4xl font-bold mt-2 text-foreground')
    expect(html).not.toMatch(/<h2[^>]*font-extrabold/)
  })
})
