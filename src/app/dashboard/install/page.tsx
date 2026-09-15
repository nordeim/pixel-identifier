import type { Metadata } from 'next'
import Link from 'next/link'
import { headers } from 'next/headers'
import { getServerSession } from 'next-auth'
import { CheckCircle2, Globe, Timer, Zap } from 'lucide-react'
import { authOptions } from '@/lib/auth'
import { requireUser } from '@/lib/analytics'
import { db } from '@/lib/db'
import { buildSnippet, collectorUrlFromHeaders } from '@/lib/snippet'
import { pickSelectedSite } from '@/lib/sites'
import { CopyButton } from '@/components/dashboard/copy-button'
import { DomainSwitcher } from '@/components/dashboard/domain-switcher'
import { PlatformInstructions } from '@/components/dashboard/platform-instructions'
import { Button } from '@/components/ui/button'
import { relativeTime } from '@/lib/format'

export const metadata: Metadata = {
  title: 'Install Your Pixel',
}

export const dynamic = 'force-dynamic'

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
      <div className="mx-auto max-w-lg rounded-xl border border-border bg-card p-8 text-center shadow-sm">
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
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Page header + domain switcher, mirroring the live install page. */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Install Your Pixel</h1>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            One snippet in your <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">&lt;head&gt;</code> tag — works on every page automatically.
          </p>
        </div>
        {sites.length > 1 && (
          <DomainSwitcher domains={sites} activeSiteKey={site.siteKey} />
        )}
      </div>

      <section className="rounded-xl border border-border bg-card shadow-sm" aria-labelledby="quickstart-heading">
        <div className="border-b border-border p-5">
          <h2 id="quickstart-heading" className="flex items-center gap-2 text-base font-bold text-foreground">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15" aria-hidden="true">
              <Zap className="h-5 w-5 text-amber-600" />
            </span>
            Quick Start
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Copy and paste this snippet before the closing <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">&lt;/head&gt;</code> tag on{' '}
            <span className="font-medium text-foreground">{site.domain}</span>.
          </p>
        </div>

        <div className="p-5">
          <div className="relative rounded-lg border border-border bg-[#F8F9FA]">
            <div className="absolute right-2.5 top-2.5">
              <CopyButton text={snippet} className="bg-card" />
            </div>
            <pre className="overflow-x-auto p-4 pr-24 text-xs leading-relaxed text-foreground">
              <code>{snippet}</code>
            </pre>
          </div>

          {receiving ? (
            <p className="mt-4 flex items-start gap-2.5 rounded-lg bg-teal-50 px-3.5 py-3 text-sm text-teal-800">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              Receiving data — last event {relativeTime(site.lastEventAt as Date)}.
              Identifications will appear in your dashboard within seconds of a visit.
            </p>
          ) : (
            <p className="mt-4 flex items-start gap-2.5 rounded-lg bg-sky-50 px-3.5 py-3 text-sm text-sky-800">
              <Timer className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <span>
                <strong className="font-semibold">Waiting for first event…</strong>{' '}
                Paste the snippet on your site and visit a page. Refresh this page
                to see the latest status.
              </span>
            </p>
          )}
        </div>
      </section>

      <PlatformInstructions />
    </div>
  )
}
