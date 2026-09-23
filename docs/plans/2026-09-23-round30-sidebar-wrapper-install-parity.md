# Round 30 — Sidebar Wrapper + Install Switcher Parity

**Date:** 2026-09-23 · **Session:** `docs/session_34.md` (R30 log) · **Verdict: FOUR drift families found — (F1) the live's `SidebarProvider` wrapper div (class + inline width vars) is missing from the clone's dashboard DOM; (F2) the settings Profile form ships clone-authored input attrs (`type="url"`, `autoComplete` ×2, `maxLength` ×2) the live does not render; (F3) the install-page site selection is URL-driven in the clone (`?site=` in the address bar) but pure client state on the live; (F4) the install page lists sites oldest-first while the live sorts newest-first (switcher options + default selection). All fixed via TDD; runtime byte-verified against fresh live captures.**

## Scope

The R29 next-notes defined the R30 watch targets: (a) bundle hashes again — a
change triggers the full token-diff sweep; (b) the Select open-state joining
the standing regression loop (r29 e2e); (c) candidate surfaces — the
DomainSwitcher open-state runtime byte-diff (the third live Select surface)
and the settings-tab panels; (d) the standing toast/pricing/mobile-nav/chart
loops. Plus the standing user emphasis: the mobile navigation menu (both
surfaces), the Tailwind CSS v4 bug watch, the DB seam
(`DATABASE_URL="file:../db/custom.db"` → repo `db/`), the vitest + Playwright
suites, and the repo-round discipline (gates, screenshots, docs, push to
main).

## Probe protocol (15th probe generation — live verified 2026-09-23)

Probe account `sepnetflix2023@outlook.com`; agent-browser (dual sessions —
live + clone); 1280×900 desktop + 375×812 mobile viewports; settled-DOM
captures (the live is CSR — wait for hydration before querying portals).
NEW probe surfaces this round: **(1) the install-page DomainSwitcher
OPEN-state** (the third live Select surface, previously covered by
primitive-level pins only), **(2) the settings-page panel byte-diff** (full
main-content HTML diff, live vs clone), **(3) the shell's outer wrapper
layer** (found incidentally while re-measuring the mobile Sheet's
`--sidebar-width`), **(4) the site-list ordering** (domains page + install
switcher).

### 1. Bundle hashes — NO REDEPLOY

| Bundle | R29 baseline | R30 live | Verdict |
|---|---|---|---|
| Marketing JS | `assets/index-C3AAh5Je.js` | `index-C3AAh5Je.js` | unchanged |
| Marketing CSS | `assets/index-bLMWzsGr.css` | `index-bLMWzsGr.css` | unchanged |
| App JS | `assets/index-nhmKaUsm.js` | `index-nhmKaUsm.js` | unchanged |

Fifth consecutive stable generation — no token-diff sweep required.

### 2. Standing targets re-verified (all CLEAN)

- **Mobile navigation (standing user emphasis), both surfaces, both sites:**
  marketing dropdown @375 px (toggle `md:hidden text-foreground` + `lucide-menu
  w-6 h-6`, container bytes, 4 links + CTA, close-on-link-click — live scroll
  7424 px / clone 7404 px, the documented 20 px D5 delta, icon resets) and the
  dashboard Sheet (inline `--sidebar-width: 18rem` on the SheetContent,
  288 px dialog width both sides, 7 nav links, close-on-cross-page-nav on
  BOTH sides). Parity on both sites. (Probe-methodology note: measuring
  `--sidebar-width` via `getComputedStyle` on the wrong element reads the
  `:root` 16rem fallback — the pin is the SheetContent's INLINE var + the
  rendered 288 px width.)
- **Trend chart (standing loop since r28):** 17 tick lines, identical label
  set (12-of-14 — Sep 20 + Sep 22 hidden), Y-domain 0–4 — byte-identical.
- **Toast system (standing loop since r27):** settings save → `Settings
  saved` byte-identical class family + icon on both sides; en route the live
  re-fired `Domain added successfully` + `Domain removed` (the R27 titles).
- **Pricing POPULAR badge (standing loop since r26):** byte-identical.
- **NTW badge:** live `0 this week / 2 last week` → `-100.0%` negative branch
  (`text-destructive` + trending-down) — unchanged; the clone's seeded data
  drives its documented positive branch.
- **Install copy button:** `Copy` → `Copied!` (uncolored check) → 2 s revert —
  verified with a stubbed clipboard (headless clipboard permission is a probe
  artifact; the swap is gated on the write succeeding).
- **Select surfaces (r29 loop):** the visitors confidence filter renders the
  live's item class order (`data-[disabled]:` before `focus:`) + the R21
  option texts.
- **Topbar/visitors:** `2 individuals · 1 companies identified` + 3 rows +
  tabs (All3 / Individuals2 / Companies1) on BOTH sides.
- **Console sweep:** 19 clone routes (marketing, sub-pages, auth, 404, 7
  dashboard pages) — zero console/page errors (the only logged errors were
  residue of the F3 probe's deliberately malformed site key — the designed
  error-boundary defense).
- **TW4 watch:** no bare-var bracket or layout anomalies in any probe.

### 3. The DomainSwitcher open-state — the R30 candidate surface: PARITY

Live-driven with a throwaway domain (add → probe → delete; the account's
standing set is 2 domains, so a third was needed to cross the `sites.length >
1` gate). The live's portal vs the clone's (2 domains):

