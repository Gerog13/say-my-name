import { useEffect, useState } from 'react'
import { remainingMs } from '@/lib/serverTime'

export function useCountdown(endsAtIso: string | null, active: boolean): number {
  const [remaining, setRemaining] = useState(() => remainingMs(endsAtIso))

  useEffect(() => {
    if (!active || !endsAtIso) {
      setRemaining(remainingMs(endsAtIso))
      return
    }
    setRemaining(remainingMs(endsAtIso))
    const id = window.setInterval(() => {
      setRemaining(remainingMs(endsAtIso))
    }, 100)
    return () => window.clearInterval(id)
  }, [endsAtIso, active])

  return remaining
}

export function useSecondsLeft(endsAtIso: string | null, active: boolean): number {
  const ms = useCountdown(endsAtIso, active)
  return Math.ceil(ms / 1000)
}
