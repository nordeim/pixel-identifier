import { describe, expect, it } from 'vitest'
import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'

const read = (p: string) => readFileSync(join(process.cwd(), p), 'utf8')

/**
 * Round-14 — metadata & SEO-surface parity.
 *
 * The prior rounds pinned the rendered DOM; the `<head>` was never audited
 * end-to-end. The round-14 audit (research/round14-audit/) extracted the
 * live's per-page metadata AFTER hydration (the live is CSR — its router
 * sets per-page title/description/og/twitter/canonical on navigation) and
 * found the clone shipping authored copy, template titles and a partial og
 * block. These tests pin the live-verbatim strings and the helpers that
 * produce them.
 */

const LIVE_LANDING_DESC =
  'Pixelco identifies anonymous website visitors by their real email address. B2C and B2B. One pixel snippet, no forms needed. Start free today.'

describe('R14-F1/F5/F6/F7/F13/F15: root layout metadata (the landing)', () => {
  const layout = read('src/app/layout.tsx')

  it('ships the live-verbatim description', () => {
    expect(layout).toContain(LIVE_LANDING_DESC)
    expect(layout).toMatch(/description:\s*["']Pixelco identifies anonymous/)
  })

  it('uses the live suffix separator in the title template', () => {
    expect(layout).toContain('template: "%s | Pixelco"')
    expect(layout).not.toContain('· Pixelco')
  })

  it('declares the per-page og/url/locale/image block the live ships', () => {
    expect(layout).toMatch(/url:\s*["']\/["']/)
    expect(layout).toMatch(/locale:\s*["']en_US["']/)
    expect(layout).toMatch(/url:\s*["']\/og-image\.webp["']/)
    expect(layout).toContain('width: 1200')
    expect(layout).toContain('height: 630')
  })

  it('ships the large twitter card', () => {
    expect(layout).toMatch(/card:\s*["']summary_large_image["']/)
  })

  it('declares the canonical and the robots meta', () => {
    expect(layout).toMatch(/canonical:\s*["']\/["']/)
    expect(layout).toContain('index: true')
    expect(layout).toContain('follow: true')
  })

  it('drops the clone-authored keywords (the live ships none)', () => {
    expect(layout).not.toContain('keywords:')
  })
})

describe('R14-F2/F3/F4/F8: the marketing-seo helper', () => {
  it('builds the full live-shaped per-page metadata', async () => {
    const { marketingMetadata } = await import('@/lib/marketing-seo')
    const md = marketingMetadata({
      title: 'Privacy Policy | Pixelco',
      description: 'Pixelco Privacy Policy description.',
      path: '/privacy',
    })

    expect(md.title).toEqual({ absolute: 'Privacy Policy | Pixelco' })
    expect(md.description).toBe('Pixelco Privacy Policy description.')

    const og = md.openGraph as Record<string, unknown>
    expect(og.url).toBe('/privacy')
    expect(og.title).toBe('Privacy Policy | Pixelco')
    expect(og.description).toBe('Pixelco Privacy Policy description.')
    expect(og.locale).toBe('en_US')
    expect(og.siteName).toBe('Pixelco')
    expect(og.type).toBe('website')
    expect(og.images).toEqual([
      { url: '/og-image.webp', width: 1200, height: 630 },
    ])

    const tw = md.twitter as Record<string, unknown>
    expect(tw.card).toBe('summary_large_image')
    expect(tw.title).toBe('Privacy Policy | Pixelco')
    expect(tw.description).toBe('Pixelco Privacy Policy description.')

    expect(md.alternates?.canonical).toBe('/privacy')
  })

  const PAGES: Array<[string, string, string]> = [
    [
      'src/app/(marketing)/about/page.tsx',
      'About Pixelco — The Team Behind B2C Visitor Identification',
      "Learn about Pixelco by Aiviral. We built the world's first B2C email identification platform to help businesses turn anonymous website visitors into leads.",
    ],
    [
      'src/app/(marketing)/blog/page.tsx',
      'Blog — Visitor Identification & Lead Generation Insights | Pixelco',
      'Expert insights on website visitor identification, lead generation, retargeting, and marketing strategy. Learn how to turn anonymous traffic into revenue.',
    ],
    [
      'src/app/(marketing)/docs/page.tsx',
      'Documentation — Install the Pixelco Pixel in 5 Minutes',
      'Step-by-step guide to install the Pixelco tracking pixel on your website. Works with WordPress, Shopify, Next.js, and more. Start identifying visitors today.',
    ],
    [
      'src/app/(marketing)/privacy/page.tsx',
      'Privacy Policy | Pixelco',
      "Pixelco's Privacy Policy explains how we collect, use, and protect your data. Learn about our visitor identification practices, data retention, and your rights.",
    ],
    [
      'src/app/(marketing)/terms/page.tsx',
      'Terms of Service | Pixelco',
      "Read Pixelco's Terms of Service. Understand your rights, obligations, acceptable use, billing, and liability when using our visitor identification platform.",
    ],
    [
      'src/app/(marketing)/gdpr/page.tsx',
      'GDPR Compliance | Pixelco',
      'Learn how Pixelco complies with GDPR. Understand data subject rights, lawful basis for processing, DPAs, international transfers, and breach notification procedures.',
    ],
    [
      'src/app/(marketing)/ccpa/page.tsx',
      'CCPA / CPRA Compliance | Pixelco',
      "Pixelco's CCPA/CPRA compliance page. Learn about your California privacy rights, data categories collected, opt-out options, and how to submit requests.",
    ],
  ]

  it.each(PAGES)('%s ships the live metadata via the helper', (file, title, desc) => {
    const src = read(file)
    expect(src).toContain('marketingMetadata(')
    expect(src).toContain(title)
    expect(src).toContain(desc)
  })

  it('derives each page canonical from its path', async () => {
    const { marketingMetadata } = await import('@/lib/marketing-seo')
    expect(marketingMetadata({ title: 't', description: 'd', path: '/about' }).alternates?.canonical).toBe('/about')
  })
})

describe('R14-F9: the app-bundle og block (app.pixelco.io)', () => {
  it('builds the live app og metadata', async () => {
    const { appSeoMetadata } = await import('@/lib/app-seo')
    const md = appSeoMetadata()

    const og = md.openGraph as Record<string, unknown>
    expect(og.title).toBe('Pixelco')
    expect(og.description).toBe('Visitor identification platform dashboard')
    expect(og.images).toEqual([{ url: '/app-og-image.png' }])

    const tw = md.twitter as Record<string, unknown>
    expect(tw.card).toBe('summary_large_image')
    expect(tw.title).toBe('Pixelco')
    expect(tw.description).toBe('Visitor identification platform dashboard')

    // the live app ships NO canonical / og:url / og:locale / robots meta
    expect(md.alternates).toBeUndefined()
    expect(og.url).toBeUndefined()
    expect(og.locale).toBeUndefined()
    expect(md.robots).toBeUndefined()
  })

  it('does NOT replicate the live build-platform artifact twitter:site @Lovable', async () => {
    const { appSeoMetadata } = await import('@/lib/app-seo')
    expect(JSON.stringify(appSeoMetadata())).not.toContain('Lovable')
  })

  it('is applied on the auth pages and the dashboard layout', () => {
    for (const file of [
      'src/app/login/page.tsx',
      'src/app/signup/page.tsx',
      'src/app/forgot-password/page.tsx',
      'src/app/dashboard/layout.tsx',
    ]) {
      expect(read(file), file).toContain('appSeoMetadata')
    }
    // per-page tab titles survive on the auth pages (R13 ruling: the
    // live's CSR "Pixelco"-everywhere tab is an artifact; og carries the
    // brand); dashboard pages carry their own title exports.
    for (const file of [
      'src/app/login/page.tsx',
      'src/app/signup/page.tsx',
      'src/app/forgot-password/page.tsx',
    ]) {
      expect(read(file), file).toMatch(/title: '/)
    }
  })
})

describe('R14-F10: the 404 ships the live page title', () => {
  it('the title island sets the live 404 title client-side', async () => {
    // The live serves its CSR shell with the brand title and swaps
    // document.title to "Page Not Found | Pixelco" in the client router;
    // the clone reproduces the swap while keeping the correct HTTP 404.
    const { NotFoundTitle } = await import('@/components/not-found-title')
    expect(typeof NotFoundTitle).toBe('function')
    const src = read('src/components/not-found-title.tsx')
    expect(src).toContain("'Page Not Found | Pixelco'")
    // the swap re-asserts past Next's post-hydration metadata patch
    expect(src).toContain('MutationObserver')
    const boundary = read('src/app/not-found.tsx')
    expect(boundary).toContain('NotFoundTitle')
  })
})

describe('R14-F12: robots.txt reproduces the live text', () => {
  it('emits the commented format the live ships', async () => {
    const mod = await import('@/app/robots.txt/route')
    const res = await mod.GET()
    const text = await res.text()

    expect(text).toContain('# https://www.robotsttxt.org/robotstxt.html'.replace('ttxt', 'txt'))
    expect(text).toContain('User-agent: *\nAllow: /\nDisallow: /api/')
    expect(text).toContain('# Sitemaps\nSitemap: http://localhost:3000/sitemap.xml')
    expect(text).toContain('# Crawl-delay (optional, for polite bots)\n# Crawl-delay: 1')
    expect(text).toContain('User-agent: Googlebot\nAllow: /')
    expect(text).toContain('User-agent: facebookexternalhit\nAllow: /')
    expect(text).toContain('# Block AI scrapers (optional - uncomment if desired)')
    expect(text).toContain('# User-agent: CCBot\n# Disallow: /')
    expect(res.headers.get('content-type')).toBe('text/plain; charset=utf-8')
  })
})

describe('R14-F11: sitemap.xml reproduces the live document', () => {
  it('emits the namespaces, comments, order and 1.0 priorities', async () => {
    const mod = await import('@/app/sitemap.xml/route')
    const res = await mod.GET()
    const xml = await res.text()

    expect(xml).toContain('xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"')
    expect(xml).toContain('xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"')
    expect(xml).toContain('<!-- Core Pages -->')
    expect(xml).toContain('<!-- Legal Pages -->')
    expect(xml).toContain('<!-- Blog Posts -->')

    const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) =>
      m[1].replace('http://localhost:3000', ''),
    )
    expect(locs).toEqual([
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
    ])

    expect(xml).toContain('<priority>1.0</priority>')
    expect(xml).toContain('<priority>0.7</priority>')
    expect(res.headers.get('content-type')).toBe('text/xml; charset=utf-8')
  })

  it('never exposes app routes', async () => {
    const mod = await import('@/app/sitemap.xml/route')
    const xml = await (await mod.GET()).text()
    for (const forbidden of ['/login', '/signup', '/dashboard']) {
      expect(xml).not.toContain(forbidden)
    }
  })
})

describe('R14-F14: the favicon follows the live convention', () => {
  it('serves the live favicon bytes from public/ with no icon link tag source', () => {
    const ico = readFileSync(join(process.cwd(), 'public/favicon.ico'))
    expect(ico.length).toBe(32593)
    expect(existsSync(join(process.cwd(), 'src/app/icon.svg'))).toBe(false)
    // the social images are self-hosted for unfurls
    expect(existsSync(join(process.cwd(), 'public/og-image.webp'))).toBe(true)
    expect(existsSync(join(process.cwd(), 'public/app-og-image.png'))).toBe(true)
  })
})
