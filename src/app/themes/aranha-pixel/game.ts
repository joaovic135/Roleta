// Mundo da camada de atores: tudo é função do tempo t (o mesmo relógio do
// CSS, então hora do dia e chuva batem com o resto da cena), exceto as
// reações à roleta, que guardam o instante do giro e da vitória.
//
// Quadro a quadro (15 fps, canvas de 1 pixel = 1 pixel da cena):
// 1. foscos: letreiros apagados, dirigível, metrô, pedestres, carros,
//    pombos e aranha;
// 2. tinta da hora (source-atop): pôr do sol arroxeado, noite azul-escura;
// 3. luzes (por cima da tinta): herói (com sombra mais leve, para o
//    protagonista não sumir à noite) e teia, neon, moedas, faróis, janelas
//    do trem e do ônibus, giroflex, painel de LED; halos com 'lighter';
// 4. placar de fliperama, combo, faixa de vitória e fogos (sem tinta).
//
// Agenda (s desde a montagem; o CSS usa o mesmo relógio):
// - herói (Tecelão): no desktop fica agachado num poleiro em cima dos cards
//   (borda de cima do card, como se pisasse na interface) e a cada 42 s
//   pula, balança na teia com mortal no meio e cai no outro poleiro
//   (+250 pontos); a cada 5 travessias há 3 moedas no caminho (+500 cada).
//   Em telas estreitas ele atravessa o topo de ponta a ponta;
// - metrô a cada 50 s, perseguição policial a cada 66 s, aranha a cada
//   31 s, pombos de cada telhado revoam em 34–61 s, dirigível a cada 230 s;
//   letreiros de neon acendem ao anoitecer (com zumbido de vez em quando);
// - girar: herói balança de um poleiro ao outro sem parar, pombos assustam,
//   combo sobe, painel do dirigível muda (e o CSS acende os holofotes);
//   vencer: faixa FASE CONCLUÍDA!, fogos na cor da fatia (7 rajadas em
//   ~4 s), bônus no placar, herói de punho erguido e depois calmaria.
import { type WheelPhase, wheelPhase } from '../_kit/wheel'
import { CITY, H, VIA_Y, W } from './city'
import {
  Sprite,
  digitsOf,
  drawNumber,
  drawText,
  fontAtlas,
  halo,
  textWidth,
  tint,
} from './pixels'
import {
  BLIMP,
  CarKind,
  HERO_ANGLES,
  NECK,
  NECK_PERCH,
  NECK_WIN,
  SIREN,
  buildBlimp,
  buildBus,
  buildCar,
  buildCoin,
  buildDog,
  buildHero,
  buildLights,
  buildMoto,
  buildNeon,
  buildPeople,
  buildPigeons,
  buildSpider,
  buildTrain,
  buildUmbrellas,
  ledStrip,
} from './sprites'

// ---------------------------------------------------------------- relógio
// iguais a theme.css: --cycle 240s com --t0 = -30% e --weather 420s/-64s
const CYCLE = 240
const T0 = 72
const WEATHER = 420
const W0 = 64

const frac = (x: number) => x - Math.floor(x)
const mod = (x: number, m: number) => x - Math.floor(x / m) * m
const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x)
const hash = (n: number) => frac(Math.sin(n * 127.1 + 311.7) * 43758.5453)
const ease = (x: number) => x * x * (3 - 2 * x)

// curva por pontos [posição, valor, ...] (as mesmas dos @keyframes)
const curve = (keys: number[]) => (p: number) => {
  for (let i = 2; i < keys.length; i += 2)
    if (p <= keys[i]) {
      const p0 = keys[i - 2]
      const v0 = keys[i - 1]
      return keys[i] === p0
        ? keys[i + 1]
        : v0 + ((keys[i + 1] - v0) * (p - p0)) / (keys[i] - p0)
    }
  return keys[keys.length - 1]
}
const DAWN = curve([0, 0, 0.06, 1, 0.19, 1, 0.195, 0, 1, 0])
const DAY = curve([0, 0, 0.1, 0, 0.18, 1, 0.42, 1, 0.5, 0, 1, 0])
const SUNSET = curve([0, 0, 0.19, 0, 0.195, 1, 0.56, 1, 0.64, 0, 1, 0])
const LIGHTS = curve([
  0, 0.9, 0.06, 0.5, 0.12, 0, 0.46, 0, 0.54, 0.55, 0.62, 1, 0.96, 1, 1, 0.9,
])
const RAIN = curve([0, 0, 0.3, 0, 0.33, 1, 0.54, 1, 0.57, 0, 1, 0])

// tinta de cada instante do ciclo, calculada uma vez (nada é alocado no
// quadro): pôr do sol roxo, madrugada lilás, noite quase silhueta
const TINT_STEPS = 480
const TINT = Array.from({ length: TINT_STEPS }, (_, i) => {
  const c = i / TINT_STEPS
  const d = DAY(c)
  const s = SUNSET(c) * (1 - d)
  const a = DAWN(c) * (1 - SUNSET(c)) * (1 - d)
  const n = Math.max(0, 1 - d - s - a)
  const tones = [
    [s, 0.48, 40, 14, 58],
    [a, 0.4, 44, 34, 84],
    [n, 0.64, 7, 6, 24],
  ]
  let al = 0
  let r = 0
  let g = 0
  let b = 0
  for (const [k, ta, tr, tg, tb] of tones) {
    al += k * ta
    r += k * ta * tr
    g += k * ta * tg
    b += k * ta * tb
  }
  const q = al || 1
  return {
    a: al,
    style: `rgb(${Math.round(r / q)},${Math.round(g / q)},${Math.round(b / q)})`,
  }
})

// ---------------------------------------------------------------- layout
export type Layout = {
  w: number
  h: number
  // linha 0 da cidade no canvas (a cidade fica presa ao chão)
  oy: number
  // faixa visível (o canvas é mais largo que a tela quando ela é alta)
  vx0: number
  vx1: number
  // linhas livres no topo, até o primeiro card
  band: number
  // trecho livre do cabeçalho, entre o título e o volume
  fx0: number
  fx1: number
  hud: boolean
  // cards em pixels do canvas: [x0, y0, x1, y1, ...]
  cards: number[]
}

// lê a página (só ao redimensionar e a cada poucos segundos)
export const measure = (c: HTMLCanvasElement, w: number, h: number): Layout => {
  const r = c.getBoundingClientRect()
  const sx = w / Math.max(1, r.width)
  const sy = h / Math.max(1, r.height)
  const X = (v: number) => (v - r.left) * sx
  const Y = (v: number) => (v + window.scrollY - r.top) * sy
  const vx0 = Math.max(0, X(0))
  const vx1 = Math.min(w, X(window.innerWidth))
  const cards: number[] = []
  let top = Infinity
  document.querySelectorAll('main .ui-card').forEach((el) => {
    const b = el.getBoundingClientRect()
    if (b.width < 2 || b.height < 2) return
    cards.push(X(b.left), Y(b.top), X(b.right), Y(b.bottom))
    top = Math.min(top, Y(b.top))
  })
  const band = Math.floor(Number.isFinite(top) ? top : h * 0.09)
  const title = document.querySelector('main .ui-subtitle')
  const chip = document.querySelector('main .ui-chip')
  let fx0 = vx0 + 4
  let fx1 = vx1 - 4
  if (title) {
    const b = title.getBoundingClientRect()
    if (Y(b.top) < band) fx0 = Math.max(fx0, X(b.right) + 10)
  }
  if (chip) {
    const b = chip.getBoundingClientRect()
    if (Y(b.top) < band && X(b.left) > fx0) fx1 = Math.min(fx1, X(b.left) - 10)
  }
  return {
    w,
    h,
    oy: h - H,
    vx0,
    vx1,
    band,
    fx0,
    fx1,
    hud: fx1 - fx0 >= 110 && band >= 13,
    cards,
  }
}

