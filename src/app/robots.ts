import type { MetadataRoute } from 'next'
import { siteUrl } from '@/lib/site-url'

/**
 * robots.txt — mirrors the original pixelco.io rules: everything is
 * crawlable except the API surface; app routes (/login, /signup,
 * /dashboard) are excluded from the sitemap instead and left crawlable so
 * the auth pages' noindex metadata governs them.
 */
export const robots: MetadataRoute.Robots = {
  rules: [
    {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/'],
    },
  ],
  sitemap: `${siteUrl()}/sitemap.xml`,
}
