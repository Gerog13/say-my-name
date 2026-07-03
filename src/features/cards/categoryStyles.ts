import type { Category } from '@/types'

export interface CategoryStyle {
  text: string
  border: string
  glow: string
  chip: string
  gradient: string
}

export const CATEGORY_STYLES: Record<Category | 'keyword', CategoryStyle> = {
  titles: {
    text: 'text-titles',
    border: 'border-titles/60',
    glow: 'shadow-[0_0_45px_-8px_rgba(255,79,163,0.7)]',
    chip: 'bg-titles/20 text-titles',
    gradient: 'from-titles/25 to-transparent',
  },
  characters: {
    text: 'text-characters',
    border: 'border-characters/60',
    glow: 'shadow-[0_0_45px_-8px_rgba(47,224,130,0.7)]',
    chip: 'bg-characters/20 text-characters',
    gradient: 'from-characters/25 to-transparent',
  },
  anything: {
    text: 'text-anything',
    border: 'border-anything/60',
    glow: 'shadow-[0_0_45px_-8px_rgba(58,160,255,0.7)]',
    chip: 'bg-anything/20 text-anything',
    gradient: 'from-anything/25 to-transparent',
  },
  keyword: {
    text: 'text-white',
    border: 'border-white/70',
    glow: 'shadow-[0_0_50px_-6px_rgba(255,255,255,0.65)]',
    chip: 'bg-white/20 text-white',
    gradient: 'from-white/20 to-transparent',
  },
}
