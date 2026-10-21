import { useMemo, useState } from 'react'
import type { CSSProperties } from 'react'
import AppShell from '@/components/AppShell'
import MarkdownDescription from '@/experience/MarkdownDescription'
import PlaybackControls from '@/experience/PlaybackControls'
import { frameDelay } from '@/experience/frameDelay'
import { usePlayback } from '@/experience/usePlayback'
import type { LfibEntry, Preset } from './logic/model'
import { generateFrames } from './logic/frames'
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

  // Frames and the LFIB panel must read the same lfib object: the panel lights
  // its active row by reference identity, so nothing here may clone the tables
  // between generation and render.
  const preset: Preset = useMemo(() => ({ ...MPLS_PRESET, lfib }), [lfib])
  const frames = useMemo(() => generateFrames(preset), [preset])

  const delay = frameDelay(speed, SLOWEST_DELAY, FASTEST_DELAY)
  const transition = Math.min(delay, MAX_TRANSITION)
  const playback = usePlayback(frames.length, delay)
  // The clamp mirrors in both directions (R2-asymmetric-frame-clamp): the
  // playback index should not be able to address outside the frame list.
  const frameIndex = Math.min(Math.max(playback.frameIndex, 0), frames.length - 1)
  const frame = frames[frameIndex]
  const activeNode =
    preset.nodes.find((node) => node.id === frame.nodeId) ?? preset.nodes[0]

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

  const visited = frames.slice(0, playback.frameIndex + 1)
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
              <NetworkGraph preset={preset} frame={frame} />
              <LfibPanel
                node={activeNode}
                entries={lfib[frame.nodeId] ?? []}
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
