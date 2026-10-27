import type { CSSProperties, ReactNode } from 'react'
import { Blimp, Cards, Chips, Dice } from './Props'
import SlotMachine from './Slot'

// Cena de fundo do tema Cassino (só aparece com data-theme="cassino").
// Bulevar de Las Vegas à noite, azul-marinho e dourado, emoldurando a UI,
// com jogos de verdade em CSS 3D (preserve-3d) nas beiradas, onde aparecem:
// - torre da esquerda: letreiro vertical CASSINO, marquise "Roleta", dois
//   dados vermelhos translúcidos no topo (pulam e capotam) e duas pilhas de
//   fichas no terraço, com a ficha de cima jogada para o alto girando;
// - torre da direita: um caça-níquel gigante na fachada (Slot.tsx) com três
//   rolos cilíndricos, alavanca e letreiro JACKPOT; joga sozinho a cada
//   ~34 s e dá 7-7-7 uma vez por ciclo; letreiro redondo 24H e marquise;
// - céu: holofotes, lua, estrelas, um dirigível com LED, um truque de
//   cartas (sequência real de copas virando no ar) e fogos à meia-noite;
// - fundo: hotéis com janelas, palmeiras e a avenida com táxis e limusine.
//
// Escalas de tempo (theme.css): laços de segundos (lâmpadas correndo,
// fichas, brilhos, LED), eventos de 20–60 s (jogadas da máquina, dados,
// cartas, carros), raros de minutos (7-7-7 a cada 3,5 min, dirigível a
// cada 2,7 min, fogos e garoa no ciclo do dia de 4,5 min).
// Ciclo do dia (--cs-cycle): entardecer com os letreiros ligando um a um →
// noite com holofotes → fogos dourados à meia-noite → garoa com reflexos →
// amanhecer → manhã com sol e flare → volta ao entardecer.
//
// Roleta (data-wheel no <html>): girando, os rolos giram junto, a alavanca
// é puxada, as lâmpadas correm 3x mais rápido e entram holofotes rápidos;
// no vencedor os rolos param em 7-7-7, tudo pisca 3 vezes na cor vencedora
// (--win-color), sai uma fonte de moedas, dois estouros abrem no céu e fica
// uma brasa suave enquanto o modal estiver aberto.
//
// Sorteios com semente fixa (iguais no servidor e no navegador). Formas da
// mesma cor ficam num só <path>. Cada camada com tempo próprio é um <svg>
// ou <div> separado, para opacidade e movimento rodarem na GPU.
//
// Geometria: tudo escala pela altura (1 unidade = 1/900 da altura da tela,
// --cs-u no CSS). As torres das beiradas ficam em duas molduras presas à
// esquerda e à direita (viewBox 1800 x 900); a avenida, os hotéis do fundo
// e os carros ficam num palco centrado (viewBox 4000 x 900). A calçada
// está em y = 806 nos dois, então tudo se encontra em qualquer tamanho.

const seeded = (seed: number) => () => {
  seed = (seed + 0x6d2b79f5) | 0
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}
const n = (v: number) => Math.round(v * 10) / 10
const rect = (x: number, y: number, w: number, h: number) =>
  `M${n(x)} ${n(y)}h${n(w)}v${n(h)}h${n(-w)}z`
const dot = (x: number, y: number, r: number) =>
  `M${n(x - r)} ${n(y)}a${n(r)} ${n(r)} 0 1 0 ${n(r * 2)} 0a${n(r)} ${n(r)} 0 1 0 ${n(-r * 2)} 0z`
const poly = (pts: number[][]) =>
  `M${pts.map(([x, y]) => `${n(x)} ${n(y)}`).join('L')}Z`
const sparkle = (x: number, y: number, s: number) =>
  `M${n(x)} ${n(y - s)}Q${n(x)} ${n(y)} ${n(x + s)} ${n(y)}Q${n(x)} ${n(y)} ${n(x)} ${n(y + s)}Q${n(x)} ${n(y)} ${n(x - s)} ${n(y)}Q${n(x)} ${n(y)} ${n(x)} ${n(y - s)}Z`
const cx = (...c: (string | false | undefined)[]) => c.filter(Boolean).join(' ')
// atraso no ciclo (fração): o CSS soma em animation-delay
const lag = (k: number) => ({ '--cs-lag': k }) as CSSProperties
// posição em unidades da cena (1/900 da altura)
const u = (v: number) => `calc(var(--cs-u) * ${n(v)})`

// ---------------------------------------------------------------------
// Molduras laterais: d = distância da beirada da tela
// ---------------------------------------------------------------------
const FW = 1800
const FH = 900
const WALK = 806
type Side = 'l' | 'r'
const fx = (s: Side, d: number, w = 0) => (s === 'l' ? d : FW - d - w)
const fr = (s: Side, d: number, y: number, w: number, h: number) =>
  rect(fx(s, d, w), y, w, h)
const fp = (s: Side, pts: number[][]) =>
  poly(pts.map(([d, y]) => [s === 'l' ? d : FW - d, y]))

// janelas: célula 12 x 16, vidro 6 x 9
const WX = 12
const WY = 16
const GROUPS = 2

type Box = [number, number, number, number]
type FrameSpec = {
  back: Box[]
  backTrim: Box[]
  backExtra?: (s: Side) => string
  podium: Box[]
  front: Box[]
  frontTrim: Box[]
  spire: number[][]
  windows: Box[]
  blade?: { d: number; y: number; h: number; word: string }
  canopy: { d: number; y: number; w: number; h: number; text: string }
  entrance: Box
  doors: number[]
  palm: number
}

