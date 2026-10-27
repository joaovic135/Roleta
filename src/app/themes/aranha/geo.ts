// Geometria da cena Aranha (HQ). Tudo sorteado com semente fixa (igual no
// servidor e no navegador) e calculado uma vez, ao carregar o módulo;
// formas da mesma cor vão num <path> só.

export const seeded = (seed: number) => () => {
  seed = (seed + 0x6d2b79f5) | 0
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}
export const n = (v: number) => +v.toFixed(1)
export const rect = (x: number, y: number, w: number, h: number) =>
  `M${n(x)} ${n(y)}h${n(w)}v${n(h)}h${n(-w)}z`
export const rectCCW = (x: number, y: number, w: number, h: number) =>
  `M${n(x)} ${n(y)}v${n(h)}h${n(w)}v${n(-h)}z`
export const circ = (cx: number, cy: number, r: number) =>
  `M${n(cx - r)} ${n(cy)}a${n(r)} ${n(r)} 0 1 0 ${n(r * 2)} 0a${n(r)} ${n(r)} 0 1 0 ${n(-r * 2)} 0`
export const sparkle = (x: number, y: number, s: number) =>
  `M${n(x)} ${n(y - s)}Q${n(x)} ${n(y)} ${n(x + s)} ${n(y)}Q${n(x)} ${n(y)} ${n(x)} ${n(y + s)}Q${n(x)} ${n(y)} ${n(x - s)} ${n(y)}Q${n(x)} ${n(y)} ${n(x)} ${n(y - s)}Z`
// "M x y" absolutos viram "m dx dy" relativos (cada sub-caminho fecha com
// z e volta ao início): o HTML fica bem menor
export const compact = (d: string) => {
  let px = 0
  let py = 0
  return d.replace(/M(-?[\d.]+) (-?[\d.]+)/g, (_, xs: string, ys: string) => {
    const x = +xs
    const y = +ys
    const out = `m${n(x - px)} ${n(y - py)}`
    px = x
    py = y
    return out
  })
}

// ------------------------------------------------------------------ cidade
// Cidade, rua e carros dividem a mesma caixa e o mesmo viewBox (1600 x 500)
export const W = 1600
export const H = 500
export const GROUND = 440
export const VB = `0 0 ${W} ${H}`

// Torre art déco escalonada, com mastro e agulha (fundo)
const decoTower = (cx: number, height: number) => {
  const tiers: [number, number][] = [
    [92, height * 0.52],
    [68, height * 0.13],
    [48, height * 0.1],
    [30, height * 0.07],
    [12, height * 0.07],
    [3, height * 0.11],
  ]
  let y = GROUND
  let d = ''
  for (const [w, h] of tiers) {
    d += rect(cx - w / 2, y - h, w, h)
    y -= h
  }
  return d
}
// Torre de coroa pontuda (arcos sobrepostos), com agulha (fundo)
const crownTower = (cx: number, height: number) => {
  const bodyH = height * 0.66
  const top = GROUND - bodyH
  let d = rect(cx - 38, top, 76, bodyH)
  d += rect(cx - 28, top - 26, 56, 26)
  for (let i = 0; i < 4; i++) {
    const w = 52 - i * 12
    const y = top - 26 - i * 16
    d += `M${n(cx - w / 2)} ${n(y)}Q${n(cx)} ${n(y - 34)} ${n(cx + w / 2)} ${n(y)}z`
  }
  const tip = top - 26 - 4 * 16 - 14
  d += `M${cx - 2} ${n(tip + 22)}L${cx} ${n(tip - 60)}L${cx + 2} ${n(tip + 22)}z`
  return d
}

// Prédios-símbolo nas beiradas: em telas 16:9 a caixa mostra x 89–1511 e as
// margens ao lado dos cards caem sobre eles (hotel à esquerda, torre déco
// à direita), com letreiro de neon, outdoor de lâmpadas e coroa acesa
export const HOTEL = { x: 104, w: 100, top: 128 }
export const DECO = { x: 1392, w: 96, top: 220 }
// letreiros verticais na fachada (caixa escura; as letras acendem à noite)
export const SIGNS = [
  { x: 143, y: 150, w: 22, h: 150, text: 'HOTEL', cls: 'hq-neon-r' },
  { x: 1429, y: 238, w: 22, h: 150, text: 'SORTE', cls: 'hq-neon-p' },
]
// outdoor no telhado do hotel
export const BOARD = { x: 110, y: 66, w: 88, h: 34 }

