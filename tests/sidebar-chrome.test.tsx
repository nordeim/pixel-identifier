import { describe, expect, it, vi } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { SidebarNav } from '@/components/dashboard/sidebar-nav'

/**
 * R11-F3/F4 regression test: the live sidebar chrome (shadcn Sidebar suite,
 * extracted verbatim off app.pixelco.io — see
 * research/round11-audit/live-ground-truth.md §4):
 *
 *   header:    flex items-center gap-2 p-4 (logo h-8 + font-display
 *              text-lg font-bold wordmark)
 *   content:   flex min-h-0 flex-1 flex-col gap-2 overflow-auto
 *   group:     relative flex w-full min-w-0 flex-col p-2
 *   label:     flex h-8 shrink-0 items-center rounded-md px-2 text-xs
 *              font-medium text-sidebar-foreground/70
 *   menu:      flex w-full min-w-0 flex-col gap-1
 *   item:      h-8 rounded-md p-2 gap-2 text-sm; hover
 *              hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground;
 *              active bg-sidebar-accent text-sidebar-accent-foreground
 *              font-medium
 *   footer:    flex flex-col gap-2 p-4 space-y-3 (NO border-t) → plan card
 *              rounded-lg border border-primary/20 bg-primary/5 p-3 → badge
 *              row flex items-center gap-2 mb-1 → Badge secondary +
 *              text-[10px] px-1.5 py-0 gradient-primary text-primary-
 *              foreground border-0 rendering "FREE" (uppercase literal) →
 *              usage text-xs text-muted-foreground leading-snug → progress
 *              h-1.5 w-full rounded-full bg-muted mt-2 overflow-hidden →
 *              sign-out flex items-center gap-2 text-xs text-muted-
 *              foreground hover:text-foreground transition-colors w-full px-1
 *
 * Collapsed rail = 48px (w-12), footer HIDDEN, logo still rendered.
 */

vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
  usePathname: () => '/dashboard',
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
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

const expanded = renderToStaticMarkup(<SidebarNav usage={usage} />)
const collapsed = renderToStaticMarkup(<SidebarNav usage={usage} collapsed />)

describe('sidebar footer chrome (R11-F3)', () => {
  it('renders the live footer wrapper without a border-t', () => {
    expect(expanded).toContain('flex flex-col gap-2 p-4 space-y-3')
  })

  it('renders the plan card + badge row + FREE badge on the Badge component', () => {
    expect(expanded).toContain('rounded-lg border border-primary/20 bg-primary/5 p-3')
    expect(expanded).toContain('flex items-center gap-2 mb-1')
    // Legacy Badge base + secondary variant + the live's overrides (the
    // variant's text-secondary-foreground is dropped by twMerge under the
    // trailing text-primary-foreground — the live DOM string matches);
    // the plan name renders as the literal uppercase "FREE".
    expect(expanded).toContain(
      'inline-flex items-center rounded-full font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary hover:bg-secondary/80 text-[10px] px-1.5 py-0 gradient-primary text-primary-foreground border-0',
    )
    expect(expanded).toContain('>FREE</span>')
    expect(expanded).not.toContain('>Free</span>')
  })

  it('renders the usage line and progress with the live classes', () => {
    expect(expanded).toContain('text-xs text-muted-foreground leading-snug')
    expect(expanded).toContain('3 / 100 identifications')
    expect(expanded).toContain('h-1.5 w-full rounded-full bg-muted mt-2 overflow-hidden')
    expect(expanded).toContain('h-full rounded-full gradient-primary')
  })

  it('renders the sign-out button with the live chrome', () => {
    expect(expanded).toContain(
      'flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors w-full px-1',
    )
    expect(expanded).toContain('Sign out')
  })
})

describe('sidebar nav chrome (R11-F4)', () => {
  it('renders the live header/content/group/label/menu wrappers', () => {
    expect(expanded).toContain('flex items-center gap-2 p-4')
    expect(expanded).toContain('flex min-h-0 flex-1 flex-col gap-2 overflow-auto')
    expect(expanded).toContain('relative flex w-full min-w-0 flex-col p-2')
    expect(expanded).toContain(
      'flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium text-sidebar-foreground/70',
    )
    expect(expanded).toContain('flex w-full min-w-0 flex-col gap-1')
  })

  it('renders the live menu-button chrome with warm active pill tokens', () => {
    // Active (Overview on /dashboard): the warm pill + golden text.
    expect(expanded).toContain(
      'hover:bg-sidebar-accent/50 bg-sidebar-accent text-sidebar-accent-foreground font-medium',
    )
    // Hover tint is 50% of the accent; inactive items keep the h-8 size.
    expect(expanded).toContain('hover:bg-sidebar-accent/50')
    expect(expanded).toContain('h-8 text-sm')
    expect(expanded).not.toContain('bg-[#F8F6F2]')
    expect(expanded).not.toContain('text-[#CC9900]')
  })

  it('renders the wordmark text with the live classes', () => {
    expect(expanded).toContain('font-display text-lg font-bold')
  })
})

describe('collapsed rail (R11-F4)', () => {
  it('hides the footer entirely when collapsed', () => {
    expect(collapsed).not.toContain('Sign out')
    expect(collapsed).not.toContain('identifications')
    expect(collapsed).not.toContain('space-y-3')
  })

  it('still renders the logo when collapsed', () => {
    expect(collapsed).toContain('svg')
  })
})
