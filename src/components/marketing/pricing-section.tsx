'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Check, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PLANS, PLAN_ORDER, annualDiscountLabel, annualTotalCents, effectiveMonthlyPrice, formatPrice, type BillingCycle } from '@/lib/plans'

export function PricingSection() {
  const [cycle, setCycle] = useState<BillingCycle>('monthly')

  return (
    <section id="pricing" aria-labelledby="pricing-heading" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-16 sm:px-6 lg:py-20">
      <div className="text-center">
        <p className="text-xs font-bold uppercase tracking-widest text-amber-600">Pricing</p>
        <h2 id="pricing-heading" className="mt-2 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
          Start Free. <span className="bg-primary px-2 [box-decoration-break:clone]">Scale as You Grow.</span>
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

      <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {PLAN_ORDER.map((id) => {
          const plan = PLANS[id]
          const monthly = effectiveMonthlyPrice(plan, cycle)
          const annualTotal = annualTotalCents(plan)

          return (
            <div
              key={plan.id}
              className={
                plan.popular
                  ? 'relative flex flex-col rounded-xl border-2 border-primary bg-card p-6 shadow-lg shadow-primary/10'
                  : 'relative flex flex-col rounded-xl border border-border bg-card p-6 shadow-sm'
              }
            >
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-0.5 text-[10px] font-extrabold uppercase tracking-widest text-primary-foreground">
                  Popular
                </span>
              )}

              <h3 className="text-lg font-bold text-foreground">{plan.name}</h3>

              <p className="mt-3 flex items-baseline gap-1">
                <span className="text-4xl font-extrabold tracking-tight text-foreground">
                  {formatPrice(monthly)}
                </span>
                <span className="text-sm text-muted-foreground">/mo</span>
              </p>
              {cycle === 'annual' && plan.monthlyPrice > 0 && (
                <p className="mt-1 text-xs text-muted-foreground">
                  {formatPrice(annualTotal)} billed annually
                </p>
              )}
              {cycle === 'monthly' && plan.monthlyPrice === 0 && (
                <p className="mt-1 text-xs text-muted-foreground">Free forever</p>
              )}

              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{plan.description}</p>

              <ul className="mt-6 flex-1 space-y-2.5">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm text-foreground">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-teal-600" aria-hidden="true" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Button
                asChild
                variant={plan.id === 'free' ? 'outline' : 'default'}
                className="mt-6 w-full font-semibold"
              >
                <Link href={plan.id === 'free' ? '/signup' : `/signup?plan=${plan.id}&cycle=${cycle}`}>
                  {plan.id === 'free' ? 'Free Tier' : 'Get Started'}
                  <ArrowRight className="ml-1 h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
            </div>
          )
        })}
      </div>

      <div className="mt-10 flex flex-col items-center justify-between gap-4 rounded-xl border border-border bg-card p-6 shadow-sm sm:flex-row sm:p-8">
        <div>
          <h3 className="text-lg font-bold text-foreground">Need 7,500+ identifications?</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Custom pricing with volume discounts, SLA, dedicated infrastructure,
            and white-glove onboarding.
          </p>
        </div>
        <Button variant="outline" className="border-primary font-semibold text-foreground hover:bg-primary/10 sm:shrink-0" asChild>
          <Link href="mailto:sales@pixelco.example">
            <Zap className="mr-2 h-4 w-4 text-amber-600" aria-hidden="true" />
            Contact Sales
          </Link>
        </Button>
      </div>
    </section>
  )
}