| Element | Live | Clone | Verdict |
|---|---|---|---|
| Trigger | `flex h-10 items-center justify-between rounded-md border … [&>span]:line-clamp-1 w-[200px]` | identical | ✓ |
| SelectValue span | `<span style="pointer-events: none;">` + chevron `h-4 w-4 opacity-50` | identical | ✓ |
| Content (listbox) | the standard legacy viewport family | identical | ✓ |
| Item class | the R29 order (`…data-[disabled]:… focus:…`) | identical | ✓ |
| Item indicator | `absolute left-2 flex h-3.5 w-3.5` + `lucide-check h-4 w-4` in the aria-hidden span | identical (svg-level `aria-hidden` = the documented D4 residual) | ✓ |

**No drift — the R29 primitive fix covers the third surface exactly as
designed.** The functional swap works on both sides (trigger text + snippet
site key). Closed.

### 4. The findings

#### R30-F1 — the SidebarProvider wrapper div is missing

While re-measuring the mobile Sheet's width var, the live's outer DOM showed
a wrapper level the clone does not render — present at BOTH viewports, on
every dashboard page, in the UNCHANGED bundle (it was there all along; the
R15 sidebar pins captured the inner `data-side` tree but stopped one level
short):

| | Live | Clone (pre-fix) |
|---|---|---|
| Wrapper | `<div class="group/sidebar-wrapper flex min-h-svh w-full has-[[data-variant=inset]]:bg-sidebar" style="--sidebar-width: 16rem; --sidebar-width-icon: 3rem;">` | *(absent)* |
| Layout root | `min-h-screen flex w-full bg-muted/30` (inside the wrapper) | same classes, but the outermost shell element |
| data-* attrs | on the INNER `group peer hidden … md:block` element (data-state/collapsible/variant/side) | same place ✓ |

Rendered geometry is currently identical (the clone's `:root` vars in
`globals.css` compensate; `svh` vs `screen` min-height never diverges here
because the wrapper wraps a `min-h-screen` child). Pure DOM-byte parity —
a missing element on every dashboard page. Fix: wrap the layout root in
`src/app/dashboard/layout.tsx` with the live's exact class + inline vars
(the `:root` vars stay — they feed the standalone `w-[--sidebar-width]`
utilities and the portal Sheet's fallback; the wrapper's inline values win
the cascade inside the shell, exactly like the live).

#### R30-F2 — clone-authored settings input attrs

The full settings main-content byte-diff (live 3,632 vs clone 4,452
normalized chars) decomposed into: the R22 server-action architecture (form
+ `$ACTION` hidden inputs — kept, the documented mechanism), the for/id
a11y pairs (D-class, kept), the R20 AlertDialog delete confirm (kept
divergence), data-driven `value` attrs — **plus one real family: the
Profile inputs ship `type="url"`, `autoComplete="organization"|"url"`,
`maxLength={120}|{253}` — none of which the live renders.** `type="url"`
even adds native browser URL validation the live does not have. Fix: strip
the five attrs (the `name` attrs stay — the server action needs them; zod
still validates server-side).

#### R30-F3 — the install switcher leaks `?site=` into the URL

Selecting a domain on the live's install page: trigger text + snippet site
key swap, **the URL stays `/dashboard/install`** (pure client state). The
clone: `router.push('/dashboard/install?site=' + siteKey)` — a full URL
round trip, and the address bar shows a param the live never renders. Fix:
move the selection into client state — a client island
(`InstallPanels`) owning the selected site, rendering the header row
(h1 + switcher), the Quick Start card (snippet + status banner), and the
platform instructions; `buildSnippet` is a pure function and runs
client-side. The page keeps the zero-domains interstitial + How It Works
server-side. `searchParams` + `pickSelectedSite` retire with the param
(the `?site=` format was also the probe's error-boundary trigger via a
malformed key — the key regex stays as defense in depth).

#### R30-F4 — the install page's site list is oldest-first; the live is newest-first

Two live add/remove cycles proved the live's ordering: a freshly added
domain lands FIRST in both the domains page rows and the install switcher
options, and the DEFAULT selected site is the newest. The clone's domains
page already sorts `createdAt: 'desc'` (via `listDomainsAction`) — but the
install page's own query ships `orderBy: { createdAt: 'asc' }` → oldest
first + oldest selected. Fix: `desc` on the install query (one line).

## TDD plan

- **RED (vitest):** `tests/sidebar-wrapper-r30-parity.test.tsx` (source
  pins: the layout wraps its root in the live's wrapper class + inline
  vars) · `tests/settings-r30-parity.test.tsx` (static-render: no
  `type="url"` / `autocomplete` / `maxlength` on the Profile inputs; the
  id/name/for pairs stay) · `tests/install-r30-parity.test.tsx` (source
  pins: no `?site=` in the switcher/page, `pickSelectedSite` retired,
  install query `desc`, the interstitial branch intact).
- **RED (e2e):** `e2e/install.spec.ts` — add a domain through the UI, then
  assert: the switcher renders, the NEWEST domain is selected by default,
  the option order is newest-first, selecting the other option keeps the
  URL clean (`/dashboard/install`, no `?site=`) while the snippet's `px_`
  key swaps, and the Quick Start banner/copy remain intact. Plus a wrapper
  spec in `e2e/dashboard.spec.ts`: the `.group/sidebar-wrapper` element
  exists with the exact class + inline vars, wrapping the layout root.
- **GREEN:** F1 the wrapper div in `layout.tsx`; F2 the attr strip in
  `settings-panel.tsx`; F3 the `InstallPanels` client island (switcher +
  Quick Start + platform instructions) + page slim-down; F4 `desc`.
- **Runtime byte-verify** against fresh live captures (wrapper bytes,
  settings input attrs, clean-URL swap, newest-first default).

## Execution log

*(filled during execution)*
