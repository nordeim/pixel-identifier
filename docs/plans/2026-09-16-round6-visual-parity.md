# Round 6 — Visual & Functional Parity Remediation Plan

**Date:** 2026-09-16
**Scope:** Full re-audit of live `pixelco.io` + `app.pixelco.io` (all 7 dashboard
surfaces, auth pages, marketing landing) with logged-in DOM extraction +
pairwise VLM screenshot diffs; remediation of every verified gap.
**Context:** Round 6 was attempted once before (session 3) and lost to an agent
crash — 3 local commits (A1–A3) plus an in-flight B1 visitors-table rework never
reached the remote. This plan re-establishes the audit from scratch (fresh live
DOM evidence in `research/round6-audit/`) and supersedes the lost work.
**Baseline:** `npm run verify` green at `478aa4f` (lint, typecheck, 175 tests /
25 files, 34 routes) — matches PAD v1.4 exactly.

## Method

1. Logged into the live app (research account), extracted DOM ground truth for
   every dashboard page, the login/signup surfaces, the marketing landing
   (hero, announcement bar, header, pricing, feed widget), including computed
   styles for the live's custom utilities (`gradient-hero` app/marketing
   variants, `gradient-cta`, `shadow-elevated`, `pulse-glow` keyframes).
2. Captured screenshots of every live + local page pair (1440×900) and ran
   pairwise VLM diffs; every VLM claim was then verified against the extracted
   DOM before being accepted as a finding (VLM misreads excluded: chart icon,
   sidebar active tint, "script font" hero, button color).
3. Findings below are evidence-backed: each cites its DOM source. Data-driven
   differences (account data, timestamps, demo vs research domains) and the
   Next.js dev-tools badge ("N" circle) are excluded as noise.

## Findings (severity-ordered)

