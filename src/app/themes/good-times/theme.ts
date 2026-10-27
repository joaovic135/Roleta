import {
  WheelTheme,
  accentRamp,
  build,
  neutralRamp,
} from '@/app/utils/themeKit'

// Pastel com a mesma luminância relativa (0,56): o texto escuro das fatias
// fica legível em todas. A saturação muda por matiz para o verde não virar
// neon e o amarelo não virar mostarda.
const LUM = 0.56
const pastel = (hue: number, saturation = 0.95) =>
  build([hue], saturation, LUM)[0]

export const goodTimesTheme: WheelTheme = {
  id: 'good-times',
  name: 'Good Times',
  harmony: 'Pôster Future Funk: papel quadriculado, Memphis e sol pastel',
  mode: 'light',
  // papel cinza-lilás claro; texto quase preto (contornos do pôster)
  neutral: neutralRamp(265, 0.22),
  // rosa-chiclete: sliders, toggle, ponteiro e números
  accent: accentRamp(326, 1),
  cta: ['#fff36b', '#7fe3ff'],
  glow: ['#ff9ad5', '#bdf3ff'],
  // Pares complementares alternados (vizinhas sempre opostas):
  // rosa ↔ menta, pêssego ↔ ciano, amarelo ↔ lilás; e uma fatia preta
  // de contraste inverso, como os contornos Memphis (rótulo branco)
  palette: [
    pastel(330, 1),
    pastel(150, 0.62),
    pastel(14, 1),
    pastel(194),
    pastel(46, 1),
    pastel(262),
    '#1d1a2b',
  ],
}
