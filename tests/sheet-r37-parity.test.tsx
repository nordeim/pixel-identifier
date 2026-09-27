import { describe, expect, it, vi } from 'vitest'
import { readFileSync } from 'node:fs'
import { renderToStaticMarkup } from 'react-dom/server'

import { SidebarNav } from '@/components/dashboard/sidebar-nav'

vi.mock('next/navigation', () => ({
  usePathname: () => '/dashboard',
}))
vi.mock('next-auth/react', () => ({ signOut: vi.fn() }))

/**
 * R37 sheet parity (22nd probe generation — live verified 2026-09-28 at
 * 375 px on app.pixelco.io, logged in, `[role=dialog]` children dumps on
 * both sides):
 *
 * The live's mobile dashboard Sheet ships the LEGACY shadcn sheet
 * generation (the same generation discipline as the repo's other UI
 * primitives), and its content tree is LEANER than the desktop rail's:
 *
 * - F1a the SheetContent consumer tail is `w-[--sidebar-width] bg-sidebar
 *   p-0 text-sidebar-foreground [&>button]:hidden` — the last fragment
 *   CSS-hides the primitive's close button (computed display: none on the
 *   live; the clone showed the X next to the logo before this round).
 * - F1b the primitive is the LEGACY generation: overlay `bg-black/80`
 *   (the new-gen `bg-black/50` is visibly lighter), content base WITHOUT
 *   `flex flex-col` (`fixed z-50 gap-4 bg-background p-6 shadow-lg
 *   transition ease-in-out …`), close `absolute right-4 top-4 rounded-sm …
 *   focus:outline-none` with the `h-4 w-4` X (not `rounded-xs` /
 *   `focus:outline-hidden` / `size-4`), and NO data-slot attrs on any
 *   rendered element (the live's dialog attr list has none).
 * - F1c the overlay is the live's darker 80% black.
 * - F1d the mobile Sheet's inner wrapper is the LEAN
 *   `div.flex h-full w-full flex-col` — class-only, NO data-sidebar attr,
 *   NO bg-sidebar / group-data-[variant=floating] classes. The DESKTOP
 *   rail keeps the full wrapper (byte-identical both sides — re-verified
 *   this round); the lean form is mobile-specific.
 * - F1e the live's dialog ships NO title element (its aria-labelledby
 *   dangles — a React-18-Radix artifact); the clone's sr-only H2 is
 *   removed.
 *
 * DOM bytes captured on the live this round (probe transcripts in
 * docs/plans/2026-09-28-round37-mobile-sheet-legacy-parity.md):
 *
 *   dialog class: "fixed z-50 gap-4 shadow-lg transition ease-in-out
 *     data-[state=open]:animate-in data-[state=closed]:animate-out
 *     data-[state=closed]:duration-300 data-[state=open]:duration-500
 *     inset-y-0 left-0 h-full border-r data-[state=closed]:slide-out-to-left
 *     data-[state=open]:slide-in-from-left sm:max-w-sm w-[--sidebar-width]
 *     bg-sidebar p-0 text-sidebar-foreground [&>button]:hidden"
 *   overlay class: "fixed inset-0 z-50 bg-black/80
 *     data-[state=open]:animate-in data-[state=closed]:animate-out
 *     data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
 *   close class: "absolute right-4 top-4 rounded-sm opacity-70
 *     ring-offset-background transition-opacity data-[state=open]:bg-secondary
 *     hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring
 *     focus:ring-offset-2 disabled:pointer-events-none" (svg: lucide-x
 *     h-4 w-4 — hidden via [&>button]:hidden)
 *   inner: <div class="flex h-full w-full flex-col"> (no attrs)
 */
const read = (file: string) => readFileSync(file, 'utf8')

const sheet = read('src/components/ui/sheet.tsx')
const topbar = read('src/components/dashboard/topbar.tsx')

const usage = {
  planName: 'FREE',
  used: 3,
  limit: 100,
  percent: 3,
  period: 'lifetime' as const,
  overage: 0,
  overageCostLabel: '$0.00',
}

