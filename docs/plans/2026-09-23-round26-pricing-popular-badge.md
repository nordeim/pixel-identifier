# Round 26 — Pricing POPULAR Badge Remediation

**Date:** 2026-09-23 · **Session:** `docs/session_26.md` · **Verdict: ONE finding (R26-F1) — a real, live-verified drift requiring a code fix**

## Scope

The R25 next-notes defined the R26 watch targets: (a) bundle hashes again —
the only drift signal that matters without a live touch; (b) the NTW badge's
no-branch if live data returned to `lastWeek=0`; (c) a settings-save toast
watch; (d) a full desktop token-diff if any hash moved. Plus the standing
user emphasis: the mobile navigation menu, the Tailwind CSS v4 bug watch,
the DB seam (`.env` `DATABASE_URL="file:../db/custom.db"` → repo `db/`),
the vitest + Playwright suites, and the repo-round discipline (gates,
screenshots, docs, push).

## Probe protocol (11th probe generation — live verified 2026-09-23)

Probe account `sepnetflix2023@outlook.com`; agent-browser (dual sessions —
live + clone); 1280×900 desktop + 375×812 mobile viewports; settled-DOM
captures; VLM screenshot comparisons; visibility-filtered click targets
(the R25 probe-artifact lesson).

### 1. Bundle hashes — NO REDEPLOY

| Bundle | R25 baseline | R26 live | Verdict |
|---|---|---|---|
| Marketing JS | `assets/index-C3AAh5Je.js` | `index-C3AAh5Je.js` | unchanged |
| Marketing CSS | `assets/index-bLMWzsGr.css` | `index-bLMWzsGr.css` | unchanged |
| App JS | `assets/index-nhmKaUsm.js` | `index-nhmKaUsm.js` | unchanged |
| App lucide version | `lucide-react v0.462.0` | `v0.462.0` | unchanged |

No redeploy → the R24 token-diff divergence inventory remains the system of
record. The sweep therefore re-verified the surfaces most sensitive to
data-driven state changes, the mobile navigations (standing emphasis), and —
new this round — a full dashboard-page DOM walk that went beyond the R25
target list.

### 2. Standing targets re-verified (all CLEAN)

- **Mobile navigation (standing user emphasis), both surfaces, both sites:**
  - Marketing dropdown @375 px: container bytes (`md:hidden bg-background
    border-b border-border px-6 py-4 flex flex-col gap-4`), 4 plain links
    (`text-sm font-medium text-muted-foreground` + the clone's documented
    D5 `focus-brand` chrome), full-width Start Identifying CTA, toggle
    `lucide-menu`/`lucide-x` at `w-6 h-6` (the R23-F4 pin), and
    close-on-link-click — the menu unmounts, the icon resets, the page
    scrolls (live 7424 px / clone 7404 px). Parity on both sites.
  - Dashboard mobile Sheet @375 px: Radix dialog (`--sidebar-width:
    18rem` inline), inner sidebar 288 px on both sides, opens via the
    trigger, closes on cross-page nav (URL changes + dialog unmounts),
    and the same-page click keeps the Sheet open on both sides (the
    documented R24 same-page behavior). Parity.
- **Tailwind CSS v4 watch:** no bare-var brackets anywhere in `src/`
  (`grep -rn '\[--' src/` → only the two hand-defined
  `w-[--sidebar-width]` utilities in `globals.css`, which are the R15
  fix); the production CSS emission verified in the standalone build —
  `.md\:hidden{display:none}` inside `@media (min-width:48rem)`, sorting
  after `.md\:block`/`.md\:flex`; the R18 `.space-y-2 > label + input`
  scoped rule and the R18 form-`space-y-4` conventions remain in place
  (662-test green run re-proves them). No TW4 bug present.
- **DB seam:** repo `.env` `DATABASE_URL="file:../db/custom.db"` with
  `db/` at the repo root; `db:push`/`db:seed` route through
  `scripts/with-db-url.mjs`, the server through `src/lib/db-path.ts`
  (`datasourceUrl`) — the dev server reports
  `/api/health {"status":"ok","db":"up"}` against
  `<repo>/db/custom.db`. (Workspace-level session note: a shell-exported
  DATABASE_URL pointing outside the repo initially shadowed the repo
  `.env` — standard dotenv precedence, resolved by pointing the
  workspace env at the repo DB; no repo change required. AGENTS.md's
  shell-export precedence note is accurate.)
- **Vitest + Playwright suites:** 662 vitest | 2 skipped (65 files) and
  14/14 e2e chromium against the standalone build — both suites green on
  the untouched tree; configs (`vitest.config.mts`,
  `playwright.config.ts`) intact and exercised end-to-end.
- **Settings save flow:** still silent (no toast) on the live — unchanged
  from R25; the clone's "Saved" line stays a documented value-add.
- **NTW badge:** live data still `0 this week / 2 last week` → the
  negative branch (`-100.0%`, destructive + legacy trending-down)
  continues to render — same state R25 verified byte-identical.
