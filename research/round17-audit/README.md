# Round-17 Audit Evidence

**Date:** 2026-09-19 · **Repo state at audit:** main @ b1581d6 (PAD v1.15, 476/51)
**Method:** agent-browser DOM extraction (base64 probes), fresh live +
local captures per page, order-sensitive tokenizer diff (class strings
compared exactly; svg/recharts internals collapsed; `$ACTION_*` inputs
filtered; D4 lucide aria-hidden annotated separately). Additionally, an
R16-vs-R17 live capture diff to isolate live-side changes.

## Directory layout

- `live-main-dashboard*.html` — fresh `<main>` innerHTML from
  app.pixelco.io (logged in, 7 pages)
- `local-main-dashboard*.html` — same from the standalone build
  (localhost:3000, seeded demo DB)
- `live-shell-sidebar.html` — fresh sidebar outerHTML (byte-identical to
  the R16 capture: 14767 chars)

## Audit verdict

- **Live-side drift since R16: ZERO.** Token diff of R16 live captures vs
  R17 live captures: 0 class/tag changes on all 7 dashboard pages. The
  live's content layer is stable (the R16 realignment target holds).
- **Marketing bundle: STABLE.** Landing sections
  [762,403,174,526,708,610,650,814,756,500] + H2=7; docs 437 / about 297 /
  blog 468 / terms 669 / privacy 897 / ccpa 810 / gdpr 881 words (the
  docs/about +69 is the documented no-`<main>` measurement artifact);
  blog slugs 10/10 identical; robots.txt format equal (origin-only);
  favicon.ico md5 `04348f…` byte-identical.
- **Shell: STABLE.** Sidebar byte-identical to R16; per-page headers
  aligned (only the D4 lucide aria-hidden delta; h1 texts match: 5 pages
  topbar h1 + install/settings h1-in-main).
- **Clone-side residuals found by the stricter diff (the R16 verification
  gap): 3 real drifts + 1 a11y ruling** — see
  `docs/plans/2026-09-19-round17-verification-gaps.md` (F1 activity
  Identified badge generation; F2 pricing contact-sales card; F3 install
  chip wrappers; F4 trend-chart a11y chrome — kept per ruling D3).
- **Verified non-drifts:** domains/settings buttons byte-identical
  (Radix/form machinery + row counts only); visitors combobox classes
  identical; install notice box state-dependent (waiting branch matches
  the live byte-for-byte); copy buttons class-identical; the live's
  add-domain `disabled` attr is CSR validation state.

## Remediation verification (post-fix)

- Suite: **484 tests / 51 files** (+8 R17 pins, RED 8 → GREEN 8).
- Per-page structural re-diff: activity Identified badge byte-identical;
  pricing contact-sales card diffs eliminated (only the 4 D2 plan-CTA
  form wrappers remain); install chips gone from the diff (combobox
  aria + notice state remain).
- E2E: pricing switch toggles ($65 annual), Contact Sales button
  renders, visitors selection → Export (1) + ids href, settings Save +
  3 inputs, install snippet — all green, **zero console errors** after
  fresh load.
- Responsive spot-checks (live vs local): **1024px identical**
  (chart 280px, KPI 4-col, sidebar 256px); **768px identical** (chart
  280px, KPI 2-col, sidebar 256px, visitors table fits without scroll);
  **375px equivalent** (KPI 1-col, chart h 280px; BOTH sides' pages
  overflow horizontally — the live's own responsive quirk, reproduced
  by the identical chart/table structure; pixel deltas are recharts
  data internals; clone's desktop rail CSS-hidden vs live's CSR
  unmount — the documented R15 SSR divergence).
- Pixel-diff (loaded pages, 1440×900): **sidebar chrome region 0.24%**
  (data-only: usage bar, avatar initials). Note: the live's pre-hydration
  shell renders dark — screenshots must wait for `header h1` before
  capture (the R16 0.00% screenshot comparison had raced loading
  skeletons on both sides; the loaded-page comparison is the correct
  method and also matches).
