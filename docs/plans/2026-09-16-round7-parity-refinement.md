# Round 7 — Visual & Functional Parity Remediation Plan

**Date:** 2026-09-16
**Scope:** Fresh live audit (marketing landing + all 7 dashboard surfaces + login,
logged-in DOM extraction, computed styles, pairwise VLM diffs, logo silhouette
tracing) against the Round-6-complete clone; remediation of every verified gap.
**Baseline:** `npm run verify` green at `f47a756` (lint, typecheck, 186 tests /
25 files, 35 routes) — matches PAD v1.5 exactly.
**Evidence:** `research/round7-audit/` (live/local screenshots, DOM extracts,
VLM verdicts, logo trace artifacts).

## Method

1. Logged into the live app (research account), captured all 7 dashboard
   surfaces + marketing landing (scroll-stimulated full page) + logged-out
   login; extracted DOM ground truth (headings, cards, tables, buttons,
   computed styles, chart gradient stops, legend structure, security headers).
2. Booted the local clone (seeded demo DB), captured the same surfaces,
   extracted the same DOM structures, and ran pairwise VLM diffs.
3. Every VLM claim was verified against extracted DOM before acceptance.
   Rejected as misreads: sidebar width/active-state claims (dev-tools "N"
   badge noise; active token verified working), Add-Domain button colors
   (computed gradients identical), checkbox shape (both `rounded-sm`
   squares), benefits icon fill (both outline), footer copyright year (both
   © 2026), hero H1 line breaks (text-balance), pricing dollar values
   (annual-vs-monthly capture states), FAQ Q1 wording (identical text),
   install banner state (pending vs verified data).
4. The live's logo mark (550×550 PNG) was traced via OpenCV contour
   extraction + RDP simplification + Catmull-Rom smoothing; the traced
   silhouette VLM-verifies as a MATCH at display size (64px).

## Findings (severity-ordered)

