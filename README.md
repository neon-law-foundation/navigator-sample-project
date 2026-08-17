# Navigator Sample Project

The reference **project application** for [Navigator](https://github.com/neon-law-foundation/navigator): a client
portal for the fixture matter *Simpson v. Flanders*, built with
[`@neon-law-foundation/navigator-ux`](https://github.com/neon-law-foundation/navigator-ux).

It exists so that "attach a React app to a matter" has a worked example a contributor can read, clone, and copy —
and so Navigator's own local development loop has something real to build and serve instead of a hardcoded HTML
string.

**Everything here is fixture data.** *Simpson v. Flanders* is a simulated matter. No client data belongs in this
repository, ever.

## Where it mounts

Navigator serves this bundle at:

```
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
it needs no exception: `navigator-ux` self-hosts its fonts and fetches nothing at runtime.

## The one contract Navigator depends on

The bundle must show that it actually mounted, through an element with:

```html
id="simpsons-portal-ready"
```

React renders it, on the case head's kicker, so it exists **only once the app has mounted** — which is the point
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
| `pnpm test` | vitest. **Needs a build first** — the bundle gate asserts on real output and fails loudly rather than skipping. |
| `pnpm check` | lint, typecheck, build, test, in that order. |

> **No `pnpm-lock.yaml` yet.** `@neon-law-foundation/navigator-ux` is not published to npm, so there is no
> registry version to resolve a lockfile against and `pnpm install` cannot succeed from a clean clone. Run
> `pnpm install` and commit the lockfile as soon as the library ships — `navigator dev sample-project` installs
> with `--frozen-lockfile` and will not build without one. Until then, a local checkout can install from a
> `pnpm pack` tarball of the library; pnpm's pre-run dependency check will want an install it cannot do, so run
> the tools directly (`./node_modules/.bin/tsc --noEmit`, `node node_modules/vite/bin/vite.js build`,
> `node node_modules/vitest/vitest.mjs run`) or set `verify-deps-before-run=false` in a local `.npmrc`.

Navigator builds this repository the same way. `navigator dev sample-project` clones it into a temporary
directory, runs `pnpm install --frozen-lockfile` and `pnpm build`, and stages the resulting `dist/` under
`.devx/sample-project/dist`; the next `web` boot publishes every file in it to the applications bucket, entry
document last.

## What it is made of

```
index.html        the Vite template — no inline script, ever
src/main.tsx      the entry: the library stylesheet, imported once, and the mount
src/App.tsx       the whole portal, composed from navigator-ux
src/matter.ts     the fixture data, kept out of the components that render it
src/mount.ts      links derived from the base rather than written out
```

There is **no stylesheet in this repository**. Every surface is a `navigator-ux` component reading the `--nav-*`
token contract, which is what keeps this bundle looking like the Navigator page that linked to it. If a layout
need turns up that the library cannot express, the fix belongs in the library.

The only runtime dependencies are React 19 and the library. A sample that pulled in a router, a CSS framework,
or a component kit would teach the opposite of the lesson.

### `SessionProvider` is deliberately absent

`SessionProvider` reads verified claims from `/__session`, an endpoint the Pingora gateway publishes in front of
an app it fronts. This bundle is not behind that gateway: Navigator streams it from its own origin, and the
session check and the participation gate have both already run before the first byte arrives. There is no
`/__session` at this mount to read, and this portal renders nothing that varies by who is looking — so wrapping
in it would buy a failing fetch and no behavior.

A portal that *does* vary by reader adds it, and still never verifies a token itself. Reads go through
Navigator's `/app/api` and writes through its REST command boundary, same-origin, so the session cookie and the
participation gate apply without any code here doing anything to earn them.

`ThemeProvider` is absent for a simpler reason: it sets no styling. The color scheme follows the operating
system through a media query in the library's tokens, so there is nothing for it to do.

## License

Dual-licensed under [MIT](./LICENSE-MIT) or [Apache-2.0](./LICENSE-APACHE), at your option. See
[LICENSE.md](./LICENSE.md).

```
SPDX-License-Identifier: MIT OR Apache-2.0
```
