# Round-13 Remediation Plan — Sub-page parity & FAQ precision

**Date:** 2026-09-17 · **Repo state at plan time:** main @ 7430210 (PAD v1.11,
308 tests / 43 files) · **Audit evidence:** `research/round13-audit/`

## Context

Round-13 audited the surfaces no prior round had diffed: the marketing
sub-pages (about, blog index, 10 blog posts, docs, 4 legal pages), mobile
375px behavior, and a desktop drift re-check of the R12 pins.

**Audit verdicts:** mobile = EXACT on all three spot-checks (the live is a
fixed 1280px layout at every viewport — the clone matches that behavior;
landing sections byte-identical heights except one). Dashboards and landing
hold at R12 parity. **All remaining gaps live on the sub-pages** — the
content and chrome that earlier rounds built from scratch were never
pairwise-diffed against the live until now.

## Findings (all DOM-verified, evidence in round13-audit/)

| ID | Sev | Finding | Evidence |
|---|---|---|---|
| R13-F1 | Med | FAQ accordion primitive is the NEW shadcn generation (`data-slot` attrs, focus-visible ring suite, `items-start gap-4`, `size-4` chevron, content missing `transition-all`) while the live ships LEGACY. Item carries `last:border-b-0` → last item 53px vs 54 → FAQ section 755 vs 756. Wrapper `mt-10 space-y-2.5` vs live classless wrapper | dom/ faq walk; live item `bg-background border border-border rounded-lg px-5 data-[state=open]:shadow-card`, trigger `flex flex-1 items-center justify-between transition-all [&[data-state=open]>svg]:rotate-180 text-left font-semibold text-sm text-foreground hover:no-underline py-4`, chevron `h-4 w-4 shrink-0 transition-transform duration-200`, content outer `overflow-hidden text-sm transition-all data-[state=closed]:… data-[state=open]:…`, inner `pt-0` + consumer |
| R13-F2 | High | All 7 FAQ **answers** differ from the live copy (questions match). Live answer 1: "Pixelco uses a proprietary matching engine that cross-references anonymized visitor signals…"; answer 5 uses ASCII hyphens `15-25%`, `1 in 4-7` | content/faq-answers.json |
| R13-F3 | High | The announcement bar ("🚀 Launch Offer — …") renders on ALL marketing pages in the clone; the live shows it **only on `/`** — sub-pages start directly with the sticky nav | banner probe: live `/`=YES, `/about`,`/blog`,`/docs`,`/privacy`=no; local all YES |
| R13-F4 | High | About page: H1 uses a yellow-box highlight (`bg-primary px-2`) vs live's `text-gradient-hero` span; back-link is SVG-arrow amber vs live `← Back to Home` (`text-sm text-primary hover:underline mb-6 inline-block`); section rhythm `mt-16` vs `mb-16`; value cards `bg-card` icon-chip style vs live `border border-border rounded-xl p-6` + inline svg + h3/p; stats band, team row and CTA all differ | dom/about-*.txt, content/page-about.json |
| R13-F5 | High | Docs page: different card grid (`border rounded-xl p-6`, 4 numbered steps), missing the live's Example Pixel Code section (yellow warning box + dark code block + copy button), platform instructions and common-questions sections differ | dom/docs-*.txt, content/page-docs.json |
| R13-F6 | High | Blog index: header `text-4xl md:text-5xl font-bold mb-4` in `text-center mb-14`; grid `grid gap-8 md:grid-cols-2 lg:grid-cols-3`; cards are `A.group.block.h-full.rounded-xl border border-border bg-card p-6 hover:border-primary/40 hover:shadow-lg transition-all duration-300` with tag-icon chip + clock-icon read time, `group-hover:text-primary` H2, `time` + "Read →" row — clone ships bordered flex cards with amber chips | content/blog-index-meta.json |
| R13-F7 | Crit | Blog **article pages**: no breadcrumb (live: `nav.mb-4 > ol.flex.items-center.gap-1.5.text-xs` Home / Blog / truncated title); metadata row differs (live: plain chip `text-xs font-medium text-primary bg-primary/10 px-2.5 py-1 rounded-full` + full date + "N min read", NO icons); H1 `text-3xl md:text-4xl font-bold mb-6 leading-tight`; body is `prose prose-sm max-w-none text-muted-foreground leading-relaxed space-y-4` with arbitrary-variant h2/h3/ul/a styling. **All 10 posts' article copy differs from the live** (different text, different headings) | dom/blogpost-*.txt, content/post-*.json, meta-*.json |
| R13-F8 | Crit | Legal pages: container `max-w-3xl` (about/docs are `max-w-4xl`); live copy mentions operator **"Aiviral"** and ships real legal provisions ("Last updated: April 14, 2026", sections, H3 subsections, `list-disc pl-5` lists) — clone's text is a paraphrase with different section sets | content/page-{privacy,terms,gdpr,ccpa}.json |
| R13-F9 | Low | Blog date rendering "Sep 10, 2026" vs live "September 10, 2026" (full month) | meta-*.json |

