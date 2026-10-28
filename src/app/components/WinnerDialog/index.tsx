'use client'

import './dialog.css'
import { RouletteOption } from '@/app/types'
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

// Modal do vencedor. Fica montado desde o começo do giro (o vencedor já está
// sorteado), quase transparente mas pintado: abrir só liga o atributo
// data-open, e a entrada é CSS em transform/opacity sobre poucas camadas já
// rasterizadas (dialog.css). Montar a árvore ou pintar uma dúzia de camadas
// novas no primeiro quadro congelava a abertura.

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'

// Raios atrás do card: 18 fachos de 7° a cada 20°, que somem do centro para a
// borda, desenhados uma vez num canvas pequeno; a GPU só gira a textura
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
  fade.addColorStop(0.22, '#000')
  fade.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = fade
  ctx.fillRect(0, 0, RAYS_SIZE, RAYS_SIZE)
  ctx.globalCompositeOperation = 'source-over'
}

const MAX_PROVIDERS = 6

const WinnerDialog: React.FC<WinnerDialogProps> = ({
  isOpen,
  winner,
  movie,
  eliminationMode,
  onClose,
  onRemove,
  onSpinAgain,
}) => {
  const raysRef = useRef<HTMLCanvasElement>(null)
  const primaryRef = useRef<HTMLButtonElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const color = winner?.color ?? '#fbbf24'

  // raios prontos antes de abrir
  useLayoutEffect(() => {
    if (raysRef.current) drawRays(raysRef.current, color)
  }, [color])

  useEffect(() => {
    if (isOpen) primaryRef.current?.focus({ preventScroll: true })
  }, [isOpen])

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

  if (!winner) return null

  const title = movie?.title ?? winner.text
  const year = movie?.release_date?.slice(0, 4)
  const providers = movie?.watchProviders ?? []
  const poster = movie?.poster_path

  return (
    <div
      className="wd fixed inset-0 z-50 flex items-center justify-center overflow-hidden p-3 sm:p-6"
      data-open={isOpen ? '' : undefined}
      aria-hidden={!isOpen}
      inert={!isOpen}
      style={{ '--wd-color': color } as React.CSSProperties}
    >
      <button
        type="button"
        aria-label="Fechar"
        tabIndex={-1}
        onClick={onClose}
        className="wd-backdrop absolute inset-0 cursor-default bg-slate-950/60"
      />
      {/* holofote na cor do vencedor + raios girando */}
      <div className="wd-spot pointer-events-none absolute inset-0" />
      <div className="wd-rays pointer-events-none absolute left-1/2 top-1/2 aspect-square w-[110vmax] -translate-x-1/2 -translate-y-1/2">
        <canvas
          ref={raysRef}
          width={RAYS_SIZE}
          height={RAYS_SIZE}
          className="h-full w-full"
        />
      </div>

      <div
        className={`wd-frame relative w-full ${poster ? 'max-w-[46rem]' : 'max-w-md'}`}
      >
        <div
          ref={cardRef}
          role={isOpen ? 'dialog' : undefined}
          aria-modal={isOpen ? true : undefined}
          aria-labelledby="winner-title"
          className="ui-card wd-card relative flex max-h-[calc(100dvh-1.5rem)] flex-col overflow-hidden rounded-[1.75rem] border border-white/10 bg-slate-900 shadow-2xl"
        >
          <div
            className="wd-accent h-1.5 w-full shrink-0"
            style={{
              background: `linear-gradient(90deg, transparent, ${color} 18%, ${color} 82%, transparent)`,
            }}
          />

          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="absolute right-3 top-4 z-10 rounded-full p-1.5 text-slate-400 transition hover:bg-white/10 hover:text-white"
          >
            <svg
              width="20"
              height="20"
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
          <div
            className={`min-h-0 overflow-y-auto overscroll-contain p-5 pt-6 sm:p-7 ${poster ? 'text-center sm:text-left' : 'text-center'}`}
          >
            <p className="text-xs font-bold uppercase tracking-[0.35em] text-amber-300">
              🎉 Resultado
            </p>

            <div
              className={
                poster
                  ? 'mt-4 flex flex-col items-center gap-5 sm:flex-row sm:items-start sm:gap-7'
                  : 'mt-2'
              }
            >
              {poster ? (
                <div className="wd-poster relative h-56 w-[9.5rem] shrink-0 overflow-hidden rounded-2xl shadow-[0_24px_48px_-12px_rgba(0,0,0,0.85)] ring-1 ring-white/15 sm:h-[17.25rem] sm:w-[11.5rem]">
                  {/* já baixado durante o giro (preloadTmdbImage, mesmo sizes) */}
                  <TmdbImage
                    path={poster}
                    alt={title}
                    fill
                    sizes="184px"
                    loading="eager"
                    className="object-cover"
                  />
                  <span className="wd-shine pointer-events-none absolute inset-y-0 left-0 w-1/2" />
                </div>
              ) : (
                <div
                  className="wd-medal relative mx-auto mt-4 grid h-24 w-24 place-items-center rounded-full ring-4 ring-white/15"
                  style={{
                    background: `radial-gradient(circle at 35% 30%, rgba(255,255,255,0.55), transparent 42%), ${color}`,
                    boxShadow: `0 12px 40px -6px ${color}`,
                  }}
                >
                  <span className="text-4xl" aria-hidden="true">
                    ★
                  </span>
                </div>
              )}

              <div className="min-w-0 flex-1">
                <h2
                  id="winner-title"
                  className={`animate-winner-name wd-title break-words font-black leading-[1.08] ${poster ? 'text-3xl sm:mt-1 sm:text-[2.15rem]' : 'mt-5 text-4xl'}`}
                  style={{ textShadow: `0 0 28px ${color}` }}
                >
                  {title}
                </h2>

                {movie && (year || movie.vote_average > 0) && (
                  <div
                    className={`mt-3 flex flex-wrap gap-2 text-xs font-semibold ${poster ? 'justify-center sm:justify-start' : 'justify-center'}`}
                  >
                    <span className="rounded-full bg-white/[0.07] px-2.5 py-1 text-slate-300">
                      {year || 'Ano não informado'}
                    </span>
                    {movie.vote_average > 0 && (
                      <span className="rounded-full bg-amber-400/15 px-2.5 py-1 text-amber-300">
                        ★ {movie.vote_average.toFixed(1)}
                      </span>
                    )}
                  </div>
                )}

                {movie?.overview && (
                  <p className="mt-3 line-clamp-4 text-left text-sm leading-relaxed text-slate-300">
                    {movie.overview}
                  </p>
                )}

                {providers.length > 0 && (
                  <div className="mt-4">
                    <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                      Onde assistir
                    </p>
                    <div
                      className={`flex flex-wrap gap-1.5 ${poster ? 'justify-center sm:justify-start' : 'justify-center'}`}
                    >
                      {providers.slice(0, MAX_PROVIDERS).map((p) => (
                        <span
                          key={p.provider_id}
                          className="flex items-center gap-1.5 rounded-lg bg-white/[0.06] py-1 pl-1 pr-2 text-[11px]"
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
                      {providers.length > MAX_PROVIDERS && (
                        <span
                          className="flex items-center rounded-lg bg-white/[0.06] px-2 py-1 text-[11px] text-slate-400"
                          title={providers
                            .slice(MAX_PROVIDERS)
                            .map((p) => p.provider_name)
                            .join(', ')}
                        >
                          +{providers.length - MAX_PROVIDERS}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Abaixo do onde assistir e recolhida: só cresce se pedirem */}
                {winner.movieId && (
                  <div className="mt-4">
                    <SoundtrackLinks tmdbId={winner.movieId} title={title} />
                  </div>
                )}
              </div>
            </div>

            {eliminationMode && (
              <p className="mt-5 text-center text-xs text-slate-400">
                Modo eliminação: esta opção sairá da roleta ao fechar.
              </p>
            )}
          </div>

          <div className="flex shrink-0 flex-col gap-2 border-t border-white/10 bg-white/[0.02] p-4 sm:flex-row-reverse">
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
    </div>
  )
}

export default WinnerDialog
