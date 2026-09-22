# AGENTS.md

Compact operating instructions for AI coding agents working in this repo.
Everything here is easy to get wrong without reading it first.

## Commands

| Task | Command |
|------|---------|
| Install | `npm install` (or `bun install`) |
| Dev server | `npm run dev` → http://localhost:3000 |
| Lint | `npm run lint` |
| Typecheck | `npm run typecheck` |
| Tests | `npm run test` (Vitest; watch mode: `npm run test:watch`) |
| E2E | `npm run build:standalone && npm run test:e2e` (Playwright; standalone build + throwaway `db/e2e.db`) |
| Production build | `npm run build` |
| Full gate (run before pushing) | `npm run verify` = lint → typecheck → test → build |
| Create/refresh DB | `npm run db:push` (wraps Prisma via `scripts/with-db-url.mjs`) |
| Seed demo data | `npm run db:seed` (idempotent; refuses non-local DBs) |

**Order matters:** lint → typecheck → test → build. Never weaken a failing gate to
make it pass — fix the code.

**Env first:** copy `.env.example` to `.env` and set `NEXTAUTH_SECRET`
(`openssl rand -base64 32`) before `npm run dev`; auth routes fail without it.
The default `DATABASE_URL="file:../db/custom.db"` is schema-relative —
it lands in `<repo>/db/custom.db` everywhere (see the R23 db-path fact
below). A shell-exported `DATABASE_URL` overrides `.env` (standard dotenv
precedence — true for the app, the wrapper, and the Prisma CLI alike).

## Non-obvious facts

- **R23: the DATABASE_URL seam is normalized by `src/lib/db-path.ts`.** A
  relative `file:` URL is schema-relative (`file:../db/custom.db` →
  `<repo>/db/custom.db`) — the `.env.example` contract. This is NOT what
  the Prisma CLI or `@prisma/client`'s Next-runtime env loading do
  natively (empirically isolated in R23): the CLI anchors env-indirected
  relative URLs at the `.env`/project root (schema landed OUTSIDE the
  repo), and the client's server-runtime env loading re-anchors even
  ABSOLUTE `file:` URLs one directory too high (SQLite error 14,
  `/api/health` degraded). Two seams fix it: `db.ts` passes
  `resolveDatabaseUrl()` as `datasourceUrl` (bypasses the rewriting —
  probe-verified), and `db:push`/`db:seed` route through
  `scripts/with-db-url.mjs` (the CLI mirror). Pinned by
  `tests/db-path.test.ts`; production keeps the ABSOLUTE-path rule
  (docs/DEPLOYMENT.md §4). Do NOT remove either seam or "simplify" the
  `.env` value back to `file:./db/…`.
- **R23: the mobile navigations close on navigation + the Playwright net.**
  The dashboard mobile Sheet's open state DERIVES from the pathname
  (`sheetPathname === pathname` in `topbar.tsx` — effect-free; the
  `react-hooks/set-state-in-effect` rule rejects an effect) so any nav
  closes it like the live's unmounting dialog; the marketing toggle icons
  are the live's lucide-default `w-6 h-6` (24 px); the announcement-bar's
  link/arrow/dismiss/X class orders are live-verbatim (R23-F4..F7,
  `tests/mobile-nav-r23-parity.test.tsx`). Browser-level behavior —
  dialog lifecycles, client state, the beacon → activity loop — is pinned
  by the Playwright e2e suite (`e2e/*.spec.ts` via
  `playwright.config.ts`, which boots the STANDALONE build against a
  throwaway `db/e2e.db` through `scripts/e2e-server.mjs`; never the dev
  DB). Run: `npm run build:standalone && npm run test:e2e`.
- **Tailwind 4 is CSS-first.** There is no `tailwind.config.js` and there must
  never be one — tokens live in the `@theme inline` block in
  `src/app/globals.css`. The **live ships TWO palettes**: the app bundle
  uses the global `:root` tokens (brand `--primary: #FFC105`; since R11
  the app neutrals are COOL — background `hsl(220 20% 97%)`, borders
  `hsl(220 13% 91%)`, navy foreground, and `--accent` is the TEAL data
  accent that hovers render); the marketing bundle's palette lives in the
  `.marketing-scope` class and is applied on the marketing frame
  wrapper (white canvas, warm-white cards `hsl(40 30% 98%)`, cool borders
  `hsl(230 15% 90%)`, a YELLOW accent `#FFBF00`, `--radius: 0.625rem`).
  Never hand-roll per-component approximations of either palette — `var()`
  chains inside `@theme` are silently dropped by the build. `--radius-xl`
  derives at radius + 2px (measured off the live, R10).
