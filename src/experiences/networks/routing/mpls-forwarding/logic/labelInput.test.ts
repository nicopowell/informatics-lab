import { describe, expect, it } from 'vitest'
import { parseLabelInput } from './labelInput'

describe('parseLabelInput', () => {
  it('accepts a finished integer', () => {
    expect(parseLabelInput('18')).toBe(18)
    expect(parseLabelInput(' 42 ')).toBe(42)
    expect(parseLabelInput('0')).toBe(0)
  })

  it('rejects labels that cannot exist on the wire', () => {
    // An MPLS label is a 20-bit field: nothing above 1048575 can be written.
    expect(parseLabelInput('1048576')).toBeNull()
    expect(parseLabelInput('1048575')).toBe(1048575)
  })

  it('rejects the empty box and anything that is not a whole number', () => {
    expect(parseLabelInput('')).toBeNull()
    expect(parseLabelInput('   ')).toBeNull()
    expect(parseLabelInput('1.5')).toBeNull()
    expect(parseLabelInput('-3')).toBeNull()
    expect(parseLabelInput('12a')).toBeNull()
  })
})
