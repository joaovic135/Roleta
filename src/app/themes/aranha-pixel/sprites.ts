// Arte dos atores (originais): cada sprite é escrito em texto, um
// caractere por pixel, e vira um canvas pequeno uma vez só. Os veículos
// grandes (trem, ônibus, dirigível) são desenhados por código. Tudo olha
// para a direita; a camada espelha o que vai para a esquerda.
import {
  Grid,
  Sprite,
  art,
  canvas,
  drawText,
  fontAtlas,
  grid,
  halo,
  mirrorSprite,
  rotate,
  sprite,
} from './pixels'

const K = '#0a0612'

// ---------------------------------------------------------------- herói
// Tecelão: máscara vermelha com lentes brancas, laterais azuis e cachecol
// dourado (desenhado à parte, tremulando). Pendurado pela mão direita, no
// pixel (9, 0), onde a teia se prende.
const HERO_ROWS = [
  '........KK..',
  '.......KRRK.',
  '.......KRK..',
  '..KKKK.KRK..',
  '.KrRRRKKBK..',
  '.KWWRWWKBK..',
  '.KRWRWRKBK..',
  '..KRRRKBBK..',
  '.KBKRKBRBK..',
  'KBBRRRRRBK..',
  'KBKRrRRRKBK.',
  'KK.KBRRBK.KK',
  '...KBBBBK...',
  '..KBBKKBBK..',
  '.KBBK..KBBK.',
  '.KBK....KBK.',
  'KRRK....KRRK',
  'KrK......KrK',
  'KKK......KKK',
]
// bola do mortal (gira de 90 em 90 graus, sem perder pixel)
const TUCK_ROWS = [
  '..KKKKK...',
  '.KrRRRRK..',
  'KRWWRWWRK.',
  'KRRWRWRRKK',
  '.KRRRRRKBK',
  'KBKKKKKBBK',
  'KBBBBBBBBK',
  'KRRBBBBRRK',
  '.KRrKKRrK.',
  '..KK..KK..',
]
// agachado num telhado, olhando a rua (pose de vigia)
const PERCH_ROWS = [
  '...KKKK......',
  '..KrRRRK.....',
  '..KWWRWWK....',
  '..KRWRWRK....',
  '...KRRRKK....',
  '..KBRRRRBK...',
  '.KBBRRRRBBK..',
  'KBKKRRRRKBBK.',
  'KRK.KBBKK.KRK',
  'KRRKBBKBBKRRK',
  '.KKKKK.KKKKK.',
]
// vitória: punho erguido em cima do prédio
const WIN_ROWS = [
  '........KK..',
  '.......KRRK.',
  '.......KRK..',
  '..KKKK.KBK..',
  '.KrRRRKKBK..',
  '.KWWRWWKBK..',
  '.KRWRWRKBK..',
  '..KRRRKBBK..',
  '.KBKRRRRK...',
  'KBBRRRRRK...',
  'KRKRrRRRK...',
  'KK.KBRRBK...',
  '...KBBBBK...',
  '...KBKKBK...',
  '...KBK.KBK..',
  '...KBK.KBK..',
  '..KRRK.KRRK.',
  '..KrK...KrK.',
  '..KKK...KKK.',
]
const HERO_COLORS = {
  K,
  R: '#e02a10',
  r: '#ff7a4c',
  B: '#1048d8',
  W: '#ffffff',
}
// lentes que brilham à noite (só os pixels W, desenhados por cima)
const lensOnly = (rows: string[]) => rows.map((r) => r.replace(/[^W]/g, '.'))

// ângulos pré-girados do balanço (radianos, sentido da tela)
export const HERO_ANGLES = [
  -0.84, -0.63, -0.42, -0.21, 0, 0.21, 0.42, 0.63, 0.84,
]
const HAND_X = 9.5
const HAND_Y = 0.5

const pair = (s: Sprite) => [s, mirrorSprite(s)] as const

