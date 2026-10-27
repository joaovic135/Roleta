// Geometria estática da cena (paths SVG gerados uma vez, com semente fixa).
// Formas da mesma cor viram um só path; nada aqui anima por dentro do SVG.

export const seeded = (seed: number) => () => {
  seed = (seed + 0x6d2b79f5) | 0
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}
export const n1 = (v: number) => Math.round(v * 10) / 10

export const circle = (cx: number, cy: number, r: number) =>
  `M${n1(cx - r)} ${n1(cy)}a${n1(r)} ${n1(r)} 0 1 0 ${n1(2 * r)} 0` +
  `a${n1(r)} ${n1(r)} 0 1 0 ${n1(-2 * r)} 0z`
export const oval = (cx: number, cy: number, rx: number, ry: number) =>
  `M${n1(cx - rx)} ${n1(cy)}a${n1(rx)} ${n1(ry)} 0 1 0 ${n1(2 * rx)} 0` +
  `a${n1(rx)} ${n1(ry)} 0 1 0 ${n1(-2 * rx)} 0z`
export const rect = (x: number, y: number, w: number, h: number) =>
  `M${n1(x)} ${n1(y)}h${n1(w)}v${n1(h)}h${n1(-w)}z`
export const sparkle = (x: number, y: number, s: number) =>
  `M${n1(x)} ${n1(y - s)}Q${n1(x)} ${n1(y)} ${n1(x + s)} ${n1(y)}` +
  `Q${n1(x)} ${n1(y)} ${n1(x)} ${n1(y + s)}Q${n1(x)} ${n1(y)} ${n1(x - s)} ${n1(y)}` +
  `Q${n1(x)} ${n1(y)} ${n1(x)} ${n1(y - s)}Z`
export const star = (cx: number, cy: number, R: number, r: number) =>
  Array.from({ length: 10 }, (_, i) => {
    const a = (Math.PI / 5) * i - Math.PI / 2
    const rr = i % 2 ? r : R
    return `${i ? 'L' : 'M'}${n1(cx + Math.cos(a) * rr)} ${n1(cy + Math.sin(a) * rr)}`
  }).join('') + 'Z'
// roseta plissada: círculo em zigue-zague com n pontas
export const ruffle = (
  cx: number,
  cy: number,
  R: number,
  r: number,
  n: number,
) =>
  Array.from({ length: n * 2 }, (_, i) => {
    const a = (Math.PI / n) * i
    const rr = i % 2 ? r : R
    return `${i ? 'L' : 'M'}${n1(cx + Math.cos(a) * rr)} ${n1(cy + Math.sin(a) * rr)}`
  }).join('') + 'Z'
export const heart = (cx: number, cy: number, s: number) =>
  `M${n1(cx)} ${n1(cy + s * 0.9)}` +
  `C${n1(cx - s * 1.5)} ${n1(cy - s * 0.1)} ${n1(cx - s * 0.7)} ${n1(cy - s * 1.1)} ${n1(cx)} ${n1(cy - s * 0.4)}` +
  `C${n1(cx + s * 0.7)} ${n1(cy - s * 1.1)} ${n1(cx + s * 1.5)} ${n1(cy - s * 0.1)} ${n1(cx)} ${n1(cy + s * 0.9)}Z`

// ---- Nuvens fofinhas: bolhas sobrepostas, com a sombra azulada embaixo ----
const PUFFS = [
  [0, 0, 0.8],
  [0.8, -0.45, 1.05],
  [1.75, -0.2, 0.95],
  [2.5, 0.15, 0.7],
  [1.2, 0.3, 0.85],
]
const cloud = (x: number, y: number, s: number) =>
  PUFFS.map(([px, py, pr]) =>
    circle(x + px * 30 * s, y + py * 30 * s, pr * 30 * s),
  ).join('')