const LEFT: FrameSpec = {
  back: [
    [168, 268, 240, 538],
    [196, 246, 184, 22],
    [232, 228, 112, 18],
    [287, 186, 3, 42],
  ],
  backTrim: [
    [174, 268, 2, 324],
    [400, 268, 2, 324],
    [196, 246, 184, 2],
    [232, 228, 112, 2],
  ],
  podium: [
    [120, 592, 520, 214],
    [112, 584, 536, 8],
  ],
  front: [
    [0, 152, 142, 654],
    [6, 132, 130, 20],
    [22, 112, 98, 20],
    [40, 92, 62, 20],
  ],
  frontTrim: [
    [0, 152, 142, 2],
    [6, 132, 130, 2],
    [22, 112, 98, 2],
    [40, 92, 62, 2],
    [112, 584, 536, 2],
  ],
  spire: [],
  windows: [
    [12, 176, 84, 512],
    [180, 288, 216, 288],
    [336, 608, 288, 96],
  ],
  blade: { d: 100, y: 196, h: 408, word: 'CASSINO' },
  canopy: { d: 10, y: 702, w: 282, h: 44, text: 'Roleta' },
  entrance: [40, 746, 222, 60],
  doors: [96, 150, 204],
  palm: 300,
}

const RIGHT: FrameSpec = {
  back: [
    [192, 252, 240, 554],
    [311, 166, 3, 18],
  ],
  backTrim: [
    [198, 252, 2, 340],
    [424, 252, 2, 340],
  ],
  // cúpula do hotel do fundo
  backExtra: (s) => {
    const c = s === 'l' ? 312 : FW - 312
    return `M${c - 72} 252A72 72 0 0 1 ${c + 72} 252Z`
  },
  podium: [
    [132, 612, 472, 194],
    [124, 604, 488, 8],
  ],
  front: [
    [0, 120, 174, 686],
    [8, 100, 158, 20],
    [30, 80, 114, 20],
    [56, 60, 62, 20],
  ],
  frontTrim: [
    [0, 120, 174, 2],
    [8, 100, 158, 2],
    [30, 80, 114, 2],
    [56, 60, 62, 2],
    [124, 604, 488, 2],
  ],
  spire: [
    [80, 60],
    [87, 12],
    [94, 60],
  ],
  windows: [
    [12, 144, 84, 320],
    [12, 576, 84, 112],
    [204, 272, 216, 320],
    [252, 624, 336, 80],
  ],
  canopy: { d: 6, y: 728, w: 156, h: 32, text: 'CASSINO' },
  entrance: [22, 760, 124, 46],
  doors: [62, 104],
  palm: 268,
}
const H24 = { d: 58, y: 600, r: 38 }

// palmeira: tronco levemente curvo e folhas caídas
const palm = (s: Side, d: number) => {
  const top = 604
  const lean = s === 'l' ? 12 : -12
  let p = fp(s, [
    [d - 5, WALK],
    [d + 5, WALK],
    [d + lean + 3, top],
    [d + lean - 3, top],
  ])
  const cxd = d + lean
  const leaves = [-170, -140, -110, -70, -40, -10, 150, 30]
  for (const deg of leaves) {
    const a = (deg * Math.PI) / 180
    const len = 58
    const tx = cxd + Math.cos(a) * len
    const ty = top + Math.sin(a) * len * 0.7 + 22
    const mx = (cxd + tx) / 2
    const my = (top + ty) / 2 - 16
    const map = (dd: number) => (s === 'l' ? dd : FW - dd)
    p += `M${n(map(cxd))} ${top}Q${n(map(mx))} ${n(my - 6)} ${n(map(tx))} ${n(ty)}Q${n(map(mx))} ${n(my + 6)} ${n(map(cxd))} ${top + 4}Z`
  }
  return p
}

// lâmpadas ao longo de um retângulo (perímetro), em 3 fases de perseguição
const bulbRect = (
  s: Side,
  d: number,
  y: number,
  w: number,
  h: number,
  step: number,
  edges: 'all' | 'tb',
) => {
  const pts: number[][] = []
  for (let x = d + step / 2; x < d + w; x += step) pts.push([x, y])
  if (edges === 'all')
    for (let yy = y + step / 2; yy < y + h; yy += step) pts.push([d + w, yy])
  for (let x = d + w - step / 2; x > d; x -= step) pts.push([x, y + h])
  if (edges === 'all')
    for (let yy = y + h - step / 2; yy > y; yy -= step) pts.push([d, yy])
  return pts.map(([dd, yy]) => [s === 'l' ? dd : FW - dd, yy])
}
const bulbRing = (s: Side, d: number, y: number, r: number, count: number) =>
  Array.from({ length: count }, (_, i) => {
    const a = (i / count) * Math.PI * 2
    const dd = d + Math.cos(a) * r
    return [s === 'l' ? dd : FW - dd, y + Math.sin(a) * r]
  })

type Marquee = {
  phases: [string, string][]
  dim: string
  all?: string
  halo?: string
}
const join = (a: Marquee, b: Marquee): Marquee => ({
  phases: a.phases.map(([c, h], i) => [
    c + b.phases[i][0],
    h + b.phases[i][1],
  ]) as [string, string][],
  dim: a.dim + b.dim,
})
const marquee = (pts: number[][]): Marquee => {
  const phases: [string, string][] = [
    ['', ''],
    ['', ''],
    ['', ''],
  ]
  let dim = ''
  let all = ''
  let halo = ''
  pts.forEach(([x, y], i) => {
    phases[i % 3][0] += dot(x, y, 2.1)
    phases[i % 3][1] += dot(x, y, 5)
    dim += dot(x, y, 1.8)
    all += dot(x, y, 2.3)
    halo += dot(x, y, 5.5)
  })
  return { phases, dim, all, halo }
}

