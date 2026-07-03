import { AnimatePresence, motion } from 'framer-motion'
import type { Card } from '@/types'
import { CATEGORY_EMOJI, CATEGORY_LABELS } from '@/types'
import { cn } from '@/lib/utils'
import { CATEGORY_STYLES } from './categoryStyles'

interface LightningCardProps {
  card: Card
  revealed: boolean
}

export function LightningCard({ card, revealed }: LightningCardProps) {
  return (
    <div className="relative w-full">
      <div className="grid grid-cols-1 gap-2">
        {(['titles', 'characters', 'anything'] as const).map((c) => {
          const style = CATEGORY_STYLES[c]
          return (
            <div
              key={c}
              className={cn(
                'flex items-center gap-3 rounded-2xl border-2 bg-panel/80 px-4 py-3',
                style.border,
              )}
            >
              <span className="text-xl">{CATEGORY_EMOJI[c]}</span>
              <div className="min-w-0">
                <p className={cn('text-[0.65rem] font-bold uppercase tracking-widest', style.text)}>
                  {CATEGORY_LABELS[c]}
                </p>
                <p className="truncate text-lg font-extrabold font-display">{card[c]}</p>
              </div>
            </div>
          )
        })}
      </div>

      <div className="relative mt-3">
        <AnimatePresence mode="wait">
          {revealed ? (
            <motion.div
              key="revealed"
              initial={{ scale: 0.4, rotate: -8, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 320, damping: 14 }}
              className={cn(
                'relative flex flex-col items-center justify-center rounded-3xl border-4 border-white bg-white/10 px-4 py-6',
                CATEGORY_STYLES.keyword.glow,
              )}
            >
              <span className="text-xs font-bold uppercase tracking-[0.3em] text-white/70">🔑 Palabra Clave</span>
              <motion.h2
                animate={{ scale: [1, 1.08, 1] }}
                transition={{ duration: 0.5 }}
                className="mt-1 text-center font-display text-4xl font-extrabold tracking-wide text-white text-stroke-black sm:text-5xl"
              >
                {card.keyword}
              </motion.h2>
            </motion.div>
          ) : (
            <motion.div
              key="hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center rounded-3xl border-4 border-dashed border-white/30 bg-white/5 px-4 py-6"
            >
              <span className="text-xs font-bold uppercase tracking-[0.3em] text-white/50">🔑 Palabra Clave</span>
              <div className="mt-2 flex gap-1.5">
                {card.keyword.split('').map((_, i) => (
                  <motion.span
                    key={i}
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1, repeat: Infinity, delay: i * 0.08 }}
                    className="h-6 w-4 rounded bg-white/40"
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
