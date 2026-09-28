# Worklog — pixel-identifier parity project

(Recreated after the session workspace reset — the previous multi-session
log lived in the prior environment. The canonical per-round log lives in
the repo at docs/worklog.md; this file mirrors the latest rounds.)

---
Task ID: R30+R31
Agent: main (Super Z)
Task: Round-30 (sidebar-wrapper + install-switcher parity, interrupted) completed by Round-31 (install-island repair + 16th-generation drift watch)

Work Log:
- R30 (15th probe generation, no redeploy) found four families: the
  missing SidebarProvider wrapper div, clone-authored settings input
  attrs, the URL-driven install selection (?site= leaked), and the
  oldest-first install list — fixed via TDD (23 pins + e2e), but the
  interrupted session's commit 40a7fa8 shipped BROKEN (the island file,
  6 repointed pins, and the sites.ts retirement were never staged).
- R31: fresh clone at 0448ae2; arrival gates red (tsc TS2307, vitest
  706 | 10 failed); island reconstructed verbatim from its committed
  pins + useState newest-default; pins repointed; retirement landed;
  the install e2e fixture rebuilt as a hermetic direct db/e2e.db
  probe-site insert (cleaned beforeAll/afterAll — leaking probes broke
  pipeline's snippet-key host-match + dashboard's seeded-domain assert
  on reused servers, caught by the consecutive-run check).
- Gates: lint 0 · tsc 0 · 719 vitest | 2 skipped (721 total — the exact
  interrupted-session number) · build + standalone green · 28/28 e2e
  chromium across two consecutive runs.
- 16th probe generation: NO redeploy (6th consecutive stable); mobile
  navs FULL PARITY both surfaces both sites (the standing user emphasis
  — dropdown + Sheet, close-on-visible-link/close-on-nav, icon reset,
  live 7424 / clone 7404 D5 delta); TW4 watch clean; the R30 fixes
  runtime byte-verified vs fresh live captures; chart r28
  byte-identical; console sweep 19/0; no new drift.
- 6 VLM-verified screenshots (docs/screenshots/r31-*); .env.example
  re-verified; docs synced for both rounds (README bullets + 719/28
  totals, AGENTS facts, CLAUDE 11–31 mirror, PAD v1.29, SKILL rows +
  final gates, R30 plan execution log, R31 plan, session_35.md,
  docs/worklog.md + this mirror).
- Committed to main; pushed via docs/ssh_git_wrapper_v3.py (--remote
  git@github.com:nordeim/pixel-identifier.git); remote ref verified ==
  local HEAD; operator key shredded.

Stage Summary:
- Rounds 30+31 SHIPPED: main repaired to the R30 design, the e2e net at
  28/28 with a hermetic install fixture, zero live drift in the 16th
  generation, PAD at v1.29.
- Next (R32): bundle hashes; the R30 surfaces join the standing loop;
  candidate surfaces — marketing footer open-state links @375, blog
  SSG DOM runtime-diff, activity pagination footer (latent < 50).

---

Task ID: R32
Agent: main (Super Z)
Task: Round-32 — blog-article-footer parity + 17th-generation drift watch

Work Log:
- 17th probe generation: no redeploy (7th consecutive stable bundle);
  mobile navs FULL PARITY both surfaces both sites; TW4 watch clean;
  every standing surface verified (wrapper, POPULAR, settings, install
  switcher, toast driven both sides, Select r29, console sweep 19/0).
- R31-queued candidates: marketing footer @375 CLOSED (full parity);
  activity pagination still latent; blog SSG pages — ONE drift family
  (R32-F1): the live's article FOOTER (byline "Written by Pixelco
  Team" + bare-anchor default-variant CTA "Start Identifying Visitors
  →", text arrow) missing on all 10 clone article pages since the R13
  audit never captured it.
- Fix (TDD): 5 SSR pins (tests/blog-article-footer-r32-parity) + the
  footer block in blog/[slug]/page.tsx + NEW e2e/blog.spec.ts (2
  specs); runtime byte-verified vs the live; chart label-thinning ruled
  a data-driven non-finding (documented).
