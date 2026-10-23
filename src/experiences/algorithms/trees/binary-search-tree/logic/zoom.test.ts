import { describe, expect, it } from 'vitest'
import { ZOOM_LEVELS, zoomPercent, zoomStep } from './zoom'

describe('zoomStep', () => {
  it('steps one level at a time from the default', () => {
    expect(zoomStep(1, 1)).toBe(1.25)
    expect(zoomStep(1, -1)).toBe(0.75)
  })

  it('clamps at both ends of the ladder', () => {
    expect(zoomStep(ZOOM_LEVELS[0], -1)).toBe(ZOOM_LEVELS[0])
    expect(zoomStep(ZOOM_LEVELS[ZOOM_LEVELS.length - 1], 1)).toBe(
      ZOOM_LEVELS[ZOOM_LEVELS.length - 1],
    )
  })

  it('resets an unknown level onto the ladder before stepping', () => {
    expect(zoomStep(1.37, 1)).toBe(1.25)
  })
})

describe('zoomPercent', () => {
  it('formats the level as a whole percent', () => {
    expect(zoomPercent(1)).toBe('100%')
    expect(zoomPercent(1.25)).toBe('125%')
  })
})
