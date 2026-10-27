'use client'

import { RouletteOption } from '@/app/types'
import { celebrate } from '@/app/utils/celebrate'
import { Movie } from '@/app/utils/tmdbApi'
import React, { useEffect, useLayoutEffect, useRef } from 'react'
import SoundtrackLinks from '../SoundtrackLinks'
import TmdbImage from '../TmdbImage'

interface WinnerDialogProps {
  isOpen: boolean
  winner: RouletteOption | null
  movie?: Movie
  eliminationMode: boolean
  onClose: () => void
  onRemove: () => void
  onSpinAgain: () => void
}

// Atraso de entrada de cada parte do modal, para revelar em sequência
const delay = (ms: number): React.CSSProperties => ({
  animationDelay: `${ms}ms`,
})

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'

// Raios atrás do card: 18 fachos de 7° a cada 20°, que somem do centro para a
// borda. Desenhados uma vez num canvas pequeno, a GPU só gira a textura pronta
// (o gradiente cônico com máscara do tamanho da tela era rasterizado de novo
// na entrada do modal e travava a animação)
const RAYS_SIZE = 768
const drawRays = (canvas: HTMLCanvasElement, color: string) => {
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  const c = RAYS_SIZE / 2
  const deg = Math.PI / 180
  ctx.clearRect(0, 0, RAYS_SIZE, RAYS_SIZE)
  ctx.fillStyle = color
  ctx.beginPath()
  for (let i = 0; i < 18; i++) {
    ctx.moveTo(c, c)
    ctx.arc(c, c, c, i * 20 * deg, (i * 20 + 7) * deg)
    ctx.closePath()
  }
  ctx.fill()
  ctx.globalCompositeOperation = 'destination-in'
  const fade = ctx.createRadialGradient(c, c, 0, c, c, c)
  fade.addColorStop(0.27, '#000')
  fade.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = fade
  ctx.fillRect(0, 0, RAYS_SIZE, RAYS_SIZE)
  ctx.globalCompositeOperation = 'source-over'
}

