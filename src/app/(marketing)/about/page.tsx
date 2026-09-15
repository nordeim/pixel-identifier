import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, Globe, Lightbulb, Shield, Target } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'About',
  description:
    'Pixelco is the first and only platform that lets websites identify anonymous visitors by their email address — not just their company.',
}

const VALUES = [
  {
    icon: Lightbulb,
    title: 'Innovation First',
    desc: "We built the world's first email-level visitor identification — because IP lookups weren't good enough.",
  },
  {
    icon: Shield,
    title: 'Privacy by Design',
    desc: 'Our technology is 100% cookieless. We respect user privacy while delivering actionable insights.',
  },
  {
    icon: Globe,
    title: 'Global Scale',
    desc: 'We serve businesses in 50+ countries, identifying visitors across every continent.',
  },
  {
    icon: Target,
    title: 'Results-Driven',
    desc: 'Every feature we ship is measured by one metric: does it help our customers convert more leads?',
  },
]

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6 lg:py-20">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-amber-600 transition-colors hover:text-amber-700 focus-brand"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to Home
      </Link>

      <h1 className="mt-8 text-4xl font-extrabold leading-tight tracking-tight text-foreground sm:text-5xl">
        We&apos;re building the future of{' '}
        <span className="bg-primary px-2 [box-decoration-break:clone]">visitor intelligence</span>.
      </h1>
      <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
        Pixelco is the first and only platform that lets websites identify
        anonymous visitors by their email address — not just their company.
        We&apos;re turning unknown traffic into real, actionable leads for
        businesses worldwide.
      </p>

      <section aria-labelledby="mission-heading" className="mt-16">
        <h2 id="mission-heading" className="text-2xl font-extrabold tracking-tight text-foreground">
          Our Mission
        </h2>
        <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">
          97% of website visitors leave without ever filling out a form.
          That&apos;s thousands of potential customers, gone forever. We
          started Pixelco to solve this problem — to give every business,
          from startups to enterprises, the ability to know exactly
          who&apos;s visiting their site and reach out before the
          opportunity disappears.
        </p>
      </section>

      <section aria-labelledby="values-heading" className="mt-16">
        <h2 id="values-heading" className="text-2xl font-extrabold tracking-tight text-foreground">
          What We Stand For
        </h2>
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          {VALUES.map((value) => (
            <div
              key={value.title}
              className="rounded-xl border border-border bg-card p-7 shadow-sm"
            >
              <span
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15"
                aria-hidden="true"
              >
                <value.icon className="h-5 w-5 text-amber-600" />
              </span>
              <h3 className="mt-4 text-base font-bold text-foreground">{value.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{value.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-16 rounded-2xl bg-gradient-to-br from-amber-400 via-yellow-400 to-orange-500 px-6 py-12 text-center shadow-xl sm:px-12">
        <h2 className="text-balance text-2xl font-extrabold tracking-tight text-amber-950 sm:text-3xl">
          See who&apos;s visiting your site.
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-amber-950/80">
          Join the businesses turning anonymous traffic into real, actionable
          leads — starting with your next visitor.
        </p>
        <Button
          asChild
          size="lg"
          className="mt-7 h-12 bg-white px-8 text-base font-bold text-amber-950 shadow-lg hover:bg-amber-50"
        >
          <Link href="/signup">
            Start Identifying Visitors — Free
            <ArrowRight className="ml-1 h-4 w-4" aria-hidden="true" />
          </Link>
        </Button>
      </section>
    </div>
  )
}
