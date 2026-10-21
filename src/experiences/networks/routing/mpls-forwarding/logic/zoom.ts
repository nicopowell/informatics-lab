/*
 * Zoom levels for the topology viewer. The default (1) is fit-to-column —
 * exactly what the graph looked like before any zoom existed, so the page's
 * format is untouched until someone presses a button. Zoom scales the SVG's
 * width; the scroll viewport around it turns the extra width into panning.
 */
export const ZOOM_LEVELS = [0.75, 1, 1.25, 1.5, 2] as const

export function zoomStep(current: number, direction: 1 | -1): number {
  const index = ZOOM_LEVELS.findIndex((level) => level === current)
  const base = index === -1 ? ZOOM_LEVELS.findIndex((level) => level === 1) : index
  const next = Math.min(Math.max(base + direction, 0), ZOOM_LEVELS.length - 1)
  return ZOOM_LEVELS[next]
}

export function zoomPercent(zoom: number): string {
  return `${Math.round(zoom * 100)}%`
}
