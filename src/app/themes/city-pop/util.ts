import type { CSSProperties } from 'react'

// Utilidades da cena City Pop. Sorteios com semente fixa: a mesma cidade em
// todo carregamento (nada de Math.random no render).
export const seeded = (seed: number) => () => {
  seed = (seed + 0x6d2b79f5) | 0
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}

export const r1 = (n: number) => Math.round(n * 10) / 10

// retângulo como trecho de path (muitas formas da mesma cor = um <path>)
export const box = (x: number, y: number, w: number, h: number) =>
  `M${r1(x)} ${r1(y)}h${r1(w)}v${r1(h)}h${r1(-w)}z`

// círculo como trecho de path
export const dot = (x: number, y: number, r: number) =>
  `M${r1(x - r)} ${r1(y)}a${r} ${r} 0 1 0 ${r * 2} 0a${r} ${r} 0 1 0 ${-r * 2} 0z`

export const vars = (v: Record<string, string | number>) => v as CSSProperties

// Unidade da cena: 1000 u = altura da tela (1 u = 0,1vh). As laterais são
// desenhadas em caixas de 600 × 1000 u coladas nas bordas da tela.
export const vh = (u: number) => `${r1(u) / 10}vh`

export type Neon = 'pink' | 'cyan' | 'red' | 'violet' | 'amber' | 'mint'
export const NEON: Record<Neon, string> = {
  pink: '#ff3d9a',
  cyan: '#2de2e6',
  red: '#ff2a44',
  violet: '#b46bff',
  amber: '#ffb547',
  mint: '#3dffc5',
}
