import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { LiveFeedMockup } from '@/components/marketing/live-feed'

/**
 * R19 parity pins — the marketing GEOMETRY/computed-style audit round.
 *
 * R18 pinned the marketing bundle's class EMISSION; R19's computed-style
 * probes found two CSS-resolution/model divergences the class pins could
 * not see:
 *
 *  F1  .gradient-hero renders DARK on every marketing surface. The live's
 *      marketing bundle defines ONE gradient-hero — the amber 3-stop
 *      `var(--gradient-hero)` on :root (not redefined in .dark):
 *        linear-gradient(135deg, hsl(40 100% 50%) 0%,
 *                         hsl(50 100% 55%) 50%,
 *                         hsl(35 100% 48%) 100%)
 *      ≈ rgb(255,170,0) → rgb(255,217,26) → rgb(245,143,0) — measured off
 *      the live's step chips. The live's APP bundle (auth canvas) is the
 *      dark sweep. One clone bundle → two resolutions: the amber is scoped
 *      to .marketing-scope; the auth shell sits outside the scope and keeps
 *      the dark sweep.
 *
 *  F2  The hero "Live Visitor Feed" widget's ROW MODEL. The live (symbols
 *      PD/TD/ND in /assets/index-C3AAh5Je.js): 5 entries with staggered
 *      delays, per-row phase machine enter→scan→reveal→done, 10s re-mount
 *      cycle, rows at top = index*56+12, avatar backgroundColor muted→
 *      primary at reveal, "Matching…" pulse badge during scan, ✓ spring
 *      badge during reveal. The old clone shipped 8 static entries with a
 *      2.6s offset rotation — wrong data, wrong timing, wrong geometry.
 *
 *  F4  The hero trust-row avatar PHOTOS are the live's CURRENT five
 *      (the live swapped them after the R8 capture; VLM-verified the old
 *      local set as five different people). Pin: the local avatars match
 *      the live's current set perceptually (8×8 average-luma threshold
 *      hashes captured 2026-09-19; offline-deterministic, no network).
 */

const read = (p: string) => readFileSync(join(process.cwd(), p), 'utf8')
const css = read('src/app/globals.css')
const feed = read('src/components/marketing/live-feed.tsx')
// Static t=0 render — every row in the live's ENTER phase (the live's own
// first paint: all-anonymous roster; emails appear at the reveal timeout).
const feedDom = renderToStaticMarkup(<LiveFeedMockup />)

describe('R19 F1 — scoped amber .gradient-hero (one bundle, two resolutions)', () => {
  it('defines the amber 3-stop gradient-hero INSIDE .marketing-scope', () => {
    // The live's marketing bundle resolution, scoped so the auth canvas
    // (outside the scope) keeps the dark sweep.
    const m = css.match(/\.marketing-scope\s+\.gradient-hero\s*\{[^}]*\}/)
    expect(m).not.toBeNull()
    // Byte-exact hex equivalents of the live's hsl stops (R12 channel
    // rounding convention): hsl(40 100% 50%)=#ffaa00, hsl(50 100% 55%)=
    // #ffd91a (the live's highlight yellow), hsl(35 100% 48%)=#f58f00.
    expect(m![0]).toContain(
      'background-image: linear-gradient(135deg, #ffaa00 0%, #ffd91a 50%, #f58f00 100%)',
    )
  })

  it('keeps the dark sweep on the bare .gradient-hero (auth canvas)', () => {
    const m = css.match(/\.gradient-hero\s*\{[^}]*\}/)
    expect(m).not.toBeNull()
    expect(m![0]).toContain('linear-gradient(135deg, #0f111a, #2b2312)')
  })

  it('retires the dead .gradient-hero-light utility (superseded by R18 class strings)', () => {
    // The live's marketing bundle defines no such class; R18 moved every
    // marketing surface onto .gradient-hero. Zero component references.
    expect(css).not.toContain('.gradient-hero-light')
  })

  it('marketing surfaces still emit the .gradient-hero class string (R18 pins hold)', () => {
    // The class STRING is pinned by R18 tests; this pin guards the seam
    // between the string and the scoped resolution.
    const bar = read('src/components/marketing/announcement-bar.tsx')
    const process = read('src/components/marketing/how-it-works.tsx')
    const cta = read('src/components/marketing/faq-footer.tsx')
    expect(bar).toContain('gradient-hero text-primary-foreground')
    expect(process).toMatch(/w-10 h-10 rounded-lg gradient-hero/)
    expect(cta).toMatch(/rounded-2xl gradient-hero/)
  })
})

