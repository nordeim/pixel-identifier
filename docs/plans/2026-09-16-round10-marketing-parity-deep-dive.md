# Round 10 — Marketing Parity Deep-Dive & Remediation Plan

**Date:** 2026-09-16
**Scope:** Fresh live audit of pixelco.io (marketing landing, scroll-stimulated
section captures, full `:root` token extraction) and app.pixelco.io
(logged-in; app-bundle token extraction + dashboard re-diff), pairwise VLM
comparison against the production build, with every flagged drift verified
against live DOM ground truth (computed styles, class lists, HTML structure).
**Baseline:** main @ `8869ec8` (Round-9 complete; `npm run verify` green —
lint, typecheck, 198 tests / 28 files, build 35 routes).
**Evidence:** `research/round10-audit/live/` (10 landing sections + 7
dashboard pages), `research/round10-audit/local/` (same surfaces),
`research/round10-audit/vlm/` (pairwise diffs).

## Method

1. Captured the live landing scroll-stimulated (10 section viewports at
   1440×900) and all 7 logged-in dashboard pages; captured the identical
   local surfaces on the production build. (An initial local capture batch
   was invalidated — the browser was still on the settings page when the
   landing scroll extraction ran; re-captured logged-out and fresh.)
2. Ran pairwise VLM diffs on all 17 surface pairs; triaged every claim
   against live DOM ground truth (computed styles + class lists + HTML).
   Dashboard surfaces: **CLOSE MATCH across all 7 pages** (residuals are
   account-data differences only). Marketing: multiple real drifts.
3. Extracted the live **marketing bundle `:root`** and the live **app bundle
   `:root`** — the two surfaces ship different palettes, and the clone's
   single global palette matches neither exactly.

## Findings (severity-ordered; all Verified against live DOM)

