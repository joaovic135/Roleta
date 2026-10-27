import type { WatchProvider, WatchProvidersResponse } from '../types'
import { tmdb, type Movie } from './tmdbApi'

// Só para o servidor: as respostas do TMDB ficam no cache do Next por um dia
const CACHE: RequestInit = { next: { revalidate: 86400 } }
const TIMEOUT = 10_000

export interface Genre {
  id: number
  name: string
}

export interface FilmDetails {
  id: number
  title: string
  originalTitle: string
  releaseYear: number | null
  overview: string
  runtime: number | null // minutos
  genres: Genre[]
  directors: string[]
  composers: string[] // trilha sonora original
  cast: string[] // 5 primeiros do elenco
  voteAverage: number | null // 0–10
  voteCount: number
  posterPath: string | null
  backdropPath: string | null
  providers: WatchProvider[] // streamings por assinatura no Brasil
}

export interface GenreScore {
  genre: Genre
  score: number
  count: number
}

export interface GenreRecommendation {
  genre: Genre
  movies: Movie[]
}

export interface SeedRecommendation {
  seed: { id: number; title: string }
  movies: Movie[]
}

// Fila com no máximo `max` tarefas rodando ao mesmo tempo
export function createLimiter(max: number) {
  let active = 0
  const waiting: (() => void)[] = []
  return async <T>(task: () => Promise<T>): Promise<T> => {
    if (active < max) active++
    else await new Promise<void>((resolve) => waiting.push(resolve))
    try {
      return await task()
    } finally {
      // A vaga passa direto para o próximo da fila
      const wake = waiting.shift()
      if (wake) wake()
      else active--
    }
  }
}

// Compartilhada por todas as chamadas do módulo, para uma página com
// centenas de filmes não disparar centenas de requisições de uma vez
const limit = createLimiter(8)

function get<T>(path: string, params: Record<string, string> = {}) {
  return limit(() => tmdb<T>(path, params, AbortSignal.timeout(TIMEOUT), CACHE))
}

// Falhas individuais viram null em vez de derrubar a página inteira
async function safe<T>(promise: Promise<T>): Promise<T | null> {
  try {
    return await promise
  } catch (error) {
    console.warn('[tmdb]', error instanceof Error ? error.message : error)
    return null
  }
}

interface MovieDetailsResponse {
  id: number
  title: string
  original_title?: string
  release_date?: string
  overview: string
  runtime: number | null
  genres: Genre[]
  vote_average: number
  vote_count: number
  poster_path: string | null
  backdrop_path: string | null
  credits?: {
    cast: { name: string; order: number }[]
    crew: { name: string; original_name?: string; job: string }[]
  }
  'watch/providers'?: WatchProvidersResponse
}

// "Music" cobre filmes antigos sem "Original Music Composer" nos créditos
const composerCrew = (data: MovieDetailsResponse) =>
  (data.credits?.crew ?? []).filter((person) =>
    ['Original Music Composer', 'Music'].includes(person.job),
  )

function toDetails(data: MovieDetailsResponse): FilmDetails {
  const cast = [...(data.credits?.cast ?? [])].sort((a, b) => a.order - b.order)
  const directors = (data.credits?.crew ?? [])
    .filter((person) => person.job === 'Director')
    .map((person) => person.name)
  const composers = composerCrew(data).map((person) => person.name)

  return {
    id: data.id,
    title: data.title,
    originalTitle: data.original_title || data.title,
    releaseYear: Number(data.release_date?.slice(0, 4)) || null,
    overview: data.overview ?? '',
    runtime: data.runtime || null,
    genres: data.genres ?? [],
    directors: [...new Set(directors)],
    composers: [...new Set(composers)],
    cast: cast.slice(0, 5).map((person) => person.name),
    voteAverage: data.vote_count ? data.vote_average : null,
    voteCount: data.vote_count ?? 0,
    posterPath: data.poster_path,
    backdropPath: data.backdrop_path,
    providers: data['watch/providers']?.results.BR?.flatrate ?? [],
  }
}

export async function getFilmDetails(
  ids: number[],
): Promise<Map<number, FilmDetails>> {
  const unique = [...new Set(ids)]
  const results = await Promise.all(
    unique.map((id) =>
      safe(
        get<MovieDetailsResponse>(`/movie/${id}`, {
          append_to_response: 'credits,watch/providers',
          language: 'pt-BR',
        }),
      ),
    ),
  )

  const details = new Map<number, FilmDetails>()
  for (const [index, data] of results.entries()) {
    if (data) details.set(unique[index], toDetails(data))
  }
  return details
}

export interface MusicCredits {
  title: string // em inglês
  originalTitle: string
  releaseYear: number | null
  composers: string[]
}

