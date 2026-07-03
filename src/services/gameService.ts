import { supabase } from './supabaseClient'
import { serverNow } from '@/lib/serverTime'
import { buildDecks } from '@/lib/deckBuilder'
import { PHASE_ORDER, phaseDuration, phaseToRound } from '@/lib/rules'
import { shuffle } from '@/lib/utils'
import type { Category, GameConfig, Player, RoundPhase, Session, Team } from '@/types'

function isMainPhase(phase: RoundPhase): boolean {
  return phase !== 'lightning'
}

async function patchSession(id: string, patch: Record<string, unknown>): Promise<void> {
  const { error } = await supabase.from('sessions').update(patch).eq('id', id)
  if (error) throw error
}

export async function updateConfig(sessionId: string, config: GameConfig): Promise<void> {
  await patchSession(sessionId, { config })
}

export async function updateCategory(sessionId: string, category: Category): Promise<void> {
  await patchSession(sessionId, { category })
}

export async function updateTeamCount(
  session: Session,
  teams: Team[],
  count: number,
): Promise<void> {
  const desired = Math.max(2, Math.min(4, count))
  const { TEAM_COLORS, TEAM_NAMES } = await import('@/lib/rules')
  if (desired > teams.length) {
    const toAdd = Array.from({ length: desired - teams.length }).map((_, i) => {
      const idx = teams.length + i
      return {
        session_id: session.id,
        name: TEAM_NAMES[idx % TEAM_NAMES.length],
        color: TEAM_COLORS[idx % TEAM_COLORS.length],
        order: idx,
      }
    })
    await supabase.from('teams').insert(toAdd)
  } else if (desired < teams.length) {
    const remove = teams.slice(desired).map((t) => t.id)
    await supabase.from('players').update({ team_id: teams[0].id }).in('team_id', remove)
    await supabase.from('teams').delete().in('id', remove)
  }
  await patchSession(session.id, { config: { ...session.config, teamCount: desired } })
}

export async function renameTeam(teamId: string, name: string): Promise<void> {
  await supabase.from('teams').update({ name }).eq('id', teamId)
}

function firstTeamAndPlayer(
  teams: Team[],
  players: Player[],
): { teamId: string | null; playerId: string | null } {
  const ordered = [...teams].sort((a, b) => a.order - b.order)
  for (const team of ordered) {
    const member = players.find((p) => p.teamId === team.id && p.connected)
    if (member) return { teamId: team.id, playerId: member.id }
  }
  return { teamId: ordered[0]?.id ?? null, playerId: null }
}

export async function startGame(
  session: Session,
  teams: Team[],
  players: Player[],
  packIds: string[],
): Promise<void> {
  const { deck, lightningDeck } = buildDecks(players.length, session.config, packIds)
  const { teamId, playerId } = firstTeamAndPlayer(teams, players)

  await supabase.from('teams').update({ score: 0, turns_taken: 0, time_used: 0 }).eq('session_id', session.id)
  await supabase.from('players').update({ correct_count: 0 }).eq('session_id', session.id)

  await patchSession(session.id, {
    state: 'countdown',
    round: 1,
    phase: 'round1',
    deck,
    lightning_deck: lightningDeck,
    queue: shuffle(deck),
    deck_index: 0,
    keyword_revealed: false,
    phase_complete: false,
    current_team_id: teamId,
    current_player_id: playerId,
    turn_active: false,
    turn_ends_at: null,
    stats: {},
  })
}

export async function beginTurn(session: Session): Promise<void> {
  const duration = phaseDuration(session.phase, session.config)
  const endsAt = new Date(serverNow() + duration * 1000).toISOString()
  await patchSession(session.id, {
    state: 'round',
    turn_active: true,
    turn_ends_at: endsAt,
    keyword_revealed: false,
    phase_complete: false,
  })
}

async function bumpCorrect(team: Team | undefined, playerId: string | null) {
  if (team) {
    await supabase.from('teams').update({ score: team.score + 1 }).eq('id', team.id)
  }
  if (playerId) {
    await supabase.rpc('increment_correct', { player_id: playerId })
  }
}

function withPhaseCorrect(session: Session): Session['stats'] {
  const stats = { ...session.stats }
  const byPhase = { ...(stats.correctByPhase ?? {}) }
  byPhase[session.phase] = (byPhase[session.phase] ?? 0) + 1
  stats.correctByPhase = byPhase
  return stats
}

export async function markCorrect(
  session: Session,
  team: Team | undefined,
  playerId: string | null,
): Promise<void> {
  await bumpCorrect(team, playerId)
  const stats = withPhaseCorrect(session)

  if (session.phase === 'lightning') {
    await patchSession(session.id, { keyword_revealed: true, turn_active: false, stats })
    return
  }

  // Main round: remove the guessed card from the round queue. Round ends only
  // when every card has been guessed (empty queue).
  const queue = session.queue.slice(1)
  const phaseComplete = queue.length === 0
  await patchSession(session.id, {
    queue,
    keyword_revealed: false,
    stats,
    ...(phaseComplete
      ? { turn_active: false, state: 'round_end', phase_complete: true, turn_ends_at: null }
      : {}),
  })
}

