import { useState, useRef, useEffect } from 'react'
import { Movie, MovieWithWatchProviders } from '@/app/utils/tmdbApi'
import {
  searchMoviesService,
  getMovieWithProviders,
} from '../services/movieSearch'

const DEBOUNCE_TIMEOUT = 300
export function useMovieSearch(
  onMovieSelect: (movie: MovieWithWatchProviders) => void,
  selectedMovies: Movie[] = [],
) {
  const [query, setQuery] = useState<string>('')
  const [movies, setMovies] = useState<Movie[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)

  const clearDebounceTimer = () => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
      debounceTimerRef.current = null
    }
  }

  const resetSearchResults = () => {
    setMovies([])
    setIsDropdownOpen(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    setQuery(inputValue)

    clearDebounceTimer()

    debounceTimerRef.current = setTimeout(() => {
      const trimmedValue = inputValue.trim()
      const hasSearchQuery = trimmedValue.length > 0

      if (hasSearchQuery) {
        fetchMovies(trimmedValue)
      } else {
        resetSearchResults()
      }
    }, DEBOUNCE_TIMEOUT)
  }

  const fetchMovies = async (searchTerm: string) => {
    setIsLoading(true)
    setErrorMessage(null)

    try {
      const searchResults = await searchMoviesService(searchTerm)
      setMovies(searchResults)
      setCurrentPage(1)

      const hasSearchResults = searchResults.length > 0
      setIsDropdownOpen(hasSearchResults)
    } catch (error) {
      console.error(error)
      setErrorMessage('Erro ao buscar filmes')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelectMovie = async (movie: Movie) => {
    const isAlreadySelected = selectedMovies.some(
      (selectedMovie) => selectedMovie.id === movie.id,
    )

    if (isAlreadySelected) {
      setErrorMessage('Este filme já está na roleta!')
      return
    }

    setIsLoading(true)

    try {
      const { movieWithProviders } = await getMovieWithProviders(movie)
      onMovieSelect(movieWithProviders)
      setIsDropdownOpen(false)
      setQuery('')
    } catch (error) {
      console.error('Error selecting movie:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    return () => {
      clearDebounceTimer()
    }
  }, [])

  return {
    query,
    movies,
    isLoading,
    errorMessage,
    currentPage,
    isDropdownOpen,
    setCurrentPage,
    setIsDropdownOpen,
    handleInputChange,
    handleSelectMovie,
  }
}