const WinnerDialog: React.FC<WinnerDialogProps> = ({
  isOpen,
  winner,
  movie,
  eliminationMode,
  onClose,
  onRemove,
  onSpinAgain,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const raysRef = useRef<HTMLCanvasElement>(null)
  const primaryRef = useRef<HTMLButtonElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)

  // antes da primeira pintura, para os raios já entrarem prontos
  useLayoutEffect(() => {
    if (isOpen && winner && raysRef.current)
      drawRays(raysRef.current, winner.color)
  }, [isOpen, winner])

  useEffect(() => {
    if (!isOpen || !winner || !canvasRef.current) return
    primaryRef.current?.focus()
    return celebrate(canvasRef.current, winner.color)
  }, [isOpen, winner])

  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      const card = cardRef.current
      if (e.key !== 'Tab' || !card) return
      // Tab dá a volta dentro do card: atrás do fundo escuro estão a roleta e
      // os controles de som, que não deviam receber foco com o modal aberto
      const items = [...card.querySelectorAll<HTMLElement>(FOCUSABLE)]
      if (!items.length) return
      const first = items[0]
      const last = items[items.length - 1]
      const active = document.activeElement
      if (!card.contains(active) || (e.shiftKey && active === first)) {
        e.preventDefault()
        ;(e.shiftKey ? last : first).focus()
      } else if (!e.shiftKey && active === last) {
        e.preventDefault()
        first.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, onClose])

  if (!isOpen || !winner) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden p-4">
      <button
        type="button"
        aria-label="Fechar"
        tabIndex={-1}
        onClick={onClose}
        className="animate-fade-in absolute inset-0 cursor-default bg-slate-950/80"
      />

      {/* Raios girando atrás do card, na cor do vencedor */}
      <div className="animate-fade-in pointer-events-none absolute left-1/2 top-1/2 aspect-square w-[102vmax] -translate-x-1/2 -translate-y-1/2">
        <canvas
          ref={raysRef}
          width={RAYS_SIZE}
          height={RAYS_SIZE}
          className="animate-rays h-full w-full opacity-25"
        />
      </div>

      <div className="relative w-full max-w-md">
        {/* Brilho pulsante na cor do vencedor: sombra pintada uma vez (um
            filtro blur seria recalculado a cada quadro); só a opacidade anima */}
        <div
          className="animate-glow pointer-events-none absolute inset-4 rounded-3xl"
          style={{ boxShadow: `0 0 90px 40px ${winner.color}` }}
        />

        <div
          ref={cardRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="winner-title"
          className="ui-card animate-pop-in relative flex max-h-[calc(100dvh-2rem)] flex-col overflow-hidden rounded-3xl border border-white/10 bg-slate-900 shadow-2xl"
        >
          <div
            className="h-2 w-full shrink-0"
            style={{ backgroundColor: winner.color }}
          />

          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="absolute right-4 top-5 z-10 rounded-full p-1 text-slate-400 transition hover:bg-white/10 hover:text-white"
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          {/* Só o miolo rola: em tela baixa, ou com a trilha aberta, os botões
              de ação continuam à vista */}
          <div className="min-h-0 overflow-y-auto overscroll-contain p-6 pt-8 text-center">
            <p
              className="animate-reveal text-sm font-semibold uppercase tracking-[0.3em] text-amber-300"
              style={delay(60)}
            >
              🎉 Resultado
            </p>

            {movie?.poster_path && (
              <div
                className="animate-poster relative mx-auto mt-5 h-60 w-40 overflow-hidden rounded-xl shadow-2xl ring-1 ring-white/10"
                style={delay(90)}
              >
                {/* já baixado durante o giro (preloadTmdbImage, mesmo sizes) */}
                <TmdbImage
                  path={movie.poster_path}
                  alt={movie.title}
                  fill
                  sizes="160px"
                  loading="eager"
                  className="object-cover"
                />
              </div>
            )}

            <h2
              id="winner-title"
              className="animate-winner-name mt-5 break-words text-3xl font-black leading-tight sm:text-4xl"
              style={{
                ...delay(movie?.poster_path ? 170 : 110),
                textShadow: `0 0 32px ${winner.color}`,
              }}
            >
              {movie?.title ?? winner.text}
            </h2>

            {movie && (
              <div className="animate-reveal mt-3 space-y-3" style={delay(230)}>
                <p className="text-sm text-slate-400">
                  {movie.release_date?.slice(0, 4) || 'Ano não informado'}
                  {movie.vote_average > 0 &&
                    ` · ★ ${movie.vote_average.toFixed(1)}`}
                </p>
                {movie.overview && (
                  <p className="line-clamp-3 text-left text-sm text-slate-300">
                    {movie.overview}
                  </p>
                )}
                {movie.watchProviders && movie.watchProviders.length > 0 && (
                  <div>
                    <p className="mb-2 text-xs uppercase tracking-wider text-slate-500">
                      Onde assistir
                    </p>
                    <div className="flex flex-wrap justify-center gap-2">
                      {movie.watchProviders.map((p) => (
                        <span
                          key={p.provider_id}
                          className="flex items-center gap-1.5 rounded-lg bg-white/5 py-1 pl-1 pr-2 text-xs"
                        >
                          <TmdbImage
                            path={p.logo_path}
                            kind="logo"
                            alt=""
                            width={22}
                            height={22}
                            className="rounded"
                          />
                          {p.provider_name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Abaixo do onde assistir e recolhida: só cresce se pedirem */}
            {winner.movieId && (
              <div className="animate-reveal mt-4" style={delay(270)}>
                <SoundtrackLinks
                  tmdbId={winner.movieId}
                  title={movie?.title ?? winner.text}
                />
              </div>
            )}

            {eliminationMode && (
              <p
                className="animate-reveal mt-4 text-xs text-slate-400"
                style={delay(260)}
              >
                Modo eliminação: esta opção sairá da roleta ao fechar.
              </p>
            )}
          </div>

          <div
            className="animate-reveal flex shrink-0 flex-col gap-2 border-t border-white/10 bg-white/[0.02] p-4 sm:flex-row-reverse"
            style={delay(290)}
          >
            <button
              ref={primaryRef}
              type="button"
              onClick={onSpinAgain}
              className="ui-btn flex-1 rounded-xl bg-amber-400 py-2.5 font-semibold text-slate-950 transition hover:bg-amber-300"
            >
              Girar de novo
            </button>
            {!eliminationMode && (
              <button
                type="button"
                onClick={onRemove}
                className="flex-1 rounded-xl border border-rose-500/40 py-2.5 font-medium text-rose-300 transition hover:bg-rose-500/10"
              >
                Remover da roleta
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-white/10 py-2.5 font-medium text-slate-200 transition hover:bg-white/10"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>

      {/* Confete: um único canvas animado num Web Worker */}
      <canvas
        ref={canvasRef}
        className="pointer-events-none fixed inset-0 z-[60] h-full w-full"
      />
    </div>
  )
}

export default WinnerDialog
