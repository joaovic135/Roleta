import { NextRequest, NextResponse } from 'next/server'
import {
  findSoundtrack,
  spotifySearchUrl,
  type Soundtrack,
} from '@/app/utils/spotify'
import { getFilmDetails, getMusicCredits } from '@/app/utils/tmdbServer'

const CACHED = 'public, s-maxage=86400, stale-while-revalidate=604800'
// Resposta incompleta (TMDB pela metade) não fica um dia na CDN
const SHORT = 'public, s-maxage=3600, stale-while-revalidate=86400'
// O link de busca também sai quando o Spotify falha ou o teto de chamadas
// acaba; o que não tem álbum de fato já fica no cache do servidor
const NO_STORE = 'no-store'

const MAX_TITLE = 200

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams
  const rawId = params.get('tmdbId') ?? ''
  const tmdbId = /^\d{1,9}$/.test(rawId) ? Number(rawId) : 0
  if (tmdbId <= 0) {
    return NextResponse.json({ error: 'tmdbId inválido' }, { status: 400 })
  }

  // pt-BR (o mesmo do /letterboxd, já em cache) e en-US, que traz o título em
  // inglês e os compositores com o nome que o Spotify usa
  const [film, music] = await Promise.all([
    getFilmDetails([tmdbId]).then((details) => details.get(tmdbId)),
    getMusicCredits(tmdbId),
  ])

  // Sem o filme no TMDB não se busca nada no Spotify: o que se pesquisa sai
  // do TMDB, nunca do cliente, senão cada ?title= novo seria uma leva de
  // buscas fora do cache gastando a cota de todo mundo
  if (!film && !music) {
    const title = (params.get('title') ?? '').trim().slice(0, MAX_TITLE)
    if (!title) {
      return NextResponse.json(
        { error: 'Filme não encontrado' },
        { status: 404, headers: { 'Cache-Control': NO_STORE } },
      )
    }
    const fallback: Soundtrack = {
      kind: 'search',
      url: spotifySearchUrl(title),
    }
    return NextResponse.json(fallback, {
      headers: { 'Cache-Control': NO_STORE },
    })
  }

  const soundtrack: Soundtrack = await findSoundtrack({
    title: film?.title ?? music!.title,
    originalTitle: music?.originalTitle ?? film!.originalTitle,
    // Título em inglês: "Spirited Away" acha a trilha que "A Viagem de
    // Chihiro" e "千と千尋の神隠し" não acham
    aliases: music ? [music.title] : [],
    year: music?.releaseYear ?? film!.releaseYear,
    // Com a chamada em inglês fora, os nomes em pt-BR são o que há
    composers: music?.composers ?? film!.composers,
  })

  return NextResponse.json(soundtrack, {
    headers: {
      'Cache-Control':
        soundtrack.kind === 'search'
          ? NO_STORE
          : film && music
            ? CACHED
            : SHORT,
    },
  })
}
