# Session 35 — R31: R30 completion (install-island repair) + 16th-generation drift watch

**Date:** 2026-09-24 · **Repo at arrival:** `0448ae2` (main, clean, synced
with origin) · **Repo at close:** see the final commit (main, pushed via the
SSH wrapper).

## Arrival assessment (evidence-based)

Fresh clone; docs reviewed (AGENTS/CLAUDE/README/PAD v1.28/SKILL at R29
state + session_33/34, the R30 plan, both worklogs — the five root docs'
R30 sync had never happened; the canonical docs/worklog.md ended at R29
while the R30 commit carried a root-level worklog mirror that also still
mirrored R29). Environment rebuilt per the documented contract:
`.env` with `DATABASE_URL="file:../db/custom.db"`, `db/` pushed + seeded
at the repo root. Two SANDBOX quirks this session (for the next agent in
this environment): (1) symlinks are BLOCKED — the R29 stale-shell
unifier is unavailable, and the shell re-injects the stale absolute
`DATABASE_URL` on every command, so every db/dev command needs an
explicit `DATABASE_URL="file:../db/custom.db"` prefix; (2) npm 11.19's
install-scripts posture blocks prisma/esbuild/unrs-resolver postinstall
scripts — approve them once with `npm install-scripts approve esbuild
prisma unrs-resolver` (the resulting package.json `allowScripts` block
was reverted from the commit — environment artifact, not project need).

**Arrival gates — main was BROKEN:** lint 0, but tsc 1 error (TS2307:
`install/page.tsx` imports `@/components/dashboard/install-panels` —
never committed) and vitest 706 | **10 failed** | 2 skipped (badge-
consumers' 7 tests couldn't run at all — its describe reads the missing
island file). The R30 commit `40a7fa8` had shipped the edits to
existing files but not the new island file, not the 6 repointed pins,
not the `src/lib/sites.ts` retirement — and its 3 new e2e specs were
the failing free-plan-cap case the interrupted session_34 transcript
ends on. Root cause: staging gap between a green working tree and the
commit; the interrupted session's own transcript proves the tree was
green before the interruption (719 | 2 skipped).

## Phase A — repair (the committed RED pins WERE the spec)

Reconstructed the island from its committed evidence (R30 pins +
badge-consumers strings + the page's prop shape + the pre-R30 page JSX
at `40a7fa8~1`, verbatim) with `useState(sites[0].siteKey)` (newest
default) and a find-fallback defense; repointed the 6 pins verbatim;
`git rm src/lib/sites.ts tests/sites.test.ts`. Gates: lint 0 · tsc 0 ·
**719 passed | 2 skipped (721 total)** — exactly the interrupted
session's number, reconciled: 700 − 4 retired + 23 new, with badge-
consumers' 7 tests back in the count. Build green.

## Phase B — the e2e install gate

The committed spec added its second domain through the UI — impossible
for the FREE demo account (1-domain cap; the add is rejected, the R27
toast never fires). Replaced with a direct `db/e2e.db` probe-site
insert (`seedProbeSite`, valid hex key, `lastEventAt: null`). First
design had a real defect the consecutive-run check caught: leaked
probe sites broke pipeline (it reads the Install snippet's key and
host-matches its beacon against demo-store) and dashboard (asserts the
seeded domain visible) on reused servers. Made the fixture hermetic
(`cleanProbeSites` beforeAll + afterAll; per-test family clean).
Gates: **28/28 e2e chromium, verified across two consecutive runs**
(the second reusing the first's server — the originally-failing
reuse case now clean).

## Phase C — 16th probe generation (dual live+clone sessions)

No redeploy (all three tracked bundle hashes unchanged — 6th
consecutive stable generation). **Mobile navs (standing user
emphasis): FULL PARITY both surfaces, both sites** — marketing
dropdown @375 (toggle bytes, container bytes, 4 links + CTA,
close-on-VISIBLE-link click + icon reset — one hidden-anchor false
alarm re-learned the R25 lesson; live scroll 7424 / clone 7404, the
documented 20 px D5 delta) and the dashboard Sheet @375 (inline
`--sidebar-width: 18rem` → 288 px + 7 links, closes on cross-page nav,
both sides). Tailwind v4 watch: no anomalies. R30 fixes runtime-
verified against fresh live captures (wrapper byte-identical; the
live's settings inputs bare; the live's switcher pure client state,
newest-first default, clean URL through a swap). Chart r28 loop
byte-identical. Console sweep 19 routes / 0 errors. **No new drift.**

## Phase D — docs + ship

6 VLM-verified screenshots `docs/screenshots/r31-*` (the dev server
running the remediated tree; the switcher shot used a throwaway dev-DB
probe site, cleaned after capture). `.env.example` re-verified. Full
doc sync for both rounds: README R30+R31 bullets + header totals
(719/28), AGENTS R30+R31 facts (incl. the "green tree ≠ green commit"
lesson), CLAUDE rounds 11–31 mirror, PAD v1.29 (revision block, §8.1
totals, the e2e row), SKILL.md frontmatter + Appendix A/D rows + final
gates + Quick Reference, the R30 plan's execution log (completion
note), the R31 plan + this session log, docs/worklog.md + the root
worklog mirror. Committed to main; pushed via
`docs/ssh_git_wrapper_v3.py --remote git@github.com:nordeim/pixel-identifier.git`;
remote ref verified == local HEAD; operator key shredded.

## Next (R32 candidates)

Bundle hashes (a change triggers the full token-diff sweep); the R30
surfaces join the standing regression loop (the wrapper e2e spec, the
install island specs); the R29-queued candidates that R30 already
closed stay closed (DomainSwitcher open state = parity; settings panels
= fixed F2); remaining candidate surfaces: the marketing footer's
open-state links at 375, the blog SSG pages' DOM (never runtime-diffed),
and the activity pagination footer (runtime-latent while the live stays
under 50 events/page).
