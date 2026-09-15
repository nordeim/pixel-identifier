/**
 * Plan catalogue — single source of truth for pricing, quotas and limits.
 * Prices are integer minor units (cents); floats never touch money.
 */

export type PlanId = 'free' | 'starter' | 'growth' | 'scale'
export type BillingCycle = 'monthly' | 'annual'

export interface Plan {
  id: PlanId
  name: string
  /** Monthly base price in cents. */
  monthlyPrice: number
  /** Annual discount applied to the monthly base (0.2 = 20% off). */
  annualDiscount: number
  description: string
  /** Identification allowance. `null` lifetime means a rolling monthly quota. */
  identificationLimit: number
  limitPeriod: 'lifetime' | 'monthly'
  /** Per-extra-identification price in cents. */
  overagePrice: number
  domainLimit: number // -1 = unlimited
  support: string
  features: string[]
  popular?: boolean
}

export const PLANS: Record<PlanId, Plan> = {
  free: {
    id: 'free',
    name: 'Free',
    monthlyPrice: 0,
    annualDiscount: 0,
    description: 'Test the waters — see what Pixelco can do',
    identificationLimit: 100,
    limitPeriod: 'lifetime',
    overagePrice: 0,
    domainLimit: 1,
    support: 'Community support',
    features: [
      '100 lifetime identifications',
      '1 domain',
      'Real-time dashboard',
      'CSV export',
    ],
  },
  starter: {
    id: 'starter',
    name: 'Starter',
    monthlyPrice: 7900,
    annualDiscount: 0.2,
    description: 'For small teams ready to convert more traffic',
    identificationLimit: 300,
    limitPeriod: 'monthly',
    overagePrice: 20,
    domainLimit: 3,
    support: 'Email support',
    features: [
      '300 identifications / month',
      '$0.20 per extra identification',
      '3 domains',
      'Email support',
    ],
  },
  growth: {
    id: 'growth',
    name: 'Growth',
    monthlyPrice: 24900,
    annualDiscount: 0.2,
    description: 'For growing businesses that need serious lead gen',
    identificationLimit: 1500,
    limitPeriod: 'monthly',
    overagePrice: 15,
    domainLimit: 10,
    support: 'Priority support',
    features: [
      '1,500 identifications / month',
      '$0.15 per extra identification',
      '10 domains',
      'Priority support',
    ],
    popular: true,
  },
  scale: {
    id: 'scale',
    name: 'Scale',
    monthlyPrice: 79900,
    annualDiscount: 0.2,
    description: 'For high-traffic sites and agencies',
    identificationLimit: 7500,
    limitPeriod: 'monthly',
    overagePrice: 10,
    domainLimit: -1,
    support: 'Dedicated support',
    features: [
      '7,500 identifications / month',
      '$0.10 per extra identification',
      'Unlimited domains',
      'Dedicated support',
    ],
  },
}

export const PLAN_ORDER: PlanId[] = ['free', 'starter', 'growth', 'scale']

export function getPlan(id: string): Plan {
  return PLANS[(id as PlanId) in PLANS ? (id as PlanId) : 'free']
}

/** Effective monthly price for a cycle, in cents. */
export function effectiveMonthlyPrice(plan: Plan, cycle: BillingCycle): number {
  if (cycle === 'annual') {
    return Math.round(plan.monthlyPrice * (1 - plan.annualDiscount))
  }
  return plan.monthlyPrice
}

/** Annual billed-once total for a plan, in cents (discount applied, rounded). */
export function annualTotalCents(plan: Plan): number {
  return Math.round(plan.monthlyPrice * 12 * (1 - plan.annualDiscount))
}

/** Badge label derived from the catalogue, e.g. "Save 20%". */
export function annualDiscountLabel(plan: Plan): string {
  return `Save ${Math.round(plan.annualDiscount * 100)}%`
}

export function formatPrice(cents: number): string {
  if (cents === 0) return '$0'
  const dollars = cents / 100
  return `$${dollars % 1 === 0 ? dollars.toFixed(0) : dollars.toFixed(2)}`
}
