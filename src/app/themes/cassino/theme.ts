import { WheelTheme, build, complementPairs } from '@/app/utils/themeKit'

// Paletas originais do Tailwind (slate + amber) para o tema Cassino
const TW_SLATE = [
  '#f8fafc',
  '#f1f5f9',
  '#e2e8f0',
  '#cbd5e1',
  '#94a3b8',
  '#64748b',
  '#475569',
  '#334155',
  '#1e293b',
  '#0f172a',
  '#020617',
]
const TW_AMBER = [
  '#fffbeb',
  '#fef3c7',
  '#fde68a',
  '#fcd34d',
  '#fbbf24',
  '#f59e0b',
  '#d97706',
  '#b45309',
  '#92400e',
  '#78350f',
  '#451a03',
]

export const cassinoTheme: WheelTheme = {
  id: 'cassino',
  name: 'Cassino',
  harmony: 'Azul-ardósia + dourado',
  mode: 'dark',
  neutral: TW_SLATE,
  accent: TW_AMBER,
  cta: ['#f97316', '#f43f5e'],
  glow: ['#f59e0b', '#ec4899'],
  palette: build(complementPairs(350, 3, 60), 0.78, 0.16),
}
