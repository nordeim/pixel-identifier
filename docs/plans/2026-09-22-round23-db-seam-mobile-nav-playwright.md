# Round-23 — DB Seam (`file:../db/custom.db`), Mobile-Nav Parity & Playwright E2E

**Date:** 2026-09-22 · **Session:** docs/session_20.md (R23) · **Base:** main @ 8cb18bd
(R22 ship 11cc95f + the user's session_20.md + `update env example` (085bd09) + merge
8cb18bd) · **Gate at base:** lint ✓ typecheck ✓ 596/59 tests ✓ (2 skipped) build ✓

## Scope

1. **The DB seam the user's `.env.example` documents (085bd09)** — make
   `DATABASE_URL="file:../db/custom.db"` actually resolve to `<repo>/db/custom.db`
   for the Prisma CLI, `next build`, and the running server alike, by implementing
   the `src/lib/db-path.ts` contract the file already references.
2. **Mobile navigation parity re-audit** (the round's focus) — marketing dropdown
   + dashboard mobile Sheet compared against the live at 375 px, with
   Tailwind v4 landmine checks (emission order, bare-var brackets, space-y).
3. **Playwright E2E suite** — added per the standing instruction (vitest already
   exists; Playwright is missing entirely), following the scandihaven
   pattern (`apps/web/playwright.config.ts`: production-build webServer,
   explicit ports, chromium).
4. Documentation, screenshots, and `pixel-identifier_SKILL.md` distillation.

## Audit evidence (8th probe generation — live verified 2026-09-22)

- **Live login + dashboard re-verified** (app.pixelco.io, probe account
  `sepnetflix2023@outlook.com`): desktop dashboard VLM comparison vs the
  local dev server → **STRUCTURAL MATCH** (data/empty-state differences only).
- **Live marketing mobile dropdown (375 px, opened + computed styles):**
  `display:flex; flex-direction:column; padding:16px 24px; gap:16px;
  background:rgb(255,255,255); border-bottom:1px`, 5 links (Benefits, How It
  Works, Pricing, FAQ, Start Identifying), link classes
  `text-sm font-medium text-muted-foreground`, CTA 327×40 px gradient
  `linear-gradient(135deg, rgb(255,170,0), rgb(255,206,10))`, dropdown
  height 217 px — **the clone matches every value** (verified same session).
- **Live mobile toggle icon: `lucide lucide-menu w-6 h-6` / `lucide-x w-6 h-6`
  (24 px, no size classes on the button).** The clone ships `h-5 w-5` (20 px)
  → 4 px short (F4).
- **Live dashboard mobile Sheet (375 px):** 288 px wide, white, 7 links —
  clone matches. **Clicking a link in the live's Sheet navigates AND CLOSES
  the sheet** (dialog unmounts, overlay gone). **The clone's Sheet stays
  OPEN** (`data-state=open`, overlay open, page blocked behind) — F3.
- **TW4 emission-order check (built CSS):** `.flex{display:flex}` (plain) at
  25609; `.md\:flex` + `.md\:hidden` inside `@media (min-width:48rem)` at
  151532/151555 — variants sort AFTER plain utilities, `md:hidden` correctly
  beats `flex` at ≥768 px, and the 767/768 boundary behaves symmetrically
  (toggle visible/desktop nav hidden at 767; inverse at 768). **No TW4
  ordering bug in the mobile nav** — the historical TW4 landmines
  (`w-[--sidebar-width]` brackets, `space-y` label/input, pre-rounded hex)
  are all documented and pinned.
- **Announcement bar byte divergences (live, full classes):**
  - Claim Now link: `inline-flex items-center gap-1 font-semibold underline
    underline-offset-2 hover:opacity-80 transition-opacity` — the clone
    ships `transition-opacity hover:opacity-80` (order reversed).
  - Arrow icon: `lucide lucide-arrow-right w-3.5 h-3.5` — clone `h-3.5 w-3.5`.
  - Dismiss button: `absolute right-4 top-1/2 -translate-y-1/2
    hover:opacity-70` — the clone adds a live-absent `transition-opacity`
    (its focus-visible chain stays as D5-class a11y chrome).
  - X icon: `lucide lucide-x w-4 h-4` — clone `h-4 w-4`.
  - The bar's gradient (`linear-gradient(135deg, rgb(255,170,0) 0%,
    rgb(255,217,26) 50%, rgb(245,143,0) 100%)`), height (60 px), Claim Now
    arrow presence and text match — visual parity holds; the divergences
    are class-string-order level (F5–F7).
- **DB seam root cause (empirically isolated, this session):**
  - **Prisma CLI** (`prisma db push` with `env("DATABASE_URL")` from `.env`)
    resolves a relative `file:` URL against the **`.env`/project root**, NOT
    the schema dir: `file:../db/custom.db` → `<repo-parent>/db/custom.db`
    (verified twice, including from `docs/` with `--schema ../prisma/…`).
    A schema-HARDCODED url resolves schema-relative (`<repo>/db/custom.db`)
    — the env indirection is what switches the anchor.
  - **Next dev-server runtime:** `@prisma/client`'s env loading REWRITES the
    URL (relativize against the generate-time schema dir, re-anchor against
    the `.env`/cwd base): with a clean restart, `.env`
    `DATABASE_URL="file:/abs/repo/db/custom.db"` surfaced in the server as
    `file:/home/z/my-project/db/custom.db` (one directory too high) →
    `Error code 14: Unable to open the database file` → `/api/health`
    degraded, dashboard dead. Relative `file:../db/custom.db` fails the
    same way.
  - **`datasourceUrl` (constructor) bypasses the rewriting entirely:** an
    ABSOLUTE `file:` URL via `datasourceUrl` connects in the exact same
    dev-server runtime (probe: `ok:true`); `file:../db/custom.db` via
    `datasourceUrl` also works in dev (generate-time schema dir intact).
  - Plain-node (tsx/vitest) contexts anchor schema-relative and work —
    which is why the 596-test suite and `db:seed` (with an absolute env
    override) stay green.
  - The user's `.env.example` (085bd09) documents the intended contract —
    relative `file:` URLs resolve against `prisma/schema.prisma`, i.e.
    `file:../db/custom.db` = `<repo>/db/custom.db`, implemented by
    `src/lib/db-path.ts` + pinned by `tests/db-path.test.ts` — **neither
    file exists**; the contract is currently aspirational (F1/F2).
  - `.env.example` also references `docs/DEPLOYMENT.md §4` — the file does
    not exist (F9).

## Findings

| ID | Severity | Finding | Action |
|----|----------|---------|--------|
| F1 | CRITICAL (functional) | `npm run db:push` / `db:seed` with `.env` `DATABASE_URL="file:../db/custom.db"` create/read the schema OUTSIDE the repo (`<repo-parent>/db/custom.db`) — Prisma CLI anchors env-indirected relative URLs at the `.env`/project root, not `prisma/` | FIX — `scripts/with-db-url.mjs` resolves the absolute URL (same rule as db-path) and re-execs; `db:push`/`db:seed` route through it |
| F2 | CRITICAL (functional) | The Next server runtime rewrites relative AND absolute `file:` env URLs against the wrong base (observed: repo-absolute URL surfaced as `<repo-parent>/…`) → `Error code 14`, `/api/health` degraded, dashboard dead | FIX — `src/lib/db-path.ts` (`resolveDatabaseUrl`: relative `file:` → absolute against the repo's `prisma/` dir; absolute/`postgresql://`/unset pass through) + `db.ts` passes `datasourceUrl` |
| F3 | HIGH (functional) | Dashboard mobile Sheet stays OPEN after a nav-link click (live closes: dialog unmounts, overlay gone) — verified live-vs-clone at 375 px | FIX — close on pathname change (the nextjs16-tailwind4 MobileNavSheet pattern) |
| F4 | MEDIUM (visual) | Marketing mobile toggle icon `h-5 w-5` (20 px) vs the live's `lucide-menu`/`lucide-x` `w-6 h-6` (24 px); touch target 4 px short | FIX — `w-6 h-6` on both Menu and X |
| F5 | LOW (byte) | Claim Now link order: live `hover:opacity-80 transition-opacity` tail; clone reversed | FIX |
| F6 | LOW (byte) | Claim Now arrow icon: live `w-3.5 h-3.5`; clone `h-3.5 w-3.5` | FIX |
| F7 | LOW (byte) | Dismiss button carries live-absent `transition-opacity`; X icon `h-4 w-4` vs live `w-4 h-4` (focus-visible chain stays — D5-class a11y chrome) | FIX |
| F8 | HIGH (infra) | No Playwright e2e suite (no config, no dependency, no specs) — the mobile-nav regressions (F3/F4) are invisible to the SSR-string vitest suite by construction | ADD — `playwright.config.ts` (standalone-build webServer on a dedicated port + `db/e2e.db`, chromium), `e2e/*.spec.ts`, `test:e2e` script, CI e2e job |
| F9 | DOCS | `.env.example` references `src/lib/db-path.ts`, `tests/db-path.test.ts`, `docs/DEPLOYMENT.md §4` — none exist | CREATE all three; final `.env.example` must match the shipped code |
| F10 | INFRA | `.env` (with `DATABASE_URL="file:../db/custom.db"` per the user instruction) + repo-root `db/` folder | CREATE (db/ already git-ignored via `/db/`) |
| F11 | FALSE ALARM (retracted) | `.github/workflows/ci.yml` push trigger *appeared* corrupted (`branches: ain]`) — a terminal display artifact: the literal `[main]` contains `[m`, which the earlier `cat -A` output rendering ate as an ANSI escape. The file on disk is correct (`branches: [main]`, YAML-valid) | No fix; CI gains the e2e job (F8) |
| — | non-findings | TW4 `md:hidden`/`flex` emission order (verified correct in the built CSS); marketing dropdown computed styles (byte-equal); desktop dashboard structure (VLM MATCH); announcement-bar gradient/arrow/height; Sheet width/links; sidebar-collapse persistence; hero H1 typography; 767/768 boundary; dashboard trigger icon (16 px, both sides) | document only |

