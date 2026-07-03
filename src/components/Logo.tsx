import { motion } from 'framer-motion'

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="flex flex-col items-center"
    >
      <h1
        className={
          compact
            ? 'font-display text-2xl font-extrabold tracking-tight'
            : 'font-display text-5xl font-extrabold leading-none tracking-tight'
        }
      >
        <span className="text-cyan text-stroke-black">Say</span>{' '}
        <span className="text-magenta text-stroke-black">My</span>{' '}
        <span className="text-sunny text-stroke-black">Name</span>
      </h1>
      {!compact && (
        <p className="mt-2 text-sm font-semibold uppercase tracking-[0.3em] text-white/50">
          Party Game
        </p>
      )}
    </motion.div>
  )
}
