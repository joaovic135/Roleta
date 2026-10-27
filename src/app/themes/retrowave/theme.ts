import {
  WheelTheme,
  accentRamp,
  build,
  neutralRamp,
} from '@/app/utils/themeKit'

export const retrowaveTheme: WheelTheme = {
  id: 'retrowave',
  name: 'Retrowave',
  harmony: 'Outrun / Synthwave: sol listrado, grade neon e cromado',
  mode: 'dark',
  neutral: neutralRamp(268, 0.6),
  accent: accentRamp(322, 1),
  cta: ['#ff6ec7', '#7c3aed'],
  glow: ['#ff2fb4', '#22d3ee'],
  // rosa ↔ ciano, roxo ↔ laranja-sol, magenta ↔ azul: pares quase opostos
  palette: build([330, 185, 285, 35, 310, 205], 1, 0.19),
}