export const WIN_GROUPS = 5
export const buildCity = () => {
  const rand = seeded(1962)
  // ---- fundo: silhueta azulada com torres-símbolo
  let far = ''
  let farLit = ''
  for (let x = -20; x < W + 20; ) {
    const w = 34 + Math.floor(rand() * 52)
    const h = 150 + Math.floor(rand() * 140)
    const top = GROUND - h
    far += rect(x, top, w, h)
    if (rand() < 0.4) {
      const sw = w * 0.6
      far += rect(x + (w - sw) / 2, top - 22, sw, 22)
      if (rand() < 0.5) far += rect(x + w / 2 - 1.5, top - 52, 3, 30)
    }
    for (let i = 0; i < 5; i++)
      if (rand() < 0.75)
        farLit += rect(
          x + 4 + Math.floor(rand() * (w - 10)),
          top + 12 + Math.floor(rand() * (h - 70)),
          3,
          4,
        )
    x += w + (rand() < 0.2 ? 8 : 0)
  }
  far +=
    crownTower(262, 330) +
    decoTower(560, 340) +
    decoTower(805, 370) +
    crownTower(1060, 320) +
    decoTower(1290, 360)

  // ---- frente: prédios com contorno de nanquim, janelas, caixas-d'água
  const fills = ['', '', '', '']
  let sil = ''
  let shade = ''
  let panes = ''
  let tanks = ''
  let tankRoofs = ''
  let ink = ''
  let rails = ''
  const beacons: [number, number][] = []
  const groups: string[] = Array.from({ length: WIN_GROUPS }, () => '')
  // vida nas janelas acesas: gente na janela, gato no parapeito, vaso de
  // planta (sorteio separado, não mexe no desenho da cidade)
  const srand = seeded(404)
  const sils: string[] = Array.from({ length: WIN_GROUPS }, () => '')
  const silhouette = (wx: number, wy: number) => {
    const k = srand()
    if (k < 0.55)
      return (
        circ(wx + 4, wy + 4.4, 1.7) +
        `M${n(wx + 0.8)} ${wy + 11}Q${n(wx + 4)} ${n(wy + 5.4)} ${n(wx + 7.2)} ${wy + 11}Z`
      )
    if (k < 0.8)
      return (
        `M${n(wx + 1.5)} ${wy + 11}Q${n(wx + 2)} ${n(wy + 7.4)} ${n(wx + 4)} ${n(wy + 7.6)}` +
        `L${n(wx + 4.3)} ${n(wy + 6)}L${n(wx + 5)} ${n(wy + 7)}L${n(wx + 5.8)} ${n(wy + 6)}` +
        `L${n(wx + 6)} ${n(wy + 8.2)}Q${n(wx + 6.6)} ${n(wy + 10)} ${n(wx + 6.4)} ${wy + 11}Z`
      )
    return (
      rect(wx + 2.4, wy + 8.6, 3.2, 2.4) +
      circ(wx + 3, wy + 7.4, 1.3) +
      circ(wx + 5, wy + 7, 1.4)
    )
  }
  const windows = (
    x: number,
    w: number,
    top: number,
    skip?: { x: number; y: number; w: number; h: number },
  ) => {
    const cols = Math.floor((w - 12) / 15)
    const ox = x + (w - cols * 15) / 2 + 3.5
    for (let wy = top + 14; wy < GROUND - 24; wy += 20)
      for (let ci = 0; ci < cols; ci++) {
        const wx = ox + ci * 15
        if (
          skip &&
          wx + 8 > skip.x &&
          wx < skip.x + skip.w &&
          wy + 11 > skip.y &&
          wy < skip.y + skip.h
        )
          continue
        const p = rect(wx, wy, 8, 11)
        panes += p
        if (rand() < 0.56) {
          const g = Math.floor(rand() * WIN_GROUPS)
          groups[g] += p
          if (g !== 3 && srand() < 0.1) sils[g] += silhouette(wx, wy)
        }
      }
  }
  const RESERVED: [number, number][] = [
    [HOTEL.x - 6, HOTEL.x + HOTEL.w + 6],
    [DECO.x - 6, DECO.x + DECO.w + 6],
  ]
  for (let x = -14; x < W + 14; ) {
    const inside = RESERVED.find(([a, b]) => x >= a && x < b)
    if (inside) {
      x = inside[1]
      continue
    }
    let w = 66 + Math.floor(rand() * 84)
    const ahead = RESERVED.find(([a]) => a > x && a < x + w + 40)
    if (ahead) w = ahead[0] - x
    if (w < 26) {
      x += w
      continue
    }
    const h = 92 + Math.floor(rand() * 150)
    const top = GROUND - h
    const c = Math.floor(rand() * 4)
    const body = rect(x, top, w, h) + rect(x - 3, top - 6, w + 6, 7)
    fills[c] += body
    sil += body
    shade += rect(x, top + 1, w * 0.26, h - 1)
    windows(x, w, top)
    // escada de incêndio de Nova York na lateral
    if (w > 74 && rand() < 0.45) {
      for (let fy = top + 30; fy < GROUND - 40; fy += 34) {
        ink += rect(x + 2, fy, 30, 2.4)
        rails += `M${n(x + 6)} ${n(fy)}L${n(x + 26)} ${n(fy + 34)}`
        rails += `M${n(x + 2)} ${n(fy - 9)}h30M${n(x + 2)} ${n(fy - 9)}v9M${n(x + 32)} ${n(fy - 9)}v9`
      }
    }
    // caixa-d'água no telhado
    if (w > 84 && rand() < 0.55) {
      const tx = x + 10 + Math.floor(rand() * (w - 46))
      const roof = top - 6
      ink +=
        rect(tx + 2, roof - 14, 3, 14) +
        rect(tx + 19, roof - 14, 3, 14) +
        rect(tx, roof - 8, 24, 2)
      tanks += rect(tx - 1, roof - 40, 26, 26)
      tankRoofs += `M${tx - 4} ${roof - 40}L${tx + 12} ${roof - 54}L${tx + 28} ${roof - 40}z`
      ink += rect(tx - 1, roof - 33, 26, 1.6) + rect(tx - 1, roof - 22, 26, 1.6)
    } else if (rand() < 0.45) {
      ink += rect(x + w * 0.7, top - 34, 2.5, 28)
      beacons.push([x + w * 0.7 + 1.2, top - 36])
    }
    x += w + (ahead ? 0 : rand() < 0.22 ? 10 : 0)
  }

  // ---- hotel de tijolos (esquerda)
  {
    const { x, w, top } = HOTEL
    const body =
      rect(x, top, w, GROUND - top) +
      rect(x - 4, top - 8, w + 8, 9) +
      rect(x - 2, top + 108, w + 4, 5)
    fills[0] += body
    sil += body
    shade += rect(x, top + 1, w * 0.24, GROUND - top - 1)
    windows(x, w, top, { ...SIGNS[0], y: SIGNS[0].y - 4, h: SIGNS[0].h + 8 })
    // vitrine e toldo listrado no térreo
    ink += rect(x + 6, 416, w - 12, 24)
    // pernas e passarela do outdoor
    const b = BOARD
    ink +=
      rect(b.x + 12, b.y + b.h, 3, top - 8 - b.y - b.h) +
      rect(b.x + b.w - 15, b.y + b.h, 3, top - 8 - b.y - b.h) +
      rect(b.x - 2, b.y + b.h + 6, b.w + 4, 2.5)
    rails += `M${b.x + 14} ${b.y + b.h + 6}L${b.x + 40} ${top - 8}M${b.x + b.w - 14} ${b.y + b.h + 6}L${b.x + b.w - 40} ${top - 8}`
  }
  // ---- torre art déco azul (direita), coroa escalonada e agulha
  {
    const { x, w, top } = DECO
    const tiers = [
      rect(x, top, w, GROUND - top),
      rect(x + 10, top - 44, w - 20, 44),
      rect(x + 22, top - 78, w - 44, 34),
      rect(x + 32, top - 104, w - 64, 26),
      `M${x + 32} ${top - 104}L${x + w / 2} ${top - 126}L${x + w - 32} ${top - 104}z`,
    ]
    for (const t of tiers) {
      fills[1] += t
      sil += t
    }
    shade += rect(x, top + 1, w * 0.24, GROUND - top - 1)
    windows(x, w, top, { ...SIGNS[1], y: SIGNS[1].y - 4, h: SIGNS[1].h + 8 })
    // gárgulas nas quinas e frisos entre os andares
    ink +=
      `M${x - 2} ${top}l-12 3l2 4l10 -2z` +
      `M${x + w + 2} ${top}l12 3l-2 4l-10 -2z` +
      rect(x - 3, top - 3, w + 6, 4) +
      rect(x + 8, top - 47, w - 16, 4) +
      rect(x + 20, top - 81, w - 40, 4)
    // agulha
    ink += `M${x + w / 2 - 2} ${top - 124}L${x + w / 2} ${top - 182}L${x + w / 2 + 2} ${top - 124}z`
    beacons.push([x + w / 2, top - 184])
  }

  let beaconD = ''
  for (const [bx, by] of beacons) beaconD += circ(bx, by, 3.2)

  return {
    far: compact(far),
    farLit: compact(farLit),
    fills: fills.map(compact),
    sil: compact(sil),
    shade: compact(shade),
    panes: compact(panes),
    tanks: compact(tanks),
    tankRoofs,
    tankInk: compact(tanks + tankRoofs),
    ink: compact(ink),
    rails,
    groups: groups.map(compact),
    sils: sils.map(compact),
    beacons: beaconD,
  }
}

