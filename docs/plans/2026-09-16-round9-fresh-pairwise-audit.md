# Round 9 — Fresh Pairwise Audit & Parity Remediation Plan

**Date:** 2026-09-16
**Scope:** Fresh live audit of pixelco.io (marketing, scroll-stimulated section
captures) and app.pixelco.io (logged-in as `sepnetflix2023@outlook.com`),
pairwise VLM comparison against the production build of the clone, plus
DOM ground-truth extraction for every flagged drift.
**Baseline:** main @ `ab708bb` (Round-8 restoration complete; `npm run verify`
green — lint, typecheck, 190 tests / 26 files, build 35 routes).
**Evidence:** `research/round9-audit/live/` (10 landing sections + login +
7 dashboard pages + auth-state.json + DOM extracts), `research/round9-audit/local/`
(same surfaces, production server).

## Method

1. Replaced `docs/ssh_git_wrapper_v3.py` (v3.1: ssh-binary preflight,
   post-push verification, tracking-ref sync) and
   `docs/how-to-git-push-using-ssh-wrapper_SKILL.md` (paramiko shim recipe)
   per operator upload; committed as `ab708bb`.
2. Captured the live landing scroll-stimulated (10 section viewports at
   1440×900), live login, and all 7 logged-in dashboard pages; extracted
   DOM ground truth (section maps, class lists, computed styles, marquee
   keyframes, grid geometry).
3. Captured identical surfaces on the clone (production build, fresh
   server) and ran pairwise comparisons.
4. Every finding below was verified against BOTH the live DOM and the
   local tree before being filed.

## Findings (severity-ordered)

