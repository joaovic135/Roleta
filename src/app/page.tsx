/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

import Cookies from 'js-cookie'
import React, { useState, useEffect, useRef } from 'react'
import RoletaMain from './components/RoletaMain'
import RoletaAlt from './components/RoletaAlt'
import { MovieSearch } from './components/MovieSearch'
import { Movie, MovieWithWatchProviders } from './utils/tmdbApi'
import { RouletteOption, WatchProvider } from './types'
import { MovieSearchContainer } from './containers/MovieSearchContainer'

const Home: React.FC = () => {
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null)
  const [watchProviders, setWatchProviders] = useState<WatchProvider[]>([])
  const [selectedMovies, setSelectedMovies] = useState<
    MovieWithWatchProviders[]
  >([])
  const [options, setOptions] = useState<RouletteOption[]>(() => {
    // Try to load options from cookies on initial render
    const savedOptions = Cookies.get('rouletteOptions')

    if (savedOptions) {
      try {
        const parsed = JSON.parse(savedOptions)
        return parsed
      } catch (e) {
        console.error('Error parsing saved options:', e)
        return [
          { text: 'Opção 1', color: '#FF6B6B', quantity: 1 },
          { text: 'Opção 2', color: '#4ECDC4', quantity: 1 },
          { text: 'Opção 3', color: '#FFD166', quantity: 1 },
        ]
      }
    }
    // Default options if nothing is saved
    return [
      { text: 'Opção 1', color: '#FF6B6B', quantity: 1 },
      { text: 'Opção 2', color: '#4ECDC4', quantity: 1 },
      { text: 'Opção 3', color: '#FFD166', quantity: 1 },
    ]
  })

  const [textInput, setTextInput] = useState<string>(() => {
    const savedOptions = Cookies.get('rouletteOptions')
    if (savedOptions) {
      try {
        const parsed = JSON.parse(savedOptions)
        return parsed.map((opt: RouletteOption) => opt.text).join('\n')
      } catch (e) {
        return 'Opção 1\nOpção 2\nOpção 3'
      }
    }
    return 'Opção 1\nOpção 2\nOpção 3'
  })

  const handleSelectMovie = (movie: MovieWithWatchProviders) => {
    setSelectedMovies((prev) => [...prev, movie])
    setTextInput((prev) => (prev ? `${prev}\n${movie.title}` : movie.title))
  }

  const handleRemoveMovie = (movieToRemove: Movie) => {
    // Remove from selectedMovies
    setSelectedMovies((prev) => prev.filter((m) => m.id !== movieToRemove.id))

    // Create the same display title logic as when adding
    let displayTitle = movieToRemove.title
    if (movieToRemove.title.length > 15) {
      displayTitle = movieToRemove.title
        .split(' ')
        .map((word) => word.charAt(0))
        .join('')
        .toUpperCase()
    }

    // Remove from options - checking both full title and abbreviated version
    setOptions((prev) =>
      prev.filter(
        (option) =>
          option.text !== movieToRemove.title && option.text !== displayTitle,
      ),
    )

    // Remove from textInput - handle both full title and abbreviated version
    setTextInput((prev) => {
      const lines = prev.split('\n')
      return lines
        .filter(
          (line) =>
            line.trim() !== movieToRemove.title && line.trim() !== displayTitle,
        )
        .join('\n')
    })
  }

  return (
    <div className="flex h-fit min-h-fit flex-col bg-gray-100 py-8">
      <MovieSearchContainer
        selectedMovies={selectedMovies}
        onMovieSelect={handleSelectMovie}
      />
      <RoletaMain
        selectedMovie={selectedMovie}
        setSelectedMovie={setSelectedMovie}
        options={options}
        setOptions={setOptions}
        textInput={textInput}
        setTextInput={setTextInput}
        selectedMovies={selectedMovies}
        handleRemoveMovie={handleRemoveMovie}
        watchProviders={watchProviders}
      />
      <RoletaAlt />
      <div className="mt-8 text-center text-sm text-gray-500">
        <p>Created by Joaovic135</p>
        <p>To make life easer in JOGADORES em TREINAMENTO</p>
      </div>{' '}
    </div>
  )
}

export default Home
