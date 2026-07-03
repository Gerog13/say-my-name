import { useCallback, useMemo } from 'react'
import { useSessionStore, selectIsHost, selectCurrentTeam } from '@/store/sessionStore'
import { getCardById } from '@/data/cards'
import type { Card } from '@/types'
import * as game from '@/services/gameService'

export function useGameActions() {
  const session = useSessionStore((s) => s.session)
  const teams = useSessionStore((s) => s.teams)
  const players = useSessionStore((s) => s.players)
  const userId = useSessionStore((s) => s.userId)
  const isHost = useSessionStore(selectIsHost)
  const currentTeam = useSessionStore(selectCurrentTeam)

  const isCurrentPlayer = Boolean(session && userId && session.currentPlayerId === userId)
  const hasCurrentPlayer = Boolean(session?.currentPlayerId)
  const isController = isCurrentPlayer || (isHost && !hasCurrentPlayer)

  const currentCard: Card | null = useMemo(() => {
    if (!session) return null
    const id =
      session.phase === 'lightning'
        ? session.lightningDeck[session.deckIndex]
        : session.queue[0]
    return id ? getCardById(id) ?? null : null
  }, [session])

  const beginTurn = useCallback(() => {
    if (session) void game.beginTurn(session)
  }, [session])

  const markCorrect = useCallback(() => {
    if (session) void game.markCorrect(session, currentTeam, session.currentPlayerId)
  }, [session, currentTeam])

  const skip = useCallback(() => {
    if (session) void game.skipCard(session)
  }, [session])

  const endTurn = useCallback(() => {
    if (session) void game.endTurn(session)
  }, [session])

  const advanceLightning = useCallback(() => {
    if (session) void game.advanceLightningCard(session)
  }, [session])

  const nextTurn = useCallback(() => {
    if (session) void game.nextTurn(session, teams, players)
  }, [session, teams, players])

  const nextPhase = useCallback(() => {
    if (session) void game.nextPhaseOrFinish(session)
  }, [session])

  return {
    session,
    teams,
    players,
    userId,
    isHost,
    currentTeam,
    currentCard,
    isCurrentPlayer,
    isController,
    beginTurn,
    markCorrect,
    skip,
    endTurn,
    advanceLightning,
    nextTurn,
    nextPhase,
  }
}
