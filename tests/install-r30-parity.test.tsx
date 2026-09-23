import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

/**
 * R30-F3/F4 pins — the install page's DOMAIN SELECTION MODEL,
 * runtime-diffed against the live (15th probe generation; evidence:
 * docs/plans/2026-09-23-round30-sidebar-wrapper-install-parity.md).
 *
 * F3 — the live's switcher is PURE CLIENT STATE: selecting a domain swaps
 * the trigger text and the snippet's site key while the URL stays
 * `/dashboard/install` (no query param). The clone shipped a URL-driven
 `?site=` round trip — the address bar leaked a param the live never
 * renders. Fix: the selection lives in a client island; the page keeps the
 * zero-domains interstitial + How It Works server-side.
 *
 * F4 — the live lists sites NEWEST-FIRST: a freshly added domain lands
 * first in the switcher options AND is the default selection. The clone's
 * install query shipped `createdAt: 'asc'` (oldest first). The domains page
 * already sorts desc (listDomainsAction) — the install page now matches.
 *
 * What STAYS (documented, not drift):
 *   - the site-key regex defense in buildSnippet (it bounded this round's
 *     own malformed-key probe to the error boundary);
 *   - the R22 zero-domains interstitial branch + strings;
 *   - the `sites.length > 1` switcher gate (bundle i.length>1).
 */

const src = (rel: string) =>
  readFileSync(join(process.cwd(), rel), 'utf-8')

const exists = (rel: string) => {
  try {
    src(rel)
    return true
  } catch {
    return false
  }
}

describe('R30-F3 — the install selection is client state, not URL state', () => {
  it('the page reads no searchParams (?site= retired)', () => {
    const page = src('src/app/dashboard/install/page.tsx')
    expect(page).not.toContain('searchParams')
    expect(page).not.toContain('params.site')
  })

  it('no source file pushes a ?site= query param', () => {
    const offenders = [
      'src/app/dashboard/install/page.tsx',
      'src/components/dashboard/install-panels.tsx',
      'src/components/dashboard/domain-switcher.tsx',
    ]
    for (const f of offenders) {
      if (!exists(f)) continue
      expect(src(f)).not.toContain('?site=')
      expect(src(f)).not.toContain('router.push')
    }
  })

  it('pickSelectedSite retires with the URL param (no source consumers)', () => {
    expect(src('src/app/dashboard/install/page.tsx')).not.toContain('pickSelectedSite')
    // the helper's own module is gone (its only consumer was this page)
    expect(exists('src/lib/sites.ts')).toBe(false)
  })

  it('the selection island is a client component owning useState', () => {
    const island = src('src/components/dashboard/install-panels.tsx')
    expect(island).toContain("'use client'")
    expect(island).toMatch(/useState/)
    // the snippet builder runs client-side (pure function, R21 vm-tested)
    expect(island).toContain('buildSnippet')
  })

  it('the platform instructions ride the same selected key', () => {
    const island = src('src/components/dashboard/install-panels.tsx')
    expect(island).toContain('PlatformInstructions')
  })
})

describe('R30-F4 — newest-first site order on the install page', () => {
  it('the install query sorts createdAt desc (the live\'s order)', () => {
    const page = src('src/app/dashboard/install/page.tsx')
    expect(page).toMatch(/orderBy:\s*\{\s*createdAt:\s*'desc'\s*\}/)
    expect(page).not.toMatch(/createdAt:\s*'asc'/)
  })

  it('the domains page keeps its desc order (already live-parity)', () => {
    const action = src('src/actions/domains.ts')
    expect(action).toMatch(/orderBy:\s*\{\s*createdAt:\s*'desc'\s*\}/)
  })
})

describe('R30-F3 — the R22 interstitial survives the refactor', () => {
  it('the zero-domains branch + strings stay', () => {
    const page = src('src/app/dashboard/install/page.tsx')
    expect(page).toContain('Add a domain first to get your tracking snippet.')
    expect(page).toContain('You need to register a domain before installing the pixel.')
  })

  it('the switcher still renders only when sites.length > 1', () => {
    const island = src('src/components/dashboard/install-panels.tsx')
    expect(island).toMatch(/sites\.length > 1/)
  })
})
