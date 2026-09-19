import type { Metadata } from 'next'
import Link from 'next/link'
import { headers } from 'next/headers'
import { getServerSession } from 'next-auth'
import { CircleAlert, CircleCheck, Zap } from 'lucide-react'
import { authOptions } from '@/lib/auth'
import { requireUser } from '@/lib/analytics'
import { db } from '@/lib/db'
import { buildSnippet, collectorUrlFromHeaders } from '@/lib/snippet'
import { pickSelectedSite } from '@/lib/sites'
import { CopyButton } from '@/components/dashboard/copy-button'
import { DomainSwitcher } from '@/components/dashboard/domain-switcher'
import { PlatformInstructions } from '@/components/dashboard/platform-instructions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const metadata: Metadata = {
  title: 'Install Your Pixel',
}

export const dynamic = 'force-dynamic'

/** How It Works feature boxes — copy extracted verbatim from the live app. */
const HOW_IT_WORKS = [
  {
    title: 'Automatic Email Detection',
    text: "The pixel monitors all email input fields (type=email, name/id containing 'email') and form submissions. No code changes needed.",
  },
  {
    title: 'Cross-Site Identification',
    text: "Once a visitor enters their email on any site in the network, they're identified everywhere — automatically, without entering their email again.",
  },
  {
    title: 'SPA Support',
    text: 'Full single-page app support. The pixel tracks navigation via History API and popstate events — works with React, Vue, Angular, etc.',
  },
  {
    title: 'Async & Lightweight',
    text: "The pixel loads asynchronously and won't block page rendering. Typical load time is under 100ms.",
  },
]

interface InstallPageProps {
  searchParams: Promise<{ site?: string | string[] }>
}

export default async function InstallPage({ searchParams }: InstallPageProps) {
  const user = await requireUser(await getServerSession(authOptions))

  const params = await searchParams
  const siteParam = Array.isArray(params.site) ? params.site[0] : params.site

  const sites = await db.site.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'asc' },
    select: { siteKey: true, domain: true, lastEventAt: true, status: true },
  })

  const headerList = await headers()
  const host = headerList.get('x-forwarded-host') ?? headerList.get('host') ?? 'localhost:3000'
  const proto = headerList.get('x-forwarded-proto')
  const collectorUrl = collectorUrlFromHeaders(host, proto)

  // R22-F7: the live's zero-sites interstitial (bundle component pxe):
  // the normal page header + a centered card directing to domains — not
  // a custom guidance card. The placeholder key fallback never ships.
  const site = pickSelectedSite(sites, siteParam ?? null)
  if (!site) {
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

  const snippet = buildSnippet(site.siteKey, collectorUrl)
  const receiving = site.lastEventAt !== null

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Page header + domain switcher, mirroring the live install page. */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Install Your Pixel</h1>
          <p className="text-muted-foreground text-sm mt-1">
            One snippet in your <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">&lt;head&gt;</code> tag — works on every page automatically.
          </p>
        </div>
        {/* R22-F7: the live renders the domain switcher ONLY when the
            account has multiple sites (bundle: i.length>1). */}
        {sites.length > 1 && <DomainSwitcher domains={sites} activeSiteKey={site.siteKey} />}
      </div>

      {/* Quick Start */}
      <Card className="border-primary/20">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center text-sm font-bold text-primary-foreground">
              <Zap className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-lg">
                Quick Start
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Copy and paste this snippet before the closing{' '}
                <code className="text-xs bg-muted px-1 py-0.5 rounded font-mono">&lt;/head&gt;</code>{' '}
                tag on your website.
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative">
            {/* R16: the live's pre order, no text-foreground. */}
            <pre className="bg-foreground/5 border border-border rounded-lg p-4 text-sm font-mono overflow-x-auto leading-relaxed">
              <code>{snippet}</code>
            </pre>
            <CopyButton text={snippet} className="absolute top-3 right-3" />
          </div>

          {receiving ? (
            /* R11: live banners — verified bg-neon-green/10 border-/30. */
            <div className="mt-4 p-3 bg-neon-green/10 border-neon-green/30 border rounded-lg">
              <div className="flex gap-2">
                <CircleCheck className="h-4 w-4 shrink-0 mt-0.5 text-muted-foreground" aria-hidden="true" />
                <div className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">Pixel verified!</span>{' '}
                  We&apos;re receiving data from{' '}
                  <span className="font-medium text-foreground">{site.domain}</span>. Everything is
                  working.
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-4 p-3 bg-neon-green/5 border-neon-green/20 border rounded-lg">
              <div className="flex gap-2">
                <CircleCheck className="h-4 w-4 shrink-0 mt-0.5 text-muted-foreground" aria-hidden="true" />
                <div className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">Waiting for first event...</span>{' '}
                  Paste the snippet on your site and visit a page. This status will update
                  automatically once we receive data.
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <PlatformInstructions />

      {/* How It Works */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            {/* R17-F3: the live's chip — bare geometry-first div. */}
            <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center">
              <CircleAlert className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <CardTitle className="text-lg">
                How It Works
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                What happens after you install the pixel.
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 gap-4">
            {HOW_IT_WORKS.map((feature) => (
              <div key={feature.title} className="p-4 rounded-lg border border-border bg-muted/10">
                <p className="text-sm font-medium mb-1">{feature.title}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{feature.text}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Site Key */}
      <Card className="border-primary/20">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Site Key</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Your unique identifier for{' '}
                <span className="font-medium text-foreground">{site.domain}</span>
              </p>
            </div>
            <code className="bg-foreground/5 px-3 py-1.5 rounded-md text-sm font-mono">
              {site.siteKey}
            </code>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