// Gato no alto do outdoor (olhos acesos) e o herói agachado na coroa déco,
// em coordenadas locais: pés em 0,0, virados para a esquerda
export const CAT = {
  body: 'M-5 0Q-6.5 -7 -2.4 -9.6Q0.6 -10.6 2.8 -7.6Q4.6 -4 4 0Z',
  head:
    'M-3.2 -12.4a3.2 3 0 1 0 6.4 0a3.2 3 0 1 0 -6.4 0' +
    'M-2.8 -13.6L-2.4 -17.2L-0.4 -14.8ZM0.6 -14.8L2.6 -17.2L2.9 -13.6Z',
  tail: 'M0 0Q6 1 6.5 -4.5Q6.8 -8.5 4.6 -9.6',
  eyes: circ(-1.2, -12.4, 0.75) + circ(1.2, -12.4, 0.75),
}
export const PERCH = {
  limbs: 'M-3 -20L5 -11M5 -11L9 -3L3 0M5 -11L-3 -9L-5.5 0M-2 -19L-8 -12L-10 0',
  suit: 'M-3 -20L5 -11M5 -11L9 -3L6 -1.6M5 -11L-3 -9L-4.4 -4M-2 -19L-8 -12L-9 -6',
  red: 'M6 -1.6L3 0M-4.4 -4L-5.5 0M-9 -6L-10 0',
  scarf: 'M-1.4 -21Q8 -27 17 -23.5Q9 -22 0.5 -18.4Z',
  eyes: 'M-10.6 -25.4L-6.8 -24.7L-7.2 -22.2Q-9.8 -22.6 -10.6 -25.4Z',
}

