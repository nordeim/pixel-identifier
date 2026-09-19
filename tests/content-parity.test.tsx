import { describe, expect, it, vi } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import {
  ActivityFeed,
  type ActivityEvent,
} from '@/components/dashboard/activity-feed'
import { DomainsPanel } from '@/components/dashboard/domains-panel'
import { VisitorsTable } from '@/components/dashboard/visitors-table'
import { PlatformInstructions } from '@/components/dashboard/platform-instructions'
import { SignOutButton } from '@/components/dashboard/sign-out-button'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

/**
 * R16 content-layer parity pins. The live shipped a new build of the
 * dashboard content components (evidence: research/round16-audit/live/).
 * The pattern: text in <span>/<div> (not <p>), no text-foreground on
 * labels/values, geometry-first class orders, div rows (not ul/li), div
 * icon chips (no aria-hidden wrappers), LEGACY-gen content badges (base
 * `border` + secondary `text-secondary-foreground`) while the sidebar and
 * domains-Verified badges stay new-gen.
 */

vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
  usePathname: () => '/dashboard/visitors',
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}))

vi.mock('next-auth/react', () => ({ signOut: vi.fn() }))

const src = (rel: string) =>
  readFileSync(join(process.cwd(), rel), 'utf8')

const visitor = {
  id: 'v1',
  email: 'sarah@example.com',
  anonymousId: 'anon-0001',
  type: 'individual',
  companyName: null,
  city: null,
  state: null,
  country: null,
  domain: 'example.com',
  source: 'direct',
  confidence: 92,
  status: 'active',
  pageviews: 3,
  firstSeen: '2026-09-10T00:00:00.000Z',
  lastSeen: '2026-09-10T00:00:00.000Z',
}

const events: ActivityEvent[] = [
  {
    id: 'e1',
    name: 'pageview',
    domain: 'example.com',
    path: '/pricing',
    email: null,
    anonymousId: 'anon-000123456789',
    createdAt: '2026-09-10T00:00:00.000Z',
  },
  {
    id: 'e2',
    name: 'identification',
    domain: 'example.com',
    path: '/pricing',
    email: 'marcus.smith@acmecorp.com',
    anonymousId: 'anon-000123456789',
    createdAt: '2026-09-10T00:01:00.000Z',
  },
]

describe('R16 A — Tabs primitive + consumers', () => {
  it('renders the Tabs root without a base class (live: bare dir=ltr div)', () => {
    const html = renderToStaticMarkup(
      <Tabs defaultValue="a">
        <TabsList>
          <TabsTrigger value="a">HTML</TabsTrigger>
        </TabsList>
      </Tabs>,
    )
    expect(html).toContain('data-orientation="horizontal"><div role="tablist"')
  })

  it('renders the trigger with data-[state=active] BEFORE focus-visible + gap-1.5 tail', () => {
    const html = renderToStaticMarkup(
      <Tabs defaultValue="a">
        <TabsList>
          <TabsTrigger value="a" className="gap-1.5">
            All
          </TabsTrigger>
        </TabsList>
      </Tabs>,
    )
    const cls = /role="tab"[^>]*class="([^"]*)"/.exec(html)?.[1] ?? ''
    expect(cls).toContain('transition-all data-[state=active]:bg-background')
    expect(cls).toContain('disabled:opacity-50 gap-1.5')
    expect(cls.indexOf('data-[state=active]:bg-background')).toBeLessThan(
      cls.indexOf('focus-visible:outline-none'),
    )
  })
})

describe('R16 C — Activity rows (div-based, live orders)', () => {
  const html = renderToStaticMarkup(
    <ActivityFeed initialEvents={events} initialCursor={null} />,
  )

  it('renders a div.divide-y container with div rows (no ul/li/data-tick)', () => {
    expect(html).toContain('<div class="divide-y divide-border">')
    expect(html).not.toContain('<ul class="divide-y')
    expect(html).not.toContain('<li')
    expect(html).not.toContain('data-tick')
  })

  it('renders rows with the live hover class order', () => {
    expect(html).toContain(
      'class="flex items-start gap-4 px-5 py-4 hover:bg-muted/20 transition-colors"',
    )
  })

  it('renders the icon chip as a div with the live class order', () => {
    expect(html).toContain(
      'class="h-8 w-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 bg-muted"',
    )
    expect(html).toContain(
      'class="h-8 w-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 gradient-primary"',
    )
  })

  it('renders the head line as a div with name span + badge order', () => {
    expect(html).toContain('<div class="flex items-center gap-2 mb-0.5">')
    expect(html).toContain('<span class="text-sm font-medium truncate">')
    // Pageview badge: outline variant with the live tail order
    expect(html).toContain(
      'text-foreground text-[10px] px-1.5 py-0">Pageview</div>',
    )
  })

  it('renders meta lines as divs with raw-text children (no truncate spans)', () => {
    expect(html).toContain(
      '<div class="flex items-center gap-3 text-xs text-muted-foreground">',
    )
    expect(html).toContain('<span class="flex items-center gap-1">')
    expect(html).not.toContain('<span class="truncate">')
    expect(html).not.toContain('min-w-0 items-center gap-1')
  })

  it('renders the timestamp as a span with the live order', () => {
    expect(html).toContain('class="text-xs text-muted-foreground shrink-0 mt-1"')
  })
})

