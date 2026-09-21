# Round 11 — App-Bundle Primitives & Palette Parity Plan

**Date:** 2026-09-17
**Scope:** Fresh live audit of pixelco.io (12 landing sections, scroll-stimulated)
and app.pixelco.io (logged-in; full `:root` token extraction of BOTH bundles),
aligned pairwise VLM comparison against the local production build, every claim
triaged against live DOM ground truth (computed styles, class strings, geometry).
The round's headline discoveries are **systemic**: the live app bundle has
migrated to a cool-gray neutral palette with a teal accent, and the live ships
LEGACY-generation shadcn/ui primitives where the clone's `src/components/ui/`
layer was generated from the NEW generation — inflating every dashboard Card by
48px and reshaping Badge/Input/Tabs/Select/Button chrome.
**Baseline:** main @ `902facf` (Round-10 complete + session docs; `npm run
verify` green — lint, typecheck, 241 tests / 34 files, build 35 routes).
**Evidence:** `research/round11-audit/live/` (landing + login + 7 dashboard
pages + token dumps), `research/round11-audit/local/` (same surfaces),
`research/round11-audit/vlm-aligned/` (pairwise diffs, index-corrected).

## Method

1. Captured the live landing scroll-stimulated (12 section viewports at
   1440×900) and all 7 logged-in dashboard pages; captured the identical local
   surfaces on the production build (port 3100). An initial VLM pass compared
   mismatched section indices (the live DOM carries an extra zero-height
   `section` at the top of the landing) — re-run with the mapping
   `local[N] == live[N+1]` before triage.
2. Ran pairwise VLM diffs on all aligned pairs; triaged every claim against
   live DOM ground truth. VLM misreads were common this round (icons, badge
   geometry, button gradients) — every finding below carries DOM evidence.
3. Extracted BOTH live bundles' complete `:root` custom-property sets
   (`research/round11-audit/live-app-tokens.json`,
   `research/round11-audit/live-mkt-tokens.json`), then measured rendered
   geometry (card heights, badge classes, input computed backgrounds, footer
   link maps, section header margins) on both surfaces.
4. Captured the live's verified-domain banner state by switching the install
   page's site selector to the pre-existing research domain
   (`clone-research-test.com`, registered during earlier rounds).

## Findings (severity-ordered; all Verified against live DOM)

