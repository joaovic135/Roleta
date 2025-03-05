import axios from 'axios'
import { WatchProvider } from '../types'

const API_KEY = '3dbafbbafa6d857123c4fe7862fc09fe'
const BASE_URL = 'https://api.themoviedb.org/3'

export interface Movie {
  id: number
  title: string
  overview: string
  poster_path: string | null
  release_date: string
  vote_average: number
  vote_count: number
  popularity: number
  original_title: string
  original_language: string
  genre_ids: number[]
  backdrop_path: string | null
  adult: boolean
}

export interface MovieWithWatchProviders extends Movie {
  watchProviders: WatchProvider[]
}

export async function searchMovies(query: string): Promise<Movie[]> {
  try {
    const response = await axios.get(`${BASE_URL}/search/movie`, {
      params: {
        api_key: API_KEY,
        query: query,
      },
    })

    return response.data.results
  } catch (error) {
    console.error('Erro ao buscar filmes:', error)
    return []
  }
}
