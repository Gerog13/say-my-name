import { useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import { useSessionStore, selectCurrentTeam } from '@/store/sessionStore'
import { Countdown } from './Countdown'
import { TurnView } from './TurnView'
import { RoundEnd } from './RoundEnd'
import { Loader } from '@/components/Loader'
import { useGameActions } from './useGameActions'
import * as game from '@/services/gameService'

const COUNTDOWN_PRIMARY_MS = 3900
const COUNTDOWN_BACKUP_EXTRA_MS = 1800

export function Game() {
  const session = useSessionStore((s) => s.session)
  const currentTeam = useSessionStore(selectCurrentTeam)
  const { isController, isHost } = useGameActions()

  const state = session?.state
  const phase = session?.phase
  const currentPlayerId = session?.currentPlayerId

  useEffect(() => {
    if (state !== 'countdown') return
    const isPrimary = isController
    const isBackup = isHost && !isController
    if (!isPrimary && !isBackup) return
    const delay = isPrimary ? COUNTDOWN_PRIMARY_MS : COUNTDOWN_PRIMARY_MS + COUNTDOWN_BACKUP_EXTRA_MS
    const t = window.setTimeout(() => {
      const fresh = useSessionStore.getState().session
      if (fresh && fresh.state === 'countdown') void game.beginTurn(fresh)
    }, delay)
    return () => window.clearTimeout(t)
  }, [state, phase, currentPlayerId, isController, isHost])

  if (!session) return <Loader label="Cargando partida…" />

  return (
    <AnimatePresence mode="wait">
      {session.state === 'countdown' && (
        <Countdown
          key={`cd-${session.phase}-${session.currentPlayerId}`}
          phase={session.phase}
          teamName={currentTeam?.name ?? ''}
        />
      )}
      {session.state === 'round' && <TurnView key="turn" />}
      {session.state === 'round_end' && <RoundEnd key="end" />}
    </AnimatePresence>
  )
}
