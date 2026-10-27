// Geometria da carta operacional (unidades do mapa: 1600 × 900, a mesma
// proporção 16:9 das telas). Tudo é calculado uma vez, no carregamento do
// módulo, com semente fixa: igual a cada visita e sem custo por quadro.
//
// Mapa fictício: a "Liga de Vandrel" (azul) está cercada no centro da carta
// pela "República de Kessária" (vermelho). A frente forma um anel em volta
// da interface: corre pela faixa de cima (visível em qualquer tela) e desce
// pelas margens laterais. A baía do Mar de Ferro fica no canto de cima à
// esquerda, atrás do título (água escura = título legível).
//
// O que fica visível em 1920×1080 com a mesa inclinada (ver theme.css):
// faixa de cima ≈ y 23–91; margem esquerda ≈ x 100–280; direita ≈ x
// 1320–1500; rodapé ≈ y 724–754. No celular, o topo mostra x ≈ 610–990.

export const MW = 1600
export const MH = 900

export type Pt = [number, number]

export const seeded = (seed: number) => () => {
  seed = (seed + 0x6d2b79f5) | 0
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}
export const r1 = (v: number) => Math.round(v * 10) / 10
export const pt = ([x, y]: Pt) => `${r1(x)} ${r1(y)}`
const mid = (a: Pt, b: Pt): Pt => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]

// curva suave passando pelos pontos médios (aberta ou fechada)
export const smooth = (pts: Pt[], closed = false) => {
  const n = pts.length
  if (closed) {
    let d = `M${pt(mid(pts[n - 1], pts[0]))}`
    for (let i = 0; i < n; i++)
      d += `Q${pt(pts[i])} ${pt(mid(pts[i], pts[(i + 1) % n]))}`
    return d + 'Z'
  }
  let d = `M${pt(pts[0])}`
  for (let i = 1; i < n - 1; i++)
    d += `Q${pt(pts[i])} ${pt(mid(pts[i], pts[i + 1]))}`
  return d + `L${pt(pts[n - 1])}`
}

// reamostra a polilinha a cada `step` e desloca na normal com ruído
export const wobble = (pts: Pt[], step: number, amp: number, seed: number) => {
  const rand = seeded(seed)
  const out: Pt[] = []
  for (let i = 0; i < pts.length - 1; i++) {
    const [x0, y0] = pts[i]
    const [x1, y1] = pts[i + 1]
    const len = Math.hypot(x1 - x0, y1 - y0) || 1
    const n = Math.max(1, Math.round(len / step))
    const nx = -(y1 - y0) / len
    const ny = (x1 - x0) / len
    for (let k = 0; k < n; k++) {
      const t = k / n
      const j = i === 0 && k === 0 ? 0 : (rand() - 0.5) * amp
      out.push([x0 + (x1 - x0) * t + nx * j, y0 + (y1 - y0) * t + ny * j])
    }
  }
  out.push(pts[pts.length - 1])
  return out
}

// desloca a polilinha na normal (linhas d'água paralelas ao litoral)
export const offset = (pts: Pt[], d: number): Pt[] =>
  pts.map((p, i) => {
    const a = pts[Math.max(0, i - 1)]
    const b = pts[Math.min(pts.length - 1, i + 1)]
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1
    return [p[0] - ((b[1] - a[1]) / len) * d, p[1] + ((b[0] - a[0]) / len) * d]
  })

// ---- manchas orgânicas (ilhas, morros) com harmônicos sorteados ----
interface Blob {
  cx: number
  cy: number
  rx: number
  ry: number
  dx: number
  dy: number
  edge: { k: number; a: number; p: number }[]
  inner: { k: number; a: number; p: number }[]
}
const blob = (
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  seed: number,
): Blob => {
  const rand = seeded(seed)
  const harm = (from: number, to: number, amp: number) =>
    Array.from({ length: to - from + 1 }, (_, i) => ({
      k: from + i,
      a: (rand() * amp) / Math.sqrt(from + i),
      p: rand() * Math.PI * 2,
    }))
  return {
    cx,
    cy,
    rx,
    ry,
    dx: (rand() - 0.5) * rx * 0.5,
    dy: (rand() - 0.5) * ry * 0.5,
    edge: [...harm(2, 5, 0.24), ...harm(9, 14, 0.05)],
    inner: harm(2, 4, 0.3),
  }
}
const blobPts = (b: Blob, s: number, N = 72) => {
  const pts: Pt[] = []
  const cx = b.cx + b.dx * (1 - Math.min(s, 1))
  const cy = b.cy + b.dy * (1 - Math.min(s, 1))
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2
    let r = 1
    for (const h of b.edge) r += h.a * Math.sin(h.k * a + h.p)
    for (const h of b.inner)
      r += h.a * Math.max(0, 1 - s) * Math.sin(h.k * a + h.p)
    pts.push([cx + Math.cos(a) * b.rx * s * r, cy + Math.sin(a) * b.ry * s * r])
  }
  return pts
}
const blobPath = (b: Blob, s: number) => smooth(blobPts(b, s), true)