// cada pose sai em 3 versões: cores, só as lentes (brilham à noite) e a
// sombra (silhueta escura que a noite pinta por cima com pouca opacidade:
// o herói escurece menos que o resto e continua legível)
const SHADE = '#0b0820'
const variants = (rows: string[]) => ({
  body: grid(rows, HERO_COLORS),
  lens: grid(lensOnly(rows), { W: '#fff6c8' }),
  shade: grid(rows, { K: SHADE, R: SHADE, r: SHADE, B: SHADE, W: SHADE }),
})
export const buildHero = () => {
  const hang = variants(HERO_ROWS)
  const turn = (g: Grid) =>
    HERO_ANGLES.map((a) => pair(rotate(g, a, HAND_X, HAND_Y)))
  const ball = variants(TUCK_ROWS)
  const spin = (g: Grid) =>
    [0, 1, 2, 3].map((q) => pair(rotate(g, (q * Math.PI) / 2, 5, 5)))
  const crouch = variants(PERCH_ROWS)
  const stand = variants(WIN_ROWS)
  const feet = (g: Grid, px: number, py: number) => pair(sprite(g, px, py))
  return {
    swing: turn(hang.body),
    swingLens: turn(hang.lens),
    swingShade: turn(hang.shade),
    tuck: spin(ball.body),
    tuckShade: spin(ball.shade),
    perch: feet(crouch.body, 6.5, 11),
    perchLens: feet(crouch.lens, 6.5, 11),
    perchShade: feet(crouch.shade, 6.5, 11),
    win: feet(stand.body, 5, 19),
    winLens: feet(stand.lens, 5, 19),
    winShade: feet(stand.shade, 5, 19),
  }
}
// pescoço (onde nasce o cachecol): relativo à mão no balanço e aos pés
// nas poses paradas
export const NECK = { x: 4.5 - HAND_X, y: 8.5 - HAND_Y }
export const NECK_PERCH = { x: -1.5, y: -6 }
export const NECK_WIN = { x: -0.5, y: -11 }

// ---------------------------------------------------------------- pombos
const PIGEON = {
  g: '#a3a3bd',
  d: '#5f5f7c',
  h: '#7d7d9c',
  n: '#73c4a2',
  o: '#e8a040',
  K: '#1a1426',
}
export const buildPigeons = () => {
  const frames = [
    // parado
    ['.....hh.', '....hhKo', '.dggggn.', 'ddgggg..', '...o.o..'],
    // bicando
    ['........', '........', '.dggggh.', 'ddgggghK', '...o.oo.'],
    // asas para cima
    ['...dd...', '...ddd..', 'dggggnho', '........', '........'],
    // asas para baixo
    ['........', '........', 'dggggnho', '...ddd..', '...dd...'],
  ]
  return frames.map((rows) => pair(art(rows, PIGEON, 4, 5)))
}

// ---------------------------------------------------------------- pedestres
// 4 x 10, pés na última linha; dois quadros de passo
const WALK_A = [
  '.hh.',
  '.hf.',
  'sss.',
  'sssf',
  'fss.',
  '.ss.',
  '.pp.',
  'p..p',
  'p..p',
  'k..k',
]
const WALK_B = [
  '.hh.',
  '.hf.',
  '.ss.',
  '.ss.',
  '.sf.',
  '.ss.',
  '.pp.',
  '.pp.',
  '.pp.',
  '.kk.',
]
// mão erguida segurando o guarda-chuva
const UMB_A = WALK_A.map((r, i) => (i === 3 ? 'sss.' : i === 2 ? 'sssf' : r))
const UMB_B = WALK_B.map((r, i) => (i === 4 ? '.ss.' : i === 2 ? '.ssf' : r))
const PEOPLE = [
  { h: '#3a2414', f: '#f0c090', s: '#d84040', p: '#2a3a6a', k: '#141018' },
  { h: '#141018', f: '#8a5a30', s: '#f8d040', p: '#3a3a48', k: '#141018' },
  { h: '#e8c070', f: '#f6d0a8', s: '#40a0e8', p: '#5a3a28', k: '#2a1a10' },
  { h: '#b8b8c8', f: '#c08850', s: '#6a4aa8', p: '#2a2a38', k: '#141018' },
  { h: '#5a2a14', f: '#f0c090', s: '#40b070', p: '#1a2a4a', k: '#141018' },
  { h: '#141018', f: '#c08850', s: '#f08030', p: '#1a1a24', k: '#6a2a10' },
  { h: '#a83a20', f: '#f6d0a8', s: '#e8e8f0', p: '#30304a', k: '#141018' },
]
export const UMB_COLORS = [
  '#e83a2a',
  '#fcd25d',
  '#2a7af0',
  '#2ab870',
  '#e860b0',
  '#f8f8ff',
]
export const buildPeople = () =>
  PEOPLE.map((c) => ({
    walk: [pair(art(WALK_A, c, 2, 10)), pair(art(WALK_B, c, 2, 10))],
    umb: [pair(art(UMB_A, c, 2, 10)), pair(art(UMB_B, c, 2, 10))],
  }))
