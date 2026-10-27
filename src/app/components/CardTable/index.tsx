'use client'

import './cards.css'
import { RouletteOption } from '@/app/types'
import { DeckCard, buildDeck, deckCapacity } from '@/app/utils/cards'
import { contrastText } from '@/app/utils/colors'
import { Movie } from '@/app/utils/tmdbApi'
import { random } from '@/app/utils/wheel'
import React, {
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'
import TmdbImage from '../TmdbImage'
import {
  baseCardWidth,
  choreograph,
  poseTransform,
  stackPose,
} from './choreography'

// Duração mínima da coreografia: abaixo disso os truques viram um borrão
const MIN_CARD_SECONDS = 6
// Com movimento reduzido: só um fade com o resultado
const REDUCED_SECONDS = 0.9

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

// Duração do modo cartas para a duração de giro escolhida (a música do giro
// é cortada para acabar junto)
export const cardSeconds = (spinSeconds: number) =>
  prefersReducedMotion()
    ? REDUCED_SECONDS
    : Math.max(MIN_CARD_SECONDS, spinSeconds)

export interface CardPlay {
  // fatias da roda e a fatia sorteada (o mesmo sorteio da roda)
  segments: RouletteOption[]
  winnerIndex: number
  seconds: number
  // resolve quando a música começa
  start: Promise<number>
  onTick: () => void
  onDone: () => void
}

export interface CardTableHandle {
  play: (play: CardPlay) => void
}

interface Round {
  id: number
  cards: DeckCard[]
  winner: number
  hidden: number
  uneven: boolean
  play: CardPlay
}

interface CardTableProps {
  handleRef: React.Ref<CardTableHandle>
  // opções distintas na roda (o maço parado mostra quantas cartas tem)
  optionCount: number
  // girando ou com o vencedor em destaque; ao desligar as cartas voltam ao maço
  active: boolean
  canPlay: boolean
  onPlay: () => void
  movieById: Map<number, Movie>
}

// Cartas do maço parado (só as costas; o resto fica implícito na espessura)
const IDLE_CARDS = 7

const CardTable: React.FC<CardTableProps> = ({
  handleRef,
  optionCount,
  active,
  canPlay,
  onPlay,
  movieById,
}) => {
  const stageRef = useRef<HTMLDivElement>(null)
  const worldRef = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ w: 0, h: 0 })
  const sizeRef = useRef(size)
  const [round, setRound] = useState<Round | null>(null)
  const roundId = useRef(0)

  // Tamanho da mesa (só muda com a janela; nada é medido durante a animação)
  useLayoutEffect(() => {
    const stage = stageRef.current
    if (!stage) return
    const measure = () => {
      const next = { w: stage.clientWidth, h: stage.clientHeight }
      sizeRef.current = next
      setSize((prev) => (prev.w === next.w && prev.h === next.h ? prev : next))
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(stage)
    return () => observer.disconnect()
  }, [])

  useImperativeHandle(
    handleRef,
    () => ({
      play: (play) => {
        const { w } = sizeRef.current
        const winnerId = play.segments[play.winnerIndex]?.id ?? ''
        const deck = buildDeck(play.segments, winnerId, deckCapacity(w))
        setRound({ id: ++roundId.current, ...deck, play })
      },
    }),
    [],
  )

  // Roda a coreografia da rodada: keyframes calculados uma vez e entregues
  // ao WAAPI (transform/opacity no compositor)
  useLayoutEffect(() => {
    const world = worldRef.current
    if (!round || !world) return
    const { w, h } = sizeRef.current
    const base = baseCardWidth(w, h)
    const n = round.cards.length
    const script = choreograph({
      n,
      winner: round.winner,
      w,
      h,
      base,
      rand: random,
    })
    // O mesmo palco serve rodadas seguidas: apaga o fade de saída anterior
    world.getAnimations().forEach((a) => a.cancel())
    const cards = [...world.querySelectorAll<HTMLElement>('[data-card]')]
    // Antes da música começar as cartas ficam no maço
    cards.forEach((el, i) => {
      el.style.transform = String(script.cards[i]?.move[0].transform ?? '')
    })

    let cancelled = false
    const animations: Animation[] = []
    const timers: ReturnType<typeof setTimeout>[] = []
    const reduced = prefersReducedMotion()

    round.play.start.then(() => {
      if (cancelled) return
      const duration = round.play.seconds * 1000
      // Movimento reduzido: as cartas já aparecem no lugar final
      const frames = (k: Keyframe[]) =>
        reduced
          ? [
              { ...k[k.length - 1], offset: 0 },
              { ...k[k.length - 1], offset: 1 },
            ]
          : k
      const timing: KeyframeAnimationOptions = { duration, fill: 'forwards' }
      cards.forEach((el, i) => {
        const s = script.cards[i]
        if (!s) return
        animations.push(el.animate(frames(s.move), timing))
        const inner = el.querySelector<HTMLElement>('.deck-inner')
        const shade = el.querySelector<HTMLElement>('.deck-shade')
        const glow = el.querySelector<HTMLElement>('.deck-glow')
        if (inner) animations.push(inner.animate(frames(s.flip), timing))
        if (shade) animations.push(shade.animate(frames(s.shade), timing))
        if (glow) animations.push(glow.animate(frames(s.glow), timing))
      })
      if (reduced)
        animations.push(
          world.animate([{ opacity: 0 }, { opacity: 1 }], {
            duration: 400,
            easing: 'ease-out',
          }),
        )
      else {
        let lastTick = 0
        script.ticks.forEach((t) =>
          timers.push(
            setTimeout(() => {
              const now = performance.now()
              if (now - lastTick < 35) return
              lastTick = now
              round.play.onTick()
            }, t * duration),
          ),
        )
      }
      timers.push(setTimeout(() => round.play.onDone(), duration))
    })

    return () => {
      cancelled = true
      animations.forEach((a) => a.cancel())
      timers.forEach(clearTimeout)
    }
  }, [round])

  // Fechou o resultado: as cartas viram de costas e voltam ao maço
  useEffect(() => {
    const world = worldRef.current
    if (active || !round || !world) return
    // Movimento reduzido: só some com um fade
    if (prefersReducedMotion()) {
      let alive = true
      world
        .animate([{ opacity: 0 }], { duration: 200, fill: 'forwards' })
        .finished.then(() => alive && setRound(null))
        .catch(() => {})
      return () => {
        alive = false
      }
    }
    const { w, h } = sizeRef.current
    const base = baseCardWidth(w, h)
    const n = round.cards.length
    const cards = [...world.querySelectorAll<HTMLElement>('[data-card]')]
    const last: Animation[] = []
    cards.forEach((el, i) => {
      const parts = [
        el,
        ...el.querySelectorAll<HTMLElement>(
          '.deck-inner, .deck-shade, .deck-glow',
        ),
      ]
      // Congela onde a coreografia parou e parte dali
      parts.forEach((part) =>
        part.getAnimations().forEach((a) => {
          try {
            a.commitStyles()
          } catch {}
          a.cancel()
        }),
      )
      const timing: KeyframeAnimationOptions = {
        duration: 420,
        delay: i * 14,
        easing: 'cubic-bezier(.4,0,.2,1)',
        fill: 'forwards',
      }
      last.push(
        el.animate(
          [{ transform: poseTransform(stackPose(i, n, w, base)) }],
          timing,
        ),
      )
      parts
        .slice(1)
        .forEach((part) =>
          part.animate(
            [
              part.classList.contains('deck-inner')
                ? { transform: 'rotateY(0deg)' }
                : { opacity: 0 },
            ],
            timing,
          ),
        )
    })
    let alive = true
    Promise.all(last.map((a) => a.finished))
      .then(() => alive && setRound(null))
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [active, round])

  const base = size.w ? baseCardWidth(size.w, size.h) : 0
  const idleCount = Math.min(IDLE_CARDS, optionCount)

  return (
    <div
      ref={stageRef}
      className="deck-stage relative mx-auto aspect-square w-full max-w-[600px] select-none lg:w-[min(100cqw,100cqh)] lg:max-w-[760px]"
      style={{ '--deck-w': `${base}px` } as React.CSSProperties}
    >
      <div className="deck-felt ui-deck-table" aria-hidden="true" />

      {base > 0 && !round && (
        <button
          type="button"
          onClick={onPlay}
          disabled={!canPlay}
          aria-label="Embaralhar e distribuir as cartas"
          className="deck-idle group"
        >
          {Array.from({ length: Math.max(1, idleCount) }, (_, d) => (
            <span
              key={d}
              className="deck-card"
              style={{
                transform: poseTransform(stackPose(d, idleCount, size.w, base)),
              }}
            >
              <span className="deck-face deck-back ui-deck-back">
                <span className="deck-emblem" />
              </span>
            </span>
          ))}
          <span className="deck-caption ui-deck-caption">
            {optionCount === 0
              ? 'Adicione opções'
              : `${optionCount} ${optionCount === 1 ? 'carta' : 'cartas'}`}
          </span>
        </button>
      )}

      {round && (
        <div ref={worldRef} className="deck-world" aria-hidden="true">
          {round.cards.map((card, i) => {
            const { option } = card
            const movie = option.movieId
              ? movieById.get(option.movieId)
              : undefined
            const poster = movie?.poster_path
            return (
              <div key={`${round.id}-${i}`} data-card className="deck-card">
                {i === round.winner && (
                  <div
                    className="deck-glow ui-deck-glow"
                    style={{ '--glow': option.color } as React.CSSProperties}
                  />
                )}
                <div className="deck-inner">
                  <div className="deck-face deck-back ui-deck-back">
                    <span className="deck-emblem" />
                  </div>
                  <div
                    className={`deck-face deck-front ui-deck-face${poster ? 'has-poster' : ''}`}
                    style={
                      {
                        '--card-color': option.color,
                        color: contrastText(option.color),
                      } as React.CSSProperties
                    }
                  >
                    {poster ? (
                      <TmdbImage
                        path={poster}
                        fill
                        sizes={`${Math.round(base)}px`}
                        loading="eager"
                        alt=""
                        className="object-cover"
                      />
                    ) : (
                      <span className="deck-index">{option.text}</span>
                    )}
                    <span className="deck-name">{option.text}</span>
                    {round.uneven && (
                      <span className="deck-weight">×{card.weight}</span>
                    )}
                    <span className="deck-shade" />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {round && round.hidden > 0 && (
        <span className="deck-more ui-deck-caption">
          +{round.hidden} no baralho
        </span>
      )}
    </div>
  )
}

export default CardTable
