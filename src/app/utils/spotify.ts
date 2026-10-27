// Só para o servidor: usa SPOTIFY_CLIENT_ID/SECRET (sem NEXT_PUBLIC_), que
// nunca vão para o bundle do cliente
import { unstable_cache } from 'next/cache'

export type Soundtrack =
  | {
      kind: 'album'
      album: {
        id: string
        name: string
        url: string
        image: string | null
        artists: string[]
        year: number | null
      }
      tracks: {
        id: string
        name: string
        url: string
        artists: string[]
        durationMs: number
        number: number
      }[]
    }
  | {
      kind: 'playlist'
      playlist: {
        name: string
        url: string
        image: string | null
        owner: string
      }
    }
  | { kind: 'search'; url: string }

export interface SoundtrackQuery {
  title: string
  originalTitle?: string
  // Outros nomes do filme (ex.: o título em inglês do Letterboxd)
  aliases?: string[]
  year: number | null
  composers: string[]
}

export const spotifySearchUrl = (title: string) =>
  'https://open.spotify.com/search/' + encodeURIComponent(title + ' soundtrack')

const API = 'https://api.spotify.com/v1'
const TIMEOUT = 8_000
const MAX_TRACKS = 150
// Abaixo disso o álbum é provavelmente de outro filme ou um single avulso
const MIN_SCORE = 50

interface SpotifyImage {
  url: string
  width: number | null
}

interface SpotifyAlbum {
  id: string
  name: string
  album_type: string
  total_tracks: number
  release_date: string
  images: SpotifyImage[]
  artists: { name: string }[]
  external_urls: { spotify: string }
}

interface SpotifyTrack {
  id: string
  name: string
  duration_ms: number
  track_number: number
  disc_number: number
  artists: { name: string }[]
  external_urls: { spotify: string }
}

interface SpotifyPlaylist {
  name: string
  images: SpotifyImage[] | null
  owner: { display_name: string | null } | null
  external_urls: { spotify: string }
}

// --- Token (client credentials) ---------------------------------------------

let token: { value: string; expiresAt: number } | null = null
let pendingToken: Promise<string> | null = null

const credentials = () => {
  const id = process.env.SPOTIFY_CLIENT_ID
  const secret = process.env.SPOTIFY_CLIENT_SECRET
  return id && secret ? { id, secret } : null
}

async function requestToken(id: string, secret: string) {
  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      Authorization:
        'Basic ' + Buffer.from(`${id}:${secret}`).toString('base64'),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
    cache: 'no-store',
    signal: AbortSignal.timeout(TIMEOUT),
  })
  if (!response.ok) {
    throw new Error(`token do Spotify: ${response.status}`)
  }
  const data: { access_token: string; expires_in: number } =
    await response.json()
  // Renova um minuto antes de expirar
  token = {
    value: data.access_token,
    expiresAt: Date.now() + (data.expires_in - 60) * 1000,
  }
  return token.value
}

async function getToken(id: string, secret: string) {
  if (token && token.expiresAt > Date.now()) return token.value
  // Requisições simultâneas compartilham o mesmo pedido de token
  pendingToken ??= requestToken(id, secret).finally(() => {
    pendingToken = null
  })
  return pendingToken
}

// Estourada a cota, o Spotify manda esperar horas (Retry-After de ~22 h em
// dev mode); insistir só gasta tempo e pode estender o bloqueio
let blockedUntil = 0

// Teto de chamadas por instância: há milhões de ids no TMDB e cada filme fora
// do cache é uma leva de buscas; sem teto, um laço de requisições esgota a
// cota (e o bloqueio de ~22 h vale para todo mundo)
const BUDGET = [
  { windowMs: 60_000, max: 60 },
  { windowMs: 3_600_000, max: 600 },
]
const calls: number[] = []

function spend() {
  const now = Date.now()
  while (calls.length && calls[0] <= now - 3_600_000) calls.shift()
  const over = BUDGET.some(
    ({ windowMs, max }) =>
      calls.filter((time) => time > now - windowMs).length >= max,
  )
  if (!over) calls.push(now)
  return !over
}

