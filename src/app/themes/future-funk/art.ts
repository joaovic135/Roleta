// Geometria gerada da cidade (tudo calculado uma vez, no carregamento do
// módulo, com sorteio de semente fixa). Formas iguais da mesma cor viram um
// único <path>; o Scene.tsx só monta as camadas.

export const seeded = (seed: number) => () => {
  seed = (seed + 0x6d2b79f5) | 0
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}
export const n = (v: number) => Math.round(v * 10) / 10
export const rect = (x: number, y: number, w: number, h: number) =>
  `M${n(x)} ${n(y)}h${n(w)}v${n(h)}h${n(-w)}z`
export const rrect = (x: number, y: number, w: number, h: number, r: number) =>
  `M${n(x + r)} ${n(y)}h${n(w - 2 * r)}a${r} ${r} 0 0 1 ${r} ${r}v${n(h - 2 * r)}a${r} ${r} 0 0 1 ${-r} ${r}h${n(2 * r - w)}a${r} ${r} 0 0 1 ${-r} ${-r}v${n(2 * r - h)}a${r} ${r} 0 0 1 ${r} ${-r}z`
export const circle = (x: number, y: number, r: number) =>
  `M${n(x - r)} ${n(y)}a${n(r)} ${n(r)} 0 1 0 ${n(2 * r)} 0a${n(r)} ${n(r)} 0 1 0 ${n(-2 * r)} 0z`
// brilho de anime: estrela de 4 pontas com lados curvos
export const sparkle = (x: number, y: number, s: number) =>
  `M${n(x)} ${n(y - s)}Q${n(x)} ${n(y)} ${n(x + s)} ${n(y)}Q${n(x)} ${n(y)} ${n(x)} ${n(y + s)}Q${n(x)} ${n(y)} ${n(x - s)} ${n(y)}Q${n(x)} ${n(y)} ${n(x)} ${n(y - s)}Z`
export const poly = (pts: [number, number][]) =>
  `M${pts.map(([x, y]) => `${n(x)} ${n(y)}`).join('L')}Z`
export const heart = (x: number, y: number, s: number) =>
  `M${n(x)} ${n(y + s * 0.9)}C${n(x - s * 0.6)} ${n(y + s * 0.45)} ${n(x - s)} ${n(y + s * 0.1)} ${n(x - s)} ${n(y - s * 0.3)}A${n(s * 0.5)} ${n(s * 0.5)} 0 0 1 ${n(x)} ${n(y - s * 0.45)}A${n(s * 0.5)} ${n(s * 0.5)} 0 0 1 ${n(x + s)} ${n(y - s * 0.3)}C${n(x + s)} ${n(y + s * 0.1)} ${n(x + s * 0.6)} ${n(y + s * 0.45)} ${n(x)} ${n(y + s * 0.9)}Z`

export const INK = '#2b1055'

// ============ Bordas da cidade ============
// Cada lateral é um "palco" de 480×1000 unidades colado no canto de baixo da
// tela (1 unidade = --ff-u, ver theme.css). O lado direito é desenhado
// espelhado: x = 480 é a borda direita da tela.
export const SW = 480
export const GROUND = 1000

export const DAY = ['#ff9ad2', '#ffffff', '#cfb6ff', '#fff1a6', '#ffc6e5']
export const NIGHT = ['#55278f', '#3d1b74', '#341862', '#4a2180', '#45207a']
export const LIT = ['#ffe14d', '#ff8fd0', '#ffe14d', '#7ff3ff', '#ffd27a']

type Box = [number, number, number, number]
interface Bld {
  x: number
  w: number
  top: number
  tone: number
  roof?: 'dome' | 'step' | 'tank' | 'antenna'
  band?: boolean
  neon?: string
}
export interface Board {
  x: number
  y: number
  w: number
  h: number
  panel: string
  text: string
  words: string[]
  delay: number
}
interface SideSpec {
  seed: number
  mirror: boolean
  blds: Bld[]
  boards: Board[]
  // caixas sem janelas (atrás dos atores e dos enfeites)
  keepOut: Box[]
}

export const LEFT_SPEC: SideSpec = {
  seed: 1985,
  mirror: false,
  blds: [
    { x: 404, w: 96, top: 770, tone: 0, roof: 'step' },
    { x: 316, w: 100, top: 690, tone: 3, roof: 'antenna', neon: '#7ff3ff' },
    { x: 204, w: 124, top: 590, tone: 2, roof: 'tank' },
    { x: 114, w: 102, top: 468, tone: 1, roof: 'step', band: true },
    { x: -10, w: 136, top: 282, tone: 0, band: true, neon: '#ff6fd0' },
  ],
  boards: [
    {
      x: 10,
      y: 352,
      w: 108,
      h: 56,
      panel: '#ffe14d',
      text: INK,
      words: ['ファンク', 'ポップ', '夏'],
      delay: 0,
    },
  ],
  // a garota cobre o canto de baixo
  keepOut: [[-20, 500, 330, 500]],
}

