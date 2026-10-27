import { RouletteOption } from '../types'
import {
  STEPS,
  WheelTheme,
  accentRamp,
  build,
  complementPairs,
  neutralRamp,
} from './themeKit'

// Temas do site. Cada um define:
// - cores do site inteiro (neutros, destaque, botão de girar, brilhos);
// - a paleta das fatias, com teoria das cores: cada matiz vem acompanhado do
//   seu oposto na roda de cores e a sequência alterna os dois (contraste
//   inverso), com luminância igualada para o texto ficar legível em todas;
// - a estética: cena de fundo, fontes e estilo dos componentes, em
//   src/app/themes.css, ativados pelo atributo data-theme no <html>.

export type { WheelTheme } from './themeKit'
import { aranhaPixelTheme } from '../themes/aranha-pixel/theme'
import { halfLifeTheme } from '../themes/half-life/theme'
import { heartsOfIronTheme } from '../themes/hearts-of-iron/theme'
import { umaMusumeTheme } from '../themes/uma-musume/theme'
import { miraiFunkTheme } from '../themes/mirai-funk/theme'
import { goodTimesTheme } from '../themes/good-times/theme'
import { cityPopTheme } from '../themes/city-pop/theme'

// Paletas originais do Tailwind (slate + amber) para o tema Cassino
const TW_SLATE = [
  '#f8fafc',
  '#f1f5f9',
  '#e2e8f0',
  '#cbd5e1',
  '#94a3b8',
  '#64748b',
  '#475569',
  '#334155',
  '#1e293b',
  '#0f172a',
  '#020617',
]
const TW_AMBER = [
  '#fffbeb',
  '#fef3c7',
  '#fde68a',
  '#fcd34d',
  '#fbbf24',
  '#f59e0b',
  '#d97706',
  '#b45309',
  '#92400e',
  '#78350f',
  '#451a03',
]

export const THEMES: WheelTheme[] = [
  {
    id: 'cassino',
    name: 'Cassino',
    harmony: 'Azul-ardósia + dourado',
    mode: 'dark',
    neutral: TW_SLATE,
    accent: TW_AMBER,
    cta: ['#f97316', '#f43f5e'],
    glow: ['#f59e0b', '#ec4899'],
    palette: build(complementPairs(350, 3, 60), 0.78, 0.16),
  },
  {
    id: 'retrowave',
    name: 'Retrowave',
    harmony: 'Outrun / Synthwave: sol listrado, grade neon e cromado',
    mode: 'dark',
    neutral: neutralRamp(268, 0.6),
    accent: accentRamp(322, 1),
    cta: ['#ff6ec7', '#7c3aed'],
    glow: ['#ff2fb4', '#22d3ee'],
    // rosa ↔ ciano, roxo ↔ laranja-sol, magenta ↔ azul: pares quase opostos
    palette: build([330, 185, 285, 35, 310, 205], 1, 0.19),
  },
  {
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
  },
  {
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
  },
  {
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
  },
  {
    id: 'y2k',
    name: 'Y2K',
    harmony: 'Prata metálico, CDs iridescentes e bolhas',
    mode: 'light',
    neutral: neutralRamp(210, 0.3),
    accent: accentRamp(205, 1),
    cta: ['#38bdf8', '#a78bfa'],
    glow: ['#7dd3fc', '#f0abfc'],
    // iridescente: ciano ↔ rosa, lilás ↔ lima, azul ↔ pêssego
    palette: build(complementPairs(190, 3, 60), 0.85, 0.45),
  },
  {
    id: 'future-funk',
    name: 'Future Funk',
    harmony: 'Rosa-chiclete e amarelo, pop anime anos 80',
    mode: 'light',
    neutral: neutralRamp(335, 0.55),
    accent: accentRamp(330, 1),
    cta: ['#facc15', '#22d3ee'],
    glow: ['#ff4fa3', '#ffe14d'],
    // rosa ↔ verde-água, amarelo ↔ azul, laranja ↔ ciano
    palette: build([330, 160, 50, 230, 20, 195], 1, 0.36),
  },
  {
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
  },
  aranhaPixelTheme,
  halfLifeTheme,
  heartsOfIronTheme,
  umaMusumeTheme,
  miraiFunkTheme,
  goodTimesTheme,
  cityPopTheme,
  {
    id: 'alto-contraste',
    name: 'Alto contraste',
    harmony: 'Preto + amarelo',
    mode: 'dark',
    neutral: neutralRamp(0, 0),
    accent: accentRamp(52, 1),
    cta: ['#facc15', '#f97316'],
    glow: ['#facc15', '#ffffff'],
    // além do matiz oposto, alterna fatia escura e fatia clara
    palette: build(complementPairs(260, 3, 60), 0.85, [0.06, 0.5]),
  },
]

export const DEFAULT_THEME_ID = THEMES[0].id

export const getTheme = (id: string) =>
  THEMES.find((t) => t.id === id) ?? THEMES[0]

// Cor de cada opção pela posição dela, seguindo a sequência do tema
// (vizinhas na roda = cores opostas). Cores escolhidas à mão são mantidas.
export const applyTheme = (
  options: RouletteOption[],
  theme: WheelTheme,
): RouletteOption[] => {
  const { palette } = theme
  const n = options.length
  return options.map((option, i) => {
    if (option.customColor) return option
    // Na roda a última opção encosta na primeira: evita as duas iguais
    const index = i === n - 1 && n > 1 && n % palette.length === 1 ? i + 1 : i
    return { ...option, color: palette[index % palette.length] }
  })
}

// ---- Aplicação no site ----------------------------------------------------

const rgb = (hex: string) =>
  [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)).join(' ')

const cssVars = (t: WheelTheme) => {
  // No modo claro as escalas se invertem: o "950" (fundo) vira o tom mais
  // claro e o "100" (texto) o mais escuro; o mesmo vale para o destaque
  const light = t.mode === 'light'
  const neutral = light ? [...t.neutral].reverse() : t.neutral
  const accent = light ? [...t.accent].reverse() : t.accent
  return [
    ...STEPS.map((step, i) => `--slate-${step}:${rgb(neutral[i])}`),
    ...STEPS.map((step, i) => `--amber-${step}:${rgb(accent[i])}`),
    // "white" das bordas/realces: branco no escuro, tinta escura no claro
    `--ink:${light ? rgb(t.neutral[10]) : '255 255 255'}`,
    `--cta-2:${rgb(t.cta[0])}`,
    `--cta-3:${rgb(t.cta[1])}`,
    `--glow-1:${rgb(t.glow[0])}`,
    `--glow-2:${rgb(t.glow[1])}`,
    `color-scheme:${t.mode}`,
  ].join(';')
}

// CSS de todos os temas (o primeiro é o padrão em :root), injetado no <head>
export const themeCss = () =>
  `:root{${cssVars(THEMES[0])}}` +
  THEMES.map((t) => `html[data-theme="${t.id}"]{${cssVars(t)}}`).join('')

// Roda antes da primeira pintura e aplica o tema salvo, sem piscar o padrão
export const themeBootScript = `try{var t=JSON.parse(localStorage.getItem('roleta.settings')||'{}').theme;if(t)document.documentElement.dataset.theme=t}catch(e){}`