export const buildUmbrellas = () =>
  UMB_COLORS.map((u) =>
    pair(
      art(
        [
          '...uuu...',
          '.uuuuuuu.',
          'uuUuuuUuu',
          'u.U.u.U.u',
          '....k....',
          '....k....',
        ],
        { u, U: '#ffffff', k: '#2a2030' },
        4,
        0,
      ),
    ),
  )
// cachorro passeando (vai junto com um dos pedestres)
export const buildDog = () =>
  [
    ['.....dd', 'dddddde', 'd.dddd.', '.d...d.'],
    ['.....dd', 'dddddde', 'd.dddd.', 'd.....d'],
  ].map((rows) => pair(art(rows, { d: '#c08040', e: '#141018' }, 3, 4)))

// ---------------------------------------------------------------- aranha
export const buildSpider = () =>
  [
    ['.K...K.', '..K.K..', 'K.KhK.K', '.KKKKK.', 'K.KKK.K', '..K.K..'],
    ['K.....K', '.K.K.K.', '..KhK..', 'KKKKKKK', '..KKK..', '.K...K.'],
  ].map((rows) => art(rows, { K, h: '#5a5a78' }, 3.5, 0))

// ---------------------------------------------------------------- carros
// sedã 22 x 8 voltado para a direita (H = farol, T = lanterna)
const SEDAN = [
  '......KKKKKKKKK.......',
  '.....KgGGGKGGGGGK.....',
  '....KgGGGGKGGGGGGK....',
  '.KKKrrrrrrrrrrrrrrKKK.',
  'KrRRRRRRRRRRRRRRRRRRRK',
  'KTRRRRRRRRRRRRRRRRRRRH',
  'KDDDkkkDDDDDDDDDkkkDDK',
  '...kwk..........kwk...',
]
const POLICE = [
  '.........bbrr.........',
  '......KKKKKKKKK.......',
  '.....KgGGGKGGGGGK.....',
  '....KgGGGGKGGGGGGK....',
  '.KKKnnnnnWWWWWnnnnKKK.',
  'KnNNNNNWWWWWWWNNNNNNNK',
  'KTNNNNNWWWWWWWNNNNNNNH',
  'KDDDkkkDDDDDDDDDkkkDDK',
  '...kwk..........kwk...',
]
const CAR_BASE = {
  K,
  G: '#3a5a98',
  g: '#9fd4ff',
  T: '#ff2a2a',
  H: '#fff6b0',
  k: '#16121e',
  w: '#9a9aae',
}
const paintJob = (R: string, r: string, D: string) => ({ R, r, D })
export const CAR_COLORS = {
  red: paintJob('#d82800', '#ff6a3c', '#801000'),
  blue: paintJob('#0058f8', '#5ca8ff', '#002a90'),
  white: paintJob('#dcdcec', '#ffffff', '#8a8aa8'),
  green: paintJob('#2a9a50', '#6ad890', '#145a2c'),
  yellow: paintJob('#f8b800', '#ffe070', '#a06800'),
  purple: paintJob('#7a2ac8', '#b080f8', '#3a106a'),
  orange: paintJob('#f07818', '#ffb060', '#8a3a08'),
}
export type CarKind = keyof typeof CAR_COLORS | 'taxi' | 'police'

const lightsOnly = (rows: string[], keep: string) =>
  rows.map((r) => r.replace(new RegExp(`[^${keep}]`, 'g'), '.'))

export const buildCar = (kind: CarKind) => {
  if (kind === 'police') {
    const colors = {
      ...CAR_BASE,
      N: '#1a1a30',
      n: '#4a4a70',
      W: '#f0f0f8',
      D: '#0a0a14',
      b: '#283878',
      r: '#782838',
    }
    return {
      body: pair(art(POLICE, colors, 0, 9)),
      lamps: pair(art(lightsOnly(POLICE, 'HT'), CAR_BASE, 0, 9)),
      h: 9,
    }
  }
  const taxi = kind === 'taxi'
  const rows = taxi ? ['.........KyyK.........', ...SEDAN] : SEDAN
  const colors = {
    ...CAR_BASE,
    ...(taxi ? CAR_COLORS.yellow : CAR_COLORS[kind]),
    y: '#fff4c0',
  }
  return {
    body: pair(art(rows, colors, 0, rows.length)),
    lamps: pair(
      art(lightsOnly(rows, taxi ? 'HTy' : 'HT'), colors, 0, rows.length),
    ),
    h: rows.length,
  }
}
// giroflex: pontos acesos por cima (alternam azul e vermelho)
export const SIREN = { blue: [9, 10], red: [11, 12] }

