// Geometria do túnel do monotrilho (tema Half-Life).
//
// Mundo em unidades de 0,1vh, com o ponto de fuga na origem: x para a
// direita, y para baixo. A câmera (perspective: 74vh em theme.css) olha para
// o fundo do túnel. Seção transversal: paredes em x = ±920, teto em
// y = -520 com chanfros de 200 nos cantos de cima e piso em y = +620.
//
// Truque central: tudo que corre AO LONGO do túnel (canos, cabos, faixas
// pintadas, guias de LED, quinas) é invariante ao andar para a frente, então
// vira um triângulo fixo saindo do ponto de fuga (SVG estático, rasterizado
// uma vez). Só o que cruza o túnel (cambotas, lâmpadas, portas, placas) se
// move em 3D (translateZ), carregando braçadeiras e luzes.

export const r1 = (n: number) => Math.round(n * 10) / 10

// Gerador pseudoaleatório com semente (mulberry32)
export const seeded = (seed: number) => () => {
  seed |= 0
  seed = (seed + 0x6d2b79f5) | 0
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}

type Pt = readonly [number, number]

// ---------- seção transversal ----------

export const TW = 920 // meia largura
export const TC = 520 // altura do teto acima do ponto de fuga
export const TF = 620 // profundidade do piso abaixo do ponto de fuga
const CH = 200 // chanfro

const A: Pt = [-TW + CH, -TC]
const B: Pt = [TW - CH, -TC]
const C: Pt = [TW, -TC + CH]
const D: Pt = [TW, TF]
const E: Pt = [-TW, TF]
const F: Pt = [-TW, -TC + CH]

// raio que sai do ponto de fuga passando por p, até bem fora da tela
const FAR = 3200
const ray = ([x, y]: Pt) => {
  const k = FAR / Math.hypot(x, y)
  return `${r1(x * k)} ${r1(y * k)}`
}
// faixa longitudinal entre dois pontos da seção: um triângulo fixo
const band = (a: Pt, b: Pt) => `M0 0L${ray(a)}L${ray(b)}Z`
const bands = (list: [Pt, Pt][]) => list.map(([a, b]) => band(a, b)).join('')

// trecho de faixa entre as distâncias r0 e r1 do ponto de fuga (para
// esmaecer em degraus sem gradiente: SVG com gradiente é repintado a cada
// recálculo de estilo da página)
const at = ([x, y]: Pt, r: number) => {
  const k = r / Math.hypot(x, y)
  return `${r1(x * k)} ${r1(y * k)}`
}
const segment = (a: Pt, b: Pt, r0: number, rEnd: number) =>
  `M${at(a, r0)}L${at(a, rEnd)}L${at(b, rEnd)}L${at(b, r0)}Z`
// degraus de opacidade ao longo da faixa: [início, fim, opacidade]
export const FADE: [number, number, number][] = [
  [140, 260, 0.14],
  [260, 380, 0.34],
  [380, 500, 0.6],
  [500, 640, 0.85],
  [640, FAR, 1],
]
const fade = (list: [Pt, Pt][]) =>
  FADE.map(([r0, rEnd, o]) => ({
    o,
    d: list.map(([a, b]) => segment(a, b, r0, rEnd)).join(''),
  }))

// cano encostado numa parede (silhueta pelo diâmetro vertical)
const pipe = (x: number, y: number, r: number) => ({
  base: band([x, y - r], [x, y + r]),
  hi: band([x, y - r * 0.72], [x, y - r * 0.3]),
  lo: band([x, y + r * 0.45], [x, y + r]),
})

// canos e dutos (compartilhados com as braçadeiras das cambotas)
export const PIPES = {
  l1: [-878, -232, 30],
  l2: [-890, -150, 16],
  r1: [885, -262, 22],
  r2: [892, -206, 12],
} as const

const L1 = pipe(...PIPES.l1)
const L2 = pipe(...PIPES.l2)
const R1 = pipe(...PIPES.r1)
const R2 = pipe(...PIPES.r2)

// cabos no chanfro: posição f ao longo dele (0 = parede, 1 = teto)
const chamferCable = (f: number, w: number, side: 1 | -1) => {
  const x0 = side * TW
  const y0 = -TC + CH
  const along: Pt = [side * -CH, -CH]
  const n = Math.SQRT1_2
  const px = x0 + along[0] * f + side * -12 * n
  const py = y0 + along[1] * f + 12 * n
  const h = w / 2 / Math.hypot(CH, CH)
  return band(
    [px - along[0] * h, py - along[1] * h],
    [px + along[0] * h, py + along[1] * h],
  )
}

const seam = (x: number, y: number, vertical: boolean, w: number): [Pt, Pt] =>
  vertical
    ? [
        [x, y - w],
        [x, y + w],
      ]
    : [
        [x - w, y],
        [x + w, y],
      ]