// Fendas da coroa déco (acendem douradas à noite)
export const CROWN = (() => {
  const { x, top } = DECO
  let d = ''
  for (let k = 0; k < 7; k++) d += rect(x + 16 + k * 10, top - 38, 4, 30)
  for (let k = 0; k < 5; k++) d += rect(x + 27 + k * 9, top - 72, 3.5, 22)
  for (let k = 0; k < 4; k++) d += rect(x + 38 + k * 6, top - 100, 2.5, 18)
  return d
})()

// Toldo listrado do hotel (vermelho e creme, com babado)
export const AWNING = (() => {
  const x = HOTEL.x + 4
  const w = HOTEL.w - 8
  let red = ''
  let scallop = ''
  for (let i = 0; i < w; i += 12) red += rect(x + i, 402, 6, 11)
  for (let i = 0; i < w; i += 8) scallop += `M${x + i} 413a4 4 0 0 0 8 0z`
  return { box: rect(x, 402, w, 11), red, scallop }
})()

// Lâmpadas do outdoor em duas fases (correm alternando)
export const BULBS = (() => {
  const { x, y, w, h } = BOARD
  const out = ['', '']
  let k = 0
  for (let i = 4; i < w; i += 7.4) {
    out[k++ % 2] += circ(x + i, y - 1, 1.9)
    out[k % 2] += circ(x + w - i, y + h + 1, 1.9)
  }
  for (let j = 6; j < h; j += 7) {
    out[k++ % 2] += circ(x - 1, y + j, 1.9)
    out[k % 2] += circ(x + w + 1, y + h - j, 1.9)
  }
  return out
})()

