import type { MetadataRoute } from 'next'
import { sortedPosts } from '@/data/blog-posts'
import { siteUrl } from '@/lib/site-url'

/**
 * sitemap.xml — the same URL set the live pixelco.io advertises: the
 * marketing pages, the four legal pages, and every blog post. App routes
 * (login, signup, dashboard) are deliberately absent.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl()

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${base}/blog`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${base}/docs`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/about`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/privacy`, changeFrequency: 'yearly', priority: 0.4 },
    { url: `${base}/terms`, changeFrequency: 'yearly', priority: 0.4 },
    { url: `${base}/gdpr`, changeFrequency: 'yearly', priority: 0.4 },
    { url: `${base}/ccpa`, changeFrequency: 'yearly', priority: 0.4 },
  ]

  const postRoutes: MetadataRoute.Sitemap = sortedPosts().map((post) => ({
    url: `${base}/blog/${post.slug}`,
    changeFrequency: 'monthly',
    priority: 0.8,
  }))

  return [...staticRoutes, ...postRoutes]
}