export const RIGHT_SPEC: SideSpec = {
  seed: 1991,
  mirror: true,
  blds: [
    { x: 404, w: 96, top: 790, tone: 2, roof: 'tank' },
    { x: 310, w: 104, top: 700, tone: 1, roof: 'step', neon: '#ff6fd0' },
    { x: 206, w: 114, top: 612, tone: 3, roof: 'antenna' },
    { x: 106, w: 110, top: 516, tone: 0, band: true },
    { x: -10, w: 140, top: 300, tone: 2, band: true, neon: '#7ff3ff' },
  ],
  boards: [
    {
      x: 10,
      y: 514,
      w: 106,
      h: 54,
      panel: '#ff6fb5',
      text: '#ffffff',
      words: ['シティ', 'ラブ', 'ドライブ'],
      delay: -2.3,
    },
  ],
  // telão do equalizador e o coqueiro na frente
  keepOut: [
    [2, 362, 126, 140],
    [-10, 640, 200, 380],
  ],
}

export interface Side {
  dayFill: string[]
  nightFill: string[]
  bands: string
  outline: string
  winDay: string
  winGlint: string
  winDark: string
  // janelas acesas em dois grupos (acendem em momentos diferentes)
  litA: string[]
  litB: string[]
  neon: { d: string; color: string }[]
  bulbs: string
  boards: Board[]
}

export const buildSide = (spec: SideSpec): Side => {
  const rand = seeded(spec.seed)
  const mx = (x: number, w = 0) => (spec.mirror ? SW - x - w : x)
  const R = (x: number, y: number, w: number, h: number) =>
    rect(mx(x, w), y, w, h)
  const dayFill = DAY.map(() => '')
  const nightFill = DAY.map(() => '')
  let bands = ''
  let outline = ''
  let winDay = ''
  let winGlint = ''
  let winDark = ''
  const litA = LIT.map(() => '')
  const litB = LIT.map(() => '')
  const neon: { d: string; color: string }[] = []
  const keep: Box[] = [
    ...spec.keepOut,
    ...spec.boards.map((b) => [b.x - 10, b.y - 12, b.w + 20, b.h + 24] as Box),
  ]
  const blocked = (x: number, y: number, w: number, h: number) =>
    keep.some(
      ([kx, ky, kw, kh]) =>
        x < kx + kw && x + w > kx && y < ky + kh && y + h > ky,
    )

  for (const b of spec.blds) {
    const body = R(b.x, b.top, b.w, GROUND - b.top + 4)
    let shape = body
    if (b.roof === 'dome') {
      const x0 = mx(b.x, b.w)
      shape += `M${n(x0)} ${b.top}A${n(b.w / 2)} ${n(b.w * 0.42)} 0 0 1 ${n(x0 + b.w)} ${b.top}Z`
    } else if (b.roof === 'step') {
      shape += R(b.x + b.w * 0.18, b.top - 34, b.w * 0.64, 36)
    } else if (b.roof === 'tank') {
      // caixa d'água redonda sobre pernas
      shape += R(b.x + b.w * 0.55, b.top - 16, 4, 18)
      shape += R(b.x + b.w * 0.55 + 26, b.top - 16, 4, 18)
      shape += rrect(mx(b.x + b.w * 0.5, 40), b.top - 52, 40, 38, 12)
    } else if (b.roof === 'antenna') {
      shape += R(b.x + b.w * 0.3, b.top - 70, 5, 72)
      shape += R(b.x + b.w * 0.3 - 10, b.top - 50, 25, 4)
    }
    dayFill[b.tone] += shape
    nightFill[b.tone] += shape
    outline += shape
    if (b.neon) {
      // tubo de neon na quina do telhado (só aparece de noite)
      const x0 = mx(b.x, b.w)
      neon.push({
        d: `M${n(x0 + 4)} ${b.top + 7}h${n(b.w - 8)}`,
        color: b.neon,
      })
    }
    if (b.band) {
      const band = R(b.x, b.top + 16, b.w, 14)
      bands += band
      outline += band
      keep.push([b.x, b.top + 6, b.w, 34])
    }
    // janelas em grade; cada andar tem um "humor" (aceso, apagado)
    const cols = Math.max(1, Math.floor((b.w - 18) / 26))
    const pad = (b.w - cols * 26 + 12) / 2
    for (let y = b.top + 50; y < GROUND - 36; y += 36) {
      const floor = rand()
      const group = rand() < 0.5 ? litA : litB
      for (let c = 0; c < cols; c++) {
        const x = b.x + pad + c * 26
        if (blocked(x, y, 14, 20)) continue
        const w = rrect(mx(x, 14), y, 14, 20, 3)
        winDay += w
        if (rand() < 0.35) winGlint += R(x + 3, y + 3, 3, 9)
        if (rand() < (floor < 0.6 ? 0.66 : 0.3))
          group[Math.floor(rand() * LIT.length)] += w
        else winDark += w
      }
    }
  }

  // outdoors: lâmpadas no contorno (acesas de noite)
  let bulbs = ''
  const boards = spec.boards.map((b) => {
    for (let x = b.x + 4; x <= b.x + b.w - 4; x += 12) {
      for (const y of [b.y - 7, b.y + b.h + 7]) bulbs += circle(mx(x), y, 2.6)
    }
    return { ...b, x: mx(b.x, b.w) }
  })

  return {
    dayFill,
    nightFill,
    bands,
    outline,
    winDay,
    winGlint,
    winDark,
    litA,
    litB,
    neon,
    bulbs,
    boards,
  }
}

