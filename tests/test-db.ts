import path from 'node:path'
import { fileURLToPath } from 'node:url'

const repoRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)))

/**
 * Test database: a dedicated SQLite file, isolated from the dev database.
 * The absolute path keeps PrismaClient resolution deterministic regardless
 * of the working directory vitest spawns workers in.
 */
export const TEST_DATABASE_URL = `file:${path.join(repoRoot, 'db', 'test.db')}`
