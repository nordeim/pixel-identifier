'use client'

import { useActionState, useState } from 'react'
import { ArrowRight, Check, Loader2, Zap } from 'lucide-react'
import { changePlanAction } from '@/actions/settings'
import { Button } from '@/components/ui/button'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import {
  PLANS,
  PLAN_ORDER,
  annualDiscountLabel,
  annualTotalCents,
  effectiveMonthlyPrice,
  formatPrice,
  type BillingCycle,
  type PlanId,
} from '@/lib/plans'

interface PlanPanelProps {
  currentPlan: PlanId
  used: number
  limit: number
  percent: number
  period: 'lifetime' | 'monthly'
  overage: number
  /** Pre-formatted overage list price, e.g. "$15.00". */
  overageCostLabel: string
}

const FAQ = [
  {
    q: 'What counts as an identification?',
    a: 'An identification is a single visitor resolved to a real email address. Repeat visits by the same visitor are never double-counted — once we resolve someone, every future pageview from them is attached to the same profile at no extra cost.',
  },
  {
    q: 'What happens if I exceed my limit?',
    a: 'On paid plans, identification continues seamlessly and extra identifications are billed at your plan’s per-identification rate ($0.10–$0.20). On the Free plan, tracking keeps working but identification pauses until you upgrade — you never lose data.',
  },
]

export function PlanPanel({ currentPlan, used, limit, percent, period, overage, overageCostLabel }: PlanPanelProps) {
  const [cycle, setCycle] = useState<BillingCycle>('monthly')
  const [state, formAction, pending] = useActionState(changePlanAction, null)

  const pendingPlan = state?.ok ? state.data.plan : null
  const shownPlan = (pendingPlan ?? currentPlan) as PlanId

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Current status banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl bg-primary/20 px-5 py-4">
        <div>
          <p className="text-sm font-bold text-foreground">
            You&apos;re on the {PLANS[shownPlan].name} plan
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {used} of {limit.toLocaleString()} identifications used ({period})
          </p>
          {overage > 0 && (
            <p className="mt-0.5 text-xs font-medium text-amber-800">
              +{overage.toLocaleString()} extra identification{overage === 1 ? '' : 's'} — ≈ {overageCostLabel} at your plan&apos;s per-identification rate
            </p>
          )}
        </div>
        <p className="text-2xl font-extrabold tabular-nums text-amber-700">{percent}%</p>
      </div>

      {/* Billing toggle */}
      <div className="flex justify-center">
        <div
          className="inline-flex items-center rounded-full border border-border bg-card p-1"
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

      {/* Plan cards */}
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {PLAN_ORDER.map((id) => {
          const plan = PLANS[id]
          const monthly = effectiveMonthlyPrice(plan, cycle)
          const isCurrent = shownPlan === id

          return (
            <div
              key={plan.id}
              className={
                isCurrent
                  ? 'relative flex flex-col rounded-xl border-2 border-primary bg-card p-6 shadow-lg shadow-primary/10'
                  : plan.popular
                    ? 'relative flex flex-col rounded-xl border-2 border-primary/50 bg-card p-6 shadow-sm'
                    : 'relative flex flex-col rounded-xl border border-border bg-card p-6 shadow-sm'
              }
            >
              {plan.popular && !isCurrent && (
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
                  {formatPrice(annualTotalCents(plan))} billed annually
                </p>
              )}
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{plan.description}</p>

              <p className="mt-4 rounded-lg bg-muted/60 px-3 py-2 text-xs font-semibold text-foreground">
                {plan.limitPeriod === 'lifetime'
                  ? `${plan.identificationLimit} lifetime identifications`
                  : `${plan.identificationLimit.toLocaleString()} identifications / mo`}
                {plan.overagePrice > 0 &&
                  ` then ${formatPrice(plan.overagePrice)} per extra identification`}
              </p>

              <ul className="mt-5 flex-1 space-y-2.5">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm text-foreground">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-teal-600" aria-hidden="true" />
                    {feature}
                  </li>
                ))}
              </ul>

              <form action={formAction} className="mt-6">
                <input type="hidden" name="plan" value={plan.id} />
                <input type="hidden" name="cycle" value={cycle} />
                {isCurrent ? (
                  <Button type="button" disabled variant="secondary" className="w-full font-semibold">
                    Current Plan
                  </Button>
                ) : (
                  <Button type="submit" disabled={pending} className="w-full font-semibold">
                    {pending ? (
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    ) : (
                      <>
                        <Zap className="mr-1.5 h-4 w-4" aria-hidden="true" />
                        Get Started
                        <ArrowRight className="ml-1 h-4 w-4" aria-hidden="true" />
                      </>
                    )}
                  </Button>
                )}
              </form>
            </div>
          )
        })}
      </div>

      {/* Enterprise */}
      <div className="flex flex-col items-center justify-between gap-4 rounded-xl border border-border bg-card p-6 shadow-sm sm:flex-row">
        <div>
          <h3 className="text-lg font-bold text-foreground">Need 7,500+ identifications?</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Custom pricing with volume discounts, SLA, dedicated infrastructure,
            and white-glove onboarding.
          </p>
        </div>
        <Button variant="outline" className="border-primary font-semibold hover:bg-primary/10 sm:shrink-0" asChild>
          <a href="mailto:sales@pixelco.example">Contact Sales</a>
        </Button>
      </div>

      {/* FAQ */}
      <section aria-labelledby="plan-faq-heading" className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <h2 id="plan-faq-heading" className="text-base font-bold text-foreground">
          Frequently Asked Questions
        </h2>
        <Accordion type="single" collapsible className="mt-3">
          {FAQ.map((item, index) => (
            <AccordionItem key={item.q} value={`plan-faq-${index}`}>
              <AccordionTrigger className="text-left text-sm font-semibold hover:no-underline">
                {item.q}
              </AccordionTrigger>
              <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>
    </div>
  )
}