// ---- baía do Mar de Ferro (canto de cima à esquerda) ----
const COAST = wobble(
  [
    [556, -12],
    [546, 34],
    [530, 74],
    [504, 104],
    [462, 130],
    [404, 148],
    [338, 162],
    [262, 176],
    [184, 194],
    [98, 212],
    [-12, 232],
  ],
  10,
  9,
  71,
)
export const SEA = `${smooth(COAST)}L-20 -20L566 -20Z`
export const COASTLINE = smooth(COAST)
const ISLANDS = [
  blob(296, 70, 36, 17, 3),
  blob(156, 122, 23, 13, 5),
  blob(432, 44, 16, 10, 7),
  blob(66, 58, 28, 15, 9),
  blob(232, 30, 12, 8, 13),
]
export const ISLES = ISLANDS.map((b) => blobPath(b, 1)).join('')
export const ISLE_HILLS = ISLANDS.map((b) => blobPath(b, 0.55)).join('')
// linhas d'água: perto, meio e longe do litoral
export const WATER = [
  [5, 10],
  [17, 26],
  [38, 54],
].map((ds) =>
  ds
    .map((d) => smooth(offset(COAST, d)))
    .concat(ISLANDS.map((b) => blobPath(b, 1 + ds[0] / 30)))
    .join(''),
)

// ---- relevo: tintas hipsométricas e curvas de nível ----
const HILLS = [
  blob(684, 40, 84, 30, 11),
  blob(1222, 32, 150, 40, 23),
  blob(1474, 96, 74, 46, 31),
  blob(1046, 128, 60, 26, 37),
  blob(196, 388, 74, 124, 41),
  blob(236, 668, 94, 82, 47),
  blob(1402, 336, 84, 124, 53),
  blob(1438, 642, 72, 92, 59),
  blob(820, 440, 330, 220, 61),
  blob(560, 760, 120, 60, 67),
  blob(1100, 780, 130, 56, 73),
]
const hills = (s: number) => HILLS.map((b) => blobPath(b, s)).join('')
export const TINTS = [hills(1), hills(0.74), hills(0.5), hills(0.28)]
export const CONTOURS = [0.88, 0.62, 0.4, 0.17].map(hills).join('')
export const CONTOURS_MAJOR = hills(1)

// hachuras da cordilheira de Brask (traços radiais entre duas curvas)
export const HACHURE = (() => {
  const b = HILLS[1]
  const a = blobPts(b, 0.42, 120)
  const z = blobPts(b, 0.92, 120)
  let d = ''
  for (let i = 0; i < 120; i += 2) d += `M${pt(a[i])}L${pt(z[i])}`
  const c = HILLS[2]
  const a2 = blobPts(c, 0.45, 70)
  const z2 = blobPts(c, 0.9, 70)
  for (let i = 0; i < 70; i += 2) d += `M${pt(a2[i])}L${pt(z2[i])}`
  return d
})()

// ---- rios, lagos ----
const river = (pts: Pt[], seed: number) => smooth(wobble(pts, 12, 10, seed))
export const RIVERS = [
  river(
    [
      [772, -10],
      [762, 40],
      [778, 76],
      [760, 120],
      [790, 190],
      [770, 260],
    ],
    101,
  ),
  river(
    [
      [1292, -10],
      [1272, 48],
      [1244, 92],
      [1252, 160],
      [1226, 240],
    ],
    103,
  ),
  river(
    [
      [70, 214],
      [140, 300],
      [182, 420],
      [150, 560],
      [204, 700],
      [176, 910],
    ],
    107,
  ),
  river(
    [
      [1610, 250],
      [1486, 330],
      [1446, 460],
      [1474, 600],
      [1424, 760],
      [1450, 910],
    ],
    109,
  ),
].join('')
export const LAKES = [
  blob(1010, 104, 26, 11, 111),
  blob(1458, 520, 20, 30, 113),
]
  .map((b) => blobPath(b, 1))
  .join('')

