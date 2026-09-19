'use client'

import { useActionState, useState } from 'react'
import { Check, Loader2, Zap } from 'lucide-react'
import { CircleHelpIcon } from '@/components/dashboard/live-icons'
import { changePlanAction } from '@/actions/settings'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
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
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Live summary banner: a tinted primary card (R6-H6). */}
      <Card className="shadow-sm border-primary/20 bg-primary/5">
        <CardContent className="p-6 pt-5 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold">
                You&apos;re on the <span className="text-gradient-primary capitalize">{PLANS[shownPlan].name}</span> plan
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {used} of {limit.toLocaleString()} identifications used ({period})
              </p>
              {overage > 0 && (
                <p className="mt-0.5 text-xs font-medium text-amber-800">
                  +{overage.toLocaleString()} extra identification{overage === 1 ? '' : 's'} — ≈ {overageCostLabel} at your plan&apos;s per-identification rate
                </p>
              )}
            </div>
            <div className="flex items-center gap-3">
              {/* R16: the live's usage bar carries no progressbar semantics. */}
              <div className="h-1.5 w-32 rounded-full bg-muted overflow-hidden">
                <div className="h-full rounded-full gradient-primary" style={{ width: `${Math.min(percent, 100)}%` }} />
              </div>
              <span className="text-xs font-medium">{percent}%</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Billing toggle — Monthly [switch] Annual, like the live app.
          R16: both labels always carry font-medium; the active side adds
          text-foreground, the inactive stays text-muted-foreground. */}
      <div className="flex items-center justify-center gap-3">
        <span
          className={cycle === 'monthly' ? 'text-sm font-medium text-foreground' : 'text-sm font-medium text-muted-foreground'}
        >
          Monthly
        </span>
        <Switch
          checked={cycle === 'annual'}
          onCheckedChange={(annual) => setCycle(annual ? 'annual' : 'monthly')}
        />
        <span
          className={cycle === 'annual' ? 'text-sm font-medium text-foreground' : 'text-sm font-medium text-muted-foreground'}
        >
          Annual
        </span>
      </div>

      {/* Plan cards — the live's header/body split, hover elevation, inline
          quota block, CTA above plain-check features. */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {PLAN_ORDER.map((id) => {
          const plan = PLANS[id]
          const monthly = effectiveMonthlyPrice(plan, cycle)
          const isCurrent = shownPlan === id

          return (
            <div
              key={plan.id}
              className={
                plan.popular
                  ? 'rounded-lg border bg-card text-card-foreground relative overflow-hidden transition-all hover:shadow-lg flex flex-col h-full border-primary shadow-md ring-1 ring-primary/20 scale-[1.02]'
                  : 'rounded-lg border bg-card text-card-foreground shadow-sm relative overflow-hidden transition-all hover:shadow-lg flex flex-col h-full hover:border-primary/20'
              }
            >
              {plan.popular && <div className="absolute top-0 left-0 right-0 h-1 gradient-primary" aria-hidden="true" />}
              <div className="flex flex-col space-y-1.5 p-6 pb-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold tracking-tight font-display text-lg">{plan.name}</h3>
                </div>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="font-display text-3xl xl:text-4xl font-bold">
                    {formatPrice(monthly)}
                  </span>
                  {plan.monthlyPrice > 0 && <span className="text-muted-foreground text-sm">/mo</span>}
                </div>
                <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{plan.description}</p>

                {/* Live quota block: number + label inline under a hairline. */}
                <div className="mt-3 pt-3 border-t border-border">
                  <span className="text-sm font-semibold">
                    {plan.identificationLimit.toLocaleString()}
                  </span>
                  <span className="text-xs text-muted-foreground ml-1">
                    {plan.limitPeriod === 'lifetime'
                      ? 'lifetime identifications'
                      : 'identifications / mo'}
                  </span>
                  {plan.overagePrice > 0 && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      then <span className="font-semibold text-foreground">{formatPrice(plan.overagePrice)}</span> per extra identification
                    </p>
                  )}
                </div>
              </div>

              <div className="p-6 flex flex-col flex-1 pt-0">
                <form action={formAction} className="mb-4">
                  <input type="hidden" name="plan" value={plan.id} />
                  <input type="hidden" name="cycle" value={cycle} />
                  {isCurrent ? (
                    <Button type="button" disabled variant="outline" size={null} className="h-10 px-4 py-2 w-full mb-4">
                      Current Plan
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      disabled={pending}
                      variant={null}
                      size={null}
                      className="gradient-primary text-primary-foreground shadow-lg glow-primary hover:opacity-90 transition-all duration-300 font-semibold h-10 px-4 py-2 w-full mb-4"
                    >
                      {pending ? (
                        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                      ) : (
                        <>
                          <Zap className="h-3.5 w-3.5 mr-1.5" aria-hidden="true" />
                          Get Started
                        </>
                      )}
                    </Button>
                  )}
                </form>

                <div className="space-y-2.5 flex-1">
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-start gap-2">
                      <div className="h-4 w-4 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="h-2.5 w-2.5 text-primary" aria-hidden="true" />
                      </div>
                      <span className="text-xs text-muted-foreground leading-relaxed">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Enterprise — bordered card with the live's 2px outline CTA.
          R17-F2: card root consumer `border-border bg-card` (twMerge
          displaces the base bg-card to the tail — reproduces the live
          order); body p-6 pt-6-first; CTA is a variant-free Button with
          the live's full consumer tail (transition-all displaces
          transition-colors, font-semibold displaces font-medium) — D1:
          the mailto behavior moves to onClick (the live's CSR button
          navigates client-side too). */}
      <Card className="border-border bg-card">
        <CardContent className="p-6 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="font-display text-lg font-bold">Need 7,500+ identifications?</h3>
            <p className="text-sm text-muted-foreground mt-0.5">
              Custom pricing with volume discounts, SLA, dedicated infrastructure,
              and white-glove onboarding.
            </p>
          </div>
          <Button
            variant={null}
            size={null}
            className="border-2 border-primary/30 bg-transparent text-primary hover:bg-primary/10 transition-all duration-300 font-semibold h-10 px-4 py-2 shrink-0"
            onClick={() => {
              window.location.href = 'mailto:sales@pixelco.example'
            }}
          >
            Contact Sales
          </Button>
        </CardContent>
      </Card>

      {/* FAQ — six static question cards like the live (R6-H6), not an
          accordion. */}
      <div>
        <h2 className="font-display text-xl font-bold text-center mb-6">
          Frequently Asked Questions
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          {FAQ.map((item) => (
            <Card key={item.q} className="shadow-sm hover:border-primary/10 transition-colors">
              <CardContent className="p-6 pt-5 pb-4">
                <div className="flex items-start gap-3">
                  <CircleHelpIcon className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <div>
                    {/* R16: the live's FAQ block — h4 + text-xs answer. */}
                    <h4 className="text-sm font-semibold mb-1">{item.q}</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">{item.a}</p>
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
