import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { Hero } from '@/components/marketing/hero'
import { SocialProof, StatsBar } from '@/components/marketing/social-proof'
import { Audience, HowItWorks } from '@/components/marketing/how-it-works'
import { Features, Comparison } from '@/components/marketing/features'
import { PricingSection } from '@/components/marketing/pricing-section'

/**
 * R12-F1 regression test: the live animates 39 marketing elements in with
 * inline `opacity: 0; transform: translateY(Npx)` → `opacity: 1; transform:
 * none` on viewport entry (once), staggered ~100 ms between siblings.
 * Ground truth (research/round12-audit — reveal-element map + timing
 * samples + the hero's persistent post-animation inline styles):
 *
 *   hero (mount):  badge y20 d0 · h1 y20 d100 · p y20 d200 · pills y20
 *                  d300 · avatar row y20 d400 · CTA row y20 d500 ·
 *                  takes-line y0 d600 (fade-only — the live's copy keeps
 *                  `opacity: 1;` with no transform) · feed column y20 d200
 *   marquee:       track y12 d0 · 3 testimonial cards y20 d100/200/300
 *   stats:         4 stat cards y16 d0/100/200/300
 *   audience:      header y16 d0 · 5 cards y20 d100..500
 *   process:       header y16 d0 · 4 steps y24 d100..400 · tags y16 d500
 *   benefits:      header y16 d0 · 6 items y16 d100..600 · shot y0 d300
 *   compare:       header y16 d0 · grid y20 d100
 *   pricing:       header y16 d0 · 4 cards y24 d100..400
 *   faq:           header y16 d0 · list wrapper y16 d100
 *   cta:           card y24 d0
 *
 * The clone implements this as `data-reveal="<y>"` + `data-reveal-delay`
 * attributes consumed by ONE shared IntersectionObserver client island
 * (RevealObserver) mounted in the (marketing) layout; the hidden state is
 * scoped to `.js-reveal` (an inline pre-paint script class on <html>) so
 * no-JS readers still see everything — progressive enhancement the live's
 * CSR shell cannot offer. At-rest output is unchanged (attributes only).
 */

const read = (p: string) => readFileSync(join(process.cwd(), p), 'utf8')

const hero = renderToStaticMarkup(<Hero />)
const social = renderToStaticMarkup(<SocialProof />)
const stats = renderToStaticMarkup(<StatsBar />)
const audience = renderToStaticMarkup(<Audience />)
const howItWorks = renderToStaticMarkup(<HowItWorks />)
const features = renderToStaticMarkup(<Features />)
const compare = renderToStaticMarkup(<Comparison />)
const pricing = renderToStaticMarkup(<PricingSection />)

const countAttr = (html: string, attr: string, value: string) =>
  html.split(`${attr}="${value}"`).length - 1