// ---- estradas e ferrovia ----
export const ROADS = [
  [
    [552, 104],
    [672, 76],
    [842, 64],
    [984, 52],
    [1150, 70],
    [1262, 32],
    [1420, 56],
    [1610, 40],
  ],
  [
    [984, 52],
    [990, -10],
  ],
  [
    [984, 52],
    [1000, 180],
    [960, 330],
  ],
  [
    [672, 76],
    [766, 34],
    [800, -10],
  ],
  [
    [170, 300],
    [230, 520],
    [160, 700],
    [190, 910],
  ],
  [
    [1430, 290],
    [1380, 500],
    [1450, 700],
    [1420, 910],
  ],
]
  .map((p, i) => smooth(wobble(p as Pt[], 18, 5, 200 + i)))
  .join('')
const RAIL: Pt[] = wobble(
  [
    [540, 124],
    [700, 100],
    [900, 94],
    [1100, 100],
    [1300, 88],
    [1610, 84],
  ],
  30,
  4,
  301,
)
export const RAILWAY = smooth(RAIL)
export const RAIL_TICKS = (() => {
  let d = ''
  for (let i = 0; i < RAIL.length - 1; i++) {
    const [x0, y0] = RAIL[i]
    const [x1, y1] = RAIL[i + 1]
    const len = Math.hypot(x1 - x0, y1 - y0)
    const ux = (x1 - x0) / len
    const uy = (y1 - y0) / len
    for (let s = 4; s < len; s += 9) {
      const x = x0 + ux * s
      const y = y0 + uy * s
      d += `M${pt([x - uy * 3, y + ux * 3])}L${pt([x + uy * 3, y - ux * 3])}`
    }
  }
  return d
})()

// ---- matas (símbolo de árvore: copa + sombra) ----
const FORESTS: [number, number, number, number][] = [
  [636, 30, 34, 26],
  [884, 22, 30, 22],
  [1352, 24, 40, 28],
  [1064, 74, 22, 18],
  [1180, 104, 30, 22],
  [118, 480, 54, 32],
  [252, 772, 56, 30],
  [1484, 452, 52, 34],
  [1376, 724, 50, 30],
  [610, 118, 26, 18],
]
export const TREES = (() => {
  let crown = ''
  let shade = ''
  FORESTS.forEach(([cx, cy, rx, n], f) => {
    const rand = seeded(400 + f)
    for (let i = 0; i < n; i++) {
      const a = rand() * Math.PI * 2
      const r = Math.sqrt(rand())
      const x = r1(cx + Math.cos(a) * rx * r)
      const y = r1(cy + Math.sin(a) * rx * 0.6 * r)
      const s = r1(2 + rand() * 1.4)
      crown += `M${x - s} ${y}a${s} ${s} 0 1 0 ${s * 2} 0a${s} ${s} 0 1 0 ${-s * 2} 0`
      shade += `M${x - s + 1.2} ${y + 1.4}a${s} ${s} 0 1 0 ${s * 2} 0a${s} ${s} 0 1 0 ${-s * 2} 0`
    }
  })
  return { crown, shade }
})()

// ---- brejos perto do litoral ----
export const MARSH = (() => {
  const rand = seeded(501)
  let d = ''
  for (let i = 0; i < 16; i++) {
    const x = r1(470 + rand() * 120)
    const y = r1(140 + rand() * 40)
    d += `M${x - 4} ${y}h8M${x - 2} ${y}v-3M${x + 1} ${y}v-4M${x + 3} ${y}v-2`
  }
  return d
})()

