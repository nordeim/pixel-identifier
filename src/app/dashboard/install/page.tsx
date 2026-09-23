import type { Metadata } from 'next'
import Link from 'next/link'
import { headers } from 'next/headers'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { requireUser } from '@/lib/analytics'
import { db } from '@/lib/db'
import { collectorUrlFromHeaders } from '@/lib/snippet'
import { InstallPanels } from '@/components/dashboard/install-panels'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export const metadata: Metadata = {
  title: 'Install Your Pixel',
}

export const dynamic = 'force-dynamic'

export default async function InstallPage() {
  const user = await requireUser(await getServerSession(authOptions))

  // R30-F3: the live's site selection is PURE CLIENT STATE — the URL
  // never carries a site query param (runtime-captured on the live,
  // 15th probe generation). Next ignores undeclared query params, so a
  // stale bookmarked site link harmlessly renders the default page.

  // R30-F4: the live lists sites NEWEST-FIRST (a freshly added domain
  // lands first in the switcher AND is the default selection — two
  // live add/remove cycles proved the order). The domains page already
  // sorts desc via listDomainsAction; the install page now matches.
  const sites = await db.site.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    select: { siteKey: true, domain: true, lastEventAt: true, status: true },
  })

  const headerList = await headers()
  const host = headerList.get('x-forwarded-host') ?? headerList.get('host') ?? 'localhost:3000'
  const proto = headerList.get('x-forwarded-proto')
  const collectorUrl = collectorUrlFromHeaders(host, proto)

  // R22-F7: the live's zero-sites interstitial (bundle component pxe):
  // the normal page header + a centered card directing to domains — not
  // a custom guidance card. The placeholder key fallback never ships.
  if (sites.length === 0) {
    return (
      <div className="max-w-3xl space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold">Install Your Pixel</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Add a domain first to get your tracking snippet.
          </p>
        </div>
        <Card>
          <CardContent className="pt-6 text-center py-12">
            <p className="text-sm text-muted-foreground mb-4">
              You need to register a domain before installing the pixel.
            </p>
            <Button
              asChild
              variant={null}
              size={null}
              className="gradient-primary text-primary-foreground shadow-lg glow-primary hover:opacity-90 transition-all duration-300 font-semibold h-10 px-4 py-2"
            >
              <Link href="/dashboard/domains">Add a Domain</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // R30-F3: every site-dependent panel (header + switcher, Quick Start,
  // platform tabs, Site Key) renders inside the client island owning the
  // selection state — the URL stays /dashboard/install on every swap.
  return <InstallPanels sites={sites} collectorUrl={collectorUrl} />
}
