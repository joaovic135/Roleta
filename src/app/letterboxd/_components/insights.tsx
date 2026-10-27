import Image from 'next/image'
import SoundtrackLinks from '@/app/components/SoundtrackLinks'
import TmdbImage from '@/app/components/TmdbImage'
import { scoreGenres } from '@/app/utils/tmdbServer'
import { WatchProvider } from '@/app/types'
import { DiaryFilm, loadDiary } from './data'
import {
  BarList,
  decimal,
  external,
  plural,
  Section,
  StatTile,
  stars,
} from './ui'

interface GenreStat {
  id: number
  name: string
  count: number
  average: number | null
}

// Contagem e nota média (só das notas dadas) por gênero
function genreStats(films: DiaryFilm[]): GenreStat[] {
  const stats = new Map<
    number,
    { name: string; count: number; sum: number; rated: number }
  >()
  for (const { film, details } of films) {
    for (const genre of details.genres) {
      const s = stats.get(genre.id) ?? {
        name: genre.name,
        count: 0,
        sum: 0,
        rated: 0,
      }
      s.count++
      if (film.rating !== null) {
        s.sum += film.rating
        s.rated++
      }
      stats.set(genre.id, s)
    }
  }
  return [...stats]
    .map(([id, s]) => ({
      id,
      name: s.name,
      count: s.count,
      average: s.rated ? s.sum / s.rated : null,
    }))
    .sort((a, b) => b.count - a.count)
}

export const genreReason = (stat: GenreStat | undefined) =>
  stat
    ? `${stat.average !== null ? `nota média ${decimal(stat.average)} em ` : ''}${plural(stat.count, 'filme', 'filmes')}`
    : ''

export function findGenreStat(films: DiaryFilm[], id: number) {
  return genreStats(films).find((s) => s.id === id)
}

// Pessoas que mais aparecem, com os filmes de cada uma
function topPeople(films: DiaryFilm[], pick: (f: DiaryFilm) => string[]) {
  const people = new Map<string, string[]>()
  for (const film of films) {
    for (const name of new Set(pick(film))) {
      people.set(name, [...(people.get(name) ?? []), film.film.title])
    }
  }
  return [...people]
    .filter(([, titles]) => titles.length >= 2)
    .sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0]))
}

const ratingOf = ({ film, details }: DiaryFilm) =>
  film.rating !== null && details.voteAverage !== null && details.voteCount > 0
    ? { you: film.rating, crowd: details.voteAverage / 2 }
    : null

// Fundo do topo: o filme visto mais recentemente que tem backdrop
export async function HeroBackdrop() {
  const diary = await loadDiary()
  const latest = diary?.entries
    .filter((e) => e.details.backdropPath)
    .sort((a, b) =>
      (b.film.watchedDate ?? '').localeCompare(a.film.watchedDate ?? ''),
    )[0]
  if (!latest) return null

  return (
    <>
      <Image
        unoptimized
        priority
        fill
        src={`https://image.tmdb.org/t/p/w1280${latest.details.backdropPath}`}
        alt=""
        sizes="(min-width: 1152px) 1152px, 100vw"
        className="object-cover object-[center_30%]"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/75 to-slate-950/25" />
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 to-transparent" />
      {/* z-20: acima do conteúdo do topo (z-10), que cobre o cabeçalho todo e
          engolia o clique */}
      <div className="absolute right-3 top-3 z-20 hidden max-w-[50%] items-center gap-2 sm:flex">
        <a
          href={latest.film.link}
          {...external}
          className="min-w-0 truncate rounded-full bg-slate-950/70 px-3 py-1 text-[11px] text-slate-300 hover:text-amber-300"
        >
          Visto por último: {latest.film.title}
        </a>
        <SoundtrackLinks
          tmdbId={latest.details.id}
          title={latest.film.title}
          variant="compact"
        />
      </div>
    </>
  )
}

export async function TmdbStats() {
  const diary = await loadDiary()
  if (!diary) return null

  const minutes = diary.entries.reduce(
    (sum, e) => sum + (e.details.runtime ?? 0),
    0,
  )
  const timed = diary.entries.filter((e) => e.details.runtime).length
  const director = topPeople(diary.unique, (f) => f.details.directors)[0]
  const favorite = scoreGenres(
    diary.unique.map(({ film, details }) => ({
      rating: film.rating,
      liked: film.liked,
      genres: details.genres,
    })),
  )[0]

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <StatTile
        compact
        label="Horas assistidas"
        value={`${decimal(minutes / 60)} h`}
        hint={timed ? `≈ ${Math.round(minutes / timed)} min por filme` : ''}
      />
      <StatTile
        compact
        label="Diretor mais visto"
        value={director?.[0] ?? '—'}
        hint={
          director
            ? plural(director[1].length, 'filme', 'filmes')
            : 'Ninguém repetiu ainda'
        }
      />
      <StatTile
        compact
        label="Gênero favorito"
        value={favorite?.genre.name ?? '—'}
        hint={genreReason(
          findGenreStat(diary.unique, favorite?.genre.id ?? -1),
        )}
      />
    </div>
  )
}

