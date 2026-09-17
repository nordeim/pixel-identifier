import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import PrivacyPage from '@/app/(marketing)/privacy/page'
import TermsPage from '@/app/(marketing)/terms/page'
import GdprPage from '@/app/(marketing)/gdpr/page'
import CcpaPage from '@/app/(marketing)/ccpa/page'
import { LEGAL_PAGES, getLegalPage } from '@/data/legal-pages'

/**
 * R13-F8: the four legal pages rebuilt on the live DOM — container
 * max-w-3xl, `← Back to Home` link, H1 + "Last updated: April 14, 2026",
 * prose-sm/ space-y-8 sections with direct classes on every element, and
 * the LIVE policy copy (which names the operator Aiviral).
 */
const pages: Array<[string, React.ComponentType, string]> = [
  ['privacy', PrivacyPage, 'Privacy Policy'],
  ['terms', TermsPage, 'Terms of Service'],
  ['gdpr', GdprPage, 'GDPR Compliance'],
  ['ccpa', CcpaPage, 'CCPA / CPRA Compliance'],
]

const rendered = Object.fromEntries(
  pages.map(([slug, Page]) => [slug, renderToStaticMarkup(<Page />)]),
) as Record<string, string>

describe('R13-F8: legal pages match the live chrome', () => {
  it.each(pages)('%s renders the live container, back-link, H1 and updated line', (slug, _Page, title) => {
    const html = rendered[slug]
    expect(html).toContain('class="container mx-auto px-6 py-16 max-w-3xl"')
    expect(html).toMatch(
      /<a[^>]*class="text-sm text-primary hover:underline mb-6 inline-block"[^>]*href="\/"[^>]*>← Back to Home<\/a>/,
    )
    expect(html).toContain(`<h1 class="text-4xl font-bold text-foreground mb-2">${title}</h1>`)
    expect(html).toContain('class="text-muted-foreground mb-10"')
    expect(html).toContain('Last updated: April 14, 2026')
  })

  it.each(pages)('%s renders the live prose structure', (slug) => {
    const html = rendered[slug]
    expect(html).toContain('class="prose prose-sm max-w-none space-y-8 text-foreground/90"')
    // section grouping with the live heading/list classes
    expect(html).toMatch(/<section><h2 class="text-xl font-semibold text-foreground">1\. /)
    expect(html).toContain('class="text-muted-foreground leading-relaxed"')
    expect(html).toContain('class="list-disc pl-5 text-muted-foreground space-y-2"')
    // no amber residue from the old frame
    expect(html).not.toContain('text-amber-600')
    expect(html).not.toContain('font-extrabold')
  })

  it('privacy names the operator Aiviral with the live section set', () => {
    const html = rendered.privacy
    expect(html).toContain('Pixelco, operated by Aiviral')
    for (const heading of [
      '1. Introduction',
      '2. Definitions',
      '3. Information We Collect',
      '4. How We Use Information',
    ]) {
      expect(html).toContain(`>${heading}</h2>`)
    }
    // subsections render as h3 with the live class
    expect(html).toContain('class="text-lg font-medium text-foreground mt-4"')
  })

  it('ccpa renders the live data table', () => {
    const html = rendered.ccpa
    expect(html).toContain('class="overflow-x-auto mt-3"')
    expect(html).toContain('class="w-full text-sm border border-border"')
    expect(html).toContain('>Category</th>')
    expect(html).toContain('>Examples</th>')
    expect(html).toContain('>Identifiers</td>')
  })

  it('gdpr ships the live roles list', () => {
    expect(rendered.gdpr).toContain('Pixelco as Data Controller')
    expect(rendered.gdpr).toContain('Pixelco as Data Processor')
    expect(rendered.gdpr).toContain('Joint Controller Scenarios')
  })
})

describe('the legal data module', () => {
  it('exposes exactly the four live pages', () => {
    expect(LEGAL_PAGES.map((p) => p.slug)).toEqual(['privacy', 'terms', 'gdpr', 'ccpa'])
  })

  it('every page body is sectioned markdown with substantial live copy', () => {
    for (const page of LEGAL_PAGES) {
      expect(getLegalPage(page.slug)).toBeDefined()
      const sections = page.content.match(/^## /gm) ?? []
      expect(sections.length).toBeGreaterThanOrEqual(10)
      expect(page.content.length).toBeGreaterThan(4000)
    }
  })
})
