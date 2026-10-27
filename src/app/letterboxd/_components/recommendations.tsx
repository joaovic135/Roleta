import SendToRoulette from '@/app/components/SendToRoulette'
import { Movie } from '@/app/utils/tmdbApi'
import {
  FilmDetails,
  getFilmDetails,
  getGenreRecommendations,
  getSimilarRecommendations,
  scoreGenres,
} from '@/app/utils/tmdbServer'
import { loadDiary, loadWatchlist, toImportMovie, withDetails } from './data'
import { findGenreStat, genreReason } from './insights'
import { MovieCard, posterGrid, Section } from './ui'

function Row({ reason, movies }: { reason: React.ReactNode; movies: Movie[] }) {
  return (
    <div>
      <h3 className="mb-3 text-sm font-semibold text-slate-300">{reason}</h3>
      <div className={posterGrid}>
        {movies.map((movie) => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </div>
    </div>
  )
}

export async function RecommendationsSection() {
  const [diary, watchlist] = await Promise.all([loadDiary(), loadWatchlist()])

  if (!diary) {
    return (
      <Section title="Recomendações para você">
        <p className="text-sm text-slate-400">
          Sem os dados do TMDB agora, não dá para montar recomendações. Tente de
          novo daqui a pouco.
        </p>
      </Section>
    )
  }

  const excludeIds = [...diary.watchedIds, ...(watchlist?.ids ?? [])]
  const topGenres = scoreGenres(
    diary.unique.map(({ film, details }) => ({
      rating: film.rating,
      liked: film.liked,
      genres: details.genres,
    })),
  )
    .filter((g) => g.score > 0)
    .slice(0, 3)
  // Curtidos com nota alta, do mais recente para trás
  const seeds = diary.unique
    .filter(({ film }) => film.liked && (film.rating ?? 0) >= 4)
    .slice(0, 3)
    .map(({ film, details }) => ({ id: details.id, title: film.title }))

  const [byGenre, bySeed] = await Promise.all([
    topGenres.length
      ? getGenreRecommendations(
          topGenres.map((g) => g.genre),
          excludeIds,
        ).catch(() => [])
      : [],
    seeds.length
      ? getSimilarRecommendations(seeds, excludeIds).catch(() => [])
      : [],
  ])

  // Um filme aparece só uma vez na seção
  const shown = new Set<number>()
  const unseen = (movies: Movie[]) =>
    movies.filter((m) => {
      if (shown.has(m.id)) return false
      shown.add(m.id)
      return true
    })
  const genreRows = byGenre
    .map((rec) => ({ ...rec, movies: unseen(rec.movies) }))
    .filter((rec) => rec.movies.length)
  const seedRows = bySeed
    .map((rec) => ({ ...rec, movies: unseen(rec.movies) }))
    .filter((rec) => rec.movies.length)
  const all = [...genreRows, ...seedRows].flatMap((rec) => rec.movies)
  // Detalhes para levar os streamings junto para a roleta
  const details = all.length
    ? await getFilmDetails(all.map((m) => m.id)).catch(
        () => new Map<number, FilmDetails>(),
      )
    : new Map<number, FilmDetails>()
  const streamingIds = all.flatMap((m) =>
    details.get(m.id)?.providers.length ? [m.id] : [],
  )

  return (
    <Section
      title="Recomendações para você"
      aside="Fora do que você já viu e da watchlist"
    >
      {all.length ? (
        <div className="space-y-6">
          <SendToRoulette
            source="Recomendações"
            items={all.map((movie) => {
              const full = withDetails(movie, details.get(movie.id))
              return { title: full.title, movie: toImportMovie(full) }
            })}
            streamingIds={streamingIds}
          />
          {genreRows.map(({ genre, movies }) => (
            <Row
              key={`g${genre.id}`}
              movies={movies}
              reason={
                <>
                  Porque você gosta de{' '}
                  <span className="text-amber-300">{genre.name}</span>
                  <span className="font-normal text-slate-500">
                    {' '}
                    — {genreReason(findGenreStat(diary.unique, genre.id))}
                  </span>
                </>
              }
            />
          ))}
          {seedRows.map(({ seed, movies }) => (
            <Row
              key={`s${seed.id}`}
              movies={movies}
              reason={
                <>
                  Porque você curtiu{' '}
                  <span className="text-amber-300">{seed.title}</span>
                </>
              }
            />
          ))}
        </div>
      ) : topGenres.length || seeds.length ? (
        // Havia por onde começar, então o que falhou foi o TMDB
        <p className="text-sm text-slate-400">
          Sem os dados do TMDB agora, não dá para montar recomendações. Tente de
          novo daqui a pouco.
        </p>
      ) : (
        <p className="text-sm text-slate-400">
          Ainda não há recomendações: dê notas e curtidas a mais filmes no
          Letterboxd.
        </p>
      )}
    </Section>
  )
}
