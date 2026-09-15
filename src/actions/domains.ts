'use server'

import { revalidatePath } from 'next/cache'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { addDomainSchema, normalizeDomain, fail, type ActionResult } from '@/lib/validation'
import { generateSiteKey } from '@/lib/identification'
import { getPlan } from '@/lib/plans'

export interface DomainDto {
  id: string
  domain: string
  status: string
  createdAt: string
  visitorCount: number
}

async function requireUserId(): Promise<string> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) throw new Error('UNAUTHENTICATED')
  return session.user.id
}

export async function addDomainAction(
  _prev: ActionResult<DomainDto> | null,
  formData: FormData,
): Promise<ActionResult<DomainDto>> {
  let userId: string
  try {
    userId = await requireUserId()
  } catch {
    return fail('UNAUTHENTICATED', 'You need to be signed in.')
  }

  const parsed = addDomainSchema.safeParse({ domain: formData.get('domain') })
  if (!parsed.success) {
    const flat = parsed.error.flatten().fieldErrors
    return fail('VALIDATION', 'Please enter a valid domain.', flat as Record<string, string[]>)
  }

  const domain = normalizeDomain(parsed.data.domain)
  if (!domain) {
    return fail('VALIDATION', 'That does not look like a valid domain.', {
      domain: ['Enter a domain like yoursite.com'],
    })
  }

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { plan: true, sites: { select: { id: true } } },
  })
  if (!user) return fail('UNAUTHENTICATED', 'Account not found.')

  const plan = getPlan(user.plan)
  if (plan.domainLimit !== -1 && user.sites.length >= plan.domainLimit) {
    return fail('FORBIDDEN', `The ${plan.name} plan includes ${plan.domainLimit} domain${plan.domainLimit === 1 ? '' : 's'}. Upgrade to add more.`)
  }

  const existing = await db.site.findFirst({ where: { userId, domain } })
  if (existing) {
    return fail('CONFLICT', 'That domain is already registered.', {
      domain: ['That domain is already registered.'],
    })
  }

  const site = await db.site.create({
    data: { userId, domain, siteKey: generateSiteKey(), status: 'pending' },
  })

  revalidatePath('/dashboard/domains')
  revalidatePath('/dashboard/install')
  revalidatePath('/dashboard')

  return {
    ok: true,
    data: {
      id: site.id,
      domain: site.domain,
      status: site.status,
      createdAt: site.createdAt.toISOString(),
      visitorCount: 0,
    },
  }
}

export async function deleteDomainAction(formData: FormData): Promise<void> {
  const userId = await requireUserId()
  const siteId = String(formData.get('siteId') ?? '')
  if (!siteId) return

  // Ownership check prevents cross-tenant deletion.
  await db.site.deleteMany({ where: { id: siteId, userId } })

  revalidatePath('/dashboard/domains')
  revalidatePath('/dashboard/install')
  revalidatePath('/dashboard')
}

export async function listDomainsAction(): Promise<DomainDto[]> {
  const userId = await requireUserId()
  const sites = await db.site.findMany({
    where: { userId },
    select: {
      id: true,
      domain: true,
      status: true,
      createdAt: true,
      lastEventAt: true,
      visitors: { select: { id: true, email: true } },
    },
    orderBy: { createdAt: 'desc' },
  })
  return sites.map((site) => ({
    id: site.id,
    domain: site.domain,
    status: site.status,
    createdAt: site.createdAt.toISOString(),
    visitorCount: site.visitors.length,
  }))
}
