# Session 32 — Round-29 Select Item Class-Order Parity

Workspace re-cloned fresh (the session environment had been reset —
`f13abc1`, two docs-only commits after the R28 push `bd9a799`:
`docs/session_31.md`, the operator's R28 transcript). Reviewed the full
doc chain (AGENTS, CLAUDE, README, PAD v1.27, SKILL.md, session_30/31,
the R28 plan, the repo worklog) and validated against the codebase: the
R28 chart config in place, 6 e2e spec files, `.env` contract
`DATABASE_URL="file:../db/custom.db"` with `db/` at the repo root,
`.env.example` consistent (3 keys), vitest + Playwright suites
configured, the repo `skills/` folder excluded from checks. Environment
rebuilt: `.env` restored, `db/` pushed + seeded (5 visitors · 3
identified), the known session quirk handled again (the workspace shell
exports a stale absolute `DATABASE_URL` — a symlink at the old path
unifies both resolutions onto the repo DB). This session ran long and
was continued after a context reset — the probe phase was completed
across the two halves with the findings carried through the plan doc.

Arrival gates on the untouched R28 tree: lint 0 · typecheck 0 · **693
vitest | 2 skipped (69 files)** — the documented state held. Dev server
healthy.

The 14th probe generation (dual agent-browser sessions — live + clone;
1280×900 desktop + 375×812 mobile; settled-DOM captures):

Bundle hashes first: marketing `C3AAh5Je.js` / `bLMWzsGr.css` + app
`index-nhmKaUsm.js` — **all UNCHANGED, no live redeploy** (the fourth
consecutive stable generation).

Mobile navigation (the standing user emphasis), both surfaces, both
sites: marketing dropdown bytes + close-on-link-click (live scrolled
7424, clone 7404 — the documented 20 px D5 delta); dashboard Sheet
`--sidebar-width: 18rem` + 7 links + close-on-cross-page-nav on BOTH
sides — one early clone-side false alarm (the dialog still open + the
URL unmoved after a nav click) traced to dev-server compile latency on
the first visitors-page hit, not a regression; the re-read confirmed the
unmount. Parity everywhere.

Standing loop: the chart (r28) byte-identical both sides (17 tick lines,
plot origin x=65, 12-of-14 labels); the settings-save sonner toast
byte-identical (4 s auto-dismiss both sides); the R26 POPULAR badge
byte-identical; NTW still `0 this week / 2 last week` → `-100.0%`
negative branch; install copy swaps to plain `Copied!`; topbar `2
individuals · 1 companies identified` + 3 rows both sides; the clone
route sweep — zero console/page errors. TW4 watch clean.

R28's candidate surfaces closed out: **the tooltip CONTENT** (label +
`name : value` entry format — `Pageviews : 4` / `Identified : 2`, no
item colors, the recharts default wrapper) — **byte-identical both
sides; confirmed stable, joins the verified list.** The **activity
pagination footer** — runtime-confirmed LATENT on the live (7 events
under the 50/page R22 pin; no footer rendered, matching the R22
model — the footer structure stays source-pinned by
`tests/activity-r22-parity.test.tsx`).

NEW probe surface — **the Radix Select OPEN-state portal** (the
trigger/chevron/viewport/scroll-buttons/items tree — a runtime-only
surface no prior round diffed end-to-end; the R11 ground truth
captured only the R11-era bundle): **R29-F1 — a real (invisible)
drift.** The live renders every `[role=option]` class attribute as

    relative flex w-full cursor-default select-none items-center
    rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none
    data-[disabled]:pointer-events-none data-[disabled]:opacity-50
    focus:bg-accent focus:text-accent-foreground

— the `data-[disabled]:` pair BEFORE the `focus:` pair, consistent on
all THREE of the live's Select surfaces (both visitors filters + the
install DomainSwitcher). The clone shipped the canonical legacy-shadcn
(R11-era) focus-first order. Rendered CSS is identical either way
(Tailwind attribute order carries no specificity) — pure DOM-byte
parity, and the live's DOM is the contract. The trigger, chevron,
viewport, scroll buttons, and the indicator-LEFT layout
(`pl-8 pr-2`, the `h-3.5 w-3.5` span, `lucide-check h-4 w-4`) were
byte-identical pre-fix; the check-icon svg-level `aria-hidden` is the
documented D4 lucide residual (the aria wrapper span renders on BOTH
sides — only the svg attr differs).

TDD execution: RED first — `tests/select-r29-parity.test.tsx` (7 pins:
the live string verbatim, the legacy-order negative, the layout guard,
the indicator/ItemText structure, the two consumer no-override pins,
the trigger SSR bytes; 2 failing pre-fix) + the NEW `e2e/select.spec.ts`
(3 runtime specs: the confidence options' class attributes
order-sensitive, the source options' ditto, the selected item's
indicator structure; the two class specs failing pre-fix — run against
the dev server via `E2E_BASE_URL` for the RED half). Static-render
probe note: `renderToStaticMarkup` does NOT render the Radix portal
items — the item class order is only observable in a real browser,
hence the e2e spec carries the runtime pin. GREEN: one-string reorder
in the single `SelectItem` primitive
(`src/components/ui/select.tsx`) — both filter consumers and the
DomainSwitcher pass no className override, so one fix covers every
Select surface.

Runtime byte-verify: the clone's open portal diffed against the live
capture — **identical**: all 4 confidence option class attributes
(order-sensitive, single unique string), the trigger class family
(incl. the consumer `w-44`), the viewport classes, the selected item's
indicator wrapper + check path. Remaining deltas are the documented
residuals only (svg aria-hidden = D4; runtime-generated radix ids).

Gates: lint 0 · typecheck 0 · **700 vitest | 2 skipped (70 files)** ·
build ✓ standalone ✓ (one transient worker-spawn failure, clean on
retry) · **24/24 e2e chromium (38.2 s)**.

4 screenshots captured from the dev server (`docs/screenshots/r29-*`):
both filter open-states (desktop 1280×900), the standing dashboard, and
the mobile 375×812 open-state — VLM-verified (4 options / 3 options with
the check on the LEFT of the first item, the R21-F3/F4 option texts
verbatim, clean overlay rendering at both viewports, the dashboard
intact with the chart axis chrome).

`.env.example` re-verified: 3 keys, byte-consistent with `.env` and the
codebase's `process.env` reads — the Select fix added no env surface.

Docs: README R29 bullet (700/24), AGENTS R29 fact block, CLAUDE 11–29
mirror, PAD v1.28, SKILL.md R29 rows (project_state, Appendix A/D, the
R29 final gate block, quick-reference counts), the plan doc's execution
log, this session log, the repo worklog entry.

Committed to main and pushed via the SSH wrapper (dry-run → push →
remote-ref verification).

Next (R30): bundle hashes again (a change triggers the full token-diff
sweep); the Select open-state joins the standing regression loop (r29
e2e); the tooltip content joins the confirmed-stable list; standing
toast/pricing/mobile-nav/chart loops continue; candidate surfaces —
the DomainSwitcher open-state runtime byte-diff (the third live Select
surface, currently covered by the primitive-level pins only), and the
settings-tab panel surfaces if the live's data makes them stable.
