import { expect, test } from '@playwright/test'
import { PrismaClient } from '@prisma/client'
import { join } from 'node:path'

/**
 * Tracking-pipeline e2e (R23-F8) — the public surface (collector script,
 * health) and the beacon → dashboard loop against the e2e database.
 *
 * Hermetic hygiene (R35, the R31 lesson): the beacon spec's probe visitor
 * (`e2e-visitor-*`) is deleted on BOTH ends. The identity resolver's
 * decision derives from sha256(siteKey + anonymousId) and the e2e seed
 * mints a FRESH site key on every boot — so whether the probe beacon's
 * visitor gets identified (~20% match rate) varies per boot. When it does,
 * the identified-visitors table shows a 4th row and every later
 * count-pinned spec (visitors-tabs R34, visitors-search R35) goes red on a
 * boot-lucky basis — exactly the "later specs expect the demo account
 * EXACTLY as seeded" failure the R31 probe-site fixture fixed. The
 * events cascade with the visitor (FK onDelete: Cascade), so the activity
 * feed returns to its seeded set too.
 */
const DEMO_EMAIL = 'demo@pixelco.local'
const PROBE_VISITOR_FAMILY = 'e2e-visitor-'

// Playwright runs its workers from the config dir (the repo root), and the
// e2e-server uses the same <repo>/db/e2e.db — resolve against process.cwd().
const repoRoot = process.cwd()
const e2eDatabaseUrl = `file:${join(repoRoot, 'db', 'e2e.db')}`

async function cleanProbeVisitors() {
  const db = new PrismaClient({ datasourceUrl: e2eDatabaseUrl })
  try {
    await db.visitor.deleteMany({
      where: { anonymousId: { startsWith: PROBE_VISITOR_FAMILY } },
    })
  } finally {
    await db.$disconnect()
  }
}

test.describe('public pipeline surface', () => {
  test('/api/health reports ok with the db up', async ({ request }) => {
    const response = await request.get('/api/health')
    expect(response.status()).toBe(200)
    expect(await response.json()).toEqual({ status: 'ok', db: 'up' })
  })

  test('/pixel.js serves the collector script', async ({ request }) => {
    const response = await request.get('/pixel.js')
    expect(response.status()).toBe(200)
    expect(response.headers()['content-type']).toContain('javascript')
    const body = await response.text()
    // The collector's identifying seams: the data-site attribute read and
    // the /api/track beacon endpoint.
    expect(body).toContain('data-site')
    expect(body).toContain('/api/track')
  })

  test('an unknown site key is indistinguishably accepted (anti-enumeration 204)', async ({
    request,
  }) => {
    const response = await request.fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
      data: '{"k":"px_does_not_exist","u":"https://demo-store.example.com/","p":"/","r":"","v":"e2e-unknown-key"}',
    })
    expect(response.status()).toBe(204)
  })
})

test.describe('beacon → dashboard loop', () => {
  // Hermetic on both ends (see the fixture note above): the probe visitor
  // never leaks past this spec, whatever the resolver decided this boot.
  test.beforeAll(cleanProbeVisitors)
  test.afterAll(cleanProbeVisitors)

  test('a hostname-matched beacon lands in the Activity Log', async ({ page, request }) => {
    // Login once, read the demo site key out of the Install snippet.
    await page.goto('/login')
    await page.getByLabel('Email').fill(DEMO_EMAIL)
    await page.getByLabel('Password').fill('Demo123456!')
    await page.getByRole('button', { name: 'Sign In' }).click()
    await expect(page).toHaveURL(/\/dashboard$/)

    await page.getByRole('link', { name: 'Install Pixel' }).click()
    await expect(page).toHaveURL(/\/dashboard\/install$/)
    const snippet = await page.locator('pre').first().textContent()
    const key = /px_[A-Za-z0-9]+/.exec(snippet ?? '')?.[0]
    expect(key).toBeTruthy()

    // A unique path makes the row unambiguous in the activity feed even
    // though the e2e database accumulates rows across runs.
    const path = `/e2e-${Date.now()}`
    const beacon = await request.fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
      data: `{"k":"${key}","u":"https://demo-store.example.com${path}","p":"${path}","r":"","v":"e2e-visitor-${Date.now()}"}`,
    })
    expect(beacon.status()).toBe(204)

    // The demo account's Activity Log shows the pageview row.
    await page.getByRole('link', { name: 'Activity Log' }).click()
    await expect(page).toHaveURL(/\/dashboard\/activity$/)
    await expect(page.getByText(path).first()).toBeVisible()
  })
})
