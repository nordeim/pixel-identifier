# Pixelco Clone — Round 5 Parity & Hardening Plan

> **For Claude:** REQUIRED SUB-SKILL: Use the `tdd` skill (red → green) to
> implement this plan task-by-task. Every behavioral change starts with a
> failing test at a pre-agreed seam (pure data module, analytics query, route
> handler, or snippet module). Presentational-only changes (className swaps,
> icon swaps, token additions) are gated by lint + typecheck + build + fresh
> browser screenshots instead — say so explicitly in each commit. Commit after
> each green task. (`verification-and-review-protocol`: no completion claim
> without fresh command output read by you.)

**Goal:** Close the remaining visual/functional parity gaps against the live
`pixelco.io` / `app.pixelco.io` (typography, chrome, all seven dashboard pages,
auth pages, marketing hero) discovered by a fresh round-5 live DOM audit,
fix one **critical functional defect** in the install snippet (it throws when
executed), and realign visitor-listing semantics with the live product
(identified-only list, honest active/inactive status, B2B company display).

**Architecture:** Next.js 16 App Router. No route additions; one additive
nullable-column schema change (`visitors.city/state/country` for B2B display);
fonts change from Geist to Inter + Space Grotesk (app) and DM Sans (marketing)
via `next/font`; new Tailwind 4 utilities in `globals.css` (`gradient-primary`,
`glow-primary`, `text-gradient-primary`, neon-green tokens) mirroring the live
app's custom classes. Server Actions remain the only mutation path; the
route-handler whitelist is untouched.

**Tech Stack:** unchanged (Next 16, React 19, TS strict, Tailwind 4,
shadcn/ui, Prisma/SQLite, NextAuth v4, Vitest).

**Audit source:** Round-5 audit (2026-09-15) of HEAD `576fe4d`. Live evidence:
logged into `app.pixelco.io` with the supplied account, captured all 7
dashboard surfaces + login/signup + marketing landing at 1440×900 (archived in
`research/round5-audit/live/`), extracted DOM ground truth (computed styles,
class lists, per-cell HTML for tables/badges/avatars, font families, KPI
values), and ran controlled beacon experiments against the live ingest
(`/pageview` with browser UA + fresh visitor ids) to decode the live
`active`/`inactive` rule, the visitors-list scope, and the domain-row count
semantics. Local counterparts captured from the dev server
(`research/round5-audit/local/`) and compared pairwise via VLM. Findings
cross-checked against source before listing. Baseline at audit time:
`npm run verify` green (157 tests / 25 files, 34 routes).

**Severity scale** (code-review-and-audit skill): Critical → fix first;
High → same release; Medium → this release; Low → opportunistically.

---

## Findings (validated against the codebase and the live DOM)

