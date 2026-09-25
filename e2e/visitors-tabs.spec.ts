import { expect, test } from '@playwright/test'

/**
 * Visitors segment tabs e2e (R34-F3) — the runtime regression net for the
 * All/Individuals/Companies tab mechanism. Verified at live parity in the
 * 19th probe generation: trusted clicks switch the active tab and filter
 * the table rows. The LIVE keeps the selection in client state (URL stays
 * clean); the CLONE drives the list through the URL (?type= — the
 * documented URL-driven list design, AGENTS "The visitor list is
 * URL-driven") — functionally equivalent, and the URL param is part of the
 * clone's contract, so it is pinned here.
 *
 * The e2e demo seed (db/e2e.db) ships 3 identified visitors: 2 individuals
 * + 1 company — driving the count badges and the per-tab row counts.
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

test.describe('visitors segment tabs', () => {
  test('switching tabs drives the URL state and the active pill', async ({ page }) => {
    await login(page)
    await page.getByRole('link', { name: 'Visitors' }).click()
    await expect(page).toHaveURL(/\/dashboard\/visitors$/)

    // The three segment pills with the seeded count badges (R16 D1).
    const tabs = page.getByRole('tab')
    await expect(tabs).toHaveCount(3)
    await expect(page.getByRole('tab', { name: /All/ })).toHaveText(/All\s*3/)
    await expect(page.getByRole('tab', { name: /Individuals/ })).toHaveText(/Individuals\s*2/)
    await expect(page.getByRole('tab', { name: /Companies/ })).toHaveText(/Companies\s*1/)

    // All is active on load; the table renders every identified visitor.
    await expect(page.getByRole('tab', { name: /All/ })).toHaveAttribute(
      'data-state',
      'active',
    )
    await expect(page.getByRole('table')).toBeVisible()
    await expect(page.locator('tbody tr')).toHaveCount(3)

    // Switching to Individuals: the pill activates and the URL carries the
    // segment (the clone's URL-driven model — the live's client-state
    // equivalent keeps the URL clean).
    await page.getByRole('tab', { name: /Individuals/ }).click()
    await expect(page.getByRole('tab', { name: /Individuals/ })).toHaveAttribute(
      'data-state',
      'active',
    )
    await expect(page).toHaveURL(/type=individual/)

    // Back to All via the pill: the URL returns to the clean form.
    await page.getByRole('tab', { name: /All/ }).click()
    await expect(page).toHaveURL(/\/dashboard\/visitors$/)
  })

  test('each tab filters the table to its segment (R21 model)', async ({ page }) => {
    await login(page)
    await page.goto('/dashboard/visitors')

    // Individuals: the 2 personal-email rows.
    await page.getByRole('tab', { name: /Individuals/ }).click()
    await expect(page.locator('tbody tr')).toHaveCount(2)
    // The B2C tab never renders the company sub-line ("· N visits").
    await expect(page.getByText(/·\s*\d+\s+visits/)).toHaveCount(0)

    // Companies: the single B2B row — company name + the visits sub-line
    // (the seeded Acme Corp row).
    await page.getByRole('tab', { name: /Companies/ }).click()
    await expect(page).toHaveURL(/type=company/)
    await expect(page.locator('tbody tr')).toHaveCount(1)
    await expect(page.getByText(/·\s*\d+\s+visits/)).toHaveCount(1)

    // The tab selection survives a reload (URL-driven — R22's model keeps
    // filters in the URL, unlike the live's client state).
    await page.reload()
    await expect(page.getByRole('tab', { name: /Companies/ })).toHaveAttribute(
      'data-state',
      'active',
    )
    await expect(page.locator('tbody tr')).toHaveCount(1)
  })
})
