# Session 26 — Round-26 Pricing POPULAR Badge Remediation

Workspace had been reset — re-cloned `nordeim/pixel-identifier` at `128b6ac`
(R25-clean state). Reviewed the full doc chain (AGENTS, CLAUDE, README, PAD
v1.24, SKILL.md, session_24/25, the R25 drift-watch plan, worklog) and
cloned scandihaven for the tech-stack patterns + skills catalog reference.
Environment brought up green: deps installed, repo `.env` created with the
user's contract (`DATABASE_URL="file:../db/custom.db"`, `db/` at the repo
root), `db:push` + `db:seed` healthy, dev server
`/api/health {"status":"ok","db":"up"}`. One session quirk handled: the
workspace-level env exported a stale `DATABASE_URL` pointing outside the
repo (standard dotenv precedence — AGENTS.md documents it); pointed the
workspace env at the repo DB and re-verified every flow.

Arrival gates on the untouched R25 tree: lint 0 · typecheck 0 · **662
vitest** · standalone build · **e2e 14/14 chromium** — the repo's
documented state held exactly.

Starting the 11th probe generation (dual agent-browser sessions — live +
clone; 1280 desktop + 375 mobile; VLM screenshot comparisons):

Bundle hashes first (the #1 drift signal): marketing `C3AAh5Je.js` /
`bLMWzsGr.css` + app `index-nhmKaUsm.js` + lucide `v0.462.0` — **all
UNCHANGED, no live redeploy**; the R24 divergence inventory stays the
system of record.

Mobile navigation (the standing user emphasis), both surfaces, both sites:
marketing dropdown bytes + `w-6 h-6` toggle + close-on-link-click
(visibility-filtered targets — live scrolled to 7424, clone 7404);
dashboard Sheet 288 px + `--sidebar-width: 18rem` + close-on-nav (the
same-page click keeps it open on both sides — the documented R24 edge).
Parity everywhere. Tailwind v4 watch: no bare-var brackets, the
`.md\:hidden` media emission verified in the standalone build's CSS, the
hand-defined `w-[--sidebar-width]` utilities in place. DB seam verified
against the user's exact `.env` value. 18 clone routes swept — zero
console errors. VLM comparisons (landing, dashboard, visitors, settings,
activity, domains, install, login) — essentially identical, data-driven
deltas only.

Then the dashboard walk beyond the R25 target list found **R26-F1 — a
real drift**: the live's Pricing & Plan **Growth card header renders a
POPULAR badge** (new-gen Badge, default variant, gradient-first consumer
tail `gradient-primary text-primary-foreground border-0 text-[10px] px-2
py-0.5`), live-verified in BOTH billing states and BOTH viewports; the
clone shipped the h3-only header. The R15 pin had asserted the badge's
ABSENCE off "bar + border only" evidence — evidence that must have come
from the OLD app build served during the rolling-deploy window (the app
bundle hash never changed, so the badge was in the live's bundle all
along). Free/Starter/Scale headers, the card roots, the top bar, CTA
variants — everything else on the page matches byte-for-byte.

TDD execution: RED first — `tests/dashboard-r26-parity.test.tsx` (5 SSR
pins: one badge, byte-exact class string, header-row position after the
h3, R15 root/top-bar pins hold, no badge on non-popular cards) + the
replaced positive source pin in `tests/shell-parity.test.tsx` — 6 failing
for the right reasons (one test helper fixed to slice from the card root,
which precedes the h3). GREEN: `plan-panel.tsx` renders the Badge
primitive (`variant="default"` + the gradient-first tail, gated on
`plan.popular`) — the cn merge emits the live's byte-exact order. 28/28
across the two files; full suite **667 vitest | 2 skipped (66 files)**.

e2e: NEW `e2e/pricing.spec.ts` closes the coverage gap that let F1 slip
through five drift watches — badge presence/class/position, no badge on
the non-popular cards (scoped to each h3's PARENT header row after an
ancestor-div locator artifact), and both toggle states with the
$249 → $199 annual price assertion ("billed monthly" turned out to be
marketing-section copy — replaced with the price check). Full e2e:
**16/16 chromium (19.7 s)**.

Runtime byte-verify: the dev server's Growth card header captured and
diffed against the live — badge class string, header classes, child order
(`[H3:Growth, DIV:POPULAR]`) **identical**.

7 screenshots captured from the dev server (`docs/screenshots/r26-*`):
pricing page + badge close-up, dashboard KPIs, visitors table, install,
landing mobile menu, dashboard mobile Sheet — VLM-verified (the yellow
POPULAR pill on the Growth $249/mo card; the 4 links + Start
Identifying CTA in the menu).

`.env.example` re-verified: 3 keys, byte-consistent with `.env` and the
codebase's `process.env` reads — no changes needed; the R23 contract
holds.

Gates: lint 0 · typecheck 0 · **667 vitest / 66 files** (2 skipped) ·
build ✓ standalone ✓ **16/16 e2e chromium** · zero console errors.

Docs: README R26 bullet, AGENTS R26 fact block, CLAUDE rounds 11–26
mirror, PAD v1.25, SKILL.md R26 rows (project_state, pre-ship counts,
Appendix A/D, R26 gate block, quick-reference counts), the plan doc's
execution log, this session log, the repo worklog entry.

Committed to main and pushed via the SSH wrapper (dry-run → push →
remote-ref verification).

Next (R27): bundle hashes again; the pricing page is now in the standing
regression loop (r26 e2e); continue the settings-save toast watch
(silent as of R26); re-confirm the NTW no-badge branch if the live's
data returns to `lastWeek=0`.