Non-findings (verified, no action): mobile 375px = fixed 1280px on both
sides (landing full EXACT 0.98, dashboards EXACT 1.0); header brand markup
(logo + "By Ai Viral" spans) matches; live `/login` on the marketing domain
is a 404 while the clone serves the app-bundle login — single-deployment
equivalence, not a defect (PAD route-group convention).

## Workstreams

### A — FAQ precision (F1, F2)
- **A1 (RED):** pin the accordion item/trigger/content/chevron rendered
  class strings and the 7 live answers in the FAQ test.
- **A2 (GREEN):** rewrite `src/components/ui/accordion.tsx` to the live's
  legacy generation (no data-slot; item base `border-b`; trigger base
  `flex flex-1 items-center justify-between transition-all [&[data-state=open]>svg]:rotate-180 hover:underline` + ChevronDownIcon
  `h-4 w- shrink-0 transition-transform duration-200`; content outer gains
  `transition-all`, inner `pt-0` base). Fix `faq-footer.tsx` consumer:
  item `bg-background border border-border rounded-lg px-5 data-[state=open]:shadow-card`,
  trigger `text-left font-semibold text-sm text-foreground hover:no-underline py-4`,
  content `text-sm text-muted-foreground pb-4 leading-relaxed`, wrapper
  classless (reveal attrs stay). Replace the 7 answers with the live copy.

### B — Banner scoping (F3)
- **B1 (RED):** banner visible on `/`, absent on `/about|/blog|/docs|legal`.
- **B2 (GREEN):** move `<AnnouncementBar />` from the `(marketing)` layout
  into the landing page (`(marketing)/page.tsx`) only.

### C — About & docs rebuild (F4, F5)
- **C1 (RED):** pin about/docs structure (back-link class+text, H1 gradient
  span, section classes, stats band values, card grid, CTA).
- **C2 (GREEN):** rebuild both pages on the live's exact structure from
  `content/page-{about,docs}.json` (container `max-w-4xl`, `← Back to Home`
  link to `/`, live headings/cards/code block).

### D — Blog parity (F6, F7, F9)
- **D1 (RED):** pin index header/grid/card classes; post breadcrumb,
  metadata row, H1, prose classes; date full-month format.
- **D2 (GREEN):** rebuild `blog/page.tsx` cards; rebuild
  `blog/[slug]/page.tsx` (breadcrumb, plain metadata row, live H1, prose
  wrapper with arbitrary variants). Extend `ArticleBody` with `## `/`### `
  headings rendered to the live's h2/h3 style; drop the trailing
  "Try Pixelco free" CTA paragraph (the live has none); date format via
  `Intl.DateTimeFormat('en-US', { month: 'long' })`.
- **D3 (content):** port all 10 posts' live copy into `blog-posts.ts` via a
  converter script (extracted innerHTML → the repo's markdown-ish format).
  Keep titles/slugs/excerpts/readMinutes (already live-equal); align dates.

### E — Legal pages (F8)
- **E1 (RED):** pin the 4 pages' updated-date line, Aiviral mention,
  section count/first headings.
- **E2 (GREEN):** shared `legal-page.tsx` render with the live's prose
  classes + content from a new `src/data/legal-pages.ts` (same
  markdown-ish format + `## `/`### ` support), ported from the extracts.

### F — Verification, docs, ship
- `npm run verify` green; fresh-server browser pass re-diffing the FAQ
  1px, banner scoping, sub-page chrome; VLM re-diffs of the 8 sub-page
  pairs (expect banner+chrome+copy residuals closed).
- PAD v1.12, README counts, AGENTS.md/CLAUDE.md facts (banner scoping,
  accordion legacy, sub-page chrome pattern, blog/legal content parity,
  content-port provenance), plan execution log, worklog.
- Atomic commits on main; push via the SSH wrapper.

## Risks & notes
- The accordion is a shared primitive but has exactly ONE consumer
  (faq-footer.tsx) — verified; the rewrite is safe.
- The content port is generator-driven (Python, scripts/); template-literal
  escaping for backticks/`${` verified by compiling the generated TS.
- Banner move must not break the landing's pinned SSR (the bar stays in the
  same DOM position on `/` — only the mounting point moves).
- The live's about-page CTA links to `https://app.pixelco.io` (target
  `_blank`); the clone links `/signup` internally — keep the clone's
  internal-link convention (single deployment) but mirror classes/labels.
