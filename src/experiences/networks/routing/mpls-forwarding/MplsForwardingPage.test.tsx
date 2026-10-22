import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'
import App from '@/App'

/*
 * No browser is available in this environment, so this is the functional check
 * for the whole delivery path: the real route tree, the real URL the catalogue
 * links to, and the registered page with its graph, LFIB panel and narration.
 * It proves the experience is reachable and mounts; the numbers it renders are
 * covered by the logic and component suites.
 */
function renderExperienceRoute(): string {
  return renderToStaticMarkup(
    <MemoryRouter initialEntries={['/networks/routing/mpls-forwarding']}>
      <App />
    </MemoryRouter>,
  )
}

describe('the MPLS forwarding route', () => {
  it('resolves to the page through the catalogue URL', () => {
    const html = renderExperienceRoute()

    expect(html).toContain('MPLS Forwarding')
    // Not the catalogue's "coming soon" placeholder for an unregistered id.
    expect(html).not.toContain('coming soon')
    // The graph sits in its zoom viewport: fit is the default and the
    // controls step through the levels from logic/zoom.ts.
    expect(html).toContain('aria-label="Graph zoom"')
    expect(html).toContain('aria-label="Zoom in"')
    expect(html).toContain('aria-label="Zoom out"')
    expect(html).toContain('mpls__graph-zoom')
  })

  it('opens on the source terminal with the no-table note on screen', () => {
    const html = renderExperienceRoute()

    expect(html).toContain('PC-A sends 10.0.7.0/24 to gateway LER-A')
    expect(html).toContain('Terminal device — no forwarding table')
    expect(html).toContain('Push / swap / pop') // page-owned counter label
    expect(html).toContain('Restore LFIB')
  })
})
