# Round-21 — Functional-Flow & Export Parity Audit + Remediation

**Date:** 2026-09-19 · **Session:** docs/session_18.md (R21) · **Base:** main @ 95604e0
(R20 ship f0aaedc + the user's session_18 log commit) · **Gate at base:** lint ✓
typecheck ✓ 543/54 tests ✓ build ✓

## Scope — four probe generations

1. **Drift watch (6th consecutive)** — R20 toolchain, tokenizer diff of all
   9 live pages vs `/tmp/r20-caps` + the marketing bundle hash watch
   (R20 baseline: `index-C3AAh5Je.js`).
2. **CSV export byte-format probe (NEW, 6th generation)** — the live's
   Export All decoded from its app bundle (`index-nhmKaUsm.js`) as the
   definitive source + runtime confirmation of the button/trigger states.
3. **Visitors-page functional probes (NEW)** — the confidence/source
   filter selects OPENED at runtime (options harvested from the Radix
   portal), row cell patterns re-read from fresh captures.
4. **Responsive/mobile state probes (first ever)** — landing + dashboard
   at 375px/812px and 768px on both sides: header, hero grid, pricing
   grid, sidebar, hamburger trigger, mobile menu dropdown (opened on the
   live and captured).

## Audit evidence

- Drift: **LIVE 100% STABLE — 6th consecutive stable audit.** All 7
  dashboard pages + shell IDENTICAL; the landing's only 7 "changes" are
  one feed row's `done`-unmount timing artifact (R20 captured 5 rows,
  R21 captured 4 — the documented phase machine; the surrounding tokens
  are identical). Marketing bundle hash UNCHANGED
  (`/assets/index-C3AAh5Je.js` still referenced).
- **Live CSV export model (definitive, from the app bundle):**
  - `W()` builds the CSV **client-side** as a Blob (`type:"text/csv"`)
    and clicks a synthetic anchor — NO server route.
  - Header: `Type,Name,Detail,Confidence,Source,Location,First Seen,Last
    Seen,Status` (9 columns).
  - Row template: `${type==="b2b"?"Company":"Individual"},${label},
    ${sublabel},${b2c?confidence+"%":"—"},${b2c?identType:"IP Lookup"},
    ${location||"—"},${firstSeen},${lastSeen},${status}` — raw template
    literals, **no quoting/escaping**, joined with `\n` (**LF**), **no
    BOM**.
  - `firstSeen`: `toLocaleDateString("en-US",{month:"short",day:
    "numeric",year:"numeric"})` → "Sep 19, 2026".
  - `lastSeen`: the RELATIVE formatter `Ry` — "Just now" (<1 min) /
    "N min ago" / "N hr ago" / "Nd ago" (no space, NO weeks branch).
  - `status`: computed at render — `lastSeen > now−36e5` →
    active/inactive (**1-hour** threshold).
  - Scope: `r.size>0 ? D.filter(selected) : D` — the CURRENT TAB's
    CURRENT PAGE (`ni = 20` rows per page), or the selected subset.
  - Filename: `pixelco-visitors-${new Date().toISOString().slice(0,10)}
    .csv` (the clone matches already).
  - b2c row mapping: label = `email || visitor_id.slice(0,12)+"…"`,
    sublabel = site domain, `identType = confidence>=70 && !all_emails ?
    "direct" : "network"`, location `""` → renders "—".
  - b2b row mapping: label = `company_name || "Unknown"`, sublabel =
    company_domain, confidence **null** → "—", source "IP Lookup",
    location = `[city,region,country].filter(Boolean).join(", ")`.
- **Live visitors page model (bundle + runtime):**
  - Page size `ni = 20` (the clone ships 25).
  - Confidence select: `All Confidence / High (85%+) / Medium (70-84%)
    / Low (<70%)` — values high/medium/low; query semantics `gte 85` /
    `gte 70 AND lt 85` / `lt 70` (band filters, not lower bounds). The
    b2b query ignores the confidence filter; b2b confidence is null.
  - Source select: `All Sources / Direct Signups / Network Matches` —
    values direct/network — the IDENTIFICATION source (identType), not
    traffic attribution; the b2b query ignores it.
  - Type-cell badge (b2c): `Direct` → `bg-neon-green/10
    text-neon-green border-neon-green/20`; `Network` →
    `bg-electric-blue/10 text-electric-blue border-electric-blue/20`.
  - Confidence bar fill is 3-TIER: `>=85 → bg-neon-green / >=70 →
    bg-electric-blue / else → bg-hot-pink` (the clone always ships
    neon-green).
  - b2b Confidence-cell: ALWAYS the MapPin flex div + `location || "—"`
    (never a bar, never a bare span).
  - `Ry` relative formatter as above — the table's Last Active cell.
