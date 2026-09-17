I'll continue the pixelco.io parity iteration task. Let me set up a plan and start with refreshing the workspace.
The repo has advanced beyond what I remembered — Round-13 appears to have been completed. Let me pull and examine the full recent history.
`git pull` brought in a new commit `57e51c3` adding `docs/session_9.md`. Round-13 was already shipped in a prior session. Let me review the current state thoroughly.
Session 9 (Round-13) shipped all sub-page parity. Now let me review the core docs and plans to build the full picture for the next round.
Now let me quickly review the Round-12 plan and PAD's latest revision section to complete the documentation review.
Documentation review complete. The picture: Round-13 shipped full sub-page parity (all 8 sub-page pairs EXACT_MATCH), 380 tests/48 files, PAD v1.12. Now let me validate the codebase state with the baseline gate.
Baseline gate GREEN — 380 tests / 48 files, build 35 routes. Now let me set up the Round-14 audit. First, check the environment state and boot the local production server.
Seed DB is intact (demo user, 1 site, 5 visitors, 12 events). Now let me boot the production server as a detached daemon using the persisted boot helper.
Now let me write the server boot daemon script (Round-14 helpers).
Server is up. Now starting the **Round-14 audit** — first, a live drift re-check of the landing page and dashboards against the R12/R13 pins.
Titles are captured but section evals came back empty — likely an output parsing issue. Let me test the eval output format directly.
The live landing sections are `[762,403,174,526,708,610,650,814,756,500]` — **byte-identical to the R12/R13 pins, no drift**. The empty outputs were a quoting issue in my script. Let me redo the sub-page probes with cleaner quoting.
Live sub-pages all match R13 pins — no drift. Now the local side comparison.
No drift in sections, banner scoping, H1s, or H2 counts. But I found a **title drift**: live ships rich per-page SEO titles (`About Pixelco — The Team Behind B2C Visitor Identification`) while the clone ships template titles (`About · Pixelco`), and legal pages differ on separator (`|` vs `·`). Let me check blog post titles too.
The live blog is CSR (same title on every post). But I need to verify the actual blog slugs — let me get the full list from both sides.
Slugs all match. But there's a title question — the live now ships **rich per-page titles** on sub-pages, while R13 documented "the live ships the same title on every page (CSR SPA)". Let me check the R13 evidence to see if this is new drift.
Let me verify whether the live's per-page titles come from the server HTML or client JS (the R13 audit claimed CSR same-title).
Key discovery: the live serves a static shell title in raw HTML but **client JS sets rich per-page titles** (about/blog/docs/legal) — R13 only measured the raw HTML. Blog posts keep the shell title. This is a real parity finding. Let me also check meta descriptions, then audit the live dashboard.
Now let me check the live's blog-post title with a REAL slug, plus og tags.
Real posts DO update the title on the live — with a `| Pixelco` suffix (clone uses `·`). And og tags differ. Let me get the complete head picture from both sides.
Metadata surface has real gaps. Let me complete the picture — live app dashboard titles and the clone's current sub-page og tags.
Now let me log into the live app to check dashboard titles and do the dashboard drift check.
Live app ships title "Pixelco" everywhere (CSR). Let me check the clone's dashboard titles and do a DOM-level dashboard drift check.
curl hits the auth redirect. Let me log into the local clone and compare dashboard titles + DOM drift.
Per-page dashboard titles confirmed on the clone (live = static "Pixelco", a documented R13 CSR decision). Now let me check whether the live's JS updates meta description/og on sub-pages, plus the live login/404 titles.
Big finding — the live's JS updates **per-page description, og:title, og:description, and canonical** on sub-pages. The clone only overrides title+description (og stays the root's). Let me extract the complete per-page metadata set from all live marketing pages.
Complete live metadata captured — every page ships title, desc, og:title, og:desc, canonical, and one shared og:image. Now the local side for a full diff.
Complete metadata diff materialized. Let me check a few remaining bits — keywords, robots, sitemap, favicon on the live — then do the dashboard visual drift check.
Sitemap and robots.txt have drift too. Let me check the clone's versions.
Sitemap order differs, robots.txt format differs, meta robots missing. Let me check the live's favicon handling and the clone's post dates (to understand the sort order).
The live ships a real favicon.ico (256×256, no link tag). Let me examine the clone's blog data structure and the icon pins in tests.
The test expects talktome-first but the clone renders date-desc. Let me read the full test and the live's raw sitemap XML with priorities.
Sitemap order/priorities/serialization and robots.txt format all differ. Let me download the live's og:image and check its structure, then do a quick dashboard structural drift check.
The live nav probe came back empty (selector mismatch). Let me probe the live sidebar structure more broadly.
No dashboard structural drift — sidebar links and KPIs match exactly. One more check: does the live's JS update twitter tags per page?
Twitter tags also update per-page on the live. The audit picture is complete. Let me find all existing test pins that the metadata work will touch.
Let me check the live app subdomain's og tags (login/dashboard) to complete the inheritance picture.
The live app bundle ships its own distinct og block. Let me check its canonical/robots details and download the app og:image.
Audit complete — 15 verified findings, all on the metadata/SEO surface. Now let me validate the remediation approach against the codebase before writing the plan.
Validation complete. Let me check one more detail — whether existing marketing tests pin the page metadata exports (they'll need updating).
All validations pass. Now writing the Round-14 remediation plan.
Plan complete. Now executing — starting with **Workstream A1** (assets), then TDD RED tests.
Now the RED test file. Let me first check the existing source-reading test pattern.
Let me check the live's sitemap/robots response headers for exact parity, then write the RED tests.
The live robots.txt is longer than my earlier head showed — it has specific bot rules and AI-scraper comments. Let me capture the full text.
Now writing the RED test file for the SEO parity workstream.
Now extending the blog-posts test with the metaDescription guard (RED), then running both to confirm RED.
**RED confirmed — 23 failing.** Now implementing GREEN. First the two SEO helper libraries.
Now updating the root layout metadata.
The test pins single-quoted strings but the layout uses double quotes — let me fix the test assertion to be format-agnostic.
The sub-page descriptions contain apostrophes — single-quote prefixes in assertions would break. Let me make them quote-agnostic.
Now updating the 7 marketing sub-pages. Let me check their current metadata blocks first.
All 7 sub-pages updated. Now the blog posts' metaDescription — first the patcher script, then the [slug] generateMetadata.
Blog patched. The typecheck found typing issues in the test — the Metadata union type needs narrowing. Let me fix.
Now the [slug] generateMetadata update. Let me view the current implementation.
Now the app bundle: login, signup, forgot-password + dashboard layout.
Now the 404 catch-all route, robots.txt route handler, and sitemap.xml route handler.
The sitemap XML construction is hacky — let me rewrite it cleanly with separate core/legal entries.
Now delete the old convention files and rewrite the seo-routes test.
6 failures left — mostly quote-style mismatches in source pins plus real issues. Let me debug the route handlers first.
Two test bugs (asserting content-type against the body instead of headers) and quote-style mismatches. Fixing the test file.
All 35 SEO tests GREEN. Now the full suite for regressions.
Full suite GREEN — 402 tests / 49 files (+22). Now the complete verification gate.
A lint error appeared — let me find which file.
The root catch-all route makes the lint rule treat every internal href as a page. The correct fix is switching the bar's `<a>` to `<Link>` (identical SSR output). Let me check the test pins first.
No `<a>` pins — safe to switch to Link.
Gate GREEN. Let me verify the sitemap.xml route registered, then rebuild standalone and do the browser verification pass.
Now the browser verification pass — head-meta diff across all surfaces vs the extracted live metadata.
The only remaining diff is `ogImage: LIVE-HOST vs SELF` — which is the documented self-hosting ruling (D1). Let me confirm all other fields match exactly.
All 18 marketing surfaces MATCH. Now the remaining checks — 404 title, sitemap/robots bytes, favicon, og:locale/url emission, robots meta, and app og.
Favicon, robots, sitemap all byte-identical. But the **404 title fix failed** — the catch-all's metadata didn't apply when notFound() throws. Let me check what status the live ships for unknown routes, then decide the approach.
The live ships **HTTP 200** for unknown routes (SPA artifact) with a JS title-swap to "Page Not Found | Pixelco" — the clone correctly ships 404. The clean fix mirroring the live's actual mechanism: a client-side title swap in the not-found boundary (keeping the correct 404 status). Let me remove the ineffective catch-all and implement that.
Let me check the R11 404 test pins and update the seo-parity test.
The R11 test uses `toContain` pins — safe with the null-rendering client island. Now updating the seo-parity test's 404 section.
Stale generated types from the removed route — `next build` regenerates them (same as R13). Building first, then re-running the gate.
The 404 title swap didn't fire. Let me debug — check if the island rendered in the HTML and whether hydration runs.
The metadata block is fully functional (og:url, og:locale, og:image, twitter card all emitted). But the 404 title swap needs debugging — the RSC payload references chunks different from the HTML scripts. Let me check for hydration errors in the browser.
Chunks loaded but no title swap. Let me check the browser console for errors.
No hydration errors — Next's client-side metadata controller is likely re-applying the title after my effect runs. Let me defer the swap past metadata hydration.
Still no swap. Let me probe whether the component code is even in the loaded chunks and whether React hydrated the boundary.
The component code isn't in the referenced chunks — let me search all chunks for it.
The served RSC payload references chunks from a different build than the served static files. Let me check file timestamps to find the stale artifact.
The prerendered artifacts reference both chunk sets. Let me check whether the browser actually loads the chunk containing the component.
The component chunk loads but the effect doesn't fire. Let me examine the exact client-reference mapping in the served HTML.
The chunk wiring is correct in the current build. Let me test empirically whether the component mounts at all — temporary console.log probe.
The component mounts but the swap doesn't happen — either cleanup clears the timer or the metadata controller resets later. Let me probe deeper.
Key insight: the 0ms timeout set the title, but Next's async metadata controller **reset it afterward** (title at 2s shows brand again). The live's actual mechanism is exactly this client-side swap. Let me check if Next 16 has a supported way to title the not-found page before choosing the implementation.
Next 16 has a `global-not-found.js` convention that supports metadata! Let me read its full docs.
The experimental `global-not-found.js` would still leave `notFound()` paths untitled and duplicates the layout shell. The clean single-mechanism fix: the client island with a MutationObserver that re-asserts past the metadata controller — mirroring the live's client-side swap. Implementing.
**404 title now works on both paths** with the correct 404 status. Let me verify title restoration on navigation away, then run the full gate.
Title restores correctly on navigation. Now the full gate.
The test pins the old direct assignment. Updating to pin the observer implementation.
**GATE GREEN — 402/49.** Now the E2E functional flow on the standalone build (the session-9 hand-off suggestion).
Mixed E2E results — the sign-up form didn't submit (later steps rode the old demo session). Let me inspect the signup form's actual field IDs.
No `name` field exists in the signup form — my script filled a nonexistent field. Let me check the domains form too, then fix the E2E script.
My rg flags were wrong (`-r` = replace). Let me redo the search properly.
The domain input has no `id` (only `name`), and signup has no name field. Let me check agent-browser's cookie commands, then rewrite the E2E script correctly.
Sign-up still fails. Let me debug interactively — check for validation errors after submit.
No validation errors and the form didn't move. Let me check the button state and whether the form action fires at all.
`requestSubmit()` works — the click quirk was a harness issue, not a product bug. Updating the E2E script to use requestSubmit.
**E2E pipeline fully GREEN** — sign-up → domain → beacons → identity resolution → dashboard → CSV export all working on the production build. One final visual spot-check on the announcement bar (after the Link swap).
All verification complete. Now the documentation workstream — PAD v1.13, README, AGENTS.md, CLAUDE.md.
Now the README updates.
Let me check the route count and add the R14 coverage bullet to the README testing section.
27 tree lines with the blog slug collapsed (10 paths) = 36 actual routes (was 34; +2 for the SEO route handlers). Updating the README count and adding the R14 coverage bullet.
Now AGENTS.md — the new non-obvious facts.
The AGENTS route-handler whitelist needs amending for the SEO routes.
Now CLAUDE.md — the v1.13 principle.
Now the plan execution log and worklog entries.
Now the worklog + repo script provenance. Let me check what evidence the repo tracks from prior rounds.
R12/R13 committed audit evidence to `research/`. Let me organize the R14 evidence, copy the patcher script into the repo, and write the worklog.
Let me add an evidence README and write the worklog entries.
Documentation complete. Now the ship phase — atomic commits. Let me review the full change set first.
4 atomic commits, tree clean. Now the pre-push protocol — secret scan + final gate.
The scan flagged worklog.md — let me check what matched and whether it's pre-existing.
Pre-existing email references only (no password, no key material — already in prior rounds' pushed history). Clean. Now the push — reconstruct the deploy key, dry-run via the wrapper.
Dry-run GREEN — would advance `57e51c3..66069e6`. Executing the real push.
Push verified and key shredded. Let me clean up the server daemon and finalize.
**Round-14 complete and shipped.** ✅

**What this round delivered** — the drift re-audit found the rendered DOM stable on every surface (landing sections byte-identical, banner scoping, sub-pages, dashboard all holding at R12/R13 parity), so Round-14 targeted the one surface no prior round had audited: the document `<head>`.

- **15 findings fixed via TDD** (+22 tests → **402/49**, gate green, 36 routes):
  - **Marketing heads**: every page now ships the live's verbatim title/description/og/twitter/canonical (rich per-page titles like "About Pixelco — The Team Behind B2C Visitor Identification", `|` suffix, `og:locale`, per-page canonicals) via a new `marketingMetadata()` builder; blog posts gained the live's distinct `metaDescription` field
  - **App bundle**: the live app's own og block ("Pixelco" / "Visitor identification platform dashboard") on login/signup/dashboard — with the `@Lovable` build artifact deliberately excluded
  - **Crawl surface**: `robots.txt` + `sitemap.xml` are now Route Handlers emitting the live's documents **byte-for-byte** (comments, namespaces, "1.0" priorities, the live's hand-authored order)
  - **Favicon**: the live's exact `/favicon.ico` bytes, no link tag
  - **404 title**: reproduces the live's client-side title swap (MutationObserver past Next's post-hydration metadata patch — a real framework quirk discovered en route) while keeping the correct HTTP 404
- **Verified**: 18/18 marketing surfaces match the live head field-for-field; E2E pipeline green (sign-up → domain → 25 beacons → dashboard → CSV export)
- **Shipped**: 4 atomic commits on main @ **66069e6** (push verified, key shredded), PAD v1.13

**Suggested next steps**: run a Round-15 spot-check after some time passes (live drift watch — especially the live's blog/legal copy, which updates as they publish), or spot-check the tab titles / social unfurl preview (paste a page URL into the Twitter card validator or Slack) to see the new og parity in action.
