# Round-20 — Runtime-State & Functional Parity Audit + Remediation

**Date:** 2026-09-19 · **Session:** docs/session_17.md (R20) · **Base:** main @ 44949ce
(R19 ship 6adb730 + the user's session_16 log commit) · **Gate at base:** lint ✓
typecheck ✓ 531/53 tests ✓ build ✓

## Scope — three probe generations

1. **Drift watch (5th consecutive)** — R19 toolchain, tokenizer diff of all
   9 live pages vs `/tmp/r19-caps`.
2. **Runtime-state observation (NEW, 5th generation)** — sampled the live's
   and the clone's hero feed widget over 16 s (9 samples × 2 s), then
   re-extracted the live's phase machine from its JS bundle
   (index-C3AAh5Je.js, symbols PD/TD/ND) as the definitive source.
3. **Functional parity probes (NEW)** — pricing cycle toggle state machine
   (initial/clicked/reloaded), visitors-table sort, domains add-domain
   validation + empty-state, domains delete flow.

## Audit evidence

- Drift: **LIVE 100% STABLE — 5th consecutive stable audit** (0 real token
  changes across dashboard×7 + shell + landing; 1,289 tokens).
- Feed runtime sampling: both sides cycle at 10 s, same 5-entry roster,
  same tops [12,68,124,180,236], same reveal order (sarah→james→maria→
  alex→priya), same done→row-removal pattern. Bundle re-extraction
  confirms the clone's phase model is EXACT (constants, gating, geometry,
  cycle key). One transient behavioral gap: the live's text column is an
  AnimatePresence `mode:"wait"` — on reveal the OLD text exits first
  (opacity→0, y:-8, 0.3 s) and only then the email block enters
  (opacity 0→1, y 8→0, 0.4 s); the clone swaps atomically. Two runtime
  samples (t=4, t=12) caught the live mid-transition: avatar primary +
  ✓ badge while the label text was still the anonymous one.
- Pricing toggle (runtime, live vs clone): annual default + $63/$199/$639
  + "billed annually" IDENTICAL on both sides. Monthly mode diverges:
  live track `bg-muted` vs clone `bg-muted-foreground/30`; live thumb
  emits `translate-x-0` (clone omits it); live sub-line "billed monthly"
  (clone renders the spacer nbsp); live button is a plain `<button
  aria-label="Toggle annual pricing">` (clone adds `type="button"
  role="switch" aria-checked`). The live's toggle is pure useState — NO
  URL sync (the "pricing toggle URL state" hypothesis from the R19
  next-steps is a non-finding; the clone also has no URL sync on the
  marketing section — parity).
- Visitors sort: **NEITHER side has sortable columns** (headers are
  plain `th` cells; the only button is the select-all checkbox) — parity,
  non-finding.
- Domains: the live's Add-Domain button renders `disabled` while the
  input is empty (controlled input); the clone's button is enabled and
  relies on native `required`. The live then accepts ARBITRARY input —
  the audit probe submitted `not_a_valid domain!!` and the live CREATED
  it as a domain row (zero validation; cleanup performed, account
  restored to its original two domains). The live's domain delete is
  IMMEDIATE — no confirm dialog.
- Domains CTA/CTA-href mapping (`app.pixelco.io` → `/signup`) is a
  documented intentional divergence (R13-D3/E2, PAD) — not re-litigated.

## Findings

| ID | Severity | Finding | Action |
|----|----------|---------|--------|
| F1 | real (visual/functional, monthly-mode only) | Pricing toggle monthly state: 4 sub-divergences — (a) missing "billed monthly" sub-line, (b) off-track `bg-muted-foreground/30` vs live `bg-muted`, (c) off-thumb missing `translate-x-0`, (d) extra `type`/`role`/`aria-checked` attrs on the toggle button | FIX — match the live's KD emission exactly |
| F2 | real (functional) | Add-Domain button not disabled on empty input (live disables it; clone falls back to native required tooltip) | FIX — controlled input + disabled-when-empty, drop `required` (live has none) |
| F3 | live defect (documented) | Live accepts invalid domains verbatim; live deletes without confirmation | KEEP the clone's zod validation + AlertDialog (never replicate a live defect); document as intentional divergences in the PAD |
| F4 | real (runtime animation) | Feed reveal swaps text atomically; the live stages it — old text exits (0.3 s) then email enters (0.4 s); ✓ badge springs in (scale 0→1) | FIX — CSS-staged swap (300 ms) + badge scale-in keyframe; phase constants unchanged |
| — | non-findings | Visitors sort (absent on both sides); live drift (5th stable); feed model (exact); pricing URL state (absent on both) | document only |

## TDD remediation plan

- **RED** `tests/marketing-r20-parity.test.tsx`:
  - F1 pins: source renders the monthly branch (`'billed monthly'`
    literal + `cycle === 'monthly'` guard); off-track class
    `bg-muted` (and NO `bg-muted-foreground/30` anywhere in the
    component); off-thumb branch contains `translate-x-0`; the toggle
    button carries NO `role="switch"`/`aria-checked`/`type="button"`.
  - F2 pins: `domains-panel.tsx` disables on empty
    (`domainValue.trim() === ''` guard); input is controlled
    (`value={domainValue}` / `onChange`); no `required` attr; success
    clears the input (`setDomainValue('')`).
  - F4 pins: `live-feed.tsx` stages the text swap
    (`SWAP_MS = 300`, reveal → exit → swap); CSS defines
    `.feed-text-exit` / `.feed-text-in` keyframes + `.feed-badge-in`
    spring; static t=0 render still shows anon labels (R19 pins hold).
