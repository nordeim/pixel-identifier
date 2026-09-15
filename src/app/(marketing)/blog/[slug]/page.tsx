import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Clock } from 'lucide-react'
import { BLOG_POSTS, getPostBySlug } from '@/data/blog-posts'
import { ArticleBody } from '@/components/marketing/article-body'
import { formatDate } from '@/lib/format'

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

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params
  const post = getPostBySlug(slug)
  if (!post) notFound()

  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:py-20">
      <Link
        href="/blog"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-amber-600 transition-colors hover:text-amber-700 focus-brand"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to Blog
      </Link>

      <header className="mt-6">
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
            {post.category}
          </span>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5" aria-hidden="true" />
            {post.readMinutes} min read
          </span>
          <time dateTime={post.dateISO} className="text-xs text-muted-foreground">
            {formatDate(post.dateISO)}
          </time>
        </div>
        <h1 className="mt-4 text-3xl font-extrabold leading-tight tracking-tight text-foreground sm:text-4xl">
          {post.title}
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-muted-foreground">{post.excerpt}</p>
      </header>

      <div className="mt-10">
        <ArticleBody content={post.content} />
      </div>
    </div>
  )
}
