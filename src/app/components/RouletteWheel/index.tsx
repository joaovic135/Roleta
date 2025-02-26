/* eslint-disable react-hooks/exhaustive-deps */
import { RouletteOption } from '@/app/types'
import React, { useRef, useEffect } from 'react'
import StylizedPointer from '../StylizedPointer'

interface RouletteWheelProps {
  options: RouletteOption[]
  spinDegrees: number
  pointerColor?: string
  pointerSize?: 'sm' | 'md' | 'lg'
  segmentsPerOption: number // Número de segmentos por opção
}

const RouletteWheel: React.FC<RouletteWheelProps> = ({
  options,
  spinDegrees,
  pointerColor = '#e11d48',
  pointerSize = 'md',
  segmentsPerOption = 1,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const createInterspersedSegments = () => {
    if (options.length === 0) return []

    // Primeiro expandimos as opções baseado na quantidade
    const expandedOptions: RouletteOption[] = []
    options.forEach((option) => {
      for (let i = 0; i < option.quantity; i++) {
        expandedOptions.push(option)
      }
    })

    // Se só temos uma opção, não há como intercalar
    if (expandedOptions.length === 1) {
      return Array(segmentsPerOption).fill(expandedOptions[0])
    }

    // Criamos um array de segmentos intercalados
    const segments: RouletteOption[] = []

    // Repetimos o processo para cada conjunto de segmentos que queremos
    for (let segmentSet = 0; segmentSet < segmentsPerOption; segmentSet++) {
      // Adicionamos cada opção uma vez por conjunto
      for (let i = 0; i < expandedOptions.length; i++) {
        segments.push(expandedOptions[i])
      }
    }

    return segments
  }

  // Desenha a roleta no canvas
  const drawRoulette = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Limpa o canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    const radius = Math.min(centerX, centerY) - 10

    // Obtém os segmentos intercalados
    const segments = createInterspersedSegments()

    // Se não houver segmentos, desenha um círculo vazio
    if (segments.length === 0) {
      ctx.beginPath()
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI)
      ctx.fillStyle = '#f0f0f0'
      ctx.fill()
      ctx.stroke()
      return
    }

    // Calcula o ângulo para cada segmento
    const anglePerSegment = (2 * Math.PI) / segments.length

    // Desenha cada segmento
    segments.forEach((option, index) => {
      const startAngle = index * anglePerSegment
      const endAngle = (index + 1) * anglePerSegment

      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      ctx.arc(centerX, centerY, radius, startAngle, endAngle)
      ctx.closePath()

      ctx.fillStyle = option.color
      ctx.fill()
      ctx.strokeStyle = '#fff'
      ctx.lineWidth = 2
      ctx.stroke()

      // Adiciona o texto
      ctx.save()
      ctx.translate(centerX, centerY)
      ctx.rotate(startAngle + anglePerSegment / 2)
      ctx.textAlign = 'right'
      ctx.fillStyle = '#000'
      ctx.font = '16px Arial'
      ctx.fillText(option.text, radius - 20, 5)
      ctx.restore()
    })

    // Desenha o círculo central
    ctx.beginPath()
    ctx.arc(centerX, centerY, 15, 0, 2 * Math.PI)
    ctx.fillStyle = '#fff'
    ctx.fill()
    ctx.stroke()
  }

  // Atualiza o canvas quando as opções ou o spinner mudam
  useEffect(() => {
    drawRoulette()
  }, [options, spinDegrees, segmentsPerOption])

  return (
    <div className="relative w-full max-w-md">
      <div
        className="relative aspect-square w-full"
        style={{
          transform: `rotate(${spinDegrees}deg)`,
          transition: 'none',
        }}
      >
        <canvas
          ref={canvasRef}
          width={400}
          height={400}
          className="h-full w-full"
        />
      </div>

      {/* Ponteiro estilizado */}
      <StylizedPointer color={pointerColor} size={pointerSize} />
    </div>
  )
}

export default RouletteWheel
