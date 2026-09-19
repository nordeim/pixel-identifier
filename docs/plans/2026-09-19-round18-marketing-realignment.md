# Round-18 Remediation Plan — App-bundle visual bugs + marketing class realignment

**Date:** 2026-09-19 · **Repo state at plan time:** main @ e77bde8 (PAD v1.16,
484 tests / 51 files) · **Audit evidence:** `research/round18-audit/`
(fresh live + local captures, geometry probes, class-string inventory)

## Context

Round-18 was the planned drift watch (session_14's suggested next step),
executed with a stricter methodology than R17: besides the order-sensitive
tokenizer diff of all 7 dashboard pages, this round added

1. **live-side drift check vs the R17 captures** (dashboard content),
2. **a full-page class-string inventory diff** of the marketing landing
   (token-set-equal but order-different strings isolated from reveal/feed
   animation state),
3. **GEOMETRY probes** (getBoundingClientRect + computed styles) for the
   settings Profile card and every auth form field group — the first round
   to measure rendered geometry, not DOM strings.

- **The live is 100% STABLE since R17** on the dashboard content layer
  (0 class/tag changes on all 7 pages) — the third consecutive stable audit.
- **The R17 verification pass left two real visual bugs undetected** because
  they are geometry bugs (invisible to DOM-string diffs):
  Tailwind v4 compiles `space-y-*` as `margin-block-end` on the PRECEDING
  sibling (`:not(:last-child)`) where the live's v3 applies `margin-top` to
  the FOLLOWING sibling — and vertical margins on INLINE elements (the
  `<label>`s) are ignored by CSS layout. Every `[Label, Input]` field group
  under `space-y-2` renders with a ~8px-shorter label→input gap than the
  live; the settings form additionally intercepts the card body's
  `space-y-4` (its classless `<form>` is the only child, so the 16px
  between-group rhythm never applies — groups render flush).
- **The marketing bundle ships systematically different class-emission
  orders and several utility/color/structure drifts that were never
  byte-verified**: the R10–R12 pins covered CTA buttons, kickers and card
  chrome, but not icon class orders, feed avatars, the header/footer
  chrome containers, or the pricing subtitle. The R15–R17 "marketing
  stable" checks compared text-level section lengths (a class-emission
  rebuild is invisible to them).

## Findings (all DOM- and geometry-verified; evidence in round18-audit/)

### A. App bundle (dashboard + auth)

| ID | Sev | Finding | Evidence |
|---|---|---|---|
| R18-A1 | High | **Settings Profile card — broken vertical rhythm + 3 DOM drifts.** (a) The classless `<form>` intercepts the card body's `space-y-4`: measured group gaps are **0px vs the live's 16px**, the Save button sits 72px higher than the live's. (b) The Save button is wrapped in a clone-authored `div.flex.items-center.gap-3`; the live's button sits directly in the body flow. (c) The disabled email input is missing the live's `opacity-60` (the live's input class string ends `…md:text-sm opacity-60`). | geometry probe (group tops 237/325/413/501 live vs 237/301/365/429 local); settings captures |
| R18-A2 | High | **Auth forms — label→input gap 8px deficit.** The live (TW3) applies `margin-top: 0.5rem` to the input (a block); the clone (TW4) sets `margin-bottom` on the inline `<label>` — ignored by layout. Measured gaps: login Email 11px (live) vs 3px (clone); signup ×3 fields 11 vs 3. Root cause is the TW4 `space-y` compilation, class strings are identical. | computed-style probe (`labelDisplay: inline, labelMarginBottom: 8px` — set but ignored) |
| R18-A3 | Low | **Install platform Card carries clone-authored `aria-labelledby="platform-heading"`** (the live ships the bare Card root). Inert chrome on a generic div (no role — the label does nothing for SR). | install captures; `platform-instructions.tsx:94` |

### B. Marketing bundle (never-byte-verified atoms)

