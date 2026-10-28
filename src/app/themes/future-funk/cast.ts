// Elenco em primeiro plano, desenhado à mão em cel-shading de anime dos
// anos 80: cor chapada, uma sombra de borda dura, um brilho e traço de
// nanquim. Só dados (paths); o Scene.tsx monta os SVGs.
//
// Peças que se mexem (cones das caixas, carretéis, folhas) são um <svg>
// próprio recortado pela sua caixa, girando ou escalando em volta do pivô,
// para o navegador só compor a camada.

export interface Shape {
  d: string
  fill?: string
  stroke?: string
  w?: number
  o?: number
  // deslocamento fixo (franjas de aberração cromática do VHS)
  dx?: number
}

export interface Part {
  // caixa no sistema da peça: x, y, largura, altura
  box: [number, number, number, number]
  // ponto em volta do qual a peça gira
  pivot: [number, number]
  shapes: Shape[]
}

export const INK = '#2b1055'
const HAIR = '#4d2b93'
const SKIN = '#ffe7d8'
const LINING = '#ff8fd0'
const PINK = '#ff4fa3'
const PINK_D = '#d42a80'
const YELLOW = '#ffe14d'
const CREAM = '#fff6c4'
const CYAN_FRINGE = '#3fe9ff'
const PINK_FRINGE = '#ff3d9a'

// ============ Boombox em cima de um engradado (caixa 360×560) ============
export const BOX_W = 360
export const BOX_H = 560

// franja de aberração cromática: a mesma forma deslocada em ciano/magenta
const fringe = (d: string, k = 5): Shape[] => [
  { d, fill: CYAN_FRINGE, o: 0.55, dx: -k },
  { d, fill: PINK_FRINGE, o: 0.5, dx: k },
]
const ring = (x: number, y: number, r: number) =>
  `M${x - r} ${y}a${r} ${r} 0 1 0 ${r * 2} 0a${r} ${r} 0 1 0 ${-r * 2} 0Z`
const rr = (x: number, y: number, w: number, h: number, r: number) =>
  `M${x + r} ${y}H${x + w - r}Q${x + w} ${y} ${x + w} ${y + r}V${y + h - r}Q${x + w} ${y + h} ${x + w - r} ${y + h}H${x + r}Q${x} ${y + h} ${x} ${y + h - r}V${y + r}Q${x} ${y} ${x + r} ${y}Z`
const heart = (x: number, y: number, s: number) =>
  `M${x} ${y + s * 0.9}C${x - s * 0.6} ${y + s * 0.45} ${x - s} ${y + s * 0.1} ${x - s} ${y - s * 0.3}A${s * 0.5} ${s * 0.5} 0 0 1 ${x} ${y - s * 0.45}A${s * 0.5} ${s * 0.5} 0 0 1 ${x + s} ${y - s * 0.3}C${x + s} ${y + s * 0.1} ${x + s * 0.6} ${y + s * 0.45} ${x} ${y + s * 0.9}Z`
const star = (x: number, y: number, r: number) => {
  let d = ''
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5
    const k = i % 2 ? r * 0.45 : r
    d += `${i ? 'L' : 'M'}${(x + Math.cos(a) * k).toFixed(1)} ${(y + Math.sin(a) * k).toFixed(1)}`
  }
  return d + 'Z'
}

const BODY = rr(8, 80, 344, 232, 28)
const HANDLE = 'M84 82V50Q84 30 104 30H256Q276 30 276 50V82'
const ANTENNA = 'M300 80L346 12'
// centros dos alto-falantes e dos carretéis da fita
export const SPK: [number, number][] = [
  [74, 212],
  [286, 212],
]
export const REEL: [number, number][] = [
  [160, 130],
  [200, 130],
]

const CRATE = rr(22, 318, 316, 260, 14)
const CRATE_HOLES = [0, 1, 2]
  .flatMap((r) =>
    [0, 1, 2, 3, 4].map((c) => rr(46 + c * 56, 392 + r * 52, 38, 34, 8)),
  )
  .join('')

