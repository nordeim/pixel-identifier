import Link from 'next/link'
import { getLegalPage } from '@/data/legal-pages'
import { ArticleBody } from '@/components/marketing/article-body'

/**
 * Shared frame for the four legal pages (/privacy, /terms, /gdpr, /ccpa).
 *
 * R13-F8: rebuilt on the live DOM (research/round13-audit/content/
 * page-*.json) — container max-w-3xl, the `← Back to Home` primary link,
 * H1 + "Last updated" line, and the prose-sm/ space-y-8 body whose
 * sections carry direct classes. The policy text comes from
 * src/data/legal-pages.ts (the live copy, converted in the round-13
 * audit — it names the operator Aiviral).
 */
export function LegalPage({ slug }: { slug: string }) {
  const page = getLegalPage(slug)
  if (!page) throw new Error(`unknown legal page: ${slug}`)

  return (
    <div className="container mx-auto px-6 py-16 max-w-3xl">
      <Link href="/" className="text-sm text-primary hover:underline mb-6 inline-block">
        ← Back to Home
      </Link>
      <h1 className="text-4xl font-bold text-foreground mb-2">{page.title}</h1>
      <p className="text-muted-foreground mb-10">Last updated: {page.lastUpdated}</p>
      <ArticleBody content={page.content} variant="legal" />
    </div>
  )
}

export const SUPPORT_EMAIL = 'support@pixelco.io'
