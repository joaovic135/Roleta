// Coreografia do modo cartas, imitando truques de dealer:
// riffle shuffle com bridge → corte → charlier cut → ribbon spread em arco →
// turnover em onda (as perdedoras viram) → a vencedora sai do arco e vira.
//
// Tudo é calculado de uma vez em keyframes do WAAPI (só transform e
// opacity, com offsets), então nada é medido nem recalculado por frame.
// Coordenadas em px a partir do centro da mesa; os tempos são frações da
// duração total.

export const CARD_RATIO = 1.45
// Precisa bater com o perspective da mesa (cards.css)
export const PERSPECTIVE = 1600

export interface Pose {
  x: number
  y: number
  z: number
  // giro no plano da mesa (graus)
  r: number
  // inclinação (rotateX), usada no arco do bridge
  tilt: number
  s: number
}

export interface CardScript {
  move: Keyframe[]
  flip: Keyframe[]
  shade: Keyframe[]
  glow: Keyframe[]
}

export interface Choreography {
  cards: CardScript[]
  // instantes (frações) dos "tics" de carta batendo
  ticks: number[]
}

const f = (n: number, digits = 2) => n.toFixed(digits)

export const poseTransform = (p: Pose) =>
  `translate3d(${f(p.x)}px, ${f(p.y)}px, ${f(p.z)}px) rotate(${f(p.r)}deg) rotateX(${f(p.tilt)}deg) scale(${f(p.s, 4)})`

// Distância entre cartas empilhadas no eixo Z (ordem de desenho na mesa 3D)
const ZS = 0.8

// Largura da carta em tamanho real (a vencedora revelada). As outras fases
// usam scale() a partir dela, para pôster e texto ficarem nítidos no fim.
export const baseCardWidth = (w: number, h: number) =>
  Math.min(w * 0.46, (h * 0.6) / CARD_RATIO)

// Largura do maço durante o embaralhamento
const shuffleWidth = (w: number) => w * 0.22

// Pose de uma carta no maço: `d` = profundidade (0 = carta de baixo). As de
// cima sobem um pouco, dando espessura ao maço.
export const stackPose = (
  d: number,
  n: number,
  w: number,
  base: number,
  at: Partial<Pose> = {},
): Pose => {
  const step = Math.min(0.6, 12 / Math.max(1, n))
  return {
    x: (at.x ?? 0) - d * step * 0.5,
    y: (at.y ?? 0) - d * step,
    z: (at.z ?? 0) + d * ZS,
    r: at.r ?? 0,
    tilt: 0,
    s: at.s ?? shuffleWidth(w) / base,
  }
}

interface Frame<T> {
  t: number
  v: T
  easing: string
}

// Linha do tempo de uma propriedade de uma carta
class Track<T> {
  frames: Frame<T>[]

  constructor(v: T) {
    this.frames = [{ t: 0, v, easing: 'linear' }]
  }

  get last() {
    return this.frames[this.frames.length - 1]
  }

  // Segura a pose atual até t, depois vai até `v` em t1
  go(t: number, t1: number, v: T, easing = 'cubic-bezier(.45,0,.25,1)') {
    const start = Math.min(1, Math.max(t, this.last.t))
    if (start > this.last.t)
      this.frames.push({ t: start, v: this.last.v, easing: 'linear' })
    this.frames.push({ t: Math.min(1, Math.max(t1, start)), v, easing })
  }

  // O easing de um keyframe vale do keyframe até o próximo
  keyframes(fmt: (v: T) => Keyframe): Keyframe[] {
    if (this.last.t < 1)
      this.frames.push({ t: 1, v: this.last.v, easing: 'linear' })
    return this.frames.map((frame, i) => ({
      ...fmt(frame.v),
      offset: frame.t,
      easing: this.frames[i + 1]?.easing ?? 'linear',
    }))
  }
}

// Gira uma pose em torno de um ponto (relativo ao centro da carta), como o
// maço pivotando no polegar
const pivot = (p: Pose, deg: number, px: number, py: number): Pose => {
  const a = (deg * Math.PI) / 180
  const rx = px * Math.cos(a) - py * Math.sin(a)
  const ry = px * Math.sin(a) + py * Math.cos(a)
  return { ...p, x: p.x + px - rx, y: p.y + py - ry, r: p.r + deg }
}

const clampInt = (v: number, min: number, max: number) =>
  Math.min(max, Math.max(min, Math.round(v)))

interface ChoreoInput {
  n: number
  // índice (em cards) da vencedora
  winner: number
  w: number
  h: number
  base: number
  rand: () => number
}

