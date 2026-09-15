import { describe, expect, it } from 'vitest'
import { PLANS, PLAN_ORDER, getPlan } from '@/lib/plans'

describe('test harness smoke', () => {
  it('resolves the @ alias and loads the plan catalogue', () => {
    expect(PLAN_ORDER).toEqual(['free', 'starter', 'growth', 'scale'])
    expect(PLANS.free.identificationLimit).toBe(100)
    expect(PLANS.free.limitPeriod).toBe('lifetime')
    expect(PLANS.growth.limitPeriod).toBe('monthly')
  })

  it('falls back to the free plan for unknown ids', () => {
    expect(getPlan('enterprise').id).toBe('free')
  })
})
