'use server'

import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'
import { signUpSchema, fail, type ActionResult } from '@/lib/validation'

const BCRYPT_ROUNDS = 12

/**
 * Create an account. The subsequent sign-in is performed client-side with
 * next-auth/react (NextAuth v4 exposes signIn only as a client API); the
 * form redirects to /dashboard once the session cookie is set.
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

  const existing = await db.user.findUnique({ where: { email: parsed.data.email } })
  if (existing) {
    return fail('CONFLICT', 'An account with this email already exists.', {
      email: ['An account with this email already exists.'],
    })
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, BCRYPT_ROUNDS)
  await db.user.create({
    data: {
      email: parsed.data.email,
      passwordHash,
      name: parsed.data.email.split('@')[0],
    },
  })

  return { ok: true, data: { email: parsed.data.email } }
}
