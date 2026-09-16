import Link from 'next/link'
import { ArrowRight, Building2, ChartColumn, Check, Globe, Shield, Users, Zap, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

/** R7-V9: the live's six benefit items — copy and icon set extracted from
 * the live DOM (Users / Building2 / Globe / ChartColumn / Zap / Shield in
 * bg-secondary boxes). */
const FEATURES = [
  {
    icon: Users,
    title: 'B2C Email Identification',
    text: 'The first tool globally that identifies individual consumers by personal email — not just companies.',
  },
  {
    icon: Building2,
    title: 'B2B Company Reveal',
    text: 'See which companies visit your site with firmographic data like industry, size, and location.',
  },
  {
    icon: Globe,
    title: 'Any Website, Any Platform',
    text: 'One JavaScript snippet works on HTML, WordPress, Shopify, Webflow, React, and more.',
  },
  {
    icon: ChartColumn,
    title: 'Real-Time Dashboard',
    text: 'Track pageviews, visitor trends, identification rates, and top pages in a beautiful live dashboard.',
  },
  {
    icon: Zap,
    title: 'Instant Integrations',
    text: 'Push leads to HubSpot, Salesforce, Zapier, or webhooks. Export CSV anytime.',
  },
  {
    icon: Shield,
    title: 'Privacy Compliant',
    text: 'Built with GDPR and CCPA in mind. Only identifies publicly matchable data. No cookies used.',
  },
]

const LEGACY_LIMITS = [
  'Only identifies companies',
  'No individual emails',
  'B2B only — zero B2C',
  'Requires expensive plans',
  'Low match rates (<5%)',
]

const PIXELCO_WINS = [
  'Identifies individuals by email',
  'B2B + B2C identification',
  '20% average match rate',
  'Free plan to start',
  '30-second setup',
]

export function Features() {
  return (
    <section aria-labelledby="features-heading" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-20">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-amber-600">Benefits</p>
          <h2 id="features-heading" className="mt-2 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Everything you need to
            <br />
            <span className="text-gradient-hero">unmask your traffic.</span>
          </h2>

          <ul className="mt-8 space-y-6">
            {FEATURES.map((feature) => (
              <li key={feature.title} className="flex gap-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary" aria-hidden="true">
                  <feature.icon className="h-5 w-5 text-primary" />
                </span>
                <div>
                  <h3 className="text-base font-bold text-foreground">{feature.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{feature.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* R7-V10: the live ships a real product screenshot here (its own
            visitors view); this is a screenshot of this build's visitors
            page with seeded data. */}
        <div className="rounded-xl border border-border bg-card p-4 shadow-xl shadow-black/5 sm:p-5" aria-label="Dashboard preview">
          {/* eslint-disable-next-line @next/next/no-img-element -- static marketing asset of our own UI; fixed intrinsic size */}
          <img
            src="/assets/dashboard-visitors.png"
            alt="Pixelco visitors view showing identified companies and individuals"
            width={1184}
            height={700}
            className="h-auto w-full rounded-lg"
          />
        </div>
      </div>
    </section>
  )
}

export function Comparison() {
  return (
    <section aria-labelledby="comparison-heading" className="border-y border-border/60 bg-card/50 py-16 lg:py-20">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="text-center">
          <h2 id="comparison-heading" className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Why Teams Switch to Pixelco
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Get individual-level identification that competitors simply can&apos;t match.
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Traditional IP-Lookup Tools
            </p>
            <p className="mt-1 text-xs text-muted-foreground">Company-level only</p>
            <ul className="mt-5 space-y-3">
              {LEGACY_LIMITS.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                  <X className="mt-0.5 h-4 w-4 shrink-0 text-red-500" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="relative rounded-xl border-2 border-primary bg-primary/5 p-6 shadow-lg shadow-primary/10">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-0.5 text-[10px] font-extrabold uppercase tracking-widest text-primary-foreground">
              Best value
            </span>
            <p className="text-sm font-bold uppercase tracking-wide text-foreground">Pixelco</p>
            <p className="mt-1 text-xs text-muted-foreground">Individual-level identification</p>
            <ul className="mt-5 space-y-3">
              {PIXELCO_WINS.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm font-medium text-foreground">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-600" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
            <Button asChild className="mt-6 w-full font-semibold">
              <Link href="/signup">
                Start Free
                <ArrowRight className="ml-1 h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
