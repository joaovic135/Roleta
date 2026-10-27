'use client'

import { useMemo } from 'react'
import SendToRoulette from '@/app/components/SendToRoulette'
import { external, plural, Skeleton } from './ui'

export interface ListCardFilm {
  title: string
  link: string
  year?: number | null
}

export interface ListCardInfo {
  title: string
  link: string
  description: string | null
  ranked: boolean
}

// Renderizada no cliente: listas têm centenas de filmes e cada <li> vindo do
// servidor pesava mais que os próprios dados no payload RSC
export function ListCardView({
  list,
  films,
  total,
  more,
  loading,
}: {
  list: ListCardInfo
  films: ListCardFilm[]
  total: number
  more: number
  loading: boolean
}) {
  const Tag = list.ranked ? 'ol' : 'ul'
  const importItems = useMemo(() => {
    // Títulos repetidos (ex.: dois Dunkirk) levam o ano, senão a roleta
    // descarta um deles como duplicata
    const counts = new Map<string, number>()
    for (const film of films) {
      const key = film.title.toLowerCase()
      counts.set(key, (counts.get(key) ?? 0) + 1)
    }
    return films.map((film) => ({
      title:
        film.year && (counts.get(film.title.toLowerCase()) ?? 0) > 1
          ? `${film.title} (${film.year})`
          : film.title,
    }))
  }, [films])

  return (
    <article className="flex min-w-0 flex-col rounded-xl bg-slate-950/40 p-4 ring-1 ring-white/5">
      <h3 className="font-semibold text-slate-100">
        <a href={list.link} {...external} className="hover:text-amber-300">
          {list.title}
        </a>
      </h3>
      <p className="mb-3 text-xs text-slate-500">
        {plural(total, 'filme', 'filmes')}
        {list.ranked && ' · ranking'}
        {loading && ' · carregando a lista completa…'}
      </p>
      {list.description && (
        <p className="mb-3 text-sm text-slate-400">{list.description}</p>
      )}
      {loading ? (
        <div className="space-y-2" aria-busy="true">
          {Array.from({ length: Math.min(total, 6) }, (_, i) => (
            <Skeleton key={i} className="h-4" />
          ))}
        </div>
      ) : (
        <Tag className="max-h-72 space-y-1 overflow-y-auto overscroll-contain pr-1 text-sm">
          {films.map((film, i) => (
            <li key={`${film.link}-${i}`} className="flex gap-2">
              <span className="w-7 shrink-0 text-right tabular-nums text-slate-500">
                {list.ranked ? `${i + 1}.` : '•'}
              </span>
              <a
                href={film.link}
                {...external}
                className="min-w-0 truncate text-slate-300 hover:text-amber-300"
              >
                {film.title}
                {film.year && (
                  <span className="ml-1 text-xs text-slate-500">
                    {film.year}
                  </span>
                )}
              </a>
            </li>
          ))}
        </Tag>
      )}
      {more > 0 && (
        <a
          href={list.link}
          {...external}
          className="mt-3 text-xs font-medium text-amber-300 hover:underline"
        >
          + {more} no Letterboxd →
        </a>
      )}
      {!loading && (
        <div className="mt-auto pt-4">
          <SendToRoulette source={list.title} items={importItems} />
        </div>
      )}
    </article>
  )
}
