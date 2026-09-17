import { MarketingFrame } from '@/components/marketing/marketing-frame'

/**
 * Landing-only chrome (R13-F3): identical to the (marketing) frame plus
 * the dismissible launch-offer bar — the live pixelco.io renders the
 * "🚀 Launch Offer" banner above the header on `/` and on no other page
 * (round-13 audit, banner probe).
 */
export default function LandingLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <MarketingFrame showBanner>{children}</MarketingFrame>
}
