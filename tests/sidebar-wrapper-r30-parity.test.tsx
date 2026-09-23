import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

/**
 * R30-F1 pins — the live's SidebarProvider WRAPPER div, runtime-captured on
 * the live's dashboard DOM at both viewports (15th probe generation;
 * evidence: the live captures in
 * docs/plans/2026-09-23-round30-sidebar-wrapper-install-parity.md).
 *
 * The live renders, OUTSIDE its layout root (`min-h-screen flex w-full
 * bg-muted/30`), on every dashboard page:
 *
 *   <div class="group/sidebar-wrapper flex min-h-svh w-full
 *   has-[[data-variant=inset]]:bg-sidebar"
 *   style="--sidebar-width: 16rem; --sidebar-width-icon: 3rem;">
 *
 * The wrapper carries NO data-* attrs — data-state/data-collapsible/
 * data-variant/data-side stay on the INNER `group peer hidden … md:block`
 * Sidebar element (where the clone already renders them). The clone shipped
 * no wrapper at all: the R15 sidebar pins captured the inner `data-sidebar`
 * tree but stopped one level short. Rendered geometry was compensated by
 * the `:root` vars in globals.css (which STAY — they feed the standalone
 * w-[--sidebar-width] utilities); this is pure DOM-byte parity: a missing
 * element on every dashboard page. The live's DOM is the contract.
 *
 * The runtime rendering is pinned by e2e/dashboard.spec.ts (the wrapper
 * must exist in the browser DOM with the exact class + inline vars);
 * this file pins the source that produces it.
 */

const LIVE_WRAPPER_CLASS =
  'group/sidebar-wrapper flex min-h-svh w-full has-[[data-variant=inset]]:bg-sidebar'

const src = (rel: string) =>
  readFileSync(join(process.cwd(), rel), 'utf-8')

describe('R30-F1 — the SidebarProvider wrapper (source pins)', () => {
  const layout = src('src/app/dashboard/layout.tsx')

  it('renders the live wrapper class verbatim', () => {
    expect(layout).toContain(LIVE_WRAPPER_CLASS)
  })

  it('carries the live inline width vars on the wrapper (16rem / 3rem)', () => {
    expect(layout).toMatch(/--sidebar-width['"]?:\s*['"]16rem['"]/)
    expect(layout).toMatch(/--sidebar-width-icon['"]?:\s*['"]3rem['"]/)
  })

  it('wraps the layout root — the wrapper opens BEFORE min-h-screen root', () => {
    // The wrapper div must open before the `min-h-screen flex w-full
    // bg-muted/30` layout root so the root is INSIDE it (the live's tree:
    // wrapper > min-h-screen root > [SidebarShell, main column]).
    const wrapperIdx = layout.indexOf(LIVE_WRAPPER_CLASS)
    const rootIdx = layout.indexOf('min-h-screen flex w-full bg-muted/30')
    expect(wrapperIdx).toBeGreaterThan(-1)
    expect(rootIdx).toBeGreaterThan(wrapperIdx)
  })

  it('keeps the data-* attrs on the INNER SidebarShell element (not the wrapper)', () => {
    // The live's wrapper carries no data-state/collapsible/variant/side —
    // sidebar-shell.tsx owns those (the R15 pin, unchanged). NOTE: the
    // wrapper's CLASS string legitimately contains `data-variant=inset`
    // as a CSS selector fragment (the has-[[]] arbitrary variant), so the
    // prop check uses the JSX attribute forms.
    const shell = src('src/components/dashboard/sidebar-shell.tsx')
    expect(shell).toContain('data-state=')
    expect(shell).toContain('data-collapsible=')
    expect(shell).toContain('data-variant="sidebar"')
    expect(shell).toContain('data-side="left"')
    const layoutLines = layout.split('\n')
    const wrapperIdx = layoutLines.findIndex((l) => l.includes(LIVE_WRAPPER_CLASS))
    // the wrapper's opening tag: the className line + the style line only
    const wrapperTag = layoutLines.slice(wrapperIdx - 1, wrapperIdx + 2).join('\n')
    expect(wrapperTag).not.toMatch(/data-(state|collapsible|side)=/)
    expect(wrapperTag).not.toMatch(/data-variant=\{/) // JSX prop form; the class-string selector is fine
  })

  it('keeps the :root width vars in globals.css (the standalone utility seam)', () => {
    // The R15 seam: w-[--sidebar-width] is hand-defined and reads
    // var(--sidebar-width). The wrapper's inline vars win the cascade
    // inside the shell (like the live); :root remains the fallback for
    // anything outside it (the mobile Sheet portal sets its own 18rem).
    const css = src('src/app/globals.css')
    expect(css).toMatch(/--sidebar-width:\s*16rem/)
    expect(css).toMatch(/--sidebar-width-icon:\s*3rem/)
  })
})

describe('R30-F1 — the wrapper is NOT a general-purpose provider (scope pins)', () => {
  it('does not leak into the marketing frame', () => {
    expect(src('src/components/marketing/marketing-frame.tsx')).not.toContain(
      'group/sidebar-wrapper',
    )
  })

  it('does not leak into the auth shell', () => {
    expect(src('src/components/auth/auth-shell.tsx')).not.toContain(
      'group/sidebar-wrapper',
    )
  })
})
