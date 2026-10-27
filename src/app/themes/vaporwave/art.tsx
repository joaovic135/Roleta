import { em, n, seeded, vars } from './lib'

// Ilustrações estáticas da cena (SVG gerado uma vez, no carregamento do
// módulo). Nada aqui anima por dentro: o CSS move só os invólucros HTML.

const pt = (x: number, y: number) => `${n(x)} ${n(y)}`

// ------------------------------------------------------------------ sol
// Máscara do sol: metade de cima inteira, embaixo faixas que afinam
// (os vãos crescem em direção ao horizonte)
const sunMask = () => {
  const stops = ['#000 0 50%']
  let y = 50
  for (let i = 0; y < 100; i++) {
    const gap = 0.7 + i * 0.42
    const bar = Math.max(1.4, 4.4 - i * 0.36)
    stops.push(`transparent ${n(y)}% ${n(y + gap)}%`)
    y += gap
    stops.push(`#000 ${n(y)}% ${n(y + bar)}%`)
    y += bar
  }
  return `linear-gradient(to bottom, ${stops.join(', ')})`
}
export const SUN_MASK = sunMask()

// -------------------------------------------------------------- brilhos
// estrelinhas de 4 pontas no céu (dois grupos que piscam alternados)
const sparkle = (x: number, y: number, s: number) =>
  `M${pt(x, y - s)}Q${pt(x, y)} ${pt(x + s, y)}Q${pt(x, y)} ${pt(x, y + s)}` +
  `Q${pt(x, y)} ${pt(x - s, y)}Q${pt(x, y)} ${pt(x, y - s)}Z`

const SPARKS: [number, number, number, number][] = [
  // [x (0..1920), y, tamanho, grupo]
  [70, 40, 9, 0],
  [150, 250, 6, 1],
  [40, 520, 7, 0],
  [610, 30, 7, 1],
  [700, 78, 5, 0],
  [1200, 22, 8, 0],
  [1290, 70, 5, 1],
  [1500, 50, 6, 1],
  [1780, 300, 8, 0],
  [1880, 120, 6, 1],
  [1850, 470, 5, 0],
  [1640, 18, 5, 0],
]
export const Sparkles = ({ group }: { group: number }) => (
  <svg
    className={`vw-sparks vw-sparks-${group}`}
    viewBox="0 0 1920 600"
    preserveAspectRatio="xMidYMin slice"
  >
    <path
      d={SPARKS.filter((s) => s[3] === group)
        .map(([x, y, s]) => sparkle(x, y, s))
        .join('')}
    />
  </svg>
)

// --------------------------------------------------------------- nuvens
const cloudPuffs = (seed: number) => {
  const rand = seeded(seed)
  const puffs: [number, number, number][] = []
  for (let x = 34; x < 270; x += 26 + rand() * 18) {
    const mid = 1 - Math.abs(x - 150) / 150
    const r = 16 + mid * 26 + rand() * 10
    puffs.push([x, 92 - r * 0.75 - rand() * 6, r])
  }
  return puffs
}
const CLOUDS = [11, 23, 37].map(cloudPuffs)

export const CloudDefs = () => (
  <svg className="vw-defs" aria-hidden="true">
    <defs>
      <linearGradient
        id="vw-cloud-g"
        gradientUnits="userSpaceOnUse"
        x1="0"
        y1="10"
        x2="0"
        y2="104"
      >
        <stop offset="0" stopColor="#ffffff" />
        <stop offset="0.55" stopColor="#ffe3f4" />
        <stop offset="1" stopColor="#d9bdff" />
      </linearGradient>
      <linearGradient id="vw-marble" x1="0" y1="0" x2="1" y2="0.35">
        <stop offset="0" stopColor="#cfc6f2" />
        <stop offset="0.38" stopColor="#f3eefc" />
        <stop offset="0.75" stopColor="#ffffff" />
        <stop offset="1" stopColor="#ffe6f1" />
      </linearGradient>
      <linearGradient id="vw-marble-col" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#c7bdec" />
        <stop offset="0.45" stopColor="#f6f2fd" />
        <stop offset="0.8" stopColor="#ffffff" />
        <stop offset="1" stopColor="#ffd9ec" />
      </linearGradient>
      <linearGradient id="vw-palm-g" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#4a2380" />
        <stop offset="1" stopColor="#7c3596" />
      </linearGradient>
      <linearGradient id="vw-trunk-g" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#4d2683" />
        <stop offset="0.6" stopColor="#6c3194" />
        <stop offset="1" stopColor="#b44fa6" />
      </linearGradient>
      <linearGradient id="vw-dol-g" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#3a2aa8" />
        <stop offset="0.5" stopColor="#6f5ff0" />
        <stop offset="1" stopColor="#bfe9ff" />
      </linearGradient>
      <linearGradient id="vw-tv-g" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#f6eddc" />
        <stop offset="1" stopColor="#d8c6ad" />
      </linearGradient>
      <linearGradient id="vw-mtn-g" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#f4c4ff" />
        <stop offset="1" stopColor="#a98cf2" />
      </linearGradient>
    </defs>
  </svg>
)

