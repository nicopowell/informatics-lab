import { describe, expect, it } from 'vitest'
import { panelNodeId, toggleSelection } from './panelView'

describe('panelNodeId', () => {
  it('follows the packet while playback runs, selection or not', () => {
    expect(panelNodeId(true, 'lsr-3', null)).toBe('lsr-3')
    expect(panelNodeId(true, 'lsr-3', 'lsr-5')).toBe('lsr-3')
  })

  it('pins the panel to the selection once playback is stopped or paused', () => {
    expect(panelNodeId(false, 'lsr-3', 'lsr-5')).toBe('lsr-5')
    expect(panelNodeId(false, 'pc-a', 'ler-b')).toBe('ler-b')
  })

  it('falls back to the packet node when nothing is selected', () => {
    expect(panelNodeId(false, 'ler-a', null)).toBe('ler-a')
  })
})

describe('toggleSelection', () => {
  it('selects on first click, releases on a second click of the same node', () => {
    expect(toggleSelection(null, 'lsr-2')).toBe('lsr-2')
    expect(toggleSelection('lsr-2', 'lsr-2')).toBeNull()
  })

  it('switches directly to another node', () => {
    expect(toggleSelection('lsr-2', 'lsr-5')).toBe('lsr-5')
  })
})
