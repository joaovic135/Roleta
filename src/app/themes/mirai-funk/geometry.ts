// Geometria gerada uma vez, no carregamento do módulo, com sorteios de
// semente fixa (iguais no servidor e no navegador). Formas da mesma cor
// ficam num só <path>; nada aqui roda por quadro.

export const seeded = (seed: number) => () => {
  seed = (seed + 0x6d2b79f5) | 0
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}
export const n = (v: number) => +v.toFixed(1)
export const rect = (x: number, y: number, w: number, h: number) =>
  `M${n(x)} ${n(y)}h${n(w)}v${n(h)}h${n(-w)}z`
export const dot = (x: number, y: number, r: number) =>
  `M${n(x - r)} ${n(y)}a${n(r)} ${n(r)} 0 1 0 ${n(r * 2)} 0a${n(r)} ${n(r)} 0 1 0 ${n(-r * 2)} 0`
export const sparkle = (x: number, y: number, s: number) =>
  `M${n(x)} ${n(y - s)}Q${n(x)} ${n(y)} ${n(x + s)} ${n(y)}Q${n(x)} ${n(y)} ${n(x)} ${n(y + s)}Q${n(x)} ${n(y)} ${n(x - s)} ${n(y)}Q${n(x)} ${n(y)} ${n(x)} ${n(y - s)}Z`

// ---- Cidade ----
// Grade de 8 x 10 unidades: prédios e janelas alinhados a ela, assim o
// padrão de janelas nunca fica cortado na beira de um prédio.
export const CITY_W = 2400
export const CITY_H = 360
export const PX = 8
export const PY = 10
export const RAIL_Y = CITY_H - 34

// Ladrilhos de janelas: de dia (verde-água refletindo o céu) e de noite
// (acesas em branco-água), cada um com o seu sorteio
export const TILES = [
  { cols: 6, rows: 6 },
  { cols: 7, rows: 7 },
  { cols: 5, rows: 8 },
]
export const tile = (cols: number, rows: number, seed: number, on: number) => {
  const rand = seeded(seed)
  let lit = ''
  let dim = ''
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++) {
      const v = rand()
      const w = rect(c * PX + 2, r * PY + 3, 4, 5)
      if (v < on) lit += w
      else if (v < on + 0.3) dim += w
    }
  return { lit, dim }
}
export const NIGHT_GROUPS = 6
// quanto cada grupo de janelas se adianta no ciclo (acendem fora de ordem)
export const STAGGER = [0, 0.034, 0.012, 0.051, 0.022, 0.06]

