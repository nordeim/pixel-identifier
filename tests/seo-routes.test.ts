import { describe, expect, it } from 'vitest'
import { default as sitemapFn } from '@/app/sitemap'
import { robots } from '@/app/robots'

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

describe('robots.ts', () => {
  it('allows everything but /api/ for the wildcard agent', () => {
    const rules = Array.isArray(robots.rules) ? robots.rules : [robots.rules]
    const wildcard = rules.find(
      (rule) => !Array.isArray(rule.userAgent) || rule.userAgent.includes('*'),
    )
    expect(wildcard).toBeDefined()
    expect(wildcard?.allow).toContain('/')
    expect(wildcard?.disallow).toEqual(['/api/'])
  })

  it('declares the sitemap with an absolute /sitemap.xml URL', () => {
    expect(robots.sitemap).toMatch(/^https?:\/\/.+\/sitemap\.xml$/)
  })
})

describe('sitemap.ts', () => {
  it('lists every marketing URL the live site advertises', async () => {
    const entries = await sitemapFn()
    const paths = entries.map((entry) => new URL(entry.url).pathname)
    for (const url of MARKETING_URLS) {
      expect(paths, `sitemap must include ${url}`).toContain(url)
    }
  })

  it('never exposes app routes (login, signup, dashboard)', async () => {
    const entries = await sitemapFn()
    const paths = entries.map((entry) => new URL(entry.url).pathname)
    for (const forbidden of ['/login', '/signup', '/dashboard']) {
      expect(paths, `sitemap must NOT include ${forbidden}`).not.toContain(forbidden)
    }
  })

  it('emits absolute URLs with priorities like the live sitemap', async () => {
    const entries = await sitemapFn()
    for (const entry of entries) {
      expect(entry.url).toMatch(/^https?:\/\//)
      expect(entry.priority).toBeGreaterThan(0)
      expect(entry.priority).toBeLessThanOrEqual(1)
    }
    const home = entries.find((e) => new URL(e.url).pathname === '/')
    expect(home?.priority).toBe(1)
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
    const entries = await sitemapFn()
    const paths = entries.map((entry) => new URL(entry.url).pathname)
    expect(paths).not.toContain('/forgot-password')
  })
})