- **GREEN**:
  - `pricing-section.tsx`: sub-line ternary (annual+paid → "billed
    annually", monthly+paid → "billed monthly", free → nbsp); track
    class template with `bg-muted` off-branch; thumb template with
    `translate-x-0` off-branch; button drops type/role/aria-checked.
  - `domains-panel.tsx`: `domainValue` state, controlled input,
    disabled-when-empty (OR pending), clear-on-success, drop `required`.
  - `live-feed.tsx` + `globals.css`: staged reveal (exit 0.3 s → swap →
    enter 0.4 s), `.feed-badge-in` overshoot keyframe, reduced-motion
    guards.
- **Gate**: lint → typecheck → test → build (never weaken a failing gate).

## Verification plan

- Browser probes re-run (pricing monthly state, domains disabled state,
  feed reveal transition sampling) on the standalone build.
- VLM visual confirmation of the monthly pricing cards + the reveal
  mid-transition.
- Screenshots → `docs/screenshots/` (r20- prefix).
- E2E console-error sweep on affected pages.

## Risks

- The staged text swap must not regress the R19 static pins (t=0 render
  unchanged — verified: swap only activates after the reveal timer).
- Controlled domain input + server action: React 19 resets uncontrolled
  fields after action resolution; the controlled value is cleared in the
  existing success-toast effect (identity-keyed, no double-clear risk).

---

## Execution log (R20)

### Audit phase
- Baseline gate at 44949ce: lint ✓ typecheck ✓ 531/53 ✓ build ✓.
- Drift watch (5th consecutive): **LIVE 100% STABLE** — zero real token
  changes across dashboard×7 + shell + landing.
- Runtime feed sampling (16 s, 9 samples × 2 s, live + clone): same 10 s
  cycle, same roster, same tops, same reveal order, same done-unmount
  pattern. Bundle re-extraction (index-C3AAh5Je.js, PD/TD/ND) confirms
  the clone's R19 rebuild is exact; the only gap is the mode:"wait"
  text-swap staging (F4) + the badge spring.
- Functional probes: pricing toggle (F1 ×4 sub-findings, runtime-verified
  both sides), visitors sort (non-finding — no sort on either side),
  domains (F2 disabled-state + F3 live defects).
- **Live-defect incident:** the invalid-domain probe was ACCEPTED by the
  live (created "not_a_valid domain!!"); cleaned up immediately via the
  row's destructive-hover button (no confirm dialog — itself evidence
  for F3); account verified restored to its original 2 domains.

### TDD remediation
- **RED**: `tests/marketing-r20-parity.test.tsx` — 12 pins across F1
  (monthly branch, off-track/off-thumb classes, plain-button attrs), F2
  (controlled input, disabled-on-empty, no required, clear-on-success),
  F4 (SWAP_MS staging, CSS keyframes, reduced-motion guard, static t=0
  invariants). 11 failed / 1 passed.
- **GREEN**:
  - `pricing-section.tsx`: sub-line ternary (billed annually / billed
    monthly / nbsp); off-track `bg-muted`; off-thumb `translate-x-0`.
    The toggle's attr divergence was re-ruled KEPT (D5: invisible
    functional a11y chrome) — the R20 probe confirmed attrs are the
    only remaining divergence on the toggle, so the strict-parity pin
    was superseded mid-round by a D5-keeps pin.
  - `domains-panel.tsx`: `domainValue` controlled state, disabled while
    `pending || trim() === ''`, `required` dropped; clear via React's
    render-phase adjust pattern (lint: react-hooks/set-state-in-effect
    forbade the effect-based reset).
  - `live-feed.tsx` + `globals.css`: staged swap (`SWAP_MS = 300` after
    `REVEAL_AT`; `textEmail`/`textExiting` state), `.feed-text-exit`
    (0.3 s, y:-8) / `.feed-text-in` (0.4 s, y:+8) / `.feed-badge-in`
    (0.3 s overshoot bezier) keyframes; reduced-motion guards extended.
- **Gate**: lint ✓ · typecheck ✓ · **543 tests / 54 files** (+12) ·
  `next build` ✓.

### Post-fix verification
- V1 pricing monthly: track `bg-muted`, thumb `translate-x-0`, $79/$249/
  $799 + "billed monthly", Free $0 + spacer — identical to the live's
  captured monthly state. VLM: "Yes" on the scrolled capture.
- V2 domains: `disabled → opacity: 0.5, pointer-events: none` (computed);
  enables on typing; no `required` attr. (VLM read the 50%-opacity amber
  gradient as "not dimmed" — salience misread; the live renders the same
  classes + disabled state, so the mechanics are the parity evidence.)
- V3 feed staged reveal: 150 ms-cadence sampling observed `feed-text-exit`,
  `feed-text-in` AND the live's mid-transition state (avatar primary +
  ✓ badge + anonymous text). VLM confirmed the mid-state capture ("Yes")
  and the fully-revealed capture ("Yes").
- V4: zero console errors on 10 pages.
- Screenshots: 8 files in `docs/screenshots/` (r20-*).