describe('R37 F1b — the legacy sheet primitive (source pins)', () => {
  it('the overlay is the live legacy string: bg-black/80, fixed-first order', () => {
    expect(sheet).toContain(
      'fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
    )
    // The new-gen 50% overlay must be gone.
    expect(sheet).not.toContain('bg-black/50')
  })

  it('the content base is the legacy string — NO flex flex-col, bg-background p-6 displaced by consumers', () => {
    expect(sheet).toContain(
      'fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:duration-300 data-[state=open]:duration-500',
    )
    // The new-gen base added flex flex-col — the live's dialog has none.
    expect(sheet).not.toContain('fixed z-50 flex flex-col gap-4')
  })

  it('the left side variant is the legacy geometry (w-3/4 border-r slides sm:max-w-sm)', () => {
    expect(sheet).toContain(
      'inset-y-0 left-0 h-full w-3/4 border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-sm',
    )
  })

  it('the close button is the legacy string (right-4 top-4 rounded-sm, focus:outline-none, h-4 w-4 X)', () => {
    expect(sheet).toContain(
      'absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity data-[state=open]:bg-secondary hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none',
    )
    expect(sheet).toMatch(/<X[^>]*className="h-4 w-4"/)
    // New-gen fragments must be gone.
    expect(sheet).not.toContain('rounded-xs')
    expect(sheet).not.toContain('focus:outline-hidden')
    expect(sheet).not.toContain('size-4')
  })

  it('the primitive renders NO data-slot attrs (the live dialog attr list has none)', () => {
    expect(sheet).not.toContain('data-slot')
  })
})

describe('R37 F1a/F1e — the topbar consumer (source pins)', () => {
  it("the SheetContent tail is the live's: text-sidebar-foreground + [&>button]:hidden (hides the X)", () => {
    expect(topbar).toContain(
      'w-[--sidebar-width] bg-sidebar p-0 text-sidebar-foreground [&>button]:hidden',
    )
  })

  it('the mobile Sheet renders NO title (the live ships no title element)', () => {
    expect(topbar).not.toContain('SheetTitle')
    expect(topbar).not.toContain('Dashboard navigation')
  })

  it('the Sheet keeps the live wiring: data-sidebar, data-mobile, inline 18rem, close-on-nav state', () => {
    expect(topbar).toContain(`data-sidebar="sidebar"`)
    expect(topbar).toContain(`data-mobile="true"`)
    expect(topbar).toMatch(/'--sidebar-width': '18rem'/)
    // The R23-F3 behavior pins still hold (kept green by this round).
    expect(topbar).toMatch(/const mobileNavOpen = sheetPathname !== null && sheetPathname === pathname/)
  })

  it('the mobile Sheet mounts SidebarNav in mobile mode', () => {
    expect(topbar).toMatch(/<SidebarNav usage=\{usage\} mobile/)
  })
})

describe('R37 F1d — the lean mobile inner vs the full desktop wrapper (SSR pins)', () => {
  it('desktop (default): the full data-sidebar=sidebar wrapper with the live classes', () => {
    const desktop = renderToStaticMarkup(<SidebarNav usage={usage} />)
    expect(desktop).toContain('data-sidebar="sidebar"')
    expect(desktop).toContain(
      'class="flex h-full w-full flex-col bg-sidebar group-data-[variant=floating]:rounded-lg group-data-[variant=floating]:border group-data-[variant=floating]:border-sidebar-border group-data-[variant=floating]:shadow"',
    )
  })

  it('mobile: the LEAN wrapper — flex h-full w-full flex-col, NO data-sidebar=sidebar, NO group-data classes', () => {
    const mobile = renderToStaticMarkup(<SidebarNav usage={usage} mobile />)
    expect(mobile).toContain('class="flex h-full w-full flex-col"')
    expect(mobile).not.toContain('data-sidebar="sidebar"')
    expect(mobile).not.toContain('group-data-[variant=floating]')
  })

  it('mobile keeps the full nav TREE (header/content/groups/menu attrs, 7 links, usage card)', () => {
    const mobile = renderToStaticMarkup(<SidebarNav usage={usage} mobile />)
    expect(mobile).toContain('data-sidebar="header"')
    expect(mobile).toContain('data-sidebar="content"')
    expect(mobile).toContain('data-sidebar="group"')
    expect(mobile).toContain('data-sidebar="menu"')
    expect(mobile).toContain('data-sidebar="footer"')
    expect(mobile).toContain('aria-current="page"')
    expect(mobile).toContain('3 / 100 identifications')
    expect(mobile).toContain('Sign out')
  })
})
