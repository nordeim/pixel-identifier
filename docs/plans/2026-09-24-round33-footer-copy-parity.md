# Round 33 — Footer-Heading + Copy-State Parity + 18th-Generation Drift Watch

**Date:** 2026-09-24 · **Session:** `docs/session_38.md` (R33 log) · **Status: see Execution log.**

## Context

R32 shipped clean (`92abab7`): the blog article footer at byte parity, the 17th
generation clean everywhere else. `docs/session_38.md` (the prior session's
transcript) was committed afterwards as `e79ebae`. The R33 watch list queued in
`docs/session_37.md`:

1. bundle hashes (a change triggers the full token-diff sweep),
2. the blog article footer joins the standing regression loop (its 5 SSR pins
   + 2 e2e specs),
3. remaining never-diffed surfaces: the **legal pages' runtime DOM**
   (`about`/`docs` were R13-probed but the legal article pages never
   runtime-diffed end-to-end), the **docs page's copy-button runtime
   states**, and the **activity pagination footer (runtime-latent while the
   live stays under 50 events/page)**.

## Verified arrival state (this session, evidence-based)

Fresh `git clone` → `e79ebae` (main, clean, synced with origin). Environment
per the documented contract: `.env` with
`DATABASE_URL="file:../db/custom.db"`, `db/` pushed + seeded at the repo
root (`db:push` → "at file:<repo>/db/custom.db"; seed → demo account +
domain + visitors), no stray parent-dir `db/`. The stale-shell `DATABASE_URL`
quirk re-confirmed (the session shell exports an absolute parent-dir URL on
every command — per-command `env -u DATABASE_URL` override applied
throughout). npm 11.19's install-scripts posture required a verification
that the Prisma client + esbuild binaries were materialized in the fresh
clone (both present). **Arrival gates all green:** lint 0 · tsc 0 · vitest
**724 passed | 2 skipped (73 files, 726 total)** · `next build` green —
exactly the R32 ship state.

## 18th probe generation (dual live+clone sessions)

**No redeploy — all three tracked bundle hashes unchanged (8th consecutive
stable generation):** marketing `index-C3AAh5Je.js` + `bLMWzsGr.css`, app
`index-nhmKaUsm.js`. No token-diff sweep needed.

**Standing surfaces — ALL CLEAN:**

