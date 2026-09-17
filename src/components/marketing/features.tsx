import Link from 'next/link'
import { ArrowRight, ChartColumn, Check, Globe, Shield, Users, Zap, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

/** R12-F4: the live's "B2B Company Reveal" glyph — a custom 5-path SVG
 * (rounded-rect tower, two window bars, U-shaped door, merged side
 * annexes) traced verbatim off the live DOM. Verified absent from
 * lucide-react 0.525 and six older versions (all 5,466 exports scanned);
 * drawn with lucide conventions (24 viewBox, stroke 2, round caps/joins)
 * so it renders indistinguishably from the lucide set. */
function CompanyBuildingIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M10 12h4" />
      <path d="M10 8h4" />
      <path d="M14 21v-3a2 2 0 0 0-4 0v3" />
      <path d="M6 10H4a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-2" />
      <path d="M6 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16" />
    </svg>
  )
}

/** R7-V9: the live's six benefit items — copy and icon set extracted from
 * the live DOM (Users / custom building / Globe / ChartColumn / Zap /
 * Shield in bg-secondary boxes). */
const FEATURES = [
  {
    icon: Users,
    title: 'B2C Email Identification',
    text: 'The first tool globally that identifies individual consumers by personal email — not just companies.',
  },
  {
    icon: CompanyBuildingIcon,
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
    <section id="benefits" aria-labelledby="features-heading" className="py-20">
      <div className="container mx-auto px-6">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            {/* R12-F1: the live wraps the kicker + h2 in a classless reveal
                div (its benefits header animates as one unit). */}
            <div data-reveal="16" data-reveal-delay="0">
              {/* R11: the live's kickers are inline spans (a block <p> adds
                  a full line box — the recurring -8px section delta). */}
              <span className="text-xs font-semibold text-primary uppercase tracking-widest">Benefits</span>
              <h2 id="features-heading" className="text-3xl sm:text-4xl font-bold mt-2 mb-10 text-foreground">
                Everything you need to
                <br />
                <span className="text-gradient-hero">unmask your traffic.</span>
              </h2>
            </div>

            {/* R10-F3: the live renders the six benefits as a 2-column grid
                (sm:grid-cols-2 gap-x-6 gap-y-7) of flex-gap-3 rows with
                18px icons — not a single-column space-y-6 list. */}
            <div className="grid sm:grid-cols-2 gap-x-6 gap-y-7">
              {FEATURES.map((feature, i) => (
                <div key={feature.title} data-reveal="16" data-reveal-delay={String((i + 1) * 100)} className="flex gap-3">
                  <span className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center shrink-0" aria-hidden="true">
                    <feature.icon className="w-4.5 h-4.5 text-primary" />
                  </span>
                  <div>
                    <h3 className="font-semibold text-sm text-foreground mb-0.5">{feature.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{feature.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* R10-F3: the live wraps the product screenshot edge-to-edge —
              no padding, shadow-elevated, overflow-hidden. R12-F1: the
              wrapper animates opacity-only (y=0) like the live. */}
          <div data-reveal="0" data-reveal-delay="300" className="relative rounded-xl shadow-elevated overflow-hidden border border-border bg-card" aria-label="Dashboard preview">
            {/* eslint-disable-next-line @next/next/no-img-element -- static marketing asset of our own UI; fixed intrinsic size */}
            <img
              src="/assets/dashboard-visitors.png"
              alt="Pixelco visitors view showing identified companies and individuals"
              width={1184}
              height={700}
              className="w-full"
            />
          </div>
        </div>
      </div>
    </section>
  )
}

export function Comparison() {
  return (
    <section aria-labelledby="comparison-heading" className="py-20 bg-card border-y border-border">
      <div className="container mx-auto px-6">
        <div data-reveal="16" data-reveal-delay="0" className="text-center mb-12">
          <h2 id="comparison-heading" className="text-3xl sm:text-4xl font-bold text-foreground">
            Why Teams Switch to Pixelco
          </h2>
          <p className="text-muted-foreground mt-3 max-w-lg mx-auto">
            Get individual-level identification that competitors simply can&apos;t match.
          </p>
        </div>

        {/* R12-F1: the live reveals the comparison GRID as one wrapper
            (y20), not the individual cards. */}
        <div data-reveal="20" data-reveal-delay="100" className="max-w-4xl mx-auto grid md:grid-cols-2 gap-6">
          <div className="rounded-xl border border-border bg-background p-7">
            <h3 className="font-bold text-foreground mb-1">Traditional IP-Lookup Tools</h3>
            <p className="text-sm text-muted-foreground mb-5">Company-level only</p>
            <ul className="space-y-3">
              {LEGACY_LIMITS.map((item) => (
                <li key={item} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                  <X className="h-4 w-4 text-destructive shrink-0" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border-2 border-primary bg-background p-7 relative shadow-elevated">
            <span className="absolute -top-3 left-6 px-3 py-0.5 rounded-full gradient-cta text-xs font-semibold text-primary-foreground">
              BEST VALUE
            </span>
            <h3 className="font-bold text-foreground mb-1">Pixelco</h3>
            <p className="text-sm text-muted-foreground mb-5">Individual email identification</p>
            <ul className="space-y-3">
              {PIXELCO_WINS.map((item) => (
                <li key={item} className="flex items-center gap-2.5 text-sm font-medium text-foreground">
                  <Check className="h-4 w-4 shrink-0 text-green-600" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
            {/* R11: the live's Compare CTA — gradient-cta on the default
                h-10 size with hover:opacity-90. */}
            <Button
              asChild
              className="w-full mt-6 gradient-cta text-primary-foreground border-0 hover:opacity-90 font-semibold"
            >
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