- Gates: lint 0 · tsc 0 · 724 vitest | 2 skipped (73 files) · build +
  standalone green · 30/30 e2e chromium; 5 VLM-verified screenshots
  (docs/screenshots/r32-*); .env.example re-verified; docs synced
  (README/AGENTS/CLAUDE/PAD v1.30/SKILL/session_37/worklogs).
- Committed to main; pushed via docs/ssh_git_wrapper_v3.py; remote ref
  verified == local HEAD; operator key shredded.

Stage Summary:
- Round-32 SHIPPED: the blog article footer at byte parity, the SSG
  surface pinned, the 17th generation clean everywhere else.
- Next (R33): bundle hashes; the article footer joins the standing
  loop; legal pages' runtime DOM + docs copy-button states queued.

---

Task ID: R34
Agent: main (Super Z)
Task: Round-34 — 19th-generation drift watch + 404-title re-classification + anchor-divergence docs + six e2e pins

Work Log:
- Fresh clone at 5eb7274; env rebuilt (.env file:../db/custom.db, db/
  pushed+seeded at repo root); arrival gates green (lint 0, tsc 0,
  742 vitest | 2 skipped, build green — the R33 ship state).
- 19th generation: no redeploy (9th consecutive stable); mobile navs
  FULL PARITY both surfaces both sites incl. the 768px md boundary;
  TW4 watch clean; standing surfaces all clean (the R33 footer tags +
  copy regimes in the loop); R33-queued candidates closed (compare
  @375 + FAQ single-open parity, legal anchors resolved, activity
  latent); five never-diffed surfaces at parity (visitors tabs, blog
  index, about, docs, 404).
- Findings (docs + coverage, zero code drift): R34-F1 the live DOES
  swap its 404 title (R24-F12 superseded — clone re-classified as
  live parity); R34-F2 the live's dead bare-hash anchors recorded in
  PAD §11; R34-F3 six new e2e pins (39/39 twice consecutive).
- Docs synced (README/AGENTS/CLAUDE/PAD v1.32/SKILL/session_41/
  worklogs/plan log); 5 VLM-verified screenshots (r34-*); pushed via
  the SSH wrapper; remote ref == local HEAD; key shredded.

Stage Summary:
- Round-34 SHIPPED clean; R35 candidates queued (chart tooltip hover,
  domains delete flow, visitors search debounce, activity pagination).

---

Task ID: R35
Agent: main (Super Z)
Task: Round-35 — 20th-generation drift watch + tooltip/delete-flow/search-debounce/activity-pagination e2e pins

Work Log:
- Fresh clone at 731ede0; env rebuilt (.env file:../db/custom.db, db/
  pushed+seeded at repo root); arrival gates green (lint 0, tsc 0,
  742 vitest | 2 skipped, build green — the R34 ship state). Operator
  lesson re-learned: e2e requires build:standalone (a plain next build
  leaves the standalone tree without static assets — logins fall back
  to native GET; 28/39 red) — after the proper build, 39/39 twice.
- 20th generation: no redeploy (10th consecutive stable); mobile navs
  FULL PARITY both surfaces both sites both breakpoints (375 + 768);
  zero TW4 anomalies; standing surfaces all clean (wrapper, chart
  chrome, POPULAR, settings inputs, toast driven on BOTH sites).
- R34-queued candidates closed at zero code drift: tooltip HOVER
  byte-parity; the live's immediate delete re-verified (the clone's
  AlertDialog stays D-class); the live's search has NO debounce (the
  clone's 350ms URL-driven debounce stays D-class); activity footer
  still latent. New live-defect divergences recorded in PAD §11: the
  unenforced free-plan "1 domain" cap (a 3rd add accepted) + the
  undebounced per-keystroke search.
- Coverage: 5 new e2e pins (tooltip contract; AlertDialog delete +
  cap block; search debounce; activity pagination footer via a
  hermetic 60-event direct-DB fixture) + the pipeline-flake fix (the
  beacon visitor's boot-random identification had made count-pinned
  specs flaky — the probe family now cleans up on both ends).
- Gates: lint 0 · tsc 0 · 742 vitest | 2 skipped · build + standalone
  green · 44/44 e2e × 3 consecutive runs (each a fresh boot + site
  key); 6 VLM-verified screenshots (r35-*); .env.example re-verified;
  docs synced (README/AGENTS/CLAUDE/PAD v1.33/SKILL/session_43/
  worklogs/plan log).
