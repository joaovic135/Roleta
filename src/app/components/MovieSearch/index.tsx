import { WatchProvider } from '@/app/types'
import { getMovieWatchProviders } from '@/app/utils/providers'
import { Movie, searchMovies } from '@/app/utils/tmdbApi'
import Image from 'next/image'
import { useState, useRef, useEffect } from 'react'

interface MovieSearchProps {
  selectedMovie: Movie | null
  setSelectedMovie: (movie: Movie | null) => void
}

export function MovieSearch({
  selectedMovie,
  setSelectedMovie,
}: MovieSearchProps) {
  const [query, setQuery] = useState<string>('')
  const [movies, setMovies] = useState<Movie[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const [watchProviders, setWatchProviders] = useState<WatchProvider[]>([])
  const dropdownRef = useRef<HTMLDivElement>(null)
  const searchBarRef = useRef<HTMLDivElement>(null)
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)
  const moviesPerPage = 5

  // Debounced search function
  const debouncedSearch = (searchTerm: string) => {
    // Clear any existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    // Set a new timer
    debounceTimerRef.current = setTimeout(() => {
      if (searchTerm.trim().length > 0) {
        performSearch(searchTerm)
      } else {
        setMovies([])
        setIsOpen(false)
      }
    }, 300) // 500ms debounce time
  }

  // Perform the actual search
  const performSearch = async (searchTerm: string) => {
    setLoading(true)
    setError(null)
    try {
      const results = await searchMovies(searchTerm)
      setMovies(results)
      setCurrentPage(1)
      setIsOpen(results.length > 0)
    } catch (error) {
      console.error(error)
      setError('Erro ao buscar filmes')
    } finally {
      setLoading(false)
    }
  }

  // Handle movie selection
  const handleSelectMovie = (movie: Movie) => {
    setSelectedMovie(movie)
    setIsOpen(false)
    console.log('Movie selected:', movie) // For debugging
  }

  // Handle input change with debounce
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
    debouncedSearch(value)
  }

  // Clean up timer on component unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        searchBarRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !searchBarRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  useEffect(() => {
    if (selectedMovie) {
      const fetchWatchProviders = async () => {
        try {
          const providersData = await getMovieWatchProviders(selectedMovie.id)
          const brProviders = providersData.results.BR // Filtra para o Brasil (BR)
          if (brProviders && brProviders.flatrate) {
            // Filtra apenas provedores de streaming (flatrate)
            setWatchProviders(brProviders.flatrate)
          } else {
            setWatchProviders([])
          }
        } catch (error) {
          console.error('Erro ao buscar watch providers:', error)
          setWatchProviders([])
        }
      }

      fetchWatchProviders()
    } else {
      setWatchProviders([])
    }
  }, [selectedMovie])

  // Get current movies for pagination
  const indexOfLastMovie = currentPage * moviesPerPage
  const indexOfFirstMovie = indexOfLastMovie - moviesPerPage
  const currentMovies = movies.slice(indexOfFirstMovie, indexOfLastMovie)
  const totalPages = Math.ceil(movies.length / moviesPerPage)

  return (
    <div className="relative mx-auto w-full max-w-4xl p-4">
      {/* Search Bar */}
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

      {/* Selected Movie Display */}
      {selectedMovie && (
        <div className="mt-4 rounded-lg border bg-blue-50 p-4">
          <div className="flex items-center">
            <div className="relative mr-4 h-24 w-16 flex-shrink-0">
              {selectedMovie.poster_path ? (
                <Image
                  src={`https://image.tmdb.org/t/p/w200${selectedMovie.poster_path}`}
                  alt={selectedMovie.title}
                  layout="fill"
                  objectFit="cover"
                  className="rounded"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center rounded bg-gray-200 text-xs text-gray-500">
                  Sem imagem
                </div>
              )}
            </div>
            <div>
              <h3 className="font-bold">Filme Selecionado</h3>
              <p className="text-lg font-medium">{selectedMovie.title}</p>
              <div className="mt-2 flex">
                <button
                  onClick={() => setSelectedMovie(null)}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Alterar seleção
                </button>
              </div>
            </div>
          </div>

          {/* Watch Providers Section */}
          {watchProviders.length > 0 && (
            <div className="mt-4">
              <h4 className="mb-2 font-semibold">Onde assistir:</h4>
              <div className="flex flex-wrap gap-2">
                {watchProviders.map((provider) => (
                  <div
                    key={`${provider.provider_id}-${provider.provider_id}`} // Chave única
                    className="flex items-center rounded-lg border bg-white p-2 shadow-sm"
                  >
                    {provider.logo_path && (
                      <Image
                        src={`https://image.tmdb.org/t/p/w200${provider.logo_path}`}
                        alt={provider.provider_name}
                        width={40}
                        height={40}
                        className="rounded"
                      />
                    )}
                    <span className="ml-2 text-sm">
                      {provider.provider_name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Dropdown results - positioned below search bar */}
      {isOpen && movies.length > 0 && (
        <div
          ref={dropdownRef}
          className="max-h-96 w-full overflow-hidden rounded-lg border bg-white shadow-lg"
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
                <button
                  key={movie.id}
                  onClick={() => handleSelectMovie(movie)}
                  className="mb-3 flex w-full overflow-hidden rounded-lg border bg-white text-left shadow-sm transition-shadow last:mb-0 hover:bg-blue-50 hover:shadow-md"
                >
                  <div className="relative h-28 w-20 flex-shrink-0">
                    {movie.poster_path ? (
                      <Image
                        src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`}
                        alt={movie.title}
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
                    <h2 className="mb-1 text-base font-bold">{movie.title}</h2>
                    <p className="text-xs text-gray-600">
                      {movie.release_date || 'Data não informada'} • Avaliação:{' '}
                      {movie.vote_average}/10
                    </p>
                    {movie.overview && (
                      <p className="mt-1 line-clamp-2 text-xs text-gray-700">
                        {movie.overview}
                      </p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Pagination controls */}
          {totalPages > 1 && (
            <div className="sticky bottom-0 z-20 flex items-center justify-between border-t bg-gray-50 p-3">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="rounded border px-3 py-1 text-sm disabled:opacity-50"
              >
                Anterior
              </button>

              <span className="text-sm text-gray-600">
                Página {currentPage} de {totalPages}
              </span>

              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="rounded border px-3 py-1 text-sm disabled:opacity-50"
              >
                Próxima
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
