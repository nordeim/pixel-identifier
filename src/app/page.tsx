import type { Metadata } from 'next'
import { AnnouncementBar } from '@/components/marketing/announcement-bar'
import { SiteHeader } from '@/components/marketing/site-header'
import { Hero } from '@/components/marketing/hero'
import { LogoStrip, Testimonials, StatsBar } from '@/components/marketing/social-proof'
import { Audience, HowItWorks } from '@/components/marketing/how-it-works'
import { Features, Comparison } from '@/components/marketing/features'
import { PricingSection } from '@/components/marketing/pricing-section'
import { Faq, BottomCta, SiteFooter } from '@/components/marketing/faq-footer'

export const metadata: Metadata = {
  title: 'Pixelco — Identify Anonymous Website Visitors By Their Email',
}

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <AnnouncementBar />
      <SiteHeader />
      <main className="flex-1">
        <Hero />
        <LogoStrip />
        <Testimonials />
        <StatsBar />
        <Audience />
        <HowItWorks />
        <Features />
        <Comparison />
        <PricingSection />
        <Faq />
        <BottomCta />
      </main>
      <SiteFooter />
    </div>
  )
}