describe('R19 F2 — live feed widget model (data, phases, geometry)', () => {
  it("ships the live's five entries — labels, emails, staggered delays", () => {
    expect(feed).toContain('sarah.jones@gmail.com')
    expect(feed).toContain('james.miller92@gmail.com')
    expect(feed).toContain('maria.garcia@gmail.com')
    expect(feed).toContain('alex.thompson@gmail.com')
    expect(feed).toContain('priya.patel@gmail.com')
    // The live's varied anonymous labels (not a constant "Unknown User")
    // — visible in the t=0 static render, in roster order.
    expect(feedDom).toContain('>Anonymous Visitor<')
    expect(feedDom).toContain('>Unknown User<')
    expect(feedDom).toContain('>Site Visitor<')
    // Roster order (the live's PD): AV, UU, SV, AV, UU.
    const labels = feedDom.match(/text-sm font-medium text-muted-foreground">([^<]+)</g) ?? []
    expect(labels.map((l) => l.split('>')[1].replace(/<$/, ''))).toEqual([
      'Anonymous Visitor',
      'Unknown User',
      'Site Visitor',
      'Anonymous Visitor',
      'Unknown User',
    ])
    // The live's stagger: [0, 1.8, 3.6, 5.4, 7.2] seconds.
    expect(feed).toMatch(/delay:\s*0\s*[,}]/)
    expect(feed).toMatch(/delay:\s*1\.8\s*[,}]/)
    expect(feed).toMatch(/delay:\s*3\.6\s*[,}]/)
    expect(feed).toMatch(/delay:\s*5\.4\s*[,}]/)
    expect(feed).toMatch(/delay:\s*7\.2\s*[,}]/)
    // The old 8-entry list (with the live's non-existent emails) is gone.
    expect(feed).not.toContain('sofia.larsen@yahoo.com')
    expect(feed).not.toContain('d.chen@brightpathlabs.com')
  })

  it("renders rows at the live's geometry: top = index*56 + 12", () => {
    expect(feed).toMatch(/top:\s*index\s*\*\s*56\s*\+\s*12/)
    // The static roster carries the live's exact tops: 12/68/124/180/236.
    for (const top of [12, 68, 124, 180, 236]) {
      expect(feedDom).toContain(`top:${top}px`)
    }
    // The old offset-rotation slot formula is gone.
    expect(feed).not.toContain('8 + row.slot * ROW_HEIGHT_PX')
    expect(feed).not.toContain('ROW_HEIGHT_PX')
  })

  it("runs the per-row phase machine at the live's timing constants", () => {
    // enter → scan (delay·1000 + 600) → reveal (+1600) → done (+3200).
    expect(feed).toMatch(/SCAN_AT\s*=\s*600/)
    expect(feed).toMatch(/REVEAL_AT\s*=\s*1600/)
    expect(feed).toMatch(/DONE_AT\s*=\s*3200/)
    expect(feed).toMatch(/'scan'/)
    expect(feed).toMatch(/'reveal'/)
    expect(feed).toMatch(/'done'/)
  })

  it("re-mounts all rows every 10s cycle (the live's ticker)", () => {
    expect(feed).toMatch(/10_?000|10 \* 1000/)
    expect(feed).not.toContain('2600')
  })

  it("renders the live's scan/reveal badges", () => {
    expect(feed).toContain('Matching…')
    expect(feed).toContain('feed-matching text-xs text-primary font-medium')
    expect(feed).toContain('w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center')
    expect(feed).toContain('className="text-primary text-xs"')
    expect(feed).toContain('>✓</span>')
    // the badges are phase-gated (not in the t=0 static render)
    expect(feedDom).not.toContain('Matching…')
  })

  it('transitions the avatar background muted → primary at reveal', () => {
    expect(feed).toContain('feed-avatar')
    expect(css).toMatch(/\.feed-avatar\s*\{[^}]*transition[^}]*\}/)
    expect(feed).toContain("backgroundColor: revealed ? 'var(--primary)' : 'var(--muted)'")
    expect(feedDom).toContain('style="background-color:var(--muted)"')
  })

  it('keeps the pinned row/class chains (R18 B5 pins still hold)', () => {
    expect(feedDom).toContain(
      'feed-row flex items-center gap-3 px-4 py-3 rounded-lg bg-card/80 border border-border backdrop-blur-sm',
    )
    expect(feedDom).toContain(
      'class="feed-avatar w-8 h-8 rounded-full flex items-center justify-center shrink-0"',
    )
    expect(feedDom).toContain('class="flex-1 min-w-0"')
    expect(feed).toContain('Browsing your site…')
    expect(feed).toContain('✓ Identified')
    expect(feed).toContain('style={{ height: 240 }}')
    expect(feedDom).toContain('style="height:240px"')
  })
})

describe('R19 F4 — hero trust-row avatar photos = the live current set', () => {
  /**
   * Perceptual pin: 8×8 average-luma threshold hashes of the live's CURRENT
   * avatar set (captured 2026-09-19 from /assets/avatar-{1..5}-*.jpg — the
   * live re-hosted new photos after the R8 capture; VLM-verified the old
   * local set as five different people). The local 96px re-encodes must
   * hash within 24 bits — same photo at a different scale re-encode; a
   * different person diverges by an order of magnitude more.
   */
  const LIVE_THUMB_HASHES: [string, string][] = [
    ['avatar-1', '4299b9f9f9f1f800'],
    ['avatar-2', 'e7c3cfc7c7c78800'],
    ['avatar-3', 'e7c3c9c9c3e38800'],
    ['avatar-4', 'e7d3d3e3f7e30000'],
    ['avatar-5', 'f7f3fbf3f3fb8000'],
  ]

  it('the local avatar files match the live current photos (within 24 bits)', async () => {
    const sharp = (await import('sharp')).default
    for (const [name, liveHash] of LIVE_THUMB_HASHES) {
      const buf = readFileSync(
        join(process.cwd(), 'public', 'assets', 'avatars', `${name}.jpg`),
      )
      const px = await sharp(buf).greyscale().resize(8, 8).raw().toBuffer()
      const avg = px.reduce((a, b) => a + b, 0) / 64
      let bits = ''
      for (const p of px) bits += p > avg ? '1' : '0'
      const localHash = parseInt(bits, 2).toString(16).padStart(16, '0')
      const dist = hamming(localHash, liveHash)
      expect(dist, `${name}: local ${localHash} vs live ${liveHash} = ${dist} bits`).toBeLessThanOrEqual(24)
    }
  })
})

function hamming(a: string, b: string): number {
  let d = 0
  const fa = BigInt('0x' + a).toString(2).padStart(64, '0')
  const fb = BigInt('0x' + b).toString(2).padStart(64, '0')
  for (let i = 0; i < 64; i++) if (fa[i] !== fb[i]) d++
  return d
}
