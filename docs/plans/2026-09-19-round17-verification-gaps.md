# Round-17 Remediation Plan — Drift watch + R16-verification gap closure

**Date:** 2026-09-19 · **Repo state at plan time:** main @ b1581d6 (PAD v1.15,
476 tests / 51 files) · **Audit evidence:** `research/round17-audit/`

## Context

Round-17 was the planned drift watch (session_13's suggested next step).
The audit re-captured every surface with a **stricter per-page tokenizer**
(order-sensitive class strings + tag sequences + attr sets, svg/recharts
internals collapsed, `$ACTION_*` machinery filtered):

- **The live is 100% STABLE since R16**: byte-level token diff of the R16
  live captures vs fresh R17 live captures = **0 class/tag changes on all
  7 dashboard pages**; marketing bundle byte-stable (landing sections
  `[762,403,174,526,708,610,650,814,756,500]`, H2=7, all sub-page
  H1/H2/word counts, blog slugs 10/10, robots format, favicon md5);
  auth login card byte-identical; **shell sidebar byte-identical**
  (14767 chars, exact match to the R16 capture); per-page headers aligned
  (the only per-token delta is the documented D4 lucide `aria-hidden`).
- **The clone-side residual inventory**: the R16 browser verification
  classified residuals as "data-only + form machinery" — but the R17
  stricter diff (exact class-string comparison instead of the R16
  coarser alignment) found **3 real class/tag drifts the R16 pass
  missed**, plus 1 a11y-chrome decision to rule on.

## Findings (all DOM-verified, evidence in round17-audit/)

| ID | Sev | Finding | Evidence |
|---|---|---|---|
| R17-F1 | High | **Activity Identified badge — wrong generation string.** Clone ships `variant="secondary" className="gradient-primary border-0 px-1.5 py-0 text-[10px] text-primary-foreground hover:opacity-90"` → renders `…border-transparent bg-secondary hover:bg-secondary/80 gradient-primary border-0 px-1.5 py-0 text-[10px] text-primary-foreground hover:opacity-90`. The live (R16 + R17 captures identical) ships the **new-gen default-variant string**: `…border-transparent bg-primary hover:bg-primary/80 text-[10px] px-1.5 py-0 gradient-primary text-primary-foreground border-0` — byte-identical to the domains Verified badge (R15 new-gen). No test pins it (the R16 gap). | live/local activity captures; round16 activity-ident-row.json |
| R17-F2 | High | **Pricing contact-sales card (4 diffs).** (a) CTA tag: live = plain `<button>` with the variant-free Button + full consumer tail `…border-2 border-primary/30 bg-transparent text-primary hover:bg-primary/10 transition-all duration-300 font-semibold h-10 px-4 py-2 shrink-0` (font-semibold displaces font-medium, transition-all displaces transition-colors — the R16 settings-Save pattern); clone = `variant="outline" asChild` + `<a href="mailto:…">` rendering `…transition-colors … hover:text-accent-foreground h-10 px-4 py-2 shrink-0 border-2 border-primary/30 bg-transparent font-semibold text-primary hover:bg-primary/10`. (b) Card root order: live `rounded-lg border text-card-foreground shadow-sm border-border bg-card` (= twMerge displacement from consumer `border-border bg-card`); clone `rounded-lg border bg-card text-card-foreground border-border shadow-sm`. (c) CardContent order: live `p-6 pt-6 flex flex-col md:flex-row items-center justify-between gap-4`; clone flex-first. (d) Subtitle order: live `text-sm text-muted-foreground mt-0.5`; clone mt-0.5-first. | live/local pricing captures |
| R17-F3 | Med | **Install icon chips — span/flex-first wrappers where the live ships bare div/geometry-first.** Three sources: (a) platform-instructions platform chip (PanelsTopLeft): clone `<span class="flex h-8 w-8 items-center justify-center rounded-lg bg-muted" aria-hidden="true">` vs live `<div class="h-8 w-8 rounded-lg bg-muted flex items-center justify-center">`; (b) platform-instructions step-number chips: clone `<span class="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary" aria-hidden="true">` vs live `<div class="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0 mt-0.5">`; (c) install How-It-Works chip (CircleAlert): same span→div + reorder as (a). The R16 chip sweep covered the gradient-primary Quick-Start chip only. | live/local install captures |
| R17-F4 | Low | **Trend-chart a11y chrome.** Clone renders `<div class="h-[280px]" role="img" aria-label="Line chart of daily pageviews and identified visitors over the last 14 days">`; live ships the bare div. **Ruling: KEEP + document** — invisible functional a11y, same residual class as the search-input/select aria-labels (R16 ruling). No code change. | live/local overview captures |

Non-findings (verified stable, no action): the live's entire content layer
(0 token drift since R16); marketing bundle; auth cards; shell (sidebar
byte-identical, headers D4-only); domains delete button (byte-identical
string; the local's extra attrs are Radix AlertDialog machinery + row
counts are data); settings Save/Delete buttons (byte-identical strings;
`type`/form wrappers are D2 machinery); visitors comboboxes (class-identical;
`aria-controls` is a Radix content-mount artifact, `aria-label` the
documented functional residual); install notice box (state-dependent: the
live's current site is "waiting" → `/5 /20` which the clone's waiting
branch matches byte-for-byte; the receiving branch `/10 /30` is the
R11-pinned string); install copy buttons (class-identical; aria-label
functional); the 4 plan-card CTA server-action forms (D2, button strings
byte-identical); the live's add-domain submit `disabled` attr (CSR
validation state, data not structure).

