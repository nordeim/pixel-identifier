# Round 39 — 24th-Generation Drift Watch + Tailwind v4 Hover-Variant Parity

**Date:** 2026-09-28 · **Session:** `docs/session_50.md` (R39 log) · **Status: see Execution log.**

## Context

R38 shipped clean (`ae1f5f0` + the session-log follow-up `3dc79c3`,
`docs/session_49.md`): the 23rd-generation drift watch (zero code drift), the
auth-flow e2e pins (`e2e/auth-flows.spec.ts`, 5 specs → 53/53), and the PAD
v1.36 doc sync. The R38 close queued in `docs/session_48.md`:

1. bundle hashes (a change triggers the full token-diff sweep),
2. the R38 pins join the standing regression loop,
3. the alert-dialog ruling stands (the live renders no alert dialog —
   do not re-investigate),
4. remaining candidate surfaces — the login page's `?registered=1`
   post-signup state, the dashboard settings' password-change flow (if the
   live has one), and the marketing footer's social-icon hover states.

## Verified arrival state (this session, evidence-based)

Pulled `3dc79c3` (main, clean, synced with origin). Environment intact from
the prior session: `.env` with `DATABASE_URL="file:../db/custom.db"`, `db/`
at the repo root (custom.db seeded: demo@pixelco.local, 5 visitors),
node_modules installed. The stale-shell `DATABASE_URL` quirk re-confirmed
(the session shell exports an absolute parent-dir URL — every gate ran with
per-command `env -u DATABASE_URL`). **Arrival gates all green:** lint 0 ·
tsc 0 · vitest **757 passed | 2 skipped (76 files)** · `next build` green —
the exact R38 ship state. The vitest + playwright config files are present
and green at arrival — no config modification is required this round.

## 24th probe generation (dual live+clone sessions)

**No redeploy — all three tracked bundle hashes unchanged (14th consecutive
stable generation):** marketing `index-C3AAh5Je.js` + `index-bLMWzsGr.css`,
app `index-nhmKaUsm.js` + `index-MN2Yr0JK.css`. Logged into the live app
with the operator-supplied credentials (dashboard renders "Overview").

**Mobile navs (the standing user emphasis): FULL PARITY both surfaces both
sites — zero drift, the R37/R38 pins hold byte-for-byte.**

- Marketing dropdown @375 (live): toggle `md:hidden text-foreground` +
  `lucide-menu w-6 h-6`, container `md:hidden bg-background border-b
  border-border px-6 py-4 flex flex-col gap-4`, 4 plain links + ONE
  full-width gradient CTA, NO Log In; close-on-VISIBLE-link-click + icon
  reset + scroll (live 5227 / clone 5287 — the live's own scroll moved
  80 px since R38's 5307 with no bundle change: its hero feed widget is a
  runtime phase machine, data-driven non-finding).
- Dashboard Sheet @375 (both sides, trigger-then-dump): the dialog class
  string, the overlay `fixed inset-0 z-50 bg-black/80 … fade-out-0 …
  fade-in-0` (un-truncated), the close `absolute right-4 top-4 rounded-sm …
  focus:outline-none` + `h-4 w-4` X at computed `display: none`,
  titleCount 0, linkCount 7, the lean inner `flex h-full w-full flex-col`
  with NO data-sidebar attr, `data-sidebar="sidebar"` +
  `data-mobile="true"`, close-on-nav — all byte-identical. The live's
  dangling `aria-describedby`/`aria-labelledby` refs remain the documented
  React-18-Radix artifact (non-replicable). (One apparent clone
  slow-close was dev-server first-compile latency on the cold
  /dashboard/visitors route — the R29 lesson; the warm-route re-probe
  closes instantly.)
- 768 px boundary (both sides): at 768 the desktop rail
  (`group peer hidden text-sidebar-foreground md:block`) renders (block)
  and the topbar trigger stays visible (it is the collapse toggle at every
  viewport — never `md:hidden`); at 767 the live CSR-unmounts the rail
  while the clone keeps it CSS-hidden (the documented SSR-required
  divergence, visually identical).

## R38-queued candidates

