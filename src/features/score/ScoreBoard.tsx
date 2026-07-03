import { motion } from 'framer-motion'
import type { Session, Team } from '@/types'
import { AnimatedNumber } from '@/components/AnimatedNumber'
import { teamColor } from '@/features/teams/teamColors'
import { cn } from '@/lib/utils'

interface ScoreBoardProps {
  teams: Team[]
  session: Session
  compact?: boolean
}

export function ScoreBoard({ teams, session, compact = false }: ScoreBoardProps) {
  const sorted = [...teams].sort((a, b) => a.order - b.order)
  return (
    <div className={cn('grid gap-2', sorted.length > 2 ? 'grid-cols-2' : 'grid-cols-2')}>
      {sorted.map((team) => {
        const c = teamColor(team.color)
        const active = team.id === session.currentTeamId
        return (
          <motion.div
            key={team.id}
            layout
            animate={active ? { scale: 1.03 } : { scale: 1 }}
            className={cn(
              'relative flex items-center justify-between overflow-hidden rounded-2xl border-2 px-3 py-2',
              c.border,
              active ? cn(c.soft, 'ring-2', c.ring) : 'bg-panel/60',
            )}
          >
            <div className="min-w-0">
              {active && (
                <span className="text-[0.6rem] font-bold uppercase tracking-wide text-white/60">
                  jugando ▶
                </span>
              )}
              <p className={cn('truncate font-display font-extrabold', c.text, compact ? 'text-sm' : 'text-base')}>
                {team.name}
              </p>
            </div>
            <AnimatedNumber
              value={team.score}
              className={cn('font-display font-extrabold', c.text, compact ? 'text-2xl' : 'text-3xl')}
            />
          </motion.div>
        )
      })}
    </div>
  )
}
