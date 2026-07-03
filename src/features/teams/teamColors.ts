export interface TeamColorClasses {
  text: string
  bg: string
  border: string
  ring: string
  soft: string
}

export const TEAM_COLOR_CLASSES: Record<string, TeamColorClasses> = {
  cyan: {
    text: 'text-cyan',
    bg: 'bg-cyan',
    border: 'border-cyan/50',
    ring: 'ring-cyan',
    soft: 'bg-cyan/15',
  },
  magenta: {
    text: 'text-magenta',
    bg: 'bg-magenta',
    border: 'border-magenta/50',
    ring: 'ring-magenta',
    soft: 'bg-magenta/15',
  },
  sunny: {
    text: 'text-sunny',
    bg: 'bg-sunny',
    border: 'border-sunny/50',
    ring: 'ring-sunny',
    soft: 'bg-sunny/15',
  },
  grape: {
    text: 'text-grape',
    bg: 'bg-grape',
    border: 'border-grape/50',
    ring: 'ring-grape',
    soft: 'bg-grape/15',
  },
}

export function teamColor(color: string): TeamColorClasses {
  return TEAM_COLOR_CLASSES[color] ?? TEAM_COLOR_CLASSES.cyan
}
