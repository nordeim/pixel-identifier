import { expect, test } from '@playwright/test'

/**
 * Toast e2e (R27-F1) — the live's mutation feedback is SONNER toasts
 * (settings save → "Settings saved", domain add → "Domain added
 * successfully", domain delete → "Domain removed"). This spec closes the
 * e2e coverage gap that let the Radix/sonner divergence survive: the
 * browser-level toast DOM (section, ol, li, icon, auto-dismiss) is
 * invisible to the SSR vitest pins by construction.
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

// The demo account is on the FREE plan (1-domain limit, already used by
// the seeded demo-store.example.com) — a second add would (correctly)
// fail on the plan limit. A fresh sign-up account has domain headroom,
// so the domain spec drives its own account.
async function signup(page: import('@playwright/test').Page, email: string) {
  await page.goto('/signup')
  await page.getByLabel('Work Email').fill(email)
  await page.getByLabel('Password', { exact: true }).fill('ToastE2e123!')
  await page.getByLabel('Confirm Password').fill('ToastE2e123!')
  await page.getByRole('button', { name: /Start Free Trial/ }).click()
  await expect(page).toHaveURL(/\/dashboard$/)
}

test.describe('sonner mutation toasts', () => {
  test('settings save fires the live-verbatim success toast', async ({ page }) => {
    await login(page)
    await page.goto('/dashboard/settings')

    // The idle toaster: the empty sonner section, no ol yet.
    await expect(
      page.locator('section[aria-label="Notifications alt+T"]'),
    ).toBeAttached()
    await expect(page.locator('[data-sonner-toaster]')).toHaveCount(0)

    await page.getByRole('button', { name: 'Save Changes' }).click()

    // The toast appears with the live's structure: success-typed li,
    // the shadcn class family, the check-circle icon, the live title.
    const toast = page.locator('[data-sonner-toast]')
    await expect(toast).toBeVisible()
    await expect(toast).toHaveAttribute('data-type', 'success')
    await expect(toast).toHaveAttribute('data-mounted', 'true')
    await expect(toast).toHaveClass(
      /group toast group-\[\.toaster\]:bg-background group-\[\.toaster\]:text-foreground group-\[\.toaster\]:border-border group-\[\.toaster\]:shadow-lg/,
    )
    await expect(toast.locator('[data-title]')).toHaveText('Settings saved')
    await expect(toast.locator('[data-icon] svg')).toBeVisible()
    // No description node on the success branch (title-only, like the live).
    await expect(toast.locator('[data-description]')).toHaveCount(0)

    // The ol carries the live's positioning attributes.
    const list = page.locator('[data-sonner-toaster]')
    await expect(list).toHaveAttribute('data-y-position', 'bottom')
    await expect(list).toHaveAttribute('data-x-position', 'right')

    // Sonner's default 4s auto-dismiss retires the toast (and the ol).
    await expect(toast).toHaveCount(0, { timeout: 8000 })
    await expect(list).toHaveCount(0, { timeout: 8000 })
  })

  test('domain add fires the live-verbatim success toast', async ({ page }) => {
    await signup(page, `toast-e2e-${Date.now()}@pixelco.local`)
    await page.goto('/dashboard/domains')

    const domain = `e2e-toast-${Date.now()}.example.com`
    await page.getByLabel('Domain to register').fill(domain)
    await page.getByRole('button', { name: 'Add Domain' }).click()

    const toast = page.locator('[data-sonner-toast]')
    await expect(toast).toBeVisible()
    await expect(toast).toHaveAttribute('data-type', 'success')
    await expect(toast.locator('[data-title]')).toHaveText(
      'Domain added successfully',
    )

    // Clean up: delete the probe domain (the confirm dialog is the clone's
    // kept divergence) — and the delete flow fires the live's title too.
    await page.locator(`button[aria-label="Delete ${domain}"]`).click()
    await page.getByRole('button', { name: 'Delete domain' }).click()
    const delToast = page.locator('[data-sonner-toast]').first()
    await expect(delToast.locator('[data-title]')).toHaveText('Domain removed')
    await expect(page.getByText(domain)).toHaveCount(0)
  })
})
