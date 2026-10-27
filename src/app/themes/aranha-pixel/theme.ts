import { WheelTheme, accentRamp, neutralRamp } from '@/app/utils/themeKit'

export const aranhaPixelTheme: WheelTheme = {
  id: 'aranha-pixel',
  name: 'Homem-Aranha Pixel',
  harmony: 'Pixel art 32-bit, cidade ao pôr do sol',
  mode: 'dark',
  neutral: neutralRamp(272, 0.45),
  accent: accentRamp(8, 0.95),
  cta: ['#f83800', '#0058f8'],
  glow: ['#f89a3b', '#b83a5e'],
  // vermelhos e azuis da paleta do NES, alternados como o uniforme
  palette: ['#d82800', '#0058f8', '#a81000', '#0000bc', '#f83800', '#0078f8'],
}
