import { describe, expect, it } from 'vitest'
import { easeInOutCubic } from './useActiveCellScroll'

describe('easeInOutCubic', () => {
  it('starts and ends exactly at the endpoints of the journey', () => {
    expect(easeInOutCubic(0)).toBe(0)
    expect(easeInOutCubic(1)).toBe(1)
  })

  it('passes through the midpoint at half the distance', () => {
    expect(easeInOutCubic(0.5)).toBeCloseTo(0.5, 10)
  })

  it('never leaves the 0..1 range', () => {
    for (let t = 0; t <= 1; t += 0.05) {
      expect(easeInOutCubic(t)).toBeGreaterThanOrEqual(0)
      expect(easeInOutCubic(t)).toBeLessThanOrEqual(1)
    }
  })

  it('always moves forward: the curve is strictly increasing', () => {
    let previous = easeInOutCubic(0)
    for (let t = 0.05; t <= 1; t += 0.05) {
      const current = easeInOutCubic(t)
      expect(current).toBeGreaterThan(previous)
      previous = current
    }
  })

  it('is gentle at both ends: small input steps move less than the middle', () => {
    // The whole point of the curve — the glide must leave slowly and land
    // softly, or the retargeted scroll will read as a jump.
    const startStep = easeInOutCubic(0.1) - easeInOutCubic(0)
    const middleStep = easeInOutCubic(0.6) - easeInOutCubic(0.5)
    const endStep = easeInOutCubic(1) - easeInOutCubic(0.9)

    expect(startStep).toBeLessThan(middleStep)
    expect(endStep).toBeLessThan(middleStep)
  })
})
