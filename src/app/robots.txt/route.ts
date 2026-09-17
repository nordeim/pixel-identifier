import { siteUrl } from '@/lib/site-url'

/**
 * /robots.txt (R14-F12) — reproduces the live pixelco.io file verbatim
 * (research/round14-audit/content/live-robots.txt): the commented format,
 * lowercase `User-agent:`, the specific bot rules and the commented AI
 * scraper + crawl-delay sections. The Next robots.ts convention cannot
 * emit comments or control casing, so this is a Route Handler; the
 * Sitemap line derives from the deployment origin (site-url convention).
 */
export const dynamic = 'force-static'

export function GET(): Response {
  const body = `# https://www.robotstxt.org/robotstxt.html
User-agent: *
Allow: /
Disallow: /api/

# Sitemaps
Sitemap: ${siteUrl()}/sitemap.xml

# Crawl-delay (optional, for polite bots)
# Crawl-delay: 1

# Specific bot rules
User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

User-agent: Twitterbot
Allow: /

User-agent: facebookexternalhit
Allow: /

User-agent: LinkedInBot
Allow: /

User-agent: Slurp
Allow: /

# Block AI scrapers (optional - uncomment if desired)
# User-agent: GPTBot
# Disallow: /
# User-agent: ChatGPT-User
# Disallow: /
# User-agent: CCBot
# Disallow: /
`

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  })
}
