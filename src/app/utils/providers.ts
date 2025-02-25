import { WatchProvidersResponse } from '../types'
import axios from 'axios'

const API_KEY = '3dbafbbafa6d857123c4fe7862fc09fe'
const BASE_URL = 'https://api.themoviedb.org/3'

export async function getMovieWatchProviders(
  movieId: number,
): Promise<WatchProvidersResponse> {
  try {
    const response = await axios.get(
      `${BASE_URL}/movie/${movieId}/watch/providers`,
      {
        params: {
          api_key: API_KEY,
        },
      },
    )
    return response.data
  } catch (error) {
    console.error('Erro ao buscar watch providers:', error)
    throw error
  }
}
