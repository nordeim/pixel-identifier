# Session 45 — R36: 21st-Generation Drift Watch + Export-Download/Pricing-Table/Spinner E2E Pins

**Date:** 2026-09-27 · **Repo at arrival:** `44f5a6e` (main, clean, synced
with origin — a `git pull`; the delta from the R35 close was this round's
`docs/session_44.md` only) · **Repo at close:** see the final commit
(main, pushed via the SSH wrapper).

## Arrival assessment (evidence-based)

`git pull` → `44f5a6e`; the five root docs + session_43/44, the R35
plan, and both worklogs reviewed; understanding cross-validated against
the tree (skills/ excluded from checking/testing/compiling). Environment
intact per the documented contract: `.env` with
`DATABASE_URL="file:../db/custom.db"` (NEXTAUTH_SECRET intact), `db/`
pushed + seeded at the repo root, node_modules installed. The
stale-shell `DATABASE_URL` quirk re-confirmed (per-command
`env -u DATABASE_URL` overrides applied throughout, incl.
`build:standalone`). **Arrival gates all green:** lint 0 · tsc 0 ·
vitest **742 passed | 2 skipped (75 files)** · `build:standalone` green
(the static-asset copy verified — the R35 lesson held) · **e2e 44/44
run at arrival AND a second consecutive 44/44 during the probe phase**
— the R35 ship state confirmed twice, each a fresh boot + site key.

## Phase A — 21st probe generation (dual live+clone sessions)

**No redeploy — all three tracked bundle hashes unchanged (11th
consecutive stable generation):** marketing `index-C3AAh5Je.js` +
`bLMWzsGr.css`, app `index-nhmKaUsm.js`. Logged into the live app with
the operator-supplied credentials (dashboard renders "Overview" — KPIs
4 visitors / 3 identified / 0 this week / 2 domains, matching the R35
capture and the reference image).

**Mobile navs (the standing user emphasis): FULL PARITY both surfaces,
both sites, both breakpoints (375 + 768) — zero Tailwind v4
anomalies.** Marketing dropdown @375: toggle `md:hidden text-foreground`
+ `lucide-menu w-6 h-6`, container `md:hidden bg-background border-b
border-border px-6 py-4 flex flex-col gap-4`, 4 plain links + ONE
full-width gradient CTA (button class byte-identical both sides), NO
Log In; close-on-VISIBLE-link click + icon reset (live scroll 5307 /
clone 5287 — the documented 20 px D5 delta). The clone's inner
`<nav class="flex flex-col gap-4" aria-label="Mobile navigation">`
wrapper re-checked — the ruled R21-F7 D5 a11y chrome. Dashboard Sheet
@375: inline `--sidebar-width: 18rem; pointer-events: auto;` → 288 px +
7 links, closes on cross-page nav — both sides (probe note: the visible
Sheet sidebar must be selected past the clone's CSS-hidden desktop
rail, which stays in the DOM below md — the documented R15 approach;
the live's CSR unmounts its rail). At 768 px both surfaces transition
byte-identically both sites (rail `display: flex`, marketing toggle
hidden, desktop links visible — the live's is a DIV inside its
`<nav>`-root header, the clone's a `<nav>` inside `<header>`, the ruled
R21 D5 swap).

**Standing surfaces — ALL CLEAN:** the R30 wrapper (byte-identical
class + inline vars on both dashboards), chart r28 chrome (18 tick
lines + 18 tick texts + 2 axis lines in `hsl(220, 9%, 46%)` both
sites), the r26 POPULAR badge (byte-identical tail both sites), the
r30 settings inputs (bare both sites), the r27 sonner toast
(`Settings saved` driven on BOTH sites this round), and the console
sweep (19 clone routes HTTP 200/307/404 as designed + browser console
clean on landing + dashboard). The five R35 pins joined the standing
loop via the e2e suite (44/44 × 2).

## Phase B — the R35-queued candidates, all closed (zero code drift)

1. **Export CSV download at runtime — LIVE BYTE CAPTURE (first ever) +
   full clone parity.** A `URL.createObjectURL` override on the live's
   visitors page captured the actual download payload: 384 bytes, NO
   BOM, LF-only, NO trailing newline, header `Type,Name,Detail,
   Confidence,Source,Location,First Seen,Last Seen,Status`, unquoted
   commas throughout (`Alibaba (US) Technology Co., Ltd.,,—,IP Lookup,
   Hong Kong, Hong Kong, HK,Sep 15, 2026,11d ago,inactive`), the row
   order following the table's display order — page-scoped both sides
   (each site's CSV matches its OWN table order; the orders differ only
   because the data does). The clone's `/api/export` (authenticated
   fetch) produced the same byte family on its seeded data. Every R21
   pin is now RUNTIME-verified on the live itself. The GAP: no e2e spec
   clicked the button (unit tests cover the route directly; the
   `window.location.assign` flow + the `Export (N)` ids-scoped state
   are browser-only).
