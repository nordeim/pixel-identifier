'use client'

import { useState } from 'react'
import { CircleAlert, CircleCheck, Zap } from 'lucide-react'
import { buildSnippet } from '@/lib/snippet'
import { CopyButton } from '@/components/dashboard/copy-button'
import { DomainSwitcher } from '@/components/dashboard/domain-switcher'
import { PlatformInstructions } from '@/components/dashboard/platform-instructions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

/**
 * Install-page client island (R30-F3). The live's site selection is PURE
 * CLIENT STATE: selecting a domain swaps the trigger text and the snippet's
 * site key while the URL stays /dashboard/install (runtime-captured on the
 * live, 15th probe generation). Every site-dependent panel renders in here,
 * under one useState — no navigation, no query param, no URL round trip.
 *
 * R30-F4: sites arrive NEWEST-FIRST (the page query sorts createdAt desc —
 * the live's order), so sites[0] IS the live's default selection (the
 * newest domain).
 */

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

export interface InstallSite {
  siteKey: string
  domain: string
  lastEventAt: Date | null
  status: string
}

export function InstallPanels({
  sites,
  collectorUrl,
}: {
  sites: InstallSite[]
  collectorUrl: string
}) {
  // The newest site is the default selection (R30-F4: the live selects the
  // newest — sites arrive desc). The find-fallback mirrors the retired
  // pickSelectedSite's defense: a stale key (site deleted server-side)
  // harmlessly falls back to the newest rather than crashing the island.
  const [activeSiteKey, setActiveSiteKey] = useState(sites[0].siteKey)
  const site = sites.find((s) => s.siteKey === activeSiteKey) ?? sites[0]

  // buildSnippet is a pure function (R21 vm-tested) — it runs client-side
  // on every selection swap, exactly like the live's snippet rebuild.
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
        {sites.length > 1 && (
          <DomainSwitcher
            domains={sites}
            activeSiteKey={site.siteKey}
            onSiteChange={setActiveSiteKey}
          />
        )}
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

      {/* R24 F2: the live's platform tabs build their per-tab snippet
          pres from the SAME site key + collector URL as the Quick Start. */}
      <PlatformInstructions siteKey={site.siteKey} collectorUrl={collectorUrl} />

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