describe('R16 D — Domains rows (div-based, legacy Pending badge)', () => {
  const html = renderToStaticMarkup(
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
        {
          id: 'd2',
          siteKey: 'px_test2',
          domain: 'pending.com',
          status: 'pending',
          createdAt: '2026-09-10T00:00:00.000Z',
          visitorCount: 0,
          identifiedCount: 0,
        },
      ]}
    />,
  )

  it('renders div rows with the live class order (no ul/li)', () => {
    expect(html).toContain(
      'class="flex items-center justify-between px-5 py-4 hover:bg-muted/20 transition-colors"',
    )
    expect(html).not.toContain('<ul class="divide-y')
    expect(html).not.toMatch(/<li[\s>]/)
  })

  it('renders the icon chip as a div h-9 with the live order', () => {
    expect(html).toContain(
      'class="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center"',
    )
  })

  it('renders the name line div + span, date p and stats divs (live classes)', () => {
    expect(html).toContain('<div class="flex items-center gap-2">')
    expect(html).toContain('<span class="text-sm font-semibold">')
    expect(html).toContain('class="text-xs text-muted-foreground mt-0.5"')
    expect(html).toContain('<div class="text-sm font-semibold">')
    expect(html).toContain('<div class="text-[10px] text-muted-foreground">')
  })

  it('renders Pending as the LEGACY-gen badge (border + text-secondary-foreground)', () => {
    expect(html).toContain(
      'inline-flex items-center rounded-full border font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80 text-[10px] px-1.5 py-0',
    )
    expect(html).toContain('Pending')
  })

  it('keeps Verified as the new-gen string (unchanged, 261-char live match)', () => {
    expect(html).toContain(
      'inline-flex items-center rounded-full font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary hover:bg-primary/80 text-[10px] px-1.5 py-0 gradient-primary text-primary-foreground border-0',
    )
  })
})