| ID | Sev | Finding | Evidence (verbatim) |
|----|-----|---------|---------------------|
| R5-C1 | **Critical** | The emitted install snippet passes `'document'` as a **string literal**, so the IIFE receives a string where it calls `i.createElement` → `TypeError: i.createElement is not a function` the moment a customer pastes the snippet into a real page. The existing unit test pins the buggy output, so the suite is green while the product's core install path is broken. | `src/lib/snippet.ts:32`: `` })(window,'document','px','${key}'); `` — executed in node: THROWS TypeError; with the `document` object: works. Live snippet: `})(window,document,'px','px_cfdff430f45b04c6');`. `tests/snippet.test.ts:42` asserts the quoted `'document'` |
| R5-C2 | **Critical** (functional parity) | Visitor `status` is a dead field — always the schema default `'active'`; nothing ever writes another value, so every row renders "active" forever. Live: a visitor seen "Just now" renders `active` (solid yellow pill), one seen "13 hr ago" renders `inactive` (gray pill). The live collector documents `SESSION_MAX_AGE = 1800` (30 minutes — one "visit"). | live DOM: status cells `bg-primary` "active" @ "Just now", `bg-secondary` "inactive" @ "13 hr ago"; clone `schema.prisma` Visitor.status default 'active', zero writers; `visitors-table.tsx:373-381` branches on the stored value |
| R5-H1 | High | Typography does not match: the live app uses **Inter** (body) + **Space Grotesk** (`font-display` — card titles, page H1s, KPI values, prices, sidebar brand) and the marketing site uses **DM Sans**; the clone uses Geist Sans everywhere. `font-display` is pervasive on live (`font-display text-2xl font-bold`, `font-display text-lg`, `text-3xl font-display font-bold`). | live computed: app body `Inter, sans-serif`; `.font-display` → `"Space Grotesk", sans-serif`; marketing h1/body `"DM Sans"`; clone `layout.tsx` loads only Geist/Geist Mono |
| R5-H2 | High | Install page: the clone renders the page title **twice** (topbar PAGE_META + in-page H1) — live renders **no topbar title** on Install and Settings (in-page H1 only: `font-display text-2xl font-bold`). The clone is also missing two live cards: **How It Works** (4 feature boxes: Automatic Email Detection / Cross-Site Identification / SPA Support / Async & Lightweight) and **Site Key** (mono key + domain, `border-primary/20`). Quick Start icon must be a `gradient-primary` box (clone: `bg-primary/15` + amber icon); snippet pre must be `bg-foreground/5 border rounded-lg p-4 text-sm font-mono` with an `h-9` border+bg Copy button (clone: `bg-[#F8F9FA]`, text-xs, ghost copy); copy says "on your website." (clone interpolates the domain); status banners differ (live waiting: "Waiting for first event... Paste the snippet on your site and visit a page. This status will update automatically once we receive data." in `bg-neon-green/5`; live receiving: **"Pixel verified! We're receiving data from {domain}. Everything is working."** in `bg-neon-green/10`; clone: sky/teal messages with different copy); container `max-w-4xl` (clone `max-w-3xl`). | live install DOM extraction (header row `flex items-center justify-between` + h1 `font-display text-2xl font-bold`; card list incl. How It Works + Site Key); clone `install/page.tsx`, `PAGE_META['/dashboard/install']` |
| R5-H3 | High | Settings page: no in-page H1 (clone puts title only in the topbar); inputs render on the marketing background `#FFFCF5` instead of the live `#F6F7F9`; "Save Changes" is a plain primary button (live: `gradient-primary font-semibold h-9`); card titles lack `font-display`. | live settings DOM: `main h1 = "Settings" (font-display text-2xl font-bold)`, inputs computed `rgb(246,247,249)`, Save `gradient-primary … h-9`; clone `settings-panel.tsx` |
| R5-H4 | High (functional parity) | Visitors list scope: the live table lists **identified visitors only** (controlled experiment: an accepted anonymous beacon appears in the live feed but never in the visitors table; "All" count = identified count). The clone lists anonymous visitors too. Company rows on live render the **company name** as primary text with a `rounded-lg bg-primary/10` building-2 avatar and a **map-pin location** ("Hong Kong, Hong Kong, HK") in the Confidence column; the Type badge shows "Company" (amber) for B2B and the **source** (neon-green tint) for B2C. The clone shows email-initials avatars for companies, sky-blue source badges for everyone, and no location. | live: table rows after 3 controlled beacons = 3 identified only; company row DOM (`building2 h-4 w-4`, `map-pin h-3 w-3`, `bg-amber-500/10` Company badge, `bg-neon-green/10` Direct badge); clone `analytics.ts` listVisitors base `{ site: { userId } }` |
| R5-H5 | High | Domains page: "Add Domain" is outline-styled (live: `gradient-primary text-primary-foreground shadow-lg glow-primary`, `h-10`); rows lack the live structure (`h-9 w-9 rounded-lg bg-primary/10` globe box, `hover:bg-muted/20`, Verified = solid `bg-primary` + `CircleCheckBig`, Pending = `bg-secondary` + `CircleAlert`); the visitor count shows only the total (live: big number = **identified** count + small "N visitors" = total). | live domains DOM extraction (Add button class list, row HTML, badge classes, `text-right` count block); clone `domains-panel.tsx`, `actions/domains.ts` `DomainDto` |
| R5-H6 | High | Pricing page: the summary banner is a card (`bg-primary/20`, big amber %) — live is a **plain flex row**: "You're on the *free* plan" (`text-sm font-semibold` + `text-gradient-primary capitalize` span) + "N of M identifications used (lifetime)" + a thin `h-1.5 w-32` gradient progress + small "N%". Card typography (`font-display` name/price), POPULAR = **inline gradient pill next to the name** (clone: black absolute badge reading "Popular"), popular card = `border-primary ring-1 ring-primary/20 scale-[1.02]` + top `h-1 gradient-primary` strip, quota block = `mt-3 pt-3 border-t` with number/label split, feature items = `check h-2.5` inside `h-4 rounded-full bg-primary/10` circle + `text-xs text-muted-foreground`, CTA = `gradient-primary h-10` with `zap h-3.5`. | live pricing DOM (summary row, growth card class list `… border-primary shadow-md ring-1 ring-primary/20 scale-[1.02]`, POPULAR pill, feature item HTML); clone `plan-panel.tsx` |
| R5-H7 | High | Sidebar chrome: header is `h-14 border-b px-5` (live: `p-4`, **no border**, logo `h-8 w-8` + `font-display text-lg font-bold` "Pixelco"); group labels `text-sm` (live `text-xs`); the usage card is `rounded-xl bg-primary/10 p-3.5` with a solid badge and shadcn Progress (live: `rounded-lg border border-primary/20 bg-primary/5 p-3`, `gradient-primary` "FREE" badge `px-1.5 py-0`, `text-xs text-muted-foreground` count, custom `h-1.5` progress with `gradient-primary` fill); sign-out is `text-sm gap-3 px-3 py-2 h-4 icon` (live: `text-xs gap-2 px-1`, `LogOut h-3.5 w-3.5`). | live `[data-sidebar=header/footer]` DOM; clone `sidebar-nav.tsx`, `sign-out-button.tsx` |
| R5-H8 | High | Topbar: avatar is `h-9 bg-primary` with a DropdownMenu (live: `h-8 w-8 rounded-full gradient-primary` **static div**, no menu — the live app has no account dropdown; sign-out lives in the sidebar); bell is `size=icon` (live: `h-10 w-10` with `bell h-4 w-4`). | live header right section DOM; clone `topbar.tsx:81-138` |
| R5-M1 | Medium | Activity page: full-width list (live: `max-w-3xl space-y-4`); rows `items-center gap-3 px-4 py-3.5` (live: `items-start gap-4 px-5 py-4 hover:bg-muted/20`); icon circles `h-9` with `h-4` icons (live: `h-8 w-8`, `h-3.5` icons); name badges are tinted pills (live: plain bordered `text-foreground text-[10px] px-1.5 py-0`); card title lacks `font-display`. | live activity row HTML; clone `activity-feed.tsx:102-150` |
| R5-M2 | Medium | Overview: "New This Week" uses `UserPlus` (live: `users`); KPI value `text-3xl font-extrabold` (live: `text-3xl font-display font-bold tracking-tight`); KPI label `font-semibold tracking-wide` (live: `font-medium tracking-wider`); icon box `bg-primary/15` + amber icon (live: `bg-primary/10` + `text-primary`); KPI card inner `p-5` (live: `p-6 pt-5 pb-4 px-5`); "Active Domains" value = verified count with "N pending review" branch (live: value = **total** domains, sub always "N verified"); card titles lack `font-display`; Recent Identifications avatar `h-8 bg-primary text-[10px] font-extrabold text-white` (live: `h-7 gradient-primary font-bold`); chart strokes `#9333EA/#2DD4BF` (live: `hsl(262,83%,58%)` / `hsl(172,66%,50%)`). | live overview DOM (KPI card HTML, avatar, chart stroke attrs); clone `dashboard/page.tsx`, `trend-chart.tsx` |
| R5-M3 | Medium | Auth pages: logo sits **above** the card (live: inside the card, `h-10` on login / `h-16` on signup); the footer link renders **twice** (AuthShell footer + form bottom: "Sign up free" ×2 on login, "Sign in" ×2 on signup — live shows one, inside the card); the signup Terms/Privacy links point to `/` instead of `/terms` and `/privacy`; background glow differs (live: soft blurred radial glow behind the card). | live login/signup a11y + DOM (single "Sign up free" link ref; logo `h-16 w-16` in card); clone `auth-shell.tsx`, `login-form.tsx:102-107`, `signup-form.tsx:138-155`, `login/page.tsx`, `signup/page.tsx` |
| R5-M4 | Medium | Marketing hero: "— By Their Email" renders as a solid `bg-primary` box (live: `<span class="text-gradient-hero italic">` — italic + `background-clip: text` with the yellow-orange gradient `135deg, #FFAA00, #FFD91A, #F58F00`, transparent fill). | live h1 innerHTML + computed clip/fill; clone `hero.tsx:35-37` |
| R5-M5 | Medium | The live app's custom utilities are absent: `.gradient-primary` (`linear-gradient(135deg, rgb(255,193,5), rgb(255,178,0))`), `.glow-primary`, `.text-gradient-primary`, and the neon-green palette (`#2BD4BD` — used by confidence bars, source badges, install banners). The clone hard-codes approximations per-component (`teal-500`, `sky-50`, `amber-300`…). | live computed styles for `.gradient-primary` and `.bg-neon-green`; clone `globals.css` (no such utilities) |
| R5-M6 | Medium | Domain row count semantics (see R5-H5): `DomainDto` carries only `visitorCount` (total); the live big number is the **identified** count with "N visitors" as the label. | live domains DOM (`text-right` → `text-sm font-semibold` big + `text-[10px]` "N visitors"); clone `actions/domains.ts` |
| R5-L1 | Low | Domain switcher: `w-[220px]` default-height trigger (live: `h-10 w-[200px]`). | live combobox class list; clone `domain-switcher.tsx:31` |
| R5-L2 | Low | Card corner radius drift: the live dashboard uses `rounded-lg` cards everywhere; several clone surfaces use `rounded-xl`. | live card class lists (`rounded-lg border bg-card …`); clone install/activity/visitors/plan panels |
| R5-L3 | Low | Sub-text under visitor emails: `text-xs` (live: `text-[11px] font-mono`). | live visitor cell DOM; clone `visitors-table.tsx:345-347` |

