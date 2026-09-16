'use client'

import Link from 'next/link'
import { ArrowRight, ExternalLink, Globe, Mail } from 'lucide-react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { PixelcoMarketingWordmark } from '@/components/pixelco-logo'
import { FOOTER_COLUMNS } from '@/lib/marketing-links'

const FAQS = [
  {
    q: 'How does Pixelco identify visitors by email?',
    a: 'When someone visits your site, our pixel collects encrypted, privacy-safe signals (no cookies, no forms). Our identity graph cross-references those signals against deterministic first-party data partners to resolve the visitor to a real, verified email address — in real time, on average within seconds of the pageview.',
  },
  {
    q: 'Does it really work for B2C (individual) visitors?',
    a: 'Yes. Traditional visitor-identification tools only resolve the company behind an IP address. Pixelco is the first platform built for individual-level identification: we resolve the actual person — their personal Gmail, Outlook, or iCloud address — not just where they work.',
  },
  {
    q: 'How do I install the pixel?',
    a: 'Paste one line of JavaScript into the <head> section of your site. It works on hand-coded HTML, WordPress, Shopify, Webflow, React, and virtually any platform that lets you add a script tag. Setup takes about 30 seconds and requires no developer skills.',
  },
  {
    q: 'Is this legal and privacy-compliant?',
    a: 'Pixelco is fully cookieless — we never set tracking cookies or collect form data. Our identification is built on deterministic, consented first-party data from our partner network, and we operate in compliance with GDPR and CCPA. We publish a DPA, honor opt-out requests within 24 hours, and never resell your data.',
  },
  {
    q: "What's the typical match rate?",
    a: 'Most customers see a 15–25% match rate, meaning we can identify the email of roughly 1 in 4–7 anonymous visitors. Match rates vary by traffic source and geography.',
  },
  {
    q: 'Can I export leads or integrate with my CRM?',
    a: 'Yes. Every identified visitor can be exported as CSV with one click, or streamed into your CRM, email sequencer, or webhook endpoint. Push leads to HubSpot, Salesforce, or Zapier and trigger outreach automatically.',
  },
  {
    q: "What happens if I exceed my plan's identification limit?",
    a: 'On paid plans you never stop collecting data: once your monthly allowance is used up, additional identifications are billed at a low per-identification rate ($0.10–$0.20 depending on plan). On the Free plan, tracking continues but identification pauses until you upgrade.',
  },
]

export function Faq() {
  return (
    <section id="faq" aria-labelledby="faq-heading" className="scroll-mt-24 border-y border-border bg-card py-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <div className="text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-amber-600">FAQ</p>
          <h2 id="faq-heading" className="mt-2 text-3xl font-bold text-foreground sm:text-4xl">
            Frequently Asked Questions
          </h2>
          <p className="mt-4 text-muted-foreground">Have questions? We&apos;ve got answers.</p>
        </div>

        {/* R7-V14: the live's FAQ items are cards (bg-background, border,
            rounded-lg, px-5) that gain a shadow when open — not the default
            border-b divider rhythm. */}
        <div className="mt-10 space-y-2.5">
          <Accordion type="single" collapsible className="space-y-2.5">
            {FAQS.map((faq, index) => (
              <AccordionItem
                key={faq.q}
                value={`item-${index}`}
                className="rounded-lg border border-border bg-background px-5 data-[state=open]:shadow-card"
              >
                <AccordionTrigger className="py-4 text-left text-sm font-semibold text-foreground hover:no-underline">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  )
}

export function BottomCta() {
  return (
    <section aria-labelledby="cta-heading" className="py-20">
      <div className="container mx-auto px-6">
        {/* R7-V15: the live's CTA is a centered max-w-4xl card on the yellow
            marketing gradient with WHITE display text. */}
        <div className="gradient-hero-light relative mx-auto max-w-4xl overflow-hidden rounded-2xl p-6 text-center sm:p-10 md:p-14">
          <h2 id="cta-heading" className="mb-3 text-2xl font-bold text-white sm:text-3xl md:text-4xl">
            Stop Losing Anonymous Visitors.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-white/80">
            Join 1,200+ businesses already turning invisible website traffic into
            real, actionable leads with Pixelco.
          </p>
          <Button
            asChild
            size="lg"
            className="mt-8 h-12 bg-white px-8 text-base font-bold text-amber-950 shadow-lg hover:bg-amber-50"
          >
            <Link href="/signup">
              Start Identifying Visitors — Free
              <ArrowRight className="ml-1 h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>
          <p className="mt-5 text-xs font-medium text-white/70">
            No credit card required • 100 free identifications • Setup in 30 seconds
          </p>
        </div>
      </div>
    </section>
  )
}

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 bg-card">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 md:grid-cols-[2fr_1fr_1fr_1fr]">
          <div>
            <PixelcoMarketingWordmark />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              The world&apos;s first B2C email identification platform. Know
              who&apos;s visiting your site — by their real email.
            </p>
            <div className="mt-5 flex gap-3">
              {[
                // R7: the live's footer social icons (globe, external-link,
                // mail); the first two are '#' placeholders on the live too.
                { icon: Globe, label: 'Pixelco website', href: '#' },
                { icon: ExternalLink, label: 'Pixelco external links', href: '#' },
                { icon: Mail, label: 'Email Pixelco', href: 'mailto:support@pixelco.io' },
              ].map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:border-primary hover:text-foreground focus-brand"
                >
                  <social.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {FOOTER_COLUMNS.map((column) => (
            <nav key={column.title} aria-label={column.title}>
              <h3 className="text-xs font-bold uppercase tracking-widest text-foreground">
                {column.title}
              </h3>
              <ul className="mt-4 space-y-2.5">
                {column.links.map((link) => (
                  <li key={link.label}>
                    {link.href.startsWith('mailto:') ? (
                      <a href={link.href} className="text-sm text-muted-foreground transition-colors hover:text-foreground focus-brand">
                        {link.label}
                      </a>
                    ) : link.href === '#' ? (
                      // Careers: dead on the original pixelco.io footer too (parity).
                      <span aria-disabled="true" className="cursor-default text-sm text-muted-foreground/70">
                        {link.label}
                      </span>
                    ) : (
                      <Link href={link.href} className="text-sm text-muted-foreground transition-colors hover:text-foreground focus-brand">
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-border/60 pt-6 sm:flex-row">
          <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} Pixelco. All rights reserved.</p>
          <p className="text-xs text-muted-foreground">Made with precision for marketers who want results.</p>
        </div>
      </div>
    </footer>
  )
}
