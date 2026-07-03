import { useEffect, useRef, useState } from 'react'
import { motion, useAnimationControls } from 'framer-motion'

export function AnimatedNumber({ value, className }: { value: number; className?: string }) {
  const [display, setDisplay] = useState(value)
  const prev = useRef(value)
  const controls = useAnimationControls()

  useEffect(() => {
    if (value === prev.current) return
    const from = prev.current
    const to = value
    prev.current = value
    const start = performance.now()
    const dur = 500
    let raf = 0
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / dur)
      setDisplay(Math.round(from + (to - from) * p))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    void controls.start({ scale: [1, 1.4, 1], transition: { duration: 0.4 } })
    return () => cancelAnimationFrame(raf)
  }, [value, controls])

  return (
    <motion.span animate={controls} className={className}>
      {display}
    </motion.span>
  )
}
