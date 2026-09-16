'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PLANS, PLAN_ORDER, annualDiscountLabel, marketingAnnualMonthlyCents, formatPrice, type BillingCycle } from '@/lib/plans'

export function PricingSection() {
  const [cycle, setCycle] = useState<BillingCycle>('monthly')

  return (
    <section id="pricing" aria-labelledby="pricing-heading" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-16 sm:px-6 lg:py-20">
      <div className="text-center">
        <p className="text-xs font-bold uppercase tracking-widest text-amber-600">Pricing</p>
        <h2 id="pricing-heading" className="mt-2 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
          Start Free. <span className="text-gradient-hero">Scale as You Grow.</span>
        </h2>
        <p className="mt-4 text-muted-foreground">
          No credit card required • Cancel anytime • Results in minutes
        </p>

        {/* Billing cycle toggle */}
        <div
          className="mt-8 inline-flex items-center rounded-full border border-border bg-card p-1"
          role="group"
          aria-label="Billing cycle"
        >
          {(['monthly', 'annual'] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setCycle(option)}
              aria-pressed={cycle === option}
              className={
                cycle === option
                  ? 'rounded-full bg-primary px-5 py-1.5 text-sm font-semibold text-primary-foreground'
                  : 'rounded-full px-5 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-brand'
              }
            >
              {option === 'monthly' ? 'Monthly' : 'Annual'}
              {option === 'annual' && (
                <span className={cycle === 'annual' ? 'ml-1.5 text-xs font-bold' : 'ml-1.5 text-xs font-bold text-teal-600'}>
                  {annualDiscountLabel(PLANS.starter)}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="mx-auto mt-10 grid max-w-5xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {PLAN_ORDER.map((id) => {
          const plan = PLANS[id]
          // R6-M6: the marketing surface displays the floored 20%-off annual
          // price ($63/$199/$639) — its own live counterpart's convention.
          const monthly =
            cycle === 'annual' ? marketingAnnualMonthlyCents(plan) : plan.monthlyPrice

          return (
            <div
              key={plan.id}
              className={
                plan.popular
                  ? 'shadow-elevated relative flex flex-col rounded-xl border-2 border-primary bg-background p-7'
                  : 'relative flex flex-col rounded-xl border border-border bg-card p-6 shadow-sm'
              }
            >
              {plan.popular && (
                <span className="gradient-cta absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary-foreground">
                  POPULAR
                </span>
              )}

              <h3 className="text-lg font-bold text-foreground">{plan.name}</h3>

              <p className="mb-4 mt-3 min-h-[40px] text-sm leading-relaxed text-muted-foreground">
                {plan.description}
              </p>

              <div className="mb-1">
                <span className="text-4xl font-extrabold tracking-tight text-foreground">
                  {formatPrice(monthly)}
                </span>
                <span className="text-sm text-muted-foreground">/mo</span>
              </div>
              {cycle === 'annual' && plan.monthlyPrice > 0 && (
                <p className="mb-4 text-xs text-muted-foreground">billed annually</p>
              )}
              {cycle === 'monthly' && plan.monthlyPrice === 0 && (
                <p className="mb-4 text-xs text-muted-foreground">Free forever</p>
              )}

              {/* R7-V12: the live's CTA treatment — Free and Growth carry the
                  gradient, Starter and Scale are muted bg-secondary, and the
                  CTA sits ABOVE the feature list (mb-5 / mt-6 on Free). */}
              <Button
                asChild
                className={
                  plan.id === 'free'
                    ? 'gradient-cta mt-6 w-full border-0 font-semibold text-primary-foreground hover:opacity-90'
                    : plan.popular
                      ? 'gradient-cta mb-5 w-full border-0 font-semibold text-primary-foreground hover:opacity-90'
                      : 'mb-5 w-full bg-secondary font-semibold text-secondary-foreground hover:bg-secondary/80'
                }
              >
                <Link href={plan.id === 'free' ? '/signup' : `/signup?plan=${plan.id}&cycle=${cycle}`}>
                  {plan.id === 'free' ? 'Start Free' : 'Get Started'}
                  <ArrowRight className="ml-1 h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>

              <ul className="flex-1 space-y-2.5">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          )
        })}
      </div>
    </section>
  )
}
