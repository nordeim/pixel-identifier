---
IMPORTANT: File is read fresh for every conversation. Be brief and practical.
---

# Pixelco

## Core Identity & Purpose

Pixelco is a self-hostable, cookieless **visitor email identification SaaS**:
one script snippet on a customer site feeds a tracking pipeline that resolves
anonymous visitors to real email addresses (B2C individuals and B2B contacts)
and surfaces them in a real-time dashboard. The repo contains the marketing
site, auth, dashboard, tracking pipeline, identity-resolution engine, and a
simulated billing layer. Maintained by the repository owner; architecture
reference: `Project_Architecture_Document.md` (PAD).

Key decisions that shape all work here: Next.js 16 App Router with
RSC-by-default, Server-Actions-only mutations behind an `ActionResult`
envelope, Prisma + SQLite, NextAuth v4 credentials with JWT sessions, and a
deterministic (simulated) identity resolver that must stay quota-accounted
and stable per visitor.

## Foundational Principles

### Meticulous Approach (Six-Phase Workflow)

1. **ANALYZE** — Read the affected files fully before changing them. Identify
   explicit requirements, implicit needs, and ambiguities. For this codebase:
   check whether a change touches the ingest path, quota accounting, or the
   resolver — those have invariants (see Project-Specific Standards).
2. **PLAN** — Sequence the work: schema → libs → actions → routes → UI.
   Present the plan when the change spans more than one layer.
3. **VALIDATE** — Confirm scope before implementing anything data-affecting
   (schema changes, resolver changes, plan/limit changes).
4. **IMPLEMENT** — Small, testable units; one responsibility per file;
   server components for data, client islands for interactivity.
5. **VERIFY** — `npm run verify` (lint → typecheck → test → build) plus a
   browser pass on the affected flow. Evidence or it didn't happen.
6. **DELIVER** — Conventional Commit, updated docs when behavior or setup
   changes, honest notes on what was and wasn't verified.

### Project-Specific Principles

- **Ingest is sacred:** `/api/track` must stay fast, permissively-CORS'd
  (beacons are cross-origin), Zod-validated, and rate-limited.
- **Activity rows key identity off the event type (v1.6):** `listActivity`
  returns the email only for identification events — pageview rows always
  carry the truncated anonymous id, so identification never rewrites
  pageview history.
- **Determinism of identity:** resolution decisions derive from
  `sha256(siteKey + anonymousId)` — changing resolver constants is a
  data-affecting migration, not a refactor.
- **Honesty over simulation:** billing and identity resolution are
  simulations and are labelled as such in docs and UI copy. Never present
  simulated behavior as production capability.
- **Quotas are integer accounting:** `src/lib/quota.ts` is the only module
  that writes `identificationsUsed` — a single conditional UPDATE (free
  plans hard-stop at the limit; paid monthly plans increment unconditionally
  and count overage). The 30-day reset persists and is guarded on the stale
  anchor. Plan semantics live in `src/lib/plans.ts`.
- **Annual prices are per-surface tables, not derivations (v1.5):** the live
  dashboard hardcodes $65/$199/$639 annual monthly prices while the live
  marketing floors the 20%-off display ($63/$199/$639). `plans.ts` owns
  both (`annualMonthlyPrice`, `marketingAnnualMonthlyCents`); components
  never compute prices inline. **The marketing pricing section defaults
  to annual** behind an iOS-style switch (v1.9) — the floored table
  renders first, and the Free card's $0 carries no "/mo" suffix.
- **The visitors topbar subtitle is server-rendered (v1.5):** the layout
  fetches `getVisitorSegmentCounts` into the Topbar. `PAGE_META` subtitles
  must never be brace templates (pinned by a chrome test), and the count
  line never singularizes — the live renders "1 companies".