// motoboy com baú de entrega
export const buildMoto = () => {
  const rows = [
    '.....hh....',
    '....hhh....',
    '.RRR.ss....',
    '.RyR.sss...',
    '.RRRsssKK..',
    '..KKkkkkKH.',
    '.kwk...kwk.',
    '..k.....k..',
  ]
  const colors = {
    h: '#e83a2a',
    s: '#2a4a8a',
    R: '#d82800',
    y: '#fcd25d',
    K,
    k: '#3a3a4a',
    w: '#9a9aae',
    H: '#fff6b0',
  }
  return {
    body: pair(art(rows, colors, 0, 8)),
    lamps: pair(art(lightsOnly(rows, 'H'), colors, 0, 8)),
    h: 8,
  }
}

// ônibus 40 x 13 (janelas acendem à noite)
export const buildBus = () => {
  const w = 40
  const h = 13
  const body = canvas(w, h)
  const lit = canvas(w, h)
  const b = body.ctx
  const f = (x: number, y: number, ww: number, hh: number, c: string) => {
    b.fillStyle = c
    b.fillRect(x, y, ww, hh)
  }
  f(1, 0, 37, 1, K)
  f(0, 1, 40, 10, K)
  f(1, 1, 37, 9, '#e8781c')
  f(1, 1, 37, 1, '#ffb060')
  f(1, 8, 38, 1, '#fff0d0')
  f(1, 9, 38, 1, '#a04808')
  f(38, 2, 1, 6, '#3a5a98')
  // janelas e porta
  for (let x = 3; x < 34; x += 5) f(x, 3, 4, 4, '#2a3a68')
  f(33, 3, 3, 6, '#2a3a68')
  // letreiro de destino
  f(30, 1, 6, 1, '#3a2410')
  // rodas
  for (const wx of [6, 30]) {
    f(wx - 1, 10, 5, 2, '#16121e')
    f(wx, 10, 3, 3, '#16121e')
    f(wx + 1, 11, 1, 1, '#9a9aae')
  }
  f(38, 7, 1, 1, '#fff6b0')
  f(0, 7, 1, 1, '#ff2a2a')
  const l = lit.ctx
  l.fillStyle = '#ffd98a'
  for (let x = 3; x < 34; x += 5) l.fillRect(x, 3, 4, 3)
  l.fillRect(33, 3, 3, 5)
  l.fillStyle = '#ffb43c'
  l.fillRect(30, 1, 6, 1)
  l.fillStyle = '#fff6b0'
  l.fillRect(38, 7, 1, 1)
  l.fillStyle = '#ff2a2a'
  l.fillRect(0, 7, 1, 1)
  const one = (c: HTMLCanvasElement): Sprite => ({ c, w, h, px: 0, py: h })
  return {
    body: pair(one(body.c)),
    lamps: pair(one(lit.c)),
    h,
  }
}

