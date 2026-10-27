import SoundtrackLinks from '@/app/components/SoundtrackLinks'
import { LetterboxdFilm } from '@/app/utils/letterboxd'
import {
  BarList,
  external,
  formatDay,
  formatMonth,
  groupBy,
  plural,
  Poster,
  Section,
  stars,
} from './ui'

const RATING_STEPS = [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5]

const formatStep = (step: number) =>
  `${Math.floor(step) || ''}${step % 1 ? '½' : ''}`

export function RatingChart({ films }: { films: LetterboxdFilm[] }) {
  const counts = RATING_STEPS.map(
    (step) => films.filter((f) => f.rating === step).length,
  )
  const max = Math.max(...counts, 1)

  return (
    <div className="flex h-40 items-end gap-1.5">
      {RATING_STEPS.map((step, i) => (
        <div
          key={step}
          className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1"
        >
          <span className="text-xs tabular-nums text-slate-400">
            {counts[i] || ''}
          </span>
          <div
            className="w-full rounded-t-md bg-amber-400/80"
            style={{ height: `${(counts[i] / max) * 100}%`, minHeight: 2 }}
            title={`${stars(step)}: ${counts[i]} filme(s)`}
          />
          <span className="text-[11px] tabular-nums text-slate-500">
            {formatStep(step)}
          </span>
        </div>
      ))}
    </div>
  )
}

export function DecadeChart({ films }: { films: LetterboxdFilm[] }) {
  const decades = [
    ...groupBy(
      films.filter((f) => f.year),
      (f) => String(Math.floor(f.year! / 10) * 10),
    ),
  ].sort(([a], [b]) => Number(a) - Number(b))

  return (
    <BarList
      rows={decades.map(([decade, list]) => ({
        key: decade,
        label: `${decade}s`,
        value: list.length,
      }))}
    />
  )
}

// Botão de trilha por cima do pôster. Em telas com mouse só aparece no hover
// ou no foco, para não encher a grade de ícones; no toque fica sempre à vista
const soundtrackCorner =
  'absolute right-1.5 top-1.5 z-10 transition-opacity [@media(hover:hover)]:opacity-0 group-hover:opacity-100 focus-within:opacity-100'

function FilmCard({ film }: { film: LetterboxdFilm }) {
  // O botão fica fora do <a>: <button> dentro de link não é HTML válido
  return (
    <div className="group relative min-w-0">
      <FilmLink film={film} />
      {film.tmdbId && (
        <div className={soundtrackCorner}>
          <SoundtrackLinks
            tmdbId={film.tmdbId}
            title={film.title}
            variant="compact"
          />
        </div>
      )}
    </div>
  )
}

function FilmLink({ film }: { film: LetterboxdFilm }) {
  return (
    <a
      href={film.link}
      {...external}
      className="block"
      title={`${film.title}${film.year ? ` (${film.year})` : ''}`}
    >
      <div className="relative overflow-hidden rounded-lg ring-1 ring-white/10 transition group-hover:ring-2 group-hover:ring-amber-400">
        <Poster
          film={film}
          className="transition duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between bg-gradient-to-t from-black/90 to-transparent px-2 pb-1.5 pt-6 text-xs">
          {/* Cor fixa: o degradê é sempre preto, e o amber do tema escurece
            nos temas claros */}
          <span className="font-semibold tracking-tight text-[#fcd34d]">
            {film.rating ? stars(film.rating) : ''}
          </span>
          <span className="flex gap-1">
            {film.rewatch && (
              <span className="text-sky-300" title="Revisto">
                ↻
              </span>
            )}
            {film.liked && (
              <span className="text-rose-400" title="Curtido">
                ♥
              </span>
            )}
          </span>
        </div>
      </div>
      <p className="mt-1.5 truncate text-sm font-medium text-slate-200">
        {film.title}
      </p>
      <p className="text-xs tabular-nums text-slate-500">
        {film.year}
        {film.watchedDate && ` · visto ${formatDay(film.watchedDate)}`}
      </p>
    </a>
  )
}

function ReviewCard({ film }: { film: LetterboxdFilm }) {
  return (
    <article className="flex min-w-0 gap-4 rounded-xl bg-slate-950/40 p-4 ring-1 ring-white/5">
      <a href={film.link} {...external} className="w-20 shrink-0 sm:w-24">
        <Poster film={film} className="rounded-md ring-1 ring-white/10" />
      </a>
      <div className="min-w-0">
        <h3 className="font-semibold text-slate-100">
          {film.title}{' '}
          <span className="font-normal text-slate-500">{film.year}</span>
        </h3>
        <p className="mb-2 text-sm text-amber-300">
          {film.rating ? stars(film.rating) : 'Sem nota'}
          {film.liked && <span className="ml-2 text-rose-400">♥</span>}
          {film.watchedDate && (
            <span className="ml-2 text-xs text-slate-500">
              {formatDay(film.watchedDate)}
            </span>
          )}
        </p>
        <p className="whitespace-pre-line break-words text-sm leading-relaxed text-slate-300">
          {film.review}
        </p>
        {film.tmdbId && (
          <div className="mt-3">
            <SoundtrackLinks tmdbId={film.tmdbId} title={film.title} />
          </div>
        )}
      </div>
    </article>
  )
}

export function Reviews({ films }: { films: LetterboxdFilm[] }) {
  return (
    <Section title="Reviews">
      <div className="grid gap-3 lg:grid-cols-2">
        {films.map((film) => (
          <ReviewCard key={film.id} film={film} />
        ))}
      </div>
    </Section>
  )
}

export function DiarySection({ films }: { films: LetterboxdFilm[] }) {
  const byMonth = groupBy(
    films.filter((f) => f.watchedDate),
    (f) => f.watchedDate!.slice(0, 7),
  )

  return (
    <Section title="Diário" aside="Mais recentes primeiro">
      <div className="space-y-6">
        {[...byMonth].map(([month, monthFilms]) => (
          <div key={month}>
            <h3 className="mb-3 flex items-center gap-3 text-sm font-semibold capitalize text-slate-300">
              {formatMonth(month)}
              <span className="h-px flex-1 bg-white/10" />
              <span className="text-xs font-normal normal-case text-slate-500">
                {plural(monthFilms.length, 'filme', 'filmes')}
              </span>
            </h3>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
              {monthFilms.map((film) => (
                <FilmCard key={film.id} film={film} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </Section>
  )
}