const frame = (s: Side, spec: FrameSpec, seed: number) => {
  const rand = seeded(seed)
  const back =
    spec.back.map(([d, y, w, h]) => fr(s, d, y, w, h)).join('') +
    (spec.backExtra ? spec.backExtra(s) : '')
  const podium = spec.podium.map(([d, y, w, h]) => fr(s, d, y, w, h)).join('')
  const front =
    spec.front.map(([d, y, w, h]) => fr(s, d, y, w, h)).join('') +
    (spec.spire.length ? fp(s, spec.spire) : '')
  const trim = [...spec.backTrim, ...spec.frontTrim]
    .map(([d, y, w, h]) => fr(s, d, y, w, h))
    .join('')
  // janelas: áreas inteiras no vidro apagado, faixas de 4 andares sorteadas
  // entre os grupos que acendem cada um no seu tempo
  let dim = ''
  const lit: string[] = Array.from({ length: GROUPS }, () => '')
  for (const [d, y, w, h] of spec.windows) {
    dim += fr(s, d, y, w, h)
    for (let yy = y; yy < y + h; yy += WY * 4) {
      const hh = Math.min(WY * 4, y + h - yy)
      lit[Math.floor(rand() * GROUPS)] += fr(s, d, yy, w, hh)
    }
  }
  // lâmina vertical opcional (a da direita deu lugar ao caça-níquel)
  const b = spec.blade ?? { d: 0, y: 0, h: 0, word: '' }
  const blade = spec.blade ? fr(s, b.d, b.y, 48, b.h) : ''
  const bcx = s === 'l' ? b.d + 24 : FW - b.d - 24
  const bladeTop = spec.blade
    ? poly([
        [bcx, b.y - 30],
        [bcx + 12, b.y - 15],
        [bcx, b.y],
        [bcx - 12, b.y - 15],
      ])
    : ''
  const c = spec.canopy
  const canopy =
    fr(s, c.d, c.y, c.w, c.h) +
    fr(s, c.d + 8, c.y + c.h, 3, WALK - c.y - c.h) +
    fr(s, c.d + c.w - 11, c.y + c.h, 3, WALK - c.y - c.h)
  const [ed, ey, ew, eh] = spec.entrance
  const doors = spec.doors.map((d) => fr(s, d, ey + 10, 2, eh - 10)).join('')
  const letters = b.word.split('')
  return {
    back,
    podium,
    front,
    trim,
    dim,
    lit,
    blade,
    bladeTop,
    canopy,
    doors,
    entrance: fr(s, ed, ey, ew, eh),
    palm: palm(s, spec.palm),
    bladeText: {
      x: letters.map(() => bcx).join(' '),
      y: letters.map((_, i) => b.y + 56 + i * 54).join(' '),
      word: b.word,
    },
    canopyText: {
      x: s === 'l' ? c.d + c.w / 2 : FW - c.d - c.w / 2,
      y: c.y + c.h - (s === 'l' ? 9 : 10),
      word: c.text,
    },
    bladeBulbs: marquee(
      spec.blade ? bulbRect(s, b.d, b.y, 48, b.h, 13.6, 'all') : [],
    ),
    canopyBulbs: marquee(bulbRect(s, c.d, c.y, c.w, c.h, 12.8, 'tb')),
    // reflexos na avenida molhada, sob os letreiros
    wet: {
      gold: (() => {
        // traços verticais sob as lâmpadas, o letreiro e a porta
        const r = seeded(seed + 5)
        let d = spec.blade ? fr(s, b.d + 14, 824, 20, 70) : ''
        for (let x = c.d + 6; x < c.d + c.w - 6; x += 12.8 + r() * 10) {
          d += fr(s, x, 824, 2 + r() * 4, 24 + r() * 50)
        }
        for (let x = ed + 10; x < ed + ew - 10; x += 22 + r() * 16)
          d += fr(s, x, 826, 6 + r() * 8, 40 + r() * 34)
        return d
      })(),
    },
  }
}
const FL = frame('l', LEFT, 21)
const FR = frame('r', RIGHT, 37)
const RING = marquee(bulbRing('r', H24.d, H24.y, H24.r + 7, 27))
const H24X = FW - H24.d

// ---------------------------------------------------------------------
// Palco centrado: hotéis do fundo, avenida e carros
// ---------------------------------------------------------------------
const SW = 4000
const MID = SW / 2
const ROAD = 820
const FWX = 8
const FWY = 12

const skyline = () => {
  const rand = seeded(1955)
  let far = ''
  let dim = ''
  let mast = ''
  const lit: string[] = Array.from({ length: GROUPS }, () => '')
  const beacons: number[][] = []
  for (let x = 0; x < SW; ) {
    const w = FWX * (6 + Math.floor(rand() * 14))
    const top = FWY * Math.floor(30 + rand() * 28)
    far += rect(x, top, w, WALK - top)
    if (w > FWX * 10 && rand() < 0.5) {
      far += rect(x + FWX * 2, top - 14, w - FWX * 4, 14)
      if (rand() < 0.6) {
        mast += rect(x + w / 2 - 1, top - 44, 2, 30)
        beacons.push([x + w / 2, top - 46])
      }
    }
    const ax = x + FWX
    const ay = top + FWY * 2
    const aw = w - FWX * 2
    const ah = Math.floor((WALK - 40 - ay) / FWY) * FWY
    if (aw > 0 && ah > 0) {
      dim += rect(ax, ay, aw, ah)
      for (let yy = ay; yy < ay + ah; yy += FWY * 5) {
        const hh = Math.min(FWY * 5, ay + ah - yy)
        if (rand() < 0.8)
          lit[Math.floor(rand() * GROUPS)] += rect(ax, yy, aw, hh)
      }
    }
    x += w + FWX * Math.floor(rand() * 3)
  }
  // torre-agulha ao fundo, com farol vermelho no alto
  const nx = MID + 560
  mast += rect(nx - 1, 36, 2, 110)
  far +=
    rect(nx - 9, 190, 18, WALK - 190) +
    `M${nx - 48} 168L${nx + 48} 168L${nx + 30} 196L${nx - 30} 196Z` +
    `M${nx - 34} 146L${nx + 34} 146L${nx + 48} 168L${nx - 48} 168Z`
  return { far, dim, lit, mast, beacons, needle: [nx, 34] }
}
const SKY = skyline()

