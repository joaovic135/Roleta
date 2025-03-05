import { Movie } from '@/app/utils/tmdbApi'
import Image from 'next/image'

interface SearchBarProps {
  query: string
  loading: boolean
  error: string | null
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  searchBarRef: React.RefObject<HTMLDivElement | null>
}

function SearchBar({
  query,
  loading,
  error,
  handleInputChange,
  searchBarRef,
}: SearchBarProps) {
  return (
    <div ref={searchBarRef} className="mb-2">
      <h1 className="mb-6 text-center text-2xl font-bold">Buscar Filmes</h1>

      <div className="flex w-full">
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          placeholder="Digite o nome do filme"
          className="flex-grow rounded-l border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="flex items-center rounded-r bg-blue-500 px-4 py-2 text-white">
          {loading ? (
            <span className="inline-block animate-pulse">Buscando...</span>
          ) : (
            <span>Buscar</span>
          )}
        </div>
      </div>

      {error && <p className="mt-2 text-center text-red-500">{error}</p>}
    </div>
  )
}

interface MovieCardProps {
  movie: Movie
  onSelect: (movie: Movie) => void
}

function MovieCard({ movie, onSelect }: MovieCardProps) {
  const { title, poster_path, vote_average, release_date, overview } = movie
  return (
    <button
      onClick={() => onSelect(movie)}
      className="mb-3 flex w-full overflow-hidden rounded-lg border bg-white text-left shadow-sm transition-shadow last:mb-0 hover:bg-blue-50 hover:shadow-md"
    >
      <div className="relative h-28 w-20 flex-shrink-0">
        {poster_path ? (
          <Image
            src={`https://image.tmdb.org/t/p/w200${poster_path}`}
            alt={title}
            layout="fill"
            objectFit="cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gray-200 text-xs text-gray-500">
            Sem imagem
          </div>
        )}
      </div>

      <div className="flex-grow p-3">
        <h2 className="mb-1 text-base font-bold">{title}</h2>
        <p className="text-xs text-gray-600">
          {release_date || 'Data não informada'} • Avaliação: {vote_average}/10
        </p>
        {overview && (
          <p className="mt-1 line-clamp-2 text-xs text-gray-700">{overview}</p>
        )}
      </div>
    </button>
  )
}

interface PaginationProps {
  currentPage: number
  totalPages: number
  setCurrentPage: (page: number) => void
}

function Pagination({
  currentPage,
  totalPages,
  setCurrentPage,
}: PaginationProps) {
  return (
    <div className="sticky bottom-0 z-20 flex items-center justify-between border-t bg-gray-50 p-3">
      <button
        onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
        disabled={currentPage === 1}
        className="rounded border px-3 py-1 text-sm disabled:opacity-50"
      >
        Anterior
      </button>

      <span className="text-sm text-gray-600">
        Página {currentPage} de {totalPages}
      </span>

      <button
        onClick={() => setCurrentPage(Math.min(currentPage + 1, totalPages))}
        disabled={currentPage === totalPages}
        className="rounded border px-3 py-1 text-sm disabled:opacity-50"
      >
        Próxima
      </button>
    </div>
  )
}

interface Props {
  query: string
  loading: boolean
  error: string | null
  isOpen: boolean
  movies: Movie[]
  currentMovies: Movie[]
  currentPage: number
  totalPages: number
  searchBarRef: React.RefObject<HTMLDivElement | null>
  dropdownRef: React.RefObject<HTMLDivElement | null>
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleSelectMovie: (movie: Movie) => void
  setIsOpen: (isOpen: boolean) => void
  setCurrentPage: (page: number) => void
}

export function MovieSearch({
  query,
  loading,
  error,
  isOpen,
  movies,
  currentMovies,
  currentPage,
  totalPages,
  searchBarRef,
  dropdownRef,
  handleInputChange,
  handleSelectMovie,
  setIsOpen,
  setCurrentPage,
}: Props) {
  return (
    <div className="relative mx-auto w-full max-w-4xl p-4">
      <SearchBar
        query={query}
        loading={loading}
        error={error}
        handleInputChange={handleInputChange}
        searchBarRef={searchBarRef}
      />

      {isOpen && movies.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute left-0 right-0 top-full mt-1 max-h-96 w-full overflow-hidden rounded-lg border bg-white shadow-lg"
          style={{ zIndex: 50 }}
        >
          <div className="sticky top-0 z-20 border-b bg-gray-50">
            <div className="flex items-center justify-between p-3">
              <p className="text-gray-600">
                Encontrados {movies.length} filmes para &quot;{query}&quot;
              </p>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto">
            <div className="p-2">
              {currentMovies.map((movie) => (
                <MovieCard
                  key={movie.id}
                  movie={movie}
                  onSelect={handleSelectMovie}
                />
              ))}
            </div>
          </div>

          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              setCurrentPage={setCurrentPage}
            />
          )}
        </div>
      )}
    </div>
  )
}
