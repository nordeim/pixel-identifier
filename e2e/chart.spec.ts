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

  // R35-G1: the tooltip's FULL runtime contract — probed live at the same
  // SVG coordinates in the 20th generation (evidence:
  // docs/plans/2026-09-27-round35-tooltip-search-activity-e2e-pins.md): the
  // wrapper class family, the 400ms transform transition, the content format
  // (date label + "name : value" entries — the R28-confirmed candidate), and
  // the byte-identical inner inline style. The radius-only spec above cannot
  // see any of this.
  test('tooltip hover state: wrapper family, transition, content format, inner style (R35-G1)', async ({ page }) => {
    await login(page)

    const svg = page.locator('svg.recharts-surface').first()
    await expect(svg).toBeVisible()

    const chartBox = await svg.boundingBox()
    expect(chartBox).not.toBeNull()
    await page.mouse.move(chartBox!.x + chartBox!.width / 2, chartBox!.y + 100)

    // Wrapper: the live's exact class family (right+bottom placement) and
    // the 400ms transform transition recharts ships from the live's config.
    const wrapper = page.locator('.recharts-tooltip-wrapper').first()
    await expect(wrapper).toBeVisible({ timeout: 5000 })
    await expect(wrapper).toHaveClass(
      'recharts-tooltip-wrapper recharts-tooltip-wrapper-right recharts-tooltip-wrapper-bottom',
    )
    const wrapperStyle = await wrapper.getAttribute('style')
    expect(wrapperStyle).toContain('visibility: visible')
    expect(wrapperStyle).toContain('transition: transform 400ms')

    // Content: the live's format — the date label, then one
    // "name : value" entry per series (recharts' default ` : ` join).
    const content = await wrapper.textContent()
    expect(content).toMatch(/^Sep \d{1,2}/)
    expect(content).toContain('Pageviews : ')
    expect(content).toContain('Identified : ')

    // Inner: the live's full recharts-default-tooltip inline style, probed
    // byte-identical both sides (10px padding, white bg, the rgb(229, 231,
    // 235) border, nowrap, 8px radius, 12px font — and no shadow).
    const inner = wrapper.locator('.recharts-default-tooltip').first()
    const innerStyle = await inner.getAttribute('style')
    expect(innerStyle).toContain('margin: 0px')
    expect(innerStyle).toContain('padding: 10px')
    expect(innerStyle).toContain('background-color: rgb(255, 255, 255)')
    expect(innerStyle).toContain('border: 1px solid rgb(229, 231, 235)')
    expect(innerStyle).toContain('white-space: nowrap')
    expect(innerStyle).toContain('border-radius: 8px')
    expect(innerStyle).toContain('font-size: 12px')
    expect(innerStyle).not.toContain('box-shadow')
  })
})
