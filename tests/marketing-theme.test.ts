import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

/**
 * R10-F1 regression test: the live pixelco.io ships TWO palettes — the app
 * bundle (dashboard/auth, verified aligned with the clone's global tokens)
 * and the marketing bundle, whose `:root` was extracted off the live landing
 * page:
 *
 *   --background: 0 0% 100%          (#FFFFFF, NOT the app's warm canvas)
 *   --foreground: 230 25% 12%        (#171A26 — shipped as literal hex, see
 *                                     the R12-F5 note below)
 *   --card: 40 30% 98%               (warm white, rgb(251,250,248))
 *   --secondary: 40 30% 96%          (rgb(248,246,242))
 *   --muted: 230 15% 92%
 *   --muted-foreground: 230 10% 46%  (rgb(106,109,129))
 *   --primary: 45 100% 50%           (#FFBF00 — marketing scope)
 *   --primary-foreground: 0 0% 5%
 *   --accent: 45 100% 50%            (#FFBF00 — YELLOW, not pale cream)
 *   --accent-foreground: 0 0% 0%
 *   --border / --input: 230 15% 90%  (cool gray, rgb(226,227,233))
 *   --ring: 45 100% 50%
 *   --radius: .625rem                (10px — the app keeps 12px)
 *
 * The clone previously shipped ONE global warm-cream palette matching
 * neither bundle. The fix scopes the live marketing tokens to the
 * `(marketing)` route group via a `.marketing-scope` class on the layout
 * wrapper — the app tree (dashboard, auth) must stay on the global tokens.
 */

const read = (p: string) => readFileSync(join(process.cwd(), p), 'utf8')
const css = read('src/app/globals.css')
// R13-F3: the scope wrapper moved into the shared MarketingFrame.
const marketingLayout = read('src/components/marketing/marketing-frame.tsx')

describe('marketing palette scope (R10-F1)', () => {
  it('defines a .marketing-scope class in globals.css carrying the live marketing tokens', () => {
    // Anchor on the class definition, not a bare indexOf — the token-block
    // comments also mention .marketing-scope (R11).
    const defStart = css.search(/\.marketing-scope\s*\{/)
    expect(defStart).toBeGreaterThanOrEqual(0)
    const block = css.slice(defStart, defStart + 1200)

    expect(block).toContain('--background: hsl(0 0% 100%)')
    // R12-F5: the foreground family ships as literal #171a26 — the exact
    // value browsers compute from the live's hsl(230 25% 12%). Authoring
    // the HSL lets Tailwind v4's Lightning CSS minifier floor-round the
    // 25.5 green channel to #171926 (1/255 off the live).
    expect(block).toContain('--foreground: #171a26')
    expect(block).toContain('--card-foreground: #171a26')
    expect(block).toContain('--popover-foreground: #171a26')
    expect(block).toContain('--secondary-foreground: #171a26')
    expect(block).not.toContain('--foreground: hsl(230 25% 12%)')
    expect(block).toContain('--card: hsl(40 30% 98%)')
    expect(block).toContain('--secondary: hsl(40 30% 96%)')
    expect(block).toContain('--muted: hsl(230 15% 92%)')
    expect(block).toContain('--muted-foreground: hsl(230 10% 46%)')
    expect(block).toContain('--primary: hsl(45 100% 50%)')
    expect(block).toContain('--primary-foreground: hsl(0 0% 5%)')
    expect(block).toContain('--accent: hsl(45 100% 50%)')
    expect(block).toContain('--accent-foreground: hsl(0 0% 0%)')
    expect(block).toContain('--border: hsl(230 15% 90%)')
    expect(block).toContain('--input: hsl(230 15% 90%)')
    expect(block).toContain('--ring: hsl(45 100% 50%)')
    expect(block).toContain('--radius: 0.625rem')
  })

  it('applies marketing-scope (plus a white canvas) on the marketing frame wrapper', () => {
    expect(marketingLayout).toContain('marketing-scope')
    // The wrapper covers min-h-screen, so bg-background resolves the scope's
    // white — the body's canvas never shows through the marketing tree.
    expect(marketingLayout).toMatch(/className="[^"]*bg-background/)
    // The old one-off arbitrary-property override is superseded by the scope.
    expect(marketingLayout).not.toContain('[--primary:#ffbf00]')
  })

  it('derives rounded-xl at radius + 2px like the live (12px marketing cards)', () => {
    // Measured off the live: marketing rounded-xl cards = 12px at the 10px
    // scope (and the app's rounded-lg chrome stays var(--radius) = 12px).
    expect(css).toContain('--radius-xl: calc(var(--radius) + 2px)')
  })

  it('keeps the app palette global and untouched (dashboard/auth stay off the scope)', () => {
    // The :root block keeps the app-side values the live app bundle uses —
    // R11 migrated them to the live cool-neutral set (teal accent, cool
    // hairlines, navy foreground; app-theme.test.ts pins the full set).
    // Each tinted surface still paints its own wrapper: marketing-scope,
    // .bg-app, the auth gradient canvas.
    const rootStart = css.indexOf(':root')
    const rootBlock = css.slice(rootStart, css.indexOf('}', rootStart))
    expect(rootBlock).toContain('--background: hsl(220 20% 97%)')
    expect(rootBlock).toContain('--primary: hsl(45 100% 51%)')
    expect(css).toContain('.bg-app')
    expect(css.match(/\.bg-app\s*{[^}]*background-color:\s*#f6f7f9/)).toBeTruthy()
  })
})