- Blog/legal copy ports change rendered text: existing tests that pin
  paraphrased copy must be updated to the live copy (they pin clones of
  text that was never live-accurate).

## Execution Log (completed 2026-09-17)

- **A (FAQ precision)** — RED `tests/marketing-faq-accordion.test.tsx`
  (16 failing) → GREEN: `ui/accordion.tsx` rewritten to the live legacy
  generation (no data-slot; item base `border-b` merging against the
  consumer's `border`; trigger base `flex flex-1 items-center
  justify-between transition-all [&[data-state=open]>svg]:rotate-180
  hover:underline`; chevron `h-4 w-4 shrink-0 transition-transform
  duration-200`; content outer gains `transition-all`, inner `pt-0`
  base); `faq-footer.tsx` consumer reordered to the live strings and the
  wrapper made classless (reveal attrs only); all 7 answers replaced
  with the live copy (exported `FAQS` — Radix does not SSR closed
  content, so the copy is pinned against the data, the inner-div string
  against an open item's markup). FAQ section now 756 px live-exact
  (was 755); last item 54 px (was 53).
- **B (banner scoping)** — RED `tests/marketing-banner-scope.test.tsx`
  (4 failing) → GREEN: chrome extracted into
  `src/components/marketing/marketing-frame.tsx`; the landing moved to
  the new `(landing)` route group (`showBanner`), sub-pages keep
  `(marketing)` (no bar). The reveal/theme layout reads redirected to
  the frame file. Browser-verified: banner YES on `/`, NO on all 7
  sub-pages.
- **C (about + docs)** — RED `tests/marketing-subpages.test.tsx`
  (14 failing) → GREEN: both pages rebuilt on the extracted live DOM
  (gradient-span H1, mb-16 rhythm, border+shadow cards, stats band,
  hiring note; docs numbered cards, ⚠️ warning box, SAMPLE-badged code
  block + `DocsCopyButton` client island, 6 platform cards, 3 Q&A
  cards, Contact Support CTA).
- **D (blog)** — RED `tests/marketing-blog-parity.test.tsx` (23
  failing) → GREEN: index rebuilt (A.group cards, tag/clock chips,
  Read → row, `max-w-5xl` container — the container width was found by
  DOM measurement after the first VLM pass: live cards 304 px vs clone
  389 px); article page rebuilt (breadcrumb, text-only metadata row,
  live H1, prose wrapper with arbitrary variants); `ArticleBody` gained
  `## `/`### ` support, a `legal` variant, bare-string inline runs (no
  span wrappers), live-exact table classes, and lost the trailing
  "Try Pixelco free" CTA; `formatDateLong` added (dashboard keeps short
  dates); all 10 posts regenerated from the live copy by
  `scripts/r13-convert-blog.py` (app.pixelco.io CTAs → /signup).
- **E (legal)** — RED `tests/marketing-legal-parity.test.tsx` (13
  failing) → GREEN: `src/data/legal-pages.ts` generated from the live
  extractions by `scripts/r13-convert-legal.py` (incl. the CCPA §2 data
  table → pipe-table format); `legal-page.tsx` rebuilt to the live
  chrome; the 4 route pages became data-driven one-liners.
- **Extra findings fixed en route:** R13-F10 titles (landing
  `title.absolute` with the live's exact brand title — the root template
  was double-suffixing; about/docs de-duplicated; root default +
  openGraph aligned to "…by Email"); R13-F11 font tails (every font
  token ends `system-ui, sans-serif` — next/font's fallback family has
  no ← glyph and the sub-page back-links rendered a dash).
- **D gate** — `npm run verify` GREEN: lint ✓, typecheck ✓, **380
  tests / 48 files** (2 skipped), build + build:standalone. Fresh-server
  browser pass: landing sections [762,403,174,526,708,610,650,814,
  **756**,500] all live-exact; banner scoping verified on 8 routes; ←
  glyph renders as an arrow post-fix (VLM close-up); titles verified.
  **Final VLM: all 8 sub-page pairs EXACT_MATCH (about 0.99, blog 0.99,
  blog-post 1.0, docs 0.99, privacy 1.0, terms 1.0, gdpr 1.0,
  ccpa 1.0).** Intermediate DIFFERENT verdicts (back-link glyph, blog
  card footer) were triaged: the glyph was real (fixed), the card
  footer claim was a VLM misread (both sides DOM-verified to carry the
  bottom row; the real delta was the container width).
- **E (docs)** — PAD v1.12, README counts + structure, AGENTS.md
  (banner/accordion/sub-page-chrome/content facts + route-group
  convention), CLAUDE.md (v1.12 sub-page parity principle), this log.
- **F (ship)** — atomic Conventional Commits on main only; push via
  `docs/ssh_git_wrapper_v3.py` + paramiko shim.
