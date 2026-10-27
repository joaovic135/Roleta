import type { CSSProperties, ReactNode } from 'react'

// Cena de fundo do tema Good Times (só aparece com data-theme="good-times").
// Pôster Future Funk: papel quadriculado, blocos pastel, sol listrado,
// palmeiras e geometria Memphis. Tudo estático no servidor; o movimento
// (ciclo dia → pôr do sol → noite lilás → amanhecer, formas flutuando,
// palmeiras balançando, chuva de confete) fica no theme.css.
// Arte toda original: formas genéricas, sem carros, marcas ou personagens.

// Sorteio de semente fixa: igual no servidor e no navegador
const seeded = (seed: number) => () => {
  seed = (seed + 0x6d2b79f5) | 0
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}
const r1 = (n: number) => Math.round(n * 10) / 10
const vars = (v: Record<string, string>) => v as CSSProperties

// ---- Palmeira (silhueta própria) ----------------------------------------

type Pt = [number, number]
const quad = (a: Pt, b: Pt, c: Pt, t: number): Pt => [
  (1 - t) ** 2 * a[0] + 2 * (1 - t) * t * b[0] + t * t * c[0],
  (1 - t) ** 2 * a[1] + 2 * (1 - t) * t * b[1] + t * t * c[1],
]
const CROWN: Pt = [120, 92]
// [ângulo, comprimento, queda da ponta, arco do meio, largura]
const FRONDS = [
  [-166, 98, 48, 24, 12],
  [-138, 92, 16, 24, 12],
  [-108, 70, 2, 10, 10],
  [-72, 78, 6, 14, 10],
  [-40, 98, 22, 24, 12],
  [-12, 96, 52, 22, 12],
  [172, 78, 62, 14, 10],
]
// Folha arqueada: borda de cima lisa e folíolos pendurados embaixo,
// apontando para a ponta (dente de serra), como uma pena caída
const palmFronds = () =>
  FRONDS.map(([deg, len, droop, arch, width]) => {
    const a = (deg * Math.PI) / 180
    const dir: Pt = [Math.cos(a), Math.sin(a)]
    const tip: Pt = [CROWN[0] + dir[0] * len, CROWN[1] + dir[1] * len + droop]
    const mid: Pt = [
      CROWN[0] + dir[0] * len * 0.55,
      CROWN[1] + dir[1] * len * 0.55 - arch,
    ]
    // normal que aponta para cima na tela
    const up: Pt = dir[0] >= 0 ? [dir[1], -dir[0]] : [-dir[1], dir[0]]
    const w = (t: number) => width * Math.sin(Math.PI * t) ** 0.7
    const at = (t: number, off: number, drop = 0) => {
      const [x, y] = quad(CROWN, mid, tip, t)
      return `${r1(x + up[0] * off)} ${r1(y + up[1] * off + drop)}`
    }
    const steps = 9
    const upper: string[] = []
    const lower: string[] = []
    for (let i = 0; i <= steps; i++) {
      const t = i / steps
      upper.push(at(t, w(t) * 0.45))
      lower.push(at(t, -w(t) * 0.2))
      if (i < steps) {
        const tt = t + 0.6 / steps
        lower.push(at(tt, -w(tt) * 1.25, w(tt) * 0.9))
      }
    }
    return `M${upper.join('L')}L${lower.reverse().join('L')}Z`
  }).join('')

const TRUNK_A: Pt = [100, 320]
const TRUNK_B: Pt = [102, 200]
const PALM_TRUNK = 'M90 320Q94 200 114 94L126 96Q110 200 110 320Z'
const palmRings = () => {
  let d = ''
  for (let i = 1; i < 10; i++) {
    const [x, y] = quad(TRUNK_A, TRUNK_B, CROWN, i / 10)
    const w = 19 - i * 0.8
    d += `M${r1(x - w / 2)} ${r1(y)}q${r1(w / 2)} 4 ${r1(w)} 0`
  }
  return d
}
const PALM_NUTS =
  'M110 98a6 6 0 1 0 12 0a6 6 0 1 0-12 0M121 102a6 6 0 1 0 12 0a6 6 0 1 0-12 0'

const Palm = ({ className }: { className: string }) => (
  <div className={`gt-palm ${className}`}>
    <svg viewBox="0 0 240 320" preserveAspectRatio="xMidYMax meet">
      <path className="gt-palm-trunk" d={PALM_TRUNK} />
      <path className="gt-palm-rings" d={palmRings()} />
      <path className="gt-palm-leaves" d={palmFronds()} />
      <path className="gt-palm-nuts" d={PALM_NUTS} />
    </svg>
  </div>
)