describe('R16 E — Visitors table (legacy badges, div rows, B2B chip)', () => {
  const visitorsHtml = renderToStaticMarkup(
    <VisitorsTable
      visitors={[visitor]}
      total={1}
      page={1}
      pageCount={1}
      counts={{ all: 1, individual: 1, company: 0 }}
      filters={{ q: '', type: 'all', confidence: 'all', source: 'all' }}
    />,
  )

  const companyHtml = renderToStaticMarkup(
    <VisitorsTable
      visitors={[
        {
          ...visitor,
          id: 'v2',
          email: 'contact@acme.com',
          type: 'company',
          companyName: 'Acme Inc',
          city: 'Austin',
          state: 'TX',
          country: 'US',
        },
      ]}
      total={1}
      page={1}
      pageCount={1}
      counts={{ all: 1, individual: 0, company: 1 }}
      filters={{ q: '', type: 'all', confidence: 'all', source: 'all' }}
    />,
  )

  it('renders the tab-count badge as the legacy-gen div (live 158-char string)', () => {
    expect(visitorsHtml).toContain(
      '<div class="inline-flex items-center rounded-full border font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80 text-[10px] px-1.5 py-0 ml-0.5">1</div>',
    )
    expect(visitorsHtml).not.toContain(
      '<span class="ml-0.5 inline-flex items-center rounded-full',
    )
  })

  it('renders the B2C avatar as a div with the live class order', () => {
    expect(visitorsHtml).toContain(
      'class="h-8 w-8 rounded-full gradient-primary flex items-center justify-center text-[10px] font-bold text-primary-foreground shrink-0"',
    )
  })

  it('renders the B2B avatar as the icon chip div (live class order)', () => {
    expect(companyHtml).toContain(
      'class="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary shrink-0"',
    )
    expect(companyHtml).toContain('lucide lucide-building2 h-4 w-4')
  })

  it('renders the identity cell as divs with the live orders', () => {
    expect(visitorsHtml).toContain('<div class="flex items-center gap-3">')
    expect(visitorsHtml).toContain('<div class="min-w-0">')
    expect(visitorsHtml).toContain(
      '<span class="text-sm font-medium block truncate">',
    )
    expect(visitorsHtml).toContain(
      '<span class="text-[11px] text-muted-foreground font-mono block truncate">',
    )
  })

  it('renders the source/type badge as the legacy-gen div with amber/neon tails', () => {
    expect(companyHtml).toContain(
      'inline-flex items-center rounded-full border font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 hover:bg-secondary/80 text-[10px] px-2 py-0 bg-amber-500/10 text-amber-600 border-amber-500/20',
    )
    expect(visitorsHtml).toContain(
      'inline-flex items-center rounded-full border font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 hover:bg-secondary/80 text-[10px] px-2 py-0 bg-neon-green/10 text-neon-green border-neon-green/20',
    )
  })

  it('renders the status badge as the legacy-gen secondary (text-secondary-foreground)', () => {
    expect(visitorsHtml).toContain(
      'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80 text-[10px] px-2 py-0',
    )
  })

  it('renders the confidence bar as divs with span label (no progressbar role)', () => {
    expect(visitorsHtml).toContain('<div class="flex items-center gap-2">')
    expect(visitorsHtml).toContain(
      'class="h-1.5 w-14 rounded-full bg-muted overflow-hidden"',
    )
    expect(visitorsHtml).toContain('class="h-full rounded-full bg-neon-green"')
    expect(visitorsHtml).toContain('<span class="text-xs font-medium">')
    expect(visitorsHtml).not.toContain('role="progressbar"')
  })

  it('renders the table row without clone-authored a11y chrome', () => {
    expect(visitorsHtml).toContain(
      'class="border-b border-border last:border-0 hover:bg-muted/20 transition-colors "',
    )
    expect(visitorsHtml).not.toContain('role="button"')
    expect(visitorsHtml).not.toContain('focus-visible:outline-2')
  })

  it('renders the checkbox with the live base order (rounded-sm border border-primary)', () => {
    expect(visitorsHtml).toContain(
      'peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background',
    )
  })

  it('renders the search wrapper and icon with the live orders', () => {
    expect(visitorsHtml).toContain('<div class="relative flex-1 max-w-sm">')
    expect(visitorsHtml).toContain(
      'class="lucide lucide-search absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"',
    )
  })
})

describe('R16 F — Pricing switch (Radix strings)', () => {
  it('renders the switch root with the live Radix string', () => {
    const html = renderToStaticMarkup(
      <Switch checked={false} onCheckedChange={() => {}} />,
    )
    expect(html).toContain('role="switch"')
    expect(html).toContain('data-state="unchecked"')
    expect(html).toContain('value="on"')
    expect(html).toContain(
      'peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors data-[state=checked]:bg-primary data-[state=unchecked]:bg-input focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50',
    )
  })

  it('renders the thumb with the live string (bg-background shadow-lg ring-0)', () => {
    const html = renderToStaticMarkup(
      <Switch checked={false} onCheckedChange={() => {}} />,
    )
    expect(html).toContain(
      'pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0',
    )
  })

  it('carries no focus-brand (D7)', () => {
    const html = renderToStaticMarkup(
      <Switch checked={false} onCheckedChange={() => {}} />,
    )
    expect(html).not.toContain('focus-brand')
  })
})

describe('R16 I — Universal sweeps', () => {
  it('drops focus-brand from the sign-out button', () => {
    const html = renderToStaticMarkup(<SignOutButton />)
    expect(html).toContain(
      'class="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors w-full px-1"',
    )
    expect(html).not.toContain('focus-brand')
  })

  it('ships the live broken group-label class transition-[margin,opa] (D2)', () => {
    const nav = src('src/components/dashboard/sidebar-nav.tsx')
    expect(nav).toContain('transition-[margin,opa]')
    expect(nav).not.toContain('transition-[margin,opacity]')
  })
})