export const BOX_BASE: Shape[] = [
  // engradado de plástico com discos (embaixo do rádio)
  ...fringe(CRATE),
  { d: 'M48 322L70 250L120 250L108 322Z', fill: YELLOW, stroke: INK, w: 3.5 },
  {
    d: 'M250 322L262 236L318 244L306 322Z',
    fill: '#7ff3ff',
    stroke: INK,
    w: 3.5,
  },
  { d: ring(285, 270, 14), fill: INK },
  { d: CRATE, fill: '#9b7bff', stroke: INK, w: 5 },
  { d: 'M24 520H336V564Q336 576 322 576H38Q24 576 24 564Z', fill: '#6f4fd8' },
  { d: rr(130, 334, 100, 24, 12), fill: INK },
  { d: CRATE_HOLES, fill: '#5a3cbf', stroke: INK, w: 2.5 },
  { d: 'M40 332H120', stroke: '#ffffff', w: 2.6, o: 0.6 },
  { d: star(310, 540, 14), fill: YELLOW, stroke: INK, w: 2.5 },
  ...fringe(BODY),
  // antena cromada com bolinha rosa
  { d: ANTENNA, stroke: INK, w: 8 },
  { d: ANTENNA, stroke: '#e9e4ff', w: 3.5 },
  { d: ring(346, 12, 7), fill: PINK, stroke: INK, w: 3 },
  // alça
  { d: HANDLE, stroke: INK, w: 17 },
  { d: HANDLE, stroke: '#c9b8ff', w: 9 },
  { d: 'M100 38H240', stroke: '#ffffff', w: 2.6, o: 0.8 },
  { d: rr(68, 64, 32, 26, 7), fill: YELLOW, stroke: INK, w: 3.5 },
  { d: rr(260, 64, 32, 26, 7), fill: YELLOW, stroke: INK, w: 3.5 },
  // teclas do toca-fitas no alto
  { d: rr(132, 66, 18, 18, 4), fill: '#7ff3ff', stroke: INK, w: 3 },
  { d: rr(154, 66, 18, 18, 4), fill: '#ffffff', stroke: INK, w: 3 },
  { d: rr(176, 66, 18, 18, 4), fill: YELLOW, stroke: INK, w: 3 },
  { d: rr(198, 66, 18, 18, 4), fill: '#ffffff', stroke: INK, w: 3 },
  // corpo: base, sombra dura embaixo, brilho em cima
  { d: BODY, fill: PINK, stroke: INK, w: 5 },
  { d: 'M10 266H350V284Q350 310 324 310H36Q10 310 10 284Z', fill: PINK_D },
  { d: 'M40 92H320', stroke: '#ffffff', w: 3, o: 0.75 },
  { d: 'M20 120V250', stroke: '#ffffff', w: 2.4, o: 0.45 },
  // tampa da fita com janela
  { d: rr(128, 98, 104, 66, 10), fill: CREAM, stroke: INK, w: 4 },
  { d: rr(140, 112, 80, 36, 8), fill: '#3a1670', stroke: INK, w: 3 },
  { d: rr(148, 104, 64, 5, 2.5), fill: PINK },
  // dial do rádio (o LED acende por cima)
  { d: rr(128, 172, 104, 28, 8), fill: INK },
  {
    d: 'M140 180V186M152 180V192M164 180V186M176 180V192M188 180V186M200 180V192M212 180V186M224 180V192',
    stroke: '#7ff3ff',
    w: 2,
    o: 0.8,
  },
  { d: 'M190 176V197', stroke: YELLOW, w: 3 },
  // grade entre as caixas e os botões giratórios
  {
    d: 'M140 214H220M140 226H220M140 238H220M140 250H220',
    stroke: INK,
    w: 3.5,
  },
  { d: ring(146, 286, 9), fill: CREAM, stroke: INK, w: 3 },
  { d: ring(214, 286, 9), fill: CREAM, stroke: INK, w: 3 },
  // aros dos alto-falantes
  ...SPK.flatMap(([x, y]): Shape[] => [
    { d: ring(x, y, 62), fill: CREAM, stroke: INK, w: 5 },
    { d: ring(x, y, 52), fill: '#3a1670', stroke: INK, w: 3 },
  ]),
  // adesivos
  { d: heart(334, 290, 13), fill: YELLOW, stroke: INK, w: 3 },
  { d: star(28, 98, 12), fill: '#7ff3ff', stroke: INK, w: 2.5 },
]

// cone que pulsa no ritmo (um <svg> por caixa, escala em volta do centro)
export const cone = ([x, y]: [number, number]): Part => ({
  box: [x - 48, y - 48, 96, 96],
  pivot: [x, y],
  shapes: [
    { d: ring(x, y, 44), fill: '#6b3fc4', stroke: INK, w: 3 },
    { d: ring(x, y, 31), fill: LINING, stroke: INK, w: 2.5 },
    { d: ring(x, y, 14), fill: YELLOW, stroke: INK, w: 3 },
    {
      d: `M${x - 30} ${y - 20}A36 36 0 0 1 ${x - 6} ${y - 36}`,
      stroke: '#ffffff',
      w: 3,
      o: 0.7,
    },
  ],
})

// carretel da fita (gira)
export const reel = ([x, y]: [number, number]): Part => ({
  box: [x - 13, y - 13, 26, 26],
  pivot: [x, y],
  shapes: [
    { d: ring(x, y, 11), fill: '#ffffff', stroke: INK, w: 2.5 },
    {
      d: `M${x} ${y - 8}V${y + 8}M${x - 7} ${y - 4}L${x + 7} ${y + 4}M${x - 7} ${y + 4}L${x + 7} ${y - 4}`,
      stroke: INK,
      w: 2.5,
    },
  ],
})