// ------------------------------------------------------------------ rua
export const LANE_FAR = 466
export const LANE_NEAR = 495
export const buildStreet = () => {
  const rand = seeded(77)
  let dashes = ''
  for (let x = 10; x < W; x += 56) dashes += rect(x, 479, 28, 3)
  let zebra = ''
  // faixa de pedestres fora do centro (o rodapé da página fica no meio)
  for (let x = 1124; x < 1240; x += 16) zebra += rect(x, 450, 9, 48)
  let posts = ''
  let heads = ''
  let glow = ''
  let pools = ''
  for (let x = 140; x < W; x += 330) {
    posts += rect(x, 386, 4, 56) + rect(x, 386, 22, 3.5)
    heads += rect(x + 16, 384, 14, 7)
    glow += `M${x + 17} 391L${x + 29} 391L${x + 58} 446L${x - 12} 446Z`
    pools += `M${x - 34} 452a${57} 6 0 1 0 ${114} 0a57 6 0 1 0 -114 0`
  }
  // hidrante e bueiros (o vapor sai deles)
  const hydrant =
    `M226 440v-12q0-6 6-6q6 0 6 6v12z` +
    rect(223, 428, 18, 4) +
    circ(232, 420, 3)
  const manholes =
    `M160 471a16 3.4 0 1 0 32 0a16 3.4 0 1 0 -32 0` +
    `M1418 471a16 3.4 0 1 0 32 0a16 3.4 0 1 0 -32 0`
  // respingos de gota no asfalto (coroinhas de HQ), dois grupos alternados
  const splash = ['', '']
  for (let i = 0; i < 46; i++) {
    const x = n(rand() * W)
    const y = n(452 + rand() * 44)
    splash[i % 2] +=
      `M${x - 5} ${y}l-3 -6M${x} ${y - 1}v-8M${x + 5} ${y}l3 -6M${x - 7} ${y}h14`
  }
  return {
    dashes,
    zebra,
    posts,
    heads,
    glow,
    pools,
    hydrant,
    manholes,
    splash,
  }
}

