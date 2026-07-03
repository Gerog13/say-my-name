import { motion } from 'framer-motion'
import type { Category, GameConfig, Session, Team } from '@/types'
import { CATEGORY_EMOJI, CATEGORY_LABELS } from '@/types'
import { CARD_PACKS } from '@/data/cards'
import { cn } from '@/lib/utils'
import { updateCategory, updateConfig, updateTeamCount } from '@/services/gameService'
import { useUIStore } from '@/store/uiStore'
import { useHaptics } from '@/hooks/useHaptics'

interface ConfigPanelProps {
  session: Session
  teams: Team[]
}

const CATEGORIES: Category[] = ['titles', 'characters', 'anything']

function Stepper({
  label,
  value,
  min,
  max,
  onChange,
  suffix,
}: {
  label: string
  value: number
  min: number
  max: number
  onChange: (v: number) => void
  suffix?: string
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm font-semibold text-white/70">{label}</span>
      <div className="flex items-center gap-2">
        <button
          className="h-8 w-8 rounded-lg bg-white/10 font-bold active:scale-90"
          onClick={() => onChange(Math.max(min, value - 1))}
        >
          −
        </button>
        <span className="w-14 text-center font-display text-lg font-extrabold">
          {value}
          {suffix}
        </span>
        <button
          className="h-8 w-8 rounded-lg bg-white/10 font-bold active:scale-90"
          onClick={() => onChange(Math.min(max, value + 1))}
        >
          +
        </button>
      </div>
    </div>
  )
}

export function ConfigPanel({ session, teams }: ConfigPanelProps) {
  const haptic = useHaptics()
  const { selectedPacks, setSelectedPacks } = useUIStore()

  function patchConfig(patch: Partial<GameConfig>) {
    haptic('tap')
    void updateConfig(session.id, { ...session.config, ...patch })
  }

  function togglePack(id: string) {
    haptic('tap')
    const next = selectedPacks.includes(id)
      ? selectedPacks.filter((p) => p !== id)
      : [...selectedPacks, id]
    setSelectedPacks(next)
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-4">
      <div className="panel flex flex-col gap-3">
        <p className="text-sm font-bold uppercase tracking-wide text-white/50">Categoría de la partida</p>
        <div className="grid grid-cols-3 gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => {
                haptic('tap')
                void updateCategory(session.id, c)
              }}
              className={cn(
                'flex flex-col items-center gap-1 rounded-2xl border-2 p-3 transition',
                session.category === c
                  ? 'border-cyan bg-cyan/15'
                  : 'border-white/10 bg-white/5',
              )}
            >
              <span className="text-2xl">{CATEGORY_EMOJI[c]}</span>
              <span className="text-xs font-bold">{CATEGORY_LABELS[c]}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="panel flex flex-col gap-3">
        <p className="text-sm font-bold uppercase tracking-wide text-white/50">
          Packs {selectedPacks.length === 0 && '(todos)'}
        </p>
        <div className="flex flex-wrap gap-2">
          {CARD_PACKS.map((pack) => (
            <button
              key={pack.id}
              onClick={() => togglePack(pack.id)}
              className={cn(
                'rounded-full border-2 px-3 py-1.5 text-sm font-bold transition',
                selectedPacks.includes(pack.id)
                  ? 'border-magenta bg-magenta/20 text-white'
                  : 'border-white/10 bg-white/5 text-white/70',
              )}
            >
              {pack.emoji} {pack.name}
            </button>
          ))}
        </div>
      </div>

      <div className="panel flex flex-col gap-3">
        <p className="text-sm font-bold uppercase tracking-wide text-white/50">Configuración</p>
        <Stepper
          label="Cartas por jugador (principal)"
          value={session.config.mainPerPlayer}
          min={1}
          max={12}
          onChange={(v) => patchConfig({ mainPerPlayer: v })}
        />
        <Stepper
          label="Cartas por jugador (relámpago)"
          value={session.config.lightningPerPlayer}
          min={1}
          max={6}
          onChange={(v) => patchConfig({ lightningPerPlayer: v })}
        />
        <Stepper
          label="Duración de turno"
          value={session.config.turnSeconds}
          min={15}
          max={90}
          suffix="s"
          onChange={(v) => patchConfig({ turnSeconds: v })}
        />
        <Stepper
          label="Duración relámpago"
          value={session.config.lightningSeconds}
          min={3}
          max={15}
          suffix="s"
          onChange={(v) => patchConfig({ lightningSeconds: v })}
        />
        <Stepper
          label="Cantidad de equipos"
          value={teams.length}
          min={2}
          max={4}
          onChange={(v) => {
            haptic('tap')
            void updateTeamCount(session, teams, v)
          }}
        />
        <Stepper
          label="Jugadores máximos"
          value={session.config.maxPlayers}
          min={2}
          max={24}
          onChange={(v) => patchConfig({ maxPlayers: v })}
        />
      </div>
    </motion.div>
  )
}
