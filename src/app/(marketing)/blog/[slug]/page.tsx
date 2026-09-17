import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { BLOG_POSTS, getPostBySlug } from '@/data/blog-posts'
import { ArticleBody } from '@/components/marketing/article-body'
import { formatDateLong } from '@/lib/format'

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
  return { title: post.title, description: post.excerpt }
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
      </div>
    </article>
  )
}
