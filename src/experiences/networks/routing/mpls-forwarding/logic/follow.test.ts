import { describe, expect, it } from 'vitest'
import { followScroll } from './follow'

// Viewport the size of the viewBox keeps the math in user units; content
// carries the real scroll extents the DOM reports (scrollWidth/scrollHeight).
const VIEWPORT = { width: 830, height: 300 }

describe('followScroll', () => {
  it('does nothing when the content is not larger than the viewport', () => {
    // At fit (100%) there is nothing to scroll, wherever the packet sits.
    expect(
      followScroll({ x: 800, y: 150 }, VIEWPORT, VIEWPORT, { left: 0, top: 0 }),
    ).toBeNull()
    expect(
      followScroll({ x: 10, y: 10 }, VIEWPORT, VIEWPORT, { left: 0, top: 0 }),
    ).toBeNull()
  })

  it('keeps silent while the packet is comfortably inside the visible area', () => {
    // Zoom 2: content 1660×600; point (300,100) renders at (600,200) — inside.
    const content = { width: 1660, height: 600 }
    expect(
      followScroll({ x: 300, y: 100 }, VIEWPORT, content, { left: 0, top: 0 }),
    ).toBeNull()
  })

  it('centers the packet once it leaves the viewport, clamped to the content', () => {
    // Zoom 2, point (800,150) renders at (1600,300): outside both axes.
    const content = { width: 1660, height: 600 }
    const target = followScroll(
      { x: 800, y: 150 },
      VIEWPORT,
      content,
      { left: 0, top: 0 },
    )

    // Desired center 1600−415 = 1185 exceeds the 830px of scrollable width.
    expect(target).toEqual({ left: 830, top: 150 })
  })

  it('treats the packet near an edge as still visible (margin)', () => {
    // Renders at x=560 in a 830-wide viewport: more than 48px from any edge.
    expect(
      followScroll({ x: 280, y: 150 }, VIEWPORT, VIEWPORT, { left: 0, top: 0 }),
    ).toBeNull()
  })
})