// ---- Formas Memphis -------------------------------------------------------

const dotDisc = () => {
  let d = ''
  for (let y = 14; y <= 86; y += 12)
    for (let x = 14; x <= 86; x += 12)
      if ((x - 50) ** 2 + (y - 50) ** 2 <= 38 ** 2) d += `M${x} ${y}h0`
  return d
}
const DOT_DISC = dotDisc()

// Contorno e sombra pretos (traço Memphis); cor de cada forma por atributo
const K = '#1b1726'
const SHAPES: Record<string, (color: string) => ReactNode> = {
  squiggle: (c) => (
    <>
      <path
        d="M8 54q10-24 21 0t21 0t21 0t21 0"
        fill="none"
        stroke={K}
        strokeWidth="9"
      />
      <path
        d="M5 50q10-24 21 0t21 0t21 0t21 0"
        fill="none"
        stroke={c}
        strokeWidth="9"
      />
    </>
  ),
  zigzag: (c) => (
    <>
      <path
        d="M9 66l14-24l14 24l14-24l14 24l14-24l14 24"
        fill="none"
        stroke={K}
        strokeWidth="8"
      />
      <path
        d="M6 62l14-24l14 24l14-24l14 24l14-24l14 24"
        fill="none"
        stroke={c}
        strokeWidth="8"
      />
    </>
  ),
  tri: (c) => (
    <>
      <path fill={K} d="M56 16L94 88H18Z" />
      <path d="M50 10L88 82H12Z" fill={c} stroke={K} strokeWidth="4.5" />
      <path d="M34 64h32M42 50h16" fill="none" stroke={K} strokeWidth="4" />
    </>
  ),
  ring: (c) => (
    <>
      <circle
        cx="50"
        cy="50"
        r="36"
        fill="none"
        stroke={c}
        strokeWidth="9"
        strokeDasharray="0 15"
      />
      <circle cx="50" cy="50" r="18" fill={c} stroke={K} strokeWidth="4.5" />
    </>
  ),
  dots: (c) => <path d={DOT_DISC} fill="none" stroke={c} strokeWidth="6" />,
  half: (c) => (
    <>
      <path fill={K} d="M14 66A38 38 0 0 1 90 66Z" />
      <path
        d="M10 62A38 38 0 0 1 86 62Z"
        fill={c}
        stroke={K}
        strokeWidth="4.5"
      />
      <path
        d="M28 62A20 20 0 0 1 68 62"
        fill="none"
        stroke={K}
        strokeWidth="4"
      />
    </>
  ),
  cross: (c) => (
    <>
      <path d="M54 24v60M24 54h60" fill="none" stroke={K} strokeWidth="14" />
      <path d="M50 20v60M20 50h60" fill="none" stroke={c} strokeWidth="14" />
    </>
  ),
  stripes: (c) => (
    <>
      <path fill={K} d="M16 26h74v60h-74z" />
      <path d="M10 20h74v60h-74z" fill={c} stroke={K} strokeWidth="4.5" />
      <path
        d="M22 80L50 20M40 80L68 20M58 80L84 24"
        fill="none"
        stroke={K}
        strokeWidth="4"
      />
    </>
  ),
}

// [forma, cor, camada, posição, tamanho (vh), giro base, animação]
type Shape = {
  kind: keyof typeof SHAPES
  color: string
  pos: CSSProperties
  size: number
  rot: number
  spin?: boolean
}
const PINK = '#ff8fcf'
const CYAN = '#7fe3ff'
const YELLOW = '#fff36b'
const LILAC = '#c4a6ff'
const MINT = '#8ff0c1'
const INK = K