// faixa de 1600 repetida 3 vezes (-1600, 0, +1600): deslizando meia
// largura (-50%) o desenho volta ao ponto de partida sem emenda
const cloudLayer = (
  seed: number,
  count: number,
  [yMin, yMax]: [number, number],
  [sMin, sMax]: [number, number],
) => {
  const rand = seeded(seed)
  const items = Array.from({ length: count }, (_, i) => ({
    x: ((i + rand() * 0.55) * 1600) / count,
    y: yMin + rand() * (yMax - yMin),
    s: sMin + rand() * (sMax - sMin),
  }))
  let light = ''
  let shade = ''
  let rim = ''
  for (const off of [-1600, 0, 1600])
    for (const c of items) {
      shade += cloud(c.x + off, c.y + 9 * c.s, c.s)
      light += cloud(c.x + off, c.y, c.s)
      // brilho no topo da bolha maior (luz do sol)
      rim += circle(c.x + off + 22 * c.s, c.y - 22 * c.s, 9 * c.s)
    }
  return { light, shade, rim }
}
export const CLOUDS = {
  far: cloudLayer(11, 7, [40, 110], [0.5, 0.8]),
  near: cloudLayer(23, 5, [70, 150], [1, 1.45]),
  rain: cloudLayer(37, 9, [30, 120], [1.15, 1.6]),
}

// ---- Varal de bandeirinhas: um laço (swag) de 400×70 com 7 bandeiras ----
export const swag = (seed: number, sag = 46) => {
  const rand = seeded(seed)
  const string = `M0 4Q200 ${4 + sag * 2} 400 4`
  const flags: string[] = ['', '', '', '', '', '']
  let shine = ''
  for (let k = 1; k <= 7; k++) {
    const t = k / 8
    const x = 400 * t
    const y = (1 - t) ** 2 * 4 + 2 * (1 - t) * t * (4 + sag * 2) + t * t * 4
    const tilt = (rand() - 0.5) * 6
    const c = Math.floor(rand() * 6)
    flags[c] +=
      `M${n1(x - 13)} ${n1(y - 1)}L${n1(x + 13)} ${n1(y + 1)}` +
      `L${n1(x + tilt)} ${n1(y + 30)}Z`
    shine += `M${n1(x - 9)} ${n1(y + 1)}L${n1(x - 2)} ${n1(y + 1.4)}L${n1(x - 3 + tilt * 0.3)} ${n1(y + 12)}Z`
  }
  return { string, flags, shine }
}

// ---- Pista em perspectiva (viewBox 1600×360, esticada na largura) ----
type Pt = [number, number]
const quad = (p0: Pt, c: Pt, p1: Pt, t: number): Pt => [
  (1 - t) ** 2 * p0[0] + 2 * (1 - t) * t * c[0] + t * t * p1[0],
  (1 - t) ** 2 * p0[1] + 2 * (1 - t) * t * c[1] + t * t * p1[1],
]
const FAR: [Pt, Pt, Pt] = [
  [-40, 200],
  [600, 104],
  [1640, 96],
]
const NEAR: [Pt, Pt, Pt] = [
  [-40, 400],
  [700, 160],
  [1640, 128],
]
const far = (t: number) => quad(...FAR, t)
const near = (t: number) => quad(...NEAR, t)
const depth = (t: number) => (near(t)[1] - far(t)[1]) / 200
const pt = ([x, y]: Pt) => `${n1(x)} ${n1(y)}`
const persp = (k: number, n: number) => 1 - (1 - k / n) ** 1.8

export const TRACK = (() => {
  const band =
    `M${pt(FAR[0])}Q${pt(FAR[1])} ${pt(FAR[2])}` +
    `L${pt(NEAR[2])}Q${pt(NEAR[1])} ${pt(NEAR[0])}Z`
  const outer = `M${pt(NEAR[0])}Q${pt(NEAR[1])} ${pt(NEAR[2])}L1640 400Z`
  let stripes = ''
  const N = 18
  for (let k = 0; k < N; k += 2) {
    const a = persp(k, N)
    const b = persp(k + 1, N)
    stripes += `M${pt(far(a))}L${pt(far(b))}L${pt(near(b))}L${pt(near(a))}Z`
  }
  const rail = (edge: (t: number) => Pt) => {
    const top: string[] = []
    const bottom: string[] = []
    for (let i = 0; i <= 40; i++) {
      const t = i / 40
      const [x, y] = edge(t)
      const s = depth(t)
      top.push(pt([x, y - 22 * s]))
      bottom.unshift(pt([x, y - 16 * s]))
    }
    let posts = ''
    for (let j = 0; j <= 30; j++) {
      const t = persp(j, 30)
      const [x, y] = edge(t)
      const s = depth(t)
      posts += `M${n1(x - 2.4 * s)} ${n1(y - 22 * s)}h${n1(4.8 * s)}v${n1(22 * s)}h${n1(-4.8 * s)}z`
    }
    return { bar: `M${top.join('L')}L${bottom.join('L')}Z`, posts }
  }
  return { band, outer, stripes, far: rail(far), near: rail(near) }
})()

