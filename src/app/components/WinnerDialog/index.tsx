'use client'

import { RouletteOption } from '@/app/types'
import React, { useEffect, useRef } from 'react'
import { useReward } from 'react-rewards'

interface WinnerDialogProps {
  isOpen: boolean
  winner: RouletteOption | null
  onClose: () => void
  onRemoveOption: (option: RouletteOption) => void
}

const WinnerDialog: React.FC<WinnerDialogProps> = ({
  isOpen,
  winner,
  onClose,
  onRemoveOption,
}) => {
  const hasPlayedAnimation = useRef(false)

  const { reward } = useReward('rewardId', 'confetti', {
    elementCount: 200,
    spread: 60,
    startVelocity: 35,
  })

  useEffect(() => {
    if (!isOpen) {
      hasPlayedAnimation.current = false
    }
  }, [isOpen])

  useEffect(() => {
    if (isOpen && winner && !hasPlayedAnimation.current) {
      reward()
      hasPlayedAnimation.current = true
    }
  }, [isOpen, winner, reward])

  if (!isOpen || !winner) return null

  const handleRemove = () => {
    onRemoveOption(winner)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div
        className="relative max-w-md rounded-lg bg-white p-6 shadow-xl"
        style={{ borderLeft: `8px solid ${winner.color}` }}
      >
        <span
          id="rewardId"
          className="absolute left-1/2 top-0 -translate-x-1/2"
        />

        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
        <h2 className="mb-4 text-2xl font-bold">Parabéns!</h2>
        <div className="mb-6">
          <div className="mb-2 text-xl font-semibold">O vencedor é:</div>
          <div
            className="rounded-md p-4 text-center text-xl"
            style={{ backgroundColor: `${winner.color}30` }}
          >
            {winner.text}
          </div>
        </div>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="rounded-md border border-gray-300 px-4 py-2 hover:bg-gray-100"
          >
            Fechar
          </button>
          <button
            onClick={handleRemove}
            className="rounded-md bg-rose-600 px-4 py-2 text-white hover:bg-rose-700"
          >
            Remover da Lista
          </button>
        </div>
      </div>
    </div>
  )
}

export default WinnerDialog
