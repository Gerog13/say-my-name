import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { PHASE_META } from '@/types'
import type { RoundPhase } from '@/types'
import { useSound } from '@/hooks/useSound'
import { useHaptics } from '@/hooks/useHaptics'

interface CountdownProps {
  phase: RoundPhase
  teamName: string
}

const SEQUENCE = ['3', '2', '1', 'GO'] as const

export function Countdown({ phase, teamName }: CountdownProps) {
  const [step, setStep] = useState(-1)
  const sound = useSound()
  const haptic = useHaptics()
  const meta = PHASE_META[phase]
  const clampedStep = Math.min(step, SEQUENCE.length - 1)

  useEffect(() => {
    haptic('start')
    const intro = window.setTimeout(() => setStep(0), 1100)
    return () => window.clearTimeout(intro)
  }, [haptic])

  useEffect(() => {
    if (step < 0 || step >= SEQUENCE.length - 1) return
    sound('tick')
    const t = window.setTimeout(() => setStep((s) => s + 1), 800)
    return () => window.clearTimeout(t)
  }, [step, sound])

  useEffect(() => {
    if (step === SEQUENCE.length - 1) {
      sound('start')
      haptic('start')
    }
  }, [step, sound, haptic])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-40 flex flex-col items-center justify-center bg-ink/95 backdrop-blur"
    >
      <AnimatePresence mode="wait">
        {step < 0 ? (
          <motion.div
            key="intro"
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.2, opacity: 0 }}
            className="text-center"
          >
            <p className="text-6xl">{meta.emoji}</p>
            <h2 className="mt-3 font-display text-3xl font-extrabold text-cyan">{meta.label}</h2>
            <p className="mt-2 text-white/60">Prepárate, {teamName}</p>
          </motion.div>
        ) : (
          <motion.div
            key={SEQUENCE[clampedStep]}
            initial={{ scale: 0.3, opacity: 0, rotate: -12 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            exit={{ scale: 2, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 16 }}
            className="font-display text-9xl font-extrabold text-stroke-black"
            style={{
              color: SEQUENCE[clampedStep] === 'GO' ? '#2fe082' : '#ffd93d',
            }}
          >
            {SEQUENCE[clampedStep]}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
