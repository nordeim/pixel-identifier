# Round 38 — 23rd-Generation Drift Watch + Auth-Flow E2E Pins (Plan-Intent + Forgot-Password)

**Date:** 2026-09-28 · **Session:** `docs/session_48.md` (R38 log) · **Status: see Execution log.**

## Context

R37 shipped clean (`3b192bd`, session log `4c28dce`): the 22nd-generation
drift watch, the mobile-sheet legacy-generation parity fix (five families),
and 2 new dashboard e2e specs (48/48 × 2). The R37 close queued in
`docs/session_46.md`:

1. bundle hashes (a change triggers the full token-diff sweep),
2. the R37 pins join the standing regression loop,
3. the alert-dialog primitive is ruled unmatched — the live renders NO alert
   dialog anywhere (its delete is immediate, R35), so there are no live bytes
   to match (documented; do not re-investigate),
4. remaining candidate surfaces — the pricing page's plan-intent CTA flow
   into signup (`?plan=…&cycle=…`), the forgot-password page's runtime
   states, and the blog index's card hover states @375.

## Verified arrival state (this session, evidence-based)

Fresh clone at `4c28dce` (main, clean, synced with origin). Environment
rebuilt per the documented contract: `.env` with
`DATABASE_URL="file:../db/custom.db"` (fresh NEXTAUTH_SECRET), `db/` created
at the repo root, `db:push` + `db:seed` green (demo@pixelco.local, 5 visitors
· 3 identified), node_modules installed. The stale-shell `DATABASE_URL` quirk
re-confirmed (the session shell exports an absolute parent-dir URL — every
gate ran with per-command `env -u DATABASE_URL`). **Arrival gates all green:**
lint 0 · tsc 0 · vitest **757 passed | 2 skipped (76 files)** · `next build`
green — the exact R37 ship state. The vitest + playwright config files
(`vitest.config.mts`, `playwright.config.ts`) are present and green at
arrival — no config modification is required this round.

## 23rd probe generation (dual live+clone sessions)

**No redeploy — all three tracked bundle hashes unchanged (13th consecutive
stable generation):** marketing `index-C3AAh5Je.js`, app `index-nhmKaUsm.js`
(+ `index-MN2Yr0JK.css`). Logged into the live app with the operator-supplied
credentials (dashboard renders "Overview" — KPIs unchanged from the R35–R37
captures and the reference image).

**Mobile navs (the standing user emphasis): FULL PARITY both surfaces both
sites both breakpoints — zero drift, the R37 fix holds byte-for-byte.**

- Marketing dropdown @375 (live): toggle `md:hidden text-foreground` +
  `lucide-menu w-6 h-6`, container `md:hidden bg-background border-b
  border-border px-6 py-4 flex flex-col gap-4`, 4 plain links + ONE
  full-width gradient CTA, NO Log In; close-on-VISIBLE-link click + icon
  reset (live scroll 5307 / clone 5287 — the documented 20 px D5 delta,
  re-verified). Byte parity holds.
- Dashboard Sheet @375 (both sides, same trigger-then-dump method): the
  dialog class string, the attr list (live adds the dangling
  `aria-describedby`/`aria-labelledby` refs — the documented React-18-Radix
  artifact, non-replicable), the legacy close class + `h-4 w-4` X at computed
  `display: none`, the overlay `fixed inset-0 z-50 bg-black/80
  data-[state=open]:animate-in data-[state=closed]:animate-out
  data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0` (re-captured
  UN-TRUNCATED this round — the R37 probe's 120-char slice had hidden the
  tail; the clone's overlay is BYTE-IDENTICAL incl. the `-0` fade suffixes;
  computed oklab(0 0 0 / 0.8) = the live's rgba(0,0,0,0.8), the documented
  TW4 serialization), titleCount 0, linkCount 7, the lean inner `flex h-full
  w-full flex-col` with NO data-sidebar attr. Close-on-nav verified both
  sites.
- 768 px boundary (live): the toggle hides, both desktop nav containers
  (`hidden md:flex items-center gap-7` / `gap-3`) flip to flex — as
  documented.

**Zero code drift found in the 23rd generation** — the first watch with no
drift families since R36, and the R37 mobile-sheet fix verified holding on
the standing emphasis surface.

## R37-queued candidates — all three closed