export const LEFT = buildSide(LEFT_SPEC)
export const RIGHT = buildSide(RIGHT_SPEC)

// atores do palco (coordenadas já no lado certo da tela)
export const VINYL = { x: 66, y: 196, r: 56 }
// fita cassete gigante no telhado da direita (x medido da borda direita)
export const CASS = { x: SW - 8 - 132, y: 198, w: 132, h: 86 }
// telão do equalizador na fachada da direita
export const EQ = { x: SW - 10 - 112, y: 372, w: 112, h: 118 }

// ============ Cidade distante (atrás da interface; aparece nas frestas) ============
export const FAR = (() => {
  const rand = seeded(77)
  const day = ['', '']
  let lights = ''
  for (let x = -20, i = 0; x < 1620; i++) {
    const w = 46 + rand() * 70
    const h = 90 + rand() * 170
    const d = rect(x, 400 - h, w, h + 4)
    day[i % 2] += d
    for (let y = 400 - h + 14; y < 392; y += 16)
      for (let wx = x + 8; wx < x + w - 10; wx += 12)
        if (rand() < 0.22) lights += rect(wx, y, 5, 6)
    x += w - 4
  }
  return { day, lights }
})()

// ============ Torres que espiam por cima dos cartões ============
export const SPHERE = (() => {
  const hw = (y: number) => 18 + ((y - 170) / 830) * 46
  let body = poly([
    [100 - hw(170), 170],
    [100 + hw(170), 170],
    [100 + hw(1004), 1004],
    [100 - hw(1004), 1004],
  ])
  let bands = ''
  for (let y = 200; y < 1000; y += 70)
    bands += poly([
      [100 - hw(y), y],
      [100 + hw(y), y],
      [100 + hw(y + 24), y + 24],
      [100 - hw(y + 24), y + 24],
    ])
  body += rect(92, 96, 16, 80)
  const deck = rrect(56, 316, 88, 30, 10)
  const sphere = circle(100, 72, 31)
  const ring = `M58 80a42 9 0 1 0 84 0a42 9 0 1 0 -84 0z`
  const antenna = rect(98, 0, 4, 44)
  const silhouette = body + deck + antenna
  let dots = ''
  for (let i = 0; i < 9; i++) {
    const a = (i / 8) * Math.PI
    dots += circle(100 - Math.cos(a) * 40, 80 + Math.sin(a) * 8, 2.4)
  }
  let deckWin = ''
  for (let x = 64; x < 138; x += 12) deckWin += rect(x, 324, 7, 12)
  return { body, bands, deck, sphere, ring, antenna, silhouette, dots, deckWin }
})()

