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
repository. It does not relicense the third-party material this application
depends on and bundles into `dist/`, which keeps its own terms and its own
copyright holders:

- **`@neon-law-foundation/navigator-ux`** — MIT OR Apache-2.0. An AGPL work may
  incorporate permissively-licensed code, and doing so does not relicense it;
  its notices travel with the build.
- **Source Serif 4**, vendored inside that library and emitted into the bundle as
  two `woff2` files — SIL Open Font License 1.1. The OFL is not relicensable and
  does not become AGPL by being bundled here. `OFL.txt` ships beside the fonts
  because the license requires its notice to travel with them.

A copyleft license on this repository and permissive licenses on its
dependencies are not in conflict. The direction matters: copyleft flows
downstream to what includes this work, never upstream to what this work includes.

## Trademarks

The license covers the code. It does not grant rights in the Neon Law or Neon
Law Foundation names, logos, or other trademarks. Fork this freely; do not imply
the Foundation endorses your fork.
