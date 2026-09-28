# Session 48 — R38: 23rd-Generation Drift Watch + Auth-Flow E2E Pins

**Date:** 2026-09-28 · **Repo at arrival:** `4c28dce` (main, clean, synced
with origin — a fresh clone; the prior session's environment had been
reset) · **Repo at close:** see the final commit (main, pushed via the SSH
wrapper).

## Arrival assessment (evidence-based)

Fresh clone of `nordeim/pixel-identifier` at `4c28dce`; the five root docs
(AGENTS, CLAUDE, README, PAD v1.35, SKILL), `docs/session_46.md`, the root
`worklog.md`, the R37 plan, and `docs/session_47.md` reviewed; understanding
cross-validated against the tree (skills/ excluded from
checking/testing/compilation). Environment rebuilt per the documented
contract: `.env` with `DATABASE_URL="file:../db/custom.db"` (fresh
NEXTAUTH_SECRET), `db/` created at the repo root, `db:push` + `db:seed`
green (demo@pixelco.local, 5 visitors · 3 identified), node_modules
installed. The stale-shell `DATABASE_URL` quirk re-confirmed (the session
shell exports an absolute parent-dir URL — every gate and build ran with
per-command `env -u DATABASE_URL`). **Arrival gates all green:** lint 0 ·
tsc 0 · vitest **757 passed | 2 skipped (76 files)** · `next build` green —
the exact R37 ship state. The vitest + playwright config files are present
and green at arrival — no config modification required this round.

## Phase A — 23rd probe generation (dual live+clone sessions)

**No redeploy — all three tracked bundle hashes unchanged (13th consecutive
stable generation):** marketing `index-C3AAh5Je.js`, app `index-nhmKaUsm.js`
(+ `index-MN2Yr0JK.css`). Logged into the live app with the operator-supplied
credentials (dashboard renders "Overview" — KPIs unchanged from the R35–R37
captures).

**Mobile navs (the standing user emphasis): FULL PARITY both surfaces both
sites — the R37 sheet fix verified holding byte-for-byte, ZERO code drift:**

- Marketing dropdown @375 (live): toggle `md:hidden text-foreground` +
  `lucide-menu w-6 h-6`, container `md:hidden bg-background border-b
  border-border px-6 py-4 flex flex-col gap-4`, 4 plain links + ONE
  full-width gradient CTA, NO Log In; close-on-VISIBLE-link click + icon
  reset (live scroll 5307 / clone 5287 — the documented 20 px D5 delta).
- Dashboard Sheet @375 (both sides, same trigger-then-dump method): the
  dialog class string, the legacy close class + `h-4 w-4` X at computed
  `display: none`, titleCount 0, linkCount 7, the lean inner `flex h-full
  w-full flex-col` — all byte-identical. The overlay class re-captured
  UN-TRUNCATED this round: the live's full string ends
  `…data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0` — the R37
  probe's 120-char slice had hidden the tail; **the clone's overlay is
  BYTE-IDENTICAL incl. the `-0` fade suffixes** (no drift ever existed
  there — recorded as a non-finding so future rounds don't re-chase it).
  The live's dangling `aria-describedby`/`aria-labelledby` refs remain the
  documented React-18-Radix artifact (non-replicable). Close-on-nav
  verified both sites.
- 768 px boundary (live): the toggle hides, both desktop nav containers
  (`hidden md:flex items-center gap-7` / `gap-3`) flip to flex — as
  documented.

## R37-queued candidates — all three closed

1. **Pricing plan-intent CTA flow — NON-FINDING (documented divergence,
   coverage gap closed).** The LIVE carries NO plan-intent params: all 4
   pricing CTAs (Free Tier + 3× Get Started) link to plain
   `https://app.pixelco.io` in BOTH toggle states (DOM-verified at 375),
   and the live app bundle (1.1 MB `index-nhmKaUsm.js`) contains exactly
   one signup reference — a bare `"/signup"` — no `plan=`/`cycle=` tokens
   at all. The clone's flow (free → `/signup`; paid →
   `/signup?plan=<id>&cycle=<cycle>`, default annual, cycle follows the
   toggle) is the single-deployment CTA mapping (R13-D3) + the F-28
   feature — the same "Honesty over simulation" D-class family as the
   Stripe plan-switch ruling. Runtime-verified end-to-end on the clone:
   the RSC payload hands `intentPlan:"growth"`/`intentCycle:"annual"` to
   SignUpForm, the hidden inputs ride the form, `signUpAction` honours
   the intent (unit-pinned since F-28), and the created account's sidebar
   badge renders `GROWTH` (0 / 1,500 identifications). **PAD §11 gains
   the explicit row; the new e2e spec pins the whole flow.**
