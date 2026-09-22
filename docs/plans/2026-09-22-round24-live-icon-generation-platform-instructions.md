# Round-24 — Drift Watch: Live Icon Generation, Platform Instructions & Text Parity

**Date:** 2026-09-22 · **Session:** docs/session_22.md (R24) · **Base:** main @ 2806f50
(R23 ship 0b5d69b + the user's session-log commit) · **Gate at base:** lint ✓ typecheck ✓
613/61 vitest ✓ (2 skipped) build ✓ e2e 14/14 ✓ (R23 record)

## Scope — the R24 named targets + the sweep's real findings

The round opened as a drift watch on the R23 next-notes' targets (live settings save
flow, visitors detail sheet row-click, live bundle hash drift, Prisma 6.x CLI anchor
behavior). Outcome of those probes:

- **No live redeploy.** The app bundle is still `assets/index-nhmKaUsm.js` and the
  marketing bundle still `assets/C3AAh5Je.js`/`bLMWzsGr.css` — both match the R20/R21
  baselines (R19's recorded `n3AAh5Je.js` was already stale in R20). The initial
  "bundle hash drift" alarm was a false positive from the stale R19 record.
- **Settings save flow** — the live ships a working "Save Changes" button (PATCH 204 +
  refetch, silent — no toast). The clone's R18-pinned button bytes already match; the
  ONLY divergence is the pending spinner (F9). The live's Danger-Zone Delete button is
  DEAD (no onClick, no dialog — click-verified); the clone's typed-confirm delete flow
  stays a documented value-add.
- **Visitors detail sheet (row click)** — the live's rows are INERT (no sheet, no row
  handler; a click produces no dialog and no DOM change beyond noise). The clone's
  detail Sheet stays a documented value-add. No drift to fix.
- **Prisma CLI anchor behavior** — no Prisma version change since R23 (`6.19.3`
  both sides); `db:push` re-verified in-sync against `<repo>/db/custom.db`.

The full-surface token-diff sweep (landing desktop+mobile, dashboard, visitors,
settings, install, 404) then found the round's REAL drift, all pre-existing
divergences rather than live-side changes:

- **F1 — marketing text divergences (3).** The live says "company (if **B2B**)" — the
  clone has shipped "company (if B2C)" since the initial commit (the live has said
  B2B since at least R18). The live's kickers read "**Perfect Fit**"/"**Our
  Process**" (capitalized) vs the clone's "Perfect fit"/"Our process" — invisible
  through the `uppercase` utility but source-level divergences.