describe('R16 H — Install page pieces', () => {
  it('renders the platform-instructions TabsList with the live consumer classes', () => {
    const html = renderToStaticMarkup(<PlatformInstructions />)
    expect(html).toContain(
      'inline-flex h-10 items-center rounded-md bg-muted p-1 text-muted-foreground w-full justify-start mb-4',
    )
    expect(html).not.toContain('text-muted-foreground mb-4 h-10')
  })

  it('renders the code chip with the live classes (px-1.5, live order)', () => {
    const page = src('src/app/dashboard/install/page.tsx')
    expect(page).toContain('text-xs bg-muted px-1.5 py-0.5 rounded font-mono')
    expect(page).not.toContain('rounded bg-muted px-1 py-0.5 font-mono text-xs')
  })

  it('renders the pre block with the live order (no text-foreground)', () => {
    const page = src('src/app/dashboard/install/page.tsx')
    expect(page).toContain(
      'bg-foreground/5 border border-border rounded-lg p-4 text-sm font-mono overflow-x-auto leading-relaxed',
    )
    expect(page).not.toContain('leading-relaxed text-foreground')
  })

  it('renders the notice box with the live tint (/5, /20)', () => {
    const page = src('src/app/dashboard/install/page.tsx')
    expect(page).toContain('bg-neon-green/5 border-neon-green/20')
  })

  it('renders the Quick Start chip and heading order (div chip, live order)', () => {
    const page = src('src/app/dashboard/install/page.tsx')
    expect(page).toContain(
      '<div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center text-sm font-bold text-primary-foreground">',
    )
    expect(page).toContain('className="space-y-6 max-w-4xl"')
    expect(page).toContain('className="text-muted-foreground text-sm mt-1"')
  })
})

describe('R16 B — Overview KPI cards (source pins)', () => {
  it('renders the live grid classes (grid-cols-1 + lg, not xl)', () => {
    const page = src('src/app/dashboard/page.tsx')
    expect(page).toContain('grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4')
    expect(page).not.toContain('grid gap-4 sm:grid-cols-2 xl:grid-cols-4')
  })

  it('renders the KPI kicker as a span with the live order (no text-foreground)', () => {
    const page = src('src/app/dashboard/page.tsx')
    expect(page).toContain(
      '<span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">',
    )
    expect(page).not.toContain(
      '<p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">',
    )
  })

  it('renders the KPI value as a div without text-foreground', () => {
    const page = src('src/app/dashboard/page.tsx')
    expect(page).toContain(
      '<div className="text-3xl font-display font-bold tracking-tight">',
    )
  })

  it('renders the icon chip as a div with the live order', () => {
    const page = src('src/app/dashboard/page.tsx')
    expect(page).toContain(
      '<div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">',
    )
  })

  it('renders the trend chart at h-[280px] (not h-72)', () => {
    const chart = src('src/components/dashboard/trend-chart.tsx')
    expect(chart).toContain('h-[280px]')
    expect(chart).not.toContain('h-72')
  })

  it('renders the View-all link without focus-brand (live order)', () => {
    const page = src('src/app/dashboard/page.tsx')
    expect(page).toContain(
      'className="text-xs text-primary hover:underline flex items-center gap-1"',
    )
    expect(page).not.toContain('focus-brand')
  })

  it('renders the recent-ids table without text-sm on the table element', () => {
    const page = src('src/app/dashboard/page.tsx')
    expect(page).toContain('<table className="w-full">')
  })

  it('renders th cells with the live order (no scope attr)', () => {
    const page = src('src/app/dashboard/page.tsx')
    expect(page).toContain(
      'className="text-left p-3 px-5 text-[11px] font-medium text-muted-foreground uppercase tracking-wider"',
    )
    expect(page).not.toContain('scope="col"')
  })
})

describe('R16 G — Settings page (source pins)', () => {
  it('drops the bg-[#F6F7F9] input displacement (bg-background survives)', () => {
    const panel = src('src/components/dashboard/settings-panel.tsx')
    expect(panel).not.toContain('bg-[#F6F7F9]')
  })

  it('renders the Save button variant-free with the h-9 rounded-md px-3 tail', () => {
    const panel = src('src/components/dashboard/settings-panel.tsx')
    expect(panel).toContain('variant={null}')
    expect(panel).toContain('size={null}')
    expect(panel).toContain(
      'gradient-primary text-primary-foreground shadow-lg glow-primary hover:opacity-90 transition-all duration-300 font-semibold h-9 rounded-md px-3',
    )
  })

  it('renders the danger zone body with space-y-4 and the live row classes', () => {
    const panel = src('src/components/dashboard/settings-panel.tsx')
    expect(panel).toContain('p-6 pt-0 space-y-4')
    expect(panel).toContain('flex items-center justify-between')
    expect(panel).not.toContain('flex flex-wrap items-center justify-between gap-3')
  })
})