- **Entrance motion is the reveal seam (v1.11):** marketing elements
  animate in via `data-reveal="<y>"` + `data-reveal-delay` attributes and
  ONE shared IntersectionObserver (`src/components/marketing/reveal-
  observer.tsx`); the hidden state is scoped to the `.js-reveal` html
  class set by a pre-paint inline script (progressive enhancement —
  no-JS readers see everything). The hero H1's
  `leading-[1.1] sm:leading-none` reproduces the live's Tailwind v3
  cascade quirk (its `sm:text-5xl` carries `line-height: 1` and wins at
  ≥sm) — don't remove the `sm:` override. Marketing `--foreground`-family
  tokens ship as pre-rounded hex (`#171a26`): Lightning CSS floor-rounds
  half-channel HSL, so porting live HSL values requires checking for
  `.5` channel boundaries. Gradient submit CTAs pass
  `variant={null} size={null}` so the merged class string carries no
  variant fragment, like the live DOM.
- **Sub-page parity is content-deep (v1.12):** the blog posts and legal
  pages carry the LIVE copy verbatim (`src/data/blog-posts.ts`,
  `src/data/legal-pages.ts` — generated by the round-13 converters;
  the legal text names the operator Aiviral, keep it). The announcement
  bar is landing-only — chrome lives in `MarketingFrame`, mounted by
  the `(landing)` group with `showBanner` and the `(marketing)` group
  without. Sub-page chrome (`← Back to Home`, per-page `max-w-*`
  containers) and the legacy accordion strings are pinned by
  `tests/marketing-{subpages,blog-parity,legal-parity,faq-accordion,
  banner-scope}.test.*` — treat those pins as the contract.
- **The dashboard shell tracks the live's CURRENT build (v1.14):** the
  live migrated its app bundle to the shadcn Sidebar primitive (the
  rolling-deploy window served the old build — which the clone had
  matched exactly — on a minority of edge loads; the clone tracks the
  dominant variant). The shell DOM is the contract: the provider/gap/
  fixed-container structure, the `data-sidebar` tree, the full
  `peer/menu-button` class string with appended active tails, the PNG
  logo asset, the non-sticky h-14 topbar with its trigger button, the
  md breakpoints, the 288px mobile Sheet, the Badge div root, the
  new-gen Label, the CardTitle-pattern headings (no `text-foreground`),
  and the Card-base-first pricing cards are pinned by
  `tests/sidebar-chrome.test.tsx` + `tests/shell-parity.test.tsx` —
  treat those pins as the contract. The `w-[--sidebar-width]` utilities
  are hand-defined in globals.css (TW4 miscompiles the TW3 bare-var
  form — do not "modernize" the class strings). lucide's default
  `aria-hidden` and the SSR-required CSS-hidden (not unmounted) mobile
  sidebar are the two documented micro-divergences.
- **The app bundle's CONTENT layer tracks the live's current build
  (v1.15):** below the shell, the live's current generation renders
  text in `<span>`/`<div>` (not `<p>`), drops `text-foreground` from
  labels/values, ships geometry-first class orders, uses `div` rows
  (never ul/li) and bare-`div` icon chips, and ships the LEGACY Badge
  generation on content badges (base `border` + secondary
  `text-secondary-foreground`) while the sidebar/Verified/Identified
  badges stay new-gen — mixed generations are the live's actual DOM,
  reproduced via `content-badges.tsx` (LegacyBadge) and
  `live-icons.tsx` (single-name lucide classes). The settings/install
  buttons' odd strings are cva+twMerge mechanics (size `sm` displaces
  `rounded-md` to the tail; `font-semibold` displaces `font-medium`)
  — one Button primitive, consumers choose variant/size. The sidebar
  group-label ships the live's broken `transition-[margin,opa]` class
  verbatim (do not fix it), and `focus-brand` is gone from app-bundle
  consumers. Pinned by `tests/content-parity.test.tsx` — treat those
  pins as the contract.
- **R17 gap-closure precedents (v1.16):** the activity Identified badge
  = the domains-Verified string (one new-gen call, no hybrids); the
  contact-sales CTA is a variant-free Button + onClick mailto (DOM
  parity AND functional parity — the live's CSR button navigates the
  same way); contact-card roots reproduce the live's twMerge
  displacement via consumer `border-border bg-card`; install chips are
  bare geometry-first divs; the trend chart's role/aria-label stays
  (invisible functional a11y). When screenshot-diffing against the
  live, ALWAYS wait for hydration (`header h1` present) — the live's
  pre-hydration shell is dark and will false-diff.
