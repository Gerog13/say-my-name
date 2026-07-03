import { cardsForPacks } from '@/data/cards'
import type { GameConfig } from '@/types'
import { sample } from './utils'

export interface BuiltDecks {
  deck: string[]
  lightningDeck: string[]
}

export function buildDecks(
  playerCount: number,
  config: GameConfig,
  packIds: string[],
): BuiltDecks {
  const pool = cardsForPacks(packIds)
  const players = Math.max(1, playerCount)

  const mainCount = Math.max(3, config.mainPerPlayer * players)
  const lightningCount = Math.max(3, config.lightningPerPlayer * players)

  const shuffled = sample(pool, pool.length)
  const deck = shuffled.slice(0, Math.min(mainCount, shuffled.length)).map((c) => c.id)

  const remaining = shuffled.slice(deck.length)
  const lightningSource = remaining.length >= 3 ? remaining : shuffled
  const lightningDeck = sample(lightningSource, lightningCount).map((c) => c.id)

  return { deck, lightningDeck }
}
