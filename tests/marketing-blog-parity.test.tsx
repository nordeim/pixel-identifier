import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import BlogIndex from '@/app/(marketing)/blog/page'
import ArticlePage, {
  generateStaticParams,
} from '@/app/(marketing)/blog/[slug]/page'
import { BLOG_POSTS, getPostBySlug } from '@/data/blog-posts'
import { ArticleBody } from '@/components/marketing/article-body'
import { formatDateLong } from '@/lib/format'

/**
 * R13-F6/F7/F9: blog index cards, article chrome (breadcrumb, metadata
 * row, prose wrapper) and the full-month date format, all pinned to the
 * live DOM (research/round13-audit/content/blog-index-meta.json +
 * meta-*.json). The article bodies are the live copy (ported via the
 * round-13 converter; spot-pinned below by distinctive live strings).
 */
const index = renderToStaticMarkup(<BlogIndex />)

async function renderArticle(slug: string): Promise<string> {
  const tree = await ArticlePage({ params: Promise.resolve({ slug }) })
  return renderToStaticMarkup(tree as React.ReactElement)
}

describe('R13-F6: blog index matches the live card structure', () => {
  it('renders the live header block', () => {
    expect(index).toContain('class="container mx-auto px-6 py-16 max-w-5xl"')
    expect(index).toContain('class="text-center mb-14"')
    expect(index).toContain('class="text-4xl md:text-5xl font-bold text-foreground mb-4"')
    expect(index).toContain('The Pixelco Blog')
    expect(index).toContain('class="text-lg text-muted-foreground max-w-2xl mx-auto"')
  })

  it('renders the live 3-column grid', () => {
    expect(index).toContain('class="grid gap-8 md:grid-cols-2 lg:grid-cols-3"')
  })

  it('renders cards on the live A.group recipe with tag + clock chips', () => {
    expect(index).toContain(
      'class="group block h-full rounded-xl border border-border bg-card p-6 hover:border-primary/40 hover:shadow-lg transition-all duration-300"',
    )
    expect(index).toContain(
      'class="inline-flex items-center gap-1 text-xs font-medium text-primary bg-primary/10 px-2.5 py-1 rounded-full"',
    )
    expect(index).toContain('lucide-tag')
    expect(index).toContain('class="flex items-center gap-1 text-xs text-muted-foreground"')
    expect(index).toContain('lucide-clock')
    expect(index).toContain('min read')
  })

  it('renders the live card bottom row (full date + Read arrow)', () => {
    expect(index).toContain(
      'class="text-sm text-primary font-medium flex items-center gap-1 group-hover:gap-2 transition-all"',
    )
    expect(index).toContain('>Read <svg')
    expect(index).toContain('lucide-arrow-right')
    expect(index).toContain('dateTime="2026-09-10"')
    expect(index).toContain('September 10, 2026')
  })

  it('renders the live card H2 hover treatment and excerpt', () => {
    expect(index).toContain(
      'class="text-lg font-semibold text-foreground group-hover:text-primary transition-colors mb-2 leading-snug"',
    )
    expect(index).toContain('class="text-sm text-muted-foreground leading-relaxed mb-4"')
  })
})