const road = () => {
  let dashes = ''
  for (let x = 0; x < SW; x += 64) dashes += rect(x, 861, 30, 2)
  return {
    walk: rect(0, WALK, SW, ROAD - WALK),
    curb: rect(0, ROAD - 2, SW, 2),
    road: rect(0, ROAD, SW, FH - ROAD),
    dashes,
  }
}
const ROADS = road()

// Carros: desenhados no meio do palco; o CSS desliza a camada inteira
type CarShape = {
  body: string
  dark: string
  glass: string
  trim: string
  wheels: string
  hubs: string
  head: string
  tail: string
  roof: string
  beam: string
}
const taxi = (g: number): CarShape => {
  const x = MID - 60
  const wheels = dot(x + 26, g - 7, 8) + dot(x + 96, g - 7, 8)
  let checks = ''
  for (let i = 0; i < 12; i++)
    if (i % 2) checks += rect(x + 12 + i * 8, g - 19, 8, 3)
  return {
    body: poly([
      [x + 2, g - 9],
      [x + 118, g - 9],
      [x + 120, g - 20],
      [x + 104, g - 25],
      [x + 86, g - 26],
      [x + 72, g - 39],
      [x + 34, g - 39],
      [x + 22, g - 26],
      [x + 3, g - 23],
    ]),
    dark: checks + rect(x + 2, g - 10, 116, 3),
    glass:
      poly([
        [x + 37, g - 36],
        [x + 52, g - 36],
        [x + 52, g - 27],
        [x + 28, g - 27],
      ]) +
      poly([
        [x + 56, g - 36],
        [x + 70, g - 36],
        [x + 81, g - 27],
        [x + 56, g - 27],
      ]),
    trim: rect(x + 44, g - 45, 16, 6),
    wheels,
    hubs: dot(x + 26, g - 7, 3) + dot(x + 96, g - 7, 3),
    head: rect(x + 115, g - 21, 5, 4),
    tail: rect(x + 1, g - 21, 4, 5),
    roof: rect(x + 45, g - 44, 14, 4),
    beam: poly([
      [x + 119, g - 19],
      [x + 300, g - 34],
      [x + 300, g + 6],
    ]),
  }
}
const limo = (g: number): CarShape => {
  const x = MID - 120
  return {
    body: poly([
      [x + 2, g - 9],
      [x + 238, g - 9],
      [x + 240, g - 20],
      [x + 222, g - 25],
      [x + 200, g - 26],
      [x + 188, g - 37],
      [x + 40, g - 37],
      [x + 26, g - 26],
      [x + 3, g - 23],
    ]),
    dark: rect(x + 2, g - 10, 236, 3),
    glass:
      rect(x + 44, g - 34, 34, 8) +
      rect(x + 84, g - 34, 46, 8) +
      rect(x + 136, g - 34, 26, 8) +
      poly([
        [x + 168, g - 34],
        [x + 186, g - 34],
        [x + 196, g - 26],
        [x + 168, g - 26],
      ]),
    trim: rect(x + 4, g - 19, 234, 1.5),
    wheels: dot(x + 30, g - 7, 8) + dot(x + 206, g - 7, 8),
    hubs: dot(x + 30, g - 7, 3) + dot(x + 206, g - 7, 3),
    head: rect(x + 235, g - 21, 5, 4),
    tail: rect(x + 1, g - 21, 4, 5),
    roof: '',
    beam: poly([
      [x + 239, g - 19],
      [x + 420, g - 34],
      [x + 420, g + 6],
    ]),
  }
}
const CARS = [
  { key: 'b', car: taxi(844), dir: -1, dur: 27, delay: -15, park: 41 },
  { key: 'd', car: limo(853), dir: -1, dur: 44, delay: -2, park: -40 },
  { key: 'a', car: taxi(882), dir: 1, dur: 21, delay: -6, park: -33 },
  { key: 'c', car: taxi(893), dir: 1, dur: 33, delay: -25, park: 36 },
]
const MIRROR = `matrix(-1 0 0 1 ${SW} 0)`

// ---------------------------------------------------------------------
// Céu: estrelas, nuvens, chuva, fogos e flare
// ---------------------------------------------------------------------
const starfield = () => {
  const rand = seeded(777)
  let sky = ''
  let twA = ''
  let twB = ''
  for (let i = 0; i < 120; i++) {
    const y = Math.pow(rand(), 1.6) * 560
    sky += dot(rand() * 1600, y, 0.5 + rand() * 1)
  }
  for (let i = 0; i < 28; i++) {
    const s = sparkle(
      rand() * 1600,
      8 + Math.pow(rand(), 1.4) * 420,
      2.5 + rand() * 4,
    )
    if (i % 2) twA += s
    else twB += s
  }
  return { sky, twA, twB }
}
const STARS = starfield()

// nuvens: duas cópias lado a lado, para o laço de deriva não ter emenda
const clouds = (seed: number, count: number) => {
  const rand = seeded(seed)
  let d = ''
  let rim = ''
  for (let i = 0; i < count; i++) {
    const x = rand() * 1600
    const y = 60 + rand() * 170
    const w = 120 + rand() * 220
    for (let k = 0; k < 5; k++) {
      const px = x + (k / 4 - 0.5) * w
      const r = (0.18 + rand() * 0.16) * w * (k === 2 ? 1.2 : 0.8)
      const ry = r * 0.42
      for (const off of [0, 1600]) {
        d += `M${n(px - r + off)} ${n(y)}a${n(r)} ${n(ry)} 0 1 0 ${n(r * 2)} 0a${n(r)} ${n(ry)} 0 1 0 ${n(-r * 2)} 0z`
        rim += `M${n(px - r * 0.9 + off)} ${n(y + ry * 0.55)}a${n(r * 0.9)} ${n(ry * 0.45)} 0 1 0 ${n(r * 1.8)} 0a${n(r * 0.9)} ${n(ry * 0.45)} 0 1 0 ${n(-r * 1.8)} 0z`
      }
    }
  }
  return { d, rim }
}
const CLOUDS_FAR = clouds(91, 7)
const CLOUDS_NEAR = clouds(57, 5)

