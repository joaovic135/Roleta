import {
  WheelTheme,
  accentRamp,
  build,
  neutralRamp,
} from '@/app/utils/themeKit'

export const darksynthTheme: WheelTheme = {
  id: 'darksynth',
  name: 'Darksynth',
  harmony: 'Preto e vermelho agressivo, scanlines',
  mode: 'dark',
  neutral: neutralRamp(355, 0.25),
  accent: accentRamp(358, 0.95),
  cta: ['#b91c1c', '#4c0519'],
  glow: ['#dc2626', '#7f1d1d'],
  // contraste inverso de luminância: quase-preto ↔ vermelho vivo
  palette: build([0, 355, 345, 8, 330, 2], 0.9, [0.012, 0.16]),
}
