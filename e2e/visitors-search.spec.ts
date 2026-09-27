import { expect, test } from '@playwright/test'

/**
 * Visitors search-debounce e2e (R35-G3) — the clone's search timing model,
 * never runtime-pinned before. The 20th probe generation drove the LIVE's
 * search box with "acm" and captured its model (evidence:
 * docs/plans/2026-09-27-round35-tooltip-search-activity-e2e-pins.md): a
 * fetch fires PER KEYSTROKE (3 requests — the live's undebounced Supabase
 * RPC) with the URL staying clean. The live's per-keystroke RPCs are a
 * performance defect; the clone deliberately diverges (D-class, the R22
 * Contact-Support precedent): typing debounces 350 ms into the URL-driven
 * server search (AGENTS "The visitor list is URL-driven" — `?q=` param,
 * `listVisitors` single query seam), then the rows re-render filtered.
 *
 * This spec pins the clone's own contract end-to-end:
 *   - typing does NOT navigate per keystroke (the URL stays clean, the
 *     rows stay unfiltered while the timer runs);
 *   - after the pause the URL gains ?q=, the rows are server-filtered;
 *   - clearing the search restores the unfiltered URL and rows.
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

test.describe('visitors search — 350 ms debounce into URL state (R35-G3)', () => {
  test('typing debounces into ?q= and filters the table; clearing restores it', async ({ page }) => {
    await login(page)
    await page.goto('/dashboard/visitors')

    // The seeded account shows its 3 identified visitors (sarah, marcus,
    // jane — prisma/seed.ts) on the unfiltered All tab.
    const rows = page.locator('table tbody tr')
    await expect(rows).toHaveCount(3)
    await expect(page).toHaveURL(/\/dashboard\/visitors$/)

    // Type WITHOUT waiting out the debounce: the URL stays clean and the
    // rows stay unfiltered while the timer runs (the live fires a fetch per
    // keystroke — the clone's debounce is the D-class divergence).
    const search = page.getByLabel('Search visitors')
    await search.click()
    await search.pressSequentially('sarah', { delay: 40 })
    await expect(page).toHaveURL(/\/dashboard\/visitors$/)

    // After the 350 ms pause the URL-driven server search fires: ?q=sarah
    // lands in the address bar and the table re-renders to the one match.
    await expect(page).toHaveURL(/\/dashboard\/visitors\?q=sarah$/, { timeout: 5000 })
    await expect(rows).toHaveCount(1)
    await expect(rows.first()).toContainText('sarah.chen@gmail.com')

    // Clearing the search debounces back to the unfiltered URL and rows.
    await search.fill('')
    await expect(page).toHaveURL(/\/dashboard\/visitors$/, { timeout: 5000 })
    await expect(rows).toHaveCount(3)
  })
})
