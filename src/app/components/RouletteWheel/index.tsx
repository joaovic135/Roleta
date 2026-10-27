'use client'

import { RouletteOption } from '@/app/types'
import { contrastText } from '@/app/utils/colors'
import { Movie } from '@/app/utils/tmdbApi'
import React, { useEffect, useRef, useState } from 'react'
import SliceTooltip from '../SliceTooltip'
import StylizedPointer from '../StylizedPointer'

interface RouletteWheelProps {
  segments: RouletteOption[]
  highlightIndex: number | null
  isSpinning: boolean
  canSpin: boolean
  onSpin: () => void
  rotorRef: React.RefObject<HTMLDivElement | null>
  pointerRef: React.RefObject<HTMLDivElement | null>
  rotationRef: React.RefObject<number>
  movieById: Map<number, Movie>
}

// Resolução interna do canvas (escalado via CSS, nítido em telas retina)
const SIZE = 1000
const BULBS = 24
// Raio do miolo (botão GIRAR), em fração do raio da roda
const HUB_RATIO = 0.2

// Posições das lâmpadas no aro. Arredondadas para virar o mesmo texto no
// servidor e no navegador (senão o React acusa erro de hidratação).
const BULB_POSITIONS = Array.from({ length: BULBS }, (_, i) => {
  const angle = (i / BULBS) * 2 * Math.PI
  return {
    left: `${(50 + 47.75 * Math.cos(angle)).toFixed(3)}%`,
    top: `${(50 + 47.75 * Math.sin(angle)).toFixed(3)}%`,
  }
})

const ellipsize = (
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): string => {
  if (ctx.measureText(text).width <= maxWidth) return text
  let end = text.length
  while (end > 1 && ctx.measureText(text.slice(0, end) + '…').width > maxWidth)
    end--
  return text.slice(0, end).trimEnd() + '…'
}

