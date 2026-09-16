import { Star } from 'lucide-react'

const LOGOS = [
  // R7: the live's exact marquee set (10 names).
  'TechCorp', 'GrowthLabs', 'ScaleUp', 'DataFlow', 'LeadGen Pro', 'CloudBase', 'SalesForge', 'Amplify', 'NexGen', 'RevBoost',
]

const TESTIMONIALS = [
  {
    quote: 'Pixelco identified 3,200 leads in our first month. Our sales pipeline has never been this full.',
    name: 'Sarah Chen',
    role: 'VP Marketing, GrowthLabs',
  },
  {
    quote: "We went from guessing who visits our site to knowing their exact email. Game changer for outbound.",
    name: 'Marcus Johnson',
    role: 'Head of Sales, ScaleUp',
  },
  {
    quote: 'Setup took 2 minutes. Within an hour, we had a list of high-intent visitors to reach out to.',
    name: 'Emily Park',
    role: 'Founder, DataFlow',
  },
]

const STATS = [
  { value: '20%', label: 'Avg match rate' },
  { value: '30s', label: 'Install time' },
  { value: 'B2B+B2C', label: 'Both supported' },
  // R7-V11: the live renders this stat capitalized with the gradient-hero
  // text treatment.
  { value: 'Real-Time', label: 'Identification' },
]

export function LogoStrip() {
  return (
    <section aria-label="Businesses that trust Pixelco" className="border-y border-border/60 bg-card/50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
          {LOGOS.map((logo) => (
            <span
              key={logo}
              className="text-sm font-bold uppercase tracking-widest text-muted-foreground/60 grayscale"
            >
              {logo}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}

export function Testimonials() {
  return (
    <section aria-labelledby="testimonials-heading" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-20">
      <h2 id="testimonials-heading" className="sr-only">
        Customer testimonials
      </h2>
      <div className="grid gap-6 md:grid-cols-3">
        {TESTIMONIALS.map((t) => (
          <figure
            key={t.name}
            className="flex flex-col justify-between rounded-xl border border-border bg-card p-6 shadow-sm"
          >
            <div>
              <div className="flex gap-0.5" aria-label="Rated 5 out of 5 stars">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-primary text-primary" aria-hidden="true" />
                ))}
              </div>
              <blockquote className="mt-4 text-[15px] leading-relaxed text-foreground">
                “{t.quote}”
              </blockquote>
            </div>
            {/* R7-V7: the live renders the author as plain stacked text
                (no avatar circles). */}
            <figcaption className="mt-6">
              <p className="text-sm font-semibold text-foreground">{t.name}</p>
              <p className="text-xs text-muted-foreground">{t.role}</p>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  )
}

export function StatsBar() {
  return (
    <section aria-label="Product statistics" className="border-y border-border/60 bg-card/50 py-12">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 sm:px-6 lg:grid-cols-4">
        {STATS.map((stat) => (
          <div key={stat.label} className="text-center">
            {/* R7-V11: the live's stat values carry the gradient-hero text
                treatment with mb-1 (not text-primary + tracking-tight). */}
            <p className="mb-1 text-gradient-hero text-3xl font-extrabold sm:text-4xl">
              {stat.value}
            </p>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}
