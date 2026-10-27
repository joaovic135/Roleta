// Cena do tema Homem-Aranha Pixel: cidade em pixel art 32-bit com ciclo de
// dia (madrugada -> dia -> pôr do sol -> noite) e clima (sol forte com lens
// flare, chuva com relâmpagos). Tudo é gerado aqui com um sorteio de semente
// fixa (igual no servidor e no navegador) e vira poucos <path> por cor. As
// animações ficam em theme.css e mexem só em transform/opacity de camadas
// grandes: as cores mudam por cross-fade entre cópias da mesma camada.
import type { CSSProperties } from 'react'

const seeded = (seed: number) => () => {
  seed = (seed + 0x6d2b79f5) | 0
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}
const block = (x: number, y: number, w: number, h: number) =>
  `M${x} ${y}h${w}v${h}h-${w}z`

// tinta: cor (ou chave) -> path com todos os pixels daquela cor
type Paint = Record<string, string>
const add = (p: Paint, key: string, d: string) => {
  p[key] = (p[key] ?? '') + d
}
// rasteriza uma forma em linhas horizontais (poucos comandos por path)
const raster = (
  w: number,
  h: number,
  at: (x: number, y: number) => string | null,
  p: Paint = {},
  ox = 0,
  oy = 0,
) => {
  for (let y = 0; y < h; y++) {
    let x = 0
    while (x < w) {
      const c = at(x, y)
      if (!c) {
        x++
        continue
      }
      let e = x + 1
      while (e < w && at(e, y) === c) e++
      add(p, c, block(ox + x, oy + y, e - x, 1))
      x = e
    }
  }
  return p
}
// sprite desenhado em texto: cada caractere vira uma cor
const art = (
  rows: string[],
  colors: Record<string, string>,
  p: Paint = {},
  ox = 0,
  oy = 0,
) =>
  raster(
    Math.max(...rows.map((r) => r.length)),
    rows.length,
    (x, y) => colors[rows[y][x]] ?? null,
    p,
    ox,
    oy,
  )
// cada bloco termina em "z" (volta ao início), então dá para trocar os
// "M x y" absolutos por "m dx dy" relativos: o HTML fica bem menor
const compact = (d: string) => {
  let px = 0
  let py = 0
  return d.replace(/M(-?\d+) (-?\d+)/g, (_, xs: string, ys: string) => {
    const x = +xs
    const y = +ys
    const out = `m${x - px} ${y - py}`
    px = x
    py = y
    return out
  })
}
const paths = (p: Paint, fills?: Record<string, string>) =>
  Object.entries(p).map(([k, d]) =>
    fills && !fills[k] ? null : (
      <path key={k} d={compact(d)} fill={fills?.[k] ?? k} />
    ),
  )
// geometria repetida (cópias de cada hora do dia) fica uma vez só em <defs>
// e é reaproveitada com <use fill=...>
const DEFS: Record<string, string> = {}
type Shared = { k: string; href: string }[]
const shared = (prefix: string, p: Paint): Shared =>
  Object.entries(p).map(([k, d], i) => {
    DEFS[`${prefix}-${i}`] = compact(d)
    return { k, href: `#${prefix}-${i}` }
  })
const uses = (items: Shared, fills?: Record<string, string>) =>
  items.map(({ k, href }) =>
    fills && !fills[k] ? null : (
      <use key={k} href={href} fill={fills?.[k] ?? k} />
    ),
  )
const pct = (v: number, of: number) => `${((v / of) * 100).toFixed(3)}%`
const cssVars = (v: Record<string, string | number>) => v as CSSProperties

// ---------------------------------------------------------------- cidade
// Caixa da cidade: 760 x 160 "pixels", sempre com pixels quadrados
const W = 760
const H = 160
const STREET = 144

const WIN_COLORS = ['#fcd25d', '#f8873b']
type Win = { x: number; y: number; c: string; g: string }

