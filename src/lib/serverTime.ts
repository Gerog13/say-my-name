import { supabase } from '@/services/supabaseClient'

let offsetMs = 0

export async function syncServerTime(): Promise<void> {
  try {
    const before = Date.now()
    const { data, error } = await supabase.rpc('server_time')
    const after = Date.now()
    if (error || !data) return
    const serverMs = new Date(data as unknown as string).getTime()
    const rtt = after - before
    offsetMs = serverMs - (before + rtt / 2)
  } catch {
    offsetMs = 0
  }
}

export function serverNow(): number {
  return Date.now() + offsetMs
}

export function remainingMs(endsAtIso: string | null): number {
  if (!endsAtIso) return 0
  return Math.max(0, new Date(endsAtIso).getTime() - serverNow())
}
