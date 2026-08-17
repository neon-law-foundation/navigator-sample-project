/**
 * navigator-sample-project — the reference project application for Navigator:
 * a client portal for the fixture matter Simpson v. Flanders.
 *
 * Copyright (c) 2026 Neon Law Foundation.
 * SPDX-License-Identifier: MIT OR Apache-2.0
 */

// The library stylesheet, imported exactly once, at the entry. It carries the
// fonts, the `--nav-*` token contract, and every component rule, and it fetches
// nothing at runtime — which is what lets it serve under a CSP with no
// off-origin sources.
import '@neon-law-foundation/navigator-ux/styles.css'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { App } from './App'

/*
 * The entry point.
 *
 * No `ThemeProvider`: it sets no styling, and the color scheme follows the
 * operating system through a media query in the library's tokens, so there is
 * nothing for it to do here.
 *
 * No `SessionProvider` either, deliberately. It reads verified claims from
 * `/__session`, an endpoint the Pingora gateway publishes in front of an app it
 * fronts. This bundle is not behind that gateway: Navigator streams it from its
 * own origin, and the session check and participation gate have already run
 * before the first byte arrives. There is no `/__session` at this mount to read,
 * and this portal renders nothing that varies by who is looking — so wrapping in
 * it would add a failing fetch and no behavior.
 */

const root = document.getElementById('root')
if (!root) throw new Error('portal: #root is missing from index.html')

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