const buildCity = () => {
  const rand = seeded(2024)
  const s = {
    far: '',
    farWin: '',
    near: '',
    rim: '',
    shade: '',
    glass: '',
    walk: block(0, STREET, W, 3),
    road: block(0, STREET + 3, W, H - STREET - 3),
    dash: '',
  }
  const wins: Win[] = []
  const roofs: [number, number, number][] = []
  const masts: [number, number][] = []

  // prédios distantes: silhueta contínua, janelinhas de 1 pixel
  let x = -2
  while (x < W) {
    const w = 12 + Math.floor(rand() * 20)
    const h = 58 + Math.floor(rand() * 72)
    const top = STREET - h
    s.far += block(x, top, w, h)
    for (let wy = top + 3; wy < STREET - 2; wy += 4)
      for (let wx = x + 2; wx < x + w - 2; wx += 3)
        if (rand() < 0.13) s.farWin += block(wx, wy, 1, 1)
    x += w
  }

  // prédios próximos: mais altos nas bordas (o meio fica atrás dos cards)
  x = -3
  while (x < W) {
    const w = 12 + Math.floor(rand() * 17)
    const cx = x + w / 2
    const edge = Math.max(0, 1 - Math.min(cx, W - cx) / 210)
    const h = Math.floor(26 + rand() * 46 + edge * (20 + rand() * 40))
    const top = STREET - h
    s.near += block(x, top, w, h)
    s.rim += block(x, top, 1, h) + block(x, top, w, 1)
    s.shade += block(x + w - 2, top + 1, 2, h - 1)
    roofs.push([x, w, top])
    const roll = rand()
    if (roll < 0.3) {
      const mx = x + Math.floor(w / 2)
      s.near += block(mx, top - 9, 1, 9) + block(mx - 1, top - 3, 3, 3)
      masts.push([mx, top - 10])
    } else if (roll < 0.48 && w >= 13) {
      // caixa d'água no telhado
      const tx = x + 3
      s.near += block(tx, top - 9, 7, 6) + block(tx + 1, top - 10, 5, 1)
      s.shade += block(tx + 1, top - 3, 1, 3) + block(tx + 5, top - 3, 1, 3)
      s.rim += block(tx, top - 9, 1, 6)
    }
    // janelas
    const region = cx < 200 ? 'L' : cx >= 560 ? 'R' : 'C'
    const density = region === 'C' ? 0.24 : 0.4
    const baseG = Math.floor(rand() * 3)
    for (let wy = top + 4; wy < STREET - 5; wy += 5)
      for (let wx = x + 3; wx < x + w - 4; wx += 4) {
        if (rand() >= density) continue
        const r = rand()
        const c = WIN_COLORS[r < 0.66 ? 0 : 1]
        let g: string
        if (region !== 'C' && rand() < 0.13)
          g = ['flick', 'blink1', 'blink2', 'tv', 'tv'][Math.floor(rand() * 5)]
        else if (region === 'C') g = `C${rand() < 0.5 ? 0 : 1}`
        else g = `${region}${rand() < 0.7 ? baseG : Math.floor(rand() * 3)}`
        wins.push({ x: wx, y: wy, c, g })
        s.glass += block(wx, wy, 2, 2)
      }
    x += w + Math.floor(rand() * 3)
  }

  // rua: faixa tracejada e postes
  for (let dx = 4; dx < W; dx += 18) s.dash += block(dx, 153, 9, 1)
  const lamps: number[] = []
  for (let lx = 22; lx < W; lx += 84) {
    s.shade += block(lx, 131, 1, 13) + block(lx, 131, 4, 1)
    s.shade += block(lx + 3, 132, 3, 1)
    lamps.push(lx)
  }

  // chaminés: uma em cada borda (fumaça visível fora dos cards)
  const chimneys: [number, number][] = []
  for (const [lo, hi] of [
    [24, 90],
    [672, 740],
  ]) {
    const roof = roofs.find(
      ([rx, rw]) => rx + rw / 2 >= lo && rx + rw / 2 <= hi,
    )
    if (!roof) continue
    const [rx, rw, rt] = roof
    const chx = rx + rw - 6
    s.near += block(chx, rt - 6, 3, 6)
    s.rim += block(chx, rt - 6, 3, 1)
    chimneys.push([chx, rt - 7])
  }
  return { s, wins, roofs, masts, lamps, chimneys }
}
const CITY = buildCity()

// cores de cada hora do dia (cada cópia da cidade é uma camada)
type CityKey = keyof typeof CITY.s
const CITY_PHASES: Record<string, Partial<Record<CityKey, string>>> = {
  dawn: {
    far: '#5a4a7e',
    farWin: '#76649a',
    near: '#2a2249',
    rim: '#6b5592',
    shade: '#18122e',
    glass: '#3b3568',
    walk: '#4a3e68',
    road: '#2a2340',
    dash: '#b89870',
  },
  sunset: {
    far: '#4a2a63',
    farWin: '#8a5a8f',
    near: '#1b0f30',
    rim: '#3d2466',
    shade: '#0e0719',
    glass: '#24163e',
    walk: '#3a2050',
    road: '#1c1030',
    dash: '#a8643a',
  },
  day: {
    far: '#8191c6',
    farWin: '#9fb0de',
    near: '#3f4c7e',
    rim: '#7787c0',
    shade: '#262f5a',
    glass: '#22305f',
    walk: '#7e809c',
    road: '#45465e',
    dash: '#f8d878',
  },
}
const CITY_NIGHT: Partial<Record<CityKey, string>> = {
  far: '#1b1534',
  farWin: '#c99a5c',
  near: '#0d0919',
  rim: '#251d48',
  shade: '#06040d',
  walk: '#1c1630',
  road: '#0f0b1b',
  dash: '#4a3e30',
}
const cityPaint = CITY.s as Paint

// janelas por grupo: cada grupo acende/apaga no seu horário
const REGIONS: Record<string, [number, number]> = {
  L: [0, 200],
  C: [200, 560],
  R: [560, 760],
}
const WIN_GROUPS: { g: string; o: number; late?: boolean; off?: boolean }[] = [
  { g: 'L0', o: 0 },
  { g: 'L1', o: 0.028, late: true, off: true },
  { g: 'L2', o: 0.046 },
  { g: 'R0', o: 0.012 },
  { g: 'R1', o: 0.036, off: true },
  { g: 'R2', o: 0.02, late: true },
  { g: 'C0', o: 0.008 },
  { g: 'C1', o: 0.04, late: true, off: true },
]
const winPaint = (filter: (w: Win) => boolean, color?: string) => {
  const p: Paint = {}
  for (const w of CITY.wins)
    if (filter(w)) add(p, color ?? w.c, block(w.x, w.y, 2, 2))
  return p
}

