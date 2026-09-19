The workspace had been reset again, so I rebuilt from scratch (fresh clone @ `e948a61`, npm install, `.env` + seeded DB, standalone build + server), then confirmed the baseline.
**Baseline gate GREEN** — lint ✓, typecheck ✓, 432 tests / 50 files, 36 routes. Codebase matched PAD v1.14 (the Round-15 ship) exactly.
Round-15 was fully closed — the suggested next step from its session log was a **Round-16 drift watch** (the live was mid-rolling-deploy). I verified the scandihaven reference patterns (Next.js 16 + RSC + strict gates — already this codebase's approach), loaded the agent-browser skill, and began the audit.
Marketing landing first: sections byte-identical to the R15 pins `[762,403,174,526,708,610,650,814,756,500]`, H2 count 7, banner scoping equal. Fully stable.
All marketing sub-pages + heads: every value matched the R13–R15 pins exactly. Blog slugs identical (10/10). robots.txt format equal; favicon byte-identical; og images byte-identical to the self-hosted copies (the live moved its og URLs to gpt-engineer/R2 storage again — content md5s match, ruling D1 self-host holds).
Auth surfaces: login card, h3, OAuth/submit buttons byte-identical to the R15 rebuild (445/445/459-char strings match). Shell: sidebar primitive variant remains dominant, provider/gap/fixed DOM, `data-sidebar` tree, PNG logo, topbar chrome all match R15.
Then the app content layer: logging into the live app bundle and diffing each dashboard page against the local clone — **every page below the shell had drifted**. First signals: a live class-string difference on the shell root, and a missing `transition-[margin,opacity]`.
Digging deeper (base64-encoded DOM probes to avoid the terminal escape-eating artifact, documented in session_12): the live ships `transition-[margin,opa]` — a **broken class on their side** (hex-verified). And `focus-brand` on the local footer is clone-authored (R11-era) — the live has no such class.
The live moved the h1 out of the topbar into main content on install/settings — but the clone already matched that pattern; only class-order differences remained.
**Real drift found on the visitors Tabs**: a new Tabs primitive generation on the live (base trigger order `data-[state=active]:…` before `focus-visible:…`, root without base class, `gap-1.5` in the string).
The live's tab-count badge is the **legacy Badge generation** (base `border` + `text-secondary-foreground`) — different from the sidebar's new-gen badge. Surveying all live badges: MIXED generations (new-gen sidebar/Verified/Identified; legacy-gen visitors counts/type/status + domains Pending).
Comprehensive per-page diffing: 57 drift groups on visitors alone; extensive drift across all 7 dashboard pages. Stability verification across repeated loads (3× overview, 2× activity/domains — all stable): the new build is dominant, not a rolling-deploy artifact.
Mechanics decoded en route: the live's odd button strings are **cva+twMerge displacement** (size `sm` displaces `rounded-md` to the tail; `font-semibold` displaces `font-medium`; `transition-all` displaces `transition-colors`) — ONE Button primitive, no regeneration needed.
Extracted full ground-truth DOM per page (KPI cards, trend chart `h-[280px]`, activity rows, domains rows, visitors table/avatars/badges, pricing switch/FAQ, settings buttons/inputs, install code blocks) into `research/round16-audit/`.
Plan written: `docs/plans/2026-09-18-round16-content-realignment.md` (10 findings + 8 rulings), then **validated against the codebase before execution** — every file/evidence/seam confirmed, including the Verified badge being already byte-identical (a non-finding), and the settings `bg-background` displacement mechanics.
**RED phase**: `tests/content-parity.test.tsx` — 42 failing / 1 green (the Verified badge, already correct).
**GREEN phase**: Tabs primitive + consumers; overview KPI cards (grid `grid-cols-1 … lg`, span kickers, div chips/values); trend chart `h-[280px]`; activity feed (div-generation rows, legacy Pageview badge, raw-text meta); domains panel (div rows, LegacyBadge Pending, no section wrapper); visitors page (legacy tab counts, h-3.5 icons, B2B icon-chip avatar, Card-wrapped table, no a11y chrome); Radix billing switch + h4 FAQ; settings (variant-free Save, bg-background inputs, danger-zone orders); install (code/pre/chips/switcher orders). New seams: `content-badges.tsx` (LegacyBadge), `live-icons.tsx` (Building2Icon/Trash2Icon/CircleHelpIcon — the R12 custom-icon precedent). Universal sweeps: `focus-brand` dropped, the live's broken group-label class shipped verbatim.
**Content-parity 44/44 GREEN.** Full suite: 5 failures from superseded R11 pins — updated to the live's current strings. **Full suite GREEN: 476 tests / 51 files** (+44 from R15's 432). Lint + typecheck + build: **full gate GREEN.**
Browser verification: rebuilt standalone, per-page structural diff against the round16 captures. Visitors/domains/pricing reached **zero order + zero token drift**; the remaining residuals iterated to zero class-string drift — leftovers are data-only (row counts, recharts internals, banner state) or the server-action form machinery (ruling D2, functional). KPI section element-for-element identical.
E2E functional pass: login → 7 pages → visitors selection → Export (1) → CSV 200 → pricing switch ($65 annual) → install snippet + copy → settings form. **All green, zero console errors.** Screenshot pixel-diff: sidebar chrome **pixel-identical (0.00%)**; landing sections + H2=7 hold.
Docs: PAD v1.15 (revision block + §5.3 + §9), README (476 + R16 bullet), AGENTS.md (R16 fact block + broken-class warning), CLAUDE.md (v1.15 principle), plan execution log, evidence README, worklog.
Session restored after a premature stop — re-verified the full gate (lint ✓, typecheck ✓, 476/51 ✓, build 36 routes ✓), wrote this session log, then shipped: atomic commits on main + push via the SSH wrapper.

