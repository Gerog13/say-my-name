export type Category = 'titles' | 'characters' | 'anything'

export type GameState = 'lobby' | 'countdown' | 'round' | 'round_end' | 'finished'

export type RoundPhase = 'round1' | 'round2' | 'lightning' | 'round3'

export interface GameConfig {
  mainPerPlayer: number
  lightningPerPlayer: number
  turnSeconds: number
  lightningSeconds: number
  maxPlayers: number
  teamCount: number
}

export interface GameStats {
  hardestPhase?: RoundPhase
  correctByPhase?: Partial<Record<RoundPhase, number>>
}

export interface Session {
  id: string
  code: string
  hostId: string
  state: GameState
  round: number
  phase: RoundPhase
  category: Category
  currentTeamId: string | null
  currentPlayerId: string | null
  deck: string[]
  lightningDeck: string[]
  queue: string[]
  deckIndex: number
  keywordRevealed: boolean
  phaseComplete: boolean
  turnEndsAt: string | null
  turnActive: boolean
  config: GameConfig
  stats: GameStats
  createdAt: string
  updatedAt: string
}

export interface Team {
  id: string
  sessionId: string
  name: string
  color: string
  score: number
  turnsTaken: number
  timeUsed: number
  order: number
}

export interface Player {
  id: string
  sessionId: string
  teamId: string | null
  name: string
  avatar: string
  connected: boolean
  isHost: boolean
  correctCount: number
  lastSeen: string
}

export interface Card {
  id: string
  titles: string
  characters: string
  anything: string
  keyword: string
  pack?: string
}

export const CATEGORY_LABELS: Record<Category, string> = {
  titles: 'Títulos',
  characters: 'Personajes',
  anything: 'Vale Todo',
}

export const CATEGORY_EMOJI: Record<Category, string> = {
  titles: '🩷',
  characters: '💚',
  anything: '💙',
}

export const PHASE_META: Record<
  RoundPhase,
  { label: string; short: string; rules: string[]; emoji: string }
> = {
  round1: {
    label: 'Ronda 1 · Libre',
    short: 'Libre',
    emoji: '🗣️',
    rules: ['Hablá, actuá, cantá o tarareá', 'Prohibido decir la palabra o la keyword'],
  },
  round2: {
    label: 'Ronda 2 · Una palabra',
    short: '1 palabra',
    emoji: '☝️',
    rules: ['Solo UNA palabra', 'Actuar permitido', 'Un intento por carta'],
  },
  lightning: {
    label: 'Ronda Relámpago',
    short: 'Relámpago',
    emoji: '⚡',
    rules: ['5 segundos por carta', 'Adiviná la KEYWORD oculta', 'Punto automático al acertar'],
  },
  round3: {
    label: 'Ronda 3 · Mímica',
    short: 'Mímica',
    emoji: '🤫',
    rules: ['Solo mímica', 'Prohibido cualquier sonido'],
  },
}