// luzes da noite: postes e pontas de antena
const lampPaint = () => {
  const p: Paint = {}
  for (const lx of CITY.lamps) {
    add(p, '#ffe9a0', block(lx + 3, 133, 3, 1))
    for (let y = 134; y < STREET; y++) {
      const half = Math.floor((y - 133) / 3)
      for (let x = lx + 4 - half; x <= lx + 4 + half; x++)
        if ((x + y) % 2 === 0)
          add(p, 'rgba(255,224,150,0.32)', block(x, y, 1, 1))
    }
    add(p, 'rgba(255,224,150,0.32)', block(lx - 2, STREET, 13, 1))
  }
  return p
}
const antennaPaint = (half: number) => {
  const p: Paint = {}
  CITY.masts.forEach(([mx, my], i) => {
    if (i % 2 !== half) return
    add(p, '#ff3b30', block(mx, my, 1, 1))
    add(
      p,
      'rgba(255,70,60,0.4)',
      block(mx - 1, my, 1, 1) +
        block(mx + 1, my, 1, 1) +
        block(mx, my - 1, 1, 1),
    )
  })
  return p
}

// respingos de chuva nos telhados das bordas e na rua
const splashPaint = (seed: number) => {
  const rand = seeded(seed)
  const p: Paint = {}
  const color = '#cfe0ff'
  const crown = (x: number, y: number) =>
    add(
      p,
      color,
      block(x - 2, y - 1, 1, 1) +
        block(x + 2, y - 1, 1, 1) +
        block(x - 1, y - 2, 1, 1) +
        block(x + 1, y - 2, 1, 1),
    )
  for (const [rx, rw, rt] of CITY.roofs) {
    const cx = rx + rw / 2
    if (cx > 210 && cx < 550) continue
    if (rand() < 0.55) crown(rx + 2 + Math.floor(rand() * (rw - 4)), rt)
  }
  for (let i = 0; i < 26; i++) {
    const x = Math.floor(rand() * W)
    if (rand() < 0.4) crown(x, STREET)
    else
      add(
        p,
        'rgba(207,224,255,0.7)',
        block(x, 148 + Math.floor(rand() * 11), 4, 1),
      )
  }
  return p
}

// ---------------------------------------------------------------- céu
// Sol de fim de tarde: listras que engrossam para baixo (10 tons)
const SUNSET_COLORS = [
  '#fff8d6',
  '#fff1a8',
  '#fde68a',
  '#fcd25d',
  '#fbbf4a',
  '#f8a53e',
  '#f88a36',
  '#f87034',
  '#f85a32',
  '#f04434',
]
const SUN = 72
const sunsetSun = raster(SUN, SUN, (x, y) => {
  const dx = x - 36 + 0.5
  const dy = y - 36 + 0.5
  const d = Math.sqrt(dx * dx + dy * dy)
  if (d > 30) {
    if (d <= 33 && (x + y) % 2 === 0) return 'rgba(248,138,54,0.4)'
    return null
  }
  const below = y - 36
  if (below > 0 && below % 6 >= 6 - Math.ceil((below / 30) * 3)) return null
  return SUNSET_COLORS[
    [0, 2, 3, 4, 5, 6, 7, 9][Math.min(7, Math.floor(((y - 6) / 60) * 8))]
  ]
})
// Sol do meio-dia: menor, branco-amarelado, com halo pontilhado
const daySun = raster(SUN, SUN, (x, y) => {
  const dx = x - 36 + 0.5
  const dy = y - 36 + 0.5
  const d = Math.sqrt(dx * dx + dy * dy)
  if (d <= 24)
    return d < 11
      ? '#fffef6'
      : d < 17
        ? '#fff8cc'
        : d < 21
          ? '#ffee9a'
          : '#ffdf6e'
  if (d <= 28 && (x + y) % 2 === 0) return 'rgba(255,246,196,0.6)'
  if (d <= 33 && x % 2 === 0 && y % 2 === 0) return 'rgba(255,246,196,0.35)'
  return null
})
// brilho em cruz do sol forte (raios pontilhados)
const GLINT = 150
const glint = raster(GLINT, GLINT, (x, y) => {
  const ax = Math.abs(x - 75)
  const ay = Math.abs(y - 75)
  const strong = 'rgba(255,252,230,0.85)'
  const soft = 'rgba(255,244,190,0.45)'
  if (ay === 0 && ax < 50) return ax < 34 ? strong : soft
  if (ay === 1 && ax < 20) return soft
  if (ax === 0 && ay < 42) return ay < 30 ? strong : soft
  if (ax === 1 && ay < 16) return soft
  if (ax === ay && ax > 4 && ax < 22) return soft
  return null
})

