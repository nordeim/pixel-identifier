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
