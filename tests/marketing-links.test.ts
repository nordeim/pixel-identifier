import { describe, expect, it } from 'vitest'
import {
  NAV_LINKS,
  FOOTER_COLUMNS,
  type MarketingLink,
} from '@/lib/marketing-links'

/** Routes that actually exist in the app (marketing surface). */
const KNOWN_ROUTES = new Set([
  '/',
  '/about',
  '/blog',
  '/docs',
  '/privacy',
  '/terms',
  '/gdpr',
  '/ccpa',
  '/login',
  '/signup',
])

const KNOWN_ANCHORS = new Set([
  '#benefits',
  '#how-it-works',
  '#pricing',
  '#faq',
  '#live-demo',
])

function hrefTarget(href: string): { kind: 'internal' | 'anchor' | 'mail' | 'dead'; path: string } {
  if (href === '#') return { kind: 'dead', path: href }
  if (href.startsWith('mailto:')) return { kind: 'mail', path: href }
  if (href.startsWith('/#')) return { kind: 'anchor', path: href.slice(1) }
  if (href.startsWith('#')) return { kind: 'anchor', path: href }
  return { kind: 'internal', path: href }
}

function collectLinks(): MarketingLink[] {
  const links: MarketingLink[] = NAV_LINKS.map((l) => ({ ...l }))
  for (const column of FOOTER_COLUMNS) {
    for (const link of column.links) links.push({ ...link })
  }
  return links
}

describe('marketing link map', () => {
  it('every internal href targets an existing route', () => {
    for (const link of collectLinks()) {
      const target = hrefTarget(link.href)
      if (target.kind === 'internal') {
        expect(
          KNOWN_ROUTES.has(target.path),
          `link "${link.label}" points at ${target.path}, which is not a known route`,
        ).toBe(true)
      }
    }
  })

  it('every anchor href targets a section id that exists on the landing page', () => {
    for (const link of collectLinks()) {
      const target = hrefTarget(link.href)
      if (target.kind === 'anchor') {
        expect(
          KNOWN_ANCHORS.has(target.path),
          `link "${link.label}" points at anchor ${target.path}, which no landing section defines`,
        ).toBe(true)
      }
    }
  })

  it('the only dead link is Careers, explicitly flagged (parity with pixelco.io)', () => {
    const dead = collectLinks().filter((link) => link.href === '#')
    expect(dead.map((l) => l.label)).toEqual(['Careers'])
    // The flag documents *why* it is dead so nobody "fixes" it blindly.
    expect(dead[0].dead).toBe(true)
  })

  it('Contact is a mailto link (the original footer is a mailto, not a page)', () => {
    const contact = collectLinks().find((l) => l.label === 'Contact')
    expect(contact?.href).toBe('mailto:support@pixelco.io')
  })

  it('footer links cover the live site page set: about, blog, docs, privacy, terms, gdpr, ccpa', () => {
    const hrefs = collectLinks().map((l) => l.href)
    for (const route of ['/about', '/blog', '/docs', '/privacy', '/terms', '/gdpr', '/ccpa']) {
      expect(hrefs, `footer must link ${route}`).toContain(route)
    }
  })

  it('nav links work from any sub-page (absolute /#anchor form)', () => {
    for (const link of NAV_LINKS) {
      expect(
        link.href.startsWith('/#'),
        `nav link "${link.label}" must use the /#anchor form so it works from sub-pages, got ${link.href}`,
      ).toBe(true)
    }
  })
})
