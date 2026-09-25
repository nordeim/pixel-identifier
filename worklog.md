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
