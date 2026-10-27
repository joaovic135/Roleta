export const LETTERBOXD_USER = 'QuaseNada'
const FEED_URL = `https://letterboxd.com/${LETTERBOXD_USER}/rss/`

export interface LetterboxdFilm {
  kind: 'watch' | 'review'
  id: string
  title: string
  year: number | null
  link: string
  poster: string | null
  watchedDate: string | null
  rating: number | null
  liked: boolean
  rewatch: boolean
  tmdbId: number | null
  review: string | null
}

export interface LetterboxdList {
  id: string
  title: string
  link: string
  description: string | null
  ranked: boolean
  films: { title: string; link: string }[]
  more: number
}

export interface LetterboxdFeed {
  profileName: string
  profileLink: string
  films: LetterboxdFilm[]
  lists: LetterboxdList[]
}

const ENTITIES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
}

export function decode(text: string) {
  return text.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (match, code: string) => {
    if (code[0] !== '#') return ENTITIES[code.toLowerCase()] ?? match
    const hex = code[1] === 'x' || code[1] === 'X'
    return String.fromCodePoint(
      parseInt(code.slice(hex ? 2 : 1), hex ? 16 : 10),
    )
  })
}

function stripTags(html: string) {
  return decode(
    html
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<[^>]+>/g, '')
      .trim(),
  )
}

// Conteúdo de uma tag do item, sem o invólucro CDATA
function tag(xml: string, name: string) {
  const match = xml.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`))
  if (!match) return null
  const cdata = match[1].match(/<!\[CDATA\[([\s\S]*?)\]\]>/)
  return (cdata ? cdata[1] : decode(match[1])).trim()
}

// Parágrafos de texto da descrição (sem o pôster e sem o "Watched on ...")
function paragraphs(html: string) {
  return [...html.matchAll(/<p>([\s\S]*?)<\/p>/g)]
    .map((m) => m[1])
    .filter((p) => !/<img\b/.test(p) && !/^\s*Watched on\b/.test(p))
}

// O feed traz o pôster em 600x900; 460x690 basta para os cards
function posterOf(html: string) {
  const src = html.match(/<img[^>]+src="([^"]+)"/)?.[1]
  return src ? decode(src).replace('-0-600-0-900-', '-0-460-0-690-') : null
}

function parseFilm(item: string, id: string): LetterboxdFilm {
  const description = tag(item, 'description') ?? ''
  const rating = tag(item, 'letterboxd:memberRating')
  const year = tag(item, 'letterboxd:filmYear')
  const tmdbId = tag(item, 'tmdb:movieId')
  const review = paragraphs(description).map(stripTags).join('\n\n')

  return {
    kind: id.startsWith('letterboxd-review') ? 'review' : 'watch',
    id,
    title: tag(item, 'letterboxd:filmTitle') ?? tag(item, 'title') ?? '',
    year: year ? Number(year) : null,
    link: tag(item, 'link') ?? '',
    poster: posterOf(description),
    watchedDate: tag(item, 'letterboxd:watchedDate'),
    rating: rating ? Number(rating) : null,
    liked: tag(item, 'letterboxd:memberLike') === 'Yes',
    rewatch: tag(item, 'letterboxd:rewatch') === 'Yes',
    tmdbId: tmdbId ? Number(tmdbId) : null,
    review: review || null,
  }
}

function parseList(item: string, id: string): LetterboxdList {
  const description = tag(item, 'description') ?? ''
  const films = [
    ...description.matchAll(/<li>\s*<a href="([^"]+)">([\s\S]*?)<\/a>/g),
  ].map((m) => ({ link: decode(m[1]), title: stripTags(m[2]) }))
  const intro = paragraphs(description)
    .filter((p) => !/^\s*\.\.\.plus \d+ more/.test(p))
    .map(stripTags)
    .join('\n\n')

  return {
    id,
    title: tag(item, 'title') ?? '',
    link: tag(item, 'link') ?? '',
    description: intro || null,
    ranked: /<ol>/.test(description),
    films,
    more: Number(description.match(/\.\.\.plus (\d+) more/)?.[1] ?? 0),
  }
}

export function parseLetterboxdFeed(xml: string): LetterboxdFeed {
  const channel = xml.split('<item>')[0]
  const films: LetterboxdFilm[] = []
  const lists: LetterboxdList[] = []

  for (const [, item] of xml.matchAll(/<item>([\s\S]*?)<\/item>/g)) {
    const id = tag(item, 'guid') ?? ''
    if (id.startsWith('letterboxd-list')) lists.push(parseList(item, id))
    else films.push(parseFilm(item, id))
  }

  return {
    profileName: (tag(channel, 'title') ?? '').replace(/^Letterboxd - /, ''),
    profileLink: tag(channel, 'link') ?? FEED_URL,
    films,
    lists,
  }
}

// O feed muda pouco: busca de novo no máximo a cada hora
export async function getLetterboxdFeed(): Promise<LetterboxdFeed> {
  const response = await fetch(FEED_URL, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Roleta)' },
    next: { revalidate: 3600 },
  })
  if (!response.ok) throw new Error(`Letterboxd respondeu ${response.status}`)
  return parseLetterboxdFeed(await response.text())
}