export const Cloud = ({ k }: { k: number }) => (
  <svg viewBox="0 0 300 110" className="vw-cloud-svg">
    <g fill="url(#vw-cloud-g)">
      {CLOUDS[k % CLOUDS.length].map(([x, y, r], i) => (
        <circle key={i} cx={n(x)} cy={n(y)} r={n(r)} />
      ))}
      <rect x="22" y="78" width="256" height="26" rx="13" />
    </g>
  </svg>
)

// ------------------------------------------------------------ montanhas
const mountains = (seed: number) => {
  const rand = seeded(seed)
  const W = 800
  const B = 160
  const peaks: [number, number][] = [[0, B - 120]]
  let x = 0
  while (x < W - 40) {
    x += 50 + rand() * 60
    const edge = 1 - x / W // mais altas na borda de fora
    const peak = peaks.length % 2 === 1
    const h = peak ? 50 + edge * 90 + rand() * 30 : 18 + rand() * 30
    peaks.push([Math.min(x, W), B - h])
  }
  peaks.push([W, B - 6])
  const outline =
    `M0 ${B}L` + peaks.map(([px, py]) => pt(px, py)).join('L') + `L${W} ${B}Z`
  let lines = ''
  for (let i = 1; i < peaks.length - 1; i++) {
    const [px, py] = peaks[i]
    if (py > B - 40) continue
    // arestas descendo do pico (facetas de wireframe)
    for (const f of [-0.6, -0.25, 0.2, 0.55])
      lines += `M${pt(px, py)}L${pt(px + f * (B - py), B)}`
  }
  for (let y = B - 12; y > 10; y -= 14) lines += `M0 ${y}H${W}`
  return { outline, lines }
}
const MTN = [mountains(5), mountains(9)]

export const Mountains = ({ side }: { side: 0 | 1 }) => (
  <svg
    className={`vw-mtn vw-mtn-${side}`}
    viewBox="0 0 800 160"
    preserveAspectRatio="none"
  >
    <clipPath id={`vw-mtn-clip-${side}`}>
      <path d={MTN[side].outline} />
    </clipPath>
    <path d={MTN[side].outline} fill="url(#vw-mtn-g)" />
    <path
      className="vw-mtn-lines"
      d={MTN[side].lines}
      clipPath={`url(#vw-mtn-clip-${side})`}
    />
    <path className="vw-mtn-edge" d={MTN[side].outline} />
  </svg>
)

// --------------------------------------------------------------- mar
// reflexo do sol (faixas que encurtam para baixo) e brilhos espalhados
const REFLECT = (() => {
  let d = ''
  for (let i = 0; i < 9; i++) {
    const y = 4 + i * 9 + i * i * 0.6
    const w = 300 - i * 26
    d += `M${pt(400 - w / 2, y)}h${n(w)}v${n(2 + i * 0.5)}h${n(-w)}z`
  }
  return d
})()
export const Reflection = () => (
  <svg className="vw-reflect" viewBox="0 0 800 140">
    <path d={REFLECT} />
  </svg>
)

