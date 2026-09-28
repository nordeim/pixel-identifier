# Round 40 — 25th-Generation Drift Watch + Hover-Net E2E Extension

**Date:** 2026-09-28 · **Session:** `docs/session_52.md` (R40 log) · **Status: see Execution log.**

## Context

R39 shipped (`daf5765` + the session-log follow-up `cf36778`,
`docs/session_51.md`): the 24th-generation drift watch, the Tailwind v4
hover-variant/source-scan parity fix (the two `@custom-variant` overrides +
`source("../")` in `globals.css`), and the first 3-spec hover e2e net. The R39
close queued in `docs/session_50.md`:

1. bundle hashes (a change triggers the full token-diff sweep),
2. the R39 pins join the standing regression loop,
3. the TW4 serialization watch (oklab vs rgba — every future computed-style
   pin must self-calibrate or pin the clone's serialization),
4. remaining candidate surfaces — the marketing announcement bar's Claim Now
   hover (the `hover:opacity-80` family — now unguarded, verify visually),
   the dashboard topbar bell/trigger hover states, and a fresh look at the
   e2e hover net (consider a 4th for `data-[state=open]:hover:*` on the
   sidebar's open menu item).

## Verified arrival state (this session, evidence-based)

Pulled `cf36778` (main, clean, synced with origin). Environment intact from
the prior session: `.env` with `DATABASE_URL="file:../db/custom.db"`, `db/`
at the repo root (custom.db seeded), node_modules installed. The stale-shell
`DATABASE_URL` quirk re-confirmed (per-command `env -u DATABASE_URL`
throughout). **Arrival gates all green:** lint 0 · tsc 0 · vitest **765
passed | 2 skipped (78 files)** · `next build` green · the compiled CSS
chunk 82,038 bytes with ZERO `@media (hover:hover)` guards — the exact R39
ship state. The vitest + playwright config files are present and green at
arrival — no config modification required this round.

## 25th probe generation (dual live+clone sessions)

**No redeploy — all four tracked bundle hashes unchanged (15th consecutive
stable generation):** marketing `index-C3AAh5Je.js` + `index-bLMWzsGr.css`,
app `index-nhmKaUsm.js` + `index-MN2Yr0JK.css`. Logged into the live app
with the operator-supplied credentials (dashboard renders "Overview").

**Mobile navs (the standing user emphasis): FULL PARITY both surfaces both
sites — zero drift, the R37/R38/R39 pins hold byte-for-byte.**

- Marketing dropdown @375 (live): toggle `md:hidden text-foreground` +
  `lucide-menu w-6 h-6`, container `md:hidden bg-background border-b
  border-border px-6 py-4 flex flex-col gap-4`, 5 links (4 nav + 1 CTA),
  NO Log In; close-on-VISIBLE-link-click + icon reset + scroll (live 5307 /
  clone 5287 — the live's own feed-widget scroll moved 80 px since R39's
  5227 with no bundle change: data-driven non-finding, the documented 20 px
  D5 delta unchanged) — both sides verified.
- Dashboard Sheet @375 (both sides): the dialog class (un-truncated head),
  the overlay `fixed inset-0 z-50 bg-black/80 … fade-out-0 … fade-in-0`,
  the hidden close X (`display: none`, legacy `absolute right-4 top-4
  rounded-sm …` head), headings 0, links 7, the lean inner root
  (`div.flex h-full w-full flex-col`), `data-sidebar="sidebar"` +
  `data-mobile="true"`, close-on-nav — byte-identical.
- 768 px boundary (both sides): at 768 the desktop rail renders (`display:
  block`) and the topbar trigger stays visible; at 767 the live
  CSR-unmounts the rail while the clone keeps it CSS-hidden (`display:
  none`) — the documented SSR-required divergence, visually identical.

## R39-queued candidates

1. **Claim Now hover (the `hover:opacity-80` family) — PARITY, now
   runtime-verified on BOTH sides.** The live's announcement-bar "Claim
   Now" anchor (class `inline-flex items-center gap-1 font-semibold
   underline underline-offset-2 hover:opacity-80 transition-opacity` —
   byte-identical on the clone) flips computed opacity `1 → 0.8` on hover
   in the same headless session on BOTH sites (sampled after the settle);
   its dismiss X (`hover:opacity-70`, no transition on the live) flips
   `1 → 0.7` on BOTH. The R39 fix holds for the opacity family — the R23
   class-string pins are now runtime-verified.
2. **Dashboard topbar bell/trigger hover states — PARITY on both
   sides.** Both ride the Button primitive's ghost variant
   (`hover:bg-accent hover:text-accent-foreground`): baseline
   `rgba(0, 0, 0, 0)` bg → hovered `rgb(43, 212, 189)` (the teal
   `--accent` data accent), color stays `rgb(19, 21, 32)`
   (accent-foreground == the navy foreground), sampled after the
   transition-colors settle — byte-identical both sites.
3. **A 4th e2e spec for `data-[state=open]:hover:*` — NON-FINDING
   (structurally latent).** The live's 7 sidebar menu buttons carry NO
   `data-state` attribute (all null — the clone's are identical; this
   sidebar has no submenus, so `data-state=open` never occurs at runtime).
   The composed pair (`data-[state=open]:hover:bg-sidebar-accent` /
   `:text-sidebar-accent-foreground`) ships in the peer/menu-button class
   STRING on both sides and the clone's compiled CSS resolves it
   UNGUARDED (verified in the chunk: `…[data-state=open]:hover{…}` with 0
   hover guards) — but no runtime surface exists to pin. The R36 sort-glyph
   precedent: document, do not invent a spec.
4. **Extended hover sweep (never-runtime-probed surfaces) — ALL PARITY.**
   The sidebar-footer sign-out button (`hover:text-foreground
   transition-colors`) flips `rgb(107, 114, 128) → rgb(19, 21, 32)` on
   both sides; the visitors topbar Export button (gradient,
   `hover:opacity-90 transition-all duration-300`) flips `1 → 0.9` on
   both sides (sampled after the 300 ms settle). Zero drift across every
   hover family probed: opacity (80/70/90), ghost-accent bg,
   text-foreground color, gradient — both bundles (marketing + app).

**Console sweep (clone, 10 routes):** clean — the only entries are the two
Radix titleless-dialog a11y warnings (`DialogContent requires a
DialogTitle…` / `Missing Description…`), which the LIVE emits too when its
own mobile Sheet opens (verified this generation) — the documented R37
byte-parity artifact (the live's dialog ships no title element), not drift.

**ZERO code drift in the 25th generation.** The round's deliverable is
COVERAGE (the R34/R35/R36/R38 pattern): the hover surfaces verified at
parity this round exist nowhere in the e2e net — pin them.

## Remediation plan

| # | Change | Files | Gate |
|---|---|---|---|
| G1 | **Extend `e2e/hover.spec.ts` with 4 new specs (the TDD anchors — each surface was runtime-verified at parity against the live THIS round; the specs pin the live's own computed values):** (1) the announcement-bar Claim Now anchor — baseline opacity `1` → hovered `0.8` after the transition-opacity settle; (2) the topbar bell button — baseline bg `rgba(0, 0, 0, 0)` → hovered `rgb(43, 212, 189)` (the teal accent, live-probed; transition-colors settle); (3) the visitors topbar Export All button — baseline opacity `1` → hovered `0.9` (the gradient family; `transition-all duration-300` settle); (4) the sidebar-footer sign-out button — baseline color `rgb(107, 114, 128)` → hovered `rgb(19, 21, 32)`. Each spec asserts its pre-hover baseline so the FLIP is the assertion (the R39 house pattern) | `e2e/hover.spec.ts` | e2e |
| G2 | **TDD RED validation (the R39 discipline — prove the new pins actually pin the fix):** temporarily comment the two `@custom-variant` lines in `globals.css` → `build:standalone` → run the 4 new specs → expect ALL RED (the guarded CSS never applies the utilities in headless) → restore the fix verbatim → rebuild → GREEN. The R39 trio runs RED in the same pass (regression companion) | `src/app/globals.css` (temporarily, restored) | e2e RED→GREEN |
| G3 | **Docs:** PAD v1.38 (revision block + §8.1 e2e row 60 specs + the R40 non-findings), README (R40 bullet + e2e totals), AGENTS (the R40 fact block), CLAUDE (rounds mirror R40), SKILL.md (Appendix A R40 row + Pre-Ship counts), this plan's execution log, `docs/session_52.md`, both worklogs | the doc set | docs sync |
| F1 | Full gates: lint 0 · tsc 0 · vitest 765 passed \| 2 skipped (unchanged) · `env -u DATABASE_URL npm run build` + `build:standalone` green · the compiled CSS keeps ZERO `@media (hover:hover)` guards + 82 KB (grep gate) | — | verify + grep |
| F2 | **e2e 60/60 chromium, run TWICE consecutively** (56 + 4), each a fresh boot + site key | — | e2e |
| F3 | 6 captures `docs/screenshots/r40-*` off the dev server (the Claim Now link pre-hover + hovered with the 80 % opacity; the bell hovered with the teal accent bg; the Export button hovered; the sign-out hovered; the mobile dropdown @375 open) — VLM-verified | `docs/screenshots/` | verified |
| F4 | `.env.example` re-verified against `.env` + `db-path.ts` + `with-db-url.mjs` (3 keys) | `.env.example` | verified |

## Non-findings (documented so future rounds don't re-investigate)

- **The `data-[state=open]:hover:*` family** — structurally latent both
  sides (no submenus; `data-state` always null); the class string ships in
  the DOM and compiles UNGUARDED in the clone's chunk — there is no
  runtime surface to pin (the R36 sort-glyph precedent).
- **The Radix titleless-Sheet console warnings** — emitted by BOTH sites
  when the mobile Sheet opens (the live's own dialog ships no title — the
  R37 byte-parity pin); dev-console noise, not drift.
- **The live's `#benefits` scroll drift** (5227 R39 → 5307 R40, no bundle
  change) — its hero feed widget is a runtime phase machine;
  data-driven, not drift.
- **The 768/767 rail divergence** (live CSR-unmounts, clone CSS-hides) —
  the documented SSR-required D-class (R15/R23/R34), visually identical.

## Execution log

**Phase A — detection (25th generation, dual live+clone).** *(complete —
see the verified findings above: no redeploy, mobile navs full parity, all
four R39-queued candidates closed — two parity confirmations, one non-finding,
one coverage opportunity — plus the extended hover sweep at parity and the
console sweep clean; ZERO code drift.)*

**Phase B — fix + pins (G1+G2).** The 4 new behavioral specs written in
the house style (baseline asserted so the FLIP is the contract; settle
waits past every transition; plain-var values hardpinned — no color-mix,
no oklab watch needed). **The planned G2 RED validation took an
unexpected turn that became the round's key discovery:** with the two
`@custom-variant` overrides temporarily removed, the rebuilt (guarded)
CSS chunk passed ALL 7 behavioral hover specs — because **Playwright
1.63's chromium is a hover-capable engine** (`matchMedia('(hover:
hover)') === true`, verified via a dedicated capability probe; the
re-guarded build's 4 guard blocks include the 54-rule block holding
every app hover utility). Cross-check via agent-browser on the same
guarded server: `hoverCapable: false` and the blog card's h2 does NOT
flip — the guard is real, but invisible to the Playwright engine.
Reconstructing the TRUE R39 pre-fix state (no overrides AND no
`source("../")` anchor) reproduced the R39 record exactly (5 guard
blocks, 175,857-byte chunk, all 3 R39 specs RED) — but the actual
failure values reveal the R39 "RED pre-fix" was driven by the unanchored
source scan's UTILITY CORRUPTION, not the guard: the footer anchor
rendered default link blue (`rgb(0, 0, 238)` — `text-muted-foreground`
lost), a far bigger break than the hover flip. **Conclusion:** the
behavioral e2e net cannot pin the guard contract in ANY
hover-capable chromium — so the round added the 5th spec, **the CSS-byte
guard contract** (fetch the served stylesheets; assert ZERO
`@media (hover:hover)` blocks + the six plain `:hover`/
`:is(:where(.group):hover *)` selector forms). TDD validation: the
CSS-byte spec ran RED against the deliberately re-guarded build
("Expected length: 0, Received length: 4") and GREEN on the restored
ship build (all 8 hover specs green). Also documented from the lib
source: TW 4.3.3's built-in hover variant IS guarded
(`@media (hover: hover) { &:hover }` — tailwindcss dist/lib.mjs), so
BOTH `@custom-variant` overrides are operative (an earlier line-count
artifact had suggested plain hover was unguarded by default — it is
not). One ops lesson: a leftover server on :3100 (from a manual probe
boot) + `reuseExistingServer: true` served a stale mixed build and
failed all 8 specs spuriously — kill the port before diagnosing
"mysterious" full-suite failures.

