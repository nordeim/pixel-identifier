# Round-14 Remediation Plan — Metadata & SEO-surface parity

**Date:** 2026-09-17 · **Repo state at plan time:** main @ 57e51c3 (PAD v1.12,
380 tests / 48 files) · **Audit evidence:** `research/round14-audit/`

## Context

Round-14 re-audited every surface for live drift and found the DOM visually
stable: landing section heights byte-identical ([762,403,174,526,708,610,
650,814,756,500]), banner scoping intact, all sub-page H1/H2 counts equal,
blog slugs identical, dashboard sidebar/KPI structure equal, sitemap URL
sets equal (18). **The remaining parity surface is document metadata** — the
`<head>`, the tab title, social-unfurl tags, canonical links, sitemap/robots
serialization, and the favicon — none of which any prior round had audited
end-to-end (R13's title fix touched the landing only).

**Audit method:** head-meta extraction (`title`, `description`, `og:*`,
`twitter:*`, canonical) from all 18 live marketing routes AFTER hydration
(the live is a CSR SPA — its raw HTML ships a static shell but its router
sets per-page meta on navigation), the same fields from the local clone,
plus raw-HTTP probes of `/sitemap.xml`, `/robots.txt`, `/favicon.ico` and
the app subdomain's head.

## Findings (all HTTP/DOM-verified, evidence in round14-audit/content/)

| ID | Sev | Finding | Evidence |
|---|---|---|---|
| R14-F1 | High | Root/landing `description` + og/twitter descriptions are clone-authored; the live ships "Pixelco identifies anonymous website visitors by their real email address. B2C and B2B. One pixel snippet, no forms needed. Start free today." | live-meta-all.jsonl vs layout.tsx |
| R14-F2 | High | Sub-page titles: the live's router sets rich per-page titles — about "About Pixelco — The Team Behind B2C Visitor Identification", blog "Blog — Visitor Identification & Lead Generation Insights \| Pixelco", docs "Documentation — Install the Pixelco Pixel in 5 Minutes", legal "X \| Pixelco", posts "{title} \| Pixelco" — while the clone renders short template titles ("About · Pixelco"); the live's suffix separator is `\|`, the clone's `·` | live-meta-all.jsonl; live 404 title "Page Not Found \| Pixelco" |
| R14-F3 | High | All 7 sub-page descriptions + all 10 post meta descriptions differ (clone paraphrases vs live copy, e.g. about: "Learn about Pixelco by Aiviral. We built the world's first B2C email identification platform…") | live-meta-all.jsonl |
| R14-F4 | High | Sub-pages never override `og:title`/`og:description`/`twitter:*` — the root brand block renders on every sub-page; the live sets per-page og/twitter title+description (= page title/description) | live-meta-all.jsonl |
| R14-F5 | Med | No `og:image`/`og:image:width`/`og:image:height`/`twitter:image`; the live ships a 1200×630 webp social image on every marketing page | live head grep; live-og-image.webp |
| R14-F6 | Med | No `og:url` (live: per-page) and no `og:locale` (live: en_US) on marketing | live head grep |
| R14-F7 | Med | `twitter:card` = summary; live = summary_large_image | head diff |
| R14-F8 | Med | No canonical links; the live ships per-page `<link rel="canonical">` | live-meta-all.jsonl |
| R14-F9 | Med | App bundle (app.pixelco.io) ships its OWN og block — title "Pixelco", description "Visitor identification platform dashboard", a 1920×1080 og image, twitter:card summary_large_image, twitter:site @Lovable, NO canonical/og:url/og:locale — while the clone's app pages (login/signup/forgot/dashboard) inherit the marketing og block | app head extraction |
| R14-F10 | Med | 404 title: live "Page Not Found \| Pixelco"; clone ships the root default brand title | live 404 probe |
| R14-F11 | Med | sitemap.xml: URL set matches (18) but order differs (live: /, about, docs, blog, legal…, then posts in a hand-authored order talktome→flcmarkets→…; clone: /, blog, docs, about + date-desc posts), priority home serializes "1" vs live "1.0", and the live ships XML comments + `xmlns:news`/`xmlns:image` namespaces | raw sitemap diff |
| R14-F12 | Low | robots.txt: live ships a commented format ("# https://www.robotstxt.org/…" header, "# Sitemaps" section, "# Crawl-delay" footer, lowercase `User-agent:`); clone ships Next's default serialization | raw robots diff |
| R14-F13 | Low | Live marketing ships `<meta name="robots" content="index, follow" />`; clone ships none | head grep |
| R14-F14 | Low | Favicon: live serves `/favicon.ico` (256×256 PNG-in-ICO, 32,593 bytes, no `<link>` tag — classic auto-discovery); clone ships `src/app/icon.svg` + injected link tag | live-favicon.ico (md5 04348f59…) |
| R14-F15 | Low | Clone ships 5 meta keywords; the live ships none | head grep |

Non-findings (verified, no action): landing sections, banner scoping,
sub-page H1/H2 counts, blog slugs, dashboard structure, sitemap URL set —
all byte/structure-identical; app og:image has no width/height tags on the
live (only the marketing image carries 1200/630).

## Parity rulings (documented, following repo precedents)

- **D1 — self-host social images** (single-deployment convention, like the
  R13 `/signup` CTA mapping): the live's marketing webp (1200×630) and app
  PNG (1920×1080) are copied into `public/` and referenced via
  `openGraph.images`; unfurls render the same image from the deployment's
  own origin (`metadataBase` = NEXTAUTH_URL).
- **D2 — `twitter:site @Lovable` NOT replicated**: it is the live's
  build-platform artifact (same ruling category as the forgot-password dead
  link, PAD §11 — the clone does not replicate the original's tooling
  accidents).
- **D3 — app tab titles stay per-page** (R13 ruling; the live's
  "Pixelco"-everywhere is a CSR artifact) while the app og:title = "Pixelco"
  per the live's og intent.
- **D4 — og:description = the page description** (the live's router sets
  og:desc = desc on every page; the raw-shell variant that lacks the
  landing's trailing sentence is a pre-hydration artifact).
- **D5 — sitemap/robots become Route Handlers** (`app/robots.txt/route.ts`,
  `app/sitemap.xml/route.ts`) to reproduce the live's exact bytes — comments,
  namespaces, "1.0" priority serialization, lowercase `User-agent:` — which
  the Next metadata conventions cannot emit.
- **D6 — posts gain a `metaDescription` field**: the live's meta description
  is distinct from the card excerpt (both extracted; excerpt already
  live-exact, meta description now added).

## Workstreams

### A — SEO foundation (root layout + assets)
- **A1:** copy `live-og-image.webp` → `public/og-image.webp`,
  `live-app-og-image.png` → `public/app-og-image.png`, `live-favicon.ico` →
  `public/favicon.ico`; delete `src/app/icon.svg` (kills the injected link
  tag; the browser auto-requests `/favicon.ico` exactly like the live).
- **A2 (RED→GREEN):** root `layout.tsx` metadata — description/og/twitter
  description live-verbatim; openGraph gains `url: '/'`, `locale: 'en_US'`,
  `images: [{ url: '/og-image.webp', width: 1200, height: 630 }]`; twitter
  `card: 'summary_large_image'` + images; `alternates.canonical: '/'`;
  `robots: { index: true, follow: true }`; delete `keywords`; title template
  `"%s · Pixelco"` → `"%s | Pixelco"`.

### B — marketing-seo helper + sub-page metadata
- **B1 (RED→GREEN):** `src/lib/marketing-seo.ts` — `marketingMetadata({
  title, description, path })` builds the full live-shaped Metadata
  (title.absolute, per-page openGraph/twitter, canonical). Pages: about,
  blog, docs, privacy, terms, gdpr, ccpa with the live-verbatim strings.
- **B2 (RED→GREEN):** `BlogPost.metaDescription` + the 10 live descriptions
  (converter: `scripts/r14-patch-blog-meta.py`); `[slug]` generateMetadata
  uses it (title via template → "{title} | Pixelco", og/canonical via the
  helper).

### C — app-bundle og block
- **C1 (RED→GREEN):** `src/lib/app-seo.ts` — `appSeoMetadata()` (og:title
  "Pixelco", og:description "Visitor identification platform dashboard",
  images `/app-og-image.png`, twitter summary_large_image; NO canonical /
  og:url / og:locale / robots meta — the live app ships none). Applied to
  login, signup, forgot-password (titles preserved) and
  `dashboard/layout.tsx` (one export covers all 7 pages).

### D — 404 title
- **D1 (RED→GREEN):** `src/app/[...notfound]/page.tsx` catch-all exporting
  `metadata: { title: 'Page Not Found' }` and calling `notFound()` →
  renders the pinned R11 boundary with the live's title. Browser-verified;
  if the framework ignores the throwing page's metadata, fall back to
  documenting the limitation.

### E — sitemap.xml + robots.txt route handlers (live-exact bytes)
- **E1 (RED→GREEN):** `app/robots.txt/route.ts` — the live's commented text
  verbatim (Sitemap line derives from `siteUrl()`); delete `app/robots.ts`.
- **E2 (RED→GREEN):** `app/sitemap.xml/route.ts` — the live's exact XML:
  news/image namespaces, section comments, priorities serialized "1.0",
  the live's URL order (static: /, about, docs, blog, privacy, terms, gdpr,
  ccpa; posts: the live's hand-authored order as a pinned slug array);
  delete `app/sitemap.ts`. `dynamic = 'force-static'`.

### F — verification, docs, ship
- `npm run verify` green; `build:standalone` + fresh server; browser pass:
  head-meta diff across all 22 surfaces vs `live-meta-all.jsonl`,
  sitemap/robots byte-diff (origin-substituted), `/favicon.ico` bytes + no
  icon link tag, 404 title, and an E2E functional flow on the standalone
  build (sign-up → domain → beacon → dashboard → export) per the session-9
  hand-off suggestion.
- PAD v1.13, README (structure + counts + favicon/sitemap/robots notes),
  AGENTS.md (metadata parity pattern + route-handler note + amended
  route whitelist), CLAUDE.md (v1.13 principle), plan execution log,
  worklog.
- Atomic commits on main; push via the SSH wrapper.

## Risks & notes
- The title-template separator change (`·` → `|`) flips the rendered title
  of every template consumer (login/signup/forgot/dashboard) — no live
  reference exists for those tabs (CSR "Pixelco"); the `|` suffix follows
  the live's only observed suffix convention (posts/legal/404/blog).
- The catch-all route must not shadow existing routes (static/dynamic
  segments take precedence over `[...notfound]` — verified against the
  route tree; unmatched `/api/*` paths change from Next's built-in 404 to
  the same-status catch-all boundary, behaviorally equivalent).
- Deleting `app/sitemap.ts`/`app/robots.ts` breaks `tests/seo-routes.test.ts`
  imports — the test is rewritten against the route handlers (URL set,
  ordering, no-app-routes and the forgot-password pins all preserved).
- The sitemap's post order is pinned as a literal slug array (the live's
  order is not date-derived — flcmarkets 2026-09-10 follows talktome
  2026-05-10); `blog-posts.test.ts` gains a metaDescription guard so the
  sitemap route and the catalogue cannot drift apart.
- og:image self-hosting: the images total ~150 KB in `public/` — served
  statically, no runtime cost; `metadataBase` resolves them to absolute
  URLs in production.

## Execution Log (completed 2026-09-17)

- **A (foundation)** — assets copied (`public/og-image.webp` 1200×630,
  `public/app-og-image.png` 1920×1080, `public/favicon.ico` = the live's
  32,593 bytes, md5-verified); `src/app/icon.svg` deleted (the injected
  link tag is gone — `/favicon.ico` auto-discovery like the live). Root
  layout: live-verbatim description, `|` template suffix,
  `robots {index, follow}`, og `{url '/', locale 'en_US', images
  [og-image 1200×630]}`, twitter `summary_large_image`, canonical `/`,
  keywords dropped.
- **B (marketing head)** — `src/lib/marketing-seo.ts`
  (`marketingMetadata`) created; all 7 sub-pages + the blog article
  `generateMetadata` now build the live-shaped head (live-verbatim
  titles/descriptions from the round-14 extraction). `BlogPost` gained
  `metaDescription`; the 10 live descriptions patched in by
  `scripts/r14-patch-blog-meta.py` from the jsonl extraction.
- **C (app head)** — `src/lib/app-seo.ts` (`appSeoMetadata`); applied
  to login/signup/forgot-password (per-page tab titles preserved) and
  `dashboard/layout.tsx` (covers all 7 dashboard pages). No `@Lovable`.
- **D (404 title)** — the planned catch-all route carried metadata but
  Next does NOT apply a throwing page's metadata when `notFound()`
  renders the boundary (browser-verified). Implemented instead as the
  live's actual mechanism: a `NotFoundTitle` client island in
  `not-found.tsx`. Two framework findings en route: (1) a plain
  `document.title` assignment is overwritten by Next's client metadata
  controller AFTER hydration — the island re-asserts via a
  MutationObserver on the `<title>` element; (2) the live's unknown
  routes serve HTTP 200 (SPA fallback) — the clone keeps the correct
  404. Verified: title swaps on both unmatched routes and `notFound()`
  paths, restores on client navigation. The announcement bar's
  `<a href="/signup">` became `<Link>` (DOM-identical; the root
  catch-all experiment had made the no-html-link-for-pages rule treat
  every internal href as a page — the Link form is idiomatic anyway).
- **E (crawl surface)** — `src/app/robots.txt/route.ts` +
  `src/app/sitemap.xml/route.ts` (GET, force-static, live-verbatim
  bodies with the origin from `siteUrl()`; the sitemap's post order is
  the pinned LIVE_POST_ORDER slug array). `src/app/robots.ts` +
  `src/app/sitemap.ts` deleted. `tests/seo-routes.test.ts` rewritten
  against the route handlers (URL set, exclusions, forgot-password pins
  preserved).
- **F (gate + verification)** — `npm run verify` GREEN: lint,
  typecheck, **402 tests / 49 files** (2 skipped), build 36 routes.
  Fresh-standalone browser pass: 18/18 marketing surfaces match the
  live head field-for-field (title/desc/ogTitle/ogDesc/canonical;
  og:image self-hosted per ruling D1); robots.txt + sitemap.xml
  byte-diff clean against the live captures (origin-substituted);
  `/favicon.ico` serves the live's bytes with no icon link tag; the
  app og block verified on /login; the 404 title verified on both
  paths; the announcement bar renders identically post-Link. E2E
  pipeline pass on the production build: sign-up → add domain → 25
  beacons → dashboard KPIs → visitors table → CSV export all green
  (2 of 25 visitors identified by the deterministic engine).
- **G (docs)** — PAD v1.13 revision block, README (402 tests, 36
  routes, SEO surface section, file hierarchy, coverage bullets),
  AGENTS.md (3 new fact blocks + route-whitelist amendment), CLAUDE.md
  (v1.13 principle + whitelist amendment), this log, worklog.
