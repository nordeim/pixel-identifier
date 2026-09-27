# Session 46 — R37: 22nd-Generation Drift Watch + Mobile-Sheet Legacy-Generation Parity

**Date:** 2026-09-28 · **Repo at arrival:** `2bb478f` (main, clean, synced
with origin — a fresh clone; the prior session's environment had been
reset) · **Repo at close:** see the final commit (main, pushed via the SSH
wrapper).

## Arrival assessment (evidence-based)

Fresh clone of `nordeim/pixel-identifier` at `2bb478f`; the five root docs
(AGENTS, CLAUDE, README, PAD v1.34, SKILL), `docs/session_45.md`,
`docs/session_46.md` (the R36 close summary), the R36 plan, and both
worklogs reviewed; understanding cross-validated against the tree
(skills/ excluded from checking/testing/compiling). Environment rebuilt
per the documented contract: `.env` with
`DATABASE_URL="file:../db/custom.db"` (fresh NEXTAUTH_SECRET), `db/`
created at the repo root, `db:push` + `db:seed` green (demo@pixelco.local,
5 visitors · 3 identified). The stale-shell `DATABASE_URL` quirk
re-confirmed on the first `db:push` (the session shell exports an absolute
parent-dir URL which silently won dotenv precedence — the schema landed
outside the repo; cleaned and re-pushed with per-command
`env -u DATABASE_URL`, then applied throughout, incl. the builds).
**Arrival gates all green:** lint 0 · tsc 0 · vitest **745 passed |
2 skipped (75 files)** · `next build` green — the exact R36 ship state.
The vitest + playwright config files are present and green (no config
modification required this round).

## Phase A — 22nd probe generation (dual live+clone sessions)

**No redeploy — all three tracked bundle hashes unchanged (12th
consecutive stable generation):** marketing `index-C3AAh5Je.js`, app
`index-nhmKaUsm.js` (+ `index-MN2Yr0JK.css`). Logged into the live app
with the operator-supplied credentials (dashboard renders "Overview" —
KPIs 4 visitors / 3 identified / 0 this week / 2 domains — matching the
R35/R36 captures and the reference image).

**Mobile navs (the standing user emphasis): the marketing dropdown FULL
PARITY; the dashboard Sheet DRIFT FOUND — five families (R37-F1), the
first code drift since R33, ON the user-emphasis surface:**

- **F1a the Close X button was VISIBLE on the clone, HIDDEN on the live.**
  The live's SheetContent carries the consumer tail
  `text-sidebar-foreground [&>button]:hidden` which CSS-hides the
  primitive's close button (computed `display: none`); the clone's tail
  lacked both fragments, so its X rendered next to the logo —
  VLM-verified in side-by-side screenshots.
- **F1b the sheet primitive shipped the WRONG shadcn generation.** The
  clone's `ui/sheet.tsx` was the NEW generation (data-slot attrs, content
  base `… fixed z-50 flex flex-col gap-4 …`, close `absolute top-4
  right-4 rounded-xs … focus:outline-hidden` + `size-4` X); the live
  ships the LEGACY generation — content base `fixed z-50 gap-4
  shadow-lg transition ease-in-out …` (NO `flex flex-col`, anims after
  the base, `bg-background p-6` displaced by the consumer through
  tailwind-merge), close `absolute right-4 top-4 rounded-sm …
  focus:outline-none` + `h-4 w-4` X, NO data-slot attrs (the live's
  dialog attr list: role, id, aria-describedby, aria-labelledby,
  data-state, class, data-sidebar, data-mobile, tabindex, style).
- **F1c the overlay was the WRONG darkness.** Live `fixed inset-0 z-50
  bg-black/80 …` (computed rgba(0,0,0,0.8)); clone `bg-black/50` —
  visibly lighter, VLM-observed.
