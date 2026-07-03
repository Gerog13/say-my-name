import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { useSessionStore, selectMyPlayer } from '@/store/sessionStore'
import { useUIStore } from '@/store/uiStore'
import { useRealtimeSession } from '@/features/realtime/useRealtimeSession'
import { findSessionByCode, joinRoom } from '@/services/sessionService'
import { Loader } from '@/components/Loader'
import { Lobby } from '@/features/lobby/Lobby'
import { RoomJoin } from '@/features/lobby/RoomJoin'
import { Game } from '@/features/game/Game'
import { Results } from '@/features/score/Results'

export function RoomPage() {
  const { code } = useParams<{ code: string }>()
  const navigate = useNavigate()
  const { playerName, avatar } = useUIStore()

  const session = useSessionStore((s) => s.session)
  const me = useSessionStore(selectMyPlayer)
  const setSnapshot = useSessionStore((s) => s.setSnapshot)
  const reset = useSessionStore((s) => s.reset)

  const [sessionId, setSessionId] = useState<string | null>(session?.id ?? null)
  const [status, setStatus] = useState<'loading' | 'ready' | 'notfound' | 'needjoin'>('loading')

  useEffect(() => {
    let cancelled = false
    async function resolve() {
      if (!code) return
      if (session && session.code === code) {
        setSessionId(session.id)
        setStatus('ready')
        return
      }
      const found = await findSessionByCode(code)
      if (cancelled) return
      if (!found) {
        setStatus('notfound')
        return
      }
      setSessionId(found.id)
      setStatus('ready')
    }
    void resolve()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code])

  useRealtimeSession(status === 'ready' ? sessionId : null)

  useEffect(() => {
    if (status !== 'ready' || !sessionId) return
    if (me) return
    let cancelled = false
    async function autoJoin() {
      if (!playerName || !code) {
        setStatus('needjoin')
        return
      }
      try {
        const snap = await joinRoom(code, playerName, avatar)
        if (!cancelled) setSnapshot(snap)
      } catch {
        if (!cancelled) setStatus('needjoin')
      }
    }
    const t = window.setTimeout(autoJoin, 400)
    return () => {
      cancelled = true
      window.clearTimeout(t)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, sessionId, me, playerName])

  const content = useMemo(() => {
    if (!session) return null
    switch (session.state) {
      case 'finished':
        return <Results key="results" />
      case 'lobby':
        return <Lobby key="lobby" />
      default:
        return <Game key="game" />
    }
  }, [session])

  if (status === 'notfound') {
    return (
      <div className="app-shell items-center justify-center text-center">
        <div className="panel">
          <p className="text-5xl">🔍</p>
          <h1 className="mt-3 font-display text-2xl font-extrabold">Sala no encontrada</h1>
          <p className="mt-2 text-white/60">El código {code} no existe o la sala se cerró.</p>
          <button className="btn-primary mt-4" onClick={() => { reset(); navigate('/') }}>
            Volver
          </button>
        </div>
      </div>
    )
  }

  if (status === 'needjoin' && code) {
    return <RoomJoin code={code} onJoined={() => setStatus('ready')} />
  }

  if (!session || !me) return <Loader label="Entrando a la sala…" />

  return <AnimatePresence mode="wait">{content}</AnimatePresence>
}
