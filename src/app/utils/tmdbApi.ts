import axios from 'axios'

const API_KEY = '3dbafbbafa6d857123c4fe7862fc09fe'
const BASE_URL = 'https://api.themoviedb.org/3'

export interface Movie {
  id: number
  title: string
  overview: string
  poster_path: string
  release_date: string
  vote_average: number
}

// Função para buscar filmes
export async function searchMovies(query: string): Promise<Movie[]> {
  try {
    const response = await axios.get(`${BASE_URL}/search/movie`, {
      params: {
        api_key: API_KEY,
        query: query,
      },
    })

    console.log('response:', response.data.results)
    return response.data.results
  } catch (error) {
    console.error('Erro ao buscar filmes:', error)
    return []
  }
}
