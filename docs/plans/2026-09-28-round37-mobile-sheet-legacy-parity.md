# Round 37 — 22nd-Generation Drift Watch + Mobile-Sheet Legacy-Generation Parity Fix

**Date:** 2026-09-28 · **Session:** `docs/session_46.md` (R37 log) · **Status: see Execution log.**

## Context

R36 shipped clean (`ab49b92`, session log `2bb478f`): the 21st-generation drift
watch, the export-download/pricing-table/spinner e2e pins (46/46 × 2). The R36
watch list queued in `docs/session_45.md`:

1. bundle hashes (a change triggers the full token-diff sweep),
2. the three R36 pins join the standing regression loop,
3. remaining candidate surfaces — the bell notification panel (if any
   interaction exists beyond the dot), the visitors table's sort-glyph
   behavior (the ArrowUpDown icon suggests a click flow), the marketing
   compare table's runtime states @375, and the dashboard's usage-progress
   bar semantics against the live's "3 of 100" banner.

## Verified arrival state (this session, evidence-based)

Fresh clone at `2bb478f` (main, clean, synced with origin). Environment
rebuilt per the documented contract: `.env` with
`DATABASE_URL="file:../db/custom.db"` (fresh NEXTAUTH_SECRET), `db/` created
at the repo root, `db:push` + `db:seed` green (demo@pixelco.local, 5 visitors
· 3 identified), node_modules installed. The stale-shell `DATABASE_URL` quirk
re-confirmed (the session shell exports an absolute parent-dir URL — every
gate ran with per-command `env -u DATABASE_URL`). **Arrival gates all green:**
lint 0 · tsc 0 · vitest **745 passed | 2 skipped** · `next build` green — the
exact R36 ship state. The vitest + playwright config files
(`vitest.config.mts`, `playwright.config.ts`) are present and green at
arrival — no config modification was required this round.

## 22nd probe generation (dual live+clone sessions)

**No redeploy — all three tracked bundle hashes unchanged (12th consecutive
stable generation):** marketing `index-C3AAh5Je.js`, app `index-nhmKaUsm.js`
(+ `index-MN2Yr0JK.css`). Logged into the live app with the operator-supplied
credentials (dashboard renders "Overview" — KPIs 4 visitors / 3 identified /
0 this week / 2 domains, matching the R35/R36 captures and the reference
image).

**Mobile navs (the standing user emphasis): the marketing dropdown FULL
PARITY; the dashboard Sheet DRIFT FOUND (R37-F1, five families).**

- Marketing dropdown @375: toggle `md:hidden text-foreground` + `lucide-menu
  w-6 h-6`, container `md:hidden bg-background border-b border-border px-6
  py-4 flex flex-col gap-4`, 4 plain links + ONE full-width gradient CTA, NO
  Log In; close-on-VISIBLE-link click + icon reset (live scroll 5307 / clone
  5287 — the documented 20 px D5 delta). Byte parity holds.