const FAR: Shape[] = [
  {
    kind: 'dots',
    color: INK,
    pos: { left: '69vw', top: '1.5vh' },
    size: 8,
    rot: 0,
  },
  {
    kind: 'ring',
    color: CYAN,
    pos: { left: '2.5vw', top: '31vh' },
    size: 9,
    rot: 0,
    spin: true,
  },
  {
    kind: 'dots',
    color: LILAC,
    pos: { right: '5vw', top: '50vh' },
    size: 9,
    rot: 0,
  },
  {
    kind: 'half',
    color: MINT,
    pos: { left: '39vw', top: '7vh' },
    size: 4.5,
    rot: 180,
  },
  {
    kind: 'cross',
    color: YELLOW,
    pos: { left: '1.5vw', top: '47vh' },
    size: 4.5,
    rot: 20,
  },
  {
    kind: 'stripes',
    color: CYAN,
    pos: { left: '59vw', bottom: '1vh' },
    size: 5,
    rot: -12,
  },
]
const NEAR: Shape[] = [
  {
    kind: 'squiggle',
    color: PINK,
    pos: { left: '31vw', top: '3vh' },
    size: 9,
    rot: -6,
  },
  {
    kind: 'zigzag',
    color: CYAN,
    pos: { left: '46vw', top: '4vh' },
    size: 9,
    rot: 8,
  },
  {
    kind: 'tri',
    color: YELLOW,
    pos: { left: '56vw', top: '1vh' },
    size: 7,
    rot: 12,
    spin: true,
  },
  {
    kind: 'half',
    color: LILAC,
    pos: { left: '77vw', top: '4vh' },
    size: 7,
    rot: -14,
  },
  {
    kind: 'zigzag',
    color: INK,
    pos: { left: '1vw', top: '18vh' },
    size: 8,
    rot: 84,
  },
  {
    kind: 'tri',
    color: PINK,
    pos: { left: '5vw', top: '55vh' },
    size: 6,
    rot: -18,
    spin: true,
  },
  {
    kind: 'half',
    color: PINK,
    pos: { right: '1vw', top: '1.5vh' },
    size: 7,
    rot: 24,
  },
  {
    kind: 'squiggle',
    color: YELLOW,
    pos: { right: '0.5vw', top: '60vh' },
    size: 9,
    rot: 74,
  },
  {
    kind: 'tri',
    color: CYAN,
    pos: { right: '5vw', top: '69vh' },
    size: 6,
    rot: 30,
    spin: true,
  },
  {
    kind: 'zigzag',
    color: PINK,
    pos: { left: '38vw', bottom: '1.5vh' },
    size: 6,
    rot: 0,
  },
]

const ShapeLayer = ({ shapes, seed }: { shapes: Shape[]; seed: number }) => {
  const rand = seeded(seed)
  return shapes.map((s, i) => (
    <div
      key={i}
      className="gt-shape"
      style={{
        ...s.pos,
        width: `${s.size}vh`,
        ...vars({
          '--r': `${s.rot}deg`,
          '--d': `${r1(6 + rand() * 6)}s`,
          '--dl': `-${r1(rand() * 12)}s`,
          '--a': `${Math.round(5 + rand() * 7)}px`,
        }),
      }}
    >
      <svg
        viewBox="0 0 100 100"
        className={s.spin ? 'gt-spin' : undefined}
        style={
          s.spin
            ? vars({ '--sd': `${Math.round(30 + rand() * 40)}s` })
            : undefined
        }
      >
        {SHAPES[s.kind](s.color)}
      </svg>
    </div>
  ))
}

// ---- Confete (traços curtos e pontos), poucos <path> por cor ------------

const CONFETTI_COLORS = [
  'pink',
  'cyan',
  'yellow',
  'lilac',
  'mint',
  'ink',
] as const
// Bordas da tela: o centro fica calmo (lá ficam os cards)
const edgePoint = (rand: () => number): Pt => {
  for (;;) {
    const x = rand() * 1000
    const y = rand() * 1000
    const center = x > 170 && x < 900 && y > 120 && y < 930
    if (!center || rand() < 0.08) return [x, y]
  }
}
const confetti = (seed: number, count: number, len: number) => {
  const rand = seeded(seed)
  const byColor: Record<string, string> = {}
  for (let i = 0; i < count; i++) {
    const [x, y] = edgePoint(rand)
    const color = CONFETTI_COLORS[Math.floor(rand() * CONFETTI_COLORS.length)]
    const a = rand() * Math.PI
    const l = rand() < 0.3 ? 0 : len * (0.6 + rand() * 0.8)
    byColor[color] =
      (byColor[color] ?? '') +
      `M${r1(x)} ${r1(y)}l${r1(Math.cos(a) * l * 0.55)} ${r1(Math.sin(a) * l)}`
  }
  return Object.entries(byColor)
}

const Confetti = ({
  seed,
  count,
  len,
}: {
  seed: number
  count: number
  len: number
}) => (
  <svg
    className="gt-confetti"
    viewBox="0 0 1000 1000"
    preserveAspectRatio="none"
  >
    {confetti(seed, count, len).map(([color, d]) => (
      <path key={color} className={`gt-c-${color}`} d={d} />
    ))}
  </svg>
)

// ---- Estrelas da noite lilás -----------------------------------------------

