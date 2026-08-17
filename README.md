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

The path is `{project_code}/{application}` — `simpsons` is the project code, `portal` is the application name.
Navigator streams the bytes through its own origin behind the session cookie and the participation gate; it never
redirects to a signed URL, because a signed URL is bearer-shareable and would not carry the session.

That has three consequences for this app:

1. **Vite `base` is baked at build time** and must be `/app/projects/simpsons/portal/`. A bundle built with the
   wrong base 404s on every asset.
2. **Never hardcode a mount-absolute link.** Write links relative to the base, or derive them. Hardcoded
   `/simpsons/...` strings are the single most common way one of these bundles breaks under its real mount.
3. **Same-origin is the whole mechanism.** Because the bundle is served from Navigator's origin, its calls to
   Navigator's read and command APIs are session-gated automatically. There is no backend in this repository.

## The one contract Navigator depends on

The built `dist/index.html` must contain an element with:

```html
id="simpsons-portal-ready"
```

Navigator's browser walkthrough keys on it to know the portal actually rendered. Keep it on something that only
exists once the app has mounted successfully.

## Status

`index.html` is the original hand-written stub, carried over from Navigator's seed so the current rendering is
preserved. It is the starting point, not the destination — the app is being rebuilt as a Vite + React 19 bundle on
`navigator-ux`.

## License

Dual-licensed under [MIT](./LICENSE-MIT) or [Apache-2.0](./LICENSE-APACHE), at your option. See
[LICENSE.md](./LICENSE.md).

```
SPDX-License-Identifier: MIT OR Apache-2.0
```
