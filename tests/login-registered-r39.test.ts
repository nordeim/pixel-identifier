import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { resolve } from 'node:path'

/**
 * R39-C1 regression pins — the login page's `?registered=1` banner is an
 * UNDOCUMENTED D-class value-add until this round (evidence:
 * docs/plans/2026-09-28-round39-tw4-hover-variant-parity.md).
 *
 * The LIVE's `/login?registered=1` renders the plain login form — the
 * param is ignored (runtime-probed in the 24th generation; the app
 * bundle's only `registered` tokens are WebAuthn/Supabase internals,
 * no query-param handler). The live's signup can never produce the
 * state either: its Supabase flow gates every account behind email
 * confirmation ("Check your email" toast, no redirect — the R22-F11
 * documented divergence).
 *
 * The CLONE auto-sessions on signup (the R22-F11 D-class ruling — no
 * mail transport here), and its ONE edge (account created, auto
 * signIn rejected) redirects to `/login?registered=1` where the banner
 * tells the reader the account exists. Removing the banner would strand
 * that edge on a bare login with no explanation; the live renders
 * nothing there because the live CANNOT reach the state. Same family
 * as the R22 ContactSupportButton / forgot-password-ack rulings: keep
 * the working behavior, document the divergence, pin it.
 *
 * Probe-methodology lesson (recorded in the plan): the round's first
 * probe checked innerText for the strings 'registered'/'successfully'
 * and missed the banner — the copy is "Account created — sign in…".
 * The VLM cross-check on the r39 login capture caught it. Never assert
 * state by guessing copy; read the rendered DOM or the source.
 */

const pageSource = readFileSync(
  resolve(__dirname, '../src/app/login/page.tsx'),
  'utf8',
)
const signupSource = readFileSync(
  resolve(__dirname, '../src/components/auth/signup-form.tsx'),
  'utf8',
)

describe('R39-C1 — the ?registered=1 banner (documented D-class value-add)', () => {
  it('renders ONLY under registered === "1" (the live ignores the param)', () => {
    // The conditional gate: no banner on the plain login — the live's
    // rendering for every query state.
    expect(pageSource).toContain(`params.registered === '1'`)
    expect(pageSource).toContain('{registered && (')
  })

  it('carries the account-created copy + a status role', () => {
    expect(pageSource).toContain(
      'Account created — sign in to continue to your dashboard.',
    )
    expect(pageSource).toContain('role="status"')
  })

  it('is produced only by the auto-signin-failure edge (the R22-F11 family)', () => {
    // The signup form redirects to the banner ONLY when the account was
    // created but the client signIn rejected — the normal flow lands on
    // /dashboard (the auto-session divergence).
    expect(signupSource).toContain("router.push('/login?registered=1')")
    expect(signupSource).toContain('router.push(\'/dashboard\')')
  })
})
