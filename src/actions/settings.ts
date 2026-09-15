'use server'

import { revalidatePath } from 'next/cache'
import { getServerSession } from 'next-auth'
import { db } from '@/lib/db'
import { authOptions } from '@/lib/auth'
import { updateProfileSchema, changePlanSchema, fail, type ActionResult } from '@/lib/validation'
import { PLANS } from '@/lib/plans'

async function requireUserId(): Promise<string> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) throw new Error('UNAUTHENTICATED')
  return session.user.id
}

export async function updateProfileAction(
  _prev: ActionResult<{ saved: true }> | null,
  formData: FormData,
): Promise<ActionResult<{ saved: true }>> {
  let userId: string
  try {
    userId = await requireUserId()
  } catch {
    return fail('UNAUTHENTICATED', 'You need to be signed in.')
  }

  const parsed = updateProfileSchema.safeParse({
    name: formData.get('name'),
    company: formData.get('company'),
    website: formData.get('website'),
  })
  if (!parsed.success) {
    const flat = parsed.error.flatten().fieldErrors
    return fail('VALIDATION', 'Please fix the highlighted fields.', flat as Record<string, string[]>)
  }

  const website = parsed.data.website?.trim()
  if (website && !/^https?:\/\/.+/i.test(website)) {
    return fail('VALIDATION', 'Website must be a full URL (https://…).', {
      website: ['Enter a full URL like https://yoursite.com'],
    })
  }

  await db.user.update({
    where: { id: userId },
    data: {
      name: parsed.data.name?.trim() || null,
      company: parsed.data.company?.trim() || null,
      website: website || null,
    },
  })

  revalidatePath('/dashboard/settings')
  return { ok: true, data: { saved: true } }
}

export async function changePlanAction(
  _prev: ActionResult<{ plan: string }> | null,
  formData: FormData,
): Promise<ActionResult<{ plan: string }>> {
  let userId: string
  try {
    userId = await requireUserId()
  } catch {
    return fail('UNAUTHENTICATED', 'You need to be signed in.')
  }

  const parsed = changePlanSchema.safeParse({
    plan: formData.get('plan'),
    cycle: formData.get('cycle'),
  })
  if (!parsed.success) {
    return fail('VALIDATION', 'Unknown plan selection.')
  }

  const plan = PLANS[parsed.data.plan]
  const current = await db.user.findUnique({
    where: { id: userId },
    select: { plan: true, identificationsUsed: true },
  })
  if (!current) return fail('UNAUTHENTICATED', 'Account not found.')

  // A downgrade must not strand more domains than the new plan allows.
  if (plan.domainLimit !== -1) {
    const siteCount = await db.site.count({ where: { userId } })
    if (siteCount > plan.domainLimit) {
      return fail('VALIDATION', `The ${plan.name} plan supports up to ${plan.domainLimit} domain${plan.domainLimit === 1 ? '' : 's'}. Remove domains before downgrading.`)
    }
  }

  // Billing is simulated in this clone: switching plans updates the entitlement
  // immediately. The used counter is NEVER reset — cycling plans must not
  // grant free quota — and the 30-day window anchor only advances when the
  // tier actually changes (a cycle-only switch keeps the current window).
  const changedTier = current.plan !== plan.id
  await db.user.update({
    where: { id: userId },
    data: {
      plan: plan.id,
      billingCycle: parsed.data.cycle,
      ...(changedTier ? { usagePeriodStart: new Date() } : {}),
    },
  })

  revalidatePath('/dashboard/pricing')
  revalidatePath('/dashboard')
  return { ok: true, data: { plan: plan.id } }
}

/**
 * Permanently delete the account. Cascades remove sites, visitors and
 * events. Returns a typed result instead of redirecting: the client calls
 * signOut() on success so the 30-day JWT session is destroyed together
 * with the account — otherwise the cookie would keep granting a ghost
 * dashboard until expiry (F-12).
 */
export async function deleteAccountAction(
  _prev: ActionResult<{ deleted: true }> | null,
  formData: FormData,
): Promise<ActionResult<{ deleted: true }>> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return fail('UNAUTHENTICATED', 'You need to be signed in.')

  const confirmEmail = String(formData.get('confirmEmail') ?? '').trim().toLowerCase()
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { email: true },
  })
  if (!user) return fail('UNAUTHENTICATED', 'Account not found.')

  if (confirmEmail !== user.email.toLowerCase()) {
    return fail('VALIDATION', 'Type your email exactly as shown to confirm deletion.')
  }

  await db.user.delete({ where: { id: session.user.id } })
  return { ok: true, data: { deleted: true } }
}
