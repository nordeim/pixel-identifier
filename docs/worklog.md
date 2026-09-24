# Worklog — pixel-identifier Rounds 7–8

---
Task ID: 1
Agent: main (Super Z)
Task: Clone repos, review docs (AGENTS/CLAUDE/README/PAD, session_2/session_4), establish baseline

Work Log:
- Cloned pixel-identifier (at f47a756, Round-6-complete, clean tree) and scandihaven reference repo
- Read AGENTS.md, CLAUDE.md, README.md, PAD v1.5 in full — stack: Next.js 16 App Router + React 19 + TS strict + Tailwind 4 CSS-first + shadcn/ui + Prisma/SQLite + NextAuth v4 + Vitest (186 tests)
- Read docs/session_2.md (Round 5) and docs/session_4.md (Round 6) — both rounds shipped; session_3's work was lost and redone
- Reviewed scandihaven patterns via Explore agent (layer model, ActionResult envelope, TDD, gates, secret-scan mechanics, Tailwind 4 gotchas, Next 16 rules)
- Setup: npm install, .env with generated NEXTAUTH_SECRET, db:push on sandbox override DB (file:/home/z/my-project/db/custom.db), seeded demo account
- Baseline verify gate: lint ✓, typecheck ✓, 186/186 tests ✓ (2 skipped), build ✓ — matches PAD v1.5 exactly
- Read round-6 plan (all workstreams shipped) + SSH push runbook + wrapper v3

Stage Summary:
- Codebase is aligned with documentation at Round-6-complete state
- Open items from PAD §11: strict CSP (MEDIUM), in-memory rate limiting (MEDIUM, needs shared store), Playwright E2E (LOW), email transport (MEDIUM, deliberate divergence)
- Next: live audit of pixelco.io + app.pixelco.io (login: sepnetflix2023@outlook.com), pairwise comparison, Round-7 remediation plan

---
Task ID: 2
Agent: main (Super Z)
Task: Live audit of pixelco.io + app.pixelco.io, pairwise comparison, Round-7 remediation plan

