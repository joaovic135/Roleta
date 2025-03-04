import { Movie } from '@/app/utils/tmdbApi'
import { useRef } from 'react'
import { MovieSearch } from '../components/MovieSearch'
import { useMovieSearch } from '../hooks/useMovieSearch'
import { useMovieSelection } from '../hooks/useMovieSelection'
import { useClickOutside } from '../hooks/useClickOutside'
import { getPaginatedItems } from '../helpers'

const MOVIES_PER_PAGE = 5

interface MovieSearchContainerProps {
  selectedMovies: Movie[]
  onMovieSelect: (movie: Movie) => void
}

export function MovieSearchContainer({
  selectedMovies,
  onMovieSelect,
}: MovieSearchContainerProps) {
  const dropdownRef = useRef<HTMLDivElement>(null)
  const searchBarRef = useRef<HTMLDivElement>(null)

  const { handleMovieSelect } = useMovieSelection(onMovieSelect)

  const {
    query,
    movies,
    isLoading: loading,
    errorMessage: error,
    currentPage,
    isDropdownOpen: isOpen,
    setCurrentPage,
    setIsDropdownOpen: setIsOpen,
    handleInputChange,
    handleSelectMovie,
  } = useMovieSearch(handleMovieSelect, selectedMovies)

  useClickOutside([dropdownRef, searchBarRef], () => setIsOpen(false))

  const { currentItems: currentMovies, totalPages } = getPaginatedItems(
    movies,
    currentPage,
    MOVIES_PER_PAGE,
  )

  return (
    <MovieSearch
      query={query}
      loading={loading}
      error={error}
      isOpen={isOpen}
      movies={movies}
      currentMovies={currentMovies}
      currentPage={currentPage}
      totalPages={totalPages}
      searchBarRef={searchBarRef}
      dropdownRef={dropdownRef}
      handleInputChange={handleInputChange}
      handleSelectMovie={handleSelectMovie}
      setIsOpen={setIsOpen}
      setCurrentPage={setCurrentPage}
    />
  )
}
