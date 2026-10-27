import {
  WheelTheme,
  accentRamp,
  build,
  neutralRamp,
} from '@/app/utils/themeKit'

export const cyberpunkTheme: WheelTheme = {
  id: 'cyberpunk',
  name: 'Cyberpunk',
  harmony: 'Cidade chuvosa, amarelo e azul neon',
  mode: 'dark',
  neutral: neutralRamp(215, 0.5),
  accent: accentRamp(56, 1),
  cta: ['#00f0ff', '#ff003c'],
  glow: ['#00f0ff', '#fcee0a'],
  // amarelo ↔ azul, ciano ↔ vermelho, magenta ↔ verde
  palette: build([56, 236, 185, 5, 305, 125], 1, 0.2),
}
