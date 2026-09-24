import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import ArticlePage from '@/app/(marketing)/blog/[slug]/page'

/**
 * R32-F1: the live's blog ARTICLE pages render an article footer block
 * after the prose body — runtime-captured on the live (5 of 10 articles
 * probed, all identical):
 *
 *   <div class="border-t border-border mt-14 pt-8">
 *     <p class="text-sm text-muted-foreground mb-4">
 *       Written by <strong class="text-foreground">Pixelco Team</strong>
 *     </p>
 *     <a href="https://app.pixelco.io">
 *       <button class="… bg-primary text-primary-foreground
 *         hover:bg-primary/90 h-10 px-4 py-2">
 *         Start Identifying Visitors →</button>
 *     </a>
 *   </div>
 *
 * The R13 audit's per-article capture recorded only breadcrumb/category/
 * date/readTime/h1, so the footer never entered evidence and the R13
 * rebuild omitted it. The bundle hash never changed since (the footer was
 * in the live's bundle all along — the R26 lesson: a never-diffed surface
 * is not an absent surface). Pins below reproduce the live bytes with the
 * repo's standing conventions applied: the CTA anchor maps
 * app.pixelco.io → /signup (single deployment) and the arrow is a TEXT
 * character (U+2192 — the sub-page ← convention's forward twin).
 */
async function renderArticle(slug: string): Promise<string> {
  const tree = await ArticlePage({ params: Promise.resolve({ slug }) })
  return renderToStaticMarkup(tree as React.ReactElement)
}

const SLUG = 'identify-anonymous-website-visitors'

describe('R32-F1: the blog article footer matches the live', () => {
  it('renders the live footer container after the prose body', async () => {
    const html = await renderArticle(SLUG)
    expect(html).toContain('class="border-t border-border mt-14 pt-8"')
    // The footer block sits inside the article's inner div (the same
    // parent as the metadata row / h1 / prose wrapper), after the prose.
    const proseIdx = html.indexOf('prose prose-sm')
    const footerIdx = html.indexOf('border-t border-border mt-14 pt-8')
    expect(proseIdx).toBeGreaterThan(-1)
    expect(footerIdx).toBeGreaterThan(proseIdx)
  })

  it('renders the live byline (author constant across the live articles)', async () => {
    const html = await renderArticle(SLUG)
    expect(html).toContain(
      '<p class="text-sm text-muted-foreground mb-4">Written by ' +
        '<strong class="text-foreground">Pixelco Team</strong></p>',
    )
  })

  it('renders the live CTA anchor (bare) mapped to the internal signup route', async () => {
    const html = await renderArticle(SLUG)
    // The live's anchor is a BARE <a href="https://app.pixelco.io"> — no
    // class attribute. The clone maps it to /signup (R13 CTA mapping).
    expect(html).toContain('<a href="/signup">')
    expect(html).not.toContain('href="https://app.pixelco.io"')
  })

  it('renders the CTA as the default-variant Button with the text arrow', async () => {
    const html = await renderArticle(SLUG)
    // Legacy Button base + default variant + default size, no consumer
    // tail — the same string the live's article footer button renders.
    expect(html).toMatch(
      /<button class="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 \[&amp;_svg\]:pointer-events-none \[&amp;_svg\]:size-4 \[&amp;_svg\]:shrink-0 bg-primary text-primary-foreground hover:bg-primary\/90 h-10 px-4 py-2">Start Identifying Visitors →<\/button>/,
    )
  })

  it('renders the footer on every live article (all ten slugs)', async () => {
    const { BLOG_POSTS } = await import('@/data/blog-posts')
    for (const post of BLOG_POSTS) {
      const html = await renderArticle(post.slug)
      const has = html.includes('border-t border-border mt-14 pt-8') &&
        html.includes('Written by') &&
        html.includes('Start Identifying Visitors →')
      expect(has, `article footer missing on slug: ${post.slug}`).toBe(true)
    }
  })
})