| ID | Severity | Finding | Evidence |
|----|----------|---------|----------|
| R11-F1 | Critical | **App-bundle token palette drift.** Live app `:root` now ships a cool-gray neutral ramp with a navy foreground family and a TEAL accent: `--background: 220 20% 97%` (#F6F7F9), `--foreground: 230 25% 10%` (#131520), `--card-foreground/--popover-foreground/--secondary-foreground/--accent-foreground/--primary-foreground: 230 25% 10%`, `--border/--input: 220 13% 91%` (#E3E5EA), `--secondary/--muted: 220 14% 96%` (#F4F5F7), `--muted-foreground: 220 9% 46%` (#6A6D79), `--accent: 172 66% 50%` (= neon-green teal), `--ring: 45 100% 51%`, `--destructive: 0 84% 60%`, plus a full sidebar token set (`--sidebar-background: 0 0% 100%`, `--sidebar-border: 220 13% 91%`, `--sidebar-accent: 45 30% 96%`, `--sidebar-accent-foreground: 45 100% 40%`, `--sidebar-primary: 45 100% 51%`, `--sidebar-ring: 45 100% 51%`). Clone ships white `--background`, warm-cream neutrals (`#f5f0e6` secondary, `#e7e5df` border/input), gray-900 `#111827`/`#1c1917` foregrounds, pale-yellow `#fef9c3` accent, `#eab308` ring, oklch sidebar tokens. Every app-tree border, input fill, secondary chip and muted text renders warm instead of cool. Marketing scope tokens are UNCHANGED and fully aligned (verified token-by-token) | live app `:root` dump (getComputedStyle enumeration); clone `src/app/globals.css:67-111`; live domains input computed bg rgb(246,247,249) vs clone rgba(0,0,0,0) |
| R11-F2 | Critical | **shadcn primitive generation drift — the live ships LEGACY primitives, the clone NEW.** Measured impact on every consumer: (a) **Card** — live base `rounded-lg border bg-card text-card-foreground shadow-sm` (no padding/flex on the root; content divs carry their own `p-6 …`); clone base adds `flex flex-col gap-6 py-6` → **every app Card renders +48px** (KPI cards 186 vs 138, trend/recent cards 424 vs 386, pricing banner 124 vs 76, enterprise card 148 vs 100, FAQ grid 544 vs 355; the whole dashboard content column sits ~48-190px lower than the live). (b) **Badge** — live base `inline-flex items-center rounded-full border font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2` with `border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80`-style variants and per-use `text-[10px] px-1.5/px-2 py-0` overrides; clone ships the new rounded-md/font-medium base. (c) **Input** — live `flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background … focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2` (renders the #F6F7F9 tint inside white cards); clone ships new base (`bg-transparent … focus-visible:ring-ring/50 focus-visible:ring-[3px] shadow-xs`). (d) **Tabs** — live TabsList `inline-flex h-10 items-center rounded-md bg-muted p-1 text-muted-foreground w-full justify-start mb-4` + trigger `inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5` (data-state); clone ships rounded-lg list + flex-1 rounded-md bordered pill triggers. (e) **Select trigger** — live `flex h-10 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background … focus:ring-2 focus:ring-ring focus:ring-offset-2 … [&>span]:line-clamp-1`; clone ships new base. (f) **Button** — live focus `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2` + `[&_svg]:size-4 [&_svg]:shrink-0`; clone ships new ring-[3px] focus + aria-invalid classes (gradient CTA rendering is otherwise identical — verified computed) | live dashboard DOM class extraction (KPI card, banner card, FAQ cards, badge bases on activity/visitors/sidebar, install tabs, visitors select, domains button); clone `src/components/ui/{card,badge,input,tabs,select,button}.tsx`; measured card heights 186/424 vs 138/386 |
| R11-F3 | High | **Sidebar footer chrome.** Live: `data-sidebar="footer"` wrapper `flex flex-col gap-2 p-4 space-y-3` (no border-t); FREE badge = legacy Badge + `text-[10px] px-1.5 py-0 gradient-primary text-primary-foreground border-0`, literal text "FREE"; usage `<p class="text-xs text-muted-foreground leading-snug">` (no mt-2); progress track `h-1.5 w-full rounded-full bg-muted mt-2 overflow-hidden`; sign-out button `flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors w-full px-1` (no rounded-lg/py-2/font-medium/hover:bg-muted). Clone: `border-t border-border p-3` wrapper, span badge "Free" (uppercase via CSS), `mt-2` on the p, styled-up sign-out button | live sidebar footer HTML; clone `src/components/dashboard/sidebar-shell.tsx` footer block |
| R11-F4 | Medium | **Install status banners.** Live WAITING: `mt-4 p-3 bg-neon-green/5 border-neon-green/20 border rounded-lg` — "Waiting for first event…"; live VERIFIED: `mt-4 p-3 bg-neon-green/10 border-neon-green/30 border rounded-lg` — "Pixel verified! We're receiving data from {domain}. Everything is working." Clone verified banner carries border `/20` (live `/30`); waiting banner matches values but class order differs | live install page (both states captured — pending domain + verified research domain); clone `src/app/dashboard/install/page.tsx:131,143` |
| R11-F5 | Medium | **Marketing pricing section header missing `mb-14`** (56px) — section height 746 vs live 814; the live's header wrapper is `text-center mb-14`, the clone's is bare `text-center` | live/clone `#pricing .container` children measurements |
| R11-F6 | Medium | **Marketing FAQ section header missing `mb-12`** (48px) — live header wrapper `text-center mb-12`, clone bare `text-center` (also compounds the pricing-section shortfall above it) | live/clone `#faq .container` children measurements |
| R11-F7 | Medium | **`id="benefits"` anchor on the wrong section.** Live: the "Everything you need to unmask your traffic" section carries `id="benefits"`; clone: the audience section ("Who Is Pixelco For?") carries it and the real benefits section has NO id — the header nav "Benefits" link jumps to the wrong section | live/clone section id enumeration + h2 texts |
| R11-F8 | Low | **Anchor href format.** Live header/footer anchors are same-page hashes (`#benefits`, `#pricing`, `#how-it-works`, `#faq`); clone ships `/#benefits`-style path-prefixed hrefs | live/clone anchor href extraction |
| R11-F9 | Medium | **Hero secondary CTA target.** Live "See Live Demo" → `https://app.pixelco.io` (the app entry — lands on /login for anonymous visitors); clone → `#live-demo`, a clone-invented in-page anchor to the hero feed widget (different behavior, not present on the live) | live hero CTA hrefs; clone `src/components/marketing/hero.tsx:126,134` |
| R11-F10 | Medium | **Footer brand wordmark is not a link.** Live wraps the wordmark in `<a href="/" class="flex items-center gap-2 mb-4">` (logo img + "Pixelco" + italic "By Ai Viral" with inline font style); clone renders a bare `<span class="inline-flex items-center gap-2">` (no link, no mb-4 — the 9px footer-height delta traces here) | live footer brand block HTML; clone `src/components/pixelco-logo.tsx:58-70` + `faq-footer.tsx:140` |
| R11-F11 | Low | **Careers renders as a disabled span.** Live renders `<a href="#">Careers</a>` (a real dead anchor, like the live's other `#` socials); clone renders `<span aria-disabled="true" class="cursor-default …">Careers</span>` | live footer link map; clone `faq-footer.tsx:177-181` |
| R11-F12 | Low | **font-mono stack.** The live app bundle defines NO `--font-mono` (Tailwind's system stack: ui-monospace, SFMono-Regular, Menlo…); the live marketing bundle DECLARES `"JetBrains Mono"` but loads no JetBrains webfont (document.fonts shows only DM Sans + Dancing Script) — so both live trees effectively render system mono. The clone ships the Geist Mono webfont in both trees | live document.fonts + `--font-mono` reads on both bundles; clone `src/app/layout.tsx` (Geist Mono import) + `globals.css --font-mono` |
| R11-F13 | Low | **Trend chart hardcoded warm strokes.** Clone grid/axis `#E7E5DF` (warm) vs live `hsl(220, 13%, 91%)` + tick text `hsl(220, 9%, 46%)`; series colors match (purple `hsl(262 83% 58%)` / teal `hsl(172 66% 50%)`, hardcoded on both sides). The stale `--chart-1: #f59e0b` / `--chart-2: #2dd4bf` tokens in globals.css don't match the live's chart tokens either (live defines none) but are unused by the chart | live/clone chart SVG stroke extraction; clone `src/components/dashboard/trend-chart.tsx:38,43` |
| R11-F14 | Info | **New live tokens defined-but-unused.** `--electric-blue: 199 89% 48%`, `--glow-accent`, `--gradient-accent`, `--gradient-card`, `--destructive-foreground`, `--font-body` exist on the live app `:root`; no rendered DOM element references them (verified class scan). No parity action — recorded in the PAD | live token dump + DOM class scan |

**Verified as matching this round (no action):** marketing palette scope (all
18 `.marketing-scope` tokens token-identical to the live marketing bundle —
R10's work is holding); gradient-primary/gradient-hero (app dark variant +
marketing yellow variant) and gradient-cta stop colors (computed-identical);
POPULAR badge geometry (`absolute -top-3 left-1/2 -translate-x-1/2`, 10px
offset both); process step cards (238×250, identical classes — only LI-vs-DIV
tag differs, a no-visual-impact semantic difference); benefits icons (six
identical SVG paths + chips); sidebar nav icons (byte-identical paths across
all 7 items); Add Domain button rendering (identical computed gradient + glow
— only a redundant `bg-primary` class differs under the opaque gradient);
sidebar background (white both); CTA card (340px, identical classes + stops);
footer bottom band; trend chart series colors; dashboard content semantics
(all 7 pages' data surfaces).

**Invalidated VLM claims (honesty record):** sidebar Visitors icon "target vs
eye" (byte-identical lucide-eye paths); Add Domain button "pale vs saturated"
(identical computed gradient/glow); POPULAR badge "above vs inside border"
(identical); process cards "narrower/taller" (identical geometry); benefits
"rocket vs paper-plane icons" (identical); overview chart shape (data-driven);
marquee ordering (animation frame); waiting banner "blue vs green" (both
neon-green/5); status badge colors (state-driven per account data; the
shape/token drift is real and filed as F1/F2).

**Deferred (unchanged from R10):** scroll-reveal entrance animations (CSS-only
motion convention; at-rest parity holds).

## Remediation ToDo (TDD — RED first at every seam)

- [ ] **A. App token palette (R11-F1)**
  - A1 RED — new `tests/app-theme.test.ts`: parse `src/app/globals.css`;
    require the app `:root` block to define the live's cool-neutral token set
    verbatim (background `220 20% 97%`, foreground `230 25% 10%`, card white,
    card/popover/secondary/accent/primary-foreground `230 25% 10%`,
    border/input `220 13% 91%`, secondary/muted `220 14% 96%`,
    muted-foreground `220 9% 46%`, accent `172 66% 50%`, ring `45 100% 51%`,
    destructive `0 84% 60%`, sidebar set: background `0 0% 100%`, border
    `220 13% 91%`, accent `45 30% 96%`, accent-foreground `45 100% 40%`,
    primary `45 100% 51%`, primary-foreground `0 0% 100%`, ring
    `45 100% 51%`) AND require `.marketing-scope` to remain untouched (guard
    against collateral edits).
  - A2 GREEN — rewrite the app `:root` neutrals/foregrounds/accent/ring/
    destructive + sidebar tokens to the live values (HSL, verbatim); retire
    the now-unused warm values. Keep `--primary: #ffc105` (live-equivalent
    45 100% 51%), radius scale, brand utilities, `.marketing-scope`, `.bg-app`
    (the live's --background IS #F6F7F9 — `.bg-app` keeps rendering the same
    canvas color for the dashboard wrapper).
  - A3 — align `--chart-1/--chart-2` to the live's rendered series (purple
    `hsl(262 83% 58%)` / teal `hsl(172 66% 50%)`) and switch
    `trend-chart.tsx`'s hardcoded grid/axis/tick strokes to the cool values
    (`hsl(220, 13%, 91%)` grid+axis, `hsl(220, 9%, 46%)` ticks) — R11-F13.
- [ ] **B. Legacy shadcn primitives (R11-F2)**
  - B1 RED — new `tests/ui-primitives.test.ts(x)`: SSR-render each primitive
    and pin the live's class strings: Card root `rounded-lg border bg-card
    text-card-foreground shadow-sm` with NO `py-6`/`flex flex-col`/`gap-6`;
    Badge base `rounded-full font-semibold … focus:ring-2 focus:ring-ring
    focus:ring-offset-2` + secondary variant `border-transparent bg-secondary
    text-secondary-foreground hover:bg-secondary/80`; Input `bg-background
    … ring-offset-background … focus-visible:ring-2 focus-visible:ring-offset-2`
    with NO `bg-transparent`/`ring-[3px]`/`shadow-xs`; TabsList `rounded-md
    bg-muted p-1` (no rounded-lg) + trigger `rounded-sm px-3 py-1.5` (no
    flex-1/border/shadow); Select trigger `bg-background … focus:ring-2
    focus:ring-offset-2`; Button focus `ring-2 ring-offset-2` (no
    `ring-ring/50`/`ring-[3px]`).
  - B2 GREEN — rewrite `src/components/ui/{card,badge,input,tabs,select,
    button}.tsx` to the legacy shadcn generation (keeping the live's svg
    conventions `[&_svg]:size-4 [&_svg]:shrink-0` where present).
  - B3 — sweep the 7 Card / 3 Badge / 2 Tabs consumers for reliance on the
    new primitives' behavior (CardHeader grid, CardContent px-6, badge
    per-use overrides) and align to the live DOM; delete redundant
    `bg-primary` on the domains CTA (invisible but class-hygiene).
  - B4 — verify rendered geometry: KPI cards 138px, trend/recent 386px,
    pricing banner 76px, enterprise 100px, FAQ grid 355px (browser pass).
- [ ] **C. Sidebar footer chrome (R11-F3)**
  - C1 RED — extend the dashboard-chrome/sidebar tests: footer wrapper
    `flex flex-col gap-2 p-4 space-y-3` (no border-t), Badge text "FREE",
    usage p `text-xs text-muted-foreground leading-snug` (no mt-2), sign-out
    button `flex items-center gap-2 text-xs … w-full px-1` (no rounded-lg/
    py-2/font-medium/hover:bg-muted).
  - C2 GREEN — rewrite the sidebar footer block to the live DOM (Badge
    component from B2 supplies the base).
- [ ] **D. Install banners (R11-F4)**
  - D1 RED — pin both banner class strings: waiting `mt-4 p-3
    bg-neon-green/5 border-neon-green/20 border rounded-lg`, verified `mt-4
    p-3 bg-neon-green/10 border-neon-green/30 border rounded-lg`.
  - D2 GREEN — align `install/page.tsx` banners (verified border /20 → /30;
    class order to the live's verbatim).
- [ ] **E. Marketing parity (R11-F5..F12)**
  - E1 RED+GREEN — pricing header wrapper gains `mb-14` (extend
    `tests/marketing-pricing.test.tsx`).
  - E2 RED+GREEN — FAQ header wrapper gains `mb-12` (extend
    `tests/marketing-compare-cta.test.tsx` or the FAQ seam).
  - E3 RED+GREEN — move `id="benefits"` from the audience section to the
    "Everything you need" section; add an SSR test asserting the benefits
    h2's section carries the id (and the audience section does not).
  - E4 RED+GREEN — `marketing-links.ts` nav/footer anchor hrefs `/#x` →
    `#x` (live-verbatim); update the link-integrity test expectations.
  - E5 RED+GREEN — hero secondary CTA `#live-demo` → `/dashboard` (the
    clone's app entry; anonymous visitors hit the login redirect exactly like
    the live's app-root CTA); drop the `id="live-demo"` anchor + its
    marketing-links test entry.
  - E6 RED+GREEN — footer wordmark wrapped in `<a href="/"
    class="flex items-center gap-2 mb-4">` (inline SVG logo stays — honest
    divergence, documented); "By Ai Viral" span classes to the live's
    `text-xs text-muted-foreground italic translate-y-[3px]`.
  - E7 RED+GREEN — Careers renders `<a href="#">` (data keeps `dead: true`;
    the integrity test asserts the anchor, not a span).
  - E8 — font-mono: drop the Geist Mono webfont; `--font-mono` → Tailwind
    system stack in both trees (update layout.tsx font wiring + globals).
- [ ] **F. Verification gate**
  - F1 — `npm run verify` green (lint → typecheck → test → build).
  - F2 — browser pass on the production build: computed app tokens match the
    live dump; KPI cards 138px; badges pill-shaped; inputs tinted #F6F7F9;
    install tabs = grey bar; sidebar footer structure; marketing: pricing
    section 814px, FAQ spacing, #benefits jump target, footer wordmark link,
    Careers anchor; zero console errors.
  - F3 — pairwise VLM re-diff on the changed surfaces; triage residuals
    against DOM (VLM misread rate this round was high — DOM is truth).
- [ ] **G. Documentation**
  - G1 — PAD v2.0: R11 revision block; §5.2 token table rewrite (app cool
    palette; legacy-shadcn primitive note in §5.3; F14's unused live tokens
    recorded); §8 suite counts.
  - G2 — README (test counts, primitive-generation note), AGENTS.md +
    CLAUDE.md conventions (legacy shadcn primitives — do not regenerate from
    the new shadcn CLI; cool app palette).
  - G3 — plan execution log + worklog entry.
- [ ] **H. Commit & push**
  - H1 — atomic Conventional Commits on main (one per workstream).
  - H2 — push via `docs/ssh_git_wrapper_v3.py` + paramiko shim (runbook
    Appendix A); pre-push secret scan.

## Risk notes

- The primitive rewrite (B) touches shared components — every consumer must
  be re-verified in the browser pass (F2); the SSR tests pin the class
  strings so regressions fail CI, not the browser.
- The token rewrite (A) changes `--accent` from pale yellow to teal for the
  app tree only — the marketing scope overrides `--accent` to the yellow, so
  the marketing tree must be re-verified untouched (the scope guard test in
  A1 protects this).
- Buttons: the live's focus-ring classes differ but hover/active gradients
  render identically (verified computed) — B2 is a class-string alignment,
  not a visual change on the resting state.

