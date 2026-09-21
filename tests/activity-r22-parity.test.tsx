import { describe, expect, it, vi } from 'vitest'
import { readFileSync } from 'node:fs'
import { renderToStaticMarkup } from 'react-dom/server'
import { ActivityFeed } from '@/components/dashboard/activity-feed'
import { listActivity } from '@/lib/analytics'
import { db } from '@/lib/db'

vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => '/dashboard/activity',
}))

/**
 * R22 activity-log parity pins (plan:
 * docs/plans/2026-09-19-round22-firstrun-activity-parity.md).
 *
 * Evidence base: the live's app bundle (index-nhmKaUsm.js, component hxe)
 * + runtime capture — the live's Activity Log:
 *   - page size 50 (Jc=50), page-index client state, offset pagination
 *   - footer ONLY when count > 50: `flex items-center justify-between
 *     px-5 py-3 border-t border-border`, "1–50 of N" (en dash), ghost
 *     h-7 w-7 icon buttons (ChevronLeft/Right) with disabled bounds,
 *     "Page X of Y" (text-xs text-muted-foreground px-2) between
 *   - NO polling (no refetchInterval; no app-level QueryClient config),
 *     NO "Load older events" button, no cursor walking
 *   - empty state: <p class="text-sm text-muted-foreground py-12
 *     text-center">No activity yet. Install your pixel to start
 *     tracking.</p>
 *   - while fetching: py-24 centered spinner (replaces the list)
 */

const feed = readFileSync('src/components/dashboard/activity-feed.tsx', 'utf-8')
const route = readFileSync('src/app/api/activity/route.ts', 'utf-8')

const events = Array.from({ length: 3 }, (_, i) => ({
  id: `ev_${i}`,
  name: i === 0 ? 'identification' : 'pageview',
  domain: 'demo.example',
  path: `/page-${i}`,
  email: i === 0 ? 'known@example.com' : null,
  anonymousId: i === 0 ? null : 'anon123456789',
  createdAt: new Date('2026-09-19T10:00:00Z').toISOString(),
}))

describe('R22 F6 — Activity Log pagination model (50/page, footer)', () => {
  const html = renderToStaticMarkup(
    <ActivityFeed initialEvents={events} totalCount={137} />,
  )

  it('renders the footer only when the count exceeds one page', () => {
    expect(html).toContain('Page 1 of 3')
    expect(html).toContain('1–50 of 137')
    const singlePage = renderToStaticMarkup(
      <ActivityFeed initialEvents={events} totalCount={24} />,
    )
    expect(singlePage).not.toContain('Page 1 of')
    expect(singlePage).not.toContain('border-t border-border')
  })

  it('renders the footer container with the live classes', () => {
    expect(html).toContain(
      'class="flex items-center justify-between px-5 py-3 border-t border-border"',
    )
  })

  it('renders ghost icon buttons h-7 w-7 with the page label between', () => {
    expect(html).toContain('hover:text-accent-foreground h-7 w-7')
    expect(html).toContain('class="text-xs text-muted-foreground px-2"')
    // prev disabled on page 0 (static render starts at page 0)
    expect(html).toMatch(/disabled[^>]*>[\s\S]{0,400}lucide-chevron-left/)
  })

  it('has NO polling, NO load-older, NO cursor machinery', () => {
    expect(feed).not.toContain('Load older events')
    expect(feed).not.toContain('setInterval')
    expect(feed).not.toContain('cursor')
    expect(feed).not.toContain('nextCursor')
    expect(feed).not.toContain('/api/activity?cursor=')
  })

  it('fetches pages by index, not by cursor', () => {
    expect(feed).toContain('/api/activity?page=')
    expect(feed).not.toContain('?cursor=')
  })
})

describe('R22 F2 — Activity empty state (the live string + classes)', () => {
  const emptyHtml = renderToStaticMarkup(
    <ActivityFeed initialEvents={[]} totalCount={0} />,
  )

  it('renders the empty p with the live classes', () => {
    expect(emptyHtml).toContain(
      'class="text-sm text-muted-foreground py-12 text-center"',
    )
    expect(emptyHtml).toContain(
      'No activity yet. Install your pixel to start tracking.',
    )
  })

  it('renders no list and no footer when empty', () => {
    expect(emptyHtml).not.toContain('divide-y')
    expect(emptyHtml).not.toContain('Page 1 of')
  })

  it('retires the old clone-authored empty copy', () => {
    expect(feed).not.toContain('No events yet.')
    expect(feed).not.toContain('will appear here in real time')
  })
})

describe('R22 F6 — /api/activity page envelope', () => {
  it('accepts ?page= and returns count + pageCount', async () => {
    // 51+ events for the user -> 2 pages of 50
    const user = await db.user.create({
      data: {
        email: `r22-activity-${crypto.randomUUID()}@test.example`,
        passwordHash: 'x',
      },
    })
    const site = await db.site.create({
      data: {
        userId: user.id,
        domain: 'r22-activity.example',
        siteKey: `px_r22act${crypto.randomUUID().slice(0, 8)}`,
      },
    })
    const visitor = await db.visitor.create({
      data: {
        siteId: site.id,
        anonymousId: 'r22_anon_0001',
        email: null,
      },
    })
    for (let i = 0; i < 101; i++) {
      await db.event.create({
        data: {
          siteId: site.id,
          visitorId: visitor.id,
          name: 'pageview',
          path: `/r22-${i}`,
          createdAt: new Date(2026, 0, 1, 0, i),
        },
      })
    }

    const page0 = await listActivity(user.id)
    expect(page0.events).toHaveLength(50)
    expect(page0.count).toBe(101)
    expect(page0.pageCount).toBe(3)

    const page1 = await listActivity(user.id, { page: 1 })
    expect(page1.events).toHaveLength(50)
    expect(page1.events[0].path).toBe('/r22-50')
    const page2 = await listActivity(user.id, { page: 2 })
    expect(page2.events).toHaveLength(1)
    expect(page2.events[0].path).toBe('/r22-0')

    await db.user.delete({ where: { id: user.id } })
  })
})

describe('R22 F6 — route signature', () => {
  it('reads the page param (no cursor)', () => {
    expect(route).toContain('page')
    expect(route).not.toContain('cursor')
  })
})