const glints = (seed: number) => {
  const rand = seeded(seed)
  let d = ''
  for (let i = 0; i < 70; i++) {
    const y = Math.pow(rand(), 1.6) * 300
    const x = rand() * 1920
    const w = 6 + (y / 300) * 22 + rand() * 10
    d += `M${pt(x, y)}h${n(w)}v${n(1.2 + y / 160)}h${n(-w)}z`
  }
  return d
}
const GLINTS = [glints(3), glints(8)]
export const Glints = ({ k }: { k: 0 | 1 }) => (
  <svg
    className={`vw-glints vw-glints-${k}`}
    viewBox="0 0 1920 300"
    preserveAspectRatio="none"
  >
    <path d={GLINTS[k]} />
  </svg>
)

// ------------------------------------------------------------- palmeiras
type Pt = [number, number]
const quad = (a: Pt, c: Pt, b: Pt, t: number): Pt => [
  (1 - t) ** 2 * a[0] + 2 * (1 - t) * t * c[0] + t * t * b[0],
  (1 - t) ** 2 * a[1] + 2 * (1 - t) * t * c[1] + t * t * b[1],
]
const quadTan = (a: Pt, c: Pt, b: Pt, t: number): Pt => {
  const x = 2 * (1 - t) * (c[0] - a[0]) + 2 * t * (b[0] - c[0])
  const y = 2 * (1 - t) * (c[1] - a[1]) + 2 * t * (b[1] - c[1])
  const l = Math.hypot(x, y) || 1
  return [x / l, y / l]
}

const trunk = (h: number, lean: number) => {
  const a: Pt = [0, 0]
  const c: Pt = [lean * h * 0.08, -h * 0.55]
  const b: Pt = [lean * h, -h]
  const left: string[] = []
  const right: string[] = []
  let rings = ''
  const N = 26
  for (let i = 0; i <= N; i++) {
    const t = i / N
    const [x, y] = quad(a, c, b, t)
    const [tx, ty] = quadTan(a, c, b, t)
    const w = (22 - 11 * t + (t < 0.1 ? (0.1 - t) * 60 : 0)) / 2
    left.push(pt(x + ty * w, y - tx * w))
    right.unshift(pt(x - ty * w, y + tx * w))
  }
  for (let t = 0.04; t < 0.97; t += 0.045) {
    const [x, y] = quad(a, c, b, t)
    const [tx, ty] = quadTan(a, c, b, t)
    const w = (22 - 11 * t) / 2
    // marcas em "v" do tronco
    rings +=
      `M${pt(x + ty * w, y - tx * w)}` +
      `Q${pt(x + tx * 5, y + ty * 5)} ${pt(x - ty * w, y + tx * w)}`
  }
  return { d: `M${left.join('L')}L${right.join('L')}Z`, rings, top: b }
}

const frond = (ang: number, len: number, droop: number, wid: number) => {
  const a = (ang * Math.PI) / 180
  const s0: Pt = [0, 0]
  const e: Pt = [Math.cos(a) * len, Math.sin(a) * len + droop]
  const c: Pt = [Math.cos(a) * len * 0.5, Math.sin(a) * len * 0.5 - len * 0.32]
  const up: string[] = []
  const down: string[] = []
  const N = 18
  for (let i = 0; i <= N; i++) {
    const t = i / N
    const [x, y] = quad(s0, c, e, t)
    const [tx, ty] = quadTan(s0, c, e, t)
    // normal apontando para "cima" da folha
    let nx = ty
    let ny = -tx
    if (ny > 0) {
      nx = -nx
      ny = -ny
    }
    const w = wid * Math.sin(Math.PI * Math.min(1, t * 1.08)) * (1 - 0.3 * t)
    const tooth = i % 2 ? 1.3 : 0.55
    up.push(pt(x + nx * w * 0.35, y + ny * w * 0.35))
    down.unshift(
      pt(x - nx * w * tooth + tx * 4 * tooth, y - ny * w * tooth + ty * 4),
    )
  }
  return `M${up.join('L')}L${down.join('L')}Z`
}

