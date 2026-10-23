import { frameGeometry } from './layout'
import type { BstFrame } from './visualFrames'

// A point this close to an edge still reads as visible; only past it the
// view jumps, so small steps inside the window never jiggle the viewport.
const EDGE_MARGIN = 48

export type FollowTarget = {
  // The point in this frame's SVG user units, and the viewBox they belong to.
  point: { x: number; y: number }
  viewBox: { width: number; height: number }
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

/*
 * Where the zoom viewport should look after a frame change: the freshly
 * inserted node, else the empty slot a miss reached, else the node under the
 * spotlight — falling back to the root, or the canvas centre on an empty
 * tree. The frame's exact viewBox travels with the point, because mapping
 * user units into scroll pixels needs the canvas the frame actually drew.
 */
export function followTarget(frame: BstFrame): FollowTarget | null {
  const { layout, width, height, gap } = frameGeometry(frame)
  const viewBox = { width, height }

  if (frame.newNode !== null) {
    const node = layout.nodes.find(
      (candidate) => candidate.value === frame.newNode,
    )
    if (node !== undefined) {
      return { point: { x: node.x, y: node.y }, viewBox }
    }
  }
  if (gap !== null) {
    return { point: gap, viewBox }
  }
  if (frame.active !== null) {
    const node = layout.nodes.find(
      (candidate) => candidate.value === frame.active,
    )
    if (node !== undefined) {
      return { point: { x: node.x, y: node.y }, viewBox }
    }
  }
  const root = layout.nodes.find((candidate) => candidate.parent === null)
  if (root !== undefined) {
    return { point: { x: root.x, y: root.y }, viewBox }
  }
  return {
    point: { x: viewBox.width / 2, y: viewBox.height / 2 },
    viewBox,
  }
}

/*
 * Keeps the walked node inside the zoom viewport: after every frame change
 * the page asks where the scrollbars should be, and only answers with
 * movement when the point actually left the view (at fit nothing is
 * scrollable at all). Content extents come from the DOM's real
 * scrollWidth/scrollHeight, never from the zoom model. meet() letterboxes
 * one axis, so user units are scaled by the limiting factor and offset by
 * the leftover margin — landing on the pixels the reader sees.
 */
export function followScroll(
  point: { x: number; y: number },
  viewBox: { width: number; height: number },
  viewport: { width: number; height: number },
  content: { width: number; height: number },
  scroll: { left: number; top: number },
): { left: number; top: number } | null {
  if (content.width <= viewport.width && content.height <= viewport.height) {
    return null // fit or smaller: the whole drawing is already on screen
  }

  const scale = Math.min(
    content.width / viewBox.width,
    content.height / viewBox.height,
  )
  const renderedX = point.x * scale + (content.width - viewBox.width * scale) / 2
  const renderedY = point.y * scale + (content.height - viewBox.height * scale) / 2

  const visibleX =
    renderedX >= scroll.left + EDGE_MARGIN &&
    renderedX <= scroll.left + viewport.width - EDGE_MARGIN
  const visibleY =
    renderedY >= scroll.top + EDGE_MARGIN &&
    renderedY <= scroll.top + viewport.height - EDGE_MARGIN
  if (visibleX && visibleY) return null

  return {
    left: clamp(
      renderedX - viewport.width / 2,
      0,
      content.width - viewport.width,
    ),
    top: clamp(
      renderedY - viewport.height / 2,
      0,
      content.height - viewport.height,
    ),
  }
}
