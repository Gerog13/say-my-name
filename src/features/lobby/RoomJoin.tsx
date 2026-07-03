import { useState } from 'react'
import { motion } from 'framer-motion'
import { Logo } from '@/components/Logo'
import { Button } from '@/components/Button'
import { AvatarPicker } from '@/components/AvatarPicker'
import { useUIStore } from '@/store/uiStore'
import { useSessionStore } from '@/store/sessionStore'
import { joinRoom } from '@/services/sessionService'
import { useHaptics } from '@/hooks/useHaptics'

interface RoomJoinProps {
  code: string
  onJoined: () => void
}

export function RoomJoin({ code, onJoined }: RoomJoinProps) {
  const haptic = useHaptics()
  const { playerName, avatar, setProfile } = useUIStore()
  const setSnapshot = useSessionStore((s) => s.setSnapshot)

  const [name, setName] = useState(playerName)
  const [pickAvatar, setPickAvatar] = useState(avatar)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canSubmit = name.trim().length >= 2

  async function handleJoin() {
    if (!canSubmit || busy) return
    setBusy(true)
    setError(null)
    try {
      setProfile(name.trim(), pickAvatar)
      const snap = await joinRoom(code, name.trim(), pickAvatar)
      setSnapshot(snap)
      haptic('success')
      onJoined()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo unir a la sala')
      setBusy(false)
    }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="app-shell justify-center">
      <div className="flex flex-col items-center gap-6">
        <Logo />

        <div className="panel flex w-full flex-col items-center gap-1">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-white/50">Te uniste a la sala</p>
          <p className="font-display text-4xl font-extrabold tracking-[0.25em] text-cyan text-stroke-black">
            {code}
          </p>
        </div>

        <div className="panel flex w-full flex-col gap-3">
          <label className="text-sm font-bold uppercase tracking-wide text-white/50">Tu nombre</label>
          <input
            className="input"
            value={name}
            maxLength={16}
            placeholder="Messi"
            autoFocus
            onChange={(e) => setName(e.target.value)}
          />
          <label className="text-sm font-bold uppercase tracking-wide text-white/50">Elegí tu avatar</label>
          <AvatarPicker value={pickAvatar} onChange={setPickAvatar} />
        </div>

        {error && <p className="text-center font-semibold text-magenta">{error}</p>}

        <Button variant="primary" fullWidth disabled={!canSubmit || busy} onClick={handleJoin} className="text-xl">
          {busy ? 'Entrando…' : '🎉 Entrar a jugar'}
        </Button>
      </div>
    </motion.div>
  )
}
