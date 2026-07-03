import { useEffect, useRef } from 'react'
import type { RealtimeChannel } from '@supabase/supabase-js'
import { supabase } from '@/services/supabaseClient'
import { fetchSnapshot } from '@/services/sessionService'
import { mapPlayer, mapSession, mapTeam, type PlayerRow, type SessionRow, type TeamRow } from '@/services/mappers'
import { useSessionStore } from '@/store/sessionStore'
import { syncServerTime } from '@/lib/serverTime'

export function useRealtimeSession(sessionId: string | null): void {
  const channelRef = useRef<RealtimeChannel | null>(null)

  useEffect(() => {
    if (!sessionId) return
    let cancelled = false
    const store = useSessionStore.getState
    const userId = store().userId

    async function bootstrap() {
      await syncServerTime()
      const snapshot = await fetchSnapshot(sessionId!)
      if (cancelled || !snapshot) return
      store().setSnapshot(snapshot)
    }
    void bootstrap()

    const syncPresence = (channel: RealtimeChannel) => {
      const state = channel.presenceState<{ id: string }>()
      const ids = new Set<string>()
      Object.values(state).forEach((entries) => {
        entries.forEach((entry) => {
          if (entry.id) ids.add(entry.id)
        })
      })
      store().setOnlineIds([...ids])
    }

    const channel = supabase
      .channel(`room:${sessionId}`, {
        config: { presence: { key: userId ?? undefined } },
      })
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'sessions', filter: `id=eq.${sessionId}` },
        (payload) => {
          if (payload.eventType === 'DELETE') {
            store().reset()
            return
          }
          store().setSession(mapSession(payload.new as SessionRow))
        },
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'teams', filter: `session_id=eq.${sessionId}` },
        (payload) => {
          if (payload.eventType === 'DELETE') {
            store().removeTeam((payload.old as { id: string }).id)
            return
          }
          store().upsertTeam(mapTeam(payload.new as TeamRow))
        },
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'players', filter: `session_id=eq.${sessionId}` },
        (payload) => {
          if (payload.eventType === 'DELETE') {
            store().removePlayer((payload.old as { id: string }).id)
            return
          }
          store().upsertPlayer(mapPlayer(payload.new as PlayerRow))
        },
      )
      .on('presence', { event: 'sync' }, () => syncPresence(channel))
      .on('presence', { event: 'join' }, () => syncPresence(channel))
      .on('presence', { event: 'leave' }, () => syncPresence(channel))
      .subscribe((status) => {
        store().setConnected(status === 'SUBSCRIBED')
        if (status === 'SUBSCRIBED') {
          if (userId) void channel.track({ id: userId })
          void fetchSnapshot(sessionId!).then((snap) => {
            if (!cancelled && snap) store().setSnapshot(snap)
          })
        }
      })

    channelRef.current = channel

    let lastResync = 0
    const resync = () => {
      const now = Date.now()
      if (now - lastResync < 1500) return
      lastResync = now
      void syncServerTime()
      if (userId) void channel.track({ id: userId })
      void fetchSnapshot(sessionId!).then((snap) => {
        if (!cancelled && snap) store().setSnapshot(snap)
      })
    }

    const onVisibility = () => {
      if (document.visibilityState === 'visible') resync()
    }
    document.addEventListener('visibilitychange', onVisibility)
    window.addEventListener('focus', resync)
    window.addEventListener('online', resync)
    window.addEventListener('pageshow', resync)

    return () => {
      cancelled = true
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('focus', resync)
      window.removeEventListener('online', resync)
      window.removeEventListener('pageshow', resync)
      void channel.untrack()
      void supabase.removeChannel(channel)
      channelRef.current = null
    }
  }, [sessionId])
}