const skyline = () => {
  const rand = seeded(1986)
  let front = ''
  let far = ''
  let antenna = ''
  const day: string[] = TILES.map(() => '')
  const night: string[] = Array.from({ length: NIGHT_GROUPS }, () => '')
  const nightTile: number[] = Array.from(
    { length: NIGHT_GROUPS },
    (_, i) => i % 3,
  )
  let blink = ''
  // fundo: blocos baixos e largos em verde-escuro
  for (let x = -PX * 2; x < CITY_W; ) {
    const w = PX * (8 + Math.floor(rand() * 14))
    const h = PY * (12 + Math.floor(rand() * 16))
    far += rect(x, CITY_H - h, w, h)
    x += w
  }
  // frente: prédios pretos de alturas variadas, alguns com recuo no topo
  for (let x = -PX; x < CITY_W; ) {
    const w = PX * (5 + Math.floor(rand() * 11))
    const tall = rand() < 0.18
    const h =
      PY * (tall ? 22 + Math.floor(rand() * 10) : 7 + Math.floor(rand() * 15))
    const top = CITY_H - h
    front += rect(x, top, w, h)
    if (w >= PX * 9 && rand() < 0.45) {
      const sw = PX * Math.max(3, Math.floor(w / PX / 2) - 1)
      const sh = PY * (2 + Math.floor(rand() * 3))
      const sx = x + PX * Math.floor((w - sw) / PX / 2)
      front += rect(sx, top - sh, sw, sh)
      if (rand() < 0.6) {
        antenna += rect(sx + sw / 2 - 1, top - sh - 26, 2, 26)
        blink += rect(sx + sw / 2 - 2, top - sh - 30, 4, 4)
      }
    } else if (rand() < 0.22) {
      antenna += rect(x + PX * 2, top - 18, 2, 18)
    }
    // janelas: área interna do prédio (acima da via do trem)
    const bottom = Math.min(CITY_H - PY, RAIL_Y - 6)
    const area =
      w >= PX * 4 && bottom - top > PY * 3
        ? rect(x + PX, top + PY, w - PX * 2, bottom - top - PY)
        : ''
    const kind = Math.floor(rand() * 7) % 4
    if (area && kind < 3) {
      day[kind] += area
      night[Math.floor(rand() * NIGHT_GROUPS)] += area
    }
    x += w + (rand() < 0.3 ? PX : 0)
  }
  // via elevada: viga, guarda-corpo e pilares
  let rail = rect(0, RAIL_Y + 8, CITY_W, 5) + rect(0, RAIL_Y + 6, CITY_W, 1)
  for (let x = 30; x < CITY_W; x += 120) rail += rect(x, RAIL_Y + 13, 6, 21)
  return { front, far, antenna, day, night, nightTile, blink, rail }
}
export const CITY = skyline()

// Trem-bala de 6 carros com narizes inclinados nas duas pontas (simétrico:
// serve para os dois sentidos). Fica no meio da cidade; o CSS desliza a
// camada inteira de -100% a +100% da largura.
const train = () => {
  const CAR = 70
  const GAP = 3
  const CARS = 6
  const y = RAIL_Y - 9
  const h = 15
  const x0 = 1000
  let body = ''
  let windows = ''
  for (let c = 0; c < CARS; c++) {
    const x = x0 + c * (CAR + GAP)
    if (c === 0) body += `M${x + 16} ${y}h${CAR - 16}v${h}h${-CAR}v-5z`
    else if (c === CARS - 1)
      body += `M${x} ${y}h${CAR - 16}l16 ${h - 5}v5h${-CAR}z`
    else body += rect(x, y, CAR, h)
    const from = x + (c === 0 ? 20 : 6)
    const to = x + CAR - (c === CARS - 1 ? 22 : 8)
    for (let wx = from; wx < to; wx += 8) windows += rect(wx, y + 3, 5, 4)
  }
  const x1 = x0 + CARS * (CAR + GAP) - GAP
  // faixa clara ao longo do trem e faróis nas duas pontas
  const stripe = rect(x0 + 6, y + 9, x1 - x0 - 12, 1.4)
  const lights = rect(x0 + 1, y + 10, 4, 2) + rect(x1 - 5, y + 10, 4, 2)
  return { body, windows, stripe, lights, x0, x1, y, h }
}
export const TRAIN = train()

// ---- Estrelas, chuva e flare ----
// Tela de 1600 x 900 (cobre a página). Poeira fina no chão escuro, poucas
// estrelas no céu de dia e um céu cheio só de noite.
const starfield = () => {
  const rand = seeded(7)
  let dust = ''
  let glints = ''
  let sky = ''
  let night = ''
  let twinkleA = ''
  let twinkleB = ''
  for (let i = 0; i < 160; i++)
    dust += dot(rand() * 1600, 545 + rand() * 355, 0.6 + rand() * 1.3)
  for (let i = 0; i < 18; i++)
    glints += sparkle(rand() * 1600, 560 + rand() * 330, 4 + rand() * 7)
  for (let i = 0; i < 30; i++) {
    const x = rand() * 1600
    const y = 20 + rand() * 300
    sky += i % 5 ? dot(x, y, 0.8 + rand()) : sparkle(x, y, 3 + rand() * 4)
  }
  for (let i = 0; i < 110; i++)
    night += dot(rand() * 1600, rand() * 470, 0.5 + rand() * 1.1)
  for (let i = 0; i < 26; i++) {
    const s = sparkle(rand() * 1600, 10 + rand() * 450, 3 + rand() * 6)
    if (i % 2) twinkleA += s
    else twinkleB += s
  }
  return { dust, glints, sky, night, twinkleA, twinkleB }
}
export const STARS = starfield()

