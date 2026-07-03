import { motion } from 'framer-motion'
import { PHASE_META } from '@/types'
import { Button } from '@/components/Button'
import { ScoreBoard } from '@/features/score/ScoreBoard'
import { useGameActions } from './useGameActions'
import { nextPhase as computeNextPhase } from '@/lib/rules'

export function RoundEnd() {
  const { session, teams, players, currentTeam, isHost, isController, nextTurn, nextPhase } = useGameActions()
  if (!session) return null

  const phaseComplete = session.phaseComplete
  const canAdvance = isHost || isController
  const meta = PHASE_META[session.phase]
  const upcoming = computeNextPhase(session.phase)
  const nextPlayer = players.find(
    (p) => p.teamId !== session.currentTeamId && p.connected,
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="app-shell items-center justify-center gap-5 text-center"
    >
      <motion.div
        initial={{ scale: 0.6 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 240, damping: 14 }}
      >
        <p className="text-6xl">{phaseComplete ? '🏁' : '⏱️'}</p>
        <h2 className="mt-2 font-display text-3xl font-extrabold text-cyan">
          {phaseComplete ? `¡${meta.short} completa!` : 'Se acabó el tiempo'}
        </h2>
        {!phaseComplete && currentTeam && (
          <p className="mt-1 text-white/60">Turno de {currentTeam.name} terminado</p>
        )}
      </motion.div>

      <div className="w-full">
        <ScoreBoard teams={teams} session={session} />
      </div>

      {phaseComplete ? (
        <div className="w-full">
          {upcoming ? (
            <>
              <p className="mb-3 text-white/60">
                Sigue: {PHASE_META[upcoming].emoji} {PHASE_META[upcoming].label}
              </p>
              {canAdvance ? (
                <Button variant="sunny" fullWidth className="text-xl" onClick={nextPhase}>
                  Siguiente ronda →
                </Button>
              ) : (
                <p className="text-white/50">Esperando al host…</p>
              )}
            </>
          ) : canAdvance ? (
            <Button variant="sunny" fullWidth className="text-xl" onClick={nextPhase}>
              🏆 Ver resultados
            </Button>
          ) : (
            <p className="text-white/50">Calculando resultados…</p>
          )}
        </div>
      ) : (
        <div className="w-full">
          {nextPlayer && (
            <p className="mb-3 text-white/60">
              Ahora describe {nextPlayer.avatar} {nextPlayer.name}
            </p>
          )}
          {canAdvance ? (
            <Button variant="primary" fullWidth className="text-xl" onClick={nextTurn}>
              Siguiente turno →
            </Button>
          ) : (
            <p className="text-white/50">Esperando al siguiente equipo…</p>
          )}
        </div>
      )}
    </motion.div>
  )
}
