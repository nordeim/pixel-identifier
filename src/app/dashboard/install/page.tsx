import type { Metadata } from 'next'
import Link from 'next/link'
import { headers } from 'next/headers'
import { getServerSession } from 'next-auth'
import { CircleAlert, CircleCheck, Globe, Zap } from 'lucide-react'
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

  // No domain yet: guide the user to register one first.
  const site = pickSelectedSite(sites, siteParam ?? null)
  if (!site) {
    return (
      <div className="mx-auto max-w-lg rounded-lg border border-border bg-card p-8 text-center shadow-sm">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/15" aria-hidden="true">
          <Globe className="h-6 w-6 text-amber-600" />
        </span>
        <h2 className="mt-4 text-lg font-bold text-foreground">Add a domain first</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Your pixel snippet is generated per domain. Register the website you
          want to track, then come back here to install the snippet.
        </p>
        <Button asChild className="mt-6 font-semibold">
          <Link href="/dashboard/domains">Go to Domains</Link>
        </Button>
      </div>
    )
  }

  const snippet = buildSnippet(site.siteKey, collectorUrl)
  const receiving = site.lastEventAt !== null

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Page header + domain switcher, mirroring the live install page. */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Install Your Pixel</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            One snippet in your <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">&lt;head&gt;</code> tag — works on every page automatically.
          </p>
        </div>
        <DomainSwitcher domains={sites} activeSiteKey={site.siteKey} />
      </div>

      {/* Quick Start */}
      <Card className="border-primary/20">
        <CardHeader>
          <div className="flex items-center gap-3">
            <span
              className="flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold text-primary-foreground gradient-primary"
              aria-hidden="true"
            >
              <Zap className="h-4 w-4" />
            </span>
            <div>
              <CardTitle className="font-display text-lg font-semibold tracking-tight text-foreground">
                Quick Start
              </CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                Copy and paste this snippet before the closing{' '}
                <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">&lt;/head&gt;</code>{' '}
                tag on your website.
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <pre className="overflow-x-auto rounded-lg border border-border bg-foreground/5 p-4 font-mono text-sm leading-relaxed text-foreground">
              <code>{snippet}</code>
            </pre>
            <CopyButton text={snippet} className="absolute right-3 top-3 h-9" />
          </div>

          {receiving ? (
            <div className="mt-4 rounded-lg border border-neon-green/20 bg-neon-green/10 p-3">
              <div className="flex gap-2">
                <CircleCheck className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                <div className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">Pixel verified!</span>{' '}
                  We&apos;re receiving data from{' '}
                  <span className="font-medium text-foreground">{site.domain}</span>. Everything is
                  working.
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-4 rounded-lg border border-neon-green/20 bg-neon-green/5 p-3">
              <div className="flex gap-2">
                <CircleCheck className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
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
            <span
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted"
              aria-hidden="true"
            >
              <CircleAlert className="h-4 w-4 text-muted-foreground" />
            </span>
            <div>
              <CardTitle className="font-display text-lg font-semibold tracking-tight text-foreground">
                How It Works
              </CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                What happens after you install the pixel.
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            {HOW_IT_WORKS.map((feature) => (
              <div key={feature.title} className="rounded-lg border border-border bg-muted/10 p-4">
                <p className="mb-1 text-sm font-medium text-foreground">{feature.title}</p>
                <p className="text-xs leading-relaxed text-muted-foreground">{feature.text}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Site Key */}
      <Card className="border-primary/20">
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Site Key</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Your unique identifier for{' '}
                <span className="font-medium text-foreground">{site.domain}</span>
              </p>
            </div>
            <code className="rounded-md bg-foreground/5 px-3 py-1.5 font-mono text-sm text-foreground">
              {site.siteKey}
            </code>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
