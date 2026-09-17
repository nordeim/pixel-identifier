import { describe, expect, it } from 'vitest'

/**
 * SEO surface guards. R14 moved robots.txt and sitemap.xml from the Next
 * metadata conventions (app/robots.ts, app/sitemap.ts) to Route Handlers
 * that reproduce the live pixelco.io documents verbatim — comments,
 * namespaces, casing and "1.0"-style priorities the conventions cannot
 * emit. The per-page head parity lives in tests/seo-parity.test.ts; this
 * file guards the crawl surface: the URL set, the exclusions and the
 * auth routes.
 */

const MARKETING_URLS = [
  '/',
  '/about',
  '/docs',
  '/blog',
  '/privacy',
  '/terms',
  '/gdpr',
  '/ccpa',
  '/blog/talktome-bio-monetize-link-in-bio-messages',
  '/blog/flcmarkets-free-prop-trading-challenge',
  '/blog/personpages-lookup-anyone-salary-net-worth-address',
  '/blog/aiviral-ai-b2b-lead-generation-outreach',
  '/blog/identify-anonymous-website-visitors',
  '/blog/website-visitor-tracking-vs-analytics',
  '/blog/best-visitor-identification-tools-2026',
  '/blog/increase-email-list-with-visitor-identification',
  '/blog/retargeting-without-cookies',
  '/blog/gdpr-compliant-visitor-tracking',
]

async function sitemapPaths(): Promise<string[]> {
  const mod = await import('@/app/sitemap.xml/route')
  const xml = await (await mod.GET()).text()
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) =>
    new URL(m[1]).pathname,
  )
}

describe('robots.txt route', () => {
  it('allows everything but /api/ for the wildcard agent', async () => {
    const mod = await import('@/app/robots.txt/route')
    const text = await (await mod.GET()).text()
    expect(text).toContain('User-agent: *\nAllow: /\nDisallow: /api/')
  })

  it('declares the sitemap with an absolute /sitemap.xml URL', async () => {
    const mod = await import('@/app/robots.txt/route')
    const text = await (await mod.GET()).text()
    expect(text).toMatch(/Sitemap: https?:\/\/.+\/sitemap\.xml/)
  })
})

describe('sitemap.xml route', () => {
  it('lists every marketing URL the live site advertises', async () => {
    const paths = await sitemapPaths()
    for (const url of MARKETING_URLS) {
      expect(paths, `sitemap must include ${url}`).toContain(url)
    }
    expect(paths).toHaveLength(MARKETING_URLS.length)
  })

  it('never exposes app routes (login, signup, dashboard)', async () => {
    const paths = await sitemapPaths()
    for (const forbidden of [
      '/login',
      '/signup',
      '/dashboard',
      '/forgot-password',
    ]) {
      expect(paths, `sitemap must NOT include ${forbidden}`).not.toContain(forbidden)
    }
  })
})

describe('auth surfaces', () => {
  it('ships the /forgot-password route the live login links to (R6-H4)', async () => {
    // The live login form links to /forgot-password (where the live app
    // itself 404s — a dead link we deliberately do not replicate).
    const mod = await import('@/app/forgot-password/page')
    expect(typeof mod.default).toBe('function')
    expect(mod.metadata.title).toBe('Forgot Password')
  })

  it('keeps /forgot-password out of the sitemap (auth surface)', async () => {
    const paths = await sitemapPaths()
    expect(paths).not.toContain('/forgot-password')
  })
})