export async function advanceLightningCard(session: Session): Promise<void> {
  const nextIndex = session.deckIndex + 1
  const phaseComplete = nextIndex >= session.lightningDeck.length
  if (phaseComplete) {
    await patchSession(session.id, {
      turn_active: false,
      state: 'round_end',
      phase_complete: true,
      turn_ends_at: null,
    })
    return
  }
  const endsAt = new Date(serverNow() + session.config.lightningSeconds * 1000).toISOString()
  await patchSession(session.id, {
    deck_index: nextIndex,
    keyword_revealed: false,
    turn_active: true,
    turn_ends_at: endsAt,
  })
}

export async function skipCard(session: Session): Promise<void> {
  // Faithful to the board game: a passed card goes back into the bowl (to the
  // end of the queue) and can come up again in the same round.
  if (session.queue.length <= 1) {
    await patchSession(session.id, { keyword_revealed: false })
    return
  }
  const [first, ...rest] = session.queue
  await patchSession(session.id, {
    queue: [...rest, first],
    keyword_revealed: false,
  })
}

export async function endTurn(session: Session): Promise<void> {
  // Time ran out: the turn ends but the round continues with the same queue for
  // the next team. Round is only complete when the queue is empty.
  const phaseComplete = isMainPhase(session.phase) && session.queue.length === 0
  await patchSession(session.id, {
    state: 'round_end',
    turn_active: false,
    turn_ends_at: null,
    phase_complete: phaseComplete,
  })
}

function nextTeamAndPlayer(
  session: Session,
  teams: Team[],
  players: Player[],
): { teamId: string | null; playerId: string | null } {
  const ordered = [...teams].sort((a, b) => a.order - b.order)
  const curIdx = ordered.findIndex((t) => t.id === session.currentTeamId)
  const nextTeam = ordered[(curIdx + 1) % ordered.length] ?? ordered[0]
  if (!nextTeam) return { teamId: null, playerId: null }

  const members = players.filter((p) => p.teamId === nextTeam.id && p.connected)
  if (members.length === 0) return { teamId: nextTeam.id, playerId: null }
  const lastPlayerIdx = members.findIndex((p) => p.id === session.currentPlayerId)
  const nextPlayer = members[(lastPlayerIdx + 1) % members.length] ?? members[0]
  return { teamId: nextTeam.id, playerId: nextPlayer.id }
}

export async function nextTurn(
  session: Session,
  teams: Team[],
  players: Player[],
): Promise<void> {
  const currentTeam = teams.find((t) => t.id === session.currentTeamId)
  if (currentTeam) {
    await supabase
      .from('teams')
      .update({ turns_taken: currentTeam.turnsTaken + 1 })
      .eq('id', currentTeam.id)
  }
  const { teamId, playerId } = nextTeamAndPlayer(session, teams, players)
  await patchSession(session.id, {
    state: 'countdown',
    current_team_id: teamId,
    current_player_id: playerId,
    turn_active: false,
    turn_ends_at: null,
    keyword_revealed: false,
    phase_complete: false,
  })
}

export async function nextPhaseOrFinish(session: Session): Promise<void> {
  const idx = PHASE_ORDER.indexOf(session.phase)
  const next = PHASE_ORDER[idx + 1]
  if (!next) {
    const stats = computeHardest(session)
    await patchSession(session.id, { state: 'finished', turn_active: false, stats })
    return
  }
  await patchSession(session.id, {
    phase: next,
    round: phaseToRound(next),
    state: 'countdown',
    deck_index: 0,
    queue: isMainPhase(next) ? shuffle(session.deck) : [],
    keyword_revealed: false,
    phase_complete: false,
    turn_active: false,
    turn_ends_at: null,
  })
}

function computeHardest(session: Session): Session['stats'] {
  const byPhase = session.stats.correctByPhase ?? {}
  let hardest: RoundPhase | undefined
  let min = Infinity
  for (const phase of PHASE_ORDER) {
    const v = byPhase[phase] ?? 0
    if (v < min) {
      min = v
      hardest = phase
    }
  }
  return { ...session.stats, hardestPhase: hardest }
}

export async function resetToLobby(session: Session): Promise<void> {
  await supabase.from('teams').update({ score: 0, turns_taken: 0, time_used: 0 }).eq('session_id', session.id)
  await supabase.from('players').update({ correct_count: 0 }).eq('session_id', session.id)
  await patchSession(session.id, {
    state: 'lobby',
    round: 0,
    phase: 'round1',
    deck: [],
    lightning_deck: [],
    queue: [],
    deck_index: 0,
    keyword_revealed: false,
    phase_complete: false,
    current_team_id: null,
    current_player_id: null,
    turn_active: false,
    turn_ends_at: null,
    stats: {},
  })
}