- **The UI primitives are LEGACY shadcn (R11; Badge/Label re-extracted in
  R15).** The live app ships the
  legacy generation — `src/components/ui/{button,badge,card,tabs,select,
  input,checkbox}.tsx` carry the live's exact class strings (no data-slot
  attrs, `ring-offset-background` 2px focus rings, h-10 default / h-9 sm
  buttons, rounded-full badges, `flex flex-col space-y-1.5 p-6` card
  headers, LEFT-side select indicators, `bg-background` inputs). Do NOT
  regenerate them with the shadcn CLI — the SSR tests pin the rendered
  strings.
- **font-mono is a declared-not-loaded stack (R11).** `--font-mono` is
  `"JetBrains Mono", monospace` with NO webfont — mono surfaces render in
  the system mono exactly like the live. Do not re-add a mono webfont.
- **Scroll reveal is attribute-driven (R12).** Marketing entrance motion
  lives in `data-reveal="<y>"` + `data-reveal-delay` attributes consumed
  by ONE shared IntersectionObserver (`src/components/marketing/
  reveal-observer.tsx`, mounted in the marketing frame). The hidden
  state is scoped to `.js-reveal` — a pre-paint inline-script class on
  `<html>` — so no-JS readers see everything. Never hide reveal content
  in component CSS; add the attributes and the observer handles the rest
  (`tests/marketing-reveal.test.tsx` pins the coordinates).
- **The hero H1 renders ratio 1.0 at ≥sm (R12).** The live's Tailwind v3
  pairs `sm:text-5xl` with `line-height: 1`, and variant rules cascade
  after plain utilities — so `leading-[1.1]` LOSES at ≥sm on the live.
  The clone reproduces this with `leading-[1.1] sm:leading-none`; do not
  "clean up" the sm: override.
- **Marketing foreground tokens ship as pre-rounded hex (R12).** Tailwind
  v4's Lightning CSS minifier floor-rounds half-channel HSL: authoring
  `hsl(230 25% 12%)` silently builds `#171926` while browsers compute
  `#171A26`. The `.marketing-scope` foreground family therefore ships as
  literal `#171a26`. When porting live HSL tokens, check for `.5`
  channel boundaries and pre-round.
- **Gradient CTAs render without a variant fragment (R12).** The live's
  gradient submit buttons (Add-Domain, Sign In, Start Free Trial) are
  Button base + consumer classes only; the consumers pass
  `variant={null} size={null}` (cva treats null as an explicit skip) so
  the merged string matches the live DOM byte-for-byte.
- **The announcement bar is LANDING-ONLY (R13).** The live pixelco.io
  renders the "🚀 Launch Offer" bar on `/` and nowhere else — sub-pages
  start directly with the sticky header. The chrome lives in
  `src/components/marketing/marketing-frame.tsx`; two sibling route
  groups mount it (`(landing)` with `showBanner`, `(marketing)`
  without). Do not move the bar back into a shared layout.
- **The accordion is LEGACY shadcn (R13).** Like the other UI
  primitives, `ui/accordion.tsx` carries the live's legacy strings (no
  data-slot, `items-center` trigger, `h-4 w-4` chevron, content
  `transition-all`, inner `pt-0` base). The item's consumer classes
  must keep `border` (the primitive base `border-b` merges away) —
  `last:border-b-0` was a 1 px section-height bug.
- **Sub-pages share one chrome recipe (R13).** about/docs: `container
  mx-auto px-6 py-16 max-w-4xl`; blog index: `max-w-5xl`; blog posts +
  legal: `max-w-3xl`. Every sub-page opens with `← Back to Home`
  (`text-sm text-primary hover:underline mb-6 inline-block`) — the ← is
  a TEXT character (U+2190), not an icon; the font tokens end with
  `system-ui, sans-serif` precisely so that glyph resolves (next/font's
  generated fallback family has no arrows).
