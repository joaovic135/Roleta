// Sprites das garotas-cavalo (personagens originais, estilo chibi de anime).
// Tudo vira path SVG gerado uma vez. Os quadros ficam numa folha (grade de
// quadros de F×F unidades) e cada "tinta" é UM path com aquela camada de
// todos os quadros juntos (os quadros não se sobrepõem e todos têm as
// camadas na mesma ordem). A folha vira um <symbol>; cada corredora é um
// <use> desse símbolo com as cores dela em variáveis CSS (--um-hair,
// --um-silk, --um-acc), então cinco corredoras custam poucos nós.
//
// Folha da corredora (de perfil, correndo para a direita), 4×4 quadros:
//   linha 0: corrida (4 quadros, com poeira no pé de trás)
//   linha 1: comemoração (pulinho A A B B, metade da velocidade)
//   linha 2: trote (entrar no portão, volta da vitória)
//   linha 3: posição de largada (agachada; pisca e mexe a orelha)
// Folha da idol (de frente, 2 quadros): microfone embaixo / braços em V.

export type V = [number, number]

const r1 = (n: number) => Math.round(n * 10) / 10
const pt = (p: V) => `${r1(p[0])} ${r1(p[1])}`
const plus = (a: V, b: V): V => [a[0] + b[0], a[1] + b[1]]
const mid = (a: V, b: V): V => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]

// vetor de tamanho len no ângulo deg medido a partir da vertical (para
// baixo); positivo gira para a frente (direita)
const dir = (deg: number, len: number): V => {
  const a = (deg * Math.PI) / 180
  return [Math.sin(a) * len, Math.cos(a) * len]
}

// segmento de ponta redonda (membros, mechas)
export const capsule = (a: V, b: V, r: number) => {
  const dx = b[0] - a[0]
  const dy = b[1] - a[1]
  const len = Math.hypot(dx, dy) || 1
  const n: V = [(-dy / len) * r, (dx / len) * r]
  const R = r1(r)
  return (
    `M${pt(plus(a, n))}L${pt(plus(b, n))}` +
    `A${R} ${R} 0 0 0 ${pt([b[0] - n[0], b[1] - n[1]])}` +
    `L${pt([a[0] - n[0], a[1] - n[1]])}` +
    `A${R} ${R} 0 0 0 ${pt(plus(a, n))}Z`
  )
}

export const ellipse = ([cx, cy]: V, rx: number, ry = rx) =>
  `M${r1(cx - rx)} ${r1(cy)}a${r1(rx)} ${r1(ry)} 0 1 0 ${r1(2 * rx)} 0` +
  `a${r1(rx)} ${r1(ry)} 0 1 0 ${r1(-2 * rx)} 0z`

// folha (orelha, mecha): base b1–b2, ponta tip, lados estufados
const leaf = (b1: V, tip: V, b2: V, bulge: number) => {
  const c: V = [(b1[0] + b2[0] + tip[0]) / 3, (b1[1] + b2[1] + tip[1]) / 3]
  const ctrl = (a: V, b: V): V => {
    const m = mid(a, b)
    const dx = m[0] - c[0]
    const dy = m[1] - c[1]
    const len = Math.hypot(dx, dy) || 1
    return [m[0] + (dx / len) * bulge, m[1] + (dy / len) * bulge]
  }
  return (
    `M${pt(b1)}Q${pt(ctrl(b1, tip))} ${pt(tip)}` +
    `Q${pt(ctrl(tip, b2))} ${pt(b2)}Z`
  )
}

// orelha de cavalo: folha + miolo rosa menor
const ear = (base: V, tip: V, w: number) => {
  const b1: V = [base[0] - w, base[1] + 0.4]
  const b2: V = [base[0] + w, base[1] - 0.4]
  const k = 0.55
  const inner = (p: V): V => [
    base[0] + (p[0] - base[0]) * k,
    base[1] - 0.8 + (p[1] - base[1]) * k,
  ]
  return {
    outer: leaf(b1, tip, b2, w * 0.55),
    inner: leaf(inner(b1), inner(tip), inner(b2), w * 0.3),
  }
}

