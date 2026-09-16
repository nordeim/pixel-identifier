import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { Audience, HowItWorks } from '@/components/marketing/how-it-works'

/**
 * R10-F5 / R10-F7 regression tests, extracted verbatim from the live DOM —
 *
 * Audience: full-bleed section `py-20 border-t border-border` with a
 * `container mx-auto px-6` inner; header `text-center mb-14`; grid
 * `grid sm:grid-cols-3 lg:grid-cols-5 gap-4 max-w-5xl mx-auto`; cards
 * `bg-card rounded-xl border border-border p-5 text-center shadow-card
 * hover:shadow-elevated transition-shadow`; icon chips
 * `w-10 h-10 rounded-lg bg-secondary … mx-auto mb-3` with `w-5 h-5
 * text-primary` icons; h3 `font-semibold text-sm text-foreground mb-1`.
 *
 * Process: section `py-20 bg-card border-y border-border` (full tints);
 * cards `relative bg-background rounded-xl border border-border p-6
 * shadow-card`; icon boxes `w-10 h-10 rounded-lg gradient-hero-light` (the
 * marketing yellow 3-stop gradient); grid `grid sm:grid-cols-2
 * lg:grid-cols-4 gap-6 max-w-5xl mx-auto`; the feature points are plain
 * `flex items-center gap-2` rows with a `w-2 h-2 rounded-full bg-accent`
 * yellow dot — NOT bordered pills.
 */

const audience = renderToStaticMarkup(<Audience />)
const process = renderToStaticMarkup(<HowItWorks />)

describe('Audience (R10-F7 live DOM parity)', () => {
  it('ships the live section structure (border-t, flat py-20, container inner)', () => {
    expect(audience).toContain('py-20 border-t border-border')
    expect(audience).toContain('container mx-auto px-6')
    // The old pattern put max-w-7xl + padding directly on the section.
    expect(audience).not.toMatch(/<section[^>]*max-w-7xl/)
  })

  it('renders the live grid geometry and card chrome', () => {
    expect(audience).toContain('grid sm:grid-cols-3 lg:grid-cols-5 gap-4 max-w-5xl mx-auto')
    expect(audience).toContain('shadow-card hover:shadow-elevated transition-shadow')
    expect(audience).not.toContain('shadow-sm')
    expect(audience).toContain('text-center mb-14')
  })

  it('renders the live icon chips (40px, rounded-lg, bg-secondary)', () => {
    expect(audience).toContain('w-10 h-10 rounded-lg bg-secondary')
    expect(audience).toContain('mx-auto mb-3')
    expect(audience).toContain('w-5 h-5 text-primary')
    expect(audience).not.toContain('rounded-full bg-primary/15')
  })

  it('renders the live card text anatomy', () => {
    expect(audience).toContain('font-semibold text-sm text-foreground mb-1')
    expect(audience).toContain('text-xs text-muted-foreground leading-relaxed')
    // R10: the live descriptions carry no trailing periods.
    expect(audience).toContain('Know which companies are evaluating your product<')
    expect(audience).not.toContain('evaluating your product.')
  })

  it('keeps the live kicker/h2 typography', () => {
    expect(audience).toContain('text-xs font-semibold text-primary uppercase tracking-widest')
    expect(audience).not.toContain('font-extrabold')
  })
})

describe('HowItWorks / process (R10-F5 live DOM parity)', () => {
  it('ships the live section chrome (full bg-card, full border, flat py-20)', () => {
    expect(process).toContain('py-20 bg-card border-y border-border')
    expect(process).not.toContain('bg-card/50')
    expect(process).not.toContain('border-border/60')
    expect(process).toContain('container mx-auto px-6')
  })

  it('renders the live card anatomy (bg-background, shadow-card)', () => {
    expect(process).toContain('relative bg-background rounded-xl border border-border p-6 shadow-card')
    expect(process).not.toContain('shadow-sm')
  })

  it('renders the live grid geometry', () => {
    expect(process).toContain('grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto')
  })

  it('renders the feature points as yellow-dot rows, not pills', () => {
    expect(process).toContain('flex items-center gap-2')
    expect(process).toContain('w-2 h-2 rounded-full bg-accent')
    expect(process).not.toContain('rounded-full border border-border bg-background px-4')
  })

  it('keeps the live kicker/h2 typography', () => {
    expect(process).toContain('text-xs font-semibold text-primary uppercase tracking-widest')
    expect(process).toContain('text-3xl sm:text-4xl font-bold mt-2 text-foreground')
    // The step cards' faint background numbers stay font-extrabold (R7-V8
    // live-verified) — only the section h2 must drop the extrabold weight.
    expect(process).not.toMatch(/<h2[^>]*font-extrabold/)
  })
})
