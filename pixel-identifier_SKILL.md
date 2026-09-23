---
name: pixel-identifier
description: "Pixelco clone — cookieless visitor-identification SaaS: Next.js 16.3 App Router + React 19.3 + Tailwind v4 CSS-first + Prisma 6/SQLite + NextAuth v4 — marketing site, dashboard, tracking pixel, and identity-resolution pipeline, built to byte-level visual/functional parity with pixelco.io"
version: 1.0.0
last_updated: 2026-09-23
project_state: "R28 trend-chart axis-geometry parity: one drift family found + fixed (the chart's SVG internals — recharts default tick lines + both axis lines in hsl(220, 9%, 46%), margin {5,5,5,5}, comma-form HSL, 8px no-shadow tooltip; runtime byte-identical); no live redeploy; 693 vitest (69 files) + 21 e2e chromium green, PAD v1.27"
audience: "engineers + AI agents extending, debugging, onboarding, or replicating the Pixelco clone"
tags: [nextjs16, react19, tailwind-v4, prisma, sqlite, nextauth4, vitest, playwright, saas, visitor-identification, parity-clone]
---

# Pixelco Clone — Master Engineering Skill

> **How to use this document.** You are an agent about to work on the Pixelco
> clone (`pixelco.io`). **Do not guess** — this file is the single source of
> every hard-won lesson the codebase will not tell you by reading one file.
> - Building or styling UI → **§4 Design System + §5 Components + §17 Breakpoints + §19 Colors**
> - Database / `DATABASE_URL` trouble → **§9 Anti-Patterns + Appendix B (the DB seam)**
> - Test strategy / where a regression belongs → **§5 Layers + §11 Pre-Ship**
> - Shipping a change → **§11 Pre-Ship Checklist** (gates as bash, in order)
> - Mobile-nav or Tailwind v4 trouble → **§9 + §10 + §16**
> - Onboarding or "why is X like this?" → **§1 Identity + §12 Lessons + Appendix A (round history)**
>
> Every claim cites a file or a command that was executed against this
> codebase. If it is not cited, treat it as unverified. The live reference
> (`pixelco.io` / `app.pixelco.io`) is the final arbiter for visual parity;
> when the clone and this file disagree with the live, **match the live and
> update this file.**

---

## Table of Contents

