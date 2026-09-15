'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
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

  // Billing is simulated in this clone: switching plans updates the entitlement
  // immediately. Downgrading below current usage keeps the used counter but the
  // next identification beyond the new limit simply will not resolve.
  await db.user.update({
    where: { id: userId },
    data: {
      plan: plan.id,
      billingCycle: parsed.data.cycle,
      usagePeriodStart: new Date(),
      ...(current.plan !== plan.id ? { identificationsUsed: 0 } : {}),
    },
  })

  revalidatePath('/dashboard/pricing')
  revalidatePath('/dashboard')
  return { ok: true, data: { plan: plan.id } }
}

export async function deleteAccountAction(formData: FormData): Promise<void> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/login')

  const confirmEmail = String(formData.get('confirmEmail') ?? '').trim().toLowerCase()
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { email: true },
  })
  if (!user) redirect('/login')

  if (confirmEmail !== user.email.toLowerCase()) {
    // No-op on mismatch; the dialog asks the user to retype the email.
    redirect('/dashboard/settings?error=email-mismatch')
  }

  // Cascades remove sites, visitors and events.
  await db.user.delete({ where: { id: session.user.id } })
  redirect('/?deleted=1')
}
