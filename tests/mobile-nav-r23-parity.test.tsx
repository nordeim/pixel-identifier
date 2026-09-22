import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'

/**
 * R23 mobile-nav parity (8th probe generation — live verified 2026-09-22 at
 * 375 px, app.pixelco.io + pixelco.io logged-in/out probes):
 *
 * - F3 the dashboard mobile Sheet must CLOSE on navigation (the live's
 *   dialog unmounts after a nav-link click; the clone kept it open).
 * - F4 the marketing mobile toggle icons are `w-6 h-6` on the live
 *   (`lucide lucide-menu w-6 h-6` / `lucide-x w-6 h-6` — 24 px, lucide's
 *   default, no size classes on the button itself).
 * - F5-F7 announcement-bar emission orders: the Claim Now link tail is
 *   `hover:opacity-80 transition-opacity` (hover BEFORE transition), the
 *   arrow is `w-3.5 h-3.5` (w-before-h), the dismiss button carries NO
 *   `transition-opacity`, the X icon is `w-4 h-4`.
 */
const read = (file: string) => readFileSync(file, 'utf8')

const header = read('src/components/marketing/site-header.tsx')
const bar = read('src/components/marketing/announcement-bar.tsx')
const topbar = read('src/components/dashboard/topbar.tsx')

describe('R23 F4 — the live mobile toggle icons', () => {
  it('the Menu icon ships w-6 h-6 (the live: lucide-menu w-6 h-6)', () => {
    expect(header).toMatch(/<Menu[^/]*className="w-6 h-6"/)
  })

  it('the X icon ships w-6 h-6 (the live: lucide-x w-6 h-6)', () => {
    expect(header).toMatch(/<X[^/]*className="w-6 h-6"/)
  })

  it('the toggle button keeps the live classes (md:hidden text-foreground)', () => {
    expect(header).toContain('md:hidden text-foreground')
  })
})

describe('R23 F3 — the mobile Sheet closes on navigation', () => {
  it("the open state DERIVES from the pathname — any navigation closes the Sheet (the live's dialog unmounts)", () => {
    // Effect-free pattern (react-hooks/set-state-in-effect-safe): the sheet
    // is open only while the pathname is the one it was opened on, so link
    // clicks AND back/forward navigation close it. Browser-level behavior
    // is pinned by e2e/dashboard.spec.ts (R23-F3 regression).
    expect(topbar).toMatch(/const mobileNavOpen = sheetPathname !== null && sheetPathname === pathname/)
    expect(topbar).toMatch(/setSheetPathname\(mobileNavOpen \? null : pathname\)/)
  })

  it('the sheet state stays client-side (open + onOpenChange wiring intact)', () => {
    expect(topbar).toContain('open={mobileNavOpen}')
    expect(topbar).toMatch(/if \(!open\) setSheetPathname\(null\)/)
  })
})

describe('R23 F5-F7 — announcement-bar emission orders (live-verbatim)', () => {
  it('the Claim Now link tail is hover:opacity-80 transition-opacity (live order)', () => {
    expect(bar).toContain(
      'underline underline-offset-2 hover:opacity-80 transition-opacity',
    )
    expect(bar).not.toContain(
      'underline underline-offset-2 transition-opacity hover:opacity-80',
    )
  })

  it('the Claim Now arrow is w-3.5 h-3.5 (the live: lucide-arrow-right w-3.5 h-3.5)', () => {
    expect(bar).toMatch(/<ArrowRight[^/]*className="w-3.5 h-3.5"/)
  })

  it('the dismiss button carries no live-absent transition-opacity', () => {
    // Live: `absolute right-4 top-1/2 -translate-y-1/2 hover:opacity-70` —
    // the clone's focus-visible chain stays (D5-class a11y chrome).
    const dismiss = bar.match(
      /aria-label="Dismiss announcement"[\s\S]{0,400}?className="([^"]*)"/,
    )
    expect(dismiss).toBeTruthy()
    expect(dismiss![1]).not.toContain('transition-opacity')
    expect(dismiss![1]).toContain('hover:opacity-70')
  })

  it('the dismiss X icon is w-4 h-4 (the live: lucide-x w-4 h-4)', () => {
    expect(bar).toMatch(/<X[^/]*className="w-4 h-4"/)
  })
})
