import { MAX_SPEED, MIN_SPEED } from './PlaybackControls'

/*
 * The speed-to-delay ramp shared by every playback page: a geometric curve
 * keeps low speeds genuinely slow and high speeds genuinely fast, with a
 * comfortable pace around the default. The slowest and fastest delays stay
 * per experience — the tuning is policy, the curve is mechanism.
 */
export function frameDelay(speed: number, slowest: number, fastest: number): number {
  const ratio = (speed - MIN_SPEED) / (MAX_SPEED - MIN_SPEED)
  return Math.round(slowest * Math.pow(fastest / slowest, ratio))
}
