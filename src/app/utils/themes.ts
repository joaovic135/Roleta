import { RouletteOption } from '../types'
import { STEPS, WheelTheme } from './themeKit'

// Temas do site. Cada um define:
// - cores do site inteiro (neutros, destaque, botão de girar, brilhos);
// - a paleta das fatias, com teoria das cores: cada matiz vem acompanhado do
//   seu oposto na roda de cores e a sequência alterna os dois (contraste
//   inverso), com luminância igualada para o texto ficar legível em todas;
// - a estética: cena de fundo, fontes e estilo dos componentes, em
//   src/app/themes.css, ativados pelo atributo data-theme no <html>.

export type { WheelTheme } from './themeKit'
import { aranhaTheme } from '../themes/aranha/theme'
import { futureFunkTheme } from '../themes/future-funk/theme'
import { y2kTheme } from '../themes/y2k/theme'
import { darksynthTheme } from '../themes/darksynth/theme'
import { cyberpunkTheme } from '../themes/cyberpunk/theme'
import { retrowaveTheme } from '../themes/retrowave/theme'
import { cassinoTheme } from '../themes/cassino/theme'
import { aranhaPixelTheme } from '../themes/aranha-pixel/theme'
import { halfLifeTheme } from '../themes/half-life/theme'
import { heartsOfIronTheme } from '../themes/hearts-of-iron/theme'
import { umaMusumeTheme } from '../themes/uma-musume/theme'
import { miraiFunkTheme } from '../themes/mirai-funk/theme'
import { goodTimesTheme } from '../themes/good-times/theme'
import { cityPopTheme } from '../themes/city-pop/theme'
import { vaporwaveTheme } from '../themes/vaporwave/theme'
import { cinePulpTheme } from '../themes/cine-pulp/theme'
import { altoContrasteTheme } from '../themes/alto-contraste/theme'

export const THEMES: WheelTheme[] = [
  cassinoTheme,
  retrowaveTheme,
  vaporwaveTheme,
  cyberpunkTheme,
  darksynthTheme,
  y2kTheme,
  futureFunkTheme,
  aranhaTheme,
  aranhaPixelTheme,
  halfLifeTheme,
  heartsOfIronTheme,
  umaMusumeTheme,
  miraiFunkTheme,
  goodTimesTheme,
  cityPopTheme,
  cinePulpTheme,
  altoContrasteTheme,
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
