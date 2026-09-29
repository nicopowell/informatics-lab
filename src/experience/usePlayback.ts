import { useEffect, useRef, useState } from 'react'

export type Playback = {
  frameIndex: number
  isPlaying: boolean
  atStart: boolean
  atEnd: boolean
  togglePlay: () => void
  stepForward: () => void
  stepBackward: () => void
  reset: () => void
}

/*
 * Drives navigation through precomputed visual frames: the step position, the
 * playing state, the auto-advance timer and the play/pause, step and reset
 * actions shared by every experience.
 *
 * The optional onNavigate callback lets a visualization derive transition
 * information from the pair of frames involved. It is read through a ref so
 * that giving it a new identity on each render does not restart the timer.
 */
export function usePlayback(
  frameCount: number,
  delay: number,
  onNavigate?: (from: number, to: number) => void,
): Playback {
  const [frameIndex, setFrameIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const lastIndex = frameCount - 1

  const navigateRef = useRef(onNavigate)
  useEffect(() => {
    navigateRef.current = onNavigate
  }, [onNavigate])

  useEffect(() => {
    if (!isPlaying) {
      return
    }

    const timer = setTimeout(() => {
      const next = Math.min(frameIndex + 1, lastIndex)
      navigateRef.current?.(frameIndex, next)
      setFrameIndex(next)
      if (next >= lastIndex) {
        setIsPlaying(false)
      }
    }, delay)

    return () => clearTimeout(timer)
  }, [isPlaying, frameIndex, delay, lastIndex])

  function goTo(index: number) {
    const next = Math.min(Math.max(index, 0), lastIndex)
    navigateRef.current?.(frameIndex, next)
    setFrameIndex(next)
  }

  return {
    frameIndex,
    isPlaying,
    atStart: frameIndex === 0,
    atEnd: frameIndex >= lastIndex,
    togglePlay: () => setIsPlaying((playing) => !playing),
    stepForward: () => {
      setIsPlaying(false)
      goTo(frameIndex + 1)
    },
    stepBackward: () => {
      setIsPlaying(false)
      goTo(frameIndex - 1)
    },
    // Used when a new input invalidates the execution and when restarting.
    reset: () => {
      setIsPlaying(false)
      setFrameIndex(0)
    },
  }
}
