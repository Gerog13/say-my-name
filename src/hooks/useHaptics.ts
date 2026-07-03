import { useCallback } from 'react'
import { useUIStore } from '@/store/uiStore'

type HapticPattern = 'tap' | 'success' | 'start' | 'win' | 'fail'

const PATTERNS: Record<HapticPattern, number | number[]> = {
  tap: 10,
  success: [0, 40, 40, 80],
  start: [0, 30, 60, 30],
  win: [0, 60, 40, 60, 40, 120],
  fail: [0, 120],
}

export function useHaptics() {
  const enabled = useUIStore((s) => s.hapticsEnabled)

  return useCallback(
    (pattern: HapticPattern) => {
      if (!enabled) return
      if (typeof navigator === 'undefined' || !('vibrate' in navigator)) return
      try {
        navigator.vibrate(PATTERNS[pattern])
      } catch {
        /* ignore */
      }
    },
    [enabled],
  )
}
