import { describe, expect, it, vi } from 'vitest'
import { readFileSync } from 'node:fs'
import { renderToStaticMarkup } from 'react-dom/server'
import { AuthShell, OAuthButtons } from '@/components/auth/auth-shell'
import { LoginForm } from '@/components/auth/login-form'
import { Label } from '@/components/ui/label'
import { Topbar } from '@/components/dashboard/topbar'
import { buildSnippet } from '@/lib/snippet'

/**
 * R15-F2/F3/F5/F6 regression tests: the live's new build realigned the
 * topbar, the auth cards, the Label primitive, the install snippet format
 * and the activity-feed title (evidence:
 * research/round15-audit/{live,local}/shell-header.json, login-card.html,
 * live-install-snippets.json).
 */

vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
  usePathname: () => '/dashboard',
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), refresh: vi.fn() }),
}))

vi.mock('next-auth/react', () => ({ signOut: vi.fn() }))

const usage = {
  planName: 'free',
  used: 3,
  limit: 100,
  percent: 3,
  period: 'lifetime' as const,
  overage: 0,
  overageCostLabel: '$0.00',
}

describe('topbar chrome (R15-F2)', () => {
  const topbar = renderToStaticMarkup(
    <Topbar
      email="demo@pixelco.local"
      usage={usage}
      unread
      initialVisitorsCounts={{ individual: 3, company: 1 }}
    />,
  )

  it('renders the live header classes (non-sticky, h-14)', () => {
    expect(topbar).toContain(
      'class="h-14 flex items-center justify-between border-b border-border bg-card px-6"',
    )
    expect(topbar).not.toContain('sticky top-0 z-30')
  })

  it('renders the left group without min-w-0 and the title block in a plain div', () => {
    expect(topbar).toContain('<div class="flex items-center gap-4">')
    expect(topbar).not.toContain('flex min-w-0 items-center gap-4')
    expect(topbar).toContain(
      '<h1 class="font-display text-sm font-semibold leading-none">',
    )
    expect(topbar).toContain('class="text-xs text-muted-foreground mt-0.5"')
    expect(topbar).not.toContain('class="min-w-0"')
  })

  it('renders the sidebar trigger (data-sidebar=trigger, sr-only label, no size padding)', () => {
    expect(topbar).toContain('data-sidebar="trigger"')
    expect(topbar).toContain('<span class="sr-only">Toggle Sidebar</span>')
    expect(topbar).not.toContain('aria-label="Toggle Sidebar"')
    // The live trigger carries NO variant/size fragment (28px square).
    expect(topbar).not.toMatch(/data-sidebar="trigger"[^>]*px-4 py-2/)
  })

  it('renders the bell without labels and the hot-pink dot as a utility class', () => {
    expect(topbar).toContain('bg-hot-pink')
    expect(topbar).not.toContain('aria-label="New identifications"')
    expect(topbar).not.toContain('aria-label="No new notifications"')
    expect(topbar).not.toContain('style=')
  })

  it('renders the avatar at the live chrome (text-xs, ml-2, no labels)', () => {
    expect(topbar).toContain(
      'h-8 w-8 rounded-full gradient-primary flex items-center justify-center text-xs font-bold text-primary-foreground ml-2',
    )
    expect(topbar).not.toContain('aria-label="Signed in as')
    expect(topbar).not.toContain('text-[10px]')
  })
})

describe('auth card chrome (R15-F3)', () => {
  const shell = renderToStaticMarkup(
    <AuthShell title="Welcome back" subtitle="Sign in to your Pixelco account">
      <p>form</p>
    </AuthShell>,
  )

  it('orders the card classes base-first like the live', () => {
    expect(shell).toContain(
      'rounded-lg border bg-card text-card-foreground w-full max-w-md relative z-10 border-border/50 shadow-2xl',
    )
  })

  it('orders the card header classes like the live (p-6 text-center pb-2)', () => {
    expect(shell).toContain('flex flex-col space-y-1.5 p-6 text-center pb-2')
  })

  it('renders the PNG logo image (h-16 w-16) instead of the inline SVG', () => {
    expect(shell).toContain('src="/assets/logo-BxfT-ZTZ.png"')
    expect(shell).toContain('class="h-16 w-16"')
    expect(shell).not.toContain('linearGradient')
    expect(shell).not.toContain('viewBox="0 0 240 240"')
  })

  it('renders the heading as an h3 with the live class order', () => {
    expect(shell).toContain(
      '<h3 class="font-semibold tracking-tight font-display text-2xl">Welcome back</h3>',
    )
    expect(shell).not.toContain('<h1')
  })
})

describe('OAuth buttons (R15-F3, ruling D3: disabled placeholders, live DOM)', () => {
  const oauth = renderToStaticMarkup(<OAuthButtons />)

  it('builds on the Button primitive base with the live outline + size classes', () => {
    expect(oauth).toContain('inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium')
    expect(oauth).toContain(
      'hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 w-full',
    )
    expect(oauth).toContain('border border-input bg-background')
    // The hand-rolled literal-canvas classes are gone.
    expect(oauth).not.toContain('bg-[#F6F7F9]')
  })

  it('keeps the buttons disabled (D3: no OAuth providers) without the title', () => {
    // Count the disabled ATTRIBUTE, not the class-string mentions.
    expect(oauth.match(/disabled(?!:)/g)?.length).toBe(2)
    expect(oauth).not.toContain('title=')
  })

  it('orders the icon classes like the live (h-4 w-4 mr-2)', () => {
    expect(oauth).toContain('class="h-4 w-4 mr-2"')
  })
})

