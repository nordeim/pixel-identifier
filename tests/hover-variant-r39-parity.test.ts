import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { spawnSync } from 'node:child_process'

/**
 * R39-F1/R39-F2 regression pins — the Tailwind v4 hover-variant
 * capability guard + the automatic source scan (evidence:
 * docs/plans/2026-09-28-round39-tw4-hover-variant-parity.md).
 *
 * R39-F1: Tailwind v4 compiles every hover-family utility inside a
 * `@media (hover:hover)` guard; the live's TW3 styleships ship plain
 * `:hover` selectors (0 guards in either live stylesheet vs 5 guard
 * blocks — 109 hover:* + 8 group-hover:* + the sidebar open-state pair —
 * in the clone's pre-fix chunk). Identical class strings, different CSS
 * RESOLUTION (the R19 .gradient-hero lesson): in non-hover-capable
 * environments (headless chromium, touch-primary devices) the live's
 * hovers apply while the pre-fix clone's were dead. The fix redefines
 * the built-in variants to the live's unguarded semantics:
 *
 *   @custom-variant hover (&:hover);
 *   @custom-variant group-hover (&:is(:where(.group):hover *));
 *
 * R39-F2: TW4's automatic source detection scans every non-gitignored
 * repo file — the committed `skills/` folder fed the compiler junk
 * utilities (`hover:text-purple-600`, `hover:scale-105`,
 * `hover:bg-slate-800`, `lg:hover:scale-105`… none exist in `src/`),
 * bloating the shipped chunk to 175,785 bytes vs the live's ~70 KB per
 * bundle and violating the operator's standing exclusion contract
 * ("the repo included skills/ folder is to be excluded from code
 * checking, testing and compilation"). The fix anchors detection on
 * `src/` via `@import "tailwindcss" source("../")`.
 *
 * Behavioral proof lives in e2e/hover.spec.ts (the headless suite IS
 * the non-hover-capable proving ground — it ran RED pre-fix).
 */

const read = (rel: string) =>
  readFileSync(join(process.cwd(), rel), 'utf-8')

const css = read('src/app/globals.css')

describe('R39-F1 — the hover variants compile unguarded (the live\'s TW3 semantics)', () => {
  it('globals.css redefines the built-in hover variant to a plain &:hover', () => {
    // Without this override TW4 emits `@media (hover: hover) { … :hover }`
    // and every hover utility dies wherever (hover: hover) does not match
    // (headless chromium, touch-primary devices) — the live ships 0 guards.
    expect(css).toContain('@custom-variant hover (&:hover);')
  })

  it('globals.css redefines group-hover to the unguarded group form', () => {
    // The blog cards' `group-hover:text-primary` / `group-hover:gap-2` are
    // the live's TW3-unguarded selectors — R38's "identical classes ⇒
    // identical hover rendering" inference was FALSE under the guard.
    expect(css).toContain(
      '@custom-variant group-hover (&:is(:where(.group):hover *));',
    )
  })

  it('the overrides sit inside the CSS (not a tailwind.config — TW4 is CSS-first here)', () => {
    // The AGENTS contract: no tailwind.config.* may ever exist; the
    // variants live in globals.css beside the existing dark override.
    expect(css).toContain('@custom-variant dark (&:is(.dark *));')
  })
})

describe('R39-F2 — the automatic source scan is anchored on src/ (skills/ excluded)', () => {
  it('the tailwindcss import restricts automatic detection to the app tree', () => {
    // From src/app/globals.css, `../` is src/ — every rendered class lives
    // there (components, src/data content, the snippet/collector builders).
    // Pre-fix, the scan base was the repo root and skills/** markdown
    // generated junk utilities into the shipped chunk.
    expect(css).toContain('@import "tailwindcss" source("../");')
  })

  it('no src/ file references the skills-origin junk utility families', () => {
    // The F2 regression guard: these families existed ONLY in skills/
    // markdown pre-fix (rg-verified). If one ever appears in src/ it is
    // either a real utility (fine — the scan covers src/) or an accident;
    // the pin documents the boundary either way.
    const junk = [
      'hover:scale-105',
      'group-hover:scale-110',
      'lg:hover:scale-105',
      'hover:text-purple-600',
      'hover:bg-slate-800',
      'hover:text-indigo-300',
      'hover:bg-gray-50',
    ]
    // rg exits 1 on zero matches — the assertion is that NO src/ file
    // carries any of the junk families.
    const res = spawnSync('rg', ['-l', '--no-messages', junk.join('|'), 'src/'], {
      encoding: 'utf-8',
    })
    expect(res.stdout ?? '').toBe('')
  })
})
