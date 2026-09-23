# Worklog — pixel-identifier parity project

(Recreated after the session workspace reset — the previous multi-session
log lived in the prior environment. The canonical per-round log lives in
the repo at docs/worklog.md; this file mirrors the latest round.)

---
Task ID: R29
Agent: main (Super Z)
Task: Round-29 drift watch + remediation — Select item class-order parity with pixelco.io (continued across a session context reset; probe phase completed in two halves)

Work Log:
- Workspace re-cloned fresh at f13abc1 (docs-only commits after R28's
  bd9a799); full doc chain reviewed + validated against the codebase;
  environment rebuilt (.env with DATABASE_URL="file:../db/custom.db",
  db/ pushed + seeded, stale-shell env quirk re-unified via symlink).
- Arrival gates green (lint 0 · tsc 0 · 693 vitest — the R28 baseline).
- 14th probe generation: NO redeploy (all three bundle hashes unchanged);
  mobile navs both sites/surfaces parity (one clone false alarm traced to
  dev-compile latency); chart r28 byte-identical; toast byte-identical;
  POPULAR badge; NTW negative branch; install copy swap; topbar/visitors;
  route console sweep clean. R28 candidates closed: tooltip CONTENT
  confirmed stable (byte-identical both sides); activity pagination footer
  runtime-latent on the live (7 events < 50/page R22 pin).
- NEW probe surface (Radix Select OPEN-state portal): R29-F1 — the live
  renders the SelectItem class attribute with the data-[disabled]: pair
  BEFORE the focus: pair (bundle flip in the R11→R16 window); the clone
  shipped the R11-era legacy order. Pure DOM-byte parity (rendered CSS
  identical). Trigger/chevron/viewport/indicator byte-identical pre-fix.
- TDD: RED tests/select-r29-parity.test.tsx (7 pins, 2 failing) + NEW
  e2e/select.spec.ts (3 specs, 2 failing pre-fix) → GREEN one-string
  reorder in ui/select.tsx SelectItem.
- Static-render probe finding: renderToStaticMarkup does NOT render Radix
  portal items — the runtime pin must live in e2e.
- Runtime byte-verify vs the live: all 4 option class attributes identical
  (order-sensitive), trigger (incl. w-44) + viewport + indicator identical;
  residuals = D4 lucide svg aria-hidden + radix ids only.
- Gates: lint 0 · tsc 0 · 700 vitest / 70 files (2 skipped) · build +
  standalone green (one transient worker-spawn failure, clean on retry) ·
  24/24 e2e chromium (38.2 s).
- 4 VLM-verified screenshots (docs/screenshots/r29-*).
- .env.example re-verified (3 keys, consistent).
- Docs: README R29 bullet, AGENTS R29 fact, CLAUDE 11–29 mirror, PAD v1.28,
  SKILL.md R29 rows, plan + execution log, session_32.md, repo worklog.
- Committed 282db18 to main; pushed via docs/ssh_git_wrapper_v3.py (paramiko
  shim at /home/z/my-project/bin/ssh, python3.13; NOTE: the wrapper's
  DEFAULT_REMOTE is task-management — always pass --remote
  git@github.com:nordeim/pixel-identifier.git); remote ref verified ==
  local HEAD; operator key shredded.

Stage Summary:
- Round-29 SHIPPED at 282db18: one drift family fixed (Select item class
  order), +7 vitest / +3 e2e pins, runtime byte-verified vs the live;
  everything else at parity (tooltip content now confirmed-stable).
- Next (R30): bundle hashes (a change triggers the full token-diff sweep);
  Select open-state joins the standing regression loop (r29 e2e);
  DomainSwitcher open-state runtime byte-diff candidate; settings-tab
  panels candidate.