// Lua cheia com crateras e halo pontilhado
const MOON = 40
const MOON_CRATERS: [number, number, number][] = [
  [-4, -3, 2.6],
  [4, 3, 3.1],
  [-3, 6, 1.8],
  [5, -5, 1.6],
  [-7, 2, 1.2],
]
const moon = raster(MOON, MOON, (x, y) => {
  const dx = x - 20 + 0.5
  const dy = y - 20 + 0.5
  const d = Math.sqrt(dx * dx + dy * dy)
  if (d > 12.5) {
    if (d <= 17 && (x + y) % 2 === 0) return 'rgba(214,206,255,0.28)'
    return null
  }
  const shaded = (dx + dy) / 12.5 > 0.62
  if (
    MOON_CRATERS.some(([cx, cy, r]) => (dx - cx) ** 2 + (dy - cy) ** 2 <= r * r)
  )
    return shaded ? '#a3987c' : '#c2b796'
  if (d > 11.3 && dx + dy < -3) return '#fffbea'
  return shaded ? '#d3c8a8' : '#f2ead0'
})

// Estrelas: 4 grupos que piscam em ritmos diferentes + algumas em cruz
const SKY_H = 300
const STAR_COLORS = ['#ffffff', '#fff1a8', '#c8e0ff']
const stars = (() => {
  const rand = seeded(77)
  const groups: string[] = ['', '', '']
  for (let i = 0; i < 120; i++) {
    const x = Math.floor(rand() * W)
    const y = Math.floor(rand() ** 1.4 * 200)
    groups[i % 3] += block(x, y, 1, 1)
  }
  const cross: Paint = {}
  for (let i = 0; i < 10; i++) {
    const x = 6 + Math.floor(rand() * (W - 12))
    const y = 4 + Math.floor(rand() ** 1.3 * 120)
    add(cross, '#ffffff', block(x, y, 1, 1))
    add(
      cross,
      '#9fc0ff',
      block(x - 1, y, 1, 1) +
        block(x + 1, y, 1, 1) +
        block(x, y - 1, 1, 1) +
        block(x, y + 1, 1, 1),
    )
  }
  return { groups, cross }
})()
// estrela cadente: cabeça branca e rastro subindo para a direita
const shooting = art(
  [
    '..................cc',
    '...............ccc..',
    '............bbb.....',
    '.........bbb........',
    '......aaa...........',
    '...aaa..............',
    'WWa.................',
    'WW..................',
  ],
  {
    W: '#ffffff',
    a: '#ffffff',
    b: 'rgba(255,214,240,0.7)',
    c: 'rgba(255,214,240,0.7)',
  },
)

// Nuvens: união de círculos com base reta, em 3 tons (luz, meio, sombra)
const cloudTile = (
  seed: number,
  count: number,
  minW: number,
  maxW: number,
  rows: number,
) => {
  const rand = seeded(seed)
  const p: Paint = {}
  for (let i = 0; i < count; i++) {
    const w = Math.floor(minW + rand() * (maxW - minW))
    const hgt = Math.max(5, Math.round(w * 0.24))
    const x0 = Math.floor((i * W) / count + rand() * 40)
    // a base fica baixa o bastante para o topo da nuvem caber no ladrilho
    const minBase = Math.ceil(hgt * 1.48 + 1)
    const base = minBase + Math.floor(rand() * Math.max(1, rows - minBase - 1))
    const n = 3 + Math.floor(w / 16)
    const puffs = Array.from({ length: n }, (_, k) => {
      const r = hgt * (0.45 + rand() * 0.5)
      const px = x0 + r + ((w - 2 * r) * k) / Math.max(1, n - 1)
      return [px, base - r * 0.55, r] as const
    })
    const top = Math.min(...puffs.map(([, py, r]) => py - r))
    const shape = (x: number, y: number) => {
      const ax = x0 + x
      if (
        y > base ||
        !puffs.some(([px, py, r]) => (ax - px) ** 2 + (y - py) ** 2 <= r * r)
      )
        return null
      const rel = (y - top) / Math.max(1, base - top)
      return rel < 0.42 ? 'L' : rel < 0.78 ? 'M' : 'S'
    }
    // três cópias (-W, 0, +W): o ladrilho de 2W emenda sem costura
    for (const off of [-W, 0, W]) raster(w + 2, rows, shape, p, x0 + off, 0)
  }
  return p
}
const CLOUD_COLORS = {
  night: { L: '#3b2e5e', M: '#2f2551', S: '#241c43' },
  warm: { L: '#ffd6c0', M: '#f5a89c', S: '#c66c8a' },
  day: { L: '#ffffff', M: '#e2eafa', S: '#b6c4e8' },
  storm: { L: '#5d5f78', M: '#45475e', S: '#30324a' },
}
const CLOUD_LAYERS = [
  { id: 'far', tile: cloudTile(11, 7, 24, 42, 26), rows: 26 },
  { id: 'mid', tile: cloudTile(23, 5, 40, 66, 32), rows: 32 },
  { id: 'near', tile: cloudTile(37, 4, 64, 100, 40), rows: 40 },
]
const STORM_ROWS = 46
const stormTile = (() => {
  const p = cloudTile(51, 10, 70, 110, STORM_ROWS)
  add(p, 'S', block(0, 0, 2 * W, 9))
  add(p, 'M', block(0, 9, 2 * W, 4))
  return p
})()

