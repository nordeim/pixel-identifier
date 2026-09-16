import Link from 'next/link'
import { ArrowRight, ChartColumn, CircleCheckBig, PlayCircle, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LiveFeedMockup } from '@/components/marketing/live-feed'

/** R7-V6: the live renders the hero trust points as pill badges with
 * lucide icons (CircleCheckBig / ChartColumn / Zap on --color-highlight)
 * and the metric wrapped in <strong>. */
const TRUST_POINTS = [
  { icon: CircleCheckBig, before: '', strong: '1,200+', after: ' websites using Pixelco', iconCls: 'text-primary' },
  { icon: ChartColumn, before: 'Avg match rate: ', strong: '20%', after: '', iconCls: 'text-primary' },
  { icon: Zap, before: 'Setup in ', strong: '2 minutes', after: '', iconCls: 'text-highlight' },
]

export function Hero() {
  return (
    <section className="relative overflow-hidden" aria-labelledby="hero-heading">
      {/* Soft radial glow behind the mockup. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_75%_35%,rgba(250,204,21,0.16),transparent_65%)]"
      />

      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-24">
        <div>
          <p className="mb-4 inline-flex items-center rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-700">
            <span aria-hidden="true">🌟</span>&nbsp;World&apos;s first B2C email identification
          </p>
          <h1
            id="hero-heading"
            className="text-balance text-4xl font-extrabold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-[3.4rem]"
          >
            Identify Anonymous Website Visitors —{' '}
            <em className="text-gradient-hero">By Their Email</em>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
            One pixel snippet reveals who&apos;s browsing your site. B2B companies
            and individual consumers — identified by their real email address.
            No forms. No popups. No cookies.
          </p>

          {/* R7-V6: pill badges like the live (bg-card, border, rounded-lg). */}
          <ul className="mb-8 flex flex-wrap gap-3">
            {TRUST_POINTS.map((point) => (
              <li
                key={point.strong}
                className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5 text-sm"
              >
                <point.icon className={`h-4 w-4 ${point.iconCls}`} aria-hidden="true" />
                <span className="text-muted-foreground">
                  {point.before}
                  <strong className="font-semibold text-foreground">{point.strong}</strong>
                  {point.after}
                </span>
              </li>
            ))}
          </ul>

          {/* R7-V5: the live's trust row — 5 photo avatars overlapping, then
              a stacked (flex-col) stars + "Trusted by" block — positioned
              BETWEEN the pills and the CTA buttons like the live. */}
          <div className="mb-6 mt-8 flex items-center gap-4">
            <div className="flex -space-x-2.5 shrink-0" aria-hidden="true">
              {[1, 2, 3, 4, 5].map((n) => (
                // eslint-disable-next-line @next/next/no-img-element -- decorative 96px JPEGs; next/image adds nothing at 32px display
                <img
                  key={n}
                  src={`/assets/avatars/avatar-${n}.jpg`}
                  alt=""
                  width={32}
                  height={32}
                  className="h-8 w-8 rounded-full border-2 border-background object-cover"
                />
              ))}
            </div>
            <div className="flex min-w-0 flex-col">
              <span className="text-sm text-primary" aria-hidden="true">
                ★★★★★
              </span>
              <span className="text-sm text-muted-foreground">
                Trusted by <strong className="font-semibold text-foreground">1,200+</strong> businesses worldwide
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button size="lg" asChild className="h-12 px-7 text-base font-semibold">
              <Link href="/signup">
                Start Identifying Visitors
                <ArrowRight className="ml-1 h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="h-12 bg-card px-7 text-base font-semibold"
            >
              <a href="#live-demo">
                <PlayCircle className="mr-2 h-5 w-5" aria-hidden="true" />
                See Live Demo
              </a>
            </Button>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            Takes less than 2 minutes • Free plan available • No credit card required
          </p>
        </div>

        <div id="live-demo" className="scroll-mt-24" aria-label="Live demo of the visitor feed">
          <LiveFeedMockup />
        </div>
      </div>
    </section>
  )
}