const rain = () => {
  const rand = seeded(404)
  let d = ''
  for (let i = 0; i < 150; i++) {
    const x = n(rand() * 1600)
    const y = n(rand() * 900)
    const len = n(18 + rand() * 30)
    d += `M${x} ${y}v${len}M${x} ${n(y + 900)}v${len}`
  }
  return d
}
const RAIN = rain()

// fogos: raios afinando para fora, pontas brilhantes e purpurina que cai
const firework = (seed: number) => {
  const rand = seeded(seed)
  let rays = ''
  let tips = ''
  let glitter = ''
  const count = 22
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2 + rand() * 0.08
    const r0 = 9 + rand() * 4
    const r1 = 34 + rand() * 8
    const s = 0.035
    rays += poly([
      [Math.cos(a) * r0, Math.sin(a) * r0],
      [Math.cos(a - s) * r1, Math.sin(a - s) * r1],
      [Math.cos(a) * (r1 + 3), Math.sin(a) * (r1 + 3)],
      [Math.cos(a + s) * r1, Math.sin(a + s) * r1],
    ])
    tips += dot(Math.cos(a) * (r1 + 5), Math.sin(a) * (r1 + 5), 1.5)
  }
  for (let i = 0; i < 26; i++) {
    const a = rand() * Math.PI * 2
    const r = 14 + rand() * 32
    glitter += dot(Math.cos(a) * r, Math.sin(a) * r, 0.7 + rand() * 0.8)
  }
  return { rays, tips, glitter }
}
const FIREWORKS = [
  { left: 36, top: 8, size: 22, tone: 'gold', k: 0 },
  { left: 61, top: 9, size: 26, tone: 'champ', k: 0.006 },
  { left: 22, top: 12, size: 18, tone: 'rose', k: 0.011 },
  { left: 48, top: 6, size: 17, tone: 'gold', k: 0.017 },
  { left: 76, top: 7, size: 20, tone: 'rose', k: 0.003 },
].map((f, i) => ({ ...f, shape: firework(300 + i * 17) }))
const WINBURSTS = [
  { left: 44, top: 6, size: 24 },
  { left: 60, top: 4, size: 19 },
].map((f, i) => ({ ...f, shape: firework(520 + i * 31) }))
const BEAMS: { k: string; at: CSSProperties }[] = [
  { k: 'a', at: { left: u(262), top: u(228) } },
  { k: 'b', at: { left: u(318), top: u(228) } },
  { k: 'c', at: { right: u(286), top: u(186) } },
  { k: 'd', at: { right: u(338), top: u(186) } },
]

const flareRays = () => {
  let d = ''
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2
    const r = i % 2 ? 150 : 220
    const s = 0.03
    d += poly([
      [300, 300],
      [300 + Math.cos(a - s) * r, 300 + Math.sin(a - s) * r],
      [300 + Math.cos(a + s) * r, 300 + Math.sin(a + s) * r],
    ])
  }
  return d
}
const FLARE_RAYS = flareRays()
const hexagon = (x: number, y: number, r: number) =>
  poly(
    Array.from({ length: 6 }, (_, i) => {
      const a = (i / 6) * Math.PI * 2 + Math.PI / 6
      return [x + Math.cos(a) * r, y + Math.sin(a) * r]
    }),
  )

// brilhos de moeda/ficha nas beiradas (d da beirada, y do topo)
const GLINTS: {
  side: Side
  d: number
  y: number
  s: number
  dur: number
  delay: number
}[] = [
  { side: 'l', d: 124, y: 166, s: 22, dur: 9, delay: -2 },
  { side: 'l', d: 106, y: 52, s: 16, dur: 11, delay: -7 },
  { side: 'l', d: 212, y: 528, s: 14, dur: 8, delay: -5 },
  { side: 'r', d: 128, y: 170, s: 20, dur: 12, delay: -1 },
]

// ---------------------------------------------------------------------
// Componentes de camada
// ---------------------------------------------------------------------
const Frame = ({
  side,
  className,
  style,
  children,
}: {
  side: Side
  className?: string
  style?: CSSProperties
  children: ReactNode
}) => (
  <svg
    className={cx(
      'cs-frame',
      side === 'l' ? 'cs-frame-l' : 'cs-frame-r',
      className,
    )}
    style={style}
    viewBox={`0 0 ${FW} ${FH}`}
    preserveAspectRatio={side === 'l' ? 'xMinYMax slice' : 'xMaxYMax slice'}
  >
    {children}
  </svg>
)
const Stage = ({
  className,
  style,
  children,
}: {
  className?: string
  style?: CSSProperties
  children: ReactNode
}) => (
  <svg
    className={cx('cs-stage', className)}
    style={style}
    viewBox={`0 0 ${SW} ${FH}`}
    preserveAspectRatio="xMidYMax slice"
  >
    {children}
  </svg>
)

const Bulbs = ({ side, m, k }: { side: Side; m: Marquee; k: number }) => (
  <div className="cs-marquee cs-cyc" style={lag(k)}>
    {m.phases.map(([core, halo], i) => (
      <Frame key={i} side={side} className={'cs-chase cs-chase-' + i}>
        <path className="cs-bulb-halo" d={halo} />
        <path className="cs-bulb" d={core} />
      </Frame>
    ))}
  </div>
)

const pos = (side: Side, d: number, y: number): CSSProperties =>
  side === 'l' ? { left: u(d), top: u(y) } : { right: u(d), top: u(y) }

