import {
  RANDOM_THEME_ID,
  RANDOM_THEME_POOL,
  THEMES,
  getTheme,
} from '@/app/utils/themes'
import React from 'react'

interface ThemePickerProps {
  // Tema na tela (o sorteado, quando em "Aleatório")
  themeId: string
  // "Aleatório" selecionado
  random?: boolean
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

// Mosaico do "Aleatório": uma fatia na cor de destaque de cada tema sorteável
const randomMosaic = conic(
  RANDOM_THEME_POOL.map((id) => getTheme(id).accent[4]),
)

// Ícone de dado (face do 5) do botão "Aleatório"
const PIPS = [
  [8, 8],
  [16, 8],
  [12, 12],
  [8, 16],
  [16, 16],
]
const DiceIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className="h-full w-full">
    <rect
      x="3"
      y="3"
      width="18"
      height="18"
      rx="4.5"
      fill="#fff"
      stroke="#0f172a"
      strokeWidth="1.5"
    />
    {PIPS.map(([cx, cy]) => (
      <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="1.7" fill="#0f172a" />
    ))}
  </svg>
)

const BUTTON =
  'h-10 w-10 shrink-0 rounded-full p-[3px] transition hover:scale-110 focus:outline-none focus-visible:ring-4 focus-visible:ring-white/70 disabled:opacity-50 disabled:hover:scale-100'
const SELECTED =
  'scale-110 ring-2 ring-white ring-offset-2 ring-offset-slate-900'

// Card de temas: só as cores. Nome e harmonia aparecem como dica (title).
const ThemePicker: React.FC<ThemePickerProps> = ({
  themeId,
  random,
  onChange,
  disabled,
}) => {
  const rolledName = getTheme(themeId).name
  return (
    <nav
      aria-label="Tema de cores da roda"
      className="ui-card rounded-3xl border border-white/10 bg-slate-900/70 p-3 shadow-2xl lg:self-start"
    >
      <div
        role="radiogroup"
        aria-label="Tema de cores da roda"
        className="flex flex-wrap justify-center gap-3 lg:grid lg:grid-cols-2 lg:gap-2"
      >
        {/* Aleatório: primeira opção. Com ele ativo, clicar de novo sorteia
            outro tema */}
        <button
          type="button"
          role="radio"
          aria-checked={!!random}
          aria-label={
            random
              ? `Aleatório (saiu ${rolledName}; clique para sortear outro)`
              : 'Aleatório (sorteia um tema a cada visita)'
          }
          title={
            random
              ? `Aleatório — saiu ${rolledName}. Clique para sortear outro`
              : 'Aleatório — sorteia um tema a cada visita'
          }
          disabled={disabled}
          onClick={() => onChange(RANDOM_THEME_ID)}
          className={`group ${BUTTON} ${random ? SELECTED : ''}`}
          style={{ background: randomMosaic }}
        >
          <span className="flex h-full w-full items-center justify-center rounded-full bg-slate-950/55 p-[5px]">
            <span className="block h-full w-full transition-transform duration-300 group-hover:rotate-90 group-active:rotate-180">
              <DiceIcon />
            </span>
          </span>
        </button>

        {THEMES.map((theme) => {
          const active = theme.id === themeId
          // Em "Aleatório" o tema que saiu fica com contorno tracejado
          const rolled = random && active
          return (
            <button
              key={theme.id}
              type="button"
              role="radio"
              aria-checked={active && !random}
              aria-label={`${theme.name} (${theme.harmony})${rolled ? ', sorteado' : ''}`}
              title={`${theme.name} — ${theme.harmony}${rolled ? ' (sorteado)' : ''}`}
              disabled={disabled}
              onClick={() => onChange(theme.id)}
              className={`${BUTTON} ${
                rolled
                  ? 'outline-dashed outline-2 outline-offset-2 outline-white/80'
                  : active
                    ? SELECTED
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
}

export default ThemePicker
