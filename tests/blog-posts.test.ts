import { describe, expect, it } from 'vitest'
import {
  BLOG_POSTS,
  sortedPosts,
  getPostBySlug,
  type BlogPost,
} from '@/data/blog-posts'

/** The ten slugs pixelco.io's live sitemap.xml advertises, verbatim. */
const LIVE_SLUGS = [
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

function assertValidPost(post: BlogPost) {
  expect(post.slug).toMatch(/^[a-z0-9-]+$/)
  expect(post.title.length).toBeGreaterThanOrEqual(10)
  expect(post.category.length).toBeGreaterThan(2)
  expect(post.readMinutes).toBeGreaterThanOrEqual(3)
  expect(post.readMinutes).toBeLessThanOrEqual(15)
  expect(post.excerpt.length).toBeGreaterThanOrEqual(40)
  expect(post.excerpt.length).toBeLessThanOrEqual(220)
  expect(post.dateISO).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  expect(new Date(post.dateISO).toString()).not.toBe('Invalid Date')
  expect(post.content.length).toBeGreaterThan(300)
}

describe('blog post catalogue', () => {
  it('contains exactly the ten posts the live sitemap advertises', () => {
    expect(BLOG_POSTS.map((p) => p.slug).sort()).toEqual([...LIVE_SLUGS].sort())
  })

  it('slugs are unique', () => {
    expect(new Set(BLOG_POSTS.map((p) => p.slug)).size).toBe(BLOG_POSTS.length)
  })

  it('every post has a complete, well-formed record', () => {
    for (const post of BLOG_POSTS) assertValidPost(post)
  })

  it('sortedPosts orders by date descending', () => {
    const dates = sortedPosts().map((p) => p.dateISO)
    const sorted = [...dates].sort().reverse()
    expect(dates).toEqual(sorted)
  })

  it('getPostBySlug finds a known post and rejects unknown slugs', () => {
    const post = getPostBySlug('identify-anonymous-website-visitors')
    expect(post?.slug).toBe('identify-anonymous-website-visitors')
    expect(getPostBySlug('no-such-post')).toBeUndefined()
  })

  it('sister-product posts link out to the products the original links to', () => {
    const aiviral = getPostBySlug('aiviral-ai-b2b-lead-generation-outreach')
    expect(aiviral?.content).toContain('https://aiviral.com')
    const flc = getPostBySlug('flcmarkets-free-prop-trading-challenge')
    expect(flc?.content).toContain('https://flcmarkets.com')
    const personpages = getPostBySlug('personpages-lookup-anyone-salary-net-worth-address')
    expect(personpages?.content).toContain('https://personpages.com')
    const talktome = getPostBySlug('talktome-bio-monetize-link-in-bio-messages')
    expect(talktome?.content).toContain('https://talktome.bio')
  })
})