// brilho de 4 pontas (estrelinha)
const twinkle = ([x, y]: V, s: number) =>
  `M${r1(x)} ${r1(y - s)}Q${r1(x)} ${r1(y)} ${r1(x + s)} ${r1(y)}` +
  `Q${r1(x)} ${r1(y)} ${r1(x)} ${r1(y + s)}Q${r1(x)} ${r1(y)} ${r1(x - s)} ${r1(y)}` +
  `Q${r1(x)} ${r1(y)} ${r1(x)} ${r1(y - s)}Z`

// ---- corredora de perfil ----

interface Pose {
  bob: number // sobe o corpo (negativo = para cima)
  lean: number // inclinação do tronco para a frente (graus)
  legN: [number, number] // perna da frente: coxa, canela (graus)
  legF: [number, number] // perna de trás
  armN: [number, number] // braço da frente: braço, antebraço
  armF: [number, number]
  hair: number // altura da ponta do rabo de cavalo
  tail: number // altura da ponta do rabo
  ear: number // orelhas para trás (negativo) ou em pé
  mouth: number // boca aberta (esforço / alegria)
  dust?: number // nuvem de poeira atrás do pé (0 = nenhuma)
  blink?: boolean
  happy?: boolean // olhos fechados de alegria (^ ^)
}

const RUN: Pose[] = [
  {
    bob: 0,
    lean: 17,
    legN: [44, 14],
    legF: [-36, -102],
    armN: [-52, 28],
    armF: [58, 142],
    hair: 4.6,
    tail: 2.4,
    ear: -1.4,
    mouth: 0.5,
    dust: 1,
  },
  {
    bob: -1.1,
    lean: 15,
    legN: [8, -14],
    legF: [64, -18],
    armN: [10, 88],
    armF: [-4, 70],
    hair: 7.4,
    tail: 4.6,
    ear: -2,
    mouth: 0.6,
    dust: 0.55,
  },
  {
    bob: 0,
    lean: 17,
    legN: [-36, -102],
    legF: [44, 14],
    armN: [58, 142],
    armF: [-52, 28],
    hair: 5.2,
    tail: 1.8,
    ear: -1.4,
    mouth: 0.5,
    dust: 1,
  },
  {
    bob: -1.1,
    lean: 15,
    legN: [64, -18],
    legF: [8, -14],
    armN: [-4, 70],
    armF: [10, 88],
    hair: 8,
    tail: 5.2,
    ear: -2,
    mouth: 0.6,
    dust: 0.55,
  },
]
const CHEER: Pose[] = [
  {
    bob: 0,
    lean: 3,
    legN: [7, 3],
    legF: [-7, -4],
    armN: [156, 170],
    armF: [-152, -166],
    hair: 9.5,
    tail: 6,
    ear: 0.8,
    mouth: 0.9,
    happy: true,
  },
  {
    bob: -3.6,
    lean: 0,
    legN: [36, -46],
    legF: [-16, -72],
    armN: [138, 152],
    armF: [-140, -152],
    hair: 6,
    tail: 3,
    ear: 1.4,
    mouth: 1,
    happy: true,
  },
]
// trote: passada curta e tronco quase reto
const TROT: Pose[] = [
  {
    bob: 0,
    lean: 7,
    legN: [26, 4],
    legF: [-18, -52],
    armN: [-30, 30],
    armF: [32, 92],
    hair: 8.6,
    tail: 5.6,
    ear: 0.2,
    mouth: 0.3,
  },
  {
    bob: -0.6,
    lean: 6,
    legN: [6, -12],
    legF: [20, -26],
    armN: [2, 64],
    armF: [-2, 56],
    hair: 9.6,
    tail: 6.4,
    ear: 0.6,
    mouth: 0.3,
  },
  {
    bob: 0,
    lean: 7,
    legN: [-18, -52],
    legF: [26, 4],
    armN: [32, 92],
    armF: [-30, 30],
    hair: 8.8,
    tail: 5.4,
    ear: 0.2,
    mouth: 0.3,
  },
  {
    bob: -0.6,
    lean: 6,
    legN: [20, -26],
    legF: [6, -12],
    armN: [-2, 56],
    armF: [2, 64],
    hair: 9.8,
    tail: 6.6,
    ear: 0.6,
    mouth: 0.3,
  },
]
// agachada no portão, pronta para sair
const READY: Pose = {
  bob: 2.2,
  lean: 30,
  legN: [52, -14],
  legF: [-22, -62],
  armN: [48, 112],
  armF: [-36, 16],
  hair: 8,
  tail: 4.2,
  ear: 0.8,
  mouth: 0.15,
}

