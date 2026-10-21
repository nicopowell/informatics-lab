import { describe, expect, it } from 'vitest'
import { ZOOM_LEVELS, zoomPercent, zoomStep } from './zoom'

describe('zoomStep', () => {
  it('walks up the levels and clamps at 200%', () => {
    let level = 1
    level = zoomStep(level, 1)
    expect(level).toBe(1.25)
    level = zoomStep(level, 1)
    expect(level).toBe(1.5)
    level = zoomStep(level, 1)
    expect(level).toBe(2)
    expect(zoomStep(level, 1)).toBe(2) // already at the top
  })

  it('walks down the levels and clamps at 75%', () => {
    const level = zoomStep(1, -1)
    expect(level).toBe(0.75) // one step down from fit
    expect(zoomStep(level, -1)).toBe(0.75) // already at the floor
  })

  it('treats a value outside the levels as fit', () => {
    expect(zoomStep(1.37, 1)).toBe(1.25) // snaps to fit first, then steps up
    expect(zoomStep(1.37, -1)).toBe(0.75)
  })
})

describe('zoomPercent', () => {
  it('renders the level as a whole percentage', () => {
    expect(zoomPercent(1)).toBe('100%')
    expect(zoomPercent(1.25)).toBe('125%')
    expect(zoomPercent(0.75)).toBe('75%')
  })
})

describe('ZOOM_LEVELS', () => {
  it('contains fit and never exceeds the documented range', () => {
    expect(ZOOM_LEVELS).toContain(1)
    expect(ZOOM_LEVELS[0]).toBeGreaterThanOrEqual(0.5)
    expect(ZOOM_LEVELS[ZOOM_LEVELS.length - 1]).toBeLessThanOrEqual(3)
  })
})