const RouletteWheel: React.FC<RouletteWheelProps> = ({
  segments,
  highlightIndex,
  isSpinning,
  canSpin,
  onSpin,
  rotorRef,
  pointerRef,
  rotationRef,
  movieById,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const faceRef = useRef<HTMLDivElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)
  const [fontsReady, setFontsReady] = useState(false)
  // Incrementa quando a fonte do tema termina de carregar, para redesenhar
  const [fontTick, setFontTick] = useState(0)
  const fontsRequested = useRef(new Set<string>())
  const [hoverIndex, setHoverIndex] = useState<number | null>(null)
  const hovered =
    !isSpinning && hoverIndex !== null ? segments[hoverIndex] : undefined

  // Descobre a fatia sob o cursor pelo ângulo em relação ao centro,
  // descontando a rotação atual da roda. O tooltip é movido direto no DOM,
  // então mover o mouse só re-renderiza quando a fatia muda.
  const handlePointerMove = (e: React.PointerEvent) => {
    const face = faceRef.current
    const container = containerRef.current
    if (isSpinning || !face || !container || segments.length === 0) {
      setHoverIndex(null)
      return
    }
    const rect = face.getBoundingClientRect()
    const dx = e.clientX - (rect.left + rect.width / 2)
    const dy = e.clientY - (rect.top + rect.height / 2)
    const distance = Math.hypot(dx, dy) / (rect.width / 2)
    if (distance > 1 || distance < HUB_RATIO) {
      setHoverIndex(null)
      return
    }

    const screenAngle = (Math.atan2(dy, dx) * 180) / Math.PI
    const local = screenAngle + 90 - (rotationRef.current ?? 0)
    const normalized = ((local % 360) + 360) % 360
    setHoverIndex(
      Math.floor(normalized / (360 / segments.length)) % segments.length,
    )

    const tooltip = tooltipRef.current
    if (!tooltip) return
    const box = container.getBoundingClientRect()
    const x = e.clientX - box.left
    const y = e.clientY - box.top
    const offsetX = x > box.width / 2 ? 'calc(-100% - 16px)' : '16px'
    const offsetY = y > box.height * 0.55 ? 'calc(-100% - 16px)' : '16px'
    tooltip.style.transform = `translate(${x}px, ${y}px) translate(${offsetX}, ${offsetY})`
  }

  useEffect(() => {
    document.fonts?.ready.then(() => setFontsReady(true))
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    // Fonte das fatias: a do tema (--wheel-font) ou a do site
    const bodyStyle = getComputedStyle(document.body)
    const fontFamily =
      bodyStyle.getPropertyValue('--wheel-font').trim() || bodyStyle.fontFamily
    // Temas pixel art desenham a roda em resolução baixa (--wheel-pixel) e o
    // CSS amplia sem suavizar; o desenho continua nas coordenadas de 0 a SIZE
    const pixel = Math.max(
      1,
      parseFloat(bodyStyle.getPropertyValue('--wheel-pixel')) || 1,
    )
    const fontScale =
      parseFloat(bodyStyle.getPropertyValue('--wheel-font-scale')) || 1
    const resolution = Math.round(SIZE / pixel)
    if (canvas.width !== resolution) {
      canvas.width = resolution
      canvas.height = resolution
    }
    ctx.setTransform(resolution / SIZE, 0, 0, resolution / SIZE, 0, 0)
    // linhas com pelo menos 1 pixel real
    const line = (width: number) => Math.max(width, pixel)
    const c = SIZE / 2
    const r = SIZE / 2
    const hub = r * HUB_RATIO
    ctx.clearRect(0, 0, SIZE, SIZE)

    if (segments.length === 0) {
      ctx.beginPath()
      ctx.arc(c, c, r, 0, 2 * Math.PI)
      ctx.fillStyle = '#1e293b'
      ctx.fill()
      ctx.fillStyle = '#94a3b8'
      ctx.font = `600 42px ${fontFamily}`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('Adicione opções', c, c - 170)
      return
    }

    const n = segments.length
    const slice = (2 * Math.PI) / n
    const start = (i: number) => -Math.PI / 2 + i * slice
    const wedge = (i: number) => {
      ctx.beginPath()
      ctx.moveTo(c, c)
      ctx.arc(c, c, r, start(i), start(i) + slice)
      ctx.closePath()
    }

    // Fatias
    segments.forEach((option, i) => {
      wedge(i)
      ctx.fillStyle = option.color
      ctx.fill()
    })

    // Sombreamento para dar profundidade
    const shade = ctx.createRadialGradient(c, c, hub, c, c, r)
    shade.addColorStop(0, 'rgba(0,0,0,0.25)')
    shade.addColorStop(0.35, 'rgba(0,0,0,0.05)')
    shade.addColorStop(0.7, 'rgba(255,255,255,0.08)')
    shade.addColorStop(0.93, 'rgba(0,0,0,0)')
    shade.addColorStop(1, 'rgba(0,0,0,0.3)')
    ctx.beginPath()
    ctx.arc(c, c, r, 0, 2 * Math.PI)
    ctx.fillStyle = shade
    ctx.fill()

    // Divisórias
    if (n > 1) {
      ctx.strokeStyle = 'rgba(255,255,255,0.6)'
      ctx.lineWidth = line(n > 40 ? 1.5 : 3)
      for (let i = 0; i < n; i++) {
        ctx.beginPath()
        ctx.moveTo(c, c)
        ctx.lineTo(c + r * Math.cos(start(i)), c + r * Math.sin(start(i)))
        ctx.stroke()
      }
    }

    // Teia por cima das fatias (tema Homem-Aranha): anéis que cedem entre
    // uma divisória e outra, como fios de teia
    const webColor = bodyStyle.getPropertyValue('--wheel-web').trim()
    if (webColor) {
      const spokes = Math.max(n, 8)
      const step = (2 * Math.PI) / spokes
      ctx.strokeStyle = webColor
      ctx.lineWidth = line(2.5)
      if (n < 8) {
        for (let i = 0; i < spokes; i++) {
          const a = -Math.PI / 2 + i * step
          ctx.beginPath()
          ctx.moveTo(c, c)
          ctx.lineTo(c + r * Math.cos(a), c + r * Math.sin(a))
          ctx.stroke()
        }
      }
      for (let k = 1; k <= 5; k++) {
        const ring = hub + ((r - hub) * k) / 5.4
        ctx.beginPath()
        for (let i = 0; i <= spokes; i++) {
          const a = -Math.PI / 2 + i * step
          const x = c + ring * Math.cos(a)
          const y = c + ring * Math.sin(a)
          if (i === 0) {
            ctx.moveTo(x, y)
          } else {
            const mid = a - step / 2
            ctx.quadraticCurveTo(
              c + ring * 0.9 * Math.cos(mid),
              c + ring * 0.9 * Math.sin(mid),
              x,
              y,
            )
          }
        }
        ctx.stroke()
      }
    }

    // Destaque da fatia vencedora
    const highlight = highlightIndex !== null && n > 1 ? highlightIndex : null
    if (highlight !== null) {
      ctx.fillStyle = 'rgba(2,6,23,0.62)'
      for (let i = 0; i < n; i++) {
        if (i === highlight) continue
        wedge(i)
        ctx.fill()
      }
      wedge(highlight)
      ctx.strokeStyle = '#ffffff'
      ctx.lineWidth = 8
      ctx.lineJoin = 'round'
      ctx.stroke()
    }

    // Fatia sob o cursor
    if (hoverIndex !== null && hoverIndex < n && !isSpinning) {
      wedge(hoverIndex)
      ctx.fillStyle = 'rgba(255,255,255,0.18)'
      ctx.fill()
      ctx.strokeStyle = 'rgba(255,255,255,0.9)'
      ctx.lineWidth = 5
      ctx.lineJoin = 'round'
      ctx.stroke()
    }

    // Textos
    const fontSize = Math.max(16, Math.min(46, slice * r * 0.32)) * fontScale
    const maxWidth = r - hub - 70
    ctx.font = `700 ${fontSize}px ${fontFamily}`
    if (
      document.fonts &&
      !fontsRequested.current.has(ctx.font) &&
      !document.fonts.check(ctx.font)
    ) {
      fontsRequested.current.add(ctx.font)
      document.fonts.load(ctx.font).then(() => setFontTick((t) => t + 1))
    }
    ctx.textAlign = 'right'
    ctx.textBaseline = 'middle'
    segments.forEach((option, i) => {
      ctx.save()
      ctx.translate(c, c)
      ctx.rotate(start(i) + slice / 2)
      ctx.globalAlpha = highlight !== null && i !== highlight ? 0.4 : 1
      const color = contrastText(option.color)
      ctx.fillStyle = color
      ctx.shadowColor =
        color === '#ffffff' ? 'rgba(0,0,0,0.45)' : 'rgba(255,255,255,0.3)'
      ctx.shadowBlur = 6
      ctx.fillText(ellipsize(ctx, option.text, maxWidth), r - 40, 2)
      ctx.restore()
    })
  }, [segments, highlightIndex, hoverIndex, isSpinning, fontsReady, fontTick])

  return (
    <div
      ref={containerRef}
      onPointerMove={handlePointerMove}
      onPointerDown={handlePointerMove}
      onPointerLeave={() => setHoverIndex(null)}
      className="relative mx-auto aspect-square w-full max-w-[600px] select-none lg:w-[min(100cqw,100cqh)] lg:max-w-[760px]"
    >
      {/* Aro dourado */}
      <div className="ui-rim absolute inset-0 rounded-full bg-gradient-to-b from-amber-200 via-amber-500 to-amber-800 p-[4.5%] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.9),0_0_80px_-20px_rgb(var(--amber-400)/0.45)]">
        <div
          ref={faceRef}
          className="h-full w-full rounded-full bg-slate-950 p-[0.8%]"
        >
          <div ref={rotorRef} className="h-full w-full will-change-transform">
            <canvas ref={canvasRef} className="h-full w-full rounded-full" />
          </div>
        </div>
      </div>

      {/* Lâmpadas */}
      {BULB_POSITIONS.map(({ left, top }, i) => {
        const celebrating = !isSpinning && highlightIndex !== null
        return (
          <span
            key={i}
            className={`bulb absolute h-[2.2%] w-[2.2%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-50 ${
              isSpinning ? 'bulb-fast' : celebrating ? 'bulb-win' : ''
            }`}
            style={{
              left,
              top,
              animationDelay:
                i % 2 && !celebrating ? (isSpinning ? '0.2s' : '1.2s') : '0s',
            }}
          />
        )
      })}

      {/* Sombra interna */}
      <div className="pointer-events-none absolute inset-[5.3%] rounded-full shadow-[inset_0_0_40px_rgba(0,0,0,0.55)]" />

      {/* Botão central */}
      <button
        type="button"
        onClick={onSpin}
        disabled={!canSpin}
        aria-label="Girar roleta"
        className="ui-hub absolute left-1/2 top-1/2 z-10 flex aspect-square w-[20%] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-gradient-to-b from-slate-700 to-slate-950 text-[clamp(0.7rem,2.6vw,1.05rem)] font-black tracking-widest text-amber-300 shadow-[0_8px_20px_rgba(0,0,0,0.6),inset_0_2px_0_rgba(255,255,255,0.15)] ring-4 ring-amber-400 transition hover:scale-105 hover:text-amber-200 focus:outline-none focus-visible:ring-amber-200 active:scale-95 disabled:cursor-not-allowed disabled:hover:scale-100"
      >
        {isSpinning ? (
          <span className="h-1/3 w-1/3 animate-spin rounded-full border-4 border-amber-300/30 border-t-amber-300" />
        ) : (
          'GIRAR'
        )}
      </button>

      <StylizedPointer pointerRef={pointerRef} />

      <SliceTooltip
        tooltipRef={tooltipRef}
        option={hovered}
        movie={hovered?.movieId ? movieById.get(hovered.movieId) : undefined}
        chance={
          hovered
            ? (segments.filter((s) => s.id === hovered.id).length /
                segments.length) *
              100
            : 0
        }
      />
    </div>
  )
}

export default RouletteWheel
