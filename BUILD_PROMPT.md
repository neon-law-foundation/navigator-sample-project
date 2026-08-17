# Prompt for the sample-project build session

Paste everything below the line into a fresh Claude Code session started in `~/NavigatorSampleProject`.
Delete this file once the app is built — it is scaffolding for the handoff, not part of the project.

---

You are working in `~/NavigatorSampleProject`, a git repository whose remote is already set to
`git@github.com:neon-law-foundation/navigator-sample-project.git`. It has one commit: a hand-written
`index.html` stub, a README, dual MIT/Apache-2.0 licenses, and a `.gitignore`. Nothing has been pushed yet.

## What this repository is

It is the **reference project application** for Navigator (`~/Navigator`, open source at
`github.com/neon-law-foundation/navigator`): a client portal for the fixture matter *Simpson v. Flanders*.

It has two audiences, and both matter:

1. **Contributors**, who read it to learn how to attach a React app to a matter. It is the worked example, so
   clarity beats cleverness everywhere they conflict.
2. **Navigator's own local development loop.** Navigator will clone this repository, run its build, and publish
   the resulting `dist/` into the local applications bucket at dev-server boot. So the build must be
   reproducible, offline-friendly after install, and must not require secrets.

## Your job

Rebuild `index.html` as a **Vite + React 19** application built on
[`@neon-law-foundation/navigator-ux`](https://github.com/neon-law-foundation/navigator-ux), which is checked out
at `~/navigator-ux`. Read that repository first — its README and `src/` are the source of truth for how its
components are meant to be used, and it is the same organization's work, so match its conventions rather than
inventing parallel ones.

Preserve what the current stub communicates: the matter name *Simpson v. Flanders*, the "trespass to land"
subtitle, a "where things stand" panel, a next-steps list, and the fixture-data disclaimer in the footer. Make it
genuinely better-looking than the stub — that is the point of building it on the library — but do not invent new
legal substance.

## Hard constraints — a build that violates any of these is broken

- **Vite `base` must be `/app/projects/simpsons/portal/`.** That is where Navigator mounts the bundle
  (`{project_code}/{application}`). A bundle built with a different base 404s on every asset.
- **The built `dist/index.html` must contain an element with `id="simpsons-portal-ready"`.** Navigator's browser
  walkthrough keys on it. Put it on something that only exists once the app has actually mounted.
- **Never hardcode a mount-absolute link** such as `/simpsons/…`. Derive links from the base or keep them
  relative. Hardcoded absolute paths are the most common way one of these bundles breaks under its real mount.
- **No backend, and no secrets.** This repository ships a static bundle. Navigator is the data layer: reads go
  through its `/app/api` read clusters and writes through its REST command boundary, same-origin, so the session
  cookie and participation gate apply automatically. Do not add a server, a proxy, or a database client.
- **No inline `<script>`.** The portal serve CSP is `script-src 'self'`; an inline script will be blocked. Vite's
  default hashed-asset output is fine — just do not inline anything.
- **Fixture data only.** *Simpson v. Flanders* is simulated. No real client data, real names, real addresses, or
  real phone numbers, ever. Non-firm email addresses use reserved example domains.
- **English only**, matching Navigator's own invariant.
- **Dual-licensed MIT OR Apache-2.0.** The license files are already in place; keep `package.json` consistent with
  them and do not add a dependency whose license conflicts.

## What `navigator-ux` expects of you

- Install with `pnpm` (the library pins `pnpm@11.17.0` and Node >= 22). React 19 is its only peer dependency.
- Import the stylesheet exactly once, at the app entry: `import '@neon-law-foundation/navigator-ux/styles.css'`.
  It carries the fonts, the tokens, and every component rule, and it fetches nothing at runtime.
- Compose its shell components rather than re-styling them. Start from `PublicShell`, `SiteHeader`, `SiteFooter`,
  `PageHeader`, and `Card`, and read `src/components` for the rest before writing any CSS of your own.
- Respect its three contracts, because they are why the library composes at all: themed components import no
  application module and take data and callbacks as props; navigable components take an `href` and render a plain
  anchor, so nothing imports a router; every color resolves through a `--nav-*` custom property rather than a
  literal.
- Typography is GORP Serif at 400 and 700 only. There is no medium and no semibold — hierarchy is size and color.
- `ThemeProvider` is optional and sets no styling. `SessionProvider` is for an app served behind the Navigator
  gateway, which reads verified claims from `/__session`; decide deliberately whether this sample needs it and say
  why in the README either way. Components must never verify a token themselves.

## Quality bar

Mirror the discipline in `~/navigator-ux`, at a scale that fits a sample app — do not cargo-cult all of it:

- `pnpm build` must produce a `dist/` that works under the real mount.
- Add `pnpm lint` (oxlint), `pnpm typecheck` (`tsc --noEmit`), and `pnpm test` (vitest) with a small number of
  tests that actually assert behavior — at minimum that the app renders and that the
  `simpsons-portal-ready` hook is present in the built output.
- Do not add a dependency you can avoid. The library is deliberately dependency-free; a sample that pulls in a
  component framework, a CSS framework, or a router teaches the opposite of the lesson.

## Deliverables

1. The Vite + React application, replacing the stub.
2. A `README.md` that keeps the existing "where it mounts" and "the one contract" sections accurate, and adds how
   to develop and build locally.
3. Conventional-commit history, signed. Do **not** push — the GitHub repository may not exist yet, and pushing is
   the human's call.
4. Tell the human, explicitly, what you did not do and what you left for them.

## One thing to check before you start

Confirm the mount path and the ready-hook id against Navigator itself rather than trusting this prompt — read
`store/src/seed.rs` in `~/Navigator` (search for `SIMPSONS_PORTAL_INDEX` and `simpsons/portal`). If this prompt
and the code disagree, the code wins, and say so.
