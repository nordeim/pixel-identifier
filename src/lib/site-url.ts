import 'server-only'

/**
 * Canonical origin for metadata URLs (sitemap, OG, canonical). Uses
 * NEXTAUTH_URL when set (it is already required and canonical in every
 * deployment), falling back to localhost for fresh checkouts.
 */
export function siteUrl(): string {
  const raw = process.env.NEXTAUTH_URL ?? 'http://localhost:3000'
  return raw.replace(/\/+$/, '')
}
