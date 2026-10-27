import {
  WheelTheme,
  accentRamp,
  build,
  neutralRamp,
} from '@/app/utils/themeKit'

// Half-Life: complexo de pesquisa subterrâneo, HUD laranja do traje e o
// brilho verde da câmara de testes.
// - neutros: concreto/metal cinza com um leve tom verde-petróleo (luz
//   fluorescente), quase sem saturação;
// - destaque: laranja do HUD (#ff9b00);
// - fatias: três pares complementares "industriais" lado a lado (azul-aço ↔
//   laranja de alerta, roxo de outro mundo ↔ verde radioativo, verde-água ↔
//   vermelho de alarme), alternando luminância escura/média (0,11 / 0,17,
//   contraste inverso); todas escuras o bastante para o texto branco passar
//   de 4,5:1.
export const halfLifeTheme: WheelTheme = {
  id: 'half-life',
  name: 'Half-Life',
  harmony:
    'Complexo de pesquisa: concreto, HUD laranja e brilho verde de ressonância; fatias em pares complementares industriais',
  mode: 'dark',
  neutral: neutralRamp(165, 0.1),
  accent: accentRamp(36, 1),
  cta: ['#ffb300', '#ff7a00'],
  glow: ['#6dff3a', '#ff9b00'],
  palette: build([206, 26, 278, 98, 172, 352], 0.78, [0.11, 0.17]),
}
