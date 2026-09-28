# Session 52 — R40: 25th-Generation Drift Watch + Hover-Net E2E Extension

**Date:** 2026-09-28 · **Repo at arrival:** `cf36778` (main, clean, synced
with origin — `git pull` fast-forwarded `daf5765..cf36778`, the session_51
log) · **Repo at close:** see the final commit (main, pushed via the SSH
wrapper).

## Arrival assessment (evidence-based)

Pulled to `cf36778`; the five root docs (AGENTS, CLAUDE, README, PAD v1.37,
SKILL), `docs/session_50.md`, the canonical `docs/worklog.md`, the R39
plan, and `docs/session_51.md` reviewed; understanding cross-validated
against the tree (skills/ excluded from checking/testing/compilation).
Environment intact from the prior session (`.env` with
`DATABASE_URL="file:../db/custom.db"`, `db/` at the repo root with the
seeded demo account, node_modules installed); the stale-shell
`DATABASE_URL` quirk re-confirmed (per-command `env -u DATABASE_URL`
throughout). **Arrival gates all green:** lint 0 · tsc 0 · vitest
**765 passed | 2 skipped (78 files)** · `next build` green · the compiled
CSS chunk 82,038 bytes with ZERO `@media (hover:hover)` guards — the exact
R39 ship state. The vitest + playwright config files are present and
green at arrival — no config modification required this round.

## Phase A — 25th probe generation (dual live+clone sessions)

**No redeploy — all four tracked bundle hashes unchanged (15th consecutive
stable generation):** marketing `index-C3AAh5Je.js` + `index-bLMWzsGr.css`,
app `index-nhmKaUsm.js` + `index-MN2Yr0JK.css`. Logged into the live app
with the operator-supplied credentials.

**Mobile navs (the standing user emphasis): FULL PARITY both surfaces both
sites** — the marketing dropdown @375 (toggle + container classes, 5 links,
close-on-visible-link-click, icon reset, scroll live 5307 / clone 5287),
the dashboard Sheet @375 (dialog class, un-truncated overlay, hidden close
X, lean inner root, 7 links, close-on-nav — byte-identical), and the 768 px
boundary (rail `block` at 768 both sides; the live CSR-unmounts at 767
where the clone CSS-hides — the documented D-class). Console sweep clean:
the only entries are the two Radix titleless-Sheet a11y warnings, which
the LIVE emits too when its own Sheet opens (verified) — the R37 artifact,
not drift.

**R39-queued candidates — all closed at ZERO code drift:**

1. **Claim Now hover** — PARITY both sides: opacity `1 → 0.8` (the
   `hover:opacity-80` family; sampled after the transition settle); the
   dismiss X `1 → 0.7`.
2. **Topbar bell/trigger hovers** — PARITY both sides: the ghost
   variant's `hover:bg-accent` flips the bg `rgba(0,0,0,0) → rgb(43,
   212, 189)` (the teal data accent), sampled after the settle.
3. **The 4th-spec candidate (`data-[state=open]:hover:*`)** — NON-FINDING,
   structurally latent: `data-state` is null on all 7 sidebar menu buttons
   on BOTH sides (no submenu exists); the composed rules compile
   UNGUARDED in the clone's chunk (verified) but no runtime surface
   exists to pin (the R36 sort-glyph precedent).
4. **Extended sweep (never-probed surfaces)** — PARITY: the sign-out
   `hover:text-foreground` flips `rgb(107, 114, 128) → rgb(19, 21, 32)`;
   the Export gradient `hover:opacity-90` flips `1 → 0.9` (both after
   settle) — both sides.

## Phase B — the pins + the round's key discovery (TDD)

The 4 new behavioral specs (Claim Now, bell, Export, sign-out) written in
the house style. **The G2 RED validation surfaced the discovery:** with
the two `@custom-variant` overrides temporarily removed, the re-guarded
build PASSED all 7 behavioral hover specs — **Playwright 1.63's chromium
is a hover-capable engine** (`matchMedia('(hover: hover)') === true`,
verified via a capability probe; agent-browser's engine reports false and
showed the same guarded build's utilities dead). Reconstructing the TRUE
R39 pre-fix state (no overrides AND no `source("../")` anchor) reproduced
the R39 record (5 guards, 175,857-byte chunk, 3 specs RED) — but the
failure values (the footer anchor at default link blue
`rgb(0, 0, 238)` — `text-muted-foreground` lost) prove the R39 "RED
pre-fix" was driven by the unanchored source scan's utility corruption,
not by the guard in the Playwright engine.

**The fix for the coverage gap: the 5th spec — the CSS-byte guard
contract** (fetch the served stylesheets; assert ZERO
`@media (hover:hover)` blocks + the six plain `:hover` /
`:is(:where(.group):hover *)` selector forms). TDD validated: RED against
the re-guarded build ("Expected length: 0, Received length: 4") → GREEN
on the restored ship build (all 8 hover specs). Also documented from the
lib source: TW 4.3.3's built-in hover variant IS guarded
(`@media (hover: hover) { &:hover }` — dist/lib.mjs) — both `@custom-variant`
overrides are operative. Ops lesson: a leftover server on :3100 +
`reuseExistingServer: true` serves a stale mixed build (all 8 specs failed
spuriously once) — kill the port before diagnosing.

## Phase C — gates, screenshots, docs

**Gates: lint 0 · tsc 0 · vitest 765 passed | 2 skipped (78 files)**
(unchanged) · build + standalone green · the compiled CSS keeps
**82,038 bytes / 0 guards / 51 hover selectors** · **61/61 e2e chromium
TWICE consecutive** (56 + 5). 6 captures `docs/screenshots/r40-*` (the
bell, sign-out, and mobile-dropdown captures VLM-verified YES; the Claim
Now + Export opacity hovers verified by computed-state-at-capture +
pixel-diff — 469 changed pixels / 90.9 % region dim — the 20 %/10 %
text dimmings are below the VLM's perception floor, honestly recorded).
`.env.example` re-verified (3 keys, unchanged). Full doc sync: PAD v1.38,
README (R40 bullet + 61 totals), AGENTS (the R40 fact block), CLAUDE
(rounds mirror), SKILL.md (Appendix A/D + Pre-Ship 61/61 + the R40
final-gate block), the plan's execution log, this session log,
`docs/worklog.md` + the root `worklog.md` mirror.

## Phase D — ship

Full verify gate green on the working tree; the change set staged and
gated before commit (the R31 lesson); committed to main; pushed via
`docs/ssh_git_wrapper_v3.py --remote git@github.com:nordeim/pixel-identifier.git`;
remote ref verified == local HEAD; operator key shredded after push.

## Next (R41 candidates)

Bundle hashes (a change triggers the full token-diff sweep); the R40 pins
join the standing regression loop; the hover net now covers 4 families ×
both bundles + the CSS-byte guard contract — remaining candidates: the
docs copy-button hover family, the pricing card CTA hovers, and the
auth-page OAuth button hover states (all now unguarded — runtime-verify
against the live before pinning); the activity pagination footer stays
runtime-latent on the live.
