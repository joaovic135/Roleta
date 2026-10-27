import {
  WheelTheme,
  accentRamp,
  build,
  neutralRamp,
} from '@/app/utils/themeKit'

// Sala de guerra: mapa sépia/oliva, painéis de couro e latão, dossiês
// datilografados. As fatias usam cores militares foscas em pares
// complementares, todas com a mesma luminância (0,13) para o rótulo branco
// passar de 4,5:1. Cada par tem a sua saturação: tons de terra (oliva,
// tijolo, mostarda) um pouco mais vivos que os cinzas-azulados opostos.
//
//   oliva  (78°)  ↔ cinza-naval   (258°)
//   tijolo (10°)  ↔ cinza-petróleo (190°)
//   mostarda (44°) ↔ cinza-campanha (224°)
const LUM = 0.13
const pair = (hue: number, warm: number, cool: number) => [
  ...build([hue], warm, LUM),
  ...build([hue + 180], cool, LUM),
]

export const heartsOfIronTheme: WheelTheme = {
  id: 'hearts-of-iron',
  name: 'Hearts of Iron',
  harmony: 'Sala de guerra: mapa sépia, latão e cáqui militar',
  mode: 'dark',
  // oliva-cáqui: fundo verde-musgo escuro, texto cor de papel envelhecido
  neutral: neutralRamp(58, 0.24),
  // latão envelhecido
  accent: accentRamp(40, 0.62),
  cta: ['#9a3b26', '#5a1f16'],
  glow: ['#c9a24a', '#8e3424'],
  palette: [
    ...pair(78, 0.42, 0.08),
    ...pair(10, 0.48, 0.22),
    ...pair(44, 0.55, 0.17),
  ],
}
