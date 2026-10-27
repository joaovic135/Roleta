// Ferramentas de pixel art para a camada de atores (canvas 2D): sprites
// escritos em texto viram canvas pequenos uma única vez (na montagem), com
// espelho, rotação "rotsprite" (Scale2x duas vezes, gira e amostra o
// centro de cada bloco: os pixels continuam nítidos, sem cores novas) e
// uma fonte 5x7 de fliperama com contorno escuro embutido.

export type Grid = (string | null)[][]
export type Sprite = {
  c: HTMLCanvasElement
  w: number
  h: number
  // ponto de ancoragem (mão do herói, pés etc.), em pixels do sprite
  px: number
  py: number
}

export const grid = (rows: string[], colors: Record<string, string>): Grid =>
  rows.map((r) => Array.from(r, (ch) => colors[ch] ?? null))

export const canvas = (w: number, h: number) => {
  const c = document.createElement('canvas')
  c.width = Math.max(1, w)
  c.height = Math.max(1, h)
  const ctx = c.getContext('2d')!
  ctx.imageSmoothingEnabled = false
  return { c, ctx }
}

export const paint = (
  ctx: CanvasRenderingContext2D,
  g: Grid,
  ox = 0,
  oy = 0,
) => {
  for (let y = 0; y < g.length; y++) {
    let x = 0
    const row = g[y]
    while (x < row.length) {
      const col = row[x]
      if (!col) {
        x++
        continue
      }
      let e = x + 1
      while (e < row.length && row[e] === col) e++
      ctx.fillStyle = col
      ctx.fillRect(ox + x, oy + y, e - x, 1)
      x = e
    }
  }
}

export const sprite = (g: Grid, px = 0, py = 0): Sprite => {
  const h = g.length
  const w = Math.max(...g.map((r) => r.length))
  const { c, ctx } = canvas(w, h)
  paint(ctx, g)
  return { c, w, h, px, py }
}

export const art = (
  rows: string[],
  colors: Record<string, string>,
  px = 0,
  py = 0,
) => sprite(grid(rows, colors), px, py)

export const mirror = (g: Grid): Grid => {
  const w = Math.max(...g.map((r) => r.length))
  return g.map((r) => {
    const out: (string | null)[] = []
    for (let x = w - 1; x >= 0; x--) out.push(r[x] ?? null)
    return out
  })
}

export const mirrorSprite = (s: Sprite): Sprite => {
  const { c, ctx } = canvas(s.w, s.h)
  ctx.translate(s.w, 0)
  ctx.scale(-1, 1)
  ctx.drawImage(s.c, 0, 0)
  return { c, w: s.w, h: s.h, px: s.w - s.px, py: s.py }
}

// Scale2x (EPX): dobra o sprite inventando cantos só com cores vizinhas
const scale2x = (g: Grid): Grid => {
  const h = g.length
  const w = Math.max(...g.map((r) => r.length))
  const at = (x: number, y: number) =>
    x < 0 || y < 0 || x >= w || y >= h ? null : (g[y][x] ?? null)
  const out: Grid = Array.from({ length: h * 2 }, () =>
    new Array<string | null>(w * 2).fill(null),
  )
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const p = at(x, y)
      const a = at(x, y - 1)
      const b = at(x + 1, y)
      const c = at(x - 1, y)
      const d = at(x, y + 1)
      out[2 * y][2 * x] = c === a && c !== d && a !== b ? a : p
      out[2 * y][2 * x + 1] = a === b && a !== c && b !== d ? b : p
      out[2 * y + 1][2 * x] = d === c && d !== b && c !== a ? c : p
      out[2 * y + 1][2 * x + 1] = b === d && b !== a && d !== c ? d : p
    }
  return out
}

// gira o sprite em torno de (px, py) (coordenadas de pixel, 0.5 = centro)
export const rotate = (src: Grid, angle: number, px: number, py: number) => {
  const up = scale2x(scale2x(src))
  const sh = src.length
  const sw = Math.max(...src.map((r) => r.length))
  const cos = Math.cos(angle)
  const sin = Math.sin(angle)
  let x0 = Infinity
  let y0 = Infinity
  let x1 = -Infinity
  let y1 = -Infinity
  for (const [cx, cy] of [
    [0, 0],
    [sw, 0],
    [0, sh],
    [sw, sh],
  ]) {
    const dx = cx - px
    const dy = cy - py
    const rx = dx * cos - dy * sin
    const ry = dx * sin + dy * cos
    x0 = Math.min(x0, rx)
    y0 = Math.min(y0, ry)
    x1 = Math.max(x1, rx)
    y1 = Math.max(y1, ry)
  }
  const ox = Math.floor(x0)
  const oy = Math.floor(y0)
  const w = Math.ceil(x1) - ox
  const h = Math.ceil(y1) - oy
  const out: Grid = []
  for (let y = 0; y < h; y++) {
    const row: (string | null)[] = []
    for (let x = 0; x < w; x++) {
      const dx = ox + x + 0.5
      const dy = oy + y + 0.5
      // rotação inversa: de onde veio este pixel
      const sx = (dx * cos + dy * sin + px) * 4
      const sy = (-dx * sin + dy * cos + py) * 4
      const ix = Math.floor(sx)
      const iy = Math.floor(sy)
      row.push(
        ix < 0 || iy < 0 || iy >= up.length || ix >= up[0].length
          ? null
          : up[iy][ix],
      )
    }
    out.push(row)
  }
  return sprite(out, -ox, -oy)
}