// ---------------------------------------------------------------- agenda
const RUN_P = 42
const RUN_0 = 8
const SWING_T = 0.66
const FLY_T = 0.3
const TRAIN_P = 50
const TRAIN_0 = 14
const TRAIN_V = 84
const CHASE_P = 66
const CHASE_0 = 26
const BLIMP_P = 230
const BLIMP_0 = -6
const SPIDER_P = 31
const SPIDER_0 = 3

// trânsito: duas faixas, velocidade única por faixa (ninguém se atravessa)
const LOOP = W + 110
type Car = { kind: CarKind | 'bus' | 'moto'; x0: number }
const LANE_R: Car[] = [
  { kind: 'red', x0: 0 },
  { kind: 'moto', x0: 150 },
  { kind: 'blue', x0: 300 },
  { kind: 'taxi', x0: 520 },
  { kind: 'white', x0: 700 },
]
const LANE_L: Car[] = [
  { kind: 'bus', x0: 60 },
  { kind: 'green', x0: 330 },
  { kind: 'taxi', x0: 520 },
  { kind: 'orange', x0: 730 },
]
const V_R = 40
const V_L = 33

// pedestres na calçada (tipo, sentido, velocidade, posição, cor do
// guarda-chuva e quanto de chuva cada um aguenta antes de abrir)
const PEDS = [
  [0, 1, 9, 40, 0, 0.15],
  [1, -1, 8, 170, 1, 0.3],
  [2, 1, 7, 330, 2, 0.45],
  [3, -1, 6, 470, 3, 0.25],
  [4, 1, 8, 600, 4, 0.6],
  [5, -1, 10, 720, 5, 0.35],
  [6, 1, 8, 250, 0, 0.5],
  [2, -1, 9, 60, 3, 0.2],
] as const
const PED_LOOP = W + 50

// fogos: direções fixas das faíscas (sem alocar nada no quadro)
const SPARKS = 48
const SPARK_COS = new Float32Array(SPARKS)
const SPARK_SIN = new Float32Array(SPARKS)
const SPARK_SPD = new Float32Array(SPARKS)
for (let i = 0; i < SPARKS; i++) {
  const a = (i / SPARKS) * Math.PI * 2 + hash(i) * 0.12
  SPARK_COS[i] = Math.cos(a)
  SPARK_SIN[i] = Math.sin(a)
  SPARK_SPD[i] = 0.72 + hash(i + 50) * 0.28
}
const BURSTS = 7
const BURST_AT = [0.15, 0.55, 1.05, 1.6, 2.2, 2.9, 3.7]

const TEXT = {
  idle: 'GIRE A ROLETA!  *  PIZZA DO TONINHO: 2 POR 1  *  SORTE GRANDE HOJE  *  ',
  spin: 'GIRANDO...  BOA SORTE!  *  ',
}

export type Game = ReturnType<typeof createGame>

