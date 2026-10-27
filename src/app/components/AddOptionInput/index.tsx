import { useMovieSearch, watchProvidersQuery } from '@/app/hooks/useMovies'
import { Movie } from '@/app/utils/tmdbApi'
import { useQueryClient } from '@tanstack/react-query'
import React, { useEffect, useId, useRef, useState } from 'react'
import TmdbImage from '../TmdbImage'

interface AddOptionInputProps {
  onAdd: (text: string) => void
  onAddMovie: (movie: Movie) => void
  addedMovieIds: Set<number>
  disabled?: boolean
}

// Só busca filmes a partir de 2 letras
const MIN_MOVIE_QUERY = 2

type Suggestion =
  | { type: 'text'; text: string }
  | { type: 'movie'; movie: Movie; added: boolean }

// Campo único para adicionar à roleta: o texto digitado vira uma opção, e os
// filmes do TMDB que combinam aparecem logo abaixo como sugestões.
export default function AddOptionInput({
  onAdd,
  onAddMovie,
  addedMovieIds,
  disabled,
}: AddOptionInputProps) {
  const queryClient = useQueryClient()
  const listId = useId()
  const containerRef = useRef<HTMLDivElement>(null)
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const [addingId, setAddingId] = useState<number | null>(null)

  const text = query.trim()
  const movieQuery = text.length >= MIN_MOVIE_QUERY ? text : ''
  const {
    data: movies = [],
    isFetching,
    isDebouncing,
    isError,
  } = useMovieSearch(movieQuery)
  const searching = movieQuery.length > 0 && (isFetching || isDebouncing)

  const suggestions: Suggestion[] = text
    ? [
        { type: 'text', text },
        ...(movieQuery
          ? movies.map((movie) => ({
              type: 'movie' as const,
              movie,
              added: addedMovieIds.has(movie.id),
            }))
          : []),
      ]
    : []
  const showList = isOpen && suggestions.length > 0
  const active = suggestions[Math.min(activeIndex, suggestions.length - 1)]

  // Busca os streamings antes do clique, para adicionar na hora
  const prefetchProviders = (s?: Suggestion) => {
    if (s?.type === 'movie' && !s.added)
      queryClient.prefetchQuery(watchProvidersQuery(s.movie.id))
  }

  const reset = () => {
    setQuery('')
    setActiveIndex(0)
    setIsOpen(false)
  }

  const select = async (s: Suggestion | undefined) => {
    if (!s || disabled) return
    if (s.type === 'text') {
      onAdd(s.text)
      reset()
      return
    }
    if (s.added) return
    setAddingId(s.movie.id)
    const watchProviders = await queryClient
      .fetchQuery(watchProvidersQuery(s.movie.id))
      .catch(() => []) // Sem provedores — adiciona mesmo assim
    onAddMovie({ ...s.movie, watchProviders })
    setAddingId(null)
    reset()
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setIsOpen(false)
      return
    }
    if (!suggestions.length) return
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault()
      setIsOpen(true)
      const step = e.key === 'ArrowDown' ? 1 : -1
      const next =
        (activeIndex + step + suggestions.length) % suggestions.length
      setActiveIndex(next)
      prefetchProviders(suggestions[next])
    } else if (e.key === 'Enter') {
      e.preventDefault()
      select(active)
    }
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const optionId = (i: number) => `${listId}-${i}`

  return (
    <div ref={containerRef} className="relative z-30 mb-3">
      <div className="flex gap-2">
        <div className="relative min-w-0 flex-1">
          <input
            type="text"
            role="combobox"
            aria-expanded={showList}
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={
              showList ? optionId(suggestions.indexOf(active)) : undefined
            }
            aria-label="Nova opção ou nome de um filme"
            value={query}
            disabled={disabled}
            onChange={(e) => {
              setQuery(e.target.value)
              setActiveIndex(0)
              setIsOpen(true)
            }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder="Nova opção ou nome de um filme…"
            className="ui-input w-full rounded-lg border border-white/10 bg-white/5 py-2 pl-3 pr-9 text-sm placeholder:text-slate-500 focus:border-amber-400/60 focus:outline-none focus:ring-2 focus:ring-amber-400/30 disabled:opacity-50"
          />
          {searching && (
            <span className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin rounded-full border-2 border-amber-300/30 border-t-amber-300" />
          )}
        </div>
        <button
          type="button"
          onClick={() => select({ type: 'text', text })}
          disabled={disabled || !text}
          className="ui-btn rounded-lg bg-amber-400 px-4 text-sm font-semibold text-slate-950 transition hover:bg-amber-300 disabled:opacity-40"
        >
          Adicionar
        </button>
      </div>

      {showList && (
        <ul
          id={listId}
          role="listbox"
          aria-label="Sugestões"
          className="ui-card absolute left-0 right-0 top-full mt-2 max-h-96 overflow-y-auto rounded-xl border border-white/10 bg-slate-900 p-2 shadow-2xl"
        >
          {suggestions.map((s, i) => {
            const isActive = s === active
            const base = `flex w-full cursor-pointer items-center gap-3 rounded-lg p-2 text-left transition ${
              isActive ? 'bg-white/10' : ''
            }`

            if (s.type === 'text') {
              return (
                <li
                  key="text"
                  id={optionId(i)}
                  role="option"
                  aria-selected={isActive}
                  onMouseDown={(e) => {
                    e.preventDefault()
                    select(s)
                  }}
                  onMouseEnter={() => setActiveIndex(i)}
                  className={base}
                >
                  <span className="flex h-11 w-8 shrink-0 items-center justify-center rounded bg-amber-400/15 text-lg font-bold text-amber-300">
                    +
                  </span>
                  <span className="min-w-0 flex-1 text-sm">
                    Adicionar{' '}
                    <span className="font-semibold text-white">
                      &ldquo;{s.text}&rdquo;
                    </span>{' '}
                    como opção
                  </span>
                  {isActive && (
                    <kbd className="shrink-0 rounded bg-white/10 px-1.5 py-0.5 text-[10px] text-slate-400">
                      Enter
                    </kbd>
                  )}
                </li>
              )
            }

            const { movie, added } = s
            const adding = addingId === movie.id
            return (
              <React.Fragment key={movie.id}>
                {i === 1 && (
                  <li
                    role="presentation"
                    className="px-2 pb-1 pt-3 text-[10px] font-semibold uppercase tracking-wider text-slate-500"
                  >
                    Filmes
                  </li>
                )}
                <li
                  id={optionId(i)}
                  role="option"
                  aria-selected={isActive}
                  aria-disabled={added}
                  onMouseDown={(e) => {
                    e.preventDefault()
                    select(s)
                  }}
                  onMouseEnter={() => {
                    setActiveIndex(i)
                    prefetchProviders(s)
                  }}
                  className={`${base} ${added ? 'cursor-default opacity-60' : ''}`}
                >
                  <div className="relative h-11 w-8 shrink-0 overflow-hidden rounded bg-slate-800">
                    {movie.poster_path ? (
                      <TmdbImage
                        path={movie.poster_path}
                        alt=""
                        fill
                        sizes="32px"
                        className="object-cover"
                      />
                    ) : (
                      <span className="flex h-full items-center justify-center text-sm">
                        🎬
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">
                      {movie.title}
                    </p>
                    <p className="text-xs text-slate-400">
                      {movie.release_date?.slice(0, 4) || '—'}
                      {movie.vote_average > 0 &&
                        ` · ★ ${movie.vote_average.toFixed(1)}`}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
                      added
                        ? 'bg-emerald-500/15 text-emerald-300'
                        : 'bg-amber-400/15 text-amber-300'
                    }`}
                  >
                    {added ? '✓ Na roleta' : adding ? '…' : '+ Filme'}
                  </span>
                </li>
              </React.Fragment>
            )
          })}

          {movieQuery && !searching && movies.length === 0 && (
            <li
              role="presentation"
              className="px-2 pb-1 pt-3 text-xs text-slate-500"
            >
              {isError
                ? 'Não foi possível buscar filmes agora.'
                : 'Nenhum filme encontrado.'}
            </li>
          )}
        </ul>
      )}
    </div>
  )
}
