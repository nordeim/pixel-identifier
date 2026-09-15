import { describe, expect, it } from 'vitest'
import {
  PLANS,
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
