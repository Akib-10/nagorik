import { useEffect, useRef, useState } from 'react'

// Animates a number from its current value up (or down) to `target`.
// Starts at 0, so the first load counts up from zero; if `target` changes later
// it continues from wherever it is. Honors "reduce motion" by jumping straight
// to the final number.
export default function useCountUp(target, duration = 1400) {
  const [value, setValue] = useState(0)
  const fromRef = useRef(0)

  useEffect(() => {
    const from = fromRef.current
    const reduceMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    let frame = 0
    let startedAt = null

    const step = (now) => {
      if (startedAt === null) startedAt = now
      const t = reduceMotion || from === target ? 1 : Math.min(1, (now - startedAt) / duration)
      const eased = 1 - Math.pow(1 - t, 3) // easeOutCubic: fast start, gentle landing
      const next = Math.round(from + (target - from) * eased)
      fromRef.current = next
      setValue(next)
      if (t < 1) frame = requestAnimationFrame(step)
    }

    frame = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frame)
  }, [target, duration])

  return value
}