- **Responsive (375px/768px): PARITY — non-finding.** Both sides: hero
  grid 1-col, pricing grid 1-col, same hamburger (x=24, w=28) on the
  dashboard, sidebar identical at 768 (255px at x=0, same
  sidebar/header/content/group tree), the clone's mobile Sheet matches
  the live's trigger behavior (R15-D8). The live's landing has
  `docScrollableX: true` at 375 (its own overflow quirk — never
  replicate).
- **Live mobile menu dropdown (opened + captured):** container
  `md:hidden bg-background border-b border-border px-6 py-4 flex
  flex-col gap-4`; links are PLAIN anchors `text-sm font-medium
  text-muted-foreground` (no rounded/padding/hover-bg classes); content
  = the 4 nav links + ONE full-width CTA (anchor-wrapped button `h-10
  px-4 py-2 gradient-cta … w-full font-semibold`, "Start Identifying")
  — **no Log In button in the dropdown**.
- **Plan-switch flow (bundle):** the live's Get Started opens a Stripe
  **EmbeddedCheckout dialog** (priceId `${plan}_${yearly|monthly}`,
  `create-portal-session` for billing management) — a paid external
  dependency. The clone's direct changePlanAction stays (documented
  intentional divergence, "Honesty over simulation" — never fake a
  payment form).

## Findings

