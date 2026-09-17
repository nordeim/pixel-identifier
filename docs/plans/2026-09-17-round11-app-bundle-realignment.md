# Round 11 — App-Bundle Realignment & Legacy Primitives Remediation Plan

**Date:** 2026-09-17
**Scope:** Fresh live audit of app.pixelco.io (logged in) and pixelco.io;
complete `:root` token re-extraction of both bundles, primitive class-string
extraction (Button/Badge/Card/Tabs/Select/Input/Checkbox), sidebar chrome
mapping, dashboard page-level DOM extraction, marketing seam re-verification.
This round re-executes the Round-11 work that was lost when the previous
session was interrupted before committing (the repo was still at the
Round-10 state, `902facf`).
**Baseline:** main @ `902facf` (Round-10 complete; `npm run verify` green —
lint, typecheck, 241 tests / 34 files (2 skipped), build 35 routes).
**Evidence:** `research/round11-audit/live/` (landing full-page + 7 dashboard
pages + login + collapsed rail), `research/round11-audit/live-ground-truth.md`
(complete DOM extraction log).

## Method

1. Baseline gate re-run on the fresh clone (Round-10 state verified).
2. Live audit with agent-browser: logged into app.pixelco.io, dumped both
   bundles' `:root` token sets, extracted class strings for every primitive
   surface (buttons, badges, cards, tabs, selects, inputs, checkboxes), the
   complete sidebar chrome (header/content/groups/menu/footer, expanded and
   collapsed), page-level details (trend chart, view-all link, badge
   variants across visitors/activity/domains, install tabs + banners, topbar
   buttons, dashboard pricing cards, the 404 boundary), and the marketing
   seams (kickers, header margins, anchors, CTA hrefs, footer, Compare CTA).
3. Every finding below is **Verified against live DOM** (class strings or
   computed styles captured in `live-ground-truth.md`); no VLM-only claims.

## Findings (severity-ordered; all Verified against live DOM)

