import react from '@vitejs/plugin-react'
// vitest/config re-exports defineConfig with the `test` block typed.
import { defineConfig } from 'vitest/config'

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

export default defineConfig({
  base: MOUNT,
  plugins: [react()],
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
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
  },
})