- **Top Pages:** `1 views` no-singularization re-confirmed on the live.
- **Marketing pricing monthly toggle:** clone re-verified against the R20
  pins (`bg-muted` track, `translate-x-0` thumb, "billed monthly"
  sub-line, nbsp spacer on the free card).
- **Topbar/bell:** `h-10 w-10 relative` bell tail, hot-pink dot, and the
  visitors subtitle byte-parity (`2 individuals · 1 companies
  identified` — the same counts on both accounts this round).
- **Page-error sweep:** all 18 clone routes (7 dashboard, 3 auth, 8
  marketing/content, 404) — ZERO console errors / page errors.
- **VLM screenshot comparisons:** landing (desktop full-page),
  dashboard, visitors, settings, activity, domains, install, login —
  all "essentially identical" with only data-driven deltas (feed
  animation phases, account data, avatar initials, hover artifacts, and
  the dev-only Next.js badge).

### 3. The finding — R26-F1: the dashboard pricing Growth card's POPULAR badge

**Live-verified in both billing states (monthly `unchecked` + annual
`checked`) and both viewports (1280 + 375):** the Growth card header on the
live's Pricing & Plan page renders

```html
<div class="flex items-center justify-between">
  <h3 class="font-semibold tracking-tight font-display text-lg">Growth</h3>
  <div class="inline-flex items-center rounded-full font-semibold
    transition-colors focus:outline-none focus:ring-2 focus:ring-ring
    focus:ring-offset-2 border-transparent bg-primary hover:bg-primary/80
    gradient-primary text-primary-foreground border-0 text-[10px] px-2
    py-0.5">POPULAR</div>
</div>
```

— a **new-gen Badge** (`ui/badge.tsx` base + `default` variant) with the
consumer tail **`gradient-primary text-primary-foreground border-0
text-[10px] px-2 py-0.5`** (gradient-first order, `px-2 py-0.5` sizing —
distinct from the Verified/Identified badges' `text-[10px] px-1.5 py-0 …`
sizes-first order). Free / Starter / Scale headers carry the h3 only.

The clone renders the header row with the h3 alone — **no badge**. The
`plan.popular` card otherwise matches byte-for-byte (root
`border-primary shadow-md ring-1 ring-primary/20 scale-[1.02]`, top bar
`absolute top-0 left-0 right-0 h-1 gradient-primary`).

**Why this was missed:** the R15 verification sweep pinned
`tests/shell-parity.test.tsx:187` — "ships no POPULAR badge (the live
marks popular with the bar + border only)". That pin's live evidence is
disproven by the current DOM. With the app bundle hash unchanged since the
R20 baseline, the badge code has been in the live's bundle all along — the
R15 evidence most plausibly came from the OLD app build that the
rolling-deploy window still served on a minority of loads (the same window
that served the pre-Sidebar shell CLAUDE.md documents). None of R16–R25's
probe loops re-checked the pricing page's header badges, so the drift
survived five drift watches.

This is a **clone defect** (the live is the contract), not a live defect.

### 4. Non-findings (ruled out during the sweep)

- **Domain-input placeholder** — an early probe grabbed a hidden
  `$ACTION_REF_1` field; the clone's visible input carries
  `placeholder="yoursite.com"` exactly like the live.
- **Install-page domain switcher "missing"** — the live account has 2
  domains, the clone demo 1; the R22 `sites.length > 1` rule renders the
  switcher correctly on both sides.
- **Profile tooltip in a screenshot** — hover artifact of the capture.
- **"N" icon bottom-left on clone screenshots** — the Next.js dev-tools
  badge; dev-only chrome, absent from production builds and the live.

## Remediation plan (TDD)

**F1 — add the POPULAR badge to the dashboard pricing panel.**

1. **RED** — extend the pin net first:
   - `tests/shell-parity.test.tsx`: REPLACE the disproven negative pin
     ("ships no POPULAR badge") with a positive source pin — the
     plan-panel source must contain the Badge consumer tail
     `gradient-primary text-primary-foreground border-0 text-[10px] px-2 py-0.5`
     and the header-row structure (`flex items-center justify-between`
     with the h3 + conditional badge).
   - NEW `tests/dashboard-r26-parity.test.tsx`: SSR-render
     `<PlanPanel>` (existing mock seam from `tests/content-parity.test.tsx`)
     and assert (a) exactly one `POPULAR` text node, on the Growth card;
     (b) the badge's full merged class string byte-identical to the live
     capture above; (c) its position — second child of the Growth card's
     `flex items-center justify-between` header, after the h3; (d) the
     Free/Starter/Scale headers carry no badge; (e) the badge renders in
     BOTH billing states (annual + monthly) since the live shows it in
     both.
2. **GREEN** — `src/components/dashboard/plan-panel.tsx`: inside the
   popular card's header row, render
   `<Badge variant="default" className="gradient-primary text-primary-foreground border-0 text-[10px] px-2 py-0.5">POPULAR</Badge>`
   gated on `plan.popular` (Badge from `@/components/ui/badge` — the
   `cn(base+variant, className)` merge emits the live's byte-exact
   order). No other card changes.
