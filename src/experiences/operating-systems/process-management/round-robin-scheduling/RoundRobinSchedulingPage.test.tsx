import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'
import App from '@/App'

/*
 * No browser is available in this environment, so this is the functional check
 * for the whole delivery path: the real route tree, the real URL the catalogue
 * links to, the registered page, its board and its description. It proves the
 * experience is reachable and mounts; the numbers it renders are covered by the
 * logic and narration suites.
 */
function renderExperienceRoute(): string {
  return renderToStaticMarkup(
    <MemoryRouter
      initialEntries={[
        '/operating-systems/process-management/round-robin-scheduling',
      ]}
    >
      <App />
    </MemoryRouter>,
  )
}

describe('the round-robin route', () => {
  it('resolves to the scheduling page through the catalogue URL', () => {
    const html = renderExperienceRoute()

    expect(html).toContain('Round Robin Scheduling')
    // Not the catalogue's "coming soon" placeholder for an unregistered id.
    expect(html).not.toContain('coming soon')
  })

  it('starts with the quantum the page defaults to and an empty Gantt', () => {
    const html = renderExperienceRoute()

    // The ready frame is the first fact, and it names the parameter the whole
    // experience is about.
    expect(html).toContain('with a quantum of 2 units')
    expect(html).toContain('aria-label="Time slice length"')
    // Nothing has run yet: the Gantt shows only the units waiting to be filled.
    expect(html).toContain('scheduling-board__cell--ghost')
    expect(html).not.toContain('scheduling-board__chip--preempt')
  })

  it('carries the concept text below the visualization', () => {
    const html = renderExperienceRoute()

    expect(html).toContain('Round Robin dispatches in arrival order')
    expect(html).toContain('time slice')
  })
})
