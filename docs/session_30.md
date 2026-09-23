# Session 30 — Round-28 Trend Chart Axis-Geometry Parity

Workspace refreshed via `git pull` (2abbc19 → f59c0cc — only the R27
completion narrative `docs/session_29.md` added; the tree is R27-clean).
Reviewed the full doc chain (AGENTS, CLAUDE, README, PAD v1.26, SKILL.md,
session_28/29, the R27 plan, the Tailwind-V4 validation report, the repo
worklog) and validated against the codebase: sonner pinned 1.7.4 exact,
the Radix toast trio retired, `.env` contract `DATABASE_URL="file:../db/custom.db"`
with `db/` at the repo root, `.env.example` consistent (3 keys), vitest +
Playwright suites configured, the repo `skills/` folder excluded from
checks. The known session quirk recurred (the workspace shell exports a
stale absolute `DATABASE_URL` — the R27 symlink at the old path still
unifies both resolutions onto the repo DB). The R27 screenshot cycle had
cascade-wiped the demo visitors (domain delete/re-add) — re-seeded
(idempotent; 5 visitors · 3 identified restored).

Arrival gates on the untouched R27 tree: lint 0 · typecheck 0 · **681
vitest | 2 skipped (67 files)** — the documented state held. Dev server
healthy (`/api/health {"status":"ok","db":"up"}`).

The 13th probe generation (dual agent-browser sessions — live + clone;
1280×900 desktop + 375×812 mobile; settled-DOM captures; SVG-local
getBBox measurements):

Bundle hashes first: marketing `C3AAh5Je.js` / `bLMWzsGr.css` + app
`index-nhmKaUsm.js` — **all UNCHANGED, no live redeploy**.

Mobile navigation (the standing user emphasis), both surfaces, both
sites: marketing toggle `md:hidden text-foreground` + `lucide-menu
w-6 h-6`, dropdown bytes + close-on-link-click (live scrolled 7424,
clone 7404 — the documented 20 px D5 delta); dashboard Sheet
`--sidebar-width: 18rem` + 7 links + close-on-cross-page-nav on BOTH
sides. Parity everywhere.

Standing loop: the live fires the settings-save sonner toast
(`Settings saved`, bottom/right/light) — the clone's toast DOM
byte-identical; the R26 POPULAR badge re-captured byte-identical; NTW
still `0 this week / 2 last week` → `-100.0%` negative branch; install
copy swaps to plain `Copied!` (no toast); topbar `2 individuals · 1
companies identified` + 3 visitor rows on both sides; 20 clone routes
swept — zero console/page errors. TW4 watch clean.

NEW mutation surface — the plan-change flow: the live's Get Started
opens a **Stripe embedded-checkout modal** (real billing — `cs_live_…`
checkout session, 299.00 SEK; dismissed cleanly, account untouched, no
plan change). The clone's simulated `changePlanAction` (instant
entitlement switch, no toast) stays the documented D-class divergence —
replicating a payment UI without a processor would fake production
capability (PAD §11).

NEW probe surface — **the trend chart's SVG internals** (runtime-only
rendering no prior round diffed; the R16 pin covered only the wrapper's
`h-[280px]`): **R28-F1 — a real drift family.** The live renders the
recharts DEFAULT tick lines (tickSize 6 — 12 below the X axis, 5 left
of the Y axis) + an axis line on BOTH axes, all in the axis-level
stroke `hsl(220, 9%, 46%)` (their Tailwind v3 gray-500 literal, which
the tick `<text>` also INHERITS as its fill attr — no tick.fill
override); the explicit margin `{top:5,right:5,bottom:5,left:5}` (plot
origin x=65 at the 595 px card; recharts' built-in default is
all-zeros); comma-form HSL color literals (`hsl(262, 83%, 58%)`,
`hsl(172, 66%, 50%)`, grid `hsl(220, 13%, 91%)` — same colors the clone
shipped in space/hex form); and a tooltip at 8 px radius with NO
box-shadow. The clone had shipped an R8-era config: `tickLine={false}`
on both axes, the X axis line light `#E5E7EB`, the Y axis line
suppressed entirely, the margin hacked to
`{top:8,right:8,left:-18,bottom:0}` (a 23 px plot-origin shift that
flipped which date labels recharts thins — the live hides Sep 20 + 22
of 14, the clone showed 13), an explicit hex tick fill, and a tooltip
at 12 px + a phantom `0 8px 24px` shadow.

TDD execution: RED first — `tests/chart-r28-parity.test.tsx` (12 source
pins: the margin literal, no tickLine/axisLine suppressions, the
axis-level stroke ×2, the inherited tick fill, the grid HSL literal,
the comma-form area colors, the 8 px no-shadow tooltip; 9 failing) +
the NEW `e2e/chart.spec.ts` (3 runtime specs: the rendered tick/axis
lines + strokes, the plot-origin geometry ≈65 px, the tooltip chrome +
grid bytes). GREEN: `src/components/dashboard/trend-chart.tsx`
restored to the live's config (recharts' CartesianAxis source consulted
— the axis-level `stroke` cascades to the axis line, the tick lines,
AND the tick-text fill, exactly reproducing the live's inheritance).

Runtime byte-verify: the clone's chart diffed against the live capture
— **identical** on every measured element: 12 of 14 date labels at the
exact positions (48, 89, …, 411, 492, 558), the tick lines (17 total)
at the captured geometry (6 px, stroke `hsl(220, 9%, 46%)`), both axis
lines (x 65→590 / y 5→245), the tick-text fill attr, the last-label
clamp at x=576.59375 (matching to 5 decimals), and the tooltip style
bytes (`border-radius: 8px`, no shadow). The 36 px mobile chart-width
delta at 375 px traced to data (the live's `-100.0%` NTW badge text vs
the clone's empty-badge branch) on a surface both sides ship
identically (desktop-first horizontal overflow) — documented, no
action.

Gates: lint 0 · typecheck 0 · **693 vitest | 2 skipped (69 files)** ·
build ✓ standalone ✓ **21/21 e2e chromium (31.6 s)**.

4 screenshots captured from the dev server (`docs/screenshots/r28-*`):
dashboard with the chart chrome, chart closeup, chart tooltip, mobile
chart — VLM-verified (tick lines on both axes visible; Sep 20 + 22
hidden exactly like the live; the tooltip shows the Sep 15 date +
Pageviews/Identified entries at a small radius without a shadow).

`.env.example` re-verified: 3 keys, byte-consistent with `.env` and the
codebase's `process.env` reads — the chart fix added no env surface.

Docs: README R28 bullet (693/21), AGENTS R28 fact block, CLAUDE 11–28
mirror, PAD v1.27, SKILL.md R28 rows (project_state, Appendix A/D, the
R28 final gate block, quick-reference counts), the plan doc's execution
log, this session log, the repo worklog entry.

Committed to main and pushed via the SSH wrapper (dry-run → push →
remote-ref verification).

Next (R29): bundle hashes again (a change triggers the full token-diff
sweep); the chart joins the standing regression loop (r28 e2e); the
toast + pricing + mobile-nav loops continue; consider tooltip
label/entry pins if the live's data makes the hover surface stable.