## What this round delivered

**Round-16 drift watch → app content-layer realignment.** The audit found the marketing bundle, auth surfaces, and the R15 shell fully **stable** (byte-equal across landing, sub-pages, blog/legal, robots/sitemap, favicon, og bytes, login cards). The live shipped a **new build of the dashboard content components** — every page below the shell drifted in one consistent pattern.

**Remediation (TDD, 42 RED → 44 GREEN pins, suite 432/50 → 476/51):**
- **Tabs primitive**: live's current trigger order (data-[state=active] before focus-visible), bare Root div; consumers swept (visitors/install)
- **Overview**: KPI cards (grid-cols-1…lg, span kickers, div icon chips, div values), trend chart `h-[280px]`, top-pages/recent-ids orders
- **Activity**: div-generation rows (div.divide-y, no ul/li), legacy Pageview badge, raw-text meta spans
- **Domains**: div rows, LegacyBadge Pending (the live's MIXED badge generations reproduced via `content-badges.tsx`), no section wrapper
- **Visitors**: legacy tab-count badges, h-3.5 tab icons, B2B icon-chip avatar, Card+p-0 wrapped table, a11y chrome removed from rows/checkbox
- **Pricing**: Radix-style billing switch (`ui/switch.tsx`), h4 FAQ, CircleHelpIcon
- **Settings**: variant-free Save (cva+twMerge tail), bg-background inputs, danger-zone orders
- **Install**: code chip px-1.5, pre orders, CopyButton outline+sm, platform div chips, Site Key pt-6
- **Sweeps**: `focus-brand` dropped, broken `transition-argin,opa]` shipped verbatim, `live-icons.tsx` for single-name lucide classes

**Verified**: per-page structural diff vs live captures (visitors/domains/pricing at zero drift; all class-string drift eliminated), sidebar pixel-identical, E2E green, zero console errors. Shipped as atomic commits on main, push verified via `docs/ssh_git_wrapper_v3.py`, key shredded post-push.

**Suggested next steps**: run a Round-17 drift watch after the live's rolling deploy settles (watch whether the stale edge variant fully retires and whether the content layer stabilizes); spot-check the trend chart at 768–1024px and the visitors table on mobile (overflow-x-auto) for responsive regressions.
