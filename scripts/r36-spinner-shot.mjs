import { chromium } from '@playwright/test'
import { execFileSync } from 'node:child_process'

/**
 * R36 screenshot helper — capture the activity pagination's mid-swap
 * spinner (the ~33 ms window the round runtime-verified). The route is
 * delayed 1.2s so the py-24 spinner is deterministically on screen when
 * the shot fires. Dev server must be running (localhost:3000).
 */
const OUT = 'docs/screenshots/r36-activity-spinner.png'

// The 60-event fixture crosses the 50/page threshold (R35 script).
execFileSync('node', ['scripts/r35-activity-fixture.mjs', 'insert'], { stdio: 'inherit' })

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })

// Log in (dev demo account), delay the activity page fetch.
await page.goto('http://localhost:3000/login')
await page.getByLabel('Email').fill('demo@pixelco.local')
await page.getByLabel('Password').fill('Demo123456!')
await page.getByRole('button', { name: 'Sign In' }).click()
await page.waitForURL(/\/dashboard$/)

await page.route('**/api/activity?**', async (route) => {
  await new Promise((r) => setTimeout(r, 1200))
  await route.continue()
})

await page.goto('http://localhost:3000/dashboard/activity')
await page.getByRole('button', { name: 'Next page' }).click()
await page.waitForSelector('.animate-spin', { timeout: 5000 })
await page.waitForTimeout(300) // let the spinner paint clearly
await page.screenshot({ path: OUT })
console.log('spinner captured:', OUT)

await browser.close()
execFileSync('node', ['scripts/r35-activity-fixture.mjs', 'clean'], { stdio: 'inherit' })
console.log('fixture cleaned')
