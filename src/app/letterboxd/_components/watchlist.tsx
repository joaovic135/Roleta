import { LETTERBOXD_USER } from '@/app/utils/letterboxd'
import { loadWatchlist, toImportMovie } from './data'
import { external, plural, Section } from './ui'
import { WatchlistFilm, WatchlistGrid } from './watchlist-grid'

const WATCHLIST_URL = `https://letterboxd.com/${LETTERBOXD_USER.toLowerCase()}/watchlist/`

const watchlistLink = (
  <a
    href={WATCHLIST_URL}
    {...external}
    className="font-medium text-amber-300 hover:underline"
  >
    Ver no Letterboxd →
  </a>
)

export async function WatchlistSection() {
  const watchlist = await loadWatchlist()

  if (!watchlist) {
    return (
      <Section title="Watchlist" aside={watchlistLink}>
        <p className="text-sm text-slate-400">
          O Letterboxd não deixou ler a watchlist agora (às vezes ele bloqueia
          acessos automáticos). Dá para vê-la direto no site pelo link acima.
        </p>
      </Section>
    )
  }

  const { count, items, streamingIds } = watchlist
  const films: WatchlistFilm[] = items.map(({ film, movie }) => ({
    link: film.link,
    title: movie?.title ?? film.title,
    year: film.year ?? movie?.release_date?.slice(0, 4) ?? null,
    ...(movie ? { movie: toImportMovie(movie) } : {}),
  }))

  return (
    <Section title="Watchlist" aside={watchlistLink}>
      <WatchlistGrid
        films={films}
        streamingIds={streamingIds}
        summary={
          <p className="text-sm text-slate-300">
            <span className="text-2xl font-bold tabular-nums text-slate-100">
              {count}
            </span>{' '}
            filmes para ver ·{' '}
            <span className="font-semibold tabular-nums text-amber-300">
              {new Set(streamingIds).size}
            </span>{' '}
            em streaming no Brasil
          </p>
        }
      />
      {items.length < count && (
        <p className="mt-3 text-xs text-slate-500">
          Mostrando {plural(items.length, 'filme', 'filmes')} de {count}.
        </p>
      )}
    </Section>
  )
}