async function api<T>(
  path: string,
  params: Record<string, string>,
  auth: { id: string; secret: string },
): Promise<T> {
  if (Date.now() < blockedUntil) throw new Error('Spotify: cota esgotada')
  if (!spend()) throw new Error('Spotify: teto de chamadas da instância')
  const access = await getToken(auth.id, auth.secret)
  // no-store: o token muda e não pode virar chave do cache do fetch; quem
  // guarda o resultado é o unstable_cache lá embaixo
  const response = await fetch(`${API}${path}?${new URLSearchParams(params)}`, {
    headers: { Authorization: `Bearer ${access}` },
    cache: 'no-store',
    signal: AbortSignal.timeout(TIMEOUT),
  })
  if (response.status === 401) token = null
  if (response.status === 429) {
    const wait = Number(response.headers.get('retry-after')) || 30
    blockedUntil = Date.now() + Math.min(wait, 86400) * 1000
  }
  // 429, 5xx e afins viram exceção, que não fica no cache de um dia
  if (!response.ok) throw new Error(`Spotify: ${response.status}`)
  return response.json()
}

// --- Pontuação ---------------------------------------------------------------

// Sem acento, caixa e pontuação; palavras separadas por um espaço
const words = (text: string) =>
  text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9\p{L}]+/gu, ' ')
    .trim()

// Contém `needle` como sequência de palavras inteiras
const hasWords = (haystack: string, needle: string) =>
  needle !== '' && ` ${haystack} `.includes(` ${needle} `)

const SOUNDTRACK =
  /\b(soundtrack|original score|motion picture|music from|trilha sonora|banda sonora|ost|score|original music)\b/

// Versões que não são a trilha do filme
const OTHER_MEDIA =
  /\b(video game|game|television|tv series|series|season|musical|broadway|cast recording)\b/
const IMITATION =
  /\b(tribute|inspired|cover|covers|remix|remixes|karaoke|lullaby|lullabies|piano version|8 bit)\b/

// Palavras que não identificam a obra: rótulos de trilha, edição e formato.
// O que sobrar além delas e do título é outra obra ("Part II", "Cradle of
// Life", "From Jackie & Ryan", "Netflix", "Suite")
const GENERIC = new Set(
  (
    'a an and the of from by for to in on with ' +
    'original motion picture pictures soundtrack soundtracks score scores ' +
    'music ost film films movie movies official songs song inspired ' +
    'deluxe expanded edition version remastered remaster anniversary ' +
    'complete collection collectors collector limited special vol volume ' +
    'trilha sonora banda do da de filme'
  ).split(' '),
)

const nameTokens = (name: string) => words(name).split(' ').filter(Boolean)

// "Carl Zittrer" bate com "Zittrer, Carl", "C. Zittrer" e "Carl Zittrer
// Orchestra"; só sobrenome igual não basta
function samePerson(artist: string, composer: string) {
  const a = nameTokens(artist)
  const c = nameTokens(composer)
  if (!a.length || !c.length) return false
  if (c.every((t) => a.includes(t)) || a.every((t) => c.includes(t))) {
    return Math.min(a.length, c.length) >= 2 || a.join() === c.join()
  }
  const last = c.at(-1)!
  return a.includes(last) && last.length > 3 && a[0][0] === c[0][0]
}

// Relançamento: o ano no nome é o da nova edição, não o de outro filme
const REISSUE =
  /\b(remaster|remastered|anniversary|edition|reissue|recording)\b/

// Palavras do nome que sobram além do título, dos rótulos genéricos, dos
// nomes de artistas ("Original Score by Hans Zimmer") e do ano. Ano posterior
// passa em álbum só se for relançamento ("2021 Remaster"): "Halloween
// (Original 2018 Motion Picture Soundtrack)" é do remake; em playlist só o
// ano do filme
function extraWords(
  name: string,
  title: string,
  film: Film,
  people: string[],
  laterYearOk: boolean,
) {
  const known = new Set([...people, ...film.composers].flatMap(nameTokens))
  const reissue = laterYearOk && REISSUE.test(name)
  return (
    ` ${name} `
      .replace(` ${title} `, ' ')
      // "Music for the Luca Guadagnino Film": o nome é do diretor
      .replace(/ for the (\S+ ){1,3}film /, ' ')
      .split(' ')
      .filter((token) => {
        if (!token || GENERIC.has(token) || known.has(token)) return false
        if (/^\d+(st|nd|rd|th)$/.test(token)) return false
        if (/^\d{4}$/.test(token) && film.year) {
          const year = Number(token)
          if (year < film.year - 1) return true
          return reissue ? false : year > film.year + (laterYearOk ? 2 : 1)
        }
        return true
      })
  )
}