// Garoa: traços retos e chapados, repetidos duas vezes na vertical para o
// laço de queda não ter emenda
const rain = () => {
  const rand = seeded(404)
  let d = ''
  for (let i = 0; i < 90; i++) {
    const x = n(rand() * 1600)
    const y = n(rand() * 900)
    const len = n(24 + rand() * 40)
    d += `M${x} ${y}v${len}M${x} ${n(y + 900)}v${len}`
  }
  return d
}
export const RAIN = rain()

// Flare gráfico: raios finos alternando comprimento
const flareRays = () => {
  let d = ''
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2
    const r = i % 2 ? 230 : 300
    const s = 0.035
    d += `M300 300L${n(300 + Math.cos(a - s) * r)} ${n(300 + Math.sin(a - s) * r)}L${n(300 + Math.cos(a + s) * r)} ${n(300 + Math.sin(a + s) * r)}Z`
  }
  return d
}
export const FLARE_RAYS = flareRays()

// ---- Atores ----

// Bando de gaivotas em V (silhuetas chapadas). Dois quadros lado a lado
// numa tira de 2 x 220 unidades: asas para cima e asas para baixo.
const flock = (seed: number, count: number) => {
  const rand = seeded(seed)
  const up = (x: number, y: number, s: number) =>
    `M${n(x - 10 * s)} ${n(y - 6 * s)}Q${n(x - 5 * s)} ${n(y - 5 * s)} ${n(x)} ${n(y + s)}Q${n(x + 5 * s)} ${n(y - 5 * s)} ${n(x + 10 * s)} ${n(y - 6 * s)}Q${n(x + 5 * s)} ${n(y - 2 * s)} ${n(x)} ${n(y + 3 * s)}Q${n(x - 5 * s)} ${n(y - 2 * s)} ${n(x - 10 * s)} ${n(y - 6 * s)}Z`
  const down = (x: number, y: number, s: number) =>
    `M${n(x - 10 * s)} ${n(y + 4 * s)}Q${n(x - 5 * s)} ${n(y - 3 * s)} ${n(x)} ${n(y)}Q${n(x + 5 * s)} ${n(y - 3 * s)} ${n(x + 10 * s)} ${n(y + 4 * s)}Q${n(x + 5 * s)} ${n(y + 0.5 * s)} ${n(x)} ${n(y + 2.5 * s)}Q${n(x - 5 * s)} ${n(y + 0.5 * s)} ${n(x - 10 * s)} ${n(y + 4 * s)}Z`
  let d = ''
  for (let i = 0; i < count; i++) {
    // V aberto para a direita (o bando voa para a esquerda)
    const k = Math.ceil(i / 2)
    const side = i % 2 ? -1 : 1
    const x = 30 + k * 19 + rand() * 4
    const y = 40 + side * k * 9 + rand() * 3
    const s = 0.85 + rand() * 0.3
    // asas alternadas: metade do bando bate fora de fase
    const flip = (i + k) % 3 === 0
    d += (flip ? down : up)(x, y, s) + (flip ? up : down)(x + 220, y, s)
  }
  return d
}
export const FLOCK_A = flock(31, 7)
export const FLOCK_B = flock(57, 4)

