import { n, seeded, sprite, spriteFn, type Sprite } from './lib'

// Arte calculada uma vez (no carregamento do módulo): céu em pixel art
// (estrelas, planeta anelado, nuvens rosa), skyline do fim do beco, as duas
// paredes em perspectiva e os sprites pequenos (gato, nave, invasores).

// ---------------------------------------------------------------- geometria
// Palcos laterais em unidades da cena (1000 = altura da tela). O ponto de
// fuga fica no meio da tela 16:9 (889, 500); as paredes vão da borda até
// WALL_X, onde o beco continua no fundo (camada central).
export const STAGE_W = 560
export const VP = { x: 889, y: 500 }
export const WALL_X = 330
export const BASE_Y = 930 // pé da parede na borda da tela
// y das arestas de cima e de baixo da parede em x (perspectiva)
export const wallTop = (x: number) => (VP.y * x) / VP.x
export const wallBase = (x: number) => BASE_Y - ((BASE_Y - VP.y) * x) / VP.x
// colunas das janelas: o espaçamento encolhe com a distância
const COLS = [6, 62, 108, 146, 178, 205, 228, 248, 265, 280, 293, 305, 316, 326]

// ---------------------------------------------------------------- estrelas
// céu em 1000×320 (preserveAspectRatio slice, preso no topo)
const starRects = (seed: number, count: number, max: number) => {
  const r = seeded(seed)
  let d = ''
  for (let i = 0; i < count; i++) {
    const x = Math.floor(r() * 1000)
    // mais densas no alto
    const y = Math.floor(Math.pow(r(), 1.5) * 320)
    const s = r() < 0.12 ? max : r() < 0.5 ? max / 2 : max / 3
    d += `M${x} ${y}h${n(s)}v${n(s)}h-${n(s)}z`
  }
  return d
}
// cruzes de pixel (estrelas grandes que cintilam)
const sparkles = (seed: number, count: number) => {
  const r = seeded(seed)
  let d = ''
  for (let i = 0; i < count; i++) {
    const x = Math.floor(r() * 980) + 10
    const y = Math.floor(Math.pow(r(), 1.3) * 220) + 6
    d += `M${x} ${y - 4}h1v3h3v1h-3v3h-1v-3h-3v-1h3z`
  }
  return d
}
export const STARS = {
  dim: starRects(11, 520, 2.4),
  a: starRects(23, 150, 3),
  b: starRects(37, 150, 3),
  sparkA: sparkles(5, 9),
  sparkB: sparkles(9, 9),
}

// ---------------------------------------------------------------- planeta
// Gigante gasoso magenta com anel, contraluz ciano e pontilhado ordenado
// (Bayer 4×4) entre as faixas de luz
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5]
const PLANET_TONES = [
  '#1b0838',
  '#341060',
  '#5a1784',
  '#8e22a6',
  '#c935ad',
  '#f565bd',
  '#ffb0dc',
]
export const PLANET: Sprite = (() => {
  const W = 150
  const H = 92
  const cx = 75
  const cy = 46
  const R = 30
  const tilt = (-16 * Math.PI) / 180
  const ct = Math.cos(tilt)
  const st = Math.sin(tilt)
  const ring = (x: number, y: number) => {
    const dx = x + 0.5 - cx
    const dy = y + 0.5 - cy
    const rx = dx * ct + dy * st
    const ry = -dx * st + dy * ct
    const e = Math.hypot(rx / 70, ry / 15)
    if (e > 1 || e < 0.66) return null
    // duas faixas com uma fenda no meio
    if (e > 0.84 && e < 0.88) return null
    return { front: ry > 0, outer: e > 0.88 }
  }
  return spriteFn(W, H, (x, y) => {
    const rg = ring(x, y)
    const dx = (x + 0.5 - cx) / R
    const dy = (y + 0.5 - cy) / R
    const inside = dx * dx + dy * dy <= 1
    if (rg && (rg.front || !inside)) {
      if (!rg.front && inside) return null
      const lit = (x - cx) * -0.4 + (y - cy) * -0.6
      return rg.outer
        ? lit > 4
          ? '#7ff6ff'
          : '#2bb8d6'
        : lit > 4
          ? '#ff9ad6'
          : '#b03a9e'
    }
    if (!inside) return null
    const dz = Math.sqrt(1 - dx * dx - dy * dy)
    // luz vinda de cima à esquerda
    let i = -0.5 * dx - 0.55 * dy + 0.67 * dz
    // faixas do gigante gasoso
    i += 0.13 * Math.sin(dy * 11 + Math.sin(dx * 3) * 1.4)
    // sombra do anel sobre o planeta (faixa fina abaixo do equador)
    const rdy = -(x + 0.5 - cx) * st + (y + 0.5 - cy) * ct
    if (rdy > 5 && rdy < 8.5) i -= 0.35
    // contraluz ciano na borda direita
    if (dz < 0.32 && dx > 0.42) return dz < 0.16 ? '#7ff6ff' : '#2a9fd0'
    const level = Math.max(0, Math.min(1, (i + 0.35) / 1.25)) * 6
    const base = Math.floor(level)
    const frac = level - base
    const t = BAYER[(y % 4) * 4 + (x % 4)] / 16
    return PLANET_TONES[Math.min(6, base + (frac > t ? 1 : 0))]
  })
})()

