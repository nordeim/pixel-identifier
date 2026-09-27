import { PrismaClient } from '@prisma/client'

/**
 * R35 screenshot fixture (dev-db only): cross the 50/page activity
 * pagination threshold with 60 deterministic probe events so the footer
 * can be captured from the dev server. Usage:
 *
 *   node scripts/r35-activity-fixture.mjs insert   # add the probe events
 *   node scripts/r35-activity-fixture.mjs clean     # remove them
 *
 * The probe family (`/r35-e2e-probe-*`) matches the e2e fixture's paths —
 * the dev database is the only target (never db/e2e.db, which the e2e
 * server manages).
 */
const PROBE_PATH = '/r35-e2e-probe'
const PROBE_EVENT_COUNT = 60
const db = new PrismaClient({
  datasourceUrl: 'file:/home/z/my-project/pixel-identifier/db/custom.db',
})

const mode = process.argv[2]
if (mode !== 'insert' && mode !== 'clean') {
  console.error('usage: node scripts/r35-activity-fixture.mjs insert|clean')
  process.exit(2)
}

const site = await db.site.findFirst()
if (!site) throw new Error('dev db missing the seeded demo site')
const visitor = await db.visitor.findFirst({ where: { siteId: site.id } })
if (!visitor) throw new Error('dev db missing a seeded visitor')

if (mode === 'insert') {
  await db.event.deleteMany({ where: { path: { startsWith: PROBE_PATH } } })
  const now = Date.now()
  await db.event.createMany({
    data: Array.from({ length: PROBE_EVENT_COUNT }, (_, i) => ({
      siteId: site.id,
      visitorId: visitor.id,
      name: 'pageview',
      path: `${PROBE_PATH}-${String(i).padStart(2, '0')}`,
      pageUrl: `https://${site.domain}${PROBE_PATH}-${i}`,
      createdAt: new Date(now - i * 60_000),
    })),
  })
  const total = await db.event.count({ where: { siteId: site.id } })
  console.info(`inserted ${PROBE_EVENT_COUNT} probe events (total now ${total})`)
} else {
  const removed = await db.event.deleteMany({ where: { path: { startsWith: PROBE_PATH } } })
  console.info(`removed ${removed.count} probe events`)
}

await db.$disconnect()
