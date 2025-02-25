import React from 'react'

interface SegmentsControlProps {
  segmentsPerOption: number
  setSegmentsPerOption: (num: number) => void
}

const SegmentsControl: React.FC<SegmentsControlProps> = ({
  segmentsPerOption,
  setSegmentsPerOption,
}) => {
  return (
    <div className="mb-4 flex items-center justify-between">
      <label htmlFor="segmentsPerOption" className="text-sm font-medium">
        Segmentos por opção: {segmentsPerOption}
      </label>
      <div className="flex items-center">
        <button
          onClick={() =>
            setSegmentsPerOption(Math.max(1, segmentsPerOption - 1))
          }
          className="flex h-8 w-8 items-center justify-center rounded-l-md bg-gray-200"
        >
          -
        </button>
        <input
          id="segmentsPerOption"
          min="1"
          max="10"
          value={segmentsPerOption}
          onChange={(e) =>
            setSegmentsPerOption(Math.max(1, parseInt(e.target.value) || 1))
          }
          className="h-8 w-16 border-y border-gray-300 text-center"
        />
        <button
          onClick={() =>
            setSegmentsPerOption(Math.min(10, segmentsPerOption + 1))
          }
          className="flex h-8 w-8 items-center justify-center rounded-r-md bg-gray-200"
        >
          +
        </button>
      </div>
    </div>
  )
}

export default SegmentsControl
