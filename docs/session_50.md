# Session 50 — R39: 24th-Generation Drift Watch + Tailwind v4 Hover-Variant Parity

**Date:** 2026-09-28 · **Repo at arrival:** `3dc79c3` (main, clean, synced
with origin — `git pull` fast-forwarded `ae1f5f0..3dc79c3`, the session_49
log) · **Repo at close:** see the final commit (main, pushed via the SSH
wrapper).

## Arrival assessment (evidence-based)

Pulled to `3dc79c3`; the five root docs (AGENTS, CLAUDE, README, PAD v1.36,
SKILL), `docs/session_48.md`, the canonical `docs/worklog.md`, the R38
plan, and `docs/session_49.md` reviewed; understanding cross-validated
against the tree (skills/ excluded from checking/testing/compilation).
Environment intact from the prior session (`.env` with
`DATABASE_URL="file:../db/custom.db"`, `db/` at the repo root with the
seeded demo account, node_modules installed); the stale-shell
`DATABASE_URL` quirk re-confirmed (per-command `env -u DATABASE_URL`
throughout). **Arrival gates all green:** lint 0 · tsc 0 · vitest
**757 passed | 2 skipped (76 files)** · `next build` green — the exact
R38 ship state. The vitest + playwright config files are present and
green at arrival — no config modification required this round.

## Phase A — 24th probe generation (dual live+clone sessions)

**No redeploy — all four tracked bundle hashes unchanged (14th consecutive
stable generation):** marketing `index-C3AAh5Je.js` + `index-bLMWzsGr.css`,
app `index-nhmKaUsm.js` + `index-MN2Yr0JK.css`. Logged into the live app
with the operator-supplied credentials.

**Mobile navs (the standing user emphasis): FULL PARITY both surfaces both
sites — zero drift, the R37/R38 pins hold byte-for-byte:**

- Marketing dropdown @375 (live): toggle `md:hidden text-foreground` +
  `lucide-menu w-6 h-6`, container `md:hidden bg-background border-b
  border-border px-6 py-4 flex flex-col gap-4`, 4 plain links + ONE
  full-width gradient CTA, NO Log In; close-on-VISIBLE-link click + scroll
  (live 5227 / clone 5287 — the live's own scroll moved 80 px since R38
  with no bundle change: its hero feed widget is a runtime phase machine,
  data-driven non-finding) + icon reset — both sides verified.
- Dashboard Sheet @375 (both sides): the dialog class, the un-truncated
  overlay `… fade-out-0 … fade-in-0`, the hidden close X (`display: none`
  + `h-4 w-4`), titleCount 0, linkCount 7, the lean inner root, the
  `data-sidebar`/`data-mobile` attrs, close-on-nav — byte-identical. One
  apparent clone slow-close was COLD-ROUTE dev-compile latency (the R29
  lesson): the warm-route re-probe closes instantly.
- 768 px boundary: at 768 the desktop rail renders on both sides and the
  topbar trigger stays visible at every viewport (it is the collapse
  toggle — never `md:hidden`); at 767 the live CSR-unmounts the rail
  while the clone keeps it CSS-hidden (the documented SSR-required
  divergence).

## R38-queued candidates

1. **Login `?registered=1`** — the live IGNORES the param (no handler in
   the bundle; runtime render identical). The clone renders an
   "Account created — sign in to continue to your dashboard." banner —
   re-classified as the documented D-class value-add (PAD §11 row +
   `tests/login-registered-r39.test.ts`). **Probe lesson:** the round's
   first probe asserted innerText for 'registered'/'successfully' and
   MISSED the banner; the VLM cross-check on the capture caught it.
2. **Settings password-change flow** — NON-FINDING: the live has NO
   password UI (Profile + Danger Zone only; `hasPassword: false` DOM
   sweep); the clone matches.
3. **Footer social-icon hover states** — **THE ROUND'S DRIFT (R39-F1).**
   Byte-identical class strings on both sides, but the live's hovers
   APPLY in the headless probe (color → rgb(23, 26, 38), border → the
   amber 40 % mix) while the clone's are dead (`matches(':hover')` true,
   utilities never apply).

### R39-F1 root cause — the TW4 hover-variant capability guard

Tailwind v4 compiles every hover-family utility inside a
`@media (hover:hover)` guard (a brace-matched survey of the clone's
pre-fix chunk found 5 blocks: 109 `hover:*` rules, 8 `group-hover:*`, the
sidebar open-state pair, `lg:hover:*`, `[&_a]:hover:*`). The live's TW3
stylesheets contain **zero guards** (51 + 47 plain `:hover` selectors).
Headless chromium (agent-browser AND Playwright — `matchMedia('(hover:
hover)').matches === false` verified in both sessions) and real
touch-primary devices therefore see the live's hovers but not the clone's
— identical class strings, different CSS resolution (the R19
`.gradient-hero` class of miss). This also invalidates R38's "blog card
hover @375 at byte parity" inference (identical classes ⇒ identical
rendering is FALSE under the guard).