describe('scroll-reveal attributes (R12-F1)', () => {
  it('hero: 8 mount-reveal elements — badge/h1/p/pills/avatars/CTAs at y20, takes-line fade-only, feed column', () => {
    // The hero children stagger in on mount like the live.
    expect(hero).toContain('data-reveal="20" data-reveal-delay="0"') // badge
    expect(hero).toContain('data-reveal="20" data-reveal-delay="100"') // h1
    expect(hero).toContain('data-reveal="20" data-reveal-delay="200"') // p
    expect(hero).toContain('data-reveal="20" data-reveal-delay="300"') // pills
    expect(hero).toContain('data-reveal="20" data-reveal-delay="400"') // avatars
    expect(hero).toContain('data-reveal="20" data-reveal-delay="500"') // CTAs
    expect(hero).toContain('data-reveal="0" data-reveal-delay="600"') // takes
    expect(countAttr(hero, 'data-reveal', '20')).toBe(7)
    expect(countAttr(hero, 'data-reveal', '0')).toBe(1)
  })

  it('marquee: track y12 + 3 testimonial cards y20 staggered', () => {
    expect(social).toContain('data-reveal="12" data-reveal-delay="0"')
    expect(countAttr(social, 'data-reveal', '20')).toBe(3)
    expect(social).toContain('data-reveal="20" data-reveal-delay="100"')
    expect(social).toContain('data-reveal="20" data-reveal-delay="300"')
  })

  it('stats: 4 stat cards y16 staggered', () => {
    expect(countAttr(stats, 'data-reveal', '16')).toBe(4)
    expect(stats).toContain('data-reveal="16" data-reveal-delay="0"')
    expect(stats).toContain('data-reveal="16" data-reveal-delay="300"')
  })

  it('audience: header y16 + 5 cards y20 staggered', () => {
    expect(audience).toContain('data-reveal="16" data-reveal-delay="0"')
    expect(countAttr(audience, 'data-reveal', '20')).toBe(5)
    expect(audience).toContain('data-reveal="20" data-reveal-delay="100"')
    expect(audience).toContain('data-reveal="20" data-reveal-delay="500"')
  })

  it('process: header y16 + 4 steps y24 + feature tags y16', () => {
    expect(howItWorks).toContain('data-reveal="16" data-reveal-delay="0"')
    expect(countAttr(howItWorks, 'data-reveal', '24')).toBe(4)
    expect(howItWorks).toContain('data-reveal="16" data-reveal-delay="500"')
  })

  it('benefits: header y16 + 6 items y16 + screenshot fade-only', () => {
    expect(features).toContain('data-reveal="16" data-reveal-delay="0"')
    expect(countAttr(features, 'data-reveal', '16')).toBe(7)
    expect(features).toContain('data-reveal="0" data-reveal-delay="300"')
  })

  it('compare: header y16 + grid y20 (one wrapper, like the live)', () => {
    expect(compare).toContain('data-reveal="16" data-reveal-delay="0"')
    expect(compare).toContain('data-reveal="20" data-reveal-delay="100"')
    expect(countAttr(compare, 'data-reveal', '20')).toBe(1)
  })

  it('pricing: header y16 + 4 cards y24 staggered', () => {
    expect(pricing).toContain('data-reveal="16" data-reveal-delay="0"')
    expect(countAttr(pricing, 'data-reveal', '24')).toBe(4)
    expect(pricing).toContain('data-reveal="24" data-reveal-delay="400"')
  })
})

describe('scroll-reveal machinery (R12-F1)', () => {
  const css = read('src/app/globals.css')
  // R13-F3: the chrome (script + observer mount) moved into the shared
  // MarketingFrame used by both the (landing) and (marketing) groups.
  const layout = read('src/components/marketing/marketing-frame.tsx')
  // The observer lands with the GREEN pass; tolerate its absence so the
  // RED run reports failures instead of crashing the module load.
  let observer = ''
  try {
    observer = read('src/components/marketing/reveal-observer.tsx')
  } catch {
    observer = ''
  }

  it('globals.css: hidden state scoped to .js-reveal, terminal class, transition, reduced-motion guard', () => {
    // Progressive enhancement: the hidden state requires the JS-set class.
    expect(css).toMatch(/\.js-reveal \[data-reveal\]\s*\{[^}]*opacity: 0/)
    expect(css).toMatch(
      /\.js-reveal \[data-reveal\]\s*\{[^}]*translateY\(var\(--reveal-y/,
    )
    // The terminal state flips both properties back.
    expect(css).toMatch(
      /\.js-reveal \[data-reveal\]\.is-revealed\s*\{[^}]*opacity: 1/,
    )
    expect(css).toMatch(
      /\.is-revealed\s*\{[^}]*transform: none/,
    )
    // The transition lives on the element (armed by the observer).
    expect(css).toMatch(
      /\[data-reveal\]\.reveal-armed\s*\{[^}]*transition:/,
    )
    // Reduced motion skips the animation (content still reveals).
    expect(css).toMatch(
      /prefers-reduced-motion: reduce[\s\S]*?\[data-reveal\]\.reveal-armed\s*\{[^}]*transition: none/,
    )
  })

  it('the marketing frame mounts the observer + the pre-paint js-reveal script', () => {
    expect(layout).toContain('RevealObserver')
    expect(layout).toContain('js-reveal')
    // The inline script must be parser-blocking and tiny (pre-paint).
    expect(layout).toMatch(/dangerouslySetInnerHTML/)
  })

  it('RevealObserver: client island, ONE shared IntersectionObserver, once-only reveals', () => {
    expect(observer).toContain("'use client'")
    expect(observer).toContain('IntersectionObserver')
    expect(observer).toContain('unobserve')
    expect(observer).toContain('--reveal-y')
    expect(observer).toContain('reveal-armed')
  })
})