const crown = (seed: number, size: number) => {
  const rand = seeded(seed)
  const angles = [-166, -134, -104, -76, -48, -18, 14, 196]
  let d = ''
  for (const ang of angles) {
    const len = size * (0.8 + rand() * 0.35)
    const droop = size * (0.25 + rand() * 0.25)
    d += frond(ang + rand() * 8 - 4, len, droop, size * 0.16)
  }
  let nuts = ''
  for (const [x, y] of [
    [-6, 8],
    [5, 10],
    [0, 15],
  ])
    nuts += `M${pt(x - 5, y)}a5 5 0 1 0 10 0a5 5 0 1 0 -10 0z`
  return { d, nuts }
}

type PalmSpec = { h: number; lean: number; size: number; seed: number }
export const Palm = ({
  spec,
  className,
}: {
  spec: PalmSpec
  className: string
}) => {
  const tr = trunk(spec.h, spec.lean)
  const cr = crown(spec.seed, spec.size)
  const [tx, ty] = tr.top
  // caixa do tronco em unidades da cena: base em (0,0)
  const minX = Math.min(0, tx) - 30
  const maxX = Math.max(0, tx) + 30
  const R = spec.size * 1.3
  return (
    <div
      className={'vw-palm ' + className}
      style={vars({
        width: em(maxX - minX),
        height: em(spec.h + 10),
        marginLeft: em(minX),
      })}
    >
      <svg
        className="vw-trunk"
        viewBox={`${n(minX)} ${n(-spec.h - 10)} ${n(maxX - minX)} ${n(spec.h + 10)}`}
      >
        <path d={tr.d} fill="url(#vw-trunk-g)" />
        <path className="vw-trunk-rings" d={tr.rings} />
      </svg>
      <div
        className="vw-crown"
        style={vars({
          width: em(R * 2),
          height: em(R * 2),
          left: em(tx - minX - R),
          top: em(spec.h + 10 + ty - R),
        })}
      >
        <svg viewBox={`${n(-R)} ${n(-R)} ${n(R * 2)} ${n(R * 2)}`}>
          <path className="vw-crown-rim" d={cr.d} />
          <path d={cr.d} fill="url(#vw-palm-g)" />
          <path className="vw-nuts" d={cr.nuts} />
        </svg>
      </div>
    </div>
  )
}

// ------------------------------------------------------- busto de mármore
// Cabeça clássica de perfil olhando para a direita (desenho original).
const HEAD =
  'M78 14C95 13 108 22 111 36C113 42 114 46 113 50C113 53 114 55 116 58' +
  'L126 72C127 75 124 77 121 77L116 78C117 80 120 82 119 84' +
  'C118 86 115 86 115 87C117 88 119 90 118 92C117 94 113 95 113 96' +
  'C115 99 118 102 117 106C116 110 113 113 108 114C102 115 96 115 92 118' +
  'C92 128 94 140 98 152L52 152C54 140 56 126 54 112' +
  'C44 106 34 92 32 72C31 48 48 16 78 14Z'
const CHEST = 'M6 214C8 184 30 160 60 150L98 150C128 156 150 180 154 214Z'
const HAIR =
  'M104 28C98 20 88 14 78 14C48 16 31 48 32 72C34 92 44 106 54 112' +
  'C56 104 58 96 62 90C64 80 66 72 70 62C74 54 80 46 88 40' +
  'C94 36 100 32 104 28Z'
const CURLS = [
  [102, 25],
  [93, 18],
  [82, 14],
  [70, 16],
  [59, 21],
  [49, 29],
  [42, 39],
  [37, 51],
  [35, 63],
  [36, 75],
  [39, 87],
  [45, 97],
  [52, 106],
  [62, 33],
  [52, 46],
  [48, 62],
  [50, 78],
  [56, 92],
  [72, 28],
  [62, 52],
]
  .map(
    ([x, y]) =>
      `M${pt(x - 6.5, y)}a6.5 6.5 0 1 0 13 0a6.5 6.5 0 1 0 -13 0z` +
      `M${pt(x - 2.5, y + 1)}a2.6 2.6 0 1 1 5 -1`,
  )
  .join('')
const FOLDS =
  'M30 172C52 178 80 196 96 214M52 160C70 170 98 188 118 214' +
  'M74 152C92 164 118 182 138 212M18 194C34 196 50 204 60 214'