- **F2 — install platform instructions are WRONG.** The live's WordPress/Shopify/GTM
  step texts are entirely different from the clone's (the clone's versions were
  invented in a prior round — e.g. the live's WordPress path is the "Insert Headers
  and Footers" plugin, NOT the Theme File Editor). The live also wraps step literals
  in `<code>` chips (`text-xs bg-muted px-1.5 py-0.5 rounded font-mono`) and UI paths
  in `font-medium` spans, and renders a per-tab snippet `<pre>` under the steps for
  WordPress/Shopify/GTM (the HTML tab has steps only — no pre). Fix = rewrite the
  steps verbatim + add `buildPlatformSnippet()` to `src/lib/snippet.ts` + restructure
  `PlatformInstructions` to take `siteKey`/`collectorUrl` and build each tab's
  snippet (optional `defaultValue` prop so SSR tests can pin each tab's panel).
- **F3 — "views" label singularization.** The live renders `views.toLocaleString() +
  " views"` — "1 views" is CORRECT on the live (verified in Top Pages). The clone's
  `1 view` singularization is a divergence; remove it.
- **F4 — the live app bundle pins lucide-react 0.462.0 (old icon generation).** The
  bundle literally declares `lucide-react v0.462`. The drifted icons (old-generation
  geometry): **bell, log-out, mail, users, download, search, code, shopping-bag**,
  plus **trending-up/trending-down** (polyline encoding) and **LoaderCircle** —
  0.525's `LoaderCircle` is byte-identical to the live's (same path + class), so no
  override is needed there, only the import swap + structure fix (F9). Non-drifted
  (verified identical): eye, globe, user, panel-left, zap, copy, circle-check,
  map-pin, arrow-up-down, chevron-down, circle-alert, chart-column, activity,
  code-xml, credit-card, settings. IMPORTANT: the live's **marketing** bundle ships
  the NEW generation — the legacy overrides must scope to dashboard/app contexts
  only. Fix = extend the R16 D4 `live-icons.tsx` pattern with 10 geometry-override
  components and swap the usages (topbar bell/download; dashboard page mail/users;
  sidebar-nav users [Domains]; sign-out log-out; activity-feed mail; visitors-table
  mail/search; platform-instructions code/shopping-bag).
- **F5 — bell button class order.** The live's bell button renders
  `… hover:bg-accent hover:text-accent-foreground h-10 w-10 relative` (its source is
  `size="icon"` + `className="relative"`); the clone ships `relative h-10 w-10`.
- **F6 — "New This Week" trend badge missing.** The live renders a change badge ONLY
  on the New This Week card: `<span class="inline-flex items-center text-xs
  font-semibold ${up ? 'text-neon-green' : 'text-destructive'}">` with a
  TrendingUp/TrendingDown icon (`h-3 w-3 mr-0.5`) and the percent text. Bundle logic:
  `change = lastWeek > 0 ? ((newThisWeek-lastWeek)/lastWeek*100).toFixed(1)` with an
  explicit `+` prefix when ≥ 0, `+ '%'`, else `""` (empty = no badge when lastWeek
  is 0); `up = Number(percent) >= 0`. The clone's card container already matches —
  only the badge is missing.
- **F8 — Export button element + visibility + icon.** The live's Export is a
  `<button>` (client-side CSV via bundle fn W), NOT an anchor: classes `… shrink-0
  gradient-primary text-primary-foreground shadow-lg glow-primary hover:opacity-90
  transition-all duration-300 font-semibold h-9 rounded-md px-3` (NO hidden/
  sm:inline-flex — it is visible on mobile), icon `h-3.5 w-3.5 mr-1.5` (legacy
  download geometry). The clone renders `<a href download>` + `hidden
  sm:inline-flex` + `mr-1.5 h-3.5 w-3.5` order. Fix = `<button>` (onClick triggers
  the same download; the R21 `/api/export` byte format stays the invisible
  mechanism), drop the hidden classes, legacy icon, class order.
- **F9 — settings Save pending spinner.** The live renders the spinner ALONGSIDE the
  label: `isPending && <LoaderCircle class="lucide lucide-loader-circle h-3.5
  w-3.5 mr-1.5 animate-spin"/>` followed by "Save Changes" — the label NEVER
  disappears. The clone swaps the whole label out for an `h-4 w-4` Loader2.
- **F12 — docs correction (R14-F10 evidence disproven).** The live NEVER swaps the
  404 tab title — it stays "Pixelco" (settled-load verified). R14-F10's pin of the
  title swap as live evidence was wrong; the clone's `NotFoundTitle` behavior stays
  (it is the same R14-D3 per-page-titles value-add category) but the comment in
  `not-found.tsx` and the AGENTS.md note must stop claiming live parity for it.

Documented non-findings (no action): the Stripe metrics iframe on the live dashboard
(their billing infra — the clone's simulated billing is a known data-layer
divergence), the Notifications toaster region (R18-era, invisible/empty), a11y
attributes and reveal machinery (D5-class), the 404 body (byte-verbatim both
sides), per-page app titles (R14-D3 value-add), the marketing mobile nav (byte
parity re-verified), visitors row inertness + detail Sheet (value-add), silent save
+ "Saved" line (value-add), dead Delete + confirm dialog (value-add).

## Audit evidence (9th probe generation — live verified 2026-09-22)

All evidence re-captured this session from the live (probe account
`sepnetflix2023@outlook.com`):

- **Bundle**: `https://app.pixelco.io/assets/index-nhmKaUsm.js` (1,111,728 bytes)
  declares `lucide-react v0.462` (47 occurrences of 0.462 strings). Icon factories
  extracted verbatim for the 13 icons listed under F4.
- **Bell button (dashboard header)**: `…hover:bg-accent hover:text-accent-foreground
  h-10 w-10 relative"` + `<svg class="lucide lucide-bell h-4 w-4"><path d="M6 8a6 6
  0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>`
  + the hot-pink dot.
- **KPI cards**: mail = `<rect width="20" height="16" x="2" y="4" rx="2"/><path
  d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>` (rect-first, 2-decimal); users =
  `<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7"
  r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0
  7.75"/>` (circle-second); eye and globe match 0.525 byte-for-byte.
- **Trend badge (live account data: New This Week = 0, last week = 2)**:
  `<span class="inline-flex items-center text-xs font-semibold text-destructive">
  <svg class="lucide lucide-trending-down h-3 w-3 mr-0.5"><polyline points="22 17
  13.5 8.5 8.5 13.5 2 7"/><polyline points="16 17 22 17 22 11"/></svg>-100.0%</span>`
  followed by `<span class="text-xs text-muted-foreground">vs. 2 last week</span>`.
  Bundle render: `v.change && <span class={…v.up ? "text-neon-green" :
  "text-destructive"}>{v.up ? <TrendingUp class="h-3 w-3 mr-0.5"/> :
  <TrendingDown class="h-3 w-3 mr-0.5"/>}{v.change}</span>`; computation
  `u=d>0?((c-d)/d*100).toFixed(1):"0"`, `change=d>0?`${Number(u)>=0?"+":""}${u}%`:""`,
  `up=Number(u)>=0`.
- **Top Pages**: `/anon-check` → "1 views", `/pricing` → "1 views" (no
  singularization anywhere on the live).
- **Export button (visitors header)**: `<button class="inline-flex items-center
  justify-center gap-2 whitespace-nowrap text-sm ring-offset-background
  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
  focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50
  [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 gradient-primary
  text-primary-foreground shadow-lg glow-primary hover:opacity-90 transition-all
  duration-300 font-semibold h-9 rounded-md px-3"><svg class="lucide lucide-download
  h-3.5 w-3.5 mr-1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline
  points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>Export
  All</button>` — note: NO hidden/sm:inline-flex, tag is button, icon classes
  `h-3.5 w-3.5 mr-1.5`. The clone's `Button(size="sm", className="gradient-primary …
  font-semibold")` produces the byte-identical class string through the legacy
  base + twMerge (verified against the base math) — only the wrapper tag, the
  hidden classes and the icon drift.
- **Save button (settings, idle)**: byte-matches the R18 pin (verified DOM).
  Pending-state render from the bundle: `children:[l.isPending && <Gn class="h-3.5
  w-3.5 mr-1.5 animate-spin"/>,"Save Changes"]` — spinner BESIDE the label.
- **Sign-out (sidebar footer)**: `<button class="flex items-center gap-2 text-xs
  text-muted-foreground hover:text-foreground transition-colors w-full px-1"><svg
  class="lucide lucide-log-out h-3.5 w-3.5"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0
  1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12"
  y2="12"/></svg>Sign out</button>` — no `shrink-0` on the icon, old-gen geometry.
- **Sidebar nav icons**: chart-column / eye / activity / code-xml / **users**
  (Domains) / credit-card / settings, all `mr-2 h-4 w-4` — the icon SET matches the
  clone; only `users` needs the legacy geometry.
- **Visitors tabs**: All (no icon) / Individuals = `lucide-user` single-person
  (`M19 21v-2a4 4 0 0 0-4-4H9…` + `circle cx=12`) — identical to 0.525 `User` ✓ /
  Companies = `lucide-building2` (R16 override already handles it). Search icon:
  `<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>` — legacy 1-decimal.
  The b2c row email cell carries NO icon on the live (the clone's Mail lives only
  in the value-add detail Sheet's "Reach out" button).
- **Platform instructions (all four tabs, verbatim)**:
  - HTML: 4 steps — "Open your HTML file" (`Open the main HTML file of your website
    (usually <code>index.html</code>).`), "Find the <head> tag" (`Locate the
    <code>&lt;head&gt;</code> section of your page.`), "Paste the snippet" (`Paste
    the pixel code just before the closing <code>&lt;/head&gt;</code> tag. It only
    needs to be in your main layout file — it will work on every page.`), "Deploy
    your site" (`Save and deploy your changes. Visit your site, then check your
    Pixelco dashboard to confirm events are arriving.`). NO pre.
  - WordPress: 3 steps — "Install 'Insert Headers and Footers' plugin" (`Go to
    <span class="font-medium">Plugins → Add New</span> and search for "Insert
    Headers and Footers" by WPCode. Install and activate it.`), "Add the snippet"
    (`Go to <span class="font-medium">Code Snippets → Header &amp; Footer</span>.
    Paste the pixel code in the <span class="font-medium">"Header"</span>
    section.`), "Save" (`Click Save. The pixel is now active on all pages of your
    WordPress site.`). Pre: comment header `<!-- Add to your theme's header.php or
    use a plugin like "Insert Headers and Footers" -->` + `<!-- Paste this before
    the closing </head> tag -->` + the standard snippet.
  - Shopify: 4 steps — "Open theme editor" (`Go to <span class="font-medium">Online
    Store → Themes → Actions → Edit Code</span>.`), "Edit theme.liquid" (`Open
    <code>theme.liquid</code> from the Layout section.`), "Paste before
    &lt;/head&gt;" (`Find the <code>&lt;/head&gt;</code> tag and paste the pixel
    code just above it.`), "Save" (`Click Save. The pixel now runs on every page of
    your Shopify store.`). Pre: `<!-- In Shopify Admin → Online Store → Themes →
    Edit Code -->` + `<!-- Open theme.liquid and paste before </head> -->` + the
    standard snippet.
  - GTM: 4 steps — "Create a new tag" (`In Google Tag Manager, go to <span
    class="font-medium">Tags → New → Custom HTML</span>.`), "Paste the code"
    (`Paste the pixel snippet into the HTML field.`), "Set the trigger" (`Set the
    trigger to <span class="font-medium">"All Pages"</span>.`), "Publish" (`Save
    the tag and publish your GTM container.`). Pre: `<!-- In GTM, create a Custom
    HTML tag -->` + `<!-- Trigger: All Pages -->` + a GTM VARIANT of the snippet
    whose `setAttribute('data-site', …)` argument is the LITERAL key (not the `e`
    parameter).
  - Tab icons: code (legacy geometry) / globe (current) / shopping-bag (legacy
    geometry) / code (legacy) — all `h-3.5 w-3.5`.
  - The pre wrapper: `<div class="relative mt-3"><pre class="bg-foreground/5 border
    border-border rounded-lg p-4 text-xs font-mono overflow-x-auto
    leading-relaxed"><code>…</code></pre></div>` (note `text-xs` here vs the Quick
    Start pre's `text-sm`).
- **Marketing texts**: `<p class="text-sm text-muted-foreground leading-relaxed">See
  identified visitors in your dashboard with their email, company (if B2B), pages
  viewed, and confidence score.</p>`; kickers `<span class="text-xs font-semibold
  text-primary uppercase tracking-widest">Perfect Fit</span>` / `…>Our
  Process</span>`.
- **LoaderCircle**: live factory = `[["path",{d:"M21 12a9 9 0 1 1-6.219-8.56"}]]` —
  byte-identical to local 0.525 `LoaderCircle` (and `Loader2` re-exports it).
- **404 title**: settled loads of live `/dashboard/billing` (a 404 on both sides)
  keep the tab title "Pixelco" — no swap ever happens (disproves R14-F10's
  evidence; the clone's behavior stays as a D3-class value-add).

## Test plan (TDD)

RED first (all new tests fail), then GREEN:

1. `tests/live-icons-r24.test.tsx` — geometry pins for the 10 new legacy components:
   exact element sequence + attribute bytes + `lucide lucide-<name>` class form.
2. `tests/dashboard-r24-parity.test.tsx` — bell class order, Export button
   (tag=button, no hidden classes, icon classes/order, label logic), trend badge
   (presence/branches/icon classes/percent math), views label (no singular),
   sign-out icon (legacy geometry, no shrink-0), KPI icon swaps (mail/users
   legacy), sidebar users swap, activity mail swap, visitors mail/search swaps,
   settings spinner-alongside-label structure.
3. `tests/platform-instructions-r24.test.tsx` — each tab's step texts, code chips,
   font-medium spans, per-tab pres (html none / wp / shopify / gtm), GTM literal-key
   variant, `buildPlatformSnippet` unit contract (vm-executed? no — string builder;
   the collector snippet itself is already vm-pinned; the platform wrapper is
   string-level).
4. `tests/marketing-r24-parity.test.tsx` — B2B sentence, kicker capitalization.
5. Test-side updates: `marketing-r11-parity` kicker locators ('Perfect Fit' /
   'Our Process'), `content-parity` PlatformInstructions render sites (new props +
   defaultValue), `not-found.test` comment alignment (no behavior change).

## Files

| Fix | Files |
|-----|-------|
| F1 | `src/components/marketing/how-it-works.tsx`, `tests/marketing-r11-parity.test.tsx` (locator) |
| F2 | `src/lib/snippet.ts`, `src/components/dashboard/platform-instructions.tsx`, `src/app/dashboard/install/page.tsx`, `tests/content-parity.test.tsx` (render sites) |
| F3 | `src/app/dashboard/page.tsx` |
| F4 | `src/components/dashboard/live-icons.tsx`, `topbar.tsx`, `page.tsx` (dashboard), `sidebar-nav.tsx`, `sign-out-button.tsx`, `activity-feed.tsx`, `visitors-table.tsx`, `platform-instructions.tsx` |
| F5 | `src/components/dashboard/topbar.tsx` |
| F6 | `src/app/dashboard/page.tsx` |
| F8 | `src/components/dashboard/topbar.tsx` |
| F9 | `src/components/dashboard/settings-panel.tsx` |
| F12 | `src/app/not-found.tsx` (comment), `AGENTS.md` (R14-F10 note), docs |

## Execution log

### RED

- `tests/live-icons-r24.test.tsx` — 11 geometry pins (the ten legacy
  components + the consumer-class order). All failing (components absent).
- `tests/dashboard-r24-parity.test.tsx` — 15 pins (bell order/geometry,
  Export tag/classes/icon/label logic, trend badge math+markup, views
  label, KPI/sidebar/activity/visitors icon swaps, sign-out, Save
  spinner). Failing.
- `tests/platform-instructions-r24.test.tsx` — 14 pins
  (`buildPlatformSnippet` contract ×4, HTML/WP/Shopify/GTM tabs, legacy
  tab icons). Failing.
- `tests/marketing-r24-parity.test.tsx` — 3 pins (B2B sentence, two
  kickers). Failing.
- **RED total: 46/49 failing** (3 source-pin assertions already held at
  base — the R21 export-href computation and the R18 Save classes).

### GREEN

- `live-icons.tsx`: +10 legacy components (exact 0.462 geometries,
  polyline/line encodings, rect-first mail, circle-second users,
  1-decimal search handle).
- `src/lib/format.ts`: `weekOverWeekChange` (the bundle's math).
- `src/lib/snippet.ts`: `buildPlatformSnippet` (WP/Shopify headers +
  standard snippet; GTM header + literal-key variant).
- `platform-instructions.tsx`: rewritten — segments model (text / code
  chips / font-medium spans), live-verbatim steps for all four tabs,
  per-tab pres, `siteKey`/`collectorUrl`/`defaultValue` props.
- `install/page.tsx`: passes the props.
- `topbar.tsx`: bell `h-10 w-10 relative` + BellIcon; Export → real
  `<button>` (variant-free full tail, no hidden classes, DownloadIcon
  `h-3.5 w-3.5 mr-1.5`, `window.location.assign` download).
- `dashboard/page.tsx`: MailIcon/UsersIcon KPIs, the trend badge
  (change/up fields on the KPI array), `views.toLocaleString()} views`.
- `sidebar-nav.tsx` UsersIcon (Domains); `sign-out-button.tsx` LogOutIcon
  without `shrink-0`; `activity-feed.tsx` MailIcon;
  `visitors-table.tsx` MailIcon/SearchIcon;
  `settings-panel.tsx` spinner-alongside-label (LoaderCircle import);
  `how-it-works.tsx` B2B + capitalized kickers; `not-found.tsx` F12
  comment.
- Test-side updates: `marketing-r11-parity` kicker locators;
  `content-parity` PlatformInstructions render sites (new props);
  `visitors-selection` Export assertions (button + source-level ids pin).
- First GREEN run 41/49 — the 8 failures were test-side artifacts (SSR
  entity encoding of `'`/`"`/`<` in static markup + one quoted-label
  regex). Assertions corrected to the entity forms (identical decoded
  text). **All 49 green.**

### Gates & verification

- Full suite: **662 passed | 2 skipped (65 files)** — up from 613/61.
- lint 0 · typecheck 0 · build (all routes) · standalone + e2e **14/14
  chromium (17.8 s)**.
- Browser verification (dev server): bell/Export/Save byte-match the
  settled live DOM (an early live-bell capture missing the base's
  `rounded-md text-sm font-medium transition-colors` was a
  PRE-HYDRATION artifact — the settled state carries them, matching the
  clone; the Save/Export hero-variant trimmed base is genuine and the
  variant-free recipe reproduces it through twMerge displacement).
- Mobile nav regression re-checked at 375 px, INCLUDING the same-page
  link edge case — the live keeps its Sheet open there too (parity).
- 8 screenshots captured + VLM-verified (`docs/screenshots/r24-*`);
  the trend badge was exercised by seeding a 3-vs-2 week state into the
  demo DB (badge renders `+50.0%` neon-green with the legacy
  TrendingUp — the negative branch is pinned by tests).
- Zero console errors on all changed surfaces.