3. **e2e coverage** — NEW `e2e/pricing.spec.ts`: log in, open
   `/dashboard/pricing`, assert the POPULAR badge is visible on the
   Growth card (and absent from the Free card), in the standalone build.
   This closes the e2e gap that let F1 slip through five drift watches.
4. **Gates** — `npm run verify` (lint → typecheck → 663+ vitest →
   build) + `build:standalone` + `test:e2e` (15/15).
5. **Runtime byte-verify** — re-open both sites' pricing pages, capture
   the Growth card header, and byte-diff the badge markup (the R24
   settled-DOM discipline: wait past hydration).
6. **Screenshots** — `docs/screenshots/r26-*.png` from the dev server
   (desktop pricing + badge close-up, dashboard KPIs, visitors, install,
   mobile menu, mobile Sheet), VLM-checked.
7. **`.env.example`** — re-verify byte-consistency with `.env` + the
   codebase's `process.env` reads (no changes expected — the R23 contract
   holds; re-confirmed after the seam re-validation).
8. **Docs** — README R26 bullet (test counts), AGENTS.md R26 fact block
   (the pricing-badge seam + the R15-pin correction), CLAUDE.md mirror,
   PAD v1.25, `pixel-identifier_SKILL.md` R26 rows (Appendix A/D, gate
   block), this plan's execution log, `docs/session_26.md`, repo
   `docs/worklog.md` entry.
9. **Ship** — single conventional commit on main; push via
   `docs/ssh_git_wrapper_v3.py` (dry-run → push → remote-ref verify).

## Execution log

- Workspace: repo re-cloned at `128b6ac` (R25-clean); scandihaven cloned
  for reference; docs reviewed (AGENTS/CLAUDE/README/PAD v1.24/SKILL/
  session_24/25/R25-plan/worklog).
- Environment: deps installed, `.env` + repo-root `db/` created,
  `db:push` + `db:seed` run; dev server + `/api/health` green
  (`{"status":"ok","db":"up"}`). Session-level DATABASE_URL (workspace
  env) initially pointed outside the repo — standard dotenv precedence;
  resolved at the workspace level, no repo change.
- Arrival gates: lint 0 · typecheck 0 · 662 vitest · build · e2e 14/14.
- Live probes (sections 1–4) — one finding (F1), everything else clean.
- TDD RED: `tests/dashboard-r26-parity.test.tsx` (5 pins) + the replaced
  `tests/shell-parity.test.tsx` pin — 6 failing for the right reasons
  (one helper fixed to slice from the card ROOT, which precedes the h3).
- TDD GREEN: `plan-panel.tsx` imports the Badge primitive and renders
  `variant="default"` + the gradient-first tail gated on `plan.popular`
  — 28/28 across the two files; full suite 667 | 2 skipped (66 files).
- e2e: NEW `e2e/pricing.spec.ts` — 2 specs (badge bytes/position/scope +
  both toggle states with the $249 → $199 annual price assertion); two
  test-side artifacts fixed en route (ancestor-div locator scope;
  "billed monthly" is marketing copy, replaced with the price check).
  Full e2e: 16/16 chromium (19.7 s).
- Runtime byte-verify: the dev server's Growth card header captured and
  diffed against the live — badge class string, header classes, and
  child order (`[H3:Growth, DIV:POPULAR]`) IDENTICAL.
- Screenshots: `docs/screenshots/r26-*` (7 captures: pricing + badge
  closeup, dashboard KPIs, visitors, install, landing mobile menu,
  dashboard mobile Sheet) — VLM-verified (badge pill on Growth $249/mo;
  4 links + Start Identifying CTA in the menu).
- `.env.example` re-verified: 3 keys, byte-consistent with `.env` + the
  codebase's `process.env` reads (DATABASE_URL / NEXTAUTH_SECRET /
  NEXTAUTH_URL; NODE_ENV is framework-internal).
- Docs: README R26 bullet (667/16), AGENTS R26 fact, CLAUDE rounds
  11–26 mirror, PAD v1.25, SKILL.md R26 rows (project_state, pre-ship
  counts, Appendix A/D, R26 gate block, quick-reference counts), this
  plan, `docs/session_26.md`, repo `docs/worklog.md` entry.
- Gates: lint 0 · typecheck 0 · **667 vitest / 66 files** (2 skipped) ·
  build ✓ standalone ✓ **16/16 e2e chromium** · zero console errors
  (18 routes).
- Ship: single conventional commit on main; push via
  `docs/ssh_git_wrapper_v3.py` (dry-run → push → remote-ref verify).

## Next-round notes (R27 watch targets)

1. Bundle hashes — unchanged hashes keep the R24 inventory authoritative.
2. The pricing page enters the standing regression loop now (r26 e2e).
3. Continue the settings-save toast watch (silent as of R26).
4. If the live's data returns to `lastWeek=0`, re-confirm the NTW
   no-badge branch.