// ---- cidades (nomes inventados) ----
export interface City {
  x: number
  y: number
  name: string
  size: 1 | 2 | 3
  anchor: 'start' | 'end'
  dx: number
  dy: number
}
export const CITIES: City[] = (
  [
    [552, 104, 'Porto Bigorna', 3, 'start', 9, 14],
    [672, 76, 'Tarnel', 1, 'start', 6, -5],
    [766, 34, 'Sant’Orvo', 1, 'start', 6, -4],
    [984, 52, 'Velmora', 3, 'start', 10, -6],
    [1150, 70, 'Alto Cinzel', 2, 'start', 7, 13],
    [1262, 32, 'Brask', 1, 'start', 6, -4],
    [1420, 56, 'Dunhal', 2, 'end', -8, -5],
    [1352, 96, 'Vila Ferrugem', 1, 'start', 6, 11],
    [170, 300, 'Corvesa', 2, 'start', 8, -6],
    [230, 520, 'Forja', 1, 'start', 6, -4],
    [160, 700, 'Nova Brasa', 2, 'start', 8, 13],
    [1430, 290, 'Kador', 2, 'end', -8, -6],
    [1380, 500, 'Torre d’Aço', 1, 'end', -6, -5],
    [1450, 700, 'Varn', 1, 'end', -7, 13],
  ] as const
).map(([x, y, name, size, anchor, dx, dy]) => ({
  x,
  y,
  name,
  size,
  anchor,
  dx,
  dy,
}))
export const CITY_MARKS = (() => {
  let big = ''
  let small = ''
  for (const c of CITIES) {
    const s = c.size === 3 ? 5 : c.size === 2 ? 4 : 2.6
    if (c.size === 1)
      small += `M${c.x - s} ${c.y}a${s} ${s} 0 1 0 ${s * 2} 0a${s} ${s} 0 1 0 ${-s * 2} 0`
    else big += `M${c.x - s} ${c.y - s}h${s * 2}v${s * 2}h${-s * 2}z`
  }
  return { big, small }
})()

// ---- fronteiras de província (pontilhado) ----
export const PROVINCES = [
  [
    [700, -10],
    [706, 60],
    [694, 130],
  ],
  [
    [880, -10],
    [876, 70],
    [890, 140],
  ],
  [
    [990, 60],
    [994, 140],
  ],
  [
    [1100, -10],
    [1104, 70],
    [1094, 140],
  ],
  [
    [1260, -10],
    [1254, 70],
    [1266, 140],
  ],
  [
    [1400, -10],
    [1406, 60],
    [1396, 140],
  ],
  [
    [-10, 380],
    [140, 384],
    [320, 372],
  ],
  [
    [-10, 580],
    [150, 590],
    [330, 578],
  ],
  [
    [1270, 300],
    [1450, 296],
    [1610, 306],
  ],
  [
    [1270, 520],
    [1450, 530],
    [1610, 516],
  ],
]
  .map((p, i) => smooth(wobble(p as Pt[], 20, 6, 600 + i)))
  .join('')

// ---- grade de coordenadas ----
export const GRID =
  Array.from({ length: 15 }, (_, i) => `M${(i + 1) * 100} 0V${MH}`).join('') +
  Array.from({ length: 8 }, (_, i) => `M0 ${(i + 1) * 100}H${MW}`).join('')
export const LON = Array.from({ length: 13 }, (_, i) => ({
  x: (i + 2) * 100,
  label: `${Math.abs(i * 3 - 18)}°${i * 3 - 18 < 0 ? 'O' : 'L'}`,
}))
export const LAT = Array.from({ length: 7 }, (_, i) => ({
  y: (i + 2) * 100,
  label: `${58 - i * 3}°N`,
}))

// ---- frente de batalha ----
// Linha com "dentes" do lado do inimigo (side = 1 à direita do sentido).
export const frontLine = (pts: Pt[], side: 1 | -1, gap = 26) => {
  let teeth = ''
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1]
    const [x1, y1] = pts[i]
    const len = Math.hypot(x1 - x0, y1 - y0)
    const ux = (x1 - x0) / len
    const uy = (y1 - y0) / len
    const nx = -uy * side
    const ny = ux * side
    for (let s = 5; s + 9 < len; s += gap) {
      const a: Pt = [x0 + ux * s, y0 + uy * s]
      const b: Pt = [a[0] + ux * 9, a[1] + uy * 9]
      const tip: Pt = [a[0] + ux * 4.5 + nx * 7, a[1] + uy * 4.5 + ny * 7]
      teeth += `M${pt(a)}L${pt(tip)}L${pt(b)}Z`
    }
  }
  const line = `M${pts.map(pt).join('L')}`
  // linha azul fina do lado do inimigo, além das pontas dos dentes
  const counter = `M${offset(pts, 11 * side)
    .map(pt)
    .join('L')}`
  return { line, teeth, counter }
}

const jag = (pts: Pt[], seed: number) => wobble(pts, 16, 7, seed)