// ---------------------------------------------------------------- nuvens
// Nuvens de algodão-doce: bolhas somadas, topo iluminado de rosa claro,
// barriga violeta, borda de baixo em degraus
const CLOUD_TONES = ['#ffd6f2', '#ff9bd8', '#f064bd', '#b63d9f', '#6c2a86']
export const cloud = (seed: number, W: number, H: number, bumps: number) => {
  const r = seeded(seed)
  const blobs: [number, number, number][] = []
  for (let i = 0; i < bumps; i++) {
    const t = (i + 0.5) / bumps
    const rad = (0.32 + r() * 0.24) * H * (1 - Math.abs(t - 0.5) * 0.8)
    blobs.push([t * W, H - rad * 0.95 - r() * H * 0.08, rad])
  }
  const inside = (x: number, y: number) =>
    y < H - 2 &&
    blobs.some(([bx, by, br]) => (x - bx) ** 2 + (y - by) ** 2 <= br * br)
  return spriteFn(W, H, (x, y) => {
    if (!inside(x, y)) return null
    const t = BAYER[(y % 4) * 4 + (x % 4)] / 16
    if (!inside(x, y - 2)) return CLOUD_TONES[0]
    if (!inside(x - 1, y - 4)) return t < 0.5 ? CLOUD_TONES[0] : CLOUD_TONES[1]
    if (!inside(x, y + 3)) return CLOUD_TONES[4]
    // fica mais escura para baixo
    const k = y / H
    if (k < 0.45) return CLOUD_TONES[1]
    if (k < 0.62) return t < (k - 0.45) * 5 ? CLOUD_TONES[2] : CLOUD_TONES[1]
    if (k < 0.8) return t < (k - 0.62) * 5 ? CLOUD_TONES[3] : CLOUD_TONES[2]
    return CLOUD_TONES[3]
  })
}
export const CLOUDS = [
  cloud(71, 120, 34, 7),
  cloud(83, 90, 28, 5),
  cloud(97, 150, 40, 8),
  cloud(131, 70, 22, 4),
]

