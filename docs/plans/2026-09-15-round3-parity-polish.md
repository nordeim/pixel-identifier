# Pixelco Clone — Round 3 Parity & Polish Plan

> **For Claude:** REQUIRED SUB-SKILL: Use the `tdd` skill (red → green) to
> implement this plan task-by-task. Every behavioral change starts with a
> failing test at a pre-agreed seam. Commit after each green task.
> (`verification-and-review-protocol`: no completion claim without fresh
> command output read by you.)

**Goal:** Close the remaining visual/functional parity gaps with pixelco.io
(the marketing sub-pages and legal pages the live site actually serves), add
production polish (favicon, robots, sitemap, security headers), resolve the
dependency advisory where safely possible, finish the two round-2 leftovers,
and realign the four root documents.

**Architecture:** Next.js 16 App Router. New marketing pages live in a
`(marketing)` route group whose layout renders the shared chrome
(AnnouncementBar + SiteHeader + SiteFooter) — the landing page moves into the
group unchanged (URL stays `/`). Page content is static RSC; blog posts and
footer/nav link maps are pure data modules (`src/data/`, `src/lib/`) — those
are the TDD seams. Legal pages share one prose layout component.
`robots.ts` / `sitemap.ts` use the Next Metadata Routes API.

**Tech Stack:** unchanged (Next 16, React 19, TS strict, Tailwind 4,
shadcn/ui, Prisma/SQLite, NextAuth v4, Vitest).

**Audit source:** Round-3 audit (2026-09-15) of HEAD `188bae5` — full-code
read of analytics/quota/actions/install/marketing components, `bun audit`,
link sweep, plus live-site evidence: `https://pixelco.io/sitemap.xml` (18
URLs), robots.txt, and the SPA bundle (footer hrefs, legal-page section
structures, About values, blog post list) extracted and archived under
`research/` in the sandbox. Screenshots of /about, /blog, /docs analyzed via
VLM (`research/vlm-analysis/{about,blog,docs}-page.json`).

**Severity scale** (code-review-and-audit skill): Critical → fix first;
High → same release; Medium → this release; Low → opportunistically.

---

## Findings (validated against the codebase)

| ID | Severity | Finding | Evidence (verbatim) |
|----|----------|---------|---------------------|
| G-01 | High | Missing marketing routes that exist on pixelco.io: `/about`, `/blog`, `/blog/[slug]` ×10, `/docs` | live sitemap.xml lists them; clone build has only `/`, `/login`, `/signup`, `/dashboard/*` |
| G-02 | High | Missing legal routes `/privacy`, `/terms`, `/gdpr`, `/ccpa`; footer Legal + Company links are dead `#` | `faq-footer.tsx:57-72` (`href: '#'` ×8); live sitemap lists all four |
| G-03 | Medium | Footer Contact should be `mailto:support@pixelco.io` (original footer is a mailto, not a page); Careers is a dead `#` **on the original too** — keep dead for parity, comment it | bundle: `href:"mailto:support@pixelco.io"` for Contact, `href:"#"` for Careers |
| G-04 | Medium | No favicon/app icon — blank tab icon | no `src/app/icon.*`, no `public/` directory |
| G-05 | Medium | No robots.txt / sitemap.xml; no `metadataBase` in root layout | live site serves both; `src/app/layout.tsx` lacks metadataBase |
| G-06 | Medium | No security headers in next.config.ts | `next.config.ts` is 3 keys; no `headers()` |
| G-07 | Medium | `deepmerge-ts <8.0.0` HIGH advisory (GHSA-ggr8-5vv4-36mx) via `prisma → @prisma/config` — dev-tooling path, runtime unaffected | `bun audit` output |
| G-08 | Low | Raw `<a href="/dashboard/visitors">` — missed F-27 case | `src/app/dashboard/page.tsx:141-147` |
| G-09 | Low | Round-2 Task 6.2 zod modernization never landed: deprecated `z.string().email()` + `error.flatten().fieldErrors` + `as Record<string, string[]>` casts | `validation.ts:16-22`, `domains.ts:45-46`, `settings.ts:33-34`, `auth.ts:51-52` |

