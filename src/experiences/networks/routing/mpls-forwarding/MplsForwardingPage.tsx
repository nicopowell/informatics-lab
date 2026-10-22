import { useEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import AppShell from '@/components/AppShell'
import MarkdownDescription from '@/experience/MarkdownDescription'
import PlaybackControls from '@/experience/PlaybackControls'
import { frameDelay } from '@/experience/frameDelay'
import { usePlayback } from '@/experience/usePlayback'
import type { LfibEntry, Preset } from './logic/model'
import { generateFrames } from './logic/frames'
import { panelNodeId, toggleSelection } from './logic/panelView'
import { followScroll } from './logic/follow'
import { ZOOM_LEVELS, zoomPercent, zoomStep } from './logic/zoom'
import { MPLS_PRESET } from './logic/preset'
import NetworkGraph from './visualization/NetworkGraph'
import LfibPanel from './visualization/LfibPanel'
import description from './content/description.md?raw'
import '@/experience/experience.css'
import './mplsForwarding.css'

const INITIAL_SPEED = 5
const SLOWEST_DELAY = 1400
const FASTEST_DELAY = 90
const MAX_TRANSITION = 500

function MplsForwardingPage() {
  const [lfib, setLfib] = useState(MPLS_PRESET.lfib)
  const [speed, setSpeed] = useState(INITIAL_SPEED)
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [zoom, setZoom] = useState(1)

  // Frames and the LFIB panel must read the same lfib object: the panel lights
  // its active row by reference identity, so nothing here may clone the tables
  // between generation and render.
  const preset: Preset = useMemo(() => ({ ...MPLS_PRESET, lfib }), [lfib])
  const frames = useMemo(() => generateFrames(preset), [preset])

  const delay = frameDelay(speed, SLOWEST_DELAY, FASTEST_DELAY)
  const transition = Math.min(delay, MAX_TRANSITION)
  const playback = usePlayback(frames.length, delay)
  // The clamp mirrors in both directions: the playback index should not be
  // able to address outside the frame list. Every frame-index read below
  // uses this clamped value — playback.frameIndex is never consulted again.
  const frameIndex = Math.min(Math.max(playback.frameIndex, 0), frames.length - 1)
  const frame = frames[frameIndex]

  // The panel follows the packet while playback runs; once stopped or
  // paused, a node the user clicked pins it (see logic/panelView.ts).
  const shownNodeId = panelNodeId(
    playback.isPlaying,
    frame.nodeId,
    selectedNodeId,
  )
  const shownNode =
    preset.nodes.find((node) => node.id === shownNodeId) ?? preset.nodes[0]
  const packetNode =
    preset.nodes.find((node) => node.id === frame.nodeId) ?? preset.nodes[0]

  // Follow the packet across the zoomed viewport: when a new frame lands
  // outside the visible window, pan the view back to it (a no-op at fit,
  // where nothing is scrollable — logic/follow.ts owns the geometry).
  const viewportRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const viewport = viewportRef.current
    if (!viewport) return
    const target = followScroll(
      { x: packetNode.x, y: packetNode.y },
      { width: viewport.clientWidth, height: viewport.clientHeight },
      // The real scroll extents, never viewport×zoom: an element that
      // renders wider than the visible column would lie about both.
      { width: viewport.scrollWidth, height: viewport.scrollHeight },
      { left: viewport.scrollLeft, top: viewport.scrollTop },
    )
    if (target) {
      // One atomic scroll: two property sets in the same tick would let the
      // second (top) cancel the first's in-flight smooth animation — Chrome
      // cancels any running smooth scroll when a new one starts, which kept
      // the horizontal follow permanently at zero. The CSS scroll-behavior
      // (smooth, or auto under reduced-motion) picks the animation mode.
      viewport.scrollTo({ left: target.left, top: target.top })
    }
  }, [frameIndex, zoom, packetNode.x, packetNode.y])

  // Any table edit invalidates the current position in the execution.
  function replaceLfib(next: Record<string, LfibEntry[]>) {
    setLfib(next)
    playback.reset()
  }

  function handleOutLabelChange(entry: LfibEntry, outLabel: number) {
    if (!Number.isFinite(outLabel)) return
    replaceLfib(
      Object.fromEntries(
        Object.entries(lfib).map(([nodeId, rows]) => [
          nodeId,
          rows.map((row) => (row === entry ? { ...row, outLabel } : row)),
        ]),
      ),
    )
  }

  const visited = frames.slice(0, frameIndex + 1)
  // Every classify frame is exactly one push — the ingress is the only node
  // that runs it — so the counter keeps the three operations description.md
  // teaches while the frames keep the precise action name.
  const pushes = visited.filter((candidate) => candidate.action === 'classify').length
  const swaps = visited.filter((candidate) => candidate.action === 'swap').length
  const pops = visited.filter((candidate) => candidate.action === 'pop').length
  const counts = [
    { label: 'Frame', value: `${frameIndex + 1} / ${frames.length}` },
    { label: 'Label', value: frame.outLabel ?? frame.inLabel ?? '—' },
    { label: 'Push / swap / pop', value: `${pushes} / ${swaps} / ${pops}` },
  ]

  return (
    <AppShell
      className="experience mpls"
      style={{ '--step-duration': `${transition}ms` } as CSSProperties}
    >
      <div className="experience__layout">
        <div className="experience__stage">
          <section className="experience__visualization">
            <p className="experience__status" aria-live="polite">
              {frame.narration}
            </p>
            <div className="mpls__board">
              <div
                className="mpls__graph-zoomwrap"
                style={{ '--mpls-zoom': `${zoom * 100}%` } as CSSProperties}
              >
                <div className="mpls__zoom" role="group" aria-label="Graph zoom">
                  <button
                    type="button"
                    className="ui-button"
                    aria-label="Zoom out"
                    disabled={zoom === ZOOM_LEVELS[0]}
                    onClick={() => setZoom((level) => zoomStep(level, -1))}
                  >
                    −
                  </button>
                  <button
                    type="button"
                    className="ui-button"
                    aria-label="Reset zoom to 100%"
                    onClick={() => setZoom(1)}
                  >
                    {zoomPercent(zoom)}
                  </button>
                  <button
                    type="button"
                    className="ui-button"
                    aria-label="Zoom in"
                    disabled={zoom === ZOOM_LEVELS[ZOOM_LEVELS.length - 1]}
                    onClick={() => setZoom((level) => zoomStep(level, 1))}
                  >
                    +
                  </button>
                </div>
                <div className="mpls__graph-zoom" ref={viewportRef}>
                  <NetworkGraph
                    preset={preset}
                    frame={frame}
                    selectedNodeId={selectedNodeId}
                    onSelectNode={(nodeId) =>
                      setSelectedNodeId(toggleSelection(selectedNodeId, nodeId))
                    }
                  />
                </div>
              </div>
              <LfibPanel
                node={shownNode}
                entries={lfib[shownNode.id] ?? []}
                frame={frame}
                onOutLabelChange={handleOutLabelChange}
              />
            </div>
          </section>

          <div className="experience__controls">
            <PlaybackControls
              isPlaying={playback.isPlaying}
              atStart={playback.atStart}
              atEnd={playback.atEnd}
              counts={counts}
              speed={speed}
              onPlayPause={playback.togglePlay}
              onStepForward={playback.stepForward}
              onStepBackward={playback.stepBackward}
              onReset={playback.reset}
              onSpeedChange={setSpeed}
            />
            <div className="experience__input">
              {/* Restoring hands the preset's table object straight back, never
                  a clone: the disabled check above and the panel's active-row
                  lighting both rely on reference identity. */}
              <button
                type="button"
                className="ui-button"
                disabled={lfib === MPLS_PRESET.lfib}
                onClick={() => replaceLfib(MPLS_PRESET.lfib)}
              >
                Restore LFIB
              </button>
            </div>
          </div>

          <div className="experience__explanation">
            <MarkdownDescription source={description} />
          </div>
        </div>
      </div>
    </AppShell>
  )
}

export default MplsForwardingPage
