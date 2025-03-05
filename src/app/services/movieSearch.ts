import {
  Movie,
  MovieWithWatchProviders,
  searchMovies,
} from '@/app/utils/tmdbApi'
import { WatchProvider, WatchProvidersResponse } from '@/app/types'
import { getMovieWatchProviders } from '@/app/utils/providers'

/**
 * Searches for movies based on the provided query string
 */
export async function searchMoviesService(query: string): Promise<Movie[]> {
  const hasValidQuery = query.trim().length > 0

  if (!hasValidQuery) return []

  return await searchMovies(query)
}

/**
 * Extracts streaming providers from provider data with region-specific fallback
 */
function extractStreamingProviders(
  providersData: WatchProvidersResponse,
  region: string = 'BR',
): WatchProvider[] {
  return providersData.results[region]?.flatrate || []
}

/**
 * Fetches and adds watch providers to a movie
 */
export async function getMovieWithProviders(movie: Movie): Promise<{
  movieWithProviders: MovieWithWatchProviders
}> {
  try {
    const providersData = await getMovieWatchProviders(movie.id)
    const streamingProviders = extractStreamingProviders(providersData)

    return {
      movieWithProviders: {
        ...movie,
        watchProviders: streamingProviders,
      },
    }
  } catch (error) {
    console.error('Error fetching watch providers:', error)
    return {
      movieWithProviders: {
        ...movie,
        watchProviders: [],
      },
    }
  }
}

export function isMovieAlreadySelected(
  movie: Movie,
  selectedMovies: Movie[],
): boolean {
  return selectedMovies.some((selectedMovie) => selectedMovie.id === movie.id)
}