export async function GenreSection() {
  const diary = await loadDiary()
  if (!diary) return null
  const top = genreStats(diary.unique).slice(0, 8)

  return (
    <Section title="Gêneros" aside="Filmes · sua nota média">
      <BarList
        labelClass="w-24 sm:w-32"
        rows={top.map((g) => ({
          key: String(g.id),
          label: g.name,
          value: g.count,
          extra: g.average !== null ? `★${decimal(g.average)}` : undefined,
        }))}
      />
    </Section>
  )
}

const round1 = (value: number) => Math.round(value * 10) / 10

const W = 320
const H = 240
// Topo mais alto para o rótulo "Você" não encostar no 5 do eixo
const PAD = { left: 28, right: 10, top: 24, bottom: 30 }
const sx = (v: number) => PAD.left + (v / 5) * (W - PAD.left - PAD.right)
const sy = (v: number) => H - PAD.bottom - (v / 5) * (H - PAD.top - PAD.bottom)
const TICKS = [0, 1, 2, 3, 4, 5]

function DiffList({
  title,
  films,
}: {
  title: string
  films: { film: DiaryFilm; you: number; crowd: number }[]
}) {
  return (
    <div className="min-w-0">
      <h3 className="mb-2 text-sm font-semibold text-slate-300">{title}</h3>
      {films.length ? (
        <ol className="space-y-1.5 text-sm">
          {films.map(({ film, you, crowd }) => {
            // Diferença dos valores já arredondados, para a conta fechar
            const diff = round1(you) - round1(crowd)
            return (
              <li key={film.details.id} className="flex items-baseline gap-2">
                <a
                  href={film.film.link}
                  {...external}
                  className="min-w-0 flex-1 truncate text-slate-200 hover:text-amber-300"
                >
                  {film.film.title}
                </a>
                <span className="shrink-0 text-xs tabular-nums text-slate-500">
                  {decimal(round1(you))} vs {decimal(round1(crowd))}
                </span>
                <span className="w-10 shrink-0 text-right text-xs font-semibold tabular-nums text-amber-300">
                  {diff > 0 ? '+' : diff < 0 ? '−' : ''}
                  {decimal(Math.abs(diff))}
                </span>
              </li>
            )
          })}
        </ol>
      ) : (
        <p className="text-sm text-slate-500">Nada por aqui.</p>
      )}
    </div>
  )
}

export async function AudienceSection() {
  const diary = await loadDiary()
  if (!diary) return null
  const points = diary.unique.flatMap((film) => {
    const r = ratingOf(film)
    return r ? [{ film, ...r }] : []
  })
  if (!points.length) return null
  const byDiff = [...points].sort((a, b) => b.you - b.crowd - (a.you - a.crowd))

  return (
    <Section title="Você vs. público" aside="Sua nota × TMDB (0–5)">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="mx-auto h-auto w-full max-w-lg"
        role="img"
        aria-label="Dispersão da sua nota contra a nota do TMDB"
      >
        {TICKS.map((t) => (
          <g key={t}>
            <line
              x1={sx(0)}
              x2={sx(5)}
              y1={sy(t)}
              y2={sy(t)}
              className="stroke-white/10"
            />
            <line
              x1={sx(t)}
              x2={sx(t)}
              y1={sy(0)}
              y2={sy(5)}
              className="stroke-white/10"
            />
            <text
              x={PAD.left - 8}
              y={sy(t) + 3}
              textAnchor="end"
              className="fill-slate-500 text-[10px]"
            >
              {t}
            </text>
            <text
              x={sx(t)}
              y={H - PAD.bottom + 13}
              textAnchor="middle"
              className="fill-slate-500 text-[10px]"
            >
              {t}
            </text>
          </g>
        ))}
        <line
          x1={sx(0)}
          y1={sy(0)}
          x2={sx(5)}
          y2={sy(5)}
          strokeDasharray="4 4"
          className="stroke-slate-500"
        />
        <text
          x={sx(5)}
          y={H - 2}
          textAnchor="end"
          className="fill-slate-400 text-[10px]"
        >
          TMDB →
        </text>
        <text x={2} y={PAD.top - 12} className="fill-slate-400 text-[10px]">
          Você
        </text>
        {points.map(({ film, you, crowd }) => (
          <circle
            key={film.details.id}
            cx={sx(crowd)}
            cy={sy(you)}
            r={4.5}
            fillOpacity={0.85}
            strokeWidth={1}
            className={`stroke-slate-950 ${you >= crowd ? 'fill-amber-400' : 'fill-slate-400'}`}
          >
            <title>
              {`${film.film.title}${film.film.year ? ` (${film.film.year})` : ''} — você ${stars(you)} (${decimal(you)}) · TMDB ${decimal(crowd)}`}
            </title>
          </circle>
        ))}
      </svg>
      <p className="mb-4 mt-2 text-center text-xs text-slate-500">
        <span className="text-amber-300">●</span> acima da linha: você gostou
        mais que o público · <span className="text-slate-400">●</span> abaixo:
        menos
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <DiffList
          title="Mais generoso que o TMDB"
          films={byDiff.filter((p) => p.you > p.crowd).slice(0, 3)}
        />
        <DiffList
          title="Mais duro que o TMDB"
          films={byDiff
            .filter((p) => p.you < p.crowd)
            .reverse()
            .slice(0, 3)}
        />
      </div>
    </Section>
  )
}

