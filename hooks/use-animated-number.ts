"use client"

import * as React from "react"

/**
 * Animates an integer toward `target`: on every change the displayed value
 * counts up/down through the intermediate numbers (eased, ~60fps via rAF).
 * Pair with `font-mono tabular-nums` so digits don't jitter horizontally.
 */
export function useAnimatedNumber(target: number, durationMs = 650): number {
  const [display, setDisplay] = React.useState(target)
  const fromRef = React.useRef(target)
  const frameRef = React.useRef(0)

  React.useEffect(() => {
    const from = fromRef.current
    if (from === target) return

    const start = performance.now()

    const tick = (now: number) => {
      const progress = Math.min((now - start) / durationMs, 1)
      const eased = 1 - Math.pow(1 - progress, 3) // easeOutCubic
      const value = Math.round(from + (target - from) * eased)
      setDisplay(value)
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick)
      } else {
        fromRef.current = target
      }
    }

    frameRef.current = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(frameRef.current)
      fromRef.current = target
    }
  }, [target, durationMs])

  return display
}
