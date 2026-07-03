import { supabase, ensureAnonymousUser } from './supabaseClient'
import { mapPlayer, mapSession, mapTeam, type PlayerRow, type SessionRow, type TeamRow } from './mappers'
import { DEFAULT_CONFIG, TEAM_COLORS, TEAM_NAMES } from '@/lib/rules'
import { generateRoomCode } from '@/lib/utils'
import type { Player, Session, Team } from '@/types'

export interface RoomSnapshot {
  session: Session
  teams: Team[]
  players: Player[]
}

async function createUniqueCode(): Promise<string> {
  for (let attempt = 0; attempt < 6; attempt++) {
    const code = generateRoomCode(4)
    const { data } = await supabase.from('sessions').select('id').eq('code', code).maybeSingle()
    if (!data) return code
  }
  return generateRoomCode(5)
}

export async function createRoom(hostName: string, avatar: string): Promise<RoomSnapshot> {
  const userId = await ensureAnonymousUser()
  const code = await createUniqueCode()

  const { data: sessionData, error: sessionError } = await supabase
    .from('sessions')
    .insert({ code, host_id: userId, config: DEFAULT_CONFIG })
    .select('*')
    .single()
  if (sessionError || !sessionData) throw sessionError ?? new Error('No se pudo crear la sala')
  const session = mapSession(sessionData as SessionRow)

  const teamRows = Array.from({ length: DEFAULT_CONFIG.teamCount }).map((_, i) => ({
    session_id: session.id,
    name: TEAM_NAMES[i % TEAM_NAMES.length],
    color: TEAM_COLORS[i % TEAM_COLORS.length],
    order: i,
  }))
  const { data: teamsData, error: teamsError } = await supabase
    .from('teams')
    .insert(teamRows)
    .select('*')
  if (teamsError || !teamsData) throw teamsError ?? new Error('No se pudieron crear los equipos')
  const teams = (teamsData as TeamRow[]).map(mapTeam).sort((a, b) => a.order - b.order)

  const { data: playerData, error: playerError } = await supabase
    .from('players')
    .upsert({
      id: userId,
      session_id: session.id,
      team_id: teams[0]?.id ?? null,
      name: hostName,
      avatar,
      is_host: true,
      connected: true,
      correct_count: 0,
      last_seen: new Date().toISOString(),
    })
    .select('*')
    .single()
  if (playerError || !playerData) throw playerError ?? new Error('No se pudo unir al host')

  return { session, teams, players: [mapPlayer(playerData as PlayerRow)] }
}

export async function findSessionByCode(code: string): Promise<Session | null> {
  const { data } = await supabase
    .from('sessions')
    .select('*')
    .eq('code', code.toUpperCase())
    .maybeSingle()
  return data ? mapSession(data as SessionRow) : null
}

export async function joinRoom(
  code: string,
  name: string,
  avatar: string,
): Promise<RoomSnapshot> {
  const userId = await ensureAnonymousUser()
  const session = await findSessionByCode(code)
  if (!session) throw new Error('No existe una sala con ese código')

  const teams = await fetchTeams(session.id)
  const existingPlayers = await fetchPlayers(session.id)

  const alreadyIn = existingPlayers.find((p) => p.id === userId)
  const smallestTeam = [...teams].sort(
    (a, b) =>
      existingPlayers.filter((p) => p.teamId === a.id).length -
      existingPlayers.filter((p) => p.teamId === b.id).length,
  )[0]

  const { error } = await supabase.from('players').upsert({
    id: userId,
    session_id: session.id,
    team_id: alreadyIn?.teamId ?? smallestTeam?.id ?? null,
    name,
    avatar,
    connected: true,
    is_host: session.hostId === userId,
    last_seen: new Date().toISOString(),
  })
  if (error) throw error

  const players = await fetchPlayers(session.id)
  return { session, teams, players }
}

export async function fetchTeams(sessionId: string): Promise<Team[]> {
  const { data } = await supabase
    .from('teams')
    .select('*')
    .eq('session_id', sessionId)
    .order('order', { ascending: true })
  return (data as TeamRow[] | null)?.map(mapTeam) ?? []
}

export async function fetchPlayers(sessionId: string): Promise<Player[]> {
  const { data } = await supabase
    .from('players')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true })
  return (data as PlayerRow[] | null)?.map(mapPlayer) ?? []
}

export async function fetchSnapshot(sessionId: string): Promise<RoomSnapshot | null> {
  const { data } = await supabase.from('sessions').select('*').eq('id', sessionId).maybeSingle()
  if (!data) return null
  const session = mapSession(data as SessionRow)
  const [teams, players] = await Promise.all([fetchTeams(sessionId), fetchPlayers(sessionId)])
  return { session, teams, players }
}

export async function updatePlayer(
  id: string,
  patch: Partial<Pick<Player, 'name' | 'avatar' | 'teamId' | 'connected'>>,
): Promise<void> {
  const row: Record<string, unknown> = { last_seen: new Date().toISOString() }
  if (patch.name !== undefined) row.name = patch.name
  if (patch.avatar !== undefined) row.avatar = patch.avatar
  if (patch.teamId !== undefined) row.team_id = patch.teamId
  if (patch.connected !== undefined) row.connected = patch.connected
  const { error } = await supabase.from('players').update(row).eq('id', id)
  if (error) throw error
}

