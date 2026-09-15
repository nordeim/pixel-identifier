import { describe, expect, it } from 'vitest'
import {
  PLANS,
  PLAN_ORDER,
  annualDiscountLabel,
  annualTotalCents,
  effectiveMonthlyPrice,
  formatPrice,
  getPlan,
} from '@/lib/plans'

describe('plans catalogue', () => {
  it('exposes the four tiers with integer cents', () => {
    for (const plan of Object.values(PLANS)) {
      expect(Number.isInteger(plan.monthlyPrice)).toBe(true)
      expect(Number.isInteger(plan.overagePrice)).toBe(true)
    }
    expect(PLANS.growth.monthlyPrice).toBe(24900)
    expect(PLANS.scale.overagePrice).toBe(10)
  })

  it('falls back to free for unknown ids', () => {
    expect(getPlan('team').id).toBe('free')
    expect(getPlan('growth').id).toBe('growth')
  })
})

describe('money math (F-37: floats never reach the renderer)', () => {
  it('effectiveMonthlyPrice rounds annual discounts to whole cents', () => {
    expect(effectiveMonthlyPrice(PLANS.starter, 'monthly')).toBe(7900)
    expect(effectiveMonthlyPrice(PLANS.starter, 'annual')).toBe(Math.round(7900 * 0.8))
    expect(effectiveMonthlyPrice(PLANS.growth, 'annual')).toBe(19920)
  })

  it('annualTotalCents returns the rounded billed-once amount', () => {
    expect(annualTotalCents(PLANS.starter)).toBe(Math.round(7900 * 12 * 0.8))
    expect(annualTotalCents(PLANS.growth)).toBe(239040)
    expect(annualTotalCents(PLANS.free)).toBe(0)
  })

  it('derives the save badge from the catalogue instead of hardcoding', () => {
    expect(annualDiscountLabel(PLANS.growth)).toBe('Save 20%')
    expect(annualDiscountLabel(PLANS.free)).toBe('Save 0%')
  })

  it('formatPrice survives float-cent inputs', () => {
    expect(formatPrice(0)).toBe('$0')
    expect(formatPrice(7900)).toBe('$79')
    expect(formatPrice(19920)).toBe('$199.20')
    // 94800 * 0.8 === 75840.00000000001 in IEEE-754 — must still render $758.40.
    expect(formatPrice(94800 * 0.8)).toBe('$758.40')
    expect(formatPrice(10)).toBe('$0.10')
  })
})

describe('plan card catalogue matches the live app (round-4, G1)', () => {
  it('Free lists exactly the two live checklist items', () => {
    expect(PLANS.free.features).toEqual(['100 lifetime identifications', '1 domain'])
  })

  it('Growth is the one and only popular plan', () => {
    expect(PLANS.growth.popular).toBe(true)
    const popular = PLAN_ORDER.filter((id) => PLANS[id].popular)
    expect(popular).toEqual(['growth'])
  })

  it('paid checklists match the live cards verbatim', () => {
    expect(PLANS.starter.features).toEqual([
      '300 identifications / month',
      '$0.20 per extra identification',
      '3 domains',
      'Email support',
    ])
    expect(PLANS.growth.features).toEqual([
      '1,500 identifications / month',
      '$0.15 per extra identification',
      '10 domains',
      'Priority support',
    ])
    expect(PLANS.scale.features).toEqual([
      '7,500 identifications / month',
      '$0.10 per extra identification',
      'Unlimited domains',
      'Dedicated support',
    ])
  })
})
