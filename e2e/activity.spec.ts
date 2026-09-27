import { expect, test } from '@playwright/test'
import { PrismaClient } from '@prisma/client'
import { join } from 'node:path'

/**
 * Activity pagination e2e (R35-G4) — the R22 footer's RUNTIME behavior,
 * never pinned anywhere before (runtime-latent on both sides at the seeded
 * dataset: the live account holds 6 events, the clone's seed 12 — both
 * below the 50/page threshold; the R22 SOURCE pins in
 * tests/activity-r22-parity.test.tsx stayed the contract until now).
 *
 * The hermetic fixture (the R31 probe-site precedent) crosses the latency
 * threshold deterministically: 60 direct-DB pageview events with the
 * probe path family `r35-e2e-` attached to the seeded demo site (newest by
 * createdAt, descending by one minute per event so the ordering is
 * deterministic), cleaned on BOTH ends so later specs and reused servers
 * find the demo account exactly as seeded.
 *
 * Pinned behavior (the live's model, bundle component hxe / Jc=50):
 *   - the footer renders ONLY when count > 50: "1–50 of N" + ghost
 *     chevron buttons (h-7 w-7) with "Page X of Y" between them;
 *   - page advance REPLACES the list (a client fetch to
 *     /api/activity?page=1, never polling);
 *   - the ghost buttons disable at the bounds (prev on page 1, next on
 *     the last page).
 */
const DEMO_EMAIL = 'demo@pixelco.local'
const DEMO_PASSWORD = 'Demo123456!'
const PROBE_PATH = '/r35-e2e-probe'
const PROBE_EVENT_COUNT = 60

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

async function cleanProbeEvents() {
  const db = new PrismaClient({ datasourceUrl: e2eDatabaseUrl })
  try {
    await db.event.deleteMany({ where: { path: { startsWith: PROBE_PATH } } })
  } finally {
    await db.$disconnect()
  }
}

test.describe('activity log — pagination footer (R35-G4)', () => {
  // Hermetic on both ends: stale probe events from an interrupted prior run
  // are gone before, and the demo account is back to its seeded event set
  // after (later specs read the activity feed expecting the seed).
  test.beforeAll(cleanProbeEvents)
  test.afterAll(cleanProbeEvents)

  test('the 50/page offset footer paginates: counters, ghost bounds, page swap', async ({ page }) => {
    // Cross the threshold: 60 probe pageview events on the seeded demo
    // site, newest first (one minute apart, descending into the past so the
    // probe family owns the top of the feed deterministically).
    const db = new PrismaClient({ datasourceUrl: e2eDatabaseUrl })
    let expectedTotal: number
    try {
      const user = await db.user.findUnique({ where: { email: DEMO_EMAIL } })
      if (!user) throw new Error(`e2e seed missing demo user ${DEMO_EMAIL}`)
      const site = await db.site.findFirst({ where: { userId: user.id } })
      if (!site) throw new Error('e2e seed missing demo site')
      const visitor = await db.visitor.findFirst({ where: { siteId: site.id } })
      if (!visitor) throw new Error('e2e seed missing demo visitor')

      const seeded = await db.event.count({ where: { siteId: site.id } })
      expectedTotal = seeded + PROBE_EVENT_COUNT

      const now = Date.now()
      await db.event.createMany({
        data: Array.from({ length: PROBE_EVENT_COUNT }, (_, i) => ({
          siteId: site.id,
          visitorId: visitor.id,
          name: 'pageview',
          path: `${PROBE_PATH}-${String(i).padStart(2, '0')}`,
          pageUrl: `https://${site.domain}${PROBE_PATH}-${i}`,
          createdAt: new Date(now - i * 60_000),
        })),
      })
    } finally {
      await db.$disconnect()
    }

    await login(page)
    await page.goto('/dashboard/activity')

    // The footer appears once the count spans pages: page-1 counters and
    // the ghost chevrons with the page indicator between them.
    const footer = page.locator('div.flex.items-center.justify-between.px-5.py-3.border-t.border-border')
    await expect(footer).toBeVisible()
    await expect(footer).toContainText(`1–50 of ${expectedTotal}`)
    await expect(footer).toContainText('Page 1 of 2')

    // Ghost bounds on page 1: prev disabled, next enabled.
    const prev = page.getByRole('button', { name: 'Previous page' })
    const next = page.getByRole('button', { name: 'Next page' })
    await expect(prev).toBeDisabled()
    await expect(next).toBeEnabled()

    // Page advance REPLACES the list (a client fetch, never polling): page
    // 2 shows the OLDEST probe events plus the seeded tail, and the
    // counters + ghost bounds flip.
    await next.click()
    await expect(footer).toContainText(`51–${expectedTotal} of ${expectedTotal}`, {
      timeout: 5000,
    })
    await expect(footer).toContainText('Page 2 of 2')
    await expect(prev).toBeEnabled()
    await expect(next).toBeDisabled()

    // Page 2's list is the offset slice: the oldest probe event (index 59)
    // IS present on this page while the newest (index 00) is NOT.
    const list = page.locator('div.divide-y')
    await expect(list).toContainText(`${PROBE_PATH}-59`)
    await expect(list).not.toContainText(`${PROBE_PATH}-00`)

    // Going back restores page 1.
    await prev.click()
    await expect(footer).toContainText('Page 1 of 2', { timeout: 5000 })
    await expect(list).toContainText(`${PROBE_PATH}-00`)
  })
})
