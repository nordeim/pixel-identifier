'use server'

import bcrypt from 'bcryptjs'
import { headers } from 'next/headers'
import { db } from '@/lib/db'
import { signUpSchema, fail, type ActionResult } from '@/lib/validation'
import { PLANS, type BillingCycle, type PlanId } from '@/lib/plans'

const BCRYPT_ROUNDS = 12

/** Per-IP fixed-window throttle for the public sign-up action (F-14). */
const SIGNUP_LIMIT = 5
const SIGNUP_WINDOW_MS = 10 * 60_000
const signupBuckets = new Map<string, { count: number; windowStart: number }>()

function clientIp(requestHeaders: Headers): string {
  const forwarded = requestHeaders.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()
  return requestHeaders.get('x-real-ip') ?? 'unknown'
}

function signupThrottled(ip: string): boolean {
  const now = Date.now()
  const bucket = signupBuckets.get(ip)
  if (!bucket || now - bucket.windowStart >= SIGNUP_WINDOW_MS) {
    signupBuckets.set(ip, { count: 1, windowStart: now })
    return false
  }
  bucket.count += 1
  return bucket.count > SIGNUP_LIMIT
}

/**
 * Create an account. The subsequent sign-in is performed client-side with
 * next-auth/react (NextAuth v4 exposes signIn only as a client API); the
 * form redirects to /dashboard once the session cookie is set.
 *
 * Accepts an optional plan/cycle intent (?plan=growth&cycle=annual from the
 * marketing pricing cards) so the chosen plan survives the signup hop.
 */
export async function signUpAction(
  _prev: ActionResult<{ email: string }> | null,
  formData: FormData,
): Promise<ActionResult<{ email: string }>> {
  const parsed = signUpSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
    confirmPassword: formData.get('confirmPassword'),
  })
  if (!parsed.success) {
    const flat = parsed.error.flatten().fieldErrors
    return fail('VALIDATION', 'Please fix the highlighted fields.', flat as Record<string, string[]>)
  }

  const requestHeaders = await headers()
  if (signupThrottled(clientIp(requestHeaders))) {
    return fail('RATE_LIMITED', 'Too many sign-ups from this network. Please try again in a few minutes.')
  }

  // Optional plan intent — never trusted blindly: anything unknown falls
  // back to the free plan.
  const intentPlan = String(formData.get('plan') ?? 'free')
  const intentCycle = String(formData.get('cycle') ?? 'monthly')
  const plan: PlanId = intentPlan in PLANS ? (intentPlan as PlanId) : 'free'
  const cycle: BillingCycle = intentCycle === 'annual' ? 'annual' : 'monthly'

  const existing = await db.user.findUnique({ where: { email: parsed.data.email } })
  if (existing) {
    return fail('CONFLICT', 'An account with this email already exists.', {
      email: ['An account with this email already exists.'],
    })
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, BCRYPT_ROUNDS)
  try {
    await db.user.create({
      data: {
        email: parsed.data.email,
        passwordHash,
        name: parsed.data.email.split('@')[0],
        plan,
        billingCycle: cycle,
      },
    })
  } catch (error) {
    // The existence check above is advisory; the unique index is the real
    // guard. A concurrent duplicate signup surfaces as Prisma P2002, which
    // must cross the action boundary as a typed result, never a throw (F-05).
    if (
      error instanceof Error &&
      'code' in error &&
      (error as { code?: unknown }).code === 'P2002'
    ) {
      return fail('CONFLICT', 'An account with this email already exists.', {
        email: ['An account with this email already exists.'],
      })
    }
    throw error
  }

  return { ok: true, data: { email: parsed.data.email } }
}