const COLUMN =
  'M12 236H148V250H12ZM20 250H140L128 262H32Z' +
  'M34 262H126L122 384H38ZM22 384H138V392H22ZM14 392H146V402H14Z'
const FLUTES =
  'M46 266V380M58 266V380M70 266V380M82 266V380M94 266V380M106 266V380M116 266V380'

// (o conteúdo de <symbol> é desenhado por <use>, onde o CSS da página não
// chega: as cores ficam como atributos)
const LINE = {
  fill: 'none',
  stroke: '#9d8fd0',
  strokeWidth: 1.1,
  strokeLinecap: 'round',
} as const

export const BustDefs = () => (
  <svg className="vw-defs" aria-hidden="true">
    <defs>
      <symbol id="vw-bust" viewBox="0 0 160 404">
        <path d={COLUMN} fill="url(#vw-marble-col)" />
        <path d={FLUTES} fill="none" stroke="#b6a9e3" strokeWidth="1.4" />
        <path d="M100 300l-8 14l6 9l-7 16M44 270l6 12" {...LINE} />
        <path d={CHEST} fill="url(#vw-marble)" />
        <path
          d={FOLDS}
          fill="none"
          stroke="#c9bdee"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
        <path d="M24 214H136V224H24ZM34 224H126V236H34Z" fill="#e9e1f8" />
        <path d="M24 223H136M34 235H126" {...LINE} stroke="#c3b6ea" />
        <path d={HEAD} fill="url(#vw-marble)" />
        <path
          d="M52 152C54 140 56 126 54 112L72 112C78 124 86 132 92 136L94 152Z"
          fill="#b9aee6"
          opacity="0.45"
        />
        <path d={HAIR} fill="#e7def7" />
        <path d={CURLS} fill="#f4effd" stroke="#c4b8ea" strokeWidth="1" />
        <path
          d="M70 64C78 62 82 70 80 78C79 84 74 86 70 84C72 80 72 72 70 64Z"
          fill="#ece6fa"
          stroke="#ab9edc"
          strokeWidth="1.1"
        />
        <path d="M74 70C77 72 77 78 74 80" {...LINE} />
        <path
          d="M99 56Q104 52 109 55Q104 59 99 56Z"
          fill="#ddd5f4"
          stroke="#9d8fd0"
          strokeWidth="0.9"
        />
        <path
          d="M97 53Q104 47 111 52M96 47Q104 43 112 46M117 76Q120 76 121 73M113 87H118M94 116C100 120 106 118 110 114"
          {...LINE}
        />
        <path
          d="M111 36C113 42 114 46 113 50C113 53 114 55 116 58L126 72"
          fill="none"
          stroke="#ffd6a8"
          strokeWidth="2.2"
          strokeLinecap="round"
          opacity="0.8"
        />
      </symbol>
      <symbol id="vw-bust-sil" viewBox="0 0 160 404">
        <path d={HEAD + CHEST} />
      </symbol>
    </defs>
  </svg>
)

// --------------------------------------------------------------- golfinho
export const DOLPHIN =
  'M118 33C114 31 108 31 104 30C101 25 98 22 94 21C84 14 70 12 56 14' +
  'L50 2C47 6 45 11 44 16C34 19 24 23 15 27C11 22 6 17 1 15C3 21 6 26 9 29' +
  'C5 33 2 38 1 43C7 40 12 36 16 32C30 37 46 41 62 41C70 47 76 50 80 50' +
  'C78 46 76 43 76 40C88 39 98 38 106 36C110 35 115 35 118 33Z'
export const DOLPHIN_BELLY =
  'M104 34C92 38 74 40 60 39C48 38 34 35 22 31C36 33 52 35 66 35C80 35 94 34 104 34Z'

export const Dolphin = () => (
  <svg className="vw-dol-svg" viewBox="0 0 120 52">
    <path
      d={DOLPHIN}
      fill="url(#vw-dol-g)"
      stroke="#ffffff"
      strokeWidth="1.3"
      strokeOpacity="0.85"
    />
    <path d={DOLPHIN_BELLY} fill="#ffffff" opacity="0.75" />
    <circle cx="101" cy="27" r="1.6" fill="#2a1452" />
  </svg>
)