// Estado A (início da guerra): corredor azul aberto em Velmora
export const FRONT_A = {
  top: jag(
    [
      [528, 92],
      [610, 70],
      [700, 64],
      [800, 68],
      [880, 62],
    ],
    701,
  ),
  corridorW: jag(
    [
      [880, 62],
      [884, 30],
      [878, -12],
    ],
    702,
  ),
  corridorE: jag(
    [
      [1102, -12],
      [1096, 30],
      [1102, 62],
    ],
    703,
  ),
  east: jag(
    [
      [1102, 62],
      [1200, 66],
      [1300, 60],
      [1400, 64],
      [1470, 76],
      [1404, 160],
      [1392, 300],
      [1400, 440],
      [1388, 600],
      [1396, 760],
      [1390, 920],
    ],
    704,
  ),
  west: jag(
    [
      [262, 178],
      [210, 260],
      [196, 400],
      [208, 560],
      [196, 720],
      [204, 920],
    ],
    705,
  ),
}

// Províncias que trocam de dono: cada uma apaga o trecho antigo (borrão de
// lápis de cera), ganha hachura vermelha e a nova linha.
export interface Province {
  id: string
  // retângulo do recorte (unidades do mapa)
  box: [number, number, number, number]
  erase: string
  band: string
  line: string
  teeth: string
  counter: string
}
const province = (
  id: string,
  box: [number, number, number, number],
  a: Pt[],
  b: Pt[],
  side: 1 | -1,
  seed: number,
): Province => {
  const bb = jag(b, seed)
  const f = frontLine(bb, side)
  const has = a.length > 1
  return {
    id,
    box,
    erase: has ? `M${a.map(pt).join('L')}` : '',
    band: has
      ? `M${a.map(pt).join('L')}L${[...bb].reverse().map(pt).join('L')}Z`
      : '',
    line: f.line,
    teeth: f.teeth,
    counter: f.counter,
  }
}
// pedaço do estado A entre dois x (faixa de cima) ou dois y (laterais)
const sliceX = (pts: Pt[], x0: number, x1: number) =>
  pts.filter(([x]) => x >= x0 - 1 && x <= x1 + 1)
const sliceY = (pts: Pt[], y0: number, y1: number) =>
  pts.filter(([, y]) => y >= y0 - 1 && y <= y1 + 1)
const lineAt = (x0: number, x1: number, y: number, slope = 0): Pt[] => {
  const n = Math.max(2, Math.round((x1 - x0) / 40) + 1)
  return Array.from({ length: n }, (_, i) => {
    const x = x0 + ((x1 - x0) * i) / (n - 1)
    return [x, y + slope * (x - x0)] as Pt
  })
}
const colAt = (y0: number, y1: number, x: number): Pt[] => {
  const n = Math.max(2, Math.round((y1 - y0) / 50) + 1)
  return Array.from({ length: n }, (_, i) => [
    x,
    y0 + ((y1 - y0) * i) / (n - 1),
  ])
}

export const PROVINCE_LIST: Province[] = [
  // faixa de cima: a frente desce ~18 unidades
  province(
    't1',
    [520, 40, 190, 80],
    sliceX(FRONT_A.top, 520, 700),
    lineAt(536, 700, 100, -0.08),
    1,
    801,
  ),
  province(
    't2',
    [690, 40, 200, 70],
    sliceX(FRONT_A.top, 700, 880),
    lineAt(700, 880, 86),
    1,
    802,
  ),
  // corredor: só fecha por baixo (Velmora fica cercada)
  province('t3', [870, 40, 130, 70], [], lineAt(880, 992, 84), 1, 803),
  province('t4', [985, 40, 125, 70], [], lineAt(990, 1102, 86), 1, 804),
  province(
    't5',
    [1095, 40, 175, 70],
    sliceX(FRONT_A.east, 1100, 1260),
    lineAt(1102, 1260, 84),
    1,
    805,
  ),
  province(
    't6',
    [1250, 40, 160, 70],
    sliceX(FRONT_A.east, 1255, 1400),
    lineAt(1260, 1400, 82),
    1,
    806,
  ),
  province(
    't7',
    [1390, 40, 110, 140],
    FRONT_A.east.filter(([x, y]) => x >= 1399 && y < 170),
    [
      [1400, 82],
      [1446, 92],
      [1384, 166],
    ],
    1,
    807,
  ),
  // margem esquerda: a frente avança ~34 para a direita
  province(
    'w1',
    [180, 170, 90, 220],
    sliceY(FRONT_A.west, 178, 390),
    [
      [270, 186],
      [238, 270],
      [232, 390],
    ],
    -1,
    811,
  ),
  province(
    'w2',
    [180, 380, 80, 210],
    sliceY(FRONT_A.west, 390, 580),
    colAt(390, 580, 236),
    -1,
    812,
  ),
  province(
    'w3',
    [180, 570, 80, 230],
    sliceY(FRONT_A.west, 580, 790),
    colAt(580, 790, 232),
    -1,
    813,
  ),
  // margem direita: a frente avança ~34 para a esquerda
  province(
    'e1',
    [1340, 150, 80, 160],
    sliceY(FRONT_A.east, 160, 300).filter(([x]) => x < 1420),
    colAt(166, 300, 1360),
    1,
    821,
  ),
  province(
    'e2',
    [1340, 290, 80, 240],
    sliceY(FRONT_A.east, 300, 520).filter(([x]) => x < 1420),
    colAt(300, 520, 1358),
    1,
    822,
  ),
  province(
    'e3',
    [1340, 510, 80, 270],
    sliceY(FRONT_A.east, 520, 770).filter(([x]) => x < 1420),
    colAt(520, 770, 1362),
    1,
    823,
  ),
]

