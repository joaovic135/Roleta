import { useState, useEffect } from 'react'
import { Movie, MovieWithWatchProviders } from '@/app/utils/tmdbApi'

const CONFIRMATION_TIMEOUT = 3000
const SELECTION_TIMEOUT = 1000

export function useMovieSelection(
  onMovieSelect: (movie: MovieWithWatchProviders) => void,
) {
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null)
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false)

  const handleMovieSelect = (movie: MovieWithWatchProviders) => {
    setSelectedMovie(movie)
    onMovieSelect(movie)
    setShowConfirmation(true)
  }

  useEffect(() => {
    if (showConfirmation) {
      const timer = setTimeout(() => {
        setShowConfirmation(false)
      }, CONFIRMATION_TIMEOUT)
      return () => clearTimeout(timer)
    }
  }, [showConfirmation])

  useEffect(() => {
    if (selectedMovie) {
      const timer = setTimeout(() => {
        setSelectedMovie(null)
      }, SELECTION_TIMEOUT)
      return () => clearTimeout(timer)
    }
  }, [selectedMovie])

  return {
    handleMovieSelect,
  }
}
