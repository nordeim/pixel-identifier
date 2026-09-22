import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { Hero } from '@/components/marketing/hero'
import { Features, Comparison } from '@/components/marketing/features'
import { PricingSection } from '@/components/marketing/pricing-section'
import { Audience, HowItWorks } from '@/components/marketing/how-it-works'
import { Faq, SiteFooter } from '@/components/marketing/faq-footer'
import { SiteHeader } from '@/components/marketing/site-header'

/**
 * R11 marketing parity batch (findings F5, F8–F13, F16): inline-span
 * kickers (the recurring -8px section line-box), header margins
 * (pricing mb-14 / FAQ mb-12), the #benefits anchor placement, the hero
 * demo CTA target, footer wordmark/Careers anchors, the Compare CTA
 * chrome, and the header CTA sizes.
 */

const hero = renderToStaticMarkup(<Hero />)
const features = renderToStaticMarkup(<Features />)
const comparison = renderToStaticMarkup(<Comparison />)
const pricing = renderToStaticMarkup(<PricingSection />)
const audience = renderToStaticMarkup(<Audience />)
const process = renderToStaticMarkup(<HowItWorks />)
const faq = renderToStaticMarkup(<Faq />)
const footer = renderToStaticMarkup(<SiteFooter />)
const header = renderToStaticMarkup(<SiteHeader />)

describe('kickers are inline spans (R11-F5)', () => {
  it('renders every section kicker as a <span>, not a block <p>', () => {
    for (const [name, html, text] of [
      ['audience', audience, 'Perfect Fit'],
      ['process', process, 'Our Process'],
      ['pricing', pricing, 'Pricing'],
      ['features', features, 'Benefits'],
      ['faq', faq, 'FAQ'],
    ] as const) {
      const idx = html.indexOf(text)
      expect(idx, `${name} kicker text present`).toBeGreaterThanOrEqual(0)
      const before = html.slice(Math.max(0, idx - 200), idx)
      expect(
        before.lastIndexOf('<span'),
        `${name} kicker opens a span`,
      ).toBeGreaterThan(before.lastIndexOf('<p'))
      expect(html).not.toMatch(
        new RegExp(`<p class="text-xs font-semibold text-primary[^"]*">${text}`),
      )
    }
  })
})

describe('section header margins (R11-F10)', () => {
  it('wraps the pricing header with mb-14', () => {
    expect(pricing).toContain('text-center mb-14')
  })

  it('wraps the FAQ header with mb-12', () => {
    expect(faq).toContain('text-center mb-12')
  })
})

describe('#benefits anchor placement (R11-F8)', () => {
  it('carries id="benefits" on the Features section and not on Audience', () => {
    expect(features).toContain('id="benefits"')
    expect(audience).not.toContain('id="benefits"')
  })
})

describe('hero demo CTA (R11-F9)', () => {
  it('targets the app (login) instead of a local #live-demo anchor', () => {
    expect(hero).toContain('href="/login"')
    expect(hero).not.toContain('#live-demo')
    expect(hero).not.toContain('id="live-demo"')
  })
})

describe('footer anchors (R11-F11)', () => {
  it('wraps the brand wordmark in a home link with mb-4', () => {
    expect(footer).toMatch(/<a[^>]*class="flex items-center gap-2 mb-4[^"]*"[^>]*href="\/">/)
  })

  it('renders Careers as a real anchor (href="#")', () => {
    expect(footer).toMatch(/<a[^>]*href="#"[^>]*>Careers<\/a>/)
    expect(footer).not.toContain('cursor-default')
  })
})

describe('Compare card CTA (R11-F12)', () => {
  it('carries the gradient-cta chrome at the default h-10 with the arrow', () => {
    expect(comparison).toContain(
      'gradient-cta text-primary-foreground border-0 hover:opacity-90 font-semibold',
    )
    expect(comparison).toContain('w-full mt-6')
    expect(comparison).toContain('lucide-arrow-right')
    expect(comparison).toContain('Start Free')
  })
})

describe('header CTAs (R11-F13)', () => {
  it('renders both header CTAs at size sm with the live overrides', () => {
    expect(header).toContain('h-9 rounded-md px-3')
    expect(header).toContain('text-muted-foreground font-medium')
    expect(header).toContain(
      'gradient-cta text-primary-foreground border-0 hover:opacity-90 font-semibold',
    )
    expect(header).toContain('Log In')
    expect(header).toContain('Start Identifying')
  })
})
