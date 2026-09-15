import type { Metadata } from 'next'
import { CheckCircle2 } from 'lucide-react'
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

interface LandingPageProps {
  searchParams: Promise<{ deleted?: string | string[] }>
}

export default async function LandingPage({ searchParams }: LandingPageProps) {
  // Shown after account deletion (the settings danger zone signs out to
  // /?deleted=1) — confirm the removal instead of failing silently.
  const params = await searchParams
  const deleted = params.deleted === '1'

  return (
    <div className="flex min-h-screen flex-col">
      <AnnouncementBar />
      <SiteHeader />
      {deleted && (
        <p
          role="status"
          className="mx-auto mt-4 flex w-fit max-w-full items-start gap-2 rounded-full border border-teal-200 bg-teal-50 px-4 py-2 text-sm font-medium text-teal-800"
        >
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          Your account and all associated data have been permanently deleted.
        </p>
      )}
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
