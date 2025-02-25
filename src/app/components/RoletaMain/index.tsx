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
import { RouletteOption } from '@/app/types'
import { generateRandomColor } from '@/app/utils/colors'

const RoletaMain: React.FC = () => {
  const [options, setOptions] = useState<RouletteOption[]>(() => {
    // Try to load options from cookies on initial render
    const savedOptions = Cookies.get('rouletteOptions')
    console.log('Loading saved options:', savedOptions) // Debug log

    if (savedOptions) {
      try {
        const parsed = JSON.parse(savedOptions)
        console.log('Parsed options:', parsed) // Debug log
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

  const [isSpinning, setIsSpinning] = useState<boolean>(false)
  const [spinTime, setSpinTime] = useState<number>(15)
  const [spinDegrees, setSpinDegrees] = useState<number>(0)
  const [segmentsPerOption, setSegmentsPerOption] = useState<number>(3)
  const [winner, setWinner] = useState<RouletteOption | null>(null)
  const [showWinnerDialog, setShowWinnerDialog] = useState<boolean>(false)

  const [isMuted, setIsMuted] = useState(false)
  const [volume, setVolume] = useState(0.2)

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

  useEffect(() => {
    try {
      console.log('Saving options to cookie:', options) // Debug log
      Cookies.set('rouletteOptions', JSON.stringify(options), {
        expires: 365,
        path: '/',
        sameSite: 'strict',
      })
    } catch (e) {
      console.error('Error saving options to cookie:', e)
    }
  }, [options])

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

  const determineWinner = () => {
    // Cria um array com todas as opções expandidas conforme a quantidade
    const expandedOptions: RouletteOption[] = []
    options.forEach((option) => {
      for (let i = 0; i < option.quantity * segmentsPerOption; i++) {
        expandedOptions.push(option)
      }
    })

    if (expandedOptions.length === 0) return null

    // Calcula o ângulo final (normalizado para 0-360)
    const finalAngle = spinDegrees % 360

    // Calcula o tamanho de cada segmento em graus
    const segmentSize = 360 / expandedOptions.length

    // Determina qual segmento foi selecionado
    // A roleta gira no sentido horário, então ajustamos o cálculo
    // 360 - finalAngle para inverter a direção e ajustar para o indicador no topo
    const normalizedAngle = (360 - finalAngle) % 360
    const winningIndex = Math.floor(normalizedAngle / segmentSize)

    return expandedOptions[winningIndex] || expandedOptions[0]
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

    // Start playing the sound
    if (spinningAudio.current) {
      spinningAudio.current.currentTime = 0
      spinningAudio.current.play()
    }

    // Aumentando MUITO o número de rotações iniciais
    // Agora vai girar entre 60 e 70 voltas completas (21600-25200 graus)
    // Isso cria uma sensação de velocidade muito maior no início
    const randomDegree = Math.floor(Math.random() * 10000) + 4000
    setSpinDegrees(spinDegrees + randomDegree)

    // Reduzindo o tempo total mas mantendo a desaceleração dramática
    setTimeout(() => {
      setIsSpinning(false)

      if (spinningAudio.current) {
        spinningAudio.current.pause()
      }

      // Determina o vencedor e exibe o diálogo
      const winningOption = determineWinner()
      setWinner(winningOption)
      if (winningOption) {
        setShowWinnerDialog(true)
        // Play winner sound
        if (winnerAudio.current) {
          winnerAudio.current.currentTime = 0
          winnerAudio.current.play()
        }
      }
    }, spinTime * 1200)
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
              isSpinning={isSpinning}
              spinTime={spinTime}
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
