import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { BLOG_POSTS, getPostBySlug } from '@/data/blog-posts'
import { ArticleBody } from '@/components/marketing/article-body'
import { Button } from '@/components/ui/button'
import { formatDateLong } from '@/lib/format'
import { marketingMetadata } from '@/lib/marketing-seo'

interface ArticlePageProps {
  params: Promise<{ slug: string }>
}

export function generateStaticParams(): { slug: string }[] {
  return BLOG_POSTS.map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params
  const post = getPostBySlug(slug)
  if (!post) return { title: 'Blog' }
  // R14-F2/F3: the live ships "{title} | Pixelco" (template suffix) and
  // its own meta description — distinct from the card excerpt.
  return marketingMetadata({
    title: `${post.title} | Pixelco`,
    description: post.metaDescription,
    path: `/blog/${post.slug}`,
  })
}

/**
 * R13-F7: chrome rebuilt on the live DOM (research/round13-audit/content/
 * meta-*.json) — a Home / Blog / title breadcrumb, the text-only
 * metadata row (chip + full date + read time, no icons), the live H1
 * treatment, and the prose body whose arbitrary-variant wrapper styles
 * classless elements.
 */
export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params
  const post = getPostBySlug(slug)
  if (!post) notFound()

  return (
    <article className="container mx-auto px-6 py-16 max-w-3xl">
      <nav className="mb-4" aria-label="Breadcrumb">
        <ol className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <li>
            <Link href="/" className="hover:text-foreground transition-colors focus-brand">Home</Link>
          </li>
          <li>/</li>
          <li>
            <Link href="/blog" className="hover:text-foreground transition-colors focus-brand">Blog</Link>
          </li>
          <li>/</li>
          <li className="text-foreground truncate max-w-[200px]">{post.title}</li>
        </ol>
      </nav>

      <div>
        <div className="flex items-center gap-3 mb-4 mt-4">
          <span className="text-xs font-medium text-primary bg-primary/10 px-2.5 py-1 rounded-full">
            {post.category}
          </span>
          <span className="text-xs text-muted-foreground">{formatDateLong(post.dateISO)}</span>
          <span className="text-xs text-muted-foreground">{post.readMinutes} min read</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-6 leading-tight">
          {post.title}
        </h1>
        <ArticleBody content={post.content} variant="blog" />
        {/* R32-F1: the live's article footer, runtime-captured — a
            bordered block after the prose body with the byline (author
            constant "Pixelco Team" on every live article) and the bare
            anchor-wrapped default-variant CTA. The arrow is a TEXT
            character (U+2192), the sub-page ← convention's forward twin;
            the anchor maps the live's app.pixelco.io href to /signup per
            the standing CTA mapping. Missed by the R13 audit (its capture
            recorded only breadcrumb/meta/h1) — never-diffed ≠ absent. */}
        <div className="border-t border-border mt-14 pt-8">
          <p className="text-sm text-muted-foreground mb-4">
            Written by <strong className="text-foreground">Pixelco Team</strong>
          </p>
          <Link href="/signup">
            <Button>Start Identifying Visitors →</Button>
          </Link>
        </div>
      </div>
    </article>
  )
}
