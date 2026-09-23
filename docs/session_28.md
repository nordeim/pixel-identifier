# Session 28 — Round-27 Sonner Toast Parity

Workspace had been reset — re-cloned `nordeim/pixel-identifier` at `b300560`
(R26-clean state). Reviewed the full doc chain (AGENTS, CLAUDE, README, PAD
v1.25, SKILL.md, session_26/27, the R26 plan, the Tailwind-V4 validation
report, worklog) and cloned scandihaven for the tech-stack patterns +
skills catalog reference. Environment brought up green: deps installed
(654 pkgs), repo `.env` created with the user's contract
(`DATABASE_URL="file:../db/custom.db"`, `db/` at the repo root),
`db:push` + `db:seed` healthy, dev server
`/api/health {"status":"ok","db":"up"}`. One session quirk handled (the
R26 recurrence): the workspace bootstrap exports a stale absolute
`DATABASE_URL` into every shell (cached before any edit); unified via a
symlink from the old path to the repo DB so every resolution path lands
on the same physical file — no repo change.

Arrival gates on the untouched R26 tree: lint 0 · typecheck 0 · **667
vitest | 2 skipped (66 files)** — the repo's documented state held.

Starting the 12th probe generation (dual agent-browser sessions — live +
clone; 1280 desktop + 375 mobile; settled-DOM captures;
visibility-filtered click targets):

Bundle hashes first (the #1 drift signal): marketing `C3AAh5Je.js` /
`bLMWzsGr.css` + app `index-nhmKaUsm.js` — **all UNCHANGED, no live
redeploy**; the R24 divergence inventory stays the system of record.

Mobile navigation (the standing user emphasis), both surfaces, both
sites: marketing dropdown bytes + `w-6 h-6` toggle + close-on-link-click
(live scrolled to 7424, clone 7404 — the documented 20 px D5 delta);
dashboard Sheet `--sidebar-width: 18rem` inline + ~288 px inner + close
on cross-page nav. Parity everywhere. TW4 watch: no bare-var brackets,
the 667-green run re-proves the R18 seams, e2e exercises the
`md:hidden` emission. 19 clone routes swept — zero console errors.

Standing targets: the R26 POPULAR badge re-captured on the live —
byte-identical to the clone's fix; NTW still `0 this week / 2 last week`
(negative branch); install copy swaps to plain `Copied!` (no toast);
topbar subtitle `2 individuals · 1 companies identified` on BOTH sides;
activity 6 rows, no footer (< 50 — the R22 model); login failure SILENT
on the live (the clone's inline error stays a value-add).

Then — new this round — the live's MUTATION flows driven directly, and
**R27-F1 — a real drift family**: the live fires **sonner SUCCESS
toasts** on mutation success. Settings save → `Settings saved`; domain
add → `Domain added successfully`; domain delete → `Domain removed`
(probe domain created + deleted on the live to verify both flows; the
account left clean). All bottom-right, Heroicons check-circle icon,
title-only, ~4 s auto-dismiss; idle pages carry just the EMPTY
`<section aria-label="Notifications alt+T" …>` (the `<ol>` mounts only
while toasts exist). The R24–R26 "silent save" evidence was a transient
backend state — the bundle hash never changed, so the toast code was in
the live's bundle all along (the same class of miss as R26-F1: stale
evidence, not stale bundle).

The runtime was fingerprinted from the live's app bundle against every
sonner release on npm: the CSS `:where()` wrapper + `translateY(-10px)`
lift + 3× `data-lifted` narrow it to 1.7.x (2.0.x drops `:where()`,
shifts to `-8px`, and adds a `data-react-aria-top-layer` attr the live
does not render; 1.5.x predates `data-lifted`); the byte-identical
Heroicons success-icon path confirms the family; **sonner 1.7.4**
(the final 1.7 release) pinned exact.

The clone shipped the WRONG generation: the Radix toast trio
(`ui/toast.tsx` + `hooks/use-toast.ts` + `ui/toaster.tsx`, viewport
anchored TOP on mobile) feeding `domains-panel.tsx` (delete title
`Domain deleted` + a description the live does not render), and an
inline `Saved` line on the settings page (the R6-era stand-in).

TDD execution: RED first — `tests/toast-r27-parity.test.tsx` (14 pins:
the wrapper class family, the SSR idle-section bytes, the
settings/domains toast copy, the layout mount, the Radix retirement,
the package.json pin) failing on the missing wrapper import. GREEN: the
shadcn sonner wrapper `src/components/ui/sonner.tsx` (the live's toast
class family, NO default overrides — bottom-right, light, 356 px,
32/16 px offsets are all sonner 1.7 defaults), the root-layout mount
swap, the settings migration (`toast.success('Settings saved')` /
`toast.error(...)` from the state-identity effect seam — the R24-F9
spinner pin untouched), the domains migration (delete title fixed to
the live's `Domain removed`, description dropped, error branches via
`toast.error`), the Radix trio deleted, `@radix-ui/react-toast`
uninstalled. 14/14 pins; full suite **681 vitest | 2 skipped
(67 files)**.

e2e: NEW `e2e/toasts.spec.ts` (2 specs). Two test-side artifacts fixed
en route: (1) the domain spec initially drove the demo account, whose
FREE plan (1-domain limit, used by the seed) correctly rejected the
add — the spec signs up its own throwaway account; (2)
`getByLabel('Password')` needs `{ exact: true }` on the signup page
(strict-mode collision with "Confirm Password"). Full e2e: **18/18
chromium (30.4 s)**.

Runtime byte-verify: the clone's idle section, the `<ol>` attributes +
CSS variables, the toast `<li>` class family, the check-circle icon
path, and the title diffed against the live captures — **identical**.

7 screenshots captured from the dev server (`docs/screenshots/r27-*`):
settings toast, domains delete + add toasts, dashboard, pricing badge,
landing mobile menu, dashboard mobile Sheet — VLM-verified ("Settings
saved" / "Domain added successfully" bottom-right with the check icon;
4 links + Start Identifying CTA in the mobile menu). The demo domain's
seeded verified status was restored after the delete/add capture cycle.

`.env.example` re-verified: 3 keys (DATABASE_URL / NEXTAUTH_SECRET /
NEXTAUTH_URL), byte-consistent with `.env` and the codebase's
`process.env` reads — the toast migration added no env surface.

Gates: lint 0 · typecheck 0 · **681 vitest / 67 files** (2 skipped) ·
build ✓ standalone ✓ **18/18 e2e chromium** · zero console errors.

Docs: README R27 bullet (681/18), AGENTS R27 fact block, CLAUDE rounds
11–27 mirror, PAD v1.26, SKILL.md R27 rows (project_state, pre-ship
counts, Appendix A/D, R27 gate block, quick-reference counts), the plan
doc's execution log, this session log, the repo worklog entry.

Committed to main and pushed via the SSH wrapper (dry-run → push →
remote-ref verification).

Next (R28): bundle hashes again (a change triggers the full token-diff
sweep); the toast system enters the standing regression loop (r27 e2e);
continue the NTW no-badge branch watch if the live's data changes;
consider e2e specs for the domains delete-confirm flow (the AlertDialog
divergence feeding the sonner toast).
