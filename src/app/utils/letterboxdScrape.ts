import { decode } from './letterboxd'
import type { Movie } from './tmdbApi'
import { createLimiter, findMovie } from './tmdbServer'

// Só para o servidor. Letterboxd não tem API pública: lê o HTML das páginas
// de watchlist e de listas. O Cloudflare pode bloquear (principalmente em
// produção), então toda falha vira null e a página decide o que mostrar.

const BASE_URL = 'https://letterboxd.com'
const MAX_PAGES = 20
const HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36',
  Accept: 'text/html,application/xhtml+xml',
  'Accept-Language': 'en-US,en;q=0.9',
}

export interface ScrapedFilm {
  title: string
  year: number | null
  slug: string
  link: string
}

export interface WatchlistItem {
  film: ScrapedFilm
  movie: Movie | null
}

// Poucas páginas por vez para não chamar a atenção do Cloudflare
const limit = createLimiter(4)

async function fetchPage(url: string): Promise<string | null> {
  try {
    const response = await limit(() =>
      fetch(url, {
        headers: HEADERS,
        next: { revalidate: 3600 },
        signal: AbortSignal.timeout(15_000),
      }),
    )
    if (!response.ok) {
      console.warn(`[letterboxd] ${url} respondeu ${response.status}`)
      return null
    }
    const html = await response.text()
    // Desafio do Cloudflare às vezes vem com status 200
    if (/<title>\s*Just a moment/i.test(html)) {
      console.warn(`[letterboxd] ${url} caiu no desafio do Cloudflare`)
      return null
    }
    return html
  } catch (error) {
    console.warn(
      `[letterboxd] ${url}:`,
      error instanceof Error ? error.message : error,
    )
    return null
  }
}

function attr(tag: string, name: string) {
  const value = tag.match(new RegExp(`\\b${name}="([^"]*)"`))?.[1]
  return value === undefined ? null : decode(value)
}

// Cada pôster é um elemento com data-item-name="Título (ano)" e o slug
function parseFilms(html: string): ScrapedFilm[] {
  const films: ScrapedFilm[] = []
  for (const [tag] of html.matchAll(
    /<[a-z]+\b[^>]*\bdata-item-slug="[^>]*>/g,
  )) {
    const slug = attr(tag, 'data-item-slug')
    const name = attr(tag, 'data-item-name')
    if (!slug || !name) continue
    const match = name.match(/^(.*\S)\s+\((\d{4})\)$/)
    films.push({
      title: match ? match[1] : name,
      year: match ? Number(match[2]) : null,
      slug,
      link: `${BASE_URL}/film/${slug}/`,
    })
  }
  return films
}

// Maior número entre os links de paginação desta mesma página
function lastPage(html: string, path: string) {
  let last = 1
  for (const [, href, page] of html.matchAll(/href="([^"]*?)page\/(\d+)\/"/g)) {
    if (href.toLowerCase() === path) last = Math.max(last, Number(page))
  }
  return last
}

async function getPaged(url: string): Promise<{
  first: string
  films: ScrapedFilm[]
  partial: boolean // alguma página falhou ou passou do limite
} | null> {
  const base = url.endsWith('/') ? url : `${url}/`
  const first = await fetchPage(base)
  if (!first) return null

  const total = lastPage(first, new URL(base).pathname.toLowerCase())
  const pages = Math.min(total, MAX_PAGES)
  if (total > MAX_PAGES) {
    console.warn(
      `[letterboxd] ${base} tem ${total} páginas; lendo só ${MAX_PAGES}`,
    )
  }

  const rest = await Promise.all(
    Array.from({ length: pages - 1 }, (_, i) =>
      fetchPage(`${base}page/${i + 2}/`),
    ),
  )
  // Página extra que falhou fica de fora; o resto ainda serve
  const films = [first, ...rest].flatMap((html) =>
    html ? parseFilms(html) : [],
  )
  // A ordem pode mudar entre uma página e outra: tira repetidos pelo slug
  const seen = new Set<string>()
  return {
    first,
    films: films.filter((film) => !seen.has(film.slug) && seen.add(film.slug)),
    partial: total > pages || rest.some((html) => !html),
  }
}

export async function getWatchlist(
  username: string,
): Promise<{ count: number; films: ScrapedFilm[] } | null> {
  const result = await getPaged(
    `${BASE_URL}/${encodeURIComponent(username.toLowerCase())}/watchlist/`,
  )
  if (!result) return null
  const count = result.first
    .match(/watchlist-count">([\d,.]+)/)?.[1]
    ?.replace(/\D/g, '')
  return {
    count: count ? Number(count) : result.films.length,
    films: result.films,
  }
}

export async function getFullList(
  listUrl: string,
): Promise<{ films: ScrapedFilm[] } | null> {
  try {
    const url = new URL(listUrl)
    if (url.hostname !== 'letterboxd.com') return null
    // Aceita também o link de uma página específica da lista
    const path = url.pathname.replace(/\/page\/\d+\/?$/, '/')
    const result = await getPaged(`${BASE_URL}${path}`)
    // Lista pela metade pareceria completa (contagem e ranking errados);
    // melhor ficar com o trecho do RSS, que avisa quantos faltam
    return result && !result.partial ? { films: result.films } : null
  } catch {
    return null
  }
}

export async function getWatchlistMovies(
  username: string,
): Promise<{ count: number; items: WatchlistItem[] } | null> {
  const watchlist = await getWatchlist(username)
  if (!watchlist) return null
  // findMovie já passa pela fila de requisições do TMDB
  const items = await Promise.all(
    watchlist.films.map(async (film) => ({
      film,
      movie: await findMovie(film.title, film.year).catch(() => null),
    })),
  )
  return { count: watchlist.count, items }
}
