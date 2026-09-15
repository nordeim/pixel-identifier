import { beforeEach, describe, expect, it, vi } from 'vitest'
import { db } from '@/lib/db'
import { deleteAccountAction } from '@/actions/settings'

let sessionUserId: string | null = null
let sessionEmail: string | null = null

vi.mock('next-auth', () => ({
  getServerSession: vi.fn(async () =>
    sessionUserId ? { user: { id: sessionUserId, email: sessionEmail } } : null,
  ),
}))

async function createUserWithEmail(email: string) {
  const user = await db.user.create({
    data: {
      email,
      passwordHash: 'not-a-real-hash',
      name: 'Doomed User',
    },
  })
  const site = await db.site.create({
    data: {
      userId: user.id,
      domain: 'doomed.example',
      siteKey: `px_${crypto.randomUUID().replace(/-/g, '').slice(0, 16)}`,
    },
  })
  const visitor = await db.visitor.create({
    data: { siteId: site.id, anonymousId: 'v_doomed_0001', email: 'someone@example.com' },
  })
  await db.event.create({
    data: { siteId: site.id, visitorId: visitor.id, name: 'pageview', path: '/' },
  })
  return user
}

function confirmForm(email: string): FormData {
  const form = new FormData()
  form.set('confirmEmail', email)
  return form
}

describe('deleteAccountAction (F-12: typed result, no ghost sessions)', () => {
  beforeEach(async () => {
    sessionUserId = null
    sessionEmail = null
    await db.user.deleteMany()
  })

  it('deletes the account and cascades sites, visitors and events', async () => {
    const user = await createUserWithEmail('doomed@test.example')
    sessionUserId = user.id
    sessionEmail = 'doomed@test.example'

    const result = await deleteAccountAction(null, confirmForm('doomed@test.example'))

    expect(result.ok).toBe(true)
    expect(await db.user.findUnique({ where: { id: user.id } })).toBeNull()
    expect(await db.site.count()).toBe(0)
    expect(await db.visitor.count()).toBe(0)
    expect(await db.event.count()).toBe(0)
  })

  it('refuses deletion when the confirmation email does not match', async () => {
    const user = await createUserWithEmail('safe@test.example')
    sessionUserId = user.id
    sessionEmail = 'safe@test.example'

    const result = await deleteAccountAction(null, confirmForm('wrong@test.example'))

    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error.code).toBe('VALIDATION')
    expect(await db.user.findUnique({ where: { id: user.id } })).not.toBeNull()
    expect(await db.visitor.count()).toBe(1)
  })

  it('refuses deletion when unauthenticated', async () => {
    await createUserWithEmail('anon@test.example')
    const result = await deleteAccountAction(null, confirmForm('anon@test.example'))
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error.code).toBe('UNAUTHENTICATED')
  })
})
