import { useMemo } from 'react'
import { motion } from 'framer-motion'

const COLORS = ['#00e5d0', '#ff2e9a', '#ffd93d', '#7c3aed', '#ffffff']

function Burst({ x, y, delay, color }: { x: number; y: number; delay: number; color: string }) {
  const sparks = useMemo(
    () =>
      Array.from({ length: 14 }).map((_, i) => {
        const angle = (i / 14) * Math.PI * 2
        return { dx: Math.cos(angle) * 70, dy: Math.sin(angle) * 70, id: i }
      }),
    [],
  )
  return (
    <div style={{ position: 'absolute', left: `${x}%`, top: `${y}%` }}>
      {sparks.map((s) => (
        <motion.span
          key={s.id}
          initial={{ opacity: 1, x: 0, y: 0, scale: 1 }}
          animate={{ opacity: [1, 1, 0], x: s.dx, y: s.dy, scale: 0.3 }}
          transition={{ duration: 1, delay, repeat: Infinity, repeatDelay: 1.4, ease: 'easeOut' }}
          style={{
            position: 'absolute',
            width: 7,
            height: 7,
            borderRadius: '50%',
            background: color,
            boxShadow: `0 0 8px ${color}`,
          }}
        />
      ))}
    </div>
  )
}

export function Fireworks() {
  const bursts = useMemo(
    () =>
      Array.from({ length: 6 }).map((_, i) => ({
        id: i,
        x: 15 + Math.random() * 70,
        y: 15 + Math.random() * 45,
        delay: Math.random() * 1.4,
        color: COLORS[i % COLORS.length],
      })),
    [],
  )
  return (
    <div className="pointer-events-none fixed inset-0 z-40 overflow-hidden">
      {bursts.map((b) => (
        <Burst key={b.id} {...b} />
      ))}
    </div>
  )
}