- **Blog + legal copy is LIVE content (R13).** `src/data/blog-posts.ts`
  (10 posts) and `src/data/legal-pages.ts` (4 pages) carry the live's
  verbatim copy, converted by `scripts/r13-convert-{blog,legal}.py`
  from `research/round13-audit/content/` extractions. The legal text
  names the operator **Aiviral** — keep it. Blog `app.pixelco.io` CTA
  links map to `/signup` (single deployment). `ArticleBody` renders the
  shared block format (`## `/`### `/lists/tables) with a `blog` variant
  (classless elements styled by the prose wrapper's arbitrary variants)
  and a `legal` variant (direct classes + `<section>` grouping).
- **The dashboard shell is the shadcn Sidebar primitive (R15).** The live
  migrated its app bundle: `sidebar-shell.tsx` renders the provider
  (`data-state`/`data-collapsible=icon`/`data-variant=sidebar`/
  `data-side=left`, `group peer hidden … md:block` — the sidebar appears
  at **768px**, not lg) > a transparent gap div + a fixed container >
  `sidebar-nav.tsx`'s `div[data-sidebar=sidebar]` tree (header = the PNG
  logo `public/assets/logo-BxfT-ZTZ.png` + an UNLINKED font-display
  wordmark; groups carry `data-sidebar={group,group-label,group-content,
  menu,menu-item}`; menu buttons are `a[data-sidebar=menu-button]` with
  the full `peer/menu-button …` string + `h-8 text-sm
  hover:bg-sidebar-accent/50` tail and, on the active route, the appended
  `bg-sidebar-accent text-sidebar-accent-foreground font-medium` tail —
  `data-active` stays `"false"` (the live's own wiring quirk) and
  `aria-current="page"` marks the active item; icons carry
  `mr-2 h-4 w-4`). Collapse = the data-state flip only (the geometry
  rides `group-data-[collapsible=icon]` variants: 3rem rail, `!size-8
  !p-2` buttons, labels at opacity-0). The topbar is a NON-sticky `h-14`
  header whose toggle is `data-sidebar="trigger"` (no size fragment, an
  sr-only span); the mobile Sheet (below 768px) is the live's 288px
  Radix dialog (`--sidebar-width: 18rem` inline). The desktop sidebar
  stays CSS-hidden below md (SSR cannot know the viewport; the live's
  CSR unmounts it) — visually identical.
- **The app bundle's content layer tracks the live's CURRENT build (R16).**
  The live ships MIXED primitive generations side by side: the sidebar
  FREE badge, the domains Verified badge, the activity Identified badge
  and the auth-card buttons ride the R15 new-gen strings, while the
  visitors tab counts + type/status badges, the domains Pending badge
  and the activity Pageview badge ship the LEGACY Badge generation (base
  WITH `border`, secondary WITH `text-secondary-foreground`) — rendered
  via `src/components/dashboard/content-badges.tsx` (`LegacyBadge`), NOT
  the `ui/badge.tsx` primitive. Content rows are divs (`div.divide-y` +
  div rows — never ul/li), icon chips are bare `div`s (no aria-hidden
  wrappers), no content label/value carries `text-foreground`, and the
  class orders are geometry-first (e.g. `flex items-center justify-between
  mb-3`). The Tabs primitive carries the live's current trigger order
  (data-[state=active] BEFORE focus-visible) + a bare Root div; the
  billing switch (`ui/switch.tsx`) is the Radix-style string with
  data-state + value="on". lucide class names follow the live's
  single-name form via `src/components/dashboard/live-icons.tsx`
  (Building2Icon/Trash2Icon/CircleHelpIcon — R12 custom-icon precedent).
  The sidebar group-label deliberately ships the live's BROKEN class
  `transition-[margin,opa]` (their build dropped "city" — verified at hex
  level; it matches no utility on either side, so the label fade snaps).
  Do NOT "fix" it to `transition-[margin,opacity]`.
  Pinned by `tests/content-parity.test.tsx`.
- **R18: TW4's space-y compiles v3-incompatibly for [label, input] groups.**
  Tailwind v4 emits `margin-block-end` on the PRECEDING sibling
  (`:not(:last-child)`); the live's v3 applied margin-top to the
  FOLLOWING block input. When the preceding sibling is an inline
  `<label>` (every auth/settings field group), CSS ignores the vertical
  margin — the label→input gap collapsed by 8px. A scoped
  `globals.css` rule (`.space-y-2 > label + input`) restores the v3
  geometry; do NOT "fix" it by adding classes to Labels/Inputs (their
  strings are pinned). Similarly, TW4's space-y only spaces DIRECT
  children — a classless server-action `<form>` inside a
  `space-y-*` CardContent silently eats the card's rhythm (the settings
  Profile card once rendered FLUSH at 0px group gaps). Server-action
  forms inside spaced card bodies carry `space-y-4` themselves.
- **R18: the marketing bundle follows the live's emission orders (v1.17).**
  The live's marketing build emits lucide icons size→color→margin
  (`w-4 h-4 text-accent shrink-0`), paragraphs text-utilities-first
  (`text-xs text-muted-foreground mt-0.5`), containers px-before-border
  (`px-4 py-4 border-b border-border`), and icon/chip containers
  geometry-first (`w-8 h-8 rounded-full flex …`). Gradient surfaces ride
  the FULL `gradient-hero` (never the `-light` variant). Marketing CTAs
  are anchors wrapped around real buttons (hero/header: bare `<a>`;
  pricing/compare/CTA banner: `<a class="block">`/`w-full sm:w-auto`),
  with variant-free Buttons carrying the live's exact tails (cva treats
  `variant={null} size={null}` as an explicit skip). The pricing cards
  ALWAYS render the `text-xs … mb-4` spacer line (`&nbsp;` for
  free/monthly) so every CTA sits on the same baseline. The marketing
  wordmark is the PNG asset in a bare fragment (header lockup on the
  anchor with `gap-2.5` + tracking-tight; footer `gap-2` without);
  "By Ai Viral" rides the `font-script` utility. The header container
  uses the `container` utility + `h-16 px-6` (no max-w-7xl). The feed
  avatars are divs with inline `background-color: var(--primary)/
  var(--muted)`; the stat zap is the live's data-URI img. Pinned by
  `tests/marketing-r18-parity.test.tsx`.
