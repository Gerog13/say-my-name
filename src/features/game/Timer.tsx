import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface TimerProps {
  seconds: number
  total: number
  size?: number
}

export function Timer({ seconds, total, size = 132 }: TimerProps) {
  const radius = size / 2 - 8
  const circumference = 2 * Math.PI * radius
  const progress = total > 0 ? seconds / total : 0
  const danger = seconds <= 5

  const color = danger ? '#ff2e9a' : seconds <= 10 ? '#ffd93d' : '#00e5d0'

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="rgba(255,255,255,0.08)" strokeWidth={8} fill="none" />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={8}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          animate={{ strokeDashoffset: circumference * (1 - progress) }}
          transition={{ ease: 'linear', duration: 0.15 }}
          style={{ filter: `drop-shadow(0 0 8px ${color})` }}
        />
      </svg>
      <motion.span
        key={seconds}
        initial={danger ? { scale: 1.3 } : false}
        animate={{ scale: 1 }}
        className={cn(
          'absolute font-display font-extrabold text-stroke-black',
          danger ? 'text-magenta' : 'text-white',
        )}
        style={{ fontSize: size * 0.4 }}
      >
        {seconds}
      </motion.span>
    </div>
  )
}
