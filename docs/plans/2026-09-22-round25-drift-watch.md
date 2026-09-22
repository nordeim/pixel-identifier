# Round 25 — Drift Watch (Clean)

**Date:** 2026-09-22 · **Session:** `docs/session_24.md` · **Verdict: CLEAN — no findings requiring remediation**

## Scope

The R24 next-notes defined the R25 watch targets: (a) re-probe the live bundle
hashes — a redeploy would re-run the full token-diff sweep; (b) watch for
lucide-react version moves in a new app bundle (the R24-F4 icon-generation
pin is a parity contract now); (c) re-check the settings save flow for
feedback UI (silent as of R24); (d) re-check the visitors rows (inert as of
R24). Plus the standing user emphasis: the mobile navigation menu, and the
repo-round discipline (docs validation, gates, screenshots, push).

## Probe protocol (10th probe generation — live verified 2026-09-22)

Probe account `sepnetflix2023@outlook.com`; agent-browser; 375 px (mobile)
+ desktop viewports; settled-DOM captures (R24's pre-hydration lesson:
always wait past hydration before byte comparisons).

### 1. Bundle hashes — NO REDEPLOY

| Bundle | R24 baseline | R25 live | Verdict |
|---|---|---|---|
| Marketing JS | `assets/index-C3AAh5Je.js` | `index-C3AAh5Je.js` | unchanged |
| Marketing CSS | `assets/index-bLMWzsGr.css` | `index-bLMWzsGr.css` | unchanged |
| App JS | `assets/index-nhmKaUsm.js` | `index-nhmKaUsm.js` | unchanged |
| App lucide version | `lucide-react v0.462.0` (bundle literal) | `v0.462.0` | unchanged |

No redeploy → the R24 token-diff divergence inventory remains the system of
record; the sweep re-verified the surfaces most sensitive to DATA-driven
state changes (the only thing that can drift without a redeploy).

### 2. Data-driven states (new live data since R24)

- **New This Week negative badge — new state, parity VERIFIED.** The live
  now shows `0` this week vs `2` last week → `-100.0%` in
  `text-destructive` with the legacy `lucide-trending-down h-3 w-3 mr-0.5`
  (`<polyline points="22 17 13.5 8.5 8.5 13.5 2 7">` + `16 17 22 17 22 11`).
  A branch R24 could only verify from bundle decode (live data had
  `lastWeek=0` → no badge). Clone comparison at runtime (R24-seeded
  3-vs-2 state): **badge structure byte-identical** with data masked;
  the clone's `TrendingDownIcon` geometry is byte-equal to the live's
  capture; `weekOverWeekChange(0, 2)` → `-100.0%` matches the live's
  `-100.0%` exactly.
- **"1 views" no-singular re-confirmed**: the live's Top Pages now renders
  `/anon-check0 1 views` and `/pricing 1 views` — the R24-F3 fix (never
  singularize) matches live behavior.
- **Visitors table — Company-type rows**: the live shows `Alibaba (US)
  Technology Co., Ltd. · 2 visits — Company — Hong Kong… — inactive — 6d
  ago`; the clone's `Acme Corp · 2 visits — Company — …` renders the same
  structure (initials/company avatar, source `Direct`, confidence,
  status, time-ago).
- **Activity feed**: live shows Pageview + Identified entries with the
  R22-pinned truncation (`AnonTestVisi…`, `Kpn4Vq3vXYaW…`) — matches.

### 3. Named targets

- **Settings save flow**: re-probed end-to-end. Button bytes match the
  R24 pin (`… font-semibold h-9 rounded-md px-3`); the pending state
  re-captured in full — `disabled=""` + `<svg class="lucide
  lucide-loader-circle h-3.5 w-3.5 mr-1.5 animate-spin">` ALONGSIDE "Save
  Changes" (settles back to the bare label) — exactly the R24-F9
  implementation. Save remains silent (no toast) — the clone's "Saved"
  line stays a documented value-add.
- **Danger Zone**: dead Delete button (no handler, no dialog) — unchanged;
  the clone's typed-confirm flow stays a documented value-add.
- **Visitors rows**: inert on click (no dialog, no DOM delta) — unchanged;
  the clone's detail Sheet stays a documented value-add.
- **Export button**: `<button>` + `… gradient-primary … font-semibold h-9
  rounded-md px-3` + legacy `lucide-download h-3.5 w-3.5 mr-1.5` —
  byte-identical to the clone (runtime comparison, both sides).

### 4. Mobile navigation (standing user emphasis)

