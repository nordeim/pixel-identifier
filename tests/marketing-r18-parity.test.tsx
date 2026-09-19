import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { renderToStaticMarkup } from 'react-dom/server'
import { Hero } from '@/components/marketing/hero'
import { Features, Comparison } from '@/components/marketing/features'
import { PricingSection } from '@/components/marketing/pricing-section'
import { Audience, HowItWorks } from '@/components/marketing/how-it-works'
import { Faq, BottomCta, SiteFooter } from '@/components/marketing/faq-footer'
import { SiteHeader } from '@/components/marketing/site-header'
import { LiveFeedMockup } from '@/components/marketing/live-feed'
import { SocialProof, StatsBar } from '@/components/marketing/social-proof'

/**
 * R18 marketing-bundle realignment pins. The R18 audit
 * (research/round18-audit/) found the live's marketing bundle ships a
 * consistent class-emission order (lucide icons: size → color → margin;
 * paragraphs: text utilities → margins; containers: padding → border)
 * plus real utility/color/structure drifts the R10–R12 pins never
 * covered (they pinned CTAs, kickers and card chrome only):
 *
 *   - pricing subtitle missing max-w-md mx-auto + `•` (U+2022) where the
 *     live ships `·` (U+00B7)
 *   - comparison win checks text-green-600 vs the live's text-accent
 *   - benefits/CTA chips gradient-hero-light vs the live's gradient-hero
 *   - feed avatars span+class vs the live's div + inline background
 *   - hero CTAs flat <a> vs the live's <a class="w-full sm:w-auto"><button>
 *   - header container max-w-7xl vs the live's container; wordmark lockup
 *     on the <a>; nav gap-7; PNG logo asset
 *   - footer wordmark carries tracking-tight the live's footer lacks
 *
 * Class-string parity target: the live's exact emission orders, with the
 * clone's invisible machinery (data-reveal attrs, feed-row hook,
 * focus-brand rings, aria-labels) documented as appended chrome (D5).
 */

const hero = renderToStaticMarkup(<Hero />)
const features = renderToStaticMarkup(<Features />)
const comparison = renderToStaticMarkup(<Comparison />)
const pricing = renderToStaticMarkup(<PricingSection />)
const _audience = renderToStaticMarkup(<Audience />)
const process = renderToStaticMarkup(<HowItWorks />)
const _faq = renderToStaticMarkup(<Faq />)
const cta = renderToStaticMarkup(<BottomCta />)
const footer = renderToStaticMarkup(<SiteFooter />)
const header = renderToStaticMarkup(<SiteHeader />)
const feed = renderToStaticMarkup(<LiveFeedMockup />)
const social = renderToStaticMarkup(<SocialProof />)
const stats = renderToStaticMarkup(<StatsBar />)

describe('R18 B1 — pricing subtitle (max-w-md mx-auto + middle dots)', () => {
  it('renders the live subtitle classes and U+00B7 separators', () => {
    expect(pricing).toContain(
      'class="text-muted-foreground mt-3 max-w-md mx-auto"',
    )
    expect(pricing).toContain(
      'No credit card required · Cancel anytime · Results in minutes',
    )
    // the clone's old bullet form is gone
    expect(pricing).not.toContain('No credit card required •')
  })
})

describe('R18 B2 — comparison win list (text-accent, div pill, live orders)', () => {
  it('renders the win checks with the live text-accent + order', () => {
    expect(comparison).toContain('class="lucide lucide-check w-4 h-4 text-accent shrink-0"')
    expect(comparison).not.toContain('text-green-600')
  })

  it('renders the win items without font-medium and the X icons in the live order', () => {
    expect(comparison).toContain('class="flex items-center gap-2.5 text-sm text-foreground"')
    expect(comparison).not.toContain('gap-2.5 text-sm font-medium text-foreground')
    expect(comparison).toContain('class="lucide lucide-x w-4 h-4 text-destructive shrink-0"')
  })

  it('renders the BEST VALUE pill as a div with the live classes', () => {
    expect(comparison).toContain(
      '<div class="absolute -top-3 left-6 px-3 py-0.5 rounded-full gradient-cta text-xs font-semibold text-primary-foreground">BEST VALUE</div>',
    )
  })
})