| Surface | Result |
|---|---|
| Mobile navs (standing user emphasis) | **FULL PARITY both surfaces, both sites.** Marketing dropdown @375: toggle `md:hidden text-foreground` + `lucide lucide-menu w-6 h-6`, container `md:hidden bg-background border-b border-border px-6 py-4 flex flex-col gap-4`, 4 links + CTA (→ `/signup` on the clone, the standing mapping), close-on-VISIBLE-link click + icon reset (live Benefits scroll 5307 / clone 5287 — the absolute positions shifted data-side on both, the documented 20 px D5 delta intact). Dashboard Sheet @375: inline `--sidebar-width: 18rem; pointer-events: auto;` → 288 px + 7 links, closes on cross-page nav — both sides (the clone's close animation needs a ≥4 s settle before the unmount assert; a 2 s probe caught the animate-out frame). |
| Tailwind v4 watch | No anomalies (dropdown + Sheet lifecycle, class emission, boundaries all correct). |
| R30 wrapper (dashboard) | `group/sidebar-wrapper flex min-h-svh w-full has-[[data-variant=inset]]:bg-sidebar` — class byte-identical; the inline-style difference is the documented React-SSR vs CSSOM serialization artifact (computed CSS identical). |
| Chart r28 | Tick lines 16, axis-line + tick + text strokes/fill `hsl(220, 9%, 46%)`, slot grid — identical. The middle-label thinning stays the R32-documented data-driven non-finding (live hides Sep 19/21/23, clone 20/22/23; the live's hidden set is data-rolled). |
| POPULAR badge (r26) | Byte-identical (class string + text) on the pricing Growth card, header-row parent. |
| Settings inputs (r30-F2) | Live: 3 bare inputs (empty id/name, no type/autoComplete/maxLength). Clone: bare + the documented D-class id/name wiring. |
| Install switcher (r30-F3/F4) | Live: pure client state (URL stays `/dashboard/install`), newest-first default (`second-test-domain.com`), snippet renders. Clone: clean URL, snippet renders (switcher correctly gated at 1 site). |
| Toast r27 (mutation loop) | No-op settings save driven on BOTH sides: `Settings saved` sonner toast, identical class family, 1 item. |
| Select r29 (filter portal) | All 4 confidence options render the `data-[disabled]:` pair BEFORE the `focus:` pair — byte-identical both sides. |
| Blog article footer (r32, joined the loop) | Live + clone byte-identical on `retargeting-without-cookies`: container `border-t border-border mt-14 pt-8`, byline `text-sm text-muted-foreground mb-4` + `Written by <strong class="text-foreground">Pixelco Team</strong>`, bare anchor (→ `/signup` on the clone), default-variant Button `Start Identifying Visitors →`. (An initial live miss on a hand-typed slug hit the live's "Post Not Found" interstitial — always source slugs from the live blog index.) |
| Console sweep | 21 routes (14 marketing/auth/404 + 7 dashboard), 0 console errors. |

**R33 candidate surfaces (the R32 watch list):**

1. **Legal pages runtime DOM — content FULL PARITY on all 4 pages; the
   probe surfaced TWO drift families in the SHARED MARKETING FOOTER
   (R33-F1 below — it affects every marketing page, not just legal).**
   The legal content itself is byte-count-identical both sides (privacy
   15/14/4 sections/h2/h3 + 6179 text chars; terms 16/16/0 + 4303; gdpr
   12/12/0 + 5854; ccpa 12/12/0 + 5395 — paras/uls/lis all equal), and the
   chrome is identical (back link `text-sm text-primary hover:underline
   mb-6 inline-block`, wrapper `container mx-auto px-6 py-16 max-w-3xl`,
   H1 + "Last updated" meta classes, the `prose prose-sm max-w-none
   space-y-8 text-foreground/90` body, bare `<section>`s, h2/p/ul/li/a
   classes).
2. **Docs copy-button runtime states — ONE drift family found (R33-F2
   below), extending to BOTH copy surfaces** (the marketing docs button +
   the dashboard install Quick Start button).
3. **Activity pagination — still runtime-latent.** The live account renders
   6 events (< the 50/page R22 pin) so the footer cannot appear on either
   side; the R22 source pins stay the contract.

## R33-F1 (MEDIUM): the marketing footer's column headings + wrappers ship the wrong tags

**Live DOM (runtime-captured on `/` and `/privacy`; consistent across the
Product/Company/Legal columns):**

```html
<div><h4 class="text-sm font-semibold text-foreground mb-4 uppercase
  tracking-wider">Product</h4><ul class="space-y-2.5">…</ul></div>
```

— the column wrapper is a BARE `<div>` (no class, no aria-label, NOT a nav
landmark) and the heading is an `<h4>`. The auth pages ship no `<footer>`
on either side (scoped out).

**Clone:** `<nav aria-label="Product">` wrappers + `<h3>` headings
(`src/components/marketing/faq-footer.tsx:186-189`). The heading/wrapper
CLASS strings are byte-identical — only the tags drift. Root cause: the
R18-B8 footer pins captured only the wordmark lockup, and the R32 @375
footer probe compared classes/hrefs/counts — the TAG names were never in
evidence. The R26/R32 lesson again: never-diffed ≠ absent (the bundle
never changed — the tags were always `<h4>`/`<div>` on the live).

## R33-F2 (MEDIUM): the copy buttons' copied-state is gated on clipboard success — the live swaps UNCONDITIONALLY

**Live behavior — proven inside a clipboard-REJECTING headless session**
(`navigator.clipboard.writeText` → `Write permission denied`):

- `/docs` sample button: click → IMMEDIATE icon swap to
  `lucide lucide-check w-4 h-4 text-green-500` (computed
  `rgb(34, 197, 94)`), button class string unchanged, reset to
  `lucide-copy w-4 h-4` between 1 s and 2.6 s (the 2 s window).
- `/dashboard/install` Quick Start button: click → text swap to
  `Copied!` + the uncolored `lucide lucide-check h-3.5 w-3.5 mr-1`.

The swap fires on EVERY click regardless of the clipboard outcome — the
live sets its copied state unconditionally.

**Clone:** `docs-copy-button.tsx` sets `copied` only inside
`navigator.clipboard?.writeText(...).then()`, and
`dashboard/copy-button.tsx`'s `catch` deliberately sets `setCopied(false)`
— in the SAME headless session both buttons stay Copy (no visual
feedback). The failure path is reachable in the real world (clipboard
permissions, insecure contexts, iframe policies) and the live's DOM proves
the intended behavior is unconditional feedback. The aria-labels the clone
adds (`Copy sample pixel code` / `Copy snippet to clipboard`) stay as
D5-class invisible a11y value-adds (the live ships none) — the R22
`ContactSupportButton` / chart-`role=img` precedent.

## Remediation plan (TDD)

| # | Change | Files | Gate |
|---|---|---|---|
| F1-a | **RED**: SSR pin the footer columns — the `<h4 class="text-sm font-semibold text-foreground mb-4 uppercase tracking-wider">` headings (all three titles), the BARE `<div>` column wrappers (no class/aria), and the nav/aria-label/h3 negatives | `tests/footer-r33-parity.test.tsx` (new) | pin runs RED |
| F1-b | **GREEN**: `<nav aria-label={…}>` → bare `<div>`; `<h3>` → `<h4>` (classes untouched — byte-pinned by the new test) | `src/components/marketing/faq-footer.tsx` | pin GREEN |
| F2-a | **RED**: source pins — both copy buttons set the copied state UNCONDITIONALLY on click (no `.then()`/catch gating of the state; the clipboard write is fire-and-forget) | `tests/copy-state-r33-parity.test.tsx` (new) | pin runs RED |
| F2-b | **GREEN**: click → `setCopied(true)` + 2 s reset on every click; `navigator.clipboard?.writeText(...)` attempted fire-and-forget with a swallowed rejection | `src/components/marketing/docs-copy-button.tsx` + `src/components/dashboard/copy-button.tsx` | pins GREEN |
| F2-c | **e2e**: WITHOUT clipboard permissions granted — docs button swaps to the green-check svg + resets after the 2 s window; install button swaps to `Copied!` (closes the runtime coverage gap; Playwright's default no-permission context IS the live's proving ground) | `e2e/copy.spec.ts` (new) | e2e GREEN |
| F3 | Full gates: lint 0 · tsc 0 · vitest 729+ (724 + the new pins) · build + standalone green · e2e 32/32 (30 + 2 new) | — | verify + e2e |

## Non-findings (documented so future rounds don't re-investigate)

- **Chart middle-label thinning** — unchanged from the R32 ruling
  (data-driven; the live's own hidden set rolls with its 14-day window;
  fonts/widths/geometry byte-identical; recharts 2.15.4's `getTicksStart`
  reproduces the clone's output). The R28 config pins + tolerant e2e
  assertions remain the contract.
- **Legal content** — byte-count-identical on all four pages (see the
  candidate table); no content drift exists.
- **Activity pagination footer** — still runtime-latent (6 live events);
  the R22 source pins stay the contract.

## Execution log

**Phase A — detection + TDD for F1 (the footer).**
- F1-a (RED): `tests/footer-r33-parity.test.tsx` — 9 SSR pins (the
  three `<h4>` headings with the live class, the bare-`<div>` wrappers,
  the h3/nav/aria-label negatives). First run: 9/9 failed.
- F1-b (GREEN): `faq-footer.tsx` — `<nav aria-label={…}>` → bare
  `<div>`, `<h3>` → `<h4>` (classes untouched). Pin run: 9/9 GREEN.
- Runtime verification vs the live: clone footer now renders
  `H4:Product | H4:Company | H4:Legal`, navCount 0, bare div wrappers
  (no class, no aria-label) — byte-identical to the live capture; 16
  footer links + 12 lis intact; 0 console errors.

**Phase B — F2 detection re-based mid-round (the round's central
lesson).**
- Initial F2 ruling (from the agent-browser probe session, where the
  clipboard turned out to be ALLOWED on the install surface): "the
  live swaps unconditionally on BOTH buttons." RED pins written for
  both; GREEN shipped both as fire-and-forget.
- The e2e then failed on the install button — and re-probing the LIVE
  inside Playwright's clipboard-DENIED context produced the decisive
  split evidence: the live's DOCS button swaps under denial (uncaught
  writeText rejection — a pageerror) while the live's INSTALL button
  does NOT swap under denial (and swaps under a granted clipboard,
  3/3 loads, ~0.5 s). **The live's two buttons have OPPOSITE
  gating.** The initial "unconditional install" ruling was an artifact
  of the allowed-clipboard probe session.
- Correction shipped: `docs-copy-button.tsx` keeps the unconditional
  fire-and-forget (its `.catch(() => {})` stays D-class console
  hygiene — the live leaves the rejection uncaught); the install
  `copy-button.tsx` was REVERTED to the gated try/await shape (the
  pre-R33 code — its silent catch stays a D-class improvement over
  the live's uncaught rejection, per the R20 "never replicate a live
  defect" ruling). Pins rewritten: the install source pins now pin the
  GATING as the live behavior.

**Phase C — the e2e (three iterations to green).**
- The install spec's first shape failed for three stacked reasons,
  each isolated empirically: (1) an exact-name locator DIES when the
  swap flips the accessible name ('Copy snippet to clipboard' →
  'Copied to clipboard') — a poll reading through it can never
  observe "Copied!" (a /copy/i role locator was then found to resolve
  wrong under DOM order); the button is now located by POSITION (the
  Quick Start card's pre-wrapped affordance). (2) The InstallPanels
  island has a settle window after load — a click inside it fires the
  handler (writeText included) but the state dies with the replaced
  tree; both the live and the clone behave identically once settled
  (verified 3/3 loads each side) — the spec now takes a ~3 s quiet
  settle. (3) Under box memory pressure (dev server + parallel
  browsers), loads can stay dead longer — a bounded reload-retry rides
  past it without masking regressions.
- Final: `e2e/copy.spec.ts` — 3 specs GREEN: the docs swap + green
  check + 2 s reset under a DENIED clipboard; the install swap +
  uncolored check + reset under a GRANTED one; the install NO-swap
  under a DENIED one (the live's gating pinned).

**Phase D — gates + screenshots + docs.**
- Gates: lint 0 · tsc 0 · **vitest 742 passed | 2 skipped (75 files,
  744 total = 724 + 9 footer pins + 9 copy-state pins)** · build green
  (27/27 static) · standalone green · **33/33 e2e chromium, run twice
  consecutively** (30 + the 3 new copy specs).
- 5 captures `docs/screenshots/r33-*` (the remediated footer desktop
  + mobile @375, the docs copy green-check state, the install copy
  "Copied!" state — taken under a granted clipboard via Playwright,
  the privacy page's footer in context); VLM-verified (3 columns +
  wordmark + chips + bottom bar, no breakage; the 2-col @375 grid, no
  horizontal overflow; the green check on the docs button; "Copied!"
  + the check icon on the install button; the legal-page footer
  intact).
- `.env.example` re-verified (3 keys, consistent with `.env` +
  `db-path.ts` + `with-db-url.mjs`; unchanged this round).
- Docs synced: README (R33 bullet + header totals 742/33), AGENTS (R33
  fact), CLAUDE (rounds mirror R33), PAD v1.31 (revision block, §8.1
  totals + e2e row), SKILL.md (frontmatter, §11 counts, Appendix A/D
  rows, the R33 final gate, Quick Reference), this execution log,
  `docs/session_39.md`, `docs/worklog.md` + the root `worklog.md`
  mirror.
- Shipped as a Conventional Commit on main via
  `docs/ssh_git_wrapper_v3.py` (`--remote
  git@github.com:nordeim/pixel-identifier.git`); remote ref verified ==
  local HEAD; operator key shredded after push.
