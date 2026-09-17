import { MarketingFrame } from '@/components/marketing/marketing-frame'

/**
 * Shared chrome for every marketing SUB-page (about, blog, docs, legal).
 * The route group adds no URL segment — pages keep their root paths
 * (`/about`, `/blog`, …) while getting the header and footer for free.
 *
 * R13-F3: the announcement bar lives on the landing only (the live
 * pixelco.io shows it on `/` and nowhere else), so it is NOT mounted
 * here — the `(landing)` sibling group owns it.
 */
export default function MarketingLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <MarketingFrame>{children}</MarketingFrame>
}
