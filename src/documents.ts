// Copyright (C) 2026 Neon Law Foundation.
// SPDX-License-Identifier: AGPL-3.0-or-later

/**
 * The documents in the matter.
 *
 * Both PDFs are real files produced by `navigator template render` from the
 * notation templates in `templates/neon_law/`, and `pnpm render:documents`
 * regenerates them. Nothing here is hand-authored PDF: if the prose in a
 * document is wrong, the template is wrong, and the fix is upstream of this
 * file.
 *
 * `path` is relative to the bundle mount. It is joined through `portalPath` at
 * the point of use rather than written absolute, for the same reason every
 * other link in this app is — a hardcoded `/app/projects/simpsons/...` breaks
 * silently the day the mount moves.
 *
 * These are static files beside the bundle **because this is the sample
 * project**. In Navigator the documents of a real matter are loaded from blob
 * storage, and that storage carries authorization rules tailored to the
 * Project: who may read a document is decided there, per project, rather than
 * by anything in a bundle the reader has already downloaded.
 *
 * That difference does not reach the viewer. `PdfViewer` takes a URL and reads
 * it same-origin, so the change is where `path` points — not how the document
 * is opened, painted, or searched.
 */

export interface MatterDocument {
  id: string
  title: string
  /** What it is, procedurally. */
  kind: string
  /** Path under the mount, without a leading slash. */
  path: string
  /** The notation template it was rendered from. */
  template: string
  /** The `code:` in that template's frontmatter. */
  code: string
  date: string
  dateLabel: string
  pages: number
  /** Why this document matters to Count II. */
  why: string
  status: 'served' | 'draft'
}

export const DOCUMENTS: MatterDocument[] = [
  {
    id: 'notice',
    title: 'Notice of Rescission',
    kind: 'Notice',
    path: 'documents/notice-of-rescission.pdf',
    template: 'templates/neon_law/nevada.md',
    code: 'rescission_notice__nevada',
    date: '2026-05-02',
    dateLabel: '2 May 2026',
    pages: 2,
    why: 'Served seventeen days after discovery. Prompt notice on discovery is what answers the laches half of the defense, and the date on this document is the proof of it.',
    status: 'served',
  },
  {
    id: 'affidavit',
    title: 'Affidavit of Lisa Simpson',
    kind: 'Affidavit',
    path: 'documents/affidavit-lisa-simpson.pdf',
    template: 'templates/neon_law/nevada_affidavit.md',
    code: 'witness_affidavit__nevada',
    date: '2026-06-11',
    dateLabel: '11 June 2026',
    pages: 2,
    why: 'The contemporaneous notebook, sworn to. It is the only evidence bearing directly on what Homer knew on 14 April 2026 — the fact the entire count turns on.',
    status: 'draft',
  },
]