// cada quadro devolve os paths por "tinta", já na ordem de desenho
export interface Layer {
  k: string // classe da tinta
  d: string
}

// tamanho do quadro (unidades) e deslocamento da personagem dentro dele
export const F = 48
const PAD: V = [5, 5.6]

const runnerFrame = (p: Pose, col: number, row: number): Layer[] => {
  const o = (v: V): V => [
    v[0] + col * F + PAD[0],
    v[1] + row * F + PAD[1] + p.bob,
  ]
  const H: V = o([17.6, 27.4])
  const S = plus(H, dir(180 - p.lean, 7.6))
  const C = plus(S, dir(180 - p.lean * 0.7, 8))
  const c = (dx: number, dy: number): V => [C[0] + dx, C[1] + dy]
  const h = (dx: number, dy: number): V => [H[0] + dx, H[1] + dy]
  // chão da linha (sem o pulo), para a poeira
  const ground = row * F + PAD[1] + 38.6

  const leg = (hip: V, [a, b]: [number, number]) => {
    const knee = plus(hip, dir(a, 5.3))
    const foot = plus(knee, dir(b, 5.3))
    const ankle = plus(knee, dir(b, 2.6))
    const toe = plus(foot, dir(b + 90, 1.5))
    return {
      skin: capsule(hip, knee, 1.85) + capsule(knee, foot, 1.55),
      boot: capsule(ankle, foot, 1.8) + capsule(foot, toe, 1.5),
      foot,
    }
  }
  const arm = (sh: V, [a, b]: [number, number]) => {
    const elbow = plus(sh, dir(a, 4.1))
    const hand = plus(elbow, dir(b, 3.7))
    return {
      sleeve: capsule(sh, elbow, 1.7),
      skin: capsule(elbow, hand, 1.25) + ellipse(hand, 1.5),
    }
  }
  const legN = leg(h(1, 1.3), p.legN)
  const legF = leg(h(-1, 1.3), p.legF)
  const armN = arm(plus(S, [0.5, 0.9]), p.armN)
  const armF = arm(plus(S, [-0.9, 0.4]), p.armF)
  const earF = ear(c(-3.6, -6.2), c(-5.2 + p.ear, -13.2), 1.9)
  const earN = ear(c(0.4, -7), c(-0.2 + p.ear, -14), 2.05)

  // rabo de cavalo e rabo (cauda de verdade) esvoaçando para trás
  const pony =
    `M${pt(c(-4.6, -6))}Q${pt(c(-13.6, -7.8))} ${pt(c(-17.2, p.hair))}` +
    `Q${pt(c(-11, 1.8))} ${pt(c(-6.2, 4))}Z`
  const tail =
    `M${pt(h(-2.6, -2.2))}Q${pt(h(-10, -4.4))} ${pt(h(-13.4, p.tail))}` +
    `Q${pt(h(-8, 2.8))} ${pt(h(-2.4, 1.4))}Z`
  // franja recortada por cima da testa
  const bangs =
    `M${pt(c(-4.2, -6.6))}Q${pt(c(1, -10.8))} ${pt(c(6.4, -5.4))}` +
    `Q${pt(c(8.2, -3.6))} ${pt(c(7.9, -0.6))}L${pt(c(5.7, -2.6))}` +
    `L${pt(c(4.6, 0.6))}L${pt(c(2.8, -2.8))}L${pt(c(1.2, 0.2))}` +
    `L${pt(c(-0.4, -3.2))}Q${pt(c(-3, -2.6))} ${pt(c(-4.2, -6.6))}Z`
  const skirt =
    `M${pt(h(-4.4, -1.4))}L${pt(h(3.6, -1.8))}` +
    `L${pt(h(5.4, 2.8))}Q${pt(h(0, 4.2))} ${pt(h(-5.8, 3))}Z`
  const torso = capsule(h(0, -0.6), S, 4.1)
  const bodyMid = mid(S, H)
  const head = ellipse(c(-1.4, -0.4), 8.1, 7.9)
  const face = ellipse(c(1.6, 1.1), 6.3, 6.5)

  // olho grande de anime (aberto, piscando ou ^ de alegria)
  const eye = p.happy
    ? capsule(c(2.6, 1.6), c(3.7, 0.2), 0.45) +
      capsule(c(3.7, 0.2), c(4.8, 1.6), 0.45)
    : p.blink
      ? capsule(c(2.7, 1.2), c(4.8, 1.2), 0.42)
      : ellipse(c(3.7, 0.9), 1.15, 1.8)
  const mouth = ellipse(c(6.5, 3.6), 0.55 * p.mouth + 0.2, 0.5 * p.mouth + 0.15)
  const shine = p.happy || p.blink ? '' : ellipse(c(4, 0.2), 0.5)

  // poeira de grama atrás do pé de trás (só na corrida)
  const back = p.legF[0] < p.legN[0] ? legF.foot : legN.foot
  const dust = p.dust
    ? ellipse([back[0] - 3.2, ground - 0.6], 2.4 * p.dust, 1.5 * p.dust) +
      ellipse([back[0] - 6.4, ground - 1.6], 1.7 * p.dust, 1.2 * p.dust) +
      ellipse([back[0] - 1, ground - 2.2], 1.2 * p.dust, 1 * p.dust)
    : ''

  const body: Layer[] = [
    { k: 'um-rH', d: tail + pony + earF.outer },
    { k: 'um-rP', d: earF.inner },
    { k: 'um-rS', d: armF.sleeve },
    { k: 'um-rK', d: armF.skin + legF.skin },
    { k: 'um-rB', d: legF.boot },
    {
      k: 'um-rX',
      d: armF.sleeve + armF.skin + legF.skin + legF.boot,
    },
    { k: 'um-rK', d: legN.skin },
    { k: 'um-rB', d: legN.boot },
    { k: 'um-rS', d: torso },
    {
      k: 'um-rW',
      d: skirt + `M${pt(plus(bodyMid, [-3, -1.2]))}h3.6v3.4h-3.6z`,
    },
    {
      k: 'um-rA',
      d:
        capsule(plus(S, [-2.4, 1]), h(2.8, -1.6), 0.95) +
        capsule(h(-5.4, 2.6), h(5, 2.4), 0.6),
    },
    { k: 'um-rH', d: head + earN.outer },
    { k: 'um-rK', d: face },
    {
      k: 'um-rP',
      d: earN.inner + ellipse(c(3.3, 3.7), 1.4, 0.75),
    },
    {
      k: 'um-rH',
      d: bangs + capsule(c(-3.6, -1.8), c(-2.6, 6.4), 1.2),
    },
    // brilho no cabelo (faixa clara)
    {
      k: 'um-rL',
      d: capsule(c(-6.2, -3.4), c(-2.6, -6), 0.7),
    },
    // laço / enfeite na orelha (cor de destaque)
    {
      k: 'um-rA',
      d: ellipse(c(-2.6, -6.8), 1.5, 1.1) + ellipse(c(-0.2, -7.4), 1.3, 1),
    },
    { k: 'um-rD', d: eye + mouth },
    { k: 'um-rW', d: shine },
    { k: 'um-rS', d: armN.sleeve },
    { k: 'um-rK', d: armN.skin },
  ]
  // contorno: a silhueta inteira com traço grosso, por baixo de tudo
  const outline = body
    .filter((l) => l.k !== 'um-rX' && l.k !== 'um-rL')
    .map((l) => l.d)
    .join('')
  return [{ k: 'um-rDust', d: dust }, { k: 'um-rO', d: outline }, ...body]
}

