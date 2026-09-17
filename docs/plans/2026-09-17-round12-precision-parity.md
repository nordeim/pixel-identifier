# Round 12 — Precision Parity & Scroll-Reveal Remediation Plan

**Date:** 2026-09-17
**Scope:** Fresh live audit of pixelco.io (10 landing sections, aligned
per-section captures) and app.pixelco.io (7 dashboard pages, logged in);
pairwise VLM re-diffs on all surfaces with DOM triage of every claim; targeted
root-cause extraction of the two pre-standing section-height residuals (hero
779 vs 762, marquee 426 vs 403) and the twice-deferred scroll-reveal entrance
animations (R10-F14).
**Baseline:** main @ `11061cb` (Round-11 complete + session_8 doc; `npm run
verify` green — lint, typecheck, 291 tests / 41 files (2 skipped), build 35
routes).
**Evidence:** `research/round12-audit/{live,live-aligned,local,local-aligned,vlm}/`
(17 VLM verdicts + aligned per-section captures), DOM extraction logs in this
plan and the worklog.

## Method

1. Baseline gate re-run on the fresh clone (Round-11 state verified:
   291/41 green before any change).
2. Live audit with agent-browser: token dumps (app + marketing bundles),
   section enumeration with heights, aligned per-section screenshots
   (`window.scrollTo(section.offsetTop)` on both sides after a warm-up pass —
   `scrollIntoView` does not stick on the live), full reveal-element map
   (39 elements, per-section translateY values), reveal timing sampling
   (rAF loop reading inline styles), icon SVG-path extraction on both sides,
   H1 font-metric + CSSOM cascade analysis, quote text/glyph diff, CTA card
   geometry, 404/login DOM extraction.
3. Pairwise VLM diffs (17 pairs). Dashboard verdicts: 6 EXACT + 2 CLOSE
   (data-only). Landing (aligned): 8 EXACT, 2 CLOSE, 1 DIFFERENT (benefits —
   the real icon drift, F1). Login: EXACT. 404: DOM-verified (VLM
   rate-limited; R11 pinned tests + identical class strings minus the
   deliberate a11y focus class).
4. Every finding below is **verified against live DOM** (computed styles,
   CSSOM rules, SVG paths, or inline-style sampling); every VLM claim was
   triaged — the hero "badge icon" and benefits "Privacy Compliant shield"
   claims were misreads (byte-identical paths both sides), the Add-Domain
   "color" claim was a misread (identical computed gradients).

## Findings (severity-ordered; all verified against live DOM)

