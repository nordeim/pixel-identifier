import { describe, expect, it, vi } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { renderToStaticMarkup } from 'react-dom/server'
import { Topbar } from '@/components/dashboard/topbar'
import { SignOutButton } from '@/components/dashboard/sign-out-button'
import { ActivityFeed, type ActivityEvent } from '@/components/dashboard/activity-feed'
import { weekOverWeekChange } from '@/lib/format'

/**
 * R24 dashboard parity batch: the bell button's class order (live ships
 * `h-10 w-10 relative` — size="icon" + className="relative" merged), the
 * Export button as a real <button> (live: client-side CSV, NO
 * hidden/sm:inline-flex, icon classes `h-3.5 w-3.5 mr-1.5`), the New This
 * Week trend badge (live-only on that card, `+X%`/`X%` with
 * text-neon-green/text-destructive + TrendingUp/Down at h-3 w-3 mr-0.5),
 * the views label without singularization ("1 views" on the live), the
 * sign-out icon without shrink-0, and the legacy icon swaps (mail/users in
 * the KPIs, users on the Domains sidebar link, mail in the activity feed,
 * mail/search in the visitors surfaces). Evidence: R24 plan, 9th probe
 * generation (live DOM + bundle decode).
 */

const src = (rel: string) =>
  readFileSync(join(process.cwd(), rel), 'utf-8')