| ID | Severity | Finding | Evidence |
|----|----------|---------|----------|
| R7-F1 | High | Activity feed pageview rows show the visitor's joined **email**; the live shows the **truncated anonymousId** ("first 12 chars + '...'") for pageview rows and the email only on identification rows — once a visitor is identified, the clone rewrites history for their earlier pageviews | live activity DOM rows ("AnonTestVisi... / Pageview" from an identified-era account); `src/lib/analytics.ts:456-457` joins `visitor.email` onto every event; `activity-feed.tsx:129` renders `email ?? anonymousId` |
| R7-V1 | Medium | Trend chart legend missing: the live renders a custom centered legend below the chart — `flex items-center gap-6 mt-2 justify-center`, two items `flex items-center gap-1.5 text-xs text-muted-foreground` with `h-2 w-2 rounded-full bg-primary` ("Pageviews") and `bg-neon-green` ("Identified") dots. Round 6's "no legend" finding missed it (the live's legend is hand-built, not a Recharts legend) | live trend card DOM (TreeWalker text-node hits inside the chart card's `p-6 pt-0` content) |
| R7-V2 | Low | Trend chart area fills: live pageviews area has a purple gradient fill (`fillVisitors`, hsl(262 83% 58%) @ 0.15→0) and identified @ 0.2→0; clone renders pageviews with `fill="none"` and identified @ 0.12→0 | live chart SVG `defs` stops + `recharts-area-area` fills |
| R7-V3 | Low | `--primary` token: live app = hsl(45 100% 51%) (#FFC105), live marketing = hsl(45 100% 50%) (#FFBF00); clone = #FACC15 app-wide. Flows into every `bg-primary`/`text-primary`/`fill-primary` surface (stars, KPI values, buttons) | computed `--primary` on both live bundles vs `globals.css:53` |
| R7-V4 | Medium | Marketing header wordmark missing the live's "By Ai Viral" subtext (`text-xs text-muted-foreground italic translate-y-[3px]`, Dancing Script cursive). Captured in rounds 5/6 snapshots but never implemented | live header DOM; `research/round{5,6}-audit/live-marketing-snapshot.txt` |
| R7-V5 | Medium | Hero trust row: live = 5 **photo avatar images** (`w-8 h-8 rounded-full border-2 border-background object-cover`, `-space-x-2.5 shrink-0`) + **stacked** stars (`text-primary text-sm` ★★★★★ above "Trusted by 1,200+ businesses worldwide" in a `flex flex-col min-w-0`); clone = colored initials circles, no stars, inline text, `gap-3`/`-space-x-2` | live hero DOM (trust-row wrapper `flex items-center gap-4 mb-6`) |
| R7-V6 | Medium | Hero trust points: live = **pill badges** (`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-card border border-border text-sm`, container `flex flex-wrap gap-3 mb-8`) with lucide icons — CircleCheckBig `text-primary`, ChartColumn `text-primary`, Zap `text-highlight` (#FFD91A) — and `<strong class="text-foreground">` numbers; clone = plain `<li>` list with emoji icons | live hero DOM pills |
| R7-V7 | Medium | Testimonial cards: live renders author as **plain stacked text** (`text-sm font-semibold` name + `text-xs text-muted-foreground` role); clone adds colored avatar circles | live testimonial DOM vs `social-proof.tsx:79-88` |
| R7-V8 | Medium | Process steps: live = big faint background number (`text-5xl font-extrabold text-muted/50 absolute top-3 right-4 select-none leading-none` "01") + icon in `w-10 h-10 rounded-lg gradient-hero` box (`text-primary-foreground` icons: CodeXml, Cpu, Mail, FileText) + title `font-bold mb-1.5`; clone = small number-in-circle badge + `text-7xl text-primary/10` number positioned `-right-2 -top-4` | live process DOM |
| R7-V9 | Medium | Benefits list: live has **6** items with different content — B2C Email Identification (Users), B2B Company Reveal (Building2), Any Website Any Platform (Globe), Real-Time Dashboard (ChartColumn, "…identification rates, and top pages in a beautiful live dashboard."), **Instant Integrations** (Zap, "Push leads to HubSpot, Salesforce, Zapier, or webhooks. Export CSV anytime."), **Privacy Compliant** (Shield, "Built with GDPR and CCPA in mind. Only identifies publicly matchable data. No cookies used.") — icon boxes `w-9 h-9 rounded-lg bg-secondary`; clone has 5 items incl. "Cookieless Technology" with different icons (Mail, Globe, MonitorSmartphone, TrendingUp, Eye) | live benefits DOM |
| R7-V10 | Medium | Benefits dashboard preview: live ships a **real product screenshot** (`/assets/dashboard-visitors-*.png`, alt "Pixelco visitors view showing identified companies and individuals"); clone renders a hand-built KPI/bar mockup | live benefits DOM img |
| R7-V11 | Low | Stats strip: live renders "Real-Time" (capital T) with `text-gradient-hero mb-1`; clone renders "Real-time" with `text-primary tracking-tight` | live stats DOM |
| R7-V12 | Medium | Marketing pricing CTAs: live = Free card **gradient-cta "Start Free"** (`mt-6`), Starter + Scale **muted** (`bg-secondary text-secondary-foreground hover:bg-secondary/80`, `mb-5`), Growth **gradient-cta**; clone = Free outline "Free Tier", all paid filled primary, CTA below features (`mt-6`) | live marketing pricing button classes |
| R7-V13 | Low | Marketing pricing shows the "Need 7,500+ identifications?" enterprise banner; the live has it **only on the dashboard** pricing page — marketing has no such banner | live marketing text search (absent) |
| R7-V14 | Low | Marketing FAQ: live items are **cards** (`bg-background border border-border rounded-lg px-5`, `data-[state=open]:shadow-card`, container `space-y-2.5`; section `py-20 bg-card border-y border-border`, H2 `text-3xl sm:text-4xl font-bold mt-2`); clone = default accordion border-b dividers, `border-t bg-card/50 py-16` section | live FAQ DOM |
| R7-V15 | Low | Bottom CTA: live = centered `max-w-4xl mx-auto rounded-2xl gradient-hero p-6 sm:p-10 md:p-14 text-center overflow-hidden` card with **white** H2 (`text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3`); clone = full-width `bg-gradient-to-br from-amber-400…` with dark-amber H2 | live CTA DOM |
| R7-V16 | Medium | Logo mark: the live is a smooth organic 4-lobe mark (OpenCV-traced 54-anchor path, gradient #FFD119 bottom-left → #FFB800 top-right at 135°); the clone's bar+circles construction reads as an "X" (VLM login diff) with a vertical gradient | traced path `research/round7-audit/live-logo-cv.txt`; VLM MATCH at display size |
| R7-V17 | Low | Visitors table checkbox: live unchecked box has `border-primary` (amber border); clone uses default `border-input` (gray) | live visitors DOM first cell button classes |
| R7-P1 | Low | Security headers parity: the live sends `Strict-Transport-Security: max-age=31536000; includeSubDomains` on both surfaces; the clone does not send HSTS (it sends XFO + Permissions-Policy, which the live lacks) | `curl -I` on both |

**Explicitly verified as matching (no action):** visitors tabs/filters/headers/
rows ("· N visits" sub-lines, location-in-CONFIDENCE for B2B), domains rows
(identified-vs-total, badge shapes), activity card structure + gradient
Identified badge + two-group meta, install cards + switcher + snippet,
settings form + danger zone, pricing banner + FAQ cards + $65/$199/$639 annual
table, KPI cards + uppercase labels, Top Pages row structure, Recent
Identifications table, sidebar nav/usage card/Sign out, announcement bar, hero
headline/CTAs/feed widget, testimonials grid, audience cards, comparison
section, footer.

**Honest divergences kept (documented, not gaps):** pricing FAQ accuracy
answer (clone states the honest ~20% match rate, not the live's Fingerprint
Pro claim), install snippet URL/key (self-hosted), OAuth buttons disabled,
visitor detail sheet (value-add), avatar initials in dashboard chrome.

## Workstreams

### Workstream A — Functional (TDD, RED → GREEN)

- **A1 (R7-F1):** Activity-feed identity semantics.
  - RED: extend `tests/activity-query.test.ts` — pageview events from
    identified visitors must return `email: null` and `anonymousId` truncated
    to 12 chars; identification events return the email (and `anonymousId:
    null`). Display test: the feed renders `anonymousId + '...'` for pageviews.
  - GREEN: `listActivity` (`src/lib/analytics.ts`) keys the email off
    `event.name === 'identification'`; `activity-feed.tsx` renders
    `event.email ?? `${event.anonymousId}…`` — unchanged shape, new seam
    semantics.

### Workstream B — Dashboard visual

- **B1 (R7-V1):** Trend chart legend — hand-built flex row below the chart
  (not a Recharts legend): `bg-primary` dot + "Pageviews", `bg-neon-green`
  dot + "Identified", centered, `gap-6 mt-2`.
- **B2 (R7-V2):** Area fills — pageviews gradient (`hsl(262 83% 58%)`
  0.15→0), identified 0.2→0 (was 0.12).
- **B3 (R7-V3):** `--primary: #FFC105` in `:root`; marketing tree override
  `#FFBF00` scoped to the `(marketing)` layout wrapper via an arbitrary
  property class. Contrast re-check (black-on-primary remains ≥ 12:1).
- **B4 (R7-V17):** Visitors checkbox `border-primary` + `rounded-sm` sizing
  per the live classes.

### Workstream C — Logo mark (app-wide)

- **C1 (R7-V16):** Replace the bar+circles construction in
  `pixelco-logo.tsx` with the traced 54-anchor Catmull-Rom path; gradient
  becomes 135° (#FFD119 bottom-left → #FFB800 top-right). Applies everywhere
  the mark renders (auth shell h-16, marketing header/footer, sidebar).

### Workstream D — Marketing hero & chrome

- **D1 (R7-V4):** "By Ai Viral" wordmark subtext — add Dancing Script via
  `next/font/google` (`--font-dancing-script`, exposed as `font-script`),
  render the subtext span in the marketing `PixelcoWordmark` usage
  (`site-header.tsx` + footer) with the live's exact classes. Dashboard
  wordmark stays subtext-free (live app sidebar shows no subtext).
- **D2 (R7-V5):** Hero trust row — 5 generated photo avatars
  (`public/assets/avatars/avatar-{1..5}.jpg`, 96×96), `-space-x-2.5`,
  stacked stars + trusted-by text in `flex flex-col`.
- **D3 (R7-V6):** Trust points as pill badges with lucide icons
  (CircleCheckBig/ChartColumn/Zap) + `--color-highlight: #FFD91A` token.
- **D4 (R7-V7):** Testimonials — drop avatar circles; plain stacked
  name/role.
- **D5 (R7-V11):** Stats — "Real-Time" capitalization + `text-gradient-hero`.

### Workstream E — Marketing content sections

- **E1 (R7-V8):** Process steps — faint `01` background numbers +
  `gradient-hero` icon boxes (CodeXml, Cpu, Mail, FileText) + title rhythm.
- **E2 (R7-V9):** Benefits — 6 live items with live copy, icons and
  `bg-secondary` boxes.
- **E3 (R7-V10):** Benefits preview — screenshot of the clone's own visitors
  page (seeded data) saved to `public/assets/dashboard-visitors.png`,
  rendered like the live's img with equivalent alt text.
- **E4 (R7-V12/V13):** Pricing — CTA variants per card (Free gradient
  "Start Free" `mt-6`, Starter/Scale `bg-secondary`, Growth gradient), CTA
  above features (`mb-5`); remove the enterprise banner from marketing.
- **E5 (R7-V14):** FAQ — card-style accordion items + section chrome.
- **E6 (R7-V15):** Bottom CTA — `max-w-4xl` gradient-hero card, white H2.

### Workstream F — Production parity

- **F1 (R7-P1):** Add `Strict-Transport-Security: max-age=31536000;
  includeSubDomains` to `next.config.ts` baseline headers.

### Workstream V — Verification & ship

- Full gate `npm run verify` after each workstream; browser DOM pass on
  every changed surface (dev server + seeded DB); VLM re-diff of changed
  pairs into `research/round7-audit/post/`.
- Docs: PAD → v1.6 (revision block, findings, known issues refresh);
  README/AGENTS/CLAUDE deltas (activity semantics, primary token, logo,
  new tokens).
- Conventional Commits per task; push via `docs/ssh_git_wrapper_v3.py`.

## Execution order

A (functional, TDD) → B (dashboard visual) → C (logo) → D (hero/chrome) → E
(content sections) → F (headers) → V (verify/docs/ship). Each task lands as
its own commit; A1's RED test lands with its GREEN fix.

## Execution log (2026-09-16)

All workstreams landed as individual Conventional Commits on `main`:

| Task | Commit | Subject |
|------|--------|---------|
| A1 | `2999176` | fix(activity): pageview rows show the truncated anonymous id (R7-F1) |
| B1–B4 | `4fcf954` | fix(dashboard): live trend legend, area fills, primary token, checkbox border (R7-V1/V2/V3/V17) |
| C1 | (logo) | feat(brand): trace the live's organic logo mark (R7-V16) |
| D1–D5 | (marketing hero) | fix(marketing): live hero trust row/pills, wordmark subtext, testimonials, stats (R7-V4/V5/V6/V7/V11) |
| E1–E6 + F1 | (content+headers) | fix(marketing,headers): live process/benefits/pricing/FAQ/CTA structure + HSTS (R7-V8..V15, R7-P1) |
| follow-ups | `7df4d10` | fix(auth,ui): live input heights, form spacing, OAuth tint and CTA glow |
| follow-ups | `3ddc307` | fix(marketing): gradient-text H2 highlights and hero trust-row order |
| follow-ups | `05c9b69` | fix(marketing): live audience icons, logo marquee set and footer socials |

Verification evidence:
- `npm run verify` GREEN: lint clean, typecheck clean, **187 tests across 25
  files** (one new R7-F1 test; cursor-test arithmetic updated for the new
  seed event), build green (35 routes).
- Browser DOM pass on every changed surface, zero local console/page errors:
  activity rows render `demo_vid_mar...`-style anonymous ids on pageviews
  with emails only on Identified rows; the trend legend renders with
  measured dot colors (rgb(255,193,5) / rgb(43,212,189)) and both gradient
  fills carry the live's stop opacities (0.15 purple / 0.2 teal); the
  marketing wordmark shows "By Ai Viral" in Dancing Script; 3 trust pills
  with CircleCheckBig/ChartColumn/Zap (Zap at rgb(255,217,26)); 5 photo
  avatars + stacked stars between the pills and the CTAs; 4 faint process
  numbers + gradient icon boxes; the 6-item benefits list with the
  Users/Building2/Globe/ChartColumn/Zap/Shield set and the real
  dashboard-visitors screenshot; pricing CTAs gradient/secondary per card
  with the enterprise banner gone; 7 card-style FAQ items; HSTS header
  verified via `curl -I`; auth inputs at 40px, OAuth tint rgb(246,247,249),
  submit glow `rgba(255,193,5,0.3) 0 0 40px`.
- Pairwise VLM re-diffs: overview, activity and login at CLOSE MATCH
  (residuals verified as data differences, animation states or the Next.js
  dev-tools badge); the landing re-diff drove the three follow-up commits
  (hero order, gradient-text H2 highlights, audience icons/logo
  marquee/footer socials) — remaining flags verified as data, billing-mode
  capture states or VLM misreads (footer copyright, testimonial quotes,
  Free CTA styling confirmed identical via computed styles).

Honest divergences reconfirmed: pricing FAQ accuracy answer (the clone's
~20% match rate), install snippet URL/keys (self-hosted), avatar initials
in dashboard chrome, visitor detail sheet (value-add), OAuth buttons
disabled.
