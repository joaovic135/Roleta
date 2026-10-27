// Personagens em primeiro plano, desenhados à mão em cel-shading de anime
// dos anos 80: cor chapada, uma sombra de borda dura, um brilho e traço de
// nanquim. Só dados (paths); o Scene.tsx monta os SVGs.
//
// A garota olha para a direita (para a roleta), de olhos fechados, ouvindo
// música; o vento vem da direita e leva o cabelo para trás. Cada mecha que
// balança é um <svg> próprio, recortado pela caixa dela, girando em volta da
// raiz (o pivô), para o navegador só compor a camada.

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
  // caixa no sistema da personagem: x, y, largura, altura
  box: [number, number, number, number]
  // ponto em volta do qual a peça gira
  pivot: [number, number]
  shapes: Shape[]
}

export const INK = '#2b1055'
const HAIR = '#4d2b93'
const HAIR_D = '#33196e'
const HAIR_L = '#8d67e0'
const HAIR_S = '#ff9ad2'
const SKIN = '#ffe7d8'
const SKIN_D = '#f7b5ae'
const BLUSH = '#ff6fa8'
const JACKET = '#96f0ff'
const JACKET_D = '#52c3e3'
const LINING = '#ff8fd0'
const LINING_D = '#e2559f'
const PINK = '#ff4fa3'
const PINK_D = '#d42a80'
const YELLOW = '#ffe14d'
const CREAM = '#fff6c4'
const CYAN_FRINGE = '#3fe9ff'
const PINK_FRINGE = '#ff3d9a'

// ============ Garota (caixa 360×560) ============
export const GIRL_W = 360
export const GIRL_H = 560

// franja de aberração cromática: a mesma forma deslocada em ciano/magenta
const fringe = (d: string, k = 5): Shape[] => [
  { d, fill: CYAN_FRINGE, o: 0.55, dx: -k },
  { d, fill: PINK_FRINGE, o: 0.5, dx: k },
]

// --- mechas ao vento (atrás de tudo) ---
const LOCK_A =
  'M152 62C122 50 88 52 58 62C36 70 12 68 -16 56C0 70 14 76 30 80C14 86 -4 88 -26 84C0 98 36 102 64 98C88 96 104 104 114 118Z'
const LOCK_B =
  'M102 118C76 116 48 122 20 132C2 138 -18 138 -38 130C-20 146 -4 152 10 156C-6 164 -24 168 -42 166C-14 184 22 182 48 178C70 176 86 184 96 200Z'
const LOCK_C =
  'M86 198C72 230 52 254 28 270C12 280 -6 284 -26 290C-10 300 4 304 16 306C0 318 -14 330 -30 344C0 342 30 330 54 324C78 318 98 322 112 334Z'
const SIDE_LOCK =
  'M200 148C194 190 194 236 198 274C200 300 196 320 186 340C204 326 210 300 208 272C206 232 206 192 210 154Z'

const lockShapes = (d: string, shade: string, shine: string): Shape[] => [
  ...fringe(d, 4),
  { d, fill: HAIR, stroke: INK, w: 3.5 },
  { d: shade, fill: HAIR_D },
  { d: shine, stroke: HAIR_L, w: 3 },
  { d, stroke: INK, w: 3.5 },
]

export const GIRL_LOCKS: Part[] = [
  {
    box: [-34, 44, 194, 82],
    pivot: [128, 88],
    shapes: lockShapes(
      LOCK_A,
      'M114 118C104 104 88 96 64 98C36 102 0 98 -26 84C4 84 30 84 56 86C84 88 104 98 114 118Z',
      'M140 64C112 58 84 60 58 68C40 74 22 74 4 70',
    ),
  },
  {
    box: [-50, 110, 156, 96],
    pivot: [96, 152],
    shapes: lockShapes(
      LOCK_B,
      'M96 200C86 184 70 176 48 178C22 182 -14 184 -42 166C-10 170 20 168 46 166C70 166 88 178 96 200Z',
      'M92 124C66 124 42 130 18 140C4 145 -10 146 -24 144',
    ),
  },
  {
    box: [-38, 190, 158, 162],
    pivot: [100, 264],
    shapes: lockShapes(
      LOCK_C,
      'M112 334C98 322 78 318 54 324C30 330 0 342 -30 344C2 330 32 316 60 310C84 306 100 316 112 334Z',
      'M80 224C66 250 46 270 24 284C12 292 0 296 -12 298',
    ),
  },
]

export const GIRL_SIDE_LOCK: Part = {
  box: [178, 142, 40, 206],
  pivot: [205, 154],
  shapes: [
    { d: SIDE_LOCK, fill: HAIR, stroke: INK, w: 3 },
    {
      d: 'M205 162C203 200 204 238 206 270C207 294 202 316 192 334C200 314 201 294 199 272C197 236 197 200 205 162Z',
      fill: HAIR_D,
    },
  ],
}

// --- base parada: cabelo de trás, pescoço, rosto, franja, fone, jaqueta ---
const HAIR_MASS =
  'M290 156C296 116 272 72 226 60C186 48 138 56 110 84C84 110 74 152 76 198C78 252 90 302 106 342C118 374 150 394 184 398L202 330C188 300 176 270 170 244Z'