1. [§1 Project Identity & Design Philosophy](#1-project-identity--design-philosophy)
2. [§2 Tech Stack & Environment](#2-tech-stack--environment)
3. [§3 Bootstrapping & Configuration](#3-bootstrapping--configuration)
4. [§4 The Design System (Code-First)](#4-the-design-system-code-first)
5. [§5 Component Architecture & Patterns](#5-component-architecture--patterns)
6. [§6 Custom Hooks Deep Dive](#6-custom-hooks-deep-dive)
7. [§7 Content Management & Data Ingestion](#7-content-management--data-ingestion)
8. [§8 Accessibility Implementation](#8-accessibility-implementation)
9. [§9 Anti-Patterns & Common Bugs](#9-anti-patterns--common-bugs)
10. [§10 Debugging Guide](#10-debugging-guide)
11. [§11 Pre-Ship Checklist](#11-pre-ship-checklist)
12. [§12 Lessons Learnt & How to Avoid Them](#12-lessons-learnt--how-to-avoid-them)
13. [§13 Pitfalls to Avoid](#13-pitfalls-to-avoid)
14. [§14 Best Practices](#14-best-practices)
15. [§15 Coding Patterns](#15-coding-patterns)
16. [§16 Coding Anti-Patterns](#16-coding-anti-patterns)
17. [§17 Responsive Breakpoint Reference](#17-responsive-breakpoint-reference)
18. [§18 Z-Index Layer Map](#18-z-index-layer-map)
19. [§19 Color Reference (Complete)](#19-color-reference-complete)
20. [§20 The Complete TypeScript Interface Reference](#20-the-complete-typescript-interface-reference)
- [Appendix A — Round History (R1–R26)](#appendix-a--round-history)
- [Appendix B — The DATABASE_URL Seam (Deep Dive)](#appendix-b--the-database_url-seam-deep-dive)
- [Appendix C — Live-Site Validation Methodology](#appendix-c--live-site-validation-methodology)
- [Appendix D — Audit History](#appendix-d--audit-history)
- [Quick Reference Card](#quick-reference-card)
- [The Meticulous Approach](#the-meticulous-approach)

---

## 1. Project Identity & Design Philosophy

**One sentence.** The Pixelco clone is a **production-grade, self-hosted
reimplementation of `pixelco.io`** — a cookieless visitor-identification SaaS
where anonymous website visitors are resolved to real email addresses —
consisting of a marketing site (landing + 8 sub-pages), an authenticated
dashboard, a first-party tracking pixel, and an identity-resolution pipeline,
specified in `Project_Architecture_Document.md v1.25` and iterated to parity
with the live across 26 audited rounds (R1–R26).

**Design thesis — amber-on-white SaaS with a neon data accent.** The live is
built on warm amber CTA gradients (`linear-gradient(135deg, rgb(255,170,0),
rgb(255,206,10))`), Inter body / Space Grotesk display typography, DM Sans
marketing pages, and a **neon green data accent (`#2BD4BD`)** reserved for
confidence bars, source badges, and install banners. Dark mode exists
(dashboard `oklch` tokens in `.dark`) but the live is light-first; the clone
mirrors the live's scope decisions (e.g. the marketing announcement bar is
light-only by design — verified R23).

**The parity mandate (non-negotiable).** This is a *parity clone*, not a
re-interpretation:
1. **Visual parity** — computed styles are compared against the live at
   375 px (mobile) and 1280 px+ (desktop) every round; class-string order
   divergences (e.g. `h-3.5 w-3.5` vs the live's `w-3.5 h-3.5`) are findings
   and get fixed even when the rendered result is identical (R23 F5–F7).
2. **Functional parity** — behaviors verified against the live: the mobile
   Sheet must close on link navigation (R23 F3), the sidebar collapse must
   persist across reloads, the tracking beacon must surface in Activity Log.
3. **Evidence discipline** — every round's findings live in
   `docs/plans/<date>-roundNN-*.md` with an execution log; screenshots in
   `docs/screenshots/` are named `rNN-*.png` and form the historical record.

**The CTA hierarchy.** `Claim Now` (announcement bar, amber gradient + arrow)
→ `Start Identifying` / `Get Started` (hero + nav, amber gradient) →
`Sign Up` (auth pages). Gradient buttons are generated by a shared
`gradient-buttons` utility (pinned by `tests/gradient-buttons.test.tsx`) —
never hand-roll a gradient.

**The anti-generic mandate.** No Bootstrap-grey cards, no purple/blue
"tech-platform" palette, no stock hero illustration — the live's actual
assets, copy, and feed animations (7 keyframes, §4) are replicated instead.
Marketing sub-pages are real content (8 routes + blog), not placeholder
shells.

---

## 2. Tech Stack & Environment

Locked versions from `package.json` / the installed tree (`node -e
"require('<pkg>/package.json').version"`, verified 2026-09-22):

| Layer | Technology | Version | Critical note |
|---|---|---|---|
| Framework | `next` | **16.3.5** | App Router only (no `pages/`); standalone build via `scripts/build-standalone.mjs` |
| UI runtime | `react` / `react-dom` | **19.3.0** | React 19 — effect-derived state can trip `react-hooks` lint; prefer derived state (§16) |
| Styling | `tailwindcss` | **4.3.3** | CSS-first `@theme inline` in `src/app/globals.css`; **no `tailwind.config.*`** — known TW4 landmines in §9/§13 |
| PostCSS | `@tailwindcss/postcss` | 4.x | via `postcss.config.mjs` |
| ORM | `prisma` / `@prisma/client` | **6.19.3** | SQLite default; the `env()`-indirection URL anchor bug → Appendix B |
| Auth | `next-auth` | **4.24.11** | Credentials provider, JWT sessions; **v4 API** (`getServerSession`), not v5 |
| Validation | `zod` | **4.6.5** | v4 — `z.string().email()` still works; no `.parse` deprecation issues observed |
| Charts | `recharts` | 2.15.4 | Dashboard trend chart (`src/components/dashboard/trend-chart.tsx`) |
| Icons | `lucide-react` | 0.525.0 | **Generation trap (R24-F4): the live's APP bundle pins 0.462.0** (old-gen bell, log-out, mail, users, download, search, code, shopping-bag + TrendingUp/Down polyline encoding) **while its marketing bundle ships the new gen** — 10 geometry overrides in `src/components/dashboard/live-icons.tsx`, scoped to dashboard contexts only; size via the live's exact class order (`w-6 h-6`, §1 parity rule) |
| Hashing | `bcryptjs` | ^3.0.2 | Password hashes in `prisma/seed.ts` and login |
| Unit tests | `vitest` | **5.0.0** | v5 CLI: `--pool=forks --maxWorkers=N` (no `--poolOptions.*` flag) |
| E2E | `@playwright/test` | **1.63.0** | chromium only; standalone-build webServer on :3100 |
| Types | `typescript` | 5.9.3 | `npm run typecheck` = `tsc --noEmit` |
| Lint | `eslint` / `eslint-config-next` | 9 / 16.1.1 | flat config `eslint.config.mjs` |
| Runtime | Node | ≥ 20 (`engines`) | dev uses `next dev` (Turbopack pool workers) |

**Environment variables** (`.env.example`, 3 keys — R23 final):

| Variable | Shape | Behavior |
|---|---|---|
| `DATABASE_URL` | `file:../db/custom.db` (SQLite, **relative to `prisma/schema.prisma`**) or `postgresql://…` or an absolute `file:` path | The seam: `src/lib/db-path.ts` resolves relative → absolute for the server runtime; `scripts/with-db-url.mjs` does the same for the Prisma CLI (Appendix B) |
| `NEXTAUTH_SECRET` | ≥32-char secret (`openssl rand -base64 32`) | JWT session signing — required at runtime |
| `NEXTAUTH_URL` | `http://localhost:3000` | v4 callback resolution |

The `db/` folder sits at the **repo root**, git-ignored via `/db/`
(`DATABASE_URL="file:../db/custom.db"` → `<repo>/db/custom.db` from the
schema dir). Production keeps the absolute-path rule (`docs/DEPLOYMENT.md §4`).

---

## 3. Bootstrapping & Configuration

**From zero to a running dev server** (Node ≥ 20, npm):

```bash
git clone https://github.com/nordeim/pixel-identifier.git
cd pixel-identifier
npm install
cp .env.example .env            # then set NEXTAUTH_SECRET
npm run db:generate             # prisma generate (client into node_modules)
npm run db:push                 # prisma db push → <repo>/db/custom.db (via wrapper)
npm run db:seed                 # demo account: demo@pixelco.io / demo1234
npm run dev                     # http://localhost:3000
```

Health check: `curl localhost:3000/api/health` → `{"status":"ok","db":"up"}`
(the route answers `"db":"down"` with HTTP 200 if the DB is unreachable —
a degraded-but-honest signal, `src/app/api/health/route.ts`).

**Scripts** (`package.json`):

| Script | What it does |
|---|---|
| `dev` / `build` / `start` | standard Next 16 |
| `build:standalone` | `node scripts/build-standalone.mjs` — production standalone tree (used by e2e + Docker) |
| `lint` / `typecheck` / `test` | eslint 9 / `tsc --noEmit` / `vitest run` |
| `db:push` / `db:seed` | **route through `scripts/with-db-url.mjs`** — resolves the relative `file:` URL to absolute before re-execing the Prisma CLI (Appendix B). Never call `prisma db push` directly with a relative env URL. |
| `verify` | `lint && typecheck && test && build` — the pre-ship gate (§11) |
| `test:e2e` | `playwright test` — builds nothing; run `npm run build:standalone` first |

**Configuration files** (all at repo root): `next.config.ts`
(`output: 'standalone'`, `serverExternalPackages` for bcrypt/prisma),
`tsconfig.json` (paths `@/* → src/*`; **includes `e2e/`** — specs are
typechecked), `eslint.config.mjs` (ignores `skills/`, `research/`,
generated trees), `vitest.config.mts` (jsdom + setup files), 
`playwright.config.ts` (§ E2E layout below), `postcss.config.mjs`
(`@tailwindcss/postcss`).

**Key exclusions baked into configs** — the `skills/` folder (236 vendored
skill docs) and `research/` are excluded from lint, typecheck, and build;
`/db/` (runtime databases) and Playwright artifacts (`/test-results/`,
`/playwright-report/`) are git-ignored.

**E2E layout** (`playwright.config.ts`): `testDir: './e2e'`, chromium only,
`fullyParallel: false` (single SQLite file), 30 s timeout, webServer =
`node scripts/e2e-server.mjs` polled at `http://127.0.0.1:3100/api/health`
(120 s timeout, `reuseExistingServer: true`). The server script pushes +
seeds a **dedicated `db/e2e.db`** on every boot — never the dev database.
`E2E_BASE_URL` reuses an already-running server (CI / local iteration).

**CI** (`.github/workflows/ci.yml`): install → `npm run verify` → e2e job
(standalone build + `test:e2e` against the ephemeral `db/e2e.db`).

---

## 4. The Design System (Code-First)

Everything lives in **`src/app/globals.css`** (Tailwind v4 CSS-first — there
is no `tailwind.config.ts`, and creating one is a §16 anti-pattern).

**Fonts** (`@theme inline`, R5-H1/R13-F11 — every stack chains the live's
system tail so the `←` arrow glyph renders):

```css
--font-sans: var(--font-inter), system-ui, sans-serif;          /* app body */
--font-display: var(--font-space-grotesk), system-ui, sans-serif; /* display */
--font-marketing: var(--font-dm-sans), system-ui, sans-serif;   /* marketing */
--font-script: var(--font-dancing-script);   /* "By Ai Viral" wordmark subtext */
--font-mono: "JetBrains Mono", monospace;    /* declared-not-loaded (matches live) */
```

Fonts load via `next/font` in `src/app/layout.tsx` (Inter, Space Grotesk,
DM Sans, Dancing Script as CSS variables `--font-*`).

**Color tokens** — shadcn-style OKLCH variables in `:root` (light) and
`.dark` (see §19 for the complete table), plus the **clone-specific hard
hexes measured off the live**:

```css
--color-neon-green: #2bd4bd;           /* data accent: confidence bars, source badges */
--color-neon-green-foreground: #073b32;
--color-hot-pink: #ec4699;             /* bell dot, auth-page glow */
/* --electric-blue (199 89% 48%) — accent-gradient stop */
```

**Radius scale** (R10 — measured off the live, **not** shadcn defaults):

```css
--radius-sm: calc(var(--radius) - 4px);
--radius-md: calc(var(--radius) - 2px);
--radius-lg: var(--radius);            /* 12px app base */
--radius-xl: calc(var(--radius) + 2px); /* +2, NOT +4 — the live's rounded-xl is 12/14px */
```

**The amber CTA gradient** (the brand's signature; generated by the
`gradient-buttons` utilities — `bg-gradient-to-br from-[#FFAA00] to-[#FFCE0A]`
family, pinned by `tests/gradient-buttons.test.tsx`). The announcement bar
carries its own 3-stop variant: `linear-gradient(135deg, rgb(255,170,0) 0%,
rgb(255,217,26) 50%, rgb(245,143,0) 100%)`, 60 px tall (R23 verified).

**Keyframes — exactly 7** (`globals.css`), all CSS-only (no JS animation):

| Name | Purpose |
|---|---|
| `feed-in` | live-feed row entrance |
| `feed-matching` | the identity-resolution "matching" phase |
| `feed-text-exit` / `feed-text-in` | anonymous→email text swap |
| `feed-badge-in` | confidence badge pop |
| `scroll-left` | logo marquee / scroll strip |
| `pulse-glow` | auth-page glow + install-banner shimmer |

**Custom utilities** — the repo defines `@utility` rules for the gradient
buttons and feed bits; all `@utility` names are pinned by
`tests/ui-primitives.test.tsx` / `tests/gradient-buttons.test.tsx`.
`prefers-reduced-motion` collapses reveal animations to opacity (§8).

**Typography roles**: body Inter 14–16 px; display Space Grotesk (hero H1,
dashboard stat numbers); marketing DM Sans; mono is a system stack (both
sides ship no mono webfont — R11). The marketing hero H1 letter-spacing is
pinned by `tests/marketing-hero.test.tsx`.

---

## 5. Component Architecture & Patterns

**The layer model** (mirrors the scandihaven reference architecture; enforced
by convention + tests, not lint boundaries):

```
src/app/**            route segments — thin; compose (marketing)-frame or dashboard chrome
  ├ (landing)/        the hero landing page (route group)
  ├ (marketing)/      about, blog (+ [slug]), docs, privacy, terms, gdpr, ccpa
  ├ dashboard/        7 pages: overview, visitors, activity, domains, install, pricing, settings
  ├ api/              5 routes: track, health, export, activity, auth/[...nextauth]
  └ login|signup|forgot-password
src/components/ui/        17 shadcn primitives (radix-based) — edit only for parity fixes
src/components/marketing/ 15 components — site-header, hero, features, live-feed, pricing-section…
src/components/dashboard/ 16 components — sidebar-shell, topbar, visitors-table, activity-feed…
src/components/auth/       4 components — auth-shell, login-form, signup-form, forgot-password-form
src/lib/                   18 modules — ALL data access, domain logic, and shared utilities
prisma/                    schema.prisma + seed.ts
tests/                     66 vitest files (65 run + 1 skipped)
e2e/                       3 playwright specs (14 tests)
scripts/                   with-db-url.mjs, e2e-server.mjs, build-standalone.mjs
```

**Component counts** (verified 2026-09-22): 79 `.tsx` under `src/`;
in `src/components` — 26 client (`'use client'`) vs 27 server. 19 `page.tsx`
routes + 5 API routes.

**Client vs Server decision tree:**
1. Server Component by default (all marketing pages render statically;
   `next build` emits them as `○ (Static)`).
2. `'use client'` only for: interactivity (accordion, sheet, dropdown),
   animation phases (`live-feed`), or browser APIs (`reveal-observer`'s
   IntersectionObserver).
3. Data fetching stays in Server Components / API routes; client components
   receive serialized props. The dashboard pages are server components that
   query via `src/lib/*` and hydrate interactive leaves.
4. `src/lib/**` must never import React components — it is the bottom layer.

**The `useChromeState` seam** (`src/components/dashboard/chrome-store.ts`):
the sidebar collapse + mobile-sheet state lives in one client store
(§6). Dashboard pages are server-rendered; only the chrome (sidebar,
topbar, sheet) hydrates.

**Auth pattern** — NextAuth **v4** credentials provider
(`src/lib/auth.ts`): pages use `getServerSession(authOptions)` in server
components; mutations post to server actions/API routes. Demo account
`demo@pixelco.io` / `demo1234` (`prisma/seed.ts`). Session gates:
`src/app/dashboard/layout.tsx` redirects unauthenticated users to `/login`.

**Parity-test pattern** — most vitest files are *source-reading* tests:
they read the component's source (`fs.readFileSync`) and pin class strings,
aria attributes, and structure against the live's verified DOM (the
`*-parity.test.tsx` / `*-rNN-parity.test.tsx` family). That means:
- **Editing a pinned class string breaks the matching test** — check the
  test's message for the round/finding ID (e.g. `R23-F4`) before "fixing" it.
- Behavior tests (jsdom + RTL) exist for flows: `visitors-selection`,
  `plan-switch`, `signup`, `track-route`.

**Where a regression belongs** (R23 ruling): SSR-string-visible changes →
vitest source-reading tests; client-state/dialog-lifecycle/navigation
behavior (e.g. "Sheet closes on nav") → **Playwright e2e** (`e2e/`); pure
functions → plain vitest. The R23-F3 mobile-Sheet bug was *invisible* to the
vitest suite by construction — that gap is why the e2e suite exists.

---

## 6. Custom Hooks Deep Dive

The clone deliberately has **exactly one exported custom hook** — everything
else is either a lib function (server-safe) or a radix primitive. This is a
scandihaven-pattern decision: state that must survive across the
server-rendered dashboard pages lives in one explicit store, not scattered
`useState` effects.

### `useChromeState()` — `src/components/dashboard/chrome-store.ts`

**Signature:** `function useChromeState(): ChromeState` — where
`ChromeState = { collapsed: boolean; toggleCollapsed: () => void; mobileOpen: boolean; setMobileOpen: (open: boolean) => void }`
(consult the source for the exact exported shape before extending).

**What it does:** owns the sidebar collapse (persisted to `localStorage`,
key verified by `tests/sidebar-chrome.test.tsx` / `tests/shell-parity.test.tsx`)
and the mobile Sheet open/close state for the whole dashboard chrome.

**Why it matters:**
- **Persistence across reloads** — the live remembers a collapsed sidebar;
  the clone must too (verified live-vs-clone R23).
- **SSR-safety** — the store hydrates client-side only; the server render
  emits the default (expanded) state, and hydration upgrades it. Reading
  `localStorage` during render would throw on the server — it is read in a
  guarded effect/initializer.
- **One source of truth** — `sidebar-shell.tsx`, `sidebar-nav.tsx`, and
  `topbar.tsx` all consume the same hook instance context, so the mobile
  Sheet and the desktop collapse can never disagree.

**Mobile Sheet close-on-navigation (R23-F3):** the open state is **derived
from `usePathname()`** — when the pathname changes, the derived state
recomputes closed; there is no `useEffect(() => setMobileOpen(false),
[pathname])`. The React-19 `react-hooks` lint flags effect-based
setState-on-pathname; the derived-state pattern is the sanctioned shape and
is pinned by `tests/mobile-nav-r23-parity.test.tsx` + the
`e2e/dashboard.spec.ts` Sheet-close regression.

**Cleanup patterns used elsewhere** (no hook, but same discipline):
`reveal-observer.tsx` disconnects its `IntersectionObserver` on unmount;
`live-feed.tsx`'s timers live inside CSS animation (no JS timers to leak).

---

## 7. Content Management & Data Ingestion

There is **no CMS** — all content is code, mirroring the live's static
marketing surfaces. Content lives in three layers:

**1. Marketing content** (`src/lib/marketing-links.ts`,
`src/lib/marketing-seo.ts`, `src/lib/app-seo.ts` + the component-level copy
pinned by parity tests):
- Nav links, footer links, and the 5 mobile dropdown links (Benefits, How
  It Works, Pricing, FAQ, Start Identifying) are shared constants —
  `tests/marketing-links.test.ts` pins them.
- Blog posts (`src/app/(marketing)/blog/`) and the docs page are real
  content pages; `tests/blog-posts.test.ts`, `tests/content-parity.test.tsx`
  pin titles/slugs.
- **Adding a blog post** = create the content module + add the slug to the
  index + update the parity test's expected list (3 files).

**2. The tracking pipeline** (the product's core loop):

```
<script src="/pixel.js?k=SITE_KEY">          src/app/pixel.js/route.ts (generated, cache headers)
  → beacon → POST /api/track                 src/app/api/track/route.ts
      → Site lookup by siteKey (must be 'verified')
      → Visitor upsert (siteId+anonymousId unique) + Event append
      → dashboard surfaces it
  → GET /api/activity?siteId=…               polling feed (dashboard)
  → GET /api/export?siteId=…                 CSV export (R21 parity)
```

- `src/lib/collector-script.ts` generates the pixel JS (pinned by
  `tests/collector-script.test.ts` — cache headers, no-cors beacon shape).
- `src/lib/identification.ts` is the identity-resolution engine
  (confidence, source: `direct | network | ip-lookup` — R21-F4 live
  semantics).
- `src/lib/analytics.ts` + `src/lib/quota.ts` compute stats and
  plan/identifications accounting (`plans.ts` holds the 4 plan tiers:
  `free | starter | growth | scale`).
- **The Event model is an append-only ledger** — never UPDATE an Event;
  visitor counters (`pageviews`, `lastSeen`) are the mutable projections.

**3. The database** (`prisma/schema.prisma`): 4 models — `User`, `Site`,
`Visitor`, `Event` — snake_case columns via `@map`, camelCase TS properties,
string enums (SQLite has no native enums), `onDelete: Cascade` from User
down. `prisma/seed.ts` seeds the demo user, a verified site, and visitors
with spread `firstSeen/lastSeen` (so the dashboard charts are non-empty on
first run — the R22 first-run parity requirement).

---

## 8. Accessibility Implementation

The parity rule dominates: **the live ships its own a11y chrome, and the
clone matches the live — no more, no less.** Concretely (R19–R24 audits):

- **Focus rings**: the live's focus-visible chains are replicated; the
  announcement-bar dismiss button keeps its focus-visible ring even though
  the live lacks `transition-opacity` there (R23-F7 ruling: the transition
  was live-absent and removed; the a11y ring stayed — a11y chrome is not
  trimmed for byte parity).
- **Touch targets**: the mobile toggle is 24 px icon / 40 px+ hit area
  (R23-F4 restored `w-6 h-6`); CTA buttons are 40 px tall at 375 px
  (verified).
- **ARIA**: radix primitives carry their own roles/aria (`sheet`, `dialog`,
  `accordion`, `dropdown-menu`). The marketing mobile dropdown uses a
  `md:hidden` disclosure — its open state is visible to the a11y tree
  (audited R23; the TW4 failure taxonomy in §10 covers what *would* break
  it).
- `prefers-reduced-motion` — the reveal animations (`reveal-observer`,
  `marketing-reveal.test.tsx`) collapse to opacity-only transitions;
  the 7 keyframes honor the media query in `globals.css`.
- **Skip-to-content / landmarks**: semantic landmarks (`header`, `main`,
  `nav`) on marketing pages; the dashboard uses `Sheet` with proper focus
  trapping (radix).
- **Verification**: parity tests pin aria attributes where the live ships
  them; zero console errors is an audited gate on every round (§11).

---

## 9. Anti-Patterns & Common Bugs

Historical findings, ordered by severity — each is fixed and pinned by
tests. The ID scheme (`RNN-FN` or `NN`) maps to
`docs/plans/*.md` and the parity tests' messages.

| ID | Severity | Anti-pattern | Fix + pin |
|----|----------|--------------|-----------|
| R23-F1 | CRITICAL | `prisma db push` with a relative `file:` URL via `env()` lands **outside the repo** (CLI anchors env URLs at the `.env`/project root, not the schema dir) | `scripts/with-db-url.mjs` resolves absolute + re-execs; `db:push`/`db:seed` route through it (Appendix B) |
| R23-F2 | CRITICAL | The Next server runtime **rewrites** relative *and absolute* `file:` env URLs to a wrong base → SQLite error 14, `/api/health` `db:"down"`, dead dashboard | `src/lib/db-path.ts` `resolveDatabaseUrl()` + `datasourceUrl` in `src/lib/db.ts`; pinned by `tests/db-path.test.ts` |
| R23-F3 | HIGH | Dashboard mobile Sheet stayed open after a nav-link click (live closes: dialog unmounts, overlay gone) | Derive open state from `usePathname()`; pinned by `tests/mobile-nav-r23-parity.test.tsx` + `e2e/dashboard.spec.ts` |
| R23-F4 | MEDIUM | Mobile toggle icon 20 px (`h-5 w-5`) vs the live's 24 px (`w-6 h-6`) — 4 px short touch target | `w-6 h-6` on Menu + X; pinned in the R23 parity test |
| R23-F5/F6/F7 | LOW (byte) | Class-order divergences vs the live (Claim Now link tail `hover:opacity-80 transition-opacity`, arrow `w-3.5 h-3.5`, dismiss-button stray `transition-opacity`, X `w-4 h-4`) | Byte-matched; pinned (§1 parity mandate) |
| R23-F8 | HIGH (infra) | **No e2e suite** — client-state regressions (F3) invisible to the SSR-string vitest suite by construction | Playwright config + 3 specs + CI e2e job |
| R24-F4 | HIGH | **Icon-generation drift**: the live's app bundle pins `lucide-react@0.462.0` (old-gen bell/log-out/mail/users/download/search/code/shopping-bag + TrendingUp polyline encoding) while its marketing bundle ships the new generation — a repo-wide icon upgrade silently breaks dashboard parity | 10 geometry-override components in `src/components/dashboard/live-icons.tsx` (R16-D4 pattern extended), scoped to dashboard surfaces only; pinned byte-level by `tests/live-icons-r24.test.tsx` |
| R24-F2 | HIGH | Install platform instructions were invented copy (e.g. WordPress via Theme File Editor — the live uses the "Insert Headers and Footers" plugin); the live wraps step literals in `<code>` chips (`text-xs bg-muted px-1.5 py-0.5 rounded font-mono`) and renders a per-tab snippet `<pre>` for WP/Shopify/GTM (HTML tab: steps only, no pre) | `platform-instructions.tsx` rewritten live-verbatim (rich-text steps, `siteKey`/`collectorUrl` props, optional `defaultValue` for tab pinning) + `buildPlatformSnippet()` in `src/lib/snippet.ts` (GTM = literal-siteKey variant); pinned by `tests/platform-instructions-r24.test.tsx` |
| R24-F6 | MEDIUM | "New This Week" card lacked the live's trend badge | `weekOverWeekChange()` in `src/lib/format.ts` (`((new−last)/last·100).toFixed(1)`, explicit `+` when ≥ 0, `""` when lastWeek=0 → no badge) + neon-green/destructive badge with legacy TrendingUp/Down `h-3 w-3 mr-0.5`; pinned |
| R24-F8 | MEDIUM | Export rendered `<a href download>` + `hidden sm:inline-flex` — the live ships a mobile-visible `<button>` (client-side download; `hover:opacity-90 transition-all duration-300 font-semibold h-9 rounded-md px-3`, icon `h-3.5 w-3.5 mr-1.5`) | `<button>` + onClick `window.location` assignment (`/api/export` stays the byte-format mechanism); pinned |
| R24-F3 | LOW (text) | Top Pages singularized "1 view" — the live never singularizes (`views.toLocaleString() + " views"`) | Plain `" views"` label; pinned in `tests/dashboard-r24-parity.test.tsx` |
| R24-F9 | LOW (byte) | Save pending state replaced the label with `Loader2 h-4 w-4` — the live keeps "Save Changes" and appends `LoaderCircle h-3.5 w-3.5 mr-1.5 animate-spin` (0.525's `Loader2` ≡ 0.462's `LoaderCircle` byte-for-byte) | Spinner rendered alongside the label; pinned |
| R24-F5 | LOW (byte) | Bell button class order `relative h-10 w-10` vs the live's `… h-10 w-10 relative` (its source is `size="icon"` + `className="relative"` → cva/twMerge displacement) | Byte-matched (R23 F5–F7 category) |
| R24-F1 | LOW (text) | Marketing copy: "company (if B2C)" vs the live's **B2B** (since at least R18); kickers "Perfect fit"/"Our process" vs the live's capitalized "Perfect Fit"/"Our Process" (invisible via `uppercase`, still wrong in source) | Byte-matched; pinned by `tests/marketing-r24-parity.test.tsx` |
| R24-F12 | DOCS | R14-F10's claim that the live swaps the 404 tab title was disproven (settled-load stays "Pixelco") — the clone's `NotFoundTitle` stays as an R14-D3-class value-add, but docs must not cite live parity for it | `src/app/not-found.tsx` comment + AGENTS.md R14-F10 note corrected |
| TW4-1 | HIGH | `w-[--sidebar-width]`-style **bare-var brackets** in TW4 emit `width: var(--sidebar-width)` without `var()` wrapping / silently break | Use `w-(--sidebar-width)` (TW4 var shorthand) or a plain style attribute; historical landmine — the sidebar uses the sanctioned form |
| TW4-2 | HIGH | **`space-y` between label and input** in forms — TW4's `space-y` uses `:where()` + margin-block, which can miss radix wrappers and visually collapse | Explicit `flex flex-col gap-*` on form fields (the auth forms follow this) |
| TW4-3 | MEDIUM | **Variant emission order** — assumption that `md:hidden` loses to `.flex`. Verified CORRECT in the built CSS (variants sort after plain utilities); do not "fix" this by reordering classes — the failure would come from CSS extraction bugs, not order | If a responsive class seems dead: check the built CSS (`grep '.md\\:hidden' .next/static/css/*.css`), not the source order (§10) |
| TW4-4 | MEDIUM | Pre-rounded hex in `--color-*` vars inside `@theme inline` (must be full 6-digit hex — `#2bd` ≠ `#2bd4bd` in some TW4 parse paths) | All hexes in `globals.css` are 6-digit; keep it that way |
| R21-F4 | MEDIUM | Visitor `source` semantics diverged from the live (`direct | network | ip-lookup`) | Enum-strings pinned in schema + `visitors-r21-parity.test.tsx` |
| R22 | HIGH | First-run dashboard must not be an empty shell (the live shows seeded-looking demo state) | Seed + empty-state parity pins: `dashboard-empty-r22-parity.test.tsx`, `activity-r22-parity.test.tsx` |

**Non-findings (do not "fix" these)** — TW4 `md:hidden`/`flex` order is
correct; marketing dropdown computed styles byte-equal the live; desktop
dashboard structure VLM-matches; announcement-bar gradient/height match;
Sheet width 288 px/7 links match; 767/768 boundary is symmetric (audited
R23 — re-verify against the live before touching). R24 additions: the
live's visitor rows are **inert** (no detail sheet — the clone's Sheet is
a value-add); the live's settings save is **silent** (PATCH 204 + refetch,
no toast — the clone's "Saved" line is a value-add); the live's Delete
button is **dead** (no handler, no dialog — the clone's typed-confirm flow
is a value-add); the live's Stripe metrics iframe and Notifications
toaster are billing/infra artifacts, not UI to clone; the 404 **body** is
byte-verbatim both sides; `/dashboard/billing` 404s on both sides.

---

## 10. Debugging Guide

### "The DB is down" (`/api/health` → `{"status":"ok","db":"down"}`)

1. `Error code 14: Unable to open the database file` in the dev-server log
   → the URL resolved to a **nonexistent directory**. Root cause is almost
   always the env-URL anchor (Appendix B). Check what the server actually
   sees: the error prints the rewritten path — if it points at
   `<repo-parent>/db/…` or one directory too high, you hit R23-F2.
2. Fix = `src/lib/db-path.ts` + `datasourceUrl` (already shipped). If it
   regressed: `npx vitest run tests/db-path.test.ts` first.
3. Verify the file exists: `ls -la db/` (repo root). If missing:
   `npm run db:push && npm run db:seed`.
4. **Stale-shell trap**: a `DATABASE_URL` exported in the shell overrides
   `.env` (Prisma precedence) and persists across commands in one session —
   `unset DATABASE_URL` before blaming the code.
5. Client caching: after changing DB env config, **restart the dev server**
   — the PrismaClient singleton (`globalForPrisma.prisma`) survives HMR.

### Mobile menu "doesn't work" (the TW4 triage tree)

1. **A11y tree vs computed style**: if the dropdown is in the accessibility
   tree but invisible on screen → CSS emission problem; if absent → JS/state
   problem. Inspect with `getComputedStyle` on the dropdown node.
2. **Built CSS check** (dev + prod differ — always confirm in the build):
   `grep -o '\.md\\:hidden[^}]*}' .next/static/css/*.css | head` — the
   rule must be inside `@media (min-width:48rem)` and sort AFTER plain
   `.flex{display:flex}`.
3. **Bare-var brackets**: `grep -rn '\[--' src/` — TW4 wants
   `w-(--var)` or `w-[var(--var)]`, never `w-[--var]`.
4. **Sheet won't close on nav** → the R23-F3 derived-state pattern
   (§6); regression test: `npx playwright test e2e/dashboard.spec.ts`.
5. **Boundary sanity**: 767 px shows toggle/hides desktop nav; 768 px
   inverse — if not, suspect a `md:` vs `sm:` typo, not TW4.

### Vitest native crash (`SIGABRT`, `uv_thread_create` assertion)

Vitest 5's default pool spawned too many workers for the box (2 cores /
4 GB). Re-run: `npx vitest run --pool=forks --maxWorkers=1
--no-file-parallelism`. (v5 CLI has no `--poolOptions.*` flags — that
flag name is a v4 relic.) Also kill stray `next dev` / browser processes
first — they eat the same memory.

### Build vs dev divergence

Always re-verify visual fixes against `npm run build && npm start` (or the
standalone build) — Turbopack dev and the prod CSS pipeline have emitted
differently ordered CSS historically (TW4-3).

### Parity-test failure after a "harmless" class edit

Read the failing assertion's finding ID first (`R23-F4`, `R19-H1`, …) —
these tests are the *contract* with the live. Either revert your edit or
(if the live genuinely changed) update the test AND the plan doc, and
re-verify against the live before pushing.

### Login loop / session issues

NextAuth **v4**: `NEXTAUTH_URL` must match the origin you browse from;
credentials login posts to `/api/auth/callback/credentials` (radix form →
signIn). Check `NEXTAUTH_SECRET` is set (≥32 chars). The seeded demo
account is `demo@pixelco.io` / `demo1234`.

---

## 11. Pre-Ship Checklist

Run in order — the exact gate the rounds ship under
(`npm run verify` bundles 1–4):

```bash
npm run lint          # 1. eslint 9 — zero warnings tolerated
npm run typecheck     # 2. tsc --noEmit — includes e2e/ specs
npm run test          # 3. vitest — expect 693 passed | 2 skipped (69 files)
npm run build         # 4. next build — all routes compile, no type errors
# 5. e2e (standalone build first):
npm run build:standalone && npm run test:e2e   # expect 21/21 chromium
```

**DB seam acceptance (when touching anything near the database):**

```bash
unset DATABASE_URL                     # kill shell-env staleness first
grep DATABASE_URL .env                 # expect file:../db/custom.db
npm run db:push                        # expect "at file:<repo>/db/custom.db"
ls ../db 2>/dev/null                   # MUST be "No such file" — no stray parent file
curl -s localhost:3000/api/health      # dev server → {"status":"ok","db":"up"}
```

**Visual verification** (mobile surfaces are where parity breaks):
- 375 px: marketing dropdown (opens, 5 links, CTA 327 px wide),
  dashboard Sheet (288 px, 7 links, **closes on link click**), toggle
  icon `lucide-menu w-6 h-6` (24 px).
- Desktop: dashboard vs `docs/app-pixelco_dashboard.png` reference;
  announcement bar gradient + arrow.
- Zero browser console errors on the touched surfaces.

**Documentation sync (per round):** update `README.md` (feature bullet +
test totals), `AGENTS.md`/`CLAUDE.md` (commands + non-obvious facts),
`Project_Architecture_Document.md` (version bump + affected sections),
`docs/session_20.md` (round log), the plan file's execution log, and this
SKILL.md's §12 when a new lesson lands. Verify claimed test counts by
re-running the suite — never copy stale numbers.

---

## 12. Lessons Learnt & How to Avoid Them

Numbered by round; each traces to a plan file + fix + pin.

1. **R19 — SEO surfaces are product.** The live ships per-route metadata,
   OG images, sitemap, robots. Lesson: add `src/lib/app-seo.ts` /
   `marketing-seo.ts` early and pin with `tests/seo-parity.test.ts` /
   `tests/seo-routes.test.ts`; late SEO work is retro-fitting.
2. **R19 — Gradient CTAs must be centralized.** Hand-rolled gradients
   drifted from the live's amber stops. Fix: shared gradient-button
   utilities + `tests/gradient-buttons.test.tsx`.
3. **R20 — Pricing states are interaction surfaces.** Monthly/annual
   toggle + disabled-domain states each have parity pins
   (`r20-pricing-*` screenshots). Lesson: capture both toggle states or
   the parity claim is half-true.
4. **R21 — Visitor table semantics live in the live.** `source` enum,
   confidence display, select behavior — all re-verified against the live
   before coding (R21-F4). Lesson: guess the enum, ship the wrong enum.
5. **R22 — First-run is a feature.** A freshly-seeded dashboard must look
   alive (the live's empty states carry copy + illustration structure,
   not blank tables). Pins: `dashboard-empty-r22-parity.test.tsx`.
6. **R22 — Activity feed pagination parity** — page-2 + footer states
   audited (`r22-activity-page2.png`). Lesson: parity applies to
   pagination edges, not just page 1.
7. **R23 — An aspirational contract in `.env.example` is a bug report.**
   The user's env example referenced `src/lib/db-path.ts` +
   `tests/db-path.test.ts` + `docs/DEPLOYMENT.md §4` — none existed yet.
   Lesson: read `.env.example` comments as *specifications*, and implement
   what they promise (Appendix B).
8. **R23 — The same env var means different things in different
   runtimes.** `DATABASE_URL` resolves relative `file:` URLs against
   THREE different anchors: schema dir (plain-node client + schema-
   hardcoded CLI), `.env`/project root (CLI via `env()` indirection), and
   a rewritten base (Next server env loading). Lesson: when a path "works
   in tests but not in dev", isolate the runtime before theorizing — the
   empirical matrix (Appendix B) came from one-variable probes.
9. **R23 — Client-state bugs are invisible to SSR-string tests.** The
   mobile Sheet staying open (F3) passed every vitest source-reading pin.
   Lesson: any behavior involving dialog lifecycle/navigation/effects
   needs a Playwright spec (e2e is the only net that catches it).
10. **R23 — Terminal output can lie.** The CI trigger *appeared* corrupted
    (`branches: ain]`) — a display artifact eating `` in the terminal.
    Retracted finding F11 after re-reading the file. Lesson: re-verify
    surprising findings with a different read method (`git show`,
    base64) before acting on them.
11. **R23 — Class-string order is parity, even when pixels match.** F5–F7
    fixed `h-3.5 w-3.5` → `w-3.5 h-3.5` divergences with zero visual
    delta. Lesson: the contract is the live's DOM bytes — future diffs
    stay cheap because today's bytes match.

---

## 13. Pitfalls to Avoid

**Database / environment**
- Don't call `prisma db push` / `prisma migrate` directly with a relative
  `file:` URL in `.env` — it anchors at the project root and escapes the
  repo (Appendix B). Use `npm run db:push` (the wrapper).
- Don't read `process.env.DATABASE_URL` in new code and hand it to
  Prisma — go through `src/lib/db.ts` (which passes
  `resolveDatabaseUrl()`), or you re-import the F2 bug.
- Don't commit `db/` (it's runtime data; `/db/` is git-ignored for a
  reason). Don't commit `.env` — only `.env.example` ships.

**Tailwind v4**
- Don't create `tailwind.config.ts` — the project is CSS-first
  (`@theme inline` in `globals.css`); a config file silently forks the
  design system.
- Don't use bare-var brackets `w-[--var]` — use `w-(--var)`; don't use
  `space-y` between label/input wrappers — use `flex flex-col gap-*`.
- Don't shorten hexes in `@theme inline` (`#2bd4bd`, never `#2bd`).
- Don't "fix" responsive classes by reordering them — TW4 emits variants
  after plain utilities by design (TW4-3 verified); check the built CSS
  first.

**React 19 / Next 16**
- Don't write `useEffect(() => setState(...), [dep])` for state that can
  be derived — the `react-hooks` lint flags it, and the derived form is
  the sanctioned pattern (R23-F3).
- Don't add `'use client'` "to be safe" — server components are the
  default and the static marketing routes depend on it.
- Don't import `@/lib/db` (or anything Prisma-touching) from a client
  component — data access is server-side by construction (§5 layering).

**Testing**
- Don't use `vi.fn()` directly inside a `vi.mock()` factory path without
  hoisting care — follow the existing test file patterns.
- Don't put JSX in `.test.ts` files (jsdom + `.tsx` for component tests;
  plain `.ts` for lib/parity-string tests — the split is existing
  convention).
- Don't widen a failing parity test's matcher to make it pass — that
  deletes the contract; re-verify against the live instead.
- Don't run e2e without `npm run build:standalone` first — the webServer
  script serves the standalone tree, not `npm run dev`.

**Process**
- Don't create git branches — everything commits to `main` (repo rule,
  push via the SSH wrapper per
  `docs/how-to-git-push-using-ssh-wrapper_SKILL.md`).
- Don't trust a green dev-server check alone — the gate is `npm run
  verify` + e2e + the DB acceptance (§11).
- Don't check / test / compile anything under `skills/` or `research/` —
  excluded by config and by standing instruction.

---

## 14. Best Practices

**Code organization**
- New pages: pick the closest existing route group and mirror it
  (`(marketing)/` frame for content pages, `dashboard/` chrome for app
  pages).
- New domain logic → `src/lib/<topic>.ts` (pure, server-safe, no React
  imports); new interactive leaf → `src/components/<area>/`.
- Constants shared across marketing surfaces → `src/lib/marketing-links.ts`
  so nav/footer/mobile consume one list.

**TypeScript**
- `interface` for object shapes, `type` for unions/intersections;
  `import type` for type-only imports (existing convention).
- Prisma types flow from the schema — don't hand-mirror model shapes in
  `src/types/`; derive or re-export.
- String enums in SQLite are TS union types (`'pending' | 'verified'`) —
  keep the comment in the schema the single documentation point.

**React / Next**
- Server Components by default; hydrate only the interactive leaves.
- One state owner for cross-cutting UI state (the `useChromeState`
  pattern — don't fork a second sidebar store).
- Data mutations: server actions or API routes with `getServerSession`
  guards; never trust client-side gating alone.

**Database**
- Migrations not push for schema changes in production contexts
  (`db:push` is the dev loop; the standalone/e2e scripts push their own
  DBs).
- Append-only Event ledger; visitor counters are projections (§7).
- Always `onDelete: Cascade` from User down — orphaned sites/visitors
  break the quota math.

**Testing**
- TDD per the repo instruction: RED (failing test citing the finding ID)
  → GREEN (minimal fix) → verify the whole gate (§11).
- Every visual fix pins BOTH a vitest source-reading assertion AND, when
  behavior is involved, an e2e step.
- Re-run counts before writing them into docs (§12 lesson 10's cousin —
  stale numbers are documentation bugs).

**Design**
- Brand colors via tokens (`neon-green`, `hot-pink`, gradient utilities)
  — never raw hexes in components (except inside `globals.css` itself).
- Sizes and class ORDER mirror the live's DOM bytes (§1 parity mandate);
  when in doubt, probe the live and record the finding.
- Animations: CSS-only keyframes from the 7-name set; no JS timers
  (the live uses none either).

---

## 15. Coding Patterns

### The DB seam (canonical usage)

```ts
// src/lib/db.ts — the ONLY PrismaClient construction in the repo
import { PrismaClient } from '@prisma/client'
import { resolveDatabaseUrl } from '@/lib/db-path'

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['query'],
    datasourceUrl: resolveDatabaseUrl(), // absolute URL — bypasses env rewriting
  })
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
```

```ts
// src/lib/db-path.ts — the resolution rule (R23-F2)
// relative file: URL → resolve against prisma/schema.prisma dir → absolute
// absolute file: / postgresql:// / unset → pass through untouched
// no prisma/ dir found (deployed standalone) → return as-is, never invent
export function resolveDatabaseUrl(raw?: string): string
```

### Derived navigation state (R23-F3 pattern)

```tsx
// inside the mobile Sheet owner (sidebar shell):
const pathname = usePathname()
// open state DERIVED: any pathname change recomputes closed — no effect,
// no setState-in-effect (react-hooks lint), closes on link navigation
// exactly like the live.
```

### Source-reading parity test (the house style)

```ts
// tests/<topic>-rNN-parity.test.ts(x)
const src = readFileSync(
  join(process.cwd(), 'src/components/marketing/site-header.tsx'), 'utf8')
test('R23-F4: mobile toggle icon is 24px like the live', () => {
  expect(src).toMatch(/lucide-menu[^>]*w-6 h-6/) // the live's exact class order
})
```

### API route (the track/health shape)

```ts
// src/app/api/<name>/route.ts — Next 16 route handler
export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json())     // zod at the boundary
  if (!parsed.success) return Response.json({ error: '…' }, { status: 400 })
  const session = await getServerSession(authOptions)    // auth guard (except track)
  // …lib call… — handlers stay thin, logic lives in src/lib
}
```

### Playwright spec (the e2e house style)

```ts
// e2e/dashboard.spec.ts — behavior, not pixels
test('R23-F3 regression: mobile Sheet closes after nav-link click', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 })
  await login(page)                    // helper against the seeded demo account
  await page.getByRole('button', { name: /menu/i }).click()
  const sheet = page.getByRole('dialog')
  await sheet.waitFor({ state: 'visible' })
  await sheet.getByRole('link', { name: 'Visitors' }).click()
  await expect(page).toHaveURL(/\/dashboard\/visitors/)
  await expect(sheet).toBeHidden()     // the live closes; the clone must too
})
```

### Prisma schema conventions (the scandihaven inheritance)

```prisma
model Example {
  id        String   @id @default(cuid())
  // camelCase TS property ↔ snake_case column
  userId    String   @map("user_id")
  createdAt DateTime @default(now()) @map("created_at")
  @@map("examples") // table name plural snake_case
}
// string "enums" with the allowed values in a comment (SQLite has no enums)
```

---

## 16. Coding Anti-Patterns

| Anti-pattern (don't) | Do instead |
|---|---|
| `new PrismaClient()` anywhere except `src/lib/db.ts` | import `db` from `@/lib/db` (singleton + seam) |
| `process.env.DATABASE_URL` consumed directly by new code | `resolveDatabaseUrl()` / the `db` singleton |
| `prisma db push` with a relative env URL | `npm run db:push` (the `with-db-url.mjs` wrapper) |
| `w-[--sidebar-width]` bare-var brackets | `w-(--sidebar-width)` |
| `space-y-2` between a radix label/input wrapper | `flex flex-col gap-2` |
| Creating `tailwind.config.ts` | tokens in `@theme inline` (`globals.css`) only |
| `useEffect(() => setOpen(false), [pathname])` | derive open state from `usePathname()` (F3 pattern) |
| `'use client'` on a static marketing section | keep it a Server Component |
| `<a href="/pricing">` for internal nav | `next/link` `<Link>` (both sides use it) |
| Hand-rolled `bg-gradient-to-br from-[#FFAA00]…` | the shared gradient-button utilities |
| Raw hex (`text-[#2BD4BD]`) in components | `text-neon-green` token utilities |
| `any` / `as any` to silence Prisma types | derive types from the schema / `import type` |
| Editing a parity test's matcher to "make it pass" | re-verify against the live, update test + docs together |
| `h-5 w-5` style icon sizing that "looks close" | the live's exact class order (`w-6 h-6` — F4) |
| Running e2e against `next dev` | standalone build via the webServer script (port 3100, `db/e2e.db`) |

---

## 17. Responsive Breakpoint Reference

Tailwind v4 defaults (no custom `--breakpoint-*` overrides in
`globals.css` — verified):

| Name | Query | Where the clone relies on it |
|---|---|---|
| (base) | < 640 px | mobile-first marketing styles |
| `sm` | ≥ 640 px | minor CTA sizing |
| `md` | **≥ 768 px (48rem)** | **THE nav breakpoint** — marketing `md:hidden` toggle / `md:flex` desktop nav; dashboard `md:hidden` Sheet trigger vs `md:flex` sidebar |
| `lg` | ≥ 1024 px | marketing grid columns, dashboard content max-widths |
| `xl` / `2xl` | ≥ 1280 / 1536 px | dashboard wide layout |

**The audited boundary facts (R23):**
- **767 px**: mobile toggle visible, desktop nav hidden (marketing);
  Sheet trigger visible, sidebar hidden (dashboard).
- **768 px**: inverse — desktop nav visible, toggle hidden. Verified
  symmetric on the clone AND consistent with the live's DOM
  (`md:hidden text-foreground` toggle).
- **375 px reference width** for all mobile parity probes (iPhone-class
  viewport the audits standardize on): marketing dropdown 217 px tall
  (5 links + CTA), CTA 327×40 px, dashboard Sheet 288 px wide.
- The announcement bar is full-width at every breakpoint (60 px tall).

When adding responsive behavior, reuse `md:` for nav-adjacent surfaces —
do not introduce a second nav breakpoint; the live uses exactly one.

---

## 18. Z-Index Layer Map

The clone uses the shadcn/radix convention (z-index lives in primitives,
not business components). Verified map:

| Layer | z-index | Source |
|---|---|---|
| Sheet overlay | `z-50` | `src/components/ui/sheet.tsx` (radix portal) |
| Sheet content | `z-50` | same |
| Dropdown menu | `z-50` | `src/components/ui/dropdown-menu.tsx` |
| Toast / toaster | `z-50` | `src/components/ui/toast.tsx` / `toaster.tsx` |
| Sticky marketing header | `z-40` | `src/components/marketing/site-header.tsx` |
| Dashboard sidebar/topbar | `z-30`/`z-40` (sticky chrome) | `sidebar-shell.tsx` / `topbar.tsx` |
| Announcement bar | `z-40` (sticky, above content) | `announcement-bar.tsx` |
| Base content | auto | everything else |

Rules: business components never invent `z-[999]`-style escapes; a new
overlay joins the radix `z-50` tier via its primitive. Portals mount at
`document.body` (radix default) — stacking-context bugs almost always mean
someone added `transform`/`filter` to a portal ancestor.

---

## 19. Color Reference (Complete)

**Light (`:root`, the default on every surface the live ships):**

| Token | Value | Notes |
|---|---|---|
| `--background` | `oklch(1 0 0)` | pure white |
| `--foreground` | `oklch(0.145 0 0)` | near-black |
| `--card` / `--popover` | `oklch(1 0 0)` | white cards on white bg (border-delineated, like the live) |
| `--primary` | `oklch(0.205 0 0)` | dark buttons |
| `--border` | `oklch(0.922 0 0)` | hairline borders |
| `--input` | `oklch(0.922 0 0)` | |
| `--ring` | `oklch(0.708 0 0)` | focus ring |
| `--destructive` | `oklch(0.577 0.245 27.325)` | |
| `--radius` | `0.625rem` (10 px marketing scope / 12 px app base) | R10 |

**Dark (`.dark` — dashboard theme toggle scope):** `--background
oklch(0.145 0 0)`, `--card/--popover oklch(0.205 0 0)`, `--border
oklch(1 0 0 / 10%)`, `--muted-foreground oklch(0.708 0 0)`, charts 1–5
in blue/green/yellow/purple/red OKLCH (see `globals.css` `.dark` block —
the complete list is the file; §4's rule: globals.css is the source of
truth).

**Brand hexes (hard-coded in `@theme inline`, measured off the live):**

| Token / usage | Hex / gradient | Where it appears |
|---|---|---|
| `--color-neon-green` | `#2BD4BD` | confidence bars, source badges, install banners |
| `--color-neon-green-foreground` | `#073B32` | text on neon-green |
| `--color-hot-pink` | `#EC4699` (rgb 236,70,153) | bell dot, auth-page glow |
| `--electric-blue` | `oklch(199 89% 48%)` | accent-gradient stop |
| CTA gradient | `135deg, #FFAA00 → #FFCE0A` (`rgb(255,170,0) → rgb(255,206,10)`) | gradient buttons |
| Announcement bar | `135deg, rgb(255,170,0) 0%, rgb(255,217,26) 50%, rgb(245,143,0) 100%` | 60 px bar |

**Verification discipline**: every hex above was re-read from
`globals.css` at distillation time (R23). If a future audit finds this
table and the CSS disagree, **the CSS wins and this table gets patched**.

---

## 20. The Complete TypeScript Interface Reference

The clone's types are deliberately thin — most shapes derive from Prisma.
The hand-written surfaces (read each file for the authoritative fields):

| Module | Exports | Notes |
|---|---|---|
| `src/lib/plans.ts` | `Plan` type/tiers (`free | starter | growth | scale`), plan metadata | 4 plans, monthly/annual pricing, quota per plan |
| `src/lib/quota.ts` | quota computation helpers | `identificationsUsed` vs plan quota |
| `src/lib/identification.ts` | identity-resolution types (`source: 'direct' | 'network' | 'ip-lookup'`, confidence) | R21-F4 semantics |
| `src/lib/analytics.ts` | stats/aggregate types for dashboard cards + trend chart | |
| `src/lib/sites.ts` | site lookup/creation types | `status: 'pending' | 'verified'` |
| `src/lib/snippet.ts` | the install-snippet builder + `buildPlatformSnippet()` (per-platform tab snippets, GTM literal-siteKey variant) | pinned by `tests/snippet.test.ts` + `tests/platform-instructions-r24.test.tsx` (R24-F2) |
| `src/lib/validation.ts` | zod schemas (signup/login/domain forms) | zod-at-the-boundary |
| `src/lib/format.ts` | formatting helpers incl. `weekOverWeekChange()` (trend-badge math) | pinned by `tests/format.test.ts` (R24-F6) |
| `src/components/dashboard/chrome-store.ts` | `ChromeState` + `useChromeState()` | §6 |
| Prisma-generated | `User`, `Site`, `Visitor`, `Event` (+ payload types) | derive; don't hand-mirror |

**Schema shape summary** (`prisma/schema.prisma`):
- `User 1—n Site`, `Site 1—n Visitor`, `Site 1—n Event`
  (all `onDelete: Cascade`).
- `Visitor` unique `(siteId, anonymousId)`; `Site` unique `siteKey` and
  `(userId, domain)`; indexes on `(userId)` and `(siteId, lastSeen)`.
- String enums: plan, billingCycle, site status, visitor type/source/status
  (comments in the schema document the allowed values).

---

## Appendix A — Round History

The project iterates in audited "rounds" (R1–R27); each plan lives in
`docs/plans/<date>-roundNN-*.md` with findings, rulings, and an execution
log. Key milestones (see `docs/session_*.md` + `docs/worklog.md` for the
full record):

| Round | Focus |
|---|---|
| R1–R10 | foundations: stack bring-up, design system, marketing sections, typography + radius calibration (R10's `rounded-xl` +2 ruling) |
| R11 | font stacks + fallbacks (the `←` glyph fix), theme scoping |
| R13–R18 | marketing parity waves (sub-pages, banners, compare CTA, reveal animations) |
| R19 | SEO surfaces, CTA banner, hero feed, gradient centralization |
| R20 | pricing monthly/annual, domains enabled/disabled, feed reveal |
| R21 | visitors table semantics (source enum, selects), export CSV, first dashboard overview |
| R22 | first-run activity parity (seeded-looking demo state), activity pagination, docs page |
| **R23** | **DB seam (`file:../db/custom.db` → repo `db/`), mobile-nav parity (F3/F4), announcement-bar byte fixes (F5–F7), Playwright e2e suite (F8), DEPLOYMENT.md + .env.example contract (F9/F10), this SKILL.md** |
| **R24** | **Icon-generation pin (live app = lucide 0.462.0 → 10 legacy overrides in `live-icons.tsx`), platform instructions rewritten live-verbatim (`buildPlatformSnippet` per-tab pres), New This Week trend badge, Export `<button>` + mobile visibility, Save spinner beside label, "views" no-singular, B2B + kicker texts, R14-F10 evidence correction, no live redeploy (bundle hashes re-confirmed)** |
| **R25** | **CLEAN drift watch: no redeploy (all bundle hashes + the lucide pin unchanged), zero code changes; NTW badge negative branch live-verified (`-100.0%` destructive + legacy trending-down), mobile-menu close-on-link-click re-verified both sides (probe-artifact lesson: visibility-filter click targets), R23-F3 + R24-F2 regressions green** |
| **R26** | **Pricing POPULAR badge remediation: ONE real drift found + fixed — the live's dashboard Growth card header ships a POPULAR badge (new-gen Badge, default variant, gradient-first tail `gradient-primary … border-0 text-[10px] px-2 py-0.5`, both billing states + viewports); the R15 "no badge" pin had captured the rolling-deploy window's OLD build (bundle hash never changed — lesson: re-verify old evidence against the CURRENT DOM); pin net: dashboard-r26-parity SSR pins + replaced source pin + NEW e2e/pricing.spec.ts (closes the e2e coverage gap)** |
| **R27** | **Sonner toast parity: ONE drift family found + fixed — the live's mutation feedback is SONNER success toasts (settings save `Settings saved`, domain add `Domain added successfully`, domain delete `Domain removed`; bottom-right, check icon, title-only); the R24–R26 "silent save" evidence was a transient backend state (toast code in the unchanged bundle all along); sonner fingerprinted from the live bundle + pinned 1.7.4 exact; the Radix toast generation fully retired; pin net: toast-r27-parity SSR/source pins + NEW e2e/toasts.spec.ts; runtime byte-identical (idle section, ol, li, icon, title)** |
| **R28** | **Trend-chart axis-geometry parity: ONE drift family found + fixed — the live's chart SVG renders the recharts DEFAULT tick lines (6px) + an axis line on BOTH axes in the axis-level stroke `hsl(220, 9%, 46%)` (the tick text INHERITS it as its fill), the explicit margin `{5,5,5,5}` (plot origin x=65), comma-form HSL literals, and an 8px no-shadow tooltip; the clone's R8-era config had suppressed the tick lines + Y axis line and hacked the margin `left:-18` (23px plot shift flipping the label thinning); also documented the live's Stripe embedded-checkout plan-change flow (the clone's simulated billing stays the D-class divergence); pin net: chart-r28-parity source pins + NEW e2e/chart.spec.ts; runtime byte-identical (12 label positions, tick/axis geometry, the x=576.59375 last-label clamp)** |

---

## Appendix B — The DATABASE_URL Seam (Deep Dive)

The single nastiest class of bugs in this repo. The empirical matrix
(isolated by one-variable probes, R23 audit):

| Runtime | Relative `file:` URL via `env("DATABASE_URL")` | Anchor used |
|---|---|---|
| Plain node (tsx seed, vitest) | works | generate-time **schema dir** (`prisma/`) |
| Prisma CLI, URL **hardcoded** in schema | works | **schema dir** |
| Prisma CLI, URL via `env()` from `.env` | **lands outside the repo** | **`.env`/project root** — `file:../db/custom.db` → `<repo-parent>/db/custom.db` |
| Next server runtime (`next dev`/`start`), env URL | **rewritten + wrong base** (even absolute URLs came out one dir too high) → SQLite error 14 | `@prisma/client` env loading re-anchors against the `.env`/cwd base |
| `datasourceUrl` constructor option | **bypasses all rewriting** (probe-verified) | the value you pass |

**The fix (shipped R23):**
1. `src/lib/db-path.ts` — `resolveDatabaseUrl(raw?)`: relative `file:` →
   absolute against the repo's `prisma/` dir (walk-up from the module);
   absolute / `postgresql://` / unset pass through; no `prisma/` found
   (deployed standalone tree) → return untouched, never invent.
2. `src/lib/db.ts` — `new PrismaClient({ datasourceUrl:
   resolveDatabaseUrl() })` — the server runtime now sees an absolute URL
   it cannot mis-anchor.
3. `scripts/with-db-url.mjs` — the CLI wrapper: same resolution rule,
   re-execs `prisma …` with the absolute URL; `db:push` / `db:seed` route
   through it.
4. Pinned by `tests/db-path.test.ts` (the contract, incl. the walk-up and
   pass-through rules) + the acceptance procedure in §11.

**Gotchas that survive the fix:**
- A `DATABASE_URL` **exported in the shell beats `.env`** (Prisma
  precedence) — stale exports reproduce "outside the repo" symptoms even
  today. `unset DATABASE_URL` first (§10).
- The PrismaClient singleton survives HMR — restart the dev server after
  env changes.
- Production keeps the **absolute-path rule** (`docs/DEPLOYMENT.md §4`):
  pass-through means absolute URLs are never rewritten.

---

## Appendix C — Live-Site Validation Methodology

The parity audit protocol (refined over R19–R24; use it for any new
surface):

1. **Login once, capture the reference**: `app.pixelco.io` with the probe
   account; screenshot the target state at both 375 px and desktop.
2. **Same-viewport probe on the clone** (dev server): open the equivalent
   state; **computed styles**, not just screenshots — `getComputedStyle`
   on the container (display/flex-direction/padding/gap/background) and
   the children (class strings, icon classes, sizes).
3. **Diff the DOM bytes**: class ORDER matters (R23 F5–F7) — compare the
   literal `className` strings, link counts, and structure.
4. **Behavior probes**: click-through flows (Sheet open → link → does the
   dialog unmount?), persistence (reload → collapsed state), boundary
   sweep (767/768 px).
5. **VLM cross-check**: screenshot vs screenshot ("structural match"
   ruling) — catches what computed styles miss (whitespace, alignment).
6. **Record findings** with IDs + severity in the round's plan file;
   re-verify each fix against the live before claiming closure.

---

## Appendix D — Audit History

| Generation | What it covered | Evidence |
|---|---|---|
| R19–R22 (sessions 16–20) | marketing sections, pricing, visitors, first-run | `docs/screenshots/r19-*` … `r22-*` (19 captures) |
| R23 (2026-09-22) | mobile nav (marketing dropdown + dashboard Sheet), announcement bar, DB seam, TW4 emission order, desktop dashboard | `docs/screenshots/r23-*` (7 captures) + `docs/plans/2026-09-22-round23-db-seam-mobile-nav-playwright.md` |
| R24 (2026-09-22) | drift watch (no redeploy — hashes re-confirmed) + icon-generation pin, platform instructions, trend badge, Export/Save buttons, dashboard texts, settings/visitors targets probed (no drift) | `docs/screenshots/r24-*` (8 captures) + `docs/plans/2026-09-22-round24-live-icon-generation-platform-instructions.md` |
| R25 (2026-09-22) | clean drift watch — no redeploy, named targets re-verified (settings save, visitors rows, mobile nav both surfaces), NTW negative badge branch live-verified, regressions green | `docs/screenshots/r25-*` (6 captures) + `docs/plans/2026-09-22-round25-drift-watch.md` |
| R26 (2026-09-23) | pricing POPULAR badge remediation — no redeploy, standing surfaces + TW4 checks + DB seam + 18-route console sweep all clean; ONE real drift fixed (Growth card header badge, live-verified both billing states + viewports, runtime byte-identical); e2e coverage gap closed | `docs/screenshots/r26-*` (7 captures) + `docs/plans/2026-09-23-round26-pricing-popular-badge.md` |
| R27 (2026-09-23) | sonner toast parity — no redeploy; standing surfaces re-verified + the live's MUTATION flows driven for the first time; ONE drift family fixed (sonner 1.7.4 success toasts on settings/domains mutations, the Radix generation retired); runtime byte-identical; toast e2e coverage added | `docs/screenshots/r27-*` (7 captures) + `docs/plans/2026-09-23-round27-sonner-toast-parity.md` |
| R28 (2026-09-23) | trend-chart axis-geometry parity — no redeploy; standing surfaces + mutation-loop regressions re-verified; NEW probe surface: the chart's SVG internals; ONE drift family fixed (recharts default tick lines + both axis lines in the live's axis stroke, margin {5,5,5,5}, comma-form HSL, 8px no-shadow tooltip); runtime byte-identical; chart e2e coverage added | `docs/screenshots/r28-*` (4 captures) + `docs/plans/2026-09-23-round28-trend-chart-axis-parity.md` |

**R23 final gate:** lint ✓ typecheck ✓ **613 vitest / 61 files** (2
skipped) ✓ build ✓ **14/14 e2e chromium** ✓ DB acceptance (the user's
exact `.env` value: `db:push` → `<repo>/db/custom.db`, no stray
parent-dir file; `/api/health` `db:"up"`) ✓ zero console errors ✓ VLM
mobile-menu MATCH + desktop dashboard STRUCTURAL MATCH ✓

**R24 final gate:** lint ✓ typecheck ✓ **662 vitest / 65 files** (2
skipped) ✓ build ✓ **14/14 e2e chromium** (standalone, 17.8 s) ✓ bell /
Export / Save byte-matched against the **settled** live DOM (an early
missing-classes observation was a pre-hydration artifact) ✓ platform
tabs verified verbatim ✓ mobile nav re-checked incl. same-page-click
edge case (the live also keeps the Sheet open) ✓ zero console errors ✓
8 VLM-verified screenshots ✓

**R25 final gate (clean watch):** verify EXIT=0 — lint ✓ typecheck ✓
**662 vitest / 65 files** (2 skipped) ✓ build ✓ **14/14 e2e chromium**
(standalone, 15.8 s) ✓ 6 VLM-verified screenshots ✓ zero code changes
(tree identical to R24's `8fccf4a` for `src/` + `tests/`)

**R26 final gate:** lint ✓ typecheck ✓ **667 vitest / 66 files** (2
skipped) ✓ build ✓ **16/16 e2e chromium** (standalone, 19.7 s — the
new `e2e/pricing.spec.ts` included) ✓ badge runtime byte-diff vs the
live (class string + header structure + child order — identical) ✓ 7
VLM-verified screenshots ✓ zero console errors (18 routes)

**R27 final gate:** lint ✓ typecheck ✓ **681 vitest / 67 files** (2
skipped) ✓ build ✓ standalone ✓ **18/18 e2e chromium** (standalone,
30.4 s — the new `e2e/toasts.spec.ts` included) ✓ toast runtime
byte-diff vs the live (idle section bytes + ol attrs/CSS vars + li
class family + icon path + title — identical) ✓ 7 VLM-verified
screenshots ✓ zero console errors (19 routes)

**R28 final gate:** lint ✓ typecheck ✓ **693 vitest / 69 files** (2
skipped) ✓ build ✓ standalone ✓ **21/21 e2e chromium** (standalone,
31.6 s — the new `e2e/chart.spec.ts` included) ✓ chart runtime
byte-diff vs the live (12 label positions, tick-line/axis-line geometry
+ strokes, tick-text fill attr, the x=576.59375 last-label clamp,
tooltip style bytes — identical) ✓ 4 VLM-verified screenshots ✓ zero
console errors (20 routes)

---

## Quick Reference Card

```text
Commands
  npm run dev                    # dev server :3000 (needs db/ seeded)
  npm run verify                 # lint + typecheck + vitest + build  ← THE GATE
  npm run db:push / db:seed      # wrapper-routed Prisma CLI (repo-root db/)
  npm run build:standalone && npm run test:e2e   # 21 e2e tests, :3100, db/e2e.db
  npx vitest run --pool=forks --maxWorkers=1 --no-file-parallelism   # low-RAM run
  curl localhost:3000/api/health # {"status":"ok","db":"up"}

The DB rule
  .env: DATABASE_URL="file:../db/custom.db"   # relative to prisma/schema.prisma
  → runtime: src/lib/db.ts (datasourceUrl ← resolveDatabaseUrl)
  → CLI: npm run db:push|db:seed (scripts/with-db-url.mjs)
  → production: absolute path (docs/DEPLOYMENT.md §4)

Files you will touch most
  src/app/globals.css                  # the whole design system (TW4 CSS-first)
  src/components/marketing/site-header.tsx   # mobile dropdown + toggle (md: breakpoint)
  src/components/dashboard/chrome-store.ts   # sidebar/sheet state (useChromeState)
  src/lib/db.ts / src/lib/db-path.ts   # the DB seam
  tests/*-parity.test.tsx              # the parity contract (read before editing UI)
  e2e/*.spec.ts                        # behavior regressions
  docs/plans/2026-09-22-round23-*.md   # the R23 record
  docs/plans/2026-09-22-round24-*.md   # the R24 record
  docs/plans/2026-09-23-round27-*.md   # the R27 record (sonner toasts)
  docs/plans/2026-09-23-round28-*.md   # the R28 record (chart axis chrome)

Counts (R28, verified)
  693 vitest (69 files) + 21 e2e chromium · 79 tsx · 19 pages · 5 API routes
  4 Prisma models · 7 keyframes · 3 env vars · 0 custom hooks (use-toast retired R27)
```

---

## The Meticulous Approach

The six-phase workflow every round follows (inherited from the operating
instructions + scandihaven discipline):

1. **READ** — internalize `AGENTS.md`, `CLAUDE.md`, `README.md`, the PAD,
   the session logs, and the last round's plan before touching anything.
2. **AUDIT** — reproduce the current state against the live with probes
   (Appendix C); record findings with IDs and severities; re-verify each
   surprising finding through a second method (§12 lesson 10).
3. **PLAN** — write `docs/plans/<date>-roundNN-<topic>.md`: findings
   table, interpretation rulings, TDD-ordered fixes. Validate the plan
   against the codebase (does every referenced file/behavior exist?)
   before executing.
4. **EXECUTE (TDD)** — RED: a failing test citing the finding ID →
   GREEN: the minimal fix → no drive-by refactors.
5. **VERIFY** — the full gate (§11): lint, typecheck, vitest, build, e2e,
   DB acceptance, visual probes, screenshots, doc sync.
6. **SHIP & RECORD** — commit to `main`, push via the SSH wrapper
   (`docs/ssh_git_wrapper_v3.py` per
   `docs/how-to-git-push-using-ssh-wrapper_SKILL.md`), append the round
   log to `docs/session_20.md`, update the worklog, and refresh this
   SKILL.md's counts/lessons if anything material changed.