- Committed to main; pushed via docs/ssh_git_wrapper_v3.py; remote ref
  verified == local HEAD; operator key shredded.

Stage Summary:
- Round-35 SHIPPED: the 20th generation clean, every R34 candidate
  closed, 5 new pins + the flake fix, PAD v1.33.
- Next (R36): bundle hashes; the new pins join the standing loop;
  candidates — export CSV download bytes, domains verified-untoggle,
  pricing toggle runtime states, the activity mid-swap spinner.

---

Task ID: R36
Agent: main (Super Z)
Task: Round-36 — 21st-generation drift watch + export-download/pricing-table/spinner e2e pins

Work Log:
- git pull → 44f5a6e; env intact (.env file:../db/custom.db, db/ seeded
  at repo root); arrival gates green (lint 0, tsc 0, 742 vitest |
  2 skipped, build:standalone green) + e2e 44/44 twice.
- 21st generation: no redeploy (11th consecutive stable); mobile navs
  FULL PARITY both surfaces both sites both breakpoints; zero TW4
  anomalies; standing surfaces all clean; every R35-queued candidate
  closed at zero code drift — the export CSV RUNTIME-CAPTURED on the
  live for the first time (byte-identical with the clone), the Verified
  badge ruled a NON-FINDING (no untoggle flow exists), the pricing full
  table at parity both states both sites, the mid-swap spinner
  runtime-verified on the clone (~33 ms RAF window).
- Coverage: NEW e2e/export-download.spec.ts (download event, filename,
  byte contract, Export (1) ids-scoping), the pricing full-table spec
  (both toggle states), the spinner source pin (3 assertions).
- Gates: lint 0 · tsc 0 · 745 vitest | 2 skipped · build + standalone
  green · 46/46 e2e TWICE consecutive; 6 VLM-verified screenshots
  (r36-*); .env.example re-verified; docs synced (README/AGENTS/CLAUDE/
  PAD v1.34/SKILL/session_45/worklogs/plan log).
- Committed to main; pushed via docs/ssh_git_wrapper_v3.py; remote ref
  verified == local HEAD; operator key shredded.

Stage Summary:
- Round-36 SHIPPED: zero code drift, 4 candidate investigations closed
  (1 non-finding), PAD v1.34, 46/46 × 2 consecutive.
- Next (R37): bundle hashes; candidates — the bell panel, the visitors
  sort glyph, the compare @375 states, the usage-progress banner.

---

Task ID: R37
Agent: main (Super Z)
Task: Round-37 — 22nd-generation drift watch + mobile-sheet legacy-generation parity fix

Work Log:
- Fresh clone at 2bb478f (prior env reset); env rebuilt (.env
  file:../db/custom.db, db/ pushed+seeded at repo root — the stale-shell
  DATABASE_URL quirk caught on the first push and handled with per-command
  env -u overrides throughout); arrival gates green (lint 0, tsc 0, 745
  vitest | 2 skipped, build green — the R36 ship state).
- 22nd generation: no redeploy (12th consecutive stable); marketing
  dropdown + 768px boundary FULL PARITY; the dashboard mobile Sheet —
  the standing user-emphasis surface — found drifted in FIVE families
  (R37-F1a..e): the clone's ui/sheet.tsx shipped the NEW shadcn
  generation vs the live's LEGACY one (visible close X, 50% overlay,
  flex flex-col base, new-gen close fragments, data-slot attrs), the
  mobile inner duplicated the desktop rail's full data-sidebar=sidebar
  wrapper vs the live's lean class-only div, and an sr-only H2 title
  the live's dialog does not carry.
- Fixed test-first (RED 9/12 → GREEN 12/12): ui/sheet.tsx rewritten to
  the legacy generation; the topbar consumer tail extended
  (text-sidebar-foreground [&>button]:hidden, no title); SidebarNav's
  mobile prop selects the lean root. Post-fix runtime byte-verification:
  dialog class, close button + svg, overlay class all byte-identical to
  the live; VLM-verified screenshots.
- All four R36-queued candidates closed as non-findings: bell inert
  (no panel), sort glyph decorative (live does not sort), no compare
  surface (404, zero tables), usage card at byte parity (D3 a11y +
  builder-artifact notes). Probe side-effect restored: the live
  operator account's demo-store.example.com domain re-added (Pending)
  after the delete-flow re-verification removed it.
