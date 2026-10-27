import { THEMES } from '@/app/utils/themes'
import React from 'react'

interface ThemePickerProps {
  themeId: string
  onChange: (id: string) => void
  disabled?: boolean
}

// Mini-roda com as cores do tema, na mesma ordem em que aparecem na roleta
const conic = (palette: string[]) => {
  const step = 360 / palette.length
  return `conic-gradient(${palette
    .map((c, i) => `${c} ${i * step}deg ${(i + 1) * step}deg`)
    .join(', ')})`
}

// Card de temas: só as cores. Nome e harmonia aparecem como dica (title).
const ThemePicker: React.FC<ThemePickerProps> = ({
  themeId,
  onChange,
  disabled,
}) => (
  <nav
    aria-label="Tema de cores da roda"
    className="ui-card rounded-3xl border border-white/10 bg-slate-900/70 p-3 shadow-2xl lg:self-start"
  >
    <div
      role="radiogroup"
      aria-label="Tema de cores da roda"
      className="flex flex-wrap justify-center gap-3 lg:grid lg:grid-cols-2 lg:gap-2"
    >
      {THEMES.map((theme) => {
        const active = theme.id === themeId
        return (
          <button
            key={theme.id}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={`${theme.name} (${theme.harmony})`}
            title={`${theme.name} — ${theme.harmony}`}
            disabled={disabled}
            onClick={() => onChange(theme.id)}
            className={`h-10 w-10 shrink-0 rounded-full p-[3px] transition hover:scale-110 focus:outline-none focus-visible:ring-4 focus-visible:ring-white/70 disabled:opacity-50 disabled:hover:scale-100 ${
              active
                ? 'scale-110 ring-2 ring-white ring-offset-2 ring-offset-slate-900'
                : ''
            }`}
            // Prévia do tema: aro na cor de destaque, fundo do tema e as
            // fatias da roda no centro
            style={{
              background: `linear-gradient(${theme.accent[2]}, ${theme.accent[7]})`,
            }}
          >
            <span
              className="block h-full w-full rounded-full border-2"
              style={{
                background: conic(theme.palette),
                borderColor: theme.neutral[10],
              }}
            />
          </button>
        )
      })}
    </div>
  </nav>
)

export default ThemePicker
