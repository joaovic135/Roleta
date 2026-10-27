import { WatchProvider, WatchProvidersResponse } from '../types'

const API_KEY = '3dbafbbafa6d857123c4fe7862fc09fe'
const BASE_URL = 'https://api.themoviedb.org/3'

export interface Movie {
  id: number
  title: string
  overview: string
  poster_path: string | null
  release_date: string
  vote_average: number
  vote_count: number
  popularity: number
  original_title: string
  original_language: string
  genre_ids: number[]
  backdrop_path: string | null
  adult: boolean
  watchProviders?: WatchProvider[] // Optional array of watch providers
}

export async function tmdb<T>(
  path: string,
  params: Record<string, string>,
  signal?: AbortSignal,
  init?: RequestInit,
): Promise<T> {
  const query = new URLSearchParams({ api_key: API_KEY, ...params })
  const response = await fetch(`${BASE_URL}${path}?${query}`, {
    ...init,
    signal,
  })
  if (!response.ok) throw new Error(`TMDB respondeu ${response.status}`)
  return response.json()
}

// Função para buscar filmes
export async function searchMovies(
  query: string,
  signal?: AbortSignal,
): Promise<Movie[]> {
  const data = await tmdb<{ results: Movie[] }>(
    '/search/movie',
    { query, language: 'pt-BR', include_adult: 'false' },
    signal,
  )
  return data.results
}

// Streamings (assinatura) onde o filme está disponível no Brasil
export async function getMovieWatchProviders(
  movieId: number,
  signal?: AbortSignal,
): Promise<WatchProvider[]> {
  const data = await tmdb<WatchProvidersResponse>(
    `/movie/${movieId}/watch/providers`,
    {},
    signal,
  )
  return data.results.BR?.flatrate ?? []
}

// Tamanhos que o CDN do TMDB serve prontos
const POSTER_WIDTHS = [92, 154, 185, 342, 500, 780]
const LOGO_WIDTHS = [45, 92, 154, 185, 300, 500]

// Loader do next/image: entrega direto do CDN do TMDB no tamanho mais
// próximo, sem passar pelo otimizador de imagens do Next
export const tmdbLoader = ({ src, width }: { src: string; width: number }) => {
  const sizes = src.startsWith('logo:') ? LOGO_WIDTHS : POSTER_WIDTHS
  const path = src.replace(/^(logo|poster):/, '')
  const size = sizes.find((w) => w >= width)
  return `https://image.tmdb.org/t/p/${size ? `w${size}` : 'original'}${path}`
}