// ---------------------------------------------------------------- skyline
// Arranha-céus em pixel art no fim do beco (atrás da roleta), com janelas
// acesas em rosa, ciano e lilás e antenas
const SKY_TONES = ['#12082a', '#190c37', '#211045']
const WIN_TONES = ['#ff5fd2', '#4ff0ff', '#f3d9ff', '#8f7bff']
export const SKYLINE: Sprite = (() => {
  const W = 320
  const H = 170
  const r = seeded(404)
  type B = { x: number; w: number; h: number; tone: number; lit: number }
  const bs: B[] = []
  let x = 0
  while (x < W) {
    const w = 10 + Math.floor(r() * 18)
    const mid = 1 - Math.abs(x + w / 2 - W / 2) / (W / 2)
    const h = 40 + Math.floor(r() * 70 + mid * 50)
    bs.push({ x, w, h, tone: Math.floor(r() * 3), lit: 0.18 + r() * 0.2 })
    x += w - Math.floor(r() * 4)
  }
  const rw = seeded(77)
  const lit: Record<string, string | null> = {}
  return spriteFn(W, H, (px, py) => {
    // do mais alto para o mais baixo não importa: o último que cobre ganha
    let hit: B | null = null
    for (const b of bs)
      if (px >= b.x && px < b.x + b.w && py >= H - b.h) hit = b
    if (!hit) {
      // antenas nos prédios mais altos
      for (const b of bs)
        if (b.h > 115 && px === b.x + (b.w >> 1) && py >= H - b.h - 12)
          return py === H - b.h - 12 ? '#ff3b6b' : '#1e0f3d'
      return null
    }
    const lx = px - hit.x
    const ly = py - (H - hit.h)
    if (lx === 0) return '#33186a'
    if (ly < 2) return '#2a1456'
    // janelas: 1 px, a cada 2 colunas e 3 linhas, sorteadas uma vez
    if (lx % 2 === 1 && ly % 3 === 2 && lx < hit.w - 1) {
      const key = `${px},${py}`
      if (!(key in lit))
        lit[key] =
          rw() < hit.lit ? WIN_TONES[Math.floor(rw() * WIN_TONES.length)] : null
      if (lit[key]) return lit[key]
    }
    return SKY_TONES[hit.tone]
  })
})()

// ---------------------------------------------------------------- paredes
// Fachada de cada lado do beco, em perspectiva (viewBox STAGE_W×1000). As
// janelas são quadriláteros entre as colunas COLS, em andares (fração da
// altura da parede); algumas acesas.
const quad = (x0: number, x1: number, f0: number, f1: number) => {
  const y = (x: number, f: number) =>
    wallTop(x) + f * (wallBase(x) - wallTop(x))
  return `M${n(x0)} ${n(y(x0, f0))}L${n(x1)} ${n(y(x1, f0))}L${n(x1)} ${n(y(x1, f1))}L${n(x0)} ${n(y(x0, f1))}Z`
}
export type Wall = {
  face: string
  dark: string
  lit: [string, string][]
  ledges: string
  pipes: string
  shop: string
  shopLit: string
  ac: string
}
const FLOORS = [0.04, 0.15, 0.26, 0.37, 0.48, 0.59]
export const wall = (seed: number): Wall => {
  const r = seeded(seed)
  let dark = ''
  const lit: Record<string, string> = {}
  let ac = ''
  let ledges = ''
  for (let c = 0; c < COLS.length - 1; c++) {
    const x0 = COLS[c]
    const x1 = COLS[c + 1]
    const gap = (x1 - x0) * 0.22
    for (const f of FLOORS) {
      const d = quad(x0 + gap, x1 - gap, f + 0.015, f + 0.075)
      const k = r()
      if (k < 0.2) {
        const tone = ['#ff7ad9', '#6ff3ff', '#b69cff', '#ffc2e6'][
          Math.floor(r() * 4)
        ]
        lit[tone] = (lit[tone] ?? '') + d
      } else dark += d
      // ar-condicionado embaixo de algumas janelas
      if (k > 0.82 && c < 9)
        ac += quad(x0 + gap * 1.4, x1 - gap * 1.4, f + 0.08, f + 0.1)
    }
  }
  for (const f of FLOORS) ledges += quad(COLS[0], WALL_X, f + 0.098, f + 0.104)
  // canos verticais (perto e médio)
  const pipes = [38, 129, 216]
    .map((x) => `M${x} ${n(wallTop(x) + 4)}V${n(wallBase(x) - 4)}`)
    .join('')
  // térreo: portas de loja com luz, porta de aço
  const shop =
    quad(COLS[1] + 6, COLS[3] - 4, 0.72, 0.97) +
    quad(COLS[5], COLS[7], 0.74, 0.97)
  const shopLit =
    quad(COLS[8], COLS[10], 0.74, 0.97) +
    quad(COLS[3] + 4, COLS[4] + 6, 0.74, 0.97)
  return {
    face: `M0 0L${WALL_X} ${n(wallTop(WALL_X))}L${WALL_X} ${n(wallBase(WALL_X))}L0 ${BASE_Y}Z`,
    dark,
    lit: Object.entries(lit),
    ledges,
    pipes,
    shop,
    shopLit,
    ac,
  }
}
export const WALL_L = wall(301)
export const WALL_R = wall(733)

