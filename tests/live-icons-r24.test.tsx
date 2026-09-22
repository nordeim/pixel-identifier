import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import {
  BellIcon,
  LogOutIcon,
  MailIcon,
  UsersIcon,
  DownloadIcon,
  SearchIcon,
  CodeIcon,
  ShoppingBagIcon,
  TrendingUpIcon,
  TrendingDownIcon,
} from '@/components/dashboard/live-icons'

/**
 * R24: the live app bundle pins lucide-react v0.462.0 — its dashboard icons
 * ship the OLD generation (angular bell, polyline/line log-out, rect-first
 * mail, circle-second users, …). lucide-react 0.525 ships the 2024 redesign
 * for these icons, a visible DOM-level drift. These pins hold the live's
 * exact 0.462 geometry (element sequence + attribute bytes) for the ten
 * drifted icons, following the R16 D4 live-icons pattern.
 *
 * Evidence: https://app.pixelco.io/assets/index-nhmKaUsm.js (lucide-react
 * v0.462 factories) + the live's rendered dashboard DOM (R24 plan, 9th
 * probe generation). The live's MARKETING bundle ships the new generation —
 * these overrides must stay scoped to app/dashboard consumers.
 */

describe('R24 legacy icon generation — exact 0.462 geometries', () => {
  it('bell: the angular dome + clapper (not the 2024 rounded redesign)', () => {
    const html = renderToStaticMarkup(<BellIcon />)
    expect(html).toContain('class="lucide lucide-bell"')
    expect(html).toContain('<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"></path>')
    expect(html).toContain('<path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"></path>')
    // the 0.525 redesign paths must NOT appear
    expect(html).not.toContain('M10.268 21a2 2 0 0 0 3.464 0')
    expect(html).not.toContain('M3.262 15.326')
  })

  it('log-out: the old polyline/line encoding (same geometry, different bytes)', () => {
    const html = renderToStaticMarkup(<LogOutIcon />)
    expect(html).toContain('class="lucide lucide-log-out"')
    expect(html).toContain('<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>')
    expect(html).toContain('<polyline points="16 17 21 12 16 7"></polyline>')
    expect(html).toContain('<line x1="21" x2="9" y1="12" y2="12"></line>')
    expect(html).not.toContain('M21 12H9')
  })

  it('mail: rect-first element order + 2-decimal flap path', () => {
    const html = renderToStaticMarkup(<MailIcon />)
    expect(html).toContain('class="lucide lucide-mail"')
    // rect BEFORE the flap path (0.525 renders path first)
    const rect = html.indexOf('<rect width="20" height="16" x="2" y="4" rx="2"></rect>')
    const path = html.indexOf('<path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>')
    expect(rect).toBeGreaterThanOrEqual(0)
    expect(path).toBeGreaterThan(rect)
    expect(html).not.toContain('8.991')
  })

  it('users: circle-second order + 2-decimal side arcs', () => {
    const html = renderToStaticMarkup(<UsersIcon />)
    expect(html).toContain('class="lucide lucide-users"')
    const body = html.indexOf('<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>')
    const circle = html.indexOf('<circle cx="9" cy="7" r="4"></circle>')
    expect(body).toBeGreaterThanOrEqual(0)
    expect(circle).toBeGreaterThan(body)
    expect(html).toContain('<path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>')
    expect(html).toContain('<path d="M16 3.13a4 4 0 0 1 0 7.75"></path>')
    expect(html).not.toContain('3.128')
  })

  it('download: the old polyline/line encoding', () => {
    const html = renderToStaticMarkup(<DownloadIcon />)
    expect(html).toContain('class="lucide lucide-download"')
    expect(html).toContain('<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>')
    expect(html).toContain('<polyline points="7 10 12 15 17 10"></polyline>')
    expect(html).toContain('<line x1="12" x2="12" y1="15" y2="3"></line>')
    expect(html).not.toContain('<path d="M12 15V3"></path>')
  })

  it('search: the live 1-decimal handle (4.3, not 4.34)', () => {
    const html = renderToStaticMarkup(<SearchIcon />)
    expect(html).toContain('class="lucide lucide-search"')
    expect(html).toContain('<circle cx="11" cy="11" r="8"></circle>')
    expect(html).toContain('<path d="m21 21-4.3-4.3"></path>')
    expect(html).not.toContain('4.34')
  })

  it('code: the old polyline encoding', () => {
    const html = renderToStaticMarkup(<CodeIcon />)
    expect(html).toContain('class="lucide lucide-code"')
    expect(html).toContain('<polyline points="16 18 22 12 16 6"></polyline>')
    expect(html).toContain('<polyline points="8 6 2 12 8 18"></polyline>')
  })

  it('shopping-bag: the pre-redesign trapezoid body (not the 2024 rounded hull)', () => {
    const html = renderToStaticMarkup(<ShoppingBagIcon />)
    expect(html).toContain('class="lucide lucide-shopping-bag"')
    expect(html).toContain('<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"></path>')
    expect(html).toContain('<path d="M3 6h18"></path>')
    expect(html).toContain('<path d="M16 10a4 4 0 0 1-8 0"></path>')
    expect(html).not.toContain('M3.103 6.034')
  })

  it('trending-up: the old polyline encoding', () => {
    const html = renderToStaticMarkup(<TrendingUpIcon />)
    expect(html).toContain('class="lucide lucide-trending-up"')
    expect(html).toContain('<polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline>')
    expect(html).toContain('<polyline points="16 7 22 7 22 13"></polyline>')
  })

  it('trending-down: the old polyline encoding', () => {
    const html = renderToStaticMarkup(<TrendingDownIcon />)
    expect(html).toContain('class="lucide lucide-trending-down"')
    expect(html).toContain('<polyline points="22 17 13.5 8.5 8.5 13.5 2 7"></polyline>')
    expect(html).toContain('<polyline points="16 17 22 17 22 11"></polyline>')
  })

  it('carries consumer className after the lucide names (live class order)', () => {
    const html = renderToStaticMarkup(<BellIcon className="h-4 w-4" />)
    expect(html).toContain('class="lucide lucide-bell h-4 w-4"')
  })
})
