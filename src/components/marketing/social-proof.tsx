import { Star } from 'lucide-react'

const LOGOS = [
  'Salesforce', 'Amplify', 'NexGen', 'RevBoost', 'TechCorp', 'GrowthLabs', 'ScaleUp', 'DataFlow', 'LeadGen Pro',
]

const TESTIMONIALS = [
  {
    quote: 'Pixelco identified 3,200 leads in our first month. Our sales pipeline has never been this full.',
    name: 'Sarah Chen',
    role: 'VP Marketing, GrowthLabs',
    initials: 'SC',
    color: 'bg-amber-500',
  },
  {
    quote: "We went from guessing who visits our site to knowing their exact email. Game changer for outbound.",
    name: 'Marcus Johnson',
    role: 'Head of Sales, ScaleUp',
    initials: 'MJ',
    color: 'bg-teal-600',
  },
  {
    quote: 'Setup took 2 minutes. Within an hour, we had a list of high-intent visitors to reach out to.',
    name: 'Emily Park',
    role: 'Founder, DataFlow',
    initials: 'EP',
    color: 'bg-rose-500',
  },
]

const STATS = [
  { value: '20%', label: 'Avg match rate' },
  { value: '30s', label: 'Install time' },
  { value: 'B2B+B2C', label: 'Both supported' },
  { value: 'Real-time', label: 'Identification' },
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
            <figcaption className="mt-6 flex items-center gap-3">
              <span
                className={`flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold text-white ${t.color}`}
                aria-hidden="true"
              >
                {t.initials}
              </span>
              <div>
                <p className="text-sm font-semibold text-foreground">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.role}</p>
              </div>
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
            <p className="text-3xl font-extrabold tracking-tight text-primary sm:text-4xl">
              {stat.value}
            </p>
            <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}