| ID | Severity | Finding | Action |
|----|----------|---------|--------|
| F1 | real (functional/byte) | CSV export format diverges completely: live = 9 live columns, en-US short First Seen, RELATIVE Last Seen, LF, no BOM, no quoting, current-page scope; clone = Email/Type/Company/…, ISO dates, CRLF, BOM, csvCell quoting, all-rows scope | FIX — emit the live's byte format; scope to the current page |
| F2 | real (functional) | Visitors PAGE_SIZE 25 vs the live's `ni = 20` | FIX |
| F3 | real (functional) | Confidence filter: live bands High (85%+)/Medium (70-84%)/Low (<70%) with range semantics; clone lower-bounds 90%+/75%+/50%+ | FIX |
| F4 | real (semantic) | Source model: live = identification type (Direct Signups/Network Matches; badge Direct neon-green / Network electric-blue); clone = traffic attribution (Direct/Search/Social/Referral/Campaign) | FIX — repurpose `source` to identType |
| F5 | real (visual) | Confidence bar fill always neon-green; live is 3-tier (>=85 green / >=70 electric-blue / else hot-pink) | FIX |
| F6 | real (data model) | Company rows store confidence 65-97; the live's b2b confidence is NULL (excluded from confidence filters; "—" in export) | FIX — resolver/seed emit null for b2b |
| F7 | real (visual/mobile) | Landing mobile dropdown: different container classes, richer link styles, extra Log In button; live ships plain links + one w-full CTA, no Log In | FIX — match the live's dropdown |
| F8 | real (structural) | b2b Confidence-cell fallback renders a bare "—" span when city is null (dead branch); the live ALWAYS renders the MapPin div with location/"—" | FIX (fold into F4/F6) |
| F9 | real (text) | relativeTime: "4 d ago" (space) + weeks branch + 45s Just-now boundary; live = "4d ago" (no space), no weeks, <60s "Just now" | FIX — align to `Ry` exactly |
| F10 | real (functional) | isVisitorActive threshold 30 min; the live computes `now−36e5` = 1 HOUR | FIX |
| — | non-findings / intentional | Drift (6th stable); responsive 375/768 (parity); plan-switch Stripe checkout (paid external dependency — clone's direct switch stays, D-class); landing header root `<nav>` vs clone `<header>` + inner nav wrapper (D5 invisible a11y chrome, KEPT); pagination footer (pinned R11); bundle hash unchanged | document only |

## Interpretation rulings (unknowable from the bundle, documented)

- **Confidence bands and null-confidence companies:** the live's b2c
  query applies the band filters; the b2b query ignores them (b2b rows
  carry null confidence). The clone applies the bands to the confidence
  VALUE only — null-confidence companies match no band (Prisma
  comparisons exclude nulls). This mirrors "the filter describes
  identification confidence".
- **Source filter and companies:** the live's b2b query ignores the
  source filter. The clone's source filter keeps company rows via
  `OR type=company` (the filter describes individual identification
  sources; companies are IP-lookup identified by construction).
- **Export scope:** the live exports the current tab's current page.
  The clone reuses the existing ids mechanism — the visitors table
  publishes the current page's row ids to the chrome store; the topbar's
  Export All href becomes ids-scoped (the live's "Export All" means
  all-rows-on-this-page vs the selected subset, NOT the whole account).

## TDD remediation plan

- **RED** `tests/visitors-r21-parity.test.tsx`:
  - F2: PAGE_SIZE 20 pin.
  - F3: the confidence select's exact option strings + values
    (high/medium/low).
  - F4: SOURCE_LABELS = {direct: Direct, network: Network}; source
    select options (All Sources/Direct Signups/Network Matches); the
    Network badge's electric-blue tail; the Direct badge neon-green.
  - F5: the 3-tier bar fill class template.
  - F6: the resolver's company branch emits confidence null; the seed's
    company spec confidence null.
  - F8: the b2b cell ALWAYS renders the MapPin branch.
  - F10: isVisitorActive 60-minute window.
- **RED** `tests/export-r21-parity.test.ts`:
  - F1: header literal; Company/Individual mapping; company Name
    fallback "Unknown"; b2c anonymous label truncation; "—" rules;
    "IP Lookup"; location join/"—"; First Seen en-US short form; Last
    Seen relative ("4d ago"); status computed from lastSeen (1h);
    LF join; NO BOM; NO csvCell quoting; filename pattern; ids-present
    → selection scope (header-only file when the selection is empty);
    ids-absent → full export.
- **RED updates to existing suites:**
  - `tests/format.test.ts` — Ry boundaries (59s "Just now", 60s
    "1 min ago", "N hr ago", "Nd ago" no space, no weeks, ≥45d stays
    "Nd ago").
  - `tests/identification.test.ts` — replace sourceFromReferrer tests
    with identType derivation pins (>=70 direct / <70 network; b2b
    null); the known-visitor regression pin re-checked.
  - `tests/visitors-query.test.ts` — band filter semantics + source
    OR-scope + company-null-confidence behavior.
  - `tests/visitors-selection.test.tsx` — Export All href now
    page-ids-scoped.
  - `tests/export-route.test.ts` — the BOM/RFC4180 expectation
    REPLACED by the live-format pins (the ownership + malformed-ids
    tests stay).
  - `tests/track-route.test.ts` — source storage at identification
    claim.
- **GREEN:**
  - `src/lib/format.ts` — relativeTime = Ry exactly.
  - `src/lib/dashboard-nav.ts` — isVisitorActive 60 min.
  - `src/lib/identification.ts` — company confidence null (RNG draw
    order unchanged); identTypeFor() helper; sourceFromReferrer
    retired.
  - `prisma/seed.ts` + schema comment — source values direct/network;
    company confidence null.
  - `src/app/api/track/route.ts` — the identification claim writes the
    derived source; the create keeps the column default.
  - `src/lib/analytics.ts` — confidenceBand (high/medium/low) replacing
    minConfidence; source OR-scope.
  - `src/app/dashboard/visitors/page.tsx` — PAGE_SIZE 20; confidence
    param bands.
  - `src/components/dashboard/visitors-table.tsx` — selects, badges,
    3-tier bar, MapPin cell, detail-sheet Source label.
  - `src/components/dashboard/chrome-store.ts` — publish the current
    page's visitor ids.
  - `src/components/dashboard/topbar.tsx` — Export All href
    page-ids-scoped.
  - `src/app/api/export/route.ts` — the live's byte format.
  - `src/components/marketing/site-header.tsx` — the live's mobile
    dropdown.
- **Gate**: lint → typecheck → test → build (never weaken a failing gate).

## Verification plan

- Browser probes re-run (export download captured both sides, the
  selects opened both sides, the mobile dropdown rendered both sides).
- VLM visual confirmation of the mobile dropdown + the confidence bars.
- Screenshots → `docs/screenshots/` (r21- prefix).
- E2E console-error sweep on affected pages.

## Risks

- The export's relative Last Seen makes the file content time-dependent
  (the live has the same property — parity by design; tests freeze the
  clock via injected now).
- The source repurpose migrates the column semantics; the dev DB needs
  a re-seed (the seed is idempotent). Existing dev rows keep traffic-
  source values (harmless — the badge falls back to the raw value only
  for unknown labels; a re-seed fixes the demo data).
- The mobile dropdown loses the Log In button (the live ships none) —
  mobile users still reach Log In via the hero CTA → /signup → /login,
  the same funnel the live has.

---

## Execution log (R21)

### Audit phase
- Baseline gate at 95604e0: lint ✓ typecheck ✓ 543/54 ✓ build ✓.
- Drift watch (6th consecutive): **LIVE 100% STABLE** — all 8
  dashboard/shell pages IDENTICAL; the landing's 7 token changes were one
  feed row's `done`-unmount artifact (R20 captured 5 rows, R21 captured 4 —
  the documented phase machine). Marketing bundle hash UNCHANGED
  (`/assets/index-C3AAh5Je.js`).
