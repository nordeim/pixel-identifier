/**
 * Dashboard chrome metadata — the single source of truth for sidebar
 * sections, per-page titles/subtitles and notification state helpers.
 *
 * Everything in here is pure and covered by `tests/dashboard-chrome.test.ts`;
 * the visual components (sidebar-nav, topbar) must consume this module so
 * the chrome stays in lockstep with the live app (round-4 plan, Task S1).
 */

export interface NavItem {
  href: string
  label: string
  /** Lucide icon name, matching the live app's sidebar exactly. */
  icon:
    | 'chart-column'
    | 'eye'
    | 'activity'
    | 'code-xml'
    | 'users'
    | 'credit-card'
    | 'settings'
  exact?: boolean
}

export interface NavSection {
  title: string
  items: NavItem[]
}

export const NAV_SECTIONS: NavSection[] = [
  {
    title: 'Analytics',
    items: [
      { href: '/dashboard', label: 'Overview', icon: 'chart-column', exact: true },
      { href: '/dashboard/visitors', label: 'Visitors', icon: 'eye' },
      { href: '/dashboard/activity', label: 'Activity Log', icon: 'activity' },
    ],
  },
  {
    title: 'Setup',
    items: [
      { href: '/dashboard/install', label: 'Install Pixel', icon: 'code-xml' },
      { href: '/dashboard/domains', label: 'Domains', icon: 'users' },
    ],
  },
  {
    title: 'Account',
    items: [
      { href: '/dashboard/pricing', label: 'Pricing & Plan', icon: 'credit-card' },
      { href: '/dashboard/settings', label: 'Settings', icon: 'settings' },
    ],
  },
]

export interface PageMeta {
  title: string
  /** Subtitle rendered under the topbar title. May be a format template. */
  subtitle: string
  /**
   * R5-H2: the live app renders no topbar title on Install and Settings —
   * the in-page H1 (`font-display text-2xl font-bold`) is the only title.
   */
  inPageTitle?: boolean
}

export const PAGE_META: Record<string, PageMeta> = {
  '/dashboard': {
    title: 'Overview',
    subtitle: 'Your visitor identification at a glance',
  },
  '/dashboard/visitors': {
    title: 'Visitors',
    // R6-C1: never a brace template — the real counts line is computed
    // server-side from `getVisitorSegmentCounts` and passed through the
    // layout, so this fallback is not rendered in practice.
    subtitle: 'Your identified visitors',
  },
  '/dashboard/activity': {
    title: 'Activity Log',
    subtitle: 'Real-time feed of visitor events',
  },
  '/dashboard/install': {
    title: 'Install Your Pixel',
    subtitle: 'One snippet in your <head> tag — works on every page automatically.',
    inPageTitle: true,
  },
  '/dashboard/domains': {
    title: 'Domains',
    subtitle: 'Manage the websites where your pixel is installed',
  },
  '/dashboard/pricing': {
    title: 'Pricing & Plan',
    subtitle: 'Choose the right plan for your business',
  },
  '/dashboard/settings': {
    title: 'Settings',
    subtitle: 'Manage your account and pixel configuration.',
    inPageTitle: true,
  },
}

/** Live app unread-dot pink (`bg-hot-pink`, rgb(236, 70, 153)). */
export const NOTIFICATION_DOT_COLOR = '#EC4699'

/**
 * Format the Visitors topbar subtitle from segment counts
 * (live: "2 individuals · 0 companies identified"). The live app never
 * switches to singular forms ("1 companies" is rendered as-is), so neither
 * do we (R6-H2 parity).
 */
export function visitorsSubtitle(counts: {
  individual: number
  company: number
}): string {
  return `${counts.individual} individuals · ${counts.company} companies identified`
}

export interface ActivityEventLike {
  /** Event name as persisted: 'pageview' | 'identification'. */
  name: string
  createdAt: Date
}

/**
 * The bell shows an unread dot iff at least one identification resolved in
 * the last 7 days — a real signal, never decorative (round-4 plan, S5).
 */
export function hasUnreadActivity(
  events: ActivityEventLike[],
  now: Date = new Date(),
): boolean {
  const cutoff = now.getTime() - 7 * 24 * 60 * 60 * 1000
  return events.some(
    (event) => event.name === 'identification' && event.createdAt.getTime() >= cutoff,
  )
}

/**
 * A visitor is "active" iff they were last seen within the 30-minute session
 * window — the same boundary the live product's collector uses for one
 * "visit" (SESSION_MAX_AGE = 1800s). Observed on the live app: a visitor
 * seen "Just now" renders the solid-yellow active pill; one seen 13 hours
 * ago renders the gray inactive pill. Derived at render time from lastSeen —
 * no stored state, so it can never go stale (round-5 plan, A2).
 */
export function isVisitorActive(lastSeen: Date, now: Date = new Date()): boolean {
  return now.getTime() - lastSeen.getTime() < 30 * 60_000
}

/* ------------------------------------------------------------------ */
/* Collapsible desktop sidebar (round-4 plan, Task S7)                 */
/* ------------------------------------------------------------------ */

export type SidebarState = 'expanded' | 'rail'

export type SidebarAction =
  | { type: 'toggle' }
  | { type: 'hydrate'; value: string | null }

export const SIDEBAR_STORAGE_KEY = 'pixelco.sidebar'

export function nextSidebarState(state: SidebarState, action: SidebarAction): SidebarState {
  switch (action.type) {
    case 'toggle':
      return state === 'expanded' ? 'rail' : 'expanded'
    case 'hydrate':
      return action.value === 'rail' ? 'rail' : 'expanded'
  }
}