// junta as camadas de mesma posição de todos os quadros num só path
const merge = (frames: Layer[][]): Layer[] =>
  frames[0].map((l, i) => ({
    k: l.k,
    d: frames.map((f) => f[i].d).join(''),
  }))

export const RUNNER_SHEET: Layer[] = merge([
  ...RUN.map((p, i) => runnerFrame(p, i, 0)),
  runnerFrame(CHEER[0], 0, 1),
  runnerFrame(CHEER[0], 1, 1),
  runnerFrame(CHEER[1], 2, 1),
  runnerFrame(CHEER[1], 3, 1),
  ...TROT.map((p, i) => runnerFrame(p, i, 2)),
  runnerFrame(READY, 0, 3),
  runnerFrame(READY, 1, 3),
  runnerFrame({ ...READY, blink: true }, 2, 3),
  runnerFrame({ ...READY, ear: -1.6 }, 3, 3),
]).filter((l) => l.d)
export const RUNNER_VIEW = `0 0 ${4 * F} ${4 * F}`

// ---- idol de frente (palco do Winning Live, no telão) ----

export const IF = 40 // quadro da idol (unidades)
const idolFrame = (up: boolean, col: number): Layer[] => {
  const b = up ? -1.2 : 0
  const o = (x: number, y: number): V => [col * IF + 4 + x, y + b + 2.8]
  const C = o(16, 12.6)
  const c = (dx: number, dy: number): V => [C[0] + dx, C[1] + dy]
  // vestido de idol em sino, babado branco na barra
  const dress =
    `M${pt(o(12.4, 20.6))}L${pt(o(19.6, 20.6))}` +
    `L${pt(o(23.6, 30.4))}Q${pt(o(16, 32.4))} ${pt(o(8.4, 30.4))}Z`
  const frill = capsule(o(8.8, 30.2), o(23.2, 30.2), 1.2)
  const legs = up
    ? capsule(o(13.8, 30), o(13.4, 38.6), 1.5) +
      capsule(o(18.2, 30), o(21.6, 35.6), 1.5)
    : capsule(o(13.8, 30), o(13.6, 38.8), 1.5) +
      capsule(o(18.2, 30), o(18.4, 38.8), 1.5)
  const boots = up
    ? capsule(o(13.4, 36.6), o(13.2, 38.8), 1.7) +
      capsule(o(21, 34.4), o(22.6, 36), 1.7)
    : capsule(o(13.6, 36.8), o(13.4, 39), 1.7) +
      capsule(o(18.4, 36.8), o(18.8, 39), 1.7)
  const armL = up
    ? capsule(o(12.6, 21.6), o(8.4, 15.8), 1.5) + ellipse(o(7.9, 15), 1.5)
    : capsule(o(12.6, 21.6), o(10.6, 27.4), 1.5) + ellipse(o(10.4, 28.2), 1.5)
  // braço direito sempre segura o microfone (em cima: microfone para o alto)
  const armR = up
    ? capsule(o(19.4, 21.6), o(23.8, 15.4), 1.5) + ellipse(o(24.2, 14.6), 1.5)
    : capsule(o(19.4, 21.6), o(20.6, 19.6), 1.5) + ellipse(o(20.2, 18.8), 1.5)
  const mic = up
    ? capsule(o(24.2, 14.6), o(25.4, 11.2), 0.7) + ellipse(o(25.6, 10.6), 1.1)
    : capsule(o(20.2, 18.8), o(19.2, 15.6), 0.7) + ellipse(o(19, 15), 1.1)
  const earL = ear(c(-4.6, -6.4), c(-7.6, -13 + (up ? -0.6 : 0)), 2)
  const earR = ear(c(4.6, -6.4), c(7.6, -13 + (up ? -0.6 : 0)), 2)
  const hairBack =
    ellipse(c(0, -0.6), 8.2, 8) +
    `M${pt(c(-7.6, 0))}Q${pt(c(-9.6, 9))} ${pt(c(-6, 13.6))}` +
    `L${pt(c(-3.6, 4))}Z` +
    `M${pt(c(7.6, 0))}Q${pt(c(9.6, 9))} ${pt(c(6, 13.6))}L${pt(c(3.6, 4))}Z`
  const bangs =
    `M${pt(c(-7.4, -1))}Q${pt(c(-6, -9.6))} ${pt(c(0, -9.4))}` +
    `Q${pt(c(6, -9.6))} ${pt(c(7.4, -1))}L${pt(c(5.2, -3))}` +
    `L${pt(c(3.6, 0))}L${pt(c(1.6, -3.4))}L${pt(c(0, -0.2))}` +
    `L${pt(c(-1.6, -3.4))}L${pt(c(-3.6, 0))}L${pt(c(-5.2, -3))}Z`
  const body: Layer[] = [
    { k: 'um-rH', d: hairBack + earL.outer + earR.outer },
    { k: 'um-rP', d: earL.inner + earR.inner },
    { k: 'um-rK', d: legs },
    { k: 'um-rB', d: boots },
    { k: 'um-rS', d: dress },
    { k: 'um-rW', d: frill + capsule(o(14.6, 21.2), o(17.4, 21.2), 1.1) },
    { k: 'um-rA', d: capsule(o(12.8, 24.6), o(19.2, 24.6), 0.8) },
    { k: 'um-rK', d: armL + armR + ellipse(c(0, 1.2), 6.4, 6.3) },
    { k: 'um-rD', d: mic },
    {
      k: 'um-rP',
      d: ellipse(c(-3.6, 3.4), 1.3, 0.7) + ellipse(c(3.6, 3.4), 1.3, 0.7),
    },
    { k: 'um-rH', d: bangs },
    { k: 'um-rA', d: twinkle(c(5.4, -6.6), 2.2) },
    {
      k: 'um-rD',
      d:
        ellipse(c(-2.5, 1), 1.05, 1.7) +
        ellipse(c(2.5, 1), 1.05, 1.7) +
        ellipse(c(0, 4.3), up ? 0.9 : 0.6, up ? 0.8 : 0.4),
    },
    { k: 'um-rW', d: ellipse(c(-2.2, 0.3), 0.45) + ellipse(c(2.8, 0.3), 0.45) },
  ]
  const outline = body.map((l) => l.d).join('')
  return [{ k: 'um-rO', d: outline }, ...body]
}