### R39-F2 — the TW4 automatic source scan includes skills/

The clone's production CSS chunk was **181,580 bytes vs the live's ~70 KB
per bundle**, carrying utilities that exist ONLY in the committed
`skills/` folder (and docs prose): `hover:scale-105`,
`hover:text-purple-600`, `hover:bg-slate-800`, `hover:text-indigo-300`,
`group-hover:scale-110`, `lg:hover:scale-105`, `hover:bg-gray-50`… none
appear anywhere in `src/` (rg-verified). TW4's automatic detection scans
every non-gitignored repo file — violating the operator's standing
exclusion contract for `skills/` and bloating the shipped CSS ~2.5×.

## Phase B — fix + pins (TDD)

- **The fix (2 lines + comments in `src/app/globals.css`):**
  `@custom-variant hover (&:hover);` +
  `@custom-variant group-hover (&:is(:where(.group):hover *));` (the
  live's unguarded TW3 semantics; composed variants ride the redefined
  hover core) + `@import "tailwindcss" source("../");` (detection
  anchored on `src/`).
- **RED first:** the NEW `e2e/hover.spec.ts` ran RED against the pre-fix
  standalone build (all 3 specs — the utilities never applied in
  headless). The NEW `tests/hover-variant-r39-parity.test.ts` ran RED
  (3 of 5 — the missing overrides/base).
- **GREEN post-fix**, after three spec iterations that are themselves
  lessons: (1) the first sidebar locator hit the ACTIVE menu item (its
  baseline bg is NOT transparent — hover a non-active item); (2) a bare
  hover→evaluate sampled `transition-colors` MID-INTERPOLATION (the
  received rgb(68, 71, 87) was exactly ~65 % of the way from
  rgb(106, 109, 129) to rgb(23, 26, 38) — wait 300 ms for the settle);
  (3) the 40 % border serializes as oklab under TW4's color-mix vs the
  live's TW3 rgba (the R37 precedent — the expectation self-calibrates
  from the browser's own color-mix evaluation). One vitest iteration:
  the guard test's own comment listed the junk class names and tripped
  the guard (reworded).
- **Compiled-CSS verification:** **82,038 bytes (was 181,580 — a 55 %
  cut), ZERO `@media (hover:hover)` guards (was 5), 51 hover selectors,
  every junk family gone.**

## Phase C — gates, screenshots, docs

**Gates: lint 0 · tsc 0 · vitest 765 passed | 2 skipped (78 files)**
(757 + 5 hover/source pins + 3 login-registered pins) · build +
standalone green · **56/56 e2e chromium TWICE consecutive** (53 + 3).
6 VLM-verified captures `docs/screenshots/r39-*` (the footer social row
hovered — amber border confirmed by VLM — and resting; the blog card
group-hover with the amber h2; the sidebar menu button hovered; the
settings page; the login page with `?registered=1` showing the clone's
D-class banner — the capture that caught the C1 mis-probe; one capture
iteration: the first hovered/resting pair was byte-identical because the
mouse-move did not un-hover — re-captured after a fresh reload).
`.env.example` re-verified (3 keys, unchanged, consistent with `.env` +
`db-path.ts` + `with-db-url.mjs`). Full doc sync: PAD v1.37 (revision
block + §5.4 hover ruling + §11 registered-banner row + the stale §8.3 /
§11 e2e rows fixed), README (R39 bullet + totals 765/56), AGENTS (the
R39 fact block), CLAUDE (rounds mirror R39), SKILL.md (§9 TW4-5/TW4-6 +
frontmatter + Appendix A/D rows + the final-gate block + counts), the
plan's execution log, this session log, `docs/worklog.md` + the root
`worklog.md` mirror.

## Phase D — ship

Full verify gate green on the working tree; the change set staged and
gated before commit (the R31 lesson); committed to main; pushed via
`docs/ssh_git_wrapper_v3.py --remote git@github.com:nordeim/pixel-identifier.git`;
remote ref verified == local HEAD; operator key shredded after push.

## Next (R40 candidates)

Bundle hashes (a change triggers the full token-diff sweep); the R39 pins
join the standing regression loop; the TW4 serialization watch (oklab vs
rgba — every future computed-style pin must self-calibrate or pin the
clone's serialization); remaining candidate surfaces: the marketing
announcement bar's Claim Now hover (the `hover:opacity-80` family — now
unguarded, verify visually), the dashboard topbar bell/trigger hover
states, and a fresh look at the e2e hover net (the 3 R39 specs cover the
3 variant families — consider a 4th for `data-[state=open]:hover:*` on
the sidebar's open menu item).
