# Round-15 Remediation Plan — Dashboard shell & auth-card realignment

**Date:** 2026-09-17 · **Repo state at plan time:** main @ 2a1d732 (PAD v1.13,
402 tests / 49 files) · **Audit evidence:** `research/round15-audit/`

## Context

Round-15 re-audited every surface for live drift after the Round-14 SEO ship.
The marketing bundle is **stable**: landing section heights byte-identical
([762,403,174,526,708,610,650,814,756,500]), banner scoping intact, all
sub-page H1/H2 counts equal, blog slugs identical, legal/docs/about content
byte-identical (the about/docs "+69 words" signals were header/footer
measurement artifacts — the live SPA has no `<main>` so its body capture
includes chrome), robots.txt/sitemap.xml byte-equal (origin-sub), favicon
byte-identical, and both og images byte-identical (the live moved their URLs
to gpt-engineer/R2 storage; the content md5s match the self-hosted copies).

**The live's app bundle shipped a new build.** The dashboard sidebar
migrated from a custom `aside` to the **shadcn Sidebar primitive** (verified
the dominant variant: 11/13 fresh loads across all 7 dashboard pages; the
other 2 loads served a stale edge variant that exactly matches the clone's
current DOM). The topbar, auth cards, and layout root changed with it.

**Audit method:** selector-agnostic DOM extraction of the full shell
(layout root → sidebar provider → header/content/footer → topbar → main)
from live and local after login, saved to `research/round15-audit/{live,local}/
shell-*.json`; head/heading probes per page; login-card outerHTML captures;
TW4 compile probes for the primitive's arbitrary-var classes.

## Findings (all DOM-verified, evidence in round15-audit/)

