import { PlayMode } from '@/app/types'
import React from 'react'

const MODES: { id: PlayMode; label: string; title: string }[] = [
  { id: 'wheel', label: 'Roleta', title: 'Sortear girando a roleta' },
  {
    id: 'cards',
    label: 'Cartas',
    title: 'Sortear com o dealer distribuindo cartas',
  },
]

const Icon = ({ mode }: { mode: PlayMode }) => {
  const common = {
    width: 18,
    height: 18,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
  }
  if (mode === 'wheel')
    // roda com ponteiro
    return (
      <svg {...common}>
        <circle cx="12" cy="13" r="8" />
        <path d="M12 5v16M4 13h16M12 2l-2 3h4z" />
      </svg>
    )
  // duas cartas em leque
  return (
    <svg {...common}>
      <rect
        x="3"
        y="6"
        width="10"
        height="14"
        rx="1.5"
        transform="rotate(-12 8 13)"
      />
      <rect
        x="10"
        y="4"
        width="10"
        height="14"
        rx="1.5"
        transform="rotate(10 15 11)"
      />
    </svg>
  )
}

// Seletor do modo do sorteio, ao lado do botão principal
export default function ModeToggle({
  mode,
  onChange,
  disabled,
}: {
  mode: PlayMode
  onChange: (mode: PlayMode) => void
  disabled?: boolean
}) {
  return (
    <div
      role="radiogroup"
      aria-label="Modo do sorteio"
      className="ui-mode-toggle flex shrink-0 gap-1 rounded-xl border border-white/10 bg-white/[0.04] p-1"
    >
      {MODES.map((m) => {
        const active = mode === m.id
        return (
          <button
            key={m.id}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={m.label}
            title={m.title}
            disabled={disabled}
            onClick={() => onChange(m.id)}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 text-sm font-semibold transition disabled:cursor-not-allowed ${
              active
                ? 'bg-amber-400 text-slate-950'
                : 'text-slate-300 hover:bg-white/10 hover:text-slate-100 disabled:hover:bg-transparent'
            }`}
          >
            <Icon mode={m.id} />
            <span className="hidden sm:inline">{m.label}</span>
          </button>
        )
      })}
    </div>
  )
}
