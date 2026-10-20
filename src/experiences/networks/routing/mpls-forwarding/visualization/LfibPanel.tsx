import type { MplsFrame } from '../logic/frames'
import type { LfibEntry, TopologyNode } from '../logic/model'

type LfibPanelProps = {
  node: TopologyNode
  entries: LfibEntry[]
  frame: MplsFrame
  // Editable tables must keep reference identity: frames and this panel read
  // the same lfib object, never a clone between them (see the page invariant).
  onOutLabelChange?: (entry: LfibEntry, value: number) => void
}

/*
 * One node's LFIB with the row that decided the current frame lit up. When the
 * lookup failed there is no row to light, so the frame's attempted key renders
 * as a ghost row of dashes: the packet stopped precisely there, at a port and
 * label no row claims.
 */
function LfibPanel({
  node,
  entries,
  frame,
  onOutLabelChange,
}: LfibPanelProps) {
  const showingFrameNode = frame.nodeId === node.id
  const lookupFailed = showingFrameNode && frame.action === 'dropped'

  return (
    <div className="mpls-lfib">
      <p className="mpls-lfib__title">LFIB — {node.label}</p>
      <table className="mpls-lfib__table">
        <thead>
          <tr>
            <th>Input port</th>
            <th>Input label</th>
            <th>Output port</th>
            <th>Output label</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => {
            const isActive = showingFrameNode && frame.entry === entry
            return (
              <tr
                key={`${entry.inPort}-${entry.inLabel}`}
                className={
                  isActive ? 'mpls-lfib__row mpls-lfib__row--active' : 'mpls-lfib__row'
                }
              >
                <td>{entry.inPort}</td>
                <td>{entry.inLabel}</td>
                <td>{entry.outPort}</td>
                <td>
                  {onOutLabelChange && typeof entry.outLabel === 'number' ? (
                    <input
                      className="mpls-lfib__label-input"
                      type="number"
                      aria-label={`${node.label} output label after ${entry.inPort}, label ${entry.inLabel}`}
                      value={entry.outLabel}
                      onChange={(event) =>
                        onOutLabelChange(entry, Number(event.target.value))
                      }
                    />
                  ) : (
                    entry.outLabel
                  )}
                </td>
              </tr>
            )
          })}
          {lookupFailed && (
            <tr className="mpls-lfib__row mpls-lfib__row--missing">
              <td>{frame.lookup.port}</td>
              <td>{frame.lookup.label}</td>
              <td>—</td>
              <td>—</td>
            </tr>
          )}
        </tbody>
      </table>
      {entries.length === 0 && !lookupFailed && (
        <p className="mpls-lfib__empty">No entries — not on any LSP</p>
      )}
    </div>
  )
}

export default LfibPanel
