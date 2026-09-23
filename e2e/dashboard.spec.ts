import { expect, test } from '@playwright/test'

/**
 * Dashboard e2e (R23-F8) — the demo account (seeded on db/e2e.db by
 * scripts/e2e-server.mjs) drives the authed surface, the desktop sidebar,
 * and the MOBILE SHEET lifecycle — including the R23-F3 regression: the
 * live's Sheet CLOSES on navigation (its dialog unmounts), while the
 * pre-fix clone kept it open, blocking the page behind.
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

test.describe('dashboard (desktop)', () => {
  test('login lands on the Overview page with KPIs and the sidebar', async ({ page }) => {
    await login(page)
    await expect(page.getByRole('heading', { name: 'Overview' })).toBeVisible()
    await expect(page.getByText('Total Visitors')).toBeVisible()
    await expect(page.getByText('Emails Identified')).toBeVisible()
    // The seeded demo domain drives the Install page's snippet.
    await page.getByRole('link', { name: 'Install Pixel' }).click()
    await expect(page).toHaveURL(/\/dashboard\/install$/)
    // The domain appears in both the switcher and the snippet card.
    await expect(page.getByText('demo-store.example.com').first()).toBeVisible()
  })

  test('the visitors and activity pages render the seeded data', async ({ page }) => {
    await login(page)
    await page.getByRole('link', { name: 'Visitors' }).click()
    await expect(page).toHaveURL(/\/dashboard\/visitors$/)
    // The demo seed ships identified visitors (email rows in the table).
    await expect(page.getByRole('table')).toBeVisible()

    await page.getByRole('link', { name: 'Activity Log' }).click()
    await expect(page).toHaveURL(/\/dashboard\/activity$/)
    await expect(page.getByText('Pageview').first()).toBeVisible()
  })

  test('unauthenticated access redirects to /login', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page).toHaveURL(/\/login$/)
  })

  test('the SidebarProvider wrapper renders with the live class + inline vars (R30-F1)', async ({
    page,
  }) => {
    await login(page)

    // The live wraps the dashboard layout root in a SidebarProvider div —
    // captured on the live's DOM (15th probe generation; both viewports,
    // every dashboard page). No data-* attrs here (they stay on the
    // inner Sidebar element); the inline vars cascade over :root inside
    // the shell, exactly like the live.
    const wrapper = page.locator('.group\\/sidebar-wrapper')
    await expect(wrapper).toHaveCount(1)
    await expect(wrapper).toHaveClass(
      'group/sidebar-wrapper flex min-h-svh w-full has-[[data-variant=inset]]:bg-sidebar',
    )
    // The inline vars (custom properties): read via evaluate — the inline
    // style attribute is the live's byte surface, the computed value is
    // the cascade proof.
    const vars = await wrapper.evaluate((el) => ({
      inline: el.getAttribute('style'),
      computed: getComputedStyle(el).getPropertyValue('--sidebar-width').trim(),
    }))
    expect(vars.inline).toBe('--sidebar-width: 16rem; --sidebar-width-icon: 3rem;')
    expect(vars.computed).toBe('16rem')

    // The layout root (min-h-screen flex w-full bg-muted/30) is INSIDE
    // the wrapper — the wrapper is the outermost shell element.
    const root = page.locator('div.min-h-screen.flex.w-full.bg-muted\\/30')
    await expect(root).toHaveCount(1)
    expect(await wrapper.locator('div.min-h-screen.flex.w-full.bg-muted\\/30').count()).toBe(1)
  })
})

test.describe('dashboard mobile Sheet (375 px)', () => {
  test.use({ viewport: { width: 375, height: 667 } })

  test('the Sheet opens via the trigger and closes on link navigation (R23-F3)', async ({
    page,
  }) => {
    await login(page)

    // Below md the trigger opens the mobile Sheet (not the desktop rail).
    await page.getByRole('button', { name: 'Toggle Sidebar' }).click()
    const sheet = page.locator('[data-mobile="true"]')
    await expect(sheet).toBeVisible()
    await expect(sheet.getByRole('link', { name: 'Visitors' })).toBeVisible()

    // THE REGRESSION: navigating via a Sheet link must CLOSE the Sheet —
    // the live's dialog unmounts (overlay gone, content removed).
    await sheet.getByRole('link', { name: 'Visitors' }).click()
    await expect(page).toHaveURL(/\/dashboard\/visitors$/)
    await expect(sheet).toHaveCount(0)

    // And the Sheet reopens cleanly for the next navigation.
    await page.getByRole('button', { name: 'Toggle Sidebar' }).click()
    await expect(page.locator('[data-mobile="true"]')).toBeVisible()
  })

  test('the mobile Sheet hides the desktop rail chrome below md', async ({ page }) => {
    await login(page)
    // The desktop rail (peer wrapper) is CSS-hidden below 768 px.
    const rail = page.locator('.group.peer')
    await expect(rail).toBeHidden()
  })
})