vi.mock('next/navigation', () => ({
  usePathname: () => '/dashboard/visitors',
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

describe('R24 F5 — bell button class order', () => {
  it('renders the live merged order h-10 w-10 relative (not relative h-10 w-10)', () => {
    const html = renderToStaticMarkup(
      <Topbar
        email="demo@pixelco.local"
        usage={usage}
        unread={false}
        initialVisitorsCounts={{ individual: 3, company: 1 }}
      />,
    )
    expect(html).toContain('hover:text-accent-foreground h-10 w-10 relative"')
    expect(html).not.toContain('relative h-10 w-10')
  })

  it('renders the bell icon with the legacy angular geometry', () => {
    const html = renderToStaticMarkup(
      <Topbar
        email="demo@pixelco.local"
        usage={usage}
        unread={false}
        initialVisitorsCounts={{ individual: 3, company: 1 }}
      />,
    )
    expect(html).toContain('lucide lucide-bell h-4 w-4')
    expect(html).toContain('M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9')
  })
})

describe('R24 F8 — Export button element, visibility and icon', () => {
  const topbar = renderToStaticMarkup(
    <Topbar
      email="demo@pixelco.local"
      usage={usage}
      unread={false}
      initialVisitorsCounts={{ individual: 3, company: 1 }}
    />,
  )

  it('renders Export as a <button>, not an anchor', () => {
    expect(topbar).toMatch(/<button[^>]*class="[^"]*gradient-primary[^"]*"/)
    expect(topbar).not.toContain('<a href="/api/export')
    expect(topbar).not.toContain('download=""')
  })

  it('is NOT hidden on mobile (no hidden / sm:inline-flex)', () => {
    expect(topbar).not.toContain('hidden gradient-primary')
    expect(topbar).not.toContain('sm:inline-flex')
  })

  it('carries the live class tail (font-semibold h-9 rounded-md px-3 last)', () => {
    expect(topbar).toContain(
      'gradient-primary text-primary-foreground shadow-lg glow-primary hover:opacity-90 transition-all duration-300 font-semibold h-9 rounded-md px-3',
    )
  })

  it('renders the legacy download icon with the live class order', () => {
    expect(topbar).toContain('lucide lucide-download h-3.5 w-3.5 mr-1.5')
    expect(topbar).toContain('<polyline points="7 10 12 15 17 10"></polyline>')
  })

  it('keeps the Export (N) label logic and the page-scoped href computation', () => {
    const source = src('src/components/dashboard/topbar.tsx')
    expect(source).toContain('Export (')
    expect(source).toMatch(/pageVisitorIds[\s\S]{0,900}\/api\/export\?ids=/)
  })
})

describe('R24 F6 — New This Week trend badge', () => {
  it('weekOverWeekChange matches the live bundle math', () => {
    // bundle: u = d>0 ? ((c-d)/d*100).toFixed(1) : "0";
    //         change = d>0 ? (Number(u)>=0 ? "+" : "") + u + "%" : "";
    expect(weekOverWeekChange(0, 2)).toEqual({ change: '-100.0%', up: false })
    expect(weekOverWeekChange(3, 2)).toEqual({ change: '+50.0%', up: true })
    expect(weekOverWeekChange(2, 2)).toEqual({ change: '+0.0%', up: true })
    expect(weekOverWeekChange(5, 0)).toEqual({ change: '', up: true })
    expect(weekOverWeekChange(1, 3)).toEqual({ change: '-66.7%', up: false })
  })

  it('the KPI card renders the badge with the live classes + icon size', () => {
    const page = src('src/app/dashboard/page.tsx')
    expect(page).toContain('inline-flex items-center text-xs font-semibold')
    expect(page).toContain("kpi.up ? 'text-neon-green' : 'text-destructive'")
    expect(page).toContain('h-3 w-3 mr-0.5')
  })

  it('the badge renders ONLY on the New This Week card (change stays empty elsewhere)', () => {
    const page = src('src/app/dashboard/page.tsx')
    expect(page).toMatch(/kpi\.change &&/)
  })
})

describe('R24 F3 — views label never singularizes', () => {
  it('renders the live label `${views.toLocaleString()} views`', () => {
    const page = src('src/app/dashboard/page.tsx')
    expect(page).toContain('page.views.toLocaleString()} views')
    expect(page).not.toContain("'1 view'")
  })
})

describe('R24 F4 — legacy icon swaps across dashboard surfaces', () => {
  it('the KPI mail icon ships the legacy rect-first geometry', () => {
    const page = src('src/app/dashboard/page.tsx')
    expect(page).toMatch(/MailIcon/)
    expect(page).not.toMatch(/\bMail\b(?!Icon)/)
  })

  it('the KPI New This Week icon ships the legacy users geometry', () => {
    const page = src('src/app/dashboard/page.tsx')
    expect(page).toMatch(/UsersIcon/)
  })

  it('the sidebar Domains link ships the legacy users geometry', () => {
    const nav = src('src/components/dashboard/sidebar-nav.tsx')
    expect(nav).toMatch(/UsersIcon/)
    expect(nav).not.toMatch(/import \{[^}]*\bUsers\b[^}]*\} from 'lucide-react'/)
  })

  it('the activity feed identification rows ship the legacy mail geometry', () => {
    const events: ActivityEvent[] = [
      {
        id: 'e1',
        name: 'identification',
        domain: 'demo-store.example.com',
        path: '/',
        email: 'jane.doe@example.com',
        anonymousId: 'anon-123',
        createdAt: new Date().toISOString(),
      },
    ]
    const html = renderToStaticMarkup(<ActivityFeed initialEvents={events} totalCount={1} />)
    expect(html).toContain('lucide-mail')
    expect(html).toContain('m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7')
  })

  it('the visitors search icon ships the legacy 1-decimal handle', () => {
    const table = src('src/components/dashboard/visitors-table.tsx')
    expect(table).toMatch(/SearchIcon/)
    expect(table).toMatch(/MailIcon/)
  })
})

describe('R24 F10 — sign-out icon drops shrink-0, keeps legacy geometry', () => {
  it('renders h-3.5 w-3.5 with no shrink-0 and the old-gen log-out paths', () => {
    const html = renderToStaticMarkup(<SignOutButton />)
    expect(html).toContain('class="lucide lucide-log-out h-3.5 w-3.5"')
    expect(html).not.toContain('shrink-0"')
    expect(html).toContain('<polyline points="16 17 21 12 16 7"></polyline>')
    expect(html).toContain('<line x1="21" x2="9" y1="12" y2="12"></line>')
  })
})

describe('R24 F9 — settings Save spinner renders ALONGSIDE the label', () => {
  it('the pending spinner keeps the label in the DOM (h-3.5 w-3.5 mr-1.5)', () => {
    const panel = src('src/components/dashboard/settings-panel.tsx')
    expect(panel).toContain('h-3.5 w-3.5 mr-1.5 animate-spin')
    // the label renders unconditionally NEXT TO the conditional spinner —
    // never as the ternary's other branch (the pre-R24 bug swapped the
    // whole label out for the spinner).
    expect(panel).toMatch(/\{pending && \([\s\S]{0,320}LoaderCircle[\s\S]{0,320}\)\}\n\s*Save Changes/)
    expect(panel).not.toMatch(/pending \? \(/)
  })
})
