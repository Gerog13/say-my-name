import { motion } from 'framer-motion'

export function Loader({ label = 'Cargando…' }: { label?: string }) {
  return (
    <div className="app-shell items-center justify-center">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        className="h-14 w-14 rounded-full border-4 border-white/15 border-t-cyan"
      />
      <p className="mt-4 font-display text-lg text-white/70">{label}</p>
    </div>
  )
}
