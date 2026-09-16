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
    // marketing surface while the app keeps Inter. marketing-scope (R10-F1):
    // the live's marketing bundle ships its own palette (pure-white canvas,
    // warm-white cards, cool-gray hairlines, #FFBF00 accent, 10px radius) —
    // scoped here so the app tree keeps the global tokens. bg-background
    // paints the wrapper white so the body's warm canvas never shows.
    <div className="marketing-scope flex min-h-screen flex-col bg-background font-marketing text-foreground">
      <AnnouncementBar />
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  )
}
