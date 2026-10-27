import {
  WheelTheme,
  accentRamp,
  build,
  neutralRamp,
} from '@/app/utils/themeKit'

// City Pop: rua de Tóquio à noite, letreiros neon rosa/ciano refletidos no
// asfalto molhado. Neutros azul-arroxeados (céu noturno), destaque rosa-neon.
export const cityPopTheme: WheelTheme = {
  id: 'city-pop',
  name: 'City Pop',
  harmony: 'Tóquio à noite: letreiros neon rosa e ciano na chuva',
  mode: 'dark',
  neutral: neutralRamp(258, 0.55),
  accent: accentRamp(328, 1),
  cta: ['#ff3d9a', '#22d3ee'],
  glow: ['#ff3d9a', '#2de2e6'],
  // pares opostos alternados, todos com a mesma luminância (texto branco):
  // rosa-neon ↔ ciano, vermelho ↔ verde-água, violeta ↔ âmbar
  palette: build([328, 186, 356, 168, 272, 36], 1, 0.15),
}