// paredes e detalhes longitudinais (SVG estático da cena)
export const TUNNEL = {
  ceil: band(A, B),
  cham: band(F, A) + band(B, C),
  wall: band(E, F) + band(C, D),
  floor: band(D, E),
  // quinas acesas pela luz das lâmpadas
  edges: bands([
    [
      [A[0] - 5, A[1]],
      [A[0] + 5, A[1]],
    ],
    [
      [B[0] - 5, B[1]],
      [B[0] + 5, B[1]],
    ],
    [
      [C[0], C[1] - 5],
      [C[0], C[1] + 5],
    ],
    [
      [F[0], F[1] - 5],
      [F[0], F[1] + 5],
    ],
  ]),
  // juntas das placas (sombra + chanfro claro logo abaixo)
  seams: bands([
    seam(-TW, -100, true, 2.5),
    seam(-TW, 250, true, 2.5),
    seam(-TW, 470, true, 2.5),
    seam(TW, -140, true, 2.5),
    seam(TW, 210, true, 2.5),
    seam(TW, 460, true, 2.5),
    seam(-430, -TC, false, 2.5),
    seam(430, -TC, false, 2.5),
    seam(-560, TF, false, 3),
    seam(560, TF, false, 3),
  ]),
  bevels: bands([
    [
      [-TW, -97],
      [-TW, -93],
    ],
    [
      [-TW, 253],
      [-TW, 257],
    ],
    [
      [-TW, 473],
      [-TW, 477],
    ],
    [
      [TW, -137],
      [TW, -133],
    ],
    [
      [TW, 213],
      [TW, 217],
    ],
    [
      [TW, 463],
      [TW, 467],
    ],
  ]),
  pipeBase: L1.base + R1.base,
  pipeGreen: L2.base,
  pipeYellow: R2.base,
  pipeHi: L1.hi + L2.hi + R1.hi + R2.hi,
  pipeLo: L1.lo + L2.lo + R1.lo + R2.lo,
  // sombra dos canos na parede
  pipeShadow: bands([
    [
      [-TW, -196],
      [-TW, -170],
    ],
    [
      [-TW, -132],
      [-TW, -118],
    ],
    [
      [TW, -238],
      [TW, -214],
    ],
    [
      [TW, -192],
      [TW, -180],
    ],
  ]),
  // feixes de cabos nos chanfros (preto, vermelho, verde-escuro)
  cablesDark:
    chamferCable(0.28, 16, -1) +
    chamferCable(0.56, 12, -1) +
    chamferCable(0.34, 14, 1) +
    chamferCable(0.62, 18, 1),
  cablesRed: chamferCable(0.42, 11, -1) + chamferCable(0.48, 10, 1),
  // bandeja de cabos (esquerda) e barramento de energia (direita)
  trayTop: band([-TW, 132], [-858, 132]),
  trayLip: band([-858, 132], [-858, 150]),
  trayHi: band([-858, 132], [-858, 136]),
  trayCables:
    band([-908, 126], [-896, 126]) +
    band([-878, 126], [-868, 126]) +
    band([-892, 125], [-883, 125]),
  ductFront: band([848, -42], [848, 42]),
  ductTop: band([848, -42], [TW, -42]),
  ductLines: band([848, -14], [848, -9]) + band([848, 12], [848, 17]),
  // faixa amarela pintada no rodapé e canaleta escura no canto do piso
  paint: band([-TW, 552], [-TW, 572]) + band([TW, 552], [TW, 572]),
  gutter: band([-TW, 598], [-TW, TF]) + band([TW, 598], [TW, TF]),
  // teto: bandeja central e trilhos de luz
  trayCeil: band([-112, -494], [112, -494]),
  trayCeilEdge:
    band([-116, -494], [-108, -494]) + band([108, -494], [116, -494]),
  ceilRails: band([-304, -TC], [-294, -TC]) + band([294, -TC], [304, -TC]),
  // viga do monotrilho no piso
  beamTop: band([-72, 540], [72, 540]),
  beamEdge: band([-76, 540], [-66, 540]) + band([66, 540], [76, 540]),
  walkways: band([-TW, TF], [-600, TF]) + band([600, TF], [TW, TF]),
  // guias de LED verdes no pé das paredes (acesas mesmo no apagão)
  guide: fade([
    [
      [-TW, 404],
      [-TW, 412],
    ],
    [
      [TW, 404],
      [TW, 412],
    ],
  ]),
  guideGlow: fade([
    [
      [-TW, 386],
      [-TW, 430],
    ],
    [
      [TW, 386],
      [TW, 430],
    ],
  ]),
}

// ---------- cambota (moldura que cruza o túnel) ----------
// Coordenadas locais: caixa 1840×1140, ponto de fuga em (920, 520).

const RW = 2 * TW // 1840
const RH = TC + TF // 1140
export const RIB_VIEW = `0 0 ${RW} ${RH}`
const K = Math.SQRT2 - 1

