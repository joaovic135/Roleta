import {
  WheelTheme,
  accentRamp,
  build,
  neutralRamp,
} from '@/app/utils/themeKit'

export const aranhaTheme: WheelTheme = {
  id: 'aranha',
  name: 'Homem-Aranha',
  harmony: 'Vermelho e azul do uniforme, teias e HQ',
  mode: 'dark',
  neutral: neutralRamp(224, 0.62),
  accent: accentRamp(356, 0.88),
  cta: ['#c81e1e', '#1d4ed8'],
  glow: ['#e23636', '#2563eb'],
  // vermelho ↔ azul alternados, como o uniforme
  palette: build([356, 222, 4, 230, 350, 214], 0.85, 0.1),
}
