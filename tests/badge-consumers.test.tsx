import { describe, expect, it, vi } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { renderToStaticMarkup } from 'react-dom/server'
import { VisitorsTable } from '@/components/dashboard/visitors-table'
import { DomainsPanel } from '@/components/dashboard/domains-panel'

/**
 * R11-F6/F7 regression test: badge consumers + install banners.
 *
 * Live badge ground truth (research/round11-audit/live-ground-truth.md §5):
 *   visitors segment/source/status badges: px-2, keeping the VARIANT hover
 *   (hover:bg-secondary/80) — no custom hover overrides;
 *   domains Verified: DEFAULT variant + gradient-primary text-primary-
 *   foreground border-0; Pending: plain secondary variant;
 *   install verified banner: bg-neon-green/10 border-neon-green/30
 *   (the clone shipped /20); waiting banner matches with the live's
 *   class order.
 */

vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
  usePathname: () => '/dashboard/visitors',
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}))

vi.mock('next-auth/react', () => ({ signOut: vi.fn() }))

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

const domainsHtml = renderToStaticMarkup(
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

describe('visitors badges (R11-F7)', () => {
  it('renders the source badge at px-2 keeping the variant hover', () => {
    // Direct (individual) row: secondary variant + neon tint + px-2.
    expect(visitorsHtml).toContain(
      'border-neon-green/20 bg-neon-green/10 px-2 py-0 text-[10px] text-neon-green',
    )
    expect(visitorsHtml).not.toContain('hover:bg-neon-green/10')
  })

  it('renders the company segment badge at px-2 with the amber tint', () => {
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
    expect(companyHtml).toContain(
      'border-amber-500/20 bg-amber-500/10 px-2 py-0 text-[10px] text-amber-600',
    )
    expect(companyHtml).toContain('Company')
  })

  it('renders the inactive status badge as the plain secondary variant at px-2', () => {
    expect(visitorsHtml).toContain(
      'border-transparent bg-secondary hover:bg-secondary/80 text-[10px] px-2 py-0',
    )
    expect(visitorsHtml).not.toContain('hover:bg-secondary"')
    expect(visitorsHtml).toContain('>inactive</div>')
  })
})

describe('domains badges (R11-F7)', () => {
  it('renders Verified on the default variant with the live overrides', () => {
    // The variant's text-primary-foreground collapses under the trailing
    // text-primary-foreground (twMerge) — the live DOM string matches.
    expect(domainsHtml).toContain(
      'border-transparent bg-primary hover:bg-primary/80 text-[10px] px-1.5 py-0 gradient-primary text-primary-foreground border-0',
    )
    expect(domainsHtml).toContain('h-2.5 w-2.5 mr-0.5')
  })

  it('renders Pending as the plain secondary variant', () => {
    expect(domainsHtml).toContain(
      'border-transparent bg-secondary hover:bg-secondary/80 text-[10px] px-1.5 py-0',
    )
  })
})

describe('install banners (R11-F6)', () => {
  const page = readFileSync(
    join(process.cwd(), 'src/app/dashboard/install/page.tsx'),
    'utf8',
  )

  it('renders the verified banner with the live /30 border', () => {
    expect(page).toContain('bg-neon-green/10 border-neon-green/30')
  })

  it('renders the waiting banner in the live class order', () => {
    expect(page).toContain(
      'mt-4 p-3 bg-neon-green/5 border-neon-green/20 border rounded-lg',
    )
  })
})