| ID | Severity | Finding | Evidence |
|----|----------|---------|----------|
| R6-C1 | Critical | Visitors topbar subtitle renders literal `{individuals} individuals · {companies} companies identified` on server paint — a template string in `PAGE_META` shown before the client publishes counts (SSR bug; visible on hard load / with JS disabled) | `src/lib/dashboard-nav.ts:74`, `topbar.tsx:31-34`; live renders "2 individuals · 1 companies identified" server-side |
| R6-H1 | High | Top Pages shows **views** as the big number; live shows the **identified count** per page (big `text-sm font-semibold`) with total views as the `text-[10px]` label; rank is `font-mono w-4`, path is `text-sm font-medium` (not font-mono) | live overview DOM: `/pricing` → big `1`, label `1 views` |
| R6-H2 | High | Visitors table chrome diverges: live uses shadcn pill tabs (`h-10 bg-muted p-1`, active `bg-background shadow-sm`) with count badges inside; thead `bg-muted/30` + `p-3 text-[11px] uppercase tracking-wider` headers with ArrowUpDown glyph on VISITOR; rows `hover:bg-muted/20 border-border`; default square checkboxes (`rounded-sm`, clone forces `rounded-full`); selects `h-10 w-44`; search `h-10 pl-9` | live visitors DOM (thead/row0/row1/tabs/filter row) |
| R6-H3 | High | Company rows' sub-line: live shows `· N visits` (primary-colored, font-sans) under the company name; clone renders an empty mono sub-line | live row0: `<span class="ml-1.5 text-[10px] text-primary font-sans">· 2 visits</span>` |
| R6-H4 | High | Auth pages drift: live login = dark `gradient-hero` canvas (135deg #0F111A→#2B2312) + two blurred pulse glows (primary/20 top-left, hot-pink/20 bottom-right) + `rounded-lg border-border/50 shadow-2xl` card + h-16 logo + `font-display text-2xl` title + shadcn outline OAuth buttons + shadcn or-divider + **real `/forgot-password` link** + `h-10` gradient submit (icon after text) + `text-primary` footer link; clone = stone-950 flat canvas, h-10 logo, dead "Forgot password?" span | live login/signup DOM; computed `gradient-hero` (app variant) |
| R6-H5 | High | Marketing hero "Live Visitor Feed" widget is a different component: live = Globe-icon header + "Real-time" pulse, **stat strip** (847 Visitors Today → Pixelco chip → 169 Emails Found, separated by arrows), absolutely-positioned rotating rows in a 240px container (identified rows: primary circle + Mail + email + "✓ Identified"; anonymous: muted circle + User + "Unknown User"/"Browsing your site…"), **Match Rate footer** (20% + progress bar); clone = traffic-light window chrome + footer stats | live widget DOM |
| R6-H6 | High | Pricing page: live summary is a banner **card** (`border-primary/20 bg-primary/5`, p-6 pt-5 pb-4); cards have `hover:shadow-lg hover:border-primary/20 transition-all`, header/body split (`p-6 pb-2` / `p-6 pt-0`), title `font-semibold`, POPULAR pill text "POPULAR" (`px-2 py-0.5`), description `text-xs mt-1.5`, quota number+label **inline** (`ml-1`), CTA (`w-full mb-4`) above features, features = plain Check `h-2.5 w-2.5 text-primary` (no circle wrapper); FAQ = 6 static question cards in `grid md:grid-cols-2` with CircleHelp icons (NOT an accordion); Enterprise CTA = `border-2 border-primary/30 text-primary`; annual view shows no "billed annually" line | live pricing DOM (monthly + annual states) |
| R6-H7 | High | Dashboard annual prices differ: live dashboard shows $65/$199/$639 (hardcoded round-dollar annual prices — Starter $65 ≠ 20% off); live **marketing** shows $63/$199/$639 (floored 20%-off). Clone computes $63.20/$199.20/$639.20 everywhere | live dashboard + marketing pricing DOM |
| R6-M1 | Medium | Overview KPI labels not uppercase: live has `uppercase tracking-wider`; KPI cards have `hover:shadow-md transition-shadow`; Recent Identifications thead = `bg-muted/30` + `p-3 px-5 text-[11px] uppercase tracking-wider` (Time right-aligned), rows `hover:bg-muted/20`, cells `p-3 px-5`, confidence = plain div bars `h-1.5 w-12` + `text-xs font-medium` label | live overview DOM |
| R6-M2 | Medium | Activity page: live is ONE card (header + `p-0` divide list) — clone has two stacked cards; row meta has two groups with `gap-3` (Globe+domain, ArrowUpRight+path — path NOT font-mono, no literal "/" separator); Identified badge = `gradient-primary` pill (clone: amber-300); icon color `text-primary-foreground` (clone: white); wrap has no `mx-auto` | live activity DOM |
| R6-M3 | Medium | Domains page: Add Domain button lacks the live's Plus icon (`h-3.5 w-3.5 mr-1.5`); form is always `flex gap-3` (clone: responsive column); "Your Domains" is a **card** with header `p-6 pb-2` and `p-0` divide content (clone: bare h2 + card); domain name `font-semibold` (clone: font-bold); badges `px-1.5 py-0` with verified = `gradient-primary border-0` (clone: `bg-primary px-2 py-0.5`); counts plain (clone: `tabular-nums leading-none`); delete hover `text-destructive` (clone: red-600); gaps `gap-4`/`gap-6` (clone: 3/5) | live domains DOM |
| R6-M4 | Medium | Page-content wrappers: live renders activity/install/domains/settings content **left-aligned** (`max-w-3xl`/`max-w-4xl`/`max-w-2xl` with no `mx-auto`); only pricing centers (`max-w-6xl mx-auto`); clone centers all | live page wrappers |
| R6-M5 | Medium | Sidebar FREE badge: live = `rounded-full gradient-primary px-1.5 py-0 font-semibold` pill; clone = `rounded-sm uppercase tracking-wider font-bold` | live sidebar DOM |
| R6-M6 | Medium | Marketing pricing section: grid `sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto`; popular card `p-7 border-2 shadow-elevated`; pill `gradient-cta` + "POPULAR" `tracking-wider`; description `mb-4 min-h-[40px]`; price block `mb-1`; "billed annually" shows **no dollar total** (clone appends "$758.40 billed annually"); features `gap-2.5 text-sm text-muted-foreground` with Check `text-accent` | live marketing DOM |
| R6-M7 | Medium | Marketing announcement bar: live = yellow `gradient-hero` (marketing variant) with the 🚀 emoji inside the text span, "Claim Now" link with ArrowRight icon (external to app.pixelco.io), dismiss `absolute right-4 top-1/2`; clone = flat `bg-primary`, separate emoji span, text-only link to `#pricing` | live marketing DOM |
| R6-M8 | Medium | Missing live utilities: `gradient-hero` (app dark variant), `gradient-hero` (marketing light variant — needs a second name in one bundle), `gradient-cta`, `shadow-elevated`, `animate-pulse-glow` + `pulse-glow` keyframes, `hot-pink` color token (#EC4699) | live computed styles |
| R6-L1 | Low | Header border `border-border` + `backdrop-blur-xl` (clone: `border-border/60` + plain blur) | live marketing header |
| R6-L2 | Low | Install page wrapper has `mx-auto` (live: none); Quick Start/Platform/How-It-Works card headers use the default shadcn rhythm (verified equivalent via gap-6) | live install DOM |
| R6-L3 | Low | Settings wrapper `mx-auto` (live: none) | live settings DOM |

**Explicitly verified as matching (no action):** sidebar nav icons/active
tokens, chart palette/height/grid, no chart legend, bell/avatar/topbar
geometry, install cards + banners + snippet block + domain switcher, settings
inputs (computed `#F6F7F9` tint confirmed on live), usage card container,
Danger Zone, hero headline gradient treatment (DM Sans italic — VLM
"script font" claim disproven), dashboard chrome `h-14` topbar, sign-out
button, footer link map.

**Honest divergences kept (documented, not gaps):** visitor detail sheet
(live rows have no click handler — our value-add), OAuth buttons disabled (no
providers configured), `/forgot-password` resolves to a real page in the clone
(live links to it but the route 404s — replicating a dead link would be a bug
in our product; PAD documents the divergence), CSV/export/plan-intent links.

## Workstreams

### Workstream A — Data & logic (TDD, RED → GREEN per task)

- **A1 (R6-C1):** Server-rendered visitors subtitle.
  - RED: extend `tests/dashboard-chrome.test.ts` — `PAGE_META['/dashboard/visitors'].subtitle` must contain no `{`/`}` template braces; add an analytics-seam test for a new `getVisitorSegmentCounts(userId)` (counts of identified individual/company visitors, ownership-scoped).
  - GREEN: `src/lib/analytics.ts` gains `getVisitorSegmentCounts`; the dashboard
    layout fetches it and passes `initialVisitorsCounts` to `Topbar`; `Topbar`
    seeds the chrome store with the server value (no raw template ever
    renders); `visitors-table.tsx` keeps publishing fresh counts after filter
    changes (store update, not replace).
- **A2 (R6-H1):** Top Pages identified counts.
  - RED: `tests/top-pages.test.ts` — `TopPage` gains `identified: number`;
    identification events on a path count toward it; pages with 0
    identifications still list; cross-user isolation preserved.
  - GREEN: `getTopPages` adds a second `groupBy` over identification events,
    merges by path (union), orders by views desc / path asc.
- **A3 (R6-H4):** `/forgot-password` route + real link.
  - RED: `tests/seo-routes.test.ts` — route must exist and be excluded from
    sitemap (auth surface); login form test asserts the link href.
  - GREEN: `src/app/forgot-password/page.tsx` — AuthShell + email form +
    anti-enumeration submitted state; email transport is not implemented
    (documented in PAD §11 alongside simulated billing); login form's dead
    span becomes a `text-primary hover:underline` link.
- **A4 (R6-H2 partial):** `visitorsSubtitle` drops singular forms.
  - RED: chrome test — `visitorsSubtitle({individual:1, company:0})` renders
    "1 individuals · 0 companies identified" (live behavior).
  - GREEN: remove the singular branches.

### Workstream B — Visitors page (R6-H2/H3)

- Pill tabs with count badges (shadcn Tabs primitives, URL state preserved);
  arrow-key roving retained.
- Filter row: search `h-10 pl-9`, wrap `relative flex-1 max-w-sm`, both
  selects `h-10 w-44`, parent `flex items-center gap-3`.
- Table: thead `bg-muted/30`, `p-3`/`pl-5`/`pr-5` padding, `text-[11px]`
  uppercase headers, ArrowUpDown on VISITOR, square checkboxes (drop
  `rounded-full`), rows `hover:bg-muted/20 border-border`, company sub-line
  `· N visits`, confidence as plain divs + `text-xs font-medium`, Last Active
  `text-sm`.
- Detail sheet retained (documented value-add).

### Workstream C — Overview page (R6-M1 + A2 UI)

- KPI labels `uppercase tracking-wider`; cards `hover:shadow-md transition-shadow`.
- Top Pages row structure per live (rank mono w-4, path `text-sm font-medium`,
  big = identified, label = "N views", `py-2 border-b` rows).
- Recent Identifications table per live (thead bg-muted/30, px-5/p-3 padding,
  plain confidence bars `h-1.5 w-12`, `text-xs font-medium`, Time right).

### Workstream D — Other dashboard pages

- **D1 Activity (R6-M2):** single card; row meta two-groups; gradient
  Identified badge; `text-primary-foreground` icon; drop `mx-auto`.
- **D2 Install (R6-L2):** drop `mx-auto`.
- **D3 Domains (R6-M3):** Plus icon; `flex gap-3` form; Your Domains card;
  `font-semibold`; badge shapes/`px-1.5 py-0`; plain counts;
  `hover:text-destructive`; gap fixes; drop `mx-auto`.
- **D4 Pricing (R6-H6/H7):** banner card summary; card hover states; header/body
  split; POPULAR pill; inline quota; CTA position; plain feature checks; FAQ →
  6 static cards (copy from live, verbatim); Enterprise card + border-2 CTA;
  remove the annual "billed annually" line on the dashboard; plans.ts gains
  `annualMonthlyPrice` (6500/19900/63900) + marketing display helper
  (floor-to-dollar) — money stays integer cents in the single catalogue; TDD
  in `tests/plans.test.ts`.
- **D5 Settings (R6-L3):** drop `mx-auto`.

### Workstream E — Chrome

- **E1 (R6-M5):** FREE badge → `rounded-full px-1.5 py-0 font-semibold` gradient pill.
- **E2 (R6-M8):** globals.css: `.gradient-hero` (dark app variant), `.gradient-hero-light` (marketing yellow), `.gradient-cta`, `.shadow-elevated`, `--color-hot-pink` token, `pulse-glow` keyframes + `.animate-pulse-glow` (reduced-motion safe).

### Workstream F — Auth pages (R6-H4)

- AuthShell: dark gradient canvas + two pulse glows + `rounded-lg
  border-border/50 shadow-2xl` card, logo h-16 (both pages), `font-display
  text-2xl` centered title.
- OAuth buttons: shadcn outline h-10 (kept disabled with explanatory titles).
- OrDivider: shadcn pattern.
- Login: forgot link, submit icon after text, footer link colors.
- Signup: "Work Email" label, "Min. 6 characters"/"Re-enter your password"
  placeholders, footer "Already have an account? Sign in".

### Workstream G — Marketing (R6-H5/M6/M7/L1)

- **G1:** Announcement bar (yellow gradient, emoji inline, Claim Now + arrow
  icon → /signup, dismiss positioned per live).
- **G2:** Header border/blur fixes.
- **G3:** Hero feed widget restructure (stat strip, 240px rotating rows,
  Match Rate footer; keep feed-in animation pattern, reduced-motion safe).
- **G4:** Marketing pricing section (grid/popular card/pill/feature checks/
  no-total "billed annually"/floor-to-dollar annual display via plans helper).

### Workstream V — Verification & ship

- Full gate `npm run verify` after each workstream; browser pass on every
  changed surface (dev server + seeded DB, DOM assertions for the A1 fix);
  VLM re-diff of changed pairs into `research/round6-audit/post/`.
- Docs: PAD → v1.5 (revision block, findings, file map, known issues);
  README/AGENTS/CLAUDE deltas (annual price table, forgot-password honesty
  note, new utilities).
- Conventional Commits per task; push via `docs/ssh_git_wrapper_v3.py`.

## Execution order

A (data layer, TDD) → E2 (utilities prerequisite) → B → C → D → E1 → F → G
→ V. Each task lands as its own commit with its RED test in the same commit.

## Execution log (2026-09-16)

All workstreams landed as individual Conventional Commits on `main`:

| Task | Commit | Subject |
|------|--------|---------|
| A1+A4 | `446fe9b` | fix(chrome): server-render the visitors topbar subtitle (R6-C1) + no singular forms |
| A2 | `ed5dffd` | feat(overview): Top Pages identified counts (R6-H1) |
| A3 | `a58e6c9` | feat(auth): /forgot-password route + real login link (R6-H4) |
| E2 | `d366ae2` | feat(ui): round-6 brand utilities (R6-M8) |
| B | `8aa5499` | fix(visitors): live table chrome (R6-H2/H3) |
| C | `076672b` | fix(overview): uppercase KPIs + Recent table chrome (R6-M1) |
| D1 | `5098c2c` | fix(activity): one card, gradient badge, two-group meta (R6-M2) |
| D2/D3/D5 | `09a9a50` | fix(domains,install,settings): Plus CTA, card list, wrappers (R6-M3/L2/L3) |
| D4 | `9282890` | fix(pricing): banner card, FAQ cards, live annual price table (R6-H6/H7) |
| E1+F | `58972d8` | fix(auth,sidebar): live auth shell + FREE pill (R6-H4/M5) |
| G | `f665b31` | fix(marketing): announcement bar, feed widget, pricing cards, header (R6-H5/M6/M7/L1) |
| lint | (follow-up) | fix(pricing): drop unused card imports caught by the gate |

Verification evidence:
- `npm run verify` GREEN: lint clean, typecheck clean, **186 tests across 25
  files** (11 new this round: 3 chrome, 3 segment-counts, 4 top-pages, 1
  forgot-password route... plus updated contracts), build green.
- Browser DOM pass on every changed surface: server-rendered subtitle
  ("2 individuals · 1 companies identified", zero brace templates), pill tabs
  with count badges, live thead/row structure, "· 2 visits" company sub-line,
  one-card activity with gradient Identified badge, Plus-icon domain CTA +
  card-wrapped list, pricing banner + 6 FAQ cards + $65/$199/$639 annual
  prices (exact live dashboard values), left-aligned wrappers, gradient-hero
  auth canvas with 2 pulse orbs + real forgot-password link, zero local
  console/page errors.
- Pairwise VLM re-diffs (live vs post, `research/round6-audit/post/`):
  7/8 surfaces verdict **CLOSE MATCH** (overview, activity, install, domains,
  pricing, settings, login). The visitors pair's remaining flags were
  verified as data differences (different demo accounts) plus one VLM icon
  misread — the sidebar icon is `lucide-eye` with a byte-identical path to
  the live extraction.