| ID | Severity | Finding | Evidence |
|----|----------|---------|----------|
| R11-F1 | Critical | **App-bundle neutral-palette migration.** The live app `:root` now ships cool-gray neutrals: `--background: 220 20% 97%` (#F6F7F9 — the canvas moved from white to the cool app-gray at token level), `--foreground: 230 25% 10%` (navy), `--secondary/--muted: 220 14% 96%`, `--border/--input: 220 13% 91%` (#E5E7EB), `--ring: 45 100% 51%`, and **`--accent` is now the teal data accent `172 66% 50%`** (dropdown/ghost hovers render teal). New tokens the live defines and the clone lacks: `--gradient-accent` (teal→blue), `--gradient-card`, `--glow-accent`, `--electric-blue` (`199 89% 48%`). Sidebar tokens: `--sidebar-accent: 45 30% 96%` (= #F8F6F2), `--sidebar-accent-foreground: 45 100% 40%` (= #CC9900), navy `--sidebar-foreground`. The clone's app `:root` still ships the R10 warm set (white bg, `#F5F0E6` secondary, `#FEF9C3` cream accent, `#E7E5DF` warm borders, `#EAB308` ring) | live app `:root` full dump vs `src/app/globals.css:67-111` |
| R11-F2 | Critical | **The clone ships new-generation shadcn primitives; the live ships legacy shadcn.** Systemic consequences: (a) **Card** — new-gen root `flex flex-col gap-6 rounded-lg border py-6` adds +48px to EVERY card (live KPI cards measure 138px, clone 186px); legacy = `rounded-lg border bg-card text-card-foreground shadow-sm`, CardHeader `flex flex-col space-y-1.5 p-6`, CardContent `p-6 pt-0`, CardTitle renders h3 `font-semibold tracking-tight font-display` + per-use size; (b) **Badge** — new-gen `rounded-md font-medium px-2 py-0.5` vs legacy `rounded-full border font-semibold` (+ variant hovers `hover:bg-primary/80`/`hover:bg-secondary/80`); (c) **Tabs** — new-gen `h-9 rounded-lg p-[3px]` vs legacy `h-10 rounded-md p-1` + `rounded-sm` triggers with `ring-offset-background` focus rings; (d) **Select** — new-gen indicator on the RIGHT (`pr-8 pl-2`) vs legacy indicator LEFT (`pl-8 pr-2`), legacy trigger `bg-background` h-10; (e) **Button** — new-gen `transition-all focus-visible:ring-[3px]` + sizes h-9 default vs legacy `transition-colors focus-visible:ring-2 ring-offset-background` + sizes h-10 default; (f) **Input** — new-gen `bg-transparent` + `focus-visible:ring-[3px]` vs legacy `bg-background` + `focus-visible:ring-2`; (g) **Checkbox** — new-gen `rounded-[4px] focus-visible:ring-[3px]` vs legacy `rounded-sm focus-visible:ring-2 ring-offset-background` | live DOM extraction of every primitive (see live-ground-truth.md §3) vs `src/components/ui/{card,badge,tabs,select,button,input,checkbox}.tsx` |
| R11-F3 | High | **Sidebar footer chrome.** Live footer wrapper = `flex flex-col gap-2 p-4 space-y-3` (**no border-t**; clone: `border-t border-border p-3`). Plan badge = the Badge component (secondary variant) + `text-[10px] px-1.5 py-0 gradient-primary text-primary-foreground border-0` rendering literal "FREE" (clone: hand-rolled span with `uppercase` class + "Free" text). Usage line = `text-xs text-muted-foreground leading-snug` inside a `flex items-center gap-2 mb-1` badge row (clone: `mt-2`, no leading-snug, no badge row). Progress = `h-1.5 w-full rounded-full bg-muted mt-2 overflow-hidden` (clone: `mt-2 h-1.5 overflow-hidden rounded-full bg-muted`, class order + missing w-full). Sign-out = `flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors w-full px-1` (clone adds `rounded-lg py-2 font-medium hover:bg-muted`) | live sidebar footer HTML vs `src/components/dashboard/sidebar-nav.tsx:117-154` |
| R11-F4 | High | **Sidebar nav chrome + rail.** Live: content `flex min-h-0 flex-1 flex-col gap-2 overflow-auto` (**8px between groups**; clone: `space-y-6` = 24px), groups `relative flex w-full min-w-0 flex-col p-2`, labels `flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium text-sidebar-foreground/70` (clone: `px-3 pb-2 text-xs font-medium text-muted-foreground`), menus `flex w-full min-w-0 flex-col gap-1` (clone: `space-y-0.5`), menu buttons `h-8 rounded-md p-2 gap-2 text-sm` (normal weight) + hover `hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground` + active `bg-sidebar-accent text-sidebar-accent-foreground font-medium` (clone: `rounded-[10px] gap-3 px-3 py-2 font-medium` always + active `bg-[#F8F6F2] text-[#CC9900]` hardcoded hex, hover `hover:bg-muted`). Header: `flex items-center gap-2 p-4` (clone: `flex items-center p-4`). **Collapsed rail = 48px** (clone: w-16 = 64px) with **footer hidden** (clone renders a collapsed sign-out footer) and the logo visible (clone renders sr-only text) | live sidebar DOM (expanded + collapsed) vs `sidebar-shell.tsx` + `sidebar-nav.tsx` |
| R11-F5 | High | **Kickers are block `<p>` — the recurring -8px section delta.** Every live section kicker is an inline `<span class="text-xs font-semibold text-primary uppercase tracking-widest">` (24px line-box strut); the clone renders `<p>` (block, full 20px line box + margins) on audience/process/pricing/benefits/FAQ — the root cause of the systematic 8px height shortfall (pricing 806 vs 814, FAQ 739 vs 756...) | live kicker tag extraction (all SPAN.inline) vs marketing components |
| R11-F6 | Medium | **Install banners.** Verified banner: live `bg-neon-green/10 border-neon-green/30` (clone: `/20`); waiting banner: classes match but order differs (`mt-4 p-3 bg-neon-green/5 border-neon-green/20 border rounded-lg`); icon = `CircleCheck h-4 w-4 shrink-0 mt-0.5 text-muted-foreground` ✓ | live install DOM vs `src/app/dashboard/install/page.tsx:130-153` |
| R11-F7 | Medium | **Badge consumer drift.** Visitors badges: px-**2** (clone px-1.5); segment/source badges keep the **variant hover** (`hover:bg-secondary/80`) — the clone overrides with `hover:bg-amber-500/10`/`hover:bg-neon-green/10`; inactive status = plain secondary variant (clone adds `hover:bg-secondary`). Domains Verified badge = **default variant** + `gradient-primary text-primary-foreground border-0` (clone: secondary variant + `hover:opacity-90`); Pending = plain secondary (clone ✓ apart from variant hovers). Activity badges ✓ (px-1.5, outline Pageview, gradient Identified) | live badge extraction (visitors/activity/domains) vs `visitors-table.tsx` + `domains-panel.tsx` |
| R11-F8 | Medium | **`#benefits` anchor on the wrong section.** Live: `id="benefits"` on "Everything you need to unmask your traffic" (Features); the audience section has NO id. Clone: `id="benefits"` on Audience ("Who Is Pixelco For?") — the nav/footer "Features"/"Benefits" anchors land one section too high | live section id map vs `how-it-works.tsx:71` + `features.tsx:59` |
| R11-F9 | Medium | **Hero secondary CTA target.** Live "See Live Demo" → `https://app.pixelco.io` (the app; serves login when logged out). Clone → `#live-demo`, a clone-invented anchor on the feed wrapper; the live ships no such anchor. Clone target should be `/login` (same logged-out destination in this self-hosted app) | live CTA href extraction vs `hero.tsx:126` |
| R11-F10 | Medium | **Section header margins.** Live pricing header wrap = `text-center mb-14` (clone: `text-center`, no mb → -56px); FAQ header wrap = `text-center mb-12` (clone: none → -48px) | live header margin map vs `pricing-section.tsx:23` + `faq-footer.tsx:50` |
| R11-F11 | Medium | **Footer wordmark + Careers link.** Live brand cell wraps the wordmark in `<a class="flex items-center gap-2 mb-4" href="/">`; Careers is a real `<a href="#">` (clone: bare wordmark span + a `cursor-default` disabled span) | live footer HTML vs `faq-footer.tsx:139-186` |
| R11-F12 | Medium | **Compare card CTA.** Live: `<a class="block">` → button default-variant h-10 + `w-full mt-6 gradient-cta text-primary-foreground border-0 hover:opacity-90 font-semibold` with a trailing ArrowRight `w-4 h-4 ml-1`. Clone: plain default Button (no gradient) — height 36 vs 40 | live compare CTA HTML vs `features.tsx:147-152` |
| R11-F13 | Medium | **Header CTA sizes.** Live: both header CTAs are size **sm** (h-9) — Log In = ghost + `text-muted-foreground font-medium`; Start Identifying = default + `gradient-cta text-primary-foreground border-0 hover:opacity-90 font-semibold`. Clone: both default size (h-9 per new-gen default — becomes h-10 after the Button rewrite, +2px drift) with different classes | live header button extraction vs `site-header.tsx:33-40` |
| R11-F14 | Medium | **Trend chart warm strokes.** Grid + axis + tooltip-border strokes are warm `#E7E5DF`; the live uses the cool border `hsl(220, 13%, 91%)` (#E5E7EB) | live chart SVG extraction vs `trend-chart.tsx:38,43,55` |
| R11-F15 | Medium | **404 boundary.** Live ships a minimal 404: `flex min-h-screen items-center justify-center bg-muted` + h1 `mb-4 text-4xl font-bold` "404" + p `mb-4 text-xl text-muted-foreground` "Oops! Page not found" + link `text-primary underline hover:text-primary/90` "Return to Home" (serves both app and marketing misses). Clone: Compass-icon + two-button design on `bg-app` | live /dashboard/nonexistent + marketing 404 DOM vs `src/app/not-found.tsx` |
| R11-F16 | Low | **font-mono stack.** The live declares `"JetBrains Mono", monospace` but loads no JetBrains Mono webfont → everything renders in the system mono. The clone loads a Geist Mono webfont — a visible glyph-shape drift on every mono surface (snippet blocks, visitor sub-lines, path columns) | live marketing `--font-mono` + font-file audit vs `src/app/layout.tsx` |
| R11-F17 | Low | **"View all" link.** Live: `text-xs text-primary hover:underline flex items-center gap-1` + ArrowUpRight h-3 w-3 (no font-weight class). Clone: `gap-0.5 text-xs font-semibold text-amber-600 hover:text-amber-700` | live overview DOM vs `dashboard/page.tsx:148-155` |
| R11-F18 | Low | **Topbar toggle.** Live: ghost + `h-7 w-7` (28px) with a size-less PanelLeft svg (16px via `[&_svg]:size-4`). Clone: `size="icon"` (36px after rewrite) + PanelLeft h-5 w-5 | live topbar button extraction vs `topbar.tsx:60-66` |
| R11-F19 | Low | **gradient-primary end stop.** Live `linear-gradient(135deg, hsl(45,100%,51%), hsl(42,100%,50%))` — end stop #FFB300; clone `.gradient-primary` ends at #FFB200 (1-channel delta) | live `:root` dump vs `globals.css:202` |
| R11-F20 | Deferred | **Scroll-reveal entrance animations** (R10-F14, unchanged): the live's marketing elements carry inline `opacity:0; translateY(16px)` reveal styles. At-rest parity holds; entrance timing stays out of scope per the audit rules and the CSS-only motion convention (PAD §5.4) | live compare header inline style |

**Verified as matching this round (no action):** marketing bundle tokens (the
R10 `.marketing-scope` set is byte-identical to the live's current marketing
`:root`); the sidebar wordmark/nav items/icons/sections (Analytics/Setup/
Account, same 7 items, Eye icon — the earlier VLM "icon differs" claim was a
misread, byte-identical lucide paths); trend legend dots (amber bg-primary +
bg-neon-green) and series colors (purple/teal, hardcoded both sides); the
Domains Add-Domain button (gradient renders identically — both sides carry
bg-primary + gradient-primary); POPULAR badge; process cards; benefits icons;
CTA card + announcement bar + social icons; activity feed rows; dashboard
pricing FAQ copy + card structure; the marketing 404 title ("Page Not Found |
Pixelco" — the clone cannot set not-found metadata in Next.js, documented).

## Remediation ToDo (TDD — RED first at every seam)

- [ ] **A. App token migration (R11-F1, F14, F19)**
  - A1 RED — `tests/app-theme.test.ts`: parse `src/app/globals.css`; require
    the app `:root` to define the live's cool-neutral set (background
    hsl(220 20% 97%), foreground hsl(230 25% 10%), secondary/muted
    hsl(220 14% 96%), muted-foreground hsl(220 9% 46%), accent hsl(172 66%
    50%), accent-foreground hsl(230 25% 10%), border/input hsl(220 13% 91%),
    ring hsl(45 100% 51%), primary-foreground hsl(230 25% 10%)) + the
    sidebar token set (sidebar-accent hsl(45 30% 96%), sidebar-accent-
    foreground hsl(45 100% 40%), navy sidebar-foreground, sidebar-border
    hsl(220 13% 91%), sidebar-ring hsl(45 100% 51%)) + the four new
    utilities (gradient-accent, gradient-card, glow-accent, electric-blue).
  - A2 GREEN — rewrite the app `:root` block + `@theme` mappings; keep the
    marketing scope untouched; keep `.bg-app` (#f6f7f9 == hsl(220 20% 97%),
    now identical to `--background` — keep the class for semantic clarity);
    align `.gradient-primary` end stop to #FFB300.
  - A3 — update the superseded app-palette assertions in
    `tests/marketing-theme.test.ts` (they pin the R10 app palette).
  - A4 — trend-chart grid/axis/tooltip strokes `#E7E5DF` → `hsl(220, 13%, 91%)`.
- [ ] **B. Legacy primitives (R11-F2)**
  - B1 RED — `tests/ui-primitives.test.tsx`: renderToStaticMarkup each
    primitive; pin the live's legacy class strings (Button base + variants +
    sizes; Badge base + variants; Card family; Tabs family; Select family;
    Input; Checkbox).
  - B2 GREEN — rewrite `src/components/ui/{button,badge,card,tabs,select,
    input,checkbox}.tsx` to the legacy chrome (no data-slot attrs, legacy
    focus rings, legacy sizes h-10/h-9, CardTitle → h3 font-display).
  - B3 — consumer sweep: CardTitle usages drop now-redundant
    `font-display font-semibold tracking-tight text-foreground` repeats
    (keep only size/color overrides) so rendered strings match the live;
    the recent-identifications header becomes a raw div
    (`space-y-1.5 p-6 flex flex-row items-center justify-between pb-2`).
- [ ] **C. Sidebar chrome (R11-F3, F4, F18)**
  - C1 RED — `tests/sidebar-chrome.test.tsx`: pin the footer wrapper, plan
    badge (Badge component, secondary variant, "FREE" literal), usage line,
    progress classes, sign-out classes; pin the nav chrome (header gap-2,
    content gap-2, group p-2, label h-8 text-sidebar-foreground/70, menu
    gap-1, button h-8 rounded-md p-2 + hover/active states); pin the rail
    (w-12, footer hidden, logo rendered).
  - C2 GREEN — rewrite `sidebar-nav.tsx` + `sidebar-shell.tsx` to the live
    chrome; topbar toggle → ghost h-7 w-7 with size-less PanelLeft.
- [ ] **D. Badge consumers + install banners (R11-F6, F7)**
  - D1 RED — extend the visitors/domains SSR tests (or add
    `tests/badge-consumers.test.tsx`): px-2 on visitors badges, variant
    hovers retained (no custom hover overrides), Verified badge on the
    default variant, install verified banner `border-neon-green/30`.
  - D2 GREEN — sweep `visitors-table.tsx`, `domains-panel.tsx`,
    `install/page.tsx`.
- [ ] **E. Marketing parity (R11-F5, F8-F13, F16, F17)**
  - E1 RED — extend the marketing SSR tests: kickers render as `<span>`;
    pricing header `mb-14`; FAQ header `mb-12`; `#benefits` on the Features
    section (and absent from Audience); hero secondary CTA href `/login`;
    no `#live-demo` id; footer wordmark inside `<a href="/">` + mb-4;
    Careers as a real anchor; Compare CTA gradient + h-10 + trailing arrow;
    header CTAs size sm.
  - E2 GREEN — apply all fixes across hero/features/pricing/how-it-works/
    faq-footer/site-header + `marketing-links.ts` (Careers stays `dead: true`
    but renders an anchor).
  - E3 — font-mono: drop the Geist Mono webfont; `--font-mono: "JetBrains
    Mono", monospace` (declared-not-loaded = system mono, like the live).
- [ ] **F. 404 rebuild (R11-F15)**
  - F1 RED — `tests/not-found.test.tsx`: pin the live's minimal DOM.
  - F2 GREEN — rebuild `src/app/not-found.tsx`.
- [ ] **G. Verification gate**
  - G1 — `npm run verify` (lint → typecheck → test → build) must be green.
  - G2 — fresh production server + fresh browser session (no stale-chunk
    artifacts): verify computed tokens (canvas #F6F7F9, borders #E5E7EB,
    teal accent hover), KPI card height 138px, badge pill shapes, tabs bar,
    select trigger/dropdown, sidebar footer + rail w-12, install banners,
    marketing kicker/anchor/margin/CTA/footer fixes, 404; zero console
    errors. Evidence: `research/round11-audit/local/` + verification log.
- [ ] **H. Documentation**
  - H1 — PAD → v1.10 (revision block; §5.2 token table update to the
    cool-neutral app palette + new utilities; §8 suite counts).
  - H2 — README (test counts + typography note), AGENTS.md + CLAUDE.md
    (app-palette fact, legacy-primitives convention, font-mono).
  - H3 — plan execution log + worklog entry.
- [ ] **I. Ship**
  - I1 — atomic Conventional Commits on main only.
  - I2 — secret scan; push via `docs/ssh_git_wrapper_v3.py` + paramiko shim
    (runbook Appendix A); post-push verification; key shredded.

## Risk notes

- The `--accent` semantic flip (cream → teal) changes every `bg-accent`/
  `text-accent` surface in the app tree: ghost-button hovers, select-item
  focus, dropdown hovers — exactly the live's current behavior. The
  marketing scope keeps its yellow accent (unchanged), so marketing
  surfaces (Save 20%, yellow dots) are unaffected.
- The legacy Button rewrite changes default size h-9 → h-10; every
  unsized Button consumer gains 2px. The consumer sweep (B3) pins sizes
  where the live grounds them (h-10 everywhere observed: auth h-10 ✓
  explicit, domains h-10 ✓ explicit, plan-panel h-10 ✓ explicit, marketing
  hero h-12 ✓ explicit, header size sm, topbar h-7/h-10 explicit).
- The vitest SSR tests pin class STRINGS; tailwind-merge collapses
  duplicates, so assertions must be written against the merged output
  (the R10 lesson — pin what renders, not what's authored).