2. **Forgot-password runtime states — NON-FINDING (documented divergence,
   coverage gap closed).** The live's `/forgot-password` renders a runtime
   404 ("404 — Oops! Page not found — Return to Home") despite the login
   page's "Forgot password?" link — the documented R6-H4 live defect. The
   clone's page runtime-verified: unknown email → the anti-enumeration
   ack + the honest self-hosted transport note. **The new e2e spec pins
   the ack contract for unknown AND known (seeded demo) emails.**
3. **Blog card hover states @375 — PARITY, non-finding.** The live's blog
   card anchor `group block h-full rounded-xl border border-border bg-card
   p-6 hover:border-primary/40 hover:shadow-lg transition-all
   duration-300` is byte-identical to the clone's, and BOTH inner
   group-hover consumers (the h2 `group-hover:text-primary transition-
   colors mb-2 leading-snug` and the Read span `group-hover:gap-2
   transition-all`) match byte-for-byte — identical classes ⇒ identical
   hover rendering at every viewport.

## Phase B — the pins (TDD)

NEW `e2e/auth-flows.spec.ts` — 5 specs: the pricing CTA href matrix
(default annual: Free → plain `/signup`, Starter/Growth/Scale →
`?plan=…&cycle=annual`; toggled monthly: the paid hrefs flip
`cycle=monthly`, Free stays plain), the Growth CTA click-through (the URL
preserves the intent), the signup plan-intent flow end-to-end (hidden
`plan`/`cycle` inputs → unique-email signup — unique per run because the
e2e db persists across the twice-consecutive runs while the per-IP throttle
resets on every fresh boot → `/dashboard` → the sidebar footer badge
`GROWTH`), and the forgot-password anti-enumeration ack ×2 (unknown +
seeded demo email → the identical ack + transport note). A dev-server
smoke run caught 2 locator issues before the spec was final (the
`getByLabel('Password')` strict-mode substring violation → `exact: true`;
the GROWTH badge lives in `[data-sidebar="footer"]`, not an `aside`); the
smoke's throwaway accounts were cleaned from `db/custom.db`.

## Phase C — gates, screenshots, docs, ship

**Gates: lint 0 · tsc 0 · vitest 757 passed | 2 skipped (76 files,
unchanged — a pure browser-level coverage round) · build + standalone
green · 53/53 e2e chromium TWICE consecutive (48 + 5, each a fresh server
boot + site key).** 6 VLM-verified captures `docs/screenshots/r38-*` (the
pricing section default-annual $0/$63/$199/$639 with the POPULAR badge;
toggled monthly $0/$79/$249/$799; the signup page with the growth/annual
intent; the created account's dashboard with the GROWTH badge; the
forgot-password ack state; the blog index card grid @375 single-column).
`.env.example` re-verified (3 keys, unchanged, consistent with `.env` +
`db-path.ts` + `with-db-url.mjs`). Full doc sync: PAD v1.36 (revision
block + the new §11 marketing-CTA row + §8.1 e2e row 53 specs + the
totals paragraph), README (R38 bullet + totals 757/53), AGENTS (the R38
fact block), CLAUDE (rounds mirror R38), SKILL.md (frontmatter
project_state, gate counts, Appendix A/D rows, the R38 final-gate note,
Quick Reference), the plan's execution log, this session log,
`docs/worklog.md` + the root `worklog.md` mirror. Committed to main;
pushed via `docs/ssh_git_wrapper_v3.py --remote
git@github.com:nordeim/pixel-identifier.git`; remote ref verified ==
local HEAD; operator key shredded after push.

## Next (R39 candidates)

Bundle hashes (a change triggers the full token-diff sweep); the R38 pins
join the standing regression loop; the alert-dialog ruling stands (the
live renders no alert dialog — do not re-investigate). Remaining candidate
surfaces: the login page's `?registered=1` post-signup state, the
dashboard settings' password-change flow (if the live has one), and the
marketing footer's social-icon hover states.