- **R19: `.gradient-hero` resolves differently per bundle (v1.18).** The
  live ships TWO CSS resolutions under one class name: its marketing
  bundle defines `.gradient-hero` = the amber 3-stop
  `var(--gradient-hero)` (on `:root`, NOT redefined in `.dark`), while
  its app bundle uses the dark navy-to-warm-brown sweep (auth canvas).
  The clone mirrors this with ONE rule pair in `globals.css`: bare
  `.gradient-hero` (dark, auth) + `.marketing-scope .gradient-hero`
  (amber 3-stop, marketing tree). Do NOT "simplify" either away, and do
  NOT reintroduce `.gradient-hero-light` (retired R19 — the live's
  marketing bundle defines no such class; zero references). Pinned by
  `tests/marketing-r19-parity.test.tsx`.
- **R19: the hero feed widget runs the live's PHASE model (v1.18).**
  `live-feed.tsx` ships the live's roster (5 entries, varied labels
  "Anonymous Visitor"/"Unknown User"/"Site Visitor", delays
  [0, 1.8, 3.6, 5.4, 7.2]s), the per-row phase machine enter→scan
  (+600ms)→reveal (+1600)→done (+3200, unmount), the 10s parent cycle
  re-mount, row tops `index*56+12`, the avatar muted→primary flip
  (`.feed-avatar` transition) with User→Mail icons, the "Matching…"
  pulse badge and the ✓ reveal badge. The static render is the t=0
  ENTER state (all rows anonymous — emails appear only at the reveal
  timeout); do NOT bake emails into the static markup. Framer-motion
  inlines on the live's rows are D5-class reveal machinery. Pinned by
  `tests/marketing-r19-parity.test.tsx`.
- **R19: the hero trust-row avatars are the live's CURRENT photos
  (v1.18).** The live re-hosted its avatar set after the R8 capture
  (content-hashed names). The local `public/assets/avatars/avatar-{1..5}.jpg`
  are the live's current people at 96px (displayed at 32px); a
  perceptual 8×8 average-luma hash pin (offline, stored live hashes)
  guards the set. If the live swaps photos again, re-download and
  re-capture the hashes — never regenerate from scratch.
- **R20: the pricing toggle's MONTHLY state matches the live (v1.19).**
  The live's KD emission in monthly mode: paid cards carry a
  `"billed monthly"` sub-line (annual says "billed annually", free
  keeps the nbsp spacer), the off track is `bg-muted` (NOT
  `bg-muted-foreground/30`), and the off thumb emits `translate-x-0`
  (template branch, annual = `translate-x-7`). The live's toggle is
  pure `useState` — NO URL sync on either side (the "toggle URL
  state" hypothesis is a documented non-finding). Pinned by
  `tests/marketing-r20-parity.test.tsx`.
- **R20: the domains Add-Domain form is controlled + disabled-on-empty
  (v1.19).** `domains-panel.tsx` holds `domainValue` state, disables the
  button while `pending || domainValue.trim() === ''` (the live's
  behavior; the clone previously leaned on native `required`, which the
  live has none of), and clears the input on success. The clone's zod
  hostname validation and AlertDialog delete-confirm are KEPT as
  intentional divergences — the live accepts ARBITRARY domain strings
  (the R20 probe created `not_a_valid domain!!` as a real row) and
  deletes immediately with no confirm; never replicate a live defect
  (PAD Known Issues, v1.19/F3).
- **R20: the feed reveal STAGES the text swap like the live (v1.19).**
  The live's text column is AnimatePresence `mode:"wait"`: on reveal
  the old anonymous text exits (0.3 s, y:-8) BEFORE the email block
  enters (0.4 s, y:+8), and the ✓ badge springs in (scale overshoot).
  `live-feed.tsx` stages this with `SWAP_MS = 300` state flags +
  `.feed-text-exit` / `.feed-text-in` / `.feed-badge-in` keyframes in
  `globals.css` (reduced-motion guarded); phase constants and the
  static t=0 render are unchanged (R19 pins hold).
- **R21: the CSV export ships the LIVE's byte format (v1.20).** The
  live's export (bundle fn W) is a client-side Blob with header
  `Type,Name,Detail,Confidence,Source,Location,First Seen,Last
  Seen,Status`, per-type rows (Company/Individual, `X%`/`—`,
  identType/"IP Lookup", geo-join/`—`, en-US short First Seen, RELATIVE
  Last Seen, 1-hour computed status), joined with LF, NO BOM, NO
  quoting (the live embeds its date comma raw — replicate faithfully),
  scoped to the CURRENT PAGE. The clone's `/api/export` emits those
  bytes (the server mechanism is invisible); the topbar's Export All
  href is page-scoped via the chrome store's `pageVisitorIds`. Do NOT
  re-add BOM/CRLF/csvCell quoting — that was the pre-R21 format.
- **R21: the visitors page runs the LIVE's filter/badge/data model
  (v1.20).** PAGE_SIZE 20 (the live's `ni`). Confidence select = the
  live's BANDS (All / High (85%+) / Medium (70-84%) / Low (<70%) —
  `gte 85`, `70-84`, `lt 70` — never lower-bounds). Source = the
  IDENTIFICATION type (All Sources / Direct Signups / Network Matches);
  `visitor.source` holds `direct|network|ip-lookup` (derived by
  `identTypeFor` at the identification claim; `sourceFromReferrer` is
  RETIRED — referrers live on Event rows). The b2c Type badge is
  Direct (neon-green) / Network (electric-blue); the confidence bar
  fill is 3-TIER (>=85 neon-green / >=70 electric-blue / else
  hot-pink); company rows carry confidence NULL and ALWAYS render the
  MapPin location cell. Pinned by `tests/visitors-r21-parity.test.tsx`.
- **R21: `relativeTime` + `isVisitorActive` are the live's exact rules
  (v1.20).** relativeTime = the live's `Ry`: "Just now" <60s / "N min
  ago" / "N hr ago" / "Nd ago" (no space, no weeks, no date fallback).
  isVisitorActive = the live's `now−36e5` (ONE hour, not the old
  30-minute session window). Both feed the table, activity feed,
  dashboard and the export.