1. **Login `?registered=1` post-signup state — the live ignores the
   param; the clone renders an UNDOCUMENTED banner (re-classified
   mid-round, D-class, now documented + pinned).** The live's
   `/login?registered=1` renders the plain login form — no banner, no
   toast, no success copy (runtime-probed; the app bundle's only
   `registered` tokens are WebAuthn/Supabase internals — no
   query-param handler exists). The live's signup can never produce the
   state either (its Supabase flow gates every account behind email
   confirmation — the R22-F11 divergence). The CLONE, however, renders
   an "Account created — sign in to continue to your dashboard."
   banner under `?registered=1` (`src/app/login/page.tsx`) — reached
   ONLY through the clone's auto-signin-failure edge
   (`signup-form.tsx`: account created, client signIn rejected →
   `/login?registered=1`), a state the live's flow cannot reach.
   Ruling: the R22 ContactSupportButton / forgot-password-ack family —
   keep the working behavior, document the divergence (PAD §11), pin
   it (`tests/login-registered-r39.test.ts`). **Probe-methodology
   lesson:** the round's first probe asserted innerText for the strings
   'registered'/'successfully' and MISSED the banner (the copy is
   "Account created —…"); the VLM cross-check on the r39 login capture
   caught it. Never assert state by guessing copy — read the rendered
   DOM or the source.
2. **Dashboard settings password-change flow — NON-FINDING (the live has
   none).** The live's settings page renders exactly two cards: Profile
   (company, website, disabled email + Save Changes) and Danger Zone
   (Delete). No password UI exists anywhere on the page (runtime DOM
   sweep: `hasPassword: false`, headings = Settings/Profile/Danger Zone),
   and the bundle's password tokens are all Supabase client internals.
   The clone's `settings-panel.tsx` renders the same two cards — parity;
   nothing to add.
3. **Marketing footer social-icon hover states — DRIFT FOUND (R39-F1,
   the round's finding).** The live's three social anchors (globe,
   external-link, mail — the R7 pin set) carry `hover:text-foreground
   hover:border-primary/40 transition-colors` — byte-identical class
   strings on the clone. But the RUNTIME hover states diverge: on the
   live, hovering the globe anchor flips its computed color to
   `rgb(23, 26, 38)` and its border to `rgba(255, 191, 0, 0.4)` (probed
   in the same headless session); on the clone the same hover leaves BOTH
   unchanged — `matches(':hover')` is true, the utilities simply never
   apply.

### R39-F1 root cause — Tailwind v4's hover-variant capability guard

Tailwind v4 compiles every hover-family utility inside a
`@media (hover:hover)` capability guard. The clone's production CSS wraps
ALL of them in 5 such blocks (109 `hover:*` rules, 8 `group-hover:*`
rules, the sidebar's `data-[state=open]:hover:*` pair, `lg:hover:*` and
`[&_a]:hover:*` — a brace-matched survey of `.next/static/chunks/*.css`).
The live's TW3-era stylesheets (marketing `index-bLMWzsGr.css` 70 KB, app
`index-MN2Yr0JK.css` 67 KB) contain **zero** `@media (hover:hover)`
guards — 51 + 47 plain `:hover` selectors. In any environment that does
not report a hover-capable primary pointer — headless automation (both
agent-browser and Playwright chromium: `matchMedia('(hover:
hover)').matches === false`, verified) and real touch-primary/hybrid
devices — the live's hovers apply while the clone's are dead. This is the
same class of miss as R19's `.gradient-hero` ruling: identical class
strings, different CSS RESOLUTION — and it silently invalidates the R38
"blog card hover states @375 at byte parity" inference (identical
classes ⇒ identical rendering is FALSE when one side's rules are
media-guarded). Every hover surface in the app is affected: the 29
distinct `hover:*` utilities, the blog cards' `group-hover:*` pair, the
sidebar menu buttons' `hover:bg-sidebar-accent/50`, the article prose's
`[&_a]:hover:underline`, and the sidebar's open-state hover pair.

**The fix (the documented TW4 mechanism — `@custom-variant`, per
`skills/ui-styling/references/tailwind-customization.md`):** redefine the
built-in variants to the live's TW3 semantics in `src/app/globals.css`:

```css
@custom-variant hover (&:hover);
@custom-variant group-hover (&:is(:where(.group):hover *));
```

Post-fix the compiled CSS ships plain `:hover`/`:is(:where(.group):hover *)`
selectors with no capability guard — matching the live's resolution in
EVERY environment. (Composed variants — `data-[state=open]:hover:*`,
`lg:hover:*`, `[&_a]:hover:*` — ride the redefined `hover` core.)

### R39-F2 — the TW4 automatic source scan includes `skills/` (and docs/)

