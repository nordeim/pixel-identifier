import { BLOG_POSTS } from '@/data/blog-posts'
import { siteUrl } from '@/lib/site-url'

/**
 * /sitemap.xml (R14-F11) — reproduces the live pixelco.io document
 * (research/round14-audit/content/live-sitemap.xml): the news/image
 * namespaces, the section comments, the hand-authored URL order (static:
 * home, about, docs, blog, legal; then posts in the live's fixed order —
 * NOT date order) and the "1.0"-style priority serialization. The Next
 * sitemap.ts convention cannot emit comments, extra namespaces or
 * trailing-zero priorities, so this is a Route Handler; loc URLs derive
 * from the deployment origin (site-url convention).
 */

/** The live's hand-authored post order (flcmarkets 2026-09-10 follows
 * talktome 2026-05-10 — it is not a date sort). */
const LIVE_POST_ORDER = [
  'talktome-bio-monetize-link-in-bio-messages',
  'flcmarkets-free-prop-trading-challenge',
  'personpages-lookup-anyone-salary-net-worth-address',
  'aiviral-ai-b2b-lead-generation-outreach',
  'identify-anonymous-website-visitors',
  'website-visitor-tracking-vs-analytics',
  'best-visitor-identification-tools-2026',
  'increase-email-list-with-visitor-identification',
  'retargeting-without-cookies',
  'gdpr-compliant-visitor-tracking',
]

export const dynamic = 'force-static'

function entry(loc: string, changefreq: string, priority: string): string {
  return `  <url>
    <loc>${loc}</loc>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>
`
}

export function GET(): Response {
  const base = siteUrl()

  const coreEntries =
    entry(`${base}/`, 'weekly', '1.0') +
    entry(`${base}/about`, 'monthly', '0.7') +
    entry(`${base}/docs`, 'monthly', '0.8') +
    entry(`${base}/blog`, 'weekly', '0.9')

  const legalEntries =
    entry(`${base}/privacy`, 'yearly', '0.4') +
    entry(`${base}/terms`, 'yearly', '0.4') +
    entry(`${base}/gdpr`, 'yearly', '0.4') +
    entry(`${base}/ccpa`, 'yearly', '0.4')

  const bySlug = new Map(BLOG_POSTS.map((post) => [post.slug, post]))
  const postEntries = LIVE_POST_ORDER.map((slug) => {
    const post = bySlug.get(slug)
    if (!post) {
      throw new Error(`sitemap order references unknown slug: ${slug}`)
    }
    return entry(`${base}/blog/${post.slug}`, 'monthly', '0.8')
  }).join('')

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">

  <!-- Core Pages -->
${coreEntries}
  <!-- Legal Pages -->
${legalEntries}
  <!-- Blog Posts -->
${postEntries}</urlset>
`

  return new Response(body, {
    headers: {
      'Content-Type': 'text/xml; charset=utf-8',
    },
  })
}
