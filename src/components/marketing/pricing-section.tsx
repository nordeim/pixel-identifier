'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Check, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PLANS, PLAN_ORDER, marketingAnnualMonthlyCents, formatPrice, type BillingCycle } from '@/lib/plans'

/**
 * R10-F4: rebuilt to the live pricing DOM verbatim — the cycle toggle is an
 * iOS switch (w-14 h-7 rounded-full, white knob) that DEFAULTS TO ANNUAL
 * (the live loads with the switch on, rendering the floored annual table
 * $63/$199/$639); "Save 20%" rides the Annual label in the accent yellow.
 * The Free card CTA is secondary-styled with the text "Free Tier" (no
 * gradient, no arrow); base cards are p-7 + shadow-card without flex-col.
 */
export function PricingSection() {
  const [cycle, setCycle] = useState<BillingCycle>('annual')

  return (
    <section id="pricing" aria-labelledby="pricing-heading" className="py-20">
      <div className="container mx-auto px-6">
        <div data-reveal="16" data-reveal-delay="0" className="text-center mb-14">
          <span className="text-xs font-semibold text-primary uppercase tracking-widest">Pricing</span>
          <h2 id="pricing-heading" className="text-3xl sm:text-4xl font-bold mt-2 text-foreground">
            Start Free. <span className="text-gradient-hero">Scale as You Grow.</span>
          </h2>
          {/* R18-B1: the live's subtitle carries max-w-md mx-auto and
              middle-dot separators (U+00B7, not U+2022 bullets). */}
          <p className="text-muted-foreground mt-3 max-w-md mx-auto">
            No credit card required · Cancel anytime · Results in minutes
          </p>

          {/* Billing cycle toggle — the live's iOS switch, defaulting to
              annual. Labels sit on both sides; Save 20% is accent-yellow.
              R20-F1: the three real sub-fixes are the off-branch track
              (bg-muted), the off-branch knob (translate-x-0) and the
              monthly sub-line below — the live's toggle button is a
              plain <button aria-label>, but the clone KEEPS its switch
              semantics + knob aria-hidden per the D5 ruling (invisible
              functional a11y chrome — same category as the trend
              chart's role="img"); the R20 functional probe confirmed
              these are the ONLY remaining attr divergences. */}
          <div className="flex items-center justify-center gap-3 mt-8">
            <span className={cycle === 'monthly' ? 'text-sm font-medium text-foreground' : 'text-sm font-medium text-muted-foreground'}>
              Monthly
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={cycle === 'annual'}
              aria-label="Toggle annual pricing"
              onClick={() => setCycle(cycle === 'annual' ? 'monthly' : 'annual')}
              className={
                cycle === 'annual'
                  ? 'relative w-14 h-7 rounded-full transition-colors duration-300 bg-primary'
                  : 'relative w-14 h-7 rounded-full transition-colors duration-300 bg-muted'
              }
            >
              <span
                aria-hidden="true"
                className={
                  cycle === 'annual'
                    ? 'absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white shadow transition-transform duration-300 translate-x-7'
                    : 'absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white shadow transition-transform duration-300 translate-x-0'
                }
              />
            </button>
            <span className={cycle === 'annual' ? 'text-sm font-medium text-foreground' : 'text-sm font-medium text-muted-foreground'}>
              Annual
              <span className="ml-1.5 text-xs text-accent font-semibold">Save 20%</span>
            </span>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {PLAN_ORDER.map((id, planIndex) => {
            const plan = PLANS[id]
            // R6-M6: the marketing surface displays the floored 20%-off annual
            // price ($63/$199/$639) — its own live counterpart's convention.
            const monthly =
              cycle === 'annual' ? marketingAnnualMonthlyCents(plan) : plan.monthlyPrice

            return (
              <div
                key={plan.id}
                data-reveal="24"
                data-reveal-delay={String((planIndex + 1) * 100)}
                className={
                  plan.popular
                    ? 'relative rounded-xl p-7 border border-2 border-primary shadow-elevated bg-background'
                    : 'relative rounded-xl p-7 border border-border shadow-card bg-card'
                }
              >
                {plan.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full gradient-cta text-[10px] font-bold text-primary-foreground uppercase tracking-wider">
                    POPULAR
                  </span>
                )}

                <h3 className="text-lg font-bold text-foreground">{plan.name}</h3>

                <p className="text-sm text-muted-foreground mb-4 min-h-[40px]">
                  {plan.description}
                </p>

                <div className="mb-1">
                  <span className="text-4xl font-extrabold text-foreground">
                    {formatPrice(monthly)}
                  </span>
                  {/* R10: the live renders no "/mo" suffix on the Free card's
                      $0 — only the paid cards carry it. */}
                  {plan.monthlyPrice > 0 && <span className="text-muted-foreground text-sm">/mo</span>}
                </div>
                {/* R18: the live ALWAYS renders this line — the spacer
                    keeps every card's CTA on the same baseline. R20-F1
                    corrected branch pair: paid cards read "billed
                    annually" (annual) / "billed monthly" (monthly); the
                    Free card keeps the spacer (the live's children: " ").
                    The R18 note claiming an empty line in monthly mode
                    was an unverified assumption — the R20 runtime probe
                    showed the live's `monthlyPrice>0 && !annual →
                    "billed monthly"` branch. */}
                <p className="text-xs text-muted-foreground mb-4">
                  {plan.monthlyPrice > 0 ? (
                    cycle === 'annual' ? 'billed annually' : 'billed monthly'
                  ) : (
                    '\u00A0'
                  )}
                </p>

                {/* R10-F4: the live's CTA matrix — ONLY Growth carries the
                    gradient (with a Zap icon BEFORE the text); Free reads
                    "Free Tier" in the secondary style, Starter/Scale are
                    secondary "Get Started" — all with a trailing arrow.
                    R18-B6 pattern: the live wraps every CTA button in a
                    class="block" anchor; the tails follow the live's
                    emission order. */}
                <Link
                  href={plan.id === 'free' ? '/signup' : `/signup?plan=${plan.id}&cycle=${cycle}`}
                  className="block"
                >
                  {/* R12 convention: variant/size skipped (cva null) — the
                      consumer tail carries the live's exact emission order
                      (size fragment, then consumer, then the variant-ish
                      chain — the live's builder assembles strings
                      per-component, so only the full tail reproduces it). */}
                  <Button
                    variant={null}
                    size={null}
                    className={
                      plan.popular
                        ? 'bg-primary hover:bg-primary/90 h-10 px-4 py-2 w-full mb-5 font-semibold gradient-cta text-primary-foreground border-0 hover:opacity-90'
                        : 'h-10 px-4 py-2 w-full mb-5 font-semibold bg-secondary text-secondary-foreground hover:bg-secondary/80'
                    }
                  >
                    {plan.popular && <Zap className="w-4 h-4 mr-1.5" aria-hidden="true" />}
                    {plan.id === 'free' ? 'Free Tier' : 'Get Started'}
                    {/* R10: the live's Growth CTA is Zap + text only; the
                        other cards carry a trailing arrow. */}
                    {!plan.popular && <ArrowRight className="w-4 h-4 ml-1.5" aria-hidden="true" />}
                  </Button>
                </Link>

                <ul className="space-y-2.5">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                      <Check className="w-4 h-4 text-accent shrink-0 mt-0.5" aria-hidden="true" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
