import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'
import ThemeBackdrop from '../components/ThemeBackdrop'
import { LETTERBOXD_USER, LetterboxdFeed } from '../utils/letterboxd'
import { loadFeed } from './_components/data'
import {
  DecadeChart,
  DiarySection,
  RatingChart,
  Reviews,
} from './_components/feed'
import {
  AudienceSection,
  GenreSection,
  HeroBackdrop,
  PeopleSection,
  TmdbStats,
  WhereToWatch,
} from './_components/insights'
import { FullListCard, ListCard } from './_components/lists'
import { RecommendationsSection } from './_components/recommendations'
import {
  decimal,
  Section,
  SectionSkeleton,
  Skeleton,
  StatTile,
  stars,
} from './_components/ui'
import { WatchlistSection } from './_components/watchlist'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Letterboxd · Roleta',
  description: `O Letterboxd de ${LETTERBOXD_USER}, em forma visual`,
}

function Hero({ feed }: { feed: LetterboxdFeed | null }) {
  return (
    <header className="ui-card relative isolate overflow-hidden rounded-2xl border border-white/10 bg-slate-900/80 shadow-xl">
      {feed && (
        <Suspense fallback={null}>
          <HeroBackdrop />
        </Suspense>
      )}
      <div className="relative z-10 flex min-h-48 flex-wrap items-end justify-between gap-3 p-5 sm:min-h-64 sm:p-8">
        <div className="min-w-0">
          <Link
            href="/"
            className="text-xs font-medium text-slate-400 hover:text-amber-300"
          >
            ← Voltar para a roleta
          </Link>
          <h1 className="mt-1 text-3xl font-bold text-slate-100 sm:text-4xl">
            Letterboxd de{' '}
            <span className="text-amber-300">
              {feed?.profileName ?? LETTERBOXD_USER}
            </span>
          </h1>
          <p className="max-w-xl text-sm text-slate-300">
            Os últimos filmes vistos, reviews e listas, cruzados com o TMDB:
            gêneros, streaming no Brasil, watchlist e recomendações.
          </p>
        </div>
        {feed && (
          <a
            href={feed.profileLink}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border border-white/10 bg-slate-900/80 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-amber-400 hover:text-amber-300"
          >
            Ver perfil no Letterboxd →
          </a>
        )}
      </div>
    </header>
  )
}

const tileSkeletons = (
  <div className="grid gap-3 sm:grid-cols-3">
    {[0, 1, 2].map((i) => (
      <Skeleton key={i} className="h-[92px] rounded-2xl" />
    ))}
  </div>
)

function FeedView({ feed }: { feed: LetterboxdFeed }) {
  const { films, lists } = feed
  const rated = films.filter((f) => f.rating)
  const average = rated.length
    ? rated.reduce((sum, f) => sum + f.rating!, 0) / rated.length
    : 0
  const reviews = films.filter((f) => f.review)

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <StatTile label="Filmes no feed" value={String(films.length)} />
        <StatTile
          label="Nota média"
          value={decimal(average, 2)}
          hint={stars(Math.round(average * 2) / 2)}
        />
        <StatTile
          label="Curtidos"
          value={String(films.filter((f) => f.liked).length)}
          hint="♥"
        />
        <StatTile
          label="Revistos"
          value={String(films.filter((f) => f.rewatch).length)}
          hint="↻"
        />
        <StatTile
          label="Reviews · listas"
          value={`${reviews.length} · ${lists.length}`}
        />
      </div>
      <Suspense fallback={tileSkeletons}>
        <TmdbStats />
      </Suspense>

      <div className="grid gap-4 lg:grid-cols-2">
        <Section title="Distribuição de notas" aside={`${rated.length} notas`}>
          <RatingChart films={rated} />
        </Section>
        <Section title="Década de lançamento">
          <DecadeChart films={films} />
        </Section>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Suspense fallback={<SectionSkeleton title="Gêneros" lines={8} />}>
          <GenreSection />
        </Suspense>
        <Suspense
          fallback={<SectionSkeleton title="Você vs. público" lines={8} />}
        >
          <AudienceSection />
        </Suspense>
      </div>

      <Suspense fallback={<SectionSkeleton title="Quem mais aparece" />}>
        <PeopleSection />
      </Suspense>

      {reviews.length > 0 && <Reviews films={reviews} />}

      <DiarySection films={films} />

      <Suspense
        fallback={<SectionSkeleton title="Onde assistir no Brasil" lines={6} />}
      >
        <WhereToWatch />
      </Suspense>

      <Suspense
        fallback={
          <SectionSkeleton
            title="Watchlist"
            aside="Lendo a watchlist…"
            lines={1}
            posters={16}
          />
        }
      >
        <WatchlistSection />
      </Suspense>

      <Suspense
        fallback={
          <SectionSkeleton
            title="Recomendações para você"
            aside="Procurando filmes…"
            lines={1}
            posters={8}
          />
        }
      >
        <RecommendationsSection />
      </Suspense>

      {lists.length > 0 && (
        <Section title="Listas">
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {lists.map((list) => (
              <Suspense
                key={list.id}
                fallback={<ListCard list={list} loading />}
              >
                <FullListCard list={list} />
              </Suspense>
            ))}
          </div>
        </Section>
      )}
    </>
  )
}

export default async function LetterboxdPage() {
  const feed = await loadFeed()

  return (
    <div className="flex min-h-screen flex-col">
      <ThemeBackdrop />
      <main className="mx-auto w-full max-w-6xl space-y-4 px-4 py-8">
        <Hero feed={feed} />

        {feed ? (
          <FeedView feed={feed} />
        ) : (
          <>
            <Section title="Não deu para carregar o feed">
              <p className="text-sm text-slate-400">
                O Letterboxd não respondeu agora. Tente de novo em alguns
                minutos.
              </p>
            </Section>
            <Suspense
              fallback={
                <SectionSkeleton title="Watchlist" lines={1} posters={16} />
              }
            >
              <WatchlistSection />
            </Suspense>
          </>
        )}
      </main>
    </div>
  )
}
