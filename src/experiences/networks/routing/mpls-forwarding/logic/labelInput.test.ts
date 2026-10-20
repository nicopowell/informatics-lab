import { describe, expect, it } from 'vitest'
import { parseLabelInput } from './labelInput'

describe('parseLabelInput', () => {
  it('accepts a finished integer', () => {
    expect(parseLabelInput('18')).toBe(18)
    expect(parseLabelInput(' 42 ')).toBe(42)
    expect(parseLabelInput('0')).toBe(0)
  })

  it('rejects the empty box and anything that is not a whole number', () => {
    expect(parseLabelInput('')).toBeNull()
    expect(parseLabelInput('   ')).toBeNull()
    expect(parseLabelInput('1.5')).toBeNull()
    expect(parseLabelInput('-3')).toBeNull()
    expect(parseLabelInput('12a')).toBeNull()
  })
})