describe('R18 B3 — icon chips + CTA banner (gradient-hero, div chips)', () => {
  it('renders the benefits chips as divs with the live order', () => {
    expect(features).toContain(
      '<div class="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center shrink-0">',
    )
    expect(features).not.toMatch(/<span[^>]*w-9 h-9 rounded-lg/)
  })

  it('renders the how-it-works step chips with gradient-hero and the live order', () => {
    expect(process).toContain(
      'class="w-10 h-10 rounded-lg gradient-hero flex items-center justify-center mb-4"',
    )
    expect(process).not.toContain('gradient-hero-light')
  })

  it('renders the CTA banner with gradient-hero and the live container order', () => {
    expect(cta).toContain(
      'class="relative max-w-4xl mx-auto rounded-2xl gradient-hero p-6 sm:p-10 md:p-14 text-center overflow-hidden"',
    )
    expect(cta).not.toContain('gradient-hero-light')
  })
})

describe('R18 B4 — icon class orders (size → color → margin)', () => {
  it('hero trust icons render in the live order', () => {
    expect(hero).toContain('class="lucide lucide-circle-check-big w-4 h-4 text-primary"')
    expect(hero).toContain('class="lucide lucide-chart-column w-4 h-4 text-primary"')
    expect(hero).toContain('class="lucide lucide-zap w-4 h-4 text-highlight"')
  })

  it('pricing feature checks render in the live order', () => {
    expect(pricing).toContain('class="lucide lucide-check w-4 h-4 text-accent shrink-0 mt-0.5"')
    expect(pricing).not.toContain('mt-0.5 h-4 w-4 shrink-0 text-accent')
  })

  it('pricing card CTAs render the live tail order', () => {
    expect(pricing).toContain(
      'bg-primary hover:bg-primary/90 h-10 px-4 py-2 w-full mb-5 font-semibold gradient-cta text-primary-foreground border-0 hover:opacity-90',
    )
  })

  it('section heading/stat orders match the live', () => {
    expect(social).toContain('class="lucide lucide-star w-4 h-4 fill-primary text-primary"')
    expect(process).toContain('class="font-bold text-foreground mb-1.5"')
    expect(process).not.toContain('mb-1.5 font-bold text-foreground')
    expect(stats).toContain(
      'class="text-3xl sm:text-4xl font-extrabold text-gradient-hero mb-1"',
    )
    expect(stats).not.toContain('mb-1 text-gradient-hero text-3xl font-extrabold')
    // the benefits grid: gap-14 (the live), not gap-12
    expect(features).toContain('class="grid lg:grid-cols-2 gap-14 items-center"')
    expect(features).not.toContain('gap-12')
  })
})