export const createGame = () => {
  // ---- sprites (feitos uma vez)
  const hero = buildHero()
  const pigeons = buildPigeons()
  const people = buildPeople()
  const umbrellas = buildUmbrellas()
  const dog = buildDog()
  const spider = buildSpider()
  const train = buildTrain()
  const blimp = buildBlimp()
  const lights = buildLights()
  const coin = buildCoin()
  const neon = [
    buildNeon('HOTEL', '#ff4fa8', true),
    buildNeon('24H', '#5ff2ff', false),
  ]
  // onde cada letreiro ficou (x, y da placa; -1 = não coube na tela)
  const signX = new Float32Array(2).fill(-1)
  const signY = new Float32Array(2)
  const cars = {
    red: buildCar('red'),
    blue: buildCar('blue'),
    white: buildCar('white'),
    green: buildCar('green'),
    orange: buildCar('orange'),
    purple: buildCar('purple'),
    taxi: buildCar('taxi'),
    police: buildCar('police'),
    bus: buildBus(),
    moto: buildMoto(),
  } as Record<string, ReturnType<typeof buildCar>>
  const font = {
    white: fontAtlas('#ffffff'),
    yellow: fontAtlas('#fcd25d'),
    red: fontAtlas('#ff5a3c'),
    cyan: fontAtlas('#7cc4ff'),
  }
  const strips = {
    idle: ledStrip(TEXT.idle, '#ffb43c'),
    spin: ledStrip(TEXT.spin, '#7cffb0'),
    won: ledStrip(TEXT.spin, '#ffb43c'),
  }

  // ---- estado
  let L: Layout | null = null
  let lastPhase: WheelPhase = 'idle'
  let spinAt = -1e9
  let spinEnd = -1e9
  let runAt = -1e9
  let runDir = 1
  let winAt = -1e9
  let winCombo = 0
  let bonus = 0
  let shown = -1
  let winFont = font.yellow
  let winHalo: Sprite = lights.white
  let winColor = '#fcd25d'
  let winLight = '#fff1c0'
  // fogos: x, y de cada rajada (escolhidos na vitória)
  const burstX = new Float32Array(BURSTS)
  const burstY = new Float32Array(BURSTS)
  const burstRise = new Float32Array(BURSTS)
  // pombos: bandos escolhidos nos telhados visíveis
  type Flock = { x: number; y: number; n: number; gap: number; face: number }
  let flocks: Flock[] = []
  // herói: geometria do balanço (depende da faixa livre no topo)
  const G = {
    L: 30,
    ay: -11,
    phi: 0.95,
    sin: 0.8,
    cos: 0.6,
    arc: 48,
    hop: 63,
    n: 12,
  }
  // poleiros em cima dos cards (telas largas): A à esquerda, B à direita
  // do trecho livre do cabeçalho; ele pula de um para o outro balançando
  const P = {
    ok: false,
    xa: 0,
    xb: 0,
    yp: 0,
    n: 4,
    hop: 54,
    arc: 41,
    L: 30,
    ay: -13,
    low: 15,
    phi: 0.75,
    yr: 7,
  }
  // pose do quadro: x, y = mão (balanço), centro (mortal) ou pés (parado)
  type Mode = 'swing' | 'tuck' | 'perch' | 'win'
  const HERO = {
    on: false,
    mode: 'perch' as Mode,
    x: 0,
    y: 0,
    ai: 4,
    q: 0,
    ax: 0,
    ay: 0,
    dir: 1,
    web: false,
  }
  // máquina de estados ao vivo (o giro muda o roteiro); nas capturas
  // congeladas vale só a agenda
  const HS = { init: false, running: false, side: 0, from: 0, at: -1e9, k: -99 }

  const free = (x: number, y: number, m = 3) => {
    if (!L || x < L.vx0 + m || x > L.vx1 - m || y < 0 || y > L.h) return false
    const c = L.cards
    for (let i = 0; i < c.length; i += 4)
      if (
        x > c[i] - m &&
        x < c[i + 2] + m &&
        y > c[i + 1] - m &&
        y < c[i + 3] + m
      )
        return false
    return true
  }

  const resize = (lay: Layout) => {
    L = lay
    // pêndulo: a mão desce até perto do fim da faixa livre
    // (o corpo pende 19 linhas abaixo da mão; o pé pode sumir atrás do card
    // no fundo do arco, mas os pontos de soltura ficam dentro da tela)
    const len = Math.max(22, Math.min(44, Math.round(lay.band * 0.95)))
    const low = Math.max(9, Math.min(30, lay.band - 13))
    const phi = 0.95
    G.L = len
    G.ay = low - len
    G.phi = phi
    G.sin = Math.sin(phi)
    G.cos = Math.cos(phi)
    G.arc = 2 * len * G.sin
    G.hop = G.arc + Math.round(len * 0.5)
    G.n = Math.ceil((lay.vx1 - lay.vx0 + 80) / G.hop) + 1
    // poleiros: os pés ficam na borda de cima dos cards
    P.ok = lay.hud && lay.fx1 - lay.fx0 >= 150
    if (P.ok) {
      P.xa = Math.round(lay.fx0 + 26)
      P.xb = Math.round(lay.fx1 - 34)
      P.yp = lay.band
      P.L = Math.max(22, Math.min(44, Math.round(lay.band * 0.95)))
      P.low = Math.max(8, lay.band - 17)
      P.ay = P.low - P.L
      const maxHop = (2 * P.L * Math.sin(0.8)) / 0.76
      P.n = Math.max(2, Math.ceil((P.xb - P.xa) / maxHop))
      P.hop = (P.xb - P.xa) / P.n
      P.phi = Math.asin((P.hop * 0.76) / (2 * P.L))
      P.arc = 2 * P.L * Math.sin(P.phi)
      P.yr = P.ay + P.L * Math.cos(P.phi)
    }
    HS.init = false
    // pombos: telhados, caixas d'água e braços de poste que dá para ver
    const spots: Flock[] = []
    const consider = (x: number, y: number, room: number, face: number) => {
      const cy = y + lay.oy
      if (room < 6) return
      if (!free(x, cy - 4, 2) || !free(x + room, cy - 4, 2)) return
      if (spots.some((s) => Math.abs(s.x - x) < 24 && Math.abs(s.y - cy) < 20))
        return
      const n = Math.max(2, Math.min(5, Math.floor(room / 6)))
      spots.push({ x, y: cy, n, gap: room / n, face })
    }
    CITY.tanks.forEach(([tx, ty], i) => consider(tx, ty, 6, i % 2))
    CITY.roofs.forEach(([rx, rw, rt], i) => consider(rx + 2, rt, rw - 5, i % 2))
    CITY.lamps.forEach((lx, i) => consider(lx, 131, 6, i % 2))
    flocks = spots.slice(0, 5)
    // letreiros: HOTEL na quina de um prédio da esquerda, 24H em cima de
    // um telhado da direita (só se a tela mostrar o lugar)
    signX[0] = signX[1] = -1
    for (const [rx, rw, rt] of CITY.roofs) {
      const top = rt + lay.oy
      const sx = rx + rw - 6
      if (
        signX[0] < 0 &&
        sx > lay.vx0 + 14 &&
        sx < lay.vx0 + 130 &&
        rt < 100 &&
        free(sx, top + 8, 2) &&
        free(sx + 9, top + 52, 2)
      ) {
        signX[0] = sx
        signY[0] = top + 7
      }
      if (
        rx > lay.vx1 - 110 &&
        rx + 24 < lay.vx1 - 6 &&
        rw >= 22 &&
        free(rx + 2, top - 14, 2) &&
        free(rx + 24, top - 2, 2)
      ) {
        signX[1] = rx + Math.floor((rw - 21) / 2)
        signY[1] = top - 13
      }
    }
  }

  // quadro pré-girado mais perto do ângulo da teia (o corpo gira -al)
  const frameFor = (al: number) => {
    let best = 0
    for (let i = 1; i < HERO_ANGLES.length; i++)
      if (Math.abs(HERO_ANGLES[i] + al) < Math.abs(HERO_ANGLES[best] + al))
        best = i
    return best
  }

  // ---- herói: posição no instante tau de uma travessia
  const heroAt = (tau: number, dir: number, x0: number) => {
    const step = SWING_T + FLY_T
    const k = Math.floor(tau / step)
    const u = tau - k * step
    const cx = x0 + k * G.hop
    const ax = cx + G.L * G.sin
    let x: number
    let y: number
    if (u < SWING_T) {
      const s = u / SWING_T
      // rápido no fundo do arco, ainda com impulso nas pontas
      const al = (G.phi * Math.sin((s - 0.5) * 2.2)) / Math.sin(1.1)
      x = ax + G.L * Math.sin(al)
      y = G.ay + G.L * Math.cos(al)
      // o corpo pende ao longo da teia
      const best = frameFor(al)
      HERO.ai = best
      HERO.mode = 'swing'
      HERO.web = true
    } else {
      const f = (u - SWING_T) / FLY_T
      const rx = cx + G.arc
      x = rx + (x0 + (k + 1) * G.hop - rx) * f
      y = G.ay + G.L * G.cos - 7 * 4 * f * (1 - f)
      HERO.web = false
      HERO.mode = k % 2 ? 'tuck' : 'swing'
      HERO.ai = frameFor(G.phi)
      HERO.q = Math.min(3, Math.floor(f * 4))
      if (HERO.mode === 'tuck') {
        x -= 2
        y += 8
      }
    }
    // espelha a travessia para a esquerda
    HERO.ax = dir > 0 ? ax : L!.vx0 + L!.vx1 - ax
    HERO.x = dir > 0 ? x : L!.vx0 + L!.vx1 - x
    HERO.y = y
    HERO.ay = G.ay
    HERO.dir = dir
  }
  const runLen = (fast: number) => G.n * (SWING_T + FLY_T) * fast

  // corrida entre poleiros: pulo, n balanços com mortal no meio e queda
  // girando até o outro poleiro (calculada de A para B; de B, espelha)
  const LEAP_T = 0.4
  const DROP_T = 0.55
  const perchLen = () =>
    LEAP_T + (P.n - 1) * (SWING_T + FLY_T) + SWING_T + DROP_T
  const perchRunAt = (tau: number, from: number) => {
    const step = SWING_T + FLY_T
    let x: number
    let y: number
    let ax = P.xa + P.arc / 2
    HERO.web = false
    HERO.mode = 'swing'
    if (tau < LEAP_T) {
      // pulo: a mão sobe do poleiro até onde agarra a primeira teia
      const f = tau / LEAP_T
      const y0 = P.yp - 11
      x = P.xa + f
      y = y0 + (P.yr - y0) * ease(f)
      HERO.ai = frameFor(-P.phi)
      HERO.web = f > 0.55
    } else {
      const u0 = tau - LEAP_T
      const j = Math.min(P.n - 1, Math.floor(u0 / step))
      const u = u0 - j * step
      const cx = P.xa + j * P.hop
      ax = cx + P.arc / 2
      if (u < SWING_T) {
        const s = u / SWING_T
        const al = (P.phi * Math.sin((s - 0.5) * 2.2)) / Math.sin(1.1)
        x = ax + P.L * Math.sin(al)
        y = P.ay + P.L * Math.cos(al)
        HERO.ai = frameFor(al)
        HERO.web = true
      } else if (j < P.n - 1) {
        const f = (u - SWING_T) / FLY_T
        const rx = cx + P.arc
        x = rx + (cx + P.hop - rx) * f
        y = P.yr - 6 * 4 * f * (1 - f)
        HERO.ai = frameFor(P.phi)
        if (j % 2) {
          HERO.mode = 'tuck'
          HERO.q = Math.min(3, Math.floor(f * 4))
          x -= 2
          y += 8
        }
      } else {
        // última: solta e cai girando no poleiro do outro lado
        const f = clamp01((u - SWING_T) / DROP_T)
        const rx = cx + P.arc
        const y0 = P.yr + 8
        const y1 = P.yp - 6
        x = rx + (P.xb - rx) * f
        y = y0 + (y1 - y0) * f - 8 * 4 * f * (1 - f)
        HERO.mode = 'tuck'
        HERO.q = Math.floor(f * 5) % 4
      }
    }
    const m = P.xa + P.xb
    HERO.x = from ? m - x : x
    HERO.ax = from ? m - ax : ax
    HERO.y = y
    HERO.ay = P.ay
    HERO.dir = from ? -1 : 1
  }
  // parado no poleiro: agachado olhando a roleta, às vezes olha para fora;
  // na vitória fica de pé com o punho erguido
  const perchAt = (side: number, t: number, ph: WheelPhase) => {
    HERO.mode = ph === 'won' && t - winAt < 7.5 ? 'win' : 'perch'
    HERO.x = side ? P.xb : P.xa
    HERO.y = P.yp
    HERO.web = false
    const away = hash(Math.floor(t / 5) + side * 3) > 0.72
    HERO.dir = (side ? -1 : 1) * (away && HERO.mode === 'perch' ? -1 : 1)
  }
  const heroUpdate = (t: number, dt: number, ph: WheelPhase) => {
    const len = perchLen()
    const k = Math.floor((t - RUN_0) / RUN_P)
    const rt0 = RUN_0 + k * RUN_P
    if (dt === 0) {
      HS.init = false
      if (k >= 0 && t - rt0 < len) perchRunAt(t - rt0, k % 2)
      else perchAt(k >= 0 ? (k % 2 ? 0 : 1) : 0, t, ph)
      return
    }
    if (!HS.init) {
      HS.init = true
      HS.k = k
      HS.running = k >= 0 && t - rt0 < len
      HS.at = rt0
      HS.from = k % 2
      HS.side = k >= 0 ? (k % 2 ? 0 : 1) : 0
    }
    if (HS.running && t - HS.at >= len) {
      HS.running = false
      HS.side = 1 - HS.from
    }
    // nova corrida: na hora marcada ou, girando, uma atrás da outra
    if (!HS.running && (ph === 'spinning' || k > HS.k)) {
      HS.running = true
      HS.at = t
      HS.from = HS.side
    }
    HS.k = Math.max(HS.k, k)
    if (HS.running) perchRunAt(t - HS.at, HS.from)
    else perchAt(HS.side, t, ph)
  }

  // bônus: a cada 5 travessias, 3 moedas no caminho do herói, nos fundos
  // dos arcos mais perto do meio do cabeçalho (ele pega uma por balanço)
  const COIN = { x: 0, y: 0, at: 0 }
  const bottomX = (j: number, dir: number) => {
    const bx = L!.vx0 - 40 + j * G.hop + G.L * G.sin
    return dir > 0 ? bx : L!.vx0 + L!.vx1 - bx
  }
  // devolve false se a corrida não tem a moeda i (poucos balanços)
  const coinSpot = (c: number, i: number) => {
    const step = SWING_T + FLY_T
    if (P.ok) {
      if (i >= P.n) return false
      const j = Math.max(0, Math.floor((P.n - 3) / 2)) + i
      const bx = P.xa + j * P.hop + P.arc / 2
      const from = c % 2
      COIN.x = Math.round(from ? P.xa + P.xb - bx + 4 : bx - 4)
      COIN.y = P.low + 9
      COIN.at = LEAP_T + j * step + SWING_T / 2
      return true
    }
    const dir = c % 2 ? -1 : 1
    const mid = (L!.fx0 + L!.fx1) / 2
    let jm = 1
    for (let j = 2; j < G.n - 1; j++)
      if (Math.abs(bottomX(j, dir) - mid) < Math.abs(bottomX(jm, dir) - mid))
        jm = j
    const j = jm - 1 + i
    COIN.x = Math.round(bottomX(j, dir) - dir * 4)
    COIN.y = G.ay + G.L + 9
    COIN.at = j * step + SWING_T / 2
    return true
  }
  // moedas já pegas até t (a corrida c tem moedas se c % 5 === 2)
  const coinsTaken = (t: number, k: number) => {
    const per = P.ok ? Math.min(3, P.n) : 3
    let n = k >= 3 ? (Math.floor((k - 3) / 5) + 1) * per : 0
    if (k >= 0 && k % 5 === 2)
      for (let i = 0; i < 3; i++)
        if (coinSpot(k, i) && t - (RUN_0 + k * RUN_P) >= COIN.at) n++
    return n
  }

  // ---- desenho
  const put = (
    ctx: CanvasRenderingContext2D,
    s: Sprite,
    x: number,
    y: number,
  ) => ctx.drawImage(s.c, Math.round(x - s.px), Math.round(y - s.py))

  const webLine = (
    ctx: CanvasRenderingContext2D,
    x0: number,
    y0: number,
    x1: number,
    y1: number,
  ) => {
    // Bresenham da mão até a borda de cima
    let x = Math.round(x0)
    let y = Math.round(y0)
    const tx = Math.round(x1)
    const ty = Math.round(y1)
    const dx = Math.abs(tx - x)
    const dy = -Math.abs(ty - y)
    const sx = x < tx ? 1 : -1
    const sy = y < ty ? 1 : -1
    let err = dx + dy
    for (let i = 0; i < 160 && y >= 0; i++) {
      ctx.fillRect(x, y, 1, 1)
      if (x === tx && y === ty) break
      const e2 = 2 * err
      if (e2 >= dy) {
        err += dy
        x += sx
      }
      if (e2 <= dx) {
        err += dx
        y += sy
      }
    }
  }

  const onPhase = (ph: WheelPhase, t: number) => {
    if (ph === 'spinning' && lastPhase !== 'spinning') {
      spinAt = t
      spinEnd = 1e9
      // o herói entra balançando se não houver travessia no ar
      const k = Math.floor((t - RUN_0) / RUN_P)
      const busy =
        P.ok ||
        (k >= 0 && t - (RUN_0 + k * RUN_P) < runLen(1)) ||
        t - runAt < runLen(0.85)
      if (!busy) {
        runAt = t
        runDir = -runDir
      }
    }
    if (ph !== 'spinning' && lastPhase === 'spinning') spinEnd = t
    if (ph === 'won' && lastPhase !== 'won') {
      winAt = t
      winCombo = combo(t)
      bonus += 1000 + winCombo * 100
      const v = document.documentElement.style
        .getPropertyValue('--win-color')
        .trim()
      winColor = /^#[0-9a-f]{3,6}$/i.test(v) ? v : '#fcd25d'
      winLight = tint(winColor, 0.55)
      winFont = fontAtlas(tint(winColor, 0.25))
      winHalo = halo(16, winColor, 0.75)
      strips.won = ledStrip(
        'TEMOS UM VENCEDOR!  *  PARABÉNS!  *  ',
        tint(winColor, 0.35),
      )
      // rajadas: dos lados da faixa, nas margens e nos cantos do topo
      const lay = L
      if (lay) {
        const cx = (lay.fx0 + lay.fx1) / 2
        const big = lay.fx1 - lay.fx0 >= 230 ? 2 : 1
        const half = (textWidth(15, big) + 14 * big) / 2
        const top = Math.max(10, lay.band * 0.5)
        const cand = [
          cx - half - 150,
          top,
          cx + half + 44,
          top + 2,
          lay.vx0 + 30,
          lay.band + 48,
          lay.vx1 - 30,
          lay.band + 44,
          lay.vx0 + 34,
          lay.band + 130,
          lay.vx1 - 34,
          lay.band + 126,
        ]
        let n = 0
        for (let i = 0; i < cand.length && n < BURSTS; i += 2) {
          const x = cand[i]
          const y = cand[i + 1]
          // no cabeçalho só entre o título e o volume; fora dele, longe
          // dos cards
          const ok =
            y < lay.band ? x > lay.fx0 + 10 && x < lay.fx1 - 10 : free(x, y, 6)
          if (!ok) continue
          burstX[n] = x
          burstY[n] = y
          burstRise[n] = 34 + hash(n + t) * 24
          n++
        }
        // sem margens (telas estreitas): repete à direita da faixa
        const right = Math.min(lay.fx1 - 12, cx + half + 30)
        for (let i = 0; n < BURSTS; n++, i++) {
          burstX[n] = right - (i % 2) * 14 + hash(n * 3 + t) * 8
          burstY[n] = Math.max(8, lay.band * (0.35 + hash(n + 9) * 0.3))
          burstRise[n] = 30
        }
      }
    }
  }

  // combo: sobe rápido no começo do giro e desacelera com a roda
  const combo = (t: number) => {
    if (spinAt < -1e8) return 0
    const tau = Math.min(t, spinEnd) - spinAt
    return Math.max(0, Math.floor(64 * (1 - Math.exp(-tau / 3.2))))
  }

  const draw = (ctx: CanvasRenderingContext2D, ms: number, dt: number) => {
    if (!L) return
    const lay = L
    const t = ms / 1000
    const ph = wheelPhase()
    if (ph !== lastPhase) {
      onPhase(ph, t)
      lastPhase = ph
    }
    const oy = lay.oy
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.imageSmoothingEnabled = false
    ctx.globalCompositeOperation = 'source-over'
    ctx.globalAlpha = 1
    ctx.clearRect(0, 0, lay.w, lay.h)

    const cyc = frac((t + T0) / CYCLE)
    const lit = LIGHTS(cyc)
    const rain = RAIN(frac((t + W0) / WEATHER))

    // ---------------------------------------------- 1. foscos
    // placas dos letreiros (apagadas; a noite acende por cima)
    for (let i = 0; i < 2; i++) {
      if (signX[i] < 0) continue
      put(ctx, neon[i].off, signX[i], signY[i])
      if (i === 1) {
        ctx.fillStyle = '#0a0612'
        ctx.fillRect(signX[i] + 3, signY[i] + 11, 1, 2)
        ctx.fillRect(signX[i] + 17, signY[i] + 11, 1, 2)
      }
    }
    // dirigível (bem devagar, de leste para oeste)
    const bt = mod(t - BLIMP_0, BLIMP_P)
    const blimpOn = bt < 180
    const bx = W + 12 - bt * 4.8
    const by =
      Math.max(lay.band > 30 ? 12 : 9, lay.band - 22) +
      Math.round(Math.sin(t * 0.55))
    if (blimpOn) put(ctx, blimp.body, bx, by)

    // metrô elevado
    const tt = t - TRAIN_0
    const tk = Math.floor(tt / TRAIN_P)
    const ttau = tt - tk * TRAIN_P
    const tdir = tk % 2 ? -1 : 1
    const trainOn = ttau * TRAIN_V < W + train.w + 40
    const trx =
      tdir > 0 ? -train.w - 20 + ttau * TRAIN_V : W + 20 - ttau * TRAIN_V
    const trainY = oy + VIA_Y
    if (trainOn) put(ctx, train.body[tdir > 0 ? 0 : 1], trx, trainY)

    // pedestres (abrem o guarda-chuva quando a chuva passa do limite deles)
    const ground = oy + 147
    for (let i = 0; i < PEDS.length; i++) {
      const [p, dir, v, x0, u, th] = PEDS[i]
      const run = x0 + v * t
      const x = dir > 0 ? mod(run, PED_LOOP) - 25 : W + 25 - mod(run, PED_LOOP)
      if (x < lay.vx0 - 12 || x > lay.vx1 + 12) continue
      const f = Math.floor(run / 3) % 2
      const side = dir > 0 ? 0 : 1
      const wet = rain > th
      const who = people[p]
      put(ctx, (wet ? who.umb : who.walk)[f][side], x, ground)
      if (wet) put(ctx, umbrellas[u][side], x + (dir > 0 ? 1 : -2), ground - 14)
      if (i === 4 && !wet) put(ctx, dog[f][side], x + dir * 7, ground)
    }

    // carros: faixa de cima vai para a esquerda, a de baixo para a direita
    for (let i = 0; i < LANE_L.length; i++) {
      const c = cars[LANE_L[i].kind]
      const x = W + 55 - mod(LANE_L[i].x0 + V_L * t, LOOP) - c.body[1].w
      if (x > lay.vx1 + 2 || x + c.body[1].w < lay.vx0 - 2) continue
      put(ctx, c.body[1], x, oy + 153)
    }
    for (let i = 0; i < LANE_R.length; i++) {
      const c = cars[LANE_R[i].kind]
      const x = mod(LANE_R[i].x0 + V_R * t, LOOP) - 55
      if (x > lay.vx1 + 2 || x + c.body[0].w < lay.vx0 - 2) continue
      put(ctx, c.body[0], x, oy + 159)
    }
    // perseguição: carro roxo em fuga e a viatura logo atrás
    const ct = mod(t - CHASE_0, CHASE_P)
    const chaseOn = ct < 9
    const gx = -40 + ct * 118
    if (chaseOn) {
      put(ctx, cars.purple.body[0], gx, oy + 160)
      put(ctx, cars.police.body[0], gx - 38, oy + 160)
    }

    // pombos: pousados bicando, revoada e volta; o giro assusta todos
    for (let fi = 0; fi < flocks.length; fi++) {
      const fl = flocks[fi]
      const per = 34 + fi * 9
      const off = fi * 11
      const tau = mod(t + off, per)
      const cycle = Math.floor((t + off) / per)
      let away = -1
      if (tau >= per - 14 && tau < per - 10) away = (tau - (per - 14)) / 4
      else if (tau >= per - 10 && tau < per - 4) away = 2
      else if (tau >= per - 4) away = 1 - (tau - (per - 4)) / 4
      // susto do giro (só se estavam pousados naquele instante)
      const st = t - spinAt
      if (
        away < 0 &&
        st >= 0 &&
        Math.floor((spinAt + off) / per) === cycle &&
        mod(spinAt + off, per) < per - 14
      )
        away = st < 3.6 ? st / 3.6 : 2
      for (let j = 0; j < fl.n; j++) {
        const bx0 = fl.x + j * fl.gap + (hash(fi * 7 + j) - 0.5) * 2
        const face = (fl.face + j) % 2
        if (away < 0) {
          const peck = Math.floor(t * 1.7 + hash(j + fi) * 5) % 5 === 0
          put(ctx, pigeons[peck ? 1 : 0][face], bx0, fl.y)
          continue
        }
        if (away > 1.5) continue
        const e = clamp01((away * 4 - j * 0.15) / 3.6)
        if (e <= 0) {
          put(ctx, pigeons[0][face], bx0, fl.y)
          continue
        }
        const fdir = fl.x < (lay.vx0 + lay.vx1) / 2 ? -1 : 1
        const px = bx0 + fdir * (70 + j * 12) * e
        const py = fl.y - (46 + j * 7) * (1 - (1 - e) * (1 - e))
        const flap = Math.floor(t * 9 + j) % 2
        put(ctx, pigeons[2 + flap][fdir > 0 ? 0 : 1], px, py)
      }
    }

    // aranha descendo pelo fio no canto do cabeçalho
    const sp = mod(t - SPIDER_0, SPIDER_P)
    const spX = Math.round(lay.hud ? lay.fx1 - 10 : lay.vx1 - 24)
    let spY = -99
    if (sp < 13.5) {
      const deep = Math.max(8, Math.min(24, Math.round(lay.band * 0.55)))
      spY =
        sp < 2.5
          ? deep * ease(sp / 2.5)
          : sp < 11
            ? deep + Math.round(Math.sin(t * 2.1))
            : deep * (1 - ease((sp - 11) / 2.5))
      spY = Math.round(spY) - 4
      ctx.fillStyle = 'rgba(226,232,255,0.7)'
      ctx.fillRect(spX, 0, 1, Math.max(0, spY))
      const moving = sp < 2.5 || sp > 11
      put(ctx, spider[moving ? Math.floor(t * 6) % 2 : 0], spX + 0.5, spY)
    }

    // herói: só a posição aqui (ele é desenhado depois da tinta, com uma
    // sombra mais leve que a do resto: o protagonista continua legível)
    const k = Math.floor((t - RUN_0) / RUN_P)
    const rt0 = RUN_0 + k * RUN_P
    HERO.on = false
    if (P.ok) {
      HERO.on = true
      heroUpdate(t, dt, ph)
    } else if (t - runAt < runLen(0.85) + 0.5 && t >= runAt) {
      // no giro ele já entra pelo trecho livre do cabeçalho
      HERO.on = true
      const start =
        runDir > 0 ? lay.fx0 + 14 : lay.vx0 + lay.vx1 - (lay.fx1 - 14)
      heroAt((t - runAt) / 0.85, runDir, start)
    } else if (
      k >= 0 &&
      t - rt0 < runLen(1) &&
      !(runAt > rt0 - runLen(0.85) && runAt < rt0 + runLen(1))
    ) {
      HERO.on = true
      heroAt(t - rt0, k % 2 ? -1 : 1, lay.vx0 - 40)
    }

    // ---------------------------------------------- 2. tinta da hora
    const tn = TINT[Math.min(TINT_STEPS - 1, Math.floor(cyc * TINT_STEPS))]
    if (tn.a > 0.01) {
      ctx.globalCompositeOperation = 'source-atop'
      ctx.globalAlpha = tn.a
      ctx.fillStyle = tn.style
      ctx.fillRect(0, 0, lay.w, lay.h)
      ctx.globalCompositeOperation = 'source-over'
      ctx.globalAlpha = 1
    }

    // ---------------------------------------------- 3. luzes
    if (HERO.on) {
      const hs = HERO.dir > 0 ? 0 : 1
      const d = HERO.dir
      const shade = tn.a * 0.55
      // teia (fio de seda pega a luz do céu)
      if (HERO.web) {
        // sombra de 1 pixel ao lado: o fio aparece até no céu claro
        ctx.globalAlpha = 0.4 - lit * 0.25
        ctx.fillStyle = '#1a1438'
        webLine(ctx, HERO.x + 1, HERO.y, HERO.ax + 1, HERO.ay)
        ctx.globalAlpha = 0.95 - lit * 0.3
        ctx.fillStyle = '#f6f4ff'
        webLine(ctx, HERO.x, HERO.y, HERO.ax, HERO.ay)
        ctx.globalAlpha = 1
      }
      // cachecol dourado: nasce no pescoço e tremula para trás
      let nx = HERO.x
      let ny = HERO.y
      let s: Sprite
      let sh: Sprite
      let lens: Sprite | null = null
      if (HERO.mode === 'swing') {
        const a = HERO_ANGLES[HERO.ai]
        const ca = Math.cos(a)
        const sa = Math.sin(a)
        nx += d * (NECK.x * ca - NECK.y * sa)
        ny += NECK.x * sa + NECK.y * ca
        s = hero.swing[HERO.ai][hs]
        sh = hero.swingShade[HERO.ai][hs]
        lens = hero.swingLens[HERO.ai][hs]
      } else if (HERO.mode === 'tuck') {
        nx -= d * 2
        s = hero.tuck[HERO.q][hs]
        sh = hero.tuckShade[HERO.q][hs]
      } else if (HERO.mode === 'perch') {
        nx += d * NECK_PERCH.x
        ny += NECK_PERCH.y
        s = hero.perch[hs]
        sh = hero.perchShade[hs]
        lens = hero.perchLens[hs]
      } else {
        nx += d * NECK_WIN.x
        ny += NECK_WIN.y
        s = hero.win[hs]
        sh = hero.winShade[hs]
        lens = hero.winLens[hs]
      }
      const still = HERO.mode === 'perch' || HERO.mode === 'win'
      for (let pass = 0; pass < 2; pass++) {
        if (pass && shade < 0.02) break
        ctx.globalAlpha = pass ? shade : 1
        for (let i = 0; i < 6; i++) {
          ctx.fillStyle = pass ? '#0b0820' : i < 4 ? '#fcd25d' : '#d8862a'
          // parado, o vento sacode o cachecol devagar e ele cai um pouco
          const wave = Math.sin(t * (still ? 6 : 13) - i * 1.1) * i
          ctx.fillRect(
            Math.round(nx - d * (2 + i * (still ? 1.2 : 1.6))),
            Math.round(
              ny + i * (still ? 0.45 : 0.35) + wave * (still ? 0.38 : 0.3),
            ),
            2,
            1,
          )
        }
      }
      ctx.globalAlpha = 1
      put(ctx, s, HERO.x, HERO.y)
      if (shade > 0.02) {
        ctx.globalAlpha = shade
        put(ctx, sh, HERO.x, HERO.y)
      }
      if (lens && lit > 0.05) {
        ctx.globalAlpha = lit
        put(ctx, lens, HERO.x, HERO.y)
      }
      ctx.globalAlpha = 1
    }
    // neon: acende ao anoitecer, com um zumbido de vez em quando
    const neonOn = clamp01((lit - 0.3) / 0.4)
    if (neonOn > 0)
      for (let i = 0; i < 2; i++) {
        if (signX[i] < 0) continue
        const buzz = hash(Math.floor(t * 10) + i * 7) > 0.97 ? 0.25 : 1
        ctx.globalAlpha = neonOn * buzz
        put(ctx, neon[i].on, signX[i], signY[i])
        ctx.globalCompositeOperation = 'lighter'
        put(ctx, neon[i].glow, signX[i], signY[i])
        ctx.globalCompositeOperation = 'source-over'
      }
    ctx.globalAlpha = 1
    // moedas do bônus (brilham sozinhas) e o +500 quando o herói pega
    for (let c = k; c <= k + 1; c++) {
      if (c < 0 || c % 5 !== 2) continue
      const c0 = RUN_0 + c * RUN_P
      for (let i = 0; i < 3; i++) {
        if (!coinSpot(c, i)) continue
        const since = t - c0 - COIN.at
        if (t < c0 - 7 || since > 1.2) continue
        if (since < 0) {
          const bob = Math.round(Math.sin(t * 3 + i) * 1.2)
          const fr = Math.floor(t * 8 + i) % 6
          ctx.globalCompositeOperation = 'lighter'
          ctx.globalAlpha = 0.55 + 0.25 * Math.sin(t * 5 + i)
          put(ctx, lights.warm, COIN.x, COIN.y + bob)
          ctx.globalCompositeOperation = 'source-over'
          ctx.globalAlpha = Math.min(1, (t - c0 + 7) / 0.6)
          put(ctx, coin[fr < 4 ? fr : 6 - fr], COIN.x, COIN.y + bob)
          ctx.globalAlpha = 1
        } else {
          // brilho em cruz e o número subindo
          const e = since / 1.2
          ctx.fillStyle = '#fff6c8'
          const r = Math.round(2 + e * 7)
          if (e < 0.45) {
            ctx.fillRect(COIN.x - r, COIN.y, 2, 1)
            ctx.fillRect(COIN.x + r - 1, COIN.y, 2, 1)
            ctx.fillRect(COIN.x, COIN.y - r, 1, 2)
            ctx.fillRect(COIN.x, COIN.y + r - 1, 1, 2)
          }
          if (e < 0.7 || Math.floor(t * 15) % 2)
            drawText(
              ctx,
              font.yellow,
              '+500',
              Math.round(COIN.x - 11),
              Math.max(11, Math.round(COIN.y - 12 - e * 4)),
            )
        }
      }
    }
    // painel de LED do dirigível (sempre aceso) e farolete vermelho
    if (blimpOn) {
      const strip =
        ph === 'spinning'
          ? strips.spin
          : ph === 'won'
            ? strips.won
            : strips.idle
      const pw = BLIMP.panelW
      const px = Math.round(bx) + BLIMP.w - BLIMP.panelX - pw
      const py = by + BLIMP.panelY
      const off = Math.floor(t * 12) % strip.width
      const first = Math.min(pw, strip.width - off)
      ctx.drawImage(strip, off, 0, first, 9, px, py, first, 9)
      if (first < pw)
        ctx.drawImage(strip, 0, 0, pw - first, 9, px + first, py, pw - first, 9)
      if (lit > 0.05) {
        ctx.globalAlpha = lit
        put(ctx, blimp.lit, bx, by)
        ctx.globalAlpha = 1
      }
      if (Math.floor(t * 1.2) % 2 === 0) {
        ctx.fillStyle = '#ff3020'
        ctx.fillRect(Math.round(bx) + 31, by + 20, 1, 1)
        ctx.globalCompositeOperation = 'lighter'
        ctx.globalAlpha = 0.5 + lit * 0.5
        put(ctx, lights.red, Math.round(bx) + 31.5, by + 20.5)
        ctx.globalCompositeOperation = 'source-over'
        ctx.globalAlpha = 1
      }
    }
    // faróis e lanternas (acendem com o anoitecer)
    if (lit > 0.03) {
      ctx.globalAlpha = lit
      for (let i = 0; i < LANE_L.length; i++) {
        const c = cars[LANE_L[i].kind]
        const x = W + 55 - mod(LANE_L[i].x0 + V_L * t, LOOP) - c.body[1].w
        if (x > lay.vx1 + 20 || x + c.body[1].w < lay.vx0 - 20) continue
        put(ctx, c.lamps[1], x, oy + 153)
        ctx.globalCompositeOperation = 'lighter'
        put(ctx, lights.beam[1], x, oy + 153 - 3)
        ctx.globalCompositeOperation = 'source-over'
      }
      for (let i = 0; i < LANE_R.length; i++) {
        const c = cars[LANE_R[i].kind]
        const x = mod(LANE_R[i].x0 + V_R * t, LOOP) - 55
        if (x > lay.vx1 + 20 || x + c.body[0].w < lay.vx0 - 20) continue
        put(ctx, c.lamps[0], x, oy + 159)
        ctx.globalCompositeOperation = 'lighter'
        put(ctx, lights.beam[0], x + c.body[0].w, oy + 159 - 3)
        ctx.globalCompositeOperation = 'source-over'
      }
      if (trainOn) {
        put(ctx, train.lit[tdir > 0 ? 0 : 1], trx, trainY)
        ctx.globalCompositeOperation = 'lighter'
        const hx = tdir > 0 ? trx + train.w : trx
        put(ctx, lights.warmBig, hx, trainY - 6)
        ctx.globalCompositeOperation = 'source-over'
      }
      ctx.globalAlpha = 1
    }
    // giroflex: azul e vermelho alternando 2,5 vezes por segundo
    if (chaseOn) {
      const blue = Math.floor(t * 5) % 2 === 0
      const lx = Math.round(gx - 38)
      const ly = oy + 160 - 9
      ctx.fillStyle = blue ? '#5a8aff' : '#ff4040'
      const pix = blue ? SIREN.blue : SIREN.red
      ctx.fillRect(lx + pix[0], ly, 2, 1)
      ctx.globalCompositeOperation = 'lighter'
      put(ctx, blue ? lights.blue : lights.red, lx + pix[0] + 1, ly + 0.5)
      ctx.globalCompositeOperation = 'source-over'
      if (lit > 0.03) {
        ctx.globalAlpha = lit
        put(ctx, cars.police.lamps[0], gx - 38, oy + 160)
        put(ctx, cars.purple.lamps[0], gx, oy + 160)
        ctx.globalAlpha = 1
      }
    }

    // ---------------------------------------------- 4. placar e vitória
    const wt = t - winAt
    const winning = ph === 'won' && wt >= 0
    const target = 4500 + 250 * Math.max(0, k) + 500 * coinsTaken(t, k) + bonus
    if (dt === 0 || shown < 0) shown = target
    else if (shown < target)
      shown = Math.min(target, shown + Math.max(9, (target - shown) * 0.12))
    const banner = winning && wt < 6.2
    const cx = Math.round((lay.fx0 + lay.fx1) / 2)
    // faixa de vitória (2x quando cabe)
    const big = lay.fx1 - lay.fx0 >= 230 ? 2 : 1
    const bannerText = 'FASE CONCLUÍDA!'
    const btw = textWidth(bannerText.length, big)
    const bw = btw + 14 * big
    if (lay.hud) {
      const w1 = textWidth(10)
      const w2 = textWidth(14)
      const w3 = textWidth(12)
      const room = lay.fx1 - lay.fx0
      const all = room >= w1 + w2 + w3 + 36
      const two = room >= w1 + w2 + 20
      const y = 2
      const x2 = Math.round(cx - w2 / 2)
      // durante a faixa o 1UP vai para o lado dela (o placar sobe ali)
      let x1 = two ? x2 - 16 - w1 : -999
      if (banner) x1 = cx - Math.round(bw / 2) - 10 - w1
      if (x1 >= lay.fx0 - 2) {
        // 1UP pisca devagar, como nos fliperamas
        if (dt === 0 || Math.floor(t * 1.25) % 3 !== 2)
          drawText(ctx, font.red, '1UP', x1, y)
        drawNumber(ctx, font.white, shown, 6, x1 + 24, y)
      }
      if (!banner) {
        drawText(ctx, font.yellow, 'RECORDE', x2, y)
        drawNumber(ctx, font.white, Math.max(50000, shown), 6, x2 + 48, y)
        if (all && (dt === 0 || Math.floor(t * 0.9) % 3 !== 2))
          drawText(ctx, font.cyan, 'INSIRA FICHA', x2 + w2 + 16, y)
      }
      // combo embaixo do placar do jogador (some devagar depois do giro)
      const cb = combo(t)
      const since = t - spinEnd
      if (cb > 0 && !banner && (ph === 'spinning' || since < 1.4)) {
        const nd = digitsOf(cb)
        const cs = lay.band >= 27 ? 2 : 1
        const wNum = textWidth(nd, cs)
        const cx0 = x1 >= lay.fx0 - 2 ? x1 : Math.round(cx - wNum / 2 - 18)
        // pulinho a cada acerto novo
        const pop = ph === 'spinning' && Math.floor(t * 15) % 3 === 0 ? 1 : 0
        const cy = cs === 2 ? 10 : 11
        drawNumber(ctx, font.yellow, cb, nd, cx0, cy - pop, cs)
        drawText(ctx, font.red, 'HITS!', cx0 + wNum + 4, cs === 2 ? 19 : 11)
      }
    }
    if (banner) {
      // faixa de pixel: abre em degraus, segura e fecha
      const bh = big === 2 ? 24 : 14
      const open =
        wt < 0.3
          ? Math.ceil((wt / 0.3) * 6) / 6
          : wt > 5.9
            ? 1 - (wt - 5.9) / 0.3
            : 1
      const ww = Math.max(4, Math.round(bw * clamp01(open)))
      const x = cx - Math.round(ww / 2)
      const y = Math.max(1, Math.round((Math.min(lay.band, 40) - bh) / 2))
      ctx.fillStyle = '#0a0612'
      ctx.fillRect(x - 1, y - 1, ww + 2, bh + 2)
      ctx.fillStyle = winColor
      ctx.fillRect(x, y, ww, bh)
      ctx.fillStyle = '#140a24'
      ctx.fillRect(x + 2, y + 2, ww - 4, bh - 4)
      ctx.fillStyle = winLight
      ctx.fillRect(x + 2, y + 2, ww - 4, 1)
      if (open >= 1) {
        drawText(
          ctx,
          font.white,
          bannerText,
          cx - Math.round(btw / 2),
          y + 2,
          big,
        )
        drawText(ctx, winFont, '*', x + 3, y + 2 + big * 2, 1)
        drawText(ctx, winFont, '*', x + ww - 9, y + 2 + big * 2, 1)
      }
    }
    // fogos na cor da fatia vencedora
    if (winning && wt < 5.6) {
      for (let b = 0; b < BURSTS; b++) {
        const bt0 = BURST_AT[b]
        const rise = 0.5
        const local = wt - bt0
        if (local < 0 || local > rise + 1.7) continue
        const x = burstX[b]
        const y = burstY[b]
        if (local < rise) {
          // foguete subindo com rastro
          const ry = y + burstRise[b] * (1 - ease(local / rise))
          ctx.fillStyle = winLight
          ctx.fillRect(Math.round(x), Math.round(ry), 1, 2)
          ctx.fillStyle = winColor
          for (let s = 1; s < 4; s++)
            if (hash(s + Math.floor(t * 15)) > 0.35)
              ctx.fillRect(Math.round(x), Math.round(ry) + 2 + s * 2, 1, 1)
          continue
        }
        const tau = local - rise
        if (tau < 0.45) {
          ctx.globalCompositeOperation = 'lighter'
          ctx.globalAlpha = 1 - tau / 0.45
          put(ctx, winHalo, x, y)
          ctx.globalAlpha = 1
          ctx.globalCompositeOperation = 'source-over'
        }
        const reach = (1 - Math.exp(-2.6 * tau)) / 2.6
        const fall = 9 * tau * tau
        const fat = tau < 0.32
        for (let i = 0; i < SPARKS; i++) {
          // apaga em pontilhado no fim, com cintilância
          const tw = hash(i * 13 + b + Math.floor(t * 15))
          if (tau > 1.0 && tw < (tau - 1.0) / 0.7) continue
          const sp = 62 * SPARK_SPD[i]
          const px = Math.round(x + SPARK_COS[i] * sp * reach)
          const py = Math.round(y + SPARK_SIN[i] * sp * reach + fall)
          ctx.fillStyle =
            tau > 0.8 && tw > 0.8
              ? '#ffffff'
              : i % 4 === 0
                ? winLight
                : winColor
          if (fat) ctx.fillRect(px - 1, py - 1, 2, 2)
          else ctx.fillRect(px, py, 1, 1)
          if (tau < 0.7) {
            // rastro: dois pontos mais para dentro
            const k1 = 0.78
            ctx.fillRect(
              Math.round(x + SPARK_COS[i] * sp * reach * k1),
              Math.round(y + SPARK_SIN[i] * sp * reach * k1 + fall * 0.8),
              1,
              1,
            )
            if (i % 2 === 0)
              ctx.fillRect(
                Math.round(x + SPARK_COS[i] * sp * reach * 0.55),
                Math.round(y + SPARK_SIN[i] * sp * reach * 0.55 + fall * 0.6),
                1,
                1,
              )
          }
        }
      }
    }
  }

  return { resize, draw, ready: () => L !== null }
}
