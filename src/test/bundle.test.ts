import { describe, expect, it } from 'vitest'

/*
 * The contract Navigator depends on, asserted against what `pnpm build`
 * actually emitted — not against what this source says it should emit.
 *
 * The built tree is read with `import.meta.glob` rather than `node:fs`, which
 * keeps Node's globals out of this project's types: nothing in a browser bundle
 * should be able to reach for `process`, and the way to guarantee that is to
 * never put it in scope.
 *
 * A missing `dist/` makes each glob empty, and the first assertion below fails
 * with the command to run. It deliberately does not self-skip: a gate that goes
 * green when it did not run is worse than no gate.
 */

const MOUNT = '/app/projects/simpsons/portal/'
const READY_HOOK = 'simpsons-portal-ready'
const BUILD_FIRST = 'no dist/ — run `pnpm build` before `pnpm test`, or run `pnpm check`'

const documents = import.meta.glob<string>('../../dist/index.html', {
  query: '?raw',
  import: 'default',
  eager: true,
})
const scripts = import.meta.glob<string>('../../dist/assets/*.js', {
  query: '?raw',
  import: 'default',
  eager: true,
})

// The rendered notation documents. Globbed as URLs rather than raw text: a PDF
// read as a string proves nothing, and its presence in the emitted tree is the
// whole assertion.
const pdfs = import.meta.glob('../../dist/documents/*.pdf', { eager: true })

const bundledJs = Object.values(scripts).join('\n')

/** The built entry document, or a failure naming the command that emits it. */
function builtDocument(): string {
  const html = Object.values(documents)[0]
  if (typeof html !== 'string') throw new Error(BUILD_FIRST)
  return html
}

describe('the built bundle', () => {
  it('emits an entry document and its hashed assets', () => {
    expect(builtDocument()).toContain('<!doctype html>')
    expect(Object.keys(scripts).length, BUILD_FIRST).toBeGreaterThan(0)
  })

  it('carries the ready hook Navigator keys on', () => {
    // The element itself is rendered by React, so it appears in the emitted
    // JavaScript rather than in the document — that is what makes it proof of
    // a successful mount. The built document names the hook so a check that
    // reads the published `index.html` alone can still find it.
    expect(builtDocument()).toContain(`content="${READY_HOOK}"`)
    expect(bundledJs).toContain(READY_HOOK)
  })

  it('joins every asset URL onto the mount', () => {
    // A bundle built with the wrong base 404s on every asset, and it does so
    // only once it is published, where nobody is watching a build log.
    const urls = Array.from(builtDocument().matchAll(/(?:src|href)="([^"]+)"/g)).map(
      (match) => match[1] ?? '',
    )

    expect(urls.length).toBeGreaterThan(0)
    for (const url of urls) {
      expect(url.startsWith(MOUNT), `${url} is not under ${MOUNT}`).toBe(true)
    }
  })

  it('inlines no script, because the portal CSP is `script-src \'self\'`', () => {
    expect(builtDocument()).not.toMatch(/<script(?![^>]*\ssrc=)[^>]*>[^]*?<\/script>/)
    expect(builtDocument()).not.toMatch(/\son[a-z]+="/)
  })

  it('ships the rendered notation documents', () => {
    // The portal links to these by path. They are committed artefacts rather
    // than build output, so nothing in `vite build` would notice them going
    // missing — this is the check that would.
    const names = Object.keys(pdfs).map((path) => path.split('/').pop())
    expect(names, BUILD_FIRST).toContain('notice-of-rescission.pdf')
    expect(names).toContain('affidavit-lisa-simpson.pdf')
  })

  it('loads no stylesheet or script from a CDN', () => {
    // Tailwind and every component are compiled into the hashed assets above.
    // A `cdn.tailwindcss.com` tag would work on a dev server and be blocked in
    // production, which is the failure this asserts against.
    expect(builtDocument()).not.toMatch(/cdn\./)
    expect(bundledJs).not.toMatch(/https?:\/\/cdn\./)
  })

  it('references nothing off-origin', () => {
    // Same reason: `default-src 'self'` blocks it, and a portal that fetches a
    // font from a CDN leaks which matter its reader is looking at.
    expect(builtDocument()).not.toMatch(/(?:src|href)="https?:\/\//)
  })
})
