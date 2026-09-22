import { expect, test } from '@playwright/test'

/**
 * Pricing & Plan e2e (R26-F1) — the browser-level pin for the POPULAR
 * badge on the Growth card. The 11th probe generation found the live
 * renders a new-gen Badge (default variant, gradient-first consumer
 * tail `gradient-primary text-primary-foreground border-0 text-[10px]
 * px-2 py-0.5`) in the Growth card's `flex items-center justify-between`
 * header — in both billing states and both viewports. The clone missed it
 * since R15 (the old pin asserted its ABSENCE off stale evidence), and no
 * e2e spec watched the pricing page — this closes that coverage gap so a
 * future badge regression cannot slip through another five drift watches.
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

test.describe('pricing & plan page', () => {
  test('the Growth card carries the POPULAR badge; the others do not (R26-F1)', async ({ page }) => {
    await login(page)
    await page.goto('/dashboard/pricing')
    await expect(page.getByRole('heading', { name: 'Pricing & Plan' })).toBeVisible()

    // The badge: exactly one, inside the Growth card's header row.
    const badge = page.getByText('POPULAR', { exact: true })
    await expect(badge).toBeVisible()
    await expect(badge).toHaveClass(
      /inline-flex items-center rounded-full font-semibold[^"]*gradient-primary text-primary-foreground border-0 text-\[10px\] px-2 py-0\.5/,
    )
    // The badge sits in the Growth header row, immediately after the h3.
    const growthHeader = page.locator('h3', { hasText: 'Growth' }).locator('..')
    await expect(growthHeader).toHaveClass('flex items-center justify-between')
    await expect(growthHeader.locator('> h3 + div')).toHaveText('POPULAR')

    // The non-popular cards' header rows ship no badge (scoped to each
    // h3's PARENT header row — never an ancestor that would swallow the
    // Growth card too).
    for (const name of ['Free', 'Starter', 'Scale']) {
      const header = page.locator('h3', { hasText: name }).locator('..')
      await expect(header).toHaveClass('flex items-center justify-between')
      await expect(header.getByText('POPULAR', { exact: true })).toHaveCount(0)
    }
  })

  test('the badge persists across the billing toggle (both live states)', async ({ page }) => {
    await login(page)
    await page.goto('/dashboard/pricing')
    const badge = page.getByText('POPULAR', { exact: true })
    await expect(badge).toBeVisible()

    // The panel defaults to MONTHLY ($249/mo on Growth). Flip to annual —
    // the badge renders in BOTH states on the live (R26 runtime probe);
    // the Growth price moves $249 → $199 (plans.ts annualMonthlyPrice).
    const growthPrice = page
      .locator('h3', { hasText: 'Growth' })
      .locator('..')
      .locator('..')
      .locator('span.font-display.text-3xl')
    await expect(growthPrice).toHaveText('$249')
    await page.getByRole('switch').click()
    await expect(badge).toBeVisible()
    await expect(growthPrice).toHaveText('$199')
  })
})
