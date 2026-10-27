import type { CSSProperties } from 'react'

// Utilidades de geometria da cena Cine Pulp: sorteio com semente fixa
// (igual no servidor e no navegador), números curtos e pedaços de <path>.

export const seeded = (seed: number) => () => {
  seed = (seed + 0x6d2b79f5) | 0
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}

// arredonda para 1 casa (o HTML fica bem menor)
export const n = (v: number) => Math.round(v * 10) / 10

export const rect = (x: number, y: number, w: number, h: number) =>
  `M${n(x)} ${n(y)}h${n(w)}v${n(h)}h${n(-w)}z`

export const dot = (x: number, y: number, r: number) =>
  `M${n(x - r)} ${n(y)}a${n(r)} ${n(r)} 0 1 0 ${n(r * 2)} 0a${n(r)} ${n(r)} 0 1 0 ${n(-r * 2)} 0z`

export const oval = (x: number, y: number, rx: number, ry: number) =>
  `M${n(x - rx)} ${n(y)}a${n(rx)} ${n(ry)} 0 1 0 ${n(rx * 2)} 0a${n(rx)} ${n(ry)} 0 1 0 ${n(-rx * 2)} 0z`

export const poly = (pts: number[][]) =>
  `M${pts.map(([x, y]) => `${n(x)} ${n(y)}`).join('L')}Z`

// estrelinha de 4 pontas (brilho)
export const sparkle = (x: number, y: number, s: number) =>
  `M${n(x)} ${n(y - s)}Q${n(x)} ${n(y)} ${n(x + s)} ${n(y)}Q${n(x)} ${n(y)} ${n(x)} ${n(y + s)}Q${n(x)} ${n(y)} ${n(x - s)} ${n(y)}Q${n(x)} ${n(y)} ${n(x)} ${n(y - s)}Z`

// estrela de 5 pontas
export const star = (x: number, y: number, r: number, inner = 0.42) =>
  poly(
    Array.from({ length: 10 }, (_, i) => {
      const a = -Math.PI / 2 + (i * Math.PI) / 5
      const rr = i % 2 ? r * inner : r
      return [x + Math.cos(a) * rr, y + Math.sin(a) * rr]
    }),
  )

// variáveis CSS inline (atrasos, posições) sem brigar com o TypeScript
export const vars = (v: Record<string, string | number>) => v as CSSProperties