// halo de luz (gradiente radial feito uma vez; desenhado com 'lighter')
export const halo = (r: number, color: string, a = 0.6) => {
  const size = r * 2
  const { c, ctx } = canvas(size, size)
  const grad = ctx.createRadialGradient(r, r, 0, r, r, r)
  grad.addColorStop(0, rgba(color, a))
  grad.addColorStop(0.35, rgba(color, a * 0.45))
  grad.addColorStop(1, rgba(color, 0))
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, size, size)
  return { c, w: size, h: size, px: r, py: r } as Sprite
}

export const hexRgb = (hex: string): [number, number, number] => {
  const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(hex.trim())
  if (!m) return [252, 210, 93]
  let v = m[1]
  if (v.length === 3) v = v.replace(/./g, (ch) => ch + ch)
  const n = parseInt(v, 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}
export const rgba = (color: string, a: number) => {
  const [r, g, b] = hexRgb(color)
  return `rgba(${r},${g},${b},${a})`
}
// mistura com branco (k = 0..1): brilho dos fogos e do letreiro
export const tint = (color: string, k: number) => {
  const [r, g, b] = hexRgb(color)
  const m = (v: number) => Math.round(v + (255 - v) * k)
  return `rgb(${m(r)},${m(g)},${m(b)})`
}

// ---------------------------------------------------------------- fonte
// 5x7 com 2 linhas de acento em cima e 1 de descendente (Ç): célula 5x10.
const GLYPHS: Record<string, string> = {
  '0': '.###.|#...#|#..##|#.#.#|##..#|#...#|.###.',
  '1': '..#..|.##..|..#..|..#..|..#..|..#..|.###.',
  '2': '.###.|#...#|....#|...#.|..#..|.#...|#####',
  '3': '#####|...#.|..#..|...#.|....#|#...#|.###.',
  '4': '...#.|..##.|.#.#.|#..#.|#####|...#.|...#.',
  '5': '#####|#....|####.|....#|....#|#...#|.###.',
  '6': '..##.|.#...|#....|####.|#...#|#...#|.###.',
  '7': '#####|....#|...#.|..#..|.#...|.#...|.#...',
  '8': '.###.|#...#|#...#|.###.|#...#|#...#|.###.',
  '9': '.###.|#...#|#...#|.####|....#|...#.|.##..',
  A: '.###.|#...#|#...#|#####|#...#|#...#|#...#',
  B: '####.|#...#|#...#|####.|#...#|#...#|####.',
  C: '.###.|#...#|#....|#....|#....|#...#|.###.',
  D: '###..|#..#.|#...#|#...#|#...#|#..#.|###..',
  E: '#####|#....|#....|####.|#....|#....|#####',
  F: '#####|#....|#....|####.|#....|#....|#....',
  G: '.###.|#...#|#....|#.###|#...#|#...#|.####',
  H: '#...#|#...#|#...#|#####|#...#|#...#|#...#',
  I: '.###.|..#..|..#..|..#..|..#..|..#..|.###.',
  J: '..###|...#.|...#.|...#.|...#.|#..#.|.##..',
  K: '#...#|#..#.|#.#..|##...|#.#..|#..#.|#...#',
  L: '#....|#....|#....|#....|#....|#....|#####',
  M: '#...#|##.##|#.#.#|#.#.#|#...#|#...#|#...#',
  N: '#...#|#...#|##..#|#.#.#|#..##|#...#|#...#',
  O: '.###.|#...#|#...#|#...#|#...#|#...#|.###.',
  P: '####.|#...#|#...#|####.|#....|#....|#....',
  Q: '.###.|#...#|#...#|#...#|#.#.#|#..#.|.##.#',
  R: '####.|#...#|#...#|####.|#.#..|#..#.|#...#',
  S: '.####|#....|#....|.###.|....#|....#|####.',
  T: '#####|..#..|..#..|..#..|..#..|..#..|..#..',
  U: '#...#|#...#|#...#|#...#|#...#|#...#|.###.',
  V: '#...#|#...#|#...#|#...#|#...#|.#.#.|..#..',
  W: '#...#|#...#|#...#|#.#.#|#.#.#|#.#.#|.#.#.',
  X: '#...#|#...#|.#.#.|..#..|.#.#.|#...#|#...#',
  Y: '#...#|#...#|.#.#.|..#..|..#..|..#..|..#..',
  Z: '#####|....#|...#.|..#..|.#...|#....|#####',
  '!': '..#..|..#..|..#..|..#..|..#..|.....|..#..',
  '.': '.....|.....|.....|.....|.....|.....|..#..',
  ',': '.....|.....|.....|.....|.....|..#..|.#...',
  ':': '.....|..#..|.....|.....|.....|..#..|.....',
  '-': '.....|.....|.....|.###.|.....|.....|.....',
  '+': '.....|..#..|..#..|#####|..#..|..#..|.....',
  x: '.....|.....|#...#|.#.#.|..#..|.#.#.|#...#',
  '/': '....#|...#.|...#.|..#..|.#...|.#...|#....',
  '*': '..#..|..#..|#####|.###.|.#.#.|#...#|.....',
  '♥': '.....|.#.#.|#####|#####|.###.|..#..|.....',
  $: '..#..|.####|#.#..|.###.|..#.#|####.|..#..',
  ' ': '.....|.....|.....|.....|.....|.....|.....',
}
const ACCENTS: Record<string, [string, string, string]> = {
  Á: ['A', '...#.', '..#..'],
  Ã: ['A', '.##.#', '#.##.'],
  É: ['E', '...#.', '..#..'],
  Ê: ['E', '..#..', '.#.#.'],
  Í: ['I', '...#.', '..#..'],
  Ó: ['O', '...#.', '..#..'],
  Ô: ['O', '..#..', '.#.#.'],
  Õ: ['O', '.##.#', '#.##.'],
  Ú: ['U', '...#.', '..#..'],
}
export const FONT_CHARS = [...Object.keys(GLYPHS), ...Object.keys(ACCENTS), 'Ç']
const glyphRows = (ch: string): string[] => {
  if (ch === 'Ç') return ['.....', '.....', ...GLYPHS.C.split('|'), '..#..']
  const acc = ACCENTS[ch]
  if (acc) return [acc[1], acc[2], ...GLYPHS[acc[0]].split('|'), '.....']
  return ['.....', '.....', ...(GLYPHS[ch] ?? GLYPHS[' ']).split('|'), '.....']
}
// índice de cada caractere no atlas (Map: nada é alocado ao desenhar)
export const GLYPH_INDEX = new Map<number, number>(
  FONT_CHARS.map((ch, i) => [ch.charCodeAt(0), i]),
)
// célula com 1 pixel de contorno de cada lado: 7 x 12; avanço de 6
export const CELL_W = 7
export const CELL_H = 12
export const ADVANCE = 6

export const fontAtlas = (color: string, outline = '#0a0612') => {
  const { c, ctx } = canvas(FONT_CHARS.length * CELL_W, CELL_H)
  FONT_CHARS.forEach((ch, i) => {
    const rows = glyphRows(ch)
    const ox = i * CELL_W + 1
    ctx.fillStyle = outline
    for (let y = 0; y < rows.length; y++)
      for (let x = 0; x < 5; x++)
        if (rows[y][x] === '#') ctx.fillRect(ox + x - 1, 1 + y - 1, 3, 3)
    ctx.fillStyle = color
    for (let y = 0; y < rows.length; y++)
      for (let x = 0; x < 5; x++)
        if (rows[y][x] === '#') ctx.fillRect(ox + x, 1 + y, 1, 1)
  })
  return c
}

// texto com o atlas (y = topo da linha de acentos; maiúsculas em y + 2)
export const drawText = (
  ctx: CanvasRenderingContext2D,
  atlas: HTMLCanvasElement,
  text: string,
  x: number,
  y: number,
  scale = 1,
) => {
  for (let i = 0; i < text.length; i++) {
    const idx = GLYPH_INDEX.get(text.charCodeAt(i))
    if (idx === undefined) continue
    ctx.drawImage(
      atlas,
      idx * CELL_W,
      0,
      CELL_W,
      CELL_H,
      x + (i * ADVANCE - 1) * scale,
      y - scale,
      CELL_W * scale,
      CELL_H * scale,
    )
  }
}
// número com zeros à esquerda, dígito a dígito (sem criar strings)
export const drawNumber = (
  ctx: CanvasRenderingContext2D,
  atlas: HTMLCanvasElement,
  value: number,
  digits: number,
  x: number,
  y: number,
  scale = 1,
) => {
  let v = Math.max(0, Math.floor(value))
  for (let i = digits - 1; i >= 0; i--) {
    const idx = GLYPH_INDEX.get(48 + (v % 10)) ?? 0
    v = Math.floor(v / 10)
    ctx.drawImage(
      atlas,
      idx * CELL_W,
      0,
      CELL_W,
      CELL_H,
      x + (i * ADVANCE - 1) * scale,
      y - scale,
      CELL_W * scale,
      CELL_H * scale,
    )
  }
}
export const digitsOf = (v: number) =>
  v >= 100000
    ? 6
    : v >= 10000
      ? 5
      : v >= 1000
        ? 4
        : v >= 100
          ? 3
          : v >= 10
            ? 2
            : 1
export const textWidth = (chars: number, scale = 1) =>
  (chars * ADVANCE - 1) * scale