export const IDOL_SHEET: Layer[] = merge([
  idolFrame(false, 0),
  idolFrame(true, 1),
])
export const IDOL_VIEW = `0 0 ${2 * IF} ${IF + 4}`

// ---- as cinco corredoras (nomes e cores originais) ----
export interface Runner {
  name: string
  short: string
  hair: string
  silk: string
  acc: string
}
export const RUNNERS: Runner[] = [
  {
    name: 'Morango Veloz',
    short: 'MORANGO',
    hair: '#a4553f',
    silk: '#ff6fae',
    acc: '#ffd34d',
  },
  {
    name: 'Nuvem de Algodão',
    short: 'NUVEM',
    hair: '#f3eeff',
    silk: '#b48cff',
    acc: '#7fe3c8',
  },
  {
    name: 'Menta Relâmpago',
    short: 'MENTA',
    hair: '#3a3352',
    silk: '#36cfa6',
    acc: '#ff8fc8',
  },
  {
    name: 'Pudim Dourado',
    short: 'PUDIM',
    hair: '#f2b84b',
    silk: '#ff9a52',
    acc: '#8a4630',
  },
  {
    name: 'Céu de Anis',
    short: 'ANIS',
    hair: '#6c7fd6',
    silk: '#5cc8ff',
    acc: '#ffffff',
  },
]