- **Geometry is part of the parity surface (v1.17, R18):** DOM-string
  diffs cannot see layout. The R18 geometry probes (the first ever)
  found two real visual bugs every prior pin pass missed: a classless
  server-action form eating a card body's space-y-4 (0px group gaps),
  and TW4's space-y compiling margin onto inline labels (8px-short
  label→input gaps on every auth form). Verify rendered geometry
  (getBoundingClientRect + computed styles) whenever a layout mechanism
  differs between the live's TW3 and the clone's TW4 — class-string
  equality is NOT layout equality. The fixes live in scoped CSS
  (`.space-y-2 > label + input`) and on the form elements themselves
  (D2 wrappers carry the spacing), never on the pinned primitives.
- **Computed styles and runtime models are part of the parity surface
  (v1.18, R19):** class-string pins cannot see CSS RESOLUTION (the same
  `.gradient-hero` class renders amber in the live's marketing bundle
  and dark in its app bundle — the clone scopes the amber to
  `.marketing-scope`) nor RUNTIME MODELS (the live's feed widget is a
  5-row phase machine with a 10s cycle, not a static list). When a
  component animates or phases on the live, extract its model from the
  live's bundle source (the minified symbols are readable) and pin the
  data + timing constants, not just the static markup. Transient
  live-side defects (CDN 404s, login hiccups) are non-findings —
  re-check before acting, and never replicate a live defect.
- **Runtime STATES and functional flows are part of the parity surface
  (v1.19, R20):** static pins miss everything behind a click or a
  timer. The R20 probes (5th generation) sampled the live's rotating
  feed at 2 s intervals and drove its pricing toggle, domains form and
  delete flow — finding 4 monthly-mode pricing divergences and a
  missing disabled-on-empty state that every static audit missed.
  When the live ships an interactive state (toggle off-branch, form
  disabled state, staged text swap), probe the RUNTIME emission, not
  just the default render; extract the state machine from the live's
  bundle and pin both branches. Distinguish clone defects from live
  defects BEFORE fixing: the live accepting arbitrary domain strings
  and deleting without confirm are defects to diverge from (zod +
  AlertDialog stay), not parity targets.
- **Exported FILES and data semantics are part of the parity surface
  (v1.20, R21):** a download the user opens is a deliverable — its
  bytes are user-visible. Decode the live's export from its app bundle
  (the W function: columns, date formats, line endings, BOM, quoting,
  scope) and replicate them exactly, even where "nicer" engineering
  exists (the clone's RFC-4180+BOM export was replaced by the live's
  raw LF format). The same applies to hidden data models: the live's
  `source`/confidence semantics (identType, b2b-null confidence) and
  time rules (relative formatters, active windows) live in its bundle —
  extract the constants rather than inferring from one screenshot.
  Probe RESPONSIVE states too (375/768) — mobile-only UI (dropdowns,
  sheets) is invisible to desktop captures; open the live's mobile
  surfaces and capture their real structure.
- **The marketing bundle has its own emission conventions (v1.17, R18):**
  lucide icons size→color→margin; paragraphs text-first; containers
  px-before-border; chips geometry-first; gradients are the FULL
  `gradient-hero`; CTAs are anchors wrapped around real buttons with
  variant-free tails; the wordmark is the PNG asset (header lockup on
  the anchor, footer without tracking-tight); the pricing cards always
  render their spacer line. The clone's invisible functional chrome
  (switch semantics, section landmarks, focus-brand rings, reveal
  machinery, feed-row hook, decorative aria-hidden) is KEPT per ruling
  D5 — documented residual, not drift. Pinned by
  `tests/marketing-r18-parity.test.tsx`.
- **Document heads are part of the parity surface (v1.13):** the live
  is CSR — its raw HTML ships one static shell but its router sets
  per-page title/description/og/twitter/canonical on navigation, and
  the live app bundle ships its OWN og block. The clone reproduces the
  live-verbatim head on the server: `marketingMetadata()` (R14) builds
  every marketing page's head (title.absolute, per-page og/canonical,
  `og:locale en_US`, the self-hosted social image, large twitter card)
  and `appSeoMetadata()` carries the app bundle's og block. Rulings:
  social images are self-hosted copies (never hotlink the live's builder
  storage), `twitter:site @Lovable` is a build artifact and is NOT
  replicated, the title-template suffix is the live's `|`, blog
  `metaDescription` ≠ card excerpt, robots.txt/sitemap.xml are Route
  Handlers reproducing the live bytes (the Next conventions cannot emit
  comments or "1.0" priorities), the favicon is the live's
  `public/favicon.ico` with no link tag, and the 404 tab title is the
  client-side `NotFoundTitle` swap (the MutationObserver is REQUIRED —
  Next's metadata controller overwrites plain title assignments after
  hydration) while the HTTP status stays a correct 404. Pinned by
  `tests/seo-parity.test.ts` + `tests/seo-routes.test.ts`.

