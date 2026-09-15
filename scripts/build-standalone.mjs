#!/usr/bin/env node
/**
 * Build the self-contained standalone deployment (round-4 plan R1).
 *
 * `next build` with `output: "standalone"` produces `.next/standalone/`
 * containing server.js + the traced node_modules — but NOT the static
 * assets or public dir. Serving that directory as-is ships a page whose
 * JS/CSS 404 (React never hydrates; forms native-GET-submit). This script
 * performs the copy step the Next docs require, so the output of
 * `npm run build:standalone` is deployable as a unit.
 */
import { cpSync, existsSync, mkdirSync, statSync } from 'node:fs'
import { execSync } from 'node:child_process'
import { join } from 'node:path'

const root = process.cwd()
const standalone = join(root, '.next', 'standalone')

function run(command) {
  execSync(command, { stdio: 'inherit', cwd: root })
}

console.info('[build:standalone] next build …')
run('npx next build')

const staticSource = join(root, '.next', 'static')
const staticTarget = join(standalone, '.next', 'static')
if (!existsSync(staticSource)) {
  console.error('[build:standalone] .next/static not found — did the build fail?')
  process.exit(1)
}
mkdirSync(join(standalone, '.next'), { recursive: true })
cpSync(staticSource, staticTarget, { recursive: true })
console.info('[build:standalone] copied .next/static → .next/standalone/.next/static')

const publicSource = join(root, 'public')
if (existsSync(publicSource) && statSync(publicSource).isDirectory()) {
  cpSync(publicSource, join(standalone, 'public'), { recursive: true })
  console.info('[build:standalone] copied public/ → .next/standalone/public')
} else {
  console.info('[build:standalone] no public/ directory — skipped (repo has none)')
}

console.info('[build:standalone] done. Deploy .next/standalone (e.g. `node server.js`).')
