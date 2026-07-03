import { useCallback } from 'react'
import { useUIStore } from '@/store/uiStore'

type SoundName = 'tick' | 'correct' | 'skip' | 'start' | 'timeup' | 'win' | 'reveal'

let ctx: AudioContext | null = null

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (!ctx) {
    const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (!Ctor) return null
    ctx = new Ctor()
  }
  if (ctx.state === 'suspended') void ctx.resume()
  return ctx
}

function tone(freq: number, start: number, duration: number, type: OscillatorType, gain: number) {
  const c = getCtx()
  if (!c) return
  const osc = c.createOscillator()
  const g = c.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, c.currentTime + start)
  g.gain.setValueAtTime(0.0001, c.currentTime + start)
  g.gain.exponentialRampToValueAtTime(gain, c.currentTime + start + 0.01)
  g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + start + duration)
  osc.connect(g).connect(c.destination)
  osc.start(c.currentTime + start)
  osc.stop(c.currentTime + start + duration + 0.02)
}

function play(name: SoundName) {
  switch (name) {
    case 'tick':
      tone(880, 0, 0.06, 'square', 0.05)
      break
    case 'correct':
      tone(660, 0, 0.1, 'triangle', 0.18)
      tone(880, 0.08, 0.12, 'triangle', 0.18)
      tone(1320, 0.16, 0.16, 'triangle', 0.16)
      break
    case 'reveal':
      tone(520, 0, 0.08, 'sawtooth', 0.12)
      tone(1040, 0.06, 0.18, 'sawtooth', 0.14)
      break
    case 'skip':
      tone(300, 0, 0.12, 'sine', 0.12)
      break
    case 'start':
      tone(440, 0, 0.15, 'square', 0.12)
      tone(660, 0.15, 0.15, 'square', 0.12)
      tone(990, 0.3, 0.25, 'square', 0.14)
      break
    case 'timeup':
      tone(200, 0, 0.4, 'sawtooth', 0.16)
      break
    case 'win':
      ;[523, 659, 784, 1046].forEach((f, i) => tone(f, i * 0.12, 0.22, 'triangle', 0.16))
      break
  }
}

export function useSound() {
  const enabled = useUIStore((s) => s.soundEnabled)
  return useCallback(
    (name: SoundName) => {
      if (!enabled) return
      try {
        play(name)
      } catch {
        /* ignore */
      }
    },
    [enabled],
  )
}
