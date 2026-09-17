import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

/**
 * R11-F1 regression test: the live app bundle (app.pixelco.io dashboard/auth)
 * migrated to cool-gray neutrals — extracted verbatim from the live `:root`
 * (research/round11-audit/live-ground-truth.md §1):
 *
 *   --background: 220 20% 97%      (#F6F7F9 — the canvas moved to token level)
 *   --foreground: 230 25% 10%      (navy)
 *   --secondary/--muted: 220 14% 96%
 *   --muted-foreground: 220 9% 46% (#6B7280)
 *   --accent: 172 66% 50%          (TEAL — the data accent, not pale cream)
 *   --border/--input: 220 13% 91%  (#E5E7EB cool)
 *   --ring: 45 100% 51%            (#FFC105)
 *   + sidebar tokens (accent hsl(45 30% 96%) = #F8F6F2 warm pill,
 *     accent-foreground hsl(45 100% 40%) = #CC9900 golden)
 *   + new utilities: --gradient-accent, --gradient-card, --glow-accent,
 *     --electric-blue (199 89% 48%)
 *
 * The marketing scope (.marketing-scope) keeps the R10 marketing palette —
 * pinned separately in marketing-theme.test.ts.
 */

const read = (p: string) => readFileSync(join(process.cwd(), p), 'utf8')
const css = read('src/app/globals.css')

describe('app palette migration to the live cool-neutral set (R11-F1)', () => {
  const rootStart = css.indexOf(':root')
  const rootBlock = css.slice(rootStart, css.indexOf('\n.dark', rootStart))

  it('defines the live app cool-neutral neutrals', () => {
    expect(rootBlock).toContain('--background: hsl(220 20% 97%)')
    expect(rootBlock).toContain('--foreground: hsl(230 25% 10%)')
    expect(rootBlock).toContain('--secondary: hsl(220 14% 96%)')
    expect(rootBlock).toContain('--secondary-foreground: hsl(230 25% 10%)')
    expect(rootBlock).toContain('--muted: hsl(220 14% 96%)')
    expect(rootBlock).toContain('--muted-foreground: hsl(220 9% 46%)')
    expect(rootBlock).toContain('--border: hsl(220 13% 91%)')
    expect(rootBlock).toContain('--input: hsl(220 13% 91%)')
    expect(rootBlock).toContain('--ring: hsl(45 100% 51%)')
  })

  it('flips --accent to the teal data accent like the live', () => {
    expect(rootBlock).toContain('--accent: hsl(172 66% 50%)')
    expect(rootBlock).toContain('--accent-foreground: hsl(230 25% 10%)')
  })

  it('keeps the live primary pair and card surfaces', () => {
    expect(rootBlock).toContain('--primary: hsl(45 100% 51%)')
    expect(rootBlock).toContain('--primary-foreground: hsl(230 25% 10%)')
    expect(rootBlock).toContain('--card: hsl(0 0% 100%)')
    expect(rootBlock).toContain('--popover: hsl(0 0% 100%)')
  })

  it('defines the live sidebar token set (active pill tint + golden text)', () => {
    expect(rootBlock).toContain('--sidebar: hsl(0 0% 100%)')
    expect(rootBlock).toContain('--sidebar-foreground: hsl(230 25% 10%)')
    expect(rootBlock).toContain('--sidebar-primary: hsl(45 100% 51%)')
    expect(rootBlock).toContain('--sidebar-primary-foreground: hsl(0 0% 100%)')
    expect(rootBlock).toContain('--sidebar-accent: hsl(45 30% 96%)')
    expect(rootBlock).toContain('--sidebar-accent-foreground: hsl(45 100% 40%)')
    expect(rootBlock).toContain('--sidebar-border: hsl(220 13% 91%)')
    expect(rootBlock).toContain('--sidebar-ring: hsl(45 100% 51%)')
  })

  it('defines the live\'s new gradient/glow/electric-blue utilities', () => {
    expect(css).toContain('.gradient-accent')
    expect(css).toContain(
      'linear-gradient(135deg, hsl(172 66% 50%), hsl(199 89% 48%))',
    )
    expect(css).toContain('.gradient-card')
    expect(css).toContain(
      'linear-gradient(135deg, hsl(0 0% 100%), hsl(40 30% 97%))',
    )
    expect(css).toContain('.glow-accent')
    expect(css).toContain('0 0 40px 0 hsl(172 66% 50% / 0.3)')
    expect(css).toContain('--color-electric-blue: hsl(199 89% 48%)')
  })

  it('keeps .bg-app at the live app canvas (#f6f7f9 == the new --background)', () => {
    expect(css).toContain('.bg-app')
    expect(css.match(/\.bg-app\s*{[^}]*background-color:\s*#f6f7f9/)).toBeTruthy()
  })

  it('aligns the gradient-primary end stop to the live (#FFB300)', () => {
    expect(css).toMatch(
      /\.gradient-primary\s*{[^}]*linear-gradient\(135deg,\s*#ffc105,\s*#ffb300\)/,
    )
  })
})