**Clean bill (verified this round, no action):** analytics.ts (parallel
queries, cursor pagination, UTC buckets), quota.ts (atomic, single writer),
all three action files (ownership predicates, `_count`, P2002 handling),
install page (per-domain switcher), all anchor targets exist, no console.log/
TODO/placeholder, not-found/error/loading boundaries present, 106/106 tests
green at HEAD.

---

## Workstream A — Marketing sub-pages (G-01, G-02, G-03)

### Task A1: shared marketing chrome + link data module (seam)
- **RED** `tests/marketing-links.test.ts` for new `src/lib/marketing-links.ts`:
  - `NAV_LINKS`/`FOOTER_COLUMNS` every internal href starts with `/` and
    belongs to the known route set (`/`, `/about`, `/blog`, `/docs`,
    `/privacy`, `/terms`, `/gdpr`, `/ccpa`, `/signup`, `/login`, or
    `/#anchor` for same-page anchors);
  - the only permitted dead link is Careers (parity with the original) —
    assert it is explicitly flagged `dead: true` in the data;
  - Contact is a `mailto:` link.
- **GREEN**: extract `NAV_LINKS` and `FOOTER_COLUMNS` from
  `site-header.tsx` / `faq-footer.tsx` into the data module; rewire both
  components to consume it. Nav anchors become `/#benefits` style (work from
  any sub-page). Footer: Product→ Documentation points at `/docs`; Company→
  About `/about`, Contact `mailto:support@pixelco.io`, Careers dead
  (commented), Blog `/blog`; Legal→ four real routes.
- **commit** (`feat(marketing): shared link map — footer routes to real pages`).

### Task A2: `(marketing)` route group layout
- Create `src/app/(marketing)/layout.tsx` rendering `<AnnouncementBar/>
  <SiteHeader/> <main>{children}</main> <SiteFooter/>`; move
  `src/app/page.tsx` → `src/app/(marketing)/page.tsx` and drop the chrome
  from it (the `deleted` banner logic stays in the page). Verify `/`
  renders identically (route group adds no URL segment).
- **commit** (`refactor(marketing): shared chrome via (marketing) route group`).

### Task A3: blog data module (seam)
- **RED** `tests/blog-posts.test.ts` for new `src/data/blog-posts.ts`:
  - 10 posts, slugs unique and match the live sitemap list verbatim;
  - each post has title/category/readTime/dateISO/excerpt (40–220 chars)/
    content (non-empty);
  - `sortedPosts()` is ordered by date desc;
  - `getPostBySlug('identify-anonymous-website-visitors')` returns the post.
- **GREEN**: author the 10 posts (titles/excerpts from the captured blog
  grid + sitemap slugs; the 4 sister-product posts link out to
  aiviral.com / flcmarkets.com / personpages.com / talktome.bio exactly like
  the original; the 6 topical posts carry realistic 350–600 word articles).
- **commit** (`feat(blog): post catalogue matching the live sitemap`).

### Task A4: `/blog` index page
- RSC page in the group: centered hero ("The Pixelco Blog" + subheading per
  VLM), 3-col card grid (category pill + clock read-time, bold title,
  excerpt, date + amber "Read →"), `Link` to `/blog/[slug]`; empty-state
  not needed (static data). `metadata` title "Blog".
- Browser-verify, **commit** (`feat(blog): index grid`).

### Task A5: `/blog/[slug]` article pages
- `generateStaticParams` over the catalogue; `generateMetadata` per post
  (title/description); article layout: category + read time, H1, prose body,
  "← Back to Blog" link; `notFound()` for unknown slugs.
- **RED** (unit, cheap): `tests/blog-slug.test.ts` — every catalogue slug is
  URL-safe (`^[a-z0-9-]+$`) so `generateStaticParams` can never emit a bad
  route.
- **commit** (`feat(blog): article pages for all ten posts`).