// névoa da madrugada: faixas compridas com pontas em degrau
const FOG_ROWS = 40
const fog = (() => {
  const rand = seeded(91)
  const p: Paint = {}
  for (let i = 0; i < 16; i++) {
    const len = 60 + Math.floor(rand() * 140)
    const x = Math.floor(rand() * W)
    const y = Math.floor(rand() * (FOG_ROWS - 4))
    const h = 2 + Math.floor(rand() * 3)
    const c = i % 2 ? 'rgba(232,220,246,0.5)' : 'rgba(205,190,235,0.38)'
    for (const off of [-W, 0, W])
      add(
        p,
        c,
        block(x + off + 3, y, len - 6, 1) +
          block(x + off, y + 1, len, h - 1) +
          block(x + off + 3, y + h, len - 6, 1),
      )
  }
  return p
})()

// chuva em pixels: ladrilho que se repete e desce na diagonal
const rainTile = (
  seed: number,
  tw: number,
  th: number,
  n: number,
  len: number,
  color: string,
) => {
  const rand = seeded(seed)
  let d = ''
  for (let i = 0; i < n; i++) {
    const x0 = Math.floor(rand() * tw)
    const y0 = Math.floor(rand() * th)
    for (let k = 0; k < len; k++) {
      const x = (((x0 - k) % tw) + tw) % tw
      const y = (y0 + 2 * k) % th
      d += block(x, y, 1, 2)
    }
  }
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${tw} ${th}' shape-rendering='crispEdges'><path fill='${color}' d='${d}'/></svg>`
  return `url("data:image/svg+xml,${svg.replace(/#/g, '%23').replace(/</g, '%3C').replace(/>/g, '%3E')}")`
}
const RAIN_FAR = rainTile(5, 32, 64, 5, 3, 'rgba(165,185,235,0.5)')
const RAIN_NEAR = rainTile(9, 48, 96, 4, 6, 'rgba(205,220,255,0.75)')

// raio em zigue-zague com galhos
const bolt = (seed: number) => {
  const rand = seeded(seed)
  const p: Paint = {}
  const walk = (x: number, y: number, steps: number, core: boolean) => {
    for (let i = 0; i < steps && y < 218; i++) {
      const len = 3 + Math.floor(rand() * 6)
      add(p, '#ffffff', block(x, y, core ? 2 : 1, len))
      if (core)
        add(
          p,
          'rgba(190,170,255,0.55)',
          block(x - 1, y, 1, len) + block(x + 2, y, 1, len),
        )
      y += len
      const dx = Math.floor(rand() * 7) - 3
      add(p, '#ffffff', block(Math.min(x, x + dx), y, Math.abs(dx) + 1, 1))
      x += dx
      if (core && rand() < 0.16) walk(x, y, 4 + Math.floor(rand() * 5), false)
    }
  }
  walk(20, 0, 40, true)
  return p
}
const BOLT_A = bolt(3)
const BOLT_B = bolt(8)

// lens flare: hexágonos e anéis de pixel numa reta que sai do sol
const hexSprite = (r: number, fill: string, edge: string) =>
  raster(2 * r + 1, 2 * r + 1, (x, y) => {
    const dx = Math.abs(x - r)
    const dy = Math.abs(y - r)
    const inside = (ex: number, ey: number) =>
      ey <= r * 0.87 && ex <= r - ey * 0.577
    if (!inside(dx, dy)) return null
    return inside(dx + 1, dy) && inside(dx, dy + 1) ? fill : edge
  })
const ringSprite = (r: number, color: string) =>
  raster(2 * r + 3, 2 * r + 3, (x, y) => {
    const d = Math.hypot(x - r - 1, y - r - 1)
    return Math.abs(d - r) < 0.7 ? color : null
  })
const FLARE: { k: number; size: number; p: Paint }[] = [
  {
    k: 0.24,
    size: 13,
    p: hexSprite(6, 'rgba(255,241,168,0.35)', 'rgba(255,241,168,0.75)'),
  },
  { k: 0.42, size: 21, p: ringSprite(9, 'rgba(124,196,255,0.75)') },
  {
    k: 1.35,
    size: 25,
    p: hexSprite(12, 'rgba(120,230,210,0.26)', 'rgba(120,230,210,0.6)'),
  },
  { k: 1.62, size: 35, p: ringSprite(16, 'rgba(255,230,140,0.6)') },
  {
    k: 1.9,
    size: 17,
    p: hexSprite(8, 'rgba(255,120,170,0.3)', 'rgba(255,120,170,0.65)'),
  },
]

// pássaros (dia) e morcegos (noite)
const BIRD = ['XX...XX', '..X.X..', '...X...']
const birds = (spots: [number, number][]) => {
  const p: Paint = {}
  for (const [x, y] of spots) art(BIRD, { X: '#1b1030' }, p, x, y)
  return p
}
const BIRDS_A = birds([
  [0, 5],
  [11, 0],
  [22, 7],
])
const BIRDS_B = birds([
  [31, 2],
  [40, 9],
])
const BAT = art(['X.......X', 'XX.X.X.XX', '.XXXXXXX.', '..X...X..'], {
  X: '#07040e',
})

