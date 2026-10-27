import { MAX_SPIN_SECONDS } from '@/app/hooks/useWheelSound'
import React, { useId } from 'react'
import SegmentsControl from '../SegmentsControl'

interface SpinButtonProps {
  spinRoulette: () => void
  isSpinning: boolean
  hasOptions: boolean
}

export const SpinButton: React.FC<SpinButtonProps> = ({
  spinRoulette,
  isSpinning,
  hasOptions,
}) => (
  <button
    type="button"
    onClick={spinRoulette}
    disabled={isSpinning || !hasOptions}
    className="ui-cta group relative w-full shrink-0 overflow-hidden rounded-xl bg-gradient-to-r from-amber-400 via-cta-2 to-cta-3 py-3.5 text-lg font-extrabold uppercase tracking-wider text-slate-950 shadow-lg shadow-cta-2/20 transition hover:brightness-110 active:scale-[0.99] disabled:cursor-not-allowed disabled:from-slate-600 disabled:via-slate-600 disabled:to-slate-600 disabled:text-slate-300 disabled:shadow-none"
  >
    {isSpinning ? 'Girando…' : hasOptions ? 'Girar roleta' : 'Sem opções'}
    {!isSpinning && hasOptions && (
      <kbd className="ml-3 hidden rounded-md bg-slate-950/20 px-2 py-0.5 align-middle text-xs font-semibold normal-case tracking-normal sm:inline">
        Espaço
      </kbd>
    )}
  </button>
)

export interface SpinSettingsProps {
  spinTime: number
  setSpinTime: (time: number) => void
  segmentsPerOption: number
  setSegmentsPerOption: (num: number) => void
  autoSegments: boolean
  setAutoSegments: (auto: boolean) => void
  eliminationMode: boolean
  setEliminationMode: (value: boolean) => void
  isSpinning: boolean
}

// ---- Controles individuais (usados no painel e nos balões do trilho) ----

export const DurationControl: React.FC<
  Pick<SpinSettingsProps, 'spinTime' | 'setSpinTime' | 'isSpinning'>
> = ({ spinTime, setSpinTime, isSpinning }) => {
  const id = useId()
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-2">
        <label
          htmlFor={id}
          className="whitespace-nowrap text-sm font-medium text-slate-200"
        >
          Duração do giro
        </label>
        <span
          title={
            spinTime >= MAX_SPIN_SECONDS
              ? 'Toca a música inteira'
              : 'A música termina junto com a roda'
          }
          className="whitespace-nowrap text-sm font-semibold tabular-nums text-amber-300"
        >
          {spinTime}s{spinTime >= MAX_SPIN_SECONDS && ' ♪'}
        </span>
      </div>
      <input
        type="range"
        id={id}
        min="1"
        max={MAX_SPIN_SECONDS}
        value={spinTime}
        disabled={isSpinning}
        onChange={(e) => setSpinTime(parseInt(e.target.value))}
        className="w-full cursor-pointer accent-amber-400 disabled:opacity-50"
      />
    </div>
  )
}

export const EliminationControl: React.FC<
  Pick<SpinSettingsProps, 'eliminationMode' | 'setEliminationMode'>
> = ({ eliminationMode, setEliminationMode }) => (
  <label className="flex cursor-pointer items-center justify-between gap-3 sm:col-span-2">
    <span className="text-sm font-medium text-slate-200">
      Modo eliminação
      <span className="block text-xs font-normal text-slate-400">
        Remove o vencedor da roleta ao fechar o resultado
      </span>
    </span>
    <input
      type="checkbox"
      checked={eliminationMode}
      onChange={(e) => setEliminationMode(e.target.checked)}
      className="peer sr-only"
    />
    <span className="relative h-6 w-11 shrink-0 rounded-full bg-slate-600 transition after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow after:transition peer-checked:bg-amber-500 peer-checked:after:translate-x-5 peer-focus-visible:ring-2 peer-focus-visible:ring-amber-300" />
  </label>
)

// Painel completo (celular e telas menores; no desktop vira o SpinRail)
const SpinSettings: React.FC<SpinSettingsProps> = (props) => (
  <div className="ui-panel grid gap-4 rounded-xl border border-white/10 bg-white/[0.03] p-4 sm:grid-cols-2">
    <DurationControl {...props} />
    <SegmentsControl
      segmentsPerOption={props.segmentsPerOption}
      setSegmentsPerOption={props.setSegmentsPerOption}
      auto={props.autoSegments}
      setAuto={props.setAutoSegments}
      disabled={props.isSpinning}
    />
    <EliminationControl {...props} />
  </div>
)

export default SpinSettings
