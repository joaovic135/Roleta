import { RouletteOption } from '../types'
import { random } from './wheel'

// Uma carta por opção. O peso é o número de fatias da opção na roda: o
// sorteio é o mesmo da roda (uma fatia), a carta só mostra o resultado.
export interface DeckCard {
  option: RouletteOption
  weight: number
}

export interface Deck {
  cards: DeckCard[]
  // Posição da carta vencedora em `cards`
  winner: number
  // Opções que ficaram fora da mesa (muitas opções)
  hidden: number
  // Pesos diferentes entre as opções: as cartas mostram "×N"
  uneven: boolean
}

const shuffle = <T>(items: T[]): T[] => {
  const next = [...items]
  for (let i = next.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[next[i], next[j]] = [next[j], next[i]]
  }
  return next
}

// Quantas cartas cabem na mesa pela largura dela
export const deckCapacity = (width: number): number =>
  width < 420 ? 14 : width < 560 ? 18 : 24

// Monta o baralho a partir das fatias da roda. Com mais opções que a mesa
// comporta, entram a vencedora e uma amostra aleatória das outras.
export const buildDeck = (
  segments: RouletteOption[],
  winnerId: string,
  capacity: number,
): Deck => {
  const byId = new Map<string, DeckCard>()
  segments.forEach((option) => {
    const card = byId.get(option.id)
    if (card) card.weight++
    else byId.set(option.id, { option, weight: 1 })
  })
  const all = [...byId.values()]
  const winnerCard = byId.get(winnerId) ?? all[0]
  const others = shuffle(all.filter((c) => c !== winnerCard))
  const room = Math.max(0, capacity - 1)
  const cards = shuffle([winnerCard, ...others.slice(0, room)])
  return {
    cards,
    winner: cards.indexOf(winnerCard),
    hidden: Math.max(0, others.length - room),
    uneven: all.some((c) => c.weight !== all[0].weight),
  }
}
