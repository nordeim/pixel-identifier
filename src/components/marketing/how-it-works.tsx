import { Building2, ShoppingCart, Rocket, Users, Megaphone, CodeXml, Cpu, Mail, FileText } from 'lucide-react'

const AUDIENCES = [
  {
    // R7: icon set verified against the live (building2 for SaaS, rocket for
    // Startups — the clone previously had these two swapped).
    icon: Building2,
    title: 'SaaS Companies',
    text: 'Know which companies are evaluating your product.',
  },
  {
    icon: ShoppingCart,
    title: 'E-Commerce Stores',
    text: 'Recover abandoned browsers with targeted emails.',
  },
  {
    icon: Rocket,
    title: 'Startups',
    text: 'Turn early traffic into your first paying customers.',
  },
  {
    icon: Users,
    title: 'Agencies',
    text: 'Deliver lead intelligence to clients automatically.',
  },
  {
    icon: Megaphone,
    title: 'Marketers',
    text: 'Measure campaign ROI by seeing who actually visits.',
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
  'Real-time Identification',
  '100% Cookieless',
  'Works on any platform',
  'No forms needed',
]

export function Audience() {
  return (
    <section id="benefits" aria-labelledby="audience-heading" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-16 sm:px-6 lg:py-20">
      <div className="text-center">
        <p className="text-xs font-bold uppercase tracking-widest text-amber-600">Perfect fit</p>
        <h2 id="audience-heading" className="mt-2 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
          Who Is Pixelco For?
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
          Designed for anyone who wants to turn anonymous website traffic into
          actionable leads.
        </p>
      </div>

      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
        {AUDIENCES.map((audience) => (
          <div
            key={audience.title}
            className="rounded-xl border border-border bg-card p-5 text-center shadow-sm transition-shadow hover:shadow-md"
          >
            <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-primary/15" aria-hidden="true">
              <audience.icon className="h-5 w-5 text-amber-600" />
            </span>
            <h3 className="mt-4 text-sm font-bold text-foreground">{audience.title}</h3>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{audience.text}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

export function HowItWorks() {
  return (
    <section id="how-it-works" aria-labelledby="how-heading" className="scroll-mt-24 border-y border-border/60 bg-card/50 py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-amber-600">Our process</p>
          <h2 id="how-heading" className="mt-2 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            How We Identify Your Visitors
            <br />
            <span className="text-gradient-hero">In 4 Simple Steps</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Most identifications happen within seconds of a visitor landing on your site.
          </p>
        </div>

        <ol className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, index) => (
            <li
              key={step.title}
              className="relative overflow-hidden rounded-xl border border-border bg-card p-6 shadow-sm"
            >
              {/* R7-V8: the live's step chrome — a big faint background
                  number top-right and an icon in a gradient-hero box; no
                  number-in-circle badge. */}
              <span
                aria-hidden="true"
                className="absolute right-4 top-3 select-none text-5xl font-extrabold leading-none text-muted/50"
              >
                {String(index + 1).padStart(2, '0')}
              </span>
              <div
                className="gradient-hero-light mb-4 flex h-10 w-10 items-center justify-center rounded-lg"
                aria-hidden="true"
              >
                <step.icon className="h-5 w-5 text-primary-foreground" />
              </div>
              <h3 className="mb-1.5 font-bold text-foreground">{step.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{step.text}</p>
            </li>
          ))}
        </ol>

        <ul className="mt-8 flex flex-wrap items-center justify-center gap-3">
          {STEP_TAGS.map((tag) => (
            <li
              key={tag}
              className="rounded-full border border-border bg-background px-4 py-1.5 text-xs font-semibold text-foreground"
            >
              {tag}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
