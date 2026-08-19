# Navigator Sample Project

The reference **project application** for [Navigator](https://github.com/neon-law-foundation/navigator): a client
portal for the fixture matter *Simpson v. Flanders*, built with Vite, React 19, Tailwind CSS, and
shadcn-style components owned in this repository — plus
[navigator-ux](https://github.com/neon-law-foundation/navigator-ux) on the documents tab, where it frames a
PDF viewer this repository owns.

It exists so that "attach a React app to a matter" has a worked example a contributor can read, clone, and copy —
and so Navigator's own local development loop has something real to build and serve instead of a hardcoded HTML
string.

**Everything here is fixture data.** *Simpson v. Flanders* is a simulated matter. No client data belongs in this
repository, ever.

## Where it mounts

Navigator serves this bundle at:

```text
/app/projects/simpsons/portal/
```

`simpsons` is the Project code; `portal` is a literal segment of Navigator's route, not an application name it
looks up — see `portal/src/project_portal.rs` in the Navigator repository. Navigator streams the bytes through
its own origin behind the session cookie and the participation gate; it never redirects to a signed URL, because
a signed URL is bearer-shareable and would not carry the session.

That has three consequences for this app:

1. **Vite `base` is baked at build time** and must be `/app/projects/simpsons/portal/`. A bundle built with the
   wrong base 404s on every asset. It is one named constant at the top of `vite.config.ts`.
2. **Never hardcode a mount-absolute link.** Write links relative to the base, or derive them — `src/mount.ts`
   is the whole of that job here, and `portalPath()` is what every in-bundle link goes through. Hardcoded
   `/simpsons/...` strings are the single most common way one of these bundles breaks under its real mount.
   Links to Navigator's *own* routes (`/app/projects`) stay absolute, because they are Navigator's paths rather
   than paths inside this bundle.
3. **Same-origin is the whole mechanism.** Because the bundle is served from Navigator's origin, its calls to
   Navigator's read and command APIs are session-gated automatically. There is no backend in this repository.

The serve CSP is `default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:
blob:; font-src 'self' data:; connect-src 'self'`. Nothing in this bundle is inline or off-origin, which is why
it needs no exception. That rules out a few things a vibe-coded prototype reaches for by default:

* **No `cdn.tailwindcss.com`.** Tailwind is compiled into the hashed CSS asset by `@tailwindcss/vite`. A CDN
  script tag works on the dev server and is blocked in production — the worst possible place to find out —
  so `src/test/bundle.test.ts` asserts the built output loads nothing from a CDN.
* **No webfont *request*.** There are two webfonts — Source Serif 4, vendored by navigator-ux under the OFL —
  and the build emits both as hashed assets under the mount, so `font-src 'self'` covers them. A font served
  from a CDN would be blocked here, and in an authenticated portal it would also be a third party watching
  every page of a matter.
* **No remote images.** The illustrations in `src/art.tsx` are original inline SVG, themed off the same
  variables as everything else. Hotlinking artwork would be the only thing in the bundle that could fail
  because of somebody else's server — and it would be somebody else's artwork.

## The one contract Navigator depends on

The bundle must show that it actually mounted, through an element with:

```html
id="simpsons-portal-ready"
```

React renders it, on the page kicker, so it exists **only once the app has mounted** — which is the point
of it. A static marker in `index.html` would report "ready" for a bundle that failed to boot, and Navigator's
browser walkthrough drives a real browser and waits on a CSS locator, so what it sees is the live DOM.

The built `index.html` also carries `<meta name="navigator-ready-hook" content="simpsons-portal-ready">`, so a
check that reads the published document rather than driving a browser still finds the contract it is looking
for. Both are asserted by `src/test/bundle.test.ts`, against what `pnpm build` actually emitted.

## Run it locally

Node >= 22 and pnpm 11 (`packageManager` pins the exact version). Two commands, from a clean clone:

```bash
pnpm install
```

```bash
pnpm dev
```

Then open the portal at its mount path — **not** `http://localhost:5173/`, which is outside the base and
serves nothing:

```text
http://localhost:5173/app/projects/simpsons/portal/
```

The PDF viewer is on the documents tab, which this link opens directly:

```text
http://localhost:5173/app/projects/simpsons/portal/#introduction
```

Pick **Documents** from the tab strip on that page. The first document opens in the viewer on arrival; the
cards beside it switch which one is open, and the toolbar carries page navigation, zoom, fit-to-width, and
find-in-document.

One thing worth knowing if the page looks stuck: pdf.js advances its render on `requestAnimationFrame`, which
browsers do not fire in a hidden or background tab. A viewer left in a background tab shows a blank page until
the tab is brought to the front, and then paints. That is pdf.js's behavior rather than this component's.

## Develop

```bash
pnpm check      # what a contributor should run before pushing
```

The dev server serves under the real mount path, not `/`, because the base is baked in and a dev loop that
disagrees with production about where the app lives is a dev loop that hides base bugs.

`pnpm install` needs no registry account, no token, and no `.npmrc`, including for navigator-ux: the library
is not published to npm, and this repository depends on the tarball attached to its
[GitHub Release](https://github.com/neon-law-foundation/navigator-ux/releases), which is public. The URL in
`package.json` pins one exact version, so upgrading is an edit to that URL rather than a range that widens on
its own, and `pnpm-lock.yaml` records the tarball's sha512 — a clean clone resolves the same bytes rather than
whatever the URL serves that day.

| Command | What it does |
| --- | --- |
| `pnpm dev` | Vite dev server, under the mount path. |
| `pnpm build` | `tsc --noEmit`, then the production bundle into `dist/`. |
| `pnpm lint` | oxlint. |
| `pnpm typecheck` | `tsc --noEmit` on its own. |
| `pnpm test` | vitest. **Needs a build first** — the bundle gate asserts on real output rather than skipping. |
| `pnpm check` | lint, typecheck, build, test, in that order. |
| `pnpm validate:templates` | `navigator validate templates` — the notation rule set, over `templates/`. |
| `pnpm render:documents` | Re-render each notation template to `public/documents/`. Needs the Navigator CLI. |

Navigator builds this repository the same way. `navigator dev sample-project` clones it into a temporary
directory, runs `pnpm install --frozen-lockfile` and `pnpm build`, and stages the resulting `dist/` under
`.devx/sample-project/dist`; the next `web` boot publishes every file in it to the applications bucket, entry
document last.

## What it is made of

```text
index.html                  the Vite template — no inline script, ever
src/main.tsx                the entry: the stylesheet, imported once, and the mount
src/index.css               Tailwind, plus the teal theme every component reads
src/App.tsx                 the shell, the fragment router, and the overview
src/IntroductionPage.tsx    Count II — six tabs
src/RelationshipGraph.tsx   the force-directed party/evidence web
src/PdfViewer.tsx           the document viewer: canvas, text layer, find bar
src/pdf.ts                  the pdf.js seam — worker wiring, opening, text extraction
src/art.tsx                 original inline SVG illustrations
src/components/ui/*         shadcn-style components, owned here
src/lib/utils.ts            `cn()` — clsx plus tailwind-merge
src/matter.ts               the fixture data for the trespass count
src/soulContract.ts         the fixture data for Count II, including the graph
src/research.ts             the authorities — real law, verified before it was written down
src/documents.ts            the rendered PDFs and the templates behind them
src/mount.ts                links derived from the base rather than written out
templates/neon_law/*.md     notation templates; the source of the PDFs
scripts/render-documents.sh `navigator template render`, once per template
```

### Styling

Semantic CSS variables in `src/index.css`, defined once for light and again for dark, with every component
styled against the semantic name rather than a color. Nothing in `src/components/ui` names a hue, so the teal
accent — and any future rebrand — is that one file. Dark mode follows the operating system through a media
query, so there is no theme state to hold and no flash of the wrong palette.

The components live here rather than arriving from a package, which is what shadcn is: you own the source, so
a component that needs to behave differently gets edited instead of wrapped.

The graph is the one place that reads variables directly through `var()` in SVG presentation attributes.
Utility classes cannot reach `fill` and `stroke` on arbitrary SVG children, and hardcoding hex there would
make it the only thing in the app that ignores the theme.

### Documents

The PDFs under `public/documents/` are not hand-authored. Each is rendered by `navigator template render` from
a notation template in `templates/neon_law/` — Markdown carrying a questionnaire and a workflow in its
frontmatter. The renderer validates against the same rule set as `navigator validate` and refuses a template
with any violation, so a PDF that exists is a template that passed.

They are **committed rather than generated during `vite build`**: this bundle has to build on a machine that
has never installed the Navigator CLI, and CI should not need a Rust toolchain to ship a React app. Re-run
`pnpm render:documents` whenever a template changes. `src/test/bundle.test.ts` asserts both PDFs reach `dist/`,
since nothing in the Vite build would notice them going missing.

### The viewer is ours

The documents tab reads its PDFs in a viewer this repository owns — `src/PdfViewer.tsx` — rather than in the
browser's built-in one or in the `PdfViewer` that navigator-ux ships. The library's is a leaf component by its
own contract: it takes a `src` and a `label` and renders a page. That is the right shape for a library and the
wrong one for this tab, where the viewer has to find a phrase across both pages, hold a zoom while the reader
switches documents, and degrade to a plain link when it cannot start. Owning it means those behaviors are
editable rather than wrapped.

What it does not own is the parsing. `pdfjs-dist` does that, in a worker, and the component is the chrome
around it: paint the page to a canvas, lay pdf.js's transparent text runs over it so the page can be selected
and read aloud, and keep the two in step through every zoom and page turn. Three things about that are load-
bearing enough to be worth knowing before editing it:

- **The worker is same-origin, and hashed.** `src/pdf.ts` imports it with Vite's `?url` suffix, so the build
  emits it as an asset under the mount. Left unset, pdf.js reaches for a CDN, `script-src 'self'` blocks it,
  and the reader gets a spinner that never resolves — which is why `bundle.test.ts` asserts the emitted worker
  and the URL that reaches it.
- **pdf.js is loaded on demand.** The import inside `loadPdfjs()` is dynamic, which splits the parser into its
  own chunk: a reader who never opens this tab never downloads it. It is nearly half the JavaScript in the
  build, so a static import anywhere in `src/pdf.ts` would quietly cost every other page. That is a test too.
- **One paint per canvas.** pdf.js locks a canvas for the duration of a render and throws if a second starts
  on it, and it releases that lock when a cancelled render *settles* rather than when `cancel()` returns. So a
  new paint cancels its predecessor and then waits for it. Skip the wait and the symptom is not an error — it
  is a page that paints and then never gets its text layer.

The find bar counts hits in the text pdf.js reports for each page, and highlights them by wrapping runs in the
rendered text layer. Those two can disagree: a match straddling two positioned runs is counted and turns the
page, but arrives unmarked. Counting from the page text rather than from the runs is what keeps the tally
honest in that case.

### The authorities are real

Everything about the matter is invented. The citations on the research tab are not: each was retrieved from
Midpage and checked against the opinion or statute text before it was written down, and every quote in
`src/research.ts` is verbatim. `Authority.verified` exists in the type so the page can say so on the face of
each card — a demo that blurs real law into fixture data teaches a reader to trust a citation because it
looked like one.

### There is no session code here

Navigator streams this bundle from its own origin, and the session check and the participation gate have both
already run before the first byte arrives. This portal renders nothing that varies by who is looking, so a
session fetch would buy a request and no behavior.

A portal that *does* vary by reader still never verifies a token itself. Reads go through Navigator's
`/app/api` and writes through its REST command boundary, same-origin, so the session cookie and the
participation gate apply without any code here doing anything to earn them.

### Routing is by fragment

`#introduction` selects the second view. A path-based route would need Navigator to serve `index.html` for
every sub-path under the mount, and it does not promise that — a deep link to `…/portal/introduction` would
404 in production while working fine under the dev server. A fragment is never sent to the origin, so every
view is a bookmarkable URL that cannot 404.

## License

Copyright (C) 2026 Neon Law Foundation. Licensed under the
[GNU Affero General Public License v3.0 or later](./LICENSE). [`LICENSE`](./LICENSE) is the license text
verbatim as the Free Software Foundation publishes it, and it is the only license file in this
repository — there is no summary of it to drift out of step. Every source file carries the matching SPDX
notice, and [`src/test/license.test.ts`](./src/test/license.test.ts) asserts all of it: the license text
against its exact length, the notice on every source file, and the notice in each file the build
publishes.

Section 13 is the clause that distinguishes the AGPL from the plain GPL, and it is not incidental for a
browser portal that Navigator serves over a network: deploy a **modified** version for other people to
use and you owe those users the corresponding source of what you deployed, not the source of this
repository. Running an unmodified copy, forking it privately, and building it locally trigger nothing.

That grant covers the work the Foundation owns. It does not relicense the third-party libraries this
application draws on, which keep their own terms and their own copyright holders:

| License | Library |
| --- | --- |
| AGPL-3.0-only | `@neon-law-foundation/navigator-ux` |
| MIT | `react`, `react-dom`, the `@radix-ui/react-*` primitives, `clsx`, `tailwind-merge`, and `tailwindcss` (compiled into the emitted stylesheet) |
| ISC | `lucide-react`, `d3-array`, `d3-force`, `d3-scale`, `d3-shape` |
| Apache-2.0 | `class-variance-authority`, `pdfjs-dist` |
| SIL OFL 1.1 | Source Serif 4 — the two woff2 files navigator-ux vendors, which this build emits and serves from the mount |

A copyleft license here and permissive licenses underneath are not in conflict: copyleft flows downstream
to what includes this work, never upstream to what this work includes. navigator-ux is the exception that
proves the rule — it is AGPL itself, which is the same license this repository already carries.

```text
SPDX-License-Identifier: AGPL-3.0-or-later
```