// Faixas de luz dos carros na via expressa: traços de comprimentos e
// intervalos sorteados, repetidos duas vezes na largura (laço sem emenda)
const lane = (seed: number, count: number) => {
  const rand = seeded(seed)
  let d = ''
  for (let i = 0; i < count; i++) {
    const x = rand() * 1000
    const len = 14 + rand() * 70
    const y = rand() < 0.5 ? 1 : 5
    d += rect(x, y, len, 2.2) + rect(x + 1000, y, len, 2.2)
  }
  return d
}
export const LANE_EAST = lane(88, 22)
export const LANE_WEST = lane(19, 18)

// Nuvem chapada de pôster (viewBox 200 x 64): topo de bolhas sobre base
// reta e a barriga em verde-água claro, cortada por frestas horizontais
export const CLOUD_TOP =
  'M6 58A22 22 0 0 1 30 34A30 30 0 0 1 82 18A36 36 0 0 1 146 24A26 26 0 0 1 192 44A14 14 0 0 1 194 58Z'
export const CLOUD_BELLY = 'M14 50h176v3H14zM24 56h162v3H24zM40 62h128v2H40z'

// Fogos de artifício chapados: raios de pontos que afinam para fora
const burst = (seed: number, rays: number) => {
  const rand = seeded(seed)
  let d = ''
  for (let i = 0; i < rays; i++) {
    const a = (i / rays) * Math.PI * 2 + rand() * 0.08
    const reach = 0.82 + rand() * 0.18
    for (let k = 0; k < 5; k++) {
      const r = (30 + k * 16) * reach
      d += dot(100 + Math.cos(a) * r, 100 + Math.sin(a) * r, 3.4 - k * 0.55)
    }
  }
  return d
}
export const BURST_A = burst(5, 18)
export const BURST_B = burst(12, 14)

// Linhas de concentração (estilo mangá) em volta da roleta: cunhas finas
// que começam longe do centro, para o miolo ficar limpo
const speedLines = () => {
  const rand = seeded(2077)
  let d = ''
  const R = 1000
  for (let i = 0; i < 96; i++) {
    const a = (i / 96) * Math.PI * 2 + rand() * 0.03
    const r0 = R * (0.38 + rand() * 0.3)
    const w = 0.004 + rand() * 0.011
    d += `M${n(Math.cos(a) * r0)} ${n(Math.sin(a) * r0)}L${n(Math.cos(a - w) * R)} ${n(Math.sin(a - w) * R)}L${n(Math.cos(a + w) * R)} ${n(Math.sin(a + w) * R)}Z`
  }
  return d
}
export const SPEED_LINES = speedLines()

// Torre da rádio: corpo preto com recuos, mastro e grade de janelas
// apagadas (as acesas são as barras do equalizador, em HTML por cima)
export const TOWER_W = 120
export const TOWER_H = 420
export const EQ_COLS = 7
export const EQ_ROWS = 18
// área do painel de janelas no viewBox da torre
export const EQ_BOX = { x: 17, y: 112, w: 86, h: 216 }
const tower = () => {
  let body =
    rect(8, 92, 104, 328) +
    rect(22, 64, 76, 30) +
    rect(36, 44, 48, 22) +
    rect(58.5, 2, 3, 44) +
    rect(52, 26, 16, 3)
  // marquise e degraus da entrada
  body += rect(0, 372, 120, 6) + rect(4, 412, 112, 8)
  let dim = ''
  const cw = EQ_BOX.w / EQ_COLS
  const ch = EQ_BOX.h / EQ_ROWS
  for (let r = 0; r < EQ_ROWS; r++)
    for (let c = 0; c < EQ_COLS; c++)
      dim += rect(
        EQ_BOX.x + c * cw + cw * 0.2,
        EQ_BOX.y + r * ch + ch * 0.22,
        cw * 0.6,
        ch * 0.56,
      )
  // janelinhas do recuo e do saguão
  let lobby = ''
  for (let c = 0; c < 5; c++) lobby += rect(28 + c * 14, 70, 8, 6)
  lobby += rect(14, 384, 92, 22)
  return { body, dim, lobby }
}
export const TOWER = tower()
