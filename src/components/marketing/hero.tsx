import Link from 'next/link'
import { ArrowRight, PlayCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LiveFeedMockup } from '@/components/marketing/live-feed'

const TRUST_POINTS = [
  { icon: '🌍', text: '1,200+ websites using Pixelco' },
  { icon: '⚡', text: 'Avg match rate: 20%' },
  { icon: '⏱️', text: 'Setup in 2 minutes' },
]

const AVATAR_COLORS = [
  'bg-amber-500', 'bg-teal-500', 'bg-rose-500', 'bg-violet-500', 'bg-sky-500',
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

          <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2">
            {TRUST_POINTS.map((point) => (
              <li key={point.text} className="flex items-center gap-2 text-sm font-medium text-foreground">
                <span aria-hidden="true">{point.icon}</span>
                {point.text}
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
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

          <div className="mt-8 flex items-center gap-3">
            <div className="flex -space-x-2" aria-hidden="true">
              {AVATAR_COLORS.map((color, i) => (
                <span
                  key={color}
                  className={`flex h-8 w-8 items-center justify-center rounded-full border-2 border-background text-[10px] font-bold text-white ${color}`}
                >
                  {['SC', 'MJ', 'EP', 'AK', 'RB'][i]}
                </span>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              Trusted by <span className="font-semibold text-foreground">1,200+</span> businesses worldwide
            </p>
          </div>
        </div>

        <div id="live-demo" className="scroll-mt-24" aria-label="Live demo of the visitor feed">
          <LiveFeedMockup />
        </div>
      </div>
    </section>
  )
}