| ID | Severity | Finding | Evidence |
|----|----------|---------|----------|
| R12-F1 | High | **Scroll-reveal entrance animations missing** (R10-F14, deferred twice — now specced). The live animates 39 marketing elements: inline `opacity: 0; transform: translateY(Npx)` → `opacity: 1; transform: none` on viewport entry (once, no un-reveal), N ∈ {12, 16, 20, 24}. Map: marquee track y12; section headers y16; stats cards y16; testimonial cards y20; audience cards y20; step cards y24; benefit items y16 (screenshot wrapper fade-only y0); compare card y20; pricing cards y24; FAQ container y16; CTA card y24. Hero elements animate on mount with a stagger. Timing: ~100 ms stagger between siblings, each element fully in within ~400-500 ms, whole group done in ~700 ms (rAF-sampled on the pricing section: 5 elements at t≈400/500/600/700 ms). The live animates via a JS library (mid-flight fractional translateY observed, e.g. `2.89667px`), but the clone's motion convention is CSS-only — a shared IntersectionObserver + CSS transitions reproduces the visual without a JS animation library. The live's marketing bundle is CSR (2.9 KB HTML shell), so its no-JS story is "nothing renders"; the clone (RSC) will use progressive enhancement: the hidden state applies only when JS is active | live reveal-element map + timing samples (this audit) vs `src/components/marketing/*` (no reveal attributes anywhere) |
| R12-F2 | Medium | **Hero H1 line-height — the 17 px hero residual.** The live renders the H1 at ratio 1.0 for viewports ≥ 640 px (computed 56 px at 3.5 rem font) while the clone renders 1.1 (61.6 px): 3 lines × 5.6 px = +17 px (hero 779 vs live 762; the left column is the taller grid track: 635 vs 618). Root cause: the live's Tailwind v3 pairs `.sm\:text-5xl { font-size: 3rem; line-height: 1 }`, and variant rules are emitted after plain utilities — so at ≥ sm the H1's `leading-[1.1]` loses the cascade to `sm:text-5xl`'s `line-height: 1`. The clone's Tailwind v4 uses the `--tw-leading` var machinery, so `leading-[1.1]` correctly wins at every viewport. Below 640 px the live's `leading-[1.1]` does win (39.6 px at 36 px font) | live CSSOM rule dump + computed line-heights vs `.next/static/chunks/2f61-*.css` (`@media … .lg\:text-\[3\.5rem\]{font-size:3.5rem}` — no line-height) and `hero.tsx:59` |
| R12-F3 | Medium | **Testimonial quote glyphs — the 23 px marquee residual.** The live renders testimonials in ASCII straight quotes (`"Pixelco identified…"`); the clone wraps them in typographic curly quotes (`“…”`). Same 100-char text, but the wider curly glyphs push quote #2 ("We went from guessing…") onto a 4th line (91 px vs 68 px paragraph), stretching all three cards (grid stretch) to 221 vs live 198 → marquee section 426 vs 403 | live vs local quote textContent + paragraph heights (68/68/68 vs 68/91/68) vs `social-proof.tsx:81` (`“{t.quote}”`) |
| R12-F4 | Medium | **Benefits "B2B Company Reveal" icon.** The live renders a custom building SVG (rounded-rect tower with two window bars, a U-shaped door, and side annexes — 5 paths, `M6 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16` head, `M10 8h4`/`M10 12h4` windows, `M14 21v-3a2 2 0 0 0-4 0v3` door, merged wings `M6 10H4a2…`). The clone uses lucide `Building2` (4 window rows, no door, different outline). Verified NOT a lucide icon: scanned all 5,466 exports of lucide-react 0.525 plus 0.263/0.294/0.344/0.395/0.446/0.485 — zero path-set matches. The other five benefit icons are byte-identical lucide glyphs (UserRound / Globe / ChartColumn / Zap / ShieldCheck) | live SVG path extraction vs lucide package scan vs `features.tsx:14-18` |
| R12-F5 | Low | **Marketing `--foreground` family mangled by Lightning CSS.** The source `.marketing-scope` defines `hsl(230 25% 12%)`, which Tailwind v4's minifier converts to `#171926` (floor-rounds the 25.5 green channel); the live's v3 pipeline keeps the HSL raw and the browser computes `#171A26` (rgb 23, 26, 38) — a 1/255 green-channel drift on every marketing foreground text node. Affects `--foreground`, `--card-foreground`, `--popover-foreground`, `--secondary-foreground`. All other marketing tokens round identically both ways (verified channel-by-channel: card #FBFAF8, secondary #F8F6F2, muted #E8E9EE, border #E2E3E9, muted-fg #6A6D81, primary #FFBF00 — all exact). The app `:root` set has no .5-boundary values and ships exact (#131520 foreground etc.) | built CSS `.marketing-scope{--foreground:#171926…}` vs live computed `rgb(23, 26, 38)` + hand-computed HSL→RGB table |
| R12-F6 | Low | **Gradient submit buttons carry variant bg classes.** The live builds its gradient CTAs as base + consumer classes only (twMerge drops the base's `font-medium`/`transition-colors` against the consumer's `font-semibold`/`transition-all`, and NO variant fragment appears): Add-Domain (domains), Sign In (login), Start Free Trial (signup) all render `…[&_svg]:shrink-0 gradient-primary text-primary-foreground shadow-lg glow-primary hover:opacity-90 transition-all duration-300 font-semibold h-10 px-4 py-2 [w-full]`. The clone's default variant contributes `bg-primary hover:bg-primary/90` ahead of the same overrides (renders identically — the gradient image covers the bg-color — a class-parity item). Verified escape hatch: cva treats `variant={null} size={null}` as explicit skip → base + className only (tested in-node). An earlier suspected signup-button variant drift was a false alarm (the compared live button was the Google OAuth placeholder — the real "Start Free Trial" buttons match in text/labels/arrow/gradient) | live button className extraction (3 surfaces) vs `domains-panel.tsx`, `login-form.tsx`, `signup-form.tsx` |
| R12-F7 | Verified | **Everything else at parity this round.** Dashboard: 6 EXACT (dashboard, visitors, activity, pricing, settings + login) + 2 CLOSE (domains, install — data-only residuals: account initials, demo-DB rows, snippet URLs, domain names). Landing aligned: 8 EXACT (stats, audience, how-it-works, compare, pricing, FAQ, CTA + login) + 2 CLOSE (hero, marquee — F2/F3 are their residuals). App + marketing token sets live-exact (except F5). Trend chart strokes (purple/teal/cool grid), KPI card structure, sidebar chrome, pricing annual-default toggle, CTA card geometry (340×896, identical gradient + radial sheen), 404 boundary — all verified matching. Triaged VLM misreads: hero badge icons (byte-identical: CircleCheckBig/ChartColumn/Zap), benefits "Privacy Compliant" icon (ShieldCheck both sides), Add-Domain "pale yellow" (identical computed gradient) | vlm/*.json + DOM extractions |

## Fix plan (workstreams)

### Workstream A — Scroll-reveal entrance animations (F1)

- **A1 (RED):** `tests/marketing-reveal.test.tsx` + `tests/marketing-reveal.test.ts`:
  - SSR pin: the six marketing components render `data-reveal`/`data-reveal-delay`
    attributes at the live's coordinates (39 elements, y ∈ {12,16,20,24},
    stagger delays 0/100/200/…).
  - CSS pin: `globals.css` defines the reveal styles — hidden state scoped to
    `.js-reveal` (progressive enhancement), `.is-revealed` terminal state,
    `prefers-reduced-motion` opt-out, and the layout mounts the enabling
    inline script (`js-reveal` class on `<html>`) plus the
    `RevealObserver` client island.
  - Component pin: `RevealObserver` is a client component that queries
    `[data-reveal]`, shares ONE IntersectionObserver, sets the initial
    inline styles (opacity 0, translateY from the attribute, transition),
    and flips to `opacity: 1; transform: none` on intersect (once).
- **A2 (GREEN):** implement:
  - `src/components/marketing/reveal-observer.tsx` — the client island
    (single shared IntersectionObserver, `rootMargin` generous enough to
    pre-reveal just-below-fold content like the live's mount behavior).
  - `globals.css` — `.js-reveal [data-reveal]{opacity:0;transform:translateY(var(--reveal-y))}`-style
    rules with the transition on `[data-reveal]`, terminal `.is-revealed`
    state, reduced-motion guard (mirrors the existing `.feed-row` pattern).
  - The marketing layout mounts the observer + a blocking inline script
    that adds `js-reveal` to `<html>` before paint.
  - Apply `data-reveal="<y>"` (+ `data-reveal-delay="<ms>"` where the live
    staggers) across: hero (badge, h1, p, trust pills, avatar row, CTA row,
    takes-line, feed column), social-proof (marquee track y12, 3 cards y20,
    4 stat cards y16), how-it-works (headers y16, audience cards y20, step
    cards y24, feature row y16), features (header y16, 6 items y16,
    screenshot y0), comparison (header y16, grid card y20), pricing (header
    y16, 4 cards y24), FAQ (header y16, container y16), CTA (card y24).
  - At-rest output must remain byte-identical post-reveal (attributes only —
    no class changes on the sections themselves).
- **A3:** browser verification on the production build: elements start
  hidden only with JS, reveal on scroll (once), staggered; no layout shift;
  zero console errors; `prefers-reduced-motion` respected.

### Workstream B — Marketing precision fixes (F2, F3, F4, F5)

- **B1 (RED):** extend the existing pin files:
  - `tests/marketing-hero.test.tsx`: H1 class becomes
    `… leading-[1.1] sm:leading-none mb-5` (mobile keeps 1.1 like the live's
    sub-sm cascade; ≥ sm renders ratio 1.0).
  - `tests/social-proof.test.tsx`: quotes render ASCII `"` (no `“`/`”`).
  - `tests/marketing-benefits.test.tsx`: the B2B item renders the live's
    5-path custom icon (pin the first path `M10 12h4` + count).
  - `tests/marketing-theme.test.ts`: the four foreground-family tokens are
    literal `#171a26` (browser-rounded value; comment documents the
    Lightning CSS floor-rounding trap).
- **B2 (GREEN):** apply the four source fixes (`hero.tsx` H1 class,
  `social-proof.tsx` quote glyphs, `features.tsx` custom `CompanyBuilding`
  icon component with the live's exact paths, `globals.css` token values).

### Workstream C — Gradient submit-button class alignment (F6)

- **C1 (RED):** a focused test pins the merged class strings of the three
  gradient CTAs (domains Add-Domain, login Sign In, signup Start Free
  Trial) to the live's exact output — no `bg-primary`, no
  `hover:bg-primary/90`, `h-10 px-4 py-2` at the tail.
- **C2 (GREEN):** switch the three consumers to
  `<Button variant={null} size={null} className="…live's exact string…">`
  (cva null = explicit variant skip, verified in-node).

### Workstream D — Verification gate

- `npm run verify` (lint → typecheck → test → build) must be green.
- Fresh standalone build + browser pass: hero 762 px, marquee 403 px
  (the two residuals close), reveal behavior works, computed marketing
  foreground `rgb(23, 26, 38)`, zero console errors.
- Pairwise VLM re-diff on hero, marquee, benefits, domains (expect
  EXACT/CLOSE with residuals gone or data-only).

### Workstream E — Documentation

- PAD → v1.11: revision block, §5 token table note (Lightning CSS rounding
  rule: half-channel values must ship as pre-rounded hex), §5.4 motion
  section gains the scroll-reveal convention, §8 suite counts.
- README: test counts + the reveal feature line.
- AGENTS.md / CLAUDE.md: non-obvious facts (reveal seam + the
  `js-reveal` progressive-enhancement class; the H1 `sm:leading-none`
  v3-cascade-quirk note; the icon provenance).
- Plan execution log + worklog entries.

### Workstream F — Ship

- Atomic Conventional Commits on main only, in workstream order.
- Pre-push secret scan, then push via `docs/ssh_git_wrapper_v3.py` +
  paramiko shim (runbook Appendix A), key from operator stdin, shred after.

## Risks & notes

- The reveal attributes must not alter at-rest SSR output beyond adding
  data attributes; all existing SSR pins must stay green (the class strings
  are untouched).
- `data-reveal` + `--reveal-y` CSS var: the hidden transform must not
  create a scrollbar flash — the translateY happens inside the element's
  own box (transform does not affect layout), so no CLS.
- The `js-reveal` inline script must run before first paint: placed in the
  marketing layout body start (Next App Router executes it during
  streaming, before the browser paints below-the-fold content; the
  worst-case flash is the un-animated at-rest state, which is the current
  behavior anyway).
- The H1 fix changes hero height (779 → 762) — any test pinning 779-ish
  geometry would need updating (none found; SSR tests pin class strings,
  not heights).
- The quote fix changes card heights (221 → 198): the social-proof test
  pins class strings only (verified).
- The custom icon component lives in `features.tsx` (single consumer);
  lucide conventions (24 viewBox, stroke 2, round caps/joins) so it renders
  indistinguishably from the lucide set.

## Execution Log (completed 2026-09-17)

- **B (marketing precision)** — RED: 4 pins updated/extended
  (`marketing-hero.test.tsx` H1 `sm:leading-none`,
  `social-proof.test.tsx` ASCII quotes, `marketing-benefits.test.tsx`
  custom B2B icon paths, `marketing-theme.test.ts` `#171a26` foreground
  family) — 4 failing confirmed → GREEN: `hero.tsx` H1 class
  `leading-[1.1] sm:leading-none mb-5`; `social-proof.tsx` `&quot;` glyphs;
  `features.tsx` `CompanyBuildingIcon` (the live's 5-path custom SVG,
  lucide drawing conventions); `globals.css` four foreground-family tokens
  → literal `#171a26` with the Lightning CSS floor-rounding note.
- **C (gradient buttons)** — RED `tests/gradient-buttons.test.tsx` (4
  failing) → GREEN: the three consumers (`domains-panel.tsx` Add-Domain,
  `login-form.tsx` Sign In, `signup-form.tsx` Start Free Trial) render
  `variant={null} size={null}` + the live's exact class string (cva null =
  explicit variant skip; twMerge drops the base's font-medium /
  transition-colors against font-semibold / transition-all exactly like
  the live's DOM). Merged strings now byte-identical to the live's three
  extractions.
- **A (scroll-reveal)** — RED `tests/marketing-reveal.test.tsx` (11
  failing) → GREEN:
  - `src/components/marketing/reveal-observer.tsx` — ONE shared
    IntersectionObserver client island; arms every `[data-reveal]`
    (`--reveal-y` from the attribute, `reveal-armed` activates the
    transition, `transition-delay` from `data-reveal-delay`), flips to
    `.is-revealed` once on entry (unobserve, never un-reveals),
    `rootMargin: 0px 0px -10% 0px`.
  - `globals.css` — `.js-reveal [data-reveal]` hidden state (progressive
    enhancement), `.is-revealed` terminal state,
    `[data-reveal].reveal-armed` transition (opacity/transform .5s ease),
    reduced-motion guard (transition: none).
  - `(marketing)/layout.tsx` — pre-paint inline script adds `js-reveal`
    to `<html>`; `<RevealObserver />` mounted.
  - 46 `data-reveal` coordinates applied across hero (8 mount-staggered
    elements incl. the fade-only takes-line y0 and the feed column),
    marquee (wrapper y12 — the track itself is busy with
    animate-scroll-left's transform; 3 cards y20), stats (4× y16),
    audience (header + 5 cards), process (header + 4 steps y24 + tags),
    benefits (kicker+h2 wrapper — matching the live's classless reveal
    div — + 6 items + fade-only screenshot), compare (header + ONE grid
    wrapper like the live), pricing (header + 4 cards y24), FAQ (header +
    list wrapper), CTA (card y24).
- **D gate** — `npm run verify` GREEN: lint ✓, typecheck ✓, **308 tests /
  43 files** (2 skipped), build ✓ + `build:standalone`. Fresh-server
  browser pass: `js-reveal` on `<html>`, 46/46 armed, hero reveals on
  mount, scroll reveals fire once and stay; **hero 762 px and marquee
  403 px — both live-exact (was 779/426)**; H1 computed line-height 56 px
  (was 61.6); marketing `--foreground` `#171a26`; zero console errors
  beyond the expected 404 log lines from 404-route testing. VLM re-diffs:
  CTA **EXACT MATCH (0.99)**; hero/marquee/benefits verdicts carry only
  the known data residuals (feed-rotation timing, our own avatar/screenshot
  assets) + the triaged icon misread (all six benefit icons re-verified
  byte-identical against the live paths on the fresh build); the
  Add-Domain and Sign In buttons render the live's exact merged strings.
- **E (docs)** — PAD v1.11, README counts + feature line, AGENTS.md +
  CLAUDE.md reveal/H1/token conventions, this log, worklog entries.
- **F (ship)** — atomic Conventional Commits on main only; push via
  `docs/ssh_git_wrapper_v3.py` + paramiko shim (runbook Appendix A).
