import { useState } from 'react'
import type { MplsFrame } from '../logic/frames'
import { parseLabelInput } from '../logic/labelInput'
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
 * The box a reader types into is local state: frames, the table and the
 * playback position change only when the edit is finished (blur or Enter),
 * because a committed edit resets the run and resetting per keystroke makes
 * two-digit labels impossible to type. An empty or garbled box reverts.
 */
function LabelEditor({
  node,
  entry,
  onOutLabelChange,
}: {
  node: TopologyNode
  entry: LfibEntry
  onOutLabelChange: (entry: LfibEntry, value: number) => void
}) {
  const [text, setText] = useState(String(entry.outLabel))

  // Restore LFIB (or any external rewrite) replaces the row: the box follows
  // it through the render-phase adjustment React recommends instead of an
  // effect that would fight the typing state.
  const [lastOutLabel, setLastOutLabel] = useState(entry.outLabel)
  if (lastOutLabel !== entry.outLabel) {
    setLastOutLabel(entry.outLabel)
    setText(String(entry.outLabel))
  }

  function commit() {
    const parsed = parseLabelInput(text)
    if (parsed === null || parsed === entry.outLabel) {
      setText(String(entry.outLabel))
      return
    }
    onOutLabelChange(entry, parsed)
  }

  return (
    <input
      className="mpls-lfib__label-input"
      type="number"
      aria-label={`${node.label} output label after port ${entry.inPort}, label ${entry.inLabel}`}
      value={text}
      onChange={(event) => setText(event.target.value)}
      onBlur={commit}
      onKeyDown={(event) => {
        if (event.key === 'Enter') commit()
      }}
    />
  )
}

/*
 * One router's LFIB with the row that decided the current frame lit up. When
 * the lookup failed there is no row to light, so the frame's attempted key
 * renders as a ghost row of dashes — only for 'no-entry', because a loop drop
 * never searched and entry-level faults light the row that made the decision.
 * Terminals hold no table at all: the panel says so instead of an empty grid.
 */
function LfibPanel({
  node,
  entries,
  frame,
  onOutLabelChange,
}: LfibPanelProps) {
  const showingFrameNode = frame.nodeId === node.id
  const ghost =
    showingFrameNode && frame.dropReason === 'no-entry' ? frame.lookup ?? null : null

  return (
    <div className="mpls-lfib">
      <p className="mpls-lfib__title">
        {node.kind === 'host' ? node.label : `LFIB — ${node.label}`}
      </p>
      {node.kind === 'host' ? (
        <p className="mpls-lfib__empty">Terminal device — no forwarding table</p>
      ) : (
        <>
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
                        <LabelEditor
                          node={node}
                          entry={entry}
                          onOutLabelChange={onOutLabelChange}
                        />
                      ) : (
                        entry.outLabel
                      )}
                    </td>
                  </tr>
                )
              })}
              {ghost && (
                <tr className="mpls-lfib__row mpls-lfib__row--missing">
                  <td>{ghost.port}</td>
                  <td>{ghost.label}</td>
                  <td>—</td>
                  <td>—</td>
                </tr>
              )}
            </tbody>
          </table>
          {entries.length === 0 && !ghost && (
            <p className="mpls-lfib__empty">No entries — not on any LSP</p>
          )}
        </>
      )}
    </div>
  )
}

export default LfibPanel