const FACE =
  'M178 150C196 118 236 108 262 124C276 134 282 150 280 168C279 178 276 186 278 194C282 204 288 210 292 218C288 224 282 225 280 226C283 232 285 236 283 240C280 242 279 244 282 247C283 252 281 256 278 258C277 266 274 272 266 278C254 286 236 286 220 280C204 272 190 258 180 242C172 222 170 180 178 150Z'
const NECK = 'M194 246L190 372L270 372L256 274C244 284 222 284 206 272Z'
const BANGS =
  'M168 156C172 104 214 76 256 84C284 90 302 116 296 152Q292 166 286 184Q280 166 274 152Q272 174 264 196Q258 168 250 150Q246 170 236 188Q232 162 226 146Q220 162 210 178Q206 158 200 146Q194 158 186 168Q186 152 182 140Z'
const CUP = 'M136 216a34 34 0 1 0 68 0a34 34 0 1 0 -68 0Z'
const JACKET_L =
  'M200 338C170 348 122 354 86 370C52 384 30 418 26 468L20 560L200 560L214 404Z'
const JACKET_R =
  'M260 338C284 350 300 358 316 368C342 384 356 420 358 470L360 560L262 560L246 404Z'
const COLLAR_L =
  'M200 336C188 324 178 312 166 302C158 324 164 354 182 374L214 406L224 392Z'
const COLLAR_R =
  'M260 336C272 324 282 312 294 302C302 324 296 354 278 374L246 406L236 392Z'

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

export const GIRL_BASE: Shape[] = [
  // franjas do VHS atrás da silhueta (aparecem só na borda)
  ...fringe(HAIR_MASS),
  ...fringe(JACKET_L + JACKET_R),
  ...fringe(BANGS),
  // cabelo de trás: base, sombra de baixo, brilho rosa na nuca
  { d: HAIR_MASS, fill: HAIR, stroke: INK, w: 4 },
  {
    d: 'M78 198C80 252 92 300 108 340C120 372 150 392 184 398L202 330C188 300 176 270 170 246C140 252 108 236 78 198Z',
    fill: HAIR_D,
  },
  {
    d: 'M112 90C130 70 162 58 196 54C166 66 138 82 120 106Z',
    fill: HAIR_S,
  },
  { d: 'M92 150C88 196 94 246 112 296', stroke: HAIR_L, w: 3 },
  // fio do fone descendo até o walkman (fora da tela)
  {
    d: 'M166 250C150 300 178 330 160 382C146 424 118 474 128 566',
    stroke: INK,
    w: 8,
  },
  {
    d: 'M166 250C150 300 178 330 160 382C146 424 118 474 128 566',
    stroke: YELLOW,
    w: 4,
  },
  // pescoço com a sombra do queixo
  { d: NECK, fill: SKIN, stroke: INK, w: 3.5 },
  {
    d: 'M196 250L193 304C214 312 240 306 260 296L256 274C244 284 222 284 206 272Z',
    fill: SKIN_D,
  },
  // camiseta, jaqueta oversized de ombreira e gola levantada
  { d: 'M194 334L268 334L266 566L196 566Z', fill: CREAM, stroke: INK, w: 3 },
  { d: 'M198 440L264 440L264 458L198 458Z', fill: LINING },
  { d: heart(231, 488, 12), fill: PINK, stroke: INK, w: 2 },
  { d: JACKET_L, fill: JACKET, stroke: INK, w: 4 },
  { d: JACKET_R, fill: JACKET, stroke: INK, w: 4 },
  {
    d: 'M86 370C52 384 30 418 26 468L20 560L112 560C108 500 114 440 138 398C118 392 100 382 86 370Z',
    fill: JACKET_D,
  },
  {
    d: 'M246 404L262 560L300 560C292 500 284 450 270 412Z',
    fill: JACKET_D,
  },
  {
    d: 'M300 366C324 378 342 398 352 426C340 406 322 392 296 380Z',
    fill: '#ffffff',
  },
  { d: 'M150 410C142 440 140 480 144 520', stroke: INK, w: 2.4 },
  { d: 'M318 420C326 452 330 490 330 530', stroke: INK, w: 2.4 },
  { d: COLLAR_L, fill: LINING, stroke: INK, w: 3.5 },
  { d: COLLAR_R, fill: LINING, stroke: INK, w: 3.5 },
  {
    d: 'M170 312C168 334 176 356 190 370L206 386C196 368 184 344 170 312Z',
    fill: LINING_D,
  },
  // broche de estrela na lapela
  { d: star(92, 452, 17), fill: YELLOW, stroke: INK, w: 2.6 },
  { d: star(92, 452, 7), fill: '#ffffff' },
  // rosto: pele, sombra da franja na testa
  { d: FACE, fill: SKIN, stroke: INK, w: 3.5 },
  {
    d: 'M182 168Q196 160 210 186Q222 168 236 196Q248 176 264 204Q272 182 284 192L282 160L180 146Z',
    fill: SKIN_D,
  },
  // bochecha corada, boca, nariz
  { d: 'M236 233a15 6.5 0 1 0 30 0a15 6.5 0 1 0 -30 0Z', fill: BLUSH, o: 0.5 },
  {
    d: 'M240 238L246 229M248 239L254 230M256 240L262 231',
    stroke: '#ff3d8b',
    w: 2,
  },
  { d: 'M271 247Q277 251 282 247', stroke: INK, w: 2.4 },
  { d: 'M280 221L285 222', stroke: INK, w: 1.8 },
  // olho fechado (curtindo a música): sobrancelha, pálpebra, cílios
  { d: 'M232 186Q247 178 263 183', stroke: INK, w: 3 },
  { d: 'M228 207Q244 218 261 206', stroke: INK, w: 4 },
  { d: 'M229 207L219 201M232 211L222 213', stroke: INK, w: 3 },
  // franja pontuda por cima, com o anel de brilho
  { d: BANGS, fill: HAIR, stroke: INK, w: 3.5 },
  {
    d: 'M300 150Q296 168 286 184Q284 170 280 160Q290 158 300 150Z',
    fill: HAIR_D,
  },
  {
    d: 'M188 112Q220 90 256 94Q280 98 292 116L284 120L276 108L268 120L258 106L248 118L238 104L226 116L216 102L204 114Z',
    fill: HAIR_L,
  },
  { d: 'M214 98Q236 90 258 96', stroke: '#ffffff', w: 2.6, o: 0.8 },
  // fone: arco amarelo, concha rosa com coração (o LED brilha por cima)
  {
    d: 'M168 190C160 142 170 98 200 72C214 62 228 56 246 54',
    stroke: INK,
    w: 15,
  },
  {
    d: 'M168 190C160 142 170 98 200 72C214 62 228 56 246 54',
    stroke: YELLOW,
    w: 9,
  },
  { d: 'M170 150C170 120 180 100 196 86', stroke: '#ffffff', w: 2.4, o: 0.8 },
  { d: 'M160 176L176 176L178 200L162 200Z', fill: PINK, stroke: INK, w: 3 },
  { d: CUP, fill: PINK, stroke: INK, w: 4 },
  { d: 'M140 230A34 34 0 0 0 196 240A30 30 0 0 1 140 230Z', fill: PINK_D },
  { d: 'M148 194A30 30 0 0 1 192 196', stroke: '#ffffff', w: 3, o: 0.7 },
  {
    d: 'M149 216a21 21 0 1 0 42 0a21 21 0 1 0 -42 0Z',
    fill: YELLOW,
    stroke: INK,
    w: 3,
  },
  { d: heart(170, 217, 10), fill: '#ff2e93' },
]

