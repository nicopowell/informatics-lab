import { useEffect, useLayoutEffect, useRef } from 'react'

/**
 * Keeps the active cell of a horizontally scrollable matrix in view while a
 * visualization plays. On a phone the matrix scrolls by design, so without
 * this the moving pointer walks off screen and the viewer has to chase it.
 *
 * The container is the element with `overflow-x: auto`; the cell that matters
 * marks itself with a `data-active` attribute, which keeps this hook free of
 * any knowledge about the matrix structure. The browser's own
 * `behavior: 'smooth'` has an internal, unconfigurable duration, so the glide
 * is animated here instead: a fixed duration with an ease-in-out curve, which
 * leaves slowly and lands softly — that gentle arrival is what preserves the
 * sense of location when a step moves the pointer.
 *
 * The effect runs when the step changes — the caller passes the current frame
 * as that change signal (`stepToken`) — not when only the anchor index moves.
 * Two consecutive frames can share one anchor: binary search's ready frame and
 * its first probe both anchor on the initial midpoint, so keying on the index
 * alone would leave the viewer's manual scroll in place exactly when playback
 * starts, and only a later frame with a different anchor would pull it back.
 * The token is what recenters on the first step, while a manual scroll between
 * steps still lasts until the next step arrives. A retarget cancels the flight
 * in progress and starts from the current position, so it never jumps.
 * useLayoutEffect starts the glide before paint, so the viewport never flashes
 * the off-anchor position. The browser clamps scrollLeft every frame, and with
 * no overflow the centering is a no-op, so wide screens never move.
 */
const GLIDE_DURATION_MS = 600

// Exported for its test: the shape of this curve is the behavior the viewer
// feels — flat near the ends, steepest through the middle.
export function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

export function useActiveCellScroll(
  activeIndex: number | null,
  stepToken: unknown,
) {
  const containerRef = useRef<HTMLDivElement>(null)
  const frameRef = useRef<number | null>(null)

  useLayoutEffect(() => {
    const container = containerRef.current
    if (container === null || activeIndex === null) {
      return
    }

    const cell = container.querySelector<HTMLElement>('[data-active]')
    if (cell === null) {
      return
    }

    // Cancel first: even an already-centered anchor has to stop the flight in
    // progress, or that animation would keep scrolling toward its old target.
    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current)
      frameRef.current = null
    }

    // The target is computed from positions read right now, so retargeting a
    // glide still in flight lands on the correct cell: the cell moves with
    // the animated scroll exactly as this math expects.
    const box = container.getBoundingClientRect()
    const cellBox = cell.getBoundingClientRect()
    const from = container.scrollLeft
    const to =
      from + cellBox.left + cellBox.width / 2 - (box.left + container.clientWidth / 2)

    if (Math.abs(to - from) < 1) {
      return
    }

    const start = performance.now()
    const advance = (now: number) => {
      const progress = Math.min((now - start) / GLIDE_DURATION_MS, 1)
      container.scrollLeft = from + (to - from) * easeInOutCubic(progress)

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(advance)
      } else {
        frameRef.current = null
      }
    }
    frameRef.current = requestAnimationFrame(advance)
  }, [activeIndex, stepToken])

  // Leaving the screen mid-flight must stop the animation: a queued frame
  // would write scrollLeft to an element that no longer exists. Nulling the
  // ref also leaves StrictMode's dev double-invoke (cleanup, then effect
  // again) starting from a clean state instead of cancelling a stale id.
  useEffect(() => {
    return () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current)
        frameRef.current = null
      }
    }
  }, [])

  return containerRef
}
