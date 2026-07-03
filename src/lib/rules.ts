import type { GameConfig, RoundPhase } from '@/types'

export const DEFAULT_CONFIG: GameConfig = {
  mainPerPlayer: 5,
  lightningPerPlayer: 1,
  turnSeconds: 30,
  lightningSeconds: 5,
  maxPlayers: 16,
  teamCount: 2,
}

export const PHASE_ORDER: RoundPhase[] = ['round1', 'round2', 'lightning', 'round3']

export function phaseToRound(phase: RoundPhase): number {
  return PHASE_ORDER.indexOf(phase) + 1
}

export function nextPhase(phase: RoundPhase): RoundPhase | null {
  const idx = PHASE_ORDER.indexOf(phase)
  return idx >= 0 && idx < PHASE_ORDER.length - 1 ? PHASE_ORDER[idx + 1] : null
}

export function isLightning(phase: RoundPhase): boolean {
  return phase === 'lightning'
}

export function phaseDuration(phase: RoundPhase, config: GameConfig): number {
  return isLightning(phase) ? config.lightningSeconds : config.turnSeconds
}

export const TEAM_COLORS = ['cyan', 'magenta', 'sunny', 'grape'] as const

export const TEAM_NAMES = ['Los Cracks', 'Furia', 'Los Rápidos', 'Dream Team'] as const

export const AVATARS = [
  '🦊', '🐸', '🐙', '🦄', '🐲', '🦁', '🐼', '🐧',
  '👽', '🤖', '🤡', '👾', '🦖', '🐝', '🦩', '🐳',
  '🦥', '🦈', '🐢', '🦉', '🐺', '🐷', '🦝', '🐨',
] as const
