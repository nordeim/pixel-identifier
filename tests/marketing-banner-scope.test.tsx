import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { renderToStaticMarkup } from 'react-dom/server'
import { MarketingFrame } from '@/components/marketing/marketing-frame'

const read = (p: string) => readFileSync(join(process.cwd(), p), 'utf8')

/**
 * R13-F3: the live pixelco.io announcement bar ("🚀 Launch Offer — …")
 * renders ONLY on the landing page — every sub-page (about, blog, docs,
 * legal) starts directly with the sticky header (round-13 audit: live
 * banner probe / = YES, /about /blog /docs /privacy = no; the clone
 * rendered it everywhere via the shared layout). The fix splits the
 * marketing tree into two sibling route groups sharing one frame:
 * `(landing)` (banner) and `(marketing)` (no banner).
 */
describe('R13-F3: the announcement bar is landing-page-only', () => {
  it('MarketingFrame renders the bar when showBanner is set (the landing)', () => {
    const html = renderToStaticMarkup(
      <MarketingFrame showBanner>
        <p>content</p>
      </MarketingFrame>,
    )
    expect(html).toContain('Launch Offer — Get 100 free visitor identifications')
    // the bar sits ABOVE the header in the DOM, like the live
    const barIdx = html.indexOf('Launch Offer')
    const headerIdx = html.indexOf('<header')
    expect(headerIdx).toBeGreaterThan(barIdx)
  })

  it('MarketingFrame omits the bar by default (sub-pages)', () => {
    const html = renderToStaticMarkup(
      <MarketingFrame>
        <p>content</p>
      </MarketingFrame>,
    )
    expect(html).not.toContain('Launch Offer')
    expect(html).toContain('<header')
  })

  it('the landing lives in (landing) and mounts the banner; sub-pages stay in (marketing) without it', () => {
    const landingLayout = read('src/app/(landing)/layout.tsx')
    expect(landingLayout).toContain('showBanner')
    expect(landingLayout).toContain('MarketingFrame')

    const marketingLayout = read('src/app/(marketing)/layout.tsx')
    expect(marketingLayout).not.toContain('showBanner')
    expect(marketingLayout).not.toContain('AnnouncementBar')
    expect(marketingLayout).toContain('MarketingFrame')
  })

  it('the landing page file moved out of (marketing) (no route conflict)', () => {
    let marketingPage = ''
    try {
      marketingPage = read('src/app/(marketing)/page.tsx')
    } catch {
      // expected: the file no longer exists
    }
    expect(marketingPage).toBe('')
    const landingPage = read('src/app/(landing)/page.tsx')
    expect(landingPage).toContain('LandingPage')
  })
})
