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
import { neonNoirTheme } from '../themes/neon-noir/theme'
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
  neonNoirTheme,
  altoContrasteTheme,
]

// "Aleatório": valor salvo nas configurações que sorteia um tema a cada
// carregamento da página. É o padrão para quem nunca escolheu um tema.
export const RANDOM_THEME_ID = 'random'
export const DEFAULT_THEME_ID = RANDOM_THEME_ID

// Temas que entram no sorteio: o alto contraste é de acessibilidade e só
// aparece se escolhido de propósito
export const RANDOM_THEME_POOL = THEMES.filter(
  (t) => t.id !== 'alto-contraste',
).map((t) => t.id)

// Último tema sorteado, para não repetir no próximo carregamento
const LAST_RANDOM_KEY = 'roleta.lastRandomTheme'

// Variável global onde o script de boot deixa o tema sorteado para o React
declare global {
  interface Window {
    __roletaRandomTheme?: string
  }
}

export const getTheme = (id: string) =>
  THEMES.find((t) => t.id === id) ?? THEMES[0]

// Sorteia um tema do pool evitando o último sorteado (e o que está na tela)
export const rollRandomTheme = (): string => {
  let last: string | null = null
  try {
    last = localStorage.getItem(LAST_RANDOM_KEY)
  } catch {}
  const current = document.documentElement.dataset.theme
  const pool = RANDOM_THEME_POOL.filter((id) => id !== last && id !== current)
  const id =
    pool[Math.floor(Math.random() * pool.length)] ?? RANDOM_THEME_POOL[0]
  try {
    localStorage.setItem(LAST_RANDOM_KEY, id)
  } catch {}
  window.__roletaRandomTheme = id
  return id
}

// Tema sorteado neste carregamento (pelo script de boot); sorteia agora se o
// script não rodou
export const currentRandomTheme = () =>
  window.__roletaRandomTheme ?? rollRandomTheme()

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

// Roda antes da primeira pintura e aplica o tema salvo, sem piscar o padrão.
// Sem tema salvo (ou "Aleatório") sorteia aqui mesmo, evitando o último
// sorteado, e deixa o resultado em window.__roletaRandomTheme para o React
export const themeBootScript = `try{var s=localStorage,d=document.documentElement,t=JSON.parse(s.getItem('roleta.settings')||'{}').theme||'${RANDOM_THEME_ID}';if(t==='${RANDOM_THEME_ID}'){var l=s.getItem('${LAST_RANDOM_KEY}'),p=${JSON.stringify(RANDOM_THEME_POOL)}.filter(function(i){return i!==l});t=p[Math.floor(Math.random()*p.length)];s.setItem('${LAST_RANDOM_KEY}',t);window.__roletaRandomTheme=t}d.dataset.theme=t}catch(e){}`
