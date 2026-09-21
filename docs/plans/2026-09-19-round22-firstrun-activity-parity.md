# Round-22 — First-Run States, Activity Pagination & Sub-Page Interaction Parity

**Date:** 2026-09-19 · **Session:** docs/session_19.md (R22) · **Base:** main @ 1b63733
(R21 ship cc3c550 + the user's session_19 log commit) · **Gate at base:** lint ✓
typecheck ✓ 568/56 tests ✓ build ✓

## Scope — four probe generations

1. **Drift watch (7th consecutive)** — the R21 tokenizer method, all 9 live
   pages re-captured at the R19-R21 viewport (1440×800; a default-window
   first pass produced a narrower recharts surface — 595 vs 702 — which is
   capture-viewport, not content drift), + the marketing bundle hash watch
   (`index-C3AAh5Je.js`).
2. **First-run / empty-state probe (NEW, 7th generation)** — the live's
   empty branches decoded from its app bundle (the definitive source) +
   runtime confirmation on the live visitors page (no-match search). A
   fresh live signup was attempted to observe the true first-run funnel;
   the live's Supabase signup returns 200 without a session (email
   confirmation gate — see F11), so fresh-account states come from the
   bundle decode.
3. **Activity pagination probe (NEW)** — the live's Activity Log model
   decoded from its app bundle (component `hxe`): page-index state,
   50-per-page, count-exact, footer only when count > 50.
4. **Sub-page interaction probe (NEW)** — the live's blog index + article +
   docs pages probed at runtime for interactive elements (buttons, copy
   affordances, share, categories, pagination).

## Audit evidence

- Drift: **LIVE 100% STABLE — 7th consecutive stable audit.** 8 of 9 pages
  IDENTICAL (dashboard zero ops after the viewport-corrected re-capture);
  the landing's 3 token ops are the known feed-row phase artifact (one row
  revealed `sarah.jones@gmail.com` vs `james.miller92@gmail.com` — roster
  cycle position; one row captured mid-phase with the "Matching…" badge).
  Marketing bundle hash UNCHANGED (`/assets/index-C3AAh5Je.js`).
- **Live visitors empty state (bundle + runtime-confirmed):** when the
  current tab's filtered count is 0, the live renders `<p
  class="text-sm text-muted-foreground py-12 text-center">No visitors
  identified yet. Install your pixel to get started.</p>` — **replacing the
  entire table wrapper** (direct child of the `p-0` card content). The
  alternate branch (`M>0` but the page empty — pagination past the end)
  reads "No visitors match your filters." The count `M` is the FILTERED
  count of the current tab (query `p_search`/`p_confidence_filter`/
  `p_source_filter` all feed it) — so a no-match SEARCH on a populated
  account shows the "identified yet" message (runtime-verified on the
  live: search `zzqqxx-no-match-r22` → "No visitors identified yet…",
  table gone, P tag, exact classes above).
- **Live search placeholder varies by tab:** `l==="b2b" ?
  "Search companies..." : "Search emails, companies..."` (runtime:
  placeholder confirmed on the all-tab).
- **Live dashboard empty branches:** Top Pages empty = `<p class="text-sm
  text-muted-foreground py-8 text-center">No page data yet</p>` (py-**8**);
  Recent Identifications empty = `<p class="text-sm
  text-muted-foreground py-12 text-center">No identifications yet. Install
  your pixel to get started.</p>`. Both text-utility-first emission.
- **Live domains empty branch:** `<div class="text-center py-12 text-sm
  text-muted-foreground">No domains yet. Add one above to get started.
  </div>` — a plain DIV, direct child of the `p-0` card content (not a
  padded CardContent + inner p).
- **Live Activity Log model (definitive, bundle component `hxe`):**
  - Page size **50** (`Jc=50`), page-index client state (`useState(0)`),
    `visitor_events` ordered `created_at desc`, `count exact` — offset
    pagination (`range(page*50, page*50+49)`).
  - **NO polling** (no `refetchInterval` anywhere in the component; no
    app-level QueryClient config — react-query defaults apply), **NO
    "Load older" button**, NO cursor walking.
  - Pagination footer ONLY when `count > 50` (pages > 1): container
    `flex items-center justify-between px-5 py-3 border-t border-border`;
    left span `text-xs text-muted-foreground` = `{page*50+1}–{min((page+1)*50,
    count)} of {count}`; right = ghost `icon` buttons (`h-7 w-7`,
    ChevronLeft/ChevronRight) with disabled bounds (`page===0` /
    `page>=pages-1`) and `text-xs text-muted-foreground px-2` "Page X of Y"
    between them.
  - Event-type map: `identify → {Identified, variant default}`,
    `capture → {Event Captured, variant secondary}`, `pageview →
    {Pageview, variant outline}`; chip bg identify → `gradient-primary`,
    capture → `bg-neon-green/20`, else `bg-muted`. The "capture" type
    exists for the live's form-capture pipeline (no such pipeline in the
    clone — see interpretation rulings).
  - Row/name/meta/time rendering otherwise matches the R16/R17 pins
    (runtime capture re-verified: Pageview badge = legacy outline string,
    Identified = gradient default — both byte-identical to the clone).
