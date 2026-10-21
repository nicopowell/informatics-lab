/*
 * Keeps the packet inside the zoom viewport: after every frame change the
 * page asks where the scrollbars should be so the packet's point is visible,
 * and only answers with movement when it actually left the view (or when the
 * content is scrollable at all — at fit there is nothing to scroll).
 *
 * Content extents come from the DOM's real scrollWidth/scrollHeight, never
 * from a zoom model: a grid box that renders wider than the visible column
 * would make viewport-based math swear the packet is on screen while the
 * stage has already clipped it away.
 */

const VIEWBOX_WIDTH = 830
const VIEWBOX_HEIGHT = 300
// A packet this close to an edge still reads as visible; only past it the
// view jumps, so small steps inside the window never jiggle the viewport.
const EDGE_MARGIN = 48

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

export function followScroll(
  point: { x: number; y: number }, // SVG user units, viewBox 830×300
  viewport: { width: number; height: number },
  content: { width: number; height: number },
  scroll: { left: number; top: number },
): { left: number; top: number } | null {
  if (content.width <= viewport.width && content.height <= viewport.height) {
    return null // fit or smaller: the whole drawing is already on screen
  }

  const renderedX = (point.x / VIEWBOX_WIDTH) * content.width
  const renderedY = (point.y / VIEWBOX_HEIGHT) * content.height

  const visibleX =
    renderedX >= scroll.left + EDGE_MARGIN &&
    renderedX <= scroll.left + viewport.width - EDGE_MARGIN
  const visibleY =
    renderedY >= scroll.top + EDGE_MARGIN &&
    renderedY <= scroll.top + viewport.height - EDGE_MARGIN
  if (visibleX && visibleY) return null

  return {
    left: clamp(renderedX - viewport.width / 2, 0, content.width - viewport.width),
    top: clamp(renderedY - viewport.height / 2, 0, content.height - viewport.height),
  }
}
