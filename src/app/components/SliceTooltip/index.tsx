import { RouletteOption } from '@/app/types'
import { Movie } from '@/app/utils/tmdbApi'
import React from 'react'
import TmdbImage from '../TmdbImage'

interface SliceTooltipProps {
  tooltipRef: React.RefObject<HTMLDivElement | null>
  option?: RouletteOption
  movie?: Movie
  chance: number
}

const MAX_PROVIDERS = 4

// Cartão que acompanha o cursor sobre uma fatia da roda. Fica sempre montado
// (só some com opacidade) para a roda poder posicioná-lo direto pelo ref.
const SliceTooltip: React.FC<SliceTooltipProps> = ({
  tooltipRef,
  option,
  movie,
  chance,
}) => {
  const providers = movie?.watchProviders ?? []

  return (
    <div
      ref={tooltipRef}
      aria-hidden="true"
      className={`pointer-events-none absolute left-0 top-0 z-30 w-72 transition-opacity duration-150 ${
        option ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {option && (
        <div className="ui-card flex gap-3 rounded-xl border border-white/10 bg-slate-900/95 p-3 shadow-2xl">
          {movie?.poster_path ? (
            <div className="relative h-24 w-16 shrink-0 overflow-hidden rounded-lg ring-1 ring-white/10">
              <TmdbImage
                path={movie.poster_path}
                alt=""
                fill
                sizes="64px"
                className="object-cover"
              />
            </div>
          ) : (
            <span
              className="mt-0.5 h-4 w-4 shrink-0 rounded-full ring-2 ring-white/20"
              style={{ backgroundColor: option.color }}
            />
          )}

          <div className="min-w-0 flex-1 text-left">
            <p className="line-clamp-2 text-sm font-bold leading-snug text-white">
              {movie?.title ?? option.text}
            </p>
            <p className="mt-0.5 text-xs text-slate-400">
              {movie?.release_date && `${movie.release_date.slice(0, 4)} · `}
              {movie &&
                movie.vote_average > 0 &&
                `★ ${movie.vote_average.toFixed(1)} · `}
              <span className="tabular-nums">
                {chance.toFixed(chance < 10 ? 1 : 0)}%
              </span>{' '}
              de chance
            </p>

            {movie && (
              <div className="mt-2">
                <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                  Onde assistir
                </p>
                {providers.length > 0 ? (
                  <ul className="space-y-1">
                    {providers.slice(0, MAX_PROVIDERS).map((p) => (
                      <li
                        key={p.provider_id}
                        className="flex items-center gap-1.5 text-xs text-slate-200"
                      >
                        <TmdbImage
                          path={p.logo_path}
                          kind="logo"
                          alt=""
                          width={16}
                          height={16}
                          className="rounded-sm"
                        />
                        <span className="truncate">{p.provider_name}</span>
                      </li>
                    ))}
                    {providers.length > MAX_PROVIDERS && (
                      <li className="text-xs text-slate-500">
                        +{providers.length - MAX_PROVIDERS} outros
                      </li>
                    )}
                  </ul>
                ) : (
                  <p className="text-xs text-slate-400">
                    Não está em streaming no Brasil
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default SliceTooltip