export default function CassinoScene() {
  return (
    <>
      {/* céu: noite é o fundo; entardecer, aurora e manhã cruzam por cima */}
      <div className="cs-sky cs-sky-dusk cs-cyc" />
      <div className="cs-sky cs-sky-dawn cs-cyc" />
      <div className="cs-sky cs-sky-day cs-cyc" />
      <div className="cs-glow" />
      <div className="cs-cityglow cs-cyc" />

      {/* estrelas, lua, estrelas cadentes e avião */}
      <div className="cs-stars cs-cyc">
        <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMin slice">
          <path d={STARS.sky} />
        </svg>
        <svg
          className="cs-twinkle"
          viewBox="0 0 1600 900"
          preserveAspectRatio="xMidYMin slice"
        >
          <path d={STARS.twA} />
        </svg>
        <svg
          className="cs-twinkle cs-twinkle-b"
          viewBox="0 0 1600 900"
          preserveAspectRatio="xMidYMin slice"
        >
          <path d={STARS.twB} />
        </svg>
      </div>
      <div className="cs-moon cs-cyc">
        <i />
      </div>
      <div className="cs-shoot cs-shoot-1">
        <i className="cs-cyc" />
      </div>
      <div className="cs-shoot cs-shoot-2">
        <i className="cs-cyc" style={lag(0.17)} />
      </div>
      <div className="cs-plane cs-cyc">
        <i />
      </div>

      {/* sol da manhã com flare dourado (o flare segue o sol) */}
      <div className="cs-sunpath cs-cyc">
        <div className="cs-sun" />
        <div className="cs-flare cs-cyc">
          <svg className="cs-flare-rays" viewBox="0 0 600 600">
            <path d={FLARE_RAYS} />
          </svg>
          <svg className="cs-flare-ghosts" viewBox="0 0 600 600">
            <circle className="cs-flare-ring" cx="300" cy="300" r="96" />
            <path
              d={
                hexagon(250, 420, 26) +
                hexagon(214, 506, 14) +
                dot(276, 360, 9) +
                dot(170, 610, 34)
              }
            />
          </svg>
        </div>
      </div>

      {/* nuvens em duas camadas (parallax): claras de dia, escuras na chuva */}
      <div className="cs-clouds cs-clouds-day cs-cyc">
        <div className="cs-drift cs-drift-slow">
          <svg viewBox="0 0 3200 300" preserveAspectRatio="none">
            <path d={CLOUDS_FAR.d} />
          </svg>
        </div>
      </div>
      <div className="cs-clouds cs-clouds-night cs-cyc">
        <div className="cs-drift cs-drift-slow">
          <svg viewBox="0 0 3200 300" preserveAspectRatio="none">
            <path d={CLOUDS_FAR.d} />
            <path className="cs-cloud-rim" d={CLOUDS_FAR.rim} />
          </svg>
        </div>
        <div className="cs-drift cs-drift-fast">
          <svg viewBox="0 0 3200 300" preserveAspectRatio="none">
            <path d={CLOUDS_NEAR.d} />
            <path className="cs-cloud-rim" d={CLOUDS_NEAR.rim} />
          </svg>
        </div>
      </div>

      {/* dirigível com letreiro de LED cruzando o alto devagar */}
      <Blimp />

      {/* holofotes varrendo o céu, saindo dos telhados (uma cópia rápida
          entra por cima enquanto a roleta gira) */}
      <div className="cs-beams cs-cyc">
        <i
          className="cs-beam cs-beam-a"
          style={{ left: u(262), top: u(228) }}
        />
        <i
          className="cs-beam cs-beam-b"
          style={{ left: u(318), top: u(228) }}
        />
        <i
          className="cs-beam cs-beam-c"
          style={{ right: u(286), top: u(186) }}
        />
        <i
          className="cs-beam cs-beam-d"
          style={{ right: u(338), top: u(186) }}
        />
      </div>
      <div className="cs-beams-fast">
        {BEAMS.map((b, i) => (
          <i key={i} className={'cs-beam cs-beam-' + b.k} style={b.at} />
        ))}
      </div>

      {/* fogos dourados da meia-noite */}
      {FIREWORKS.map((f, i) => (
        <div
          key={i}
          className={cx('cs-fw', 'cs-fw-' + f.tone)}
          style={{
            left: `${f.left}%`,
            top: `${f.top}cqh`,
            width: `${f.size}cqh`,
            height: `${f.size}cqh`,
          }}
        >
          <i className="cs-fw-trail cs-cyc" style={lag(f.k)} />
          <svg
            className="cs-fw-burst cs-cyc"
            style={lag(f.k)}
            viewBox="-50 -50 100 100"
          >
            <path d={f.shape.rays} />
            <path className="cs-fw-tip" d={f.shape.tips + f.shape.glitter} />
          </svg>
        </div>
      ))}

      {/* truque de cartas na faixa do céu */}
      <Cards />

      {/* vitória: dois estouros na cor da fatia vencedora */}
      {WINBURSTS.map((w, i) => (
        <svg
          key={i}
          className={'cs-winburst cs-winburst-' + i}
          style={{
            left: w.left + '%',
            top: w.top + 'cqh',
            width: w.size + 'cqh',
            height: w.size + 'cqh',
          }}
          viewBox="-50 -50 100 100"
        >
          <path d={w.shape.rays} />
          <path className="cs-fw-tip" d={w.shape.tips + w.shape.glitter} />
        </svg>
      ))}

      {/* relâmpago distante */}
      <svg className="cs-bolt cs-cyc" viewBox="0 0 60 200">
        <path d="M34 0L18 78L30 80L12 150L22 152L6 200L40 126L28 124L46 64L34 62L44 0Z" />
      </svg>

      {/* hotéis do fundo, calçada e avenida (palco centrado) */}
      <Stage className="cs-skyline">
        <defs>
          <pattern
            id="cs-fwin-dim"
            width={FWX * 4}
            height={FWY * 4}
            patternUnits="userSpaceOnUse"
          >
            <path
              d={Array.from({ length: 16 }, (_, i) =>
                rect((i % 4) * FWX + 2, Math.floor(i / 4) * FWY + 3, 4, 6),
              ).join('')}
            />
          </pattern>
          {[0, 1].map((t) => {
            const rand = seeded(61 + t * 13)
            let a = ''
            let b = ''
            for (let i = 0; i < 30; i++) {
              const v = rand()
              const w = rect(
                (i % 5) * FWX + 2,
                Math.floor(i / 5) * FWY + 3,
                4,
                6,
              )
              if (v < 0.2) a += w
              else if (v < 0.28) b += w
            }
            return (
              <pattern
                key={t}
                id={`cs-fwin-${t}`}
                width={FWX * 5}
                height={FWY * 6}
                patternUnits="userSpaceOnUse"
              >
                <path className="cs-win-gold" d={a} />
                <path className="cs-win-champ" d={b} />
              </pattern>
            )
          })}
          <linearGradient id="cs-beam-grad" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" stopColor="#fff6d6" stopOpacity="0.55" />
            <stop offset="1" stopColor="#fff6d6" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path className="cs-far" d={SKY.far} />
        <path className="cs-far" d={SKY.mast} />
        <path className="cs-far-dim" d={SKY.dim} fill="url(#cs-fwin-dim)" />
        <path className="cs-walk" d={ROADS.walk} />
        <path className="cs-road" d={ROADS.road} />
        <path className="cs-curb" d={ROADS.curb} />
        <path className="cs-dash" d={ROADS.dashes} />
      </Stage>
      {SKY.lit.map((d, i) => (
        <Stage
          key={i}
          className={cx('cs-farwin', 'cs-cyc', i === 1 && 'cs-farwin-flicker')}
          style={lag(0.012 * i + (i % 2) * 0.02)}
        >
          <path d={d} fill={`url(#cs-fwin-${i % 2})`} />
        </Stage>
      ))}
      <Stage className="cs-farbeacons cs-cyc">
        <path d={SKY.beacons.map(([x, y]) => dot(x, y, 2.6)).join('')} />
        <path
          className="cs-needle-light"
          d={dot(SKY.needle[0], SKY.needle[1], 3.4)}
        />
      </Stage>

      {/* torres das beiradas */}
      {(
        [
          ['l', FL],
          ['r', FR],
        ] as const
      ).map(([side, F]) => (
        <Frame key={side} side={side} className="cs-towers">
          {side === 'l' && (
            <defs>
              <pattern
                id="cs-win-dim"
                width={WX * 2}
                height={WY * 2}
                patternUnits="userSpaceOnUse"
              >
                <path
                  d={
                    rect(3, 3, 6, 9) +
                    rect(WX + 3, 3, 6, 9) +
                    rect(3, WY + 3, 6, 9) +
                    rect(WX + 3, WY + 3, 6, 9)
                  }
                />
              </pattern>
              {[0, 1].map((t) => {
                const rand = seeded(17 + t * 29)
                let a = ''
                let b = ''
                for (let i = 0; i < 30; i++) {
                  const v = rand()
                  const w = rect(
                    (i % 5) * WX + 3,
                    Math.floor(i / 5) * WY + 3,
                    6,
                    9,
                  )
                  if (v < 0.2) a += w
                  else if (v < 0.3) b += w
                }
                return (
                  <pattern
                    key={t}
                    id={`cs-win-${t}`}
                    width={WX * 5}
                    height={WY * 6}
                    patternUnits="userSpaceOnUse"
                  >
                    <path className="cs-win-gold" d={a} />
                    <path className="cs-win-champ" d={b} />
                  </pattern>
                )
              })}
              <linearGradient id="cs-door-grad" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0" stopColor="#fde68a" stopOpacity="0.6" />
                <stop offset="0.5" stopColor="#f59e0b" stopOpacity="0.28" />
                <stop offset="1" stopColor="#b45309" stopOpacity="0.1" />
              </linearGradient>
              <linearGradient id="cs-wet-grad" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0" stopColor="#fcd34d" stopOpacity="0.55" />
                <stop offset="1" stopColor="#fcd34d" stopOpacity="0" />
              </linearGradient>
            </defs>
          )}
          <path className="cs-back" d={F.back} />
          <path className="cs-back-win" d={F.dim} fill="url(#cs-win-dim)" />
          <path className="cs-podium" d={F.podium} />
          <path className="cs-front" d={F.front} />
          <path className="cs-trim" d={F.trim} />
          <path className="cs-entrance" d={F.entrance} />
          <path className="cs-front" d={F.doors} />
          <path className="cs-panel" d={F.blade + F.canopy} />
          <path className="cs-trim" d={F.bladeTop} />
          <path
            className="cs-bulb-off"
            d={F.bladeBulbs.dim + F.canopyBulbs.dim}
          />
          <text
            className="cs-word cs-word-blade cs-word-off"
            x={F.bladeText.x}
            y={F.bladeText.y}
          >
            {F.bladeText.word}
          </text>
          <text
            className={cx(
              'cs-word',
              side === 'l' ? 'cs-word-script' : 'cs-word-deco',
              'cs-word-off',
            )}
            x={F.canopyText.x}
            y={F.canopyText.y}
          >
            {F.canopyText.word}
          </text>
          {side === 'r' && (
            <>
              <circle className="cs-panel" cx={H24X} cy={H24.y} r={H24.r} />
              <path className="cs-bulb-off" d={RING.dim} />
              <text
                className="cs-word cs-word-24 cs-word-off"
                x={H24X}
                y={H24.y + 11}
              >
                24H
              </text>
            </>
          )}
          <path className="cs-palm" d={F.palm} />
        </Frame>
      ))}

      {/* janelas acendendo ao anoitecer, cada grupo no seu tempo */}
      {(
        [
          ['l', FL],
          ['r', FR],
        ] as const
      ).flatMap(([side, F]) =>
        F.lit.map((d, i) => (
          <Frame
            key={side + i}
            side={side}
            className={cx('cs-win', 'cs-cyc', i === 1 && 'cs-win-flicker')}
            style={lag(0.008 + i * 0.014 + (side === 'r' ? 0.006 : 0))}
          >
            <path d={d} fill={`url(#cs-win-${i % 2})`} />
          </Frame>
        )),
      )}
      <div className="cs-entry cs-cyc" style={lag(0.02)}>
        <Frame side="l">
          <path d={FL.entrance} fill="url(#cs-door-grad)" />
          <path className="cs-front" d={FL.doors} />
        </Frame>
        <Frame side="r">
          <path d={FR.entrance} fill="url(#cs-door-grad)" />
          <path className="cs-front" d={FR.doors} />
        </Frame>
      </div>

      {/* letreiros: lâmpadas que correm e neon que liga piscando */}
      <Bulbs side="l" m={join(FL.canopyBulbs, FL.bladeBulbs)} k={0.012} />
      <Bulbs side="r" m={join(FR.canopyBulbs, RING)} k={0.024} />
      <Frame side="l" className="cs-neon cs-neon-gold cs-cyc" style={lag(0.03)}>
        <path className="cs-neon-line" d={FL.blade} />
        <text
          className="cs-word cs-word-blade"
          x={FL.bladeText.x}
          y={FL.bladeText.y}
        >
          {FL.bladeText.word}
        </text>
      </Frame>
      <Frame
        side="l"
        className="cs-neon cs-neon-gold cs-cyc"
        style={lag(0.012)}
      >
        <text
          className="cs-word cs-word-script"
          x={FL.canopyText.x}
          y={FL.canopyText.y}
        >
          {FL.canopyText.word}
        </text>
      </Frame>
      <Frame
        side="r"
        className="cs-neon cs-neon-champ cs-cyc"
        style={lag(0.042)}
      >
        <text
          className="cs-word cs-word-deco"
          x={FR.canopyText.x}
          y={FR.canopyText.y}
        >
          {FR.canopyText.word}
        </text>
      </Frame>
      <Frame
        side="r"
        className="cs-neon cs-neon-rose cs-neon-blink cs-cyc"
        style={lag(0.054)}
      >
        <circle className="cs-neon-line" cx={H24X} cy={H24.y} r={H24.r - 6} />
        <text className="cs-word cs-word-24" x={H24X} y={H24.y + 11}>
          24H
        </text>
      </Frame>

      {/* vitória da roleta: todas as lâmpadas piscam na cor vencedora */}
      <Frame side="l" className="cs-winbulbs">
        <path
          className="cs-winbulb-halo"
          d={FL.bladeBulbs.halo + '' + FL.canopyBulbs.halo}
        />
        <path
          className="cs-winbulb"
          d={FL.bladeBulbs.all + '' + FL.canopyBulbs.all}
        />
      </Frame>
      <Frame side="r" className="cs-winbulbs">
        <path
          className="cs-winbulb-halo"
          d={FR.canopyBulbs.halo + '' + RING.halo}
        />
        <path className="cs-winbulb" d={FR.canopyBulbs.all + '' + RING.all} />
      </Frame>

      {/* farol de aviação no alto da torre da direita */}
      <i className="cs-beacon" style={pos('r', 87, 12)} />

      {/* jogos de verdade nas beiradas: dados, fichas e o caça-níquel */}
      <Dice />
      <Chips />
      <SlotMachine />

      {/* brilhos dourados de ficha/moeda */}
      {GLINTS.map((g, i) => (
        <svg
          key={i}
          className="cs-glint"
          viewBox="-10 -10 20 20"
          style={{
            ...pos(g.side, g.d - g.s / 2, g.y - g.s / 2),
            width: u(g.s),
            height: u(g.s),
            animationDuration: `${g.dur}s`,
            animationDelay: `${g.delay}s`,
          }}
        >
          <path d={sparkle(0, 0, 10)} />
        </svg>
      ))}

      {/* avenida: carros na mesma moldura da rua (deslizam a camada toda) */}
      {CARS.map(({ key, car, dir, dur, delay, park }) => (
        <div
          key={key}
          className={cx('cs-car', dir > 0 ? 'cs-car-r' : 'cs-car-l')}
          style={
            {
              animationDuration: dur + 's',
              animationDelay: delay + 's',
              '--cs-park': park + '%',
            } as CSSProperties
          }
        >
          <Stage>
            <g transform={dir < 0 ? MIRROR : undefined}>
              <path className={car.roof ? 'cs-taxi' : 'cs-limo'} d={car.body} />
              <path className="cs-car-dark" d={car.dark} />
              <path className="cs-car-glass" d={car.glass} />
              <path
                className={car.roof ? 'cs-car-dark' : 'cs-car-trim'}
                d={car.trim}
              />
              <path className="cs-wheel" d={car.wheels} />
              <path className="cs-hub" d={car.hubs} />
            </g>
          </Stage>
          <Stage className="cs-car-lights">
            <g transform={dir < 0 ? MIRROR : undefined}>
              <path d={car.beam} fill="url(#cs-beam-grad)" />
              <path className="cs-headlight" d={car.head} />
              <path className="cs-taillight" d={car.tail} />
              {car.roof && <path className="cs-roof" d={car.roof} />}
            </g>
          </Stage>
        </div>
      ))}

      {/* garoa: reflexos dourados na avenida molhada, respingos e gotas */}
      <div className="cs-wet cs-cyc">
        <Frame side="l">
          <path d={FL.wet.gold} fill="url(#cs-wet-grad)" />
        </Frame>
        <Frame side="r">
          <path d={FR.wet.gold} fill="url(#cs-wet-grad)" />
        </Frame>
        <div className="cs-sheen" />
      </div>
      <div className="cs-rain cs-cyc">
        <div className="cs-rain-fall">
          <svg viewBox="0 0 1600 1800" preserveAspectRatio="none">
            <path d={RAIN} />
          </svg>
        </div>
      </div>
      <div className="cs-flash cs-cyc" />

      {/* giro: brilho quente subindo; vitória: brasa na cor vencedora */}
      <div className="cs-hype" />
      <div className="cs-afterglow" />

      {/* neblina do amanhecer rente ao chão */}
      <div className="cs-fog cs-cyc">
        <i />
        <i />
      </div>
    </>
  )
}
