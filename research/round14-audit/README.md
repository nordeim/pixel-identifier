# Round-14 audit evidence — metadata & SEO-surface parity

Captured 2026-09-17 against `https://pixelco.io/` (marketing) and
`https://app.pixelco.io/` (app bundle). Method: head-meta extraction
AFTER hydration (the live is CSR — raw HTML ships one static shell; the
router sets per-page meta on navigation), plus raw-HTTP probes of
`/sitemap.xml`, `/robots.txt`, `/favicon.ico` and the app head.

## content/

- `live-meta-all.jsonl` — per-page `{path, title, desc, ogTitle, ogDesc,
  canonical, ogImage}` for all 18 live marketing routes (landing, 7
  sub-pages, 10 blog posts).
- `local-meta-all.jsonl` — the same fields from the clone BEFORE the
  remediation (the "before" evidence: template titles, authored
  descriptions, root og everywhere, no canonical/og:url/og:locale).
- `local-meta-post.jsonl` — the same fields AFTER the remediation
  (verification pass on the standalone build; 18/18 field-for-field
  match, og:image self-hosted by ruling D1).
- `live-robots.txt` / `live-sitemap.xml` — the live crawl documents
  (byte captures; the clone's route handlers reproduce them with the
  deployment origin substituted).
- `live-favicon.ico` — the live's 256×256 PNG-in-ICO (32,593 bytes,
  md5 `04348f59…`; the clone ships these exact bytes from
  `public/favicon.ico`).
- `live-og-image.webp` — the live marketing social image (1200×630,
  self-hosted by the clone at `public/og-image.webp`).
- `live-app-og-image.png` — the live app bundle's social image
  (1920×1080, self-hosted at `public/app-og-image.png`).

## verification/ (browser pass on the standalone build)

- Head-meta: 18/18 marketing surfaces match the live field-for-field
  (title, description, og:title, og:description, canonical).
- robots.txt + sitemap.xml: byte-diff clean vs the captures
  (origin-substituted).
- `/favicon.ico`: 200, live bytes, no `<link rel="icon">` tag.
- 404: title swaps to "Page Not Found | Pixelco" on both unmatched
  routes and `notFound()` paths; restores on client navigation; HTTP
  404 (the live's SPA fallback serves 200 — not replicated).
- App og block on /login: "Pixelco" / "Visitor identification platform
  dashboard" / `/app-og-image.png` / large card (no canonical, no
  og:url/og:locale — like the live app).
- E2E pipeline: sign-up → add domain → 25 beacons → dashboard KPIs →
  visitors table (2 identified) → CSV export (200, correct columns).
