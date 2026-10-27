import React, { useEffect, useRef, useState } from 'react'
import SegmentsControl from '../SegmentsControl'
import {
  DurationControl,
  EliminationControl,
  SpinSettingsProps,
} from '../SpinControl'

type Key = 'duration' | 'slices' | 'elimination'

const Icon = ({ name }: { name: Key }) => {
  const common = {
    width: 22,
    height: 22,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
  }
  if (name === 'duration')
    // cronômetro
    return (
      <svg {...common}>
        <circle cx="12" cy="13" r="8" />
        <path d="M12 9v4l2.5 2.5M9 2h6M12 2v3" />
      </svg>
    )
  if (name === 'slices')
    // roda dividida em fatias
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 3v18M3 12h18M5.6 5.6l12.8 12.8M18.4 5.6 5.6 18.4" />
      </svg>
    )
  // eliminação: opção sendo riscada da lista
  return (
    <svg {...common}>
      <path d="M4 6h10M4 12h16M4 18h12" />
      <path d="M3 12h18" strokeWidth={3} />
      <path d="m17 3 4 4m0-4-4 4" />
    </svg>
  )
}

// Configurações em um trilho fino de ícones (desktop). Cada ícone mostra o
// valor atual; passar o mouse mostra o nome e clicar abre um balão com o
// controle completo e a explicação.
export default function SpinRail(props: SpinSettingsProps) {
  const [open, setOpen] = useState<Key | null>(null)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onClick = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(null)
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(null)
    document.addEventListener('mousedown', onClick)
    window.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onClick)
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  const items: {
    key: Key
    label: string
    value: React.ReactNode
    on?: boolean
  }[] = [
    { key: 'duration', label: 'Duração do giro', value: `${props.spinTime}s` },
    {
      key: 'slices',
      label: props.autoSegments
        ? 'Fatias por opção (automático)'
        : 'Fatias por opção',
      value: (
        <>
          {props.segmentsPerOption}
          {props.autoSegments && (
            <span className="ml-0.5 text-[9px] font-bold opacity-70">A</span>
          )}
        </>
      ),
    },
    {
      key: 'elimination',
      label: props.eliminationMode
        ? 'Modo eliminação: ligado'
        : 'Modo eliminação: desligado',
      value: props.eliminationMode ? 'ON' : 'OFF',
      on: props.eliminationMode,
    },
  ]

  return (
    <div
      ref={ref}
      className="ui-panel relative flex flex-col items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] p-2"
    >
      {items.map((item) => {
        const active = open === item.key
        return (
          <div key={item.key} className="group relative">
            <button
              type="button"
              aria-label={item.label}
              aria-expanded={active}
              aria-haspopup="dialog"
              onClick={() => setOpen(active ? null : item.key)}
              className={`flex h-14 w-12 flex-col items-center justify-center gap-0.5 rounded-lg transition ${
                active
                  ? 'bg-amber-400 text-slate-950'
                  : item.on
                    ? 'text-amber-300 ring-1 ring-amber-400/60 hover:bg-white/10'
                    : 'text-slate-300 hover:bg-white/10 hover:text-slate-100'
              }`}
            >
              <Icon name={item.key} />
              <span className="text-[11px] font-semibold tabular-nums leading-none">
                {item.value}
              </span>
            </button>

            {/* Nome ao passar o mouse (some quando o balão está aberto) */}
            {!active && (
              <span className="pointer-events-none absolute left-full top-1/2 z-40 ml-3 -translate-y-1/2 whitespace-nowrap rounded-md bg-slate-950 px-2 py-1 text-xs font-medium text-slate-100 opacity-0 shadow-lg ring-1 ring-white/10 transition group-hover:opacity-100">
                {item.label}
              </span>
            )}

            {active && (
              <div
                role="dialog"
                aria-label={item.label}
                className="ui-card absolute left-full top-0 z-40 ml-3 w-64 rounded-xl border border-white/10 bg-slate-900 p-4 shadow-2xl"
              >
                {item.key === 'duration' && <DurationControl {...props} />}
                {item.key === 'slices' && (
                  <SegmentsControl
                    segmentsPerOption={props.segmentsPerOption}
                    setSegmentsPerOption={props.setSegmentsPerOption}
                    auto={props.autoSegments}
                    setAuto={props.setAutoSegments}
                    disabled={props.isSpinning}
                  />
                )}
                {item.key === 'elimination' && (
                  <EliminationControl {...props} />
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
