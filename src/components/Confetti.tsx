import { useMemo } from 'react'
import { motion } from 'framer-motion'

const COLORS = ['#00e5d0', '#ff2e9a', '#ffd93d', '#7c3aed', '#ffffff']

interface ConfettiProps {
  count?: number
  originY?: number
}

export function Confetti({ count = 60, originY = 40 }: ConfettiProps) {
  const pieces = useMemo(
    () =>
      Array.from({ length: count }).map((_, i) => ({
        id: i,
        x: (Math.random() - 0.5) * 320,
        y: -(Math.random() * 260 + 120),
        rotate: Math.random() * 720 - 360,
        color: COLORS[i % COLORS.length],
        delay: Math.random() * 0.12,
        size: Math.random() * 8 + 6,
      })),
    [count],
  )

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {pieces.map((p) => (
        <motion.span
          key={p.id}
          initial={{ opacity: 1, x: 0, y: 0, rotate: 0 }}
          animate={{ opacity: [1, 1, 0], x: p.x, y: [0, p.y * 0.4, p.y], rotate: p.rotate }}
          transition={{ duration: 1.1, delay: p.delay, ease: 'easeOut' }}
          style={{
            position: 'absolute',
            left: '50%',
            top: `${originY}%`,
            width: p.size,
            height: p.size * 0.5,
            borderRadius: 2,
            background: p.color,
          }}
        />
      ))}
    </div>
  )
}