// noite: o rádio escurece e ganha luz de borda do neon da cidade
export const BOX_NIGHT: Shape[] = [
  { d: BODY + HANDLE + CRATE, fill: '#3a0d78', o: 0.3 },
  { d: 'M338 340V560', stroke: '#7ff3ff', w: 3.5 },
  { d: 'M352 110V280', stroke: '#7ff3ff', w: 3.5 },
  { d: 'M276 50V82', stroke: '#7ff3ff', w: 3 },
  { d: 'M300 80L346 12', stroke: '#ff8fd0', w: 2 },
]

// ============ Coqueiro (caixa 320×600), silhueta com luz de borda ============
export const PALM_W = 320
export const PALM_H = 600
const TRUNK =
  'M250 604C246 470 228 300 186 150L204 144C252 290 274 460 288 604Z'
const PALM_INK = '#3a1670'
const PALM_RIM = '#ff7cc8'

const CROWN: [number, number] = [196, 148]
const f1 = (v: number) => Math.round(v * 10) / 10

// folha: nervura em arco (sobe e cai na ponta), borda de cima lisa e a de
// baixo em folíolos pontudos que pendem para o chão
const frond = (deg: number, len: number, droop: number, width: number) => {
  const [cx, cy] = CROWN
  const a = (deg * Math.PI) / 180
  const tx = cx + Math.cos(a) * len
  const ty = cy + Math.sin(a) * len + droop
  const mx = cx + Math.cos(a) * len * 0.5
  const my = cy + Math.sin(a) * len * 0.5 - len * 0.22
  const pt = (t: number) => {
    const u = 1 - t
    return [
      u * u * cx + 2 * u * t * mx + t * t * tx,
      u * u * cy + 2 * u * t * my + t * t * ty,
    ]
  }
  const top: string[] = []
  const teeth: string[] = []
  const N = 12
  for (let i = 0; i <= N; i++) {
    const t = i / N
    const [x, y] = pt(t)
    const [x2, y2] = pt(Math.min(1, t + 0.02))
    const [x0, y0] = pt(Math.max(0, t - 0.02))
    let nx = -(y2 - y0)
    let ny = x2 - x0
    const l = Math.hypot(nx, ny) || 1
    nx /= l
    ny /= l
    // a serra fica sempre do lado de baixo
    if (ny < 0) {
      nx = -nx
      ny = -ny
    }
    const w = width * Math.pow(Math.sin(Math.PI * t), 0.7)
    top.push(`${f1(x - nx * w * 0.22)} ${f1(y - ny * w * 0.22)}`)
    if (i > 0 && i < N) {
      const [xt, yt] = pt(Math.min(1, t + 0.05))
      teeth.push(`${f1(x + nx * w * 0.3)} ${f1(y + ny * w * 0.3)}`)
      teeth.push(
        `${f1(xt + nx * w * 1.05)} ${f1(yt + ny * w * 1.05 + w * 0.2)}`,
      )
    }
  }
  return `M${top.join('L')}L${teeth.reverse().join('L')}Z`
}

const fronds = (list: [number, number, number, number][]) =>
  list.map(([deg, len, droop, w]) => frond(deg, len, droop, w)).join('')

export const PALM_BACK: Part = {
  box: [-10, 40, 340, 250],
  pivot: CROWN,
  shapes: (() => {
    const d = fronds([
      [-150, 150, 60, 22],
      [-105, 110, 40, 20],
      [-30, 140, 50, 22],
    ])
    return [
      { d, fill: '#5d2c9a', stroke: PALM_INK, w: 3 },
      { d, stroke: PALM_RIM, w: 1.4, o: 0.45 },
    ]
  })(),
}

export const PALM_FRONT: Part = {
  box: [-10, 30, 350, 300],
  pivot: CROWN,
  shapes: (() => {
    const d = fronds([
      [-175, 190, 90, 26],
      [-128, 150, 30, 22],
      [-62, 140, 40, 22],
      [-8, 160, 90, 26],
      [150, 120, 70, 18],
    ])
    return [
      { d, fill: '#4a2185', stroke: PALM_INK, w: 3.5 },
      { d, stroke: PALM_RIM, w: 1.8, o: 0.5 },
    ]
  })(),
}

