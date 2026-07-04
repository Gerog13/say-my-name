import { AnimatePresence, motion } from 'framer-motion'
import type { Card, Category } from '@/types'
import { CATEGORY_EMOJI, CATEGORY_LABELS } from '@/types'
import { cn } from '@/lib/utils'
import { CATEGORY_STYLES } from './categoryStyles'

interface GameCardProps {
  card: Card
  category: Category
  hidden?: boolean
}

export function GameCard({ card, category, hidden = false }: GameCardProps) {
  const style = CATEGORY_STYLES[category]
  const value = card[category]

  return (
    <div className="relative w-full [perspective:1200px]">
      <AnimatePresence mode="wait">
        <motion.div
          key={hidden ? 'hidden' : card.id}
          initial={{ rotateY: 90, opacity: 0 }}
          animate={{ rotateY: 0, opacity: 1 }}
          exit={{ rotateY: -90, opacity: 0 }}
          transition={{ duration: 0.32, ease: 'easeOut' }}
          className={cn(
            'relative flex aspect-[3/4] w-full flex-col overflow-hidden rounded-[2rem] border-2 bg-panel p-6',
            'shadow-card [transform-style:preserve-3d]',
            style.border,
            style.glow,
          )}
        >
          <div className={cn('pointer-events-none absolute inset-0 bg-gradient-to-b', style.gradient)} />
          <div className="relative flex items-center justify-between">
            <span className={cn('rounded-full px-3 py-1 text-sm font-bold font-display', style.chip)}>
              {CATEGORY_EMOJI[category]} {CATEGORY_LABELS[category]}
            </span>
          </div>

          <div className="relative flex flex-1 items-center justify-center px-2 text-center">
            {hidden ? (
              <span className="text-6xl">🤔</span>
            ) : (
              <motion.h2
                initial={{ scale: 0.85 }}
                animate={{ scale: 1 }}
                className={cn(
                  'font-display text-4xl font-extrabold leading-tight tracking-tight text-stroke-black sm:text-5xl',
                  style.text,
                )}
              >
                {value}
              </motion.h2>
            )}
          </div>

          {!hidden && (
            <div className="relative mb-3 flex items-center justify-center gap-2 rounded-2xl border-2 border-rose-500/60 bg-rose-500/10 px-3 py-2">
              <span className="text-base">🚫</span>
              <div className="flex min-w-0 flex-col items-center leading-none">
                <span className="text-[0.6rem] font-bold uppercase tracking-[0.25em] text-rose-300/80">
                  No podés decir
                </span>
                <span className="mt-0.5 truncate font-display text-lg font-extrabold tracking-wide text-rose-100">
                  {card.keyword}
                </span>
              </div>
            </div>
          )}

          <div className="relative flex items-center justify-center gap-1.5 opacity-70">
            {(['titles', 'characters', 'anything'] as Category[]).map((c) => (
              <span
                key={c}
                className={cn(
                  'h-1.5 w-8 rounded-full',
                  c === category ? 'bg-white' : 'bg-white/25',
                )}
              />
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
