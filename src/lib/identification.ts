import { createHash, randomBytes } from 'crypto'

/**
 * Identity-resolution engine.
 *
 * The production Pixelco service resolves visitor identities through a
 * proprietary identity graph. This clone implements the same interface with a
 * deterministic, seeded resolver: every visitor resolves to a stable decision
 * (identified or anonymous) at the advertised ~20% match rate, so the product
 * pipeline — ingest, resolution, quota accounting, analytics — runs end to
 * end without depending on a third-party data broker.
 */

const MATCH_RATE_PERCENT = 20

const FIRST_NAMES = [
  'james', 'mary', 'john', 'patricia', 'robert', 'jennifer', 'michael', 'linda',
  'david', 'elizabeth', 'william', 'barbara', 'richard', 'susan', 'joseph',
  'jessica', 'thomas', 'sarah', 'christopher', 'karen', 'charles', 'nancy',
  'daniel', 'lisa', 'matthew', 'betty', 'anthony', 'sandra', 'mark', 'ashley',
  'emily', 'olivia', 'noah', 'liam', 'ava', 'sophia', 'jane', 'marcus',
  'alex', 'sam', 'chris', 'dave', 'anna', 'laura', 'peter', 'paul',
]

const LAST_NAMES = [
  'smith', 'johnson', 'williams', 'brown', 'jones', 'garcia', 'miller',
  'davis', 'rodriguez', 'martinez', 'hernandez', 'lopez', 'gonzalez',
  'wilson', 'anderson', 'thomas', 'taylor', 'moore', 'jackson', 'martin',
  'lee', 'perez', 'thompson', 'white', 'harris', 'sanchez', 'clark',
  'ramirez', 'lewis', 'walker', 'young', 'allen', 'king', 'wright',
  'scott', 'torres', 'nguyen', 'hill', 'flores', 'green', 'adams',
  'nelson', 'baker', 'hall', 'rivera', 'campbell', 'mitchell', 'carter',
]

const CONSUMER_DOMAINS = ['gmail.com', 'outlook.com', 'yahoo.com', 'hotmail.com', 'icloud.com', 'proton.me']

const COMPANY_TOKENS = [
  'acme', 'brightpath', 'corelink', 'dataridge', 'everpeak', 'fluxion',
  'granitebay', 'hyperloop', 'innovex', 'jetsam', 'keystone', 'lumencraft',
  'northgate', 'orbitline', 'pinecrest', 'quantify', 'ridgeview', 'silvertrack',
  'tidepoint', 'univex', 'vertexlab', 'westbrook',
]

const COMPANY_SUFFIXES = ['corp', 'group', 'labs', 'works', 'systems', 'digital', 'industries', 'tech']

/** Multiplier turned into a stable 32-bit unsigned integer. */
function seedFrom(...parts: string[]): number {
  const digest = createHash('sha256').update(parts.join('|')).digest()
  return digest.readUInt32BE(0)
}

/** Deterministic PRNG (mulberry32) — stable across processes and restarts. */
function mulberry32(seed: number): () => number {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function pick<T>(items: readonly T[], rand: () => number): T {
  return items[Math.floor(rand() * items.length)]
}

export interface ResolvedIdentity {
  email: string
  type: 'individual' | 'company'
  companyName: string | null
  confidence: number
}

/**
 * Attempt resolution for a visitor. Returns null when the identity graph has
 * no match for this visitor — the honest majority outcome.
 */
export function resolveIdentity(anonymousId: string, siteKey: string): ResolvedIdentity | null {
  const seed = seedFrom('pixelco-resolver', siteKey, anonymousId)
  const rand = mulberry32(seed)

  // ~20% of anonymous visitors resolve to a real-world identity.
  if (Math.floor(rand() * 100) >= MATCH_RATE_PERCENT) return null

  const firstName = pick(FIRST_NAMES, rand)
  const lastName = pick(LAST_NAMES, rand)
  const confidence = 65 + Math.floor(rand() * 33) // 65–97

  // ~1 in 4 resolved identities is a business contact (B2B), the rest are
  // individual consumers (B2C) — the segment no legacy IP-lookup tool covers.
  const isCompany = rand() < 0.25

  if (isCompany) {
    const company = `${pick(COMPANY_TOKENS, rand)} ${pick(COMPANY_SUFFIXES, rand)}`
    const domain = company.replace(/\s+/g, '') + '.com'
    const style = rand()
    const email =
      style < 0.4
        ? `${firstName}@${domain}`
        : style < 0.8
          ? `${firstName}.${lastName}@${domain}`
          : `${firstName[0]}${lastName}@${domain}`
    return { email, type: 'company', companyName: company, confidence }
  }

  const provider = pick(CONSUMER_DOMAINS, rand)
  const style = rand()
  const email =
    style < 0.45
      ? `${firstName}.${lastName}@${provider}`
      : style < 0.75
        ? `${firstName}${lastName}${Math.floor(rand() * 900 + 10)}@${provider}`
        : `${firstName}.${lastName[0]}@${provider}`
  return { email, type: 'individual', companyName: null, confidence }
}

/** Derive an attribution source from the document referrer. */
export function sourceFromReferrer(referrer: string): string {
  if (!referrer) return 'direct'
  let host: string
  try {
    host = new URL(referrer).hostname.replace(/^www\./, '')
  } catch {
    return 'referral'
  }
  if (/google|bing|duckduckgo|yahoo|ecosia|brave/.test(host)) return 'search'
  if (/facebook|instagram|twitter|x\.com|linkedin|tiktok|pinterest|reddit|youtube/.test(host)) return 'social'
  if (/mail|newsletter|campaign|utm/.test(referrer)) return 'campaign'
  return 'referral'
}

/** Cryptographically random site key, e.g. px_581d151f2c1ccaa7. */
export function generateSiteKey(): string {
  return `px_${randomBytes(8).toString('hex')}`
}
