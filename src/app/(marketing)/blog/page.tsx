import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Clock, Tag } from 'lucide-react'
import { sortedPosts } from '@/data/blog-posts'
import { formatDateLong } from '@/lib/format'

export const metadata: Metadata = {
  title: 'Blog',
  description:
    'Insights on visitor identification, lead generation, and modern marketing — from the team building the future of identity resolution.',
}

/**
 * R13-F6: cards rebuilt on the live DOM (research/round13-audit/content/
 * blog-index-meta.json) — the whole card is one A.group link, the
 * category is a tag-icon chip in primary/10, the read time a clock chip,
 * and the bottom row pairs the full-month date with a "Read →" that
 * widens its gap on hover.
 */
export default function BlogIndexPage() {
  const posts = sortedPosts()

  return (
    <div className="container mx-auto px-6 py-16 max-w-5xl">
      <div className="text-center mb-14">
        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">The Pixelco Blog</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Insights on visitor identification, lead generation, and modern
          marketing — from the team building the future of identity
          resolution.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <article key={post.slug}>
            <Link
              href={`/blog/${post.slug}`}
              className="group block h-full rounded-xl border border-border bg-card p-6 hover:border-primary/40 hover:shadow-lg transition-all duration-300"
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="inline-flex items-center gap-1 text-xs font-medium text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                  <Tag className="w-3 h-3" aria-hidden="true" />
                  {post.category}
                </span>
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" aria-hidden="true" />
                  {post.readMinutes} min read
                </span>
              </div>
              <h2 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors mb-2 leading-snug">
                {post.title}
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">{post.excerpt}</p>
              <div className="flex items-center justify-between">
                <time dateTime={post.dateISO} className="text-xs text-muted-foreground">
                  {formatDateLong(post.dateISO)}
                </time>
                <span className="text-sm text-primary font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                  Read{' '}
                  <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                </span>
              </div>
            </Link>
          </article>
        ))}
      </div>
    </div>
  )
}
