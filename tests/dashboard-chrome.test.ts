import { describe, expect, it } from 'vitest'

import {
  NAV_SECTIONS,
  PAGE_META,
  NOTIFICATION_DOT_COLOR,
  SIDEBAR_STORAGE_KEY,
  hasUnreadActivity,
  isVisitorActive,
  nextSidebarState,
  visitorsSubtitle,
} from '@/lib/dashboard-nav'

/**
 * Chrome metadata seam (round-4 plan, Task S1/S5/S7): the sidebar sections,
 * per-page titles/subtitles and notification flag live in one pure module so
 * the visual chrome stays in lockstep with the live app's contract.
 */
describe('dashboard-nav chrome metadata', () => {
  it('exposes exactly the live section titles, Title Case', () => {
    expect(NAV_SECTIONS.map((section) => section.title)).toEqual([
      'Analytics',
      'Setup',
      'Account',
    ])
  })

  it('uses the live lucide icon names in section order', () => {
    expect(NAV_SECTIONS.map((section) => section.items.map((item) => item.icon))).toEqual([
      ['chart-column', 'eye', 'activity'], // Analytics
      ['code-xml', 'users'], // Setup
      ['credit-card', 'settings'], // Account
    ])
  })

  it('labels nav items exactly like the live sidebar', () => {
    expect(NAV_SECTIONS.map((section) => section.items.map((item) => item.label))).toEqual([
      ['Overview', 'Visitors', 'Activity Log'],
      ['Install Pixel', 'Domains'],
      ['Pricing & Plan', 'Settings'],
    ])
  })

  it('links every nav item to its dashboard route', () => {
    const hrefs = NAV_SECTIONS.flatMap((section) => section.items.map((item) => item.href))
    expect(hrefs).toEqual([
      '/dashboard',
      '/dashboard/visitors',
      '/dashboard/activity',
      '/dashboard/install',
      '/dashboard/domains',
      '/dashboard/pricing',
      '/dashboard/settings',
    ])
  })

  it('keeps PAGE_META in sync with the nav routes (no orphans either way)', () => {
    const navRoutes = new Set(
      NAV_SECTIONS.flatMap((section) => section.items.map((item) => item.href)),
    )
    const metaRoutes = new Set(Object.keys(PAGE_META))
    expect([...navRoutes].every((route) => metaRoutes.has(route))).toBe(true)
    expect([...metaRoutes].every((route) => navRoutes.has(route))).toBe(true)
  })

  it('matches the live page titles', () => {
    expect(PAGE_META['/dashboard'].title).toBe('Overview')
    expect(PAGE_META['/dashboard/install'].title).toBe('Install Your Pixel')
    expect(PAGE_META['/dashboard/pricing'].title).toBe('Pricing & Plan')
  })

  it('matches the live subtitles verbatim (incl. Settings trailing period)', () => {
    expect(PAGE_META['/dashboard'].subtitle).toBe(
      'Your visitor identification at a glance',
    )
    expect(PAGE_META['/dashboard/activity'].subtitle).toBe(
      'Real-time feed of visitor events',
    )
    expect(PAGE_META['/dashboard/install'].subtitle).toBe(
      'One snippet in your <head> tag — works on every page automatically.',
    )
    expect(PAGE_META['/dashboard/domains'].subtitle).toBe(
      'Manage the websites where your pixel is installed',
    )
    expect(PAGE_META['/dashboard/pricing'].subtitle).toBe(
      'Choose the right plan for your business',
    )
    expect(PAGE_META['/dashboard/settings'].subtitle).toBe(
      'Manage your account and pixel configuration.',
    )
  })

  it('never ships a raw format template as a subtitle (R6-C1: the visitors template rendered literal {individuals} braces on server paint)', () => {
    for (const meta of Object.values(PAGE_META)) {
      expect(meta.subtitle, `${meta.title} subtitle must not be a brace template`).not.toMatch(/[{}]/)
    }
  })

  it('exposes the live hot-pink unread dot color', () => {
    expect(NOTIFICATION_DOT_COLOR).toBe('#EC4699')
  })

  it('marks Install and Settings as in-page-title routes; the other five keep topbar titles (R5-H2)', () => {
    // The live app renders NO topbar title on Install and Settings — the
    // in-page H1 (`font-display text-2xl font-bold`) is the only title.
    expect(PAGE_META['/dashboard/install'].inPageTitle).toBe(true)
    expect(PAGE_META['/dashboard/settings'].inPageTitle).toBe(true)
    // Every other dashboard route renders its title in the topbar like live.
    const topbarRoutes = [
      '/dashboard',
      '/dashboard/visitors',
      '/dashboard/activity',
      '/dashboard/domains',
      '/dashboard/pricing',
    ]
    for (const route of topbarRoutes) {
      expect(PAGE_META[route].inPageTitle ?? false).toBe(false)
    }
  })
})