- Export model decoded from the live's app bundle (`index-nhmKaUsm.js`,
  function W): 9-column header, per-type row templates, en-US short First
  Seen, RELATIVE Last Seen (Ry), 1-hour computed status, LF join, no BOM,
  no quoting, Blob download, current-page scope, `ni = 20` page size.
- Visitors page model decoded: confidence BANDS (high/medium/low with range
  semantics), source = identType (Direct Signups/Network Matches), b2c
  badge Direct/Network with neon-green/electric-blue tails, 3-tier bar
  fill, b2b confidence null, MapPin location cell, 1-hour active window.
- Responsive probes (first ever, 375px/768px): **PARITY** — both sides
  1-col hero/pricing grids, same dashboard hamburger (x=24, w=28), same
  768px sidebar tree (255px), the clone's mobile Sheet matches the live's
  trigger (R15-D8). The live's landing has docScrollableX at 375 (its own
  overflow quirk — never replicate).
- Live mobile dropdown opened + captured: `md:hidden bg-background
  border-b border-border px-6 py-4 flex flex-col gap-4`, plain anchors,
  4 links + one h-10 w-full gradient CTA, NO Log In.
- Plan-switch flow decoded: the live's Get Started opens a Stripe
  EmbeddedCheckout dialog (priceId `${plan}_${yearly|monthly}`) +
  `create-portal-session` billing portal — a paid external dependency.
  Ruled an intentional D-class divergence (the clone's direct
  changePlanAction stays — never fake a payment form).

### TDD remediation
- **RED**: `tests/visitors-r21-parity.test.tsx` (23 pins across F2-F10)
  + `tests/export-r21-parity.test.ts` (6 pins for the byte format). 29
  failing assertions at first run.
- **GREEN**:
  - `format.ts`: relativeTime = the live's Ry byte-for-byte (F9);
    `csvCell` RETIRED (superseded by the live's raw format).
  - `dashboard-nav.ts`: isVisitorActive 1-hour window (F10).
  - `identification.ts`: company confidence null with the RNG draw kept
    (F6); `identTypeFor` helper (F4); `sourceFromReferrer` retired.
  - `seed.ts` + schema comment: sources direct/network/ip-lookup, company
    confidence null.
  - `track/route.ts`: the identification claim writes the derived source;
    the create keeps the column default.
  - `analytics.ts`: `confidenceBand` (gte 85 / 70-84 / lt 70) replacing
    `minConfidence`; source filter OR-scoped to keep companies.
  - `visitors/page.tsx`: PAGE_SIZE 20 (F2); band param values (F3);
    source values direct/network (F4).
  - `visitors-table.tsx`: the live's select options, Direct/Network badge
    tails, 3-tier bar fill, always-MapPin b2b cell, sheet Source label.
  - `chrome-store.ts` + `topbar.tsx`: `pageVisitorIds` published; Export
    All href page-scoped (F1 scope).
  - `export/route.ts`: the live's byte format — 9 columns, per-type
    mapping, en-US/relative dates, computed status, LF, no BOM, no
    quoting; ids-present = selection scope (header-only when empty).
  - `site-header.tsx`: the live's mobile dropdown (F7).
- Legacy tests updated to the new behavior: `export-route` (live format
  + selection-scope), `format` (Ry boundaries, csvCell block removed),
  `identification` (identTypeFor pins replace sourceFromReferrer),
  `visitors-query` (band counts 14/8, source OR-scope),
  `dashboard-chrome` (1-hour window cases).
- **Gate**: lint ✓ · typecheck ✓ · **568 tests / 56 files** (+30 R21 pins,
  −5 retired csvCell tests, −13 replaced legacy assertions) · `next build` ✓.

### Post-fix verification
- V1 visitors: the opened selects show the live's exact options (All
  Confidence / High (85%+) / Medium (70-84%) / Low (<70%); All Sources /
  Direct Signups / Network Matches); rows verify Direct/Company badges,
  bar cells, the company MapPin cell, "1d ago" compact last-active.
- V2 export (in-page fetch): 200, `text/csv; charset=utf-8`, filename
  `pixelco-visitors-2026-09-19.csv`, first bytes "Typ" (no BOM), no CR,
  header + rows in the live's exact template (relative Last Seen,
  computed status, company Detail = the email's domain, "IP Lookup");
  the topbar Export All href carries the current page's 3 row ids.
- V3 mobile dropdown: container classes exact, 4 plain links + the
  full-width CTA, hasLogin=false (VLM-confirmed).
- V4: zero console errors.
- Dev DB re-seeded with the live semantics (the shell-env
  `DATABASE_URL=file:/home/z/my-project/db/custom.db` override was
  identified and both DBs refreshed).
- 5 screenshots in `docs/screenshots/` (r21-*) + 2 VLM confirmations in
  `research/round21-audit/`.
