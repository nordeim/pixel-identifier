'use client'

import { useActionState, useState } from 'react'
import { Check, Loader2, Zap } from 'lucide-react'
import { changePlanAction } from '@/actions/settings'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import {
  PLANS,
  PLAN_ORDER,
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
      {/* Live summary: a plain flex row — no banner card (R5-H6). */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-foreground">
            You&apos;re on the <span className="text-gradient-primary capitalize">{PLANS[shownPlan].name}</span> plan
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
        <div className="flex items-center gap-2">
          <div
            className="h-1.5 w-32 overflow-hidden rounded-full bg-muted"
            role="progressbar"
            aria-valuenow={percent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Identifications used"
          >
            <div className="h-full gradient-primary" style={{ width: `${Math.min(percent, 100)}%` }} />
          </div>
          <span className="text-xs font-semibold text-muted-foreground">{percent}%</span>
        </div>
      </div>

      {/* Billing toggle — Monthly [switch] Annual, like the live app */}
      <div className="flex items-center justify-center gap-3">
        <span
          className={cycle === 'monthly' ? 'text-sm font-semibold text-foreground' : 'text-sm text-muted-foreground'}
        >
          Monthly
        </span>
        <Switch
          checked={cycle === 'annual'}
          onCheckedChange={(annual) => setCycle(annual ? 'annual' : 'monthly')}
          aria-label="Switch to annual billing"
        />
        <span
          className={cycle === 'annual' ? 'text-sm font-semibold text-foreground' : 'text-sm text-muted-foreground'}
        >
          Annual
        </span>
      </div>

      {/* Plan cards — the popular plan carries the live emphasis model:
          border-primary + ring + top gradient strip + inline POPULAR pill. */}
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {PLAN_ORDER.map((id) => {
          const plan = PLANS[id]
          const monthly = effectiveMonthlyPrice(plan, cycle)
          const isCurrent = shownPlan === id

          return (
            <div
              key={plan.id}
              className={
                plan.popular
                  ? 'relative flex flex-col overflow-hidden rounded-lg border border-primary bg-card shadow-md ring-1 ring-primary/20 scale-[1.02]'
                  : 'relative flex flex-col rounded-lg border border-border bg-card shadow-sm'
              }
            >
              {plan.popular && <div className="h-1 gradient-primary" aria-hidden="true" />}
              <div className="flex flex-1 flex-col p-6">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-display text-lg font-bold text-foreground">{plan.name}</h3>
                  {plan.popular && (
                    <span className="gradient-primary rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-widest text-primary-foreground">
                      Popular
                    </span>
                  )}
                </div>
                <p className="mt-3 flex items-baseline gap-1">
                  <span className="font-display text-3xl font-bold tracking-tight text-foreground xl:text-4xl">
                    {formatPrice(monthly)}
                  </span>
                  {plan.monthlyPrice > 0 && <span className="text-sm text-muted-foreground">/mo</span>}
                </p>
                {cycle === 'annual' && plan.monthlyPrice > 0 && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {formatPrice(annualTotalCents(plan))} billed annually
                  </p>
                )}

                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{plan.description}</p>

                {/* Live quota block: number/label split under a hairline. */}
                <div className="mt-3 border-t pt-3">
                  <p className="text-sm font-semibold text-foreground">
                    {plan.identificationLimit.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {plan.limitPeriod === 'lifetime'
                      ? 'lifetime identifications'
                      : 'identifications / mo'}
                  </p>
                  {plan.overagePrice > 0 && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      then {formatPrice(plan.overagePrice)} per extra identification
                    </p>
                  )}
                </div>

                <form action={formAction} className="mt-5">
                  <input type="hidden" name="plan" value={plan.id} />
                  <input type="hidden" name="cycle" value={cycle} />
                  {isCurrent ? (
                    <Button type="button" disabled variant="secondary" className="h-10 w-full font-semibold">
                      Current Plan
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      disabled={pending}
                      className="h-10 w-full gradient-primary font-semibold text-primary-foreground shadow-lg glow-primary transition-all duration-300 hover:opacity-90"
                    >
                      {pending ? (
                        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                      ) : (
                        <>
                          <Zap className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
                          Get Started
                        </>
                      )}
                    </Button>
                  )}
                </form>

                <ul className="mt-5 flex-1 space-y-2.5">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-xs text-muted-foreground">
                      <span
                        className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary/10"
                        aria-hidden="true"
                      >
                        <Check className="h-2.5 w-2.5 text-primary" />
                      </span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )
        })}
      </div>

      {/* Enterprise */}
      <div className="flex flex-col items-center justify-between gap-4 rounded-lg border border-border bg-card p-6 shadow-sm sm:flex-row">
        <div>
          <h3 className="font-display text-lg font-bold text-foreground">Need 7,500+ identifications?</h3>
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
      <section aria-labelledby="plan-faq-heading" className="rounded-lg border border-border bg-card p-6 shadow-sm">
        <h2 id="plan-faq-heading" className="text-center font-display text-base font-bold text-foreground">
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