- **Marketing dropdown @375 px**: open-state container bytes match
  (`md:hidden bg-background border-b border-border px-6 py-4 flex flex-col
  gap-4`, 4 links + full-width CTA). Toggle `lucide-menu`/`lucide-x`
  `w-6 h-6` (the R23-F4 pin) — note: an early probe caught the
  announcement-bar dismiss `lucide-x w-4 h-4` (the R23-F7 pin) by
  selector accident; re-verified against the true header toggle.
- **Close-on-link-click — both sides close.** A first probe appeared to
  show the live keeping the menu open after a `#benefits` click; root
  cause was the probe clicking a HIDDEN desktop/footer `#benefits` anchor
  (no visibility filter). Clean re-probe (`offsetParent !== null`): the
  live closes the menu (dialog unmounts, toggle back to `lucide-menu`),
  page scrolls to the section — the clone's `onClick={() => setOpen(false)}`
  behavior matches. The R23 plan's "marketing dropdown already closes via
  per-link onClick (verified)" note stands.
- **Dashboard mobile Sheet @375 px**: R23-F3 regression re-run — opens
  (dialog + overlay), closes on nav-link click (dialog gone, overlay
  gone, URL `/dashboard/visitors`). Passes.

### 5. Install platform instructions (R24-F2 regression)

WordPress tab re-verified verbatim both sides: "Install 'Insert Headers
and Footers' plugin → Plugins → Add New … by WPCode / Add the snippet →
Code Snippets → Header & Footer … / Save …" + the per-tab `<pre>`.
Panel mounting behavior matches: only the active `role=tabpanel` carries
content on both sides (inactive panels `textContent` empty — Radix
unmounts inactive panel children in both implementations).

### 6. Re-confirmed documented residuals (NOT drift)

- **D4 (R17, re-affirmed)**: lucide-react 0.525's default
  `aria-hidden="true"` on stock icons vs the live's 0.462 (never renders
  it). The 10 legacy overrides in `live-icons.tsx` correctly omit it.
  Unfixable without hand-writing every stock svg; documented residual.
- **D5-class a11y chrome**: the clone's mobile-nav wrapper
  (`<nav aria-label>`), `focus-brand` classes, `aria-expanded`/`aria-label`
  on the toggle — invisible functional chrome, standing ruling.
- **R13-D3**: the dropdown CTA maps `https://app.pixelco.io` (target
  `_blank` on the live) → `/signup` — standing CTA divergence.

## Findings

**None.** All probes return to documented baselines. No code changes this
round — the remediation plan is therefore the null plan, and the round's
deliverable is the evidence record + the standing artifacts (screenshots,
gates, docs alignment).

## Execution log

- Workspace refreshed: `git pull` fast-forwarded `8fccf4a..82cabbb`
  (upstream added `docs/session_23.md` — the R24-completion narrative;
  no code delta).
- Docs re-validated against the codebase: AGENTS/CLAUDE/README/PAD v1.23/
  SKILL.md all at R24 state; R24 source fixes verified in-tree (13 legacy
  icon exports, `weekOverWeekChange`, `buildPlatformSnippet`); `.env`
  `DATABASE_URL="file:../db/custom.db"` + repo-root `db/custom.db`;
  `/api/health` `{"status":"ok","db":"up"}`.
- Live probes (sections 1–6 above) — all clean.
- Screenshots: `docs/screenshots/r25-*.png` (6 captures, VLM-checked).
- Gates: `npm run verify` EXIT=0 (lint 0, typecheck 0, 662 vitest | 2
  skipped, build) + standalone e2e 14/14 chromium.
- `.env.example` re-verified: 3 keys, byte-consistent with `.env` + the
  codebase's `process.env` reads (no code changes since R24 — no drift
  possible).
- Docs: session_24.md, worklog entry, README round bullet, AGENTS R25
  fact, CLAUDE mirror, PAD v1.24, SKILL.md R25 row.
- Push: `git@github.com:nordeim/pixel-identifier.git` main via the SSH
  wrapper (dry-run → push → remote ref verification).

## Next-round notes (R26 watch targets)

1. Bundle hashes again — the only drift signal that matters without
   touching the live; a change re-runs the full token-diff sweep.
2. The NTW badge now has BOTH branches live-verified (positive from R24's
   seed evidence, negative from R25's live capture) — if the live's data
   returns to `lastWeek=0`, re-confirm the no-badge branch.
3. Watch the settings save flow for a toast (silent as of R25).
4. Consider probing the live's desktop dashboard at 1280 px with a full
   token-diff if any bundle hash moves.
