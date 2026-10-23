import { useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import AppShell from '@/components/AppShell'
import CodePanel from '@/experience/CodePanel'
import CodeToggle from '@/experience/CodeToggle'
import MarkdownDescription from '@/experience/MarkdownDescription'
import PlaybackControls from '@/experience/PlaybackControls'
import { frameDelay } from '@/experience/frameDelay'
import { usePlayback } from '@/experience/usePlayback'
import TreeCanvas from './visualization/TreeCanvas'
import TreeLegend from './visualization/TreeLegend'
import {
  generateInsertSteps,
  generateSearchSteps,
} from './logic/binarySearchTree'
import type { BstNode } from './logic/binarySearchTree'
import { createReadyFrame, toVisualFrames } from './logic/visualFrames'
import type { BstFrame } from './logic/visualFrames'
import { ZOOM_LEVELS, zoomPercent, zoomStep } from './logic/zoom'
import { followScroll, followTarget } from './logic/follow'
import { createTreePreset, TREE_PRESETS } from '../presets'
import type { TreePresetId } from '../presets'
import { BINARY_SEARCH_TREE_REFERENCE } from './content/binarySearchTreeReference'
import description from './content/description.md?raw'
import '@/experience/experience.css'
import './binarySearchTree.css'

const INITIAL_SPEED = 5
const SLOWEST_DELAY = 2500
const FASTEST_DELAY = 100
const MAX_TRANSITION = 500
const INITIAL_TARGET = 63

type OperationKind = 'search' | 'insert'

/*
 * An operation is always loaded: search by default, and the frames it will
 * play are ready before the first press. The frames snapshot the tree as it
 * was when the operation loaded, so an insert that plays to the end commits
 * its result exactly once (the committed flag) — and an insert abandoned
 * halfway never touches the tree.
 */
type Operation = {
  kind: OperationKind
  frames: BstFrame[]
  resultTree: BstNode | null
  committed: boolean
}

function buildOperation(
  kind: OperationKind,
  tree: BstNode | null,
  target: number,
): Operation {
  const ready = createReadyFrame(tree, target)
  if (kind === 'search') {
    const frames = [
      ready,
      ...toVisualFrames(generateSearchSteps(tree, target), tree),
    ]
    return { kind, frames, resultTree: tree, committed: true }
  }
  const { steps, root } = generateInsertSteps(tree, target)
  const frames = [ready, ...toVisualFrames(steps, tree, root)]
  return { kind, frames, resultTree: root, committed: false }
}

// Side names are derived from the comparison the frame just made — the same
// two numbers the algorithm compared, restated for the reader.
function describeFrame(frame: BstFrame, kind: OperationKind): string {
  switch (frame.kind) {
    case 'ready':
      return kind === 'search'
        ? `Searching for ${frame.target}. Press play to begin.`
        : `Inserting ${frame.target}. Press play to begin.`
    case 'compare':
      return `Comparing ${frame.target} with ${frame.active}.`
    case 'descend':
      if (frame.active === null) {
        return 'Moving to the next node.'
      }
      return frame.target < frame.active
        ? `${frame.target} < ${frame.active}: keep going left.`
        : `${frame.target} > ${frame.active}: keep going right.`
    case 'found': {
      const count =
        frame.comparisons === 1
          ? '1 comparison'
          : `${frame.comparisons} comparisons`
      return `Found ${frame.target} at this node with ${count}.`
    }
    case 'duplicate':
      return `${frame.target} is already in the tree: nothing changes.`
    case 'miss':
      if (frame.gap === null || frame.gap.parent === null) {
        return `The tree is empty: ${frame.target} is not in it.`
      }
      return `${frame.target} is not in the tree: it would go ${frame.gap.side} of ${frame.gap.parent}.`
    case 'inserted':
      if (frame.active === null) {
        return `${frame.target} became the root of the empty tree.`
      }
      return frame.target < frame.active
        ? `${frame.target} attached as the left child of ${frame.active}.`
        : `${frame.target} attached as the right child of ${frame.active}.`
  }
}

function BinarySearchTreePage() {
  const [presetId, setPresetId] = useState<TreePresetId>('initial')
  const [tree, setTree] = useState<BstNode | null>(() =>
    createTreePreset('initial'),
  )
  const [targetInput, setTargetInput] = useState(String(INITIAL_TARGET))
  const [target, setTarget] = useState(INITIAL_TARGET)
  const [operation, setOperation] = useState<Operation>(() =>
    buildOperation('search', tree, INITIAL_TARGET),
  )
  const [speed, setSpeed] = useState(INITIAL_SPEED)
  const [zoom, setZoom] = useState(1)
  const [showCode, setShowCode] = useState(false)

  const frames = operation.frames
  const totalComparisons = frames[frames.length - 1].comparisons
  const delay = frameDelay(speed, SLOWEST_DELAY, FASTEST_DELAY)
  const transition = Math.min(delay, MAX_TRANSITION)
  // The insert played to its last frame: its result becomes the tree the next
  // operation starts from. Decided in the navigation callback — the moment
  // playback actually lands on the final frame — because a setState inside an
  // effect would be a render-time write (react-hooks/set-state-in-effect).
  // Committed makes the write happen exactly once, however often it replays.
  function commitInsert(from: number, to: number): void {
    if (from === to || operation.kind !== 'insert' || operation.committed) {
      return
    }
    if (to !== frames.length - 1) {
      return
    }
    setOperation((current) =>
      current.committed ? current : { ...current, committed: true },
    )
    setTree(operation.resultTree)
  }

  const playback = usePlayback(frames.length, delay, commitInsert)
  const frame = frames[playback.frameIndex]
  const inputValid =
    targetInput.trim() !== '' && Number.isFinite(Number(targetInput))

  // Follow the walked node across the zoomed viewport: when a new frame lands
  // outside the visible window, pan back to it (a no-op at fit, where nothing
  // is scrollable — logic/follow.ts owns the geometry).
  const viewportRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const viewport = viewportRef.current
    if (!viewport) return
    const target = followTarget(frame)
    if (!target) return
    const next = followScroll(
      target.point,
      target.viewBox,
      { width: viewport.clientWidth, height: viewport.clientHeight },
      // The real scroll extents, never viewport×zoom: an element that
      // renders wider than the visible column would lie about both.
      { width: viewport.scrollWidth, height: viewport.scrollHeight },
      { left: viewport.scrollLeft, top: viewport.scrollTop },
    )
    if (next) {
      // One atomic scroll: two property sets in the same tick would let the
      // second (top) cancel the first's in-flight smooth animation.
      viewport.scrollTo({ left: next.left, top: next.top })
    }
  }, [playback.frameIndex, zoom, frame])

  function handleTargetInput(value: string) {
    setTargetInput(value)
    const parsed = Number(value)
    if (value.trim() === '' || !Number.isFinite(parsed)) {
      return
    }
    setTarget(parsed)
    setOperation(buildOperation(operation.kind, tree, parsed))
    playback.reset()
  }

  function handlePresetSelect(id: TreePresetId) {
    setPresetId(id)
    const next = createTreePreset(id)
    setTree(next)
    setOperation(buildOperation(operation.kind, next, target))
    playback.reset()
  }

  function loadOperation(kind: OperationKind) {
    setOperation(buildOperation(kind, tree, target))
    playback.reset()
  }

  const counts = [
    {
      label: 'Comparisons',
      value: `${frame.comparisons} / ${totalComparisons}`,
    },
  ]

  return (
    <AppShell
      className={
        showCode
          ? 'experience experience--with-code binary-search-tree'
          : 'experience binary-search-tree'
      }
      style={{ '--step-duration': `${transition}ms` } as CSSProperties}
    >
      <div className="experience__layout">
        <div className="experience__stage">
          <section className="experience__visualization">
            <p className="experience__status" aria-live="polite">
              {describeFrame(frame, operation.kind)}
            </p>
            <div
              className="binary-search-tree__zoomwrap"
              style={{ '--bst-zoom': zoom } as CSSProperties}
            >
              <div
                className="binary-search-tree__zoom"
                role="group"
                aria-label="Graph zoom"
              >
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
              <div className="binary-search-tree__canvas-zoom" ref={viewportRef}>
                <TreeCanvas
                  frame={frame}
                  finalFrame={frames[frames.length - 1]}
                />
              </div>
            </div>
            <TreeLegend />
            <CodeToggle open={showCode} onToggle={() => setShowCode((o) => !o)} />
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
              <label
                className="binary-search-tree__target"
                htmlFor="binary-search-tree-target"
              >
                <span className="experience__slider-label">Value</span>
                <input
                  id="binary-search-tree-target"
                  className="binary-search-tree__target-input"
                  type="number"
                  value={targetInput}
                  onChange={(event) => handleTargetInput(event.target.value)}
                />
              </label>
              <button
                type="button"
                className={
                  operation.kind === 'insert'
                    ? 'ui-button binary-search-tree__op binary-search-tree__op--active'
                    : 'ui-button binary-search-tree__op'
                }
                aria-pressed={operation.kind === 'insert'}
                disabled={!inputValid}
                onClick={() => loadOperation('insert')}
              >
                Insert
              </button>
              <button
                type="button"
                className={
                  operation.kind === 'search'
                    ? 'ui-button binary-search-tree__op binary-search-tree__op--active'
                    : 'ui-button binary-search-tree__op'
                }
                aria-pressed={operation.kind === 'search'}
                disabled={!inputValid}
                onClick={() => loadOperation('search')}
              >
                Search
              </button>
            </div>
            <div className="experience__presets">
              {TREE_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  className={
                    preset.id === presetId
                      ? 'ui-button binary-search-tree__preset binary-search-tree__preset--active'
                      : 'ui-button binary-search-tree__preset'
                  }
                  aria-pressed={preset.id === presetId}
                  title={preset.description}
                  onClick={() => handlePresetSelect(preset.id)}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          <div className="experience__explanation">
            <MarkdownDescription source={description} />
          </div>
        </div>

        <CodePanel languages={BINARY_SEARCH_TREE_REFERENCE} open={showCode} />
      </div>
    </AppShell>
  )
}

export default BinarySearchTreePage
