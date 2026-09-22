I'll continue the pixel-identifier parity iteration. Let me start by checking the current workspace state and refreshing via `git pull`.
R21 shipped at `cc3c550` per the worklog. The user's message now references `docs/session_19.md` — a new user-side commit likely awaits. Let me pull and see.
Pull brought in `1b63733 Create session_19.md` — the user's R21 narrative, exactly the established pattern. Now let me meticulously review the core docs (per instructions).
Both session logs reviewed. Now the R21 plan doc and the core docs:
Now the four core docs — AGENTS, CLAUDE, README, and PAD (focusing on the R21-updated state):
The persisted output is nesting. Let me page through the original files directly:
AGENTS.md fully reviewed. Now CLAUDE.md and README.md:
CLAUDE.md reviewed. Now README.md:
README reviewed. Now the PAD revision history and Known Issues sections:
All four core docs reviewed — documented state: R21 shipped (PAD v1.20, 568/56 tests, main @ cc3c550 + user's session_19.md). Now let me set up the Round-22 plan and run the baseline verification gate.
Tests GREEN — 568/56 (documented state confirmed). Now build:
**Baseline gate GREEN** — lint ✓ · typecheck ✓ · 568/56 ✓ · build ✓ at `1b63733`. Codebase matches the documented R21 state exactly. Now verifying the audit toolchain:
Toolchain intact: R21 baseline captures + both live bundles survive, dev server healthy. Let me verify the capture inventory and check scandihaven's skills-catalog:
scandihaven isn't cloned locally this session. Let me fetch it (shallow) to review its skills-catalog as instructed:
agent-browser is the relevant scandihaven skill — already the established toolchain (R18–R21 probes). Let me check the R21 drift script pattern to build the R22 version:
Toolchain verified (agent-browser 0.38.1, R21 baselines intact, both live bundles saved). Now — **Phase A: drift watch (7th consecutive)**. Let me check the agent-browser command syntax and write the R22 capture script:
Let me examine the R21 capture format to replicate the exact method:
The R21 captures are element extracts. Let me determine the exact extraction boundaries (head/tail of files) to replicate:
Format understood. Now let me write the Phase A drift-watch script. First, a quick syntax test on the live landing:
Selector matches the R21 baseline. Writing the full Phase A drift-watch script:
Landing captured (14KB) — but the R21 baseline is 76KB. Let me inspect the difference — likely the feed-row state or a different capture region:
R21 捕获了整个页面树（10 个部分），而不仅仅是主视觉（hero）。让我通过检查克隆（两者结构相同）中 “GDPR compliant” 的位置来找到正确的区域：
R21 捕获 = `main.innerHTML`（hero 到 BottomCta，无 footer）。让我也验证一下 shell 捕获的选择器：
Shell = outerHTML of `div[data-sidebar="sidebar"]` (balanced 19/19). Now let me complete the capture script with the verified methods:
All 9 pages captured, bundle hash **UNCHANGED** (`index-C3AAh5Je.js`). Sizes are slightly up across the board — now the tokenizer diff to separate real drift from timing artifacts:
My tokenizer is failing on escaped quotes — the eval output is JSON-escaped. Let me check and fix:
Unescaped — sizes now match baselines nearly exactly (dashboard 27296 vs 27298). Re-running the drift diff:
Seven pages **ZERO ops** — stable. Landing 3 ops + dashboard 48 ops need analysis (same token count on dashboard = likely value swaps):
Landing = known feed artifact. Dashboard = recharts SVG width 702→595 — a viewport-width difference, not real drift. Let me check the viewport and the remaining ops:
All 48 dashboard ops are pure chart geometry (zero text changes). Let me verify the viewport-dependence by checking R20's baseline chart width and re-capturing at a matching viewport:
R19–R21 all captured at chart width 702 — my session's window is effectively narrower. Let me set the viewport explicitly and re-capture:
Chart at 702 now — viewport artifact confirmed. Re-running the full drift diff:
**PHASE A VERDICT: LIVE 100% STABLE — 7th consecutive audit.** 8/9 pages zero ops; landing's 3 ops = the known feed-row phase artifact; bundle hash unchanged. 

Now **Phase B: signup→dashboard first-run funnel**. First, check whether the live's settings supports account deletion (needed for probe cleanup), and decode first-run states from the app bundle:
The live has a Delete Account flow — probe accounts are fully reversible. Let me decode the live's first-run/empty-state components from its app bundle:
Empty states decoded from the live bundle. Now the visitors empty state and any onboarding components:
All live empty-state branches decoded. Now compare with the clone's implementations:
Clone diverges on visitors empty strings. Let me compare the exact elements and check the clone's activity empty state:
Key structural divergences found. Now the clone's activity empty state:
Activity empty-state diverges (string + classes). Now check the live's top-pages and KPI empty branches in the bundle:
Top-pages empty uses **py-8** + "No page data yet". Checking the clone's:
More findings. Let me check the bundle's "onboarding." context and the signup flow's post-registration redirect:
The "onboarding" hit is just pricing copy — no onboarding wizard. Let me check if the live's signup requires email verification:
No app-level verification gate. Now the runtime probe — signing up a fresh account on the live. Let me check session isolation first:
Still on /signup — the confirm field fill likely failed. Let me inspect the form state and errors:
表单已填写，无错误，但未跳转。我来正常点击并监控网络：
Supabase auth returned **429** (rate-limited). Waiting and retrying once:
Signup POST returned 200 but no redirect — likely email-confirmation required. Let me check the response body and page state:
No session established. Let me try logging in with the probe credentials — and extract the live's signup handler logic from the bundle:
登录返回 400 — 邮箱确认是正式的限制门槛。让我解码线上环境的实际注册处理器分支，以准确记录其行为：
**Live signup funnel decoded definitively**: `password < 6` toast / mismatch toast / `signUp({emailRedirectTo})` / error toast / **`session ? router.push("/dashboard") : "Check your email"` toast**. The email-confirmation gate is the live's real design — the probe account is created but unverifiable (example.com). Runtime empty-filter states ARE reachable though. Let me verify with a no-match search on the live's visitors page:
运行时已确认：`<p class="text-sm text-muted-foreground py-12 text-center">` **替换**了整个表格（父级 Card `p-0`）。很有意思 —— no-match 搜索显示了 *“identified yet”* 分支。让我测试一下 confidence-filter 分支：
Low band matches 1 row. Let me decode what `M` actually is in the live's visitors component (the message-switch variable):
**Definitive decode**: `M` = the current tab's filtered count → no-match search/filter shows the *"identified yet"* message; *"match your filters"* only appears on pagination-past-end. Also the search placeholder varies by tab. Let me check the clone's visitors query + placeholder:
The clone's `total` is the filtered count — same as the live's M, but the message branch logic diverges. Now check the clone's page-reset-on-filter-change behavior (the live resets page→0 on every tab/search/filter change):
Clone resets page→1 on filter changes ✓ (matches live). But the live clears the row selection ONLY on tab change. Let me check the clone's selection reset:
The clone's selection-reset is saner than the live's stale-index behavior — intentional divergence to document. Now **Phase C: activity load-older flow** — decode from the bundle:
"Load older" 不在生产包中 —— 线上可能没有该按钮。让我来验证一下捕获的线上活动页面：
The live's activity page has NO buttons at all — no load-older. Let me decode the live's activity data fetch from the bundle:
**Jc = 50 events per page** with page-index state! Let me read the activity events rendering + pagination footer:
**MAJOR FINDING**: the live's Activity Log is **paginated (50/page, prev/next, "1–50 of N" footer)** — NO polling, NO load-older button. The clone ships 5s polling + cursor "Load older". Let me compare the clone's activity feed:
Clone has polling + load-older; live has NEITHER — it's plain 50/page pagination. Also the live's pageview badge is **variant "outline"**. Let me check the live's captured DOM badge classes:
Pageview badge matches ✓ (legacy outline string — R16 pin correct). Now check the live's react-query defaults (window-focus refetch would make the feed quasi-live):
QueryClient config lives in another chunk — the activity query itself has no polling (definitive). Now **Phase D: blog/docs sub-page interactions**. Let me probe the live's docs page for interactive elements:
Page loaded — the eval quoting failed. Retrying simpler:
A copy element exists on the code block + "Contact Support" button. Let me inspect these:
The live's docs code block has a **copy-to-clipboard button** (absolute top-3 right-3, lucide-copy). Checking the clone's docs page:
The clone already ships `DocsCopyButton`. Let me compare its exact classes with the live's:
The live's copy button is simpler (`bg-secondary` only, no hover classes). Let me click it on the live and observe the feedback behavior:
**发现**：线上环境的复制成功图标是 `text-green-500` —— 而副本缺少它。按钮本身完全匹配 ✓。现在是博客页面：
Blog index = static 10-post grid ✓ (R13-pinned). Now an article page:
Article pages = pure prose, no interactions ✓. Now the install page's zero-domain state — the live defaults to a placeholder key. Checking the clone's:
The clone renders a custom guidance card; the live shows the normal install page with a placeholder key. Let me verify the live's exact zero-sites branch:
**Confirmed**: the live's zero-domain install page renders normally with placeholder key `px_xxxxxxxxxxxxxxxx` — the clone's "Add a domain first" card is a divergence. Also checking the docs "Contact Support" button parity:
The live's marketing Button base is **new-gen** (`gap-2 whitespace-nowrap [&_svg]:size-4`) while the app bundle ships legacy. Checking the clone's shared Button primitive:
The clone's Button base has `font-medium`; the live's marketing docs button doesn't. Let me check the live's APP-bundle button for comparison:
The live ships two button bases (hero variant without `font-medium`). Let me compare the live's hero CTA on the landing with the clone's:
The clone's base adds `text-sm font-medium` (+ duplicated `rounded-md`) vs the live's hero CTA base. Let me verify the actual rendered string on the local dev server:
The clone's rendered hero CTA matches the live byte-for-byte — there must be a separate marketing Button. Verifying:
twMerge explains the clean strings — class parity holds. Only the tag differs (live `<button>` vs clone `<a>`). Let me check the live's handler in the marketing bundle:
The live's Contact Support has **no onClick/href** in the bundle — a dead button? Let me verify at runtime:
Live's Contact Support is a **dead button** (defect) — clone keeps working mailto but should match the tag (R17 contact-sales precedent). Now the clone's signup password policy vs the live's 6-char minimum:
Clone's password policy matches ✓. Let me check the exact 400 error from the probe login (to document the account state accurately):
Probe account documented as dormant-unverified. Let me check the live app's full JS chunk list (the QueryClient config may live in another chunk):
Bundle has no app-level QueryClient config → react-query defaults (focus refetch) — an architecture divergence to document. The audit is now complete. Let me scope the affected clone files and existing test pins before writing the plan:
Scoping complete. Let me read the activity page server component and the existing activity tests:
Full audit picture complete. Let me check for api/activity route tests, then write the R22 plan:
Plan written. Now validating it against the codebase — checking the dev seed's event count, the visitors table wrapper, and `nextCursor` consumers:
Dev DB has 24 events (< 50) — I'll inject extra events at verification time for the footer screenshot. A fresh local account will cover all first-run states. Now checking the test infrastructure for interactive tests:
Node env + static markup convention. Let me check how the R17 contact-sales onClick was pinned:
Pattern clear — static pins + route-level tests. Let me check the VisitorsTable props to write accurate RED tests:
Now writing the RED tests. First checking how R21 renders the VisitorsTable (filters shape):
All shapes confirmed. Writing RED test file 1 — activity parity:
Now RED test file 2 — the first-run/empty-state dashboard pins:
Now RED test file 3 — marketing docs pins:
Now run the RED check:
**RED confirmed — 21 failed / 4 passed.** One passing test (recent-ident order) has an ambiguous assertion — fixing it to pin the live's exact text-first order:
RED set (21+ failures). Now GREEN — implementation per plan order. **Fix 1: `listActivity` page mode:**
Now fix the return tail (remove the old cursor return):
**Fix 2: the activity API route** — page param + envelope:
**Fix 3: the ActivityFeed rewrite** — page state, footer, no polling, live empty state:
**Fix 4: the activity server page** — page 0 + count:
**Fix 5: visitors-table** — F1 empty state (p replacing table) + F10 placeholder:
Now the F1 empty state — find the table wrapper to restructure:
The map expression needs `))}` (map close + JSX brace). Fixing:
Compiles ✓ — remaining errors are in test files (expected legacy updates + my regex flags). Fixing my test's regexes first:
Now the legacy test updates. First `activity-query.test.ts` → page-mode:
Now the content-parity test's ActivityFeed call sites:
Now **Fix 6: dashboard page** — top-pages py-8 + recent-ident order:
**Fix 7: domains-panel** — the live's empty div in the p-0 card:
**Fix 8: install page** — the live's placeholder-key path:
**Critical discovery** — the live DOES have a zero-sites install branch ("Add a domain first to get your tracking snippet."). Let me extract the full branch:
The live DOES have a zero-sites interstitial — my F7 reading was wrong (the placeholder key is the loading fallback). Correcting the fix: rebuild the clone's branch to the live's exact structure. Let me get the live's hero button classes for the "Add a Domain" CTA:
The clone's hero button matches ✓. Two more install-surface details from the decode: the switcher renders only when >1 site, and the Quick Start copy button. Checking the clone:
The pre + positioning match ✓; the copy button needs "Copied!" + no color. Now updating the F7 test pins to the corrected live structure:
Now implementing the corrected install-page fix:
Now the switcher condition (only >1 site):
Now the copy-button fix ("Copied!" + no color) and the docs copy check (F8):
**Fix 10: docs Contact Support** — real Button + onClick mailto (F9):
The docs page is an RSC — onClick needs a client leaf. Creating `ContactSupportButton` following the DocsCopyButton pattern:
The raw button misses the primitive base string — using the Button primitive with the tail (twMerge resolves to the live's exact string):
Updating the F9 test for the extracted component:
 the R22 tests to check GREEN progress:
26/32 green. Let me see the 6 failure details:
Clear diagnoses — mostly test-side assertion fixes (source files use `className=`, and the class-attr ends with `h-7 w-7`). Let me check the two source issues first:
Classic R20 lesson — my comments contain the literal pins. Fixing comments + test assertions:
**All 32 R22 tests GREEN.** Full suite for regressions:
Lint clean. Now the build gate:
**FULL GATE GREEN — lint ✓ typecheck ✓ 596/59 ✓ build ✓.** Now browser verification. First confirm the dev server serves the new code:
Dev DB = shell-env custom.db (24 events). Let me write the verification script — a fresh first-run account + a 130-event user for the footer:
130 events seeded. Now browser verification — V1: activity footer on the 130-event account:
Empty result — let me check what's actually rendered:
The injected bcrypt hash is invalid. Let me copy the demo user's real hash:
**V1 VERIFIED** — 50 rows, "1–50 of 130", "Page 1 of 3", prev disabled. Now test page navigation:
Pagination verified end-to-end. Now confirm NO polling (idle network check):
No polling ✓. Now **V2: fresh signup first-run states**:
Install CTA = hero anchor ✓ (matches the live's asChild link). Now **V3: docs interactions**:
Clipboard API doesn't complete in headless (environment limit — same flow as the live). Now **V4: console-error sweep** across affected pages:
Zero console errors on all dashboard pages. Checking docs too, then capturing screenshots:
All clean. Now capturing the R22 screenshots:

I'll continue the interrupted R22 session. The log shows I was at the screenshot-capture phase after the full gate went GREEN. Let me check the workspace state first.
The workspace is intact with R22 changes uncommitted. Let me read the worklog tail and the R22 plan to see what remains.
工作空间完好——所有 R22 的代码变更已就位，包含 3 张截图和计划。之前的会话在 V5 截图阶段中断了。让我先验证一下关口（gate）是否依然是 GREEN（绿灯）状态，以及 dev server 和 seeded data 是否依然存活。
Gate confirmed GREEN (596 passed / 59 files). But I notice `r22-activity-footer.png` and `r22-activity-page2.png` are byte-identical sizes — let me verify they're actually different captures.
Two screenshots are byte-identical — the page-2 capture failed. I also need to complete the remaining first-run screenshots. Let me find the previous session's verification scripts and seeded accounts.
Footer user credentials found. Now let me find the fresh signup account from the V2 probe by querying the dev DB.
The fresh account is `r22.firstrun@pixelco.local`. Let me check the previous session's screenshot script pattern to replicate it.
Now I'll write the R22 screenshot completion script: re-capture page-2 properly (with footer-text verification), plus the remaining first-run states. First, let me reset the first-run account with a known password by re-signing up through the browser (this also re-verifies the signup auto-session flow).
Activity pagination screenshots are now perfect ("1–50 of 130 | Page 2 of 3" verified). But the fresh signup didn't establish a session. Let me check the signup form's actual fields.
The submit button is "Start Free Trial", not "Sign Up" — my script clicked nothing. Let me fix the script and re-run the first-run section.
所有首次运行（first-run）状态均已通过精确的 `live classes` 验证。只有安装占位符（install placeholder）检查返回了 `false` —— 页面正常渲染（"Install Your Pixel"），但代码片段探针（snippet probe）未能找到占位符 `key`。让我检查一下实际的渲染输出。
The `placeholder=false` result is expected — the plan's F7 was **corrected mid-session** during the earlier audit: the live's zero-sites branch IS an interstitial ("Add a domain first…"), and the placeholder key is just its loading fallback. The current clone implementation matches the corrected decode (all 32 R22 tests pin it). Let me verify the interstitial's exact DOM and confirm all screenshots are distinct.
Shell quoting broke that inline probe. The interstitial structure is already pinned by the green tests and V2. Let me verify the screenshot set integrity (distinct files, valid sizes), then run the planned VLM confirmation.
All 8 screenshots are distinct and valid. Now the planned VLM visual confirmation — let me load the VLM skill.
Using the CLI for the two planned VLM confirmations (activity footer + an empty state):
The footer exists in the DOM (probed "1–50 of 130 | Page 1 of 3") but it's below the 900px viewport fold with 50 rows. Let me capture a full-page or scrolled version for proper evidence.
VLM footer confirmation PASSED. Now the empty-state confirmation:
Both planned VLM confirmations passed. One more quick check on the F7 install interstitial since it's a key structural fix:
All VLM confirmations passed. The verification phase is complete. Now let me determine the session-log naming convention before writing docs.
Let me check what the R21 agent's docs commit actually contained to nail the naming convention:
The pattern is clear: the agent appends a "Round N (continued by the agent)" section to the latest session log. Let me see the R21 agent's appended section format to replicate it:
The format is clear. Now moving to documentation. Let me examine the PAD structure and relevant sections to update.
Let me check the ActivityFeed component's final state to write accurate docs:
All source code is in order. Now let me view the exact PAD sections needing updates:
Now I'll apply the PAD v1.21 updates:
PAD body updated. Now the test-distribution totals and Known Issues rows:
Tools are temporarily failing. Let me wait and retry.
The tool calls are failing repeatedly (7+ consecutive failures across Bash, Glob, TodoRead). Per my operating rules, I need to inform you:

**The tool calls are timing out/failing frequently. Please click the restart button in the top right corner to restart the session and try again.**

The session state is safe to resume:
- All R22 code changes are **on disk** in `/home/z/my-project/pixel-identifier` (uncommitted working tree)
- PAD v1.21 revision block + 5 body sections already updated
- 8 screenshots + 3 VLM confirmations complete
- Remaining: PAD test-totals line + Known Issues rows, README/AGENTS/CLAUDE/session_19/plan-doc updates, `.env.example` verification, atomic commits, SSH-wrapper push, key shredding

State confirmed. Now completing the PAD totals line:
Now the Known Issues rows for F11 (signup gate), the dead Contact Support button, and the focus-refetch architecture divergence:
PAD v1.21 complete. Now the README updates — let me view the relevant sections:
Applying all README updates:
The last edit clobbered the round-11 bullet header — let me repair it:
README main updates done. Let me scan for any remaining stale cursor/polling mentions:
Now updating AGENTS.md — fix the polling note and add R22 fact blocks:
AGENTS.md done. Now CLAUDE.md:
CLAUDE.md done. Now appending the R22 section to session_19.md:
Now the R22 plan's execution log. Let me check the R21 plan's format:
Now verifying `.env.example` matches the codebase:
`.env.example` verified matching (DATABASE_URL→prisma, NEXTAUTH_URL→site-url.ts, NEXTAUTH_SECRET→NextAuth v4 implicit). Let me check the screenshots evidence README exists:
Let me preserve the R22 VLM evidence following the R21 pattern:
Documentation phase complete. Now the final pre-commit gate (docs-only changes since last GREEN, but discipline requires it):
**FULL GATE GREEN** — lint ✓ typecheck ✓ 596/59 ✓ build ✓. Now let me check the repo worklog convention before committing:
The repo worklog convention confirmed. Now creating the atomic commits:
All 8 commits landed and the tree is clean. Now the push phase — first check the wrapper script and SSH shim state:
The infrastructure is intact. Let me check the wrapper CLI options, then materialize the key and verify its fingerprint:
That's the MD5-style fingerprint — let me compute the proper SHA256 fingerprint format for comparison with the R15-R21 records:
**Fingerprint VERIFIED**: `SHA256:HpVRkv3e8k0HgD6SKijmGSmjs/ZRRJxrZaAm6y6/Rns` — matches the R15-R21 records. Now the dry-run push:
Dry-run green — `1b63733..773b904` is exactly the 8 new commits. Now the real push:
**PUSH VERIFIED** — remote `refs/heads/main @ 773b904 == local HEAD`. Now the ship record:
Ship record pushed — remote @ `11cc95f` == local HEAD. Now shredding the operator key (random overwrite ×3 + remove):
The shred script had an indentation bug (fsync outside the `with` block) — one pass landed but the file survives. Completing the shred properly:
All verified. Final step — the workspace worklog:
**Round-22 fully closed and shipped.** ✅

**What landed** (9 atomic commits on `main`, pushed and remote-verified at `11cc95f`):

- **Audit (7th probe generation):** live 100% stable — 7th consecutive audit, bundle hash unchanged. Decoded the live's first-run empty states, Activity Log model, install zero-domain branch, and docs interactions from its app bundle + runtime probes.
- **10 findings fixed via TDD** (568/56 → 596/59 tests): the visitors empty state (`<p>` replacing the whole table, filtered-count branch), dashboard/domains empty-state structures, **the Activity Log rebuilt from 5s-polling to the live's 50/page pagination** (footer, chevrons, no polling/load-older), the install interstitial, docs green check + real Contact Support button.
- **Verified:** fresh signup → dashboard, all empty branches DOM-exact, pagination end-to-end ("1–50 of 130" → "51–100 of 130"), no polling, zero console errors, 8 screenshots + 3 VLM confirmations.
- **Docs:** PAD v1.21, README, AGENTS/CLAUDE facts, session_19 R22 log, plan execution log; `.env.example` verified matching.
- **Gate GREEN** (lint · typecheck · 596/59 · build); key fingerprint matched R15–R21, operator key shredded (×3 overwrite + remove).

**Suggested next:** Round-23 drift watch, then probe the live's visitors detail sheet (row-click flow) and settings save flows at runtime.

---

## Round 23 (continued by the agent) — DB seam, mobile-nav parity & Playwright e2e

**Base:** main @ 8cb18bd (R22 ship 11cc95f + the user's session_20.md +
`update env example` 085bd09). **Gate at base:** lint ✓ typecheck ✓
596/59 ✓ (2 skipped) build ✓. The user's `.env.example` update documents a
contract (`file:../db/custom.db` → `<repo>/db/custom.db`, implemented by
`src/lib/db-path.ts`, pinned by `tests/db-path.test.ts`) — neither file
existed. **Plan:**
`docs/plans/2026-09-22-round23-db-seam-mobile-nav-playwright.md`.

**Audit (8th probe generation — live re-verified with the probe account):**

- **DB seam root-caused empirically.** The Prisma CLI anchors an
  env-INDIRECTED relative `file:` URL at the `.env`/project root —
  `file:../db/custom.db` created the schema at `<repo-parent>/db/custom.db`
  (verified twice, incl. from a subdir with `--schema`). In the Next dev
  server, `@prisma/client`'s env loading REWRITES the URL (relativize vs
  the generate-time schema dir, re-anchor one base too high): even a
  repo-ABSOLUTE `.env` URL surfaced as `file:/home/z/my-project/db/custom.db`
  → SQLite error 14 → `/api/health` degraded, dashboard dead (diagnostic
  route + clean restart). `datasourceUrl` with an absolute path bypasses
  the rewriting (probe: ok:true in the same runtime).
- **Mobile nav (375 px, both surfaces, clone vs live):** marketing dropdown
  computed styles BYTE-EQUAL (flex/column, 16px 24px, gap 16, 5 links, CTA
  327×40, height 217); 767/768 boundary correct; the built CSS's
  `md\:hidden`/`flex` emission order correct (no TW4 ordering bug). Three
  real findings: the dashboard mobile Sheet STAYED OPEN after a nav-link
  click (the live's dialog unmounts — F3); the marketing toggle icon was
  `h-5 w-5` (20 px) vs the live's `lucide-menu w-6 h-6` (24 px — F4); the
  announcement-bar emission orders diverged (Claim Now tail, arrow/X icon
  w-h order, dismiss `transition-opacity` — F5-F7). Desktop dashboard: VLM
  STRUCTURAL MATCH. F11 ("CI trigger corrupted") RETRACTED — the literal
  `[main]` rendered as `ain]` after `[m` was eaten as an ANSI escape; the
  workflow was always correct.

**Remediation (TDD, 596/59 → 613/61 + 14 e2e):**

- F1/F2: `src/lib/db-path.ts` (schema-dir-anchored `resolveDatabaseUrl`,
  RED-first via `tests/db-path.test.ts`, 8 pins) + `db.ts`
  `datasourceUrl` + `scripts/with-db-url.mjs` wrapping `db:push`/`db:seed`
  (npm scripts rerouted). Acceptance with `.env` =
  `DATABASE_URL="file:../db/custom.db"`: push → `<repo>/db/custom.db`
  (no stray parent-dir file), seed ✓, dev server `/api/health` ok.
  `docs/DEPLOYMENT.md` created (§4 = the absolute-path production rule the
  `.env.example` cites).
- F3: the Sheet's open state now DERIVES from the pathname
  (`sheetPathname === pathname` — effect-free; the
  `react-hooks/set-state-in-effect` lint rule rejected the original
  `useEffect` idea mid-round, so the fix is the derived pattern). Verified
  on the dev server: link click → /dashboard/visitors → sheet GONE.
- F4-F7: `w-6 h-6` toggle icons, live-verbatim announcement-bar orders
  (`tests/mobile-nav-r23-parity.test.tsx`, 9 pins). VLM re-compare of the
  open menu vs the live: **MATCH**.
- F8: **Playwright landed** — `playwright.config.ts` (chromium,
  `reuseExistingServer`) + `scripts/e2e-server.mjs` (pushes+seeds a
  throwaway `db/e2e.db`, boots the STANDALONE build on :3100, health-gated
  readiness) + `e2e/{marketing,dashboard,pipeline}.spec.ts` (14 specs:
  landing chrome, mobile-menu lifecycle, login/KPIs, the Sheet-close
  regression, auth redirect, health, pixel.js, anti-enumeration 204, the
  beacon → Activity-Log loop). `test:e2e` script + a CI e2e job
  (build:standalone → chromium → test:e2e).

**Verification:** full gate GREEN (lint · typecheck · 613/61 · build);
e2e 14/14; dev-server acceptance with the final `.env` value; zero console
errors on the affected surfaces; 7 screenshots in `docs/screenshots/r23-*`
+ 2 VLM confirmations (mobile menu MATCH, dashboard STRUCTURAL MATCH).

**Outcome:** R23 complete — main advanced, 613/61 tests + 14 e2e, PAD v1.22.

**Next:** Round-24 drift watch; probe targets — the live's visitors detail
sheet (row click), settings save flows at runtime, any live bundle hash
change.
