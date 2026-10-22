/*
 * Which node's table the LFIB panel shows, and how node clicks change the
 * selection. Playback follows the packet while it runs; when stopped or
 * paused a selected node pins the panel — the selection survives playback
 * (it reapplies the moment playback stops) and survives table edits, and
 * only a new click changes it.
 */
export function panelNodeId(
  isPlaying: boolean,
  frameNodeId: string,
  selectedNodeId: string | null,
): string {
  if (isPlaying) return frameNodeId
  return selectedNodeId ?? frameNodeId
}

// Clicking the selected node again releases it: the panel goes back to
// following the packet frame by frame.
export function toggleSelection(current: string | null, clicked: string): string | null {
  return current === clicked ? null : clicked
}
