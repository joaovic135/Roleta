import type { CSSProperties } from 'react'

// Utilitários da cena Vaporwave: sorteio com semente fixa (igual em toda
// carga), números curtos para os <path> e pixel art escrita em texto.

export const seeded = (seed: number) => () => {
  seed = (seed + 0x6d2b79f5) | 0
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}

export const n = (v: number) => Math.round(v * 10) / 10

// variáveis CSS inline (o React não tipa custom properties)
export const vars = (v: Record<string, string | number>) => v as CSSProperties

// tamanho em unidades da cena (1em = 10 unidades; 1 unidade = 1/1080 da
// altura da tela, ver .vw-world no CSS)
export const em = (u: number) => `${n(u / 10)}em`

// Pixel art: cada caractere de `rows` vira um pixel da cor em `colors`
// ('.' ou ausente = transparente). Junta pixels vizinhos da mesma cor em
// retângulos e devolve um path por cor.
export type Sprite = { w: number; h: number; paths: [string, string][] }
export const sprite = (
  rows: string[],
  colors: Record<string, string>,
): Sprite => {
  const out: Record<string, string> = {}
  rows.forEach((row, y) => {
    let x = 0
    while (x < row.length) {
      const c = colors[row[x]]
      if (!c) {
        x++
        continue
      }
      let e = x + 1
      while (e < row.length && colors[row[e]] === c) e++
      out[c] = (out[c] ?? '') + `M${x} ${y}h${e - x}v1h-${e - x}z`
      x = e
    }
  })
  return {
    w: Math.max(...rows.map((r) => r.length)),
    h: rows.length,
    paths: Object.entries(out),
  }
}