- **R21: the landing MOBILE dropdown is the live's captured structure
  (v1.20).** Container `md:hidden bg-background border-b border-border
  px-6 py-4 flex flex-col gap-4`, PLAIN anchors (`text-sm font-medium
  text-muted-foreground` — no rounded/padding/hover classes), the 4 nav
  links + ONE `h-10 w-full` gradient CTA (Start Identifying → /signup
  per the standing CTA mapping) — the live ships NO Log In button in
  the dropdown. Pinned by `tests/visitors-r21-parity.test.tsx`.
- **R22: the Activity Log runs the LIVE's pagination model (v1.21).**
  The live's bundle (component `hxe`) ships `Jc=50` — 50-per-page OFFSET
  pagination with `useState(0)` page index (NEVER in the URL), `count
  exact`, and a footer ONLY when count > 50: container `flex items-center
  justify-between px-5 py-3 border-t border-border`, left `text-xs
  text-muted-foreground` "1–50 of N", ghost `icon` chevron buttons
  (`h-7 w-7`, disabled at the bounds) + `text-xs text-muted-foreground
  px-2` "Page X of Y" between them. Page advance REPLACES the list (a
  py-24 spinner mid-swap). NO polling, NO load-older, NO cursor — do
  NOT re-introduce the pre-R22 5s poll / 60-per-page cursor walk.
  `listActivity` (page mode + count) is the single seam shared by the
  server page (page 0) and `/api/activity`. Pinned by
  `tests/activity-r22-parity.test.tsx` + `tests/activity-query.test.ts`.
