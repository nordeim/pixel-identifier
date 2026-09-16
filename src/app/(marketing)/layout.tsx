import { AnnouncementBar } from '@/components/marketing/announcement-bar'
import { SiteHeader } from '@/components/marketing/site-header'
import { SiteFooter } from '@/components/marketing/faq-footer'

/**
 * Shared chrome for every marketing page (landing, about, blog, docs,
 * legal). The route group adds no URL segment — pages keep their root
 * paths (`/`, `/about`, `/blog`, …) while getting the announcement bar,
 * header and footer for free.
 */
export default function MarketingLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    // font-marketing (R5-H1): the live pixelco.io renders DM Sans on every
    // marketing surface while the app keeps Inter. The arbitrary-property
    // override re-scopes --primary to the live marketing bundle's measured
    // hsl(45 100% 50%) = #FFBF00 (R7-V3) — the app bundle keeps #FFC105.
    <div className="flex min-h-screen flex-col font-marketing [--primary:#ffbf00]">
      <AnnouncementBar />
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  )
}
