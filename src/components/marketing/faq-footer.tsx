'use client'

import Link from 'next/link'
import { ArrowRight, Linkedin, Mail, Twitter } from 'lucide-react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { PixelcoLogo } from '@/components/pixelco-logo'
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
    <section id="faq" aria-labelledby="faq-heading" className="scroll-mt-24 border-t border-border/60 bg-card/50 py-16 lg:py-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <div className="text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-amber-600">FAQ</p>
          <h2 id="faq-heading" className="mt-2 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Frequently Asked Questions
          </h2>
          <p className="mt-4 text-muted-foreground">Have questions? We&apos;ve got answers.</p>
        </div>

        <Accordion type="single" collapsible className="mt-10">
          {FAQS.map((faq, index) => (
            <AccordionItem key={faq.q} value={`item-${index}`}>
              <AccordionTrigger className="text-left text-[15px] font-semibold text-foreground hover:no-underline">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}

export function BottomCta() {
  return (
    <section aria-labelledby="cta-heading" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-20">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-400 via-yellow-400 to-orange-500 px-6 py-14 text-center shadow-xl sm:px-12">
        <h2 id="cta-heading" className="text-balance text-3xl font-extrabold tracking-tight text-amber-950 sm:text-4xl">
          Stop Losing Anonymous Visitors.
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-amber-950/80">
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
        <p className="mt-5 text-xs font-medium text-amber-950/70">
          No credit card required • 100 free identifications • Setup in 30 seconds
        </p>
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
            <span className="inline-flex items-center gap-2">
              <PixelcoLogo />
              <span className="text-lg font-extrabold tracking-tight text-foreground">Pixelco</span>
            </span>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              The world&apos;s first B2C email identification platform. Know
              who&apos;s visiting your site — by their real email.
            </p>
            <div className="mt-5 flex gap-3">
              {[
                { icon: Twitter, label: 'Pixelco on X' },
                { icon: Linkedin, label: 'Pixelco on LinkedIn' },
                { icon: Mail, label: 'Email Pixelco' },
              ].map((social) => (
                <a
                  key={social.label}
                  href="#"
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
