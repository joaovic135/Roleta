import {
  WheelTheme,
  accentRamp,
  build,
  neutralRamp,
} from '@/app/utils/themeKit'

export const vaporwaveTheme: WheelTheme = {
  id: 'vaporwave',
  name: 'Vaporwave',
  harmony: 'Pastel rosa e ciano, Windows 95 e piso xadrez',
  mode: 'light',
  neutral: neutralRamp(290, 0.45),
  accent: accentRamp(300, 0.85),
  cta: ['#ff71ce', '#01cdfe'],
  glow: ['#ff71ce', '#01cdfe'],
  // rosa ↔ ciano-menta, lilás ↔ amarelo-pêssego: pastéis opostos
  palette: build([320, 175, 270, 50, 195, 345], 0.9, 0.42),
}
