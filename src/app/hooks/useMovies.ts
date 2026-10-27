import { keepPreviousData, queryOptions, useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { getMovieWatchProviders, searchMovies } from '../utils/tmdbApi'

const MINUTE = 60 * 1000

export const movieKeys = {
  search: (query: string) => ['movies', 'search', query] as const,
  providers: (movieId: number) => ['movies', 'providers', movieId] as const,
}

export const watchProvidersQuery = (movieId: number) =>
  queryOptions({
    queryKey: movieKeys.providers(movieId),
    queryFn: ({ signal }) => getMovieWatchProviders(movieId, signal),
    staleTime: 24 * 60 * MINUTE,
  })

function useDebouncedValue<T>(value: T, delay: number) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debounced
}

// Busca com debounce. Buscas repetidas vêm do cache, e as que ficaram
// obsoletas no meio do caminho são canceladas.
export function useMovieSearch(query: string) {
  const term = useDebouncedValue(query.trim(), 300)
  const result = useQuery({
    queryKey: movieKeys.search(term),
    queryFn: ({ signal }) => searchMovies(term, signal),
    enabled: term.length > 0,
    staleTime: 10 * MINUTE,
    placeholderData: keepPreviousData,
  })
  return { ...result, term, isDebouncing: term !== query.trim() }
}