// fios atravessando o beco (camada central, viewBox 1778×1000)
export const WIRES =
  'M0 58Q450 150 889 96T1778 70' +
  'M0 120Q520 210 1000 150T1778 132' +
  'M180 0Q600 70 1240 38T1778 18'

// ---------------------------------------------------------------- sprites
export const CAT_A = sprite(
  [
    '...................k.k.',
    '..................kkkkk',
    '.kk...............kckck',
    'k..k..............kkkkk',
    'k..................kkk.',
    '.k...rrrrrrrrrrrrrkkk..',
    '..kkkkkkkkkkkkkkkkkkk..',
    '...kkkkkkkkkkkkkkkkk...',
    '...kkkkkkkkkkkkkkkkk...',
    '....kk.k........k.kk...',
    '....k...k......k...k...',
    '...k....k.....k.....k..',
    '..kk...kk....kk....kk..',
  ],
  { k: '#07030f', r: '#5b2f94', c: '#5ff3ff' },
)
export const CAT_B = sprite(
  [
    '...................k.k.',
    '..................kkkkk',
    '..k...............kckck',
    '.k.k..............kkkkk',
    '.k.................kkk.',
    '..k..rrrrrrrrrrrrrkkk..',
    '..kkkkkkkkkkkkkkkkkkk..',
    '...kkkkkkkkkkkkkkkkk...',
    '...kkkkkkkkkkkkkkkkk...',
    '.....kk.k......kk.k....',
    '.....k..k......k..k....',
    '.....k..k......k..k....',
    '....kk.kk.....kk.kk....',
  ],
  { k: '#07030f', r: '#5b2f94', c: '#5ff3ff' },
)

export const SHIP = sprite(
  [
    '.....w.....',
    '....wcw....',
    '....wcw....',
    '...wwwww...',
    '.p.wwbww.p.',
    'pwwwwwwwwwp',
    'pw.ww.ww.wp',
    '...o...o...',
  ],
  { w: '#e9f6ff', c: '#4ff0ff', b: '#3a7bff', p: '#ff4fc8', o: '#ffb35c' },
)
export const INVADER_A = sprite(
  [
    '..m.....m..',
    '...m...m...',
    '..mmmmmmm..',
    '.mm.mmm.mm.',
    'mmmmmmmmmmm',
    'm.mmmmmmm.m',
    'm.m.....m.m',
    '...mm.mm...',
  ],
  { m: '#ff4fc8' },
)
export const INVADER_B = sprite(
  [
    '..g.....g..',
    'g..g...g..g',
    'g.ggggggg.g',
    'ggg.ggg.ggg',
    'ggggggggggg',
    '.ggggggggg.',
    '..g.....g..',
    '.g.......g.',
  ],
  { g: '#5ff3ff' },
)
// moeda girando no letreiro do fliperama
export const COIN = sprite(
  [
    '..yyyy..',
    '.yhhhyy.',
    'yhyyyyoy',
    'yhy##yoy',
    'yhy##yoy',
    'yhyyyyoy',
    '.yyoooy.',
    '..yyyy..',
  ],
  { y: '#ff9ad6', h: '#fff0fa', o: '#c2369f', '#': '#7a1f78' },
)
