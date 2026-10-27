'use client'

// Camada de atores do tema: um canvas 2D só, do tamanho da caixa da cidade
// (mesma largura e centro do SVG), com 1 pixel do canvas = 1 pixel da cena
// e image-rendering: pixelated. Assim o herói, os carros e os pombos caem
// exatamente na grade da cidade desenhada em SVG. Laço do kit a 15 fps.
import { useEffect, useRef, useState } from 'react'
import { useCanvasFit } from '../_kit/canvas'
import { useSceneLoop } from '../_kit/loop'
import { W } from './city'
import { Game, createGame, measure } from './game'

// instante do quadro parado (prefers-reduced-motion): pôr do sol, sem
// chuva, herói no meio de um balanço
const STILL_MS = 52500

export default function Actors() {
  const ref = useRef<HTMLCanvasElement>(null)
  const game = useRef<Game | null>(null)
  const ctx = useRef<CanvasRenderingContext2D | null>(null)
  const measuredAt = useRef(-1)
  const [scale, setScale] = useState(0.34)

  // a escala acompanha a largura da caixa: 760 pixels de canvas sempre
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const fit = () => {
      if (el.clientWidth > 0) setScale(W / el.clientWidth)
    }
    fit()
    const observer = new ResizeObserver(fit)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  useCanvasFit(ref, { scale }, () => {
    measuredAt.current = -1
    window.dispatchEvent(new Event('scene:redraw'))
  })

  useEffect(() => {
    game.current = createGame()
    ctx.current = ref.current?.getContext('2d') ?? null
    window.dispatchEvent(new Event('scene:redraw'))
    return () => {
      game.current = null
    }
  }, [])

  useSceneLoop(
    (t, dt) => {
      const g = game.current
      const c = ref.current
      const context = ctx.current
      if (!g || !c || !context) return
      // relê a página de vez em quando (cards mudam de tamanho)
      if (measuredAt.current < 0 || Math.abs(t - measuredAt.current) > 3000) {
        measuredAt.current = t
        g.resize(measure(c, c.width, c.height))
      }
      g.draw(context, t, dt)
    },
    { fps: 15, still: STILL_MS },
  )

  return <canvas ref={ref} className="ap-actors" aria-hidden="true" />
}