// herói da teia: sprite original 12x19 (máscara vermelha com lentes
// brancas, tronco vermelho, laterais e pernas azuis), pendurado pela mão
// direita erguida. A mão fica no pixel (9, 0), onde a teia se prende.
const HERO_ROWS = [
  '........KK..',
  '.......KRRK.',
  '.......KRK..',
  '..KKKK.KRK..',
  '.KRRRRKKBK..',
  '.KWWRWWKBK..',
  '.KRWRWRKBK..',
  '..KRRRKBBK..',
  '.KBKRKBRBK..',
  'KBBRRRRRBK..',
  'KBKRRRRRKBK.',
  'KK.KBRRBK.KK',
  '...KBBBBK...',
  '..KBBKKBBK..',
  '.KBBK..KBBK.',
  '.KBK....KBK.',
  'KRRK....KRRK',
  'KRK......KRK',
  'KKK......KKK',
]
const HERO = art(HERO_ROWS, {
  K: '#0a0612',
  R: '#e02a10',
  B: '#1048d8',
  W: '#ffffff',
})
// à noite vira silhueta, só com as lentes brilhando
const HERO_NIGHT = art(HERO_ROWS, {
  K: '#05030a',
  R: '#05030a',
  B: '#05030a',
  W: '#dfe8ff',
})

// carros (sprites voltados para a direita; os da contramão são espelhados)
const CAR_ROWS = [
  '.....RRRRRRR........',
  '....RGGGRGGGRR......',
  '..RRRRRRRRRRRRRRR...',
  '.TRRRRRRRRRRRRRRRRH.',
  '.DDDDDDDDDDDDDDDDDD.',
  '...WWW.......WWW....',
]
const CARS = [
  {
    body: '#d82800',
    dark: '#801000',
    lane: 153,
    dir: 1,
    dur: 23,
    delay: -4,
    at: '22%',
  },
  {
    body: '#f8b800',
    dark: '#a06800',
    lane: 153,
    dir: 1,
    dur: 31,
    delay: -19,
    at: '64%',
  },
  {
    body: '#0058f8',
    dark: '#002a90',
    lane: 147,
    dir: -1,
    dur: 27,
    delay: -9,
    at: '40%',
  },
  {
    body: '#e4e4f4',
    dark: '#8a8aa8',
    lane: 147,
    dir: -1,
    dur: 37,
    delay: -30,
    at: '86%',
  },
]
const carPaint = (body: string, dark: string, flip: boolean) =>
  art(flip ? CAR_ROWS.map((r) => r.split('').reverse().join('')) : CAR_ROWS, {
    R: body,
    D: dark,
    G: '#9fd4ff',
    T: '#ff2a2a',
    H: '#fff6b0',
    W: '#0a0a12',
  })
const beam = (flip: boolean) =>
  raster(16, 6, (x, y) => {
    const fx = flip ? 15 - x : x
    const spread = 1 + Math.floor(fx / 5)
    if (Math.abs(y - 3) > spread || (x + y) % 2) return null
    return 'rgba(255,246,176,0.6)'
  })

// fumaça de chaminé
const PUFF = art(['.XXX..', 'XXXXX.', 'XXXXXX', '.XXXX.'], { X: '#d8cce8' })

// orvalho nas teias de canto (mesma geometria de ThemeBackdrop: 9 fios, 8 anéis)
const dew = (seed: number) => {
  const rand = seeded(seed)
  const p: Paint = {}
  for (let i = 0; i < 16; i++) {
    const k = 2 + Math.floor(rand() * 7)
    const a = (Math.floor(rand() * 9) / 8) * (Math.PI / 2)
    const r = (300 * k) / 8
    const x = Math.round(Math.cos(a) * r)
    const y = Math.round(Math.sin(a) * r)
    add(p, '#ffffff', block(x - 1, y - 1, 3, 3))
    add(
      p,
      'rgba(190,232,255,0.8)',
      block(x - 4, y - 1, 3, 3) +
        block(x + 2, y - 1, 3, 3) +
        block(x - 1, y - 4, 3, 3) +
        block(x - 1, y + 2, 3, 3),
    )
  }
  return p
}
const DEW_A = dew(31)
const DEW_B = dew(47)

// ---------------------------------------------------------------- render
const CITY_SHARED = shared('ap-city', cityPaint)
const CLOUD_SHARED = CLOUD_LAYERS.map((l) => ({
  ...l,
  u: shared(`ap-cl-${l.id}`, l.tile),
}))
const DEW_SHARED = [shared('ap-dew-a', DEW_A), shared('ap-dew-b', DEW_B)]

const Svg = ({
  className,
  vb,
  p,
  u,
  style,
  fills,
}: {
  className: string
  vb: string
  p?: Paint
  u?: Shared
  style?: CSSProperties
  fills?: Record<string, string>
}) => (
  <svg
    className={className}
    viewBox={vb}
    preserveAspectRatio="none"
    shapeRendering="crispEdges"
    style={style}
  >
    {p && paths(p, fills)}
    {u && uses(u, fills)}
  </svg>
)
const CITY_VB = `0 0 ${W} ${H}`
const region = (r: string) => {
  const [a, b] = REGIONS[r]
  return {
    vb: `${a} 0 ${b - a} ${H}`,
    style: { left: pct(a, W), width: pct(b - a, W) },
  }
}

