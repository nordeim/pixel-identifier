# Round 27 — Sonner Toast Parity (Mutation Feedback)

**Date:** 2026-09-23 · **Session:** `docs/session_28.md` · **Verdict: ONE finding family (R27-F1) — the live's app bundle renders SONNER toasts on mutation success; the clone ships the Radix toast generation + an inline "Saved" line**

## Scope

The R26 next-notes defined the R27 watch targets: (a) bundle hashes again —
the only drift signal that matters without a live touch; (b) the pricing
page in the standing regression loop (r26 e2e); (c) the settings-save toast
watch (silent as of R26); (d) the NTW no-badge branch if the live's data
returned to `lastWeek=0`. Plus the standing user emphasis: the mobile
navigation menu (both surfaces), the Tailwind CSS v4 bug watch, the DB seam
(`.env` `DATABASE_URL="file:../db/custom.db"` → repo `db/`), the vitest +
Playwright suites, and the repo-round discipline (gates, screenshots, docs,
push).

## Probe protocol (12th probe generation — live verified 2026-09-23)

Probe account `sepnetflix2023@outlook.com`; agent-browser (dual sessions —
live + clone); 1280×900 desktop + 375×812 mobile viewports; settled-DOM
captures; visibility-filtered click targets (the R25 probe-artifact lesson).

### 1. Bundle hashes — NO REDEPLOY

| Bundle | R26 baseline | R27 live | Verdict |
|---|---|---|---|
| Marketing JS | `assets/index-C3AAh5Je.js` | `index-C3AAh5Je.js` | unchanged |
| Marketing CSS | `assets/index-bLMWzsGr.css` | `index-bLMWzsGr.css` | unchanged |
| App JS | `assets/index-nhmKaUsm.js` | `index-nhmKaUsm.js` | unchanged |

No redeploy → the R24 token-diff divergence inventory remains the system of
record. The sweep therefore re-verified the standing surfaces and — new
this round — drove the live's MUTATION flows (settings save, domain add,
domain delete, install copy, login failure) looking for backend-driven
behavior changes the bundle hashes cannot see.

### 2. Standing targets re-verified (all CLEAN)

- **Mobile navigation (standing user emphasis), both surfaces, both sites:**
  - Marketing dropdown @375 px: container bytes (`md:hidden bg-background
    border-b border-border px-6 py-4 flex flex-col gap-4`), 4 plain links,
    full-width Start Identifying CTA, toggle `lucide-menu`/`lucide-x` at
    `w-6 h-6`, close-on-link-click (menu unmounts, icon resets, page
    scrolls — live 7424 px / clone 7404 px, the documented 20 px D5 delta).
    Parity on both sites.
  - Dashboard mobile Sheet @375 px: `--sidebar-width: 18rem` inline, inner
    sidebar ~288 px on both sides, closes on cross-page nav (URL changes +
    dialog unmounts). Parity.
- **Tailwind CSS v4 watch:** no bare-var brackets in `src/`; the 667-test
  green run re-proves the R18 space-y seams and the hand-defined
  `w-[--sidebar-width]` utilities; the mobile menu's `md:hidden` emission
  is exercised by the e2e suite (14+ specs green at arrival). No TW4 bug.
- **DB seam:** repo `.env` `DATABASE_URL="file:../db/custom.db"` with `db/`
  at the repo root; `db:push` + `db:seed` route through
  `scripts/with-db-url.mjs`; dev server `/api/health {"status":"ok","db":"up"}`
  against `<repo>/db/custom.db`. (Session-level note: the workspace shell
  again exported a stale absolute `DATABASE_URL` pointing at
  `/home/z/my-project/db/custom.db`; unified via a symlink to the repo DB so
  every resolution path lands on the same physical file — no repo change,
  same class of session quirk R26 documented.)
- **Vitest + Playwright suites:** arrival gates on the untouched R26 tree —
  lint 0 · typecheck 0 · **667 vitest | 2 skipped (66 files)**; e2e specs
  intact (16/16 re-run post-fix below).
- **Pricing page (standing loop since r26):** the live's Growth card header
  re-captured — the POPULAR badge markup is byte-identical to the clone's
  R26 fix. The r26 e2e regression net holds.
- **NTW badge:** live data still `0 this week / 2 last week` → the negative
  branch (`-100.0%`, destructive + legacy trending-down) continues to
  render; the clone's seeded state exercises the positive branch — both
  branches remain runtime-verified (R24/R25 evidence stands).
- **Topbar/visitors:** subtitle `2 individuals · 1 companies identified` on
  BOTH sides this round (same counts); visitors table 3 rows on the live;
  activity 6 rows, no pagination footer (< 50 — the R22 model).