## Interpretation rulings

- **The db-path contract is schema-dir-relative by design** (the .env.example
  wording): `file:../db/custom.db` means "`../db` from `prisma/schema.prisma`"
  = repo-root `db/`. This matches the generate-time behavior of the Prisma
  client (plain-node contexts) and the schema-hardcoded CLI behavior; the two
  places that disagree (CLI env indirection, Next-server env loading) are
  normalized by the wrapper + `datasourceUrl`.
- **Standalone/production stays absolute-path-first** (documented rule,
  AGENTS.md): `resolveDatabaseUrl` passes absolute URLs through untouched, so
  Docker/self-host deployments that set absolute paths are unaffected. The
  prisma-dir walk-up anchors on `prisma/schema.prisma` (from the module's own
  location, then cwd) and falls back to passthrough when no repo is found —
  never invents a path in a deployed tree.
- **F3 fix shape:** the Sheet's open state is DERIVED from the pathname
  (`sheetPathname !== null && sheetPathname === pathname`) — the Sheet is
  open only while the pathname is the one it was opened on, so any
  navigation (link click, back/forward) closes it with NO effect (the
  `react-hooks/set-state-in-effect` lint rule rejected the original
  `useEffect` idea; the derived pattern is the idiomatic React fix).
  Changes no pinned DOM strings and mirrors the live's observed behavior
  (navigate → dialog unmounts). The marketing dropdown already closes via
  per-link onClick (verified).
