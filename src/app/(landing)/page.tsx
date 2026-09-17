import type { Metadata } from 'next'
import { CheckCircle2 } from 'lucide-react'
import { Hero } from '@/components/marketing/hero'
import { SocialProof, StatsBar } from '@/components/marketing/social-proof'
import { Audience, HowItWorks } from '@/components/marketing/how-it-works'
import { Features, Comparison } from '@/components/marketing/features'
import { PricingSection } from '@/components/marketing/pricing-section'
import { Faq, BottomCta } from '@/components/marketing/faq-footer'

export const metadata: Metadata = {
  // R13-F10: the live landing ships exactly this title (and the same one
  // on every marketing route — its CSR shell never swaps it). absolute
  // bypasses the root template, which would double-suffix the brand.
  title: { absolute: 'Pixelco — Identify Anonymous Website Visitors by Email' },
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
    <>
      {deleted && (
        <p
          role="status"
          className="mx-auto mt-4 flex w-fit max-w-full items-start gap-2 rounded-full border border-teal-200 bg-teal-50 px-4 py-2 text-sm font-medium text-teal-800"
        >
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          Your account and all associated data have been permanently deleted.
        </p>
      )}
      <Hero />
      <SocialProof />
      <StatsBar />
      <Audience />
      <HowItWorks />
      <Features />
      <Comparison />
      <PricingSection />
      <Faq />
      <BottomCta />
    </>
  )
}
