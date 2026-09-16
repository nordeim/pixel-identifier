'use client'

import { useActionState, useState } from 'react'
import { Check, CircleHelp, Loader2, Zap } from 'lucide-react'
import { changePlanAction } from '@/actions/settings'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import {
  PLANS,
  PLAN_ORDER,
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

/**
 * Pricing FAQ — copy extracted from the live dashboard's question cards
 * (R6-H6). The accuracy item states this build's honest ~20% match rate
 * (the number the live's own landing hero advertises) instead of the
 * live's Fingerprint-Pro marketing claim.
 */
const FAQ = [
  {
    q: 'What counts as an identification?',
    a: 'Each unique visitor matched to an email address counts as one identification. Repeat visits from an already-identified visitor don\u2019t count again within the billing period.',
  },
  {
    q: 'What happens if I exceed my limit?',
    a: 'On paid plans, we keep identifying visitors beyond your included limit. Extra leads are billed at your plan\u2019s overage rate at the end of each billing cycle. On the free plan, identifications pause at 100.',
  },
  {
    q: 'Can I switch plans anytime?',
    a: 'Yes. Upgrade instantly and we\u2019ll prorate the difference. Downgrade takes effect at the next billing cycle.',
  },
  {
    q: 'Do you offer volume / enterprise pricing?',
    a: 'Absolutely. For 10K+ identifications per month, contact us for custom pricing with volume discounts, SLA, and dedicated infrastructure.',
  },
  {
    q: 'How does overage billing work?',
    a: 'When you exceed your plan\u2019s included identifications, we continue tracking leads at your plan\u2019s per-lead rate. Overages are added to your next invoice automatically.',
  },
  {
    q: 'How accurate is the identification?',
    a: 'Visitor matching combines a deterministic identity engine with first-party, cookieless visitor IDs. Typical match rates are ~20% of total site visitors.',
  },
]

export function PlanPanel({ currentPlan, used, limit, percent, period, overage, overageCostLabel }: PlanPanelProps) {
  const [cycle, setCycle] = useState<BillingCycle>('monthly')
  const [state, formAction, pending] = useActionState(changePlanAction, null)

  const pendingPlan = state?.ok ? state.data.plan : null
  const shownPlan = (pendingPlan ?? currentPlan) as PlanId

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {/* Live summary banner: a tinted primary card (R6-H6). */}
      <Card className="border-primary/20 bg-primary/5 shadow-sm">
        <CardContent className="p-6 pt-5 pb-4">
          <div className="flex items-center justify-between">
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
            <div className="flex items-center gap-3">
              <div
                className="h-1.5 w-32 overflow-hidden rounded-full bg-muted"
                role="progressbar"
                aria-valuenow={percent}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Identifications used"
              >
                <div className="h-full rounded-full gradient-primary" style={{ width: `${Math.min(percent, 100)}%` }} />
              </div>
              <span className="text-xs font-medium text-muted-foreground">{percent}%</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Billing toggle — Monthly [switch] Annual, like the live app */}
      <div className="flex items-center justify-center gap-3">
        <span
          className={cycle === 'monthly' ? 'text-sm font-medium text-foreground' : 'text-sm text-muted-foreground'}
        >
          Monthly
        </span>
        <Switch
          checked={cycle === 'annual'}
          onCheckedChange={(annual) => setCycle(annual ? 'annual' : 'monthly')}
          aria-label="Switch to annual billing"
        />
        <span
          className={cycle === 'annual' ? 'text-sm font-medium text-foreground' : 'text-sm text-muted-foreground'}
        >
          Annual
        </span>
      </div>

      {/* Plan cards — the live's header/body split, hover elevation, inline
          quota block, CTA above plain-check features. */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {PLAN_ORDER.map((id) => {
          const plan = PLANS[id]
          const monthly = effectiveMonthlyPrice(plan, cycle)
          const isCurrent = shownPlan === id

          return (
            <div
              key={plan.id}
              className={
                plan.popular
                  ? 'relative flex h-full flex-col overflow-hidden rounded-lg border border-primary bg-card shadow-md ring-1 ring-primary/20 scale-[1.02] transition-all hover:shadow-lg'
                  : 'relative flex h-full flex-col overflow-hidden rounded-lg border border-border bg-card shadow-sm transition-all hover:border-primary/20 hover:shadow-lg'
              }
            >
              {plan.popular && <div className="absolute left-0 right-0 top-0 h-1 gradient-primary" aria-hidden="true" />}
              <div className="flex flex-col space-y-1.5 p-6 pb-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-lg font-semibold tracking-tight text-foreground">{plan.name}</h3>
                  {plan.popular && (
                    <span className="gradient-primary rounded-full border-0 px-2 py-0.5 text-[10px] font-semibold text-primary-foreground">
                      POPULAR
                    </span>
                  )}
                </div>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="font-display text-3xl font-bold text-foreground xl:text-4xl">
                    {formatPrice(monthly)}
                  </span>
                  {plan.monthlyPrice > 0 && <span className="text-sm text-muted-foreground">/mo</span>}
                </div>
                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{plan.description}</p>

                {/* Live quota block: number + label inline under a hairline. */}
                <div className="mt-3 border-t border-border pt-3">
                  <span className="text-sm font-semibold text-foreground">
                    {plan.identificationLimit.toLocaleString()}
                  </span>
                  <span className="ml-1 text-xs text-muted-foreground">
                    {plan.limitPeriod === 'lifetime'
                      ? 'lifetime identifications'
                      : 'identifications / mo'}
                  </span>
                  {plan.overagePrice > 0 && (
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      then <span className="font-semibold text-foreground">{formatPrice(plan.overagePrice)}</span> per extra identification
                    </p>
                  )}
                </div>
              </div>

              <div className="flex flex-1 flex-col p-6 pt-0">
                <form action={formAction} className="mb-4">
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

                <ul className="flex-1 space-y-2.5">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
                      <Check className="mt-0.5 h-2.5 w-2.5 shrink-0 text-primary" aria-hidden="true" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )
        })}
      </div>

      {/* Enterprise — bordered card with the live's 2px outline CTA. */}
      <Card className="border-border shadow-sm">
        <CardContent className="flex flex-col items-center justify-between gap-4 p-6 pt-6 md:flex-row">
          <div>
            <h3 className="font-display text-lg font-bold text-foreground">Need 7,500+ identifications?</h3>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Custom pricing with volume discounts, SLA, dedicated infrastructure,
              and white-glove onboarding.
            </p>
          </div>
          <Button
            variant="outline"
            className="shrink-0 border-2 border-primary/30 bg-transparent font-semibold text-primary hover:bg-primary/10"
            asChild
          >
            <a href="mailto:sales@pixelco.example">Contact Sales</a>
          </Button>
        </CardContent>
      </Card>

      {/* FAQ — six static question cards like the live (R6-H6), not an
          accordion. */}
      <div>
        <h2 className="mb-6 text-center font-display text-xl font-bold text-foreground">
          Frequently Asked Questions
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          {FAQ.map((item) => (
            <Card key={item.q} className="shadow-sm transition-colors hover:border-primary/10">
              <CardContent className="p-6 pt-5 pb-4">
                <div className="flex items-start gap-3">
                  <CircleHelp className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">{item.q}</p>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{item.a}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