- Dashboard Sheet @375 (both sides probed with the SAME method — trigger
  click, then a full `[role=dialog]` children dump):
  - **F1a the Close X button is VISIBLE on the clone, HIDDEN on the live.**
    The live's SheetContent carries the consumer tail `text-sidebar-foreground
    [&>button]:hidden` which CSS-hides the primitive's close button
    (computed `display: none`); the clone's tail `w-[--sidebar-width]
    bg-sidebar p-0` is missing both fragments, so its X renders
    (`display: block`) next to the logo — VLM-verified in screenshots.
  - **F1b the sheet primitive ships the WRONG shadcn generation.** The
    clone's `ui/sheet.tsx` is the NEW generation (data-slot attrs, content
    base `… fixed z-50 flex flex-col gap-4 …`, close `absolute top-4 right-4
    rounded-xs … focus:outline-hidden` + `size-4` icon); the live's is the
    LEGACY generation — content base `fixed z-50 gap-4 shadow-lg
    transition ease-in-out` (NO `flex flex-col`, anims AFTER the base,
    `bg-background p-6` displaced by the consumer tail), close `absolute
    right-4 top-4 rounded-sm … focus:outline-none` + `h-4 w-4` icon, and NO
    data-slot attrs on the dialog (attr list: role, id, aria-describedby,
    aria-labelledby, data-state, class, data-sidebar, data-mobile, tabindex,
    style).
  - **F1c the overlay is the WRONG darkness.** Live overlay: `fixed inset-0
    z-50 bg-black/80 [fade anims]` (computed rgba(0,0,0,0.8)); clone:
    `[fade anims] fixed inset-0 z-50 bg-black/50` (0.5) — visibly lighter,
    VLM-observed ("dark grey overlay" vs "lighter grey").
  - **F1d the mobile Sheet's inner wrapper is the DESKTOP wrapper.** The
    live's dialog content tree starts at a LEAN `div.flex h-full w-full
    flex-col` (class-only, NO data-sidebar attr); the clone renders the full
    desktop-rail wrapper `div[data-sidebar=sidebar].flex h-full w-full
    flex-col bg-sidebar group-data-[variant=floating]:rounded-lg …` inside
    the Sheet. The desktop rail wrapper itself is byte-identical both sides
    (re-verified) — the divergence is mobile-specific.
  - **F1e the clone ships an sr-only H2 the live does not.** The live's
    dialog has NO title element (its `aria-labelledby` dangles — a
    React-18-Radix artifact); the clone renders `<SheetTitle
    class="text-foreground font-semibold sr-only">Dashboard navigation</SheetTitle>`.
- 768 px boundary: both surfaces transition byte-identically both sites
  (rail `display: flex`, marketing toggle hidden, desktop links visible).

**Why 21 generations missed it:** the R23 pin covers the Sheet's BEHAVIOR
(close-on-nav state wiring) and the audits compared the inline
`--sidebar-width: 18rem`, the 287/288 px width, the 7 links, and close-on-nav
— never the dialog element's own class attribute, the overlay bytes, or the
close button's visibility. The sheet mounts only below md, so the SSR suite
never saw it either.

## R36-queued candidates — all closed (four non-findings)

1. **Bell notification panel — NON-FINDING.** The live's bell button click
   opens NO dialog/dropdown/panel (0 popper elements post-click, both
   viewports); the dot is the entire affordance. The clone's bell is equally
   inert. Parity.
2. **Visitors sort glyph — NON-FINDING.** The live's "Visitor" header carries
   `lucide-arrow-up-down h-3 w-3` decoratively; a click changes NOTHING (row
   order, URL, and icon class all unchanged — click-verified). The clone also
   does not sort. Parity.
3. **Marketing compare table @375 — NON-FINDING (no such surface).** The live
   has no `/compare` route (404, title "Page Not Found | Pixelco") and no
   `<table>` anywhere on the landing (0 tables; ids: how-it-works, benefits,
   pricing, faq only).
4. **Usage-progress banner — PARITY.** The live's usage display is the
   sidebar-footer card only (no banner): `FREE` badge + `3 / 100
   identifications` + the `h-1.5 … bg-muted` track with the
   `h-full rounded-full gradient-primary` fill at `width: 3%;` — the clone's
   block is byte-identical (same text, same classes). Two D-class notes: the
   clone's `role="progressbar"` + aria family is D3-class invisible a11y
   (keep), and the live's trailing `;` in the inline style is a
   builder-serialization artifact React cannot emit (document).

## Remediation plan (TDD)

The 22nd generation found ONE drift cluster — the mobile Sheet (R37-F1), on
the standing user-emphasis surface. The fix restores the live's LEGACY sheet
generation (the same generation discipline as the repo's other UI
primitives — AGENTS: "The UI primitives are LEGACY shadcn … the SSR tests pin
the rendered strings") and the mobile-lean inner wrapper. Every change is
pinned test-first; the pins assert the live-verified bytes above.

| # | Change | Files | Gate |
|---|---|---|---|
| G1 | **Rewrite the sheet primitive to the live's LEGACY generation** (RED first): overlay `fixed inset-0 z-50 bg-black/80 [fade anims]`; content base `fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out [anims] [durations]` (no `flex flex-col`); side=left `inset-y-0 left-0 h-full w-3/4 border-r [slides] sm:max-w-sm` (+ right/top/bottom legacy variants); close `absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity data-[state=open]:bg-secondary hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none` with the `h-4 w-4` X; NO data-slot attrs anywhere; legacy Title/Description strings (the visitors row-detail value-add consumer keeps working) | `src/components/ui/sheet.tsx` | vitest |
| G2 | **The topbar consumer tail + the lean mobile inner:** SheetContent className → `w-[--sidebar-width] bg-sidebar p-0 text-sidebar-foreground [&>button]:hidden`; REMOVE the sr-only SheetTitle (the live ships no title); SidebarNav grows a mobile mode whose root is the lean `div.flex h-full w-full flex-col` (no data-sidebar, no bg-sidebar/group-data classes) — the desktop wrapper stays byte-identical | `src/components/dashboard/topbar.tsx`, `src/components/dashboard/sidebar-nav.tsx` | vitest |
| G3 | **Pin the fix (characterization net):** NEW `tests/sheet-r37-parity.test.tsx` — source pins for the legacy overlay/content/close bytes, no-data-slot, the consumer tail, the titleless dialog, the lean mobile inner, and the unchanged desktop wrapper; EXTEND `e2e/dashboard.spec.ts` (+2 specs): the open sheet's close button is display:none with the 0.8 overlay, and the dialog carries `data-sidebar=sidebar`+`data-mobile=true` with the `[&>button]:hidden` tail around the lean inner | `tests/sheet-r37-parity.test.tsx` (new), `e2e/dashboard.spec.ts` | vitest + e2e |
| F4 | Full gates: lint 0 · tsc 0 · vitest 745+ (745 + the G3 pins) · `env -u DATABASE_URL npm run build` + `build:standalone` green · **e2e 48/48 chromium, run TWICE consecutively** (46 + 2 new), each a fresh boot + site key | — | verify + e2e |
| F5 | 6 captures `docs/screenshots/r37-*` off the dev server (the fixed mobile Sheet @375 — no X, dark overlay; the same sheet mid-nav-link hover; the desktop rail; a standing surface — the R30 wrapper; the usage-progress card; the marketing dropdown) — VLM-verified against the live captures | `docs/screenshots/` | verified |
| F6 | `.env.example` re-verified against `.env` + `db-path.ts` + `with-db-url.mjs` (3 keys) | `.env.example` | verified |
| F7 | Docs sync: README (R37 bullet + totals), AGENTS (the R37 facts), CLAUDE (rounds mirror R37), PAD v1.35 (revision block + §8.1 e2e row + the R37 rows), SKILL.md (frontmatter, counts, Appendix rows), this plan's execution log, `docs/session_46.md`, `docs/worklog.md` + the root `worklog.md` mirror | see Files | docs sync |

## Non-findings (documented so future rounds don't re-investigate)

- **The bell button** — inert on both sides; no panel exists to mirror.
- **The visitors sort glyph** — decorative on the live (no sort flow exists).
- **The marketing compare table** — no such route/surface on the live.
- **The usage-progress banner** — the sidebar-footer card IS the usage
  display; byte parity (the role=progressbar a11y stays D3-class; the live's
  trailing-semicolon style serialization is a builder artifact).
- **The radix ID formats** — live `radix-:r1:` (React 18 useId) vs clone
  `radix-_R_…` (React 19); framework-level, not replicable. Same class as
  the dangling `aria-labelledby`/`aria-describedby` refs on the live's
  titleless dialog.
- **The live's 6 px h-overflow at 375** — unchanged from the R34 ruling.
- **The visitors row-detail Sheet** — the clone's documented D-class
  value-add (the live's rows are inert); the primitive rewrite keeps it
  functional, its classes are not a parity contract.

## Execution log

**Phase A — detection (22nd generation, dual live+clone).** Arrival gates
green (745 vitest | 2 skipped, lint 0, tsc 0, build green); no redeploy (12th
consecutive stable); marketing dropdown + 768 boundary parity; the dashboard
Sheet drift cluster found and fully characterized (F1a–F1e, all five
live-verified with dialog-children dumps on both sides); all four
R36-queued candidates closed as non-findings/parity. The clone dev server
booted on the rebuilt env (db at the repo root) for the comparison probes.

**Phase B — fix + pins (G1–G3).** TDD discipline: the NEW
`tests/sheet-r37-parity.test.tsx` was written FIRST and confirmed RED
(9 failed | 3 passed — the passing three pinned already-correct wiring:
`data-sidebar`/`data-mobile`/the inline 18rem/the R23 close-on-nav state
source). Then the GREEN implementation: `ui/sheet.tsx` rewritten to the
legacy generation (forwardRef + cva, the legacy overlay/content/side/close
strings, `h-4 w-4` X, no data-slot attrs); the topbar consumer tail
extended to `w-[--sidebar-width] bg-sidebar p-0 text-sidebar-foreground
[&>button]:hidden` with the sr-only title REMOVED; `SidebarNav` gained the
`mobile` prop (lean class-only root; desktop wrapper untouched). The pins
went green 12/12 (three self-matching docstring literals in the new source
comments were reworded so the negative assertions bite the CODE, not the
comments; one over-broad `not.toContain('bg-sidebar')` was scoped — the
menu buttons' legit `bg-sidebar-accent` pill matched it). Two e2e specs
added to `e2e/dashboard.spec.ts`: the hidden-close-button spec locates the
X by DOM text (a display:none button is invisible to getByRole — which is
itself asserted) and pins the dialog tail + the overlay's computed
`oklab(0 0 0 / 0.8)` (TW4's serialization of 80% black — same rendered
color as the live's TW3 rgba(0,0,0,0.8), documented in-spec); the lean-tree
spec pins `dialogSb=sidebar`, `innerClass="flex h-full w-full flex-col"`,
`innerSb=null`, `titleCount=0`, `linkCount=7`. Post-fix runtime
verification against the dev server: the dialog class string, the close
button class + `h-4 w-4` svg, and the overlay class are now
BYTE-IDENTICAL to the live captures; close computed display:none;
VLM-verified screenshots (no X visible, overlay darkness identical; the
VLM's recurring "sign-out gold border" observation closed with computed
evidence — `rgb(107, 114, 128)` on BOTH sites, byte-identical SVG).

**Phase C — gates + screenshots + docs (F4/F5/F6/F7).** Full gates:
lint 0 · tsc 0 · vitest **757 passed | 2 skipped (76 files)** (745 + 12)
· `next build` + `build:standalone` green (the verify→standalone ordering
rule respected) · **e2e 48/48 GREEN, then 48/48 again — twice
consecutive**, each a fresh server boot + site key. 6 captures
`docs/screenshots/r37-*` (the fixed mobile Sheet @375 — no X, dark
overlay; the same sheet with the Visitors link focused; the desktop rail;
the visitors page; the settings standing surface; the marketing dropdown
@375) — all VLM-verified (the "N badge" the VLM flags is the capture
tool's cursor overlay, correctly identified as an artifact). `.env.example`
re-verified (3 keys, unchanged, consistent with `.env` + `db-path.ts` +
`with-db-url.mjs`). Full doc sync: README (R37 bullet + totals 757/48),
AGENTS (the R37 fact block), CLAUDE (the rounds mirror R37), PAD v1.35
(revision block + §8.1 e2e row 48 specs + the totals paragraph), SKILL.md
(frontmatter, gate counts, Appendix A/D rows, the R37 final-gate note,
Quick Reference), this plan's execution log, `docs/session_46.md`,
`docs/worklog.md` + the root `worklog.md` mirror.

**Phase D — ship.** Full verify gate green; the staged tree gated before
commit (the R31 lesson); committed to main; pushed via
`docs/ssh_git_wrapper_v3.py` (`--remote
git@github.com:nordeim/pixel-identifier.git`); remote ref verified ==
local HEAD; operator key shredded after push.
