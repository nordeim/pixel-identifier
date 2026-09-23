# Round 29 — Select Item Class-Order Parity

**Date:** 2026-09-23 · **Session:** `docs/session_32.md` (R29 log) · **Verdict: ONE drift family found (R29-F1) — the live's Radix Select `option` items render the `data-[disabled]:` pair BEFORE the `focus:` pair in the class attribute; the clone ships the canonical legacy-shadcn order (focus first). Same rendered CSS either way — but the DOM bytes differ, and the live's DOM is the contract. One-string fix in the single `SelectItem` primitive**

## Scope

The R28 next-notes defined the R29 watch targets: (a) bundle hashes again — a
change triggers the full token-diff sweep; (b) the trend chart joining the
standing regression loop (R28-F1); (c) the tooltip label/entry pin candidates
(never byte-compared); (d) the toast/pricing/mobile-nav standing loops.
Plus the standing user emphasis: the mobile navigation menu (both surfaces),
the Tailwind CSS v4 bug watch, the DB seam (`.env`
`DATABASE_URL="file:../db/custom.db"` → repo `db/`), the vitest + Playwright
suites, and the repo-round discipline (gates, screenshots, docs, push to
main).

## Probe protocol (14th probe generation — live verified 2026-09-23)

Probe account `sepnetflix2023@outlook.com`; agent-browser (dual sessions —
live + clone); 1280×900 desktop + 375×812 mobile viewports; settled-DOM
captures. NEW probe surfaces this round: **(1) the Select open-state portal**
(the Radix portal markup — trigger, chevron, viewport, scroll buttons,
items — a runtime surface no prior round diffed end-to-end; the R11 ground
truth captured only the R11-era bundle), **(2) the chart tooltip CONTENT**
(R28 pinned the chrome; the label/entry format was never byte-compared),
**(3) the activity pagination footer** (R22 source-pinned, never
runtime-confirmed latent on the live).

### 1. Bundle hashes — NO REDEPLOY

| Bundle | R28 baseline | R29 live | Verdict |
|---|---|---|---|
| Marketing JS | `assets/index-C3AAh5Je.js` | `index-C3AAh5Je.js` | unchanged |
| Marketing CSS | `assets/index-bLMWzsGr.css` | `index-bLMWzsGr.css` | unchanged |
| App JS | `assets/index-nhmKaUsm.js` | `index-nhmKaUsm.js` | unchanged |

### 2. Standing targets re-verified (all CLEAN)

- **Mobile navigation (standing user emphasis), both surfaces, both sites:**
  marketing dropdown @375 px (toggle + container classes, 4 links + CTA,
  close-on-link-click — live scroll 7424 px / clone 7404 px, the documented
  20 px D5 delta) and the dashboard Sheet (`--sidebar-width: 18rem`, 7 nav
  links, close-on-cross-page-nav on BOTH sides — one early false alarm on
  the clone traced to dev-compile latency, re-read confirmed the unmount).
  Parity on both sites.
- **Trend chart (standing loop since r28):** 17 tick lines at the captured
  geometry, plot origin x=65, 12-of-14 date labels (Sep 20 + Sep 22 hidden),
  axis strokes, tick-text fill — byte-identical both sides.
- **Tooltip content (NEW candidate → stable):** label format + entry format
  `name : value` (`Pageviews : 4` / `Identified : 2`), no item colors, the
  recharts default wrapper — **byte-identical both sides**. Joins the
  confirmed-stable list (data-driven values differ by design — the
  Y-domain 0–4 matched at probe time).
- **Toast system (standing loop since r27):** `Settings saved` fired on the
  live's settings save — the `<li data-sonner-toast>` class family + icon
  path byte-identical to the clone (4 s auto-dismiss on both sides).
- **Pricing POPULAR badge (standing loop since r26):** byte-identical.
- **NTW badge:** live still `0 this week / 2 last week` → negative branch
  `-100.0%` destructive — unchanged.
- **Install copy button:** `Copied!` swap, no toast (R22 pin holds).
- **Topbar/visitors:** `2 individuals · 1 companies identified` + 3 rows on
  BOTH sides.
- **Console sweep:** clone routes (marketing, sub-pages, auth, 404,
  7 dashboard pages) — ZERO console / page errors.
- **TW4 watch:** no bare-var brackets anywhere in the standing probes.

### 3. The finding — R29-F1: the SelectItem class-attribute order

Driving the NEW probe surface (the Select open-state portal) found a drift
the R11 ground truth recorded the OTHER way around: the live's bundle
changed class order between R11 and R16 (the sidebar-migration redeploy —
the R11-era `focus:`-first capture predates it). Live-verified on all THREE
of the live's Select surfaces (visitors confidence filter, visitors source
filter, install DomainSwitcher) — the pattern is consistent:

