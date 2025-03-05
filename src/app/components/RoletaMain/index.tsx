/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

import React, { useState, useEffect, useRef } from 'react'
import Head from 'next/head'
import RouletteWheel from '../RouletteWheel'
import SpinControl from '../SpinControl'
import OptionsEditor from '../OptionsEditor'
import SegmentsControl from '../SegmentsControl'
import WinnerDialog from '../WinnerDialog'
import Cookies from 'js-cookie'
import { RouletteOption, WatchProvider } from '@/app/types'
import { generateRandomColor } from '@/app/utils/colors'
import { Movie, MovieWithWatchProviders } from '@/app/utils/tmdbApi'

interface RoletaMainProps {
  selectedMovie: Movie | null
  setSelectedMovie: (movie: Movie | null) => void
  options: RouletteOption[]
  setOptions: React.Dispatch<React.SetStateAction<RouletteOption[]>>
  textInput: string
  setTextInput: React.Dispatch<React.SetStateAction<string>>
  selectedMovies: MovieWithWatchProviders[]
  handleRemoveMovie: (movie: Movie) => void
  watchProviders: WatchProvider[]
}

export function RoletaMain({
  selectedMovie,
  setSelectedMovie,
  options,
  setOptions,
  textInput,
  setTextInput,
  selectedMovies,
  handleRemoveMovie,
  watchProviders,
}: RoletaMainProps) {
  const [isSpinning, setIsSpinning] = useState<boolean>(false)
  const [spinTime, setSpinTime] = useState<number>(15)
  const [spinDegrees, setSpinDegrees] = useState<number>(0)
  const [segmentsPerOption, setSegmentsPerOption] = useState<number>(3)
  const [winner, setWinner] = useState<RouletteOption | null>(null)
  const [showWinnerDialog, setShowWinnerDialog] = useState<boolean>(false)

  const [isMuted, setIsMuted] = useState(false)
  const [volume, setVolume] = useState(0.2)

  useEffect(() => {
    try {
      Cookies.set('rouletteOptions', JSON.stringify(options), {
        expires: 365,
        path: '/',
        sameSite: 'strict',
      })
    } catch (e) {
      console.error('Error saving options to cookie:', e)
    }
  }, [options])

  useEffect(() => {
    if (selectedMovie) {
      let displayTitle = selectedMovie.title

      // Create abbreviation if title is longer than 15 characters
      if (selectedMovie.title.length > 15) {
        displayTitle = selectedMovie.title
          .split(' ')
          .map((word) => word.charAt(0))
          .join('')
          .toUpperCase()
      }

      const movieOption: RouletteOption = {
        text: displayTitle,
        color: generateRandomColor(),
        quantity: 1,
      }

      // Check if movie already exists in options
      const movieExists = options.some(
        (option) =>
          option.text === displayTitle || option.text === selectedMovie.title,
      )

      if (!movieExists) {
        setOptions((prev) => [...prev, movieOption])
        setTextInput((prev) => prev + displayTitle + '\n')
      }
    }
  }, [selectedMovie])

  // Processa o texto de entrada para criar as opções da roleta

  const spinningAudio = useRef<HTMLAudioElement | null>(null)
  const winnerAudio = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    // Create audio elements when component mounts
    spinningAudio.current = new Audio('/spinning-sound.mp3')
    winnerAudio.current = new Audio('/winner.mp3')

    spinningAudio.current.loop = true
    // Set initial volume for both audio elements
    spinningAudio.current.volume = volume
    winnerAudio.current.volume = volume
    spinningAudio.current.muted = isMuted
    winnerAudio.current.muted = isMuted

    // Cleanup on unmount
    return () => {
      if (spinningAudio.current) {
        spinningAudio.current.pause()
        spinningAudio.current = null
      }
      if (winnerAudio.current) {
        winnerAudio.current.pause()
        winnerAudio.current = null
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (spinningAudio.current) {
      spinningAudio.current.volume = volume
    }
    if (winnerAudio.current) {
      winnerAudio.current.volume = volume
    }
  }, [volume])

  useEffect(() => {
    if (spinningAudio.current) {
      spinningAudio.current.muted = isMuted
    }
    if (winnerAudio.current) {
      winnerAudio.current.muted = isMuted
    }
  }, [isMuted])

  const processTextInput = (text: string) => {
    const lines = text.split('\n').filter((line) => line.trim() !== '')

    const newOptions: RouletteOption[] = lines.map((line) => {
      // Procura por uma opção existente com o mesmo texto
      const existingOption = options.find((opt) => opt.text === line)
      return {
        text: line,
        color: existingOption?.color || generateRandomColor(),
        quantity: existingOption?.quantity || 1,
      }
    })

    setOptions(newOptions)
  }

  // Atualiza a quantidade de aparições de uma opção
  const updateQuantity = (index: number, newQuantity: number) => {
    const newOptions = [...options]
    newOptions[index].quantity = Math.max(1, newQuantity)
    setOptions(newOptions)
  }

  const removeOption = (optionToRemove: RouletteOption) => {
    const newOptions = options.filter(
      (option) => option.text !== optionToRemove.text,
    )
    setOptions(newOptions)

    // Atualiza também o texto de entrada
    const newTextInput = newOptions.map((option) => option.text).join('\n')
    setTextInput(newTextInput)
  }

  // Gira a roleta
  const spinRoulette = () => {
    if (isSpinning) return
    setIsSpinning(true)
    setShowWinnerDialog(false)

    if (spinningAudio.current) {
      spinningAudio.current.currentTime = 0
      spinningAudio.current.play()
    }

    const expandedOptions: RouletteOption[] = []
    options.forEach((option) => {
      for (let i = 0; i < option.quantity; i++) {
        expandedOptions.push(option)
      }
    })

    if (expandedOptions.length === 1) {
      return Array(segmentsPerOption).fill(expandedOptions[0])
    }

    const segments: RouletteOption[] = []

    for (let segmentSet = 0; segmentSet < segmentsPerOption; segmentSet++) {
      for (let i = 0; i < expandedOptions.length; i++) {
        segments.push(expandedOptions[i])
      }
    }

    if (segments.length === 0) return

    // Calcular a rotação final
    const segmentSize = 360 / (options.length * segmentsPerOption)

    // Variáveis de controle da animação
    // Variáveis de controle da animação
    let startTime: number | null = null
    const initialSpeed = spinTime < 5 ? 10 : 20 // Velocidade inicial aleatória entre 20 e 30
    let currentRotation = Math.random() * 360 // Rotação inicial aleatória

    // Número aleatório de rotações completas (entre 5 e 10)
    const minRotations = 5
    const maxRotations = 10
    const targetRotations =
      minRotations + Math.floor(Math.random() * (maxRotations - minRotations))
    const minTotalRotation = targetRotations * 360 + Math.random() * 360

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const elapsedTime = timestamp - startTime

      // Fator de desaceleração exponencial com componente aleatório
      // const spinTimeMs = spinTime * 1000
      // const baseDeceleration = 3000 + Math.random() * 1000
      // const baseDeceleration = spinTimeMs / 3 + Math.random() * (spinTimeMs / 2) - nao usar

      // const decelerationFactor = Math.exp(-elapsedTime / baseDeceleration)

      // Fator de desaceleração exponencial inversamente proporcional ao spinTime
      const spinTimeMultiplier = spinTime * 150 // Diferença mais agressiva
      const baseDeceleration = 1000 + spinTimeMultiplier

      const decelerationFactor = Math.exp(-elapsedTime / baseDeceleration)

      // Velocidade atual sem componente aleatório
      const currentSpeed = initialSpeed * decelerationFactor
      // Atualiza a rotação
      currentRotation += currentSpeed
      setSpinDegrees(currentRotation)

      // Condição de parada: quando a velocidade for menor que 0.1% da inicial
      if (currentSpeed > 0.01) {
        //escolhe quando vai parar a roleta
        requestAnimationFrame(animate)
      } else {
        // Finaliza a animação
        setIsSpinning(false)

        // Calcular o ângulo final real
        const finalAngle = currentRotation % 360 // Normaliza para um valor entre 0 e 360
        const normalizedAngle = (360 - finalAngle) % 360 // Ajusta para a direção correta

        // Calcular o segmento vencedor
        const winningSegmentIndex = Math.floor(normalizedAngle / segmentSize)
        const winningOption = options[winningSegmentIndex % options.length]

        if (winningOption) {
          setWinner(winningOption)
          setTimeout(() => {
            if (spinningAudio.current) {
              spinningAudio.current.pause()
            }

            setShowWinnerDialog(true)
            if (winnerAudio.current) {
              winnerAudio.current.currentTime = 0
              winnerAudio.current.play()
            }
          }, 1000)
        }
      }
    }

    // Inicia a animação
    requestAnimationFrame(animate)
  }
  // Processa o texto de entrada quando ele muda
  useEffect(() => {
    processTextInput(textInput)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [textInput])

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <Head>
        <title>Roleta Principal</title>
        <meta name="description" content="Roleta interativa em React/Next.js" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="container mx-auto px-4">
        <h1 className="mb-8 text-center text-3xl font-bold">
          Roleta Principal
        </h1>

        <div className="mb-4 flex items-center gap-2">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="rounded-full bg-gray-200 p-2"
          >
            {isMuted ? '🔇' : '🔊'}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="h-2 w-24 cursor-pointer appearance-none rounded-lg bg-gray-200"
          />
        </div>

        <div className="flex flex-col gap-8 md:flex-row">
          {/* Seção da Roleta */}
          <div className="flex flex-1 flex-col items-center rounded-lg bg-white p-6 shadow-lg">
            <RouletteWheel
              options={options}
              spinDegrees={spinDegrees}
              pointerColor="#e11d48"
              pointerSize="md"
              segmentsPerOption={segmentsPerOption}
            />

            <div className="mb-2 mt-4 w-full">
              <SegmentsControl
                segmentsPerOption={segmentsPerOption}
                setSegmentsPerOption={setSegmentsPerOption}
              />
            </div>

            <SpinControl
              spinTime={spinTime}
              setSpinTime={setSpinTime}
              spinRoulette={spinRoulette}
              isSpinning={isSpinning}
              hasOptions={options.length > 0}
            />
          </div>

          {/* Seção de Configuração */}
          <OptionsEditor
            textInput={textInput}
            setTextInput={setTextInput}
            options={options}
            updateQuantity={updateQuantity}
            selectedMovies={selectedMovies}
            handleRemoveMovie={handleRemoveMovie}
            watchProviders={watchProviders}
          />

          <WinnerDialog
            isOpen={showWinnerDialog}
            winner={winner}
            onClose={() => setShowWinnerDialog(false)}
            onRemoveOption={removeOption}
          />
        </div>
      </main>
    </div>
  )
}

export default RoletaMain
