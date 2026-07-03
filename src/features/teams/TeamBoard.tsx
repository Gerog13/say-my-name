import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { Player, Team } from '@/types'
import { cn } from '@/lib/utils'
import { teamColor } from './teamColors'
import { updatePlayer } from '@/services/sessionService'
import { useHaptics } from '@/hooks/useHaptics'

interface TeamBoardProps {
  teams: Team[]
  players: Player[]
  userId: string | null
  isHost: boolean
}

export function TeamBoard({ teams, players, userId, isHost }: TeamBoardProps) {
  const haptic = useHaptics()
  const [dragId, setDragId] = useState<string | null>(null)

  async function moveToTeam(playerId: string, teamId: string) {
    const player = players.find((p) => p.id === playerId)
    if (!player || player.teamId === teamId) return
    haptic('tap')
    try {
      await updatePlayer(playerId, { teamId })
    } catch {
      /* realtime will resync */
    }
  }

  function handleDragEnd(playerId: string, point: { x: number; y: number }) {
    setDragId(null)
    const el = document.elementFromPoint(point.x, point.y)
    const zone = el?.closest('[data-team-id]') as HTMLElement | null
    if (zone?.dataset.teamId) void moveToTeam(playerId, zone.dataset.teamId)
  }

  return (
    <div className={cn('grid gap-3', teams.length > 2 ? 'grid-cols-2' : 'grid-cols-2')}>
      {teams.map((team) => {
        const c = teamColor(team.color)
        const members = players.filter((p) => p.teamId === team.id)
        return (
          <div
            key={team.id}
            data-team-id={team.id}
            className={cn(
              'flex min-h-[9rem] flex-col gap-2 rounded-2xl border-2 bg-panel/70 p-3 transition',
              c.border,
              dragId && 'ring-1 ring-white/20',
            )}
          >
            <div className="flex items-center justify-between">
              <span className={cn('font-display text-sm font-extrabold', c.text)}>{team.name}</span>
              <span className={cn('rounded-full px-2 py-0.5 text-xs font-bold', c.soft, c.text)}>
                {members.length}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              <AnimatePresence>
                {members.map((p) => {
                  const draggable = isHost || p.id === userId
                  return (
                    <motion.button
                      key={p.id}
                      layout
                      layoutId={`chip-${p.id}`}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      drag={draggable}
                      dragSnapToOrigin
                      whileDrag={{ scale: 1.15, zIndex: 50 }}
                      onDragStart={() => setDragId(p.id)}
                      onDragEnd={(_, info) => handleDragEnd(p.id, info.point)}
                      onClick={() => {
                        if (!draggable) return
                        const idx = teams.findIndex((t) => t.id === team.id)
                        const next = teams[(idx + 1) % teams.length]
                        void moveToTeam(p.id, next.id)
                      }}
                      className={cn(
                        'flex touch-none items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-sm font-bold',
                        p.id === userId ? cn(c.soft, 'ring-1', c.ring) : 'bg-white/8',
                        !p.connected && 'opacity-40',
                        draggable ? 'cursor-grab active:cursor-grabbing' : 'cursor-default',
                      )}
                    >
                      <span className="text-lg leading-none">{p.avatar}</span>
                      <span className="max-w-[5rem] truncate">{p.name}</span>
                      {p.isHost && <span title="Host">👑</span>}
                    </motion.button>
                  )
                })}
              </AnimatePresence>
            </div>
          </div>
        )
      })}
    </div>
  )
}