function titleScore(album: SpotifyAlbum, film: Film) {
  const full = words(album.name)
  const artists = album.artists.map((artist) => artist.name)
  let best = -Infinity
  for (const title of film.titles) {
    if (!hasWords(full, title)) continue
    if (!extraWords(full, title, film, artists, true).length) {
      best = Math.max(best, 40)
    }
    // "Spider-Man 3" ou "Back to the Future Part II" para o primeiro filme
    else if (full.startsWith(title + ' ')) best = Math.max(best, 15)
    // "Marvel's Spider-Man 2" ou só no "(From ...)": outra obra ou single
    else best = Math.max(best, 5)
  }
  return best
}

// O resto do nome, para "The Game" ou "Série" não contarem como outra mídia
const withoutTitle = (name: string, titles: string[]) =>
  titles.reduce((rest, title) => ` ${rest} `.replace(` ${title} `, ' '), name)

function scoreAlbum(album: SpotifyAlbum, film: Film) {
  const title = titleScore(album, film)
  if (title === -Infinity) return -Infinity

  const full = words(album.name)
  const rest = withoutTitle(full, film.titles)
  let score = title
  if (SOUNDTRACK.test(full)) score += 15
  if (OTHER_MEDIA.test(rest)) score -= 30
  if (IMITATION.test(rest)) score -= 30
  const byComposer = album.artists.some((artist) =>
    film.composers.some((composer) => samePerson(artist.name, composer)),
  )
  // Com o título exato o compositor decide (Black Christmas de 1974 contra o
  // remake); com título parcial pesa pouco, senão a trilha da continuação,
  // do mesmo compositor, passa à frente da do filme
  if (byComposer) score += title === 40 ? 40 : 10
  // Relançamentos são comuns, mas trilha anterior ao filme é de outra obra
  const year = Number(album.release_date?.slice(0, 4)) || null
  if (film.year && year && year < film.year - 1) score -= 30
  // Às vésperas do filme e sem compositor que confirme: em geral um homônimo
  if (film.year && year === film.year - 1 && !byComposer) score -= 10
  // Bem posterior e de outro compositor: em geral um filme homônimo
  // ("The Room" de 2019 para o de 2003)
  if (film.year && year && year > film.year + 2 && !byComposer) score -= 10
  // Faixa avulsa ("Jack's Lament") pesa menos que o álbum completo
  if (album.total_tracks <= 2) score -= 5
  return score
}

// --- Busca -------------------------------------------------------------------

interface Film {
  titles: string[] // normalizados, para comparar
  searchTitles: string[]
  main: string // título preferido para buscas extras e o link de reserva
  year: number | null
  composers: string[]
}

const pickImage = (images: SpotifyImage[] | null | undefined) => {
  if (!images?.length) return null
  // A de ~300px basta para a capa; vêm da maior para a menor
  return (images.find((img) => (img.width ?? 0) <= 320) ?? images[0]).url
}

async function searchAlbums(
  q: string,
  auth: { id: string; secret: string },
): Promise<SpotifyAlbum[]> {
  const data = await api<{ albums?: { items: (SpotifyAlbum | null)[] } }>(
    '/search',
    { q, type: 'album', limit: '10', market: 'BR' },
    auth,
  )
  return (data.albums?.items ?? []).filter((a): a is SpotifyAlbum => !!a)
}

