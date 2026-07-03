import { motion, type HTMLMotionProps } from 'framer-motion'
import { cn } from '@/lib/utils'

type Variant = 'primary' | 'magenta' | 'sunny' | 'ghost'

const VARIANT_CLASS: Record<Variant, string> = {
  primary: 'btn-primary',
  magenta: 'btn-magenta',
  sunny: 'btn-sunny',
  ghost: 'btn-ghost',
}

interface ButtonProps extends HTMLMotionProps<'button'> {
  variant?: Variant
  fullWidth?: boolean
}

export function Button({ variant = 'primary', fullWidth, className, children, ...props }: ButtonProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      whileHover={{ scale: 1.02 }}
      className={cn(VARIANT_CLASS[variant], fullWidth && 'w-full', className)}
      {...props}
    >
      {children}
    </motion.button>
  )
}
