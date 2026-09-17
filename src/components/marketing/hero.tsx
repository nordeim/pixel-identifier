import Link from 'next/link'
import { ArrowRight, ChartColumn, CircleCheckBig, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LiveFeedMockup } from '@/components/marketing/live-feed'

/** R10-F2: trust points extracted verbatim from the live DOM — pill chips
 * (bg-card, border, rounded-lg) with lucide icons (CircleCheckBig /
 * ChartColumn on text-primary, Zap on text-highlight) and the metric wrapped
 * in a bare <strong class="text-foreground">. */
const TRUST_POINTS = [
  {
    icon: CircleCheckBig,
    before: '',
    strong: '1,200+',
    after: ' websites using Pixelco',
    iconCls: 'text-primary',
  },
  {
    icon: ChartColumn,
    before: 'Avg match rate: ',
    strong: '20%',
    after: '',
    iconCls: 'text-primary',
  },
  {
    icon: Zap,
    before: 'Setup in ',
    strong: '2 minutes',
    after: '',
    iconCls: 'text-highlight',
  },
]

/** R10-F2: rebuilt to the live hero DOM verbatim — full-bleed section +
 * `container mx-auto px-6` inner + `max-w-xl` text column; card-chip badge
 * (stars + divider + accent-dot label), h1 at font-bold/3.5rem/leading-1.1
 * with the em-dash inside the italic gradient span, gradient-cta primary
 * CTA and a plain-text secondary, and the takes-line in text-xs with the
 * live's "·" separators. The old radial-gradient decoration is gone (the
 * live ships none). */
export function Hero() {
  return (
    <section className="pt-16 pb-20 overflow-hidden" aria-labelledby="hero-heading">
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-card border border-border mb-6">
              <span className="flex items-center gap-1 text-xs font-semibold text-highlight" aria-hidden="true">
                ★★★★★
              </span>
              <span className="w-px h-3 bg-border" aria-hidden="true" />
              <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-accent" aria-hidden="true" />
                {"WORLD'S FIRST B2C EMAIL IDENTIFICATION"}
              </span>
            </div>
            <h1
              id="hero-heading"
              className="text-4xl sm:text-5xl lg:text-[3.5rem] font-bold tracking-tight leading-[1.1] mb-5"
            >
              Identify Anonymous Website Visitors <span className="text-gradient-hero italic">— By Their Email</span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed mb-8">
              One pixel snippet reveals who&apos;s browsing your site. B2B companies <em>and</em> individual
              consumers — identified by their real email address. No forms. No popups. No cookies.
            </p>

            <div className="mb-8 flex flex-wrap gap-3">
              {TRUST_POINTS.map((point) => (
                <div
                  key={point.strong}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-card border border-border text-sm"
                >
                  <point.icon className={`h-4 w-4 ${point.iconCls}`} aria-hidden="true" />
                  <span className="text-muted-foreground">
                    {point.before}
                    <strong className="text-foreground">{point.strong}</strong>
                    {point.after}
                  </span>
                </div>
              ))}
            </div>

            {/* R7-V5/R10: 5 photo avatars overlapping, then the stacked
                (flex-col) stars + "Trusted by" block — directly after the
                pills with no extra top margin. */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex -space-x-2.5 shrink-0" aria-hidden="true">
                {[1, 2, 3, 4, 5].map((n) => (
                  // eslint-disable-next-line @next/next/no-img-element -- decorative 96px JPEGs; next/image adds nothing at 32px display
                  <img
                    key={n}
                    src={`/assets/avatars/avatar-${n}.jpg`}
                    alt="Customer"
                    width={32}
                    height={32}
                    className="h-8 w-8 rounded-full border-2 border-background object-cover"
                  />
                ))}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-primary text-sm" aria-hidden="true">
                  ★★★★★
                </span>
                <span className="text-sm text-muted-foreground">
                  Trusted by <strong className="text-foreground">1,200+</strong> businesses worldwide
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <Button
                asChild
                className="gradient-cta border-0 px-7 h-12 text-base font-semibold text-primary-foreground hover:opacity-90 w-full sm:w-auto"
              >
                <Link href="/signup">
                  Start Identifying Visitors
                  <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="w-full border-border bg-background px-7 text-base font-medium hover:bg-card sm:w-auto h-12"
              >
                {/* R11: the live's demo CTA goes to the app (which serves
                    login when signed out) — not a local anchor. */}
                <Link href="/login">See Live Demo</Link>
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Takes less than 2 minutes · Free plan available · No credit card required
            </p>
          </div>

          <div className="relative lg:pl-4" aria-label="Live demo of the visitor feed">
            <LiveFeedMockup />
          </div>
        </div>
      </div>
    </section>
  )
}
