import { expect, test } from '@playwright/test'

/**
 * Auth-flow e2e (R38) — the browser-level pins for the two documented
 * auth-flow divergences the 23rd probe generation re-verified on the live:
 *
 *  1. The marketing pricing CTAs carry the plan intent (F-28) — the LIVE
 *     links every pricing CTA to plain https://app.pixelco.io in BOTH
 *     toggle states, and the live app bundle's only signup reference is a
 *     bare "/signup" (no plan=/cycle= tokens anywhere in index-nhmKaUsm.js).
 *     The clone's single-deployment mapping (R13-D3) turns that into
 *     /signup for the Free card and /signup?plan=<id>&cycle=<cycle> for the
 *     paid cards — the "Honesty over simulation" D-class family that
 *     replaces the live's Stripe EmbeddedCheckout plan-switch (PAD §11).
 *     NOTHING pinned the href matrix or the browser-level intent flow —
 *     the SSR pricing test pins the CTA styling only.
 *  2. The signup plan-intent flow end-to-end: /signup?plan=growth&cycle=
 *     annual renders the hidden intent inputs, a signup through the form
 *     creates the account WITH the chosen plan, and the dashboard sidebar
 *     badge shows GROWTH (usage.planName.toUpperCase()).
 *  3. The forgot-password anti-enumeration ack — the live links to
 *     /forgot-password from its login page but renders a runtime 404 there
 *     (the R6-H4 live defect, PAD §11); the clone ships the working
 *     anti-enumeration form instead. NOTHING pinned the ack contract.
 */

const DEMO_EMAIL = 'demo@pixelco.local'

/**
 * Locates the pricing card anchor for a plan (each card's only <a> is the
 * class="block" CTA wrapper around the button — R12-B6).
 */
function pricingCta(page: import('@playwright/test').Page, plan: string) {
  return page.locator('#pricing h3', { hasText: plan }).locator('..').locator('a')
}

test.describe('marketing pricing plan-intent CTAs (R38, F-28)', () => {
  test('default (annual): Free → plain /signup; paid → ?plan=…&cycle=annual', async ({ page }) => {
    await page.goto('/#pricing')
    await expect(page.locator('#pricing')).toBeVisible()

    // The toggle defaults to annual (R10-F4: the live loads with the
    // switch ON — the floored $63/$199/$639 table).
    const toggle = page.getByRole('switch', { name: 'Toggle annual pricing' })
    await expect(toggle).toHaveAttribute('aria-checked', 'true')

    // The Free card never carries the intent — plain /signup.
    await expect(pricingCta(page, 'Free')).toHaveAttribute('href', '/signup')
    // The paid cards carry plan + the DEFAULT annual cycle.
    await expect(pricingCta(page, 'Starter')).toHaveAttribute(
      'href',
      '/signup?plan=starter&cycle=annual',
    )
    await expect(pricingCta(page, 'Growth')).toHaveAttribute(
      'href',
      '/signup?plan=growth&cycle=annual',
    )
    await expect(pricingCta(page, 'Scale')).toHaveAttribute(
      'href',
      '/signup?plan=scale&cycle=annual',
    )
  })

  test('toggled (monthly): the paid hrefs flip cycle=monthly; Free stays plain', async ({ page }) => {
    await page.goto('/#pricing')
    const toggle = page.getByRole('switch', { name: 'Toggle annual pricing' })
    await toggle.click()
    await expect(toggle).toHaveAttribute('aria-checked', 'false')

    await expect(pricingCta(page, 'Free')).toHaveAttribute('href', '/signup')
    await expect(pricingCta(page, 'Starter')).toHaveAttribute(
      'href',
      '/signup?plan=starter&cycle=monthly',
    )
    await expect(pricingCta(page, 'Growth')).toHaveAttribute(
      'href',
      '/signup?plan=growth&cycle=monthly',
    )
    await expect(pricingCta(page, 'Scale')).toHaveAttribute(
      'href',
      '/signup?plan=scale&cycle=monthly',
    )

    // The CTA click-through still lands on the signup page with the
    // intent preserved in the URL (the flow the live maps to its app
    // root — the clone's single-deployment mapping).
    await pricingCta(page, 'Growth').click()
    await expect(page).toHaveURL(/\/signup\?plan=growth&cycle=monthly$/)
  })

  test('the signup flow carries the intent into the created account (F-28 end-to-end)', async ({
    page,
  }) => {
    // Unique per run: the e2e database persists across the twice-
    // consecutive runs (db push + seed are idempotent, not destructive),
    // and the per-IP signup throttle (F-14: 5 per 10 min) resets on every
    // fresh server boot — one signup per run stays far under the limit.
    const email = `growth-intent-r38-${Date.now()}@pixelco.local`

    await page.goto('/signup?plan=growth&cycle=annual')
    await expect(page.getByRole('heading', { name: 'Create your account' })).toBeVisible()

    // The intent rides as hidden inputs (signup-form.tsx) — the client
    // never trusts the URL alone, the server re-validates (auth.ts).
    await expect(page.locator('input[name="plan"]')).toHaveValue('growth')
    await expect(page.locator('input[name="cycle"]')).toHaveValue('annual')

    await page.getByLabel('Work Email').fill(email)
    // exact: 'Password' is a substring of 'Confirm Password' — without
    // exact the locator is ambiguous (strict-mode violation).
    await page.getByLabel('Password', { exact: true }).fill('Growth123!')
    await page.getByLabel('Confirm Password').fill('Growth123!')
    await page.getByRole('button', { name: 'Start Free Trial' }).click()

    // The clone auto-sessions on signup (PAD §11: the live gates behind
    // an email confirmation this self-hosted clone cannot send).
    await expect(page).toHaveURL(/\/dashboard$/)
    await expect(page.getByRole('heading', { name: 'Overview' })).toBeVisible()

    // The intent SURVIVED account creation: the sidebar footer badge
    // renders the plan name uppercased (sidebar-nav.tsx — FREE for the
    // default, GROWTH for the carried intent).
    await expect(
      page.locator('[data-sidebar="footer"]').getByText('GROWTH', { exact: true }),
    ).toBeVisible()
  })
})

test.describe('forgot-password anti-enumeration ack (R38, R6-H4)', () => {
  test('an unknown email renders the ack + the honest transport note', async ({ page }) => {
    await page.goto('/forgot-password')
    await expect(page.getByRole('heading', { name: 'Reset your password' })).toBeVisible()

    await page.getByLabel('Email').fill('no-such-account-r38@pixelco.local')
    await page.getByRole('button', { name: 'Send Reset Link' }).click()

    // The anti-enumeration ack (role=status) — identical whether or not
    // the account exists.
    const ack = page.getByRole('status')
    await expect(ack).toContainText(
      'If an account exists for no-such-account-r38@pixelco.local, a password reset link has been sent.',
    )
    // The honest self-hosted configuration note (no mail transport).
    await expect(ack).toContainText(
      'Self-hosted note: email delivery must be configured by your operator for reset links to arrive.',
    )
  })

  test('a KNOWN email renders the IDENTICAL ack (enumeration-resistant)', async ({ page }) => {
    await page.goto('/forgot-password')
    await page.getByLabel('Email').fill(DEMO_EMAIL)
    await page.getByRole('button', { name: 'Send Reset Link' }).click()

    const ack = page.getByRole('status')
    await expect(ack).toContainText(
      `If an account exists for ${DEMO_EMAIL}, a password reset link has been sent.`,
    )
    await expect(ack).toContainText(
      'Self-hosted note: email delivery must be configured by your operator for reset links to arrive.',
    )
  })
})
