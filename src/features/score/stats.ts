import type { Player, Session, Team } from '@/types'
import { PHASE_META } from '@/types'

export interface FinalStats {
  winner: Team | null
  tie: boolean
  mvp: Player | null
  fastestTeam: Team | null
  hardestRoundLabel: string | null
  totalCorrect: number
}

export function computeFinalStats(session: Session, teams: Team[], players: Player[]): FinalStats {
  const sortedTeams = [...teams].sort((a, b) => b.score - a.score)
  const winner = sortedTeams[0] ?? null
  const tie = sortedTeams.length > 1 && sortedTeams[0].score === sortedTeams[1].score

  const sortedPlayers = [...players].sort((a, b) => b.correctCount - a.correctCount)
  const mvp = sortedPlayers[0] && sortedPlayers[0].correctCount > 0 ? sortedPlayers[0] : null

  const fastestTeam =
    [...teams]
      .filter((t) => t.turnsTaken > 0)
      .sort((a, b) => b.score / b.turnsTaken - a.score / a.turnsTaken)[0] ?? winner

  const hardestRoundLabel = session.stats.hardestPhase
    ? PHASE_META[session.stats.hardestPhase].label
    : null

  const totalCorrect = players.reduce((sum, p) => sum + p.correctCount, 0)

  return { winner, tie, mvp, fastestTeam, hardestRoundLabel, totalCorrect }
}