describe('Label primitive (R15-F3 new generation)', () => {
  it('renders the live new-gen classes without data-slot or flex chrome', () => {
    const label = renderToStaticMarkup(<Label htmlFor="email">Email</Label>)
    expect(label).toContain(
      'class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"',
    )
    expect(label).not.toContain('data-slot')
    expect(label).not.toContain('flex items-center gap-2')
    expect(label).not.toContain('select-none')
  })
})

describe('login form (R15-F3)', () => {
  it('drops the email label wrapper and ships native validation', () => {
    const source = readFileSync('src/components/auth/login-form.tsx', 'utf8')
    // The email field renders label + input directly (no justify-between).
    expect(source).not.toMatch(/justify-between">\s*\n\s*<Label htmlFor="email"/)
    const form = renderToStaticMarkup(<LoginForm />)
    expect(form).not.toContain('novalidate')
  })

  it('orders the footer link classes like the live', () => {
    const source = readFileSync('src/app/login/page.tsx', 'utf8')
    expect(source).toContain('text-primary font-medium hover:underline')
  })
})

describe('pricing plan cards (R15 verification sweep)', () => {
  const source = readFileSync('src/components/dashboard/plan-panel.tsx', 'utf8')

  it('renders the card roots on the Card base-first order like the live', () => {
    expect(source).toContain(
      "'rounded-lg border bg-card text-card-foreground shadow-sm relative overflow-hidden transition-all hover:shadow-lg flex flex-col h-full hover:border-primary/20'",
    )
    expect(source).toContain(
      "'rounded-lg border bg-card text-card-foreground relative overflow-hidden transition-all hover:shadow-lg flex flex-col h-full border-primary shadow-md ring-1 ring-primary/20 scale-[1.02]'",
    )
    // R17 supersession: the plan-card roots stay pinned by the positive
    // strings above; the contact-sales card now legitimately carries
    // `border-border bg-card` (twMerge displacement reproduces the live
    // order). The old wrong consumer was `border-border shadow-sm`.
    expect(source).not.toContain('border-border shadow-sm')
  })

  it('ships no POPULAR badge (the live marks popular with the bar + border only)', () => {
    expect(source).not.toContain('POPULAR')
  })

  it('renders the CTAs on the live variants (outline Current Plan, gradient Get Started)', () => {
    expect(source).toContain('variant="outline" size={null} className="h-10 px-4 py-2 w-full mb-4"')
    expect(source).toContain(
      'className="gradient-primary text-primary-foreground shadow-lg glow-primary hover:opacity-90 transition-all duration-300 font-semibold h-10 px-4 py-2 w-full mb-4"',
    )
  })

  it('renders the feature list as chip rows (div list, circular chip, span text)', () => {
    expect(source).toContain('<div className="space-y-2.5 flex-1">')
    expect(source).toContain(
      '<div className="h-4 w-4 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">',
    )
    expect(source).toContain(
      '<span className="text-xs text-muted-foreground leading-relaxed">{feature}</span>',
    )
    expect(source).not.toContain('<ul className="flex-1 space-y-2.5">')
  })

  it('drops text-foreground from the in-page headings like the live', () => {
    const install = readFileSync('src/app/dashboard/install/page.tsx', 'utf8')
    const settings = readFileSync(
      'src/components/dashboard/settings-panel.tsx',
      'utf8',
    )
    expect(install).toContain('font-display text-2xl font-bold">Install Your Pixel')
    expect(settings).toContain('font-display text-2xl font-bold">Settings')
    expect(install).not.toContain('font-bold text-foreground')
    expect(settings).not.toContain('font-bold text-foreground')
  })
})

describe('install snippet format (R15-F6)', () => {
  it('indents the loader body two spaces like the live', () => {
    const snippet = buildSnippet('px_0123456789abcdef', 'https://app.example/pixel.js')
    expect(snippet).toContain(
      `<script>\n  (function(p,i,x,e,l){p._pxq=p._pxq||[];\n  var s=i.createElement('script');s.async=1;\n  s.src='https://app.example/pixel.js';\n  s.setAttribute('data-site',e);\n  i.head.appendChild(s);})(window,document,'px','px_0123456789abcdef');\n</script>`,
    )
  })
})

describe('activity feed title (R15-F5)', () => {
  it('renders Live Feed as a CardTitle h3 without text-foreground', () => {
    const source = readFileSync('src/components/dashboard/activity-feed.tsx', 'utf8')
    expect(source).not.toContain('text-foreground">Live Feed')
    expect(source).toMatch(/CardTitle[^>]*\s*text-base/)
  })
})

describe('landing social proof heading (R15-F7)', () => {
  it('ships no heading in the testimonials section (the live has none)', () => {
    const source = readFileSync(
      'src/components/marketing/social-proof.tsx',
      'utf8',
    )
    expect(source).not.toContain('sr-only')
    expect(source).not.toContain('aria-labelledby')
    expect(source).not.toContain('Customer testimonials')
  })
})