The clone's production CSS chunk is **175,785 bytes vs the live's
~70 KB per bundle** — and it contains utilities that exist ONLY in the
repo's `skills/` folder (and docs prose): `hover:scale-105`,
`hover:text-purple-600`, `hover:bg-slate-800`, `hover:text-indigo-300`,
`group-hover:scale-110`, `lg:hover:scale-105`, `hover:bg-gray-50`… none
of these appear anywhere in `src/` (rg-verified; e.g.
`skills/ui-styling/references/tailwind-responsive.md:262` ships
`<button class="lg:hover:scale-105">`). Tailwind v4's automatic source
detection scans every non-gitignored file in the repo — the `skills/`
folder is committed, so every markdown/template/class-string inside it
generates utilities. This bloats the shipped CSS ~2.5× and violates the
operator's standing contract ("the repo included `skills/` folder is to
be excluded from code checking, testing and compilation").

**The fix (the documented `source()` base-path mechanism):** anchor
automatic detection on `src/`:

```css
@import "tailwindcss" source("../");
```

(from `src/app/globals.css`, `../` = `src/` — every rendered class lives
there: components, `src/data/*` content, the snippet/collector builders).
Post-fix the junk utilities vanish; the remaining CSS is exactly the app
surface (both bundles' worth — the clone is a single deployment). Full
gates + the whole e2e suite verify no needed utility went missing.

## Remediation plan

| # | Change | Files | Gate |
|---|---|---|---|
| G1 | **The hover-variant fix (R39-F1):** redefine `hover` + `group-hover` to the live's unguarded TW3 semantics via `@custom-variant` in globals.css (placed beside the existing `@custom-variant dark` line) | `src/app/globals.css` | G3/G4 |
| G2 | **The source-scan fix (R39-F2):** anchor TW4 automatic detection on `src/` via `@import "tailwindcss" source("../")` — skills/, docs/, research/ no longer feed the compiler (the operator's exclusion contract) | `src/app/globals.css` | G4 |
| G3 | **NEW e2e spec `e2e/hover.spec.ts` (the TDD anchor — the bug is invisible to SSR-string tests by construction, the R23-F8 lesson):** (1) marketing footer social anchor — hover flips computed color to the marketing foreground and border to the amber 40% alpha; (2) blog card — group-hover flips the h2 to primary; (3) dashboard sidebar menu button — hover flips the background to the sidebar accent; each spec also asserts the pre-hover baseline so the flip is the assertion. Runs RED against the pre-fix standalone build, GREEN post-fix | `e2e/hover.spec.ts` | e2e |
| G4 | **Compiled-CSS contract pins (vitest, house source-reading style):** globals.css carries the two `@custom-variant` overrides and the `source("../")` base — plus a repo-hygiene pin that no `src/` file references the junk utility families (the F2 regression guard) | `tests/hover-variant-r39-parity.test.ts` | vitest |
| G4b | **The C1 D-class pins:** the login `?registered=1` banner is gated on the param, carries the account-created copy + role=status, and is produced only by the signup auto-signin-failure edge (the R22-F11 family) — the re-classified candidate, now documented + pinned | `tests/login-registered-r39.test.ts` | vitest |
| G5 | **Docs:** PAD v1.37 (revision block + §5.4/§9 or the TW4 facts — the hover-guard ruling + the source-scan ruling as new non-obvious facts; §8.1 e2e row 56 specs + totals), README (R39 bullet + totals 757+/56), AGENTS (the R39 fact block), CLAUDE (rounds mirror R39), SKILL.md (§9 anti-pattern rows TW4-5/TW4-6 + frontmatter + Appendix D), this plan's execution log, `docs/session_50.md`, both worklogs | the doc set | docs sync |
| F1 | Full gates: lint 0 · tsc 0 · vitest (757 + the G4 pins) · `env -u DATABASE_URL npm run build` + `build:standalone` green · **the compiled CSS ships ZERO `@media (hover:hover)` blocks and NO junk utilities** (grep gate) | — | verify + grep |
| F2 | **e2e 56/56 chromium, run TWICE consecutively** (53 + 3 new), each a fresh boot + site key | — | e2e |
| F3 | 6 captures `docs/screenshots/r39-*` off the dev server (the footer social row pre-hover + hovered with the amber border; the blog card hovered h2; the sidebar menu button hovered; the settings page both cards — the C2 non-finding evidence; the login page with `?registered=1` showing the clone's D-class banner) — VLM-verified | `docs/screenshots/` | verified |
| F4 | `.env.example` re-verified against `.env` + `db-path.ts` + `with-db-url.mjs` (3 keys) | `.env.example` | verified |

## Non-findings (documented so future rounds don't re-investigate)

- **The login `?registered=1` state, live side** — the live ignores the
  param (no handler in the bundle; runtime render identical). The
  clone's banner is the documented D-class value-add (see the candidate
  ruling above + PAD §11).
- **The settings password-change flow** — the live has NO password UI on
  its settings page (Profile + Danger Zone only); the clone matches.
- **The live's own scroll-position drift** (5307 → 5227 on `#benefits`
  with no bundle change) — its hero feed widget is a runtime phase
  machine; data-driven, not drift.
- **The alert-dialog ruling stands** (R37) — the live renders no alert
  dialog anywhere.
- **The clone's `focus-brand` + `aria-label` on the footer social
  anchors** — the live ships neither (ariaLabel: null); both are
  documented D5/D3-class invisible-a11y value-adds (the R22
  contact-support precedent).

## Execution log

**Phase A — detection (24th generation, dual live+clone).** Arrival gates
green (757 vitest | 2 skipped, lint 0, tsc 0, build green); no redeploy
(14th consecutive stable); mobile navs FULL PARITY both surfaces both
sites (dropdown + Sheet + 768 boundary, byte-identical, close-on-click +
close-on-nav verified; one clone slow-close was cold-route dev-compile
latency — warm re-probe instant); all three R38-queued candidates closed:
C1 + C2 non-findings (both sides ignore `?registered=1`; neither side has
a settings password UI), C3 the round's ONE drift family — the TW4
hover-variant capability guard (root-caused at the CSS-resolution level:
5 guard blocks in the clone's build, 0 in the live's stylesheets; the
headless probe reproduces live-applies/clone-dead on the same class
strings) — plus the F2 discovery: the TW4 source scan feeds from
`skills/` (junk utilities in the shipped CSS, 175 KB vs ~70 KB per live
bundle).

**Phase B — fix + pins (G1+G2+G3+G4+G4b).** globals.css edited (the two
`@custom-variant` overrides + the `source("../")` import). TDD: the
NEW `e2e/hover.spec.ts` ran RED against the pre-fix standalone build
(all 3 specs — the utilities never applied in headless), then GREEN
post-fix (2 spec iterations: the first menu-button locator hit the
ACTIVE item's non-transparent baseline → use a non-active item; the
bare hover→evaluate sampled `transition-colors` mid-interpolation —
the received rgb(68, 71, 87) was exactly ~65 % of the way from
rgb(106, 109, 129) to rgb(23, 26, 38) → a 300 ms settle; the 40 %
border serializes as oklab under TW4's color-mix vs the live's TW3
rgba — the R37 precedent — so the expectation self-calibrates from
the browser's own color-mix evaluation). The NEW
`tests/hover-variant-r39-parity.test.ts` (5 pins: the two variant
overrides, the CSS-first placement, the source base, the junk-family
guard — one iteration: the first comment text itself listed the junk
class names and tripped the guard). The NEW
`tests/login-registered-r39.test.ts` (3 pins — the re-classified C1).
Compiled-CSS verification: **82,038 bytes (was 181,580 across two
chunks — a 55 % cut), ZERO `@media (hover:hover)` guards (was 5),
51 hover selectors, every junk family gone** (purple-600, indigo-300,
slate-800, gray-50, scale-105/110).

**Phase C — gates + screenshots + docs (F1-F4 + G5).** Full gates:
lint 0 · tsc 0 · vitest **765 passed | 2 skipped (78 files)** (757 +
5 hover pins + 3 login pins) · build + standalone green · **e2e 56/56
chromium TWICE consecutive** (53 + 3). 6 VLM-verified captures
`docs/screenshots/r39-*` (the VLM pass caught the C1 mis-probe — the
login capture shows the clone's banner, leading to the re-classified
D-class ruling; the footer hovered/resting pair shows the amber hover
working, confirmed by md5 difference + VLM; one capture iteration:
the first hovered/resting pair was byte-identical — the mouse-move
did not un-hover, re-captured after a fresh reload). `.env.example`
re-verified (3 keys, unchanged). Doc sync: PAD v1.37 (revision block
+ §11 registered-banner row + the TW4 facts), README (R39 bullet +
totals), AGENTS (the R39 fact block), CLAUDE (rounds mirror R39),
SKILL.md (§9 TW4-5/TW4-6 + frontmatter + Appendix D), this execution
log, `docs/session_50.md`, both worklogs.

**Phase D — ship.** *(to be filled during execution)*
