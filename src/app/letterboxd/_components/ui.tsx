import Image from 'next/image'
import TmdbImage from '@/app/components/TmdbImage'
import { LetterboxdFilm } from '@/app/utils/letterboxd'
import { Movie } from '@/app/utils/tmdbApi'

export const stars = (rating: number) =>
  '★'.repeat(Math.floor(rating)) + (rating % 1 >= 0.5 ? '½' : '')

export const decimal = (value: number, digits = 1) =>
  value.toLocaleString('pt-BR', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })

export const plural = (count: number, one: string, many: string) =>
  `${count} ${count === 1 ? one : many}`

export const formatDay = (date: string) =>
  new Date(`${date}T00:00:00Z`).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    timeZone: 'UTC',
  })

export const formatMonth = (month: string) =>
  new Date(`${month}-01T00:00:00Z`).toLocaleDateString('pt-BR', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  })

export function groupBy<T>(items: T[], key: (item: T) => string) {
  const groups = new Map<string, T[]>()
  for (const item of items) {
    const k = key(item)
    groups.set(k, [...(groups.get(k) ?? []), item])
  }
  return groups
}

// Conta quantas vezes cada valor aparece, do mais frequente ao menos
export function countBy(values: string[]) {
  const counts = new Map<string, number>()
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1)
  return [...counts].sort((a, b) => b[1] - a[1])
}

export const movieYear = (movie: Movie) =>
  Number(movie.release_date?.slice(0, 4)) || null

// O Letterboxd redireciona /tmdb/<id>/ para a página do filme
export const letterboxdByTmdb = (id: number) =>
  `https://letterboxd.com/tmdb/${id}/`

export const external = {
  target: '_blank',
  rel: 'noopener noreferrer',
} as const

export function StatTile({
  label,
  value,
  hint,
  compact,
}: {
  label: string
  value: string
  hint?: string
  compact?: boolean
}) {
  return (
    <div className="ui-card min-w-0 rounded-2xl border border-white/10 bg-slate-900/80 p-4 shadow-xl">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p
        className={`mt-1 truncate font-bold tabular-nums text-slate-100 ${compact ? 'text-xl' : 'text-2xl'}`}
        title={value}
      >
        {value}
      </p>
      {hint && <p className="mt-0.5 truncate text-xs text-amber-300">{hint}</p>}
    </div>
  )
}

export function Section({
  title,
  aside,
  children,
}: {
  title: string
  aside?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section className="ui-card min-w-0 rounded-2xl border border-white/10 bg-slate-900/80 p-5 shadow-xl">
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <h2 className="ui-card-title text-lg font-bold">{title}</h2>
        {aside && <span className="text-xs text-slate-400">{aside}</span>}
      </div>
      {children}
    </section>
  )
}

export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-xl bg-slate-800/60 ${className}`} />
  )
}

export function SectionSkeleton({
  title,
  aside = 'Carregando…',
  lines = 4,
  posters = 0,
}: {
  title: string
  aside?: string
  lines?: number
  posters?: number
}) {
  return (
    <Section title={title} aside={aside}>
      <div className="space-y-2" aria-busy="true">
        {Array.from({ length: lines }, (_, i) => (
          <Skeleton key={i} className="h-4" />
        ))}
      </div>
      {posters > 0 && (
        <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
          {Array.from({ length: posters }, (_, i) => (
            <Skeleton key={i} className="aspect-[2/3] rounded-lg" />
          ))}
        </div>
      )}
    </Section>
  )
}

// Barras horizontais no mesmo visual dos gráficos do feed
export function BarList({
  rows,
  labelClass = 'w-12',
}: {
  rows: { key: string; label: string; value: number; extra?: string }[]
  labelClass?: string
}) {
  const max = Math.max(...rows.map((r) => r.value), 1)
  return (
    <ul className="space-y-1.5">
      {rows.map((row) => (
        <li key={row.key} className="flex items-center gap-3 text-sm">
          <span
            className={`shrink-0 truncate tabular-nums text-slate-400 ${labelClass}`}
            title={row.label}
          >
            {row.label}
          </span>
          <div className="h-4 min-w-0 flex-1">
            <div
              className="h-full rounded-r-md bg-amber-400/80"
              style={{ width: `${(row.value / max) * 100}%` }}
            />
          </div>
          <span className="shrink-0 text-right tabular-nums text-slate-300">
            {row.value}
            {row.extra && (
              <span className="ml-1.5 text-xs text-amber-300">{row.extra}</span>
            )}
          </span>
        </li>
      ))}
    </ul>
  )
}

export function Poster({
  film,
  className,
}: {
  film: LetterboxdFilm
  className: string
}) {
  return film.poster ? (
    <Image
      unoptimized
      src={film.poster}
      alt={`Pôster de ${film.title}`}
      width={230}
      height={345}
      loading="lazy"
      className={`aspect-[2/3] w-full object-cover ${className}`}
    />
  ) : (
    <div
      className={`flex aspect-[2/3] w-full items-center justify-center bg-slate-800 p-2 text-center text-xs text-slate-400 ${className}`}
    >
      {film.title}
    </div>
  )
}

// Pôster do TMDB (ou só o título, quando não há pôster)
export function TmdbPoster({
  path,
  title,
  badge,
}: {
  path: string | null | undefined
  title: string
  badge?: React.ReactNode
}) {
  return (
    <div className="relative aspect-[2/3] w-full overflow-hidden rounded-lg bg-slate-800 ring-1 ring-white/10 transition group-hover:ring-2 group-hover:ring-amber-400">
      {path ? (
        <TmdbImage
          path={path}
          alt={`Pôster de ${title}`}
          fill
          sizes="(min-width: 1024px) 120px, (min-width: 640px) 20vw, 30vw"
          loading="lazy"
          className="object-cover transition duration-300 group-hover:scale-105"
        />
      ) : (
        <div className="flex h-full items-center justify-center p-2 text-center text-xs text-slate-400">
          {title}
        </div>
      )}
      {badge}
    </div>
  )
}

export function MovieCard({ movie }: { movie: Movie }) {
  const year = movieYear(movie)
  return (
    <a
      href={letterboxdByTmdb(movie.id)}
      {...external}
      className="group block min-w-0"
      title={`${movie.title}${year ? ` (${year})` : ''}`}
    >
      <TmdbPoster path={movie.poster_path} title={movie.title} />
      <p className="mt-1.5 truncate text-sm font-medium text-slate-200">
        {movie.title}
      </p>
      <p className="text-xs tabular-nums text-slate-500">
        {year}
        {movie.vote_count > 0 && (
          <span className="text-amber-300">
            {year && ' · '}TMDB {decimal(movie.vote_average)}
          </span>
        )}
      </p>
    </a>
  )
}

export const posterGrid =
  'grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8'
