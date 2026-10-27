import type { WatchProvider } from '../types'
import type { Movie } from './tmdbApi'

// Ponte entre outras páginas (ex.: /letterboxd) e a roleta: a página grava a
// lista aqui e a roleta lê ao abrir
const STORAGE_KEY = 'roleta.import'

export type ImportProvider = Pick<
  WatchProvider,
  'provider_id' | 'provider_name' | 'logo_path'
>

// Só o que a roleta mostra depois (pôster, sinopse, ano, nota e streamings).
// A página manda centenas de filmes como props, então o resto do Movie, e o
// título, que já vai no item, ficariam pesando no HTML à toa
export type ImportMovie = Pick<
  Movie,
  'id' | 'overview' | 'poster_path' | 'release_date' | 'vote_average'
> & { watchProviders?: ImportProvider[] }

export interface ImportItem {
  title: string
  movie?: ImportMovie
}

// O que a roleta recebe: o filme volta a ser um Movie completo
export interface RouletteImport {
  source: string
  items: { title: string; movie?: Movie }[]
}

export function queueRouletteImport(data: {
  source: string
  items: ImportItem[]
}): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (e) {
    console.error('Erro ao preparar a importação para a roleta:', e)
  }
}

// Campos que a importação não traz ganham valores neutros
const toMovie = (value: unknown, title: string): Movie | undefined => {
  if (typeof value !== 'object' || value === null) return undefined
  const movie = value as Partial<Movie>
  if (typeof movie.id !== 'number') return undefined
  return {
    overview: '',
    poster_path: null,
    release_date: '',
    vote_average: 0,
    vote_count: 0,
    popularity: 0,
    original_title: title,
    original_language: '',
    genre_ids: [],
    backdrop_path: null,
    adult: false,
    ...movie,
    id: movie.id,
    // Importações antigas traziam o título dentro do filme
    title: typeof movie.title === 'string' ? movie.title : title,
    watchProviders: Array.isArray(movie.watchProviders)
      ? movie.watchProviders.map((p) => ({
          ...p,
          display_priority: p.display_priority ?? 0,
        }))
      : undefined,
  }
}

const toItem = (value: unknown): RouletteImport['items'][number] | null => {
  if (typeof value !== 'object' || value === null) return null
  const { title, movie } = value as { title?: unknown; movie?: unknown }
  if (typeof title !== 'string' || !title.trim()) return null
  const full = toMovie(movie, title)
  return full ? { title, movie: full } : { title }
}

export function takeRouletteImport(): RouletteImport | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw === null) return null
    localStorage.removeItem(STORAGE_KEY)
    const parsed: unknown = JSON.parse(raw)
    if (typeof parsed !== 'object' || parsed === null) return null
    const { source, items } = parsed as { source?: unknown; items?: unknown }
    if (typeof source !== 'string' || !Array.isArray(items)) return null
    const valid = items.flatMap((item) => toItem(item) ?? [])
    return valid.length > 0 ? { source, items: valid } : null
  } catch (e) {
    console.error('Erro ao ler a importação para a roleta:', e)
    return null
  }
}