## Parity rulings

- **D1 — the contact-sales CTA becomes a real `<button>`** (DOM parity)
  carrying the live's exact string (variant-free Button + consumer tail),
  and **keeps the mailto behavior** via `onClick` — plan-panel is already
  a client component; the live's CSR button does the same navigation
  client-side. Functional parity preserved, `asChild`/`<a>` dropped.
- **D2 (re-affirmed)** — server-action form machinery stays (plan CTAs,
  settings, domains add-form): the clone's SSR actions render `form` +
  `$ACTION_*` inputs + labeled inputs the live's CSR doesn't need.
- **D3 (new, R17-F4)** — the trend chart keeps `role="img"` + aria-label:
  invisible functional a11y (chart data for screen readers), same class
  as the R16 search-aria ruling. Documented residual, not drift.
- **D4 (re-affirmed)** — lucide 0.525's default `aria-hidden="true"` on
  every icon: unfixable without hand-writing every svg (live's older
  lucide predates it). Chip WRAPPER aria-hidden is removed (F3) — the
  wrapper is clone-authored; the icon's own attribute is lucide's.

## Execution plan (TDD)

1. **RED** — extend `tests/content-parity.test.tsx` with an
   `R17 describe` block: the activity Identified badge string, the
   contact-sales card root/body/subtitle/CTA strings (exact renderToStaticMarkup
   pins), the three chip strings + tag assertions (`<div`, no
   `aria-hidden` on the chip wrappers), and negative pins
   (`hover:opacity-90` absent, `variant outline` classes absent,
   `mailto:` link absent).
2. **GREEN**:
   - `activity-feed.tsx`: Identified badge → `variant="default"` +
     `text-[10px] px-1.5 py-0 gradient-primary text-primary-foreground border-0`
     (the domains-Verified call signature).
   - `plan-panel.tsx`: contact-sales card — `<Card className="border-border bg-card">`
     (twMerge displacement reproduces the live order), CardContent
     `p-6 pt-6 flex flex-col md:flex-row items-center justify-between gap-4`,
     subtitle `text-sm text-muted-foreground mt-0.5`, CTA → variant-free
     `<Button className="border-2 border-primary/30 bg-transparent text-primary
     hover:bg-primary/10 transition-all duration-300 font-semibold h-10 px-4
     py-2 shrink-0" onClick={mailto}>Contact Sales</Button>`.
   - `platform-instructions.tsx` (2 sites) + `install/page.tsx` (1 site):
     chips → `<div className="h-8 w-8 rounded-lg bg-muted flex items-center
     justify-center">` / `<div className="h-6 w-6 rounded-full bg-primary/10
     flex items-center justify-center text-xs font-bold text-primary
     shrink-0 mt-0.5">`, wrapper aria-hidden dropped.
