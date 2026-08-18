// Copyright (C) 2026 Neon Law Foundation.
// SPDX-License-Identifier: AGPL-3.0-or-later

import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'
// vitest/config re-exports defineConfig with the `test` block typed.
import { defineConfig, type Plugin } from 'vitest/config'

/**
 * Where Navigator mounts this bundle, baked in at build time.
 *
 * `portal` is a literal segment of Navigator's route, not an application name
 * it looks up — see `portal/src/project_portal.rs` in the Navigator repository.
 * Vite joins every asset URL onto this base, so a bundle built with a different
 * one 404s on every asset the moment it is published. It is the single most
 * load-bearing line in this repository, which is why it is a named constant
 * with a comment rather than an inline string.
 *
 * The trailing slash is required: Navigator redirects the bare mount to the
 * slash form precisely because the base is joined directly onto it.
 */
const MOUNT = '/app/projects/simpsons/portal/'

/**
 * The license notice carried into the published bundle.
 *
 * Kept to the identifier and the source pointer rather than the full notice:
 * `LICENSE` in the repository is the terms, and a reader who has the SPDX tag
 * and a way to reach the source can get to them.
 */
const LICENSE_BANNER = `/*!
 * Simpson v. Flanders — Client Portal.
 * Copyright (C) 2026 Neon Law Foundation.
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * Source: https://github.com/neon-law-foundation/navigator-sample-project
 */`

/**
 * Prepend that notice to every emitted JavaScript chunk.
 *
 * `build.rollupOptions.output.banner` is the obvious place for this and does
 * nothing here: Vite 8 generates and minifies with Oxc, which drops the comment
 * on its way out. `generateBundle` sees the chunks after code generation, so a
 * notice added there is the notice that lands on disk.
 *
 * The stylesheet needs no equivalent — its notice is a `/*!` legal comment,
 * which the CSS minifier keeps — and `index.html` is not minified at all.
 */
function licenseBanner(): Plugin {
  return {
    name: 'portal-license-banner',
    generateBundle(_options, bundle) {
      for (const chunk of Object.values(bundle)) {
        if (chunk.type !== 'chunk') continue
        chunk.code = `${LICENSE_BANNER}\n${chunk.code}`
      }
    },
  }
}

export default defineConfig({
  base: MOUNT,
  plugins: [react(), tailwindcss(), licenseBanner()],
  resolve: {
    // `@/…` for `src/…`, which is the import style every shadcn component
    // ships with. Keeping it means a component pasted from the registry drops
    // in unedited.
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  build: {
    // Hashed asset names are what let Navigator serve every asset
    // `immutable` for a year while `index.html` stays `no-store`. Vite's
    // default output already does this; nothing here inlines a script,
    // because the portal serve CSP is `script-src 'self'`.
    sourcemap: false,
    emptyOutDir: true,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    // Vitest's default answers every stylesheet import with an empty string,
    // including a `?raw` one. `license.test.ts` reads the emitted stylesheet to
    // check the notice survived minification, and cannot do that against ''.
    css: true,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
  },
})
