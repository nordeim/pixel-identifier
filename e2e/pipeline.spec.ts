import { expect, test } from '@playwright/test'

/**
 * Tracking-pipeline e2e (R23-F8) — the public surface (collector script,
 * health) and the beacon → dashboard loop against the e2e database.
 */
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
  test('a hostname-matched beacon lands in the Activity Log', async ({ page, request }) => {
    // Login once, read the demo site key out of the Install snippet.
    await page.goto('/login')
    await page.getByLabel('Email').fill('demo@pixelco.local')
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
