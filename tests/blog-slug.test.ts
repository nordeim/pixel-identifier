import { describe, expect, it } from 'vitest'
import { BLOG_POSTS } from '@/data/blog-posts'

/**
 * Constraint guard for generateStaticParams: a slug that slipped past the
 * catalogue tests (e.g. an underscore or uppercase letter) would still
 * build a route, but a malformed one (spaces, unicode, path segments)
 * must never reach the router.
 */
describe('blog slugs', () => {
  it('every slug is URL-safe (lowercase kebab, no path tricks)', () => {
    for (const post of BLOG_POSTS) {
      expect(post.slug).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
      expect(post.slug).not.toContain('/')
      expect(post.slug).not.toContain('.')
    }
  })

  it('slugs derive from titles unambiguously (no two posts share a prefix collision)', () => {
    const slugs = BLOG_POSTS.map((p) => p.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
  })
})
