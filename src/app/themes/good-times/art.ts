import type { CSSProperties } from 'react'

// Geometria do tema Good Times, calculada uma vez no carregamento do módulo
// (sorteios com semente fixa: a cena é sempre a mesma).

export const seeded = (seed: number) => () => {
  seed = (seed + 0x6d2b79f5) | 0
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}
export const r1 = (n: number) => Math.round(n * 10) / 10
export const vars = (v: Record<string, string | number>) => v as CSSProperties

// Contorno Memphis e cores pastel do pôster
export const INK = '#1b1726'
export const PINK = '#ff8fcf'
export const HOT = '#ff4fae'
export const CYAN = '#7fe3ff'
export const SKY = '#bdf3ff'
export const YELLOW = '#fff36b'
export const LILAC = '#c4a6ff'
export const MINT = '#8ff0c1'
export const PEACH = '#ffc2a3'

export type Pt = [number, number]

// ---- Palmeira (silhueta própria) -------------------------------------------

const quad = (a: Pt, b: Pt, c: Pt, t: number): Pt => [
  (1 - t) ** 2 * a[0] + 2 * (1 - t) * t * b[0] + t * t * c[0],
  (1 - t) ** 2 * a[1] + 2 * (1 - t) * t * b[1] + t * t * c[1],
]
const CROWN: Pt = [120, 92]
// [ângulo, comprimento, queda da ponta, arco do meio, largura]
const FRONDS = [
  [-166, 98, 48, 24, 12],
  [-138, 92, 16, 24, 12],
  [-108, 70, 2, 10, 10],
  [-72, 78, 6, 14, 10],
  [-40, 98, 22, 24, 12],
  [-12, 96, 52, 22, 12],
  [172, 78, 62, 14, 10],
]
// Folha arqueada: borda de cima lisa e folíolos pendurados embaixo
export const PALM_LEAVES = FRONDS.map(([deg, len, droop, arch, width]) => {
  const a = (deg * Math.PI) / 180
  const dir: Pt = [Math.cos(a), Math.sin(a)]
  const tip: Pt = [CROWN[0] + dir[0] * len, CROWN[1] + dir[1] * len + droop]
  const mid: Pt = [
    CROWN[0] + dir[0] * len * 0.55,
    CROWN[1] + dir[1] * len * 0.55 - arch,
  ]
  const up: Pt = dir[0] >= 0 ? [dir[1], -dir[0]] : [-dir[1], dir[0]]
  const w = (t: number) => width * Math.sin(Math.PI * t) ** 0.7
  const at = (t: number, off: number, drop = 0) => {
    const [x, y] = quad(CROWN, mid, tip, t)
    return `${r1(x + up[0] * off)} ${r1(y + up[1] * off + drop)}`
  }
  const steps = 9
  const upper: string[] = []
  const lower: string[] = []
  for (let i = 0; i <= steps; i++) {
    const t = i / steps
    upper.push(at(t, w(t) * 0.45))
    lower.push(at(t, -w(t) * 0.2))
    if (i < steps) {
      const tt = t + 0.6 / steps
      lower.push(at(tt, -w(tt) * 1.25, w(tt) * 0.9))
    }
  }
  return `M${upper.join('L')}L${lower.reverse().join('L')}Z`
}).join('')

export const PALM_TRUNK = 'M90 320Q94 200 114 94L126 96Q110 200 110 320Z'
export const PALM_RINGS = (() => {
  let d = ''
  for (let i = 1; i < 10; i++) {
    const [x, y] = quad([100, 320], [102, 200], CROWN, i / 10)
    const w = 19 - i * 0.8
    d += `M${r1(x - w / 2)} ${r1(y)}q${r1(w / 2)} 4 ${r1(w)} 0`
  }
  return d
})()
export const PALM_NUTS =
  'M110 98a6 6 0 1 0 12 0a6 6 0 1 0-12 0M121 102a6 6 0 1 0 12 0a6 6 0 1 0-12 0'

// ---- Formas Memphis planas --------------------------------------------------

export const DOT_DISC = (() => {
  let d = ''
  for (let y = 14; y <= 86; y += 12)
    for (let x = 14; x <= 86; x += 12)
      if ((x - 50) ** 2 + (y - 50) ** 2 <= 38 ** 2) d += `M${x} ${y}h0`
  return d
})()

