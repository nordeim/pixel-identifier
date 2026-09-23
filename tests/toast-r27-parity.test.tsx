import { describe, expect, it } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { renderToStaticMarkup } from 'react-dom/server'
import { Toaster } from '@/components/ui/sonner'

/**
 * R27-F1 regression pins: the live's mutation feedback is SONNER toasts
 * (settings save → "Settings saved", domain add → "Domain added
 * successfully", domain delete → "Domain removed" — all success-typed,
 * bottom-right, Heroicons check-circle icon). Runtime-captured on the live
 * 2026-09-23 (12th probe generation); the toast runtime fingerprinted from
 * the live's app bundle as sonner 1.7.4 (the CSS :where() wrapper +
 * translateY(-10px) lift + data-lifted markers + the byte-identical
 * success-icon path; v2.0.x diverges — no :where(), -8px, plus
 * data-react-aria-top-layer).
 *
 * The clone previously shipped the Radix toast generation (ui/toast.tsx +
 * use-toast + ui/toaster.tsx — viewport anchored TOP on mobile) and an
 * inline "Saved" line on the settings page.
 */

const src = (rel: string) =>
  readFileSync(join(process.cwd(), rel), 'utf-8')

describe('R27-F1 — the sonner wrapper (live-verbatim class family)', () => {
  const source = src('src/components/ui/sonner.tsx')

  it('ships the shadcn sonner wrapper with the toaster group class', () => {
    expect(source).toContain('className="toaster group"')
  })

  it('pins the live toast class family byte-for-byte', () => {
    expect(source).toContain(
      'group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg',
    )
  })

  it('runs sonner defaults — no position/theme/richColors overrides', () => {
    // The live's toaster: bottom-right, theme light, 356px width, 32/16px
    // offsets, 4s duration — ALL sonner 1.7 defaults (no explicit props).
    for (const forbidden of ['position=', 'richColors', 'closeButton', 'duration=']) {
      expect(source).not.toContain(forbidden)
    }
  })
})

describe('R27-F1 — the Toaster SSR section (idle bytes)', () => {
  it('renders the live empty section — hotkey aria-label, no ol at idle', () => {
    // Sonner 1.7 renders the <ol> ONLY while toasts exist; the idle DOM is
    // the bare section (live-captured on the settings page at rest).
    const html = renderToStaticMarkup(<Toaster />)
    expect(html).toBe(
      '<section aria-label="Notifications alt+T" tabindex="-1" aria-live="polite" aria-relevant="additions text" aria-atomic="false"></section>',
    )
  })
})

describe('R27-F1 — settings save feedback (toast, not the inline line)', () => {
  const source = src('src/components/dashboard/settings-panel.tsx')

  it('fires the live success toast on save', () => {
    expect(source).toContain("toast.success('Settings saved')")
  })

  it('routes save errors through toast.error (live error branch unobservable)', () => {
    expect(source).toContain('toast.error(')
  })

  it('no longer ships the R6-era inline Saved line', () => {
    expect(source).not.toContain('role="status"')
    expect(source).not.toMatch(/text-teal-600[^>]*>\s*Saved/)
  })
})

describe('R27-F1 — domains toast copy (live-verbatim)', () => {
  const source = src('src/components/dashboard/domains-panel.tsx')

  it('keeps the live add title', () => {
    expect(source).toContain("toast.success('Domain added successfully')")
  })

  it('ships the live delete title (not "Domain deleted")', () => {
    expect(source).toContain("toast.success('Domain removed')")
    expect(source).not.toContain("'Domain deleted'")
  })

  it('drops the clone-authored delete description', () => {
    expect(source).not.toContain('Its visitors and events were removed.')
  })

  it('consumes sonner — the Radix useToast hook is gone', () => {
    expect(source).toContain("from 'sonner'")
    expect(source).not.toContain('useToast')
    expect(source).not.toContain('use-toast')
  })
})

describe('R27-F1 — the Radix toast generation is retired', () => {
  it('the root layout mounts the sonner Toaster', () => {
    const layout = src('src/app/layout.tsx')
    expect(layout).toContain("@/components/ui/sonner")
    expect(layout).not.toContain('@/components/ui/toaster')
  })

  it('the Radix toast files are deleted (no dead code)', () => {
    for (const file of [
      'src/components/ui/toast.tsx',
      'src/components/ui/toaster.tsx',
      'src/hooks/use-toast.ts',
    ]) {
      expect(existsSync(join(process.cwd(), file))).toBe(false)
    }
  })

  it('package.json pins sonner 1.7.4 and drops @radix-ui/react-toast', () => {
    const pkg = src('package.json')
    expect(pkg).toContain('"sonner": "1.7.4"')
    expect(pkg).not.toContain('@radix-ui/react-toast')
  })
})