// ------------------------------------------------------------------ carros
// Cada carro é um <svg> pequeno dentro de uma <div> que anda pela caixa
// (só transform). Desenho local: x 0..len, chão em y 0.
export type Car = {
  len: number
  tall: number
  body: string
  glass: string
  ink: string
  light: string
  color: string
}
const wheels = (xs: number[]) => ({
  ink: xs.map((x) => circ(x, -5.5, 6.5)).join(''),
  hub: xs.map((x) => circ(x, -5.5, 2.6)).join(''),
})
export const sedan = (color: string, taxi: boolean, police = false): Car => {
  const w = wheels([16, 56])
  let ink = w.ink
  if (taxi)
    for (let i = 0; i < 10; i++) ink += rect(6 + i * 6, i % 2 ? -13 : -10, 3, 3)
  if (police) ink += rect(3, -14, 66, 5) + rect(31, -33, 14, 3)
  return {
    len: 74,
    tall: 36,
    color,
    body:
      'M2 -6L2 -15Q3 -18 9 -18L20 -18L27 -28L50 -28L58 -18L68 -17Q72 -16 72 -12L72 -6Z' +
      (taxi ? rect(32, -33, 13, 5) : ''),
    glass:
      'M24 -19L29.5 -25.5L37.5 -25.5L37.5 -19ZM40.5 -19L40.5 -25.5L48.5 -25.5L55 -19Z',
    ink,
    light: w.hub + rect(69, -15, 3, 3.5),
  }
}
export const bus = (): Car => {
  const w = wheels([24, 106])
  let glass = ''
  for (let i = 0; i < 8; i++) glass += rect(10 + i * 14, -34, 10, 10)
  glass += rect(124, -34, 8, 14)
  return {
    len: 138,
    tall: 46,
    color: '#2f6bd6',
    body: 'M2 -6L2 -40Q2 -42 6 -42L128 -42Q134 -42 135 -36L136 -6Z',
    glass,
    ink: w.ink + rect(2, -20, 134, 4),
    light: w.hub + rect(132, -12, 3.5, 4),
  }
}
// Carro de fuga (roxo, vidro fumê) com traços de velocidade atrás
export const getaway = (): Car => {
  const w = wheels([16, 58])
  return {
    len: 76,
    tall: 34,
    color: '#7b3fc4',
    body: 'M2 -6L2 -14Q3 -17 10 -17L22 -17L31 -26L52 -26L61 -17L71 -16Q75 -15 75 -11L75 -6Z',
    glass: 'M27 -18L33 -24L41 -24L41 -18ZM44 -18L44 -24L51 -24L57 -18Z',
    ink: w.ink + rect(4, -12, 68, 2.4),
    light: w.hub + rect(72, -14, 3, 3.5),
  }
}

// ------------------------------------------------------------------ céu
export const buildStars = () => {
  const rand = seeded(9)
  let dots = ''
  let twA = ''
  let twB = ''
  for (let i = 0; i < 120; i++)
    dots += circ(rand() * 1600, rand() * 520, 0.7 + rand() * 1.2)
  for (let i = 0; i < 26; i++) {
    const s = sparkle(rand() * 1600, 10 + rand() * 480, 4 + rand() * 6)
    if (i % 2) twA += s
    else twB += s
  }
  return { dots, twA, twB }
}

// Nuvens de HQ: círculos unidos; o contorno grosso fica por baixo e o
// recheio por cima, assim só a borda externa aparece
export const buildClouds = (seed: number, count: number, scale: number) => {
  const rand = seeded(seed)
  const list: string[] = []
  for (let i = 0; i < count; i++) {
    const cx = (i + 0.2 + rand() * 0.6) * (1600 / count)
    const cy = 60 + rand() * 150
    const w = (90 + rand() * 90) * scale
    let d = ''
    const bumps = 4 + Math.floor(rand() * 3)
    for (let b = 0; b < bumps; b++) {
      const t = b / (bumps - 1)
      const r = (18 + Math.sin(t * Math.PI) * 22 + rand() * 8) * scale
      d += circ(cx - w / 2 + t * w, cy - Math.sin(t * Math.PI) * 12 * scale, r)
    }
    // base reta no mesmo sentido dos círculos (anti-horário): com nonzero
    // os sentidos opostos se anulariam e abririam buracos
    d += rectCCW(cx - w / 2, cy, w, 16 * scale)
    list.push(d)
  }
  // a faixa tem 2 cópias (0 e 1600) para o laço de deriva não ter emenda
  const shift = (d: string, dx: number) =>
    d.replace(/M(-?[\d.]+) /g, (_, x: string) => `M${n(+x + dx)} `)
  const all = list.join('')
  return compact(all + shift(all, 1600))
}
export const STORM_CLOUDS = (() => {
  const rand = seeded(5)
  // duas fileiras de "bolotas"; período de 1600 (a faixa desliza 1600)
  const row: [number, number, number][] = []
  for (let i = 0; i < 9; i++)
    row.push([i * 178 + rand() * 50, 40 + rand() * 45, 94 + rand() * 34])
  for (let i = 0; i < 13; i++)
    row.push([i * 123 + rand() * 40, 118 + rand() * 34, 30 + rand() * 24])
  let d = ''
  for (const dx of [-1600, 0, 1600])
    for (const [x, y, r] of row) d += circ(x + dx, y, r)
  return compact(d + rectCCW(-1600, -20, 4800, 80))
})()

