# Round 32 — Blog-Article-Footer Parity + 17th-Generation Drift Watch

**Date:** 2026-09-24 · **Session:** `docs/session_37.md` (R32 log) · **Status: see Execution log.**

## Context

R31 shipped clean (`3f16e31`): main repaired to the R30 design, 28/28 e2e with
the hermetic install fixture, the 16th probe generation clean. Session_36.md
(the prior session's transcript) was committed afterwards as `af865b6`. The
R32 watch list queued in `docs/session_35.md`:

1. bundle hashes (a change triggers the full token-diff sweep),
2. the R30 surfaces join the standing regression loop,
3. remaining candidate surfaces: the **marketing footer's open-state links
   at 375 px**, the **blog SSG pages' DOM (never runtime-diffed)**, and the
   **activity pagination footer (runtime-latent while the live stays under
   50 events/page)**.

## Verified arrival state (this session, evidence-based)

Fresh `git pull` → `af865b6` (main, clean, synced with origin; the pull added
only `docs/session_36.md`). Environment per the documented contract:
`.env` with `DATABASE_URL="file:../db/custom.db"`, `db/` pushed + seeded at
the repo root (no stray parent-dir `db/`). The two R31 sandbox quirks
re-confirmed: the shell re-injects the stale absolute `DATABASE_URL` on every
command (per-command override applied), and agent-browser 0.38.1 + the live/
clone probe profiles were intact. **Arrival gates all green:** lint 0 ·
tsc 0 · vitest **719 passed | 2 skipped (72 files, 721 total)** · `next
build` green — exactly the R31 ship state.

## 17th probe generation (dual live+clone sessions)

**No redeploy — all three tracked bundle hashes unchanged (7th consecutive
stable generation):** marketing `index-C3AAh5Je.js` + `bLMWzsGr.css`, app
`index-nhmKaUsm.js`. No token-diff sweep needed.

**Standing surfaces — ALL CLEAN:**

| Surface | Result |
|---|---|
| Mobile navs (standing user emphasis) | **FULL PARITY both surfaces, both sites.** Marketing dropdown @375: toggle `md:hidden text-foreground` + `lucide lucide-menu w-6 h-6`, container `md:hidden bg-background border-b border-border px-6 py-4 flex flex-col gap-4`, 4 links + CTA, close-on-VISIBLE-link click + icon reset, live scroll 7424 / clone 7404 (the documented 20 px D5 delta). Dashboard Sheet @375: inline `--sidebar-width: 18rem; pointer-events: auto;` → 288 px + 7 links, closes on cross-page nav — both sides. |
| Tailwind v4 watch | No anomalies (dropdown + Sheet lifecycle, class emission, boundaries all correct). |
| R30 wrapper (dashboard) | `group/sidebar-wrapper flex min-h-svh w-full has-[[data-variant=inset]]:bg-sidebar` + the 16rem/3rem inline vars — class attribute byte-identical; the style attribute differs only in React-SSR vs CSSOM whitespace serialization (computed CSS identical; the R30 pin's whitespace-tolerant regex is the documented form). |
| Chart r28 | Axis/tick-line/axis-line geometry + strokes `hsl(220, 9%, 46%)`, tick-text fill, Y domain 0–4, tick counts, slot grid 65→590 — identical. See the label-thinning non-finding below. |
| POPULAR badge (r26) | Byte-identical (class string + text) on the pricing Growth card. |
| Settings inputs (r30-F2) | Live: bare inputs (empty id/name, no type/autoComplete/maxLength). Clone: bare + the documented D-class id/name/for. |
| Install switcher (r30-F3/F4) | Live: pure client state (URL stays `/dashboard/install`), newest-first default (`second-test-domain.com` selected), snippet renders. Clone: clean URL, snippet renders (switcher correctly gated at 1 site). |
| Toast r27 (mutation loop) | No-op settings save driven on BOTH sides: `Settings saved` sonner toast, identical class family, 1 item. |
| Select r29 (filter portal) | All 4 confidence options render the `data-[disabled]:` pair BEFORE the `focus:` pair — byte-identical both sides. |
| Console sweep | 19 routes, 0 page errors, 0 console errors. |

**R32 candidate surfaces (the R31 watch list):**

1. **Marketing footer @375 — CLOSED, full parity.** 3 columns
   (Product/Company/Legal, identical heading classes), 16 links with
   identical classes + hrefs (modulo the documented `#`→`/#` single-deployment
   mapping + D5 `focus-brand`), social icon chips, "Pixelco By Ai Viral"
   wordmark; the Documentation link navigates to `/docs` on both sides.
2. **Blog SSG pages — ONE drift family found (R32-F1, below).** The blog
   INDEX is full parity (H1 bytes, 3-col grid, 10 cards, first-card class +
   excerpt identical); the ARTICLE pages are missing the live's article
   footer block.
3. **Activity pagination — still runtime-latent.** The live account renders
   ~6 events (< the 50/page R22 pin) so the footer cannot appear on either
   side; the R22 source pins stay the contract.

## R32-F1 (MEDIUM): the blog article footer is missing on all 10 article pages

**Live DOM (runtime-captured, consistent across 5 of 10 articles probed):**
after the prose body (`div.prose.prose-sm.max-w-none…`, the 4th child of the
article's inner div) the live renders a 4th block —

```html
<div class="border-t border-border mt-14 pt-8">
  <p class="text-sm text-muted-foreground mb-4">
    Written by <strong class="text-foreground">Pixelco Team</strong>
  </p>
  <a href="https://app.pixelco.io">
    <button class="inline-flex … ring-offset-background … [&_svg]:size-4
      [&_svg]:shrink-0 bg-primary text-primary-foreground hover:bg-primary/90
      h-10 px-4 py-2">Start Identifying Visitors →</button>
  </a>
</div>
```

— the legacy-Button base + DEFAULT variant + default size (no consumer
tail), the arrow a TEXT character (U+2192, matching the sub-page ←
convention), the anchor BARE (no class), byline author constant
("Pixelco Team") on every article probed.

**Clone:** the article page ends at `<ArticleBody />` — no footer block, no
byline, no CTA. Root cause: the R13 audit's per-article capture
(`research/round13-audit/content/meta-*.json`) recorded only breadcrumb /
category / date / readTime / h1 — the footer was never in evidence, so the
R13 rebuild could not reproduce it. The bundle hash never changed since
(7 stable generations), so the footer was in the live's bundle all along —
the R26 lesson again: a never-diffed surface is not an absent surface. The
R13 "drops the trailing 'Try Pixelco free' CTA" pin is UNAFFECTED (that pin
is about a different string the live never ships anywhere).

## Remediation plan (TDD)

| # | Change | Files | Gate |
|---|---|---|---|
| F1-a | **RED**: SSR pin the article footer — the `border-t border-border mt-14 pt-8` container, the byline `p.text-sm.text-muted-foreground.mb-4` with `Written by ` + `strong.text-foreground` (author "Pixelco Team"), the bare anchor to `/signup` (the standing app.pixelco.io→/signup CTA mapping) wrapping the default-variant Button `Start Identifying Visitors →` with the text arrow | `tests/blog-article-footer-r32-parity.test.tsx` (new) | pin runs RED |
| F1-b | **GREEN**: append the footer block after `ArticleBody` in the article page (Link, bare; Button, default variant/size, no overrides — the faq-footer house pattern) | `src/app/(marketing)/blog/[slug]/page.tsx` | pin GREEN |
| F1-c | **e2e**: assert the footer on a real article page (byline text + CTA click → `/signup`) — closes the runtime coverage gap that let the drift survive 19 rounds | `e2e/blog.spec.ts` (new) | e2e GREEN |
| F1-d | Full gates: lint 0 · tsc 0 · vitest 722+ (719 + the new pins) | — | verify + e2e |

## Non-findings (documented so future rounds don't re-investigate)

**Chart middle-label thinning (data-driven).** At the current data shape the
live's visible date set is `Sep 11–18, 20, 22, 24` (hides 19/21/23) while
the clone's is `Sep 11–19, 21, 24` (hides 20/22/23). Evidence this is NOT a
config drift: (a) the live's own hidden set changed since R31 (it hid
Sep 20+22 then) with NO bundle change — its 14-day window rolled as days
passed, proving data dependence; (b) fonts, measured label widths (identical
per-label: "Sep 11"=32.25 … "Sep 24"=36.94), tick-line/axis-line geometry,
strokes, tick counts, slot grid, and Y domain are byte-identical; (c) the
recharts 2.15.4 `getTicksStart(preserveEnd)` algorithm reproduces the
clone's exact output from those inputs; (d) the divergence hinges on
sub-pixel accumulation (the deciding slots fit/miss by 0.005–0.8 px) inside
the live's embedded recharts build. Same class as the R28-documented 36 px
mobile chart-width delta: a data-driven delta on a surface both sides ship
identically. The R28 config pins + the tolerant e2e assertions (tick-line
count ≥ 10, not an exact label set) remain the contract.

## Execution log

**Phase A — R32-F1 fix (TDD).**
- F1-a (RED): `tests/blog-article-footer-r32-parity.test.tsx` — 5 SSR
  pins (the footer container after the prose, the byline paragraph with
  the `strong.text-foreground` author, the bare `/signup` anchor + the
  no-app.pixelco.io negative, the default-variant Button string with the
  U+2192 text arrow, and the all-ten-slugs loop). First run: 4 failed |
  1 passed (the `/signup`-anchor pin passed trivially — the header CTA
  already renders one; the negative + the footer-scoped pins carry the
  spec).
- F1-b (GREEN): appended the footer block to
  `src/app/(marketing)/blog/[slug]/page.tsx` (Link bare + Button default
  variant/size, the faq-footer house pattern). Pin run: 5/5 GREEN.
- Runtime verification vs the live capture: container/byline/CTA byte-
  identical (`border-t border-border mt-14 pt-8` · `text-sm
  text-muted-foreground mb-4` + `Written by <strong
  class="text-foreground">Pixelco Team</strong>` · bare anchor →
  `/signup` · the default-variant button `Start Identifying Visitors →`),
  positioned after the prose body exactly like the live; the CTA click
  navigates to `/signup`.
- F1-c: `e2e/blog.spec.ts` — 2 specs (footer visible + geometry after
  the prose; CTA class family + bare anchor + click → `/signup`). First
  run failed on the bare-anchor assertion (`class=""` vs the absent
  attribute — Playwright serializes null ≠ '') — fixed to
  `not.toHaveAttribute('class', /.*/)`; the anchor is truly attribute-
  absent, like the live's.
- F1-d gates: lint 0 · tsc 0 · **vitest 724 passed | 2 skipped (73
  files, 726 total = 719 + 5)** · `next build` green (27/27 static) ·
  standalone green · **30/30 e2e chromium** (28 + the 2 new blog specs,
  49.6 s).

**Phase B — screenshots + VLM.**
- 5 captures in `docs/screenshots/r32-*`: the remediated article footer
  (desktop 1280 + mobile 375), the marketing mobile dropdown @375, the
  dashboard overview, the dashboard mobile Sheet @375 — all on the dev
  server running the remediated tree.
- VLM-verified: the footer shot (divider + byline + amber CTA with
  arrow, no layout breakage), the mobile footer shot (no horizontal
  overflow at 375), and the dropdown + Sheet shots (4 links + CTA; 7
  links). All pass.

**Phase C — docs + ship.**
- `.env.example` re-verified (3 keys, consistent with `.env` +
  `db-path.ts` + `with-db-url.mjs`; unchanged this round).
- Docs synced: README (R32 bullet + header totals 724/30), AGENTS (R32
  fact), CLAUDE (rounds 11–32 mirror), PAD v1.30 (revision block, §8.1
  totals, e2e row), SKILL.md (Appendix A/D rows, final gates, Quick
  Reference counts), this execution log, `docs/session_37.md`,
  `docs/worklog.md` + the root `worklog.md` mirror.
- Shipped as a Conventional Commit on main via
  `docs/ssh_git_wrapper_v3.py` (`--remote
  git@github.com:nordeim/pixel-identifier.git`); remote ref verified ==
  local HEAD; operator key shredded after push.
