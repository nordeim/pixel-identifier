import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { SiteFooter } from '@/components/marketing/faq-footer'
import { FOOTER_COLUMNS } from '@/lib/marketing-links'

/**
 * R33-F1 regression pins — the marketing footer's column chrome,
 * runtime-diffed against the live (18th probe generation; evidence:
 * docs/plans/2026-09-24-round33-footer-copy-parity.md).
 *
 * The live (captured on `/` and `/privacy`, consistent across the
 * Product/Company/Legal columns) wraps every footer column in a BARE
 * `<div>` — no class, no aria-label, NOT a nav landmark — and headings
 * are `<h4>`:
 *
 *   <div><h4 class="text-sm font-semibold text-foreground mb-4 uppercase
 *     tracking-wider">Product</h4><ul class="space-y-2.5">…
 *
 * The clone shipped `<nav aria-label={title}>` + `<h3>` since R7 — the
 * heading/wrapper CLASS strings were always byte-identical, so the drift
 * survived 32 rounds: the R18-B8 pins captured only the wordmark lockup
 * and the R32 @375 footer probe compared classes/hrefs/counts, never the
 * tag names (the R26/R32 lesson: never-diffed ≠ absent; the live bundle
 * never changed).
 *
 * The clone's D5 chrome on the LINKS (focus-brand rings) and the wordmark
 * anchor (focus-brand + aria-label) is documented and untouched; these
 * pins scope to the column wrapper + heading tags.
 */

const footer = renderToStaticMarkup(<SiteFooter />)

describe('R33-F1 — footer column headings are H4 (the live tags)', () => {
  for (const column of FOOTER_COLUMNS) {
    it(`renders the ${column.title} column heading as an <h4> with the live class`, () => {
      expect(footer).toContain(
        `<h4 class="text-sm font-semibold text-foreground mb-4 uppercase tracking-wider">${column.title}</h4>`,
      )
    })
  }

  it('ships NO h3 in the footer (the headings were h3 pre-R33)', () => {
    expect(footer).not.toMatch(/<h3[ >]/)
  })
})

describe('R33-F1 — footer column wrappers are BARE divs (no nav landmarks)', () => {
  for (const column of FOOTER_COLUMNS) {
    it(`wraps the ${column.title} column in a bare <div>`, () => {
      // Bare: no class, no aria-label — exactly the live's wrapper.
      expect(footer).toContain(
        `<div><h4 class="text-sm font-semibold text-foreground mb-4 uppercase tracking-wider">${column.title}</h4>`,
      )
    })
  }

  it('ships NO nav landmarks in the footer (the wrappers were <nav aria-label> pre-R33)', () => {
    expect(footer).not.toContain('<nav')
  })

  it('ships no column aria-labels (the wrappers carried aria-label={title} pre-R33)', () => {
    for (const column of FOOTER_COLUMNS) {
      expect(footer).not.toContain(`aria-label="${column.title}"`)
    }
  })
})
