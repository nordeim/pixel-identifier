import { defineConfig } from 'vitest/config'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { TEST_DATABASE_URL } from './tests/test-db.ts'

const repoRoot = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  resolve: {
    alias: {
      '@': path.join(repoRoot, 'src'),
    },
  },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts', 'tests/**/*.test.tsx', 'src/**/*.test.ts'],
    fileParallelism: false, // SQLite is single-writer; serialise test files
    testTimeout: 30000,
    hookTimeout: 30000,
    env: {
      DATABASE_URL: TEST_DATABASE_URL,
      TZ: 'UTC', // pin timezones so date-bucketing tests are deterministic
    },
    globalSetup: './tests/global-setup.ts',
    setupFiles: ['./tests/setup.ts'],
  },
})
