import { expect, test } from '@playwright/test'

/**
 * Trend-chart runtime pins (R28-F1) — the live's chart SVG decoded in the
 * 13th probe generation (evidence: the live captures in
 * docs/plans/2026-09-23-round28-trend-chart-axis-parity.md). recharts
 * renders at runtime, so the source pins in tests/chart-r28-parity.test.tsx
 * cannot see the produced SVG — these specs pin the rendered chrome:
 *
 *   - tick LINES on both axes (6 px, stroke hsl(220, 9%, 46%));
 *   - an axis LINE on both axes in the same stroke;
 *   - the plot origin at x≈65 (default YAxis width 60 + margin 5) inside
 *     the 595 px card at the 1280 viewport;
 *   - the tick <text> fill attr inherited from the axis stroke;
 *   - the tooltip's 8 px radius and absent box-shadow;
 *   - the grid stroke attr as the live's HSL literal.
 */
const DEMO_EMAIL = 'demo@pixelco.local'
const DEMO_PASSWORD = 'Demo123456!'

async function login(page: import('@playwright/test').Page) {
  await page.goto('/login')
  await page.getByLabel('Email').fill(DEMO_EMAIL)
  await page.getByLabel('Password').fill(DEMO_PASSWORD)
  await page.getByRole('button', { name: 'Sign In' }).click()
  await expect(page).toHaveURL(/\/dashboard$/)
}

test.describe('trend chart axis chrome (R28-F1)', () => {
  test('renders tick lines + axis lines on both axes in the live stroke', async ({ page }) => {
    await login(page)

    const svg = page.locator('svg.recharts-surface').first()
    await expect(svg).toBeVisible()

    // X tick lines: one per visible date label (the live renders 12 of 14
    // at the 595 px card — assert a sane floor, the exact thinning is
    // geometry-dependent).
    const xTickLines = svg.locator(
      'g.recharts-cartesian-axis-tick line.recharts-cartesian-axis-tick-line',
    )
    const tickLineCount = await xTickLines.count()
    expect(tickLineCount).toBeGreaterThanOrEqual(10)

    // Every tick line carries the live's gray-500 stroke.
    for (let i = 0; i < tickLineCount; i++) {
      await expect(xTickLines.nth(i)).toHaveAttribute('stroke', 'hsl(220, 9%, 46%)')
    }

    // Axis lines: the y-axis line EXISTS (pre-fix it was suppressed) and
    // both carry the live's stroke.
    const axisLines = svg.locator('line.recharts-cartesian-axis-line')
    await expect(axisLines.first()).toHaveAttribute('stroke', 'hsl(220, 9%, 46%)')
    expect(await axisLines.count()).toBeGreaterThanOrEqual(2)

    // The tick <text> inherits the axis stroke (fill attr = the HSL
    // literal, not an explicit hex).
    const firstTickText = svg.locator('.recharts-cartesian-axis-tick text').first()
    await expect(firstTickText).toHaveAttribute('fill', 'hsl(220, 9%, 46%)')
  })

  test('places the plot origin at the live geometry (YAxis gutter ≈ 65 px)', async ({ page }) => {
    await login(page)

    const svg = page.locator('svg.recharts-surface').first()
    await expect(svg).toBeVisible()

    const box = await svg.boundingBox()
    expect(box).not.toBeNull()
    // The live's card renders a 595 px chart at the 1280 viewport; the
    // pre-fix margin hack shifted the plot origin to x≈42.
    expect(Math.round(box!.width)).toBeGreaterThan(560)
    expect(Math.round(box!.width)).toBeLessThan(640)
    expect(Math.round(box!.height)).toBe(280)

    // Plot origin: the x-axis line starts at x≈65 SVG-local (margin 5 +
    // YAxis width 60). getBBox is SVG-local — no scroll artifacts.
    const origin = await svg.evaluate((node: SVGSVGElement) => {
      const axisLine = node.querySelector('line.recharts-cartesian-axis-line')
      return axisLine ? Math.round(Number(axisLine.getAttribute('x1'))) : -1
    })
    expect(origin).toBeGreaterThanOrEqual(60)
    expect(origin).toBeLessThanOrEqual(70)
  })

  test('ships the tooltip at 8px radius with no shadow + the live grid stroke', async ({ page }) => {
    await login(page)

    const svg = page.locator('svg.recharts-surface').first()
    await expect(svg).toBeVisible()

    // Grid: the live's HSL literal (same color as #E5E7EB — the byte
    // discipline pins the live's attr form) + dashed.
    const gridLine = svg.locator('.recharts-cartesian-grid line').first()
    await expect(gridLine).toHaveAttribute('stroke', 'hsl(220, 13%, 91%)')
    await expect(gridLine).toHaveAttribute('stroke-dasharray', '3 3')

    // Tooltip chrome: hover the chart, then read the default tooltip's
    // inline style — the live ships border-radius 8px and NO box-shadow.
    const chartBox = await svg.boundingBox()
    expect(chartBox).not.toBeNull()
    await page.mouse.move(chartBox!.x + chartBox!.width / 2, chartBox!.y + 100)

    const tooltip = page.locator('.recharts-tooltip-wrapper .recharts-default-tooltip')
    await expect(tooltip.first()).toBeVisible({ timeout: 5000 })
    const style = await tooltip.first().getAttribute('style')
    expect(style).toContain('border-radius: 8px')
    expect(style).not.toContain('box-shadow')
  })
})