- Gates: lint 0 · tsc 0 · 757 vitest | 2 skipped (76 files) · build +
  standalone green · 48/48 e2e chromium TWICE consecutive (46 + 2 new
  dashboard specs); 6 VLM-verified screenshots (r37-*); .env.example
  re-verified; docs synced (README/AGENTS/CLAUDE/PAD v1.35/SKILL/
  session_46/worklogs + the R37 plan execution log).
- Committed to main; pushed via docs/ssh_git_wrapper_v3.py (--remote
  git@github.com:nordeim/pixel-identifier.git); remote ref verified ==
  local HEAD; operator key shredded after push.

Stage Summary:
- Round-37 SHIPPED: the first code drift since R33 found ON the
  mobile-nav emphasis surface and fixed to byte parity; PAD v1.35;
  757 vitest + 48/48 e2e × 2.
- Next (R38): bundle hashes; the R37 pins join the standing loop; the
  alert-dialog primitive ruled unmatched (the live renders no alert
  dialog); candidates — the pricing plan-intent CTA flow, the
  forgot-password runtime states, the blog card hover states @375.

---
Task ID: R38
Agent: main (Super Z)
Task: Round-38 — 23rd-generation drift watch + auth-flow e2e pins (plan-intent + forgot-password)

Work Log:
- Fresh clone at 4c28dce (prior env reset); env rebuilt (.env
  file:../db/custom.db, db/ pushed+seeded at repo root); arrival gates
  green (lint 0, tsc 0, 757 vitest | 2 skipped, build green — the R37
  ship state); vitest + playwright configs present and green — no
  config modification required.
- 23rd generation: no redeploy (13th consecutive stable); mobile navs
  FULL PARITY both surfaces both sites — the R37 sheet fix verified
  holding byte-for-byte (the overlay class re-captured UN-truncated:
  the clone was byte-identical all along, the R37 probe's 120-char
  slice had hidden the fade tail); ZERO code drift.
- All three R37-queued candidates closed: the live's pricing CTAs
  carry NO plan params (all 4 CTAs plain app.pixelco.io both toggle
  states; the app bundle's only signup reference is a bare /signup) —
  the clone's ?plan=…&cycle=… intent flow re-classified as the
  explicit PAD §11 D-class row (Stripe-replacement family),
  runtime-verified end-to-end; the live's forgot-password renders a
  RUNTIME 404 (the R6-H4 live defect) — the clone's anti-enumeration
  ack re-verified at runtime; the blog card hover states @375 at byte
  parity (anchor + both group-hover consumers) — non-finding.
- Coverage: NEW e2e/auth-flows.spec.ts (5 specs — the pricing CTA
  href matrix both toggle states + the Growth click-through; the
  signup plan-intent flow end-to-end to the sidebar badge GROWTH; the
  forgot-password ack ×2 unknown/known). Dev-server smoke caught 2
  locator issues (Password exact-match, the data-sidebar=footer badge
  scope) — fixed before the formal runs; the smoke accounts cleaned
  from the dev db.
- Gates: lint 0 · tsc 0 · 757 vitest | 2 skipped (unchanged) · build +
  standalone green · 53/53 e2e chromium TWICE consecutive (48 + 5);
  6 VLM-verified screenshots (r38-*); .env.example re-verified; docs
  synced (README/AGENTS/CLAUDE/PAD v1.36/SKILL/session_48/worklogs +
  the R38 plan execution log).
- Committed to main; pushed via docs/ssh_git_wrapper_v3.py (--remote
  git@github.com:nordeim/pixel-identifier.git); remote ref verified ==
  local HEAD; operator key shredded after push.

Stage Summary:
- Round-38 SHIPPED: zero code drift, three candidates closed (two
  documented divergences pinned + one parity non-finding), PAD v1.36
  with the explicit marketing-CTA D-class row, 53/53 e2e × 2.
- Next (R39): bundle hashes; the R38 pins join the standing loop; the
  alert-dialog ruling stands; candidates — the login ?registered=1
  post-signup state, the settings password-change flow, the marketing
  footer social-icon hover states.