- **Live install page with ZERO domains (bundle component `pxe`):** renders
  the NORMAL install page with a placeholder site key —
  `site_key ?? "px_xxxxxxxxxxxxxxxx"` — in the snippet (sites select
  defaults to the first site when present; no "add a domain first"
  interstitial). The clone ships a custom "Add a domain first" guidance
  card (clone-authored UX).
- **Live signup funnel (definitive, bundle):** `password < 6` → toast
  "Password too short" / "Password must be at least 6 characters.";
  mismatch → "Passwords don't match" / "Please make sure both passwords
  match."; `signUp({email, password, options:{emailRedirectTo: origin}})`;
  error → toast "Signup failed"; **`data.session ? router.push("/dashboard")
  : toast "Check your email" / "We've sent you a confirmation link. Please
  check your inbox."`** — the live requires email confirmation (the R22
  probe signup returned 200 WITHOUT a session; the follow-up login
  returned 400 "Email not confirmed"). The probe account
  `parity.r22.probe@example.com` is a dormant unconfirmed row on the
  live's auth (no data, no session, unrecoverable without its email —
  documented, same honesty class as the R20 domain pollution).
- **Docs page interactions (runtime):** the copy button matches the
  clone byte-for-byte (`absolute top-3 right-3 p-2 rounded-md
  bg-secondary/80 hover:bg-secondary text-muted-foreground
  hover:text-foreground transition-colors` + lucide-copy w-4 h-4); the
  check glyph on copy carries **`text-green-500`** (clone: uncolored).
  "Contact Support" on the live is a real `<button>` (default variant +
  `gradient-cta text-primary-foreground border-0 hover:opacity-90
  font-semibold` tail) with **NO handler — a dead button** (click verified:
  no navigation, no toast); the clone ships an asChild mailto anchor.
- **Blog pages (runtime):** blog index = the static 10-post grid (no
  categories/search/pagination buttons; links = the pinned slug set);
  article pages = pure prose (zero buttons, zero links in main). All
  pinned R13 — non-findings.

## Findings