export const TREES = (() => {
  const rand = seeded(77)
  let d = ''
  let light = ''
  for (let x = -10; x < 1620; x += 26 + rand() * 22) {
    const r = 14 + rand() * 12
    const y = 74 - rand() * 8
    d += circle(x, y, r)
    light += circle(x - r * 0.3, y - r * 0.35, r * 0.45)
  }
  return { d, light }
})()

// silhueta da cidade-doce ao longe (torres de bolo, cúpulas, roda-gigante)
export const SKYLINE = (() => {
  const rand = seeded(404)
  let d = ''
  let win = ''
  for (let x = 0; x < 1600; ) {
    const w = 18 + rand() * 30
    const h = 14 + rand() * 34
    const top = 78 - h
    d += rect(x, top, w, h + 4)
    if (rand() < 0.35) d += circle(x + w / 2, top, w / 2)
    for (let wy = top + 5; wy < 74; wy += 7)
      for (let wx = x + 4; wx < x + w - 4; wx += 6)
        if (rand() < 0.4) win += rect(wx, wy, 2.2, 2.6)
    x += w + 6 + rand() * 40
  }
  return { d, win }
})()

// ---- Faixa de baixo: grama da reta final, cerca interna e balizas ----
// viewBox 1600×60 esticado na largura; a cerca fica atrás das corredoras
export const STRIP = (() => {
  let stripes = ''
  for (let x = -40; x < 1640; x += 80)
    stripes += `M${x} 60L${x + 40} 60L${x + 70} 18L${x + 30} 18Z`
  let posts = ''
  for (let x = 6; x < 1600; x += 46) posts += rect(x, 12, 3, 16)
  return { stripes, posts }
})()

// ---- Torres de refletores (12 lâmpadas), viewBox 120×740 ----
export const TOWER = (() => {
  const cx = 60
  const legs =
    `M${cx - 22} 740L${cx - 7} 96h5L${cx - 15} 740z` +
    `M${cx + 22} 740L${cx + 7} 96h-5L${cx + 15} 740z`
  let braces = ''
  for (let y = 120; y < 730; y += 36) {
    const w1 = 7 + ((y - 96) / 644) * 15
    const w2 = 7 + ((y + 36 - 96) / 644) * 15
    braces += `M${n1(cx - w1)} ${y}L${n1(cx + w2)} ${y + 36}M${n1(cx + w1)} ${y}L${n1(cx - w2)} ${y + 36}`
  }
  let lamps = ''
  for (let r = 0; r < 3; r++)
    for (let c = 0; c < 4; c++)
      lamps += circle(cx - 23 + c * 15.3, 54 + r * 14, 5)
  return {
    legs,
    braces,
    lamps,
    box: `M${cx - 34} 40h68v48h-68z`,
    visor: `M${cx - 38} 36h76l-4 6h-68z`,
  }
})()

