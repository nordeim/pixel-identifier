import type { Metadata } from 'next'
import Link from 'next/link'
import { Globe, Lightbulb, Shield, Target, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { marketingMetadata } from '@/lib/marketing-seo'

// R14-F2/F3: title + description are the live copy verbatim.
export const metadata: Metadata = marketingMetadata({
  title: 'About Pixelco — The Team Behind B2C Visitor Identification',
  description:
    "Learn about Pixelco by Aiviral. We built the world's first B2C email identification platform to help businesses turn anonymous website visitors into leads.",
  path: '/about',
})

/**
 * R13-F4: rebuilt on the live DOM (research/round13-audit/content/
 * page-about.json) — container max-w-4xl chrome, `← Back to Home` link,
 * gradient-span H1, mb-16 section rhythm, border+shadow value cards,
 * the stats band and the hiring note.
 */
const VALUES = [
  {
    icon: Lightbulb,
    title: 'Innovation First',
    text: "We built the world's first email-level visitor identification — because IP lookups weren't good enough.",
  },
  {
    icon: Shield,
    title: 'Privacy by Design',
    text: 'Our technology is 100% cookieless. We respect user privacy while delivering actionable insights.',
  },
  {
    icon: Globe,
    title: 'Global Scale',
    text: 'We serve businesses in 50+ countries, identifying visitors across every continent.',
  },
  {
    icon: Target,
    title: 'Results-Driven',
    text: 'Every feature we ship is measured by one metric: does it help our customers convert more leads?',
  },
]

const STATS = [
  { value: '50+', label: 'Countries Served' },
  { value: '10M+', label: 'Visitors Identified' },
  { value: '2,000+', label: 'Businesses Trust Us' },
]

export default function AboutPage() {
  return (
    <div className="container mx-auto px-6 py-16 max-w-4xl">
      <Link href="/" className="text-sm text-primary hover:underline mb-6 inline-block">
        ← Back to Home
      </Link>

      <div className="mb-16">
        <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
          We&apos;re building the future of <span className="text-gradient-hero">visitor intelligence.</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
          Pixelco is the first and only platform that lets websites identify anonymous
          visitors by their email address — not just their company. We&apos;re turning
          unknown traffic into real, actionable leads for businesses worldwide.
        </p>
      </div>

      <section className="mb-16">
        <h2 className="text-2xl font-bold text-foreground mb-3">Our Mission</h2>
        <p className="text-muted-foreground leading-relaxed text-base">
          97% of website visitors leave without ever filling out a form. That&apos;s
          thousands of potential customers, gone forever. We started Pixelco to solve
          this problem — to give every business, from startups to enterprises, the
          ability to know exactly who&apos;s visiting their site and reach out before
          the opportunity disappears.
        </p>
      </section>

      <section className="mb-16">
        <h2 className="text-2xl font-bold text-foreground mb-6">What We Stand For</h2>
        <div className="grid sm:grid-cols-2 gap-5">
          {VALUES.map((value) => (
            <div key={value.title} className="border border-border rounded-xl p-6 bg-card shadow-card">
              <value.icon className="w-8 h-8 text-primary mb-3" aria-hidden="true" />
              <h3 className="text-lg font-semibold text-foreground mb-2">{value.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{value.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-16">
        <div className="grid grid-cols-3 gap-6 text-center py-10 border border-border rounded-xl bg-card shadow-card">
          {STATS.map((stat) => (
            <div key={stat.label}>
              <p className="text-3xl font-extrabold text-gradient-hero">{stat.value}</p>
              <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-16">
        <h2 className="text-2xl font-bold text-foreground mb-3">Our Team</h2>
        <p className="text-muted-foreground leading-relaxed mb-6">
          We&apos;re a lean, global team of engineers, data scientists, and growth
          experts obsessed with turning anonymous traffic into revenue. Based
          everywhere, building for everyone.
        </p>
        <div className="flex items-center gap-3">
          <Users className="w-5 h-5 text-primary" aria-hidden="true" />
          <p className="text-sm text-muted-foreground">
            We&apos;re hiring! Interested in joining us? Reach out at{' '}
            <a href="mailto:support@pixelco.io" className="text-primary hover:underline">
              support@pixelco.io
            </a>
          </p>
        </div>
      </section>

      <div className="text-center py-10 border-t border-border">
        <h2 className="text-2xl font-bold text-foreground mb-3">Ready to see who&apos;s visiting your site?</h2>
        <p className="text-muted-foreground mb-6">Start identifying anonymous visitors today — it&apos;s free.</p>
        {/* The live anchors to the app subdomain and wraps a gradient
            button; the clone is a single deployment — /signup is the same
            destination, so the classes land on the anchor via asChild. */}
        <Button
          asChild
          variant={null}
          size={null}
          className="bg-primary hover:bg-primary/90 h-10 gradient-cta text-primary-foreground border-0 hover:opacity-90 font-semibold px-8 py-3 text-base"
        >
          <Link href="/signup">Get Started Free</Link>
        </Button>
      </div>
    </div>
  )
}
