import { render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { App } from '../App'
import { DOCUMENTS } from '../documents'
import { MOUNT } from '../mount'
import { AUTHORITIES } from '../research'
import { GRAPH_NODES } from '../soulContract'

/*
 * Count II's page.
 *
 * The view is selected by fragment, so these tests set `location.hash` before
 * rendering rather than reaching into the component — the same path a reader
 * takes, and the thing that would break if the routing changed.
 */

beforeEach(() => {
  window.location.hash = '#introduction'
})

afterEach(() => {
  window.location.hash = ''
})

describe('the introduction to Count II', () => {
  it('renders the count as the page heading', () => {
    render(<App />)

    expect(
      screen.getByRole('heading', { level: 1, name: 'Rescission of the Doughnut Instrument' }),
    ).toBeInTheDocument()
    expect(screen.getByText(/COUNT II · SIMPSON V\. FLANDERS/i)).toBeInTheDocument()
  })

  it('offers every section as a tab, with the introduction open first', () => {
    render(<App />)

    const tabs = screen.getAllByRole('tab')
    expect(tabs.map((tab) => tab.textContent?.trim())).toEqual([
      'The introduction',
      'The web',
      'Chronology',
      'The question',
      'Research',
      'Documents',
    ])
    expect(tabs[0]).toHaveAttribute('aria-selected', 'true')
  })

  it('draws every party, witness, and thing as a focusable node in the graph', async () => {
    const { user } = await openTab('The web')

    // One `role="button"` group per node, each reachable by keyboard: a graph
    // that can only be read with a mouse is a picture, not an interface.
    // Every node is labelled `<name> — <role>`; nothing else on the tab is.
    const nodes = screen.getAllByRole('button', { name: / — / })
    expect(nodes.length).toBe(GRAPH_NODES.length)

    for (const node of GRAPH_NODES) {
      expect(screen.getByRole('button', { name: `${node.label} — ${node.role}` })).toBeInTheDocument()
    }

    // The doughnut is pinned on open, so its detail is on the page already.
    expect(screen.getByText(/One glazed doughnut\. Consumed in two sittings/)).toBeInTheDocument()

    // Selecting the hidden term swaps the detail pane.
    await user.click(screen.getByRole('button', { name: /^The Hidden Term/ }))
    expect(screen.getByText(/The soul-conveyance term, allegedly baked into/)).toBeInTheDocument()
  })

  it('lists every document with the template it was rendered from', async () => {
    await openTab('Documents')

    for (const doc of DOCUMENTS) {
      expect(screen.getByRole('button', { name: doc.title })).toBeInTheDocument()
      // The provenance is the point of this tab: a reader should be able to see
      // which notation template produced the PDF they are looking at.
      expect(screen.getByText(doc.code)).toBeInTheDocument()
    }
  })

  it('links every document to a PDF under the mount', async () => {
    await openTab('Documents')

    for (const doc of DOCUMENTS) {
      const links = screen
        .getAllByRole('link')
        .filter((link) => link.getAttribute('href') === `${MOUNT}${doc.path}`)
      expect(links.length, `no link to ${doc.path}`).toBeGreaterThan(0)
    }
  })

  it('says on the face of the research tab that the authorities are real', async () => {
    await openTab('Research')

    expect(screen.getByText(/These citations are real/)).toBeInTheDocument()

    // Every authority carries its citation and a verbatim quote. The fixture is
    // invented; the law is not, and the page has to keep those apart.
    for (const authority of AUTHORITIES) {
      expect(screen.getByText(authority.cite)).toBeInTheDocument()
    }

    const midpageLinks = screen
      .getAllByRole('link')
      .filter((link) => link.getAttribute('href')?.includes('midpage.ai'))
    expect(midpageLinks.length).toBe(AUTHORITIES.length)
  })

  it('scrubs the doughnut through its three states', async () => {
    const { user } = await openTab('The introduction')

    expect(screen.getByRole('img', { name: 'The doughnut, whole' })).toBeInTheDocument()

    await user.click(screen.getByRole('radio', { name: 'One bite' }))
    expect(
      screen.getByRole('img', { name: 'The doughnut with a single bite taken from it' }),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('radio', { name: 'Finished' }))
    expect(screen.getByRole('img', { name: 'The doughnut, fully consumed' })).toBeInTheDocument()
  })
})

describe('the count on the overview', () => {
  it('links from the overview to the introduction', () => {
    window.location.hash = ''
    render(<App />)

    const link = screen.getByRole('link', { name: /Read the introduction to Count II/ })
    expect(link).toHaveAttribute('href', `${MOUNT}#introduction`)
  })

  it('no longer offers the Your matters link', () => {
    window.location.hash = ''
    render(<App />)

    const nav = screen.getByRole('navigation', { name: 'Portal sections' })
    expect(within(nav).queryByText(/Your matters/i)).toBeNull()
    expect(within(nav).getAllByRole('link').map((link) => link.textContent)).toEqual([
      'Overview',
      'Count II',
    ])
  })
})

/**
 * Render the portal and switch to one tab.
 *
 * Radix activates a trigger on pointer-down rather than click, which
 * `userEvent.click` reproduces and `fireEvent.click` does not — so this helper
 * exists partly to make sure every test reaches the panel the same way a reader
 * would.
 */
async function openTab(name: string) {
  const { default: userEvent } = await import('@testing-library/user-event')
  const user = userEvent.setup()
  render(<App />)
  await user.click(screen.getByRole('tab', { name }))
  return { user }
}