describe('R13-F7: article page chrome matches the live', () => {
  const first = BLOG_POSTS.find((p) => p.slug === 'flcmarkets-free-prop-trading-challenge')
  expect(first).toBeDefined()
  const body = renderToStaticMarkup(
    <ArticleBody content={first!.content} variant="blog" />,
  )

  it('renders the breadcrumb (Home / Blog / truncated title)', async () => {
    const html = await renderArticle('flcmarkets-free-prop-trading-challenge')
    expect(html).toContain('aria-label="Breadcrumb"')
    expect(html).toContain('class="flex items-center gap-1.5 text-xs text-muted-foreground"')
    expect(html).toContain('>Home</a>')
    expect(html).toContain('>Blog</a>')
    expect(html).toContain('class="text-foreground truncate max-w-[200px]"')
  })

  it('renders the live article container + metadata row + H1', async () => {
    const html = await renderArticle('flcmarkets-free-prop-trading-challenge')
    expect(html).toContain('class="container mx-auto px-6 py-16 max-w-3xl"')
    // plain chip (no icon) + full date + read time, live order
    expect(html).toContain('class="text-xs font-medium text-primary bg-primary/10 px-2.5 py-1 rounded-full"')
    expect(html).toContain('>Fintech</span>')
    expect(html).toContain('September 10, 2026')
    expect(html).toContain('7 min read')
    expect(html).toContain('class="text-3xl md:text-4xl font-bold text-foreground mb-6 leading-tight"')
    // metadata row has NO clock icon (the live ships text-only)
    expect(html).not.toContain('lucide-clock')
  })

  it('renders the live prose wrapper with the arbitrary-variant styling', () => {
    expect(body).toContain('prose prose-sm max-w-none text-muted-foreground leading-relaxed space-y-4')
    expect(body).toContain('[&amp;_h2]:text-xl')
    expect(body).toContain('[&amp;_a]:text-primary')
    // elements inside are classless — the wrapper styles them
    expect(body).not.toMatch(/<h2[^>]*class=/)
    expect(body).not.toMatch(/<ul[^>]*class=/)
    expect(body).not.toMatch(/<a[^>]*class=/)
  })

  it('renders ## blocks as h2 with the live headings', () => {
    expect(body).toContain('<h2>How the FLC Markets Challenge Works</h2>')
    expect(body).toContain('<h2>Where Visitor Identification Fits In</h2>')
  })

  it('keeps the amber link treatment out (live uses wrapper-styled links)', () => {
    expect(body).not.toContain('text-amber-700')
    expect(body).not.toContain('underline-offset-2')
  })

  it('drops the trailing "Try Pixelco free" CTA (the live has none)', () => {
    expect(body).not.toContain('Try Pixelco free')
    expect(body).not.toContain('Curious who is browsing your site right now?')
  })

  it('maps app.pixelco.io CTA links to the internal signup route', () => {
    expect(body).not.toContain('app.pixelco.io')
    const all = BLOG_POSTS.map((p) => p.content).join(' ')
    expect(all).not.toContain('app.pixelco.io')
  })
})

describe('R13-F9: dates render in the full-month live format', () => {
  it('formatDateLong produces "September 10, 2026" (the dashboard keeps short dates)', () => {
    expect(formatDateLong('2026-09-10')).toBe('September 10, 2026')
  })
})

describe('R13-D3: all ten posts carry the live article copy', () => {
  it('generateStaticParams still covers the ten live slugs', () => {
    expect(generateStaticParams()).toHaveLength(10)
  })

  it.each([
    ['flcmarkets-free-prop-trading-challenge', 'Prop trading has become one of the fastest-growing corners of fintech'],
    ['talktome-bio-monetize-link-in-bio-messages', 'link-in-bio'],
    ['personpages-lookup-anyone-salary-net-worth-address', 'PersonPages'],
    ['aiviral-ai-b2b-lead-generation-outreach', 'AIViral'],
    ['identify-anonymous-website-visitors', 'anonymous'],
    ['website-visitor-tracking-vs-analytics', 'Google Analytics'],
    ['best-visitor-identification-tools-2026', 'Clearbit (now part of HubSpot)'],
    ['increase-email-list-with-visitor-identification', 'email list'],
    ['retargeting-without-cookies', 'third-party cookies'],
    ['gdpr-compliant-visitor-tracking', 'GDPR'],
  ])('%s contains live-derived body text', (slug, needle) => {
    const post = getPostBySlug(slug)
    expect(post).toBeDefined()
    expect(post!.content).toContain(needle)
    // every post body now uses live headings (## or ###)
    expect(post!.content).toMatch(/^##+ /m)
  })

  it('the live comparison-post headings are present (spot pins)', () => {
    const tools = getPostBySlug('best-visitor-identification-tools-2026')
    expect(tools!.content).toContain('## 1. Pixelco')
    expect(tools!.content).toContain('## 2. Clearbit (now part of HubSpot)')
    expect(tools!.content).toContain('## 7. Visitor Queue')
    expect(tools!.content).toContain('## The Verdict: B2B vs. B2C Matters Most')
  })
})
