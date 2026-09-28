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

/**
 * Hover-net extension (R40) — four more live-verified families, pinned with
 * the 25th-generation probe values (agent-browser, the same headless
 * engine, BOTH sites at parity):
 *
 *   - the announcement-bar Claim Now anchor (`hover:opacity-80
 *     transition-opacity` — the marketing OPACITY family, R23-F5's
 *     class-string pin now runtime-pinned),
 *   - the topbar bell button (the Button ghost variant's `hover:bg-accent`
 *     — the APP accent family; the live flips to the teal data accent
 *     rgb(43, 212, 189) = --accent hsl(172 66% 50%)),
 *   - the visitors topbar Export All button (the GRADIENT family's
 *     `hover:opacity-90 transition-all duration-300` — R24-F8's button now
 *     runtime-pinned),
 *   - the sidebar-footer sign-out button (`hover:text-foreground
 *     transition-colors` — the APP text-color family).
 *
 * All four ran RED in the R40 TDD validation pass (the two @custom-variant
 * overrides temporarily removed from globals.css → the guarded CSS never
 * applies the utilities in headless) and GREEN with the fix restored.
 */
test.describe('hover states (R40 — hover-net extension: live-verified families)', () => {
  test('announcement-bar Claim Now: hover flips opacity to 80 % (live value)', async ({
    page,
  }) => {
    await page.goto('/')
    // The bar renders on the landing only (R13) — the anchor carries the
    // Claim Now copy + the arrow glyph.
    const link = page.locator('a', { hasText: 'Claim Now' })
    await expect(link).toBeVisible()

    const before = await link.evaluate((el) => getComputedStyle(el).opacity)
    expect(before).toBe('1') // resting state

    await link.hover()
    // `transition-opacity` runs 150 ms — sample after the settle.
    await page.waitForTimeout(300)
    const after = await link.evaluate((el) => getComputedStyle(el).opacity)
    expect(after).toBe('0.8') // hover:opacity-80 — the live's computed value
    expect(after).not.toBe(before)
  })

  test('topbar bell: hover flips the background to the teal accent (live value)', async ({
    page,
  }) => {
    await page.goto('/login')
    await page.getByLabel('Email').fill('demo@pixelco.local')
    await page.getByLabel('Password', { exact: true }).fill('Demo123456!')
    await page.getByRole('button', { name: 'Sign In' }).click()
    await expect(page).toHaveURL(/\/dashboard$/)

    const bell = page.locator('header button:has(svg.lucide-bell)')
    await expect(bell).toBeVisible()

    // Baseline: the ghost variant's transparent resting state.
    const before = await bell.evaluate((el) => getComputedStyle(el).backgroundColor)
    expect(before).toBe('rgba(0, 0, 0, 0)')

    await bell.hover()
    // The primitive's transition-colors runs 150 ms — sample after settle.
    await page.waitForTimeout(300)
    const after = await bell.evaluate((el) => getComputedStyle(el).backgroundColor)
    // The live's computed hover value (25th-generation probe): the teal
    // --accent hsl(172 66% 50%) = #2bd4bd = rgb(43, 212, 189). A plain
    // var() reference — no color-mix, so the serialization is stable rgb()
    // on both sides (the R39 oklab watch applies only to /alpha mixes).
    expect(after).toBe('rgb(43, 212, 189)')
    expect(after).not.toBe(before)
  })

  test('visitors Export All: hover flips the gradient opacity to 90 % (live value)', async ({
    page,
  }) => {
    await page.goto('/login')
    await page.getByLabel('Email').fill('demo@pixelco.local')
    await page.getByLabel('Password', { exact: true }).fill('Demo123456!')
    await page.getByRole('button', { name: 'Sign In' }).click()
    await expect(page).toHaveURL(/\/dashboard$/)
    await page.goto('/dashboard/visitors')

    const exportBtn = page.locator('header button', { hasText: 'Export All' })
    await expect(exportBtn).toBeVisible()

    const before = await exportBtn.evaluate((el) => getComputedStyle(el).opacity)
    expect(before).toBe('1') // resting state

    await exportBtn.hover()
    // `transition-all duration-300` — wait past the full 300 ms run.
    await page.waitForTimeout(450)
    const after = await exportBtn.evaluate((el) => getComputedStyle(el).opacity)
    expect(after).toBe('0.9') // hover:opacity-90 — the live's computed value
    expect(after).not.toBe(before)
  })

  test('sidebar sign-out: hover flips the text color to the foreground (live value)', async ({
    page,
  }) => {
    await page.goto('/login')
    await page.getByLabel('Email').fill('demo@pixelco.local')
    await page.getByLabel('Password', { exact: true }).fill('Demo123456!')
    await page.getByRole('button', { name: 'Sign In' }).click()
    await expect(page).toHaveURL(/\/dashboard$/)

    const signOut = page.locator('button:has(svg.lucide-log-out)')
    await expect(signOut).toBeVisible()

    // Baseline: the muted-foreground resting state (--muted-foreground
    // hsl(220 9% 46%) = #6b7280 = rgb(107, 114, 128)).
    const before = await signOut.evaluate((el) => getComputedStyle(el).color)
    expect(before).toBe('rgb(107, 114, 128)')

    await signOut.hover()
    // `transition-colors` runs 150 ms — sample after the settle.
    await page.waitForTimeout(300)
    const after = await signOut.evaluate((el) => getComputedStyle(el).color)
    // The live's computed hover value (25th-generation probe):
    // hover:text-foreground — the app navy #131520.
    expect(after).toBe('rgb(19, 21, 32)')
    expect(after).not.toBe(before)
  })

  test('the shipped stylesheet carries ZERO hover-capability guards (the CSS-byte contract)', async ({
    page,
  }) => {
    // R40 discovery: this suite's chromium reports `matchMedia('(hover:
    // hover)') === TRUE` (Playwright 1.63's Desktop Chrome is a
    // hover-capable engine), so the BEHAVIORAL specs above cannot detect
    // the TW4 capability guard — a guarded build passes them exactly like
    // an unguarded one (verified against a deliberately re-guarded build:
    // all 7 behavioral specs green while agent-browser's non-hover-capable
    // engine showed the utilities dead). The guard contract is therefore
    // pinned at the CSS-BYTE level — environment-independent: the live's
    // TW3 stylesheets ship plain `:hover` selectors with ZERO
    // `@media (hover:hover)` guards (the R39 survey), and the fix
    // (`@custom-variant hover/group-hover` overrides in globals.css) must
    // keep the compiled output that way (TW 4.3.3's built-in default IS
    // guarded: `@media (hover: hover) { &:hover }` — tailwindcss
    // dist/lib.mjs).
    await page.goto('/')
    const cssHrefs = await page.$$eval('link[rel="stylesheet"]', (links) =>
      links.map((l) => (l as HTMLLinkElement).href),
    )
    expect(cssHrefs.length).toBeGreaterThan(0)

    let css = ''
    for (const href of cssHrefs) {
      const res = await page.request.get(href)
      expect(res.ok()).toBeTruthy()
      css += await res.text()
    }

    // ZERO capability guards anywhere in the shipped stylesheets — the
    // live's TW3 resolution (R39: 0 guards in index-bLMWzsGr.css /
    // index-MN2Yr0JK.css; the pre-fix clone shipped 5 blocks / 109 guarded
    // hover rules).
    const guards = css.match(/@media\s*\(hover:\s*hover\)/g) ?? []
    expect(guards).toHaveLength(0)

    // And the hover utilities resolve as PLAIN `:hover` selectors — spot
    // checks across every family pinned above (marketing opacity, app
    // accent, gradient opacity, text color, sidebar accent, group-hover).
    for (const plain of [
      '.hover\\:opacity-80:hover',
      '.hover\\:opacity-90:hover',
      '.hover\\:bg-accent:hover',
      '.hover\\:text-foreground:hover',
      '.hover\\:bg-sidebar-accent\\/50:hover',
      '.group-hover\\:text-primary:is(:where(.group):hover *)',
    ]) {
      expect(css).toContain(plain)
    }
  })
})