**Phase C — gates + screenshots + docs (F1-F4 + G3).** Full gates:
lint 0 · tsc 0 · vitest **765 passed | 2 skipped (78 files)**
(unchanged) · build + standalone green · the compiled CSS keeps
**82,038 bytes / 0 guards / 51 hover selectors** · **e2e 61/61
chromium TWICE consecutive** (56 + 5). 6 captures
`docs/screenshots/r40-*`: the bell hover (VLM: "solid teal/mint green
circular background" — YES), the sign-out hover (VLM: dark navy — YES),
the mobile dropdown @375 (VLM: full structure — YES), the Claim Now
resting + hovered pair and the Export hover (the 20 %/10 % opacity
dimmings are below the VLM's perception floor on small text over
gradients — verified instead by computed-state-at-capture — opacity
0.8 / 0.9 with `matches(':hover')` true — plus pixel-diffs: 469 changed
pixels in the Claim Now region, 90.9 % of the Export button region
dimmed; the honest record notes the VLM limit). `.env.example`
re-verified (3 keys, `file:../db/custom.db`, consistent with
`db-path.ts` + `with-db-url.mjs`). Doc sync: PAD v1.38 (revision block
+ the two 56→61 e2e rows), README (R40 bullet + totals 61), AGENTS (the
R40 fact block), CLAUDE (rounds mirror R40), SKILL.md (Appendix A R40
row + Appendix D + Pre-Ship 61/61 + the R40 final-gate block), this
execution log, `docs/session_52.md`, both worklogs.

**Phase D — ship.** *(to be filled during execution)*
