import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { LiveFeedMockup } from '@/components/marketing/live-feed'

/**
 * R20 parity pins — the runtime-state & functional-parity round.
 *
 * The R19 toolchain (drift watch, geometry probes, class inventory) is
 * joined by two NEW probe generations: runtime-state observation (16 s
 * feed sampling on live + clone, then re-extraction of the live's phase
 * machine from index-C3AAh5Je.js) and functional probes (pricing cycle
 * toggle, visitors sort, domains validation + empty-state).
 *
 *  F1  The pricing toggle's MONTHLY state (never covered by the static
 *      pins — both ships default to annual). The live's KD component:
 *      off-track `bg-muted` (not muted-foreground/30), off-thumb emits
 *      `translate-x-0`, paid cards show "billed monthly" (the R18 note
 *      that claimed the live renders the empty spacer in monthly mode was
 *      an unverified assumption — the runtime probe shows the branch
 *      `monthlyPrice>0 && !annual → "billed monthly"`). The live's toggle
 *      is a plain <button aria-label>; the clone's switch semantics
 *      (role/aria-checked/type + knob aria-hidden) stay KEPT under the
 *      D5 ruling — invisible functional a11y chrome, confirmed by the
 *      R20 probe as the ONLY remaining attr divergences.
 *
 *  F2  The live's Add-Domain button renders DISABLED while its
 *      controlled input is empty (captured DOM: `type="submit"
 *      disabled=""` + `value=""`); the clone relied on the native
 *      `required` tooltip instead. The live's input carries no `required`
 *      attr. (The live then accepts ARBITRARY input — the audit probe
 *      created "not_a_valid domain!!" as a real domain row — that is a
 *      live defect the clone's zod validation must NOT replicate; the
 *      pad documents it as an intentional divergence.)
 *
 *  F4  The feed reveal transition. The live's text column is an
 *      AnimatePresence mode:"wait": on reveal the anonymous block exits
 *      FIRST (opacity→0, y:-8, 0.3 s) and only then the email block
 *      enters (opacity 0→1, y 8→0, 0.4 s) — runtime samples caught the
 *      live mid-swap (avatar primary + ✓ badge, label text still
 *      anonymous). The clone swapped atomically. The ✓ badge also
 *      springs in (scale 0→1, stiffness 400/damping 15 ≈ overshoot
 *      bezier). Phase constants stay pinned (R19); only the swap is
 *      staged (+SWAP_MS = 300).
 */

const read = (p: string) => readFileSync(join(process.cwd(), p), 'utf8')
const css = read('src/app/globals.css')
const pricing = read('src/components/marketing/pricing-section.tsx')
const domains = read('src/components/dashboard/domains-panel.tsx')
const feed = read('src/components/marketing/live-feed.tsx')
const feedDom = renderToStaticMarkup(<LiveFeedMockup />)

describe('R20 F1 — pricing toggle monthly-mode (the live KD branch)', () => {
  it('paid cards show "billed monthly" in monthly mode (R18 assumption corrected)', () => {
    // The live: monthlyPrice>0 && !annual → "billed monthly"; free keeps
    // the spacer line (children:" ").
    expect(pricing).toContain("'billed monthly'")
    expect(pricing).toMatch(/plan\.monthlyPrice > 0/)
    // Both branches present in the source ternary.
    expect(pricing).toContain("'billed annually'")
  })

  it('the off-state track is the live bg-muted (not muted-foreground/30)', () => {
    expect(pricing).toContain('duration-300 bg-muted')
    expect(pricing).not.toContain('bg-muted-foreground/30')
  })

  it('the off-state thumb emits translate-x-0 (the live template branch)', () => {
    expect(pricing).toMatch(/translate-x-0/)
    expect(pricing).toMatch(/translate-x-7/)
  })

  it('the toggle keeps its D5 switch semantics (a11y chrome KEPT)', () => {
    // The live's toggle is a plain <button aria-label> — the clone keeps
    // role="switch" + aria-checked + type="button" + knob aria-hidden per
    // the D5 ruling (invisible functional a11y, same category as the
    // trend chart's role="img"). The R20 functional probe confirmed these
    // are the ONLY remaining attr divergences on the toggle.
    expect(pricing).toContain('role="switch"')
    expect(pricing).toContain("aria-checked={cycle === 'annual'}")
    expect(pricing).toContain('aria-label="Toggle annual pricing"')
    expect(pricing).toContain('aria-hidden="true"')
    // The annual-default emission (R10 pins) is untouched.
    expect(pricing).toContain('relative w-14 h-7 rounded-full transition-colors duration-300')
  })
})

describe('R20 F2 — add-domain empty-state (the live controlled-input model)', () => {
  it('disables the submit while the controlled input is empty', () => {
    expect(domains).toContain("disabled={pending || domainValue.trim() === ''}")
    expect(domains).toContain("const [domainValue, setDomainValue] = useState('')")
  })

  it('the domain input is controlled (value + onChange)', () => {
    expect(domains).toContain('value={domainValue}')
    expect(domains).toMatch(/onChange=\{\(e\) => setDomainValue\(e\.target\.value\)\}/)
  })

  it('drops the native required attr (the live ships none)', () => {
    expect(domains).not.toMatch(/\brequired\b/)
  })

  it('a successful add clears the controlled input', () => {
    // React's render-phase adjust pattern: fresh result + ok → cleared.
    expect(domains).toMatch(/state !== prevAddResult[\s\S]{0,80}setDomainValue\(''\)/)
  })
})

describe('R20 F4 — feed reveal transition (mode:"wait" staging + badge spring)', () => {
  it('stages the text swap: exit (0.3s) THEN the email block mounts', () => {
    expect(feed).toMatch(/SWAP_MS\s*=\s*300/)
    expect(feed).toMatch(/REVEAL_AT \+ SWAP_MS/)
    expect(feed).toContain('setTextEmail')
    // The avatar flip + badge stay pinned to the reveal tick (R19).
    expect(feed).toContain("backgroundColor: revealed ? 'var(--primary)' : 'var(--muted)'")
  })

  it('CSS carries the exit/enter keyframes and the badge spring', () => {
    expect(css).toMatch(/@keyframes feed-text-exit/)
    expect(css).toMatch(/\.feed-text-exit\s*\{[^}]*animation:\s*feed-text-exit/)
    expect(css).toMatch(/@keyframes feed-text-in/)
    expect(css).toMatch(/\.feed-text-in\s*\{[^}]*animation:\s*feed-text-in/)
    expect(css).toMatch(/@keyframes feed-badge-in/)
    expect(css).toMatch(/\.feed-badge-in\s*\{[^}]*animation:\s*feed-badge-in/)
    // the badge block opts into the spring class
    expect(feed).toContain('feed-badge-in w-6 h-6 rounded-full bg-primary/20')
  })

  it('reduced-motion guards cover the new swap animations', () => {
    expect(css).toMatch(
      /@media \(prefers-reduced-motion: reduce\)\s*\{[\s\S]{0,400}feed-text-exit[\s\S]{0,120}feed-badge-in/,
    )
  })

  it('the static t=0 render is unchanged — anon block, no staged classes', () => {
    expect(feedDom).toContain('Browsing your site…')
    expect(feedDom).not.toContain('✓ Identified')
    expect(feedDom).not.toContain('feed-text-exit')
    expect(feedDom).not.toContain('feed-text-in')
    // R19 geometry pins still hold on the same render.
    expect(feedDom).toContain('top:12px')
    expect(feedDom).toContain('top:236px')
  })
})
