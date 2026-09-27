import { expect, test } from '@playwright/test'
import { readFile } from 'node:fs/promises'

/**
 * Export download e2e (R36 G1) — the runtime regression net for the
 * topbar Export button's download flow. The R21 byte format was pinned
 * only at the unit seam (tests/export-r21-parity.test.ts invokes the
 * route directly); nothing ever clicked the button in a browser, and the
 * R36 live runtime capture (a URL.createObjectURL override on the live's
 * visitors page — 384 bytes, NO BOM, LF-only, NO trailing newline,
 * unquoted commas throughout, row order following the table's display
 * order) re-verified every R21 pin on the live itself. This spec closes
 * the browser-only gap: the window.location.assign flow, the suggested
 * filename, the byte contract, and the ids-scoped Export (N) state.
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

test.describe('visitors topbar export download (R36 G1)', () => {
  test('Export All downloads the live byte format; a selected row scopes to Export (1)', async ({ page }) => {
    await login(page)
    await page.goto('/dashboard/visitors')
    await expect(page.locator('tbody tr')).toHaveCount(3)

    // --- Full-page export (the Export All state) -------------------------
    const downloadPromise = page.waitForEvent('download')
    await page.getByRole('button', { name: 'Export All' }).click()
    const download = await downloadPromise

    // The live's filename contract: pixelco-visitors-YYYY-MM-DD.csv
    // (the route's Content-Disposition, pinned by the R21 unit tests).
    expect(download.suggestedFilename()).toMatch(
      /^pixelco-visitors-\d{4}-\d{2}-\d{2}\.csv$/,
    )

    const text = await readFile(await download.path(), 'utf8')

    // The R21 byte contract, now runtime-pinned: LF-only, NO BOM, NO
    // trailing newline (the live's Blob joins with \n and stops there).
    expect(text.charCodeAt(0)).not.toBe(0xfeff)
    expect(text).not.toContain('\r')
    expect(text.endsWith('\n')).toBe(false)

    // The 9-column header, verbatim.
    const lines = text.split('\n')
    expect(lines).toHaveLength(4) // header + the 3 seeded identified rows
    expect(lines[0]).toBe(
      'Type,Name,Detail,Confidence,Source,Location,First Seen,Last Seen,Status',
    )

    // Per-type row shapes (deterministic columns only — the relative
    // Last Seen and the computed status vary with boot time):
    //   b2c: Individual, email, site domain, X%, direct, —, …
    //   b2b: Company, company name, the company email's domain, —,
    //        IP Lookup, joined geo, …  (unquoted commas, the live's way)
    expect(text).toContain(
      'Individual,jane.doe@example.com,demo-store.example.com,90%,direct,—,',
    )
    expect(text).toContain(
      'Company,Acme Corp,acmecorp.com,—,IP Lookup,San Francisco, CA, US,',
    )
    expect(text).toContain(
      'Individual,sarah.chen@gmail.com,demo-store.example.com,92%,direct,—,',
    )

    // --- The ids-scoped state (a selected row flips the label) ------------
    const janeRow = page.locator('tr', { hasText: 'jane.doe@example.com' })
    await janeRow.locator('button[role=checkbox]').click()

    const exportButton = page.getByRole('button', { name: 'Export (1)' })
    await expect(exportButton).toBeVisible()

    const scopedPromise = page.waitForEvent('download')
    await exportButton.click()
    const scoped = await scopedPromise

    const scopedText = await readFile(await scoped.path(), 'utf8')
    const scopedLines = scopedText.split('\n')
    expect(scopedLines).toHaveLength(2) // header + jane's row ONLY
    expect(scopedLines[1]).toContain('jane.doe@example.com')
    expect(scopedText).not.toContain('sarah.chen@gmail.com')
    expect(scopedText).not.toContain('Acme Corp')
  })
})
