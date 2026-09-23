import { expect, test } from '@playwright/test'

/**
 * Select open-state runtime pins (R29-F1) — the live's Radix Select portal
 * decoded in the 14th probe generation (evidence: the live captures in
 * docs/plans/2026-09-23-round29-select-item-class-order.md). The portal
 * items only exist in a real browser (Radix portal), so the source pins in
 * tests/select-r29-parity.test.tsx cannot see the rendered class attribute —
 * these specs pin it:
 *
 *   - every [role=option] class attribute equals the live string EXACTLY
 *     (order-sensitive: the data-[disabled]: pair renders BEFORE the
 *     focus: pair — the live's bundle flipped the legacy order in the
 *     R11→R16 window);
 *   - the same on the SECOND filter surface (source — the live's pattern
 *     was confirmed on all three of its Selects);
 *   - the selected option carries the LEFT indicator (pl-8 layout) with
 *     the lucide check icon and the ItemText span.
 */
const LIVE_ITEM_CLASS =
  'relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 focus:bg-accent focus:text-accent-foreground'

const DEMO_EMAIL = 'demo@pixelco.local'
const DEMO_PASSWORD = 'Demo123456!'

async function login(page: import('@playwright/test').Page) {
  await page.goto('/login')
  await page.getByLabel('Email').fill(DEMO_EMAIL)
  await page.getByLabel('Password').fill(DEMO_PASSWORD)
  await page.getByRole('button', { name: 'Sign In' }).click()
  await expect(page).toHaveURL(/\/dashboard$/)
}

test.describe('Select open-state portal (R29-F1)', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
    await page.goto('/dashboard/visitors')
  })

  test('confidence options render the live item class, order-sensitive', async ({ page }) => {
    // The confidence filter is the FIRST combobox in DOM order.
    await page.locator('button[role="combobox"]').first().click()

    const options = page.locator('[role="option"]')
    await expect(options.first()).toBeVisible()
    await expect(options).toHaveCount(4)

    // toHaveAttribute('class', …) is an EXACT match — order-sensitive.
    for (let i = 0; i < 4; i++) {
      await expect(options.nth(i)).toHaveAttribute('class', LIVE_ITEM_CLASS)
    }
  })

  test('source options render the same live item class', async ({ page }) => {
    // The source filter is the SECOND combobox in DOM order.
    await page.locator('button[role="combobox"]').nth(1).click()

    const options = page.locator('[role="option"]')
    await expect(options.first()).toBeVisible()
    await expect(options).toHaveCount(3)

    for (let i = 0; i < 3; i++) {
      await expect(options.nth(i)).toHaveAttribute('class', LIVE_ITEM_CLASS)
    }
  })

  test('the selected option carries the LEFT indicator with the lucide check', async ({ page }) => {
    await page.locator('button[role="combobox"]').first().click()

    const selected = page.locator('[role="option"][aria-selected="true"]')
    await expect(selected).toBeVisible()
    await expect(selected).toHaveAttribute('data-state', 'checked')

    // Indicator-LEFT layout (pl-8): the absolute span holds the check icon.
    const indicator = selected.locator('span.absolute.left-2')
    await expect(indicator).toBeVisible()
    await expect(indicator.locator('svg.lucide-check')).toBeVisible()

    // The ItemText span carries the selected label.
    await expect(selected).toContainText('All Confidence')
  })
})
