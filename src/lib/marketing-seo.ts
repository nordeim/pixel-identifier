import type { Metadata } from 'next'

/**
 * Marketing-page metadata builder (R14).
 *
 * The live pixelco.io is a CSR SPA — its raw HTML ships one static shell,
 * but its router sets per-page `title`, `description`, `og:*`, `twitter:*`
 * and `canonical` on navigation (round-14 audit: research/round14-audit/
 * content/live-meta-all.jsonl). This helper reproduces that per-page head
 * on the server for every marketing route:
 *
 * - `title` renders verbatim (`title.absolute` — the live's titles carry
 *   their own suffix patterns, e.g. "Privacy Policy | Pixelco")
 * - `og:title` / `twitter:title` = the page title (the live mirrors them)
 * - `og:description` / `twitter:description` = the page description
 * - one shared 1200×630 social image (self-hosted at /og-image.webp —
 *   the live hotlinks its builder's storage; the clone keeps the
 *   deployment self-contained)
 * - per-page `og:url` + `canonical` (resolved against `metadataBase`)
 *
 * Parity rulings: `twitter:site @Lovable` (the live app's build-platform
 * artifact) is NOT replicated; app-bundle pages use `appSeoMetadata()`
 * from `@/lib/app-seo` instead.
 */
export function marketingMetadata(input: {
  title: string
  description: string
  /** Route path, e.g. '/about' or '/blog/slug' — drives og:url + canonical. */
  path: string
}): Metadata {
  const { title, description, path } = input

  return {
    title: { absolute: title },
    description,
    openGraph: {
      title,
      description,
      url: path,
      siteName: 'Pixelco',
      locale: 'en_US',
      type: 'website',
      images: [{ url: '/og-image.webp', width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    alternates: {
      canonical: path,
    },
  }
}
