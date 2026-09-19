# Round 19 — Marketing Geometry Audit & Remediation Plan

**Date:** 2026-09-19 · **Repo state at start:** main @ 7c5c0bb (R18 ship) · **Author:** Super Z (session_16)

## 1. Context

R18 shipped the marketing-bundle class-emission realignment (12 components, 30 pins,
suite 519/52). R18's verification pinned class STRINGS and geometry seams (settings
pixel-exact, auth 11px gaps) but the marketing bundle's CSS RESOLUTION and the hero
feed widget's RUNTIME MODEL were not probed. R19 extends the audit to computed styles
(geometry + backgrounds) on the marketing surfaces.

### R19 audit results (evidence: /tmp/r19-caps, agent-browser + base64 JSON transport)

- **Live drift watch — 4th consecutive STABLE audit.** Marketing body DOM
  byte-identical to R18 (86,004 chars, md5 d2550c77…). All 7 dashboard pages: 0
  token drift. Dashboard clone-side: documented residuals only (D2/D4), zero new
  drifts. Auth geometry regression probe: 11px gaps on both sides (R18 holds).
- **Baseline gate at 7c5c0bb:** lint ✓ · typecheck ✓ · 519 tests / 52 files ✓ ·
  `next build` ✓.

### Findings

| ID | Severity | Finding |
|----|----------|---------|
| F1 | **real bug** | `.gradient-hero` resolves DARK on every marketing surface. The live's marketing bundle CSS defines `.gradient-hero { background: var(--gradient-hero) }` with `:root { --gradient-hero: linear-gradient(135deg, hsl(40 100% 50%) 0%, hsl(50 100% 55%) 50%, hsl(35 100% 48%) 100%) }` (amber 3-stop, NOT redefined in `.dark`). The clone's single `.gradient-hero` definition is the auth/app-bundle dark sweep (`#0f111a → #2b2312`). Measured: step chips live `linear-gradient(135deg, rgb(255,170,0) 0%, rgb(255,217,26) 50%, rgb(245,143,0) 100%)` vs clone `linear-gradient(135deg, rgb(15,17,26), rgb(43,35,18))`. Surfaces: announcement bar (`announcement-bar.tsx:21`), how-it-works step chips (`how-it-works.tsx:145`), faq-footer CTA banner (`faq-footer.tsx:99`). |
| F2 | **real bug** | Hero "Live Visitor Feed" widget's row model diverges from the live's. Live (extracted from `/assets/index-C3AAh5Je.js`, symbols PD/TD/ND): **5 entries** `{id, label, email, delay}` — sarah.jones / james.miller92 / maria.garcia / alex.thompson / priya.patel (all @gmail.com; labels "Anonymous Visitor"/"Unknown User"/"Site Visitor"; delays [0, 1.8, 3.6, 5.4, 7.2]); per-row state machine **enter → scan (delay·1000+600ms) → reveal (+1600) → done (+3200, row unmounts)**; parent re-mounts all rows every **10s cycle** (key `${id}-${cycle}`); row `top = index*56 + 12px`; avatar animates backgroundColor muted → `hsl(var(--primary))` on reveal (0.4s) with icon User → Mail; content swaps label+"Browsing your site…" → email+"✓ Identified"; "Matching…" pulsing badge during scan; ✓ spring badge during reveal. Clone: 8 static entries (incl. non-live emails sofia.larsen@yahoo.com, d.chen@…), 2.6s offset rotation, static statuses, `top = 8 + slot*56`, no scan/reveal phases. Measured offset: live rows 464/520 vs clone 404/460 (60px + swapped avatar colors mid-rotation). |
| F3 | non-finding | Live avatars 2-5 returned HTTP 404 during the R19 capture session — **transient CDN hiccup**; all five return 200 on re-check (and R8's guard pins the local set). No action; do not replicate broken images. |
| F4 | **real gap** | Hero trust-row avatar PHOTOS are different people. Live's current set (content-hashed: avatar-1-xs9X7jqQ… avatar-5-D6miPMAM, 512px) vs the clone's R8-era 96px set — VLM-verified all 5 columns differ. The live swapped photos after R8's capture. Fix: replace with the live's current photos, downscaled to the repo's 96px convention (displayed at 32px — 3× DPR coverage). |

Excluded per standing instructions: `skills/` folder (not checked, tested or compiled).

## 2. Remediation (TDD — RED pin first, then fix, then GREEN)

### 2.1 F1 — scoped amber gradient-hero

- **Pin (RED):** `tests/marketing-r19-parity.test.tsx` — the compiled
  `src/app/globals.css` must contain a `.marketing-scope .gradient-hero` rule with the
  amber 3-stop image; the bare `.gradient-hero` (auth) stays dark; and the marketing
  components keep emitting the `.gradient-hero` class string (R18 pins hold).
- **Fix:** add to `globals.css` (utilities layer, next to the existing gradient
  utilities):
  `.marketing-scope .gradient-hero { background-image: linear-gradient(135deg, #ffaa00 0%, #ffd91a 50%, #f58f00 100%); }`
  — one bundle, two resolutions, mirroring the live's two-bundle architecture
  (marketing bundle amber / app bundle dark). The auth shell sits OUTSIDE
  `.marketing-scope`, so it keeps the dark sweep. The amber stops are the byte-exact
  hex equivalents of the live's hsl() stops (R12 channel-rounding convention).
- **Cleanup:** remove the now-dead `.gradient-hero-light` utility (superseded by
  R18's class-string realignment — the live's marketing bundle defines no such
  class). Negative pins in `marketing-r18-parity.test.tsx` / `marketing-process.test.tsx`
  keep asserting components don't emit it.

### 2.2 F2 — live's feed model

- **Pins (RED):** feed widget renders the live's five entries (labels + emails);
  rows carry `top: {index*56+12}px`; per-row phase machine with the live's timing
  constants (SCAN +600ms, REVEAL +1600ms, DONE +3200ms after delay·1000); 10s cycle
  re-mount; "Matching…" badge during scan; ✓ badge during reveal; avatar
  background-color transitions muted → primary on reveal; anonymous label renders
  the entry's varied label (not a constant "Unknown User").
- **Fix:** rewrite `src/components/marketing/live-feed.tsx`:
  - `DEMO_ENTRIES` → the live's 5-entry array (labels, emails, delays) verbatim.
  - `FeedRow` component: `phase` state (`'enter' | 'scan' | 'reveal' | 'done'`),
    one `useEffect` arming three timeouts at the live's offsets, cleanup on
    unmount/re-mount (dep: entry.delay + cycle).
  - Parent: `cycle` state + 10s `setInterval`; rows keyed `` `${id}-${cycle}` ``.
  - Row style: `position:absolute; top: index*56+12; left:0; right:0` + the pinned
    class chain (`feed-row flex items-center gap-3 px-4 py-3 …` — class string
    unchanged so R18 pins hold).
  - Avatar: inline `background-color` flips muted → primary at reveal with a 0.4s
    CSS transition (new `.feed-avatar` transition rule); icon User → Mail.
  - Content: phase < reveal → label + "Browsing your site…"; reveal → email +
    "✓ Identified".
  - "Matching…" badge (opacity pulse, 1s) while scan; ✓ badge while reveal.
  - Enter animation: existing `feed-in` keyframes (0.45s) approximates the live's
    framer-motion 0.5s opacity/x entry; exit = unmount at done (the live's rows
    exit-animate via AnimatePresence; CSS-only approximation documented as D5-class
    reveal machinery).
  - Reduced-motion: `feed-in` already disabled; badge pulse adds
    `prefers-reduced-motion` guard.
- **Icons:** Globe / ArrowRight / Mail / User — verified identical to the live's
  bundle symbols (Bl/hr/Uh/Z2 = "globe"/"arrow-right"/"mail"/"user").

### 2.3 F4 — avatar photos

- Download the live's five current `avatar-{1..5}-*.jpg` (512px), downscale to
  96×96 (repo convention — displayed at 32px), save over
  `public/assets/avatars/avatar-{n}.jpg`. Existing asset-guard pins keep passing
  (files exist + referenced); no class-string change.

## 3. Verification

1. Full gate: `npm run lint` · `npm run typecheck` · `npx vitest run` (expect 519+N)
   · `npm run build`.
2. Browser re-audit (agent-browser, 1440×900): re-probe the step chips' computed
   background (must be the amber 3-stop), the announcement bar + CTA banner
   backgrounds, the feed row tops (index·56+12), the avatar row photos, auth gaps
   (11px), settings geometry re-check (live session re-login), E2E dashboard smoke.
3. Screenshots → `docs/screenshots/` (landing hero incl. feed widget, how-it-works
   chips, CTA banner, dashboard).
4. Visual spot-check via VLM on the re-captured pairs.

## 4. Docs & ship

- PAD → v1.18 (R19 section: findings, fixes, residual notes).
- `docs/session_16.md` (new session log, session_15 format).
- README / AGENTS.md / CLAUDE.md — test counts + R19 facts.
- `.env.example` — verified matching (DATABASE_URL / NEXTAUTH_SECRET /
  NEXTAUTH_URL; tracked since e95a20e); re-verify before commit.
- Atomic commits on main (F1 CSS + pin → F2 feed rewrite + pins → F4 avatars →
  verification evidence → screenshots → docs), then push via
  `docs/ssh_git_wrapper_v3.py` with the operator SSH key (fingerprint verified
  first; key shredded after push; no new branches).

---

## 5. Execution Log (2026-09-19, session_16)

### Audit (pre-remediation)
- Baseline gate at 7c5c0bb: lint ✓ · typecheck ✓ · 519/52 ✓ · build ✓.
- Live drift watch: marketing body DOM **byte-identical to R18**
  (86,004 chars, md5 d2550c77…); dashboard tokenizer: zero changes on all
  7 pages (4th consecutive stable audit); auth geometry regression 11px
  both sides (R18 holds).
- Geometry probes (agent-browser, 1440×900, base64 JSON transport):
  step chips live = amber 3-stop vs clone = dark; announcement bar +
  CTA banner same pattern; feed rows live 464/520 vs clone 404/460 with
  swapped avatar colors (rotation-phase artifact of the model divergence).
- Live bundle source analysis (index-C3AAh5Je.js + index-bLMWzsGr.css):
  full PD/TD/ND feed model + `.gradient-hero{background:var(--gradient-hero)}`
  with the amber 3-stop on `:root` (not redefined in `.dark`); icons
  Bl/hr/Uh/Z2 = globe/arrow-right/mail/user.
- F3 ruled a non-finding: live avatars 2-5 404 during capture → all 200
  on re-check (transient CDN hiccup).
- F4 confirmed via VLM montage comparison: all five local photos are
  different people from the live's current set.

### TDD remediation
- **RED**: `tests/marketing-r19-parity.test.tsx` — 12 pins across F1
  (scoped amber CSS + bare dark + dead-utility removal + component class
  seams), F2 (roster data/labels/emails/delays, phase-machine constants,
  10s cycle, badges, avatar transition, geometry + static-render
  DOM pins), F4 (perceptual avatar-hash pin, offline-deterministic via
  stored live hashes). 10 failed / 2 passed.
- **GREEN**: 
  - `globals.css`: added `.marketing-scope .gradient-hero` (amber
    3-stop, byte-exact hex of the live's hsl stops) beside the dark bare
    rule; retired `.gradient-hero-light`; added `.feed-avatar`
    (0.4s background-color transition) + `feed-matching` keyframes
    (opacity .3→1→.3, 1s infinite) with reduced-motion guards.
  - `live-feed.tsx`: rewritten to the live's model — 5-entry roster,
    `FeedRow` phase machine (SCAN_AT 600 / REVEAL_AT 1600 / DONE_AT
    3200 after delay·1000), 10s CYCLE_MS parent re-mount, row tops
    `index*56+12`, phase-gated "Matching…" and ✓ badges, avatar
    muted→primary flip with User→Mail icon swap.
  - `public/assets/avatars/avatar-{1..5}.jpg`: replaced with the live's
    current photos downscaled to 96px (sharp, q82).
  - 2 superseded R18 B5 pins updated to the phase model (static render
    is the t=0 enter state; reveal-state strings pinned at source level).
- **Gate**: lint ✓ · typecheck ✓ · **531 tests / 53 files** (+12) ·
  `next build` ✓ (compiled CSS verified: both gradient rules present).

### Post-fix browser verification (standalone server, fresh static)
- Initial run hit a **zombie server** from the interrupted session
  holding port 3000 (EADDRINUSE, stale assets) — killed, static+public
  recopied, re-run.
- F1: chips ×4 amber ✓ · announcement bar amber ✓ · CTA banner amber ✓ ·
  login auth canvas dark `rgb(15,17,26)→rgb(43,35,18)` ✓.
- F2: feed rows offsetTops **[12, 68, 124, 180, 236] — identical to the
  live probe**; VLM widget-crop comparison: layout/stats/colors/structure
  identical (row text differs only by rotation phase).
- F4: 5 avatars loaded (96px, naturalWidth OK).
- Settings geometry: live [237/325/413, save 501] == local
  [237/325/413, save 501] — **PIXEL-EXACT**. Probe note: the live's
  settings page has no `<form>` (D2 machinery) — measured via the
  form-independent `div.p-6.pt-0.space-y-4` card selector; the live
  login needed a retry (transient reject).
- E2E console-error sweep: **zero errors** across 10 pages
  (7 dashboard + landing + login + signup).
- VLM visual confirmations: chips amber gradient ✓ · CTA banner amber ✓ ·
  login canvas dark navy-to-brown ✓.
- Screenshots: 7 files in `docs/screenshots/` (landing hero+feed,
  how-it-works chips, CTA banner, login dark canvas, dashboard,
  dashboard settings, live landing reference).