## Implementation Standards

### General Coding Practices

- Early returns; no deep nesting.
- Composition over inheritance; small pure functions.
- Self-documenting names; comments explain *why*, never *what*.
- No dead code, no placeholder values, no speculative abstractions.

### Language & Framework Guidelines

**TypeScript (strict)** — `any` is an ESLint error; use `unknown` and narrow.
`import type` for type-only imports. Interfaces for object shapes; types for
unions.

**Next.js 16 App Router** — React Server Components by default; add
`'use client'` only for interactive leaves. `async` `params`/`searchParams`/
`cookies()`/`headers()` must be awaited. Dashboard pages export
`const dynamic = 'force-dynamic'` (session-scoped data). Metadata via
`export const metadata`.

**Tailwind CSS 4 (CSS-first)** — no `tailwind.config.js`. Tokens are literal
hex in `@theme inline` (`src/app/globals.css`); `var()` chains inside
`@theme` are dropped by the build. The live ships TWO palettes (v1.9): the
app bundle renders the global `:root` tokens; the marketing tree renders
the `.marketing-scope` class applied on the `(marketing)` layout wrapper
(white canvas, warm-white cards, cool borders, yellow `#FFBF00` accent,
10px radius base). Use semantic tokens (`bg-card`,
`text-muted-foreground`, `bg-secondary`, `bg-accent`), not raw hexes in
components — both palettes resolve through the same utilities.

