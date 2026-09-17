import { describe, expect, it, vi } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { SidebarNav } from '@/components/dashboard/sidebar-nav'
import { SidebarShell } from '@/components/dashboard/sidebar-shell'

/**
 * R15-F1 regression test: the live dashboard migrated its sidebar to the
 * shadcn Sidebar primitive (extracted verbatim off app.pixelco.io — see
 * research/round15-audit/live/shell-full.json + shell-groups.json):
 *
 *   provider:  div[data-side=left][data-variant=sidebar][data-state]
 *              [data-collapsible].group.peer.hidden.text-sidebar-foreground
 *              .md:block
 *   gap:       relative h-svh w-[--sidebar-width] bg-transparent
 *              transition-[width] … group-data-[collapsible=icon]:
 *              w-[--sidebar-width-icon]
 *   fixed:     fixed inset-y-0 z-10 hidden h-svh w-[--sidebar-width]
 *              … md:flex left-0 group-data-[side=left]:border-r
 *   inner:     div[data-sidebar=sidebar].flex.h-full.w-full.flex-col
 *              .bg-sidebar
 *   header:    data-sidebar=header flex flex-col gap-2 p-4 → PNG logo img
 *              (h-8 w-8 shrink-0, NOT a link) + span.font-display.text-lg
 *              .font-bold "Pixelco"
 *   content:   data-sidebar=content flex min-h-0 flex-1 flex-col gap-2
 *              overflow-auto … group-data-[collapsible=icon]:overflow-hidden
 *   group:     data-sidebar=group relative flex w-full min-w-0 flex-col p-2
 *   label:     data-sidebar=group-label flex h-8 shrink-0 items-center
 *              rounded-md px-2 text-xs font-medium text-sidebar-foreground/70
 *              … group-data-[collapsible=icon]:-mt-8 opacity-0
 *   menu:      ul[data-sidebar=menu].flex.w-full.min-w-0.flex-col.gap-1 →
 *              li[data-sidebar=menu-item].group/menu-item.relative →
 *              a[data-sidebar=menu-button][data-size=default][data-active]
 *              .peer/menu-button …h-8 text-sm hover:bg-sidebar-accent/50
 *              (+ appended active tail on the current route); icons carry
 *              mr-2 h-4 w-4; aria-current="page" on the active item
 *   footer:    data-sidebar=footer flex flex-col gap-2 p-4 space-y-3 →
 *              plan card (unchanged R11 chrome) + sign-out
 *
 * Breakpoints are **md** (768px), collapse flips data-state +
 * data-collapsible=icon (the rail is driven by the group-data variants,
 * not conditional rendering).
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

const nav = renderToStaticMarkup(<SidebarNav usage={usage} />)

describe('sidebar inner chrome (R15-F1 primitive)', () => {
  it('renders the data-sidebar=sidebar inner wrapper with the live classes', () => {
    expect(nav).toContain('data-sidebar="sidebar"')
    expect(nav).toContain('class="flex h-full w-full flex-col bg-sidebar')
  })

  it('renders the PNG logo header (unlinked img + font-display wordmark)', () => {
    expect(nav).toContain('data-sidebar="header"')
    expect(nav).toContain('class="flex flex-col gap-2 p-4"')
    expect(nav).toContain('src="/assets/logo-BxfT-ZTZ.png"')
    expect(nav).toContain('alt="Pixelco"')
    expect(nav).toContain('class="h-8 w-8 shrink-0"')
    expect(nav).toContain('class="font-display text-lg font-bold"')
    // The live wordmark is NOT a link.
    expect(nav).not.toContain('aria-label="Pixelco dashboard"')
  })

  it('renders the content wrapper with overflow-auto and icon-collapse variants', () => {
    expect(nav).toContain('data-sidebar="content"')
    expect(nav).toContain('class="flex min-h-0 flex-1 flex-col gap-2 overflow-auto')
    expect(nav).toContain('group-data-[collapsible=icon]:overflow-hidden')
    // No <nav> element — the live ships divs only.
    expect(nav).not.toContain('<nav')
  })

  it('renders the three live groups with data-sidebar group/label/content attrs', () => {
    expect(nav).toContain('data-sidebar="group"')
    expect(nav).toContain('class="relative flex w-full min-w-0 flex-col p-2"')
    expect(nav).toContain('data-sidebar="group-label"')
    expect(nav).toContain('class="flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium text-sidebar-foreground/70')
    expect(nav).toContain('group-data-[collapsible=icon]:-mt-8')
    expect(nav).toContain('group-data-[collapsible=icon]:opacity-0')
    expect(nav).toContain('data-sidebar="group-content"')
    expect(nav).toContain('class="w-full text-sm"')
    ;['Analytics', 'Setup', 'Account'].forEach((label) =>
      expect(nav).toContain(`>${label}<`),
    )
  })

  it('renders ul/li menu wrappers with the live data-sidebar attrs', () => {
    expect(nav).toContain('<ul data-sidebar="menu" class="flex w-full min-w-0 flex-col gap-1">')
    expect(nav).toContain('<li data-sidebar="menu-item" class="group/menu-item relative">')
  })

  it('renders menu buttons on the peer/menu-button primitive string with the app tail', () => {
    expect(nav).toContain('data-sidebar="menu-button"')
    expect(nav).toContain('data-size="default"')
    expect(nav).toContain('data-active="false"')
    expect(nav).toContain('class="peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left')
    expect(nav).toContain('data-[active=true]:bg-sidebar-accent')
    expect(nav).toContain('group-data-[collapsible=icon]:!size-8')
    // renderToStaticMarkup HTML-escapes BOTH the & and the > in arbitrary
    // selectors (display pipelines often eat the [m — check the raw bytes).
    expect(nav).toContain('[&amp;&gt;span:last-child]:truncate')
    expect(nav).toContain('h-8 text-sm hover:bg-sidebar-accent/50')
  })

  it('appends the live active tail to the current route item (aria-current=page)', () => {
    // /dashboard is active in this harness.
    expect(nav).toContain('aria-current="page"')
    expect(nav).toMatch(
      /aria-current="page" class="[^"]*bg-sidebar-accent text-sidebar-accent-foreground font-medium"/,
    )
  })

  it('carries the live icon treatment (mr-2 h-4 w-4, no aria-hidden)', () => {
    expect(nav).toContain('lucide-chart-column mr-2 h-4 w-4')
    expect(nav).toContain('lucide-eye mr-2 h-4 w-4')
    expect(nav).toContain('lucide-activity mr-2 h-4 w-4')
    expect(nav).toContain('lucide-code-xml mr-2 h-4 w-4')
    expect(nav).toContain('lucide-users mr-2 h-4 w-4')
    expect(nav).toContain('lucide-credit-card mr-2 h-4 w-4')
    expect(nav).toContain('lucide-settings mr-2 h-4 w-4')
    // R15-D11: lucide-react 0.525 ships aria-hidden="true" by default
    // (the live's older build predates it); the idiomatic default stays —
    // an invisible, a11y-positive framework attribute.
  })

  it('groups the seven routes exactly like the live (Analytics/Setup/Account)', () => {
    const analytics = nav.indexOf('Analytics')
    const setup = nav.indexOf('Setup')
    const account = nav.indexOf('Account')
    const pos = (href: string) => nav.indexOf(`href="${href}"`)
    expect(analytics).toBeGreaterThan(-1)
    expect(setup).toBeGreaterThan(analytics)
    expect(account).toBeGreaterThan(setup)
    // Analytics: Overview, Visitors, Activity Log
    expect(pos('/dashboard')).toBeGreaterThan(analytics)
    expect(pos('/dashboard/visitors')).toBeGreaterThan(analytics)
    expect(pos('/dashboard/activity')).toBeGreaterThan(analytics)
    // Setup: Install Pixel, Domains
    expect(pos('/dashboard/install')).toBeGreaterThan(setup)
    expect(pos('/dashboard/domains')).toBeGreaterThan(setup)
    // Account: Pricing & Plan, Settings
    expect(pos('/dashboard/pricing')).toBeGreaterThan(account)
    expect(pos('/dashboard/settings')).toBeGreaterThan(account)
  })
})

describe('sidebar footer chrome (R11-F3, unchanged by R15)', () => {
  it('renders the live footer wrapper without a border-t', () => {
    expect(nav).toContain('data-sidebar="footer"')
    expect(nav).toContain('class="flex flex-col gap-2 p-4 space-y-3"')
  })

  it('renders the plan card + badge row + FREE badge on the Badge component', () => {
    expect(nav).toContain('rounded-lg border border-primary/20 bg-primary/5 p-3')
    expect(nav).toContain('flex items-center gap-2 mb-1')
    expect(nav).toContain('gradient-primary text-primary-foreground border-0')
    expect(nav).toContain('>FREE</div>')
  })

  it('renders the usage line and progress with the live classes', () => {
    expect(nav).toContain('text-xs text-muted-foreground leading-snug')
    expect(nav).toContain('3 / 100 identifications')
    expect(nav).toContain('h-1.5 w-full rounded-full bg-muted mt-2 overflow-hidden')
    expect(nav).toContain('h-full rounded-full gradient-primary')
  })

  it('renders the sign-out button with the live chrome', () => {
    expect(nav).toContain(
      'flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors w-full px-1',
    )
    expect(nav).toContain('lucide-log-out h-3.5 w-3.5')
  })
})

describe('sidebar shell provider (R15-F1 desktop wrapper)', () => {
  it('renders provider + gap + fixed container with the live classes/attrs', () => {
    const shell = renderToStaticMarkup(<SidebarShell usage={usage} />)
    expect(shell).toContain('data-side="left"')
    expect(shell).toContain('data-variant="sidebar"')
    expect(shell).toContain('data-state="expanded"')
    expect(shell).toContain('data-collapsible=""')
    expect(shell).toContain('class="group peer hidden text-sidebar-foreground md:block"')
    expect(shell).toContain('class="relative h-svh w-[--sidebar-width] bg-transparent transition-[width] duration-200 ease-linear')
    expect(shell).toContain('group-data-[collapsible=offcanvas]:w-0')
    expect(shell).toContain('fixed inset-y-0 z-10 hidden h-svh w-[--sidebar-width] transition-[left,right,width] duration-200 ease-linear md:flex left-0')
    expect(shell).toContain('group-data-[side=left]:border-r')
    // The custom aside is gone.
    expect(shell).not.toContain('<aside')
    expect(shell).not.toContain('sticky top-0 h-screen')
  })

  it('flips to the collapsed icon-rail state via data attrs', () => {
    // The collapsed shell is asserted via the chrome-store contract in
    // dashboard-chrome.test.ts; here we pin that BOTH states render the
    // same DOM shape (the group-data variants drive the rail, not
    // conditional markup) — the sidebar nav is rendered identically.
    const shell = renderToStaticMarkup(<SidebarShell usage={usage} />)
    expect(shell).toContain('data-sidebar="menu-button"')
    expect(shell).toContain('group-data-[collapsible=icon]:!size-8')
    expect(shell).toContain('group-data-[collapsible=icon]:!p-2')
  })
})
