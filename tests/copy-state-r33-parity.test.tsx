import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { renderToStaticMarkup } from 'react-dom/server'
import { DocsCopyButton } from '@/components/marketing/docs-copy-button'

/**
 * R33-F2 regression pins — the copy buttons' copied-state feedback is
 * UNCONDITIONAL, runtime-diffed against the live (18th probe generation;
 * evidence: docs/plans/2026-09-24-round33-footer-copy-parity.md).
 *
 * Proven inside a clipboard-REJECTING headless session
 * (`navigator.clipboard.writeText` → "Write permission denied"): the
 * live swaps its copy affordances on EVERY click regardless of the
 * clipboard outcome —
 *
 *   - /docs: icon → `lucide lucide-check w-4 h-4 text-green-500`
 *     (computed rgb(34, 197, 94)), button class unchanged, ~2 s reset
 *   - /dashboard/install: text → `Copied!` + the uncolored
 *     `lucide lucide-check h-3.5 w-3.5 mr-1`
 *
 * The clone gated the swap on clipboard success (docs: inside
 * `.then()`; install: `catch` → `setCopied(false)`), so any real-world
 * clipboard failure (permissions, insecure context, iframe policy) left
 * the user with NO feedback. The live's DOM proves the intended behavior
 * is unconditional feedback; the clipboard write stays fire-and-forget.
 *
 * The clone's aria-labels (`Copy sample pixel code` / `Copy snippet to
 * clipboard`) stay as D5-class invisible a11y value-adds (the live ships
 * none) — the R22 ContactSupportButton / chart role=img precedent.
 * Behavioral proof lives in e2e/copy.spec.ts (Playwright's default
 * no-clipboard-permission context IS the live's proving ground).
 */

const src = (rel: string) =>
  readFileSync(join(process.cwd(), rel), 'utf-8')

const docsSource = src('src/components/marketing/docs-copy-button.tsx')
const dashSource = src('src/components/dashboard/copy-button.tsx')

describe('R33-F2 — the docs copy button swaps UNCONDITIONALLY (source pin)', () => {
  it('does NOT gate the copied state on clipboard success', () => {
    // The pre-R33 drift: setCopied(true) lived INSIDE the writeText
    // .then() — a rejected write left the icon unchanged.
    expect(docsSource).not.toMatch(
      /writeText\([^)]*\)\.then\(\(\) => \{?\s*setCopied\(true\)/,
    )
    expect(docsSource).not.toContain('setCopied(true)\n        })')
  })

  it('sets the copied state directly in the click handler', () => {
    // The click handler must setCopied(true) + schedule the reset itself;
    // the clipboard write is attempted fire-and-forget.
    expect(docsSource).toMatch(/onClick=\{\(\) => \{[\s\S]*setCopied\(true\)/)
  })

  it('keeps the clipboard attempt fire-and-forget with a swallowed rejection', () => {
    expect(docsSource).toMatch(
      /navigator\.clipboard\?\.writeText\([^)]*\)\.catch\(\(\) => \{\}\)/,
    )
  })

  it('keeps the 2 s reset window (the live resets between 1 s and 2.6 s)', () => {
    expect(docsSource).toContain('setTimeout(() => setCopied(false), 2000)')
  })

  it('keeps the live-verbatim copied glyph (green check) + button class', () => {
    const html = renderToStaticMarkup(<DocsCopyButton />)
    expect(html).toContain(
      'class="absolute top-3 right-3 p-2 rounded-md bg-secondary/80 hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"',
    )
    expect(html).toContain('class="lucide lucide-copy w-4 h-4"')
  })
})

describe('R33-F2 — the install copy button is AWAIT-GATED (the live behavior, source pin)', () => {
  // Re-based live evidence (18th probe generation, Playwright context with
  // a DENIED clipboard): the live's install Quick Start button does NOT
  // swap when writeText rejects (and its rejection surfaces as an UNCAUGHT
  // pageerror on the live); with a working clipboard it swaps to
  // "Copied!" + the uncolored check. The clone therefore KEEPS the gated
  // shape — the DOM behavior is the live's. The silent catch is a D-class
  // improvement over the live's uncaught rejection (the R20 "never
  // replicate a live defect" ruling + the e2e console sweeps demand zero
  // page errors). The DOCS button is the opposite (unconditional) — see
  // the pins above.
  it('awaits the clipboard write before swapping (the live gating)', () => {
    expect(dashSource).toMatch(
      /async function copy\(\) \{[\s\S]*?try \{\s*await navigator\.clipboard\.writeText\(text\)\s*setCopied\(true\)/,
    )
  })

  it('keeps the silent catch (D-class — the live leaves the rejection uncaught)', () => {
    expect(dashSource).toMatch(/\} catch \{/)
    expect(dashSource).not.toMatch(
      /catch[\s\S]{0,200}console\.error/,
    )
  })

  it('keeps the 2 s reset window on the success path', () => {
    expect(dashSource).toContain('setTimeout(() => setCopied(false), 2000)')
  })

  it('does NOT fire-and-forget like the docs button (the two buttons differ on the live)', () => {
    expect(dashSource).not.toContain('writeText(text).catch')
  })
})
