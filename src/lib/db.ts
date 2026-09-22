import { PrismaClient } from '@prisma/client'
import { resolveDatabaseUrl } from '@/lib/db-path'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['query'],
    // R23-F2: hand the client an ABSOLUTE SQLite URL. @prisma/client's env
    // loading re-anchors relative (and even absolute) `file:` env URLs at
    // the wrong base inside the Next server runtime (SQLite error 14),
    // while `datasourceUrl` bypasses the rewriting. Relative URLs are
    // resolved schema-dir-relative — the .env.example contract
    // (`file:../db/custom.db` → <repo>/db/custom.db). See src/lib/db-path.ts.
    datasourceUrl: resolveDatabaseUrl(),
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
