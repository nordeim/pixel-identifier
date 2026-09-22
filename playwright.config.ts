import { defineConfig, devices } from '@playwright/test'

/**
 * E2E suite (R23-F8) — the browser-level regression net for behavior the
 * SSR-string vitest suite cannot see by construction (client state, dialog
 * lifecycles, navigation effects — e.g. the R23-F3 mobile-Sheet fix).
 *
 * Runs against the STANDALONE production build via `scripts/e2e-server.mjs`
 * (dedicated `db/e2e.db`, pushed + seeded on every boot — never the dev
 * database). Requires a prior `npm run build:standalone`; Playwright polls
 * `/api/health` for readiness (200 only when the DB answers).
 *
 *   npm run build:standalone && npm run test:e2e
 *
 * `E2E_BASE_URL` reuses an already-running server instead (CI / local
 * iteration); `E2E_PORT` overrides the default 3100.
 */
const PORT = Number(process.env.E2E_PORT ?? 3100)
const baseURL = process.env.E2E_BASE_URL ?? `http://127.0.0.1:${PORT}`

export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  expect: { timeout: 5_000 },
  // The e2e database is a single SQLite file — serialise the specs.
  fullyParallel: false,
  retries: 0,
  reporter: [['list']],
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: 'node scripts/e2e-server.mjs',
        url: `http://127.0.0.1:${PORT}/api/health`,
        reuseExistingServer: true,
        timeout: 120_000,
      },
})