- **F1d the mobile Sheet's inner wrapper duplicated the DESKTOP rail's.**
  The live's dialog tree starts at a LEAN `div.flex h-full w-full
  flex-col` (class-only, no data-sidebar attr); the clone rendered the
  full desktop wrapper `div[data-sidebar=sidebar].flex h-full w-full
  flex-col bg-sidebar group-data-[variant=floating]:…` inside the Sheet.
  The desktop rail wrapper itself re-verified byte-identical both sides —
  the divergence is mobile-specific.
- **F1e the clone shipped an sr-only H2 title the live does not.** The
  live's dialog has NO title element (its `aria-labelledby` dangles — a
  React-18-Radix artifact, D-class); the clone rendered
  `<SheetTitle class="… sr-only">Dashboard navigation</SheetTitle>`.

**Why 21 generations missed it:** the R23 pin covers the Sheet's
BEHAVIOR (close-on-nav state wiring) and the audits compared the inline
`--sidebar-width: 18rem`, the 287/288 px width, the 7 links, and
close-on-nav — never the dialog element's own class attribute, the
overlay bytes, or the close button's visibility. The sheet mounts only
below md, so the SSR suite never saw it. The marketing dropdown @375
and the 768 px boundary were re-verified at full parity (structure,
close-on-visible-link click, icon reset, scroll 5307/5287 — the
documented 20 px D5 delta; rail/toggle/link transitions).

## Phase B — the R36-queued candidates, all closed (four non-findings)

1. **Bell notification panel — NON-FINDING.** The live's bell click
   opens NO dialog/dropdown/panel (0 popper elements post-click); the
   dot is the entire affordance. The clone's bell is equally inert.
2. **Visitors sort glyph — NON-FINDING.** The live's "Visitor" header
   (`lucide-arrow-up-down h-3 w-3`) click changes NOTHING (row order,
   URL, icon class unchanged — click-verified). The clone also does not
   sort.
3. **Marketing compare table @375 — NON-FINDING (no such surface).** No
   `/compare` route (404, "Page Not Found | Pixelco"); zero tables on
   the landing.
4. **Usage-progress banner — PARITY.** The live's usage display is the
   sidebar-footer card only: `FREE` badge + `3 / 100 identifications` +
   the `h-1.5 … bg-muted` track with the `gradient-primary` fill — the
   clone's block byte-identical. D-class notes: the clone's
   `role="progressbar"` stays (D3 invisible a11y); the live's
   trailing-semicolon inline style is a builder serialization artifact.
   Probe side-effect, restored: the delete-flow re-verification removed
   the operator account's `demo-store.example.com` domain (re-added via
   the Add Domain form — now Pending; the Verified state requires the
   live's DNS flow).

## Phase C — the fix + pins (TDD)

- **RED:** `tests/sheet-r37-parity.test.tsx` written first — 12 pins
  (the legacy overlay/content/side/close bytes, no data-slot, the
  consumer tail, the titleless dialog, the lean mobile inner vs the full
  desktop wrapper + the intact nav tree) — confirmed 9 failed | 3
  passed (the passing three pinned already-correct wiring).
- **GREEN:** `ui/sheet.tsx` rewritten to the legacy generation
  (forwardRef + cva; the legacy overlay/content/side/close strings;
  `h-4 w-4` X; no data-slot attrs); the topbar consumer tail extended to
  `w-[--sidebar-width] bg-sidebar p-0 text-sidebar-foreground
  [&>button]:hidden` with the sr-only title removed; `SidebarNav`'s new
  `mobile` prop selects the lean root (desktop wrapper byte-identical,
  re-verified). 12/12 green. (Source-comment literals were reworded so
  the negative assertions bite the code, not the docstrings; one
  over-broad bg-sidebar assertion scoped past the menu buttons' legit
  `bg-sidebar-accent` pill.)
- **Runtime byte-verification:** the fixed clone's dialog class string,
  close-button class + svg, and overlay class are BYTE-IDENTICAL to the
  live captures; close computed display:none; overlay computed
  oklab(0 0 0 / 0.8) — TW4's serialization of 80% black vs the live
  TW3's rgba(0,0,0,0.8), the same rendered color (documented). The VLM's
  recurring "sign-out gold border" observation closed with computed
  evidence: `rgb(107, 114, 128)` on BOTH sites, byte-identical SVG and
  classes.
- **e2e:** 2 new specs in `e2e/dashboard.spec.ts` (the hidden close
  button — located by DOM text because a display:none button is
  invisible to getByRole, which is itself asserted — + the dialog tail +
  the oklab overlay; the lean-tree spec: dialogSb/innerClass/innerSb/
  titleCount 0/linkCount 7).

## Phase D — gates, screenshots, docs, ship

**Gates: lint 0 · tsc 0 · vitest 757 passed | 2 skipped (76 files) ·
build + standalone green · 48/48 e2e chromium TWICE consecutive (each a
fresh server boot + site key).** 6 VLM-verified captures
`docs/screenshots/r37-*` (the fixed mobile Sheet @375 — no X, dark
overlay; the Visitors-link focus state; the desktop rail; the visitors
page; the settings standing surface; the marketing dropdown @375 — the
"N badge" the VLM flags is the capture tool's cursor overlay, an
artifact). `.env.example` re-verified (3 keys, unchanged). Full doc
sync: README (R37 bullet + totals 757/48), AGENTS (the R37 fact block),
CLAUDE (rounds mirror R37), PAD v1.35 (revision block, §8.1 e2e row 48
specs, the totals paragraph), SKILL.md (frontmatter, gate counts,
Appendix A/D rows, the R37 final-gate note, Quick Reference), the plan's
execution log, this session log, `docs/worklog.md` + the root
`worklog.md` mirror. Committed to main; pushed via
`docs/ssh_git_wrapper_v3.py --remote
git@github.com:nordeim/pixel-identifier.git`; remote ref verified ==
local HEAD; operator key shredded after push.

## Next (R38 candidates)

Bundle hashes (a change triggers the full token-diff sweep); the R37
pins join the standing regression loop; the alert-dialog primitive is
the repo's remaining new-generation dialog surface — the live renders NO
alert dialog anywhere (its delete is immediate, R35), so there are no
live bytes to match (documented this round; do not re-investigate).
Remaining candidate surfaces: the pricing page's plan-intent CTA flow
into signup (`?plan=…&cycle=…`), the forgot-password page's runtime
states, and the blog index's card hover states @375.
