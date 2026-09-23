import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const src = (rel: string) =>
  readFileSync(join(process.cwd(), rel), 'utf-8')

/**
 * R28-F1 pins — the trend chart's axis chrome + geometry, decoded from the
 * live's runtime SVG (13th probe generation; evidence: the live captures in
 * docs/plans/2026-09-23-round28-trend-chart-axis-parity.md).
 *
 * The live renders, inside the pinned h-[280px] wrapper:
 *   - TICK LINES on BOTH axes (recharts default — 6 px, stroke
 *     hsl(220, 9%, 46%) = the live's Tailwind v3 gray-500 literal);
 *   - an AXIS LINE on both axes in the same stroke (the Y axis line too —
 *     the clone's pre-fix axisLine={false} dropped it);
 *   - the explicit margin {top:5, right:5, bottom:5, left:5} (plot origin
 *     x=65 at the 595 px card — NOT recharts' {0,0,0,0} default, NOT the
 *     R8-era {top:8,right:8,left:-18,bottom:0} hack that shifted the plot
 *     23 px left and flipped which date labels recharts thins);
 *   - tick text that INHERITS the axis stroke (no tick.fill — the live's
 *     tick <text> fill attr is hsl(220, 9%, 46%), not an explicit hex);
 *   - comma-form HSL color literals everywhere (the live's app bundle is
 *     Tailwind v3: hsl(262, 83%, 58%), hsl(172, 66%, 50%),
 *     hsl(220, 13%, 91%) for the grid — the same colors the clone shipped
 *     in space/space/hex form);
 *   - a tooltip with border-radius 8px and NO box-shadow (the pre-fix clone
 *     shipped 0.75rem + a phantom 0 8px 24px shadow).
 *
 * The runtime rendering (tick-line count, plot origin, the 12-of-14 label
 * thinning) is pinned by e2e/chart.spec.ts — this file pins the config
 * that produces it.
 */
describe('R28-F1 — the trend chart axis chrome (source pins)', () => {
  const source = src('src/components/dashboard/trend-chart.tsx')

  it('keeps the pinned h-[280px] wrapper (R16) with its role/aria', () => {
    expect(source).toContain('h-[280px]')
    expect(source).toContain('role="img"')
  })

  it('uses the live\'s explicit 5/5/5/5 margin, not the R8-era hack', () => {
    expect(source).toContain('margin={{ top: 5, right: 5, bottom: 5, left: 5 }}')
    expect(source).not.toContain('left: -18')
    expect(source).not.toContain('top: 8')
  })

  it('renders tick lines on both axes (no tickLine={false})', () => {
    expect(source).not.toContain('tickLine={false}')
    expect(source).not.toContain('tickLine=')
  })

  it('renders BOTH axis lines via the axis-level live stroke', () => {
    // The live's XAxis + YAxis both carry stroke="hsl(220, 9%, 46%)" —
    // it cascades to the axis line AND the tick lines (gray-500 =
    // #6B7280; the pre-fix clone shipped a light #E5E7EB X axis line and
    // no Y axis line at all).
    expect(source).not.toContain('axisLine={false}')
    expect(source).not.toContain("axisLine={{ stroke: '#E5E7EB' }}")
    const strokeCount = (source.match(/stroke="hsl\(220, 9%, 46%\)"|stroke='hsl\(220, 9%, 46%\)'/g) ?? []).length
    expect(strokeCount).toBeGreaterThanOrEqual(2)
  })

  it('lets the tick text inherit the axis stroke (no tick fill override)', () => {
    // The live's tick <text> fill attr is hsl(220, 9%, 46%) — inherited
    // from the axis stroke. The pre-fix clone pinned an explicit
    // fill: '#6B7280' (same color, different attr bytes).
    expect(source).not.toContain("fill: '#6B7280'")
    expect(source).toContain('tick={{ fontSize: 11 }}')
  })

  it('keeps the fontSize 11 ticks on both axes', () => {
    expect((source.match(/tick=\{\{ fontSize: 11 \}\}/g) ?? []).length).toBe(2)
  })

  it('ships the grid stroke as the live\'s HSL literal', () => {
    expect(source).toContain('stroke="hsl(220, 13%, 91%)"')
    expect(source).not.toContain(`stroke="#E5E7EB"`)
  })

  it('keeps the dashed grid with vertical lines (R11 parity)', () => {
    expect(source).toContain('strokeDasharray="3 3"')
    expect(source).toContain('vertical')
  })

  it('ships the area colors in the live\'s comma-form HSL', () => {
    expect(source).toContain('hsl(262, 83%, 58%)')
    expect(source).toContain('hsl(172, 66%, 50%)')
    expect(source).not.toContain('hsl(262 83% 58%)')
    expect(source).not.toContain('hsl(172 66% 50%)')
  })

  it('ships the tooltip at the live\'s 8px radius with NO box-shadow', () => {
    expect(source).toContain("borderRadius: '8px'")
    expect(source).not.toContain('boxShadow')
    expect(source).not.toContain('0.75rem')
  })

  it('keeps the R8-pinned tooltip border + font size', () => {
    expect(source).toContain("border: '1px solid #E5E7EB'")
    expect(source).toContain("fontSize: '12px'")
  })
})

describe('R28-F1 — chart config retirement ledger', () => {
  const source = src('src/components/dashboard/trend-chart.tsx')

  it('retires the R8-era comment claiming #E5E7EB grid equivalence', () => {
    // The live ships the HSL literal hsl(220, 13%, 91%) — same color, but
    // the byte-parity discipline pins the live's attr form.
    expect(source).not.toContain('hsl(220 13% 91%) = #E5E7EB')
  })
})