- **R22: the first-run EMPTY STATES are the live's exact branches
  (v1.21).** Visitors: when the current tab's FILTERED count is 0, a
  `<p class="text-sm text-muted-foreground py-12 text-center">No
  visitors identified yet. Install your pixel to get started.</p>`
  REPLACES the entire table wrapper (direct child of the `p-0` card
  content — search+confidence+source all feed the count, so a no-match
  SEARCH shows the install message; "No visitors match your filters."
  only materializes pagination-past-end). Activity: the same `<p>` with
  "No activity yet. Install your pixel to start tracking.". Top Pages:
  `py-8` + "No page data yet". Recent Identifications: class order
  `text-sm text-muted-foreground py-12 text-center`. Domains: a plain
  `div` `text-center py-12 text-sm text-muted-foreground` inside the
  `p-0` card. The visitors search placeholder varies by tab ("Search
  companies..." b2b / "Search emails, companies..." else). Pinned by
  `tests/dashboard-empty-r22-parity.test.tsx`.
- **R22: the install page's zero-domains path is the live's
  interstitial (v1.21).** Normal header ("Install Your Pixel" + "Add a
  domain first to get your tracking snippet.") + a centered card
  with an "Add a Domain" hero-style CTA to `/dashboard/domains`. The
  placeholder key `px_xxxxxxxxxxxxxxxx` is the live's LOADING
  fallback — never shipped here. The DomainSwitcher renders ONLY when
  sites.length > 1 (bundle `i.length>1`). The Quick Start copy button
  swaps to a plain "Copied!" (no green check) — the GREEN check
  (`text-green-500`) lives on the MARKETING docs copy button only.
- **R22: the docs "Contact Support" is a real Button with a WORKING
  mailto (v1.21).** The live ships the same Button tag but DEAD (no
  handler — click-verified). The clone keeps the working
  `mailto:support@pixelco.io` onClick in the extracted
  `ContactSupportButton` client leaf; the dead-button behavior is a
  documented live defect (R17 contact-sales precedent). The live's
  signup EMAIL-CONFIRMATION gate ("Check your email" toast) is a
  D-class divergence — this clone has no mail transport, so signup
  auto-sessions (PAD §11). Pinned by
  `tests/marketing-r22-parity.test.tsx`.
- **D5 (R18): the clone's invisible functional chrome is KEPT, documented.**
  Switch semantics on the marketing billing toggle (`role="switch"` +
  `aria-checked` — the live ships a plain button; the R20 functional
  probe re-confirmed these attrs are the toggle's ONLY divergence, and
  the strict-parity fix was reverted in their favor), the 8 marketing
  `section aria-labelledby` landmarks, `focus-brand` focus rings on
  links, the reveal machinery (`data-reveal` + observer classes vs the
  live's inline styles), the `feed-row` animation hook, and decorative
  `aria-hidden` (stars, dots, knobs). Generic-tag swaps (span→div
  pills/chips) DO match the live — R17-F3 pattern: no clone-authored
  aria-hidden on bare chip wrappers.
- **R17 verification-gap closures (v1.16).** The activity **Identified**
  badge rides the SAME new-gen string as the domains Verified badge
  (`variant="default"` + `text-[10px] px-1.5 py-0 gradient-primary
  text-primary-foreground border-0`) — NOT a secondary-variant hybrid
  (no `hover:opacity-90` anywhere in the content layer). The pricing
  contact-sales CTA is a **variant-free Button** with the full consumer
  tail (`border-2 border-primary/30 bg-transparent text-primary
  hover:bg-primary/10 transition-all duration-300 font-semibold h-10
  px-4 py-2 shrink-0`) + `onClick` mailto — never an outline/asChild
  anchor; its Card root uses consumer `border-border bg-card` (twMerge
  displaces the base bg-card to the tail — that IS the live's order).
  Install icon chips are BARE geometry-first divs (`h-8 w-8 rounded-lg
  bg-muted flex items-center justify-center`, step chips `h-6 w-6
  rounded-full bg-primary/10 … shrink-0 mt-0.5`) — never span wrappers
  with aria-hidden. The trend chart KEEPS its `role="img"` + aria-label
  (ruling D3: invisible functional a11y). Screenshot parity requires
  waiting for hydration — the live's pre-hydration shell renders DARK;
  never diff screenshots captured during loading skeletons.
- **`w-[--sidebar-width]` is hand-defined in globals (R15).** Tailwind v4
  compiles the live's TW3-style bare-var brackets to INVALID CSS
  (`width:--sidebar-width`); the two affected utilities (+ the
  icon-collapsible variant) are hand-written in `globals.css` so the DOM
  ships the live's byte-identical class strings with working CSS. The
  vars (`--sidebar-width: 16rem`, `--sidebar-width-icon: 3rem`) live on
  `:root`. Do not "fix" the class strings to `w-(--sidebar-width)`.
- **The app bundle's logos/headings/badges follow the live's R15
  conventions.** The sidebar header + auth cards use the PNG asset (the
  marketing wordmark keeps the inline SVG); auth-card headings are h3s on
  the CardTitle pattern (`font-semibold tracking-tight font-display` +
  size) and NO heading in the app bundle carries `text-foreground` (the
  color inherits); the Badge primitive is a DIV root without the base
  `border` (secondary has no own foreground); the Label primitive is the
  new-gen string (no data-slot/flex chrome); the pricing plan cards are
  Card-base-first with chip-row feature lists and NO popular badge; the
  bell dot is the `bg-hot-pink` utility; the layout root paints
  `bg-muted/30` over `--background` (`.bg-app` is retired).
- **Document heads are live-parity (R14).** Every marketing page builds
  its full `<head>` via `src/lib/marketing-seo.ts`
  (`marketingMetadata({title, description, path})` — title.absolute with
  the live's own suffix pattern, per-page og:url/og:title/og:description,
  `og:locale en_US`, the self-hosted `/og-image.webp`, large twitter
  card, per-page canonical). App surfaces (login, signup, forgot,
  dashboard) use `src/lib/app-seo.ts` — the live app bundle's OWN og
  block ("Pixelco" / "Visitor identification platform dashboard" /
  `/app-og-image.png`, NO canonical/og:url/og:locale). The root title
  template suffix is `|` (the live's convention — `·` was clone-
  authored). Blog posts carry a `metaDescription` (the live's meta
  description, DISTINCT from the card excerpt). The social images are
  self-hosted copies of the live's (never hotlink its builder storage),
  and the live's `twitter:site @Lovable` build artifact is deliberately
  NOT replicated.
- **robots.txt/sitemap.xml are Route Handlers, not conventions (R14).**
  `src/app/{robots.txt,sitemap.xml}/route.ts` emit the live's documents
  byte-for-byte (comments, `xmlns:news`/`xmlns:image`, "1.0" priorities,
  lowercase `User-agent:`, the live's hand-authored URL order — the post
  order is a PINNED slug array in the sitemap route, not a date sort).
  Do not convert them back to `app/robots.ts`/`app/sitemap.ts` — the
  metadata conventions cannot emit comments or trailing-zero priorities.
  The favicon is `public/favicon.ico` (the live's bytes, auto-discovered
  — there is no `app/icon.svg` and no injected link tag).
- **The 404 tab title is a client-side swap (R14).** The live (CSR)
  serves its shell title and swaps to "Page Not Found | Pixelco" in the
  client router; the clone reproduces this via the `NotFoundTitle`
  island in `not-found.tsx` — a MutationObserver re-asserts the title
  because Next's client metadata controller re-applies the resolved
  root `<title>` AFTER hydration (a plain `document.title` assignment in
  an effect gets overwritten). Unmount disconnects the observer so
  client navigation restores normal metadata. The HTTP status stays a
  correct 404 (the live's 200 SPA fallback is not replicated).
- **Typography is live-parity (v1.4).** App body = **Inter**; **Space
  Grotesk** is the `font-display` utility (card titles, page H1s, KPI values,
  prices, sidebar wordmark); marketing = **DM Sans**; mono stays mono. Brand
  utilities (`.gradient-primary`, `.glow-primary`, `.text-gradient-primary`,
  `.text-gradient-hero`, `neon-green` token) live in `globals.css` — never
  hand-roll amber/teal approximations in components.
- **`/pixel.js` is a route, not a file.** The collector script is served by
  `src/app/pixel.js/route.ts` (folder named `pixel.js`). Don't add a
  `public/pixel.js`.
- **NextAuth v4, not v5.** `getServerSession` is imported from `'next-auth'`;
  `signIn`/`signOut` exist **only** in `next-auth/react` (client). Server
  actions must not import them. Session shape is augmented in
  `src/types/next-auth.d.ts` (`session.user.id` is the DB key).
- **Mutations are Server Actions only** (`src/actions/*`), each returning the
  `ActionResult<T>` envelope from `src/lib/validation.ts`. Route handlers are
  a fixed whitelist: `api/track`, `api/activity`, `api/export`, `api/health`,
  `api/auth/[...nextauth]`, `pixel.js`, plus the two SEO document routes
  `robots.txt`/`sitemap.xml` (R14 — GET-only, live-byte reproducers, see
  above). Don't add REST endpoints for UI mutations.
- **Quota has one mutation path.** `src/lib/quota.ts` is the only module that
  writes `identificationsUsed` — consumption is a single conditional UPDATE
  (free plans hard-stop; paid monthly plans increment unconditionally and
  count overage). The 30-day reset persists and is guarded on the stale
  anchor. Never increment the counter anywhere else.
- **Activity rows key identity off the event type (v1.6).** `listActivity`
  returns `email` only for identification events — pageview rows always show
  `anonymousId.slice(0, 12) + '...'` — so identifying a visitor never
  rewrites their earlier pageview rows (the live behaves the same; pinned by
  a round-7 test).
- **The visitors topbar subtitle is server-rendered (v1.5).** The dashboard
  layout fetches `getVisitorSegmentCounts` and passes the counts into the
  Topbar — `PAGE_META` subtitles must never contain brace templates (a
  template once leaked literal `{individuals}` on first paint; pinned by a
  chrome test). The format never singularizes: the live renders
  "1 companies".
- **The marketing pricing section defaults to ANNUAL (v1.9).** The live
  loads with the billing toggle switched on — an iOS-style switch
  (`w-14 h-7` + translating knob), not a segmented pill — rendering the
  floored annual table ($63/$199/$639) first. The Free card CTA reads
  "Free Tier" in the secondary style (no gradient, no "/mo" on $0); only
  the Growth card carries the gradient (leading Zap, no trailing arrow).
  Both price tables still come from `plans.ts` — never compute prices
  inline.
- **Tests run against `db/test.db`.** `tests/global-setup.ts` recreates it via
  `prisma db push` on every run; `TZ` is pinned to UTC. `vitest.config.mts`
  sets `testTimeout`/`hookTimeout` to 30 s and `tests/setup.ts` raises
  `PRAGMA busy_timeout=10000` + `WAL` so the quota Prove-It (110 concurrent
  `consumeIdentification`) can serialize on SQLite single-writer. Integration
  tests invoke route handlers/actions directly with mocked `next/headers` /
  `next-auth` (see `tests/setup.ts`). Keep new behavior test-first.
- **Generated JS is executed in tests, never string-pinned.** The install
  snippet and the collector both run under `node:vm` with mocked globals; a
  serialization assertion once hid a snippet that threw on every real
  customer page. If it has a behavioral contract, execute it.
- **Auth gate is UX only.** `src/app/dashboard/layout.tsx` redirects
  unauthenticated users, but every action/route re-checks the session itself.
  Keep it that way.
- **Prisma + SQLite.** Schema in `prisma/schema.prisma`; after editing run
  `npm run db:push` (there is no migrations folder — this project uses
  push-based schema sync). `DATABASE_URL` relative paths resolve against
  `prisma/` — enforced by the R23 seams (`src/lib/db-path.ts` for the
  runtime, `scripts/with-db-url.mjs` for the CLI), NOT by Prisma natively.
  In `output: "standalone"` runtime, use absolute SQLite paths
  (docs/DEPLOYMENT.md §4).
- **No `console.log`.** ESLint allows only `warn`/`error`/`info`.
- **`any` is an ESLint error.** Use `unknown` and narrow.

## Conventions

- **Marketing pages live in two sibling route groups** — the landing in
  `(landing)` (chrome + announcement bar) and every sub-page in
  `(marketing)` (`src/app/(marketing)/…`, chrome only) — both mounting
  the shared `MarketingFrame` (header, footer, reveal machinery). Nav/footer links come only from
  `src/lib/marketing-links.ts`; blog posts only from
  `src/data/blog-posts.ts` (append a post there — index, article pages and
  sitemap pick it up automatically). Both modules are unit-tested for
  integrity; don't hand-write hrefs in components.
- Server components fetch data via `src/lib/analytics.ts` (marked
  `server-only`); `requireUser(await getServerSession(authOptions))` is the
  single session guard for dashboard pages. Interactive leaves are
  `'use client'` components under `src/components/{marketing,dashboard,auth}`.
- Money and quotas are integers (cents / counts) — never floats. Plan
  definitions and all money math (`annualTotalCents`, `formatPrice`, …) live
  only in `src/lib/plans.ts`.
- Ingest accepts only the minimal payload (`k,u,p,r,v`); beacons whose page
  hostname does not match the registered domain are dropped before any write.
- The visitor list is URL-driven: `listVisitors` in `src/lib/analytics.ts` is
  the single query seam (search/filters/pagination/counts). It lists
  **identified visitors only** (email non-null), matching the live product;
  the active/inactive badge derives from `lastSeen` via `isVisitorActive`
  (30-minute window) — `visitors.status` is a dead column, never render it.
- The identity-resolution engine (`src/lib/identification.ts`) is
  deterministic: decisions derive from `sha256(siteKey + anonymousId)`. If you
  change name lists or the PRNG, historical decisions change — treat that as
  a data-affecting migration.
- Commit style: Conventional Commits, atomic scope (`feat(visitors): …`).
  Main branch only; no feature branches in this repo.

## Git push (SSH deploy key)

Pushes use `docs/ssh_git_wrapper_v3.py` with an externally-supplied deploy key
(see `docs/how-to-git-push-using-ssh-wrapper_SKILL.md`):

```bash
cat /secure/key | python3 docs/ssh_git_wrapper_v3.py --key-stdin \
  --remote git@github.com:nordeim/pixel-identifier.git
```

Never commit keys; `.gitignore` rejects `*.key` and `ssh-key.txt`. Run the
verification gate before pushing.

## Known quirks

- `eslint` ignores `research/**` (captured live/clone audit artifacts are
  evidence, not source — third-party JS captures must not be linted).

- OAuth buttons (Google/Apple) on the auth pages are intentionally disabled
  placeholders — no OAuth providers are configured.
- `/forgot-password` renders an anti-enumeration acknowledgement but sends
  no email — there is no mail transport. The live product links to the
  route but serves a 404; replicating a dead link was ruled a defect (PAD
  §11).
- Billing is simulated: `changePlanAction` updates entitlements directly, no
  payment processor. Switching plans never resets the used counter; paid
  plans keep identifying past the limit and report overage.
- The Activity Log is PAGINATED, not polled (R22): 50 events per offset
  page (`/api/activity?page=`, `{events, count, pageCount}` envelope), a
  prev/next footer only when count > 50, page fetches on footer click —
  NO 5-second poll, NO websockets, NO load-older.
- NextAuth v4 on Next 16 is a maintenance-mode pairing — works today, but
  budget an Auth.js v5 / Better-Auth migration before the next Next major
  (see PAD §11).

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