export const LATTICE = (() => {
  const hw = (y: number) => 5 + 64 * Math.pow(Math.max(0, y - 150) / 850, 1.5)
  const pts = (side: -1 | 1, off: number) => {
    const p: [number, number][] = []
    for (let y = 150; y <= 1004; y += 50)
      p.push([100 + side * (hw(y) + off), y])
    return p
  }
  const leg = (side: -1 | 1) => {
    const outer = pts(side, 5)
    const inner = pts(side, -4).reverse()
    return poly([...outer, ...inner])
  }
  const legs = leg(-1) + leg(1)
  let brace = ''
  for (let y = 980; y > 190; y -= 46) {
    const y2 = y - 46
    brace += `M${n(100 - hw(y))} ${y}L${n(100 + hw(y2))} ${y2}M${n(100 + hw(y))} ${y}L${n(100 - hw(y2))} ${y2}`
  }
  const deckBig = rrect(100 - hw(560) - 14, 540, 2 * (hw(560) + 14), 30, 6)
  const deckTop = rrect(100 - hw(250) - 12, 236, 2 * (hw(250) + 12), 22, 6)
  const antenna = rect(97, 6, 6, 150)
  let antBands = ''
  for (let y = 20; y < 150; y += 28) antBands += rect(97, y, 6, 12)
  let deckWin = ''
  for (let x = 100 - hw(560) - 6; x < 100 + hw(560) + 6; x += 11)
    deckWin += rect(x, 549, 6, 10)
  for (let x = 100 - hw(250) - 5; x < 100 + hw(250) + 5; x += 10)
    deckWin += rect(x, 242, 5, 9)
  let edge = ''
  for (let y = 300; y < 1000; y += 90) {
    edge += circle(100 - hw(y) - 5, y, 2.2) + circle(100 + hw(y) + 5, y, 2.2)
  }
  const silhouette = legs + deckBig + deckTop + antenna
  return {
    legs,
    brace,
    deckBig,
    deckTop,
    antenna,
    antBands,
    deckWin,
    edge,
    silhouette,
  }
})()

// ============ Céu ============
export const STARS = (() => {
  const rand = seeded(9)
  let dots = ''
  let a = ''
  let b = ''
  for (let i = 0; i < 90; i++)
    dots += circle(rand() * 1600, rand() * 560, 0.8 + rand() * 1.4)
  for (let i = 0; i < 22; i++) {
    const s = sparkle(rand() * 1600, 10 + rand() * 520, 5 + rand() * 7)
    if (i % 2) a += s
    else b += s
  }
  return { dots, a, b }
})()

// nuvem de anime: bolhas unidas com base reta; o miolo claro dá o volume
const cloudShape = (seed: number) => {
  const rand = seeded(seed)
  const puffs: [number, number, number][] = []
  const count = 4 + Math.floor(rand() * 3)
  for (let i = 0; i < count; i++) {
    const t = i / (count - 1)
    const r = 22 + Math.sin(t * Math.PI) * 26 + rand() * 10
    puffs.push([30 + t * 180, 92 - r * 0.7, r])
  }
  let all = rrect(16, 70, 208, 26, 13)
  let top = ''
  for (const [x, y, r] of puffs) {
    all += circle(x, y, r)
    top += circle(x - 2, y - 4, r - 5)
  }
  return { all, top }
}
// o vento sopra da direita: as nuvens vão para a esquerda
export const CLOUDS = [
  {
    seed: 3,
    top: '1vh',
    w: 'clamp(110px, 12vw, 220px)',
    dur: 150,
    delay: -20,
    far: false,
  },
  {
    seed: 8,
    top: '6vh',
    w: 'clamp(80px, 8vw, 150px)',
    dur: 230,
    delay: -150,
    far: true,
  },
  {
    seed: 13,
    top: '0vh',
    w: 'clamp(70px, 7vw, 130px)',
    dur: 210,
    delay: -60,
    far: true,
  },
  {
    seed: 21,
    top: '4vh',
    w: 'clamp(120px, 13vw, 240px)',
    dur: 170,
    delay: -110,
    far: false,
  },
  {
    seed: 34,
    top: '30vh',
    w: 'clamp(100px, 10vw, 190px)',
    dur: 190,
    delay: -40,
    far: false,
  },
].map((c) => ({ ...c, ...cloudShape(c.seed) }))

