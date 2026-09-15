import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Clock } from 'lucide-react'
import { sortedPosts } from '@/data/blog-posts'
import { formatDate } from '@/lib/format'

export const metadata: Metadata = {
  title: 'Blog',
  description:
    'Insights on visitor identification, lead generation, and modern marketing — from the team building the future of identity resolution.',
}

export default function BlogIndexPage() {
  const posts = sortedPosts()

  return (
    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:py-20">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
          The Pixelco Blog
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
          Insights on visitor identification, lead generation, and modern
          marketing — from the team building the future of identity
          resolution.
        </p>
      </div>

      <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <article
            key={post.slug}
            className="flex flex-col rounded-xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                {post.category}
              </span>
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                {post.readMinutes} min read
              </span>
            </div>
            <h2 className="mt-4 text-lg font-bold leading-snug tracking-tight text-foreground">
              <Link
                href={`/blog/${post.slug}`}
                className="transition-colors hover:text-amber-700 focus-brand"
              >
                {post.title}
              </Link>
            </h2>
            <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
              {post.excerpt}
            </p>
            <div className="mt-5 flex items-center justify-between border-t border-border/60 pt-4">
              <time dateTime={post.dateISO} className="text-xs text-muted-foreground">
                {formatDate(post.dateISO)}
              </time>
              <Link
                href={`/blog/${post.slug}`}
                className="flex items-center gap-1 text-sm font-semibold text-amber-600 transition-colors hover:text-amber-700 focus-brand"
              >
                Read
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
