import { expect, test } from '@playwright/test'

/**
 * Blog article footer e2e (R32-F1) — the browser-level pin for the article
 * footer block the 17th probe generation found on the live (consistent
 * across all articles): after the prose body the live renders
 *
 *   <div class="border-t border-border mt-14 pt-8">
 *     <p class="text-sm text-muted-foreground mb-4">
 *       Written by <strong class="text-foreground">Pixelco Team</strong></p>
 *     <a href="https://app.pixelco.io"><button …default variant…>
 *       Start Identifying Visitors →</button></a>
 *   </div>
 *
 * The clone had shipped NO footer (the R13 audit's capture never recorded
 * it — a never-diffed surface is not an absent surface). The SSR pins live
 * in tests/blog-article-footer-r32-parity.test.tsx; this spec closes the
 * RUNTIME coverage gap (footer visible on a real article page, CTA click
 * → /signup) so a future footer regression cannot slip through drift
 * watches like R13–R31 did.
 *
 * R34-F3: the BLOG INDEX joins the runtime net — the 19th probe generation
 * verified it at byte parity (H1, the 10-card grid, the card classes, the
 * no-images state) but nothing pinned it.
 */

const ARTICLE = '/blog/identify-anonymous-website-visitors'

test.describe('blog article footer (R32-F1)', () => {
  test('renders the byline + CTA footer after the prose body', async ({ page }) => {
    await page.goto(ARTICLE)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()

    const byline = page.getByText('Written by', { exact: false })
    await expect(byline).toBeVisible()
    // The author strong is part of the byline paragraph.
    await expect(byline.locator('strong')).toHaveText('Pixelco Team')
    await expect(byline.locator('strong')).toHaveClass('text-foreground')
    await expect(byline).toHaveClass('text-sm text-muted-foreground mb-4')

    // The bordered footer container sits after the prose body.
    const footer = byline.locator('..')
    await expect(footer).toHaveClass('border-t border-border mt-14 pt-8')
    const prose = page.locator('div.prose')
    const footerBox = await footer.boundingBox()
    const proseBox = await prose.boundingBox()
    expect(footerBox).not.toBeNull()
    expect(proseBox).not.toBeNull()
    expect(footerBox!.y).toBeGreaterThan(proseBox!.y)
  })

  test('the footer CTA is the default-variant button and navigates to /signup', async ({ page }) => {
    await page.goto(ARTICLE)
    const cta = page.getByRole('button', { name: 'Start Identifying Visitors →' })
    await expect(cta).toBeVisible()
    await expect(cta).toHaveClass(
      /inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors[^"]*bg-primary text-primary-foreground hover:bg-primary\/90 h-10 px-4 py-2/,
    )
    // The anchor is BARE — no class attribute at all, like the live's —
    // and maps the live's app.pixelco.io href to the internal signup
    // route (the standing CTA mapping).
    const anchor = cta.locator('..')
    await expect(anchor).toHaveAttribute('href', '/signup')
    await expect(anchor).not.toHaveAttribute('class', /.*/)

    await cta.click()
    await expect(page).toHaveURL(/\/signup$/)
  })
})

test.describe('blog index (R34-F3)', () => {
  test('renders the ten-card grid with the live card chrome and no images', async ({ page }) => {
    await page.goto('/blog')

    await expect(page.getByRole('heading', { level: 1 })).toHaveText('The Pixelco Blog')

    // The live's grid: 10 cards, gap-8 → 2 cols at md → 3 cols at lg.
    // (The clone appends the D5 reveal-machinery class — the regex pins
    // the live's base string, matching either suffix.)
    const grid = page.locator('main .grid').first()
    await expect(grid).toHaveClass(
      /grid gap-8 md:grid-cols-2 lg:grid-cols-3/,
    )
    const cards = grid.locator('a[href^="/blog/"]')
    await expect(cards).toHaveCount(10)

    // The card chrome (the R13 capture): one group link per article…
    await expect(cards.first()).toHaveClass(
      /^group block h-full rounded-xl border border-border bg-card p-6/,
    )
    // …titles are card h2s with the group-hover primary swap (the FULL
    // live string — captured untruncated in the 19th generation)…
    const heading = cards.first().locator('h2')
    await expect(heading.first()).toHaveClass(
      'text-lg font-semibold text-foreground group-hover:text-primary transition-colors mb-2 leading-snug',
    )
    // …and NO card ships an image (the live's index is text-only).
    await expect(grid.first().locator('img')).toHaveCount(0)
  })

  test('a card navigates to its article page', async ({ page }) => {
    await page.goto('/blog')
    const firstCard = page.locator('a[href^="/blog/"]').first()
    const href = await firstCard.getAttribute('href')
    expect(href).toMatch(/^\/blog\/[a-z0-9-]+$/)

    await firstCard.click()
    await expect(page).toHaveURL(new RegExp(href!.replace(/\//g, '\\/') + '$'))
    // The article renders its H1 (the post title) — not the index.
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await expect(page.getByRole('heading', { level: 1 })).not.toHaveText(
      'The Pixelco Blog',
    )
  })
})