// ---------------------------------------------------------------- metrô
// três carros de 46 px; o primeiro tem a frente inclinada e farol
export const TRAIN_CAR = 46
export const buildTrain = () => {
  const n = 3
  const w = n * TRAIN_CAR
  const h = 12
  const body = canvas(w, h)
  const lit = canvas(w, h)
  const b = body.ctx
  const l = lit.ctx
  const f = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    ww: number,
    hh: number,
    c: string,
  ) => {
    ctx.fillStyle = c
    ctx.fillRect(x, y, ww, hh)
  }
  for (let i = 0; i < n; i++) {
    const x = i * TRAIN_CAR
    const front = i === n - 1
    const len = TRAIN_CAR - 1
    f(b, x, 1, len, 9, K)
    f(b, x + 1, 2, len - 2, 7, '#b8bcd0')
    f(b, x + 1, 2, len - 2, 1, '#e4e8f4')
    f(b, x + 1, 7, len - 2, 1, '#d82800')
    f(b, x + 1, 8, len - 2, 1, '#7a7e98')
    f(b, x + 3, 0, len - 6, 1, '#5a5e78')
    // janelas
    for (let wx = x + 4; wx < x + len - 6; wx += 7) {
      f(b, wx, 3, 5, 3, '#1c2238')
      f(l, wx, 3, 5, 3, '#ffd98a')
      f(b, wx, 3, 1, 1, '#4a5a88')
    }
    // portas
    f(b, x + 18, 3, 1, 5, '#5a5e78')
    f(b, x + 25, 3, 1, 5, '#5a5e78')
    // truques (rodas)
    for (const tx of [x + 6, x + len - 11]) {
      f(b, tx, 10, 6, 1, '#141020')
      f(b, tx + 1, 11, 1, 1, '#141020')
      f(b, tx + 4, 11, 1, 1, '#141020')
    }
    // engate
    if (!front) f(b, x + len, 6, 1, 2, '#141020')
    if (front) {
      // frente inclinada com vidro e farol
      b.clearRect(x + len - 3, 1, 3, 1)
      b.clearRect(x + len - 2, 2, 2, 1)
      b.clearRect(x + len - 1, 3, 1, 1)
      f(b, x + len - 4, 3, 2, 3, '#3a5a98')
      f(b, x + len - 2, 6, 1, 1, '#fff6b0')
      f(l, x + len - 2, 6, 1, 1, '#ffffff')
      f(l, x + len - 4, 3, 2, 3, '#9fd4ff')
    }
    // lanterna do último carro
    if (i === 0) {
      f(b, x + 1, 6, 1, 1, '#ff2a2a')
      f(l, x + 1, 6, 1, 1, '#ff4a3a')
    }
  }
  const one = (c: HTMLCanvasElement): Sprite => ({ c, w, h, px: 0, py: h })
  return { body: pair(one(body.c)), lit: pair(one(lit.c)), w, h }
}

// ---------------------------------------------------------------- dirigível
// 64 x 22, painel de LED 36 x 9 no meio do casco (texto desliza por ele)
export const BLIMP = { w: 64, h: 22, panelX: 15, panelY: 5, panelW: 36 }
export const buildBlimp = () => {
  const { w, h } = BLIMP
  const g: Grid = Array.from({ length: h }, () =>
    new Array<string | null>(w).fill(null),
  )
  const cx = 30
  const cy = 8
  const rx = 29.5
  const ry = 8.5
  for (let y = 0; y < 17; y++)
    for (let x = 0; x < w; x++) {
      const dx = (x + 0.5 - cx) / rx
      const dy = (y + 0.5 - cy) / ry
      const d = dx * dx + dy * dy
      if (d > 1) continue
      const edge = d > 0.86
      // luz vinda de cima, com pontilhado entre os tons
      const shade = dy + dx * 0.25 + ((x + y) % 2 ? 0.06 : -0.06)
      g[y][x] = edge
        ? '#2a2240'
        : shade < -0.45
          ? '#ffffff'
          : shade < 0.05
            ? '#dcd6ea'
            : shade < 0.5
              ? '#a89cc6'
              : '#6e6290'
    }
  // lemes vermelhos na cauda
  const fin = (x: number, y: number, rows: string[]) =>
    rows.forEach((r, j) =>
      Array.from(r).forEach((ch, i) => {
        if (ch === 'R') g[y + j][x + i] = '#d82800'
        if (ch === 'r') g[y + j][x + i] = '#ff6a3c'
        if (ch === 'K') g[y + j][x + i] = '#2a2240'
      }),
    )
  fin(0, 0, ['KK....', 'KrK...', 'KRRK..', '.KRRK.'])
  fin(0, 13, ['.KRRK.', 'KRRK..', 'KrK...', 'KK....'])
  // gôndola
  for (let x = 24; x < 38; x++) {
    g[17][x] = '#2a2240'
    g[18][x] = x === 24 || x === 37 ? '#2a2240' : '#4a3e68'
    g[19][x] = '#2a2240'
  }
  for (let x = 26; x < 36; x += 3) g[18][x] = '#1c2238'
  const body = sprite(g, 0, 0)
  // janelinhas da gôndola e farol (acesos à noite)
  const lit = canvas(w, h)
  lit.ctx.fillStyle = '#ffd98a'
  for (let x = 26; x < 36; x += 3) lit.ctx.fillRect(x, 18, 1, 1)
  // moldura do painel
  const p = body.c.getContext('2d')!
  p.fillStyle = '#2a2240'
  p.fillRect(BLIMP.panelX - 1, BLIMP.panelY - 1, BLIMP.panelW + 2, 11)
  p.fillStyle = '#140a06'
  p.fillRect(BLIMP.panelX, BLIMP.panelY, BLIMP.panelW, 9)
  // voa para a esquerda: nariz à esquerda, lemes à direita
  const flip = (s: Sprite): Sprite => ({ ...mirrorSprite(s), px: 0, py: 0 })
  return { body: flip(body), lit: flip({ c: lit.c, w, h, px: 0, py: 0 }) }
}

