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

/**
 * R9-F1/F2: the live hosts the logo marquee AND the testimonial cards in
 * one `py-16 border-b border-border` section — the marquee is an animated
 * `animate-scroll-left` track (two copies of the 10-name set for the
 * seamless -50% loop, `text-lg` muted names), and the testimonials sit in
 * a `max-w-4xl mx-auto` grid of `shadow-card` cards below it. The clone
 * previously shipped a static tinted strip plus a separate wider
 * testimonials section; both are gone in favour of the live DOM verbatim.
 */
export function SocialProof() {
  return (
    <section aria-labelledby="testimonials-heading" className="py-16 border-b border-border">
      <h2 id="testimonials-heading" className="sr-only">
        Customer testimonials
      </h2>
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <div className="overflow-hidden" aria-hidden="true">
            {/* Two copies of the name set directly on the track (the live
                DOM ships 20 span children; -50% translate = one copy). */}
            <div className="flex items-center gap-12 animate-scroll-left">
              {[...LOGOS, ...LOGOS].map((logo, i) => (
                <span
                  key={`${logo}-${i}`}
                  className="text-lg font-bold text-muted-foreground/40 whitespace-nowrap select-none"
                >
                  {logo}
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {TESTIMONIALS.map((t) => (
            <figure
              key={t.name}
              className="border border-border rounded-xl p-6 bg-card shadow-card"
            >
              {/* R7-V7: the live renders the author as plain stacked text
                  (no avatar circles). */}
              <div className="flex gap-0.5 mb-3" aria-label="Rated 5 out of 5 stars">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-primary text-primary" aria-hidden="true" />
                ))}
              </div>
              <p className="text-sm text-foreground leading-relaxed mb-4">
                “{t.quote}”
              </p>
              <div>
                <p className="text-sm font-semibold text-foreground">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.role}</p>
              </div>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}

export function StatsBar() {
  return (
    <section aria-label="Product statistics" className="py-14 border-y border-border">
      {/* R10-F12: the live's 4-column layout kicks in at md, inside a
          container wrapper. */}
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
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
      </div>
    </section>
  )
}
