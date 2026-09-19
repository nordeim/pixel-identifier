import { Building2, ShoppingCart, Rocket, Users, Megaphone, CodeXml, Cpu, Mail, FileText } from 'lucide-react'

const AUDIENCES = [
  {
    // R7: icon set verified against the live (building2 for SaaS, rocket for
    // Startups — the clone previously had these two swapped).
    // R10: descriptions carry no trailing periods on the live.
    icon: Building2,
    title: 'SaaS Companies',
    text: 'Know which companies are evaluating your product',
  },
  {
    icon: ShoppingCart,
    title: 'E-Commerce Stores',
    text: 'Recover abandoned browsers with targeted emails',
  },
  {
    icon: Rocket,
    title: 'Startups',
    text: 'Turn early traffic into your first paying customers',
  },
  {
    icon: Users,
    title: 'Agencies',
    text: 'Deliver lead intelligence to clients automatically',
  },
  {
    icon: Megaphone,
    title: 'Marketers',
    text: 'Measure campaign ROI by seeing who actually visits',
  },
]

const STEPS = [
  {
    icon: CodeXml,
    title: 'Install the Pixel',
    text: "Paste one line of JavaScript into your website's <head> tag. Works on HTML, WordPress, Shopify, React — anything.",
  },
  {
    icon: Cpu,
    title: 'We Match Visitors',
    text: 'Our proprietary identity graph cross-references visitor signals to resolve their real email address in real time.',
  },
  {
    icon: Mail,
    title: 'Get Real Emails',
    text: 'See identified visitors in your dashboard with their email, company (if B2C), pages viewed, and confidence score.',
  },
  {
    icon: FileText,
    title: 'Export & Convert',
    text: 'Push leads to your CRM, trigger email sequences, or export CSV. Turn traffic into revenue on autopilot.',
  },
]

const STEP_TAGS = [
  'Real-time identification',
  '100% Cookieless',
  'Works on any platform',
  'No forms needed',
]

/** R10-F7: the live audience section — full-bleed `py-20 border-t
 * border-border` with a `container mx-auto px-6` inner, header
 * `text-center mb-14`, a `max-w-5xl` 3/5-column grid, and cards carrying
 * `shadow-card hover:shadow-elevated` with square `bg-secondary` icon
 * chips (40px, rounded-lg) — not the round amber chips. */
export function Audience() {
  return (
    <section aria-labelledby="audience-heading" className="py-20 border-t border-border">
      <div className="container mx-auto px-6">
        <div data-reveal="16" data-reveal-delay="0" className="text-center mb-14">
          <span className="text-xs font-semibold text-primary uppercase tracking-widest">Perfect fit</span>
          <h2 id="audience-heading" className="text-3xl sm:text-4xl font-bold mt-2 text-foreground">
            Who Is Pixelco For?
          </h2>
          <p className="text-muted-foreground mt-3 max-w-lg mx-auto">
            Designed for anyone who wants to turn anonymous website traffic into
            actionable leads.
          </p>
        </div>

        <div className="grid sm:grid-cols-3 lg:grid-cols-5 gap-4 max-w-5xl mx-auto">
          {AUDIENCES.map((audience, i) => (
            <div
              key={audience.title}
              data-reveal="20"
              data-reveal-delay={String((i + 1) * 100)}
              className="bg-card rounded-xl border border-border p-5 text-center shadow-card hover:shadow-elevated transition-shadow"
            >
              <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center mx-auto mb-3" aria-hidden="true">
                <audience.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold text-sm text-foreground mb-1">{audience.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{audience.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/** R10-F5: the live process section — full `bg-card` tint with full-strength
 * borders, flat py-20, `bg-background` cards with `shadow-card`, and the
 * feature points as plain yellow-dot rows (`w-2 h-2 rounded-full bg-accent`)
 * in a `gap-6 mt-12` wrapper — not bordered pills. */
export function HowItWorks() {
  return (
    <section id="how-it-works" aria-labelledby="how-heading" className="py-20 bg-card border-y border-border">
      <div className="container mx-auto px-6">
        <div data-reveal="16" data-reveal-delay="0" className="text-center mb-14">
          <span className="text-xs font-semibold text-primary uppercase tracking-widest">Our process</span>
          <h2 id="how-heading" className="text-3xl sm:text-4xl font-bold mt-2 text-foreground">
            How We Identify Your Visitors
            <br />
            <span className="text-gradient-hero">In 4 Simple Steps</span>
          </h2>
          <p className="text-muted-foreground mt-3 max-w-lg mx-auto">
            Most identifications happen within seconds of a visitor landing on your site.
          </p>
        </div>

        <ol className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {STEPS.map((step, index) => (
            <li
              key={step.title}
              data-reveal="24"
              data-reveal-delay={String((index + 1) * 100)}
              className="relative bg-background rounded-xl border border-border p-6 shadow-card"
            >
              {/* R7-V8: the live's step chrome — a big faint background
                  number top-right and an icon in a gradient box; no
                  number-in-circle badge. */}
              <span
                aria-hidden="true"
                className="text-5xl font-extrabold text-muted/50 absolute top-3 right-4 select-none leading-none"
              >
                {String(index + 1).padStart(2, '0')}
              </span>
              {/* R18-B3: the live's step chip rides the full gradient-hero
                  (not the light variant) with its emission order; bare div
                  (no wrapper aria-hidden — R17-F3 pattern). */}
              <div className="w-10 h-10 rounded-lg gradient-hero flex items-center justify-center mb-4">
                <step.icon className="w-5 h-5 text-primary-foreground" />
              </div>
              <h3 className="font-bold text-foreground mb-1.5">{step.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{step.text}</p>
            </li>
          ))}
        </ol>

        {/* R10-F5: yellow-dot feature rows like the live — no pill borders. */}
        <ul data-reveal="16" data-reveal-delay="500" className="flex flex-wrap items-center justify-center gap-6 mt-12 text-sm text-muted-foreground">
          {STEP_TAGS.map((tag) => (
            <li key={tag} className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-accent" aria-hidden="true" />
              {tag}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