2. **Domains verified-untoggle — NON-FINDING.** The live's Verified
   badge is a static `<div>` (the R16 new-gen string,
   `lucide-circle-check-big h-2.5 w-2.5 mr-0.5`) — not clickable, no
   handler, no dialog; byte-identical on both sides. There is NO
   verified-untoggle flow to mirror (documented so future rounds don't
   re-investigate).
3. **Pricing toggle runtime states — FULL PARITY (both states, all four
   cards).** Live monthly (unchecked): Free $0 / Starter $79 / Growth
   $249 / Scale $799; annual (checked): $0 / $65 / $199 / $639; the
   track/thumb classes and the price block classes byte-identical both
   sites. The dashboard cards carry NO "billed monthly/annually"
   sub-line (quota text instead — that sub-line is the marketing
   bundle's R20 feature, re-confirmed). The R26 spec pins only the
   badge + the Growth $249→$199 swap — the full four-card table was
   unpinned.
4. **Activity mid-swap spinner — RUNTIME-VERIFIED on the clone (latent
   on the live, 6 events).** With the R35 60-event fixture re-inserted,
   a requestAnimationFrame sampler caught the window: 2 of 120 frames
   (~33 ms) render the `py-24` spinner + `Loader2 h-5 w-5 animate-spin`
   while the page-2 fetch is in flight — the R22 bundle reading
   confirmed at runtime. The GAP: the spinner markup was pinned NOWHERE
   (the R22 test's docstring mentions it; no assertion covered it).

## Phase C — coverage: 3 pin specs (TDD)

The round's deliverable is COVERAGE (zero code drift — the
R26/R31/R32/R34/R35 lesson):

- **G1** the NEW `e2e/export-download.spec.ts` — clicks `Export All`
  → captures the Playwright download event → asserts the suggested
  filename (`pixelco-visitors-YYYY-MM-DD.csv`), the byte contract (LF,
  no BOM, no trailing newline, the 9-column header, the three seeded
  row shapes) → selects jane.doe's row checkbox → the button flips to
  `Export (1)` → the scoped download carries ONLY her row.
- **G2** the 3rd spec in `e2e/pricing.spec.ts` — the full four-card
  price table in both toggle states (monthly $0/$79/$249/$799 → annual
  $0/$65/$199/$639) + the `data-state` unchecked→checked flip.
- **G3** 3 new assertions in `tests/activity-r22-parity.test.tsx` —
  the spinner source pin (the container + icon classes, the
  loading-ternary guard order, the never-in-SSR rule).

All green on the first isolated run (4/4 in 9.2 s). Full-suite e2e
after the standalone rebuild: **46/46 GREEN, then 46/46 again — twice
consecutive, each a fresh server boot + site key.** Full verify gate:
lint 0 · tsc 0 · vitest **745 passed | 2 skipped** (742 + 3) · build +
standalone green.

## Phase D — gates, screenshots, docs, ship

**Gates: lint 0 · tsc 0 · vitest 745 passed | 2 skipped (75 files) ·
build + standalone green · 46/46 e2e chromium × 2 consecutive.** 6
VLM-verified captures `docs/screenshots/r36-*` (the Export All button;
the jane.doe-selected `Export (1)` state with the "1 selected"
indicator; the downloaded CSV rendered as a text overlay — the
unquoted `San Francisco, CA, US` location commas visible; the pricing
monthly + annual states — the annual capture proving the table via its
$65/$199/$639 prices; and the mid-swap spinner via
`scripts/r36-spinner-shot.mjs`, a Playwright route-delay helper holding
`/api/activity` 1.2 s so the py-24 spinner is deterministically on
screen — the fixture cleaned both ends; the capture confirms the list
REPLACED by the spinner, footer included). `.env.example` re-verified
(3 keys, unchanged). Full doc sync: README (R36 bullet + totals
745/46), AGENTS (the R36 facts), CLAUDE (the rounds mirror R36), PAD
v1.34 (revision block, §8.1 e2e row 15 files/46 specs, the totals
paragraph), SKILL.md (frontmatter, gate counts, Appendix A/D rows,
the R36 final-gate note, Quick Reference), the R36 plan's execution
log, this session log, `docs/worklog.md` + the root `worklog.md`
mirror. Committed to main; pushed via `docs/ssh_git_wrapper_v3.py
--remote git@github.com:nordeim/pixel-identifier.git`; remote ref
verified == local HEAD; operator key shredded after push.

## Next (R37 candidates)

Bundle hashes (a change triggers the full token-diff sweep); the three
new pins join the standing regression loop; remaining candidate
surfaces: the bell notification panel (if any interaction exists
beyond the dot), the visitors table's sort-glyph behavior (the
ArrowUpDown icon suggests a click flow — probe whether the live's
sorts work), the marketing compare table's runtime states @375, and
the dashboard's usage-progress bar semantics against the live's
"3 of 100" banner.
