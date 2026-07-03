import { motion } from 'framer-motion'
import type { Team } from '@/types'
import { teamColor } from '@/features/teams/teamColors'
import { cn } from '@/lib/utils'

const HEIGHTS = ['h-28', 'h-36', 'h-20']
const MEDALS = ['🥈', '🥇', '🥉']
const PLACE_ORDER = [1, 0, 2]

export function Podium({ teams }: { teams: Team[] }) {
  const ranked = [...teams].sort((a, b) => b.score - a.score).slice(0, 3)

  return (
    <div className="flex items-end justify-center gap-2">
      {PLACE_ORDER.map((rank, i) => {
        const team = ranked[rank]
        if (!team) return <div key={i} className="w-1/3" />
        const c = teamColor(team.color)
        return (
          <motion.div
            key={team.id}
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 + i * 0.15, type: 'spring', stiffness: 200, damping: 16 }}
            className="flex w-1/3 flex-col items-center"
          >
            <span className="text-3xl">{MEDALS[rank]}</span>
            <p className={cn('mt-1 truncate text-center text-xs font-bold', c.text)}>{team.name}</p>
            <p className="font-display text-2xl font-extrabold">{team.score}</p>
            <div
              className={cn(
                'mt-1 w-full rounded-t-xl border-2 border-b-0',
                HEIGHTS[rank],
                c.border,
                c.soft,
              )}
            />
          </motion.div>
        )
      })}
    </div>
  )
}