async function findAlbum(film: Film, auth: { id: string; secret: string }) {
  const seen = new Map<string, { album: SpotifyAlbum; score: number }>()
  const best = () =>
    [...seen.values()].sort((a, b) => b.score - a.score)[0] ?? null
  const run = async (queries: string[]) => {
    const results = await Promise.all(queries.map((q) => searchAlbums(q, auth)))
    for (const album of results.flat()) {
      if (!seen.has(album.id)) {
        seen.set(album.id, { album, score: scoreAlbum(album, film) })
      }
    }
  }

  await run(film.searchTitles.map((title) => `${title} soundtrack`))

  // Trilhas antigas costumam vir abaixo de remakes e singles; buscar pelo
  // compositor as traz para cima
  // (o filtro artist: é exato, ao contrário da busca livre)
  const top = best()
  const composer = film.composers[0]?.replace(/"/g, '')
  if (composer && (!top || top.score < MIN_SCORE + 40)) {
    await run([`artist:"${composer}" ${film.main}`])
  }
  if (!best() || best()!.score < MIN_SCORE) {
    await run([`${film.main} original score`])
  }

  const found = best()
  return found && found.score >= MIN_SCORE ? found.album : null
}

async function albumTracks(
  album: SpotifyAlbum,
  auth: { id: string; secret: string },
) {
  const tracks: SpotifyTrack[] = []
  let total = Infinity
  while (tracks.length < Math.min(total, MAX_TRACKS)) {
    const page = await api<{ items: SpotifyTrack[]; total: number }>(
      `/albums/${album.id}/tracks`,
      { limit: '50', offset: String(tracks.length) },
      auth,
    )
    total = page.total
    if (!page.items.length) break
    tracks.push(...page.items)
  }
  return tracks.slice(0, MAX_TRACKS)
}

async function findPlaylist(film: Film, auth: { id: string; secret: string }) {
  const data = await api<{ playlists?: { items: (SpotifyPlaylist | null)[] } }>(
    '/search',
    { q: `${film.main} soundtrack`, type: 'playlist', limit: '10' },
    auth,
  )
  // Resultados de playlist trazem itens nulos (playlists removidas)
  return (
    (data.playlists?.items ?? []).find((playlist) => {
      if (!playlist?.name || !playlist.external_urls?.spotify) return false
      const name = words(playlist.name)
      // Nada além do título e de rótulos: "Pulse Netflix Soundtrack" é da
      // série, "Southbound - From Jackie & Ryan" é de outro filme
      return (
        film.titles.some(
          (title) =>
            hasWords(name, title) &&
            !extraWords(name, title, film, [], false).length,
        ) &&
        SOUNDTRACK.test(name) &&
        !OTHER_MEDIA.test(withoutTitle(name, film.titles))
      )
    }) ?? null
  )
}

async function lookup(film: Film): Promise<Soundtrack> {
  const auth = credentials()
  const searchUrl = spotifySearchUrl(film.main)
  if (!auth) return { kind: 'search', url: searchUrl }

  const album = await findAlbum(film, auth)
  if (album) {
    const tracks = await albumTracks(album, auth)
    return {
      kind: 'album',
      album: {
        id: album.id,
        name: album.name,
        url: album.external_urls.spotify,
        image: pickImage(album.images),
        artists: album.artists.map((artist) => artist.name),
        year: Number(album.release_date?.slice(0, 4)) || null,
      },
      tracks: tracks.map((track) => ({
        id: track.id,
        name: track.name,
        url: track.external_urls.spotify,
        artists: track.artists.map((artist) => artist.name),
        durationMs: track.duration_ms,
        number: track.track_number,
      })),
    }
  }

  const playlist = await findPlaylist(film, auth)
  if (playlist) {
    return {
      kind: 'playlist',
      playlist: {
        name: playlist.name,
        url: playlist.external_urls.spotify,
        image: pickImage(playlist.images),
        owner: playlist.owner?.display_name ?? 'Spotify',
      },
    }
  }

  return { kind: 'search', url: searchUrl }
}

// Erros não entram no cache (unstable_cache não guarda exceções), então um
// 429 passageiro não deixa o filme sem trilha por um dia
const cachedLookup = unstable_cache(lookup, ['spotify-soundtrack-v2'], {
  revalidate: 86400,
})

const LATIN = /^[\p{Script=Latin}\p{N}\p{P}\p{S}\s]+$/u

// Caracteres de controle (um "\0" vindo do ?title=) derrubam a busca inteira
const cleanTitle = (title: string | undefined) =>
  title
    ?.replace(/\p{Cc}/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 200)

export async function findSoundtrack(
  film: SoundtrackQuery,
): Promise<Soundtrack> {
  const aliases = (film.aliases ?? []).map(cleanTitle)
  const title = cleanTitle(film.title)
  const originalTitle = cleanTitle(film.originalTitle)
  const searchTitles = [
    ...new Set(
      [title, ...aliases, originalTitle].filter(
        (title): title is string => !!title,
      ),
    ),
  ].slice(0, 3)
  // Original em alfabeto latino é o que mais acha no Spotify; "千と千尋の
  // 神隠し" perde para "Spirited Away" ou até para o título em português
  const main =
    [originalTitle, ...aliases, title].find(
      (title) => title && LATIN.test(title),
    ) ??
    searchTitles[0] ??
    ''
  const fallback: Soundtrack = { kind: 'search', url: spotifySearchUrl(main) }
  if (!searchTitles.length || !credentials()) return fallback

  // Os argumentos viram a chave do cache: títulos, ano e compositores
  const query: Film = {
    titles: [...new Set(searchTitles.map(words).filter(Boolean))],
    searchTitles,
    main: main.trim(),
    year: film.year,
    composers: film.composers.slice(0, 5),
  }
  try {
    return await cachedLookup(query)
  } catch (error) {
    console.warn('[spotify]', error instanceof Error ? error.message : error)
    return fallback
  }
}