export const SPARKLE =
  'M50 0Q52.5 47.5 100 50Q52.5 52.5 50 100Q47.5 52.5 0 50Q47.5 47.5 50 0Z'

// ---- Confete parado (traços curtos), um <path> por cor ---------------------

export const CONFETTI_COLORS = [
  'pink',
  'cyan',
  'yellow',
  'lilac',
  'mint',
  'ink',
] as const

// Bordas da tela: o centro fica calmo (lá ficam os cards)
const edgePoint = (rand: () => number): Pt => {
  for (;;) {
    const x = rand() * 1000
    const y = rand() * 1000
    const center = x > 120 && x < 900 && y > 110 && y < 930
    if (!center || rand() < 0.06) return [x, y]
  }
}
export const confetti = (seed: number, count: number, len: number) => {
  const rand = seeded(seed)
  const byColor: Record<string, string> = {}
  for (let i = 0; i < count; i++) {
    const [x, y] = edgePoint(rand)
    const color = CONFETTI_COLORS[Math.floor(rand() * CONFETTI_COLORS.length)]
    const a = rand() * Math.PI
    const l = rand() < 0.3 ? 0 : len * (0.6 + rand() * 0.8)
    byColor[color] =
      (byColor[color] ?? '') +
      `M${r1(x)} ${r1(y)}l${r1(Math.cos(a) * l * 0.55)} ${r1(Math.sin(a) * l)}`
  }
  return Object.entries(byColor)
}

export const stars = (seed: number, count: number) => {
  const rand = seeded(seed)
  let d = ''
  for (let i = 0; i < count; i++) {
    const [x, y] = edgePoint(rand)
    d += `M${r1(x)} ${r1(y * 0.8)}h0`
  }
  return d
}

// ---- Pista de dança xadrez em perspectiva (faixa de baixo) ----------------
// viewBox 0 0 1000 100 esticado na largura: horizonte em y=0, borda de
// frente em y=100, ponto de fuga acima do centro. Ladrilhos da mesma cor
// num <path> só; dois grupos de ladrilhos acendem alternados no ritmo.

const VP_Y = -300
const COL_W = 1000 / 16
const ROWS = [100, 68, 42, 21, 5, 0]
const fx = (xb: number, y: number) =>
  500 + ((xb - 500) * (y - VP_Y)) / (100 - VP_Y)
export const FLOOR = (() => {
  let pink = ''
  let litA = ''
  let litB = ''
  let lines = ''
  for (let i = -14; i <= 30; i++) {
    const xa = i * COL_W - 500
    const xb = xa + COL_W
    for (let j = 0; j < ROWS.length - 1; j++) {
      const y0 = ROWS[j]
      const y1 = ROWS[j + 1]
      const q =
        `M${r1(fx(xa, y0))} ${y0}L${r1(fx(xb, y0))} ${y0}` +
        `L${r1(fx(xb, y1))} ${y1}L${r1(fx(xa, y1))} ${y1}Z`
      if ((i + j) % 2 === 0) {
        pink += q
        const k = (((i - j) % 4) + 4) % 4
        if (k === 0) litA += q
        else if (k === 2) litB += q
      }
    }
    lines += `M${r1(fx(xa, 100))} 100L${r1(fx(xa, 0))} 0`
  }
  for (const y of ROWS.slice(1, -1)) lines += `M-200 ${y}H1200`
  return { pink, litA, litB, lines }
})()

// ---- Varal de lâmpadas (faixa de cima) -------------------------------------
// Duas catenárias: da borda esquerda até o globo espelhado e dele até a
// borda direita. x em % da largura; y em unidades de 0..100 da faixa
// (a faixa tem 12vh de altura no CSS).

export const BALL_X = 64
const sag = (x0: number, y0: number, x1: number, y1: number, drop: number) => {
  const f = (t: number): Pt => [
    x0 + (x1 - x0) * t,
    y0 + (y1 - y0) * t + drop * 4 * t * (1 - t),
  ]
  return f
}
const WIRE_L = sag(-2, 10, BALL_X, 6, 52)
const WIRE_R = sag(BALL_X, 6, 102, 18, 40)
export const WIRES = (() => {
  let d = ''
  for (const f of [WIRE_L, WIRE_R]) {
    const pts: string[] = []
    for (let i = 0; i <= 40; i++) {
      const [x, y] = f(i / 40)
      pts.push(`${r1(x * 10)} ${r1(y)}`)
    }
    d += `M${pts.join('L')}`
  }
  return d
})()

