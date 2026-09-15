import { beforeEach, describe, expect, it, vi } from 'vitest'
import { db } from '@/lib/db'
import { updateProfileAction } from '@/actions/settings'

let sessionUserId: string | null = null

vi.mock('next-auth', () => ({
  getServerSession: vi.fn(async () =>
    sessionUserId ? { user: { id: sessionUserId, email: 'who@example.com' } } : null,
  ),
}))

/**
 * Round-4 plan X1: the settings profile form matches the live app —
 * Company + Website (+ read-only email). The name field is no longer part
 * of the form contract.
 */
describe('updateProfileAction (live parity: company + website only)', () => {
  beforeEach(async () => {
    sessionUserId = null
    await db.user.deleteMany()
  })

  it('saves company and website submitted without a name field', async () => {
    const user = await db.user.create({
      data: { email: 'profile@example.com', passwordHash: 'x', name: 'Old Name' },
    })
    sessionUserId = user.id

    const form = new FormData()
    form.set('company', 'Acme Inc.')
    form.set('website', 'https://yoursite.com')

    const result = await updateProfileAction(null, form)
    expect(result.ok).toBe(true)

    const saved = await db.user.findUnique({ where: { id: user.id } })
    expect(saved?.company).toBe('Acme Inc.')
    expect(saved?.website).toBe('https://yoursite.com')
  })

  it('does not clobber the stored name when the field is absent', async () => {
    const user = await db.user.create({
      data: { email: 'keep-name@example.com', passwordHash: 'x', name: 'Kept Name' },
    })
    sessionUserId = user.id

    const form = new FormData()
    form.set('company', 'Beta LLC')

    const result = await updateProfileAction(null, form)
    expect(result.ok).toBe(true)

    const saved = await db.user.findUnique({ where: { id: user.id } })
    expect(saved?.name).toBe('Kept Name')
    expect(saved?.company).toBe('Beta LLC')
  })

  it('rejects a website that is not a full URL', async () => {
    const user = await db.user.create({
      data: { email: 'bad-url@example.com', passwordHash: 'x' },
    })
    sessionUserId = user.id

    const form = new FormData()
    form.set('website', 'yoursite.com')

    const result = await updateProfileAction(null, form)
    expect(result.ok).toBe(false)
  })

  it('rejects unauthenticated calls', async () => {
    const form = new FormData()
    form.set('company', 'Anon Co')
    const result = await updateProfileAction(null, form)
    expect(result.ok).toBe(false)
  })
})
