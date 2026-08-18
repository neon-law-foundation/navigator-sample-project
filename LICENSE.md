# License

Copyright (C) 2026 Neon Law Foundation.

Navigator Sample Project is licensed under the **GNU Affero General Public
License, either version 3 or (at your option) any later version** —
[`LICENSE`](./LICENSE), or <https://www.gnu.org/licenses/agpl-3.0.html>.

```
SPDX-License-Identifier: AGPL-3.0-or-later
```

This program is free software: you may redistribute it and modify it under those
terms. It is distributed in the hope that it will be useful, but WITHOUT ANY
WARRANTY — without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
PARTICULAR PURPOSE. See the license for the details.

## What the network clause means here

Section 13 is the clause that distinguishes the AGPL from the plain GPL: if you
modify this program and let users interact with it **over a network**, those
users must be offered the corresponding source of your modified version. Not the
source of this repository — the source of what you actually deployed.

That clause is not incidental for this project. This is a browser portal that
Navigator serves over a network, which is precisely the arrangement section 13
was written for. Reading it as a formality that only applies to servers, because
the modified code runs in the visitor's browser rather than on a host, is the
mistake worth naming: what triggers the obligation is offering users interaction
with your modified version remotely, and a bundle streamed from an origin does
exactly that.

Running an unmodified copy triggers nothing. Reading it, forking it privately,
and building it locally trigger nothing. Deploying a *changed* version for other
people to use is the case with an obligation attached.

## Contributions

Unless you state otherwise, any contribution you intentionally submit for
inclusion in this work is licensed under the same AGPL-3.0-or-later terms, with
no additional conditions.

## What this license does not cover

The grant above covers the work the Foundation owns — the source in this
repository. It does not relicense the third-party libraries this application
depends on and bundles into `dist/`, which keep their own terms and their own
copyright holders:

| License | Bundled into the build |
| --- | --- |
| MIT | `react`, `react-dom`, the `@radix-ui/react-*` primitives, `clsx`, `tailwind-merge`, and `tailwindcss` (compiled into the emitted stylesheet) |
| ISC | `lucide-react`, `d3-force` |
| Apache-2.0 | `class-variance-authority` |

An AGPL work may incorporate permissively-licensed code, and doing so does not
relicense it; those notices travel with the build. The portal bundles no fonts
and fetches nothing off-origin, so no font or asset license rides along with it.

A copyleft license on this repository and permissive licenses on its
dependencies are not in conflict. The direction matters: copyleft flows
downstream to what includes this work, never upstream to what this work
includes.

## Applying the notice

[`LICENSE`](./LICENSE) is the AGPL-3.0 text as the Free Software Foundation
publishes it, byte for byte. Do not edit it, reflow it, or replace it with a
summary: the SPDX identifier above names *that* text, and a repository carrying
an approximation of it is not offering the terms it claims to.

Every source file carries a two-line notice:

```
Copyright (C) 2026 Neon Law Foundation.
SPDX-License-Identifier: AGPL-3.0-or-later
```

`src/main.tsx`, the entry point, states the notice in full — the form the license
itself recommends. Everything else carries the short form, which says the same
thing in the form tooling reads.

Section 13 makes one more thing necessary. Most people who use this program will
only ever receive the build, so the notice has to reach the build too, and each
published file needs its own way of keeping it:

| Published file | How the notice survives |
| --- | --- |
| `dist/index.html` | An HTML comment. Vite does not minify the document, so it lands as written. |
| `dist/assets/*.js` | The `portal-license-banner` plugin in `vite.config.ts`, which prepends it in `generateBundle` — after code generation, because the Oxc minifier drops comments and `output.banner` never reaches the emitted file. |
| `dist/assets/*.css` | A `/*!` legal comment in `src/index.css`, which the CSS minifier keeps. A plain `/*` would be stripped. |

[`src/test/license.test.ts`](./src/test/license.test.ts) asserts all of it: the
license text against its exact length and its own first and last lines, the
notice on every source file, and the notice in each of the three published files
above. Adding a source file without a notice fails `pnpm test`, and so does a
build configuration change that drops one on the way out.

## Trademarks

The license covers the code. It does not grant rights in the Neon Law or Neon
Law Foundation names, logos, or other trademarks. Fork this freely; do not imply
the Foundation endorses your fork.