// polígono da seção recuado o para dentro (aberto embaixo, no piso)
const polyPts = (o: number): Pt[] => [
  [o, RH],
  [o, CH + o * K],
  [CH + o * K, o],
  [RW - CH - o * K, o],
  [RW - o, CH + o * K],
  [RW - o, RH],
]
const poly = (o: number, close = true) =>
  'M' +
  polyPts(o)
    .map(([x, y]) => `${r1(x)} ${r1(y)}`)
    .join('L') +
  (close ? 'Z' : '')

// anel entre dois recuos (use com fill-rule evenodd)
export const ring = (o0: number, o1: number) => poly(o0) + poly(o1)
export const edge = (o: number) => poly(o, false)
export const loop = (o: number) => poly(o)

// pontos a cada `step` ao longo de um recuo (rebites)
const studs = (o: number, step: number, s: number) => {
  const pts = polyPts(o)
  let d = ''
  for (let i = 0; i < pts.length - 1; i++) {
    const [x0, y0] = pts[i]
    const [x1, y1] = pts[i + 1]
    const len = Math.hypot(x1 - x0, y1 - y0)
    const n = Math.floor(len / step)
    for (let j = 1; j < n; j++) {
      const x = x0 + ((x1 - x0) * j) / n
      const y = y0 + ((y1 - y0) * j) / n
      if (y > RH - 40) continue
      d += `M${r1(x - s / 2)} ${r1(y - s / 2)}h${s}v${s}h${-s}Z`
    }
  }
  return d
}

export const RIB = {
  frame: ring(0, 66),
  web: ring(20, 46),
  rim: edge(66),
  outer: edge(0),
  rivets: studs(10, 64, 6) + studs(56, 64, 6),
}

// braçadeiras dos canos/dutos nos pilares (alinhadas ao SVG estático)
const loc = (x: number, y: number): Pt => [x + TW, y + TC]
const clamp = ([x, y, r]: readonly [number, number, number], pad = 8) => {
  const [cx, cy] = loc(x, y)
  const h = r + pad
  return `M${cx - h} ${cy - h}h${2 * h}v${2 * h}h${-2 * h}Z`
}
const bolt = (x: number, y: number) =>
  `M${x - 3} ${y}a3 3 0 1 0 6 0a3 3 0 1 0-6 0Z`
const clampBolts = ([x, y, r]: readonly [number, number, number]) => {
  const [cx, cy] = loc(x, y)
  return bolt(cx, cy - r - 4) + bolt(cx, cy + r + 4)
}
export const CLAMPS =
  clamp(PIPES.l1) +
  clamp(PIPES.l2, 6) +
  clamp(PIPES.r1) +
  clamp(PIPES.r2, 6) +
  // suporte da bandeja (esq.) e abraçadeira do barramento (dir.)
  'M0 650h76v14H0ZM1764 472h76v96h-76Z'
export const CLAMP_BOLTS =
  clampBolts(PIPES.l1) +
  clampBolts(PIPES.l2) +
  clampBolts(PIPES.r1) +
  clampBolts(PIPES.r2) +
  bolt(1780, 482) +
  bolt(1780, 558)

// ---------- comporta blindada ----------

export const DOOR = {
  frame: ring(0, 150),
  hazard: ring(118, 150),
  rim: edge(150),
  rivets: studs(30, 70, 9) + studs(96, 70, 9),
}

// ---------- arcos elétricos (tempestade de ressonância) ----------

const rand = seeded(1998)
export const zigzag = (
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  steps = 8,
  amp = 24,
) => {
  let d = `M${x0} ${y0}`
  for (let i = 1; i < steps; i++) {
    const t = i / steps
    d += `L${r1(x0 + (x1 - x0) * t + (rand() - 0.5) * amp)} ${r1(
      y0 + (y1 - y0) * t + (rand() - 0.5) * amp,
    )}`
  }
  return `${d}L${x1} ${y1}`
}

// partículas no túnel (posição lateral em vh, relativa ao ponto de fuga)
export const MOTES = Array.from({ length: 9 }, (_, i) => {
  const a = rand() * Math.PI * 2
  const r = 18 + rand() * 62
  return {
    x: r1(Math.cos(a) * r * 1.08),
    y: r1(Math.sin(a) * r * 0.62),
    dur: r1(12 + rand() * 9),
    delay: -r1(rand() * 20 + i),
  }
})
export const SPARKS = Array.from({ length: 7 }, (_, i) => {
  const a = (i / 7) * Math.PI * 2 + rand() * 0.5
  const r = 12 + rand() * 30
  return {
    x: r1(Math.cos(a) * r * 1.6),
    y: r1(Math.sin(a) * r * 0.8),
    dur: r1(4 + rand() * 3),
    delay: -r1(rand() * 7),
  }
})
