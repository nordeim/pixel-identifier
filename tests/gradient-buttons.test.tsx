import { describe, expect, it, vi } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { DomainsPanel } from '@/components/dashboard/domains-panel'
import { LoginForm } from '@/components/auth/login-form'
import { SignUpForm } from '@/components/auth/signup-form'

/**
 * R12-F6 regression test: the live builds its gradient submit CTAs as
 * Button base + consumer classes ONLY — no variant fragment survives
 * (their DOM shows no bg-primary / hover:bg-primary/90; twMerge drops the
 * base's font-medium / transition-colors against the consumer's
 * font-semibold / transition-all). Verified on three surfaces:
 *
 *   domains Add-Domain:  …[&_svg]:shrink-0 gradient-primary text-primary-
 *                        foreground shadow-lg glow-primary hover:opacity-90
 *                        transition-all duration-300 font-semibold h-10
 *                        px-4 py-2
 *   login Sign In:       …same… + w-full
 *   signup Start Free:   …same… + w-full
 *
 * The clone's default variant contributed `bg-primary hover:bg-primary/90`
 * ahead of the same overrides (renders identically — the gradient image
 * covers the bg-color — but the class string drifted). The consumers now
 * pass variant={null} size={null} (cva treats null as an explicit variant
 * skip) with the live's exact class string.
 */

vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
  usePathname: () => '/dashboard/domains',
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}))

vi.mock('next-auth/react', () => ({ signOut: vi.fn(), signIn: vi.fn() }))

vi.mock('@/actions/auth', () => ({ signUpAction: vi.fn() }))

// SSR escapes & as &amp; inside class attributes — pin the escaped form.
const BASE_TAIL =
  '[&amp;_svg]:pointer-events-none [&amp;_svg]:size-4 [&amp;_svg]:shrink-0 gradient-primary text-primary-foreground shadow-lg glow-primary hover:opacity-90 transition-all duration-300 font-semibold h-10 px-4 py-2'

const domainsHtml = renderToStaticMarkup(
  <DomainsPanel
    domains={[
      {
        id: 'd1',
        siteKey: 'px_test1',
        domain: 'example.com',
        status: 'verified',
        createdAt: '2026-09-10T00:00:00.000Z',
        visitorCount: 4,
        identifiedCount: 1,
      },
    ]}
  />,
)

const loginHtml = renderToStaticMarkup(<LoginForm />)
const signupHtml = renderToStaticMarkup(<SignUpForm />)

describe('gradient submit buttons (R12-F6 live class parity)', () => {
  it('renders the Add-Domain button as base + live overrides (no variant bg classes)', () => {
    expect(domainsHtml).toContain(BASE_TAIL)
    expect(domainsHtml).not.toContain('bg-primary hover:bg-primary/90')
  })

  it('renders the login Sign In button with the live tail + w-full', () => {
    expect(loginHtml).toContain(`${BASE_TAIL} w-full`)
    expect(loginHtml).not.toContain('bg-primary hover:bg-primary/90')
  })

  it('renders the signup Start Free Trial button with the live tail + w-full', () => {
    expect(signupHtml).toContain(`${BASE_TAIL} w-full`)
    expect(signupHtml).not.toContain('bg-primary hover:bg-primary/90')
  })

  it('keeps the auth buttons at the live chrome (h-10 default size, not h-9)', () => {
    // The merged strings carry the default h-10 px-4 py-2 sizing at the
    // tail — the legacy Button contract from R11.
    expect(loginHtml).toContain('h-10 px-4 py-2 w-full')
    expect(signupHtml).toContain('h-10 px-4 py-2 w-full')
  })
})