- **F4–F7 keep D5-class chrome:** the clone's aria-expanded/aria-label on the
  toggle and the focus-visible chain on the dismiss button are invisible
  a11y chrome (standing D5 ruling) — only the live's VISIBLE attributes
  (icon sizes, utility orders) are realigned.
- **E2E runs against the standalone artifact** (scandihaven E2E-1 lesson:
  production-only failure modes are invisible to the dev server):
  `npm run build:standalone` → boot `.next/standalone/server.js` on
  `127.0.0.1:3100` with `db/e2e.db` (pushed + seeded by the server script).
  `reuseExistingServer: true` allows a running server to be reused.
- **`verify` stays lint → typecheck → test → build.** E2E is a separate
  `npm run test:e2e` (needs the standalone build + a seeded e2e DB); CI gains
  a dedicated e2e job instead of widening the verify gate.

## TDD remediation plan

1. **RED `tests/db-path.test.ts`** (F2): relative `file:../db/custom.db` →
   absolute `<repo>/db/custom.db`; `file:./dev.db` → `<repo>/prisma/dev.db`;
   absolute `file:` and `postgresql://` and unset pass through unchanged.
   → **GREEN `src/lib/db-path.ts`** + wire `datasourceUrl` in `src/lib/db.ts`
   (remove the audit's temporary patch). Integration suites must stay green
   (vitest sets an absolute `TEST_DATABASE_URL` — passthrough).
2. **F1: `scripts/with-db-url.mjs`** — load `.env`, resolve via the same rule,
   re-exec the child with the absolute `DATABASE_URL`. Route `db:push` and
   `db:seed` through it (`npm pkg set`). Verify: fresh `rm db/custom.db` →
   `npm run db:push` → file lands at `<repo>/db/custom.db`; `npm run
   db:seed` seeds it; `npm run dev` (with `.env` =
   `file:../db/custom.db`) serves `/api/health` ok.
3. **RED `tests/mobile-nav-r23-parity.test.tsx`** (F3–F7): site-header
   Menu/X icons `w-6 h-6`; announcement-bar link/arrow/dismiss/X class
   strings (live orders); a source-level pin that the Topbar closes the
   mobile Sheet on pathname change. → **GREEN** in `site-header.tsx`,
   `announcement-bar.tsx`, `topbar.tsx`. Update any legacy pins that
   assert the old strings.
4. **F8 Playwright:** `npm i -D @playwright/test`; `playwright.config.ts`
   (chromium, `e2e/`, standalone webServer via `scripts/e2e-server.mjs` on
   port 3100 + `db/e2e.db`, `reuseExistingServer`, list reporter);
   `e2e/marketing.spec.ts` (landing chrome, mobile menu open → link →
   closes+navigates, login page), `e2e/dashboard.spec.ts` (demo login →
   KPIs render, sidebar nav, **mobile Sheet opens → link click → Sheet
   GONE (F3 regression)**, visitors + activity render),
   `e2e/pipeline.spec.ts` (`/api/health` ok, `/pixel.js` 200, `/api/track`
   beacon 204 → dashboard row count grows). `npm pkg set
   scripts.test:e2e="playwright test"`. CI: add an `e2e` job
   (build:standalone → playwright install chromium → test:e2e).
5. **F9/F10:** `.env` (final: `DATABASE_URL="file:../db/custom.db"`),
   `db/.gitkeep`-equivalent (folder exists, git-ignored),
   `docs/DEPLOYMENT.md` (§4 = the absolute-path production rule the
   `.env.example` cites; consolidate the README's deployment notes).
6. **Gate:** `npm run verify` (lint → typecheck → test → build) + `npm run
   test:e2e` + dev-server acceptance with the final `.env` value + zero
   console errors on affected surfaces.
7. **Docs:** README (DB seam, Testing section + Playwright, R23 bullet),
   AGENTS.md (db-path contract + commands + R23 facts), CLAUDE.md,
   PAD v1.22 (revision block + §4.3/§8/§9 + Known Issues), session_20
   R23 log, this plan's execution log, worklog.
8. **Screenshots:** `docs/screenshots/r23-*` — dev server: landing mobile
   (menu closed/open), dashboard mobile Sheet open + closed-after-nav,
   dashboard desktop, announcement bar close-up.
9. **`pixel-identifier_SKILL.md`** distilled via
   `skills/distill-codebase-skill` + `skills/to-distill-project-into-skill`.
10. **Ship:** cleanup temp artifacts (`scripts/db-resolution-probe.mjs`,
    `src/app/api/dbdiag/`), atomic Conventional Commits on main, push via
    `docs/ssh_git_wrapper_v3.py` (fingerprint match, dry-run, real push,
    remote verify), shred the operator key.

---

## Execution log

### TDD sequence

- **RED `tests/db-path.test.ts`** — 8 pins: the `.env.example` contract
  (`file:../db/custom.db` → `<repo>/db/custom.db`), schema-relative
  `./dev.db` / `./db/pixelco.db`, absolute/postgres/unset passthrough,
  env-read default, lexical normalization. 7 failed on first run (module
  missing) + 1 test-side fix (default-parameter semantics: unset ≠
  explicit `undefined` — the "unset" case now deletes the env var).
  **GREEN** `src/lib/db-path.ts` (walk-up anchors: module dir, then cwd;
  `[\s\S]` instead of the `/s` flag — tsconfig targets ES2017) + `db.ts`
  `datasourceUrl` (replacing the audit's temporary hardcoded patch).
  Suite: 596/59 → 604/60.
- **F1 wrapper** — `scripts/with-db-url.mjs` (readEnvFile + findPrismaDir +
  resolveDatabaseUrl mirroring db-path; spawn + error reporting), routed
  `db:push`/`db:seed` via `npm pkg set`. Debugging lesson: a stale
  shell-exported `DATABASE_URL` (this sandbox injects one into every shell
  invocation) overrode `.env` during acceptance — env-wins-over-.env is
  the designed precedence (matches Prisma); the acceptance was re-run with
  a per-invocation `unset`. Also fixed: silent ENOENT when `tsx` is not on
  PATH outside npm (the wrapper now reports spawn failures; npm scripts
  resolve node_modules/.bin themselves).
- **RED `tests/mobile-nav-r23-parity.test.tsx`** — 9 pins (toggle icons,
  Sheet-close derivation, announcement-bar orders). 7 failed on first run.
  **GREEN**: site-header `w-6 h-6` Menu/X; announcement-bar live-verbatim
  orders; topbar Sheet close. Mid-round pivot: the original
  `useEffect(() => setMobileNavOpen(false), [pathname])` fix tripped the
  `react-hooks/set-state-in-effect` lint error — rewritten as the DERIVED
  pattern (`sheetPathname === pathname`), which is effect-free and also
  closes on back/forward. Test-side fixes: an arrow-function `>` inside
  `[^>]*` broke the dismiss-button regex (now anchors on the aria-label
  then captures the className). Suite: 604/60 → 613/61.
- **F8 Playwright** — `npm i -D @playwright/test` (1.63.0) + chromium;
  `playwright.config.ts` (chromium, serialised, list reporter,
  health-gated webServer, `reuseExistingServer`, `E2E_BASE_URL`/`E2E_PORT`
  overrides); `scripts/e2e-server.mjs` (imports the wrapper's helpers —
  the wrapper gained an is-main guard so its body doesn't run on import;
  pushes+seeds `db/e2e.db`, boots `.next/standalone/server.js` on :3100
  with signal forwarding); `e2e/{marketing,dashboard,pipeline}.spec.ts`.
  First run 11/14 — the 3 failures were test-side (strict-mode dup links
  → scoped to the header nav; the demo-domain text appears twice →
  `.first()`; the collector contains `data-site`/`/api/track`, not
  `pixelco`). **14/14** after the fixes. `test:e2e` script + CI e2e job.
- **F9/F10:** `.env` final value `DATABASE_URL="file:../db/custom.db"`;
  `db/` at the repo root (git-ignored `/db/`); `docs/DEPLOYMENT.md`
  created (§1–§7, consolidating the README deployment notes + the §4
  absolute-path rule). `.gitignore` gained `/test-results/` +
  `/playwright-report/`.

### Post-fix verification

- **Gate:** lint ✓ typecheck ✓ **613/61** (2 skipped) build ✓
  (`npm run verify` exit 0).
- **DB acceptance (the user's exact `.env` value):** clean env →
  `npm run db:push` → `Datasource "db" … at
  file:<repo>/db/custom.db`, no stray parent-dir file; `npm run db:seed` →
  demo account seeded; dev server → `/api/health` `{"status":"ok","db":"up"}`.
- **E2E:** 14/14 chromium against the standalone build on :3100
  (`db/e2e.db`), incl. the Sheet-close regression and the beacon →
  Activity-Log loop.
- **Dev-server browser probes:** toggle icon `lucide lucide-menu w-6 h-6`
  (24 px, computed); mobile dropdown opens/closes; Sheet open → link
  click → /dashboard/visitors → `[data-mobile=true]` GONE; zero console
  errors on the affected surfaces.
- **VLM confirmations (2):** the open mobile menu vs the live capture →
  **MATCH**; the desktop dashboard vs the live → **STRUCTURAL MATCH**.
- **Screenshots (7, `docs/screenshots/r23-*`):** mobile-landing,
  mobile-menu-open, mobile-dashboard, mobile-sheet-open,
  mobile-sheet-closed-after-nav, dashboard-desktop,
  landing-announcement-bar.
- **Retraction:** F11 (CI trigger corruption) — display artifact; the
  workflow file was correct all along (YAML-valid, `branches: [main]`).
