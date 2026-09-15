import Link from 'next/link'
import { ArrowRight, Check, Eye, Globe, Mail, MonitorSmartphone, TrendingUp, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

const FEATURES = [
  {
    icon: Mail,
    title: 'B2C Email Identification',
    text: 'The first tool globally that identifies individual consumers by personal email — not just companies.',
  },
  {
    icon: Globe,
    title: 'B2B Company Reveal',
    text: 'See which companies visit your site with firmographic data like industry, size, and location.',
  },
  {
    icon: MonitorSmartphone,
    title: 'Any Website, Any Platform',
    text: 'One JavaScript snippet works on HTML, WordPress, Shopify, Webflow, React, and more.',
  },
  {
    icon: TrendingUp,
    title: 'Real-Time Dashboard',
    text: 'Track pageviews, visitor trends, and identification rates as they happen — no batch delays.',
  },
  {
    icon: Eye,
    title: 'Cookieless Technology',
    text: '100% cookieless identification. No consent banners required. Future-proof against third-party cookie deprecation.',
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
            Everything you need to{' '}
            <span className="bg-primary px-2 [box-decoration-break:clone]">unmask your traffic.</span>
          </h2>

          <ul className="mt-8 space-y-6">
            {FEATURES.map((feature) => (
              <li key={feature.title} className="flex gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/15" aria-hidden="true">
                  <feature.icon className="h-5 w-5 text-amber-600" />
                </span>
                <div>
                  <h3 className="text-base font-bold text-foreground">{feature.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{feature.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Dashboard preview mockup — mirrors the real product UI. */}
        <div className="rounded-xl border border-border bg-card p-4 shadow-xl shadow-black/5 sm:p-5" aria-label="Dashboard preview">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-foreground">Overview</p>
            <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              Last 14 days
            </span>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            {[
              { label: 'Total visitors', value: '2,847' },
              { label: 'Emails identified', value: '569' },
              { label: 'Match rate', value: '20.0%' },
              { label: 'New this week', value: '412' },
            ].map((kpi) => (
              <div key={kpi.label} className="rounded-lg border border-border/70 bg-background p-3">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                  {kpi.label}
                </p>
                <p className="mt-1 text-xl font-extrabold tabular-nums text-foreground">{kpi.value}</p>
              </div>
            ))}
          </div>

          {/* Stylised trend bars. */}
          <div className="mt-4 flex h-24 items-end gap-1.5 rounded-lg border border-border/70 bg-background p-3" aria-hidden="true">
            {[24, 38, 30, 52, 44, 66, 58, 80, 72, 95, 88, 100, 92, 78].map((height, i) => (
              <div key={i} className="flex-1 rounded-sm bg-gradient-to-t from-amber-400 to-amber-300" style={{ height: `${height}%` }} />
            ))}
          </div>

          <div className="mt-4 space-y-2">
            {[
              { email: 'lucas.meyer@gmail.com', page: '/pricing', confidence: '92%' },
              { email: 'a.johnson@everpeak.com', page: '/features', confidence: '87%' },
              { email: 'nina.patel@outlook.com', page: '/', confidence: '81%' },
            ].map((row) => (
              <div key={row.email} className="flex items-center justify-between gap-2 rounded-lg border border-border/70 bg-background px-3 py-2">
                <div className="min-w-0">
                  <p className="truncate text-xs font-medium text-foreground">{row.email}</p>
                  <p className="text-[10px] text-muted-foreground">{row.page}</p>
                </div>
                <span className="shrink-0 text-xs font-bold tabular-nums text-teal-600">{row.confidence}</span>
              </div>
            ))}
          </div>
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