describe('R18 B5 — feed widget (div avatars + inline background, live orders)', () => {
  /** R19-F2: the widget now runs the live's PHASE machine
   * (enter→scan→reveal→done). The static render is the t=0 enter state —
   * every row anonymous (muted avatar + User + label). The reveal-state
   * markup (primary avatar + Mail + email + ✓ Identified) renders at
   * runtime; those strings are pinned at SOURCE level in
   * marketing-r19-parity.test.tsx. */
  // NB: a local `process` const below shadows the global, so the path is
  // relative to the vitest cwd (project root) — no process.cwd() here.
  const feedSrc = readFileSync('src/components/marketing/live-feed.tsx', 'utf8')

  it('renders the avatar as a div with the inline background (phase-colored)', () => {
    expect(feed).toContain(
      'class="feed-avatar w-8 h-8 rounded-full flex items-center justify-center shrink-0"',
    )
    // static t=0: all muted; the reveal flips to primary at runtime
    expect(feed).toContain('style="background-color:var(--muted)"')
    expect(feedSrc).toContain("backgroundColor: revealed ? 'var(--primary)' : 'var(--muted)'")
    expect(feed).toContain('class="lucide lucide-user w-4 h-4 text-muted-foreground"')
    // the old span + gradient-primary construction is gone
    expect(feed).not.toContain('gradient-primary flex h-8 w-8 shrink-0 items-center')
  })

  it('renders the anonymous avatar with the inline muted background', () => {
    expect(feed).toContain('style="background-color:var(--muted)"')
    expect(feed).not.toContain('rounded-full bg-muted"')
  })

  it('renders the rows in the live order (px-4 py-3 before the border chain)', () => {
    expect(feed).toContain(
      'feed-row flex items-center gap-3 px-4 py-3 rounded-lg bg-card/80 border border-border backdrop-blur-sm',
    )
    expect(feed).not.toContain('gap-3 rounded-lg border border-border bg-card/80 px-4 py-3')
  })

  it('renders names/sublabels/cards in the live orders', () => {
    // R19-F2: the email sub-label pair renders at the reveal phase — its
    // class strings are source-pinned; the static t=0 rows carry the
    // anonymous pair below.
    expect(feed).toContain('class="text-sm font-medium text-muted-foreground">Anonymous Visitor')
    expect(feed).toContain('class="text-sm font-medium text-muted-foreground">Unknown User')
    expect(feed).toContain('class="text-sm font-medium text-muted-foreground">Site Visitor')
    expect(feed).toContain('class="text-xs text-muted-foreground/60">Browsing your site…')
    expect(feedSrc).toContain('className="text-sm font-semibold text-foreground"')
    expect(feedSrc).toContain('className="text-xs text-primary font-medium">✓ Identified')
    expect(feed).not.toContain('truncate text-sm font-semibold')
    expect(feed).toContain('class="flex-1 min-w-0"')
    expect(feed).toContain(
      'class="px-4 py-3 border-b border-border flex items-center justify-between bg-card"',
    )
    expect(feed).toContain('class="px-4 py-3 border-t border-border bg-card/50"')
    expect(feed).toContain('class="w-2 h-2 rounded-full bg-primary animate-pulse"')
    expect(feed).toContain('class="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-1"')
    expect(feed).toContain('class="text-xs text-muted-foreground mt-0.5"')
    expect(feed).toContain('class="w-full h-1.5 rounded-full bg-muted overflow-hidden"')
    expect(feed).toContain('class="h-full rounded-full bg-primary"')
    // the match-rate bar width rides an inline style (the live's pattern)
    expect(feed).toMatch(/style="width:20%"/)
    // the stat-strip zap carries NO color class on the live
    expect(feed).not.toContain('text-amber-500')
  })
})

describe('R18 B6 — hero CTAs (a > button structure, live tail order)', () => {
  it('wraps both CTAs in w-full sm:w-auto anchors around real buttons', () => {
    expect(hero).toMatch(/<a[^>]*class="w-full sm:w-auto"[^>]*href="\/signup">/)
    expect(hero).toContain('</button></a>')
  })

  it('renders the primary CTA with the live tail (no py-2 fragment)', () => {
    expect(hero).toContain(
      'bg-primary hover:bg-primary/90 rounded-md w-full sm:w-auto gradient-cta text-primary-foreground border-0 hover:opacity-90 px-7 h-12 text-base font-semibold',
    )
    expect(hero).not.toContain('py-2 gradient-cta')
  })

  it('renders the secondary CTA with the live tail', () => {
    expect(hero).toContain(
      'border bg-background hover:text-accent-foreground rounded-md w-full sm:w-auto h-12 text-base px-7 border-border text-foreground hover:bg-card font-medium',
    )
    expect(hero).toContain('>See Live Demo</button>')
  })
})

