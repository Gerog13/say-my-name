import { useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useSessionStore, selectIsHost } from '@/store/sessionStore'
import { Button } from '@/components/Button'
import { Fireworks } from '@/components/Fireworks'
import { Podium } from './Podium'
import { computeFinalStats } from './stats'
import { resetToLobby } from '@/services/gameService'
import { teamColor } from '@/features/teams/teamColors'
import { useSound } from '@/hooks/useSound'
import { useHaptics } from '@/hooks/useHaptics'

function StatCard({ emoji, label, value }: { emoji: string; label: string; value: string }) {
  return (
    <div className="panel flex items-center gap-3 py-3">
      <span className="text-2xl">{emoji}</span>
      <div className="min-w-0">
        <p className="text-[0.65rem] font-bold uppercase tracking-wide text-white/50">{label}</p>
        <p className="truncate font-display text-lg font-extrabold">{value}</p>
      </div>
    </div>
  )
}

export function Results() {
  const navigate = useNavigate()
  const sound = useSound()
  const haptic = useHaptics()
  const session = useSessionStore((s) => s.session)!
  const teams = useSessionStore((s) => s.teams)
  const players = useSessionStore((s) => s.players)
  const isHost = useSessionStore(selectIsHost)
  const reset = useSessionStore((s) => s.reset)

  const stats = useMemo(() => computeFinalStats(session, teams, players), [session, teams, players])

  useEffect(() => {
    sound('win')
    haptic('win')
  }, [sound, haptic])

  const winnerColor = stats.winner ? teamColor(stats.winner.color) : null

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="app-shell gap-4">
      <Fireworks />

      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 14 }}
        className="mt-2 text-center"
      >
        <p className="text-5xl">🏆</p>
        {stats.tie ? (
          <h1 className="mt-1 font-display text-3xl font-extrabold text-sunny">¡Empate!</h1>
        ) : (
          <h1 className={`mt-1 font-display text-3xl font-extrabold ${winnerColor?.text ?? 'text-cyan'}`}>
            ¡Ganó {stats.winner?.name}!
          </h1>
        )}
      </motion.div>

      <Podium teams={teams} />

      <div className="mt-2 flex flex-col gap-2">
        <p className="px-1 font-display text-lg font-extrabold">📊 Estadísticas</p>
        {stats.mvp && (
          <StatCard emoji="⭐" label="MVP de la partida" value={`${stats.mvp.avatar} ${stats.mvp.name} · ${stats.mvp.correctCount}`} />
        )}
        {stats.fastestTeam && (
          <StatCard emoji="⚡" label="Equipo más rápido" value={stats.fastestTeam.name} />
        )}
        {stats.hardestRoundLabel && (
          <StatCard emoji="😰" label="Ronda más difícil" value={stats.hardestRoundLabel} />
        )}
        <StatCard emoji="✅" label="Aciertos totales" value={`${stats.totalCorrect}`} />
      </div>

      <div className="sticky bottom-2 mt-2 flex flex-col gap-2">
        {isHost ? (
          <Button variant="sunny" fullWidth className="text-xl" onClick={() => resetToLobby(session)}>
            🔄 Revancha
          </Button>
        ) : (
          <div className="panel text-center text-white/70">Esperando revancha del host…</div>
        )}
        <Button
          variant="ghost"
          fullWidth
          onClick={() => {
            reset()
            navigate('/')
          }}
        >
          Salir
        </Button>
      </div>
    </motion.div>
  )
}
