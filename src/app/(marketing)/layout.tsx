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
    <div className="flex min-h-screen flex-col">
      <AnnouncementBar />
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  )
}
