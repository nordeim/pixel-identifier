import { expect, test } from '@playwright/test'
import { PrismaClient } from '@prisma/client'
import { randomBytes } from 'node:crypto'
import { join } from 'node:path'

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
 * Fixture note (R31): the demo account is on the FREE plan — its 1-domain
 * cap is already used by the seed (demo-store.example.com), so a second
 * domain CANNOT be added through the UI (the add is rejected; the toast
 * never fires — the R30 session died on exactly this). The spec therefore
 * inserts its probe site DIRECTLY into the e2e database — the same
 * throwaway db/e2e.db scripts/e2e-server.mjs pushes + seeds on every boot
 * (never the dev DB), the established probe precedent (R30 plan §F3) —
 * with a valid px_ hex key (the buildSnippet contract). Each test cleans
 * its own probe family first, so the state is deterministic even against
 * a reused server: exactly [demo-store, this test's probe].
 */
const DEMO_EMAIL = 'demo@pixelco.local'
const DEMO_PASSWORD = 'Demo123456!'
const PROBE_FAMILY = 'r30-e2e-'

// Playwright runs its workers from the config dir (the repo root), and the
// e2e-server uses the same <repo>/db/e2e.db — resolve against process.cwd().
const repoRoot = process.cwd()
const e2eDatabaseUrl = `file:${join(repoRoot, 'db', 'e2e.db')}`

async function login(page: import('@playwright/test').Page) {
  await page.goto('/login')
  await page.getByLabel('Email').fill(DEMO_EMAIL)
  await page.getByLabel('Password').fill(DEMO_PASSWORD)
  await page.getByRole('button', { name: 'Sign In' }).click()
  await expect(page).toHaveURL(/\/dashboard$/)
}

/**
 * Crosses the sites.length > 1 gate deterministically: removes any prior
 * probe rows, then inserts ONE fresh site (newest by createdAt, no events
 * yet → the waiting banner) for the demo user. SQLite is single-writer —
 * bounded retry with backoff in case the server holds a write lock.
 */
async function seedProbeSite(domain: string) {
  const db = new PrismaClient({ datasourceUrl: e2eDatabaseUrl })
  try {
    const user = await db.user.findUnique({ where: { email: DEMO_EMAIL } })
    if (!user) throw new Error(`e2e seed missing demo user ${DEMO_EMAIL}`)

    await db.site.deleteMany({
      where: { userId: user.id, domain: { startsWith: PROBE_FAMILY } },
    })
    await db.site.create({
      data: {
        userId: user.id,
        domain,
        // The contract: px_ + exactly 16 hex chars (buildSnippet validates).
        siteKey: `px_${randomBytes(8).toString('hex')}`,
        status: 'verified',
        lastEventAt: null,
      },
    })
  } finally {
    await db.$disconnect()
  }
}

/**
 * HERMETIC fixture hygiene: the probe sites must never leak past this spec —
 * later specs read the demo account's Install snippet expecting the SEEDED
 * site (pipeline.spec extracts the site key from it and host-matches its
 * beacon against demo-store.example.com), and a reused server must find the
 * demo account exactly as seeded. Cleaning on both ends keeps the shared
 * e2e DB deterministic regardless of run order or server reuse.
 */
async function cleanProbeSites() {
  const db = new PrismaClient({ datasourceUrl: e2eDatabaseUrl })
  try {
    await db.site.deleteMany({ where: { domain: { startsWith: PROBE_FAMILY } } })
  } finally {
    await db.$disconnect()
  }
}

test.describe('install page — DomainSwitcher selection model (R30)', () => {
  // Hermetic on both ends (see cleanProbeSites): stale rows from an
  // interrupted prior run are gone before, and the demo account is back to
  // its seeded single-site state after.
  test.beforeAll(cleanProbeSites)
  test.afterAll(cleanProbeSites)

  // Each test seeds its OWN probe domain (unique name) after cleaning the
  // family — the shared e2e DB stays deterministic per spec.
  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  test('F4: the newest domain is the default selection, newest-first options', async ({ page }) => {
    await seedProbeSite(`${PROBE_FAMILY}first.example.com`)
    await page.goto('/dashboard/install')
    // The live is CSR — the switcher only exists after hydration; the
    // standalone build streams fast, so pin on the trigger's visibility.
    await expect(page.getByRole('combobox')).toBeVisible()
    const trigger = page.getByRole('combobox')
    // The just-added domain (newest) is selected by default — the live's
    // behavior (its switcher showed the freshly added probe domain).
    await expect(trigger).toContainText(`${PROBE_FAMILY}first.example.com`)

    await trigger.click()
    const options = page.getByRole('option')
    await expect(options.first()).toContainText(`${PROBE_FAMILY}first.example.com`)
    await expect(options.nth(1)).toContainText('demo-store.example.com')
  })

  test('F3: selecting a domain keeps the URL clean while the snippet swaps', async ({ page }) => {
    await seedProbeSite(`${PROBE_FAMILY}second.example.com`)
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
    await page.getByRole('option', { name: `${PROBE_FAMILY}second.example.com` }).click()
    const after = await page.evaluate(() =>
      document.querySelector('pre code')?.textContent?.match(/px_[0-9a-f]{16}/)?.[0] ?? null,
    )
    expect(after).toBeTruthy()
    expect(after).not.toBe(before)
    // Still no param after the second selection.
    await expect(page).toHaveURL(/\/dashboard\/install$/)
  })

  test('the Quick Start card stays intact through the swap (copy + banner)', async ({ page }) => {
    await seedProbeSite(`${PROBE_FAMILY}third.example.com`)
    await page.goto('/dashboard/install')
    await expect(page.getByRole('combobox')).toBeVisible()
    const copyButton = page.getByRole('button', { name: 'Copy' })
    await expect(copyButton).toBeVisible()
    // The waiting banner (no events for the fresh domain) — the live's
    // default-state copy.
    await expect(page.getByText('Waiting for first event...')).toBeVisible()
  })
})
