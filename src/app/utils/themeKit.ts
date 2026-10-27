import { luminance } from './colors'

// Ferramentas para montar temas (usadas por src/app/utils/themes.ts e pelos
// arquivos src/app/themes/<id>/theme.ts)
//
// - build(matizes, saturação, luminância): paleta das fatias. Cada cor recebe
//   a luminância relativa pedida (todas com o mesmo brilho percebido); use
//   [a, b] para alternar claro/escuro. Prefira matizes em pares opostos na
//   roda de cores (complementPairs) para fatias vizinhas contrastarem.
// - neutralRamp(matiz, saturação): fundo/cards/texto (escala 50…950).
// - accentRamp(matiz, saturação): cor de destaque (escala 50…950).

export interface WheelTheme {
  id: string
  name: string
  // Descrição curta (aparece como dica no seletor)
  harmony: string
  // Temas claros invertem as escalas: fundo claro e texto escuro
  mode: 'dark' | 'light'
  // Escalas 50…950 que substituem slate (neutros) e amber (destaque)
  neutral: string[]
  accent: string[]
  // Meio e fim do gradiente do botão de girar (o início é o destaque)
  cta: [string, string]
  // Brilhos do fundo da página
  glow: [string, string]
  // Cores das fatias da roda
  palette: string[]
}

export const wrap = (h: number) => ((h % 360) + 360) % 360

// [base, base+180, base+passo, base+passo+180, ...]: pares complementares
export const complementPairs = (base: number, pairs: number, step: number) =>
  Array.from({ length: pairs }, (_, i) => [
    wrap(base + i * step),
    wrap(base + i * step + 180),
  ]).flat()

export const hslToHex = (h: number, s: number, l: number) => {
  const a = s * Math.min(l, 1 - l)
  const f = (n: number) => {
    const k = (n + h / 30) % 12
    const c = l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1))
    return Math.round(c * 255)
      .toString(16)
      .padStart(2, '0')
  }
  return `#${f(0)}${f(8)}${f(4)}`
}

// Cor com o matiz e a saturação dados e a luminância relativa desejada
// (busca binária na luminosidade do HSL)
export const colorWithLuminance = (
  hue: number,
  saturation: number,
  target: number,
) => {
  let lo = 0.03
  let hi = 0.97
  for (let i = 0; i < 24; i++) {
    const mid = (lo + hi) / 2
    if (luminance(hslToHex(hue, saturation, mid)) < target) lo = mid
    else hi = mid
  }
  return hslToHex(hue, saturation, (lo + hi) / 2)
}

export const build = (
  hues: number[],
  saturation: number,
  lum: number | [number, number],
) =>
  hues.map((h, i) =>
    colorWithLuminance(h, saturation, Array.isArray(lum) ? lum[i % 2] : lum),
  )

// Escala de 11 tons (50…950), como as do Tailwind
export const STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950]
const NEUTRAL_L = [
  0.98, 0.96, 0.91, 0.84, 0.65, 0.47, 0.34, 0.27, 0.17, 0.11, 0.05,
]
const ACCENT_L = [
  0.97, 0.92, 0.84, 0.74, 0.62, 0.52, 0.44, 0.36, 0.3, 0.25, 0.14,
]

// Tons de fundo, cards e texto, levemente tingidos pelo matiz do tema
export const neutralRamp = (hue: number, saturation: number) =>
  NEUTRAL_L.map((l, i) => hslToHex(hue, saturation * (i < 5 ? 0.6 : 1), l))

// Cor de destaque; o matiz gira um pouco nos tons escuros, como no Tailwind
export const accentRamp = (hue: number, saturation: number) =>
  ACCENT_L.map((l, i) => hslToHex(wrap(hue + 8 - i * 2), saturation, l))
