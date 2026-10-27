'use client'

import { useMemo } from 'react'
import SendToRoulette from '@/app/components/SendToRoulette'
import TmdbImage from '@/app/components/TmdbImage'
import type { ImportMovie } from '@/app/utils/rouletteImport'
import { external, posterGrid, TmdbPoster } from './ui'

export interface WatchlistFilm {
  link: string
  title: string
  year: number | string | null
  movie?: ImportMovie
}

// Renderizada no cliente: o servidor manda um array enxuto em vez de uma
// árvore RSC por filme, e o mesmo array alimenta o envio para a roleta
export function WatchlistGrid({
  films,
  streamingIds,
  summary,
}: {
  films: WatchlistFilm[]
  streamingIds: number[]
  summary: React.ReactNode
}) {
  const items = useMemo(
    () => films.map(({ title, movie }) => ({ title, movie })),
    [films],
  )

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        {summary}
        <SendToRoulette
          source="Watchlist"
          items={items}
          streamingIds={streamingIds}
        />
      </div>
      <div className="max-h-[36rem] overflow-y-auto overscroll-contain pr-1">
        <ul className={posterGrid}>
          {films.map(({ link, title, year, movie }) => {
            const provider = movie?.watchProviders?.[0]
            return (
              <li key={link} className="min-w-0">
                <a
                  href={link}
                  {...external}
                  className="group block"
                  title={`${title}${year ? ` (${year})` : ''}`}
                >
                  <TmdbPoster
                    path={movie?.poster_path}
                    title={title}
                    badge={
                      provider && (
                        <TmdbImage
                          kind="logo"
                          path={provider.logo_path}
                          alt={`Em ${provider.provider_name}`}
                          title={`Em ${provider.provider_name}`}
                          width={22}
                          height={22}
                          loading="lazy"
                          className="absolute bottom-1.5 right-1.5 h-[22px] w-[22px] rounded-md ring-1 ring-black/40"
                        />
                      )
                    }
                  />
                  <p className="mt-1.5 truncate text-sm font-medium text-slate-200">
                    {title}
                  </p>
                  <p className="text-xs tabular-nums text-slate-500">{year}</p>
                </a>
              </li>
            )
          })}
        </ul>
      </div>
    </>
  )
}
