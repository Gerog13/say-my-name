import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Logo } from '@/components/Logo'
import { Button } from '@/components/Button'
import { AvatarPicker } from '@/components/AvatarPicker'
import { useUIStore } from '@/store/uiStore'
import { useSessionStore } from '@/store/sessionStore'
import { createRoom, joinRoom } from '@/services/sessionService'
import { useHaptics } from '@/hooks/useHaptics'

type Mode = 'menu' | 'create' | 'join'

export function HomePage() {
  const navigate = useNavigate()
  const haptic = useHaptics()
  const { playerName, avatar, setProfile } = useUIStore()
  const setSnapshot = useSessionStore((s) => s.setSnapshot)

  const [mode, setMode] = useState<Mode>('menu')
  const [name, setName] = useState(playerName)
  const [pickAvatar, setPickAvatar] = useState(avatar)
  const [code, setCode] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canSubmit = name.trim().length >= 2

  async function handleCreate() {
    if (!canSubmit || busy) return
    setBusy(true)
    setError(null)
    try {
      setProfile(name.trim(), pickAvatar)
      const snap = await createRoom(name.trim(), pickAvatar)
      setSnapshot(snap)
      haptic('success')
      navigate(`/room/${snap.session.code}`)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo crear la sala')
    } finally {
      setBusy(false)
    }
  }

  async function handleJoin() {
    if (!canSubmit || code.trim().length < 4 || busy) return
    setBusy(true)
    setError(null)
    try {
      setProfile(name.trim(), pickAvatar)
      const snap = await joinRoom(code.trim(), name.trim(), pickAvatar)
      setSnapshot(snap)
      haptic('success')
      navigate(`/room/${snap.session.code}`)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo unir a la sala')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="app-shell justify-center">
      <div className="flex flex-col items-center gap-6">
        <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 3, repeat: Infinity }}>
          <Logo />
        </motion.div>

        {mode === 'menu' && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex w-full flex-col gap-3"
          >
            <p className="text-center text-white/60">
              El juego de fiesta para jugar entre amigos desde el celu.
            </p>
            <Button variant="primary" fullWidth onClick={() => setMode('create')}>
              🎉 Crear sala
            </Button>
            <Button variant="magenta" fullWidth onClick={() => setMode('join')}>
              🚪 Unirse a sala
            </Button>
          </motion.div>
        )}

        {mode !== 'menu' && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex w-full flex-col gap-4"
          >
            <div className="panel flex flex-col gap-3">
              <label className="text-sm font-bold uppercase tracking-wide text-white/50">Tu nombre</label>
              <input
                className="input"
                value={name}
                maxLength={16}
                placeholder="Messi"
                onChange={(e) => setName(e.target.value)}
              />
              <label className="text-sm font-bold uppercase tracking-wide text-white/50">Elegí tu avatar</label>
              <AvatarPicker value={pickAvatar} onChange={setPickAvatar} />
            </div>

            {mode === 'join' && (
              <div className="panel flex flex-col gap-2">
                <label className="text-sm font-bold uppercase tracking-wide text-white/50">Código de sala</label>
                <input
                  className="input text-center text-3xl font-display uppercase tracking-[0.4em]"
                  value={code}
                  maxLength={5}
                  placeholder="ABCD"
                  autoCapitalize="characters"
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                />
              </div>
            )}

            {error && <p className="text-center font-semibold text-magenta">{error}</p>}

            <div className="flex gap-3">
              <Button variant="ghost" onClick={() => { setMode('menu'); setError(null) }}>
                ←
              </Button>
              {mode === 'create' ? (
                <Button variant="primary" fullWidth disabled={!canSubmit || busy} onClick={handleCreate}>
                  {busy ? 'Creando…' : 'Crear 🎉'}
                </Button>
              ) : (
                <Button
                  variant="magenta"
                  fullWidth
                  disabled={!canSubmit || code.trim().length < 4 || busy}
                  onClick={handleJoin}
                >
                  {busy ? 'Entrando…' : 'Entrar 🚪'}
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