- **Install copy button:** swaps to plain `Copied!`, NO toast, no green
  check — the R22 pin re-confirmed on the live.
- **Login failure (new probe):** the live shows NO toast and NO inline
  error on bad credentials; the clone's inline error line stays a
  functional value-add (invisible on the live's empty branch).
- **Page-error sweep:** all 18 clone routes + the 404 — ZERO console /
  page errors.

### 3. The finding — R27-F1: the live's mutation feedback is SONNER toasts

The R26 watch list flagged the settings-save toast as "silent". This round
the live's settings save **fired a toast** — and the follow-up sweep found
the same mechanism on the domains flows. Live-verified, all bottom-right:

| Flow | Live toast | Notes |
|---|---|---|
| Settings save | `Settings saved` | success icon, title only |
| Domain add | `Domain added successfully` | success icon, title only |
| Domain delete | `Domain removed` | success icon, title only |

The live's toast runtime (decoded from the live's app bundle +
`https://registry.npmjs.org/sonner` fingerprinting — the CSS `:where()`
wrapper + `translateY(-10px)` + `data-lifted` 3× + the Heroicons
check-circle path are all byte-matches) is **sonner 1.7.x**; pinned
**1.7.4** (the final 1.7 release; the success-icon SVG path is
byte-identical to the live capture, and v2.0.x diverges — no `:where()`,
`-8px` lift, plus a `data-react-aria-top-layer` attr the live does not
render).

Live-verbatim structure (captured at runtime):

```html
<!-- idle: an EMPTY section only (the ol renders ONLY while toasts exist) -->
<section aria-label="Notifications alt+T" tabindex="-1" aria-live="polite"
  aria-relevant="additions text" aria-atomic="false"></section>

<!-- active toast: -->
<ol dir="ltr" tabindex="-1" class="toaster group" data-sonner-toaster="true"
  data-theme="light" data-y-position="bottom" data-lifted="false"
  data-x-position="right" style="--front-toast-height: 53.5px; --width: 356px;
  --gap: 14px; --offset-top: 32px; --offset-right: 32px; --offset-bottom: 32px;
  --offset-left: 32px; --mobile-offset-top: 16px; --mobile-offset-right: 16px;
  --mobile-offset-bottom: 16px; --mobile-offset-left: 16px;">
  <li tabindex="0" class="group toast group-[.toaster]:bg-background
    group-[.toaster]:text-foreground group-[.toaster]:border-border
    group-[.toaster]:shadow-lg" data-sonner-toast="" data-styled="true"
    data-mounted="true" data-promise="false" data-swiped="false"
    data-removed="false" data-visible="true" data-y-position="bottom"
    data-x-position="right" data-index="0" data-front="true"
    data-swiping="false" data-dismissible="true" data-type="success"
    data-swipe-out="false" data-expanded="false" style="--index: 0;
    --toasts-before: 0; --z-index: 1; --offset: 0px; --initial-height: 53.5px;">
    <div data-icon="" class=""><svg xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20" fill="currentColor" height="20" width="20"><path
      fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809…"
      clip-rule="evenodd"></path></svg></div>
    <div data-content="" class=""><div data-title="" class="">Settings saved</div></div>
  </li>
</ol>
```

The `group-[.toaster]:bg-background …` class family is the shadcn sonner
wrapper's `toastOptions.classNames.toast` (positions bottom-right, theme
light, 356 px width, 32/16 px offsets, 4 s duration — all sonner 1.7
defaults; NO richColors, NO closeButton).

**The clone ships the WRONG generation:** `@radix-ui/react-toast` +
`useToast` + `ui/toaster.tsx` (the shadcn Radix toaster, viewport
`fixed top-0 … sm:bottom-0 sm:right-0` — TOP on mobile vs the live's
bottom), consumed by `domains-panel.tsx` (`Domain added successfully` /
`Domain deleted` + a description the live does not render); the settings
save renders an inline `Saved` line (`settings-panel.tsx`, the R6-era
value-add) instead of a toast.

**Why this was missed:** the bundle hash never changed — the toast code has
been in the live's bundle all along (same class of miss as R26-F1: the
R24–R26 probes captured the toast system in a state where the Supabase
backend apparently never resolved the mutation successfully, so no toast
ever fired; the live's toast is backend-driven, not bundle-driven). The
R24 "working, silent" evidence was a transient backend state, not the
live's steady behavior.

This is a **clone defect** (the live is the contract), not a live defect.
The clone's error-branch toasts (add/delete failure, save failure) stay —
the live's error branches are unobservable (its backend accepts arbitrary
domains per R20), and silently swallowing a failure would be a defect of
our own (the R17 dead-affordance precedent: match the live's OBSERVABLE
behavior, keep working behavior where the live is broken/unobservable).