// ---- Arquibancada (canto direito), viewBox 260×600 ----
export const STAND_ROWS = [214, 262, 310, 358, 406, 454]
export const CROWD_HAIR = [
  '#a4553f',
  '#3a3352',
  '#f2b84b',
  '#6c7fd6',
  '#e8e0ff',
  '#ff8fc8',
]
export const STAND = (() => {
  const rand = seeded(303)
  const hair: string[] = CROWD_HAIR.map(() => '')
  let skin = ''
  let ears = ''
  let earIn = ''
  const shirts: string[] = ['', '', '', '', '']
  const sticks: { x: number; y: number; c: number; row: number }[] = []
  const flags: { x: number; y: number; c: number }[] = []
  STAND_ROWS.forEach((y, row) => {
    for (let x = 10 + (row % 2) * 9; x < 256; x += 18 + rand() * 3) {
      const hy = y + 14 - rand() * 4
      const c = Math.floor(rand() * CROWD_HAIR.length)
      shirts[Math.floor(rand() * 5)] += oval(x, hy + 14, 8.5, 7)
      skin += circle(x + 0.6, hy + 1, 6)
      hair[c] +=
        `M${n1(x - 7)} ${n1(hy + 1)}Q${n1(x - 6.6)} ${n1(hy - 8)} ${n1(x)} ${n1(hy - 7.6)}` +
        `Q${n1(x + 7)} ${n1(hy - 8)} ${n1(x + 7)} ${n1(hy + 1)}Q${n1(x + 3)} ${n1(hy - 3)} ${n1(x - 7)} ${n1(hy + 1)}Z`
      // metade da torcida também é garota-cavalo (orelhas!)
      if (rand() < 0.5) {
        ears +=
          `M${n1(x - 5.5)} ${n1(hy - 4)}L${n1(x - 6.5)} ${n1(hy - 13)}L${n1(x - 1.5)} ${n1(hy - 7)}Z` +
          `M${n1(x + 5.5)} ${n1(hy - 4)}L${n1(x + 6.5)} ${n1(hy - 13)}L${n1(x + 1.5)} ${n1(hy - 7)}Z`
        earIn +=
          `M${n1(x - 5)} ${n1(hy - 6)}L${n1(x - 5.6)} ${n1(hy - 10.5)}L${n1(x - 3)} ${n1(hy - 7.4)}Z` +
          `M${n1(x + 5)} ${n1(hy - 6)}L${n1(x + 5.6)} ${n1(hy - 10.5)}L${n1(x + 3)} ${n1(hy - 7.4)}Z`
      }
      const k = rand()
      if (k < 0.5)
        sticks.push({ x: x + 6, y: hy + 6, c: Math.floor(rand() * 6), row })
      else if (k < 0.58)
        flags.push({ x: x - 6, y: hy + 4, c: Math.floor(rand() * 6) })
    }
  })
  // degraus e paredinhas de cada fileira (na frente dos corpos)
  const steps = STAND_ROWS.map((y) => rect(0, y + 22, 260, 26)).join('')
  const stepTop = STAND_ROWS.map((y) => rect(0, y + 22, 260, 4)).join('')
  return { hair, skin, ears, earIn, shirts, sticks, flags, steps, stepTop }
})()

// ---- Fogos de artifício (viewBox 100×100) ----
const burst = (n: number, r0: number, r1: number, off = 0) =>
  Array.from({ length: n }, (_, i) => {
    const a = ((i + off) / n) * Math.PI * 2
    const c = Math.cos(a)
    const s = Math.sin(a)
    return `M${n1(50 + c * r0)} ${n1(50 + s * r0)}L${n1(50 + c * r1)} ${n1(50 + s * r1)}`
  }).join('')
export const BURST_RAYS = burst(16, 10, 40)
export const BURST_DOTS = burst(16, 44, 45, 0.5)
export const BURST_INNER = burst(8, 4, 18, 0.25)

// ---- Roda-gigante pastel ao longe (viewBox 300×340, eixo em 150,150) ----
export const FERRIS = (() => {
  const cx = 150
  const cy = 150
  let spokes = ''
  const cars: string[] = ['', '', '', '']
  let bulbs = ''
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2
    spokes += `M${cx} ${cy}L${n1(cx + Math.cos(a) * 124)} ${n1(cy + Math.sin(a) * 124)}`
  }
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2 + 0.13
    const x = cx + Math.cos(a) * 132
    const y = cy + Math.sin(a) * 132
    cars[i % 4] +=
      `M${n1(x - 8)} ${n1(y - 4)}h16a3 3 0 0 1 3 3v8a5 5 0 0 1 -5 5h-12a5 5 0 0 1 -5 -5v-8a3 3 0 0 1 3 -3z`
  }
  for (let i = 0; i < 32; i++) {
    const a = (i / 32) * Math.PI * 2
    bulbs += circle(cx + Math.cos(a) * 124, cy + Math.sin(a) * 124, 2.6)
  }
  const rim = circle(cx, cy, 126)
  const legs =
    `M${cx - 6} ${cy}L70 340h12L${cx} ${cy + 14}L218 340h12L${cx + 6} ${cy}z` +
    rect(52, 334, 196, 6)
  return { spokes, cars, bulbs, rim, legs, hub: circle(cx, cy, 13) }
})()