// ------------------------------------------------------------- TV de tubo
export const TvBody = () => (
  <svg className="vw-tv-svg" viewBox="0 0 140 146">
    <path className="vw-tv-antenna" d="M70 30L36 3M70 30L108 1" />
    <circle cx="36" cy="3" r="2.6" fill="#ff71ce" />
    <circle cx="108" cy="1" r="2.6" fill="#01cdfe" />
    <path d="M58 34a12 8 0 0 1 24 0Z" fill="#b9a98f" />
    <path d="M10 40L20 30H138L130 40Z" fill="#fbf3e6" />
    <path d="M130 40L138 30V128L130 138Z" fill="#c9b596" />
    <rect x="10" y="40" width="120" height="98" rx="8" fill="url(#vw-tv-g)" />
    <rect x="17" y="47" width="86" height="72" rx="11" fill="#3b3350" />
    <rect
      x="16"
      y="46"
      width="88"
      height="74"
      rx="12"
      fill="none"
      stroke="#fff8ec"
      strokeWidth="1.2"
    />
    <circle cx="117" cy="58" r="6" fill="#8e7f9e" />
    <circle cx="117" cy="58" r="2" fill="#fff" />
    <circle cx="117" cy="78" r="6" fill="#8e7f9e" />
    <circle cx="117" cy="78" r="2" fill="#fff" />
    <path
      d="M109 94h16M109 99h16M109 104h16M109 109h16M109 114h16"
      stroke="#a8977c"
      strokeWidth="1.6"
    />
    <rect x="108" y="123" width="18" height="6" rx="2" fill="#ff9ad5" />
    <path d="M22 138h14v6h-14zM104 138h14v6h-14z" fill="#8e7f9e" />
  </svg>
)

// ---------------------------------------------------------- disquete
export const Floppy = ({ c }: { c: string }) => (
  <svg viewBox="0 0 40 40" className="vw-floppy-svg">
    <path d="M3 1H34L39 6V37Q39 39 37 39H3Q1 39 1 37V3Q1 1 3 1Z" fill={c} />
    <path d="M3 1H34L39 6V8H1V3Q1 1 3 1Z" fill="#ffffff" opacity="0.35" />
    <rect x="10" y="1" width="19" height="13" fill="#e3e6ef" />
    <rect x="21" y="3" width="5" height="9" fill="#5b4b7d" />
    <rect x="6" y="19" width="28" height="18" rx="1" fill="#ffffff" />
    <path d="M9 24H31M9 28H27M9 32H24" stroke="#c9a7ff" strokeWidth="1.4" />
    <rect x="3" y="34" width="3" height="3" fill="#2a1452" />
  </svg>
)

// ------------------------------------------------- aviãozinho com faixa
export const Plane = () => (
  <svg className="vw-plane-svg" viewBox="0 0 96 44">
    <path d="M30 14H74V17H30Z" fill="#ff71ce" />
    <path d="M30 31H70V34H30Z" fill="#ff71ce" />
    <path d="M40 17V31M62 17V31" stroke="#5b4b7d" strokeWidth="1.4" />
    <path
      d="M14 22C22 19 40 18 62 19C74 19 82 21 86 24C82 28 72 30 60 30C42 30 24 28 14 26Z"
      fill="#c9a7ff"
    />
    <path d="M14 22L6 10H12L22 21Z" fill="#8ef0ff" />
    <path d="M18 26H34" stroke="#ffffff" strokeWidth="1.5" />
    <circle cx="66" cy="23" r="3.5" fill="#01cdfe" stroke="#fff" />
    <path d="M86 24h3" stroke="#5b4b7d" strokeWidth="2" />
    <ellipse cx="90" cy="24" rx="1.6" ry="11" fill="#5b4b7d" opacity="0.45" />
    <circle cx="44" cy="38" r="3" fill="#5b4b7d" />
    <circle cx="62" cy="38" r="3" fill="#5b4b7d" />
    <path d="M44 34V38M62 34V38" stroke="#5b4b7d" strokeWidth="1.2" />
  </svg>
)