// Raios de HQ do sol da manhã (triângulos finos alternados)
export const RAYS = (() => {
  let d = ''
  const c = 300
  for (let i = 0; i < 20; i++) {
    const a = (i / 20) * Math.PI * 2
    const r = i % 2 ? 210 : 300
    const s = 0.05
    d += `M${c} ${c}L${n(c + Math.cos(a - s) * r)} ${n(c + Math.sin(a - s) * r)}L${n(c + Math.cos(a + s) * r)} ${n(c + Math.sin(a + s) * r)}Z`
  }
  return d
})()

// Explosão de onomatopeia: estrela irregular centrada em (cx, cy)
export const burst = (
  seed: number,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  spikes = 16,
) => {
  const rand = seeded(seed)
  let d = ''
  for (let i = 0; i < spikes * 2; i++) {
    const a = (i / (spikes * 2)) * Math.PI * 2
    const r = i % 2 ? 0.64 + rand() * 0.1 : 0.9 + rand() * 0.18
    d += `${i ? 'L' : 'M'}${n(cx + Math.cos(a) * rx * r)} ${n(cy + Math.sin(a) * ry * r)}`
  }
  return d + 'Z'
}
export const BOLT =
  'M30 0L10 100L27 100L12 172L29 172L18 240L52 138L35 138L50 80L33 80L46 0Z'

// Linhas de foco (velocidade) saindo do centro, cunhas finas de traço à mão
export const focusLines = (
  seed: number,
  count: number,
  r0: number,
  spread: number,
  wMin: number,
  wMax: number,
  R = 170,
) => {
  const rand = seeded(seed)
  let d = ''
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2 + (rand() - 0.5) * 0.05
    const w = ((wMin + rand() * (wMax - wMin)) * Math.PI) / 180
    const ri = r0 + rand() * spread
    d += `M${n(Math.cos(a) * ri)} ${n(Math.sin(a) * ri)}L${n(Math.cos(a - w) * R)} ${n(Math.sin(a - w) * R)}L${n(Math.cos(a + w) * R)} ${n(Math.sin(a + w) * R)}Z`
  }
  return d
}