// faixa de texto do painel (pontos de LED apagados ao fundo); começa com
// um painel inteiro de espaço para o texto entrar pela direita
export const ledStrip = (text: string, color: string) => {
  const w = text.length * 6 + BLIMP.panelW
  const { c, ctx } = canvas(w, 9)
  ctx.fillStyle = 'rgba(255,170,60,0.14)'
  for (let y = 0; y < 9; y++)
    for (let x = y % 2; x < w; x += 2) ctx.fillRect(x, y, 1, 1)
  drawText(ctx, fontAtlas(color, 'rgba(0,0,0,0)'), text, BLIMP.panelW, -2)
  return c
}

// ---------------------------------------------------------------- luzes
export const buildLights = () => ({
  warm: halo(7, '#ffd890', 0.55),
  warmBig: halo(14, '#ffcf7a', 0.4),
  red: halo(6, '#ff3020', 0.7),
  blue: halo(6, '#3070ff', 0.75),
  white: halo(10, '#ffffff', 0.6),
  // facho de farol pontilhado (16 x 7), igual ao da cena em SVG
  beam: (() => {
    const { c, ctx } = canvas(18, 7)
    ctx.fillStyle = 'rgba(255,246,176,0.55)'
    for (let x = 0; x < 18; x++) {
      const spread = 1 + Math.floor(x / 5)
      for (let y = 0; y < 7; y++)
        if (Math.abs(y - 3) <= spread && (x + y) % 2 === 0)
          ctx.fillRect(x, y, 1, 1)
    }
    return pair({ c, w: 18, h: 7, px: 0, py: 3 })
  })(),
})

// moeda girando (4 quadros: de frente, 3/4, fina, de lado) para o bônus
export const buildCoin = () =>
  [
    [
      '..ooo..',
      '.oyyyo.',
      'oyYyydo',
      'oyYyydo',
      'oyyyydo',
      '.oyddo.',
      '..ooo..',
    ],
    [
      '..oo...',
      '.oyyo..',
      '.oYydo.',
      '.oYydo.',
      '.oyydo.',
      '.oddo..',
      '..oo...',
    ],
    [
      '...o...',
      '..oyo..',
      '..oYo..',
      '..oyo..',
      '..oyo..',
      '..odo..',
      '...o...',
    ],
    [
      '...o...',
      '...o...',
      '...Y...',
      '...y...',
      '...y...',
      '...o...',
      '...o...',
    ],
  ].map((rows) =>
    art(
      rows,
      { o: '#8a4a08', y: '#fcd25d', Y: '#fff6c8', d: '#d8902a' },
      3.5,
      3.5,
    ),
  )

// letreiro de neon num prédio da borda: placa apagada (de dia), letras
// acesas e o halo borrado (feito uma vez com filter, nunca por quadro)
export const buildNeon = (text: string, color: string, vertical: boolean) => {
  const n = text.length
  const w = vertical ? 9 : n * 6 + 3
  const h = vertical ? n * 8 + 2 : 10
  const M = 5
  const make = (lit: boolean) => {
    const { c, ctx } = canvas(w + 2 * M, h + 2 * M)
    ctx.fillStyle = '#0a0612'
    ctx.fillRect(M - 1, M - 1, w + 2, h + 2)
    ctx.fillStyle = lit ? '#1c0f26' : '#241a30'
    ctx.fillRect(M, M, w, h)
    const atlas = fontAtlas(lit ? color : '#5a4a6a', 'rgba(0,0,0,0)')
    for (let i = 0; i < n; i++)
      if (vertical) drawText(ctx, atlas, text[i], M + 2, M - 1 + i * 8)
      else drawText(ctx, atlas, text[i], M + 2 + i * 6, M - 1)
    return c
  }
  const on = make(true)
  const glow = canvas(w + 2 * M, h + 2 * M)
  glow.ctx.filter = 'blur(2.5px)'
  glow.ctx.drawImage(on, 0, 0)
  glow.ctx.drawImage(on, 0, 0)
  const s = (c: HTMLCanvasElement): Sprite => ({
    c,
    w: w + 2 * M,
    h: h + 2 * M,
    px: M,
    py: M,
  })
  return { off: s(make(false)), on: s(on), glow: s(glow.c), w, h }
}
