import React from 'react'

interface SpinControlProps {
  spinTime: number
  setSpinTime: (time: number) => void
  spinRoulette: () => void
  isSpinning: boolean
  hasOptions: boolean
}

const SpinControl: React.FC<SpinControlProps> = ({
  spinTime,
  setSpinTime,
  spinRoulette,
  isSpinning,
  hasOptions,
}) => {
  return (
    <div className="mt-6 flex w-full flex-col gap-4">
      <div className="flex items-center justify-between">
        <label htmlFor="spinTime" className="text-sm font-medium">
          Tempo de Giro (segundos): {spinTime}
        </label>
        <input
          type="range"
          id="spinTime"
          min="1"
          max="15"
          value={spinTime}
          onChange={(e) => setSpinTime(parseInt(e.target.value))}
          className="h-2 w-2/3 cursor-pointer appearance-none rounded-lg bg-gray-200"
        />
      </div>

      <button
        onClick={spinRoulette}
        disabled={isSpinning || !hasOptions}
        className={`w-full rounded-lg py-3 font-bold text-white transition-colors ${
          isSpinning || !hasOptions
            ? 'cursor-not-allowed bg-gray-400'
            : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        {isSpinning ? 'Girando...' : 'Girar Roleta'}
      </button>
    </div>
  )
}

export default SpinControl
