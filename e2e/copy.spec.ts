import { expect, test } from '@playwright/test'

/**
 * Copy-button e2e (R33-F2) — the browser-level pins for the copy-state
 * feedback, runtime-diffed against the live in the 18th probe generation
 * under BOTH clipboard regimes:
 *
 *   - /docs sample button (marketing): the swap is UNCONDITIONAL — with a
 *     DENIED clipboard the live still swaps to the green check
 *     (`lucide lucide-check w-4 h-4 text-green-500`), button class
 *     unchanged, ~2 s reset. (The live leaves the writeText rejection
 *     UNCAUGHT — a pageerror the clone deliberately swallows, D-class.)
 *   - /dashboard/install Quick Start button (dashboard): the swap is
 *     AWAIT-GATED — with a denied clipboard the live does NOT swap; with
 *     a working clipboard it swaps to `Copied!` + the uncolored check
 *     (`lucide lucide-check h-3.5 w-3.5 mr-1`), ~2 s reset.
 *
 * The two surfaces genuinely differ on the live — these specs pin BOTH
 * behaviors. Playwright's default context denies clipboard-write, which
 * is exactly the docs button's proving ground; the install spec grants
 * the permission to drive the live's success path (and separately pins
 * the denied path's no-swap). Source pins live in
 * tests/copy-state-r33-parity.test.tsx.
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

test.describe('docs copy button (R33-F2 — unconditional swap)', () => {
  test('swaps to the green check on click — clipboard permissions NOT granted', async ({ page }) => {
    // No context.grantPermissions call: Playwright's default context
    // rejects clipboard writes, and the swap must fire anyway (the
    // live's behavior, proven on the rejecting session).
    await page.goto('/docs')
    // Hydration gate: the swap is a client-island onClick — a click that
    // lands on the pre-hydration SSR markup is a silent no-op. networkidle
    // closes that window on the local standalone server (no third-party
    // traffic; the marketing bundle is fully local).
    await page.waitForLoadState('networkidle')
    const button = page.getByRole('button', { name: 'Copy sample pixel code' })
    await expect(button).toBeVisible()
    await expect(button.locator('svg')).toHaveClass('lucide lucide-copy w-4 h-4')

    await button.click()
    // The green-check swap — same tick, no clipboard dependency.
    await expect(button.locator('svg')).toHaveClass(
      'lucide lucide-check w-4 h-4 text-green-500',
    )
    // The button's own class string never changes (live-captured).
    await expect(button).toHaveClass(
      'absolute top-3 right-3 p-2 rounded-md bg-secondary/80 hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors',
    )

    // The 2 s window resets to the copy glyph (the live resets between
    // 1 s and 2.6 s).
    await expect
      .poll(async () => (await button.locator('svg').getAttribute('class')) ?? '', {
        timeout: 5_000,
      })
      .toBe('lucide lucide-copy w-4 h-4')
  })
})

test.describe('install copy button (R33-F2 — await-gated, the live behavior)', () => {
  test('with a working clipboard: swaps to "Copied!" and resets', async ({ page }) => {
    // The live's SUCCESS path: the swap happens when the clipboard write
    // resolves (the live is await-gated — see the denied-path spec below;
    // live-verified 3/3 loads: trusted click + granted clipboard swaps at
    // ~0.5 s and resets by ~2.5 s — the clone matches byte-for-byte).
    await page.context().grantPermissions(['clipboard-write'])
    await login(page)

    // The button is located by its STABLE position (the Quick Start
    // card's pre-wrapped affordance), never by role/name: the accessible
    // name flips between 'Copy snippet to clipboard' and 'Copied to
    // clipboard' on swap, and a /copy/i role locator can resolve to a
    // different node in DOM order. The pre-wrapped locator survives both
    // states.
    const button = page
      .locator('pre')
      .first()
      .locator('..')
      .getByRole('button')
      .first()
    const text = () => button.textContent() ?? ''

    let swapped = false
    for (let load = 0; load < 2 && !swapped; load++) {
      if (load > 0) {
        await page.reload()
      } else {
        await page.goto('/dashboard/install')
      }
      await page.waitForLoadState('networkidle')
      await expect(button).toBeVisible()
      await expect(button).toHaveText('Copy')
      // Quiet settle: the InstallPanels client island re-renders once its
      // flight data applies; a click inside that window fires the handler
      // but the state dies with the replaced tree. 3 s of quiet is the
      // measured stable point (both sides swap first-try after it).
      await page.waitForTimeout(3_000)
      await button.click()
      swapped = await expect
        .poll(async () => await text(), { timeout: 3_000 })
        .toBe('Copied!')
        .then(
          () => true,
          () => false,
        )
    }
    expect(swapped).toBe(true)
    // The UNCOLORED check (R22-F7c) rides the swapped label.
    await expect(button.locator('svg')).toHaveClass('lucide lucide-check h-3.5 w-3.5 mr-1')

    // The 2 s window resets the label.
    await expect
      .poll(async () => await text(), { timeout: 6_000 })
      .toBe('Copy')
  })

  test('with a DENIED clipboard: no swap (the live gating)', async ({ page }) => {
    // No permissions granted — Playwright's default context. The live's
    // install button does NOT swap when writeText rejects (proven on the
    // live in this exact context); the clone keeps the live's gating.
    await login(page)
    await page.goto('/dashboard/install')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(3_000) // past the island settle window
    const button = page
      .locator('pre')
      .first()
      .locator('..')
      .getByRole('button')
      .first()
    await expect(button).toBeVisible()
    await button.click()
    // Give a would-be swap every chance to appear, then assert it never
    // did (the await-gated handler skips setCopied on rejection).
    await page.waitForTimeout(1_000)
    await expect(button).toHaveText('Copy')
    await expect(button).toHaveAttribute('aria-label', 'Copy snippet to clipboard')
  })
})
