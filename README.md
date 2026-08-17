# Navigator Sample Project

The reference **project application** for [Navigator](https://github.com/neon-law-foundation/navigator): a client
portal for the fixture matter *Simpson v. Flanders*, built with Vite, React 19, Tailwind CSS, and
shadcn-style components owned in this repository.

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
* **No webfont request.** The serif stack is system faces, so there is no font to fetch.
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

## Develop

Node >= 22 and pnpm 11 (`packageManager` pins the exact version).

```bash
pnpm install
pnpm dev        # http://localhost:5173/app/projects/simpsons/portal/
pnpm check      # what a contributor should run before pushing
```

The dev server serves under the real mount path, not `/`, because the base is baked in and a dev loop that
disagrees with production about where the app lives is a dev loop that hides base bugs.

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

Licensed under the [GNU Affero General Public License v3.0 or later](./LICENSE). See
[LICENSE.md](./LICENSE.md), which covers section 13 — deploy a **modified** version for other people to
use over a network and you owe those users its source — and the third-party terms this grant does not
reach: React, Tailwind CSS, the Radix primitives, `lucide-react`, and `d3-force` stay under their own MIT
and ISC licenses.

```text
SPDX-License-Identifier: AGPL-3.0-or-later
```