export default function AranhaPixelScene() {
  return (
    <>
      <svg className="ap-defs" aria-hidden="true">
        <defs>
          {Object.entries(DEFS).map(([id, d]) => (
            <path key={id} id={id} d={d} />
          ))}
        </defs>
      </svg>
      {/* céu: faixas de cada hora em cross-fade (a noite é o fundo) */}
      <div className="ap-sky ap-sky-dawn ap-ph-dawn" />
      <div className="ap-sky ap-sky-sunset ap-ph-sunset" />
      <div className="ap-sky ap-sky-day ap-ph-day" />
      <div className="ap-dither" />

      <div className="ap-wide ap-stars ap-ph-night">
        {stars.groups.map((d, i) => (
          <svg
            key={i}
            className={`ap-fill ap-tw ap-tw-${i}`}
            viewBox={`0 0 ${W} ${SKY_H}`}
            preserveAspectRatio="none"
            shapeRendering="crispEdges"
          >
            <path d={d} fill={STAR_COLORS[i]} />
          </svg>
        ))}
        <Svg
          className="ap-fill ap-tw ap-tw-x"
          vb={`0 0 ${W} ${SKY_H}`}
          p={stars.cross}
        />
        <Svg className="ap-shoot" vb="0 0 20 8" p={shooting} />
      </div>

      <div className="ap-moon">
        <Svg className="ap-fill" vb={`0 0 ${MOON} ${MOON}`} p={moon} />
      </div>

      <div className="ap-sun">
        <Svg
          className="ap-fill ap-sunsun"
          vb={`0 0 ${SUN} ${SUN}`}
          p={sunsetSun}
        />
        <Svg
          className="ap-fill ap-ph-day"
          vb={`0 0 ${SUN} ${SUN}`}
          p={daySun}
        />
        <div className="ap-glint-win ap-flarewin">
          <div className="ap-fill ap-w-clear">
            <Svg className="ap-glint" vb={`0 0 ${GLINT} ${GLINT}`} p={glint} />
          </div>
        </div>
      </div>

      <div className="ap-flare ap-flarewin">
        <div className="ap-fill ap-w-clear">
          {FLARE.map(({ k, size, p }) => (
            <div
              key={k}
              className="ap-fl-b"
              style={{ transform: `scale(${(1 - k).toFixed(3)})` }}
            >
              <div className="ap-fl-a">
                <Svg
                  className="ap-fl-c"
                  vb={`0 0 ${size} ${size}`}
                  p={p}
                  style={cssVars({
                    '--n': size,
                    transform: `scale(${(1 / (1 - k)).toFixed(4)}) translate(-50%, -50%)`,
                  })}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {CLOUD_SHARED.map(({ id, u, rows }) => (
        <div
          key={id}
          className={`ap-clouds ap-clouds-${id}`}
          style={cssVars({ '--rows': rows })}
        >
          <Svg
            className="ap-fill"
            vb={`0 0 ${2 * W} ${rows}`}
            u={u}
            fills={CLOUD_COLORS.night}
          />
          <Svg
            className="ap-fill ap-ph-warm"
            vb={`0 0 ${2 * W} ${rows}`}
            u={u}
            fills={CLOUD_COLORS.warm}
          />
          <Svg
            className="ap-fill ap-ph-day"
            vb={`0 0 ${2 * W} ${rows}`}
            u={u}
            fills={CLOUD_COLORS.day}
          />
        </div>
      ))}

      <div className="ap-birds ap-ph-day">
        <div className="ap-birds-mover">
          <Svg className="ap-flock ap-flap" vb="0 0 48 14" p={BIRDS_A} />
          <Svg
            className="ap-flock ap-flap ap-flap-b"
            vb="0 0 48 14"
            p={BIRDS_B}
          />
        </div>
      </div>
      <div className="ap-bats ap-ph-night">
        {[0, 1].map((i) => (
          <div key={i} className={`ap-bat ap-bat-${i}`}>
            <Svg
              className="ap-fill ap-flap ap-flap-fast"
              vb="0 0 9 4"
              p={BAT}
            />
          </div>
        ))}
      </div>

      {/* herói da teia: 4 balanços seguidos, presos acima do céu */}
      <div className="ap-swing">
        <div className="ap-swing-anchor">
          <div className="ap-swing-rotor">
            <div className="ap-swing-line" />
            <div className="ap-swing-hero">
              <Svg className="ap-hero" vb="0 0 12 19" p={HERO} />
              <Svg
                className="ap-hero ap-ph-night"
                vb="0 0 12 19"
                p={HERO_NIGHT}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="ap-storm ap-w-storm">
        <Svg
          className="ap-storm-clouds"
          vb={`0 0 ${2 * W} ${STORM_ROWS}`}
          p={stormTile}
          fills={CLOUD_COLORS.storm}
        />
      </div>

      {/* cidade: noite como base e cópias coloridas por cima */}
      <div className="ap-box">
        <Svg
          className="ap-fill"
          vb={CITY_VB}
          u={CITY_SHARED}
          fills={CITY_NIGHT}
        />
        {Object.entries(CITY_PHASES).map(([phase, fills]) => (
          <Svg
            key={phase}
            className={`ap-fill ap-ph-${phase}`}
            vb={CITY_VB}
            u={CITY_SHARED}
            fills={fills}
          />
        ))}
        {/* carros na mesma caixa da rua: nunca saem da pista */}
        {CARS.map(({ body, dark, lane, dir, dur, delay, at }, i) => {
          const flip = dir < 0
          return (
            <div
              key={i}
              className={`ap-car ${flip ? 'ap-car-l' : 'ap-car-r'}`}
              style={{
                top: pct(lane, H),
                transform: `translateX(${at})`,
                animationDuration: `${dur}s`,
                animationDelay: `${delay}s`,
              }}
            >
              <Svg
                className="ap-car-body"
                vb="0 0 20 6"
                p={carPaint(body, dark, flip)}
                style={{ left: flip ? pct(16, W) : '0' }}
              />
              <Svg
                className="ap-car-beam ap-ph-night"
                vb="0 0 16 6"
                p={beam(flip)}
                style={{ left: flip ? '0' : pct(19, W) }}
              />
            </div>
          )
        })}
        <div className="ap-fog ap-ph-fog">
          <Svg
            className="ap-fog-band"
            vb={`0 0 ${2 * W} ${FOG_ROWS}`}
            p={fog}
          />
        </div>
      </div>

      <div className="ap-gloom" />
      <Svg className="ap-bolt ap-bolt-a" vb="0 0 40 220" p={BOLT_A} />
      <Svg className="ap-bolt ap-bolt-b" vb="0 0 40 220" p={BOLT_B} />

      <div className="ap-box">
        {WIN_GROUPS.map(({ g, o, late, off }) => {
          const r = region(g[0])
          return (
            <Svg
              key={g}
              className={['ap-wg', late && 'ap-wg-late', off && 'ap-wg-off']
                .filter(Boolean)
                .join(' ')}
              vb={r.vb}
              p={winPaint((w) => w.g === g)}
              style={cssVars({ ...r.style, '--o': o })}
            />
          )
        })}
        <div
          className="ap-fill ap-wg ap-wg-special"
          style={cssVars({ '--o': 0.016 })}
        >
          <Svg
            className="ap-fill ap-flick"
            vb={CITY_VB}
            p={winPaint((w) => w.g === 'flick')}
          />
          <Svg
            className="ap-fill ap-blink"
            vb={CITY_VB}
            p={winPaint((w) => w.g === 'blink1')}
          />
          <Svg
            className="ap-fill ap-blink ap-blink-2"
            vb={CITY_VB}
            p={winPaint((w) => w.g === 'blink2')}
          />
          <Svg
            className="ap-fill"
            vb={CITY_VB}
            p={winPaint((w) => w.g === 'tv', '#5f8cff')}
          />
          <Svg
            className="ap-fill ap-tv-b"
            vb={CITY_VB}
            p={winPaint((w) => w.g === 'tv', '#d6ecff')}
          />
          <Svg
            className="ap-fill ap-tv-c"
            vb={CITY_VB}
            p={winPaint((w) => w.g === 'tv', '#b07aff')}
          />
        </div>
        <div className="ap-fill ap-ph-night">
          <Svg className="ap-fill" vb={CITY_VB} p={lampPaint()} />
          <Svg className="ap-fill ap-red" vb={CITY_VB} p={antennaPaint(0)} />
          <Svg
            className="ap-fill ap-red ap-red-b"
            vb={CITY_VB}
            p={antennaPaint(1)}
          />
        </div>
        {CITY.chimneys.flatMap(([cx, cy], c) =>
          [0, 1, 2].map((i) => (
            <Svg
              key={`${c}-${i}`}
              className="ap-puff"
              vb="0 0 6 4"
              p={PUFF}
              style={{
                left: pct(cx - 1.5, W),
                top: pct(cy - 4, H),
                animationDelay: `${-(i * 2.4 + c * 1.1).toFixed(1)}s`,
              }}
            />
          )),
        )}
        <div className="ap-fill ap-w-rain">
          {[13, 29, 41].map((seed, i) => (
            <Svg
              key={seed}
              className={`ap-fill ap-splash ap-splash-${i}`}
              vb={CITY_VB}
              p={splashPaint(seed)}
            />
          ))}
        </div>
      </div>

      <div className="ap-rain ap-w-rain">
        <div className="ap-rain-far" style={{ backgroundImage: RAIN_FAR }} />
        <div className="ap-rain-near" style={{ backgroundImage: RAIN_NEAR }} />
      </div>

      <div className="ap-dew ap-ph-dew">
        <Svg
          className="ap-dew-tl ap-tw ap-tw-1"
          vb="0 0 300 300"
          u={DEW_SHARED[0]}
        />
        <Svg
          className="ap-dew-tl ap-tw ap-tw-3"
          vb="0 0 300 300"
          u={DEW_SHARED[1]}
        />
        <Svg
          className="ap-dew-br ap-tw ap-tw-0"
          vb="0 0 300 300"
          u={DEW_SHARED[0]}
        />
        <Svg
          className="ap-dew-br ap-tw ap-tw-2"
          vb="0 0 300 300"
          u={DEW_SHARED[1]}
        />
      </div>

      <div className="ap-flash" />
    </>
  )
}