| ID | Sev | Finding | Evidence |
|---|---|---|---|
| R15-F1 | High | **Sidebar = shadcn primitive.** Live: `div[data-side=left][data-variant=sidebar][data-state][data-collapsible].group.peer.hidden.text-sidebar-foreground.md:block` > gap div (`relative h-svh w-[--sidebar-width] bg-transparent transition-[width]…`) + fixed container (`fixed inset-y-0 z-10 hidden h-svh w-[--sidebar-width]…md:flex left-0 group-data-[side=left]:border-r`) > `div[data-sidebar=sidebar]` with `data-sidebar={header,content,group,group-label,group-content,menu,menu-item,menu-button,footer}` attrs; PNG logo `<img src="/assets/logo-BxfT-ZTZ.png">` + unlinked `span.font-display.text-lg.font-bold` wordmark; menu buttons carry the full `peer/menu-button … data-[active=true]:… h-8 text-sm hover:bg-sidebar-accent/50` string + appended active tail; icons `mr-2 h-4 w-4`; **md** breakpoints; icon-rail collapse (`data-collapsible=icon`, `!size-8 !p-2`); mobile = Radix Sheet (`[role=dialog][data-sidebar=sidebar][data-mobile=true]`, slide-in-from-left, inline `--sidebar-width: 18rem`). Clone: R11-era custom `aside` (sticky wrapper, `lg:block`, linked inline-SVG wordmark, `<nav>` element, active item 36px — 4px taller than the live's h-8) | shell-full.json both sides; live-sidebar-dom.html; shell-groups.json; collapsed/mobile probes |
| R15-F2 | Med | **Topbar.** Live: `h-14 flex items-center justify-between border-b border-border bg-card px-6` (**not sticky**); left div without `min-w-0`; toggle = `data-sidebar="trigger"` + **no px-4 py-2** + `<span class="sr-only">Toggle Sidebar</span>` + svg without aria-hidden (28×28 vs clone 32×28); h1 = `font-display text-sm font-semibold leading-none` in a plain div (no truncate/text-foreground); subtitle `text-xs text-muted-foreground mt-0.5` (order); bell without aria-label/title/px-4, dot = `bg-hot-pink` class; avatar = `h-8 w-8 rounded-full gradient-primary flex items-center justify-center text-xs font-bold text-primary-foreground ml-2`, no aria-label/title (text-xs, not text-[10px]) | shell-header.json both sides |
| R15-F3 | Med | **Auth cards (login/signup).** Live: card class order base-first (`rounded-lg border bg-card text-card-foreground w-full max-w-md relative z-10 border-border/50 shadow-2xl`); header `p-6 text-center pb-2`; PNG logo `img.h-16.w-16`; heading is an **h3** `font-semibold tracking-tight font-display text-2xl` (no text-foreground); email label has NO flex justify-between wrapper; **Label primitive is new-gen** (`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70` — no data-slot, no flex/gap/select-none); OAuth buttons on the Button primitive (`…border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 w-full`) with svg `h-4 w-4 mr-2`; form has NO novalidate; submit arrow svg `h-4 w-4 ml-1`; footer link `text-primary font-medium hover:underline` | login-card.html both sides |
| R15-F4 | Low | **Layout root + main.** Live: `min-h-screen flex w-full bg-muted/30` (clone: `flex min-h-screen bg-app`); main column `flex-1 flex flex-col` (clone adds min-w-0); main `flex-1 p-6 overflow-auto` (clone: `flex-1 overflow-auto p-6`) | shell-layout.json |
| R15-F5 | Low | **Activity feed title**: live `h3.font-semibold tracking-tight font-display text-base` ("Live Feed"); clone renders a `<p>` with text-foreground | activity probes |
| R15-F6 | Low | **Install snippet**: live indents the loader body 2 spaces; clone emits flush-left | live-install-snippets.json vs src/lib/snippet.ts |
| R15-F7 | Low | **Landing social-proof**: clone ships clone-authored `<h2 class="sr-only">Customer testimonials</h2>` + `aria-labelledby`; the live has no heading at all | landing H2 lists (7 vs 8) |
| R15-F8 | Low | **Class-order nits**: KPI cards `shadow-sm hover:shadow-md transition-shadow` (clone `transition-shadow` first); domains input renders `…md:text-sm h-10 flex-1` (twMerge displaces the consumer's redundant `h-10`; live = base + `flex-1`) | card probes; twMerge repro |

Non-findings (verified, no action): landing/sub-page/blog/legal content,
crawl documents, favicon, og image bytes, marketing heads (18/18), dashboard
page content structure (KPI counts, headings on visitors/pricing/settings/
domains, install page structure), forgot-password (live 404 = documented
defect ruling PAD §11), app og block, 404 title, E2E feed (R14 green).

## Parity rulings (documented, following repo precedents)

- **D1 — target the dominant live build.** The live is mid-rolling-deploy;
  11/13 loads across all pages ship the primitive shell. The clone tracks
  the dominant variant (same category as R13's CSR-title ruling: the stale
  edge variant is a deploy artifact, not the product direction).
- **D2 — functional input attrs stay.** The clone's inputs keep
  `name`/`autocomplete` (required by its server-action forms); the live's
  `value=""` React remnant is not replicated. Invisible in rendering.
- **D3 — OAuth buttons stay disabled** (documented AGENTS.md quirk: no
  provider credentials; the live's buttons do real Google OAuth — a
  capability the clone documents as diverged), but the class string, svg
  classes (`h-4 w-4 mr-2`) and DOM move onto the Button primitive; the
  hand-rolled `bg-[#F6F7F9]` classes and the explanatory `title` go.
- **D4 — the logo asset is self-hosted**: the live's PNG copied to
  `public/assets/logo-BxfT-ZTZ.png` (same filename, own origin — same
  ruling as R14's og-image D1). It replaces the inline-SVG wordmark in the
  sidebar header (h-8 w-8, unlinked) and the auth cards (h-16 w-16).
- **D5 — `bg-hot-pink` utility** added to globals (the live's dot class);
  the inline `style="background-color:#EC4699"` and the dot's aria-hidden go.
- **D6 — the non-sticky header is replicated** (current-build behavior).
- **D7 — the sr-only H2 is removed** (DOM parity; the live ships no heading
  in that section — same category as R14's keywords removal).
- **D8 — the mobile Sheet reproduces the live's classes/attrs** including
  the inline `--sidebar-width: 18rem` and `data-sidebar="sidebar"
  data-mobile="true"` (built on the existing Sheet primitive).
- **D9 — novalidate is removed** from the auth forms (the live relies on
  native validation; the clone's server-side validation flow is unchanged).
- **D10 — hand-defined TW4 utilities.** Tailwind v4 emits invalid CSS for
  the TW3 bare-var forms (`w-[--sidebar-width]` → `width:--sidebar-width`).
  The two affected utilities are hand-defined in globals.css so the DOM
  ships the live's byte-identical class strings with working CSS
  (`--sidebar-width: 16rem`, `--sidebar-width-icon: 3rem` on :root —
  the live hosts them on the provider via a stylesheet rule; invisible
  either way. Same category as the R12 pre-rounded-hex precedent).

## Workstreams

### A — assets & tokens (foundation)
- **A1:** copy `live-logo.png` → `public/assets/logo-BxfT-ZTZ.png`
  (md5 90a372e130be199c2a57d26ef92fce3f, 550×550 RGBA).
- **A2 (RED→GREEN):** globals.css — `--sidebar-width: 16rem` +
  `--sidebar-width-icon: 3rem` on `:root`; hand-defined
  `.w-\[--sidebar-width\]` / `.w-\[--sidebar-width-icon\]` /
  the `group-data-[collapsible=icon]:w-[--sidebar-width-icon]` variant;
  `bg-hot-pink` utility (`#EC4699`).

### B — sidebar primitive (sidebar-shell.tsx + sidebar-nav.tsx rewrite)
- **B1 (RED→GREEN):** provider/gap/fixed-container/inner DOM with the live's
  exact classes and data-attrs; state via the existing chrome-store
  (expanded ↔ collapsed, `data-collapsible="icon"`), persisted as today.
- **B2 (RED→GREEN):** SidebarNav inner: `data-sidebar` header (PNG logo +
  font-display span, unlinked), content (3 groups: Analytics = Overview/
  Visitors/Activity Log, Setup = Install Pixel/Domains, Account = Pricing &
  Plan/Settings — `data-sidebar={group,group-label,group-content,menu,
  menu-item}` divs/ul/li), menu-button `<a>` with the full peer/menu-button
  class string + `data-size="default"` `data-active="false"` +
  `aria-current="page"` + appended active tail; icons `mr-2 h-4 w-4` without
  aria-hidden; footer (plan box + sign-out, unchanged classes).
- **B3:** mobile Sheet: the live's exact classes + attrs + inline 18rem var.

### C — topbar (topbar.tsx)
- **C1 (RED→GREEN):** header classes (non-sticky), left div, trigger button
  (Button base + `h-7 w-7`, `data-sidebar="trigger"`, sr-only span, no
  px-4 py-2, svg without aria-hidden), h1 block (font-display, plain div,
  no truncate), subtitle order, bell (no aria-label/title/px-4, bg-hot-pink
  dot), avatar (text-xs, ml-2, no aria-label/title). matchMedia 768.

### D — layout + small DOM fixes
- **D1:** layout root `min-h-screen flex w-full bg-muted/30`; main column
  `flex-1 flex flex-col`; main `flex-1 p-6 overflow-auto`.
- **D2 (RED→GREEN):** activity-feed title → `<CardTitle className="text-base">`;
  KPI card class order; domains Input consumer `flex-1` only.

### E — auth cards (login + signup)
- **E1 (RED→GREEN):** card class order (Card primitive + consumers), header
  order `p-6 text-center pb-2`, PNG logo img (h-16 w-16), h3 heading
  (`font-semibold tracking-tight font-display text-2xl`), email label
  wrapper removed, new-gen Label primitive (ui/label.tsx rewrite), OAuth
  buttons on the Button primitive (disabled stays per D3), svg class orders,
  novalidate removed, footer link order.

### F — snippet + landing
- **F1 (RED→GREEN):** buildSnippet 2-space indentation (+ format pin test).
- **F2 (RED→GREEN):** remove the social-proof sr-only H2 + aria-labelledby.

### G — verification
- `npm run verify` green; standalone rebuild + fresh server; browser pass:
  shell DOM diff vs the round15 captures (sidebar/topbar/auth cards/layout),
  collapse + mobile Sheet behavior, E2E login flow (novalidate change),
  landing H2 count = 7, snippet indentation, sitemap/robots/favicon
  unchanged, marketing spot-checks.

### H — docs & ship
- PAD v1.14, README, AGENTS.md (new shell facts), CLAUDE.md, plan execution
  log, worklog, evidence README; atomic commits on main; wrapper push.

## Risks & notes
- The `w-[--sidebar-width]` TW4 quirk: the auto-emitted invalid rules
  coexist harmlessly (browsers drop invalid declarations); the hand-defined
  utilities carry the layout. Verified by compile probe.
- The header loses `sticky` — the dashboard content scrolls under the
  viewport top exactly like the live's current build.
- The active menu item shrinks 36→32px and the icon-label gap grows by
  mr-2 (8px) — both are live-faithful corrections.
- The mobile breakpoint moves lg→md: between 768–1023px the sidebar is now
  visible (live behavior); the mobile Sheet engages below 768px only.
- Tests pinning the old shell (`sidebar-chrome.test.tsx`, chrome bits of
  `dashboard-chrome.test.ts`, label/OAuth pins in `ui-primitives` /
  auth tests, the social-proof heading) are rewritten first (RED), then
  implementation turns them GREEN — the TDD order.
- The live's `data-active="false"` on the ACTIVE item (their attr wiring is
  broken; the active styling comes from the appended tail classes) is
  replicated verbatim — DOM parity over code beauty.

## Execution Log (completed 2026-09-17)

- **A (assets & tokens)** — `public/assets/logo-BxfT-ZTZ.png` (the live's
  550×550 RGBA PNG, md5 90a372e1…); `:root` gained `--sidebar-width:
  16rem` + `--sidebar-width-icon: 3rem`; the two TW3 bare-var utilities
  (`w-[--sidebar-width]`, the icon-collapsible variant) hand-defined in
  globals (TW4 emits `width:--sidebar-width` — invalid — for the live's
  class strings; D10); `.bg-app` retired (the layout paints
  `bg-muted/30` like the live).
- **B (sidebar primitive)** — `sidebar-shell.tsx` rewritten to the
  provider/gap/fixed-container DOM (data-state/collapsible/variant/side,
  md: breakpoints); `sidebar-nav.tsx` rewritten to the data-sidebar tree
  (PNG logo + unlinked font-display wordmark; group/label/content/menu/
  menu-item/menu-button attrs; full peer/menu-button class string with the
  appended active tail; icons `mr-2 h-4 w-4`; footer chrome unchanged).
  Collapse = data-state flip (16rem → 3rem via the group-data variants,
  labels fade to opacity-0). Verified: 256px rail, 32px items (the active
  item was 36px before), 48px icon rail, labels opacity 0.
- **C (topbar)** — non-sticky `h-14` header, plain left group, trigger
  button (data-sidebar=trigger, sr-only span, no size fragment, 28×28),
  font-display h1 + `text-xs text-muted-foreground mt-0.5` subtitle in a
  plain div, label-free bell with the `bg-hot-pink` utility dot, avatar at
  text-xs + ml-2 without labels; matchMedia 768; the mobile Sheet rebuilt
  on the live's classes (`w-[--sidebar-width]` + inline 18rem,
  data-sidebar=sidebar data-mobile=true) — verified 288px with 7 buttons.
- **D (layout + small DOM)** — layout root `min-h-screen flex w-full
  bg-muted/30`; main column `flex-1 flex flex-col`; main `flex-1 p-6
  overflow-auto`; KPI cards `shadow-sm hover:shadow-md transition-shadow`;
  domains Input consumer `flex-1` only (twMerge was displacing the
  redundant h-10); activity-feed title → CardTitle h3 (`font-semibold
  tracking-tight font-display text-base`).
- **E (auth cards)** — AuthShell card base-first + `p-6 text-center pb-2`
  header order + PNG logo img (h-16 w-16) + h3 heading on the live's
  CardTitle pattern; Label primitive → new-gen string (no data-slot, no
  flex/gap/select-none); OAuth buttons on the Button primitive (outline +
  h-10 px-4 py-2 w-full, disabled per D3, icons `h-4 w-4 mr-2`, titles
  dropped); email label wrapper removed; `noValidate` dropped from all
  three auth forms (native validation like the live — E2E login
  re-verified); footer link `text-primary font-medium hover:underline`.
- **F (snippet + landing)** — buildSnippet indents the loader body two
  spaces (format-pinned); the social-proof sr-only H2 + aria-labelledby
  removed (landing H2 count 8 → 7, sections still byte-identical).
- **Verification-sweep extras** (found while browser-verifying, all pinned
  in shell-parity.test.tsx): pricing plan cards rebuilt to the live's
  Card-base-first roots (normal + popular strings verbatim), the POPULAR
  badge removed (the live marks popular with the bar + border only),
  Current Plan → outline variant + mb-4, Get Started → variant-free
  gradient + mb-4 + Zap `h-3.5 w-3.5 mr-1.5`, feature list → div rows
  with circular bg-primary/10 chips + span text; in-page H1s
  (Install/Settings) + pricing headings dropped `text-foreground`;
  Badge primitive → div root, base without `border`, secondary without
  `text-secondary-foreground` (the live's badges are divs in BOTH
  bundles).
- **G (gate + verification)** — `npm run verify` GREEN: lint, typecheck,
  **432 tests / 50 files** (+30), build 36 routes. eslint now ignores
  `research/**` (captured third-party JS artifacts are evidence, not
  source — the R14 evidence sets simply contained no .js files).
  Fresh-standalone browser pass: shell DOM byte-verified against the
  round15 captures (provider attrs, gap/fixed geometry, item sizes, group
  structure, icon classes, logo, header/h1/main classes, KPI order);
  collapse + mobile Sheet behavior verified; E2E flow green (login →
  dashboard KPIs → 7 sidebar routes → visitors → export 200 with session
  → domains input 40px base+flex-1 → install snippet indented);
  landing sections byte-identical [762,403,174,526,708,610,650,814,756,
  500] with H2 count 7. Pixel-diff of the dashboard screenshot: the
  sidebar chrome region y0–310 is pixel-identical to the live; the
  remaining deltas are the documented data-only residuals (account
  initials, usage counts, chart/table data).
- **Known micro-divergences (documented rulings)** — D11: lucide-react
  0.525's default `aria-hidden="true"` stays on icons (the live's older
  lucide predates it; stripping requires non-idiomatic surgery); the
  clone's desktop sidebar stays mounted-but-hidden below md (SSR cannot
  know the viewport; the live's CSR unmounts it) — visually and
  functionally identical, the Sheet engages below 768px on both.
