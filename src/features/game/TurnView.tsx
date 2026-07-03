import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { PHASE_META } from '@/types'
import { Button } from '@/components/Button'
import { Confetti } from '@/components/Confetti'
import { GameCard } from '@/features/cards/GameCard'
import { LightningCard } from '@/features/cards/LightningCard'
import { ScoreBoard } from '@/features/score/ScoreBoard'
import { Timer } from './Timer'
import { useGameActions } from './useGameActions'
import { useSecondsLeft } from '@/hooks/useTimer'
import { useSound } from '@/hooks/useSound'
import { useHaptics } from '@/hooks/useHaptics'
import { isLightning } from '@/lib/rules'
import { useSessionStore } from '@/store/sessionStore'
import { Loader } from '@/components/Loader'
import * as game from '@/services/gameService'

const EXPIRY_BACKUP_MS = 2000
const LIGHTNING_ADVANCE_MS = 1300
const LIGHTNING_BACKUP_EXTRA_MS = 1500

export function TurnView() {
  const {
    session,
    teams,
    players,
    currentTeam,
    currentCard,
    isCurrentPlayer,
    isController,
    isHost,
    markCorrect,
    skip,
  } = useGameActions()

  const sound = useSound()
  const haptic = useHaptics()
  const [confetti, setConfetti] = useState(0)
  const [busy, setBusy] = useState(false)
  const handledEndsAt = useRef<string | null>(null)
  const prevScore = useRef(currentTeam?.score ?? 0)

  const lightning = session ? isLightning(session.phase) : false
  const total = session ? (lightning ? session.config.lightningSeconds : session.config.turnSeconds) : 30
  const secondsLeft = useSecondsLeft(session?.turnEndsAt ?? null, Boolean(session?.turnActive))

  useEffect(() => {
    const score = currentTeam?.score ?? 0
    if (score > prevScore.current) {
      setConfetti((c) => c + 1)
      sound('correct')
      haptic('success')
    }
    prevScore.current = score
  }, [currentTeam?.score, sound, haptic])

  useEffect(() => {
    if (session?.keywordRevealed && lightning) sound('reveal')
  }, [session?.keywordRevealed, lightning, sound])

  const turnActive = session?.turnActive
  const turnEndsAt = session?.turnEndsAt ?? null

  useEffect(() => {
    if (!turnActive || secondsLeft > 0) return
    if (!isController && !isHost) return
    if (handledEndsAt.current === turnEndsAt) return

    const fire = () => {
      const fresh = useSessionStore.getState().session
      if (!fresh || !fresh.turnActive || fresh.turnEndsAt !== turnEndsAt) return
      handledEndsAt.current = turnEndsAt
      sound('timeup')
      haptic('fail')
      if (isLightning(fresh.phase)) void game.advanceLightningCard(fresh)
      else void game.endTurn(fresh)
    }

    if (isController) {
      fire()
      return
    }
    const t = window.setTimeout(fire, EXPIRY_BACKUP_MS)
    return () => window.clearTimeout(t)
  }, [secondsLeft, turnActive, turnEndsAt, isController, isHost, sound, haptic])

  const keywordRevealed = session?.keywordRevealed
  const deckIndex = session?.deckIndex
  const queueHead = session?.queue[0]

  useEffect(() => {
    if (!lightning || !keywordRevealed) return
    if (!isController && !isHost) return
    const delay = isController ? LIGHTNING_ADVANCE_MS : LIGHTNING_ADVANCE_MS + LIGHTNING_BACKUP_EXTRA_MS
    const t = window.setTimeout(() => {
      const fresh = useSessionStore.getState().session
      if (fresh && fresh.phase === 'lightning' && fresh.keywordRevealed) {
        void game.advanceLightningCard(fresh)
      }
    }, delay)
    return () => window.clearTimeout(t)
  }, [lightning, keywordRevealed, deckIndex, isController, isHost])

  useEffect(() => {
    setBusy(false)
  }, [deckIndex, keywordRevealed, queueHead])

  const runAction = (fn: () => void) => {
    if (busy) return
    setBusy(true)
    fn()
    window.setTimeout(() => setBusy(false), 1200)
  }

  if (!session || !currentCard) return <Loader label="Preparando carta…" />
  const meta = PHASE_META[session.phase]
  const activePlayer = players.find((p) => p.id === session.currentPlayerId)
  const cardProgress = lightning
    ? `Carta ${session.deckIndex + 1}/${session.lightningDeck.length}`
    : `Quedan ${session.queue.length}`

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="app-shell gap-3">
      {confetti > 0 && <Confetti key={confetti} />}

      <div className="flex items-center justify-between">
        <div>
          <p className="font-display text-lg font-extrabold">{meta.emoji} {meta.short}</p>
          <p className="text-xs text-white/50">{cardProgress}</p>
        </div>
        <Timer seconds={secondsLeft} total={total} size={84} />
      </div>

      <ScoreBoard teams={teams} session={session} compact />

      <div className="flex items-center justify-center gap-2 text-sm text-white/70">
        <span className="text-lg">{activePlayer?.avatar}</span>
        <span className="font-semibold">
          {isCurrentPlayer ? 'Te toca describir' : `Describe ${activePlayer?.name ?? '...'}`}
        </span>
      </div>

      <div className="flex flex-1 items-center justify-center py-1">
        {lightning ? (
          <LightningCard card={currentCard} revealed={session.keywordRevealed} />
        ) : isCurrentPlayer || isController ? (
          <GameCard card={currentCard} category={session.category} />
        ) : (
          <HiddenForSpectators />
        )}
      </div>

      {isController && (
        <div className="sticky bottom-2 flex flex-col gap-2">
          <AnimatePresence>
            {lightning && !session.keywordRevealed && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center text-sm text-white/60"
              >
                Adivinen la 🔑 keyword oculta
              </motion.p>
            )}
          </AnimatePresence>
          <div className="grid grid-cols-2 gap-3">
            {!lightning && (
              <Button
                variant="ghost"
                disabled={busy}
                onClick={() => runAction(() => { haptic('tap'); sound('skip'); skip() })}
              >
                ⏭ Pasar
              </Button>
            )}
            <Button
              variant="primary"
              className={lightning ? 'col-span-2 text-xl' : 'text-xl'}
              disabled={busy || (lightning && session.keywordRevealed)}
              onClick={() => runAction(() => { haptic('success'); markCorrect() })}
            >
              ✓ ¡Correcto!
            </Button>
          </div>
        </div>
      )}
    </motion.div>
  )
}

function HiddenForSpectators() {
  return (
    <div className="flex aspect-[3/4] w-full flex-col items-center justify-center rounded-[2rem] border-2 border-white/10 bg-panel/60">
      <motion.span
        animate={{ rotate: [0, 10, -10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="text-7xl"
      >
        🤫
      </motion.span>
      <p className="mt-4 px-8 text-center text-white/60">¡Adiviná en voz alta!</p>
    </div>
  )
}
