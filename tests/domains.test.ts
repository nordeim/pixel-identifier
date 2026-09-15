import { beforeEach, describe, expect, it, vi } from 'vitest'
import { db } from '@/lib/db'
import {
  addDomainAction,
  deleteDomainAction,
  listDomainsAction,
} from '@/actions/domains'

let sessionUserId: string | null = null

vi.mock('next-auth', () => ({
  getServerSession: vi.fn(async () =>
    sessionUserId ? { user: { id: sessionUserId } } : null,
  ),
}))

async function createUser(plan = 'growth') {
  return db.user.create({
    data: {
      email: `domains-${crypto.randomUUID()}@test.example`,
      passwordHash: 'not-a-real-hash',
      plan,
    },
  })
}

function domainForm(domain: string): FormData {
  const form = new FormData()
  form.set('domain', domain)
  return form
}

describe('domains actions', () => {
  beforeEach(async () => {
    sessionUserId = null
    await db.user.deleteMany()
  })

  describe('addDomainAction', () => {
    it('registers a domain with a px_ site key and echoes the DTO', async () => {
      const user = await createUser('growth')
      sessionUserId = user.id

      const result = await addDomainAction(null, domainForm('https://www.My-Site.example'))

      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.data.domain).toBe('my-site.example')
        expect(result.data.siteKey).toMatch(/^px_[0-9a-f]{16}$/)
        expect(result.data.status).toBe('pending')
        expect(result.data.visitorCount).toBe(0)
      }
      const persisted = await db.site.findUniqueOrThrow({
        where: { siteKey: (result.ok ? result.data.siteKey : '') },
      })
      expect(persisted.domain).toBe('my-site.example')
    })

    it('rejects a duplicate domain for the same user', async () => {
      const user = await createUser()
      sessionUserId = user.id
      await addDomainAction(null, domainForm('dup.example'))

      const second = await addDomainAction(null, domainForm('dup.example'))
      expect(second.ok).toBe(false)
      if (!second.ok) expect(second.error.code).toBe('CONFLICT')
    })

    it('enforces the plan domain limit', async () => {
      const user = await createUser('free') // limit: 1
      sessionUserId = user.id
      await addDomainAction(null, domainForm('first.example'))

      const second = await addDomainAction(null, domainForm('second.example'))
      expect(second.ok).toBe(false)
      if (!second.ok) expect(second.error.code).toBe('FORBIDDEN')
    })

    it('rejects invalid domain input', async () => {
      const user = await createUser()
      sessionUserId = user.id

      const result = await addDomainAction(null, domainForm('not a domain'))
      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.error.code).toBe('VALIDATION')
        expect(result.error.fieldErrors?.domain).toBeDefined()
      }
    })
  })

  describe('listDomainsAction (F-19: counts must not load visitor rows)', () => {
    it('returns accurate visitor counts via _count', async () => {
      const user = await createUser()
      sessionUserId = user.id

      const added = await addDomainAction(null, domainForm('counted.example'))
      const siteKey = added.ok ? added.data.siteKey : ''
      const site = await db.site.findUniqueOrThrow({ where: { siteKey } })
      await db.visitor.createMany({
        data: [
          { siteId: site.id, anonymousId: 'visitor-0001' },
          { siteId: site.id, anonymousId: 'visitor-0002' },
          { siteId: site.id, anonymousId: 'visitor-0003' },
        ],
      })

      const domains = await listDomainsAction()
      expect(domains).toHaveLength(1)
      expect(domains[0].visitorCount).toBe(3)
      expect(domains[0].siteKey).toBe(siteKey)
    })

    it('splits identified vs total counts for the live row display (R5-M6)', async () => {
      const user = await createUser()
      sessionUserId = user.id

      const added = await addDomainAction(null, domainForm('split.example'))
      const siteKey = added.ok ? added.data.siteKey : ''
      const site = await db.site.findUniqueOrThrow({ where: { siteKey } })
      await db.visitor.createMany({
        data: [
          { siteId: site.id, anonymousId: 'anon-01' },
          { siteId: site.id, anonymousId: 'anon-02' },
          { siteId: site.id, anonymousId: 'id-01', email: 'a@x.com', type: 'individual' },
          { siteId: site.id, anonymousId: 'id-02', email: 'b@x.com', type: 'company', companyName: 'B Ltd' },
        ],
      })

      const domains = await listDomainsAction()
      // Live domains row: big number = identified visitors, small label
      // "N visitors" = total. The DTO must carry both.
      expect(domains[0].visitorCount).toBe(4)
      expect(domains[0].identifiedCount).toBe(2)
    })
  })

  describe('deleteDomainAction (F-26: ActionResult envelope)', () => {
    it('deletes an owned domain', async () => {
      const user = await createUser()
      sessionUserId = user.id
      const added = await addDomainAction(null, domainForm('gone.example'))
      const siteId = added.ok ? added.data.id : ''

      const form = new FormData()
      form.set('siteId', siteId)
      const result = await deleteDomainAction(null, form)

      expect(result.ok).toBe(true)
      expect(await db.site.findUnique({ where: { id: siteId } })).toBeNull()
    })

    it('cannot delete another user\'s domain (IDOR guard)', async () => {
      const owner = await createUser()
      const attacker = await createUser()
      sessionUserId = owner.id
      const added = await addDomainAction(null, domainForm('owners.example'))
      const siteId = added.ok ? added.data.id : ''

      sessionUserId = attacker.id
      const form = new FormData()
      form.set('siteId', siteId)
      const result = await deleteDomainAction(null, form)

      expect(result.ok).toBe(false)
      if (!result.ok) expect(result.error.code).toBe('NOT_FOUND')
      expect(await db.site.findUnique({ where: { id: siteId } })).not.toBeNull()
    })

    it('fails validation when siteId is missing', async () => {
      const user = await createUser()
      sessionUserId = user.id

      const result = await deleteDomainAction(null, new FormData())
      expect(result.ok).toBe(false)
      if (!result.ok) expect(result.error.code).toBe('VALIDATION')
    })
  })
})
