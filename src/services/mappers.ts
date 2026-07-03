import type { GameConfig, GameStats, Player, Session, Team } from '@/types'

export interface SessionRow {
  id: string
  code: string
  host_id: string
  state: Session['state']
  round: number
  phase: Session['phase']
  category: Session['category']
  current_team_id: string | null
  current_player_id: string | null
  deck: string[]
  lightning_deck: string[]
  queue: string[]
  deck_index: number
  keyword_revealed: boolean
  phase_complete: boolean
  turn_ends_at: string | null
  turn_active: boolean
  config: GameConfig
  stats: GameStats
  created_at: string
  updated_at: string
}

export interface TeamRow {
  id: string
  session_id: string
  name: string
  color: string
  score: number
  turns_taken: number
  time_used: number
  order: number
}

export interface PlayerRow {
  id: string
  session_id: string
  team_id: string | null
  name: string
  avatar: string
  connected: boolean
  is_host: boolean
  correct_count: number
  last_seen: string
}

export function mapSession(r: SessionRow): Session {
  return {
    id: r.id,
    code: r.code,
    hostId: r.host_id,
    state: r.state,
    round: r.round,
    phase: r.phase,
    category: r.category,
    currentTeamId: r.current_team_id,
    currentPlayerId: r.current_player_id,
    deck: r.deck ?? [],
    lightningDeck: r.lightning_deck ?? [],
    queue: r.queue ?? [],
    deckIndex: r.deck_index,
    keywordRevealed: r.keyword_revealed,
    phaseComplete: r.phase_complete,
    turnEndsAt: r.turn_ends_at,
    turnActive: r.turn_active,
    config: r.config,
    stats: r.stats ?? {},
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }
}

export function mapTeam(r: TeamRow): Team {
  return {
    id: r.id,
    sessionId: r.session_id,
    name: r.name,
    color: r.color,
    score: r.score,
    turnsTaken: r.turns_taken,
    timeUsed: r.time_used,
    order: r.order,
  }
}

export function mapPlayer(r: PlayerRow): Player {
  return {
    id: r.id,
    sessionId: r.session_id,
    teamId: r.team_id,
    name: r.name,
    avatar: r.avatar,
    connected: r.connected,
    isHost: r.is_host,
    correctCount: r.correct_count,
    lastSeen: r.last_seen,
  }
}
