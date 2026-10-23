import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'
import App from '@/App'

/*
 * No browser in this environment, so this is the functional check for the
 * delivery path: the real route tree, the real catalogue URL, the registered
 * page, its canvas, its controls and its content. Per-step behaviour is
 * covered by the logic, frames, layout and canvas suites.
 */
function renderExperienceRoute(): string {
  return renderToStaticMarkup(
    <MemoryRouter initialEntries={['/algorithms/trees/binary-search-tree']}>
      <App />
    </MemoryRouter>,
  )
}

describe('the binary-search-tree route', () => {
  it('resolves to the experience page through the catalogue URL', () => {
    const html = renderExperienceRoute()

    expect(html).toContain('Binary Search Tree')
    // Not the catalogue's "coming soon" placeholder for an unregistered id.
    expect(html).not.toContain('coming soon')
  })

  it('loads the search for the sample value by default', () => {
    const html = renderExperienceRoute()

    expect(html).toContain('Searching for 63. Press play to begin.')
    expect(html).toContain('aria-label="Binary search tree"')
    expect(html).toContain('>50<')
    expect(html).toContain('>87<')
    expect(html).not.toContain('bst-tree__node--active')
  })

  it('marks the loaded operation on its own button', () => {
    const html = renderExperienceRoute()

    expect(html.match(/binary-search-tree__op--active/g)).toHaveLength(1)
    expect(html).toContain('>Insert<')
    expect(html).toContain('>Search<')
    expect(html).toContain('value="63"')
  })

  it('offers the four tree presets and the playback band', () => {
    const html = renderExperienceRoute()

    expect(html).toContain('Ascending')
    // Four presets, two operation buttons and the code toggle.
    expect(html.match(/aria-pressed=/g)).toHaveLength(7)
    expect(html).toContain('aria-label="Play"')
    expect(html).toContain('Comparisons')
  })

  it('offers the graph-style zoom controls', () => {
    const html = renderExperienceRoute()

    expect(html).toContain('aria-label="Graph zoom"')
    expect(html).toContain('aria-label="Zoom in"')
    expect(html).toContain('aria-label="Zoom out"')
    // A dimensionless factor, so both box axes scale (see the CSS comment).
    expect(html).toContain('--bst-zoom:1"')
  })

  it('carries the concept text and the reference code below the tree', () => {
    const html = renderExperienceRoute()

    expect(html).toContain('keeps its values ordered by construction')
    expect(html).toContain('View code')
  })

  it('names every canvas state in a legend outside the zoom viewport', () => {
    const html = renderExperienceRoute()

    // The legend follows the zoom viewport's closing tag: it never zooms.
    expect(html).toContain('</div><ul class="legend">')
    expect(html.match(/<span class="legend__swatch/g)).toHaveLength(6)
    expect(html).toContain('swatch--node')
    expect(html).toContain('Discarded subtree')
    expect(html).toContain('Empty slot')
  })
})