const BULB_COLORS = [PINK, YELLOW, CYAN, MINT, LILAC, PEACH]
export type Bulb = { x: number; y: number; color: string; group: number }
export const BULBS: Bulb[] = (() => {
  const out: Bulb[] = []
  const put = (f: (t: number) => Pt, n: number) => {
    for (let i = 1; i < n; i++) {
      const [x, y] = f(i / n)
      if (x < 0.5 || x > 99.5) continue
      out.push({
        x: r1(x),
        y: r1(y),
        color: BULB_COLORS[out.length % BULB_COLORS.length],
        group: out.length % 3,
      })
    }
  }
  put(WIRE_L, 20)
  put(WIRE_R, 12)
  return out
})()

// ---- Reflexos do globo espelhado -------------------------------------------
// Ladrilho de 240×240 com pontinhos de luz coloridos (núcleo branco),
// repetido num disco grande que gira em volta do globo.

// SVG pequeno virando url() de CSS (escapa # < > para o data URI)
const svgUrl = (w: number, h: number, inner: string) =>
  `url("data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='${w}' height='${h}'>${inner}</svg>`,
  )}")`

const FLECK_COLORS = ['#ff6fbf', '#2ec9f0', '#f5d800', '#9a7cf0', '#3fd99a']
const flecks = (seed: number, n: number, big: number) => {
  const rand = seeded(seed)
  let s = ''
  for (let i = 0; i < n; i++) {
    const x = r1(8 + rand() * 224)
    const y = r1(8 + rand() * 224)
    const r = r1(2.2 + rand() * big)
    const c = FLECK_COLORS[i % FLECK_COLORS.length]
    s +=
      `<circle cx='${x}' cy='${y}' r='${r1(r * 2.2)}' fill='${c}' opacity='.28'/>` +
      `<circle cx='${x}' cy='${y}' r='${r}' fill='${c}'/>` +
      `<circle cx='${x}' cy='${y}' r='${r1(r * 0.42)}' fill='#fff'/>`
  }
  return svgUrl(240, 240, s)
}
export const FLECKS_SLOW = flecks(31, 7, 3.4)
export const FLECKS_FAST = flecks(57, 9, 2.6)

// Facetas do globo: ladrilho 4×4 de espelhinhos em tons de lilás e pastel
export const FACETS = (() => {
  const rand = seeded(404)
  const tones = [
    '#f4f1fb',
    '#d9d3ea',
    '#bfb6d8',
    '#ffffff',
    '#ffd6ef',
    '#c9f3ff',
    '#fffbc2',
    '#a99fc6',
    '#e9e4f5',
  ]
  let s = ''
  for (let y = 0; y < 4; y++)
    for (let x = 0; x < 4; x++) {
      const c = tones[Math.floor(rand() * tones.length)]
      s += `<rect x='${x * 10}' y='${y * 10}' width='10' height='10' fill='${c}'/>`
    }
  s +=
    `<path d='M0 .5H40M0 10.5H40M0 20.5H40M0 30.5H40M.5 0V40M10.5 0V40` +
    `M20.5 0V40M30.5 0V40' stroke='#7d7398' stroke-width='1'/>`
  return svgUrl(40, 40, s)
})()

// ---- Fogos Memphis (noite): raios de formas saindo do centro -------------

export const burst = (seed: number, n: number) => {
  const rand = seeded(seed)
  let tri = ''
  let dot = ''
  let dash = ''
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + rand() * 0.3
    const d = 30 + rand() * 16
    const x = 50 + Math.cos(a) * d
    const y = 50 + Math.sin(a) * d
    const k = i % 3
    // anel de dentro: pontinhos a meio caminho (estouro em dois tempos)
    const di = 14 + rand() * 6
    dot += `M${r1(50 + Math.cos(a + 0.2) * di)} ${r1(50 + Math.sin(a + 0.2) * di)}h0`
    if (k === 0) {
      const s = 6
      tri += `M${r1(x)} ${r1(y - s)}l${s} ${r1(s * 1.6)}h${-s * 2}Z`
    } else if (k === 1) {
      dot += `M${r1(x)} ${r1(y)}h0`
    } else {
      const c = Math.cos(a)
      const sn = Math.sin(a)
      dash += `M${r1(50 + c * (d - 12))} ${r1(50 + sn * (d - 12))}L${r1(x)} ${r1(y)}`
    }
  }
  return { tri, dot, dash }
}