Work Log:
- Captured live marketing (scroll-stimulated) + all 7 dashboard pages + logged-out login via agent-browser; saved auth state
- Extracted DOM ground truth: visitors tabs/headers/rows, activity rows, domains rows, pricing (prices/FAQ/CTAs), settings, install, overview KPIs/trend/top-pages/recent
- Booted local clone (seeded demo DB), captured same surfaces, ran pairwise VLM diffs (8 pairs)
- Triaged every VLM claim against DOM: rejected misreads (sidebar width/active state, Add-Domain button, checkbox shape, icon fill, copyright year, H1 breaks, pricing dollar states, FAQ Q1)
- Verified findings: activity feed identity semantics (pageview rows show email - functional bug vs live), trend chart legend (hand-built, missed in round 6), area fills, --primary token (#FFC105/#FFBF00 vs #FACC15), "By Ai Viral" wordmark subtext (missed rounds 5-6), hero trust row (photo avatars + stacked stars), trust-point pills, testimonial plain text, process step numbers/icons, benefits 6-item list + real screenshot, stats "Real-Time" + gradient, pricing CTA variants + no marketing enterprise banner, FAQ card items, bottom CTA card, logo mark (traced via OpenCV: 54-anchor Catmull-Rom path, VLM MATCH at display size), checkbox border-primary, HSTS header
- Wrote docs/plans/2026-09-16-round7-parity-refinement.md (18 findings: 1 High functional, 12 Medium visual, 4 Low visual, 1 Low header parity)
- Validated plan against codebase: all referenced files/seams/tests exist

Stage Summary:
- Round-7 plan ready: Workstreams A (activity semantics TDD), B (dashboard visual), C (logo), D (hero/chrome), E (content sections), F (HSTS), V (verify/docs/ship)
- Evidence in research/round7-audit/
- Next: execute A1 RED test

---
Task ID: 3
Agent: main (Super Z)
Task: Round-7 execution record (reconstructed post history re-creation)

Work Log:
- Round 7 executed all workstreams (A activity semantics TDD, B dashboard
  visual, C logo trace, D hero/chrome, E content sections, F HSTS) as
  individual Conventional Commits on main; full per-commit table and
  browser/VLM verification evidence live in the round-7 plan's execution
  log (docs/plans/2026-09-16-round7-parity-refinement.md)
- Round-7 gate: lint + typecheck clean, 187 tests / 25 files, build 35
  routes; pairwise VLM re-diffs at CLOSE MATCH on overview/activity/login
- This record is written retroactively in Round 8: the repo's git history
  was re-created via GitHub web uploads ("Add files via upload"), so the
  round-7 commit hashes (2999176, 4fcf954, 7df4d10, 3ddc307, 05c9b69) and
  the research/round7-audit/ evidence no longer exist; part of the claimed
  work did not survive (see Round 8, Task 4)

Stage Summary:
- Round-7 shipped functional + visual parity to CLOSE MATCH at the time
- History re-creation silently reverted: traced logo (R7-V16), trend
  legend + pageviews fill (R7-V1/V2), input h-10 fix; every public/
  binary dropped while components kept referencing them
- Next: Round-8 fresh audit + restoration

---
Task ID: 4
Agent: main (Super Z)
Task: Round-8 parity restoration — fresh live audit, docs-vs-codebase alignment validation, remediation, verify, docs, push

Work Log:
- Read AGENTS.md/CLAUDE.md/README.md/PAD v1.6, session_4/session_5,
  worklog, round-7 plan in full; reviewed scandihaven protocols + both
  skills catalogs; validated all 26 round-7 claims against the tree
  (17 aligned, 9 misalignments = R8-F1..F9)
- Fresh live audit with logged-in session (sepnetflix2023@outlook.com):
  trend legend DOM + SVG gradient stop opacities, auth input
  getBoundingClientRect (40px), field-group spacing, logo PNG fetch +
  pixel gradient analysis (#FFD119 bottom-left -> #FFB800 top-right,
  135 degrees); evidence in research/round8-audit/
- Wrote docs/plans/2026-09-16-round8-parity-restoration.md (9 findings,
  TDD remediation A1/A2, B1, C1-C3, D1-D3, E1-E3); validated every
  referenced file/seam against the codebase before executing
- A1+A2 (cea4027): hand-built centered trend legend (gap-6 mt-2
  justify-center, amber/neon-green dots) + both area gradient fills
  (#fillVisitors 0.15->0, #fillIdentified 0.2->0), stale docstring fixed
- B1 (e1f3a97): contour-traced research/round8-audit/live-logo.png
  (pure-Python marching squares -> RDP -> Catmull-Rom, 59 anchors) ->
  single-path pixelco-logo.tsx with 135-degree live gradient; VLM MATCH
  vs live mark; replaced bar+circles construction everywhere
- C1-C3 (6b36ec1): RED-first tests/marketing-assets.test.ts walks every
  /assets/... reference in src/components/** and requires a non-empty
  file on disk; GREEN with 5 original 96x96 JPEG avatar photos
  (public/assets/avatars/) + production capture of the clone's own
  visitors page at the live's 1322x867 geometry
  (public/assets/dashboard-visitors.png)
- D1-D3 (d9d7cbe): Input primitive h-9 -> h-10 at the source, auth field
  groups space-y-1.5 -> space-y-2, forgot-link font-medium dropped
- E1 gate: npm run verify GREEN — lint clean, typecheck clean, 190 tests
  / 26 files passed (2 skipped), build 35 routes; browser pass on /,
  /login, /signup, /dashboard (legend dots rgb(255,193,5)/rgb(43,212,189),
  fills 0.15/0.2, inputs 40px, 5 avatars naturalWidth 96, screenshot
  1322x867, traced logo in header/sidebar/auth) with zero console errors;
  asset URLs curl-verified 200
- E2 docs: PAD v1.7 revision block + risk-register restoration note +
  test-count 190/26; README test-count delta; round-8 plan execution log;
  this worklog extended with the reconstructed Round-7 record (R8-F9)
- E3 ship: conventional commits on main only, push via
  docs/ssh_git_wrapper_v3.py (paramiko ssh shim, no ssh binaries in
  sandbox), key shredded after push

Stage Summary:
- All 9 Round-8 findings remediated; lost round-7 work restored and now
  pinned by tests (asset guard prevents the lost-binary 404 mode)
- PAD v1.7 / README / plan / worklog aligned with the restored tree
- Repository pushed to git@github.com:nordeim/pixel-identifier.git (main)

---
Task ID: 5
Agent: main (Super Z)
Task: Round-9 fresh pairwise audit — remediation, verify, docs, push

Work Log:
- Replaced docs/ssh_git_wrapper_v3.py (v3.1: ssh preflight, post-push
  verification, tracking-ref sync, redacted-BEGIN normalization) and the
  runbook (paramiko shim recipe) per operator upload; committed ab708bb
- Fresh live audit: pixelco.io scroll-stimulated (10 landing sections) +
  app.pixelco.io logged-in (login + 7 dashboard pages, auth-state saved);
  DOM ground truth incl. live marquee keyframes
  (@keyframes scroll-left 0->-50% @ 30s linear, 20 track children) and
  testimonial grid geometry (896px @ x=272, 283px cards)
- Captured identical local surfaces on a production build; pairwise
  comparison triaged every drift against DOM (hero/audience/process/
  benefits/compare/pricing/faq/cta/footer + all dashboard pages matched)
- Findings: R9-F1 static strip vs live animated marquee (Medium),
  R9-F2 testimonials section structure (Medium), R9-F3 login signup link
  rendered twice (High), R9-F4 domains error boundary (INVALIDATED -
  stale next-start server serving a swapped build; fresh server clean),
  R9-F5 stats bar tint/padding (Low)
- Wrote docs/plans/2026-09-16-round9-fresh-pairwise-audit.md; validated
  every referenced file/seam against the codebase before executing
- A1+A2 (7c11409): RED tests/login-footer.test.ts (link count guard) ->
  GREEN by deleting the in-form copy (login-form.tsx) and adding mt-4 to
  the page-level copy (live structure)
- B1-B3 (ca590d5): RED tests/social-proof.test.tsx (renderToStaticMarkup)
  -> GREEN: SocialProof = marquee (2x name set, text-lg muted/40,
  gap-12, animate-scroll-left) + testimonial cards in ONE py-16
  border-b section (max-w-4xl grid, shadow-card, text-sm quotes);
  StatsBar py-14 border-y border-border untinted; live-exact
  @keyframes scroll-left in globals.css + reduced-motion opt-out;
  vitest include extended to *.test.tsx
- E gate: npm run verify GREEN - 198 tests / 28 files, build 35 routes;
  browser: marquee transform advancing, grid x=272/w=896 live-exact,
  stats untinted, login single link, zero console errors
- C2: PAD v1.8 revision block + suite count 198/28; README test count;
  round-9 plan execution log; this entry
- C3: pushed via wrapper v3.1 + paramiko shim (runbook Appendix A),
  post-push remote verified, key shredded

Stage Summary:
- All actionable Round-9 findings remediated; F4 documented as
  environment artifact, no code change
- Suite grew 190/26 -> 198/28 (8 new guard tests)
- Repository pushed to git@github.com:nordeim/pixel-identifier.git (main)

---
Task ID: 1
Agent: main (Super Z)
Task: Round-10 live audit — fresh pairwise comparison, findings, plan

Work Log:
- Cloned both repos; reviewed AGENTS.md, CLAUDE.md, README.md, PAD v1.8,
  session_5/session_6, skills catalogs (pixel-identifier + scandihaven)
- Baseline gate GREEN: lint, typecheck, 198 tests / 28 files, build 35
  routes (matches PAD v1.8); DB pushed + seeded
- Fresh live audit: pixelco.io 10 landing sections (scroll-stimulated,
  1440x900) + app.pixelco.io logged-in 7 dashboard pages; identical local
  captures on the production build (initial local landing batch invalidated
  - browser was on the settings page during section scroll; re-captured)
- Pairwise VLM diffs on 17 surface pairs: dashboard 7/7 CLOSE MATCH
  (data-only residuals); marketing surfaced multiple claims, each triaged
  against live DOM ground truth (computed styles, class lists, HTML)
- Extracted live MARKETING and APP bundle :root tokens: the bundles ship
  different palettes; the clone's single global palette matches neither
  (marketing renders cream bg / warm borders / pale accent / 12px radius
  vs the live's white bg / cool borders / yellow accent / 10px radius)
- Findings R10-F1..F14 filed (see
  docs/plans/2026-09-16-round10-marketing-parity-deep-dive.md); F14
  (scroll-reveal animations) deferred per audit rules + CSS-only motion
  convention
- Plan validated against the codebase: all referenced files/seams exist
  (globals.css tokens + .bg-app, marketing layout wrapper, hero/features/
  pricing/how-it-works/faq-footer/social-proof components, vitest *.test.tsx
  include, signup cycle=annual handling)

Stage Summary:
- Round-10 plan committed to docs/plans/; ready for TDD execution
- Evidence in research/round10-audit/{live,local,vlm}/

---
Task ID: 2
Agent: main (Super Z)
Task: Round-10 remediation — TDD execution, verification, docs, push

Work Log:
- A1/A2 (6f3de84): RED tests/marketing-theme.test.ts -> GREEN; .marketing-scope
  palette class (13 live marketing tokens) on the (marketing) wrapper;
  global --background cream -> white; --radius-xl re-derived at radius+2px
  (live cards measure 12px at the 10px scope); .bg-app already #f6f7f9
  (R10-F13 was stale-PAD only)
- B (63e83f3): hero rebuilt to the live DOM verbatim (8 SSR pins) - card-chip
  badge, italic gradient span w/ dash inside, gradient-cta CTA pair, dot
  takes-line, no radial decoration
- C (14bf1e1): benefits 2-col grid + edge-to-edge screenshot wrap;
  comparison rebuilt on bg-background p-7 cards w/ BEST VALUE left-anchored
  badge + live copy (4 pins)
- D (a8cb5ab): pricing defaults to ANNUAL behind the live's iOS switch;
  CTA matrix per live DOM (Free Tier secondary, Growth gradient+Zap); cards
  p-7/shadow-card (5 pins)
- E (85863ea): audience (border-t section, 3/5-col grid, square secondary
  chips, no trailing periods) + process (full tints, bg-background cards,
  yellow-dot rows) rebuilt (10 pins)
- F (9d80401): CTA card radial sheen + check-icon trust row; footer
  two-band structure; FAQ container/kicker (11 pins)
- G (a7f97ea): stats grid at md; inline By Ai Viral wordmark (verified
  sibling layout on live); kicker/h2 typography sweep (font-semibold
  text-primary, font-bold h2s)
- H gate: npm run verify GREEN - lint, typecheck, 241 tests / 34 files,
  build 35 routes; browser pass: 10/10 landing sections pairwise CLOSE
  MATCH, computed tokens verified live-exact, app surfaces re-verified
  untouched, zero console errors; VLM misreads triaged against DOM
  (POPULAR centered both; toggle ON both)
- I: PAD v1.9 (two-palette token table, SSR-render test row), README 241,
  AGENTS.md + CLAUDE.md two-palette/annual-default conventions, plan
  execution log, this entry
- J: 8 atomic commits on main; push via docs/ssh_git_wrapper_v3.py +
  paramiko shim (runbook Appendix A)

Stage Summary:
- All actionable Round-10 findings remediated; F14 (scroll-reveal entrance
  animations) deferred per audit rules + CSS-only motion convention
- Suite grew 198/28 -> 241/34 (43 new guard tests across 7 files)
- Repository pushed to git@github.com:nordeim/pixel-identifier.git (main)

---
Task ID: 1
Agent: main (Super Z)
Task: Round-11 re-execution — live audit, remediation plan, TDD fixes, verify, docs

Work Log:
- Context: the previous Round-11 session was interrupted before
  committing; its workspace was lost, so this session re-executed the
  round from a fresh clone at 902facf (Round-10 complete). Baseline
  gate GREEN (241 tests / 34 files) before any change.
- Fresh live audit (agent-browser, logged in as
  sepnetflix2023@outlook.com): full app+marketing :root dumps, every
  primitive's class strings (button/badge/card/tabs/select/input/
  checkbox), complete sidebar chrome (expanded + collapsed rail),
  page-level ground truth (trend chart, View-all link, badge variants
  across visitors/activity/domains, install tabs + banners, topbar
  buttons, dashboard pricing cards, the 404 boundary), marketing seams
  (kickers, header margins, anchors, CTA hrefs, footer, Compare CTA).
  Documented in research/round11-audit/live-ground-truth.md; PNG
  evidence in research/round11-audit/live/.
- Wrote docs/plans/2026-09-17-round11-app-bundle-realignment.md (20
  findings R11-F1..F20, R10-F14 still deferred) and validated every
  referenced seam against the tree before executing.
- Executed workstreams A-F TDD (every one RED-first): app token
  migration to the live cool-neutral bundle (A), legacy shadcn
  primitives + consumer sweep + selection UX (B), sidebar chrome +
  footer + 48px rail + one-button toggle (C), badge consumers + install
  banners (D), marketing parity sweep incl. font-mono system stack (E),
  minimal live 404 (F).
- G gate: npm run verify GREEN — lint, typecheck, 291 tests / 41 files
  (2 skipped), build 35 routes. Fresh-server browser pass with zero
  console errors: tokens, KPI card geometry (138px), sidebar, badges,
  tabs, banners, marketing section heights (live-exact: 526/708/610/
  650/814/755), 404. Pairwise VLM diffs on 8 surface pairs: 2 EXACT
  MATCH, 6 CLOSE MATCH (data-only residuals; VLM misreads triaged
  against DOM).
- H docs: PAD v1.10, README, AGENTS.md, CLAUDE.md, plan execution log,
  this entry.

Stage Summary:
- All actionable Round-11 findings remediated; R10-F14 (scroll-reveal
  entrance animations) remains the only deferred item
- Suite grew 241/34 -> 291/41 (+50 guard tests across 7 new files)
- Next: push via docs/ssh_git_wrapper_v3.py + paramiko shim (Task 2)

---
Task ID: 2
Agent: main (Super Z)
Task: Round-11 ship — push via the SSH wrapper

Work Log:
- Pre-push secret scan over the 70-file push set (no key material, no
  auth-state files; only .env.example template references)
- Deployed the Appendix A paramiko ssh shim to /home/z/my-project/bin
  (outside the repo, per rule 5) — the sandbox has no OpenSSH binary
- Operator key staged to a 0600 file outside the repo; ed25519
  fingerprint verified via paramiko (SHA256:HpVRkv3e8k0HgD6SKijmGSmjs/ZRRJxrZaAm6y6/Rns)
- Wrapper dry-run: first attempt hit the wrapper's default remote
  (task-management) and was rejected non-fast-forward — re-run with the
  explicit --remote git@github.com:nordeim/pixel-identifier.git: auth OK,
  remote main at 902facf, fast-forward confirmed
- Real push via docs/ssh_git_wrapper_v3.py: 902facf..41d309a
  HEAD -> main; post-push remote verification passed (refs/heads/main @
  41d309a == local HEAD); tracking ref synced
- Operator key shredded; wrapper's temp key material shredded by design

Stage Summary:
- 9 Conventional Commits pushed to git@github.com:nordeim/pixel-identifier.git
  main (no new branches); Round-11 complete

---
Task ID: 1
Agent: main (Super Z)
Task: Round-12 audit — fresh live captures, pairwise VLM diffs, DOM triage, remediation plan

Work Log:
- Context: repo at Round-11-complete state (11061cb = R11 push + session_8
  upload). Baseline gate GREEN on the fresh clone: lint, typecheck,
  291 tests / 41 files (2 skipped), build 35 routes — matches PAD v1.10.
- Environment note (documented for future sessions): the sandbox shell
  exports a leftover DATABASE_URL=file:/home/z/my-project/db/custom.db
  which overrides .env for both prisma CLI and PrismaClient — db:push
  and db:seed landed there; the standalone server must point at the same
  file (a first boot against the empty prisma/db/pixelco.db produced
  "table main.users does not exist" via the NextAuth error URL).
- Fresh live audit (agent-browser): landing (10 sections, heights match
  R11 exactly), 7 dashboard pages logged in as sepnetflix2023@outlook.com,
  login, signup, 404. Aligned per-section captures use
  window.scrollTo(section.offsetTop) on both sides (scrollIntoView does
  not stick on the live; first capture round was misaligned +40px).
- Pairwise VLM diffs (17 pairs, z-ai vision): dashboards 6 EXACT (incl.
  login) + 2 CLOSE (domains, install — data-only); landing aligned 8
  EXACT + 2 CLOSE (hero, marquee) + 1 DIFFERENT (benefits); signup EXACT
  (low-flag triaged to a wrong-button DOM comparison — see F6 note);
  404 DOM-verified (VLM rate-limited).
- DOM triage invalidated: hero badge icons (byte-identical), benefits
  Privacy-Compliant icon (ShieldCheck both sides), Add-Domain color
  (identical computed gradient), pricing toggle/CTA matrix, CTA card
  (340x896 identical), tokens both bundles.
- Real findings (all DOM-verified, see plan): R12-F1 scroll-reveal
  entrance animations (39 elements, y 12/16/20/24, ~100ms stagger, once,
  map+timing sampled); R12-F2 hero H1 line-height (live renders 1.0 at
  >=sm via the v3 sm:text-5xl line-height:1 cascade quirk; clone 1.1
  everywhere -> +17px hero); R12-F3 testimonial quote glyphs (ASCII vs
  curly -> 4th line on quote 2 -> +23px marquee); R12-F4 benefits B2B
  icon (live custom 5-path building SVG, absent from lucide 0.525 + 6
  older versions; clone Building2); R12-F5 marketing --foreground family
  mangled by Lightning CSS floor-rounding (hsl(230 25% 12%) ->
  #171926, live computes #171A26); R12-F6 gradient submit buttons carry
  variant bg classes (live = base+customs via twMerge; cva null-variant
  escape hatch verified in-node).
- Wrote docs/plans/2026-09-17-round12-precision-parity.md and validated
  every referenced seam against the tree (features.tsx, hero.tsx:59,
  social-proof.tsx:81, globals.css .marketing-scope, domains-panel.tsx,
  login-form.tsx, signup-form.tsx, marketing layout) and the existing
  test pins (marketing-hero.test.tsx:57, marketing-theme.test.ts:44,
  social-proof.test.tsx).

Stage Summary:
- Round-12 plan ready: workstreams A (scroll-reveal), B (marketing
  precision: F2/F3/F4/F5), C (gradient button class alignment F6),
  D (verify), E (docs), F (ship)
- Evidence in research/round12-audit/{live,live-aligned,local,
  local-aligned,vlm}/
- Next: execute A1 RED

---
Task ID: 2
Agent: main (Super Z)
Task: Round-12 remediation — TDD execution, verification, docs

Work Log:
- B (marketing precision) RED->GREEN: hero H1
  `leading-[1.1] sm:leading-none mb-5` (the live's v3 cascade quirk —
  hero now 762px live-exact, was 779); testimonial quotes ASCII
  `&quot;` glyphs (marquee section now 403px live-exact, was 426 — the
  curly glyphs pushed quote 2 onto a 4th line); CompanyBuildingIcon
  (the live's custom 5-path B2B SVG, verified absent from lucide 0.525
  + 6 older versions, drawn with lucide conventions); .marketing-scope
  foreground family -> literal #171a26 (Lightning CSS floor-rounds the
  25.5 green channel to #171926; browsers compute #171A26).
- C (gradient buttons) RED->GREEN: domains Add-Domain, login Sign In,
  signup Start Free Trial now render variant={null} size={null} + the
  live's exact class string — merged output byte-identical to the live
  DOM (no bg-primary fragment; twMerge drops base font-medium/
  transition-colors against the consumer's font-semibold/transition-all,
  exactly like the live).
- A (scroll reveal, the deferred R10-F14) RED->GREEN: reveal-observer
  .tsx (ONE shared IntersectionObserver; arms --reveal-y + reveal-armed
  + transition-delay, flips to .is-revealed once on entry); globals.css
  reveal block (.js-reveal scoped hidden state, .5s ease transitions,
  reduced-motion guard); (marketing) layout pre-paint js-reveal script +
  observer mount; 46 data-reveal coordinates across the 10 landing
  sections mapped from the live (incl. the hero's 8 mount-staggered
  elements, the fade-only takes-line/screenshot at y0, the marquee
  WRAPPER at y12 so the track keeps its scroll-left transform, the
  compare/FAQ single-grid wrappers, and the live's classless
  kicker+h2 wrapper in Features).
- D gate: npm run verify GREEN — lint, typecheck, 308 tests / 43 files
  (2 skipped), build + build:standalone. Fresh-server browser pass:
  js-reveal on <html>, 46/46 armed, mount + scroll reveals fire once
  and stay; hero 762 / marquee 403 (both live-exact); H1 56px; --foreground
  #171a26; zero console errors. VLM re-diffs: CTA EXACT MATCH; hero/
  marquee/benefits carry only known data residuals (feed-rotation
  timing, own avatar/screenshot assets) + the triaged shield-icon
  misread (all six benefit icon paths re-verified byte-identical on the
  fresh build).
- E docs: PAD v1.11 (revision block, §5.2 foreground-family row,
  §5.4 scroll-reveal convention, §8 counts), README 308 + round-12
  coverage note, AGENTS.md (reveal/H1/token/gradient-button facts),
  CLAUDE.md (v1.11 reveal seam principle), plan execution log, this
  entry.

Stage Summary:
- All six Round-12 findings remediated; the two long-standing section
  residuals closed; the twice-deferred scroll-reveal shipped
- Suite 291/41 -> 308/43 (+17 guard tests)
- Next: atomic commits + push via the SSH wrapper (Task 3)

---
Task ID: 3
Agent: main (Super Z)
Task: Round-12 ship — atomic commits, verification, push to origin main

Work Log:
- Atomic Conventional Commits on main only, in workstream order:
  e79c966 feat(marketing): scroll-reveal entrances + live-exact
  precision (R12-F1..F5); fd7575e fix(dashboard,auth): variant-free
  gradient CTA class strings (R12-F6); 67ba3b4 test(evidence):
  round-12 audit captures; 9f9f10b docs: PAD v1.11, README,
  AGENTS/CLAUDE alignment, round-12 plan log + worklog.
- Pre-push gate green before shipping (D workstream): lint, typecheck,
  308 tests / 43 files (2 skipped), build + build:standalone.
- Pushed via docs/ssh_git_wrapper_v3.py (key from operator, 0600 file
  outside the repo) with the Appendix A paramiko ssh shim on PATH
  (sandbox has no OpenSSH binary); wrapper verified
  refs/heads/main @ 9f9f10bdc95d04df284125f778447b3b0aa2aef6
  == local HEAD and synced refs/remotes/origin/main.
- Post-push re-verification (fresh session): `git ls-remote origin main`
  == 9f9f10bdc95d04df284125f778447b3b0aa2aef6 == local HEAD; full
  `npm run verify` re-run on the pushed tree: lint + typecheck +
  308/43 tests + 35-route build, all green.
- Operator deploy key (Ed25519, SHA256:HpVRkv3e8k0HgD6SKijmGSmjs/
  ZRRJxrZaAm6y6/Rns) shredded with random bytes + removed after the
  push, per the runbook's no-residue rule; no key material inside the
  repo tree (gitignore `*.key` / `ssh-key.txt` intact).

Stage Summary:
- Round-12 closed and shipped: repo at PAD v1.11, 308 tests / 43
  files, 35 routes; pixelco.io parity holds at 6 EXACT dashboards,
  aligned landing sections live-exact on hero/marquee/CTA with
  data-only residuals elsewhere
- main @ 9f9f10b pushed to git@github.com:nordeim/pixel-identifier.git
  and remote-verified; this entry is the Round-12 closing record

---
Task ID: 4
Agent: main (Super Z)
Task: Round-13 — sub-page parity audit, remediation, docs, ship

Work Log:
- Audited the never-diffed surfaces: marketing sub-pages (about, blog
  index, 10 blog posts, docs, 4 legal pages), mobile 375 px, and an R12
  drift re-check. Mobile PASSED (the live is a fixed 1280 px layout at
  every viewport; the clone matches — landing/dashboards EXACT). R12
  landing pins hold except one new 1 px FAQ delta.
- Findings F1-F11 (all DOM-verified, see
  docs/plans/2026-09-17-round13-subpage-parity.md): legacy-vs-new
  accordion generation + last:border-b-0 (the 1 px); 7/7 FAQ answers
  were paraphrases; announcement bar rendered on all marketing pages
  (live: landing only); about/docs structure drift; blog index card
  structure; blog posts missing breadcrumb/prose/live copy; legal pages
  paraphrased (live names operator Aiviral); short dates; double-
  suffixed titles; missing font-system tail broke the ← glyph.
- TDD execution (all RED→GREEN): 5 new test files, +72 tests.
  ui/accordion.tsx rewritten to the live legacy generation; FAQ answers
  + consumer classes aligned (FAQ section 756 px live-exact); chrome
  extracted to MarketingFrame with (landing)/(marketing) sibling route
  groups (banner scoped); about + docs rebuilt on the extracted live
  DOM (incl. the sample-snippet box + copy button); blog index cards +
  article chrome rebuilt (breadcrumb, metadata row, prose wrapper with
  arbitrary variants, max-w-5xl container); ArticleBody gained ##/###,
  a legal variant, bare-string runs and live-exact tables; blog-posts.ts
  + new legal-pages.ts regenerated from the live copy by
  scripts/r13-convert-{blog,legal}.py; formatDateLong; font tails;
  title fixes.
- Gate: npm run verify GREEN — lint, typecheck, 380 tests / 48 files
  (2 skipped), build + build:standalone. Fresh-server browser pass:
  landing sections all live-exact incl. FAQ 756; banner scoping
  verified on 8 routes; ← glyph renders post-fix.
- VLM: intermediate diffs triaged (card-footer claim = misread,
  DOM-disproven; container-width delta real, fixed). Final verdicts:
  all 8 sub-page pairs EXACT_MATCH (0.99-1.0).
- Docs: PAD v1.12, README (380 + structure + content note), AGENTS.md
  (5 new fact blocks + route-group convention), CLAUDE.md (v1.12
  principle), plan execution log, this entry.

Stage Summary:
- Round-13 closed: sub-page parity complete — landing, dashboards,
  auth, about, blog index + 10 posts, docs, 4 legal pages all at
  EXACT/CLOSE level with only inherent data residuals
- Suite 308/43 → 380/48; repo at PAD v1.12
- Next: atomic commits + push (Task 5)

---
Task ID: 5
Agent: main (Super Z)
Task: Round-13 ship — atomic commits + push

Work Log:
- Eight atomic Conventional Commits on main only, in workstream order:
  613bf73 fix(marketing) accordion+FAQ (R13-F1..F2); 80473b8
  feat(marketing) MarketingFrame banner scoping (R13-F3); ac82dbc
  feat(marketing) about+docs (R13-F4..F5); 7b5cc6c feat(marketing)
  blog parity + live copy (R13-F6..F9,D3); e59066d feat(marketing)
  legal live copy (R13-F8,E2); 035f0c2 fix(marketing) font tails +
  titles (R13-F10..F11); d9ea4c7 test(evidence) round-13 captures;
  d68e25f docs PAD v1.12 set.
- Pre-push: working tree clean, secret scan across all commits clean,
  full npm run verify GREEN (lint, typecheck, 380/48 tests, build).
- Pushed via docs/ssh_git_wrapper_v3.py (operator key, 0600 file
  outside the repo, paramiko shim on PATH) after a green --dry-run.
  Wrapper verified refs/heads/main @ d68e25f == local HEAD and synced
  the remote-tracking ref.
- Operator key shredded (random overwrite + remove) after the push.

Stage Summary:
- Round-13 closed and shipped: main @ d68e25f on GitHub, PAD v1.12,
  380 tests / 48 files, sub-page parity EXACT across the board

---
Task ID: R14
Agent: main (Super Z)
Task: Round-14 — drift re-audit, metadata & SEO-surface parity, E2E
functional pass, docs, ship

Work Log:
- Workspace refreshed (git pull brought the user's session-log commit
  57e51c3); core docs re-read; session_9 + round12/13 plans reviewed;
  baseline gate GREEN (380/48).
- Round-14 audit: landing sections byte-identical to R12/R13 pins
  ([762,403,174,526,708,610,650,814,756,500]); banner scoping, sub-page
  H1/H2 counts, blog slugs, dashboard structure, sitemap URL sets all
  verified stable — no DOM drift. Remaining gaps all on the document
  head: 15 findings (R14-F1..F15) — landing description, sub-page
  titles/descriptions/og, og:image/url/locale, twitter card, canonical,
  app-bundle og block, 404 title, sitemap/robots formatting, favicon,
  keywords. Evidence: research/round14-audit/ (live-meta-all.jsonl +
  byte captures).
- Plan written (docs/plans/2026-09-17-round14-metadata-seo-parity.md)
  with 6 documented parity rulings (self-hosted social images, no
  @Lovable artifact, per-page app tab titles, og=desc, route handlers
  for crawl docs, metaDescription field).
- TDD execution: RED tests/seo-parity.test.ts (23 failing) + blog-posts
  metaDescription guard → GREEN: marketing-seo.ts + app-seo.ts helpers;
  root layout (live-verbatim description, | template, robots meta, og
  url/locale/image, large card, canonical, keywords dropped); 7
  sub-pages + article generateMetadata on live strings; 10 post
  metaDescriptions (scripts/r14-patch-blog-meta.py); app og on
  login/signup/forgot + dashboard layout.
- 404 title: catch-all metadata approach disproven (Next ignores a
  throwing page's metadata; browser-verified) → NotFoundTitle client
  island; discovered Next's metadata controller overwrites plain title
  assignments after hydration → MutationObserver re-assertion. Verified
  on both 404 paths + nav-restore. Live's HTTP 200 SPA fallback NOT
  replicated (correct 404 kept). Announcement bar <a> → <Link>
  (DOM-identical).
- robots.txt/sitemap.xml → Route Handlers emitting the live bytes
  (comments, namespaces, 1.0 priorities, pinned post order); old
  convention files deleted; seo-routes.test.ts rewritten.
- Gate GREEN: 402 tests / 49 files, build 36 routes. Standalone browser
  pass: 18/18 head-meta match, sitemap/robots byte-clean, favicon live
  bytes, 404 + app og verified. E2E pipeline green (sign-up → domain →
  25 beacons → dashboard → CSV export, 2/25 identified).
- Docs: PAD v1.13, README (402/36 + SEO surface + hierarchy + coverage),
  AGENTS.md (3 fact blocks + whitelist amendment), CLAUDE.md (v1.13
  principle + whitelist amendment), plan execution log, evidence README.

Stage Summary:
- Round-14 closed: the <head> — the last unaudited parity surface — is
  now live-exact on every route (marketing, app bundle, 404, crawl docs,
  favicon). Suite 380/48 → 402/49; PAD v1.13.
- Next: atomic commits + push (Task R14-ship)

---
Task ID: R15
Agent: main (Super Z)
Task: Round-15 — live drift audit, dashboard shell & auth-card realignment, TDD remediation, docs, ship

Work Log:
- Post-reset rebuild: fresh clone @ 2a1d732, npm install, reseeded demo
  DB, rebuilt the paramiko ssh shim (venv python 3.12 vs pip 3.13
  mismatch solved with `python3 -m pip install paramiko`).
- Baseline gate GREEN (402/49, 36 routes) — codebase matched PAD v1.13.
- Round-15 audit: marketing bundle STABLE (landing sections byte-identical,
  sub-pages/blog/legal content byte-identical — the about/docs "+69 words"
  signals were header/footer measurement artifacts of the live's main-less
  SPA body, robots/sitemap byte-equal origin-sub, favicon byte-identical,
  og images byte-identical — the live only moved their URLs to gpt-engineer
  + R2 storage). KEY DISCOVERY: the live shipped a new app build — the
  dashboard sidebar migrated to the shadcn Sidebar primitive (dominant on
  11/13 loads across all 7 pages; the stale edge variant == the clone's
  DOM). Extracted the full live shell (provider/gap/fixed, data-sidebar
  tree, PNG logo, group mapping, topbar, auth cards, mobile Sheet,
  collapse behavior) + the TW4 bare-var compile quirk (w-[--sidebar-width]
  → invalid `width:--sidebar-width`).
- TDD remediation (RED 33 → GREEN): sidebar-shell + sidebar-nav rewritten
  to the primitive DOM; topbar realigned (non-sticky h-14, trigger button,
  font-display h1, hot-pink dot utility, avatar chrome); layout root
  bg-muted/30 + main class orders; auth cards realigned (h3 CardTitle
  pattern, PNG logo, new-gen Label, OAuth on Button primitive — disabled
  placeholders per D3, native validation); Badge → div root; snippet
  2-space indent; social-proof sr-only H2 removed; KPI/domains class
  orders. Verification-sweep extras: pricing plan cards rebuilt
  Card-base-first with chip features + no POPULAR badge, in-page H1s
  dropped text-foreground.
- Gate GREEN: 432 tests / 50 files, 36 routes. Browser-verified: shell DOM
  byte-equal to the live captures, collapse 48px rail, mobile Sheet 288px,
  E2E flow green (login → dashboard → visitors → export 200 → domains →
  install snippet). Screenshot pixel-diff: sidebar chrome pixel-identical;
  remaining deltas data-only.
- Docs: PAD v1.14 (revision + §5 body), README (432 count + R15 coverage
  bullet), AGENTS.md (3 new fact blocks + eslint-research note + Badge/
  Label amendment), CLAUDE.md (v1.14 principle), plan execution log,
  evidence README.

Stage Summary:
- Round-15 complete: the dashboard shell, topbar, auth cards, pricing
  cards and UI primitives now match the live's current build byte-for-byte
  at the DOM level; suite 402/49 → 432/50; PAD v1.13 → v1.14.
- Next: atomic commits + push (Task R15-ship)

---
Task ID: R15-ship
Agent: main (Super Z)
Task: Round-15 ship — atomic commits, wrapper push, key hygiene

Work Log:
- Final gate re-run GREEN (432 tests / 50 files, 36 routes).
- Secret scan: all matches pre-existing pushed history (operator docs);
  no key material in the tree.
- 9 atomic commits on main (a90e5f3..9072951): evidence, foundation
  (vars/utilities/logo), sidebar primitive shell, topbar+layout+small DOM,
  auth cards + Label/Badge, pricing sweep, snippet+social-proof, test
  pins, docs.
- Push via docs/ssh_git_wrapper_v3.py + paramiko shim (PATH prepended),
  --remote git@github.com:nordeim/pixel-identifier.git: dry-run green
  (2a1d732..9072951), real push verified (remote refs/heads/main @
  9072951 == local HEAD), remote-tracking ref synced.
- Deploy key fingerprint verified (SHA256:HpVRkv3e8k0HgD6SKijmGSmjs/
  ZRRJxrZaAm6y6/Rns) before use; wrapper shredded it post-push, residue
  double-shredded (random overwrite ×3 + remove). No key material on disk.

Stage Summary:
- Round-15 fully closed and shipped: main @ 9072951 on GitHub, PAD v1.14,
  432/50 tests. pixelco.io parity now holds across marketing (byte-exact),
  heads/SEO (byte-exact), and the app bundle's current-build shell
  (byte-exact DOM). Residuals are data-only + the 2 documented
  micro-divergences (lucide aria-hidden default, SSR-hidden mobile
  sidebar).

---
Task ID: R16
Agent: main (Super Z)
Task: Round-16 — drift watch, app content-layer realignment, TDD remediation, docs, ship

Work Log:
- Workspace rebuilt post-reset (fresh clone @ e948a61, npm install,
  .env + seeded DB, standalone build + server). Baseline gate GREEN
  (432/50, 36 routes) — codebase matched PAD v1.14.
- Round-16 audit (base64 DOM probes, same-page live-vs-local diffing,
  stability verification across repeated loads): marketing bundle + auth
  surfaces + R15 shell all STABLE (landing sections, sub-pages,
  blog/legal, robots/sitemap, favicon, og bytes, login cards byte-equal;
  the live only moved og URLs to gpt-engineer/R2 storage — content md5s
  match). KEY DISCOVERY: the live shipped a new build of the dashboard
  CONTENT components — every page below the shell drifted (KPI cards,
  trend chart h-[280px], activity/domains/visitors rows, tabs, badges,
  pricing switch/FAQ, settings forms, install code blocks). Extracted
  full ground-truth DOM per page to research/round16-audit/.
- Mechanics decoded en route: the live's odd button strings are
  cva+twMerge displacement (size sm displaces rounded-md to the tail;
  font-semibold displaces font-medium; transition-all displaces
  transition-colors) — ONE Button primitive, no regeneration. The live
  ships MIXED badge generations (new-gen sidebar/Verified/Identified;
  legacy-gen content badges with base border + text-secondary-foreground).
  The live's group-label ships a genuinely broken class
  transition-[margin,opa] (hex-verified).
- Plan written (docs/plans/2026-09-18-round16-content-realignment.md;
  10 findings + 8 rulings) and validated against the codebase before
  execution (all files/evidence/seams confirmed, including the Verified
  badge being already byte-identical).
- TDD remediation (RED 42 → GREEN 44 pins in
  tests/content-parity.test.tsx; 5 superseded R11 pins updated): Tabs
  primitive + consumers; overview KPI/chart/top-pages/recent-ids;
  activity div-generation rows + legacy Pageview badge; domains
  div rows + legacy Pending badge + no section wrapper; visitors tabs/
  badges/avatars/table/a11y-chrome sweep; Radix billing switch + h4 FAQ;
  settings variant-free Save + inputs + danger zone; install code/pre/
  chips/switcher/orders; universal sweeps (focus-brand, live-icons,
  broken group-label class). New seams: content-badges.tsx (LegacyBadge),
  live-icons.tsx (Building2Icon/Trash2Icon/CircleHelpIcon).
- Gate GREEN: 476 tests / 51 files (+44), 36 routes. Fresh-standalone
  browser pass: per-page structural diff vs the round16 captures
  (visitors/domains/pricing at ZERO order+token drift; remaining
  residuals data-only + the server-action form machinery); sidebar
  pixel-diff 0.00%; E2E green (login → 7 pages → selection → Export (1)
  → CSV 200 → pricing switch → install snippet → settings form); zero
  console errors.
- Docs: PAD v1.15, README (476 + R16 bullet), AGENTS.md (R16 fact block
  + broken-class warning), CLAUDE.md (v1.15 principle), plan execution
  log, evidence README.

Work Log (R16-ship, session restored after premature stop):
- Re-verified the full gate on the committed tree: lint ✓, typecheck ✓,
  476 tests / 51 files ✓, build 36 routes ✓.
- Secret scan: all matches pre-existing pushed history (operator docs);
  no key material in the tree.
- 9 atomic commits on main (04c71a3..9c9524e): evidence, LegacyBadge +
  live-icons seams, Tabs/Switch primitives, overview KPI/chart, activity
  + domains rows, visitors table, settings/install/pricing sweeps, test
  pins (+44), docs (PAD v1.15, session_13, plan log).
- Push via docs/ssh_git_wrapper_v3.py + paramiko shim (PATH prepended),
  --remote git@github.com:nordeim/pixel-identifier.git: dry-run green
  (e948a61..9c9524e), real push verified (remote refs/heads/main @
  9c9524e == local HEAD), remote-tracking ref synced.
- Deploy key fingerprint verified (SHA256:HpVRkv3e8k0HgD6SKijmGSmjs/
  ZRRJxrZaAm6y6/Rns) before use; wrapper shredded its temp copy
  post-push, operator key residue shredded (random overwrite ×3 +
  remove). No key material on disk.

Stage Summary:
- Round-16 complete: the app bundle's content layer now matches the
  live's current build at the DOM class-string level across all 7
  dashboard pages; suite 432/50 → 476/51; PAD v1.14 → v1.15.
- Round-16 fully closed and shipped: main @ 9c9524e on GitHub.
- Next: Round-17 drift watch after the live's rolling deploy settles
  (content layer + shell), responsive spot-checks 768–1024px.

---
Task ID: R17
Agent: main (Super Z)
Task: Round-17 — drift watch, verification-gap closure, responsive spot-checks, TDD remediation, docs, ship

Work Log:
- Workspace refreshed (git pull — already at b1581d6, the R16 ship);
  core docs re-verified (PAD v1.15, AGENTS/CLAUDE R16 blocks); baseline
  gate GREEN (476/51, lint, typecheck, build).
- Round-17 audit (fresh live+local captures per page to
  research/round17-audit/, order-sensitive tokenizer diff):
  - Live-side drift since R16: ZERO (0 class/tag changes across all 7
    dashboard pages). Marketing byte-stable (sections
    [762,403,174,526,708,610,650,814,756,500], H2=7, sub-pages, blog
    slugs 10/10, robots, favicon md5). Shell sidebar BYTE-IDENTICAL
    (14767 chars). Headers aligned (D4 aria-hidden only).
  - Clone-side: 3 residuals the R16 verification missed (stricter diff):
    F1 activity Identified badge (wrong generation — secondary hybrid
    with hover:opacity-90 vs the live's new-gen default-variant string
    identical to domains Verified); F2 pricing contact-sales card
    (outline+asChild mailto anchor + flex-first orders vs the live's
    variant-free Button + twMerge-displaced root); F3 install chip
    wrappers (span/flex-first/aria-hidden vs bare geometry-first divs).
    F4 trend-chart role/aria-label → ruling D3: keep (invisible
    functional a11y).
- Plan written + validated against the codebase
  (docs/plans/2026-09-19-round17-verification-gaps.md).
- TDD: RED 8 pins (content-parity R17 blocks + PlanPanel action mock) →
  GREEN (activity-feed variant fix; plan-panel contact card rebuild;
  platform-instructions + install page chips); 1 superseded
  shell-parity pin. Suite 476/51 → 484/51; lint + typecheck + build ✓.
- Browser verification: badge byte-identical; pricing card diffs
  eliminated; install chips gone from the diff; remaining flags proven
  tokenizer alignment noise (direct extraction byte-identical). E2E
  green (pricing switch + $65 annual, Contact Sales, selection →
  Export (1) + ids href, settings, install); zero console errors.
- Responsive spot-checks: 1024px identical (chart 280, KPI 4-col,
  sidebar 256); 768px identical (280, 2-col, 256, table fits); 375px
  equivalent (both sides overflow horizontally — the live's own quirk;
  clone rail CSS-hidden vs live CSR unmount, documented).
- Screenshot methodology fix: the live's pre-hydration shell renders
  DARK — parity screenshots must wait for header h1 (the R16 0.00%
  comparison had raced loading skeletons on both sides). Loaded-page
  sidebar pixel-diff: 0.24% (data-only).
- Docs: PAD v1.16, README (484 + R17 bullet), AGENTS.md (R17 facts),
  CLAUDE.md (v1.16 precedents), plan execution log, evidence README.

Stage Summary:
- Round-17 complete: live stable since R16; the 3 R16 verification gaps
  closed (badge generation, contact card, install chips); suite
  476/51 → 484/51; PAD v1.14 → v1.15 → v1.16.
- Next: atomic commits + push (Task R17-ship)

Work Log (R17-ship):
- Final gate re-run GREEN: 484 tests / 51 files, lint, typecheck,
  build 36 routes. Secret scan: no key material in the tree (the only
  credential mentions are pre-existing pushed operator docs).
- 6 atomic commits on main (66df785..608f41d): evidence, activity
  badge, pricing contact card, install chips, test pins (+8), docs
  (PAD v1.16, session_14, plan log).
- Push via docs/ssh_git_wrapper_v3.py + paramiko shim (PATH
  prepended), --remote git@github.com:nordeim/pixel-identifier.git:
  dry-run green (b1581d6..608f41d), real push verified (remote
  refs/heads/main @ 608f41d == local HEAD), remote-tracking ref
  synced. Deploy key fingerprint verified before use
  (SHA256:HpVRkv3e8k0HgD6SKijmGSmjs/ZRRJxrZaAm6y6/Rns); operator key
  residue shredded (random overwrite ×3 + remove). No key material
  on disk.

Stage Summary:
- Round-17 fully closed and shipped: main @ 608f41d on GitHub, PAD
  v1.16, 484/51 tests. The live is stable across two consecutive
  audits (R16+R17); the clone's content layer now matches it with
  only the documented D2/D3/D4/aria residuals remaining.
- Next: Round-18 drift watch on the R17 tokenizer; optional strict-DOM
  closure of the aria residuals.

---
Task ID: R18
Agent: main (Super Z)
Task: Round-18 — drift watch + first geometry probes + marketing class realignment, TDD remediation, docs, ship

Work Log:
- Workspace refreshed (git pull — main @ e77bde8, the R17 ship); core docs
  re-verified (PAD v1.16); baseline gate GREEN (484/51, lint, typecheck,
  build). scandihaven skills catalog reviewed (agent-browser confirmed).
- Round-18 audit (methodology upgrade: the R17 tokenizer PLUS a landing
  class-string inventory diff PLUS the first GEOMETRY probes —
  getBoundingClientRect + computed styles):
  - Live-side drift since R17: ZERO on all 7 dashboard pages (third
    consecutive stable audit). Remaining dashboard diffs traced to
    documented D2/D3/D4/aria residuals, state-dependent install notice,
    or tokenizer alignment noise (byte-verified by direct extraction).
  - A1 settings Profile card: the classless server-action form was the
    only child of the space-y-4 card body → 0px group gaps (live: 16px),
    Save button 72px high in a flex wrapper, email input missing
    opacity-60.
  - A2 auth forms: TW4 compiles space-y as margin-block-end on the
    PRECEDING sibling; inline labels ignore vertical margins → 3px
    label→input gaps (live: 11px) on login/signup/forgot.
  - A3 install platform Card: inert clone-authored aria-labelledby.
  - Marketing bundle: ~20 order-drift strings + real drifts never
    byte-verified by R10-R12 (pricing subtitle/separators/spacer,
    text-green-600 comparison checks, gradient-hero-light chips, span
    feed avatars, flat hero CTAs, max-w-7xl header, tracking-tight
    footer wordmark, gap-12 grid, semibold stat labels, missing lucide
    double-name) — the R15-R17 "marketing stable" checks compared text
    lengths, invisible to a class rebuild.
- Plan written + validated against every source site
  (docs/plans/2026-09-19-round18-marketing-realignment.md); evidence in
  research/round18-audit/ (fresh live+local captures, geometry probes).
- TDD: 30 RED pins → GREEN (25 in new tests/marketing-r18-parity.test.tsx
  + 5 content-parity R18 blocks); 4 superseded R10-era pins updated.
  Fixes: settings form space-y-4 + direct-flow button + opacity-60;
  globals.css .space-y-2 > label + input v3-semantics rule;
  aria-labelledby dropped; 12 marketing components realigned (pricing
  subtitle/spacer/CTA structures/borders, comparison text-accent checks
  + div pill + Link-wrapped CTA, benefits grid gap-14 + div chips,
  how-it-works gradient-hero chips + orders, live-feed div avatars with
  inline backgrounds + data-URI stat zap + orders, hero trust icons +
  anchor-wrapped CTAs, site-header container chrome + anchor lockup +
  PNG logo + gap-7, wordmark fragment (header tracking, footer not),
  CTA banner gradient-hero + Link-wrapped button + Shield trust item,
  announcement-bar gradient-hero, StatsBar orders/font-medium, star
  orders, building icon double-name).
- Gate: lint ✓, typecheck ✓, 519 tests / 52 files (+35), build ✓.
- Browser verification: dashboard re-diff = documented residuals only;
  landing class-order inventory = ZERO order-drifts; button inventory =
  ZERO diffs (16 = 16); settings geometry PIXEL-EXACT (groups
  237/325/413, Save 501); auth gaps 11px both sides; E2E smoke (toggle,
  plan-intent hrefs, settings render + opacity-60 tail).
- Ruling D5: invisible functional chrome kept + documented (switch
  semantics, section aria-labelledby landmarks, focus-brand rings,
  reveal machinery, feed-row hook, decorative aria-hidden).
- Docs: PAD v1.17, README (519 + R18 bullet), AGENTS.md (TW4 space-y
  seam + marketing emission conventions + D5), CLAUDE.md (geometry
  parity principle + marketing conventions), plan execution log,
  evidence README, session_15.md, worklog (this record).

Stage Summary:
- Round-18 complete: the live stable across three audits; two real
  geometry bugs fixed (settings card, auth form gaps — invisible to
  every prior DOM-string verification); the marketing bundle realigned
  and pinned to the live's class emission; suite 484/51 → 519/52;
  PAD v1.16 → v1.17.
- Next: atomic commits + push (Task R18-ship), then Round-19 can
  extend the geometry probes to the marketing bundle and re-verify
  with the R18 toolchain.

Work Log (R18-ship):
- Final gate re-run GREEN: 519 tests / 52 files, lint, typecheck,
  build 27 routes (+ standalone). One environmental flake (prisma
  schema-engine panic — spawn EAGAIN from lingering browser daemons)
  resolved by killing the daemons; the suite then passed clean.
  Secret scan: no key material in the tree (only skills/ docs
  referencing the key format).
- 13 atomic commits on main (a2f5ede..0cb0efb): evidence, settings
  A1, auth space-y seam A2, install A3, pricing, comparison/features,
  how-it-works, feed, hero, chrome/wordmark, cta/banner/social, test
  pins (+35), docs (PAD v1.17, session_15, plan log, AGENTS/CLAUDE/
  README).
- Push via docs/ssh_git_wrapper_v3.py + paramiko shim (PATH
  prepended), --remote git@github.com:nordeim/pixel-identifier.git:
  dry-run green (e77bde8..0cb0efb), real push verified (remote
  refs/heads/main @ 0cb0efb == local HEAD), remote-tracking ref
  synced. Deploy key fingerprint verified before use
  (SHA256:HpVRkv3e8k0HgD6SKijmGSmjs/ZRRJxrZaAm6y6/Rns); operator key
  residue shredded (random overwrite + remove). No key material on
  disk.

Stage Summary:
- Round-18 fully closed and shipped: main @ 0cb0efb on GitHub, PAD
  v1.17, 519/52 tests. The live is stable across three consecutive
  audits; the clone's app bundle now matches it in GEOMETRY (pixel-
  exact settings card, 11px auth gaps) and the marketing bundle's
  class emission is pinned to the live's current build.
- Next: Round-19 drift watch with the R18 toolchain (tokenizer +
  class-inventory + geometry probes — extend the geometry probes to
  the marketing bundle); deeper functional parity (domains validation
  states, visitors sheet interactions) as an alternative track.

---
Task ID: R19
Agent: main (Super Z)
Task: Round-19 — marketing computed-style/geometry audit + remediation + ship

Work Log:
- Continued the interrupted R19 audit: reconstructed evidence from
  /tmp/r19-caps (dashboard+landing captures, geometry probes); baseline
  gate GREEN at 7c5c0bb (519/52). Live 100% stable since R18 — 4th
  consecutive stable audit (marketing body DOM byte-identical, zero
  dashboard token drift, auth 11px gaps hold).
- Findings: F1 .gradient-hero resolved DARK on all marketing surfaces
  (the live's marketing bundle defines it as the amber 3-stop
  var(--gradient-hero); R18 pinned class strings, not CSS resolution);
  F2 the hero feed widget's row model (live = 5-entry roster with
  staggered delays, enter→scan→reveal→done phase machine, 10s cycle,
  index*56+12 tops, avatar muted→primary flip, Matching…/✓ badges —
  extracted from the live's bundle source); F3 non-finding (live CDN
  404s transient); F4 the live swapped its avatar photos after R8
  (VLM-verified all five differ).
- TDD: 12 RED → GREEN pins (tests/marketing-r19-parity.test.tsx,
  incl. an offline perceptual avatar-hash pin) + 2 superseded R18 B5
  pins updated to the phase model. Suite 519/52 → 531/53; lint/
  typecheck/build GREEN.
- Fixed: .marketing-scope .gradient-hero (amber) + bare .gradient-hero
  (auth dark); .gradient-hero-light retired; live-feed.tsx rebuilt on
  the live's model; avatars re-synced to the live's current photos
  (96px).
- Browser verification: chips/bar/CTA amber + login canvas dark
  (computed styles); feed rows offsetTops 12/68/124/180/236 identical
  to the live; settings geometry pixel-exact (237/325/413/501 both
  sides — form-independent card selector: the live's settings page has
  no form, D2); E2E console sweep zero errors on 10 pages; VLM visual
  confirmations; 7 screenshots in docs/screenshots/. (One incident: the
  first verification run probed a zombie server from the interrupted
  session on port 3000 — killed, static+public recopied, re-ran clean.)
- Docs: PAD v1.18, session_16, plan + execution log, AGENTS/CLAUDE R19
  facts, README 531 + R19 bullet. .env.example re-verified matching
  (tracked since e95a20e).
- Push via docs/ssh_git_wrapper_v3.py + paramiko shim, --remote
  git@github.com:nordeim/pixel-identifier.git: dry-run green
  (7c5c0bb..993fa80), real push verified (remote refs/heads/main @
  993fa80 == local HEAD), tracking ref synced. Deploy key fingerprint
  verified before use (SHA256:HpVRkv3e8k0HgD6SKijmGSmjs/ZRRJxrZaAm6y6
  /Rns — matches R15-R18 records); operator key shredded (random
  overwrite + remove). No key material on disk.

Stage Summary:
- Round-19 fully closed and shipped: main @ 993fa80 on GitHub, PAD
  v1.18, 531/53 tests. The live is stable across four consecutive
  audits; the clone now matches it in computed styles (amber/dark
  gradient resolution), the feed widget's runtime model (pixel-identical
  row geometry), and the live's current avatar set.
- Next: Round-20 drift watch with the full R19 toolchain (tokenizer +
  class-inventory + computed-style + geometry probes); runtime-state
  observation (sampling the live's rotation phases) as a fifth probe
  generation; deeper functional parity (pricing toggle URL-state sync,
  visitors sort states, domains validation flows).

---
Task ID: R20
Agent: main (Super Z)
Task: Round-20 — runtime-state & functional parity audit + remediation + ship (continued from an interrupted session)

Work Log:
- Continued the interrupted R20 session: all code fixes (F1 pricing
  monthly, F2 domains controlled form, F4 staged reveal), test pins
  (+12, 543/54), screenshots (8), PAD v1.19, session_17 R20 log, plan
  + execution log were on disk uncommitted; verified the mid-session
  D5 re-ruling (F1d revert: the toggle's role="switch"/aria-checked/
  knob aria-hidden stay KEPT — the strict-parity pin was superseded)
  was fully applied across code, tests and docs before proceeding.
- Completed the remaining documentation: AGENTS.md (three R20 fact
  blocks + the D5 entry's R20 re-confirmation note), CLAUDE.md (the
  runtime-STATE/functional-flow parity principle, v1.19), README (543
  assertions + the R20 round bullet). .env.example re-verified
  matching the codebase (DATABASE_URL file path, NextAuth v4 implicit
  NEXTAUTH_SECRET, site-url NEXTAUTH_URL; tracked).
- Re-ran the full verification gate AFTER the F1d revert: lint ✓ ·
  typecheck ✓ · 543 tests / 54 files ✓ · next build ✓.
- 7 atomic commits on main (2f28b4f..22d4389): F1 pricing → F2
  domains → F4 feed staging → R20 pins → audit evidence → screenshots
  → docs.
- Push via docs/ssh_git_wrapper_v3.py + paramiko shim: fingerprint
  verified before use (SHA256:HpVRkv3e8k0HgD6SKijmGSmjs/ZRRJxrZaAm6y
  6/Rns — matches R15-R19 records); dry-run green (44949ce..22d4389),
  real push verified (remote refs/heads/main @ 22d4389 == local HEAD);
  tracking ref synced; operator key shredded (random overwrite x3 +
  remove) — no key material on disk.

Stage Summary:
- Round-20 FULLY CLOSED AND SHIPPED: main @ 22d4389 on GitHub, PAD
  v1.19, 543/54 tests. The live is stable across five consecutive
  audits; the clone now matches its runtime STATES (pricing monthly
  emission, add-domain disabled-on-empty) and the feed's staged
  mode:"wait" reveal transition, with the live's own defects (zero
  domain validation, no delete confirm) ruled intentional divergences.
- Next: Round-21 drift watch with the R20 toolchain (tokenizer +
  runtime-state + functional probes); probe targets — marketing
  mobile/responsive states, the blog/docs sub-page interactions, and
  any live deploy that changes the bundle hash (index-C3AAh5Je.js).

---
Task ID: R21
Agent: main (Super Z)
Task: Round-21 — functional-flow & export parity audit + remediation + ship

Work Log:
- Baseline gate at 95604e0: lint ✓ typecheck ✓ 543/54 ✓ build ✓.
- Audit: drift watch (6th) — LIVE 100% STABLE (the landing's 7 tokens
  were one feed row's done-unmount artifact; bundle hash unchanged,
  index-C3AAh5Je.js). 6th probe generation: the CSV export decoded from
  the live's app bundle (index-nhmKaUsm.js, fn W), the visitors filter
  selects opened at runtime (Radix portal), the first responsive probes
  (375/768 — PARITY), the live mobile dropdown captured, the
  plan-switch flow decoded (Stripe EmbeddedCheckout — intentional
  divergence).
- Findings F1-F10, all fixed via TDD (543/54 → 568/56; +30 pins in
  tests/export-r21-parity.test.ts + tests/visitors-r21-parity.test.tsx;
  legacy suites updated: export-route, format (csvCell retired),
  identification (identTypeFor replaces sourceFromReferrer),
  visitors-query, dashboard-chrome):
  - F1 the export byte format (the live's 9 columns, LF, no BOM, no
    quoting, relative Last Seen, 1-hour status; page-scoped via
    chrome-store pageVisitorIds);
  - F2 PAGE_SIZE 20; F3 confidence BANDS; F4 source = identType
    (direct/network/ip-lookup); F5 3-tier bar fill; F6 b2b null
    confidence; F7 the live's mobile dropdown; F8 always-MapPin b2b
    cell; F9 relativeTime = Ry; F10 the 1-hour active window.
- Verification: in-page export fetch byte-checks green; selects'
  options identical to the live's; cells verified; zero console
  errors; 5 screenshots + 2 VLM confirmations; dev DB re-seeded with
  the live semantics (the shell-env DATABASE_URL override identified;
  both DBs refreshed).
- Docs: PAD v1.20 (+ body sections + Known-Issues Stripe row),
  session_18 R21 log, R21 plan + execution log, AGENTS/CLAUDE/README.
  .env.example re-verified matching (tracked, unchanged).
- 7 atomic commits on main (60f531c..283f8df): time rules → visitors
  model → export format → mobile dropdown → pins → evidence +
  screenshots → docs.
- Push via docs/ssh_git_wrapper_v3.py + paramiko shim: fingerprint
  verified (SHA256:HpVRkv3e8k0HgD6SKijmGSmjs/ZRRJxrZaAm6y6/Rns,
  matches R15-R20); dry-run + real push verified (remote
  refs/heads/main @ 283f8df == local HEAD); tracking ref synced;
  operator key shredded after the ship-record push (random overwrite
  x3 + remove) — no key material on disk.

Stage Summary:
- Round-21 FULLY CLOSED AND SHIPPED: main @ 283f8df on GitHub, PAD
  v1.20, 568/56 tests. The live is stable across six consecutive
  audits; the clone now matches its exported-file bytes, its visitors
  data/filter semantics, its time rules and its mobile dropdown, with
  the Stripe checkout ruled an intentional divergence.
- Next: Round-22 drift watch with the R21 toolchain; probe targets —
  the live's signup → dashboard first-run funnel, the activity feed's
  load-older flow, and the marketing blog/docs sub-page interactions.

---
Task ID: R22-ship
Agent: main (Super Z)
Task: Round-22 — first-run states, activity pagination & sub-page interaction parity audit + remediation + ship

Work Log:
- git pull brought the user's session_19.md (R21 narrative log);
  baseline gate GREEN at 1b63733 (568/56).
- Audit (7th probe generation): drift watch 7th consecutive STABLE
  (8/9 pages zero ops after a viewport-corrected re-capture — the
  first pass's narrower recharts surface (595 vs 702) was
  capture-viewport, not content drift; landing's 3 ops = the known
  feed-row phase artifact; bundle hash unchanged index-C3AAh5Je.js).
  The live's empty-state branches decoded from its app bundle +
  runtime-confirmed (no-match search on the live visitors page); a
  fresh live signup attempted (Supabase 200 WITHOUT a session — the
  email-confirmation gate, F11; probe account dormant-unconfirmed,
  documented); the Activity Log decoded from bundle component hxe
  (50/page offset pagination, NO polling, NO load-older); blog/docs
  interactions probed (Contact Support = real but DEAD button on the
  live; docs copy Check carries text-green-500).
- TDD: F1-F10 fixed (568/56 → 596/59; +28 pins in 3 new suites,
  activity-query/content-parity updated). F7 corrected mid-round from
  the full bundle branch (the live's zero-sites install path IS an
  interstitial; the placeholder key is its loading fallback).
- Verified: fresh signup → /dashboard; all first-run empty branches
  DOM-verified (exact classes/strings, table GONE); activity
  pagination end-to-end ("1–50 of 130" → "51–100 of 130", "Page 1/2
  of 3", prev disabled at page 0); NO polling (idle-network); zero
  console errors; 8 screenshots + 3 VLM confirmations; evidence in
  research/round22-audit/.
- Docs: PAD v1.21 (revision entry + body + Known-Issues rows), README
  (596, the activity model rows, R22 bullet), AGENTS/CLAUDE R22 facts
  + principles, session_19 R22 log, R22 plan + execution log.
  .env.example re-verified matching (tracked, unchanged).
- 8 atomic commits on main (dae8ab6..773b904): visitors empty →
  dashboard empty states → activity pagination → install
  interstitial → marketing docs buttons → pins → evidence +
  screenshots → docs.
- Push via docs/ssh_git_wrapper_v3.py + paramiko shim: fingerprint
  verified (SHA256:HpVRkv3e8k0HgD6SKijmGSmjs/ZRRJxrZaAm6y6/Rns,
  matches R15-R21); dry-run + real push verified (remote
  refs/heads/main @ 773b904 == local HEAD); tracking ref synced;
  operator key to be shredded after the ship-record push (random
  overwrite x3 + remove).

Stage Summary:
- Round-22 FULLY CLOSED AND SHIPPED: main @ 773b904 on GitHub, PAD
  v1.21, 596/59 tests. The live is stable across seven consecutive
  audits; the clone now matches its first-run empty states, its
  Activity Log pagination model, its zero-domain install flow, and
  its docs micro-interactions, with the signup email gate and the
  dead Contact Support button ruled intentional divergences.
- Next: Round-23 drift watch with the R22 toolchain; probe targets —
  the live's visitors detail sheet (row click), settings save flows
  at runtime, any live bundle hash change.

---
Task ID: R23-ship
Agent: main (Super Z)
Task: Round-23 — DB seam (file:../db/custom.db), mobile-nav parity, Playwright e2e + skill distillation + ship

Work Log:
- Continuation of an interrupted session: the audit, remediation
  (F1-F10) and docs were done; this session re-verified everything,
  finished the SKILL.md, and shipped.
- Baseline: the user's `update env example` (085bd09) + session_20.md
  + merge 8cb18bd; gate GREEN at 596/59 (2 skipped).
- Audit (8th probe generation, evidence in the R23 plan): live login +
  dashboard re-verified (VLM STRUCTURAL MATCH); live mobile dropdown
  computed styles byte-equal; live Sheet closes on link navigation
  while the clone's stayed open (F3, functional); live toggle icon
  w-6 h-6 (24px) vs the clone's h-5 w-5 (F4); announcement-bar
  class-order byte divergences (F5-F7); TW4 emission order verified
  CORRECT in the built CSS (no ordering bug; F11 CI "corruption"
  retracted as a terminal display artifact).
- DB seam root cause empirically isolated (one-variable probes):
  Prisma CLI anchors env-indirected relative file: URLs at the
  .env/project root (escapes the repo); the Next server runtime
  REWRITES env file: URLs (even absolute) to a wrong base (SQLite
  error 14); datasourceUrl bypasses the rewriting; plain-node
  contexts anchor schema-relative. Fix: src/lib/db-path.ts
  (resolveDatabaseUrl) + datasourceUrl in db.ts (F2), and
  scripts/with-db-url.mjs routing db:push/db:seed (F1) — the
  .env.example contract now holds everywhere.
- TDD: tests/db-path.test.ts (RED 0/8 → GREEN 8/8),
  tests/mobile-nav-r23-parity.test.tsx (RED 7 → GREEN),
  Playwright suite (playwright.config.ts + 3 specs, 14 chromium
  tests against the standalone build on :3100 with db/e2e.db, incl.
  the F3 Sheet-close regression + beacon→Activity loop), CI e2e job,
  test:e2e script (F8).
- This session's verification: vitest 613 passed | 2 skipped (61
  files) via --pool=forks --maxWorkers=1 --no-file-parallelism after
  a resource-induced SIGABRT (stray dev server + browsers killed;
  NOT a code failure); lint + typecheck clean after clearing a stale
  .next/types reference to the deleted dbdiag diagnostic route;
  build clean (all 19 pages + 5 API routes).
- pixel-identifier_SKILL.md distilled per skills/distill-codebase-skill
  + skills/to-distill-project-into-skill (20 sections + 4 appendices,
  1132 lines; every version/count/path re-verified against the tree;
  path spot-check fixed app-pixelco_dashboard.png).
- Ship: single commit 6bbcee7 on main (32 files, +2588) — no new
  branch; push via docs/ssh_git_wrapper_v3.py + paramiko shim
  (paramiko 5.0.0 into the venv python; shim at workspace bin/),
  key fingerprint SHA256:4rAzu5gC41giPSWmIojTc1isH0FGoGiSgYJkDcMp54g;
  dry-run + real push verified (remote refs/heads/main @ 6bbcee7 ==
  local HEAD); tracking ref synced; operator key shredded (399
  random bytes + remove). This worklog entry follows in a second
  docs commit.

Stage Summary:
- Round-23 FULLY CLOSED AND SHIPPED: main @ 6bbcee7 (+ this worklog
  commit) on GitHub, PAD v1.22, 613/61 vitest + 14/14 e2e chromium.
  The DB seam the user's .env.example documents now actually works
  for the CLI, build, and server runtime; the dashboard mobile Sheet
  closes on navigation like the live; the mobile toggle matches 24px;
  announcement-bar bytes match; the repo gained its first e2e net and
  its master engineering skill (pixel-identifier_SKILL.md).
- Next: Round-24 drift watch with the R23 toolchain; probe targets —
  the live's settings save flows, the visitors detail sheet (row
  click), any live bundle hash change; watch Prisma 6.x CLI anchor
  behavior on minor bumps (the wrapper normalizes it today).

---
Round-24 ship record — 2026-09-22 (session: docs/session_22.md)

Work Log:
- Drift watch on the R23 next-notes: settings save flow (buttons
  byte-match; only the pending spinner drifted — F9), visitors row
  click (live rows INERT — the detail Sheet stays a value-add),
  bundle hashes (UNCHANGED — nhmKaUsm/C3AAh5Je match the R21/R20
  baselines; the opening alarm was a stale R19 record), Prisma CLI
  anchor (6.19.3 both sides, wrapper in sync) — all non-findings.
- 9th probe generation closed the real pre-existing drift: the live
  app bundle pins lucide-react v0.462.0 → ten dashboard icons ship the
  OLD generation (bell, log-out, mail, users, download, search, code,
  shopping-bag, trending-up/down — geometry overrides in live-icons.tsx,
  app-scoped; the marketing bundle ships the new generation); the bell
  order `h-10 w-10 relative` (F5); the New This Week trend badge (F6,
  weekOverWeekChange in format.ts); "1 views" never singularized (F3);
  the Export <button> visible on mobile (F8); the Save spinner beside
  the label (F9); sign-out without shrink-0 (F10); the marketing B2B
  sentence + capitalized kickers (F1); the platform instructions
  REWRITTEN live-verbatim incl. buildPlatformSnippet per-tab pres with
  the GTM literal-key variant (F2); R14-F10's 404-title evidence
  disproven — the island stays a documented value-add (F12).
- TDD: RED 46/49 failing across 4 new files → GREEN 49/49 after
  fixing 8 test-side artifacts (SSR entity encoding + one regex);
  one legacy assertion updated to the button reality (R11 selection).
- Gates: 662 vitest | 2 skipped (65 files) · lint 0 · typecheck 0 ·
  build all routes · standalone e2e 14/14 chromium (17.8s).
- Browser verification: bell/Export/Save byte-match the SETTLED live
  DOM (an early missing-classes observation was a pre-hydration
  artifact); platform tabs verified verbatim; mobile nav re-checked
  incl. the same-page edge case (the live also keeps the Sheet open);
  8 VLM-verified screenshots in docs/screenshots/r24-*; zero console
  errors.
- Docs: README (R24 bullet, 662), AGENTS (R24 fact blocks + F12
  correction), CLAUDE (mirror), PAD v1.23, session_22.md, this entry,
  the plan's execution log, pixel-identifier_SKILL.md.

Stage Summary:
- Round-24 SHIPPED: main advanced with the R24 changeset; suite at
  662/65 + 14 e2e; the clone's dashboard now renders the live's exact
  icon generation, platform instructions, trend badge and texts.
- Next: Round-25 drift watch — re-probe the bundle hashes (a live
  redeploy would re-run the full token-diff sweep), watch for
  lucide-react version moves in a new app bundle, and re-check the
  settings save flow for feedback UI (currently silent).

---
Task ID: R25
Agent: main (Super Z)
Task: Round-25 drift watch — probe the live, verify parity, ship the
evidence record.

Work Log:
- Workspace refreshed: git pull fast-forwarded 8fccf4a..82cabbb
  (upstream added docs/session_23.md — the R24-completion narrative;
  no code delta). Docs re-validated against the tree; R24 fixes
  confirmed in place; dev server + db healthy.
- 10th probe generation, all clean:
  - No redeploy: marketing C3AAh5Je.js/bLMWzsGr.css + app
    index-nhmKaUsm.js unchanged; lucide-react still 0.462.0.
  - NTW badge NEGATIVE branch live-verified (live data 0-vs-2 →
    -100.0% destructive + legacy trending-down h-3 w-3 mr-0.5);
    clone structure byte-identical with data masked; both badge
    branches now runtime-verified.
  - "1 views" no-singular re-confirmed in live Top Pages.
  - Settings save: spinner + disabled re-captured in full (matches
    R24-F9); save stays silent; Delete stays dead; rows stay inert.
  - Export button byte-identical both sides.
  - Mobile nav: dropdown markup + toggle w-6 h-6 match; close-on-
    link-click verified BOTH sides (first probe's stays-open was an
    artifact — hidden desktop/footer anchor clicked; visibility-
    filter lesson recorded); R23-F3 Sheet regression green.
  - Install: WordPress tab verbatim both sides; active-panel-only
    content mounting matches.
  - D4 aria-hidden residual re-confirmed (documented, not drift).
- Verdict: CLEAN — zero code changes; the plan documents the null
  remediation: docs/plans/2026-09-22-round25-drift-watch.md.
- Gates on the unchanged tree: verify EXIT=0 (662 vitest | 2 skipped,
  lint 0, typecheck 0, build) + standalone e2e 14/14 chromium (15.8s).
- 6 VLM-verified screenshots: docs/screenshots/r25-* (KPIs+badge,
  visitors, settings, install WP tab w/ pre visible, landing mobile
  menu, dashboard mobile Sheet).
- .env.example re-verified (3 keys, consistent — no code changes
  since R24).
- Docs: README R25 bullet, AGENTS R25 fact, CLAUDE rounds 11-25
  mirror, PAD v1.24, session_24.md, SKILL.md R25 rows + stale PAD
  version reference fixed, this entry.
- Committed to main; pushed via the SSH wrapper; remote ref verified.

Stage Summary:
- Round-25 CLEAN drift watch shipped: no redeploy, no drift, zero
  code changes; both NTW badge branches now live-verified; mobile
  nav verified on both surfaces and both sites; regressions green.
- Next (R26): bundle hashes (the only signal that matters without a
  live touch), the badge's no-branch if live data returns to
  lastWeek=0, a settings-save toast watch, and a full desktop
  token-diff if any hash moves.

---
Task ID: R26
Agent: main (Super Z)
Task: Round-26 live-parity sweep + pricing POPULAR badge remediation.

Work Log:
- Workspace re-cloned at 128b6ac (R25-clean); scandihaven cloned for
  tech-stack patterns; full doc chain reviewed. Environment: .env with
  the user's DATABASE_URL contract (file:../db/custom.db → repo db/),
  db:push + db:seed, dev server + /api/health green. Arrival gates:
  lint 0, typecheck 0, 662 vitest, build, e2e 14/14.
- 11th probe generation (dual agent-browser sessions, 1280 + 375):
  - No redeploy: marketing C3AAh5Je.js/bLMWzsGr.css + app
    index-nhmKaUsm.js + lucide 0.462.0 unchanged.
  - Mobile nav (standing emphasis) both surfaces/sites: dropdown bytes
    + w-6 h-6 toggle + close-on-link-click; Sheet 288px + close-on-nav
    + same-page edge — parity.
  - TW4 checks (bare-var brackets, md:hidden emission, hand-defined
    utilities), DB seam, marketing pricing monthly toggle, topbar/bell
    bytes, 18-route console sweep — all clean.
  - VLM comparisons: landing/dashboard/visitors/settings/activity/
    domains/install/login — essentially identical.
  - FINDING R26-F1: the live's dashboard pricing Growth card header
    renders a POPULAR badge (new-gen Badge, default variant,
    gradient-first tail, both billing states + viewports) that the
    clone lacked since R15 — the old "no POPULAR badge" pin had
    captured the rolling-deploy window's OLD build (bundle hash never
    changed).
- TDD: RED 6 failing (dashboard-r26-parity SSR pins + replaced
  shell-parity source pin) → GREEN after the Badge-primitive fix in
  plan-panel.tsx; runtime byte-diff vs the live: IDENTICAL.
- NEW e2e/pricing.spec.ts (2 specs — badge bytes/position/scope +
  both toggle states with the $249→$199 price check) closes the e2e
  coverage gap. Full e2e 16/16 chromium.
- Gates: lint 0, typecheck 0, 667 vitest / 66 files (2 skipped),
  build + standalone OK, 16/16 e2e, zero console errors.
- 7 VLM-verified screenshots: docs/screenshots/r26-*.
- .env.example re-verified (3 keys, consistent).
- Docs: README R26 bullet, AGENTS R26 fact, CLAUDE 11–26 mirror,
  PAD v1.25, SKILL.md R26 rows, plan execution log, session_26.md,
  this entry.

Stage Summary:
- Round-26 SHIPPED: one real drift found and fixed (the pricing
  POPULAR badge), pin net hardened (+5 vitest, +2 e2e), runtime
  byte-verified against the live; everything else confirmed at parity.
- Next (R27): bundle hashes; the pricing page is now in the standing
  regression loop; settings-save toast watch; NTW no-badge branch if
  live data returns to lastWeek=0.

---
Task ID: R27
Agent: main (Super Z)
Task: Round-27 drift watch + remediation — sonner toast parity with pixelco.io

Work Log:
- Re-cloned at b300560 (R26-clean); docs reviewed (AGENTS/CLAUDE/README/
  PAD v1.25/SKILL/session_26/27/R26-plan/TW4-report/worklog); scandihaven
  cloned for reference; arrival gates green (lint 0, tsc 0, 667 vitest).
- Environment: repo .env + root db/ per the user contract, db:push +
  db:seed green, dev server healthy; stale session DATABASE_URL
  unified via symlink (no repo change).
- 12th probe generation: no redeploy (all bundle hashes unchanged);
  mobile navs both sites/surfaces parity (scroll 7424/7404, Sheet
  18rem/288px, close-on-nav); POPULAR badge byte-identical; NTW
  negative branch; install copy swap; login failure silent on live;
  19-route console sweep clean.
- NEW probe surface — the live's MUTATION flows: R27-F1 found — sonner
  SUCCESS toasts on settings save ("Settings saved"), domain add
  ("Domain added successfully"), domain delete ("Domain removed");
  bottom-right, check-circle icon, title-only, lazy-mounted ol, empty
  section at idle.
- sonner fingerprinted from the live bundle (:where() + -10px +
  3x data-lifted + byte-identical icon path) → pinned 1.7.4 exact.
- TDD: RED tests/toast-r27-parity.test.tsx (14 pins) → GREEN the
  ui/sonner.tsx wrapper + root-layout swap + settings/domains
  migrations + the Radix toast trio deleted + @radix-ui/react-toast
  uninstalled; full suite 681 vitest / 67 files (2 skipped).
- NEW e2e/toasts.spec.ts (2 specs; demo-account plan-limit + signup
  label-collision artifacts fixed en route); full e2e 18/18 chromium.
- Runtime byte-verify vs the live: idle section + ol attrs/vars + li
  class family + icon path + title IDENTICAL.
- 7 VLM-verified screenshots (docs/screenshots/r27-*); demo domain
  verified status restored after the capture cycle.
- .env.example re-verified (3 keys, consistent — no env surface added).
- Docs: README R27 bullet, AGENTS R27 fact, CLAUDE 11–27 mirror,
  PAD v1.26, SKILL.md R27 rows, plan execution log, session_28.md,
  this entry.

Stage Summary:
- Round-27 SHIPPED: one drift family found and fixed (the sonner toast
  system, 1.7.4 exact), pin net hardened (+14 vitest, +2 e2e), runtime
  byte-verified against the live; everything else confirmed at parity.
- Next (R28): bundle hashes (a change triggers the full token-diff
  sweep); the toast system joins the standing regression loop; NTW
  no-badge branch watch; consider delete-confirm e2e specs.

---
Task ID: R28
Agent: main (Super Z)
Task: Round-28 drift watch + remediation — trend chart axis-geometry parity with pixelco.io

Work Log:
- git pull 2abbc19 → f59c0cc (session_29.md only); docs reviewed
  (AGENTS/CLAUDE/README/PAD v1.26/SKILL/session_28+29/R27-plan/
  TW4-report/worklog); arrival gates green (lint 0, tsc 0, 681 vitest).
- Environment: symlink quirk re-confirmed; demo visitors re-seeded
  (the R27 capture cycle had cascade-wiped them); dev server healthy.
- 13th probe generation: no redeploy (all bundle hashes unchanged);
  mobile navs both sites/surfaces parity (scroll 7424/7404, Sheet
  18rem/close-on-nav); toast system byte-identical both sides; POPULAR
  badge byte-identical; NTW negative branch; install copy swap;
  topbar/visitors parity; 20-route console sweep clean.
- NEW mutation surface: the live's plan-change = Stripe
  embedded-checkout modal (real billing, SEK) — the clone's simulated
  switch stays the D-class divergence (documented, no action).
- NEW probe surface (the chart's SVG internals): R28-F1 found — the
  live renders recharts DEFAULT tick lines + both axis lines in the
  axis-level stroke hsl(220, 9%, 46%) (tick text inherits it as fill),
  margin {5,5,5,5} (plot origin x=65), comma-form HSL literals, and an
  8px no-shadow tooltip; the clone's R8-era config suppressed the tick
  lines + Y axis line, hacked the margin left:-18 (23px plot shift
  flipping the label thinning: live 12/14 labels, clone 13), and
  styled the tooltip 12px + shadow.
- TDD: RED tests/chart-r28-parity.test.tsx (12 source pins, 9 failing)
  + NEW e2e/chart.spec.ts (3 runtime specs) → GREEN trend-chart.tsx
  restored to the live's config; full suite 693 vitest / 69 files
  (2 skipped).
- Runtime byte-verify vs the live: 12 label positions (48…558), 17
  tick lines at the captured geometry, both axis lines, tick-text fill
  attr, last-label clamp x=576.59375, tooltip style bytes — IDENTICAL.
  Mobile 36px chart-width delta traced to data (NTW badge text) —
  documented non-finding.
- Full e2e 21/21 chromium (31.6 s); build + standalone green.
- 4 VLM-verified screenshots (docs/screenshots/r28-*).
- .env.example re-verified (3 keys, consistent — no env surface added).
- Docs: README R28 bullet, AGENTS R28 fact, CLAUDE 11–28 mirror,
  PAD v1.27, SKILL.md R28 rows, plan execution log, session_30.md,
  this entry.

Stage Summary:
- Round-28 SHIPPED: one drift family found and fixed (the trend
  chart's axis chrome + geometry), pin net hardened (+12 vitest,
  +3 e2e), runtime byte-verified against the live; everything else
  confirmed at parity.
- Next (R29): bundle hashes (a change triggers the full token-diff
  sweep); the chart joins the standing regression loop; toast/pricing/
  mobile-nav loops continue; tooltip label/entry pin candidates.
---
Task ID: R29
Agent: main (Super Z)
Task: Round-29 drift watch + remediation — Select item class-order parity with pixelco.io

Work Log:
- Workspace re-cloned fresh at f13abc1 (session reset; docs-only commits
  after the R28 push — session_31.md, the operator's R28 transcript);
  docs reviewed (AGENTS/CLAUDE/README/PAD v1.27/SKILL/session_30+31/
  R28-plan/worklog); environment rebuilt (.env, db pushed + seeded,
  the stale-shell DATABASE_URL quirk re-unified via symlink).
- Arrival gates green (lint 0, tsc 0, 693 vitest — the R28 baseline).
- Session continued across a context reset: the probe phase completed
  in two halves with findings carried through the plan doc.
- 14th probe generation: NO redeploy (all three bundle hashes
  unchanged — fourth consecutive stable generation); mobile navs both
  sites/surfaces parity (one clone false alarm traced to dev-compile
  latency — the Sheet does close on nav); chart r28 byte-identical;
  toast byte-identical (4s auto-dismiss both sides); POPULAR badge;
  NTW negative branch; install copy swap; topbar/visitors parity;
  route console sweep clean.
- R28 candidates closed: tooltip CONTENT confirmed stable (label +
  `name : value` entries byte-identical both sides); activity
  pagination footer runtime-latent on the live (7 events < 50/page —
  the R22 pin stands, source-pinned).
- NEW probe surface (the Radix Select OPEN-state portal): R29-F1 found
  — the live renders the SelectItem class attribute with the
  data-[disabled]: pair BEFORE the focus: pair (its bundle flipped the
  legacy order in the R11→R16 window; the R11 ground truth recorded
  the OLD order), consistent across all three of the live's Select
  surfaces; the clone shipped the R11-era focus-first order. Same
  rendered CSS — pure DOM-byte parity. Trigger/chevron/viewport/
  indicator byte-identical pre-fix; the check-icon svg aria-hidden
  re-confirmed as the D4 lucide residual (the wrapper span renders on
  BOTH sides).
- TDD: RED tests/select-r29-parity.test.tsx (7 pins, 2 failing) +
  NEW e2e/select.spec.ts (3 runtime specs, 2 failing pre-fix) → GREEN
  one-string reorder in ui/select.tsx SelectItem; full suite 700
  vitest / 70 files (2 skipped).
- Static-render probe finding: renderToStaticMarkup does NOT render
  Radix portal items — the item class order is only browser-observable
  (the e2e spec carries the runtime pin).
- Runtime byte-verify vs the live: all 4 confidence option class
  attributes identical (order-sensitive), trigger (incl. w-44) +
  viewport + indicator + check path identical; residuals = D4 + radix
  ids only.
- Full e2e 24/24 chromium (38.2 s); build + standalone green (one
  transient worker-spawn failure, clean on retry).
- 4 VLM-verified screenshots (docs/screenshots/r29-*).
- .env.example re-verified (3 keys, consistent — no env surface added).
- Docs: README R29 bullet, AGENTS R29 fact, CLAUDE 11–29 mirror,
  PAD v1.28, SKILL.md R29 rows, plan execution log, session_32.md,
  this entry.

Stage Summary:
- Round-29 SHIPPED: one drift family found and fixed (the Select
  item class order — the live's R16-era bundle order vs the clone's
  R11-era legacy), pin net hardened (+7 vitest, +3 e2e), runtime
  byte-verified against the live; everything else confirmed at parity
  (tooltip content now on the confirmed-stable list; the activity
  footer latent).
- Next (R30): bundle hashes (a change triggers the full token-diff
  sweep); the Select open-state joins the standing regression loop
  (r29 e2e); standing toast/pricing/mobile-nav/chart loops continue;
  candidate surfaces — the DomainSwitcher open-state runtime byte-diff
  (the third live Select surface) and the settings-tab panels.

---
Task ID: R30
Agent: main (Super Z)
Task: Round-30 sidebar-wrapper + install-switcher parity (session interrupted mid-execution; completed by R31)

Work Log:
- 15th probe generation: NO redeploy (all three bundle hashes unchanged —
  5th consecutive stable generation); standing surfaces clean (mobile navs
  both sites/surfaces, chart, toast, POPULAR, NTW, copy swap, topbar/
  visitors, console sweep); NEW probe surfaces — the shell's outer wrapper
  layer, the settings-panel byte-diff, the DomainSwitcher open state
  (PARITY — the R29 primitive covers the third surface), site ordering.
- Four findings: F1 the live's SidebarProvider wrapper div missing from
  every dashboard page (class + inline width vars); F2 clone-authored
  settings input attrs (type="url"/autoComplete/maxLength); F3 the install
  selection URL-driven (?site= leaked) vs the live's pure client state;
  F4 install sites oldest-first vs the live's newest-first default.
- TDD executed (23 new pins across three vitest files + e2e/install.spec.ts
  + the dashboard wrapper e2e spec); fixes landed in layout.tsx,
  settings-panel.tsx, domain-switcher.tsx (controlled), install/page.tsx
  (slimmed), plus the InstallPanels client island.
- The session DIED mid-e2e (the install specs' UI add hit the free-plan
  1-domain cap) and the commit 40a7fa8 shipped BROKEN: the island file,
  the 6 repointed pins, and the src/lib/sites.ts + tests/sites.test.ts
  retirement were never staged (tsc/vitest/build red at HEAD).

Stage Summary:
- Round-30's code fixes + pins are correct but the round shipped
  INCOMPLETE — R31 repaired main and closed the gates (see R31).
- Lesson recorded: a GREEN local tree is not a GREEN commit — the gate
  must run against the STAGED tree.
---
Task ID: R31
Agent: main (Super Z)
Task: Round-31 — R30 completion (install-island repair) + 16th-generation drift watch

Work Log:
- Fresh clone at 0448ae2; docs reviewed (the five root docs still at the
  R29 state; session_34's transcript ends mid-e2e); environment rebuilt
  (.env DATABASE_URL="file:../db/custom.db", db/ pushed + seeded at the
  repo root — this sandbox now blocks symlinks, so the stale-shell
  DATABASE_URL quirk is handled with a per-command env override).
- Arrival gates: main BROKEN (tsc TS2307 install-panels; vitest 706 |
  10 failed | 2 skipped; badge-consumers unrunnable) — root cause the
  R30 staging gap, proven by the interrupted session's own 719|2 number.
- Phase A repair (the committed RED pins were the spec): island
  reconstructed verbatim from the pins + the pre-R30 page JSX +
  useState(sites[0].siteKey) newest-default; 6 pins repointed verbatim
  (content-parity ×5, dashboard-empty-r22 ×1); sites.ts + its 4-test
  file retired. Gates: lint 0 · tsc 0 · 719 | 2 skipped (721 total) ·
  build green.
- Phase B e2e: seedProbeSite direct db/e2e.db insert replaces the
  cap-blocked UI add; made HERMETIC (cleanProbeSites beforeAll +
  afterAll) after the consecutive-run check caught leaking probes
  breaking pipeline (snippet-key host-match) + dashboard (seeded-domain
  visibility) on reused servers. Gates: 28/28 e2e chromium across two
  consecutive runs (the reuse case clean).
- Phase C 16th probe generation: NO redeploy (6th consecutive stable);
  mobile navs FULL PARITY both surfaces both sites (dropdown + Sheet,
  close-on-visible-link + close-on-nav, icon reset, live 7424 / clone
  7404 = the D5 delta; the R25 visibility-filter lesson re-applied);
  TW4 watch clean; R30 fixes runtime byte-verified vs fresh live
  captures (wrapper byte-identical; live settings inputs bare; live
  switcher pure client state, newest-first default); chart r28
  byte-identical; console sweep 19/0. No new drift.
- Phase D: 6 VLM-verified screenshots (docs/screenshots/r31-*; the
  switcher shot's dev-DB probe site cleaned after capture); .env.example
  re-verified; docs synced for BOTH rounds (README bullets + totals
  719/28, AGENTS R30+R31 facts, CLAUDE 11–31 mirror, PAD v1.29, SKILL
  frontmatter + Appendix A/D + final gates + Quick Reference, R30 plan
  execution log, R31 plan, session_35.md, this log + the root mirror).
- Committed to main; pushed via docs/ssh_git_wrapper_v3.py (--remote
  git@github.com:nordeim/pixel-identifier.git — the DEFAULT_REMOTE is a
  different repo); remote ref verified == local HEAD; operator key
  shredded.

Stage Summary:
- Round-31 SHIPPED: main repaired to the R30 design (719 | 2 + 28/28,
  the exact interrupted-session totals), the install e2e fixture is
  hermetic, the 16th generation found zero drift, and both rounds' docs
  are synced (PAD v1.29).
- Next (R32): bundle hashes; the R30 surfaces join the standing loop;
  candidate surfaces — marketing footer open-state links @375, blog SSG
  DOM runtime-diff, activity pagination footer (latent < 50 events).

---

Task ID: R32
Agent: main (Super Z)
Task: Round-32 — blog-article-footer parity + 17th-generation drift watch

Work Log:
- Arrival: git pull to af865b6 (added only session_36.md, the prior
  transcript); gates all green at the R31 ship state (lint 0 · tsc 0 ·
  719 vitest | 2 skipped · build green); .env + db/ seam acceptance
  clean (no stray parent-dir file); vitest/playwright configs verified
  per the standing contract; scandihaven + skills catalogs re-reviewed.
- 17th probe generation (dual live+clone agent-browser sessions): NO
  redeploy (all three bundle hashes unchanged — 7th consecutive
  stable). Mobile navs (standing user emphasis): FULL PARITY both
  surfaces both sites — marketing dropdown @375 (toggle/container/link
  bytes, close-on-VISIBLE-link click, icon reset, live 7424 / clone
  7404 D5 delta) + dashboard Sheet @375 (18rem inline var → 288 px, 7
  links, close-on-nav). TW4 watch clean.
- Standing surfaces all clean: R30 wrapper (class byte-identical), POP
  ULAR badge, settings inputs (live bare / clone D-class), install
  switcher (live client-state newest-first, clean URL), sonner toast
  (driven on BOTH sides — 'Settings saved' byte-identical), Select r29
  portal (option class order), console sweep 19 routes / 0 errors.
- R31-queued candidates: marketing footer @375 CLOSED (full parity incl
  link navigation); activity pagination still runtime-latent (~6 live
  events); blog SSG pages — index full parity, but the ARTICLE pages
  surfaced the round's ONE drift family (R32-F1): the live renders an
  article FOOTER (border-t border-border mt-14 pt-8) after the prose
  body with the byline 'Written by <strong text-foreground>Pixelco
  Team</strong>' + a bare anchor wrapping the default-variant Button
  'Start Identifying Visitors →' (text arrow U+2192) — constant across
  all articles probed; the clone shipped none of it (the R13 audit's
  capture never recorded the footer; never-diffed ≠ absent).
- Also ruled a data-driven NON-finding (documented in the plan): the
  chart's middle-label thinning — the live's own hidden set changed
  since R31 with no bundle change (its 14-day window rolled);
  fonts/widths/geometry byte-identical; recharts 2.15.4's getTicksStart
  reproduces the clone's exact output; the divergence rides sub-pixel
  accumulation inside the live's embedded build.
- R32-F1 fix (TDD): 5 SSR pins in tests/blog-article-footer-r32-
  parity.test.tsx (RED 4 | 1 trivially-green) → the footer block
  appended to src/app/(marketing)/blog/[slug]/page.tsx (Link bare +
  Button default variant — the faq-footer house pattern) → 5/5 GREEN;
  runtime byte-verified vs the live capture; CTA click → /signup.
  NEW e2e/blog.spec.ts (2 specs) closes the runtime coverage gap (one
  assertion fix: the bare anchor is attribute-ABSENT, null ≠ '').
- Gates: lint 0 · tsc 0 · vitest 724 passed | 2 skipped (73 files, 726
  total = 719 + 5) · build + standalone green · 30/30 e2e chromium
  (28 + 2, 49.6 s).
- Phase C: 5 screenshots docs/screenshots/r32-* (article footer desktop
  + mobile, dropdown, dashboard overview, mobile Sheet) — VLM-verified;
  .env.example re-verified (3 keys, unchanged); docs synced (README
  bullet + totals 724/30, AGENTS R32 fact, CLAUDE 11–32 mirror, PAD
  v1.30, SKILL frontmatter + Appendix A/D + final gate + Quick
  Reference, the R32 plan's execution log, session_37.md, this log +
  the root mirror).
- Committed to main; pushed via docs/ssh_git_wrapper_v3.py (--remote
  git@github.com:nordeim/pixel-identifier.git); remote ref verified ==
  local HEAD; operator key shredded.

Stage Summary:
- Round-32 SHIPPED: the blog article footer landed on all 10 article
  pages (runtime byte-identical to the live), the never-diffed blog SSG
  surface is now pinned (5 SSR + 2 e2e), the 17th generation verified
  every standing surface clean, and the footer@375 candidate closed.
- Next (R33): bundle hashes; the article footer joins the standing
  regression loop; remaining never-diffed surfaces — the legal pages'
  runtime DOM, the docs page's copy-button runtime states, the activity
  pagination footer (latent < 50).

---

Task ID: R33
Agent: main (Super Z)
Task: Round-33 — footer-heading + copy-state parity + 18th-generation drift watch

Work Log:
- Fresh clone at e79ebae (workspace reset); environment rebuilt per the
  contract (.env file:../db/custom.db, db/ pushed+seeded, stale-shell
  DATABASE_URL overridden per command). Arrival gates green: lint 0,
  tsc 0, 724 vitest | 2 skipped, build green — exactly the R32 state.
- 18th probe generation: NO redeploy (8th consecutive stable — all
  three bundle hashes unchanged); mobile navs FULL PARITY both surfaces
  both sites (the standing emphasis — dropdown close+icon-reset with
  the 20px D5 scroll delta intact; Sheet 288px/7 links/closes-on-nav,
  the clone's close animation needs a >=4s settle to assert unmount);
  every standing surface verified clean INCLUDING the R32 article
  footer (now in the loop) — wrapper, chart chrome, POPULAR, settings,
  install switcher, toast (driven both sides), Select, 21-route
  console sweep.
- R32-queued candidates closed: legal pages' content byte-count-
  identical on all four pages (chrome identical); activity pagination
  still latent (6 events); TWO drift families found —
  R33-F1: the marketing footer's column chrome (the live ships BARE
  div wrappers + h4 headings; the clone nav/h3 since R7 — the R18 pins
  covered only the wordmark);
  R33-F2: the copy-state gating — re-based MID-ROUND on fresh live
  evidence after the e2e challenged the initial ruling: the live's
  DOCS button swaps UNCONDITIONALLY (proven under a DENIED clipboard;
  the live leaves the rejection uncaught) while its INSTALL button is
  AWAIT-GATED (no swap under denial; 3/3 swap under grant) — the two
  buttons have OPPOSITE gating. The clone had both gated; now matches
  both (docs fire-and-forget+unconditional, install keeps the gated
  shape, silent catch D-class).
- Fix (TDD): 9 SSR pins (tests/footer-r33-parity) + 9 source pins
  (tests/copy-state-r33-parity) + NEW e2e/copy.spec.ts (3 specs — both
  clipboard regimes; the install button located by POSITION, its
  accessible name flips on swap; ~3s island settle gate); runtime
  verified against the live under BOTH regimes on BOTH sites.
- Gates: lint 0 · tsc 0 · 742 vitest | 2 skipped (75 files) · build +
  standalone green · 33/33 e2e chromium TWICE consecutive; 5
  VLM-verified screenshots (docs/screenshots/r33-*); .env.example
  re-verified; docs synced (README/AGENTS/CLAUDE/PAD v1.31/SKILL/
  session_39/worklogs + the R33 plan execution log).
- Committed to main; pushed via docs/ssh_git_wrapper_v3.py (--remote
  git@github.com:nordeim/pixel-identifier.git); remote ref verified ==
  local HEAD; operator key shredded.

Stage Summary:
- Round-33 SHIPPED: the footer tags + both copy-state regimes at live
  parity (18 pins + 3 e2e specs), the never-diffed legal/copy surfaces
  now pinned, the 18th generation clean everywhere else.
- Next (R34): bundle hashes; the footer + copy regimes join the
  standing loop; candidates — intermediate-viewport marketing surfaces
  (compare table mobile stacking, FAQ multi-open persistence), the
  legal pages' in-page anchor navigation, activity pagination (latent
  < 50).
