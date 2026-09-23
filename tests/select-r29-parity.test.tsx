import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { renderToStaticMarkup } from 'react-dom/server'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

/**
 * R29-F1 pins — the Radix Select ITEM class-attribute order, runtime-captured
 * on the live's open portal (14th probe generation; evidence: the live
 * captures in docs/plans/2026-09-23-round29-select-item-class-order.md).
 *
 * The live renders, on ALL THREE of its Select surfaces (visitors confidence
 * filter, visitors source filter, install DomainSwitcher):
 *
 *   class="relative flex w-full cursor-default select-none items-center
 *   rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none
 *   data-[disabled]:pointer-events-none data-[disabled]:opacity-50
 *   focus:bg-accent focus:text-accent-foreground"
 *
 * — the data-[disabled]: pair BEFORE the focus: pair. The clone shipped the
 * canonical legacy-shadcn order (focus: first), which the R11 ground truth
 * recorded from the live's OLD bundle; the live's bundle flipped the order
 * in the R11→R16 window (the sidebar-migration redeploy). The live's DOM is
 * the contract.
 *
 * Rendered CSS is identical either way (Tailwind attribute order carries no
 * specificity) — this is pure DOM-byte parity. The runtime rendering is
 * pinned by e2e/select.spec.ts (the portal items only exist in a real
 * browser); this file pins the source string that produces them plus the
 * statically-renderable trigger surface.
 */

const LIVE_ITEM_CLASS =
  'relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 focus:bg-accent focus:text-accent-foreground'

/** The R11-era legacy order — focus: BEFORE data-[disabled]: (retired). */
const LEGACY_TAIL =
  'outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none'

const src = (rel: string) =>
  readFileSync(join(process.cwd(), rel), 'utf-8')

describe('R29-F1 — the SelectItem class order (source pins)', () => {
  const source = src('src/components/ui/select.tsx')

  it('ships the live item class string verbatim (data-[disabled] pair first)', () => {
    expect(source).toContain(LIVE_ITEM_CLASS)
  })

  it('retires the legacy focus-first order (the R11-era bundle shipped it)', () => {
    expect(source).not.toContain(LEGACY_TAIL)
  })

  it('keeps the indicator-LEFT padding layout (pl-8 pr-2 — unchanged)', () => {
    // The reorder must not touch the layout tokens around it: the live
    // keeps the check indicator on the LEFT (pl-8) — R21/R11 parity.
    expect(source).toContain('rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none')
    expect(source).not.toContain('pl-2 pr-8')
  })

  it('keeps the indicator span + lucide check + ItemText structure', () => {
    expect(source).toContain(
      '"absolute left-2 flex h-3.5 w-3.5 items-center justify-center"',
    )
    expect(source).toContain('<CheckIcon className="h-4 w-4" />')
    expect(source).toContain('<SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>')
  })
})

describe('R29 — the SelectItem consumers render the primitive verbatim', () => {
  it('visitors-table filter SelectItems pass no className override', () => {
    const source = src('src/components/dashboard/visitors-table.tsx')
    expect(source).not.toMatch(/<SelectItem[^>]*\bclassName\b/)
    // The live's band options (R21-F3) ride the primitive string.
    expect(source).toContain('<SelectItem value="all">All Confidence</SelectItem>')
  })

  it('domain-switcher SelectItems pass no className override', () => {
    const source = src('src/components/dashboard/domain-switcher.tsx')
    expect(source).not.toMatch(/<SelectItem[^>]*\bclassName\b/)
  })
})

describe('R29 — the trigger surface (static-render pin, byte-verified 14th probe)', () => {
  it('renders the live trigger class family + chevron (inline, non-portal)', () => {
    const html = renderToStaticMarkup(
      <Select defaultValue="all">
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Confidence</SelectItem>
        </SelectContent>
      </Select>,
    )
    // Trigger button class family (live-captured, order-sensitive).
    expect(html).toContain(
      'class="flex h-10 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&amp;&gt;span]:line-clamp-1"',
    )
    // Chevron: lucide, h-4 w-4, opacity-50, the pinned path.
    expect(html).toContain(
      'class="lucide lucide-chevron-down h-4 w-4 opacity-50"',
    )
    expect(html).toContain('m6 9 6 6 6-6')
    // The portal items do NOT render statically (Radix portal — the item
    // class order is pinned by e2e/select.spec.ts in a real browser).
    expect(html).not.toContain('role="option"')
  })
})
