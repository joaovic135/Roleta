import { cache } from 'react'
import {
  getLetterboxdFeed,
  LETTERBOXD_USER,
  LetterboxdFilm,
} from '@/app/utils/letterboxd'
import { getWatchlistMovies } from '@/app/utils/letterboxdScrape'
import type { ImportMovie, ImportProvider } from '@/app/utils/rouletteImport'
import type { Movie } from '@/app/utils/tmdbApi'
import { FilmDetails, getFilmDetails } from '@/app/utils/tmdbServer'

// cache() faz as seções da página dividirem a mesma busca em vez de repetir

export const loadFeed = cache(() => getLetterboxdFeed().catch(() => null))

export interface DiaryFilm {
  film: LetterboxdFilm
  details: FilmDetails
}

export interface Diary {
  // Todas as entradas com detalhes (revistos contam de novo)
  entries: DiaryFilm[]
  // Um por filme, a entrada mais recente
  unique: DiaryFilm[]
  watchedIds: number[]
}

export const loadDiary = cache(async (): Promise<Diary | null> => {
  const feed = await loadFeed()
  if (!feed) return null
  const ids = feed.films.flatMap((f) => (f.tmdbId ? [f.tmdbId] : []))
  const details = await getFilmDetails(ids).catch(() => null)
  if (!details?.size) return null

  const entries = feed.films.flatMap((film) => {
    const found = film.tmdbId ? details.get(film.tmdbId) : undefined
    return found ? [{ film, details: found }] : []
  })
  const seen = new Set<number>()
  const unique = entries.filter(({ details }) => {
    if (seen.has(details.id)) return false
    seen.add(details.id)
    return true
  })
  return { entries, unique, watchedIds: [...new Set(ids)] }
})

// Título, pôster e sinopse em pt-BR e os streamings, que a roleta mostra
export function withDetails(movie: Movie, found?: FilmDetails): Movie {
  if (!found) return movie
  return {
    ...movie,
    title: found.title || movie.title,
    overview: found.overview || movie.overview,
    poster_path: found.posterPath ?? movie.poster_path,
    watchProviders: found.providers,
  }
}

// Um objeto por streaming na requisição inteira: o RSC serializa objetos
// repetidos como referência, em vez de repetir logo e nome em cada filme
const sharedProviders = cache(() => new Map<number, ImportProvider>())

// Só o que a roleta usa depois; o Movie inteiro iria parar no HTML como
// props do SendToRoulette, multiplicado por centenas de filmes
export function toImportMovie(movie: Movie): ImportMovie {
  const providers = sharedProviders()
  const watchProviders = movie.watchProviders?.map((p) => {
    const shared = providers.get(p.provider_id) ?? {
      provider_id: p.provider_id,
      provider_name: p.provider_name,
      logo_path: p.logo_path,
    }
    providers.set(p.provider_id, shared)
    return shared
  })
  return {
    id: movie.id,
    overview: movie.overview,
    poster_path: movie.poster_path,
    release_date: movie.release_date,
    // A roleta mostra uma casa decimal
    vote_average: Math.round((movie.vote_average ?? 0) * 10) / 10,
    ...(watchProviders?.length ? { watchProviders } : {}),
  }
}

export const loadWatchlist = cache(async () => {
  const watchlist = await getWatchlistMovies(LETTERBOXD_USER).catch(() => null)
  if (!watchlist) return null
  const ids = watchlist.items.flatMap((i) => (i.movie ? [i.movie.id] : []))
  const details = await getFilmDetails(ids).catch(
    () => new Map<number, FilmDetails>(),
  )
  const items = watchlist.items.map(({ film, movie }) => ({
    film,
    movie: movie && withDetails(movie, details.get(movie.id)),
  }))
  const streamingIds = ids.filter((id) => details.get(id)?.providers.length)
  return { count: watchlist.count, items, ids, streamingIds }
})