| ID | Severity | Finding | Action |
|----|----------|---------|--------|
| F1 | real (visual/structural) | Visitors empty state: live = `<p class="text-sm text-muted-foreground py-12 text-center">` replacing the whole table, strings "No visitors identified yet. Install your pixel to get started." / "No visitors match your filters.", branch = filtered-count===0; clone = `<td colSpan=6>` inside the table, "No visitors yet…" / "No visitors match the current filters.", branch total===0 && counts.all===0 | FIX — element, strings, branch, classes |
| F2 | real (visual/text) | Activity empty state: live = `<p class="text-sm text-muted-foreground py-12 text-center">No activity yet. Install your pixel to start tracking.</p>`; clone ships a different string with `px-4 py-16` | FIX |
| F3 | real (visual) | Top Pages empty: live `py-8` (+ text-first class order); clone `py-12` | FIX |
| F4 | real (structural) | Domains empty: live = `p-0` card content + direct `div.text-center py-12 text-sm text-muted-foreground`; clone = `CardContent py-12 text-center` + inner `<p>` | FIX |
| F5 | real (byte) | Recent-Identifications empty: class order live = `text-sm text-muted-foreground py-12 text-center`; clone = `py-12 text-center text-sm text-muted-foreground` (same set, wrong order) | FIX (fold with F3) |
| F6 | real (functional, MAJOR) | Activity Log: live = 50/page page-index pagination + footer (only when pages>1), NO polling, NO load-older; clone = 60/page cursor walk + 5s polling + "Load older events" button | FIX — the live's pagination model |
| F7 | real (first-run) | Install page with zero domains: live renders the normal page with placeholder key `px_xxxxxxxxxxxxxxxx`; clone renders a custom "Add a domain first" card | FIX |
| F8 | real (visual, tiny) | Docs copy-success check icon carries `text-green-500` on the live; the clone's Check is uncolored | FIX |
| F9 | real (tag/behavior) | Docs "Contact Support": live = real `<button>` (dead — live defect); clone = asChild mailto anchor | FIX the tag (real Button + onClick mailto, the R17 contact-sales pattern); the dead-button behavior itself stays a documented divergence |
| F10 | real (text) | Visitors search placeholder: live = "Search companies..." on the b2b tab, "Search emails, companies..." otherwise; clone = static | FIX |
| F11 | intentional (D-class) | Signup email-confirmation gate: the live toasts "Check your email" and requires a confirmed email before any session; the clone auto-sessions (no mail transport — self-hostable honesty) | DOCUMENT (PAD Known Issues) |
| — | non-findings / intentional | Drift (7th stable); blog index/articles (static, pinned); docs copy button structure; password policy (min 6 + confirm-match ✓); page-reset-on-filter-change (✓ both reset to 1); the live's stale-index selection persistence on filter change (live defect — clone's clear-on-change stays); "capture" event type (live's form-capture pipeline — no clone pipeline, dead map entry); in-card loading spinners + focus-refetch (react-query CSR machinery vs RSC streaming — architecture divergence, D-class); dashboard KPI zeros (data-driven); pagination footer copy pinned R11 | document only |

## Interpretation rulings (unknowable-from-bundle, documented)

- **F1 branch semantics:** the live's message switch rides the CURRENT
  TAB's filtered count (search+confidence+source all feed it), so a
  no-match search on a populated account shows the INSTALL message. The
  clone's `listVisitors.total` is the same filtered count — the branch
  becomes `total === 0`. The "match your filters" branch then only
  materializes when the page is beyond the data (page > pageCount — the
  clone's URL-driven pagination can produce it via a stale ?page= URL;
  the live via its own state). This replicates the live's observed
  behavior faithfully (runtime-verified), odd as the copy placement is.
- **F6 pagination model:** the live's page-index state never touches the
  URL; the clone's ActivityFeed gets the same client state, fed by
  `/api/activity` with `?page=` offset semantics + a `count`/`pageCount`
  envelope. The server page renders page 0 (50 events) + count for the
  footer decision. The initial server fetch keeps the RSC seam
  (`listActivity` page mode); subsequent pages are client fetches. The
  5-second poll and the "Load older events" button are RETIRED (the live
  has neither); the 15s re-render tick goes with them (the live's
  timestamps are computed at render; they refresh on refetch — an
  architecture nuance documented below).
- **Focus refetch (not replicated):** react-query's default
  `refetchOnWindowFocus` means the live's feed updates when the tab
  regains focus. Replicating that against RSC streaming would require
  client-side re-fetch machinery across every dashboard page — ruled a
  D-class architecture divergence (documented with the in-card loading
  spinners). The clone's activity page is static per navigation.
- **The "capture" event type:** the live's activity map contains an
  "Event Captured" (secondary badge, neon-green chip) entry fed by its
  form-capture pipeline. The clone's ingest produces only pageview +
  identification events; rendering a dead third badge variant would be
  unreachable code. Ruled a documented divergence (the schema/API pin the
  two live-occurring types).
- **F11 signup gate:** never lock a self-hosted clone behind an email it
  cannot send (PAD "Honesty over simulation"). The clone keeps its
  auto-session signup; the live's "Check your email" toast and
  confirmation gate are recorded as a D-class divergence in the PAD
  Known Issues (joining the forgot-password 404 ruling).
- **Probe account residue:** `parity.r22.probe@example.com` exists
  unconfirmed on the live's auth (200-without-session; login 400 "Email
  not confirmed"). No data, no sessions; deletion is impossible without
  the (nonexistent) inbox. Recorded here for the audit trail.

## TDD remediation plan

- **RED `tests/activity-r22-parity.test.tsx`** (F2 + F6):
  - Empty state: `<p class="text-sm text-muted-foreground py-12
    text-center">` with the live's exact string, replacing the list.
  - Footer: renders only when `totalCount > 50`; container `flex
    items-center justify-between px-5 py-3 border-t border-border`;
    "1–50 of 137" + "Page 1 of 3" labels; ghost icon buttons h-7 w-7
    with ChevronLeft/Right; prev disabled at page 0; next disabled at
    the last page; page advance replaces the list (no accumulation).
  - No polling: the rendered DOM carries no interval machinery (the
    component fetches `/api/activity?page=N` only on footer clicks —
    pinned via the fetch mock).
  - No "Load older events" string anywhere in the tree.
- **RED `tests/activity-query.test.ts` (updated)**: `listActivity`
  page-mode — page 0 = newest 50 with `count`; page 1 = the next 50;
  `pageCount = ceil(count/50)`; user-scoping preserved; the
  R7-F1 event-type identity pins preserved.
- **RED `tests/activity-api.test.ts` (new)**: the route accepts `?page=`,
  returns `{events, count, pageCount}`, rejects foreign sessions.
- **RED `tests/dashboard-empty-r22-parity.test.tsx`** (F1, F3, F4, F5,
  F7, F10):
  - Visitors: empty render has NO table; the `<p>` (exact classes) as a
    direct child of the p-0 card content; both branch strings; the
    branch switches on the filtered total (0 → install message).
  - Top Pages empty: `py-8` + "No page data yet".
  - Domains empty: the direct `div` (exact classes + string) inside p-0.
  - Recent Identifications empty: `text-sm text-muted-foreground
    py-12 text-center` order.
  - Install zero-domain: no "Add a domain first"; the snippet carries
    `px_xxxxxxxxxxxxxxxx`.
  - Search placeholder: "Search companies..." on the b2b tab; "Search
    emails, companies..." otherwise.
- **RED `tests/marketing-r22-parity.test.tsx`** (F8 + F9):
  - Copy button: the Check icon carries `text-green-500`.
  - Contact Support: a real `<button>` (tag) with the merged live class
    string and an onClick that navigates to `mailto:support@pixelco.io`.
- **GREEN (implementation order):**
  1. `src/lib/analytics.ts` — `listActivity` page mode (take 50
     default, `page` offset, `count`+`pageCount`; cursor retired).
  2. `src/app/api/activity/route.ts` — `?page=` + count envelope.
  3. `src/components/dashboard/activity-feed.tsx` — page state, footer,
     client page fetches, empty state, poll/tick/load-older retired.
  4. `src/app/dashboard/activity/page.tsx` — server page-0 + count.
  5. `src/components/dashboard/visitors-table.tsx` — empty branch (p
     replacing the table, strings, total-only switch), b2b placeholder.
  6. `src/app/dashboard/page.tsx` — top-pages py-8 + both empty orders.
  7. `src/components/dashboard/domains-panel.tsx` — the live's empty
     div inside the p-0 card.
  8. `src/app/dashboard/install/page.tsx` — placeholder-key path.
  9. `src/components/marketing/docs-copy-button.tsx` — green check.
  10. `src/app/(marketing)/docs/page.tsx` — real Button + onClick.
- **Legacy updates:** `tests/content-parity.test.tsx` (ActivityFeed props
  page 0 + count), any activity feed DOM pins re-checked.
- **Gate**: lint → typecheck → test → build (never weaken a failing gate).

## Verification plan

- Browser probes: the local activity footer (seeded > 50 events — the dev
  seed has 101), empty-state renders (fresh local account or
  no-match search), install zero-domain render, docs copy + contact
  buttons.
- VLM visual confirmation of the activity footer + an empty state.
- Screenshots → `docs/screenshots/` (r22- prefix).
- E2E console-error sweep on the affected pages.

## Risks

- The activity rework removes a documented README feature (5s polling,
  background pause). The README/AGENTS text must be updated in the same
  round (the live model is the parity mandate; the poll was clone
  engineering).
- The install placeholder snippet could confuse a real user (a snippet
  that never works until a domain exists) — that IS the live's behavior
  (first-run parity); the Quick Start copy already directs to domains.
- The visitors empty-branch change interacts with the URL-driven page
  param (a stale ?page beyond the data now shows the "match your
  filters" message like the live) — tests pin both branches.

## Execution log (R22)

### Audit phase
- Baseline gate at 1b63733: lint ✓ typecheck ✓ 568/56 ✓ build ✓.
- Drift watch (7th consecutive): **LIVE 100% STABLE** — 8 of 9 pages
  zero token ops; the landing's 3 ops are the known feed-row phase
  artifact (one row revealed a different roster email; one row captured
  mid-phase with the "Matching…" badge). First capture pass at a default
  window produced a narrower recharts surface (595 vs 702 chart width)
  — re-captured at the R19-R21 viewport (1440×800): dashboard zero ops,
  all 48 prior ops were pure chart geometry. Marketing bundle hash
  UNCHANGED (`/assets/index-C3AAh5Je.js`).
- Empty-state branches decoded from the live's app bundle (visitors,
  activity, top pages, recent identifications, domains) + runtime
  confirmation on the live visitors page (no-match search
  `zzqqxx-no-match-r22` → the "identified yet" `<p>` replaces the entire
  table, exact classes; the confidence-band low filter matched 1 row —
  the message switch rides the current tab's FILTERED count `M`).
- Fresh live signup attempted: `parity.r22.probe@example.com` — Supabase
  returns 200 WITHOUT a session; login returns 400 "Email not confirmed"
  (the email-confirmation gate is the live's real design — decoded the
  signup handler branch: `data.session ? router.push("/dashboard") :
  toast "Check your email"`). The probe account is a dormant
  unconfirmed row (no data, unrecoverable without the inbox — recorded).
- Activity Log model decoded from bundle component `hxe`: `Jc=50`
  page size, `useState(0)` page index, `count exact`, offset
  `range(page*50, page*50+49)`, footer only when count > 50, ghost icon
  chevrons with disabled bounds, NO polling (no refetchInterval; no
  app-level QueryClient config), NO load-older. The pageview badge
  re-verified as the legacy outline string at runtime.
- Install page zero-sites branch decoded from bundle component `pxe`
  (CORRECTION mid-round: the initial reading — "normal page with
  placeholder key" — was the LOADING fallback `site_key ??
  "px_xxxxxxxxxxxxxxxx"`; the real zero-sites branch renders the normal
  header + "Add a domain first to get your tracking snippet."
  interstitial). DomainSwitcher only when `i.length>1`; Quick Start copy
  button (plain "Copied!" swap — no green check on the app side).
- Docs/blog interactions probed at runtime: blog index + articles =
  static (R13 pins hold); the docs copy button matches the clone
  byte-for-byte, its success Check carries `text-green-500`; "Contact
  Support" is a real `<button>` with NO handler (dead — click-verified).
  The live's marketing Button base is new-gen (no `font-medium`), the
  app bundle ships legacy — the clone's marketing Button primitive
  already ships the new-gen base (R18 pins hold).

### TDD phase
- RED confirmed: 21 failed / 4 passed across the 3 new R22 suites
  (activity-r22-parity, dashboard-empty-r22-parity,
  marketing-r22-parity) + the activity-query/content-parity updates.
- GREEN per plan order: `listActivity` page mode → `/api/activity`
  envelope → ActivityFeed rewrite (page state, footer, replacement
  fetches, empty state; poll/tick/load-older retired) → activity server
  page (page 0 + count) → visitors-table (empty `<p>` replacing the
  table, b2b placeholder) → dashboard page (top-pages py-8 +
  recent-ident order) → domains-panel (the live's empty div) → install
  page (the corrected interstitial + switcher condition + plain
  "Copied!") → docs copy green check → Contact Support (extracted
  `ContactSupportButton` client leaf, Button primitive + mailto
  onClick — the R17 contact-sales pattern; the RSC page keeps no
  onClick).
- Comment-vs-regex lesson (recurring): literal pin strings inside
  source comments match naive class-regex assertions — comments
  reworded to avoid the literal emission (`h-7 w-7` split in comments).
- Suite: 568/56 → **596/59**; lint ✓ typecheck ✓ build ✓.

### Post-fix verification
- Browser probes (dev server, seeded 130-event user
  `r22.footer@pixelco.local` + fresh signup
  `r22.fresh@pixelco.local`):
  - Activity: 50 rows, "1–50 of 130" + "Page 1 of 3", prev disabled at
    page 0; NEXT → "51–100 of 130" + "Page 2 of 3" (list replaced);
    idle-network check: NO polling requests.
  - First-run: fresh signup lands on /dashboard (auto-session); visitors
    empty `<p>` exact classes, table GONE; activity empty exact string;
    domains empty plain div; install interstitial (h1 + "Add a domain
    first…" + Add a Domain CTA).
  - Docs: Contact Support = real BUTTON with the merged new-gen base;
    clipboard API does not complete headless (environment limit — same
    flow as the live; the class-swap logic is test-pinned).
  - Console-error sweep: zero errors on all affected pages.
- VLM confirmations (3): the activity footer (footer + labels + left
  chevron disabled + ~50 rows + no defects), the visitors empty state
  (table replaced by the centered muted message), the install
  interstitial (heading/subtitle/card/CTA, no snippet).
- Screenshots (8, `docs/screenshots/`): r22-activity-footer (full-page),
  r22-activity-page2 (full-page), r22-firstrun-dashboard/-visitors/
  -activity/-domains/-install, r22-docs-page.
- The two first activity captures were byte-identical (the page-2 click
  did not land) — re-captured with footer-text verification each pass.
