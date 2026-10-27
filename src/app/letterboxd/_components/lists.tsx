import { LetterboxdList } from '@/app/utils/letterboxd'
import { getFullList } from '@/app/utils/letterboxdScrape'
import { ListCardFilm, ListCardView } from './list-card'

// Passa ao cliente só os campos que o card mostra; carregando, nem leva os
// filmes do RSS, que viriam de novo na lista completa
export function ListCard({
  list,
  films = list.films,
  complete = false,
  loading = false,
}: {
  list: LetterboxdList
  films?: ListCardFilm[]
  complete?: boolean
  loading?: boolean
}) {
  return (
    <ListCardView
      list={{
        title: list.title,
        link: list.link,
        description: list.description,
        ranked: list.ranked,
      }}
      films={
        loading
          ? []
          : films.map(({ title, link, year }) =>
              year ? { title, link, year } : { title, link },
            )
      }
      total={complete ? films.length : list.films.length + list.more}
      more={complete ? 0 : list.more}
      loading={loading}
    />
  )
}

// O RSS corta a lista em 10 filmes; a página da lista tem todos
export async function FullListCard({ list }: { list: LetterboxdList }) {
  const full = await getFullList(list.link).catch(() => null)
  return full?.films.length ? (
    <ListCard list={list} films={full.films} complete />
  ) : (
    <ListCard list={list} />
  )
}