export function choreograph({
  n,
  winner,
  w,
  h,
  base,
  rand,
}: ChoreoInput): Choreography {
  const ws = shuffleWidth(w)
  const ss = ws / base
  const hs = ws * CARD_RATIO
  const stack = (d: number, at: Partial<Pose> = {}) =>
    stackPose(d, n, w, base, at)

  const move = Array.from({ length: n }, (_, c) => new Track(stack(c)))
  const flip = Array.from({ length: n }, () => new Track(0))
  const shade = Array.from({ length: n }, () => new Track(0))
  const glow = Array.from({ length: n }, () => new Track(0))
  const ticks: number[] = []
  // Ordem atual do maço, de baixo para cima
  let order = Array.from({ length: n }, (_, c) => c)

  if (n >= 2) {
    // ---- 1. Riffle shuffle -------------------------------------------------
    // O maço é cortado em duas metades, uma de cada lado, inclinadas em V e
    // erguidas da mesa (z); as cartas caem alternando os lados, de baixo
    // para cima, às vezes duas de uma vez, e ficam entrelaçadas
    const half = clampInt(n / 2 + (rand() - 0.5) * n * 0.2, 1, n - 1)
    const bottom = order.slice(0, half)
    const top = order.slice(half)
    const gap = ws * 0.62
    const sideOf = new Map<number, number>()
    const packet = (side: number, d: number) =>
      stack(d, {
        x: side * gap,
        y: -hs * 0.05,
        r: side * 8,
        // a metade de cima fica mais alta para não cruzar a outra
        z: side < 0 ? 52 : 40,
      })
    top.forEach((c, d) => {
      sideOf.set(c, -1)
      move[c].go(0.01, 0.07, packet(-1, d))
    })
    bottom.forEach((c, d) => {
      sideOf.set(c, 1)
      move[c].go(0.015, 0.07, packet(1, d))
    })

    const merged: number[] = []
    let bi = 0
    let ti = 0
    let fromBottom = rand() < 0.5
    while (merged.length < n) {
      const take = rand() < 0.3 ? 2 : 1
      for (let k = 0; k < take; k++) {
        if (fromBottom ? bi < bottom.length : ti >= top.length)
          merged.push(bottom[bi++])
        else merged.push(top[ti++])
        if (merged.length === n) break
      }
      fromBottom = !fromBottom
    }

    merged.forEach((c, m) => {
      const side = sideOf.get(c) ?? 1
      const frac = m / (n - 1)
      const drop = 0.08 + 0.13 * frac
      const from = move[c].last.v
      // o polegar dobra a carta antes de soltar
      move[c].go(drop - 0.02, drop - 0.006, {
        ...from,
        tilt: 24,
        y: from.y - 3,
      })
      move[c].go(
        drop - 0.006,
        drop + 0.012,
        {
          x: side * gap * 0.3,
          y: -m * Math.min(0.6, 12 / n) - hs * 0.02,
          z: m * ZS,
          r: side * 5,
          tilt: 0,
          s: ss,
        },
        'cubic-bezier(.5,0,.9,.6)',
      )
      ticks.push(drop + 0.012)
    })

    // ---- Bridge: as metades se juntam e o maço arqueia, depois desce em
    // cascata (de baixo para cima), carta por carta
    const archH = hs * 0.45
    merged.forEach((c, m) => {
      const side = sideOf.get(c) ?? 1
      const frac = m / (n - 1)
      const bend = Math.sin(Math.PI * (0.15 + frac * 0.7))
      // as cartas também abrem em arco a partir do pé do maço (o "bridge"
      // visto de cima), da metade de baixo para a de cima
      const arch = pivot(
        {
          x: side * gap * 0.05,
          y: -m * Math.min(0.6, 12 / n) - archH * bend - hs * 0.04,
          z: 30 + m * ZS + archH * 0.4 * bend,
          r: side * 1.5,
          tilt: 36,
          s: ss,
        },
        (frac - 0.5) * 22,
        0,
        hs / 2,
      )
      move[c].go(0.225, 0.26, arch, 'cubic-bezier(.3,.7,.4,1)')
      const land = 0.275 + 0.05 * frac
      move[c].go(land, land + 0.014, stack(m), 'cubic-bezier(.5,0,.8,.5)')
      ticks.push(land + 0.014)
    })
    order = merged

    // ---- 2. Corte: a metade de cima vai para o lado, a de baixo passa por
    // cima dela e o maço volta ao centro
    const cut = clampInt(n * (0.4 + rand() * 0.2), 1, n - 1)
    const low = order.slice(0, cut)
    const high = order.slice(cut)
    const cutX = ws * 1.08
    high.forEach((c, d) => {
      move[c].go(
        0.34,
        0.355,
        { ...stack(cut + d), x: cutX * 0.45, y: -hs * 0.06, z: 40 + d * ZS },
        'ease-in',
      )
      move[c].go(0.355, 0.375, stack(d, { x: cutX }), 'ease-out')
    })
    low.forEach((c, d) => {
      move[c].go(
        0.38,
        0.395,
        { ...stack(d), x: cutX * 0.55, y: -hs * 0.08, z: 60 + d * ZS },
        'ease-in',
      )
      move[c].go(0.395, 0.415, stack(high.length + d, { x: cutX }), 'ease-out')
    })
    ticks.push(0.375, 0.415)
    order = [...high, ...low]
    order.forEach((c, d) => move[c].go(0.42, 0.445, stack(d)))

    // ---- 3. Charlier cut (corte de uma mão): a metade de baixo cai
    // pivotando no polegar, a de cima abre para o outro lado e a de baixo
    // fecha por cima dela
    const k = clampInt(n / 2, 1, n - 1)
    const lower = order.slice(0, k)
    const upper = order.slice(k)
    const hw = ws / 2
    const hh = hs / 2
    lower.forEach((c, d) => {
      move[c].go(0.455, 0.49, pivot(stack(d), -38, -hw, hh), 'ease-out')
      move[c].go(
        0.49,
        0.51,
        { ...pivot(stack(upper.length + d), -16, -hw, hh), z: 46 + d * ZS },
        'ease-in-out',
      )
      move[c].go(
        0.51,
        0.53,
        { ...stack(upper.length + d), z: 30 + (upper.length + d) * ZS },
        'ease-out',
      )
      move[c].go(0.535, 0.56, stack(upper.length + d))
    })
    upper.forEach((c, d) => {
      move[c].go(0.49, 0.525, pivot(stack(d), 30, hw, hh), 'ease-out')
      move[c].go(0.53, 0.56, stack(d), 'ease-in-out')
    })
    ticks.push(0.49, 0.53, 0.56)
    order = [...upper, ...lower]
  }

  // ---- 4. Ribbon spread em arco ---------------------------------------
  // O maço vai para a ponta esquerda do arco e é espalhado com uma passada:
  // a carta de baixo fica no começo, a de cima vai mais longe
  const wsp = w * (n <= 5 ? 0.19 : n <= 10 ? 0.165 : n <= 16 ? 0.14 : 0.12)
  const sp = wsp / base
  const hsp = wsp * CARD_RATIO
  const R = w * 0.62
  const chordHalf = Math.min((w * 0.8 - wsp) / 2, ((n - 1) * wsp * 1.08) / 2)
  const A = Math.asin(Math.min(1, chordHalf / R))
  const arcTop = -h * 0.24 + hsp * 0.1
  const slot = (j: number, u = 1): Pose => {
    const theta = n > 1 ? -A + 2 * A * (j / (n - 1)) * u : 0
    return {
      x: R * Math.sin(theta),
      y: arcTop + R - R * Math.cos(theta),
      z: j * ZS,
      r: (theta * 180) / Math.PI,
      tilt: 0,
      s: sp,
    }
  }
  const start = slot(0, 0)
  order.forEach((c, j) => {
    move[c].go(0.57, 0.6, stackPose(j, n, w, base, { ...start, s: sp }))
    move[c].go(0.6, 0.64, slot(j, 0.33), 'ease-in')
    move[c].go(0.64, 0.68, slot(j, 0.7), 'linear')
    move[c].go(0.68, 0.715, slot(j, 1), 'ease-out')
  })
  for (let t = 0.6; t < 0.715; t += 0.014) ticks.push(t)

  // ---- 5. Turnover em onda: as perdedoras viram, uma puxando a outra; a
  // vencedora continua de costas
  const lift = Math.max(60, wsp * 0.6 + n * ZS)
  order.forEach((c, j) => {
    if (c === winner) return
    const t = 0.73 + 0.1 * (n > 1 ? j / (n - 1) : 0)
    const rest = slot(j)
    move[c].go(
      t,
      t + 0.016,
      { ...rest, z: lift, y: rest.y - hsp * 0.06 },
      'ease-out',
    )
    move[c].go(t + 0.016, t + 0.032, rest, 'ease-in')
    flip[c].go(t, t + 0.032, 180, 'ease-in-out')
    shade[c].go(0.86, 0.9, 0.55, 'ease-out')
    ticks.push(t + 0.016)
  })

  // ---- 6. Revelação: a vencedora sai do arco, cresce no centro e vira
  const j = order.indexOf(winner)
  const rest = slot(j)
  const zWin = 120
  // compensa o aumento do perspective para a carta ficar no tamanho base
  const sWin = (PERSPECTIVE - zWin) / PERSPECTIVE
  const center: Pose = { x: 0, y: h * 0.08, z: zWin, r: 0, tilt: 0, s: sWin }
  move[winner].go(
    0.86,
    0.885,
    { ...rest, y: rest.y - hsp * 0.45, z: 60 },
    'ease-out',
  )
  move[winner].go(0.885, 0.93, center, 'cubic-bezier(.2,.8,.2,1)')
  move[winner].go(
    0.93,
    0.955,
    { ...center, z: zWin + 40, s: sWin * 1.04 },
    'ease-out',
  )
  move[winner].go(0.955, 0.99, center, 'cubic-bezier(.3,1.5,.5,1)')
  flip[winner].go(0.93, 0.975, 180, 'cubic-bezier(.3,1.25,.5,1)')
  glow[winner].go(0.955, 1, 1, 'ease-out')
  ticks.push(0.93, 0.975)

  return {
    cards: Array.from({ length: n }, (_, c) => ({
      move: move[c].keyframes((p) => ({ transform: poseTransform(p) })),
      flip: flip[c].keyframes((deg) => ({ transform: `rotateY(${deg}deg)` })),
      shade: shade[c].keyframes((o) => ({ opacity: o })),
      glow: glow[c].keyframes((o) => ({ opacity: o })),
    })),
    ticks: ticks.sort((a, b) => a - b),
  }
}
