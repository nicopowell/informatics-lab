import { describe, expect, it } from 'vitest'
import {
  createConvoyProcesses,
  createRandomProcesses,
} from './workloads'

function rngFrom(values: number[]): () => number {
  let index = 0
  return () => values[index++ % values.length]
}

describe('createRandomProcesses', () => {
  it('returns the requested count with ids, arrivals and bursts in range', () => {
    const processes = createRandomProcesses(6)

    expect(processes).toHaveLength(6)
    expect(processes[0].arrival).toBe(0)
    for (let index = 0; index < processes.length; index++) {
      expect(processes[index].id).toBe(`P${index + 1}`)
      expect(Number.isInteger(processes[index].burst)).toBe(true)
      expect(processes[index].burst).toBeGreaterThanOrEqual(2)
      expect(processes[index].burst).toBeLessThanOrEqual(5)
      if (index > 0) {
        expect(processes[index].arrival).toBeGreaterThanOrEqual(processes[index - 1].arrival)
      }
    }
  })

  it('is deterministic through the injected rng', () => {
    const processes = createRandomProcesses(3, rngFrom([0, 0.5, 0.25, 0.99, 0.75]))

    expect(processes).toEqual([
      { id: 'P1', arrival: 0, burst: 2 },
      { id: 'P2', arrival: 2, burst: 3 },
      { id: 'P3', arrival: 5, burst: 5 },
    ])
  })
})

describe('createConvoyProcesses', () => {
  it('returns a fresh copy of the convoy workload', () => {
    expect(createConvoyProcesses()).not.toBe(createConvoyProcesses())
    expect(createConvoyProcesses()).toHaveLength(5)
  })
})
