import type { CSSProperties } from 'react'

// Utilitários da cena Neon Noir: sorteio com semente fixa (igual em toda
// carga), números curtos para os <path>, posição em unidades da cena e
// pixel art escrita em texto ou calculada pixel a pixel.

export const seeded = (seed: number) => () => {
  seed = (seed + 0x6d2b79f5) | 0
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}

export const n = (v: number) => Math.round(v * 10) / 10

// variáveis CSS inline (o React não tipa custom properties)
export const vars = (v: Record<string, string | number>) => v as CSSProperties

// tamanho em unidades da cena (1000 unidades = altura da tela, ver --nn-u)
export const u = (v: number) => `calc(${n(v)} * var(--nn-u))`

// caixa no palco: x/y a partir do canto de cima à esquerda do palco
export const at = (
  x: number,
  y: number,
  w: number,
  h: number,
  extra: Record<string, string | number> = {},
) => vars({ left: u(x), top: u(y), width: u(w), height: u(h), ...extra })

// mesma caixa, medida a partir da borda direita (palco da direita)
export const atR = (
  x: number,
  y: number,
  w: number,
  h: number,
  extra: Record<string, string | number> = {},
) => vars({ right: u(x), top: u(y), width: u(w), height: u(h), ...extra })

// Pixel art: um <path> por cor, juntando pixels vizinhos da mesma cor em
// retângulos horizontais
export type Sprite = { w: number; h: number; paths: [string, string][] }

// a partir de uma função (x, y) → cor | null
export const spriteFn = (
  w: number,
  h: number,
  color: (x: number, y: number) => string | null,
): Sprite => {
  const out: Record<string, string> = {}
  for (let y = 0; y < h; y++) {
    let x = 0
    while (x < w) {
      const c = color(x, y)
      if (!c) {
        x++
        continue
      }
      let e = x + 1
      while (e < w && color(e, y) === c) e++
      out[c] = (out[c] ?? '') + `M${x} ${y}h${e - x}v1h-${e - x}z`
      x = e
    }
  }
  return { w, h, paths: Object.entries(out) }
}

// a partir de linhas de texto: cada caractere é um pixel da cor em `colors`
export const sprite = (
  rows: string[],
  colors: Record<string, string>,
): Sprite =>
  spriteFn(
    Math.max(...rows.map((r) => r.length)),
    rows.length,
    (x, y) => colors[rows[y][x] ?? '.'] ?? null,
  )