// estado A desenhado na carta (fica por baixo das províncias)
export const FRONT_BASE = [
  frontLine(FRONT_A.top, 1),
  frontLine(FRONT_A.corridorW, 1),
  frontLine(FRONT_A.corridorE, 1),
  frontLine(FRONT_A.east, 1),
  frontLine(FRONT_A.west, -1),
]

// ---- setas de ofensiva: curva quadrática engrossando até a ponta ----
export const arrow = (p0: Pt, c: Pt, p2: Pt, w: number) => {
  const N = 16
  const neck = 0.8
  const at = (t: number): Pt => [
    (1 - t) ** 2 * p0[0] + 2 * (1 - t) * t * c[0] + t * t * p2[0],
    (1 - t) ** 2 * p0[1] + 2 * (1 - t) * t * c[1] + t * t * p2[1],
  ]
  const normal = (t: number): Pt => {
    const tx = 2 * (1 - t) * (c[0] - p0[0]) + 2 * t * (p2[0] - c[0])
    const ty = 2 * (1 - t) * (c[1] - p0[1]) + 2 * t * (p2[1] - c[1])
    const len = Math.hypot(tx, ty) || 1
    return [-ty / len, tx / len]
  }
  const left: Pt[] = []
  const right: Pt[] = []
  for (let i = 0; i <= N; i++) {
    const t = (i / N) * neck
    const [x, y] = at(t)
    const [nx, ny] = normal(t)
    const half = (w * (0.3 + (0.7 * t) / neck)) / 2
    left.push([x + nx * half, y + ny * half])
    right.push([x - nx * half, y - ny * half])
  }
  const [bx, by] = at(neck)
  const [nx, ny] = normal(neck)
  const head = w * 1.05
  // listras de "avanço" atravessando a seta (chevrons pintados)
  let stripes = ''
  for (let i = 1; i < 6; i++) {
    const t = (i / 6) * neck
    const [x, y] = at(t)
    const [mx, my] = normal(t)
    const half = (w * (0.3 + (0.7 * t) / neck)) / 2 - 1.5
    stripes += `M${pt([x + mx * half, y + my * half])}L${pt([x - mx * half, y - my * half])}`
  }
  return {
    body:
      `M${left.map(pt).join('L')}` +
      `L${pt([bx + nx * head, by + ny * head])}L${pt(p2)}` +
      `L${pt([bx - nx * head, by - ny * head])}` +
      `L${right.reverse().map(pt).join('L')}Z`,
    stripes,
  }
}

// ---- manchas de café, borrões e anotações a lápis ----
export const STAINS: [number, number, number][] = [
  [1458, 210, 40],
  [140, 160, 34],
  [1180, 812, 30],
  [612, 34, 22],
]
export const PENCIL =
  // círculo de lápis de cera em volta de Velmora (objetivo)
  smooth(
    wobble(
      Array.from({ length: 19 }, (_, i) => {
        const a = (i / 18) * Math.PI * 2.15 - 0.4
        return [990 + Math.cos(a) * 44, 50 + Math.sin(a) * 26] as Pt
      }),
      10,
      3,
      901,
    ),
  ) +
  // risquinhos de contagem perto de Dunhal
  'M1442 34l2 12M1447 34l2 12M1452 34l2 12M1457 34l2 12M1439 44l22 -8'