| ID | Sev | Finding | Evidence |
|---|---|---|---|
| R18-B1 | High | **Pricing section subtitle**: the live ships `text-muted-foreground mt-3 max-w-md mx-auto` + `·` (U+00B7) separators; the clone ships `mt-3` (no max-width/centering — the line wraps differently) + `•` (U+2022) bullets. | landing captures; `pricing-section.tsx:29` |
| R18-B2 | High | **Comparison section win list**: the live's check icons are `lucide-check w-4 h-4 text-accent shrink-0` (teal accent); the clone ships `h-4 w-4 shrink-0 text-green-600` (green — visible color drift) + extra `font-medium` on the `li`s + the BEST VALUE pill is a `span` where the live ships a `div`. | landing captures; `features.tsx:172–180` |
| R18-B3 | High | **Benefits icon chips**: the live ships `w-10 h-10 rounded-lg gradient-hero flex items-center justify-center mb-4`; the clone ships `gradient-hero-light mb-4 flex h-10 w-10 …` — **`gradient-hero-light` vs `gradient-hero`** (visible: lighter gradient) + order. | landing captures; features.tsx |
| R18-B4 | Med | **Icon class orders** (~15 distinct strings, 50+ elements): the live emits size before color before margin (`lucide-X w-4 h-4 text-accent shrink-0 mt-0.5`); the clone emits margin-first (`mt-0.5 h-4 w-4 shrink-0 text-accent`). Affects star ×15, check ×14, arrow-right ×6, x ×5, circle-check-big, globe, mail/user, zap, chart-column, code-xml/cpu/file-text/mail ×w-5, shield w-3.5, avatars `w-8 h-8` ×5 (img), building2 double-name. | landing captures; class-order inventory |
| R18-B5 | Med | **Hero feed widget rows**: identified avatar = live `div.w-8 h-8 rounded-full flex items-center justify-center shrink-0` + inline `style="background-color: hsl(var(--primary))"` (solid) vs clone `span.gradient-primary …` (gradient — visible); anon avatar = live div + inline `hsl(var(--muted))` vs clone `span.bg-muted`; row class order (`px-4 py-3 … bg-card/80 border` vs clone flex-first); names `text-sm font-medium text-foreground` vs clone `truncate text-sm font-semibold`. | landing captures; `live-feed.tsx` |
| R18-B6 | Med | **Hero CTAs**: the live wraps a `<button>` in `<a class="w-full sm:w-auto">` with the live's exact tail order (`bg-primary hover:bg-primary/90 rounded-md w-full sm:w-auto gradient-cta text-primary-foreground border-0 hover:opacity-90 px-7 h-12 text-base font-semibold`); the clone renders a flat `<a>` with a different order + an extra `py-2`. The href mapping stays `/signup` (single deployment — documented convention). | landing captures; `hero.tsx` |
| R18-B7 | Med | **Header chrome**: live `container mx-auto flex items-center justify-between h-16 px-6` vs clone `mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6` (live uses the `container` utility, no gap-4); wordmark lockup directly on `<a class="flex items-center gap-2.5">` (clone wraps a span); nav `hidden md:flex items-center gap-7` (clone: gap-8, order); "By Ai Viral" via inline `style="font-family: 'Dancing Script', cursive"` (clone: `font-script` class); nav order string diffs. | about/docs body captures; `site-header.tsx` |
| R18-B8 | Med | **Footer wordmark**: live `text-lg font-bold text-foreground` (NO tracking-tight — the header has it, the footer doesn't) + link `flex items-center gap-2 mb-4` (clone adds `focus-brand rounded-lg`); logo `w-8 h-8` order; social icon order diffs. | footer captures; `faq-footer.tsx` |
| R18-B9 | Low | **Misc container/paragraph orders**: how-it-works grid `grid lg:grid-cols-2 gap-14 items-center` (clone: gap-12, order — visible spacing), audience/stat/testimonial card orders, paragraphs text-first (`text-xs text-muted-foreground mt-0.5` vs clone `mt-0.5`-first), section containers, hero CTA row, stat cards `relative rounded-xl border border-border bg-card overflow-hidden shadow-elevated`, progress bar `h-full rounded-full bg-primary`, feed header/rows px-before-border, marquee list items (extra `font-medium`), stat kicker labels (`text-xs text-muted-foreground font-medium uppercase tracking-wider` vs clone semibold+order), pricing card CTA button orders. | landing captures; class-order inventory |
| R18-B10 | Low | **`lucide-building2 lucide-building-2` double name**: the live's lucide emits both the deprecated and current names on the B2B icon; the clone emits one. | landing captures |

### Non-findings / rulings (documented, no change)

- **Live-side drift since R17: ZERO** (all 7 dashboard pages) — third
  consecutive stable audit.
- **Install notice box** (`bg-neon-green/5 /20` vs `/10 /30`): STATE-dependent
  (the live's site is "waiting"; the clone's demo site is verified —
  R11-pinned receiving branch renders). Data, not structure.
- **D2/D3/D4 re-affirmed**: server-action form machinery; the trend-chart
  `role="img"`+aria-label; lucide's `aria-hidden`. The auth-form aria-labels
  and the combobox aria residuals stay (functional).
- **New D5 ruling — functional a11y chrome kept (invisible):** the billing
  toggle's `role="switch"`+`aria-checked` (the live ships a plain button —
  the clone's switch semantics are the correct toggle a11y), the 8
  marketing `section aria-labelledby`s (region landmarks), decorative
  `aria-hidden` spans (stars, dots, knobs), `focus-brand` focus rings on
  links, the reveal machinery (`data-reveal` attrs/classes/CSS vars vs the
  live's inline styles — R12 design), the `feed-row` animation hook,
  the Sonner toast `<ol>` region.
- **Feed avatar inline styles adapt the variable system:** the live's
  `hsl(var(--primary))` presupposes the HSL-triplet convention; the clone's
  TW4 tokens are hex/oklch, so the avatars ship
  `style="background-color: var(--primary)"` / `var(--muted)` (renders the
  solid swatch; the inline-style structure matches, the hsl() wrapper
  cannot).

## Execution plan (TDD)

1. **RED — pins for the app bundle** (`tests/content-parity.test.tsx`, R18
   describe block): settings email input `opacity-60` tail; Save button
   direct-in-form (no `flex items-center gap-3` wrapper); the form carries
   `space-y-4`; install platform Card without `aria-labelledby`. Plus a
   **CSS pin** (`tests/app-theme.test.ts` or a new geometry test) for the
   `space-y-2 > label + input` rule (v3-semantics restoration present in
   globals.css).
2. **RED — pins for the marketing bundle** (new
   `tests/marketing-r18-parity.test.tsx`): every realigned string from the
   live captures — pricing subtitle classes + `·` chars; comparison win
   checks `w-4 h-4 text-accent shrink-0` + no font-medium + div pill;
   benefits chips `gradient-hero`; icon orders; feed avatars (div + inline
   style) + rows + names; hero CTA structure (a > button + order, no py-2);
   header container/wordmark/nav/By-Ai-Viral inline style; footer wordmark
   (no tracking-tight) + logo order; misc container orders; building2
   double-name.
3. **GREEN — app bundle**: `settings-panel.tsx` (form space-y-4, wrapper
   removal, status messages direct flow, email opacity-60);
   `globals.css` (the label+input pattern rule);
   `platform-instructions.tsx` (drop aria-labelledby).
4. **GREEN — marketing**: `pricing-section.tsx` (subtitle + separators +
   check order + CTA orders + card orders); `features.tsx` (comparison +
   benefits chips + icon orders); `hero.tsx` (CTA structure + trust icon
   orders); `live-feed.tsx` (avatars + rows + names + dot/pulse orders);
   `site-header.tsx` (container/wordmark/nav/By-Ai-Viral/CTAs);
   `faq-footer.tsx` (wordmark/logo/social orders); `how-it-works.tsx` /
   `social-proof.tsx` (grids, list items, kicker labels, building2);
   `marketing-frame.tsx` (main container orders if affected).
5. **Superseded pins** updated in the old R10–R12 marketing tests where
   they pin the old orders (expected: the gradient-CTA/py-2-related hero
   CTA pin, the compare-card pin, the benefits-chip pin, the feed-avatar
   pins if any).
6. **Gate** — lint + typecheck + full suite + build.
7. **Browser verification** — fresh captures + tokenizer re-diff
   (dashboard: only D2/D3/D4/aria residuals + data rows; landing: only
   reveal/feed/toast machinery + D5 chrome) + **geometry re-probe**
   (settings groups 16px; auth label→input 11px).
8. **Docs** — PAD v1.17 revision block; AGENTS.md R18 facts (the TW4
   space-y seam + the marketing realignment conventions); CLAUDE.md
   principle; README test count; session_15.md; worklog; this plan's
   execution log; evidence README.
9. **Ship** — atomic commits on main + wrapper push.

## Plan-vs-codebase validation (done at plan time)

- `settings-panel.tsx:74` (classless form), `:105` (the wrapper div),
  `:102` (email Input without className) — confirmed the three A1 sites.
- `globals.css` carries no label+input spacing rule (grep) — the A2 fix is
  additive; the compiled v4 rule confirmed in the standalone CSS
  (`.space-y-2 > :not(:last-child) { margin-block-end }`).
- `platform-instructions.tsx:94` confirmed shipping `aria-labelledby`.
- `pricing-section.tsx:29` (subtitle + `•`), `:135` (check order) — B1/B4.
- `features.tsx:179` (`text-green-600`), `:172` (`font-medium`), BEST VALUE
  span at `:173` — B2/B3.
- `hero.tsx:83` (`h-4 w-4`), CTA structure at `:120–130` — B4/B6.
- `live-feed.tsx` avatar spans (gradient-primary / bg-muted) — B5.
- `site-header.tsx:15` (`max-w-7xl … px-4 sm:px-6`), `:17–21` (span
  wordmark, gap-8 nav) — B7.
- No existing pins cover A1/A2/A3 or B1–B10 strings (grep — the R17 gap
  class: the R10–R12 pins cover CTAs/kickers/card chrome only). The hero
  CTA / compare / benefits pins that DO overlap are enumerated for
  superseding in step 5.

## Execution log (2026-09-19)

- **RED**: 25 pins in the new `tests/marketing-r18-parity.test.tsx`
  (B1–B11) + 5 pins in `tests/content-parity.test.tsx` (A1 settings form
  rhythm/wrapper/opacity-60, A3 install Card, A2 the globals.css rule) —
  30 failing for the right reasons; 4 superseded R10-era pins identified
  in the old marketing tests.
- **GREEN (app bundle)**:
  - `settings-panel.tsx` — the form carries `space-y-4` (the D2 wrapper
    no longer eats the card body's rhythm); the Save button + status
    messages sit directly in the form flow (wrapper div removed); the
    disabled email Input carries `opacity-60`.
  - `globals.css` — `.space-y-2 > label + input { margin-top: … }` +
    `.space-y-2 > label { margin-bottom: 0 }` (v3-semantics restoration;
    no pinned class string touched).
  - `platform-instructions.tsx` — `aria-labelledby` dropped from the
    platform Card root.
- **GREEN (marketing)**:
  - `pricing-section.tsx` — subtitle `max-w-md mx-auto` + `·` separators;
    the ALWAYS-ON spacer line (`&nbsp;` for free/monthly — the live keeps
    every card's CTA on the same baseline); POPULAR pill order; popular
    card `border border-2`; CTA structure `<Link class="block">` +
    variant-free Button with the live's exact tails (popular carries
    `bg-primary hover:bg-primary/90` before the size fragment); check
    icons `w-4 h-4 text-accent shrink-0 mt-0.5`; Zap/Arrow orders.
  - `features.tsx` — grid `grid lg:grid-cols-2 gap-14 items-center`
    (was gap-12); comparison win checks `text-accent` (was
    text-green-600) + `li` without font-medium + BEST VALUE as a div +
    X order; Compare CTA Link-wrapped default-variant Button; benefits
    chips as bare divs (R17-F3 pattern); CompanyBuildingIcon emits the
    live's lucide double-name classes.
  - `how-it-works.tsx` — step chips `w-10 h-10 rounded-lg gradient-hero`
    (was gradient-hero-light + flex-first) without wrapper aria-hidden;
    step number order; step title/text orders.
  - `live-feed.tsx` — avatars are divs with inline
    `background-color: var(--primary)/var(--muted)` (the live's
    hsl(var()) adapted to the clone's hex token system); rows
    `px-4 py-3`-first; names without truncate; `✓ Identified` +
    font-medium; the stat zap replicated as the live's data-URI img
    (amber #eab308); all card/label orders; the match-rate bar's width
    rides an inline style.
  - `hero.tsx` — trust icons/avatar/arrow orders; both CTAs wrapped in
    `w-full sm:w-auto` anchors around variant-free buttons with the
    live's tails (no py-2).
  - `site-header.tsx` — `container mx-auto … h-16 px-6` container;
    lockup classes on the anchor; nav `gap-7` + link order; CTAs as
    bare-anchor-around-button; mobile trigger `md:hidden text-foreground`.
  - `pixelco-logo.tsx` — PixelcoMarketingWordmark renders a bare
    fragment (PNG logo + spans) so consumers carry the lockup classes;
    header variant adds tracking-tight, footer doesn't.
  - `faq-footer.tsx` — CTA banner `gradient-hero` (was light); CTA
    button Link-wrapped with the live order; trust row's third item is
    a Shield; footer wordmark via the new fragment (no tracking-tight).
  - `announcement-bar.tsx` — `gradient-hero` (was light) + live order.
  - `social-proof.tsx` — star orders; StatsBar values/labels in the
    live orders (font-medium labels).
- **Superseded pins updated (4)**: marketing-compare-cta (CTA banner
  gradient-hero; footer wordmark), marketing-hero (trust row order),
  marketing-pricing (Zap order).
- **Gate**: lint ✓, typecheck ✓, **519 tests / 52 files** (+35), build ✓.
- **Browser verification**:
  - Live-side drift since R17: **ZERO** (all 7 dashboard pages).
  - Dashboard tokenizer re-diff: only the documented D2/D3/D4/aria
    residuals + data rows + the state-dependent install notice.
  - Landing class-order inventory: **zero order-drifts, zero real
    local-only strings**; button class-string inventory: **zero diffs
    (16 = 16)**; the remaining live-only entries are the reveal-state
    pairs (the clone's captured DOM carries `reveal-armed is-revealed`)
    and the feed-row hook — documented D5 machinery.
  - **Geometry re-probe**: the settings Profile card now matches the
    live PIXEL-EXACTLY (groups at top 237/325/413, inputs 269/357/445,
    Save button 501 — was 429 pre-fix); auth label→input gaps 11px on
    both sides (was 3px on the clone).
  - E2E smoke: pricing toggle annual→monthly ($63/$199/$639 →
    $79/$249/$799), CTA hrefs `/signup?plan=…&cycle=…`, settings Save
    renders with the `opacity-60` email tail.