**Clean bill (verified this round, no action):** sidebar width (255≈256px),
active nav tokens (`#F8F6F2`/`#CC9900`, radius 10px, weight 500), section
names/icons, bell dot (`bg-hot-pink` #EC4699), topbar structure `h-14 bg-card
px-6`, chart palette (purple/teal, no legend), plan catalogue strings, KPI
formulas (Total Visitors / Emails Identified / match rate), quota accounting,
ingest route invariants, standalone build + smoke, CI, Dockerfile — all match
live or previously-verified state.

**Documented unknowns (no action):** the live "New This Week" KPI read `2`
with 4 visitors all created this week — its exact window semantics could not
be decoded from controlled observation; the clone keeps "new visitors in the
last 7 days vs the previous 7 days". The live visitors-page domain switcher
was only observed with 2+ domains; the clone keeps the `sites.length > 1`
gate. Live billing/identity engines remain simulated per ADR-005/006.

---

## Workstream A — Critical functional fixes (TDD)

### Task A1: the install snippet must execute (R5-C1)
- **RED** extend `tests/snippet.test.ts` with a `node:vm` execution test:
  build the snippet, strip the `<script>` tags, run it against mocked
  `window`/`document` globals (a `createElement` recorder + `head.appendChild`
  recorder), and assert **no throw**, one created script element whose `src`
  is the collector URL and whose `data-site` is the site key. The current
  output fails with `TypeError: i.createElement is not a function`.
- **GREEN** `src/lib/snippet.ts`: pass `document` unquoted and add the live's
  trailing `;` after `appendChild(s)`. Update the old string-pinning assertion
  (line 42) to the corrected output.
- **commit** (`fix(snippet): emitted loader passes document, not a string — the install snippet actually executes`).

### Task A2: honest active/inactive status (R5-C2)
- **RED** `tests/dashboard-chrome.test.ts`: new pure helper
  `isVisitorActive(lastSeen: Date, now?: Date)` — active iff within 30 minutes
  of now (the live collector's session window). Cases: now → active;
  +29 min → active; +31 min → inactive; 13 hr → inactive.
- **GREEN** implement in `src/lib/dashboard-nav.ts` (chrome/data seam).
- **GREEN (component)** `visitors-table.tsx` derives the badge from
  `isVisitorActive(new Date(visitor.lastSeen))`: active = solid `bg-primary`
  pill; inactive = `bg-secondary` gray pill (drop the stored `status` read).
- **commit** (`feat(visitors): honest active/inactive status from the 30-minute session window`).

### Task A3: visitors list = identified visitors only (R5-H4 scope)
- **RED** update `tests/visitors-query.test.ts` to the live semantics: the
  seeded 40 anonymous visitors must not appear; totals/counts count only the
  20 identified; the `q: 'v_seed_0042'` anonymous-id search now returns 0.
- **GREEN** `listVisitors` base where: `{ site: { userId }, email: { not: null } }`
  (counts included). Simplify `visitors-table.tsx`: drop the
  Anonymous-visitor avatar/name branches.
- **commit** (`feat(visitors): list identified visitors only, like the live product`).

### Task A4: overview KPI alignment (R5-M2 partial)
- **RED** `tests/analytics.test.ts`: `getOverviewStats` — `activeDomains` =
  total site count, `verifiedDomains` tracks verified (new field semantics:
  the KPI shows total with "N verified" sub; keep `pendingDomains`).
- **GREEN** adjust `getOverviewStats` + `dashboard/page.tsx` KPI card
  (value = activeDomains = total; sub = `${verifiedDomains} verified`).
- **commit** (`fix(overview): Active Domains KPI counts all domains like live`).

### Task A5: B2B company display with location (R5-H4 company rows)
- **RED** new `tests/identification.test.ts`: resolver invariants —
  determinism (same input → same identity), B2B resolutions now carry a
  formatted location `"City, State, CC"` persisted as `city`/`state`/
  `country`; B2C resolutions leave them null. Plus
  `tests/visitors-query.test.ts`: `listVisitors` rows expose
  `city/state/country`.
- **GREEN** schema: add nullable `city`, `state`, `country` to `Visitor`
  (`prisma db push`); resolver derives a stable location for B2B from the
  seeded PRNG (a small city catalogue — deterministic per visitor);
  `listVisitors` selects the fields; seed.ts gains locations for B2B visitors.
- **GREEN (component)** `visitors-table.tsx` company rows: primary text =
  `companyName`, avatar = `h-8 w-8 rounded-lg bg-primary/10` with `Building2`
  `h-4 w-4 text-primary`, sub-text empty; the Confidence column renders
  `MapPin h-3 w-3` + `"${city}, ${state}, ${country}"` for B2B (fallback to
  the confidence bar for B2C); the Type badge shows "Company" (amber tint)
  for B2B and the source (neon-green tint) for B2C — matching live exactly.
- **commit** (`feat(visitors): B2B rows show company, location and amber Company badge like live`).

---

## Workstream B — Typography parity

### Task B1: Inter + Space Grotesk for the app surface (R5-H1)
- Replace Geist with `Inter` (body) and `Space_Grotesk` in
  `src/app/layout.tsx` (`next/font/google`, variables `--font-inter`,
  `--font-space-grotesk`); keep Geist Mono for `font-mono` (the live uses a
  mono stack for code/paths). Add `--font-display: var(--font-space-grotesk)`
  to the `@theme` block so the live's `font-display` utility works.
- Apply `font-display` where the live has it: card titles
  (`font-display text-base font-semibold tracking-tight`), page H1s
  (`font-display text-2xl font-bold`), KPI values, prices
  (`font-display text-3xl xl:text-4xl font-bold`), sidebar brand.
- Presentational — gated by lint/typecheck/build + screenshots.
- **commit** (`feat(typography): Inter body + Space Grotesk display like the live app`).

### Task B2: DM Sans for the marketing surface (R5-H1)
- Load `DM_Sans` in the root layout (variable `--font-dm-sans`); the
  `(marketing)` layout wraps its tree in a `font-(family-name:var(--font-dm-sans))`
  utility (custom class in `globals.css` if the arbitrary syntax fights the
  build) so every marketing page renders DM Sans while the app keeps Inter.
- **commit** (`feat(typography): marketing surface renders DM Sans like pixelco.io`).

### Task B3: hero headline treatment (R5-M4)
- `hero.tsx`: "— By Their Email" becomes
  `<em class="text-gradient-hero">` — italic, gradient-clipped text using the
  live's stops (135deg, #FFAA00 → #FFD91A → #F58F00), replacing the solid
  `bg-primary` box.
- **commit** (`fix(marketing): hero headline uses the live's italic gradient treatment`).

---

## Workstream C — Chrome parity (sidebar / topbar / titles)

### Task C1: PAGE_META in-page titles (R5-H2 title half)
- **RED** `tests/dashboard-chrome.test.ts`: `PAGE_META['/dashboard/install']`
  and `PAGE_META['/dashboard/settings']` gain `inPageTitle: true`; the other
  five stay topbar-rendered.
- **GREEN** extend `PageMeta` with the flag; `topbar.tsx` hides the title
  block for those routes. `install/page.tsx` and `settings-panel.tsx` render
  the in-page H1 + subtitle (`font-display text-2xl font-bold` +
  `text-sm text-muted-foreground`).
- **commit** (`fix(chrome): Install and Settings carry in-page titles, not topbar titles`).

### Task C2: sidebar visual alignment (R5-H7)
- Header: `p-4`, no border; logo `h-8 w-8` + `font-display text-lg font-bold`
  wordmark. Group labels → `text-xs`. Usage card →
  `rounded-lg border border-primary/20 bg-primary/5 p-3` with `gradient-primary`
  FREE badge (`px-1.5 py-0 text-[10px]`), `text-xs text-muted-foreground`
  count, custom `h-1.5 rounded-full bg-muted` progress with `gradient-primary`
  fill. Sign out → `text-xs gap-2 px-1` with `LogOut h-3.5 w-3.5`.
- **commit** (`fix(dashboard): sidebar header, usage card and sign-out match live`).

### Task C3: topbar avatar + bell (R5-H8)
- Avatar → static `h-8 w-8 rounded-full gradient-primary` initials div
  (remove the DropdownMenu — the live has no account menu; sign-out stays in
  the sidebar). Bell → `h-10 w-10` trigger with `bell h-4 w-4`.
- **commit** (`fix(dashboard): topbar avatar is the live's static gradient chip; bell sized h-10`).

---

## Workstream D — Page-level parity (presentational unless noted)

### Task D1: Install page (R5-H2)
- Container `max-w-4xl`; generic copy ("on your website."); Quick Start
  header icon → `h-8 w-8 rounded-lg gradient-primary` with white Zap; card
  border `border-primary/20`; snippet block → `bg-foreground/5 border
  rounded-lg p-4 text-sm font-mono` + `h-9` bordered Copy button
  (`top-3 right-3`); banners → neon-green tints with the live copy (waiting:
  "Waiting for first event... Paste the snippet on your site and visit a
  page. This status will update automatically once we receive data.";
  receiving: "Pixel verified! We're receiving data from {domain}. Everything
  is working."); add the **How It Works** card (gray `CircleAlert` icon box +
  4 `bg-muted/10` feature boxes, live copy) and the **Site Key** card
  (`border-primary/20`, mono key, "Your unique identifier for {domain}");
  switcher always rendered (`h-10 w-[200px]`).
- **commit** (`fix(install): live layout — How It Works, Site Key, neon banners, gradient icon`).

### Task D2: Settings page (R5-H3)
- In-page H1 + subtitle (via C1); inputs `bg-[#F6F7F9]`; Save Changes →
  `gradient-primary h-9 font-semibold`; card titles `font-display text-base
  font-semibold tracking-tight`; danger zone label per live.
- **commit** (`fix(settings): in-page header, input tint and gradient save button`).

### Task D3: Domains page (R5-H5 / R5-M6)
- **RED (data)** `tests/domains.test.ts`: `DomainDto` gains `identifiedCount`
  (filtered `_count` of visitors with email). **GREEN** update
  `listDomainsAction` + `addDomainAction` DTO.
- Presentational: Add Domain → `gradient-primary glow-primary shadow-lg h-10`
  (no Plus icon — live has none); rows: `px-5 py-4 hover:bg-muted/20`, globe
  in `h-9 w-9 rounded-lg bg-primary/10`; Verified = `bg-primary` +
  `CircleCheckBig h-2.5`; Pending = `bg-secondary` + `CircleAlert h-2.5`;
  right block = big `text-sm font-semibold` identified count + `text-[10px]
  text-muted-foreground` "N visitors" total; delete `h-8 w-8` ghost with
  `Trash2 h-3.5`.
- **commit** (`fix(domains): gradient CTA, live row structure and identified-vs-total counts`).

### Task D4: Pricing page (R5-H6)
- Summary → plain flex row (no banner bg): "You're on the *free* plan"
  (gradient + `capitalize` span), usage line, `h-1.5 w-32` gradient progress +
  small %. Cards: `font-display` name/price; quota block `mt-3 pt-3 border-t`
  (number + label + "then …" line); CTA `gradient-primary h-10` with
  `Zap h-3.5`; feature items = `Check h-2.5 text-primary` inside `h-4 w-4
  rounded-full bg-primary/10` + `text-xs text-muted-foreground`; POPULAR =
  inline gradient pill beside the name; popular card = `border-primary
  ring-1 ring-primary/20 scale-[1.02]` + `h-1 gradient-primary` top strip.
- **commit** (`fix(pricing): live summary row, POPULAR pill, quota block and feature checks`).

### Task D5: Visitors table polish (R5-H4 visuals)
- Avatars → `h-8 w-8 rounded-full gradient-primary text-[10px] font-bold`;
  sub-text `text-[11px] font-mono`; confidence bar fill → neon-green
  (`#2BD4BD`); pagination/row paddings per live; keep the detail sheet
  (add a location row when present).
- **commit** (`fix(visitors): gradient avatars, neon confidence and live badge styling`).

### Task D6: Activity feed (R5-M1)
- Container `max-w-3xl space-y-4`; rows `flex items-start gap-4 px-5 py-4
  hover:bg-muted/20`; icon circles `h-8 w-8` with `h-3.5` icons (identified:
  `gradient-primary` + white envelope); badges → plain bordered
  `text-[10px] px-1.5 py-0` ("Identified" keeps the yellow fill); card title
  `font-display`.
- **commit** (`fix(activity): constrained width and live row/badge styling`).

### Task D7: Overview polish (R5-M2)
- KPI icon → `Users` for New This Week; values `text-3xl font-display
  font-bold tracking-tight`; labels `text-xs font-medium tracking-wider`; icon
  boxes `bg-primary/10` + `text-primary h-4 w-4`; card inner `p-6 pt-5 pb-4
  px-5`; card titles `font-display text-base font-semibold tracking-tight`;
  Recent Identifications avatar → `h-7 gradient-primary font-bold`; chart
  strokes → `hsl(262 83% 58%)` / `hsl(172 66% 50%)`.
- **commit** (`fix(overview): KPI typography, icons and chart strokes match live`).

### Task D8: Auth pages (R5-M3)
- Logo inside the card (`h-10` login / `h-16` signup, centered); remove the
  AuthShell footer link (keep the in-card one) so login/signup render a
  single switch link like live; Terms/Privacy links → `/terms`, `/privacy`;
  background → blurred radial glow behind the card.
- **commit** (`fix(auth): logo in card, single switch link, real legal hrefs`).

---

## Workstream E — Foundation, docs, verification

### Task E1: brand utilities + tokens (R5-M5)
- `globals.css`: `.gradient-primary` (135deg #FFC105 → #FFB200),
  `.glow-primary` (box-shadow), `.text-gradient-primary` / `.text-gradient-hero`
  (background-clip: text), `--color-neon-green: #2BD4BD` (→ `bg-neon-green`,
  `text-neon-green`, `border-neon-green/…` utilities via the @theme token).
- **commit** (`feat(ui): brand utilities — gradient-primary, glow, gradient text, neon-green`).

### Task E2: documentation realignment
- README: fonts, install-page cards, identified-only visitors semantics,
  status rule, new snippet test. PAD: revision block v1.4, §5 design tokens
  (fonts + utilities), §4.1 schema columns, §11 refresh (record R5-C1 as
  found-and-fixed; keep CSP/shared-rate-limit/Playwright as documented
  deferrals). AGENTS/CLAUDE: font conventions + the snippet execution test
  rule. Update `docs/plans/` cross-references.
- **commit** (`docs: realign README/CLAUDE/PAD with round-5 parity and fixes`).

### Task E3: verification gate + browser E2E
- `npm run verify` (lint → typecheck → test → build) must be green.
- Fresh dev-server browser pass on all surfaces; re-capture screenshots;
  VLM re-diff of the 7 dashboard pairs + login + landing vs
  `research/round5-audit/live/`; targeted DOM assertions for the behavioral
  changes (status badge flip after 30 min via seeded lastSeen; company row
  shows location; install snippet copied from the page executes).
- **commit** (docs/screenshots only if needed).

### Task E4: ship
- Conventional Commits per task (already specified). Secret scan
  (`git ls-files | grep -E '\.env|\.key$'` empty). Push to
  `git@github.com:nordeim/pixel-identifier.git` `main` via
  `docs/ssh_git_wrapper_v3.py` with the externally-supplied deploy key
  (runbook: `docs/how-to-git-push-using-ssh-wrapper_SKILL.md`). No new
  branches.

---

## Explicitly out of scope (documented deferrals)

- **Strict CSP** (PAD §11): needs nonce plumbing through Next's inline
  bootstrap and the collector; risk of breaking hydration on standalone
  deploys outweighs the benefit for this round. Baseline headers stay.
- **Shared-store rate limiting / signup throttle**: per-instance is the
  documented single-instance posture (ADR-003); revisit when scaling.
- **Playwright browser E2E suite**: the critical funnel is covered by the
  route/action integration suite + the standalone smoke + this round's
  snippet-execution test; adding a browser suite changes CI images and is
  deferred.
- **Live collector's FingerprintJS/email-detection engine**: the clone's
  deterministic resolver stays the documented simulation (ADR-005). The
  install-page "How It Works" card describes it with the live's copy, which
  is marketing surface, not a behaviour claim.
- **"New This Week" live semantics**: could not be decoded from controlled
  observation (see Findings); clone keeps its 7-day formula.

---

## Execution Log (post-remediation)

All tasks landed on `main` as Conventional Commits, one per task:

| Task | Commit | Verification |
|------|--------|--------------|
| A1 snippet executes | `fix(snippet): emitted loader passes document…` | RED→GREEN `tests/snippet.test.ts` |
| A2 honest status | `feat(visitors): honest active/inactive status…` | boundary cases green |
| A3 identified-only list | `feat(visitors): list identified visitors only…` | `tests/visitors-query.test.ts` green |
| A4 overview KPI | `fix(overview): Active Domains KPI counts all domains…` | `tests/analytics.test.ts` green |
| A5 B2B company display | `feat(visitors): B2B rows show company…` | `tests/identification.test.ts` green |
| E1 brand utilities | `feat(ui): brand utilities…` | lint+typecheck+build |
| B1 app typography | `feat(typography): Inter body + Space Grotesk…` | lint+typecheck+build |
| B2 marketing typography | `feat(typography): marketing surface renders DM Sans…` | lint+typecheck+build |
| B3 hero gradient | `fix(marketing): hero headline uses the live's italic gradient…` | lint+typecheck+build |
| C1 in-page titles | `fix(chrome): Install and Settings carry in-page titles…` | `tests/dashboard-chrome.test.ts` green |
| C2 sidebar | `fix(dashboard): sidebar header, usage card and sign-out…` | lint+typecheck |
| C3 topbar | `fix(dashboard): topbar avatar is the live's static gradient chip…` | lint+typecheck |
| D1 install | `fix(install): live layout — How It Works, Site Key…` | lint+typecheck+build |
| D2 settings | `fix(settings): in-page header, input tint and gradient save button` | lint+typecheck |
| D3 domains | `fix(domains): gradient CTA, live row structure and identified-vs-total counts` | `tests/domains.test.ts` 9/9 |
| D4 pricing | `fix(pricing): live summary row, POPULAR pill, quota block…` | plan/quota tests 17/17 |
| D5 visitors polish | `fix(visitors): gradient avatars, neon confidence…` | lint+typecheck |
| D6 activity | `fix(activity): constrained width and live row/badge styling` | `tests/activity-query.test.ts` 3/3 |
| D7 overview polish | `fix(overview): KPI typography, icons and chart strokes…` | `tests/analytics.test.ts` 4/4 |
| D8 auth pages | `fix(auth): logo in card, single switch link, real legal hrefs` | signup+marketing-links 13/13 |
| E2 docs | `docs: realign README/CLAUDE/PAD with round-5 parity and fixes` | — |

**Full gate (E3):** `npm run verify` green — ESLint clean, `tsc --noEmit`
clean, Vitest **175/175** across 25 files (+2 opt-in standalone smoke),
`next build` 34 routes. `npm run build:standalone` + smoke 2/2 green.

**Browser pass (E3):** dev-server pass over all 7 dashboard surfaces + login
with seeded data; post-remediation screenshots archived in
`research/round5-audit/post/`. DOM assertions confirmed: identified-only
visitor rows (3/3 with the 2 anonymous seeded rows hidden), B2B company row
with resolved location, honest inactive badge at 45 min, gradient CTA + globe
box + identified-vs-total counts on Domains, POPULAR gradient pill + top
strip on Pricing, in-page H1s on Install/Settings, How It Works + Site Key
cards, `#F6F7F9` settings inputs, logo inside the auth card with a single
switch link, zero new console errors.
