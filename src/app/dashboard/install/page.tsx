import type { Metadata } from 'next'
import Link from 'next/link'
import { headers } from 'next/headers'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { CheckCircle2, Globe, Timer } from 'lucide-react'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { buildSnippet, collectorUrlFromHeaders } from '@/lib/snippet'
import { CopyButton } from '@/components/dashboard/copy-button'
import { PlatformInstructions } from '@/components/dashboard/platform-instructions'
import { Button } from '@/components/ui/button'
import { relativeTime } from '@/lib/format'

export const metadata: Metadata = {
  title: 'Install Your Pixel',
}

export const dynamic = 'force-dynamic'

export default async function InstallPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/login')

  const site = await db.site.findFirst({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'asc' },
    select: { siteKey: true, domain: true, lastEventAt: true, status: true },
  })

  const headerList = await headers()
  const host = headerList.get('x-forwarded-host') ?? headerList.get('host') ?? 'localhost:3000'
  const proto = headerList.get('x-forwarded-proto')
  const collectorUrl = collectorUrlFromHeaders(host, proto)

  // No domain yet: guide the user to register one first.
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
      <section className="rounded-xl border border-border bg-card shadow-sm" aria-labelledby="quickstart-heading">
        <div className="border-b border-border p-5">
          <h2 id="quickstart-heading" className="flex items-center gap-2 text-base font-bold text-foreground">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 text-sm" aria-hidden="true">
              ⚡
            </span>
            Quick Start
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Copy and paste this snippet before the closing <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">&lt;/head&gt;</code> tag on{' '}
            <span className="font-medium text-foreground">{site.domain}</span>.
          </p>
        </div>

        <div className="p-5">
          <div className="relative rounded-lg border border-border bg-stone-950">
            <div className="absolute right-2.5 top-2.5">
              <CopyButton text={snippet} className="border-stone-700 bg-stone-900 text-stone-300 hover:bg-stone-800 hover:text-stone-100" />
            </div>
            <pre className="overflow-x-auto p-4 text-xs leading-relaxed text-stone-200">
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
                Paste the snippet on your site and visit a page. This status will
                update automatically once we receive data.
              </span>
            </p>
          )}
        </div>
      </section>

      <PlatformInstructions />
    </div>
  )
}