// Chuva em traços de nanquim: ladrilho que desce na mesma diagonal dos
// traços (o laço não tem emenda)
export const rainTile = (
  w: number,
  h: number,
  count: number,
  wide: boolean,
) => {
  const rand = seeded(w + h)
  let lines = ''
  for (let i = 0; i < count; i++) {
    const x = n(rand() * w)
    const y = n(rand() * h)
    const len = n(h * (wide ? 0.085 : 0.06))
    const dx = n((len * w) / h)
    // cópias à direita e acima cobrem o traço que sai pela borda
    for (const [ox, oy] of [
      [0, 0],
      [w, 0],
      [0, -h],
      [w, -h],
    ])
      lines += `M${n(x + ox)} ${n(y + oy)}l${-dx} ${len}`
  }
  const svg = wide
    ? `<svg xmlns='http://www.w3.org/2000/svg' width='${w}' height='${h}'><path d='${lines}' stroke='#05060c' stroke-width='4.5' stroke-linecap='round' fill='none'/><path d='${lines}' stroke='#e8f1ff' stroke-width='2' stroke-linecap='round' fill='none'/></svg>`
    : `<svg xmlns='http://www.w3.org/2000/svg' width='${w}' height='${h}'><path d='${lines}' stroke='#9fb7e8' stroke-opacity='.6' stroke-width='1.4' fill='none'/></svg>`
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`
}

// Teia de canto: fios radiais saindo do canto e anéis que cedem entre um
// fio e outro (raio 300, 9 fios, 8 anéis)
export const WEB = (() => {
  const spokes = 9
  const rings = 8
  const R = 300
  const angles = Array.from(
    { length: spokes },
    (_, i) => (i / (spokes - 1)) * (Math.PI / 2),
  )
  const at = (r: number, a: number) =>
    `${n(Math.cos(a) * r)} ${n(Math.sin(a) * r)}`
  let d = angles.map((a) => `M0 0L${at(R, a)}`).join('')
  for (let k = 1; k <= rings; k++) {
    const r = (R * k) / rings
    d += `M${at(r, angles[0])}`
    for (let i = 1; i < angles.length; i++) {
      const mid = (angles[i - 1] + angles[i]) / 2
      d += `Q${at(r * 0.86, mid)} ${at(r, angles[i])}`
    }
  }
  return d
})()
// Orvalho nos cruzamentos da teia (amanhecer), dois grupos que cintilam
export const DEW = (() => {
  const rand = seeded(44)
  const out = ['', '']
  for (let s = 0; s < 9; s++)
    for (let k = 1; k <= 8; k++) {
      if (rand() > 0.42) continue
      const a = (s / 8) * (Math.PI / 2)
      const r = (300 * k) / 8
      const x = Math.cos(a) * r
      const y = Math.sin(a) * r
      out[(s + k) % 2] += sparkle(x, y, 5 + rand() * 5) + circ(x, y, 2.2)
    }
  return out
})()

// Pombos: bando em "v" de HQ, asas em cima e embaixo
export const flock = (up: boolean) =>
  [
    [10, 20],
    [34, 8],
    [52, 26],
    [74, 14],
    [96, 30],
    [118, 18],
  ]
    .map(
      ([x, y]) =>
        `M${x - 8} ${y}Q${x - 4} ${up ? y - 7 : y + 4} ${x} ${y}Q${x + 4} ${up ? y - 7 : y + 4} ${x + 8} ${y}`,
    )
    .join('')

// Herói da Teia Rubra (personagem original): macacão azul-noite, luvas,
// botas e cachecol vermelhos, lentes que brilham. Mão (na teia) em 0,0.
export const HERO = {
  limbs:
    'M0 0L3 15L2 30M-13 33L-23 43L-31 37M-4 52L8 63L5 80M-10 52L-15 69L-27 74',
  suit: 'M1.6 8L3 15L2 30M-13 33L-23 43L-27.4 39.6M-4 52L8 63L6.4 71.5M-10 52L-15 69L-20.6 71.4',
  red: 'M0 0L1.6 8M-27.4 39.6L-31 37M6.4 71.5L5 80M-20.6 71.4L-27 74',
  torso: 'M-15 31Q-6 25 4 29L0 53L-13 53Z',
  rim: 'M2.6 31.5L-0.6 50.5M-2 14L1 22',
  scarf:
    'M-3 25Q-18 21 -33 27Q-19 27.5 -6 28.5ZM-5 23Q-20 15 -36 15Q-22 20.5 -7 26Z',
  eyes: 'M-5 15.4L1.6 16.6L0.4 21.6Q-3.8 21 -5 15.4ZM-10.6 15.8L-7 16.3L-7.4 21.2Q-10 20.4 -10.6 15.8Z',
  speed: 'M-24 49h-13M-21 57h-17M-27 65h-11',
}

// Dirigível do vilão (Dr. Engrenagem): casco de aço, aletas roxas,
// engrenagem verde, olho vermelho na proa e gôndola com holofote
export const gear = (cx: number, cy: number, r: number, teeth: number) => {
  let d = ''
  for (let i = 0; i < teeth * 4; i++) {
    const a = (i / (teeth * 4)) * Math.PI * 2
    const rr = i % 4 < 2 ? r : r * 0.8
    d += `${i ? 'L' : 'M'}${n(cx + Math.cos(a) * rr)} ${n(cy + Math.sin(a) * rr)}`
  }
  return d + 'Z'
}
