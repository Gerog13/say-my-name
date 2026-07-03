import { motion } from 'framer-motion'
import { AVATARS } from '@/lib/rules'
import { cn } from '@/lib/utils'

interface AvatarPickerProps {
  value: string
  onChange: (avatar: string) => void
}

export function AvatarPicker({ value, onChange }: AvatarPickerProps) {
  return (
    <div className="grid grid-cols-8 gap-2">
      {AVATARS.map((a) => (
        <motion.button
          key={a}
          type="button"
          whileTap={{ scale: 0.85 }}
          onClick={() => onChange(a)}
          className={cn(
            'flex aspect-square items-center justify-center rounded-xl text-2xl transition',
            value === a ? 'bg-cyan/25 ring-2 ring-cyan' : 'bg-white/5',
          )}
        >
          {a}
        </motion.button>
      ))}
    </div>
  )
}