### Task A6: `/about` page
- Per VLM + bundle: "← Back to Home", H1 "We're building the future of
  visitor intelligence." (highlighted phrase), subheadline, "Our Mission"
  (97% of visitors leave…), "What We Stand For" 2×2 values grid —
  **verbatim from the bundle**: Innovation First, Privacy by Design, Global
  Scale ("We serve businesses in 50+ countries…"), Results-Driven ("Every
  feature we ship is measured by one metric: does it help our customers
  convert more leads?"), bottom CTA.
- **commit** (`feat(marketing): about page`).

### Task A7: `/docs` page
- Per VLM: breadcrumb, H1 "Documentation", "Get started with Pixelco in
  under 5 minutes.", 2×2 numbered step cards (Create Your Account / Install
  the Pixel / Verify Installation / Start Identifying — body copy verbatim),
  "Example Pixel Code" section with a sample snippet in the code block and
  the amber warning box ("This is a sample snippet for illustration only…")
  linking to the dashboard.
- **commit** (`feat(marketing): docs quickstart page`).

### Task A8: legal pages (G-02)
- Shared `LegalPage` prose component (`max-w-3xl`, "← Back to Home", H1,
  "Last updated" line, numbered H2 sections, paragraphs/lists/tables).
- `/privacy` — 14 sections per the extracted structure (Introduction,
  Definitions, Information We Collect ×4 subsections, How We Use, Legal
  Basis, Data Sharing, Cookies, Retention, Security, Your Rights,
  International Transfers, Children's Privacy, Changes, Contact).
- `/terms` — 16 sections per the extracted structure (incl. the verbatim
  Acceptable Use prohibitions list).
- `/gdpr` — 12 sections (roles, Art. 6 bases, Art. 15–22 rights, DPA scope,
  transfers + EDPB link, DPIA, sub-processors, breach notification, DPO,
  supervisory authority, customer responsibilities).
- `/ccpa` — CCPA/CPRA: overview, the 6-row category table (Identifiers,
  Commercial Information, Internet/Network Activity, Geolocation,
  Professional/Employment Info, Inferences), sources, business purposes,
  rights (know/delete/opt-out/non-discrimination), contact.
- All four: `metadata` titles, `Last updated: April 14, 2026` (matches
  original), footer contact `support@pixelco.io`.
- **commit** (`feat(legal): privacy, terms, GDPR, CCPA pages`).

## Workstream B — Production polish (G-04, G-05)

### Task B1: favicon
- `src/app/icon.svg` — the pixel-spark mark (same geometry/colors as
  `PixelcoLogo`: four `#FACC15` corners + `#F59E0B` center on transparent).
- Browser-verify the tab icon renders. **commit** (`feat(chrome): brand favicon`).

### Task B2: robots + sitemap (seam)
- **RED** `tests/seo-routes.test.ts`: import `robots` from
  `src/app/robots.ts` → disallows `/api/`, sitemap URL ends `/sitemap.xml`;
  import `default` (sitemap fn) from `src/app/sitemap.ts` → contains all 16
  marketing URLs (`/`, about, docs, blog, privacy, terms, gdpr, ccpa + 10
  blog slugs), no `/login` `/signup` `/dashboard` entries.
- **GREEN**: `robots.ts` (rules mirroring the live file) + `sitemap.ts`
  (priorities per the live file: / 1.0, blog 0.9, docs 0.8, posts 0.8,
  about 0.7, legal 0.4).
- **commit** (`feat(seo): robots + sitemap metadata routes`).

### Task B3: metadataBase
- Root layout `metadata.metadataBase` from `NEXTAUTH_URL` env (fallback
  `http://localhost:3000`) — silences the OG/canonical warning and makes
  sitemap URLs absolute.
- **commit** (`fix(seo): metadataBase from NEXTAUTH_URL`).

## Workstream C — Security headers (G-06)

### Task C1: baseline headers
- `next.config.ts` gains `headers()` (applied to all routes):
  `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`,
  `Referrer-Policy: strict-origin-when-cross-origin`,
  `Permissions-Policy: camera=(), microphone=(), geolocation=()`.
  No CSP in this round (Next inline bootstrap makes a strict CSP a separate
  project — documented in PAD §11).
- Verify with `curl -I` on the standalone server in the final gate.
- **commit** (`feat(security): baseline response headers`).

## Workstream D — Dependency advisory (G-07)

### Task D1: attempt safe resolution
- `bun update prisma @prisma/client` → `bun audit`: if the advisory clears
  and `npm run verify` stays green, **commit** (`chore(deps): clear
  deepmerge-ts advisory`).
- If no fixed Prisma release exists yet: try `"overrides": {
  "deepmerge-ts": "^8.0.0" }` in package.json → `bun install` → audit →
  verify. If that breaks anything, revert and document as accepted in
  PAD §11 with the runtime-unaffected rationale (advisory is in Prisma's
  config-loading path, which never merges untrusted recursive graphs in
  this app). Never force an unresolved upgrade.

## Workstream E — Round-2 leftovers (G-08, G-09)

### Task E1: overview "View all" → Link
- `src/app/dashboard/page.tsx:141` `<a>` → `<Link>` (client-side nav).
- **commit** (`polish(ui): Link for overview view-all`).

### Task E2: Zod 4 modernization (finish Task 6.2)
- **RED-first where behavioral**: existing action tests (signup,
  plan-switch, domains, delete-account) are the characterization suite —
  run them green before and after.
- `validation.ts`: `z.string().email()` → `z.email()` (same message);
  actions: `parsed.error.flatten().fieldErrors as Record…` →
  `z.flattenError(parsed.error).fieldErrors` with no cast (Zod 4 returns
  the right shape for our single-field schemas).
- **commit** (`refactor(zod): modern email + flattenError, drop casts`).

## Workstream F — Documentation realignment

### Task F1: four root documents
- **README**: routes table gains the marketing/legal/blog pages; features
  row for "Marketing site: 16 routes incl. blog + legal"; SEO section
  (robots/sitemap/favicon); security-headers note; verify gate unchanged.
- **AGENTS.md**: convention — marketing pages live in `(marketing)`, links
  come from `marketing-links.ts`, blog posts from `src/data/blog-posts.ts`
  (add-a-post recipe).
- **CLAUDE.md**: testing seams list gains marketing-links/blog-posts/
  seo-routes data modules.
- **PAD**: v1.2 revision block; §2 topology + §3 tree gain `(marketing)`
  group + data modules; §6.1 security-headers row; §11 refresh
  (deepmerge-ts advisory outcome, favicon/robots/sitemap now shipped,
  Careers dead-link parity note, CSP deferred); ADR-009 — static marketing
  content as data-driven RSC pages (why: parity with the original's page
  set without a CMS; consequences: content edits are code edits).
- **commit** (`docs: realign README/AGENTS/CLAUDE/PAD with round-3 changes`).

---

## Final gate (before push)

1. `npm run verify` — lint → typecheck → **test** → build, all green.
2. `bun audit` — advisory resolved or documented.
3. Standalone-server smoke: `/` and all 16 new routes return 200 with
   correct titles; `/dashboard` 307; beacon ingest 204; `curl -I` shows the
   four security headers; `/robots.txt` + `/sitemap.xml` render.
4. Browser E2E: landing unchanged; footer links navigate (About/Blog/Docs/
   Privacy/Terms/GDPR/CCPA); Contact opens mailto; blog index → article →
   back; mobile 390px spot-check; zero console errors.
5. Secret scan (`rg` key material / env / .key) → stage → commit → push via
   the SSH wrapper with
   `--remote git@github.com:nordeim/pixel-identifier.git`.

## Validation record (plan ↔ codebase)

| Finding | Validated at | Verdict |
|---|---|---|
| G-01 missing routes | `next build` route list at 188bae5 + live sitemap fetch | Confirmed |
| G-02 dead legal links | `faq-footer.tsx:45-73` read verbatim | Confirmed — 8 `#` hrefs |
| G-03 mailto Contact / dead Careers | live bundle grep (`href:"mailto:support@pixelco.io"`, `href:"#"`) | Confirmed |
| G-04 no favicon | `ls src/app/icon* public/` → ENOENT | Confirmed |
| G-05 no robots/sitemap/metadataBase | `ls src/app/robots* sitemap*` empty; `layout.tsx` read | Confirmed |
| G-06 no headers | `next.config.ts` read (3 keys, no `headers`) | Confirmed |
| G-07 deepmerge-ts HIGH | `bun audit` executed, output read | Confirmed |
| G-08 raw `<a>` | `rg -U '<a[^>]*\n?\s*href="/' src/` → `dashboard/page.tsx:141` | Confirmed |
| G-09 zod debt | `rg "flatten\(\)"` → 3 action files; `validation.ts:20` `.email()` on string | Confirmed |
