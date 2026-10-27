import {
  WheelTheme,
  accentRamp,
  build,
  complementPairs,
  neutralRamp,
} from '@/app/utils/themeKit'

export const y2kTheme: WheelTheme = {
  id: 'y2k',
  name: 'Y2K',
  harmony: 'Prata metálico, CDs iridescentes e bolhas',
  mode: 'light',
  neutral: neutralRamp(210, 0.3),
  accent: accentRamp(205, 1),
  cta: ['#38bdf8', '#a78bfa'],
  glow: ['#7dd3fc', '#f0abfc'],
  // iridescente: ciano ↔ rosa, lilás ↔ lima, azul ↔ pêssego
  palette: build(complementPairs(190, 3, 60), 0.85, 0.45),
}
