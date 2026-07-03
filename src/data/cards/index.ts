import type { Card } from '@/types'
import peliculas from './peliculas.json'
import series from './series.json'
import anime from './anime.json'
import futbol from './futbol.json'
import videojuegos from './videojuegos.json'
import memesArgentina from './memes-argentina.json'
import internetTech from './internet-tech.json'
import streamers from './streamers.json'

type RawCard = Omit<Card, 'id' | 'pack'>

export interface CardPack {
  id: string
  name: string
  emoji: string
  cards: RawCard[]
}

export const CARD_PACKS: CardPack[] = [
  { id: 'peliculas', name: 'Películas', emoji: '🎬', cards: peliculas },
  { id: 'series', name: 'Series', emoji: '📺', cards: series },
  { id: 'anime', name: 'Anime', emoji: '🍥', cards: anime },
  { id: 'futbol', name: 'Fútbol', emoji: '⚽', cards: futbol },
  { id: 'videojuegos', name: 'Videojuegos', emoji: '🎮', cards: videojuegos },
  { id: 'memes-argentina', name: 'Memes Argentina', emoji: '🇦🇷', cards: memesArgentina },
  { id: 'internet-tech', name: 'Internet & Tech', emoji: '🌐', cards: internetTech },
  { id: 'streamers', name: 'Streamers', emoji: '🎙️', cards: streamers },
]

const byId = new Map<string, Card>()

export const ALL_CARDS: Card[] = CARD_PACKS.flatMap((pack) =>
  pack.cards.map((card, i) => {
    const full: Card = { ...card, id: `${pack.id}-${i}`, pack: pack.id }
    byId.set(full.id, full)
    return full
  }),
)

export function getCardById(id: string): Card | undefined {
  return byId.get(id)
}

export function getCardsByIds(ids: string[]): Card[] {
  return ids.map((id) => byId.get(id)).filter((c): c is Card => Boolean(c))
}

export function cardsForPacks(packIds: string[]): Card[] {
  if (packIds.length === 0) return ALL_CARDS
  const set = new Set(packIds)
  return ALL_CARDS.filter((c) => c.pack && set.has(c.pack))
}
