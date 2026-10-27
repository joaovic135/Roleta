import { WheelTheme, accentRamp } from '@/app/utils/themeKit'

// Neutros puros (sem matiz) puxados para o contraste AAA sobre o preto:
// fundo #000, textos secundários (400/500) acima de 7:1, trilhos e
// controles desligados (600) acima de 3:1
const NEUTRAL = [
  '#fafafa',
  '#f5f5f5',
  '#ebebeb',
  '#dcdcdc',
  '#bdbdbd',
  '#a3a3a3',
  '#6b6b6b',
  '#3d3d3d',
  '#262626',
  '#141414',
  '#000000',
]

export const altoContrasteTheme: WheelTheme = {
  id: 'alto-contraste',
  name: 'Alto contraste',
  harmony: 'Preto + amarelo',
  mode: 'dark',
  neutral: NEUTRAL,
  accent: accentRamp(52, 1),
  cta: ['#ffd60a', '#ffe53d'],
  glow: ['#ffd60a', '#ffffff'],
  // Fatias alternam claro e escuro (contraste mesmo para quem não distingue
  // matizes) e todo rótulo passa de 7:1: amarelo, preto, branco, azul,
  // laranja, vinho, ciano, roxo
  palette: [
    '#ffd60a',
    '#0a0a0a',
    '#ffffff',
    '#1e40af',
    '#ff9f1c',
    '#9a1b1b',
    '#22d3ee',
    '#581c87',
  ],
}
