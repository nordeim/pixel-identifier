import { describe, expect, it, vi } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { renderToStaticMarkup } from 'react-dom/server'
import { SettingsPanel } from '@/components/dashboard/settings-panel'

vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
  usePathname: () => '/dashboard/settings',
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), refresh: vi.fn() }),
}))

vi.mock('next-auth/react', () => ({ signOut: vi.fn() }))

/**
 * R30-F2 pins — the settings Profile form's INPUT ATTRIBUTE SET,
 * runtime-diffed against the live's full settings main-content HTML
 * (15th probe generation; evidence:
 * docs/plans/2026-09-23-round30-sidebar-wrapper-install-parity.md).
 *
 * The live's Profile inputs are BARE: no type, no autocomplete, no
 * maxlength — only the class string, placeholder and value. The clone
 * shipped clone-authored additions: type="url" (which even adds native
 * browser URL validation the live does not have), autoComplete
 * ×2, maxLength ×2. The live's DOM is the contract → strip the five
 * attrs.
 *
 * What STAYS (documented, not drift):
 *   - the <form> + $ACTION hidden inputs — the R22 server-action
 *     architecture (the live is CSR with no form; ours is the working
 *     mutation mechanism);
 *   - id/name attrs + the Label for= pairs — name feeds the server
 *     action, for/id is the D-class a11y value-add;
 *   - the AlertDialog delete confirm — the R20 intentional divergence;
 *   - zod still validates server-side.
 */

const src = (rel: string) =>
  readFileSync(join(process.cwd(), rel), 'utf-8')

describe('R30-F2 — the Profile inputs match the live attribute set', () => {
  const html = renderToStaticMarkup(
    <SettingsPanel
      email="demo@pixelco.local"
      company="Demo Store Inc."
      website="https://demo-store.example.com"
    />,
  )

  it('renders no type="url" on the website input (the live ships a plain text input)', () => {
    expect(html).not.toContain('type="url"')
  })

  it('renders no autocomplete attrs on the Profile inputs', () => {
    // NOTE: React's SSR emits the camelCase form (autoComplete=) while the
    // real DOM lowercases it — compare case-insensitively so the pin sees
    // both spellings.
    expect(html.toLowerCase()).not.toContain('autocomplete=')
  })

  it('renders no maxlength attrs on the Profile inputs', () => {
    expect(html.toLowerCase()).not.toMatch(/maxlength="\d+"/)
  })

  it('keeps the id/name attrs the server action + a11y need', () => {
    // id + for pairs (D-class a11y) and name (the action's form data).
    expect(html).toMatch(/id="company"[^>]*name="company"/)
    expect(html).toMatch(/for="company"/)
    expect(html).toMatch(/id="website"[^>]*name="website"/)
    expect(html).toMatch(/for="website"/)
  })

  it('keeps the live placeholders + values (byte surface unchanged)', () => {
    expect(html).toContain('placeholder="Acme Inc."')
    expect(html).toContain('placeholder="https://yoursite.com"')
    expect(html).toContain('value="Demo Store Inc."')
  })

  it('keeps the R22 server-action form + the R18 rhythm pins intact', () => {
    expect(html).toMatch(/<form[^>]*class="[^"]*space-y-4/)
    expect(html).toContain('md:text-sm opacity-60"')
  })
})

describe('R30-F2 — the source carries no clone-authored input attrs', () => {
  const panel = src('src/components/dashboard/settings-panel.tsx')
  // Scope to the PROFILE form only (between the Profile card title and
  // the form close) — the delete-confirm dialog is a clone value-add
  // (R20 divergence) whose autoComplete="off" is not in scope.
  const profileStart = panel.indexOf('Profile')
  const formEnd = panel.indexOf('</form>')
  const profileForm = panel.slice(profileStart, formEnd)

  it('has no autoComplete/maxLength/url-type on the Profile inputs', () => {
    expect(profileForm).not.toMatch(/autoComplete=/)
    expect(profileForm).not.toMatch(/maxLength=/)
    expect(profileForm).not.toMatch(/type="url"/)
  })
})
