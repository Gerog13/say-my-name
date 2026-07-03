import { useState } from 'react'
import { motion } from 'framer-motion'
import { useSessionStore, selectIsHost, selectMyPlayer } from '@/store/sessionStore'
import { useUIStore } from '@/store/uiStore'
import { Logo } from '@/components/Logo'
import { Button } from '@/components/Button'
import { AvatarPicker } from '@/components/AvatarPicker'
import { SettingsToggles } from '@/components/SettingsToggles'
import { TeamBoard } from '@/features/teams/TeamBoard'
import { QRCode } from './QRCode'
import { ConfigPanel } from './ConfigPanel'
import { CATEGORY_EMOJI, CATEGORY_LABELS } from '@/types'
import { updatePlayer } from '@/services/sessionService'
import { startGame } from '@/services/gameService'
import { useHaptics } from '@/hooks/useHaptics'
import { cn } from '@/lib/utils'

export function Lobby() {
  const haptic = useHaptics()
  const session = useSessionStore((s) => s.session)!
  const teams = useSessionStore((s) => s.teams)
  const players = useSessionStore((s) => s.players)
  const userId = useSessionStore((s) => s.userId)
  const connected = useSessionStore((s) => s.connected)
  const isHost = useSessionStore(selectIsHost)
  const me = useSessionStore(selectMyPlayer)
  const { selectedPacks, setProfile } = useUIStore()

  const [showQR, setShowQR] = useState(false)
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(me?.name ?? '')
  const [avatar, setAvatar] = useState(me?.avatar ?? '🦊')
  const [copied, setCopied] = useState(false)
  const [starting, setStarting] = useState(false)

  const onlineCount = players.filter((p) => p.connected).length
  const joinUrl = `${window.location.origin}/room/${session.code}`

  async function copyCode() {
    haptic('tap')
    try {
      await navigator.clipboard.writeText(joinUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      /* ignore */
    }
  }

  async function saveProfile() {
    if (!me || name.trim().length < 2) return
    setProfile(name.trim(), avatar)
    await updatePlayer(me.id, { name: name.trim(), avatar })
    setEditing(false)
    haptic('success')
  }

  async function handleStart() {
    if (!isHost || starting) return
    setStarting(true)
    haptic('start')
    try {
      await startGame(session, teams, players, selectedPacks)
    } finally {
      setStarting(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="app-shell gap-4"
    >
      <div className="flex items-center justify-between">
        <Logo compact />
        <div className="flex items-center gap-2">
          <span
            className={cn(
              'h-2.5 w-2.5 rounded-full',
              connected ? 'bg-characters animate-pulse' : 'bg-white/30',
            )}
          />
          <SettingsToggles />
        </div>
      </div>

      <div className="panel flex flex-col items-center gap-3">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-white/50">Código de sala</p>
        <button onClick={copyCode} className="active:scale-95">
          <span className="font-display text-6xl font-extrabold tracking-[0.25em] text-cyan text-stroke-black">
            {session.code}
          </span>
        </button>
        <p className="text-xs text-white/40">{copied ? '¡Link copiado! 📋' : 'Tocá para copiar el link'}</p>
        <div className="flex gap-2">
          <Button variant="ghost" className="px-4 py-2 text-sm" onClick={() => setShowQR((v) => !v)}>
            {showQR ? 'Ocultar QR' : '📱 Mostrar QR'}
          </Button>
        </div>
        {showQR && (
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
            <QRCode value={joinUrl} />
          </motion.div>
        )}
      </div>

      <div className="flex items-center justify-between px-1">
        <p className="font-display text-lg font-extrabold">
          Equipos <span className="text-white/40">· {onlineCount} online</span>
        </p>
        <button
          onClick={() => setEditing((v) => !v)}
          className="rounded-lg bg-white/10 px-3 py-1.5 text-sm font-semibold"
        >
          {me?.avatar} Editar
        </button>
      </div>

      {editing && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="panel flex flex-col gap-3"
        >
          <input className="input" value={name} maxLength={16} onChange={(e) => setName(e.target.value)} />
          <AvatarPicker value={avatar} onChange={setAvatar} />
          <Button variant="primary" onClick={saveProfile}>
            Guardar
          </Button>
        </motion.div>
      )}

      <TeamBoard teams={teams} players={players} userId={userId} isHost={isHost} />
      <p className="text-center text-xs text-white/40">
        Tocá o arrastrá tu ficha para cambiar de equipo
      </p>

      {isHost ? (
        <ConfigPanel session={session} teams={teams} />
      ) : (
        <div className="panel flex items-center justify-center gap-2 text-white/70">
          <span>{CATEGORY_EMOJI[session.category]}</span>
          <span className="font-semibold">Categoría: {CATEGORY_LABELS[session.category]}</span>
        </div>
      )}

      <div className="sticky bottom-2 mt-2">
        {isHost ? (
          <Button
            variant="sunny"
            fullWidth
            disabled={starting || onlineCount < 2}
            onClick={handleStart}
            className="text-xl shadow-glow"
          >
            {onlineCount < 2 ? 'Esperando jugadores…' : starting ? 'Empezando…' : '🚀 ¡Empezar!'}
          </Button>
        ) : (
          <div className="panel text-center font-display text-lg text-white/70">
            ⏳ Esperando que el host empiece…
          </div>
        )}
      </div>
    </motion.div>
  )
}