### 4. Non-findings (ruled out during the sweep)

- **Plan change (pricing Get Started):** the live opens a Stripe
  EmbeddedCheckout dialog — the documented D-class divergence (no payment
  processor here); no toast to replicate.
- **Signup email-confirmation toast:** the live's "Check your email" toast
  is part of the documented signup-gate divergence (PAD §11, D-class) —
  the clone auto-sessions by design; no toast.
- **Marketing pages:** no toast system observed on the live's marketing
  bundle; the clone's root-level mount renders an empty section only
  (byte-invisible on marketing routes, matching the live's no-toaster
  marketing DOM).

## Remediation plan (TDD)

**F1 — migrate the mutation-feedback layer to sonner 1.7.4, live-verbatim.**

1. **Dependency:** `sonner` pinned `1.7.4` (exact — fingerprint-verified
   against the live bundle); `@radix-ui/react-toast` REMOVED (no remaining
   consumer).
2. **RED** — extend the pin net first:
   - NEW `tests/toast-r27-parity.test.tsx`:
     - (a) the wrapper source pin — `src/components/ui/sonner.tsx` must
       pass `className="toaster group"` and the live's exact
       `toastOptions.classNames.toast` string
       (`group toast group-[.toaster]:bg-background
       group-[.toaster]:text-foreground group-[.toaster]:border-border
       group-[.toaster]:shadow-lg`);
     - (b) SSR pin — `renderToStaticMarkup(<Toaster />)` emits the live's
       idle section bytes (`aria-label="Notifications alt+T"` +
       `tabindex="-1"` + the three aria attrs) and NOTHING else (no ol —
       sonner 1.7 renders the list only with active toasts);
     - (c) `settings-panel.tsx` source pin — `toast.success('Settings
       saved')` present; the inline `Saved` `role="status"` line ABSENT;
     - (d) `domains-panel.tsx` source pins — `toast.success('Domain added
       successfully')`, `toast.success('Domain removed')` (the live's
       title), NO `useToast` import, NO `Domain deleted` string, NO
       `Its visitors and events were removed.` description;
     - (e) `src/app/layout.tsx` mounts the sonner `Toaster`, not the
       Radix one; `src/components/ui/toast.tsx` + `src/hooks/use-toast.ts`
       + `src/components/ui/toaster.tsx` are GONE (no dead code).
3. **GREEN**:
   - `src/components/ui/sonner.tsx` — the shadcn wrapper:
     `toastOptions.classNames` = the live's toast string +
     `description`/`actionButton`/`cancelButton` tails (shadcn standard,
     invisible until used); NO position/theme/richColors/closeButton props
     (the live runs sonner defaults).
   - `src/app/layout.tsx` — swap the Radix `<Toaster />` mount for the
     sonner one (same root position; the empty-section-at-idle keeps
     marketing DOM byte-clean).
   - `src/components/dashboard/settings-panel.tsx` — replace the inline
     `Saved` line with `toast.success('Settings saved')` fired from the
     existing state-identity effect seam (the domains-panel pattern);
     errors → `toast.error(state.error.message)`; the R24-F9 Save-spinner
     pin is untouched.
   - `src/components/dashboard/domains-panel.tsx` — `useToast()` →
     sonner's `toast`; add-success keeps `Domain added successfully`;
     delete-success title FIXED to `Domain removed` (live-verbatim) and
     the description dropped; error branches → `toast.error(title,
     { description })`.
   - DELETE `src/components/ui/toast.tsx`, `src/hooks/use-toast.ts`,
     `src/components/ui/toaster.tsx`; `npm uninstall @radix-ui/react-toast`.