| Element | Live (captured) | Clone (pre-fix) | Verdict |
|---|---|---|---|
| `SelectItem` class | `relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 focus:bg-accent focus:text-accent-foreground` | same tokens, tail order `…focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50` | **token ORDER differs** |
| Trigger / chevron / viewport / scroll buttons | byte-identical both sides | — | parity |
| Item indicator | `absolute left-2 flex h-3.5 w-3.5` + `h-4 w-4` lucide-check | same | parity |
| Check-icon aria wrapper | live wraps the svg in `<span aria-hidden="true">` | clone's lucide renders without the wrapper | **D4 residual (documented, not drift)** |
| Item text | `<span id="radix-…">` | same | parity |

Rendered CSS is identical (Tailwind class ORDER in the attribute carries no
specificity — the stylesheet defines it), so this is an invisible drift:
pure DOM-byte parity. The live's DOM is the contract (AGENTS.md rule); the
fix is a one-string reorder in the single `SelectItem` primitive
(`src/components/ui/select.tsx`) — both consumers (visitors-table.tsx
confidence + source filters, domain-switcher.tsx) pass no `className`
override, so one fix covers every Select surface.

### 4. Non-findings / documented evidence

- **Activity pagination footer (NEW probe → latent-parity):** the live's
  activity page renders 7 events — below the R22-pinned 50-per-page
  threshold, so NO footer on the live (and none on the clone at 5 demo
  visitors). The footer's structure stays source-pinned by
  `tests/activity-r22-parity.test.tsx` (footer classes, ghost `h-7 w-7`
  icon buttons, page label, renders-only-when >1 page). No drift.
- The check-icon `aria-hidden` wrapper span (D4): the live's lucide-react
  version emits the wrapper; the clone's pinned version doesn't. The
  documented D4 ruling stands (an icon-library version pin, not a class
  drift; swapping lucide versions to chase one wrapper span was ruled out
  in R16/R17 as high-blast-radius).
- Y-axis domain 0–4 on both sides at probe time (data-driven; the R28
  chart pins cover the axis machinery).

## The fix (TDD)

**RED first** — `tests/select-r29-parity.test.tsx` (source + static-render
pins): the exact live class string on the `SelectPrimitive.Item` in the
`ui/select.tsx` source (order-sensitive), the static-rendered
`role="option"` class attribute byte-matching the live capture, the
indicator span + item-text structure, and the negative pin (the legacy
focus-first order ABSENT). Plus `e2e/select.spec.ts` (runtime pins):
open the visitors confidence Select on the dev server, assert every
rendered `[role=option]` class attribute equals the live string
(order-sensitive `getAttribute('class')`), and the selected item's
indicator structure.

**GREEN** — `src/components/ui/select.tsx`: reorder the `SelectItem`
className string to the live's order (`data-[disabled]:` pair before the
`focus:` pair). Nothing else — the consumers, the indicator, the viewport,
the trigger are all untouched (verified byte-identical this round).

**Runtime byte-verify** — the dev server's Select open-state portal diffed
against the live capture: every `[role=option]` class attribute
byte-identical (order-sensitive), trigger/chevron/viewport unchanged.

## Execution log

- [x] Probe phase complete (see above) — 14th generation
- [x] RED: `tests/select-r29-parity.test.tsx` — 2 of 7 pins failing
      pre-fix (the live-string pin + the legacy-order negative; the
      5 structural/consumer/trigger pins passed — the structure was
      already right, only the order differed)
- [x] RED: `e2e/select.spec.ts` — both class-order specs failing pre-fix
      (run against the dev server via `E2E_BASE_URL`; the
      indicator-structure spec passed pre-fix)
- [x] GREEN: `ui/select.tsx` SelectItem class string reordered (one
      string + the R29 comment; nothing else touched)
- [x] Runtime byte-verify vs the live capture: all 4 confidence option
      class attributes **identical, order-sensitive** (single unique
      string across the options); the trigger class family (incl. the
      consumer `w-44`) + the viewport classes identical; the selected
      item's indicator wrapper + check path identical — remaining
      deltas are the documented residuals only (svg-level aria-hidden =
      D4 lucide family; runtime-generated radix ids)
- [x] Full vitest: **700 passed | 2 skipped (70 files)** — +7 pins
- [x] Full e2e: **24/24 chromium** (38.2 s) — +3 specs (select.spec.ts)
- [x] Gates: lint 0 · typecheck 0 · build ✓ standalone ✓
- [x] Screenshots: `docs/screenshots/r29-*` (4 VLM-verified — both
      filter open-states, the standing dashboard, the mobile 375 px
      open-state)
- [x] Docs: README R29 bullet, AGENTS R29 fact, CLAUDE 11–29 mirror,
      PAD v1.28, SKILL.md R29 rows, session_32.md, worklog, this log
- [x] `.env.example` re-verified: 3 keys, consistent (no env surface
      added)