const stars = (seed: number, count: number) => {
  const rand = seeded(seed)
  let d = ''
  for (let i = 0; i < count; i++) {
    const [x, y] = edgePoint(rand)
    d += `M${r1(x)} ${r1(y * 0.8)}h0`
  }
  return d
}
const SPARKLE =
  'M50 0Q52.5 47.5 100 50Q52.5 52.5 50 100Q47.5 52.5 0 50Q47.5 47.5 50 0Z'
const NIGHT_SPARKS: [string, string, string][] = [
  ['34vw', '9vh', '3.2vh'],
  ['63vw', '2vh', '2.4vh'],
  ['3vw', '8vh', '2.8vh'],
  ['94vw', '42vh', '2.6vh'],
  ['83vw', '9vh', '2vh'],
]
// Brilhos de anime que piscam de vez em quando (qualquer hora do dia)
const GLINTS: [string, string, string][] = [
  ['12vw', '62vh', '4vh'],
  ['52vw', '6vh', '3vh'],
  ['90vw', '33vh', '3.4vh'],
  ['4vw', '88vh', '2.6vh'],
  ['74vw', '2vh', '2.4vh'],
  ['96vw', '84vh', '3vh'],
]

const Sparkles = ({
  list,
  className,
  seed,
}: {
  list: [string, string, string][]
  className: string
  seed: number
}) => {
  const rand = seeded(seed)
  return list.map(([left, top, size]) => (
    <svg
      key={left + top}
      viewBox="0 0 100 100"
      className={className}
      style={{
        left,
        top,
        width: size,
        ...vars({
          '--d': `${r1(5 + rand() * 9)}s`,
          '--dl': `-${r1(rand() * 14)}s`,
        }),
      }}
    >
      <path d={SPARKLE} />
    </svg>
  ))
}

export default function GoodTimesScene() {
  return (
    <>
      {/* céu: entardecer e noite cruzam a opacidade sobre o papel */}
      <div className="gt-sky gt-sky-dusk" />
      <div className="gt-sky gt-sky-night" />
      <div className="gt-grid" />

      {/* blocos de cor pastel com contorno preto */}
      <div className="gt-block gt-block-yellow" />
      <div className="gt-block gt-block-cyan" />
      <div className="gt-block gt-block-pink" />
      <div className="gt-block gt-block-lilac" />

      {/* sol listrado que se põe atrás do horizonte e volta no amanhecer */}
      <div className="gt-cycle gt-sun-path">
        <div className="gt-sun-glow" />
        <div className="gt-sun" />
        <div className="gt-cycle gt-sun gt-sun-hot" />
      </div>

      <div className="gt-layer gt-layer-far">
        <Confetti seed={77} count={90} len={14} />
        <ShapeLayer shapes={FAR} seed={5} />
      </div>

      <div className="gt-horizon" />
      <Palm className="gt-palm-1" />
      <Palm className="gt-palm-2" />
      <Palm className="gt-palm-3" />

      <div className="gt-layer gt-layer-near">
        <Confetti seed={1984} count={46} len={22} />
        <ShapeLayer shapes={NEAR} seed={11} />
      </div>

      {/* lens flare de anime sobre o sol (só de dia), à frente das palmeiras */}
      <div className="gt-cycle gt-flare">
        <i className="gt-flare-streak" />
        <i className="gt-flare-ghost" />
        <i className="gt-flare-ghost" />
        <svg viewBox="0 0 100 100" className="gt-flare-star">
          <path d={SPARKLE} />
        </svg>
      </div>

      <p className="gt-kanji" lang="ja">
        良い時
      </p>
      <p className="gt-script">Yoi Toki</p>

      {/* noite: tom lilás por cima de tudo, lua e estrelas acima dele */}
      <div className="gt-cycle gt-shade" />
      <div className="gt-cycle gt-night">
        <svg
          className="gt-stars gt-stars-a"
          viewBox="0 0 1000 1000"
          preserveAspectRatio="none"
        >
          <path d={stars(3, 40)} />
        </svg>
        <svg
          className="gt-stars gt-stars-b"
          viewBox="0 0 1000 1000"
          preserveAspectRatio="none"
        >
          <path d={stars(9, 34)} />
        </svg>
        <Sparkles list={NIGHT_SPARKS} className="gt-twinkle" seed={21} />
      </div>
      <div className="gt-cycle gt-moon">
        <svg viewBox="0 0 100 100">
          <path d="M58 8A42 42 0 1 0 92 70A34 34 0 1 1 58 8Z" />
        </svg>
      </div>

      {/* chuva rápida de confete pastel, duas vezes por ciclo */}
      <div className="gt-cycle gt-rain">
        <div className="gt-rain-fall" />
      </div>
      <Sparkles list={GLINTS} className="gt-glint" seed={42} />
    </>
  )
}
