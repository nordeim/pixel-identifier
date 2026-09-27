import { expect, test } from '@playwright/test'
import { PrismaClient } from '@prisma/client'
import { randomBytes } from 'node:crypto'
import { join } from 'node:path'

/**
 * Domains delete-flow e2e (R35-G2) — the clone's own D-class delete flow,
 * never runtime-pinned before (the R26/R31/R32 lesson: never-diffed ≠
 * absent). The live deletes IMMEDIATELY with no confirm (re-verified in the
 * 20th probe generation — evidence:
 * docs/plans/2026-09-27-round35-tooltip-search-activity-e2e-pins.md); the
 * clone deliberately diverges: a Radix AlertDialog must confirm the
 * cascade (the R20 ruling — never replicate a live defect; PAD §11), and a
 * successful delete fires the R27 `Domain removed` sonner toast.
 *
 * Also pins the enforced free-plan 1-domain cap (the typed FORBIDDEN
 * action): the live ACCEPTS a third domain on its FREE account (probe-
 * verified R35 — a live defect); the clone blocks the add past its
 * advertised cap with an error toast (src/actions/domains.ts — FORBIDDEN
 * carries no fieldErrors, so the panel surfaces it via sonner, not the
 * inline role=alert path the VALIDATION branch uses).
 *
 * Fixture note (R31 precedent): the demo account is FREE and its 1-domain
 * cap is already used by the seed (demo-store.example.com), so the delete
 * spec inserts its probe domain DIRECTLY into the throwaway db/e2e.db
 * (the same database scripts/e2e-server.mjs pushes + seeds on every boot —
 * never the dev DB), cleaned on both ends so later specs and reused servers
 * find the demo account exactly as seeded.
 */
const DEMO_EMAIL = 'demo@pixelco.local'
const DEMO_PASSWORD = 'Demo123456!'
const PROBE_FAMILY = 'r35-e2e-'

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

/** HERMETIC hygiene: the probe family never leaks past this spec. */
async function cleanProbeSites() {
  const db = new PrismaClient({ datasourceUrl: e2eDatabaseUrl })
  try {
    await db.site.deleteMany({ where: { domain: { startsWith: PROBE_FAMILY } } })
  } finally {
    await db.$disconnect()
  }
}

test.describe('domains page — the clone\u2019s delete-confirm flow (R35-G2)', () => {
  test.beforeAll(cleanProbeSites)
  test.afterAll(cleanProbeSites)

  test('Cancel keeps the row; Confirm removes it and fires the Domain removed toast', async ({ page }) => {
    const db = new PrismaClient({ datasourceUrl: e2eDatabaseUrl })
    const probeDomain = `${PROBE_FAMILY}delete-flow.test`
    try {
      await db.site.deleteMany({ where: { domain: probeDomain } })
      const user = await db.user.findUnique({ where: { email: DEMO_EMAIL } })
      if (!user) throw new Error(`e2e seed missing demo user ${DEMO_EMAIL}`)
      await db.site.create({
        data: {
          userId: user.id,
          domain: probeDomain,
          siteKey: `px_${randomBytes(8).toString('hex')}`,
          status: 'verified',
          lastEventAt: null,
        },
      })
    } finally {
      await db.$disconnect()
    }

    await login(page)
    await page.goto('/dashboard/domains')

    // The probe row renders alongside the seeded demo-store domain.
    const probeName = page.locator('span.text-sm.font-semibold', { hasText: probeDomain })
    await expect(probeName).toBeVisible()

    // Open the confirm dialog (the clone's D-class divergence — the live
    // deletes immediately with no dialog, re-verified R35).
    await page.getByRole('button', { name: `Delete ${probeDomain}` }).click()
    const dialog = page.getByRole('alertdialog')
    await expect(dialog).toBeVisible()
    await expect(dialog).toContainText(`Delete ${probeDomain}?`)
    await expect(dialog).toContainText('This action cannot be undone.')

    // Cancel: the dialog closes and the row survives.
    await dialog.getByRole('button', { name: 'Cancel' }).click()
    await expect(dialog).not.toBeVisible()
    await expect(probeName).toBeVisible()

    // Confirm: the row is removed AND the R27 success toast fires.
    await page.getByRole('button', { name: `Delete ${probeDomain}` }).click()
    await dialog.getByRole('button', { name: 'Delete domain' }).click()
    await expect(probeName).not.toBeVisible()
    const toast = page.locator('[data-sonner-toast]')
    await expect(toast.first()).toBeVisible({ timeout: 5000 })
    await expect(toast.first()).toContainText('Domain removed')
  })

  test('the free-plan 1-domain cap blocks a second UI add (the live accepts a third — a live defect)', async ({ page }) => {
    await login(page)
    await page.goto('/dashboard/domains')

    // The seed already used the FREE plan's single-domain allowance; the
    // clone enforces its advertised cap with a typed FORBIDDEN result while
    // the live's free account accepted a 3rd domain (R35 probe). FORBIDDEN
    // carries no fieldErrors → the panel surfaces it as an error toast.
    await page.getByLabel('Domain to register').fill(`${PROBE_FAMILY}cap-probe.test`)
    await page.getByRole('button', { name: 'Add Domain' }).click()

    const toast = page.locator('[data-sonner-toast]')
    await expect(toast.first()).toBeVisible({ timeout: 5000 })
    await expect(toast.first()).toContainText('Could not add domain')
    await expect(toast.first()).toContainText(
      'The Free plan includes 1 domain. Upgrade to add more.',
    )

    // The add never happened — no row carries the probe domain.
    await expect(
      page.locator('span.text-sm.font-semibold', { hasText: `${PROBE_FAMILY}cap-probe` }),
    ).toHaveCount(0)
  })
})
