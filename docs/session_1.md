I'll continue the pixel-identifier iteration. The remediation round is complete and pushed (`188bae5`). Now I need to plan the next round toward full pixelco.io parity. Let me first reconstruct the environment and check the current state.
The repo is at `3fc49ac` (round-3 complete: full marketing parity, 125 tests, PAD v1.2), working tree clean. The local `origin/main` ref is stale (wrapper pushes don't update it) — remote was verified at `3fc49ac` last session. Let me reconstruct the SSH environment and verify remote state, plus confirm repo health.
Shim and paramiko are in place. Now let me verify the actual remote state using the wrapper (local ref is stale at `78f8342` — wrapper pushes don't update it).
Remote confirmed at `3fc49ac` — everything up-to-date. Now let me verify repo health and review the current state (PAD §11 known issues + dashboard inventory).
PAD §11 gives the open items. Round 3 covered marketing parity; the deepest remaining opportunity for "visual + functional parity + production-ready" is (a) the **dashboard surface** vs live app.pixelco.io, and (b) **production hardening** (Dockerfile/CI, SQL aggregation, CSP). Let me check repo structure and the verify run.
The background job didn't survive. Let me run verify in the foreground with a longer timeout.
Repo health confirmed: **125/125 tests, lint clean, tsc clean, build green (34 routes)**. Now for the round-4 parity audit — the dashboard surface vs the live app. Let me load the browser automation skill.
Now let me audit the live app.pixelco.io dashboard — log in and capture every surface for comparison.
Logged into the live app. Note the sidebar structure and an **FR language toggle** (EN/FR switcher — a parity item). Let me save auth state and screenshot every dashboard surface.
The FR element is elusive in DOM queries — I'll catch it in the VLM screenshot pass. Now let me start the local app and capture equivalent screenshots for comparison.
Local server healthy. Now let me log in to the local app and capture the same 7 dashboard surfaces.
Login didn't navigate — likely missing NEXTAUTH_SECRET in the standalone env. Let me check and restart with it.
The URL shows a native GET form submission (password in query!) — React likely hadn't hydrated when I clicked. Let me wait for full load and retry.
Still GET-submits with credentials in URL — a real bug candidate. Let me check console errors and the login form code.
The form code is correct (`preventDefault` on submit). Suspect: **standalone server missing static assets** (JS chunks 404 → React never hydrates → native form GET). Let me verify.
**Found a real deployment gap**: `.next/standalone/.next/` has no `static` folder — the documented standalone deployment would serve a broken, unhydrated app (forms native-submit → password in URL). This needs fixing in scripts + docs (+ Dockerfile later this round). Let me patch it locally and continue the audit.
The restart actually failed — EADDRINUSE means the old server never died. Let me kill it properly and restart.
Old server had cached the boot-time static listing. Now chunks serve 200. The finding stands: **standalone output needs `.next/static` copied + this must be automated and smoke-tested**. Now let me log in and capture the local dashboard pages.
Login works. Capturing all 7 local dashboard surfaces now.
No page errors, structure matches live. Now let me run the visual comparison — loading the VLM skill to compare screenshot pairs.
The local screenshot looks like an unstyled/failed render — the browser cached the earlier 404s. Let me clear cache and re-capture.
Curl gets 200 for everything — the network log entries were stale. The screenshots may have been captured during the broken window. Let me re-login and re-capture all pages fresh.
The fresh screenshot STILL shows skeleton blocks — but the a11y snapshot shows full content. Something's off between page state and screenshot capture. Let me investigate.
Earlier screenshots caught the loading-skeleton transition. Now it renders properly. Let me re-capture ALL local pages with content-aware waits.
Relative paths save to the daemon CWD, not my shell. Let me find the strays and re-capture with absolute paths.
All 7 local captures verified rendered. Now the pairwise VLM comparison — overview first.
Rich findings. Let me compare the remaining page pairs.
The live 02–07 screenshots were lost to the relative-path/daemon-CWD issue (overwritten by local captures). Let me re-capture the live pages with absolute paths — the live session is still authenticated.
All 7 page pairs compared. Let me zoom into the live sidebar for precise details (logo shape, icons, section headers, FR element, usage card) before writing the plan.
Let me verify the exact live icons/logo/FR element via DOM extraction (SVG internals).
Confirmed exact live icons. Now the logo and FR element:
No title icon on live (VLM misread the sidebar toggle). Let me check the live bell popover — it has a hot-pink unread dot.
The live bell opens nothing — it's a button with a static unread dot. Now let me ground all findings in our code — reading the key dashboard components.
Let me extract the live topbar title/subtitle for every page directly from the DOM:
The audit is complete — I have a comprehensive, code-grounded gap list. Let me check the existing plan format, then write the round-4 plan.
Live sidebar collapses to a **narrow icon rail** (~64px, icons only). Audit complete — now let me compile the plan document.
Plan written. Now validating key claims against the codebase before execution:
All plan claims verified against code. Committing the plan, then executing Task S1 (nav metadata seam, TDD).
**Task S1 — RED**: the `dashboard-nav` data-module test:
RED confirmed. **GREEN** — creating the module:
S1 GREEN (16 tests). Committing, then executing S2–S8 as the chrome refactor:
Now **S2+S4+S5+S7+S8** — the sidebar, topbar, layout, and logo rewrites. First the sidebar-nav (consuming the seam, live icons, Title Case headers, pale active state, collapse rail support):
Now **S3** — the logo mark (4-lobe gradient blob, matching live geometry):
Let me refine the logo with cleaner geometry (overlapping same-fill shapes = visual union):
Now the shared chrome store + sidebar shell + topbar rewrite. First, check the event model fields for the unread query:
The DB uses `name` (not `type`). Let me align the helper and test to the real event shape:
Now the chrome store, sidebar shell, and topbar:
Adding the `hasRecentIdentifications` server query — RED test first:
Now the layout rewrite (SidebarShell + unread + p-6 + canvas) and the visitors-table chrome publishing:
Now **S6** — visitors-table publishes counts; in-page counts row removed; Export Selected becomes a selection-only bar:
Now **V1+V2** in the same file — plain-text tabs on their own row + teal confidence bars:
Now V2 — teal confidence bars in the table body:
Let me run lint + typecheck on the changes so far:
Clean. Now **O1+O2** — the trend chart and overview page restyle:
Now **A1** — the activity feed restyle:
Now **I1** — the install page light snippet block:
Now **E3+E4** — platform instructions tabs and step numbers:
Now **D1** — the domains panel row layout:
Now **G1** — first capture the live pricing card contents precisely:
Free's two extra items are the only catalogue drift. **RED** — extend plans.test.ts:
G1 GREEN. Now **G2** — the plan-panel restyle:
No radix switch installed. I'll write a dependency-free accessible Switch (role="switch", keyboard support):
Now the plan-panel toggle + cards rewrite:
Now **X1** — settings parity. First check the profile action schema:
RED confirmed — the action nulls `name` when absent. **GREEN** — make the action name-agnostic:
Now the settings panel form + danger zone restyle:
Found it — absent FormData keys yield `null`, which fails `.optional()`. Fixing the action to normalize:
Now fix the leftover `Link` usage in the settings danger zone (remove the CSV note per parity):
Lint clean. Now **R4** — `getTopPages` SQL groupBy. First the current implementation and a RED test:
RED confirmed (tie ordering is nondeterministic in the JS version). **GREEN** — SQL groupBy:
R4 GREEN. Now **R1** — the standalone build script + smoke guard:
Now the smoke test (opt-in via env var) and package.json wiring:
Now **R2** — Dockerfile, .dockerignore, and entrypoint:
Now **R3** — the CI workflow:
All workstreams implemented. Running the full verification gate:
The lint warnings are `console.log` in build-standalone.mjs. Fixing to `console.info`:
**Full verify GREEN: 157 tests passed (25 files), build OK.** Now committing in logical workstream units:
All 14 commits in, tree clean. Now the standalone smoke test (the P-01 regression guard):
Smoke passes. Now the full browser E2E — restart the standalone server fresh and re-capture:
Fresh standalone serving chunks 200. Now the browser E2E pass:
All 7 captured. VLM re-diff — overview pair first:
Valuable catches. Let me get the live active-nav color from the DOM directly, then fix the remaining chrome items:
Exact live tokens extracted: active = bg `#F8F6F2`, text+icon gold `#CC9900`, weight 500, radius 10px. Applying the three fixes:
CardHeader is a grid with a `card-action` slot pattern. Using the proper slot:
Now the tooltip label capitalization in the trend chart:
While those build, run the remaining VLM re-diffs (visitors + activity + install):
Live checkboxes are **circles** (radius 8px, yellow border). Fixing the visitors-table checkboxes:
Now the install page restructure — in-page H1, domain Select switcher, and platform tab icons:
Now the platform instructions icons (Code/Globe/ShoppingBag/Code per live):
Applying the three domains fixes (outline button, smaller count, circle-check badge):
Settings is a close match. Applying the pricing refinements (summary position, remove Save-20% label, centered FAQ):
Now rebuild standalone, restart, and do the final capture + interaction tests:
The stale server survives `pkill` (Next renames its process title). Killing by port and restarting:
Exact live tokens applied. Recapturing all pages from the fresh build:
Now the interaction tests — sidebar collapse, mobile, and console errors:
Collapse verified. Now mobile + console errors + marketing regression:
Table scroll works (standard pattern). Now the marketing regression check after the logo change:
Marketing clean. Final VLM verdict on the overview pair:
CLOSE MATCH on overview! Two final nuances to verify — chart legend and sidebar footer order:
DOM confirms both are VLM misreads — we match. **E2E complete: CLOSE MATCH.** Committing the second wave of fixes:
Now docs realignment. Checking current README/CLAUDE structure:
Now the PAD v1.3. Checking the revision block and ADR structure:
Now §11 known-issues refresh and §12 key files:
Let me check PAD §9 (Build & Deployment) for the standalone gap mention:
Docs committed. Final gate: secret scan, then push via the SSH wrapper:
Secret scan clean (only placeholders). Pushing 17 commits via the SSH wrapper:
Remote verified at `5947505`. Final housekeeping — worklog append and cleanup:
Round 4 is complete and pushed — remote `main` is now at `5947505` (17 commits, 44 files, +2071/−567).

## What this round delivered

**Dashboard parity with app.pixelco.io** (audited live with your account, DOM-extracted + VLM screenshot diffs):
- **Chrome**: live lucide icon set, Title Case section headers, exact active-item tokens (`#F8F6F2` pill / `#CC9900` gold), 4-lobe gradient logo, h-14 topbar, honest hot-pink bell dot (real 7-day identification query), collapsible desktop icon rail with persistence
- **All 7 pages**: purple/teal chart, topbar Visitors counts + Export All, plain-text tabs, teal confidence bars, circular checkboxes, light snippet block + domain combobox, live pricing-card structure (switch toggle, POPULAR on Growth), live-matching settings form

**Production readiness** (closes PAD §11 items):
- 🚨 **Fixed a real deployment defect**: standalone builds never shipped `.next/static` — pages served unhydrated and the login form native-GET-submitted **passwords into the URL**. Now `npm run build:standalone` + an opt-in smoke test guard it
- Multi-stage **Dockerfile** (non-root, HEALTHCHECK, db-push entrypoint), **GitHub Actions CI**, `getTopPages` moved to SQL `groupBy`

**Verification**: 157 tests green (was 125), standalone smoke passes, full browser E2E (no credentials in URL, rail toggle, mobile 390px, zero console errors), VLM final verdict: **CLOSE MATCH**.

**Suggested next steps**: the remaining PAD §11 items are strict CSP (nonce plumbing), shared-store rate limiting, and Playwright E2E — happy to tackle any of these, or do another live-vs-clone diff pass after you review the pushed dashboard.