3. **Gate** — lint + typecheck + full suite + build; browser re-diff of the
   three pages against the R17 captures (expected: only D2/D4/aria
   residuals + data rows remain).
4. **Docs** — PAD v1.16 revision block + §5.3/§9 notes; README test count;
   AGENTS.md R17 fact (badge generations: activity Identified = new-gen);
   CLAUDE.md v1.16 principle line; worklog R17 entry; session_14.md;
   evidence README.
5. **Ship** — atomic commits on main + wrapper push.

## Plan-vs-codebase validation (done at plan time)

- `activity-feed.tsx:136` confirmed shipping the wrong variant; the
  domains-Verified signature at `domains-panel.tsx:147` is the target.
- `plan-panel.tsx:212-230` confirmed: Card `border-border shadow-sm`,
  flex-first CardContent, `mt-0.5`-first subtitle, outline+asChild+a CTA;
  `'use client'` at line 1 (onClick viable).
- `platform-instructions.tsx:97-102,133-138` + `install/page.tsx:162-167`
  confirmed shipping span/flex-first/aria-hidden chips; the live's exact
  target strings extracted from the R17 captures (PanelsTopLeft/CircleAlert
  icons match on both sides).
- `trend-chart.tsx:27` confirmed carrying role/aria-label (ruling D3: keep).
- No existing pins cover F1/F2/F3 (verified by grep — the R16 gap).

## Execution log (2026-09-19)

- **RED**: 8 failing pins in `tests/content-parity.test.tsx` (R17 F1/F2/F3
  describe blocks + the PlanPanel action mock); 1 superseded shell-parity
  pin (`border-border bg-card` → `border-border shadow-sm` negative).
- **GREEN**:
  - `activity-feed.tsx` — Identified badge → `variant="default"` +
    `text-[10px] px-1.5 py-0 gradient-primary text-primary-foreground
    border-0` (the domains-Verified signature).
  - `plan-panel.tsx` — contact-sales card: `<Card className="border-border
    bg-card">` (twMerge displacement reproduces the live order), body
    `p-6 pt-6 flex flex-col md:flex-row items-center justify-between
    gap-4`, subtitle `text-sm text-muted-foreground mt-0.5`, CTA →
    variant-free Button with the live's full consumer tail + onClick
    mailto (D1).
  - `platform-instructions.tsx` (platform + step chips) +
    `install/page.tsx` (How It Works chip) — bare geometry-first divs,
    wrapper aria-hidden dropped.
- **Gate**: lint ✓, typecheck ✓, **484 tests / 51 files** (+8), build ✓.
- **Browser verification**: activity badge byte-identical; pricing
  contact card diffs eliminated (D2 plan-CTA forms remain); install
  chips gone; activity/settings residual flags proven as tokenizer
  alignment noise (direct extraction byte-identical). E2E: pricing
  switch + $65 annual, Contact Sales renders, selection → Export (1) +
  ids href, settings inputs, install snippet; zero console errors.
- **Responsive spot-checks**: 1024px identical (280/4-col/256);
  768px identical (280/2-col/256, table fits); 375px equivalent
  (both sides overflow — the live's own quirk; documented).
- **Pixel-diff (loaded pages)**: sidebar chrome 0.24% (data-only).
  En-route discovery: the live's pre-hydration shell is DARK —
  screenshot parity requires waiting for `header h1`; the R16 0.00%
  comparison had raced skeletons on both sides (documented in the
  evidence README).