// Para a trilha no Spotify: em pt-BR o TMDB dá os nomes na escrita original
// (久石譲) e o título traduzido, e o Spotify usa "Joe Hisaishi" e
// "Spirited Away". O getFilmDetails fica em pt-BR, que é o que a página mostra
export async function getMusicCredits(
  id: number,
): Promise<MusicCredits | null> {
  const data = await safe(
    get<MovieDetailsResponse>(`/movie/${id}`, {
      append_to_response: 'credits',
      language: 'en-US',
    }),
  )
  if (!data) return null
  const crew = composerCrew(data)
  return {
    title: data.title,
    originalTitle: data.original_title || data.title,
    releaseYear: Number(data.release_date?.slice(0, 4)) || null,
    // Nome romanizado primeiro (vai no artist: da busca); o original fica de
    // reserva para artista cadastrado no Spotify como 坂本龍一
    composers: [
      ...new Set([
        ...crew.map((person) => person.name),
        ...crew.flatMap((person) => person.original_name || []),
      ]),
    ],
  }
}

// Compara títulos ignorando acentos, caixa e pontuação
function normalize(title: string) {
  return title
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '')
}

function bestMatch(results: Movie[], title: string, year: number | null) {
  const wanted = normalize(title)
  // Título igual vale mais que ano igual; a popularidade desempata
  const rank = (movie: Movie) =>
    (normalize(movie.title) === wanted ||
    normalize(movie.original_title) === wanted
      ? 2
      : 0) +
    (year !== null && movie.release_date?.slice(0, 4) === String(year) ? 1 : 0)

  return (
    [...results].sort(
      (a, b) => rank(b) - rank(a) || (b.popularity ?? 0) - (a.popularity ?? 0),
    )[0] ?? null
  )
}

export async function findMovie(
  title: string,
  year: number | null,
): Promise<Movie | null> {
  // Em inglês, como no Letterboxd: em pt-BR o título traduzido não bate e a
  // popularidade pode desempatar a favor de outro filme do mesmo ano
  const search = (withYear: boolean) =>
    safe(
      get<{ results: Movie[] }>('/search/movie', {
        query: title,
        language: 'en-US',
        include_adult: 'false',
        ...(withYear && year ? { primary_release_year: String(year) } : {}),
      }),
    )

  let data = year ? await search(true) : null
  if (!data?.results.length) data = await search(false)
  return bestMatch(data?.results ?? [], title, year)
}

// Cada filme pesa pela nota (3 estrelas quando não avaliado) e pelo like
export function scoreGenres(
  films: { rating: number | null; liked: boolean; genres: Genre[] }[],
): GenreScore[] {
  const scores = new Map<number, GenreScore>()
  for (const film of films) {
    const weight = Math.max(0, (film.rating ?? 3) - 2.5) + (film.liked ? 1 : 0)
    for (const genre of film.genres) {
      const entry = scores.get(genre.id) ?? { genre, score: 0, count: 0 }
      entry.score += weight
      entry.count++
      scores.set(genre.id, entry)
    }
  }
  return [...scores.values()].sort(
    (a, b) => b.score - a.score || b.count - a.count,
  )
}

// Tira os já vistos e os repetidos entre grupos, mantendo a ordem
function pick(movies: Movie[], seen: Set<number>, amount: number) {
  const picked: Movie[] = []
  for (const movie of movies) {
    if (picked.length >= amount) break
    if (seen.has(movie.id)) continue
    seen.add(movie.id)
    picked.push(movie)
  }
  return picked
}

export async function getGenreRecommendations(
  genres: Genre[],
  excludeIds: number[],
  perGenre = 8,
): Promise<GenreRecommendation[]> {
  // Duas páginas por gênero: quem já viu muitos clássicos esgota a primeira
  const pages = await Promise.all(
    genres.map(async (genre) => {
      const results = await Promise.all(
        ['1', '2'].map((page) =>
          safe(
            get<{ results: Movie[] }>('/discover/movie', {
              with_genres: String(genre.id),
              sort_by: 'vote_average.desc',
              'vote_count.gte': '1000',
              include_adult: 'false',
              language: 'pt-BR',
              region: 'BR',
              page,
            }),
          ),
        ),
      )
      return results.flatMap((data) => data?.results ?? [])
    }),
  )

  const seen = new Set(excludeIds)
  return genres
    .map((genre, i) => ({ genre, movies: pick(pages[i], seen, perGenre) }))
    .filter((group) => group.movies.length > 0)
}

export async function getSimilarRecommendations(
  seeds: { id: number; title: string }[],
  excludeIds: number[],
  perSeed = 8,
): Promise<SeedRecommendation[]> {
  const results = await Promise.all(
    seeds.map((seed) =>
      safe(
        get<{ results: Movie[] }>(`/movie/${seed.id}/recommendations`, {
          language: 'pt-BR',
        }),
      ),
    ),
  )

  const seen = new Set([...excludeIds, ...seeds.map((seed) => seed.id)])
  return seeds
    .map((seed, i) => ({
      seed,
      movies: pick(results[i]?.results ?? [], seen, perSeed),
    }))
    .filter((group) => group.movies.length > 0)
}
