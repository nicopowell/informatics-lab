// The LFIB label editor keeps raw text locally while typing and commits only
// on blur or Enter, so this parser decides what a finished edit means: a
// trimmed integer passes, an empty or garbled box means "no change".
// An MPLS label is a 20-bit field: nothing above 1048575 can appear on the
// wire, so the editor reverts a bigger number like any other typo.
const MAX_LABEL = 1048575

export function parseLabelInput(text: string): number | null {
  const trimmed = text.trim()
  if (trimmed === '') return null
  const value = Number(trimmed)
  // MPLS labels are unsigned: a minus sign is a typo, not a label.
  if (!Number.isInteger(value) || value < 0 || value > MAX_LABEL) return null
  return value
}