4. **e2e coverage** — NEW `e2e/toasts.spec.ts`: log in → settings → save →
   the sonner toast appears (`[data-sonner-toast]` visible, `data-type=
   "success"`, title `Settings saved`, the live's class family) and
   auto-dismisses; domains → add → `Domain added successfully`. This
   closes the e2e gap that let the Radix/sonner divergence survive.
5. **Gates** — `npm run verify` (lint → typecheck → 667+ vitest → build) +
   `build:standalone` + `test:e2e` (17+ specs).
6. **Runtime byte-verify** — drive the clone's settings save + domain
   add/delete in the browser; byte-diff the toast DOM (section bytes, ol
   attrs, li class family, icon path, title) against the live captures.
7. **Screenshots** — `docs/screenshots/r27-*` from the dev server (the
   toast in situ on settings + domains, dashboard, pricing badge, mobile
   menu), VLM-checked.
8. **`.env.example`** — re-verify byte-consistency (no changes expected —
   the toast migration adds no env surface).
9. **Docs** — README R27 bullet (test counts + the sonner seam), AGENTS.md
   R27 fact block, CLAUDE.md mirror, PAD v1.26, SKILL.md R27 rows
   (project_state, pre-ship counts, Appendix A/D, gate block), this plan's
   execution log, `docs/session_28.md`, repo `docs/worklog.md` entry.
10. **Ship** — single conventional commit on main; push via
    `docs/ssh_git_wrapper_v3.py` (dry-run → push → remote-ref verify).

## Execution log

- Workspace: repo re-cloned at `b300560` (R26-clean); scandihaven cloned
  for reference; docs reviewed (AGENTS/CLAUDE/README/PAD v1.25/SKILL/
  session_26/session_27/R26-plan/TW4-validation-report/worklog).
- Environment: deps installed (654 pkgs), repo `.env` + root `db/`
  created, `db:push` + `db:seed` green, dev server
  `/api/health {"status":"ok","db":"up"}`. Session shell re-exported a
  stale absolute DATABASE_URL → unified via symlink (no repo change).
- Arrival gates: lint 0 · typecheck 0 · 667 vitest | 2 skipped (66 files).
- Live probes (sections 1–4) — one finding family (F1), everything else
  clean.
- Dependency: sonner 1.7.4 pinned exact (2.0.8 trialed first, then
  fingerprinted down to 1.7.x via the CSS `:where()`/`translateY(-10px)`/
  `data-lifted` markers + the byte-identical Heroicons success-icon path).
- TDD RED: `tests/toast-r27-parity.test.tsx` (14 pins) — failing for the
  right reasons (the wrapper module missing → the suite failed on
  import; the remaining pins then proved the migration piece by piece).
- TDD GREEN: `ui/sonner.tsx` wrapper (shadcn integration, the live's
  toast class family, no default overrides) + root-layout mount swap +
  settings-panel migration (toast.success('Settings saved') / toast.error
  via the state-identity effect seam; the R24-F9 spinner pin untouched) +
  domains-panel migration (add title kept; delete title fixed to the
  live's "Domain removed", description dropped; error branches via
  toast.error) + the Radix toast trio deleted (ui/toast.tsx,
  ui/toaster.tsx, hooks/use-toast.ts) + `@radix-ui/react-toast`
  uninstalled — 14/14 pins green; full suite **681 vitest | 2 skipped
  (67 files)** (+14 from R26's 667).
- e2e: NEW `e2e/toasts.spec.ts` (2 specs — settings-save toast bytes
  incl. auto-dismiss + the domain add/delete toasts). Two test-side
  artifacts fixed en route: (1) the domain spec initially drove the demo
  account, whose FREE plan (1-domain limit, used by the seed) correctly
  rejected the add — the spec now signs up its own throwaway account;
  (2) `getByLabel('Password')` needs `{ exact: true }` on the signup
  page (strict-mode collision with "Confirm Password"). Full e2e:
  **18/18 chromium (30.4 s)**.
- Runtime byte-verify: the clone's toast DOM diffed against the live
  captures — the idle section bytes, the ol attributes + CSS variables,
  the li class family, the Heroicons check-circle icon path, and the
  title IDENTICAL.
- Screenshots: `docs/screenshots/r27-*` (7 captures: settings toast,
  domains delete + add toasts, dashboard, pricing badge, landing mobile
  menu, dashboard mobile Sheet) — VLM-verified ("Settings saved" /
  "Domain added successfully" toasts bottom-right with the check icon;
  the 4 links + Start Identifying CTA in the mobile menu).
- `.env.example` re-verified: unchanged, byte-consistent.
- Docs: README R27 bullet, AGENTS R27 fact, CLAUDE mirror, PAD v1.26,
  SKILL.md R27 rows, this plan, `docs/session_28.md`, worklog entry.
- Gates: lint 0 · typecheck 0 · **681 vitest / 67 files** (2 skipped) ·
  build ✓ standalone ✓ **18/18 e2e chromium** · zero console errors.
- Ship: single conventional commit on main; push via
  `docs/ssh_git_wrapper_v3.py` (dry-run → push → remote-ref verify).

## Next-round notes (R28 watch targets)

1. Bundle hashes again — unchanged hashes keep the R24 inventory
   authoritative; a change triggers the full token-diff sweep.
2. The toast system enters the standing regression loop (r27 e2e).
3. Continue the NTW no-badge branch watch if the live's data changes.
4. Consider e2e specs for the domains delete-confirm flow (the AlertDialog
   is a kept divergence — its confirm click now feeds the sonner toast).