describe('visitorsSubtitle', () => {
  it('formats the live topbar counts line', () => {
    expect(visitorsSubtitle({ individual: 2, company: 0 })).toBe(
      '2 individuals · 0 companies identified',
    )
    expect(visitorsSubtitle({ individual: 5, company: 3 })).toBe(
      '5 individuals · 3 companies identified',
    )
  })

  it('never switches to singular forms — the live renders “1 companies” (R6-H2 parity)', () => {
    expect(visitorsSubtitle({ individual: 1, company: 0 })).toBe(
      '1 individuals · 0 companies identified',
    )
    expect(visitorsSubtitle({ individual: 1, company: 1 })).toBe(
      '1 individuals · 1 companies identified',
    )
  })
})

describe('hasUnreadActivity (bell dot honesty)', () => {
  const now = new Date('2026-09-15T12:00:00Z')

  it('is true when an identification happened in the last 7 days', () => {
    expect(
      hasUnreadActivity([{ name: 'identification', createdAt: new Date('2026-09-14T00:00:00Z') }], now),
    ).toBe(true)
  })

  it('is false when the newest identification is older than 7 days', () => {
    expect(
      hasUnreadActivity([{ name: 'identification', createdAt: new Date('2026-09-01T00:00:00Z') }], now),
    ).toBe(false)
  })

  it('ignores pageview events entirely', () => {
    expect(
      hasUnreadActivity([{ name: 'pageview', createdAt: new Date('2026-09-15T11:00:00Z') }], now),
    ).toBe(false)
  })

  it('is false with no events at all', () => {
    expect(hasUnreadActivity([], now)).toBe(false)
  })
})

describe('isVisitorActive (R21-F10: the live\'s 1-hour window, bundle 36e5)', () => {
  const now = new Date('2026-09-15T12:00:00Z')

  it('treats a visitor seen just now as active', () => {
    expect(isVisitorActive(new Date('2026-09-15T11:59:30Z'), now)).toBe(true)
  })

  it('treats a visitor seen 29 minutes ago as active', () => {
    expect(isVisitorActive(new Date('2026-09-15T11:31:00Z'), now)).toBe(true)
  })

  it('treats a visitor seen 59 minutes ago as active (the live window is 1 hour)', () => {
    // R21-F10: the live computes `lastSeen > now − 36e5` — ONE hour, not
    // the 30-minute session window (index-nhmKaUsm.js).
    expect(isVisitorActive(new Date('2026-09-15T11:01:00Z'), now)).toBe(true)
  })

  it('treats a visitor seen 61 minutes ago as inactive', () => {
    expect(isVisitorActive(new Date('2026-09-15T10:59:00Z'), now)).toBe(false)
  })

  it('treats a visitor seen 13 hours ago as inactive (live observation)', () => {
    expect(isVisitorActive(new Date('2026-09-14T23:00:00Z'), now)).toBe(false)
  })

  it('uses the current time when now is omitted', () => {
    expect(isVisitorActive(new Date())).toBe(true)
    expect(isVisitorActive(new Date(Date.now() - 2 * 3_600_000))).toBe(false)
  })
})

describe('nextSidebarState (collapsible rail)', () => {
  it('toggles between expanded and rail', () => {
    expect(nextSidebarState('expanded', { type: 'toggle' })).toBe('rail')
    expect(nextSidebarState('rail', { type: 'toggle' })).toBe('expanded')
  })

  it('rehydrates a persisted value and falls back to expanded', () => {
    expect(nextSidebarState('expanded', { type: 'hydrate', value: 'rail' })).toBe('rail')
    expect(nextSidebarState('rail', { type: 'hydrate', value: 'expanded' })).toBe('expanded')
    expect(nextSidebarState('rail', { type: 'hydrate', value: 'garbage' })).toBe('expanded')
    expect(nextSidebarState('rail', { type: 'hydrate', value: null })).toBe('expanded')
  })

  it('uses a stable storage key', () => {
    expect(SIDEBAR_STORAGE_KEY).toBe('pixelco.sidebar')
  })
})
