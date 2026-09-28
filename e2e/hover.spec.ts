import { expect, test } from '@playwright/test'

/**
 * Hover-state parity (R39-F1) — the TW4 hover-variant capability guard.
 *
 * Tailwind v4 compiles every hover-family utility inside a
 * `@media (hover:hover)` guard; the live's TW3 stylesheets ship plain
 * `:hover` selectors (0 guards in index-bLMWzsGr.css / index-MN2Yr0JK.css
 * vs 5 guard blocks in the clone's pre-fix chunk). In any environment
 * that does not report a hover-capable primary pointer — headless
 * chromium (this suite: matchMedia('(hover: hover)') === false) and real
 * touch-primary devices — the live's hovers APPLY while the pre-fix
 * clone's were DEAD with identical class strings (the R19 lesson:
 * class-string equality is NOT resolution equality).
 *
 * The fix redefines the built-ins in globals.css to the live's unguarded
 * semantics:
 *   @custom-variant hover (&:hover);
 *   @custom-variant group-hover (&:is(:where(.group):hover *));
 *
 * These specs ran RED against the pre-fix standalone build (the utilities
 * never applied) and pin the live's own computed hover values — captured
 * on the live's DOM in the 24th probe generation (agent-browser, the
 * same headless engine): the footer social anchor flips to
 * rgb(23, 26, 38) / rgba(255, 191, 0, 0.4), the blog card's h2 flips to
 * the amber primary. The dashboard sidebar pin asserts the background
 * FLIP (transparent → the sidebar-accent mix) — its palette bytes are
 * pinned at the token level by the vitest theme tests.
 */

test.describe('hover states (R39-F1 — TW4 hover-variant parity)', () => {
  test('marketing footer social anchor: hover flips text + border (live values)', async ({
    page,
  }) => {
    await page.goto('/')
    const icon = page.locator('footer a[aria-label="Pixelco website"]')
    await expect(icon).toBeVisible()

    // Baseline: the muted resting state (the live's computed pre-hover).
    const before = await icon.evaluate((el) => {
      const cs = getComputedStyle(el)
      return { color: cs.color, borderColor: cs.borderColor }
    })
    expect(before.color).toBe('rgb(106, 109, 129)') // --muted-foreground
    expect(before.borderColor).toBe('rgb(226, 227, 233)') // --border

    await icon.hover()
    // `transition-colors` runs 150 ms — sample AFTER the settle (a bare
    // hover→evaluate catches the color mid-interpolation; the received
    // value in the pre-fix run rgb(68, 71, 87) was exactly ~65 % of the
    // way from rgb(106, 109, 129) to rgb(23, 26, 38)).
    await page.waitForTimeout(300)
    const after = await icon.evaluate((el) => {
      const cs = getComputedStyle(el)
      return { color: cs.color, borderColor: cs.borderColor }
    })
    // The live's computed hover values (24th-generation live probe):
    // rgb(23, 26, 38) text + the amber 40 % border. The border serializes
    // as oklab(… / 0.4) under TW4's color-mix and as rgba(255, 191, 0,
    // 0.4) under the live's TW3 — the R37 overlay precedent (same
    // rendered color, different serialization). Self-calibrate the
    // expectation from the browser's own evaluation of the identical
    // color-mix so the pin is exact without hardcoding serialization.
    const expectedBorder = await icon.evaluate(() => {
      const probe = document.createElement('div')
      probe.style.color = 'color-mix(in oklab, rgb(255, 191, 0) 40%, transparent)'
      document.body.appendChild(probe)
      const value = getComputedStyle(probe).color
      probe.remove()
      return value
    })
    expect(after.color).toBe('rgb(23, 26, 38)') // hover:text-foreground (#171a26)
    expect(after.borderColor).toBe(expectedBorder) // hover:border-primary/40
    expect(after.color).not.toBe(before.color)
    expect(after.borderColor).not.toBe(before.borderColor)
  })

  test('blog card group-hover: hovering the card flips the h2 to the amber primary', async ({
    page,
  }) => {
    await page.goto('/blog')
    const card = page.locator('a.group').first()
    await expect(card).toBeVisible()
    const h2 = card.locator('h2')

    const before = await h2.evaluate((el) => getComputedStyle(el).color)
    expect(before).toBe('rgb(23, 26, 38)') // text-foreground

    // group-hover keys off the CARD's :hover — hover the card root.
    await card.hover()
    // Let the h2's transition-colors (150 ms) settle before sampling.
    await page.waitForTimeout(300)
    const after = await h2.evaluate((el) => getComputedStyle(el).color)
    expect(after).toBe('rgb(255, 191, 0)') // group-hover:text-primary (#FFBF00)
    expect(after).not.toBe(before)
  })

  test('dashboard sidebar menu button: hover flips the background to the sidebar accent', async ({
    page,
  }) => {
    await page.goto('/login')
    await page.getByLabel('Email').fill('demo@pixelco.local')
    await page.getByLabel('Password', { exact: true }).fill('Demo123456!')
    await page.getByRole('button', { name: 'Sign In' }).click()
    await expect(page).toHaveURL(/\/dashboard$/)

    // A NON-active item: the first button (Overview) is the active route
    // and carries the appended bg-sidebar-accent active tail — its
    // baseline is NOT transparent. Visitors is the second item.
    const item = page.locator('a[data-sidebar="menu-button"]').nth(1)
    await expect(item).toBeVisible()

    const before = await item.evaluate((el) => getComputedStyle(el).backgroundColor)
    expect(before).toBe('rgba(0, 0, 0, 0)') // transparent resting state

    await item.hover()
    // Let the transition settle before sampling (150 ms transition-colors).
    await page.waitForTimeout(300)
    const after = await item.evaluate((el) => getComputedStyle(el).backgroundColor)
    // hover:bg-sidebar-accent/50 — the flip IS the contract (the pre-fix
    // build never left transparent in a non-hover-capable environment).
    expect(after).not.toBe('rgba(0, 0, 0, 0)')
    expect(after).not.toBe(before)
  })
})
