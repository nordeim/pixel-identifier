import { expect, test } from '@playwright/test'

/**
 * Marketing surface e2e (R23-F8) — the landing chrome, the mobile menu
 * lifecycle (R23-F4 regression: the live's 24 px toggle icons + the
 * dropdown's open → navigate → closed flow), and the auth page.
 */
test.describe('marketing landing', () => {
  test('renders the hero, announcement bar and nav links', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { level: 1 })).toContainText(
      'Identify Anonymous Website Visitors',
    )
    await expect(page.getByText('Launch Offer')).toBeVisible()
    await expect(page.getByRole('link', { name: 'Claim Now' })).toBeVisible()
    // Scoped to the header nav — the landing also renders in-page "Product"
    // navigation landmarks with the same link labels.
    const mainNav = page.getByRole('navigation', { name: 'Main navigation' })
    for (const label of ['Benefits', 'How It Works', 'Pricing', 'FAQ']) {
      await expect(mainNav.getByRole('link', { name: label, exact: true })).toBeVisible()
    }
  })

  test('announcement bar Claim Now navigates to signup', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: 'Claim Now' }).click()
    await expect(page).toHaveURL(/\/signup$/)
  })

  test('login page renders the auth card', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible()
    await expect(page.getByLabel('Email')).toBeVisible()
    await expect(page.getByLabel('Password')).toBeVisible()
  })
})

test.describe('marketing mobile menu (375 px)', () => {
  test.use({ viewport: { width: 375, height: 667 } })

  test('the toggle opens the dropdown, navigates, and closes it', async ({ page }) => {
    await page.goto('/')

    const toggle = page.getByRole('button', { name: 'Open menu' })
    await expect(toggle).toBeVisible()
    await toggle.click()

    // The dropdown renders the 4 nav links + the single full-width CTA.
    const dropdown = page.locator('#mobile-nav')
    await expect(dropdown).toBeVisible()
    await expect(dropdown.getByRole('link', { name: 'Pricing', exact: true })).toBeVisible()
    await expect(dropdown.getByRole('button', { name: 'Start Identifying' })).toBeVisible()

    // Navigating via a dropdown link closes the dropdown (aria-expanded
    // flips back) and lands on the anchor.
    await dropdown.getByRole('link', { name: 'Pricing', exact: true }).click()
    await expect(page).toHaveURL(/#pricing$/)
    await expect(page.getByRole('button', { name: 'Open menu' })).toBeVisible()
  })

  test('the toggle icon is lucide-default size (w-6 h-6, 24 px)', async ({ page }) => {
    await page.goto('/')
    const icon = page.locator('button[aria-controls="mobile-nav"] svg')
    await expect(icon).toHaveClass(/lucide-menu w-6 h-6/)
    await expect(icon).toHaveCSS('width', '24px')
  })
})