1. **Pricing plan-intent CTA flow — NON-FINDING (documented divergence,
   coverage gap).** The LIVE carries NO plan-intent params anywhere: all 4
   pricing CTAs (Free Tier + 3× Get Started) link to plain
   `https://app.pixelco.io` in BOTH toggle states (DOM-verified), and the
   live app bundle (`index-nhmKaUsm.js`, 1.1 MB grep) contains exactly one
   signup reference — plain `"/signup"` — no `plan=`/`cycle=` tokens at
   all. The clone's flow (free → `/signup`; paid →
   `/signup?plan=${plan.id}&cycle=${cycle}`, default annual, cycle follows
   the toggle) is the documented single-deployment CTA mapping (R13-D3)
   plus the F-28 plan-intent feature — the same "Honesty over simulation"
   D-class family as the Stripe plan-switch ruling (PAD §11: the live's
   dashboard plan-switch opens Stripe EmbeddedCheckout; the clone applies
   plans directly). Runtime-verified end-to-end on the clone this round:
   `/signup?plan=growth&cycle=annual` renders `SignUpForm` with
   `intentPlan:"growth"` / `intentCycle:"annual"` (RSC payload), the form
   carries the hidden `plan`/`cycle` inputs, `signUpAction` honours the
   intent (unit-pinned since F-28: `tests/signup.test.ts` "honours a valid
   plan intent"), and the submit lands on `/dashboard`. NOTHING pins the
   href matrix or the browser-level flow — the SSR pricing test pins the
   CTA styling but not the hrefs; no e2e spec touches the marketing
   pricing CTAs or the signup form. **Action: PAD §11 gets the explicit
   marketing-CTA row (the ruling is implicit in three places today), and a
   new e2e spec pins the flow.**
2. **Forgot-password runtime states — NON-FINDING (documented divergence,
   coverage gap).** The live's `/forgot-password` renders a runtime 404
   ("404 — Oops! Page not found — Return to Home") despite the login page
   linking to it — the documented live defect (PAD §11 R6-H4 row: "the
   live links to /forgot-password but 404s; a dead link would be a defect
   here"). The clone's page works and was runtime-verified this round:
   submitting an unknown email renders the anti-enumeration ack ("If an
   account exists for …, a password reset link has been sent.") plus the
   honest self-hosted email-transport note. NOTHING pins this flow at the
   browser level. **Action: a new e2e spec pins the ack contract (unknown
   AND known email → the identical anti-enumeration ack).**
3. **Blog card hover states @375 — PARITY, non-finding.** The live's blog
   card anchor is `group block h-full rounded-xl border border-border
   bg-card p-6 hover:border-primary/40 hover:shadow-lg transition-all
   duration-300` — byte-identical to the clone's (`src/app/(marketing)/
   blog/page.tsx:42`), and BOTH inner group-hover consumers match
   byte-for-byte: the h2 `text-lg font-semibold text-foreground
   group-hover:text-primary transition-colors mb-2 leading-snug` and the
   Read span `text-sm text-primary font-medium flex items-center gap-1
   group-hover:gap-2 transition-all`. Identical classes compile to
   identical hover states at every viewport — no drift, nothing to pin
   beyond the existing R34 blog pins.

## Remediation plan (pure-coverage round — no production code changes)

The 23rd generation found zero drift; the two candidate flows are documented
divergences whose runtime behavior is correct but UNPINNED. The fix is the
R34 pattern: characterize now, so a future regression cannot slip through
another drift watch. (The vitest/playwright configs are present and green —
no config modification required.)

| # | Change | Files | Gate |
|---|---|---|---|
| G1 | **Pin the marketing pricing CTA href matrix + the signup plan-intent flow end-to-end (NEW spec):** default (annual) state — Free card → plain `/signup`, Starter/Growth/Scale → `/signup?plan=<id>&cycle=annual`; toggle to monthly → the paid hrefs flip `cycle=monthly` (Free stays plain); then `/signup?plan=growth&cycle=annual` renders the hidden `plan`/`cycle` inputs, a unique-email signup submits through `signUpAction`, lands on `/dashboard`, and the sidebar footer shows the plan badge `GROWTH` (the intent survived account creation — the browser-level F-28 pin) | `e2e/auth-flows.spec.ts` (new) | e2e |
| G2 | **Toggle + known-email specs:** the monthly-state href matrix (paid hrefs flip cycle=monthly, Free stays plain, Growth click-through preserves the URL intent) and the forgot-password anti-enumeration contract — unknown email submits → the ack copy ("If an account exists for …, a password reset link has been sent.") + the self-hosted transport note; the SEEDED demo email (known account) → the IDENTICAL ack (enumeration-resistant, the D-class contract the live's 404 cannot offer) | `e2e/auth-flows.spec.ts` | e2e |
| G3 | **Docs:** PAD §11 gains the explicit marketing-pricing-CTA row (live = plain app-root CTAs, no plan params anywhere in the bundle; clone = the F-28 intent flow, the Stripe-replacement D-class family — joins the R6-H4 forgot-password and v1.20 plan-switch rulings); PAD v1.36 revision block; the R38 rows across README/AGENTS/CLAUDE/SKILL + session_48 + both worklogs + this plan's execution log | `Project_Architecture_Document.md` + the doc set | docs sync |
| F4 | Full gates: lint 0 · tsc 0 · vitest 757 | 2 skipped (unchanged — no new unit tests; the pins are browser-level) · `env -u DATABASE_URL npm run build` + `build:standalone` green · **e2e 53/53 chromium, run TWICE consecutively** (48 + 5 new), each a fresh boot + site key | — | verify + e2e |
| F5 | 6 captures `docs/screenshots/r38-*` off the dev server (the marketing pricing section default-annual; the same section toggled monthly; the signup page with growth/annual intent; the created account's dashboard showing the GROWTH badge; the forgot-password ack state; the blog index card grid @375) — VLM-verified | `docs/screenshots/` | verified |
| F6 | `.env.example` re-verified against `.env` + `db-path.ts` + `with-db-url.mjs` (3 keys) | `.env.example` | verified |

## Non-findings (documented so future rounds don't re-investigate)

- **The alert-dialog primitive** — ruled unmatched in R37; the live renders
  no alert dialog anywhere. Do not re-investigate.
- **The blog card hover states @375** — byte parity (anchor + both
  group-hover consumers); identical classes ⇒ identical hover rendering.
- **The live's dangling `aria-describedby`/`aria-labelledby` on the mobile
  Sheet dialog** — the React-18-Radix artifact (clone's React 19 Radix
  omits them on titleless dialogs); framework-level, non-replicable
  (re-confirmed this generation).
- **The R37 probe's overlay-class truncation** — the live overlay's full
  class ends `…fade-out-0 data-[state=open]:fade-in-0` (the R37 session
  captured a 120-char slice that hid the tail); the clone is byte-identical
  — no drift ever existed there.

## Execution log

**Phase A — detection (23rd generation, dual live+clone).** Arrival gates
green (757 vitest | 2 skipped, lint 0, tsc 0, build green); no redeploy
(13th consecutive stable); mobile navs FULL PARITY both surfaces both sites
(overlay re-captured un-truncated — byte-identical); zero code drift; all
three R37-queued candidates closed (two documented divergences with coverage
gaps + one parity non-finding). The clone dev server booted on the rebuilt
env (db at the repo root) for the comparison probes.

**Phase B — pins (G1+G2).** NEW `e2e/auth-flows.spec.ts` (5 specs): (1) the
pricing CTA href matrix (default annual: Free → plain `/signup`,
Starter/Growth/Scale → `?plan=…&cycle=annual`; toggled monthly: paid hrefs
flip `cycle=monthly`, Free stays plain); (2) the signup plan-intent flow
end-to-end (`/signup?plan=growth&cycle=annual` → hidden inputs →
unique-email signup → `/dashboard` → sidebar badge `GROWTH`); (3) the
monthly toggle state href matrix + the Growth click-through (the URL
preserves the intent); (4)+(5) the forgot-password anti-enumeration ack
(unknown + seeded demo email → the identical ack + transport note).
Locator smoke run against the dev server first (its throwaway signup
accounts were cleaned out of `db/custom.db` afterwards): 2 locator
corrections before the spec was final — `getByLabel('Password')` is a
strict-mode violation ('Password' substring-matches 'Confirm Password';
fixed with `exact: true`) and the GROWTH badge lives in
`[data-sidebar="footer"]` (not an `aside`). Post-fix: 5/5 GREEN on the
dev smoke, then GREEN on both formal standalone runs.

**Phase C — gates + screenshots + docs (F4/F5/F6).** Full gates: lint 0 ·
tsc 0 · vitest 757 passed | 2 skipped (unchanged) · build + standalone green
· e2e 53/53 GREEN twice consecutive (fresh boot + site key each run). 6
captures `docs/screenshots/r38-*` VLM-verified. `.env.example` re-verified
(3 keys, unchanged). Doc sync: PAD v1.36 (revision block + the new §11
marketing-CTA row), README (R38 bullet + totals 757/51), AGENTS (R38 facts),
CLAUDE (rounds mirror R38), SKILL.md (frontmatter, counts, Appendix rows),
this execution log, `docs/session_48.md`, `docs/worklog.md` + the root
`worklog.md` mirror.

**Phase D — ship.** Full verify gate green; the staged tree gated before
commit (the R31 lesson); committed to main; pushed via
`docs/ssh_git_wrapper_v3.py` (`--remote
git@github.com:nordeim/pixel-identifier.git`); remote ref verified ==
local HEAD; operator key shredded after push.