export const PALM_TRUNK: Shape[] = (() => {
  let rings = ''
  for (let y = 190; y < 600; y += 26) {
    // anéis do tronco seguindo a curva
    const t = (y - 150) / 454
    const x0 = 186 + (250 - 186) * t + 12 * Math.sin(t * 2)
    rings += `M${(x0 - 2).toFixed(1)} ${y}l${(26 + t * 14).toFixed(1)} 5`
  }
  return [
    { d: TRUNK, fill: '#5a2a96', stroke: PALM_INK, w: 4 },
    {
      d: 'M206 150C250 290 270 450 284 604L276 604C262 460 242 300 200 154Z',
      fill: PALM_RIM,
      o: 0.65,
    },
    { d: rings, stroke: PALM_INK, w: 2.4 },
    {
      d: 'M178 150a11 11 0 1 0 22 0a11 11 0 1 0 -22 0ZM196 160a11 11 0 1 0 22 0a11 11 0 1 0 -22 0ZM184 168a10 10 0 1 0 20 0a10 10 0 1 0 -20 0Z',
      fill: '#ffb84d',
      stroke: PALM_INK,
      w: 3,
    },
  ]
})()

// ============ Conversível (caixa 250×90), indo para a direita ============
// Um casal de anime passeando: ela dirige, o lenço e o cabelo voam para trás.
export const CAR_W = 250
export const CAR_H = 90
export const CAR: Shape[] = [
  // cachecol e cabelo ao vento (atrás do carro)
  {
    d: 'M112 22C96 18 80 26 62 22C48 19 38 24 26 20C40 30 56 32 70 32C88 32 100 28 114 30Z',
    fill: PINK,
    stroke: INK,
    w: 2.4,
  },
  {
    d: 'M122 8C104 2 86 10 70 8C58 7 50 12 40 10C52 22 70 22 86 20C100 18 110 18 122 22Z',
    fill: HAIR,
    stroke: INK,
    w: 2.4,
  },
  // carroceria rosa com sombra de baixo e friso branco
  {
    d: 'M6 58C4 46 9 40 20 38L78 36C90 35 98 33 104 32L152 32L170 36C198 38 222 42 234 48C240 51 242 57 240 62L234 66L214 66A21 21 0 0 0 172 66L76 66A21 21 0 0 0 34 66L10 66C6 64 5 61 6 58Z',
    fill: PINK,
    stroke: INK,
    w: 3,
  },
  {
    d: 'M8 56L238 56C240 59 239 62 236 64L214 66A21 21 0 0 0 172 66L76 66A21 21 0 0 0 34 66L10 66C7 63 7 60 8 56Z',
    fill: PINK_D,
  },
  { d: 'M14 47L232 51', stroke: '#ffffff', w: 3 },
  { d: 'M150 33L138 10L145 9L158 34Z', fill: '#c9f7ff', stroke: INK, w: 2 },
  // encostos e o casal
  {
    d: 'M96 34C96 22 108 22 108 34ZM120 34C120 22 132 22 132 34Z',
    fill: CREAM,
    stroke: INK,
    w: 2,
  },
  {
    d: 'M116 14a9 9 0 1 0 18 0a9 9 0 1 0 -18 0Z',
    fill: SKIN,
    stroke: INK,
    w: 2.2,
  },
  {
    d: 'M114 12C116 2 132 0 136 10C128 8 122 12 114 12Z',
    fill: HAIR,
    stroke: INK,
    w: 2,
  },
  {
    d: 'M90 18a8 8 0 1 0 16 0a8 8 0 1 0 -16 0Z',
    fill: SKIN,
    stroke: INK,
    w: 2.2,
  },
  {
    d: 'M89 16C90 8 104 6 107 14C100 12 95 16 89 16Z',
    fill: '#ffb84d',
    stroke: INK,
    w: 2,
  },
  // faróis, lanterna e para-choque cromado
  {
    d: 'M228 46a5 4 0 1 0 10 0a5 4 0 1 0 -10 0Z',
    fill: YELLOW,
    stroke: INK,
    w: 1.6,
  },
  { d: 'M6 44h8v7h-8z', fill: '#ff3d6e', stroke: INK, w: 1.6 },
  { d: 'M200 60h40', stroke: '#ffffff', w: 3 },
  // rodas
  {
    d: 'M38 68a17 17 0 1 0 34 0a17 17 0 1 0 -34 0ZM176 68a17 17 0 1 0 34 0a17 17 0 1 0 -34 0Z',
    fill: INK,
  },
  {
    d: 'M46 68a9 9 0 1 0 18 0a9 9 0 1 0 -18 0ZM184 68a9 9 0 1 0 18 0a9 9 0 1 0 -18 0Z',
    fill: '#ffffff',
    stroke: INK,
    w: 1.6,
  },
  {
    d: 'M51 68a4 4 0 1 0 8 0a4 4 0 1 0 -8 0ZM189 68a4 4 0 1 0 8 0a4 4 0 1 0 -8 0Z',
    fill: PINK,
  },
]
