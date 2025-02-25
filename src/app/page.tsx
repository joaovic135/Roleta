/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

import React, { useState, useEffect, useRef } from 'react'
import RoletaMain from './components/RoletaMain'
import RoletaAlt from './components/RoletaAlt'
import { MovieSearch } from './components/MovieSearch'
import { Movie } from './utils/tmdbApi'

const Home: React.FC = () => {
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null)

  return (
    <div className="flex h-fit min-h-fit flex-col bg-gray-100 py-8">
      <MovieSearch
        selectedMovie={selectedMovie}
        setSelectedMovie={setSelectedMovie}
      />
      <RoletaMain
        selectedMovie={selectedMovie}
        setSelectedMovie={setSelectedMovie}
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
