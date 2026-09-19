# Round-18 Audit Evidence

**Date:** 2026-09-19 · **Repo state at audit:** main @ e77bde8 (PAD v1.16, 484/51)
**Method:** agent-browser DOM extraction (fresh live + local captures per
page), the R17 order-sensitive tokenizer diff, PLUS two new probes:
(1) a full class-string inventory diff of the marketing landing
(token-set-equal/order-different strings isolated from reveal/feed
animation state), (2) **geometry probes** — getBoundingClientRect +
computed styles on the settings Profile card and every auth-form field
group (the first round to measure rendered geometry, not DOM strings).

## Directory layout

- `live-main-dashboard*.html` / `local-main-dashboard*.html` — `<main>`
  innerHTML, all 7 dashboard pages (live logged in via the operator
  account; local standalone build + seeded demo DB)
- `live-landing.html` / `local-landing.html` — landing `<main>` innerHTML
- `live-landing-body.html` — landing `<body>` innerHTML (header + footer
  scope; the live announcement bar lives outside main)
- `live-footer.html` / `local-footer.html` — footer regions
- `live-about|docs.html` (body scope — the live's about/docs have no
  `<main>`) / `local-about|docs.html` (body scope)
- `live-blog.html` / `local-blog.html` / `live-terms.html` /
  `local-terms.html` — `<main>` scope
- `live-shell-sidebar.html` / `local-shell-sidebar.html` — sidebar
  (`[data-sidebar=sidebar]`) outerHTML

## Audit verdict

- **Live-side drift since R17: ZERO** (0 class/tag changes on all 7
  dashboard pages — the third consecutive stable audit).
- **Dashboard clone-side**: only the documented D2/D3/D4/aria residuals +
  data-row counts + the state-dependent install notice — EXCEPT three
  real findings the string diff + geometry probes surfaced:
  - **R18-A1** settings Profile card (geometry: 0px group gaps vs the
    live's 16px — the classless form intercepts space-y-4; the Save
    button 72px high; extra wrapper div; email input missing opacity-60)
  - **R18-A2** auth forms label→input gap 8px deficit (TW4 compiles
    space-y as margin-block-end on the PRECEDING sibling; inline labels
    ignore vertical margins — the live's v3 margin-top on the following
    block input works)
  - **R18-A3** install platform Card aria-labelledby (inert clone chrome)
- **Marketing bundle**: systematically different class-emission orders
  (~15 distinct icon/container strings, 50+ elements) + real drifts:
  pricing subtitle (missing max-w-md mx-auto + `•` vs `·`), comparison
  win checks (text-green-600 vs the live's text-accent + font-medium +
  span pill), benefits chips (gradient-hero-light vs gradient-hero),
  feed avatars (span+class vs div+inline style; gradient vs solid),
  hero CTA structure (flat a vs a>button, extra py-2, order), header
  chrome (max-w-7xl vs container, span vs a wordmark, gap-8 vs gap-7,
  font-script class vs inline Dancing Script), footer wordmark (extra
  tracking-tight + focus-brand rounded-lg), how-it-works grid (gap-12 vs
  gap-14), social-proof items (extra font-medium), building2 double-name.
  None of these atoms were byte-pinned by R10–R12 (the pins covered
  CTAs/kickers/card chrome); the R15–R17 "marketing stable" checks
  compared text-level section lengths, which a class-emission rebuild
  does not move.
- **Sub-pages**: blog + terms CLEAN (0 order drifts); about/docs drift is
  confined to the shared header chrome (B7).
- Non-findings: install notice box (state-dependent, both branches
  pinned), domains/settings button strings (byte-identical, D2
  machinery), visitors comboboxes (class-identical, aria residuals).

## Remediation

Plan: `docs/plans/2026-09-19-round18-marketing-realignment.md` (execution
log inside). Verified post-fix:

- Suite: **519 tests / 52 files** (+35 R18 pins, RED 30 → GREEN; 4
  superseded R10-era pins updated).
- Dashboard tokenizer re-diff: only the documented D2/D3/D4/aria
  residuals + data rows + the state-dependent install notice.
- Landing class-order inventory: **zero order-drifts**; button
  class-string inventory: **zero diffs**; remaining live-only entries are
  reveal-state pairs + the feed-row hook (D5 machinery).
- **Geometry re-probe: the settings Profile card matches the live
  pixel-exactly** (groups 237/325/413, inputs 269/357/445, Save button
  501 — was 429 pre-fix); auth label→input gaps 11px both sides.
- E2E smoke: pricing toggle, plan-intent CTA hrefs, settings render.
