import { describe, expect, it } from 'vitest'
import { execFileSync } from 'node:child_process'
import { existsSync, statSync } from 'node:fs'
import { join, resolve } from 'node:path'

/**
 * R8-F4 regression guard: the Round-7 repo history was re-created via web
 * uploads and every binary under public/ was silently dropped while the
 * components kept referencing them — production shipped 404 avatar images
 * and an empty benefits frame. This test walks the component tree for
 * /assets/… references and proves each one resolves to a real file on disk,
 * so the next lost-binary accident fails CI instead of production.
 */

const REPO_ROOT = resolve(__dirname, '..')
const PUBLIC_ROOT = join(REPO_ROOT, 'public')
const COMPONENTS_DIR = join(REPO_ROOT, 'src', 'components')

/** Matches static src="/assets/…" and template src={`/assets/…${n}.jpg`} literals. */
function collectAssetReferences(): string[] {
  const refs = new Set<string>()
  let out: string
  try {
    out = execFileSync('grep', ['-rn', '-o', '/assets/[A-Za-z0-9/_.{}$-]*', COMPONENTS_DIR], {
      encoding: 'utf-8',
    })
  } catch {
    // grep exits 1 when nothing matches — that itself is a defect now.
    out = ''
  }
  for (const raw of out.split('\n')) {
    const hit = raw.split(':', 1)[0] ? raw.slice(raw.indexOf('/assets/')) : ''
    if (!hit) continue
    refs.add(hit.trim())
  }
  return [...refs]
}

/** Expands the avatar template `/assets/avatars/avatar-${n}.jpg` to its five concrete URLs. */
function expandTemplate(ref: string): string[] {
  const m = ref.match(/^\/assets\/(.*)\$\{[^}]*\}(.*)$/)
  if (!m) return [ref]
  return [1, 2, 3, 4, 5].map((n) => `/assets/${m[1]}${n}${m[2]}`)
}

describe('marketing asset references resolve on disk', () => {
  it('components reference at least the live-parity assets (avatars + dashboard screenshot)', () => {
    const refs = collectAssetReferences()
    const flattened = refs.flatMap(expandTemplate)
    expect(
      flattened.some((r) => r.startsWith('/assets/avatars/avatar-')),
      'hero trust row must reference the avatar photos',
    ).toBe(true)
    expect(
      flattened.some((r) => r === '/assets/dashboard-visitors.png'),
      'benefits preview must reference the dashboard screenshot',
    ).toBe(true)
  })

  it('every referenced /assets/… URL exists as a non-empty file under public/', () => {
    const refs = collectAssetReferences().flatMap(expandTemplate)
    expect(refs.length, 'expected at least one asset reference to guard').toBeGreaterThan(0)
    for (const ref of refs) {
      const filePath = join(PUBLIC_ROOT, ref.replace('/assets/', 'assets/'))
      expect(existsSync(filePath), `${ref} is referenced by a component but missing from public/`).toBe(true)
      expect(statSync(filePath).size, `${ref} exists but is empty`).toBeGreaterThan(0)
    }
  })

  it('the avatar set is complete: avatar-1..avatar-5 all present', () => {
    for (const n of [1, 2, 3, 4, 5]) {
      const filePath = join(PUBLIC_ROOT, 'assets', 'avatars', `avatar-${n}.jpg`)
      expect(existsSync(filePath), `avatar-${n}.jpg missing — the hero trust row would render a broken image`).toBe(true)
    }
  })
})