| ID | Severity | Finding | Evidence |
|----|----------|---------|----------|
| R9-F1 | Medium | **Logo marquee is static — live is an animated marquee.** Live: one section (`py-16 border-b border-border`, container `container mx-auto px-6`) holds the marquee AND the testimonial cards; marquee wrapper `text-center mb-12` → `overflow-hidden` → track `flex items-center gap-12 animate-scroll-left` with **20 items (10 names ×2)**, name style `text-lg font-bold text-muted-foreground/40 whitespace-nowrap select-none` (18px/700, rgba(106,109,129,0.4)), `@keyframes scroll-left {0% translate(0) → 100% translate(-50%)}` @ `30s linear infinite` (track 2650px, gap 48px). Clone: static `flex flex-wrap items-center justify-center gap-x-10 gap-y-4` of `text-sm font-bold uppercase tracking-widest text-muted-foreground/60 grayscale` names inside a tinted band (`border-y border-border/60 bg-card/50 py-8`, h=122 vs live 403) | live DOM extract (keyframes + computed styles); `src/components/marketing/social-proof.tsx:35–52` |
| R9-F2 | Medium | **Testimonials section structure drift.** Live: testimonials share the marquee section; grid `grid md:grid-cols-3 gap-6 max-w-4xl mx-auto` (**896px @ x=272**), cards `border border-border rounded-xl p-6 bg-card shadow-card` (**283×198**), stars row `flex gap-0.5 mb-3` (16px), quote `text-sm text-foreground leading-relaxed mb-4` (**14px**), author plain div `text-sm font-semibold text-foreground` + `text-xs text-muted-foreground`. Clone: testimonials in a separate section (`mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-20`, sr-only h2), grid 1232px @ x=104, cards **395×215** `shadow-sm`, quote `text-[15px]` + `mt-4`, figcaption `mt-6` | live DOM extract (grid/card rects); `social-proof.tsx:54–87`; local DOM rects (measured) |
| R9-F3 | High | **Login page renders the signup footer link TWICE.** Live shows exactly one "Don't have an account? Sign up free" (`mt-4 text-center text-sm text-muted-foreground` per R8-verified structure). Clone renders it in BOTH `login-form.tsx` (in-form, `mt-4 text-center …`) and `login/page.tsx` (sibling after form, missing `mt-4`) — a leftover of the R7 "move the link after the form" refactor that R8's spacing pass didn't catch | live login.png (one link); local login.png (two stacked links); `src/app/login/page.tsx:35–40`; `src/components/auth/login-form.tsx:112–118`; DOM: two `a[Sign up free]` with different parents |
| R9-F4 | — | **Domains page "Something went wrong" — INVALIDATED (environment artifact, no code defect).** First local capture crashed via the error boundary; root cause: a stale `next start` process (booted 10:38, before the `npm run verify` rebuild swapped `.next` under it) serving a mixed manifest. After killing it and booting a fresh production server, `/dashboard/domains` renders perfectly (Add a Domain + Your Domains list). No code change; recorded to keep the audit honest | `research/round9-audit/local/dash-domains.png` (before/after); `/tmp/next-fresh.log` (clean Prisma queries) |
| R9-F5 | Low | **Stats bar chrome drift.** Live: `py-14 border-y border-border`, no background tint (h=174). Clone: `py-12 border-y border-border/60 bg-card/50` (h=158, tinted band the live doesn't have). Values/labels/gradient text verified matching (R7-V11) | live DOM (s3 class list); `social-proof.tsx:89–108` |

**Verified as matching this round (no action):** hero incl. announcement
bar, header nav, trust pills, avatar row, Live Visitor Feed animation
(feed rows differ only by animation timing at capture); audience cards;
process steps; benefits 6-item grid + clone's own screenshot; comparison
table; marketing pricing (annual toggle: $0/$63/$199/$639, POPULAR badge,
CTA variants); FAQ cards; bottom CTA card; footer (columns, socials,
copyright); login card (logo, OAuth tint, OR divider, 40px inputs,
`space-y-2` groups, forgot-link weight — R8 restorations holding);
dashboard overview (KPIs, trend legend dots + both gradient fills, top
pages, recent identifications), visitors (tabs/filters/rows/badges),
activity (R7-F1 semantics: anonymous ids on pageviews, emails only on
Identified), domains, install (snippet URL/keys = documented
self-hosted divergence; status banner reflects real data), dashboard
pricing ($0/$79/$249/$799 monthly, enterprise banner), settings.

## Remediation ToDo (TDD where a seam exists)

- [x] **A1 (R9-F3) RED — login footer guard** — `tests/login-footer.test.ts`:
  parse `src/app/login/page.tsx` + `src/components/auth/login-form.tsx` and
  require exactly ONE "Sign up free" occurrence across the pair, living in
  `page.tsx` with the live classes (`mt-4 text-center text-sm
  text-muted-foreground`). Expect RED (2 occurrences today).
- [x] **A2 (R9-F3) GREEN** — delete the in-form footer link from
  `login-form.tsx`; add `mt-4` to the page-level link in
  `login/page.tsx` (live structure: sibling after the form).
- [x] **B1 (R9-F1/F2) RED — social-proof DOM test** —
  `tests/social-proof.test.tsx`: `renderToStaticMarkup(<SocialProof />)`
  requires (a) marquee track with `animate-scroll-left` and 20 name spans
  (10 ×2), (b) testimonial grid carrying `max-w-4xl mx-auto`, (c) cards
  carrying `shadow-card`, (d) quote `text-sm` (not `text-[15px]`);
  `renderToStaticMarkup(<StatsBar />)` requires `py-14 border-y
  border-border` and NO `bg-card` tint. Expect RED.
- [x] **B2 (R9-F1/F2) GREEN — rebuild social-proof** — merge LogoStrip +
  Testimonials into `SocialProof` replicating the live DOM verbatim:
  section `py-16 border-b border-border` → container `mx-auto px-6` →
  marquee wrapper `text-center mb-12` → `overflow-hidden` → track `flex
  items-center gap-12 animate-scroll-left` (names `text-lg font-bold
  text-muted-foreground/40 whitespace-nowrap select-none`, two copies,
  second `aria-hidden`), then the testimonial grid `grid md:grid-cols-3
  gap-6 max-w-4xl mx-auto` with `shadow-card` cards, `flex gap-0.5 mb-3`
  stars, `text-sm … leading-relaxed mb-4` quotes, live author markup.
  Keep the sr-only "Customer testimonials" heading (a11y, invisible).
  `StatsBar`: `py-14 border-y border-border`, drop `bg-card/50` tint.
  Update `src/app/(marketing)/page.tsx` composition.
- [x] **B3 (R9-F1) Marquee CSS** — add `@keyframes scroll-left` +
  `.animate-scroll-left { animation: scroll-left 30s linear infinite; }`
  to `globals.css` (live-exact), and extend the `prefers-reduced-motion`
  block to disable it.
- [x] **C1 Verification** — `npm run verify` (lint → typecheck → test →
  build); browser pass on `/` (marquee animating left, seamless loop,
  testimonials at 896px grid / 283px cards, stats strip untinted) and
  `/login` (single signup link); spot-check `/dashboard`.
- [x] **C2 Documentation** — PAD v1.8 revision block (round-9: fresh
  pairwise audit, R9-F1..F5 with the F4 invalidation recorded); round-9
  plan execution log; worklog entry; README test-count delta if the suite
  grows.
- [x] **C3 Ship** — Conventional Commits per task, main only, push via the
  upgraded `docs/ssh_git_wrapper_v3.py` v3.1 (ssh-binary preflight +
  post-push verification + tracking-ref sync) with the paramiko shim on
  PATH (runbook Appendix A), key shredded after push.

## Execution order

A1 (RED) → A2 (GREEN) → B1 (RED) → B2/B3 (GREEN) → C1 (gate + browser) →
C2 (docs) → C3 (push). Login fix lands before social-proof so the suite
stays green per-workstream.

## Execution log (2026-09-16)

All workstreams landed as individual Conventional Commits on `main`:

| Task | Commit | Subject |
|------|--------|---------|
| (setup) | `ab708bb` | docs(push): upgrade ssh wrapper to v3.1 and field-tested runbook |
| A1+A2 | `7c11409` | fix(auth): render the login signup-footer link exactly once (R9-F3) |
| B1–B3 | `ca590d5` | fix(marketing): live marquee + testimonials in one section, untinted stats (R9-F1/F2/F5) |
| C2 | (docs) | docs: PAD v1.8, round-9 plan + worklog records, README test count |

Verification evidence:
- `npm run verify` GREEN: lint clean, typecheck clean, **198 tests across
  28 files** (+2 login-footer, +6 social-proof vs Round-8's 190/26), build
  green (35 routes).
- Browser pass (fresh production server): marquee track holds 20 children
  and its computed transform advances over time (−28px → −70px across a
  2s sample, 30s linear loop); testimonial grid measured x=272 / w=896
  with 283px cards — live-exact geometry; stats strip class list
  `py-14 border-y border-border` with no card tint; `/login` renders
  exactly one "Sign up free" link; `/dashboard` spot-checked.
- R9-F4 (domains error boundary) reproduced ONLY against the stale
  pre-rebuild server; on a fresh `next start` the page renders perfectly
  (Add a Domain + Your Domains). No code change; recorded for honesty.

C3 push: `docs/ssh_git_wrapper_v3.py` v3.1 with the runbook Appendix A
paramiko shim on PATH (no ssh binary in the sandbox), all commits on
`main`, post-push remote verification via the wrapper, key shredded.
