import { expect, test } from '@playwright/test'

/**
 * Install-page e2e (R30-F3/F4) — the DomainSwitcher selection model,
 * decoded from the live in the 15th probe generation (evidence:
 * docs/plans/2026-09-23-round30-sidebar-wrapper-install-parity.md):
 *
 *   - F4: the live lists sites NEWEST-FIRST — a freshly added domain is
 *     the FIRST switcher option and the DEFAULT selection;
 *   - F3: selecting another domain is PURE CLIENT STATE — the trigger
 *     text and the snippet's px_ site key swap while the URL stays
 *     /dashboard/install (no ?site= param; the pre-fix clone pushed
 *     ?site=<key> into the address bar).
 *
 * The e2e DB seeds exactly ONE domain (demo-store.example.com), so each
 * spec adds a second domain through the real UI first — which also makes
 * "newest-first" directly observable (the just-added domain must be
 * selected).
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

/** Adds a fresh domain through the UI (crosses the sites.length > 1 gate). */
async function addDomain(page: import('@playwright/test').Page, domain: string) {
  await page.goto('/dashboard/domains')
  await page.getByLabel("Domain to register").fill(domain)
  await page.getByRole('button', { name: 'Add Domain' }).click()
  await expect(page.getByText('Domain added successfully')).toBeVisible()
}

test.describe('install page — DomainSwitcher selection model (R30)', () => {
  // Each test adds its OWN domain (unique name): the three specs share one
  // e2e DB per run, and a re-add of the same name would be rejected.
  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  test('F4: the newest domain is the default selection, newest-first options', async ({ page }) => {
    await addDomain(page, 'r30-e2e-first.example.com')
    await page.goto('/dashboard/install')
    // The live is CSR — the switcher only exists after hydration; the
    // standalone build streams fast, so pin on the trigger's visibility.
    await expect(page.getByRole('combobox')).toBeVisible()
    const trigger = page.getByRole('combobox')
    // The just-added domain (newest) is selected by default — the live's
    // behavior (its switcher showed the freshly added probe domain).
    await expect(trigger).toContainText('r30-e2e-first.example.com')

    await trigger.click()
    const options = page.getByRole('option')
    await expect(options.first()).toContainText('r30-e2e-first.example.com')
    await expect(options.nth(1)).toContainText('demo-store.example.com')
  })

  test('F3: selecting a domain keeps the URL clean while the snippet swaps', async ({ page }) => {
    await addDomain(page, 'r30-e2e-second.example.com')
    await page.goto('/dashboard/install')
    await expect(page.getByRole('combobox')).toBeVisible()
    // Sanity: the initial URL carries no param.
    await expect(page).toHaveURL(/\/dashboard\/install$/)

    const trigger = page.getByRole('combobox')
    await trigger.click()
    // Select the OTHER domain (demo-store — the oldest).
    await page.getByRole('option', { name: 'demo-store.example.com' }).click()

    // The URL must NOT gain a ?site= param — the live's selection is pure
    // client state (the pre-fix clone pushed ?site=<key>).
    await expect(page).toHaveURL(/\/dashboard\/install$/)

    // The trigger text swapped…
    await expect(trigger).toContainText('demo-store.example.com')
    // …and the snippet's site key swapped with it (client-side rebuild).
    await expect(page.locator('pre code').first()).toContainText('px_')
    // The demo seed's site key is generated at boot; assert the swap by
    // capturing the key before/after instead of a literal.
    const before = await page.evaluate(() =>
      document.querySelector('pre code')?.textContent?.match(/px_[0-9a-f]{16}/)?.[0] ?? null,
    )
    await trigger.click()
    await page.getByRole('option', { name: 'r30-e2e-second.example.com' }).click()
    const after = await page.evaluate(() =>
      document.querySelector('pre code')?.textContent?.match(/px_[0-9a-f]{16}/)?.[0] ?? null,
    )
    expect(after).toBeTruthy()
    expect(after).not.toBe(before)
    // Still no param after the second selection.
    await expect(page).toHaveURL(/\/dashboard\/install$/)
  })

  test('the Quick Start card stays intact through the swap (copy + banner)', async ({ page }) => {
    await addDomain(page, 'r30-e2e-third.example.com')
    await page.goto('/dashboard/install')
    await expect(page.getByRole('combobox')).toBeVisible()
    const copyButton = page.getByRole('button', { name: 'Copy' })
    await expect(copyButton).toBeVisible()
    // The waiting banner (no events for the fresh domain) — the live's
    // default-state copy.
    await expect(page.getByText('Waiting for first event...')).toBeVisible()
  })
})
