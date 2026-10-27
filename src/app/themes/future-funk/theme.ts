import {
  WheelTheme,
  accentRamp,
  build,
  neutralRamp,
} from '@/app/utils/themeKit'

export const futureFunkTheme: WheelTheme = {
  id: 'future-funk',
  name: 'Future Funk',
  harmony: 'Rosa-chiclete e amarelo, pop anime anos 80',
  mode: 'light',
  neutral: neutralRamp(335, 0.55),
  accent: accentRamp(330, 1),
  cta: ['#facc15', '#22d3ee'],
  glow: ['#ff4fa3', '#ffe14d'],
  // rosa ↔ verde-água, amarelo ↔ azul, laranja ↔ ciano
  palette: build([330, 160, 50, 230, 20, 195], 1, 0.36),
}
