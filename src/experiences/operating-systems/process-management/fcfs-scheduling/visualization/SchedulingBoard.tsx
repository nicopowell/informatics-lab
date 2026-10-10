import { useEffect, useRef } from 'react'
import type { CSSProperties } from 'react'
import type { Process } from '../../workloads'
import type { FcfsVisualFrame } from '../logic/visualFrames'

type SchedulingBoardProps = {
  frame: FcfsVisualFrame
  processes: Process[]
  makespan: number
}

const HUE_COUNT = 6
// The cursor stays between these fractions of the visible Gantt window when
// the view scrolls along with it.
const CURSOR_MIN = 0.12
const CURSOR_MAX = 0.72

function hueClassName(index: number): string {
  return `fcfs-scheduling--hue-${(index % HUE_COUNT) + 1}`
}

function pluralUnits(units: number): string {
  return units === 1 ? '1 unit left' : `${units} units left`
}

function SchedulingBoard({ frame, processes, makespan }: SchedulingBoardProps) {
  const indexById = new Map(processes.map((process, index) => [process.id, index]))
  const processById = new Map(processes.map((process) => [process.id, process]))
  const hueOf = (id: string) => hueClassName(indexById.get(id) ?? 0)
  const ghostCells = Math.max(makespan - frame.cells.length, 0)
  const timeRatio = makespan > 0 ? frame.time / makespan : 0
  const scrollRef = useRef<HTMLDivElement>(null)

  // The Gantt scrolls horizontally when units cannot stay readable; keep the
  // cursor inside the visible window when it crosses either edge. `processes`
  // is a dependency because a new workload resets the cursor to t=0 while the
  // ratio may already be 0, and the view still has to scroll back to the start.
  useEffect(() => {
    const container = scrollRef.current
    if (!container) {
      return
    }
    const cursorPosition = timeRatio * container.scrollWidth
    const visibleOffset = cursorPosition - container.scrollLeft
    if (visibleOffset > container.clientWidth * CURSOR_MAX) {
      container.scrollLeft = cursorPosition - container.clientWidth * CURSOR_MAX
    } else if (visibleOffset < container.clientWidth * CURSOR_MIN) {
      container.scrollLeft = Math.max(cursorPosition - container.clientWidth * CURSOR_MIN, 0)
    }
  }, [timeRatio, frame.time, frame.kind, processes])

  return (
    <div className="fcfs-scheduling__board">
      <div className="fcfs-scheduling__gantt-scroll" ref={scrollRef}>
        <div
          className="fcfs-scheduling__gantt"
          style={{ '--gantt-units': makespan } as CSSProperties}
        >
          <div className="fcfs-scheduling__cells">
            {frame.cells.map((id, index) => {
              const classes = ['fcfs-scheduling__cell']
              if (id === null) {
                classes.push('fcfs-scheduling__cell--idle')
              } else {
                classes.push(hueOf(id))
              }
              return (
                <div key={index} className={classes.join(' ')}>
                  {id ?? '–'}
                </div>
              )
            })}
            {Array.from({ length: ghostCells }, (_, offset) => (
              <div
                key={`ghost-${offset}`}
                className="fcfs-scheduling__cell fcfs-scheduling__cell--ghost"
                aria-hidden="true"
              />
            ))}
          </div>
          <div className="fcfs-scheduling__axis" aria-hidden="true">
            {Array.from({ length: makespan }, (_, time) => (
              <span key={time} className="fcfs-scheduling__tick">
                {time % 5 === 0 ? time : ''}
              </span>
            ))}
          </div>
          <div
            className="fcfs-scheduling__cursor"
            style={{ left: `min(${timeRatio * 100}%, calc(100% - 3px))` }}
            aria-hidden="true"
          />
        </div>
      </div>

      <div className="fcfs-scheduling__tracks">
        <div className="fcfs-scheduling__track">
          <span className="fcfs-scheduling__track-label">CPU</span>
          {frame.running ? (
            <span
              className={`fcfs-scheduling__chip fcfs-scheduling__chip--focus ${hueOf(frame.running.id)}`}
            >
              {frame.running.id}
              <span className="fcfs-scheduling__chip-note">
                {frame.kind === 'complete'
                  ? 'finished'
                  : pluralUnits(frame.running.unitsLeft)}
              </span>
            </span>
          ) : (
            <span className="fcfs-scheduling__chip fcfs-scheduling__chip--empty">
              {frame.kind === 'ready' ? 'waiting to start' : 'free'}
            </span>
          )}
        </div>

        <div className="fcfs-scheduling__track">
          <span className="fcfs-scheduling__track-label">Ready queue</span>
          {frame.queue.length === 0 ? (
            <span className="fcfs-scheduling__chip fcfs-scheduling__chip--empty">empty</span>
          ) : (
            frame.queue.map((id) => {
              const process = processById.get(id)
              const waiting = process ? frame.time - process.arrival : 0
              return (
                <span key={id} className={`fcfs-scheduling__chip ${hueOf(id)}`}>
                  {id}
                  <span className="fcfs-scheduling__chip-note">+{waiting}</span>
                </span>
              )
            })
          )}
        </div>
      </div>

      <div className="fcfs-scheduling__metrics">
        <table className="fcfs-scheduling__table">
          <thead>
            <tr>
              <th>Process</th>
              <th>
                <span className="fcfs-scheduling__th-wide">Arrival</span>
                <span className="fcfs-scheduling__th-narrow">Arr</span>
              </th>
              <th>Burst</th>
              <th>
                <span className="fcfs-scheduling__th-wide">Status</span>
                <span className="fcfs-scheduling__th-narrow">State</span>
              </th>
              <th>
                <span className="fcfs-scheduling__th-wide">Waiting</span>
                <span className="fcfs-scheduling__th-narrow">Wait</span>
              </th>
              <th>
                <span className="fcfs-scheduling__th-wide">Turnaround</span>
                <span className="fcfs-scheduling__th-narrow">Turn</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {processes.map((process) => {
              const completion = frame.completed.find(
                (finished) => finished.id === process.id,
              )
              const isRunning = frame.running?.id === process.id && !completion
              const isQueued = !completion && frame.queue.includes(process.id)
              const status = completion
                ? 'done'
                : isRunning
                  ? 'running'
                  : isQueued
                    ? 'waiting'
                    : 'pending'
              const waiting = completion
                ? String(completion.waiting)
                : isRunning && frame.running
                  ? String(frame.running.waiting)
                  : isQueued
                    ? String(frame.time - process.arrival)
                    : '—'

              return (
                <tr key={process.id}>
                  <td>
                    <span className={`fcfs-scheduling__process ${hueOf(process.id)}`}>
                      <span className="fcfs-scheduling__dot" />
                      {process.id}
                    </span>
                  </td>
                  <td>{process.arrival}</td>
                  <td>{process.burst}</td>
                  <td>
                    <span className={`fcfs-scheduling__status fcfs-scheduling__status--${status}`}>
                      {status}
                    </span>
                  </td>
                  <td>{waiting}</td>
                  <td>{completion ? completion.turnaround : '—'}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <ul className="fcfs-scheduling__legend">
        <li>
          <span className="fcfs-scheduling__legend-swatch fcfs-scheduling__legend-swatch--cursor" />
          Current time
        </li>
        <li>
          <span className="fcfs-scheduling__legend-swatch fcfs-scheduling__legend-swatch--idle" />
          CPU idle
        </li>
      </ul>
    </div>
  )
}

export default SchedulingBoard
