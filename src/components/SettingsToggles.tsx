import { useUIStore } from '@/store/uiStore'
import { cn } from '@/lib/utils'

export function SettingsToggles() {
  const { soundEnabled, hapticsEnabled, toggleSound, toggleHaptics } = useUIStore()
  return (
    <div className="flex gap-2">
      <button
        onClick={toggleSound}
        className={cn('rounded-xl px-3 py-2 text-lg', soundEnabled ? 'bg-cyan/20' : 'bg-white/5 opacity-50')}
        title="Sonido"
      >
        {soundEnabled ? '🔊' : '🔇'}
      </button>
      <button
        onClick={toggleHaptics}
        className={cn('rounded-xl px-3 py-2 text-lg', hapticsEnabled ? 'bg-magenta/20' : 'bg-white/5 opacity-50')}
        title="Vibración"
      >
        📳
      </button>
    </div>
  )
}
