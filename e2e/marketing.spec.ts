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

test.describe('FAQ accordion persistence (R34-F3)', () => {
  test('opening a second question closes the first (single-open, like the live)', async ({
    page,
  }) => {
    await page.goto('/#faq')

    // The live's accordion is type="single" collapsible — verified on both
    // sites in the 19th probe generation: open Q1 → open Q2 leaves ONLY Q2
    // open; re-opening Q1 closes Q2. A flip to multi-open (or a stuck
    // first item) is the regression this pin guards.
    const q1 = page.getByRole('button', {
      name: 'How does Pixelco identify visitors by email?',
    })
    const q2 = page.getByRole('button', {
      name: 'Does it really work for B2C (individual) visitors?',
    })

    await q1.click()
    await expect(q1.locator('..')).toHaveAttribute('data-state', 'open')

    await q2.click()
    await expect(q2.locator('..')).toHaveAttribute('data-state', 'open')
    await expect(q1.locator('..')).toHaveAttribute('data-state', 'closed')

    // Re-opening Q1 closes Q2 (collapsible single: the active item can
    // also be closed again).
    await q1.click()
    await expect(q1.locator('..')).toHaveAttribute('data-state', 'open')
    await expect(q2.locator('..')).toHaveAttribute('data-state', 'closed')
  })
})

test.describe('compare section at 375 px (R34-F3)', () => {
  test.use({ viewport: { width: 375, height: 667 } })

  test('the comparison grid stacks to one column with no horizontal overflow', async ({
    page,
  }) => {
    await page.goto('/#pricing')

    const heading = page.getByRole('heading', {
      name: 'Why Teams Switch to Pixelco',
    })
    await expect(heading).toBeVisible()

    // The live's grid: max-w-4xl, 2 cols at md — at 375 it stacks.
    const grid = heading.locator('..').locator('..').locator('.grid').first()
    await expect(grid).toHaveClass(/max-w-4xl mx-auto grid md:grid-cols-2 gap-6/)

    const cards = grid.locator('> div')
    await expect(cards).toHaveCount(2)
    // Both cards render full-width in the stacked column…
    const box1 = await cards.nth(0).boundingBox()
    const box2 = await cards.nth(1).boundingBox()
    expect(box1).not.toBeNull()
    expect(box2).not.toBeNull()
    expect(Math.abs(box1!.width - box2!.width)).toBeLessThan(2)
    // …one above the other.
    expect(box2!.y).toBeGreaterThan(box1!.y)

    // The clone does NOT replicate the live's 6 px horizontal overflow at
    // 375 (docW 381 > winW 375 — the documented R34 non-finding).
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    )
    expect(overflow).toBeLessThanOrEqual(0)
  })
})