// ============ Gotas da garoa de sol (ladrilho SVG repetido) ============
const dropTile = (
  seed: number,
  w: number,
  h: number,
  count: number,
  s0: number,
) => {
  const rand = seeded(seed)
  const body = ['', '']
  let shine = ''
  for (let i = 0; i < count; i++) {
    const x = 10 + rand() * (w - 20)
    const y = 16 + rand() * (h - 28)
    const s = s0 * (0.75 + rand() * 0.5)
    body[i % 2] +=
      `M${n(x)} ${n(y - 10 * s)}C${n(x + s)} ${n(y - 5 * s)} ${n(x + 3.4 * s)} ${n(y - 2 * s)} ${n(x + 3.4 * s)} ${n(y + 0.6 * s)}` +
      `A${n(3.4 * s)} ${n(3.4 * s)} 0 0 1 ${n(x - 3.4 * s)} ${n(y + 0.6 * s)}C${n(x - 3.4 * s)} ${n(y - 2 * s)} ${n(x - s)} ${n(y - 5 * s)} ${n(x)} ${n(y - 10 * s)}Z`
    shine += circle(x - 1.3 * s, y - 0.4 * s, 0.95 * s)
  }
  const svg =
    `<svg xmlns='http://www.w3.org/2000/svg' width='${w}' height='${h}'>` +
    `<path d='${body[0]}' fill='#e3fbff' fill-opacity='.9' stroke='#38bdf8' stroke-width='1.2'/>` +
    `<path d='${body[1]}' fill='#ffe6f4' fill-opacity='.9' stroke='#ff4fa3' stroke-width='1.2'/>` +
    `<path d='${shine}' fill='#fff'/></svg>`
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`
}
export const DROPS_FAR = dropTile(11, 220, 260, 9, 0.8)
export const DROPS_NEAR = dropTile(12, 340, 420, 7, 1.5)

// ============ Ruído de fita (ladrilhos SVG estáticos) ============
// riscos horizontais claros: chiado de troca de cabeça e faixas de tracking
const streakTile = (seed: number, w: number, h: number, count: number) => {
  const rand = seeded(seed)
  let lite = ''
  let dark = ''
  let tint = ''
  for (let i = 0; i < count; i++) {
    const y = Math.floor(rand() * h)
    const x = rand() * w
    const len = 8 + rand() * rand() * 160
    const th = rand() < 0.7 ? 1 : 2
    const r = rand()
    const d = `M${n(x)} ${y}h${n(len)}v${th}h${n(-len)}z`
    if (r < 0.62) lite += d
    else if (r < 0.82) tint += d
    else dark += d
  }
  const svg =
    `<svg xmlns='http://www.w3.org/2000/svg' width='${w}' height='${h}'>` +
    `<path d='${lite}' fill='#fff' fill-opacity='.9'/>` +
    `<path d='${tint}' fill='#7ff3ff' fill-opacity='.8'/>` +
    `<path d='${dark}' fill='#2b1055' fill-opacity='.35'/></svg>`
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`
}
export const STREAKS = streakTile(5, 640, 48, 150)
export const STREAKS_THIN = streakTile(6, 520, 16, 70)

// grão do VHS: pontinhos claros e escuros espalhados
export const GRAIN = (() => {
  const rand = seeded(88)
  let lite = ''
  let dark = ''
  for (let i = 0; i < 520; i++) {
    const x = Math.floor(rand() * 256)
    const y = Math.floor(rand() * 256)
    const d = `M${x} ${y}h${rand() < 0.3 ? 2 : 1}v1h-1z`
    if (rand() < 0.6) lite += d
    else dark += d
  }
  const svg =
    `<svg xmlns='http://www.w3.org/2000/svg' width='256' height='256'>` +
    `<path d='${lite}' fill='#fff'/>` +
    `<path d='${dark}' fill='#2b1055' fill-opacity='.6'/></svg>`
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`
})()

// ============ Trem na via elevada ============
export const TW = 2400
export const TH = 56
export const TRACK = (() => {
  let seams = ''
  for (let x = 40; x < TW; x += 80) seams += `M${x} 44v12`
  let rivets = ''
  for (let x = 20; x < TW; x += 40) rivets += circle(x, 50, 1.6)
  let posts = ''
  for (let x = 120; x < TW; x += 240) posts += rect(x, 56, 14, 10)
  return { seams, rivets, posts }
})()

export const trainPaths = (cars: number) => {
  let body = ''
  let windows = ''
  let stripe = ''
  let stripe2 = ''
  let gaps = ''
  const L = 112
  for (let c = 0; c < cars; c++) {
    const x = c * (L + 6)
    const nose = c === cars - 1
    body += nose
      ? `M${x} 18h${L - 34}q30 0 34 22v2h-${L}z`
      : rrect(x, 18, L, 24, 5)
    stripe += rect(x, 31, nose ? L - 6 : L, 4)
    stripe2 += rect(x, 35, nose ? L - 3 : L, 2.5)
    for (let wx = x + 10; wx < x + (nose ? L - 40 : L - 14); wx += 18)
      windows += rrect(wx, 22, 11, 7, 2)
    if (nose) windows += `M${x + L - 32} 22h10q12 1 16 8h-26z`
    if (c) gaps += rect(x - 6, 24, 6, 14)
    gaps += rect(x + 30, 15, 22, 3)
  }
  const len = cars * (L + 6)
  return { body, windows, stripe, stripe2, gaps, len }
}
