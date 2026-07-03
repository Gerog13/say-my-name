import { create } from 'zustand'
import type { Player, Session, Team } from '@/types'

function applyPresence(players: Player[], onlineIds: string[]): Player[] {
  if (onlineIds.length === 0) return players
  const online = new Set(onlineIds)
  return players.map((p) => (p.connected === online.has(p.id) ? p : { ...p, connected: online.has(p.id) }))
}

interface SessionState {
  userId: string | null
  session: Session | null
  teams: Team[]
  rawPlayers: Player[]
  players: Player[]
  onlineIds: string[]
  connected: boolean
  loading: boolean
  error: string | null

  setUserId: (id: string | null) => void
  setSnapshot: (data: { session: Session; teams: Team[]; players: Player[] }) => void
  setSession: (session: Session) => void
  setTeams: (teams: Team[]) => void
  setPlayers: (players: Player[]) => void
  upsertTeam: (team: Team) => void
  removeTeam: (id: string) => void
  upsertPlayer: (player: Player) => void
  removePlayer: (id: string) => void
  setOnlineIds: (ids: string[]) => void
  setConnected: (connected: boolean) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  reset: () => void
}

export const useSessionStore = create<SessionState>((set) => ({
  userId: null,
  session: null,
  teams: [],
  rawPlayers: [],
  players: [],
  onlineIds: [],
  connected: false,
  loading: false,
  error: null,

  setUserId: (userId) => set({ userId }),
  setSnapshot: ({ session, teams, players }) =>
    set((s) => ({
      session,
      teams: [...teams].sort((a, b) => a.order - b.order),
      rawPlayers: players,
      players: applyPresence(players, s.onlineIds),
    })),
  setSession: (session) => set({ session }),
  setTeams: (teams) => set({ teams: [...teams].sort((a, b) => a.order - b.order) }),
  setPlayers: (players) =>
    set((s) => ({ rawPlayers: players, players: applyPresence(players, s.onlineIds) })),
  upsertTeam: (team) =>
    set((s) => {
      const others = s.teams.filter((t) => t.id !== team.id)
      return { teams: [...others, team].sort((a, b) => a.order - b.order) }
    }),
  removeTeam: (id) => set((s) => ({ teams: s.teams.filter((t) => t.id !== id) })),
  upsertPlayer: (player) =>
    set((s) => {
      const raw = [...s.rawPlayers.filter((p) => p.id !== player.id), player]
      return { rawPlayers: raw, players: applyPresence(raw, s.onlineIds) }
    }),
  removePlayer: (id) =>
    set((s) => {
      const raw = s.rawPlayers.filter((p) => p.id !== id)
      return { rawPlayers: raw, players: applyPresence(raw, s.onlineIds) }
    }),
  setOnlineIds: (ids) =>
    set((s) => ({ onlineIds: ids, players: applyPresence(s.rawPlayers, ids) })),
  setConnected: (connected) => set({ connected }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  reset: () =>
    set({ session: null, teams: [], rawPlayers: [], players: [], onlineIds: [], connected: false, error: null }),
}))

export const selectMyPlayer = (s: SessionState): Player | undefined =>
  s.players.find((p) => p.id === s.userId)

export const selectIsHost = (s: SessionState): boolean =>
  Boolean(s.session && s.userId && s.session.hostId === s.userId)

export const selectCurrentTeam = (s: SessionState): Team | undefined =>
  s.teams.find((t) => t.id === s.session?.currentTeamId)