**Typography (v1.4, live-parity):** the app body is **Inter**; **Space
Grotesk** is the display face — apply the `font-display` utility to card
titles, page H1s, KPI values, prices and the sidebar wordmark; the
marketing tree renders **DM Sans**; `font-mono` stays a mono stack for
code/paths. Brand utilities live in `globals.css`, not per-component
approximations: `.gradient-primary` (135deg #FFC105→#FFB200), `.glow-primary`,
`.text-gradient-primary`, `.text-gradient-hero` and the `neon-green` color
token (`bg-neon-green/10`-style utilities) — use them instead of hand-rolled
amber/teal approximations.

**UI primitives (R11)** — the live app ships the LEGACY shadcn
  generation; `src/components/ui/*` must keep the legacy chrome (2px
  ring-offset focus rings, h-10/h-9 sizes, rounded-full badges, LEFT-side
  select indicators, `bg-background` inputs, `space-y-1.5 p-6` card
  headers). The SSR tests pin the rendered class strings — don't
  regenerate primitives with the shadcn CLI.

**Server Actions** — every mutation returns `ActionResult<T>`
(`{ ok: true, data } | { ok: false, error: { code, message, fieldErrors? } }`).
Validate with Zod at the boundary; catch once; never throw across the action
boundary. Revalidate the narrowest path after writes.

**Prisma** — one client via `src/lib/db.ts`. Schema edits → `npm run db:push`.
Snake_case tables via `@@map`, camelCase TS fields. No list-typed primitives.

## Development Workflow

### Environment Setup

```bash
npm install
cp .env.example .env   # set NEXTAUTH_SECRET: openssl rand -base64 32
npm run db:push        # create SQLite schema + generate client
npm run db:seed        # optional: demo@pixelco.local / Demo123456!
npm run dev
```

### Build Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Development server (port 3000) |
| `npm run build` | Production build (standalone output) |
| `npm run build:standalone` | Build + copy `.next/static` (+ `public/`) into `.next/standalone` — **always** use this for standalone deploys; raw `next build` omits static assets |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint 9 flat config |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run test` | Vitest suite (watch: `npm run test:watch`); opt-in standalone smoke: `PIXELCO_STANDALONE_SMOKE=1` |
| `npm run verify` | lint → typecheck → test → build (pre-push gate) |
| `npm run db:push` | Sync Prisma schema to the database |
| `npm run db:seed` | Idempotent demo seed |

## Testing Strategy

### Test Pyramid

Vitest (node env) against a throwaway SQLite DB (`db/test.db`, recreated by
`tests/global-setup.ts` via `prisma db push` on every run; `fileParallelism`
is off — SQLite is a single writer; `testTimeout`/`hookTimeout` is 30 s and
`tests/setup.ts` raises `PRAGMA busy_timeout=10000` + `WAL` for the quota
Prove-It). `TZ` is pinned to UTC.

- **Unit (pure libs):** plan/money math (`plans.ts`), domain normalisation,
  snippet hardening, CSV escaping + formula-injection guard, relative time,
  and the dashboard chrome seam (`src/lib/dashboard-nav.ts` — sidebar
  sections/icons, per-page subtitles, visitors subtitle formatting, the
  7-day unread rule behind the bell dot, sidebar-rail state reducer).
- **Behavioural:** the collector script **and the emitted install snippet**
  are executed in `node:vm` with mocked browser globals — SPA route-change
  beacons, `pushState`/`replaceState` wiring, the monkey-patch recursion
  regression, and the snippet's must-not-throw + script-element contract
  (right `src`, right `data-site`). Rule: never pin a snippet/collector
  serialization in a string assertion when it has a behavioral contract —
  execute it. (The string-pinning style once hid a snippet that threw on
  every real customer page.)
- **Integration (DB-backed):** `src/lib/quota.ts` (atomic consumption under
  110 concurrent calls, persisted monthly reset, overage); query seams
  `listVisitors` / `listActivity` / `getTopPages` (SQL groupBy with
  deterministic tie-breaks) / `hasRecentIdentifications` in `analytics.ts`
  (search/filter/pagination/counts, cursor paging); server actions with
  mocked session/headers (plan switch, sign-up, domains, account deletion,
  profile update — the stored name is never clobbered).
- **Integration (route handlers):** `/api/track` and `/api/export` invoked
  directly with `Request` objects — hostname gating, anti-enumeration, 429
  timing, write-failure containment, scoped export.
- **Content & SEO data modules:** the marketing link map
  (`src/lib/marketing-links.ts` — every link targets a real route; Careers
  is dead on the original too and is flagged `dead: true`), the blog
  catalogue (`src/data/blog-posts.ts` — unique URL-safe slugs, date
  ordering, required fields), and `robots.ts`/`sitemap.ts` (16-URL set,
  `/api/` disallowed, app routes excluded).
- **E2E:** manual browser flows (sign-up → domain → beacon → dashboard →
  export). No Playwright suite yet.

### Test Commands

```bash
npm run test         # Vitest run (also inside npm run verify)
npm run test:watch   # watch mode
```

New behavior is test-first: reproduce the bug or specify the behavior in a
failing test, then make it green. Mock seams live in `tests/setup.ts`
(`next/cache`, `next/navigation`, `next/headers`).

### Gotchas

- SQLite `contains` is ASCII-case-insensitive — don't hand-roll lower()
  comparisons for search.
- Integration tests share one DB file per run; clean up rows you create or
  assert relatively, not absolutely, when tests might interact.

## Code Quality Standards

### Linting & Formatting

```bash
npm run lint
```

ESLint enforces: `no-explicit-any` (error), unused vars (error, `_`-prefixed
exceptions), `no-console` (warn; `warn`/`error`/`info` allowed). React
Compiler rules are active — no `setState` directly inside effects; derive
state from props or handle it in event handlers.

## Git & Version Control

### Branching Strategy

- `main` only — trunk-based, short-lived `feat/…`/`fix/…` branches via PR if
  collaboration requires them.
- Pushes to the SSH remote go through `docs/ssh_git_wrapper_v3.py` with an
  externally-supplied deploy key (runbook:
  `docs/how-to-git-push-using-ssh-wrapper_SKILL.md`). Never commit keys.

### Commit Standards

- Conventional Commits, atomic scope: `feat(visitors): add source filter`.
- Commit messages explain *why* for non-obvious changes.

## Error Handling & Debugging

- Actions: Zod `safeParse` → typed failure with field errors; one `catch`
  per boundary; user-safe messages only (operator detail in server logs).
- Ingest (`/api/track`): malformed payloads → silent 204 (beacons must never
  break the customer's page); unknown site keys → 204 (no enumeration);
  rate-limit breach → 429 + `Retry-After`.
- Debugging the pipeline: `curl` a beacon (see README "Testing the tracking
  pipeline"), then query the DB: `sites` (status/lastEventAt), `visitors`,
  `events`. Prisma logs queries in dev.
- Dev server log: read the tail after any change; hydration/runtime errors
  surface there first.

## Communication & Documentation

- Docs live at the repo root: README (users), AGENTS.md (agent quick-start),
  this file (working agreements), PAD (architecture, ADRs).
- Update the PAD when architecture changes; update `.env.example` and README
  when setup changes. Keep simulated capabilities (billing, identity
  resolution) labelled as simulated.

## Project-Specific Standards

### Architecture

Four layers, strictly top-down:

1. **RSC pages** (`src/app/**`) — fetch via `src/lib/analytics.ts`, no
   direct fetching in client components beyond the activity poll.
2. **Server Actions** (`src/actions/*`) — the only write path.
3. **Domain libs** (`src/lib/*`) — pure where possible
   (`identification.ts`, `plans.ts`, `validation.ts`), server-only for data
   (`analytics.ts`).
4. **Route handlers** — fixed whitelist: `api/track`, `api/activity`,
   `api/export`, `api/health`, `api/auth/[...nextauth]`, `pixel.js`, plus
   the GET-only SEO document routes `robots.txt`/`sitemap.xml` (R14).

### API Design

- Ingest payload contract (camel-truncated keys): `{k, u, p, r, v}` — Zod
  schema in `validation.ts` is the single source of truth (legacy `t/w/h`
  keys are stripped). Beacons whose page hostname does not match the
  registered domain are dropped before any write.
- Public ingest responses are 204/429 only (429 carries `Retry-After: 60`).
  Authed APIs return JSON.
- The collector script (`src/app/pixel.js/route.ts`) sends beacons as
  `text/plain` JSON specifically to avoid a CORS preflight — don't switch to
  `application/json` beacons.

### Database / Data Layer

- Tables: `users`, `sites`, `visitors`, `events` (append-only ledger).
  Visitor uniqueness: `@@unique([siteId, anonymousId])`.
- Domain verification: the ingest compares the beacon's page hostname
  against the registered domain (www-insensitive, subdomain-tolerant).
- Identification quota: `users.identificationsUsed` with
  `usagePeriodStart` anchoring the 30-day monthly window (paid plans);
  lifetime for Free.

### Environment Variables

| Variable | Purpose | Example |
|----------|---------|---------|
| `DATABASE_URL` | SQLite path or Postgres URL | `file:./db/pixelco.db` |
| `NEXTAUTH_SECRET` | Session signing secret (≥32 chars) | `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Canonical origin (prod) | `https://pixelco.example.com` |

## Anti-Patterns to Avoid

- Adding a `tailwind.config.js` (Tailwind 4 is CSS-first here).
- Importing `signIn`/`signOut` from `'next-auth'` in server code (v4:
  client-only via `next-auth/react`).
- REST endpoints for UI mutations, or client-side global data fetching.
- Floats for money or quotas; string statuses without a shared constant.
- Incrementing `identificationsUsed` anywhere outside `src/lib/quota.ts`.
- Editing the resolver's name lists or PRNG casually — it re-shapes
  historical identification decisions.
- Weakening lint/type rules to pass the gate.
- Trusting `visitors.status` — it's a dead schema default; display state
  derives from `lastSeen` via `isVisitorActive` (30-minute window).
- Brace-template subtitles in `PAGE_META` — the visitors count line is
  server-rendered from `getVisitorSegmentCounts` (v1.5), never a template.
- Computing annual prices inline — the live's dashboard and marketing
  surfaces use different annual tables; `plans.ts` owns both (v1.5).
- String-pinning generated JS in tests (see Behavioural above) — execute it
  in `node:vm` instead.
