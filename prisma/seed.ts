/**
 * Development seed — creates a demo account with realistic sample data so the
 * dashboard is explorable immediately after `npm run db:push && npm run db:seed`.
 *
 * Idempotent: it upserts by natural keys, so re-running never duplicates.
 * Never run against a production database.
 */
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { randomBytes } from 'crypto'

const db = new PrismaClient()

const DEMO_EMAIL = 'demo@pixelco.local'
const DEMO_PASSWORD = 'Demo123456!'
const DEMO_DOMAIN = 'demo-store.example.com'

interface VisitorSpec {
  vid: string
  email: string | null
  type?: 'individual' | 'company'
  companyName?: string
  /** B2B office location — "City, State, CC" like the live resolver output. */
  city?: string
  state?: string
  country?: string
  confidence?: number
  source: string
  paths: string[]
  daysAgo: number
}

const VISITORS: VisitorSpec[] = [
  {
    vid: 'demo_vid_sarah_001',
    email: 'sarah.chen@gmail.com',
    type: 'individual',
    confidence: 92,
    source: 'search',
    paths: ['/', '/pricing', '/features'],
    daysAgo: 1,
  },
  {
    vid: 'demo_vid_marcus_002',
    email: 'marcus.smith@acmecorp.com',
    type: 'company',
    companyName: 'Acme Corp',
    city: 'San Francisco',
    state: 'CA',
    country: 'US',
    confidence: 85,
    source: 'direct',
    paths: ['/', '/pricing'],
    daysAgo: 0,
  },
  {
    vid: 'demo_vid_jane_003',
    email: 'jane.doe@example.com',
    type: 'individual',
    confidence: 90,
    source: 'social',
    paths: ['/'],
    daysAgo: 0,
  },
  {
    vid: 'demo_vid_anon_004',
    email: null,
    source: 'referral',
    paths: ['/blog/getting-started'],
    daysAgo: 2,
  },
  {
    vid: 'demo_vid_anon_005',
    email: null,
    source: 'direct',
    paths: ['/', '/docs'],
    daysAgo: 3,
  },
]

/** Only file: databases or loopback hosts are considered local (F-20). */
function isLocalDatabase(url: string): boolean {
  if (url.startsWith('file:')) return true
  try {
    const parsed = new URL(url)
    return ['localhost', '127.0.0.1', '[::1]', '::1'].includes(parsed.hostname)
  } catch {
    return false
  }
}

async function main(): Promise<void> {
  const databaseUrl = process.env.DATABASE_URL ?? ''
  if (!isLocalDatabase(databaseUrl)) {
    throw new Error('Refusing to seed a non-local database.')
  }

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 12)
  const user = await db.user.upsert({
    where: { email: DEMO_EMAIL },
    update: {},
    create: {
      email: DEMO_EMAIL,
      passwordHash,
      name: 'Demo User',
      company: 'Demo Store Inc.',
      website: `https://${DEMO_DOMAIN}`,
      plan: 'free',
    },
  })

  const existingSite = await db.site.findFirst({
    where: { userId: user.id, domain: DEMO_DOMAIN },
  })
  if (existingSite) {
    const visitorCount = await db.visitor.count({ where: { siteId: existingSite.id } })
    if (visitorCount === VISITORS.length) {
      console.info('Seed already applied — demo data present, nothing to do.')
      return
    }
    // Partial seed (interrupted mid-run earlier): rebuild the graph cleanly
    // instead of reporting success with half the data (F-20).
    await db.site.delete({ where: { id: existingSite.id } })
  }

  const site = await db.site.create({
    data: {
      userId: user.id,
      domain: DEMO_DOMAIN,
      siteKey: `px_${randomBytes(8).toString('hex')}`,
      status: 'verified',
      lastEventAt: new Date(),
    },
  })

  let identifiedCount = 0
  for (const spec of VISITORS) {
    const firstSeen = new Date(Date.now() - spec.daysAgo * 86_400_000 - 3_600_000)
    const visitor = await db.visitor.create({
      data: {
        siteId: site.id,
        anonymousId: spec.vid,
        email: spec.email,
        type: spec.type ?? null,
        companyName: spec.companyName ?? null,
        city: spec.city ?? null,
        state: spec.state ?? null,
        country: spec.country ?? null,
        confidence: spec.confidence ?? null,
        source: spec.source,
        pageviews: spec.paths.length,
        firstSeen,
        lastSeen: new Date(Date.now() - spec.daysAgo * 86_400_000),
      },
    })

    let first = true
    for (const path of spec.paths) {
      await db.event.create({
        data: {
          siteId: site.id,
          visitorId: visitor.id,
          name: 'pageview',
          path,
          pageUrl: `https://${DEMO_DOMAIN}${path}`,
          createdAt: first ? firstSeen : new Date(firstSeen.getTime() + 300_000),
        },
      })
      first = false
    }

    if (spec.email) {
      identifiedCount += 1
      await db.event.create({
        data: {
          siteId: site.id,
          visitorId: visitor.id,
          name: 'identification',
          path: spec.paths[0],
          pageUrl: `https://${DEMO_DOMAIN}${spec.paths[0]}`,
          createdAt: firstSeen,
        },
      })
    }
  }

  await db.user.update({
    where: { id: user.id },
    data: { identificationsUsed: identifiedCount },
  })

  console.info(`Seeded demo account: ${DEMO_EMAIL} / ${DEMO_PASSWORD}`)
  console.info(`Domain: ${DEMO_DOMAIN} (verified) · ${VISITORS.length} visitors · ${identifiedCount} identified`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(() => void db.$disconnect())
