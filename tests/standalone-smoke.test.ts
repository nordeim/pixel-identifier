import { describe, expect, it } from 'vitest'
import { existsSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

/**
 * Round-4 plan R1 regression guard: the standalone deployment must ship its
 * static assets. Skipped unless PIXELCO_STANDALONE_SMOKE=1 because it needs
 * a build produced by `npm run build:standalone`.
 *
 *   PIXELCO_STANDALONE_SMOKE=1 npx vitest run tests/standalone-smoke.test.ts
 */
const enabled = process.env.PIXELCO_STANDALONE_SMOKE === '1'
const standalone = join(process.cwd(), '.next', 'standalone')

describe.skipIf(!enabled)('standalone deployment ships static assets', () => {
  it('.next/standalone/.next/static exists and contains chunks', () => {
    const staticDir = join(standalone, '.next', 'static')
    expect(existsSync(staticDir), 'run `npm run build:standalone` first').toBe(true)

    const chunks = readdirSync(join(staticDir, 'chunks'))
    expect(chunks.some((name) => name.endsWith('.js'))).toBe(true)
  })

  it('a referenced chunk is served by the standalone server', async () => {
    const { readdirSync: rd } = await import('node:fs')
    const chunksDir = join(standalone, '.next', 'static', 'chunks')
    const chunk = rd(chunksDir).find((name) => name.endsWith('.js'))
    expect(chunk).toBeTruthy()

    const port = 4399
    const child = (await import('node:child_process')).spawn(
      process.execPath,
      [join(standalone, 'server.js')],
      {
        env: {
          ...process.env,
          PORT: String(port),
          HOSTNAME: '127.0.0.1',
          DATABASE_URL:
            process.env.DATABASE_URL ?? 'file:' + join(standalone, 'prisma', 'db', 'pixelco.db'),
          NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ?? 'test-secret-for-smoke-only',
          NEXTAUTH_URL: `http://127.0.0.1:${port}`,
        },
        stdio: 'ignore',
      },
    )

    try {
      // Wait for the server to accept connections (up to 15 s).
      let up = false
      for (let attempt = 0; attempt < 30 && !up; attempt++) {
        await new Promise((resolve) => setTimeout(resolve, 500))
        try {
          const response = await fetch(`http://127.0.0.1:${port}/api/health`)
          up = response.ok || response.status === 503 // 503 = up but db unconfigured
        } catch {
          // not yet
        }
      }
      expect(up, 'standalone server never came up').toBe(true)

      const response = await fetch(
        `http://127.0.0.1:${port}/_next/static/chunks/${encodeURIComponent(chunk as string)}`,
      )
      expect(response.status).toBe(200)
      expect(response.headers.get('content-type')).toContain('javascript')
    } finally {
      child.kill('SIGKILL')
    }
  })
})
