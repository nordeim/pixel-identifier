import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { Comparison } from '@/components/marketing/features'
import { BottomCta, SiteFooter } from '@/components/marketing/faq-footer'

/**
 * R10-F6 / R10-F8 / R10-F11 regression tests, extracted verbatim from the
 * live DOM —
 *
 * Comparison: section `py-20 bg-card border-y border-border` + inner
 * `container mx-auto px-6`; grid `max-w-4xl mx-auto grid md:grid-cols-2
 * gap-6`; left card `rounded-xl border border-border bg-background p-7`;
 * right card `rounded-xl border-2 border-primary bg-background p-7 relative
 * shadow-elevated` (WHITE bg, not the amber tint); badge
 * `absolute -top-3 left-6 px-3 py-0.5 rounded-full gradient-cta text-xs
 * font-semibold` (left-anchored); headings are real h3s
 * (`font-bold text-foreground mb-1`); right sub copy reads "Individual
 * email identification"; list rows `flex items-center gap-2.5` with
 * text-destructive X icons.
 *
 * BottomCta: card `relative max-w-4xl mx-auto rounded-2xl gradient-hero
 * p-6 sm:p-10 md:p-14 text-center overflow-hidden` + radial overlay +
 * `relative z-10` inner; paragraph `text-white/80 text-base sm:text-lg
 * max-w-xl mx-auto mb-8`; button `bg-background … h-12 px-8 text-base
 * font-semibold w-full sm:w-auto`; trust row
 * `flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6
 * mt-6 text-white/70 text-xs` with three `flex items-center gap-1.5` spans
 * (CircleCheckBig w-3.5): "No credit card required", "100 free
 * identifications", "GDPR compliant".
 *
 * SiteFooter: `<footer class="mt-20">` → inner `border-t border-border
 * bg-background` → `container mx-auto px-6 py-14` → grid
 * `grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-10`.
 */

const comparison = renderToStaticMarkup(<Comparison />)
const cta = renderToStaticMarkup(<BottomCta />)
const footer = renderToStaticMarkup(<SiteFooter />)

describe('Comparison (R10-F6 live DOM parity)', () => {
  it('ships the live section structure (full tints, container inner, max-w-4xl grid)', () => {
    expect(comparison).toContain('py-20 bg-card border-y border-border')
    expect(comparison).toContain('container mx-auto px-6')
    expect(comparison).toContain('max-w-4xl mx-auto grid md:grid-cols-2 gap-6')
    expect(comparison).not.toContain('bg-card/50')
    expect(comparison).not.toContain('border-border/60')
    expect(comparison).not.toContain('max-w-5xl')
  })

  it('renders the live card anatomy (bg-background, left bordered / right border-2 elevated)', () => {
    expect(comparison).toContain('rounded-xl border border-border bg-background p-7')
    expect(comparison).toContain('rounded-xl border-2 border-primary bg-background p-7 relative shadow-elevated')
    expect(comparison).not.toContain('bg-primary/5')
    expect(comparison).not.toContain('shadow-lg shadow-primary/10')
  })

  it('renders the left-anchored gradient badge and real h3 headings', () => {
    expect(comparison).toContain('absolute -top-3 left-6 px-3 py-0.5 rounded-full gradient-cta text-xs font-semibold')
    // R10: the live badge copy is literal caps (no uppercase utility).
    expect(comparison).toContain('>BEST VALUE<')
    expect(comparison).not.toContain('-translate-x-1/2')
    expect(comparison).toContain('<h3 class="font-bold text-foreground mb-1">Traditional IP-Lookup Tools</h3>')
    expect(comparison).toContain('<h3 class="font-bold text-foreground mb-1">Pixelco</h3>')
    expect(comparison).not.toContain('uppercase')
  })

  it('renders the live copy and list anatomy', () => {
    expect(comparison).toContain('Individual email identification')
    expect(comparison).not.toContain('Individual-level identification')
    expect(comparison).toContain('flex items-center gap-2.5')
    expect(comparison).toContain('text-sm text-muted-foreground mb-5')
  })

  it('keeps the live h2 typography', () => {
    expect(comparison).toContain('text-3xl sm:text-4xl font-bold')
    expect(comparison).not.toContain('font-extrabold')
  })
})

describe('BottomCta (R10-F8 live DOM parity)', () => {
  it('ships the live card + radial overlay + z-10 inner', () => {
    // R18: the live's CTA card rides the FULL gradient-hero (the light
    // variant was a clone-authored approximation) with its emission order.
    expect(cta).toContain('relative max-w-4xl mx-auto rounded-2xl gradient-hero p-6 sm:p-10 md:p-14 text-center overflow-hidden')
    expect(cta).toContain('bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent_60%)]')
    expect(cta).toContain('relative z-10')
  })

  it('renders the live paragraph rhythm and white button', () => {
    expect(cta).toContain('text-white/80 text-base sm:text-lg max-w-xl mx-auto mb-8')
    expect(cta).toContain('bg-background')
    expect(cta).toContain('w-full sm:w-auto')
    expect(cta).not.toContain('shadow-lg')
  })

  it('renders the live trust row (three check spans, GDPR compliant)', () => {
    expect(cta).toContain('flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 mt-6 text-white/70 text-xs')
    expect(cta).toContain('No credit card required')
    expect(cta).toContain('100 free identifications')
    expect(cta).toContain('GDPR compliant')
    expect(cta).not.toContain('Setup in 30 seconds')
  })
})

describe('SiteFooter (R10-F11 live DOM parity)', () => {
  it('ships the live footer chrome (mt-20 wrapper, bg-background band, container py-14)', () => {
    expect(footer).toContain('mt-20')
    expect(footer).toContain('border-t border-border bg-background')
    expect(footer).toContain('container mx-auto px-6 py-14')
    // The old single-band footer used a /60 border tint and one bg-card band.
    expect(footer).not.toContain('border-border/60')
  })

  it('renders the live column grid and the tinted bottom bar band', () => {
    expect(footer).toContain('grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-10')
    expect(footer).toContain('col-span-2')
    expect(footer).toContain('border-t border-border bg-card/50')
    expect(footer).toContain('container mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3')
  })

  it('renders the wordmark with "By Ai Viral" inline beside Pixelco (R10)', () => {
    // The live lockup: logo + Pixelco + By Ai Viral as flex-row siblings.
    // R18: the live's FOOTER wordmark carries no tracking-tight (only the
    // header's does) and the subtext rides the live's order with the
    // clone's font-script utility (D5) appended.
    expect(footer).toContain('text-lg font-bold text-foreground">Pixelco</span>')
    expect(footer).toContain('text-xs text-muted-foreground italic translate-y-[3px] font-script')
    expect(footer).not.toContain('flex flex-col leading-none')
  })
})
