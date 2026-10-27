import {
  MAX_SEGMENTS_PER_OPTION,
  MIN_SEGMENTS_PER_OPTION,
} from '@/app/utils/wheel'
import React from 'react'

interface SegmentsControlProps {
  segmentsPerOption: number
  setSegmentsPerOption: (num: number) => void
  auto: boolean
  setAuto: (auto: boolean) => void
  disabled?: boolean
}

const SegmentsControl: React.FC<SegmentsControlProps> = ({
  segmentsPerOption,
  setSegmentsPerOption,
  auto,
  setAuto,
  disabled,
}) => {
  // Mexer no − / + sai do automático a partir do valor atual
  const set = (value: number) => {
    setSegmentsPerOption(
      Math.min(
        MAX_SEGMENTS_PER_OPTION,
        Math.max(MIN_SEGMENTS_PER_OPTION, value),
      ),
    )
    if (auto) setAuto(false)
  }

  return (
    <div
      title="Fatias por opção na roda. Auto: menos opções, mais fatias"
      className="flex items-center justify-between gap-3 lg:flex-col lg:items-start lg:justify-start lg:gap-2"
    >
      <div>
        <p className="text-sm font-medium text-slate-200">Repetições</p>
        <p className="text-xs text-slate-400">
          {auto
            ? 'Automático: menos opções, mais fatias'
            : 'Fatias por opção na roda'}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setAuto(!auto)}
          disabled={disabled}
          aria-pressed={auto}
          title="Ajustar as fatias pela quantidade de opções"
          className={`h-9 rounded-lg px-2.5 text-xs font-semibold transition disabled:opacity-40 ${
            auto
              ? 'bg-amber-400 text-slate-950 hover:bg-amber-300'
              : 'border border-white/10 text-slate-300 hover:bg-white/10'
          }`}
        >
          Auto
        </button>
        <div className="flex items-center overflow-hidden rounded-lg border border-white/10 bg-white/5">
          <button
            type="button"
            onClick={() => set(segmentsPerOption - 1)}
            disabled={disabled || segmentsPerOption <= MIN_SEGMENTS_PER_OPTION}
            aria-label="Diminuir repetições"
            className="h-9 w-9 text-lg text-slate-300 transition hover:bg-white/10 disabled:opacity-30"
          >
            −
          </button>
          <span
            className={`w-8 text-center font-semibold tabular-nums ${
              auto ? 'text-amber-300' : ''
            }`}
          >
            {segmentsPerOption}
          </span>
          <button
            type="button"
            onClick={() => set(segmentsPerOption + 1)}
            disabled={disabled || segmentsPerOption >= MAX_SEGMENTS_PER_OPTION}
            aria-label="Aumentar repetições"
            className="h-9 w-9 text-lg text-slate-300 transition hover:bg-white/10 disabled:opacity-30"
          >
            +
          </button>
        </div>
      </div>
    </div>
  )
}

export default SegmentsControl