// olho aberto com brilho (piscadela dos eventos e da vitória)
export const GIRL_EYE: Shape[] = [
  { d: 'M224 206a22 14 0 1 0 44 0a22 14 0 1 0 -44 0Z', fill: SKIN },
  {
    d: 'M228 205Q236 190 254 190Q264 192 265 201Q263 214 255 220Q239 223 230 214Z',
    fill: '#ffffff',
  },
  { d: 'M240 205a10 13 0 1 0 20 0a10 13 0 1 0 -20 0Z', fill: HAIR },
  { d: 'M240 206A10 13 0 0 0 260 206Z', fill: '#c65ddd' },
  { d: 'M246 204a4.5 6 0 1 0 9 0a4.5 6 0 1 0 -9 0Z', fill: '#1d0b33' },
  { d: 'M240.5 198a4.5 4.5 0 1 0 9 0a4.5 4.5 0 1 0 -9 0Z', fill: '#ffffff' },
  { d: 'M252 213a2.2 2.2 0 1 0 4.4 0a2.2 2.2 0 1 0 -4.4 0Z', fill: '#ffffff' },
  { d: 'M225 204Q236 186 256 187Q266 189 267 198', stroke: INK, w: 4.5 },
  { d: 'M227 204L216 197M229 209L219 210', stroke: INK, w: 3 },
  { d: 'M234 221Q246 225 257 220', stroke: INK, w: 1.8 },
]

// noite: a silhueta escurece e ganha luz de borda do neon da cidade
export const GIRL_NIGHT: Shape[] = [
  { d: HAIR_MASS + FACE + NECK + BANGS + CUP, fill: '#3a0d78', o: 0.28 },
  {
    d: 'M194 334L268 334L266 566L196 566Z' + JACKET_L + JACKET_R,
    fill: '#2c0b62',
    o: 0.4,
  },
  { d: COLLAR_L + COLLAR_R, fill: '#3a0d78', o: 0.32 },
  {
    d: 'M262 124C276 134 282 150 280 168C279 178 276 186 278 194C282 204 288 210 292 218',
    stroke: '#7ff3ff',
    w: 3,
  },
  {
    d: 'M283 240C280 242 279 244 282 247C283 252 281 256 278 258C277 266 274 272 266 278',
    stroke: '#7ff3ff',
    w: 3,
  },
  { d: 'M316 368C342 384 356 420 358 470', stroke: '#7ff3ff', w: 4 },
  { d: 'M110 84C84 110 74 152 76 198', stroke: HAIR_S, w: 4 },
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