| ID | Severity | Finding | Evidence |
|----|----------|---------|----------|
| R10-F1 | Critical | **Marketing palette drift.** Live marketing `:root`: `--background: 0 0% 100%` (#FFFFFF), `--foreground: 230 25% 12%` (#171A26), `--card: 40 30% 98%` (rgb(251,250,248)), `--secondary: 40 30% 96%` (rgb(248,246,242)), `--muted: 230 15% 92%`, `--muted-foreground: 230 10% 46%` (rgb(106,109,129)), `--accent: 45 100% 50%` (#FFBF00, **yellow**) + `--accent-foreground: 0 0% 0%`, `--primary-foreground: 0 0% 5%`, `--border/--input: 230 15% 90%` (rgb(226,227,233), cool gray), `--ring: 45 100% 50%`, `--radius: .625rem` (10px). Clone ships ONE global warm-cream palette (background #fffcf5, card #ffffff, border #e7e5df warm, accent #fef9c3 pale, radius 12px) matching neither bundle exactly — the marketing tree renders cream bg + warm hairlines + pale accent + 12px corners | live `:root` CSS extraction (marketing + app bundles); computed body bg rgb(255,255,255) vs rgb(255,252,245); audience card bg rgb(251,250,248) vs rgb(255,255,255); card border rgb(226,227,233) vs rgb(231,229,223); `src/app/globals.css:64-103`; `src/app/(marketing)/layout.tsx:21` (scopes only `--primary`) |
| R10-F2 | High | **Hero structure drift.** Live: section `pt-16 pb-20 overflow-hidden` + inner `container mx-auto px-6` + grid `lg:grid-cols-2 gap-12 lg:gap-8 items-center` + text col `max-w-xl`; badge is a card chip `inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-card border border-border mb-6` containing ★★★★★ (`text-highlight`) + `w-px h-3 bg-border` divider + accent-dot label (`text-xs font-medium text-muted-foreground`, not uppercase, no emoji); h1 `text-4xl sm:text-5xl lg:text-[3.5rem] font-bold tracking-tight leading-[1.1] mb-5` with the em-dash INSIDE an italic `text-gradient-hero` span; subtitle `text-lg text-muted-foreground leading-relaxed mb-8` with italic `<em>and</em>`; trust pills `mb-8` ✓; avatar row `mb-6` (no mt-8); CTAs `flex flex-col sm:flex-row gap-3 mb-4` — primary `gradient-cta … px-7 h-12 text-base font-semibold w-full sm:w-auto rounded-md`, secondary `border bg-background … hover:bg-card font-medium`; takes-line `text-xs text-muted-foreground` with `·` separators; **no radial-gradient decoration**; feed wrapper `relative lg:pl-4`. Clone: max-w-7xl grid + radial decoration + amber badge (`bg-primary/10 border-primary/40` + 🌟 + uppercase amber-700) + `font-extrabold lg:text-[3.4rem] leading-tight` + dash outside non-italic em + `mt-6 max-w-xl` subtitle + `mt-8` avatar row + solid bg-primary CTA + `•` separators text-sm | live hero HTML extraction; `src/components/marketing/hero.tsx` |
| R10-F3 | High | **Benefits list is single-column.** Live: `grid sm:grid-cols-2 gap-x-6 gap-y-7` (2-col, 6 items); items `flex gap-3` with `w-9 h-9 rounded-lg bg-secondary` icon boxes + `w-4.5 h-4.5 text-primary` (18px) icons; h2 `text-3xl sm:text-4xl font-bold mt-2 mb-10`; screenshot wrap `relative rounded-xl shadow-elevated overflow-hidden border border-border bg-card` — **no padding**, img `w-full`. Clone: `ul.space-y-6` single-col, `h-5 w-5` (20px) icons, extrabold h2, `p-4 sm:p-5 shadow-xl shadow-black/5` wrap | live benefits DOM; `src/components/marketing/features.tsx:57-100` |
| R10-F4 | High | **Pricing defaults + toggle + CTA matrix.** Live **defaults to Annual on fresh load**: an iOS switch (`button.relative w-14 h-7 rounded-full bg-primary` + knob `span.translate-x-7`, `aria-label="Toggle annual pricing"`) with "Monthly" (muted) / "Annual" + `Save 20%` (`text-xs text-accent font-semibold`) labels in `flex items-center justify-center gap-3 mt-8`; default prices $63/$199/$639; Free card CTA is **secondary-styled** (bg rgb(248,246,242) = bg-secondary) with text **"Free Tier"** and no arrow; base cards `relative rounded-xl p-7 border border-border shadow-card bg-card` (p-7, shadow-card, no flex-col); Growth card `border-2 border-primary shadow-elevated bg-background p-7` ✓ + POPULAR pill ✓ (`text-[10px] font-bold uppercase`); "billed annually" notes ✓. Clone: segmented 2-button pill toggle defaulting **Monthly**; Free CTA gradient "Start Free" + arrow; cards p-6 shadow-sm flex-col | live pricing DOM (fresh-load toggle state + computed CTA styles); `src/components/marketing/pricing-section.tsx` |
| R10-F5 | Medium | **Process section chrome.** Live: section `py-20 bg-card border-y border-border` (full tints, flat py-20); cards `relative bg-background rounded-xl border border-border p-6 shadow-card` (**bg-background + shadow-card**, clone: bg-card + shadow-sm); icon boxes `w-10 h-10 rounded-lg gradient-hero` (3-stop yellow ✓ = clone's `gradient-hero-light`); grid `grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto`; feature points are `flex items-center gap-2` rows with a `w-2 h-2 rounded-full bg-accent` **yellow dot + plain text** — NOT bordered pills | live process DOM; `src/components/marketing/how-it-works.tsx:95-151` |
| R10-F6 | Medium | **Compare section structure + copy.** Live: section `py-20 bg-card border-y border-border` + inner `container mx-auto px-6`; grid `max-w-4xl mx-auto grid md:grid-cols-2 gap-6`; left card `rounded-xl border border-border bg-background p-7`; right card `rounded-xl border-2 border-primary bg-background p-7 relative shadow-elevated` (**bg-background white**, not amber tint); badge `absolute -top-3 left-6 px-3 py-0.5 rounded-full gradient-cta text-xs font-semibold` (**left-6-anchored**, not centered); headings are `h3.font-bold text-foreground mb-1` (not uppercase `<p>`); sub `text-sm text-muted-foreground mb-5`; right sub copy **"Individual email identification"**; list items `flex items-center gap-2.5` with `text-destructive` X icons. Clone: `/60` `/50` tints, py-16, max-w-5xl, bg-card cards, amber-tinted right card (`bg-primary/5`), centered uppercase badge, uppercase p-headings, "Individual-level identification", items-start | live compare DOM; `src/components/marketing/features.tsx:102-156` |
| R10-F7 | Medium | **Audience section chrome.** Live: section `py-20 border-t border-border` + inner `container mx-auto px-6`; header `text-center mb-14`; grid `grid sm:grid-cols-3 lg:grid-cols-5 gap-4 max-w-5xl mx-auto`; cards `bg-card rounded-xl border border-border p-5 text-center shadow-card hover:shadow-elevated transition-shadow`; icon wraps `w-10 h-10 rounded-lg bg-secondary … mx-auto mb-3` (40px, square-ish, neutral secondary) + `w-5 h-5 text-primary` icons; h3 `font-semibold text-sm text-foreground mb-1`; p `text-xs text-muted-foreground leading-relaxed`. Clone: max-w-7xl ON the section (no border-t), py-16, gap-5 sm:grid-cols-2, `shadow-sm hover:shadow-md`, round amber `h-11 w-11 rounded-full bg-primary/15` icons, h3 `mt-4 font-bold` | live audience DOM; `src/components/marketing/how-it-works.tsx:63-93` |
| R10-F8 | Medium | **CTA card details.** Live: card `relative max-w-4xl mx-auto rounded-2xl gradient-hero p-6 sm:p-10 md:p-14 text-center overflow-hidden` + radial overlay `bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent_60%)]` + inner `relative z-10`; paragraph `text-white/80 text-base sm:text-lg max-w-xl mx-auto mb-8`; button `bg-background text-foreground border-0 h-12 px-8 text-base font-semibold w-full sm:w-auto` (no mt-8, no shadow); trust row `flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 mt-6 text-white/70 text-xs` with THREE `flex items-center gap-1.5` spans + `CircleCheckBig w-3.5` icons: "No credit card required", "100 free identifications", "GDPR compliant". Clone: no overlay/z-10, `mt-4 max-w-2xl` paragraph, `mt-8 bg-white font-bold shadow-lg` button, one-line "•"-separated trust text with different copy ("Setup in 30 seconds") | live CTA DOM; `src/components/marketing/faq-footer.tsx:84-115` |
| R10-F9 | Low | **Kicker/H2 typography.** Every live kicker: `text-xs font-semibold text-primary uppercase tracking-widest` (clone: `font-bold … text-amber-600`). Every live h2: `text-3xl sm:text-4xl font-bold` (clone: `font-extrabold tracking-tight`). Sections 3-8 | live DOM h2/kicker extraction across all sections |
| R10-F10 | Low | **Section wrapper pattern.** Live sections are full-bleed (`py-20` + borders on the section) with an inner `container mx-auto px-6`; process/compare/FAQ use full `bg-card`/`border-border` (clone: `bg-card/50`, `border-border/60`, `py-16 lg:py-20`). Sections 3/5/7 (audience/benefits/pricing) carry `max-w-7xl px-4` ON the section (clone) vs `container px-6` inner (live) — inset borders + tablet width drift | live section class map (all 10 sections) vs local map |
| R10-F11 | Low | **Footer chrome.** Live: `<footer class="mt-20">` → inner `border-t border-border bg-background` → `container mx-auto px-6 py-14` → grid `grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-10` (+ col-span utilities on the brand cell). Clone: `border-t border-border/60 bg-card` + `mx-auto max-w-7xl px-4 py-12 sm:px-6` + `md:grid-cols-[2fr_1fr_1fr_1fr]` | live footer HTML; `src/components/marketing/faq-footer.tsx:117-121` |
| R10-F12 | Low | **Stats grid breakpoint.** Live `grid grid-cols-2 md:grid-cols-4 gap-8`; clone `lg:grid-cols-4` (4-col kicks in one breakpoint late) | live stats DOM; `src/components/marketing/social-proof.tsx:98` |
| R10-F13 | Low | **App canvas micro-drift.** Live app body bg `rgb(246,247,249)` = #F6F7F9 (app `--background: 220 20% 97%`); clone `.bg-app` = #F9FAFB | live app computed body bg; `src/app/globals.css` (`.bg-app`) |
| R10-F14 | Deferred | **Scroll-reveal entrance animations.** The live's marketing elements carry reveal animations (`opacity:0; translateY(16-24px)` → visible on scroll, inline styles). At-rest state matches the clone exactly; per the audit rules entrance timing is out of scope, and the repo's motion convention is CSS-only (PAD §5.4). Deferred — recorded for a future round | live hero/compare HTML (`style="opacity: 0; transform: translateY(16px)"`) |

**Verified as matching this round (no action):** dashboard surfaces (all 7
pages — overview KPIs/trend/top-pages/recent, visitors table, activity feed
semantics, install, domains, pricing, settings; residuals are data-only);
marquee + testimonials + stats content (R9 structure holding — only the
token-level card/border colors drift, fixed by F1); FAQ section structure
(card items, shadow on open); announcement bar; site header; "By Ai Viral"
wordmarks; login/signup pages (R8/R9 restorations holding); app-bundle
tokens (primary #FFC105, radius 12px, Space Grotesk/Inter, gradients,
glows, hot-pink/neon-green/highlight — all aligned); hero trust pills,
avatar row, and feed widget content.

## Remediation ToDo (TDD — RED first at every seam)

- [ ] **A. Marketing palette scope (R10-F1)**
  - A1 RED — `tests/marketing-theme.test.ts`: parse
    `src/app/globals.css` + `src/app/(marketing)/layout.tsx`; require a
    `.marketing-scope` class defining the 13 live marketing tokens
    (background #ffffff, foreground #171a26, card hsl(40 30% 98%),
    secondary hsl(40 30% 96%), muted hsl(230 15% 92%), muted-foreground
    hsl(230 10% 46%), accent #ffbf00, accent-foreground #000, primary #ffbf00,
    primary-foreground #0d0d0d, border/input hsl(230 15% 90%), ring #ffbf00,
    radius 0.625rem) and the marketing layout wrapper applying it (+ bg-background).
  - A2 GREEN — add `.marketing-scope` to `globals.css` (live HSL values),
    apply to the marketing wrapper div (replacing the one-off
    `[--primary:#ffbf00]` arbitrary property), keep app tokens untouched.
  - A3 — `.bg-app` #F9FAFB → #F6F7F9 (R10-F13).
- [ ] **B. Hero rebuild (R10-F2)**
  - B1 RED — extend `tests/social-proof.test.tsx`-style SSR render
    (`tests/marketing-hero.test.tsx`): h1 `lg:text-[3.5rem] font-bold … leading-[1.1] mb-5`,
    italic gradient span containing "— By Their Email", card-chip badge
    (`bg-card border border-border` + ★★★★★ + accent dot + no emoji),
    subtitle `mb-8` + `<em>and</em>`, CTA `gradient-cta` + `w-full sm:w-auto`,
    secondary `bg-background`, takes-line `text-xs` + "·" separators,
    no `radial-gradient` decoration, section `pt-16 pb-20`, text col `max-w-xl`,
    container `container mx-auto px-6`.
  - B2 GREEN — rewrite `hero.tsx` to the live DOM verbatim.
- [ ] **C. Benefits grid (R10-F3)**
  - C1 RED — SSR render of `Features`: grid `sm:grid-cols-2 gap-x-6 gap-y-7`,
    items `flex gap-3`, icons `w-4.5 h-4.5` (18px), wrap
    `shadow-elevated overflow-hidden` with no padding utilities, h2 `mt-2 mb-10 font-bold`.
  - C2 GREEN — rebuild the features list + screenshot wrap.
- [ ] **D. Pricing (R10-F4)**
  - D1 RED — SSR render of `PricingSection` (default state): annual prices
    $63/$199/$639 render by default, iOS switch (`w-14 h-7` + knob +
    `aria-label="Toggle annual pricing"`), "Save 20%" label, Free CTA text
    "Free Tier" + `bg-secondary`, base cards `p-7` + `shadow-card`, no `flex flex-col`.
  - D2 GREEN — rebuild the toggle as the live switch (useState 'annual'),
    CTA matrix (Free: secondary "Free Tier"; Growth: gradient; others:
    secondary "Get Started"), card chrome.
- [ ] **E. Process + audience (R10-F5, R10-F7)**
  - E1 RED — SSR render of `Audience` + `HowItWorks`: audience section
    `py-20 border-t border-border` + container inner + grid
    `sm:grid-cols-3 lg:grid-cols-5 gap-4 max-w-5xl mx-auto`, cards
    `shadow-card hover:shadow-elevated`, icons `w-10 h-10 rounded-lg bg-secondary`,
    h3 `font-semibold text-sm … mb-1`; process section full `bg-card border-y border-border py-20`,
    cards `bg-background … shadow-card`, tags as `flex items-center gap-2` +
    `w-2 h-2 rounded-full bg-accent` dots (no pill classes).
  - E2 GREEN — rebuild both components.
- [ ] **F. Compare + CTA + footer (R10-F6, R10-F8, R10-F11)**
  - F1 RED — SSR render of `Comparison` + `BottomCta` + `SiteFooter`:
    compare cards `bg-background p-7`, right card `border-2 border-primary … shadow-elevated`,
    badge `left-6` + `gradient-cta`, h3 headings, copy "Individual email
    identification", list items `flex items-center`; CTA radial overlay +
    `relative z-10` + trust row (3 spans + CircleCheckBig + "GDPR compliant");
    footer `bg-background` inner + `container mx-auto px-6 py-14` + `lg:grid-cols-5`.
  - F2 GREEN — rebuild the three components.
- [ ] **G. Typography + wrappers (R10-F9, R10-F10, R10-F12)**
  - G1 RED — assert (via the SSR renders above) every kicker
    `text-xs font-semibold text-primary uppercase tracking-widest` and every
    h2 `text-3xl sm:text-4xl font-bold`; stats grid `md:grid-cols-4`.
  - G2 GREEN — sweep the kicker/h2 classes + stats breakpoint + section
    wrapper pattern (full-bleed sections with `container mx-auto px-6` inner
    + flat `py-20`) across all marketing components.
- [ ] **H. Gate + browser verification**
  - H1 — `npm run verify` (lint → typecheck → test → build) green.
  - H2 — production server browser pass: re-capture every changed surface,
    re-run pairwise VLM diffs, verify computed tokens (body bg white, card
    warm-white, accent yellow, 10px radius on marketing only) and zero
    console errors; confirm the app bundle is untouched (dashboard spot-check).
- [ ] **I. Documentation**
  - I1 — PAD v1.9 revision block + §5.2 token table refresh + suite counts;
    README test-count + notes; AGENTS.md/CLAUDE.md deltas (marketing-scope
    convention: "marketing palette lives in `.marketing-scope`, not per-component").
  - I2 — this plan's execution log + worklog entry.
- [ ] **J. Commit + push**
  - J1 — Conventional Commits, atomic workstreams (A/B/C/D/E/F/G docs).
  - J2 — `npm run verify` → `docs/ssh_git_wrapper_v3.py` push via the
    paramiko shim (runbook Appendix A); key shredded after.

## Risk notes

- The `.marketing-scope` approach keeps the app bundle's palette untouched —
  the dashboard was verified CLOSE MATCH this round, so the fix must NOT
  leak into `/dashboard/*` or the auth pages (auth pages use the app bundle
  palette on the live, which the clone's global tokens approximate).
- The pricing default flip (monthly → annual) changes the `?cycle=`
  plan-intent the marketing page sends into `/signup` — the signup action
  already accepts both cycles (`plans.ts` owns both price tables), so this
  is display-default only; verify the signup intent link still resolves.
- Removing `flex flex-col` from pricing cards must not break card internal
  layout — the live's natural flow (name → desc → price → CTA → features)
  works without flex; mirror the live class lists exactly.
- The hero rebuild touches the largest rendered surface — re-verify the
  feed widget column and the announcement bar are unaffected (both match
  today; they live outside `hero.tsx`).