function PeopleChips({
  title,
  people,
}: {
  title: string
  people: [string, string[]][]
}) {
  return (
    <div className="min-w-0">
      <h3 className="mb-2 text-sm font-semibold text-slate-300">{title}</h3>
      {people.length ? (
        <ul className="flex flex-wrap gap-2">
          {people.slice(0, 16).map(([name, titles]) => (
            <li
              key={name}
              title={titles.join(', ')}
              className="max-w-full truncate rounded-full bg-slate-950/40 px-3 py-1 text-sm text-slate-200 ring-1 ring-white/10"
            >
              {name}
              <span className="ml-1.5 font-semibold tabular-nums text-amber-300">
                {titles.length}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-slate-500">
          Ninguém aparece em mais de um filme ainda.
        </p>
      )}
    </div>
  )
}

export async function PeopleSection() {
  const diary = await loadDiary()
  if (!diary) return null

  return (
    <Section title="Quem mais aparece" aside="2 filmes ou mais">
      <div className="grid gap-5 md:grid-cols-2">
        <PeopleChips
          title="Diretores"
          people={topPeople(diary.unique, (f) => f.details.directors)}
        />
        <PeopleChips
          title="Elenco"
          people={topPeople(diary.unique, (f) => f.details.cast)}
        />
      </div>
    </Section>
  )
}

const serviceKey = (name: string) =>
  name
    .replace(
      /\s+(standard with ads|with ads|premium|amazon channel|apple tv channel)$/i,
      '',
    )
    .replace(/\+/g, ' plus')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')

export async function WhereToWatch() {
  const diary = await loadDiary()
  if (!diary) return null

  // Variantes do mesmo serviço ("with Ads", "Amazon Channel"...) viram um card
  const providers = new Map<
    string,
    { provider: WatchProvider; films: DiaryFilm[] }
  >()
  for (const film of diary.unique) {
    for (const provider of film.details.providers) {
      const key = serviceKey(provider.provider_name)
      const entry = providers.get(key) ?? { provider, films: [] }
      // Fica com o nome mais curto, que é o do serviço principal
      if (provider.provider_name.length < entry.provider.provider_name.length)
        entry.provider = provider
      if (!entry.films.includes(film)) entry.films.push(film)
      providers.set(key, entry)
    }
  }
  const sorted = [...providers.values()].sort(
    (a, b) =>
      b.films.length - a.films.length ||
      a.provider.display_priority - b.provider.display_priority,
  )
  const available = diary.unique.filter((f) => f.details.providers.length)

  return (
    <Section
      title="Onde assistir no Brasil"
      aside={`${available.length} de ${plural(diary.unique.length, 'filme', 'filmes')} do diário em streaming`}
    >
      {sorted.length ? (
        <div className="grid gap-3 md:grid-cols-2">
          {sorted.map(({ provider, films }) => (
            <article
              key={provider.provider_id}
              className="flex min-w-0 gap-3 rounded-xl bg-slate-950/40 p-3 ring-1 ring-white/5"
            >
              <TmdbImage
                kind="logo"
                path={provider.logo_path}
                alt={provider.provider_name}
                width={44}
                height={44}
                loading="lazy"
                className="h-11 w-11 shrink-0 rounded-lg"
              />
              <div className="min-w-0 flex-1">
                <h3 className="truncate font-semibold text-slate-100">
                  {provider.provider_name}{' '}
                  <span className="text-xs font-normal text-slate-500">
                    {plural(films.length, 'filme', 'filmes')}
                  </span>
                </h3>
                <ul className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-sm">
                  {films.map(({ film, details }) => (
                    <li key={details.id} className="min-w-0 max-w-full">
                      <a
                        href={film.link}
                        {...external}
                        className="block truncate text-slate-300 hover:text-amber-300"
                      >
                        {film.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <p className="text-sm text-slate-400">
          Nenhum filme do diário está em streaming por assinatura no Brasil
          agora.
        </p>
      )}
      <p className="mt-3 text-[11px] text-slate-500">
        Dados de streaming: JustWatch via TMDB.
      </p>
    </Section>
  )
}
