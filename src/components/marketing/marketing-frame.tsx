import { AnnouncementBar } from '@/components/marketing/announcement-bar'
import { SiteHeader } from '@/components/marketing/site-header'
import { SiteFooter } from '@/components/marketing/faq-footer'
import { RevealObserver } from '@/components/marketing/reveal-observer'

/**
 * Shared marketing chrome (R13-F3): the wrapper, pre-paint reveal script,
 * sticky header, footer and the reveal observer — everything the landing
 * and the sub-pages have in common.
 *
 * The announcement bar is deliberately NOT unconditional: the live
 * pixelco.io renders it only on `/` (round-13 audit — every sub-page
 * starts directly with the header), so the `(landing)` route group passes
 * showBanner and the `(marketing)` group does not.
 */
export function MarketingFrame({
  showBanner = false,
  children,
}: Readonly<{
  showBanner?: boolean
  children: React.ReactNode
}>) {
  return (
    // font-marketing (R5-H1): the live pixelco.io renders DM Sans on every
    // marketing surface while the app keeps Inter. marketing-scope (R10-F1):
    // the live's marketing bundle ships its own palette (pure-white canvas,
    // warm-white cards, cool-gray hairlines, #FFBF00 accent, 10px radius) —
    // scoped here so the app tree keeps the global tokens. bg-background
    // paints the wrapper white so the body's warm canvas never shows.
    //
    // R12-F1: the blocking inline script adds `js-reveal` to <html> BEFORE
    // the reveal elements paint (so the hidden state applies from the first
    // frame) — without JS the class never lands and the page renders fully
    // visible (progressive enhancement; the live's CSR shell has no such
    // fallback).
    <div className="marketing-scope flex min-h-screen flex-col bg-background font-marketing text-foreground">
      <script
        dangerouslySetInnerHTML={{
          __html: 'document.documentElement.classList.add("js-reveal")',
        }}
      />
      {showBanner && <AnnouncementBar />}
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
      <RevealObserver />
    </div>
  )
}
