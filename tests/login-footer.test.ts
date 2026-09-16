import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { resolve } from 'node:path'

/**
 * R9-F3 regression guard: the live login card renders the signup footer
 * link exactly once (a sibling after the form, `mt-4 text-center text-sm
 * text-muted-foreground`). The clone regressed to rendering it twice —
 * once inside LoginForm and once in the login page — so this guard walks
 * the two source files and pins the count and the location.
 *
 * (Same source-walking seam as tests/marketing-assets.test.ts: the login
 * page is an async server component composed with client hooks, which the
 * vitest node environment cannot render end-to-end.)
 */

const pageSource = readFileSync(
  resolve(__dirname, '../src/app/login/page.tsx'),
  'utf8',
)
const formSource = readFileSync(
  resolve(__dirname, '../src/components/auth/login-form.tsx'),
  'utf8',
)

describe('login signup-footer link (R9-F3)', () => {
  it('renders the link exactly once across page + form', () => {
    const occurrences =
      pageSource.split('Sign up free').length -
      1 +
      (formSource.split('Sign up free').length - 1)
    expect(occurrences).toBe(1)
  })

  it('lives in the page as a sibling after the form, with the live classes', () => {
    expect(pageSource).toContain('Sign up free')
    expect(pageSource).toContain('mt-4 text-center text-sm text-muted-foreground')
    // The form must not carry its own copy.
    expect(formSource).not.toContain('Sign up free')
  })
})