describe('R18 B7 — header chrome (container, a-wordmark, gap-7, PNG logo)', () => {
  it('renders the live container (container utility, h-16 px-6)', () => {
    expect(header).toContain(
      'class="container mx-auto flex items-center justify-between h-16 px-6"',
    )
    expect(header).not.toContain('max-w-7xl items-center justify-between gap-4')
  })

  it('puts the lockup classes on the anchor and ships the PNG logo', () => {
    expect(header).toMatch(/<a[^>]*class="flex items-center gap-2\.5[^"]*"[^>]*href="\/">/)
    expect(header).toContain('src="/assets/logo-BxfT-ZTZ.png"')
    expect(header).toContain('class="w-8 h-8"')
    expect(header).toContain('class="text-lg font-bold text-foreground tracking-tight"')
    expect(header).not.toMatch(/<span[^>]*inline-flex items-center gap-2\.5/)
  })

  it('renders the nav with gap-7 and the live link order', () => {
    expect(header).toContain('class="hidden md:flex items-center gap-7"')
    expect(header).not.toContain('items-center gap-8')
    expect(header).toContain(
      'text-sm font-medium text-muted-foreground hover:text-foreground transition-colors',
    )
  })

  it('wraps the CTAs as anchor-around-button with the live strings', () => {
    expect(header).toMatch(/<a[^>]*href="\/login"[^>]*>\s*<button/)
    expect(header).toContain(
      'hover:bg-accent hover:text-accent-foreground h-9 rounded-md px-3 text-muted-foreground font-medium">Log In</button>',
    )
    expect(header).toContain(
      'bg-primary hover:bg-primary/90 h-9 rounded-md px-3 gradient-cta text-primary-foreground border-0 hover:opacity-90 font-semibold">Start Identifying</button>',
    )
  })
})

describe('R18 B8 — footer wordmark (no tracking-tight, PNG logo, live orders)', () => {
  it('renders the footer lockup on the anchor without tracking-tight', () => {
    expect(footer).toMatch(
      /<a[^>]*class="flex items-center gap-2 mb-4[^"]*"[^>]*href="\/">/,
    )
    expect(footer).toContain('<span class="text-lg font-bold text-foreground">Pixelco</span>')
    expect(footer).not.toContain('text-foreground tracking-tight">Pixelco</span>')
  })

  it('ships the PNG logo at the live order', () => {
    expect(footer).toContain('src="/assets/logo-BxfT-ZTZ.png"')
    expect(footer).toContain('class="w-8 h-8"')
  })
})

describe('R18 B10 — stat labels (font-medium, the live — not semibold)', () => {
  it('renders the stat kicker labels with font-medium in the live order', () => {
    expect(stats).toContain(
      'class="text-xs text-muted-foreground font-medium uppercase tracking-wider"',
    )
    expect(stats).not.toContain('font-semibold uppercase tracking-wider')
  })
})

describe('R18 B11 — CTA banner button + trust row (live structures)', () => {
  it('wraps the CTA in a bare anchor around a variant-free button', () => {
    expect(cta).toMatch(/<a[^>]*href="\/signup">\s*<button/)
    expect(cta).toContain(
      'rounded-md bg-background text-foreground hover:bg-background/90 border-0 h-12 px-8 text-base font-semibold w-full sm:w-auto',
    )
    expect(cta).toContain('class="lucide lucide-arrow-right w-4 h-4 ml-2"')
  })

  it('renders the trust row with a Shield on the third item', () => {
    expect(cta).toContain('class="lucide lucide-circle-check-big w-3.5 h-3.5"')
    expect(cta).toContain('class="lucide lucide-shield w-3.5 h-3.5"')
    expect(cta).not.toMatch(/<span[^>]*>\s*<svg[^>]*lucide-shield[^>]*>.*GDPR.*circle-check/)
  })

  it('renders the how-it-works step texts in the live order', () => {
    expect(process).toContain('class="text-sm text-muted-foreground leading-relaxed"')
    expect(process).not.toContain('text-sm leading-relaxed text-muted-foreground')
  })

  it('emits the B2B building icon with lucide double-name classes', () => {
    expect(features).toContain('class="lucide lucide-building2 lucide-building-2 w-4.5 h-4.5 text-primary"')
  })

  it('replicates the live data-URI zap img in the feed stat strip', () => {
    // renderToStaticMarkup escapes the single quotes in the data URI.
    expect(feed).toContain('src="data:image/svg+xml,%3Csvg xmlns=&#x27;http://www.w3.org/2000/svg&#x27;')
    expect(feed).toContain('stroke=&#x27;%23eab308&#x27;')
    expect(feed).toContain('alt="" class="w-4 h-4"')
  })
})
