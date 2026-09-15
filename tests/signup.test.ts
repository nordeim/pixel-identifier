import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { headers } from 'next/headers'
import { db } from '@/lib/db'
import { signUpAction } from '@/actions/auth'

function signupForm(email: string, extras: Record<string, string> = {}): FormData {
  const form = new FormData()
  form.set('email', email)
  form.set('password', 'Sup3rSecret!x')
  form.set('confirmPassword', 'Sup3rSecret!x')
  for (const [key, value] of Object.entries(extras)) form.set(key, value)
  return form
}

async function setClientIp(ip: string): Promise<void> {
  vi.mocked(headers).mockResolvedValue(new Headers({ 'x-forwarded-for': ip }))
}

describe('signUpAction', () => {
  beforeEach(async () => {
    await db.user.deleteMany()
    vi.mocked(headers).mockReset()
    vi.mocked(headers).mockResolvedValue(new Headers())
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('creates an account with a bcrypt hash and default free plan', async () => {
    const result = await signUpAction(null, signupForm('founder@test.example'))

    expect(result.ok).toBe(true)
    const user = await db.user.findUniqueOrThrow({ where: { email: 'founder@test.example' } })
    expect(user.plan).toBe('free')
    expect(user.passwordHash).not.toBe('Sup3rSecret!x')
    expect(user.passwordHash.startsWith('$2')).toBe(true)
  })

  it('honours a valid plan intent from the pricing page (F-28)', async () => {
    const result = await signUpAction(
      null,
      signupForm('growth-user@test.example', { plan: 'growth', cycle: 'annual' }),
    )

    expect(result.ok).toBe(true)
    const user = await db.user.findUniqueOrThrow({ where: { email: 'growth-user@test.example' } })
    expect(user.plan).toBe('growth')
    expect(user.billingCycle).toBe('annual')
  })

  it('falls back to free for an unknown plan intent', async () => {
    const result = await signUpAction(
      null,
      signupForm('safe-user@test.example', { plan: 'enterprise', cycle: 'monthly' }),
    )

    expect(result.ok).toBe(true)
    const user = await db.user.findUniqueOrThrow({ where: { email: 'safe-user@test.example' } })
    expect(user.plan).toBe('free')
  })

  it('returns CONFLICT (not a thrown P2002) on the duplicate race (F-05)', async () => {
    await db.user.create({
      data: { email: 'raced@test.example', passwordHash: 'not-a-real-hash' },
    })
    // Simulate the race: the existence check misses, the insert collides.
    vi.spyOn(db.user, 'findUnique').mockResolvedValue(null)

    const result = await signUpAction(null, signupForm('raced@test.example'))

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.code).toBe('CONFLICT')
      expect(result.error.fieldErrors?.email).toBeDefined()
    }
  })

  it('throttles sign-ups per IP (F-14)', async () => {
    await setClientIp('203.0.113.9')
    let lastResult: Awaited<ReturnType<typeof signUpAction>> | null = null
    for (let i = 0; i < 6; i++) {
      lastResult = await signUpAction(null, signupForm(`bot-${i}@test.example`))
    }

    expect(lastResult).not.toBeNull()
    expect(lastResult?.ok).toBe(false)
    if (lastResult && !lastResult.ok) {
      expect(lastResult.error.code).toBe('RATE_LIMITED')
    }
    // Only the first five accounts were created.
    expect(await db.user.count()).toBe(5)
  }, 30_000)

  it('does not throttle a different IP', async () => {
    await setClientIp('198.51.100.7')
    for (let i = 0; i < 3; i++) {
      await signUpAction(null, signupForm(`other-${i}@test.example`))
    }
    await setClientIp('198.51.100.8')
    const result = await signUpAction(null, signupForm('fresh@test.example'))
    expect(result.ok).toBe(true)
    expect(await db.user.count()).toBe(4)
  }, 30_000)

  it('rejects mismatched passwords with field errors', async () => {
    const form = new FormData()
    form.set('email', 'mismatch@test.example')
    form.set('password', 'Sup3rSecret!x')
    form.set('confirmPassword', 'Different!123')
    const result = await signUpAction(null, form)

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.code).toBe('VALIDATION')
      expect(result.error.fieldErrors?.confirmPassword).toBeDefined()
    }
  })
})
