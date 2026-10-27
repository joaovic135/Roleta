import type { CSSProperties } from 'react'

// Cena de fundo do tema City Pop (só aparece com data-theme="city-pop"):
// rua estreita de Tóquio à noite em perspectiva de um ponto. Prédios nas
// bordas esquerda e direita com pilhas de letreiros verticais em katakana,
// fios de poste no alto, rua molhada com reflexos, trânsito e um poste de luz.
// Tudo estático (componente de servidor); o ciclo da noite (anoitecer → noite
// → chuva de madrugada → amanhecer molhado) é feito em CSS (theme.css).
// Sorteios com semente fixa: sempre igual no servidor e no navegador.

const seeded = (seed: number) => () => {
  seed = (seed + 0x6d2b79f5) | 0
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}

const r1 = (n: number) => Math.round(n * 10) / 10

// ---- Perspectiva das laterais ---------------------------------------------
// Cada lateral é um SVG 640×1000 colado na borda da tela; o ponto de fuga
// fica além da borda interna (no centro da tela, atrás da interface).
const VW = 640
const VPX = 940
const VPY = 560
const BASE = 940 // pé da parede em x = 0
const DEPTH = 900

// profundidade → x na tela; x → escala; altura do mundo → y
const xAt = (z: number) => (VPX * z) / (z + DEPTH)
const sAt = (x: number) => 1 - x / VPX
const groundY = (x: number) => VPY + (BASE - VPY) * sAt(x)
const yAt = (x: number, h: number) => groundY(x) - h * sAt(x)

type Color = 'pink' | 'cyan' | 'red' | 'violet' | 'amber'
const NEON: Record<Color, string> = {
  pink: '#ff3d9a',
  cyan: '#2de2e6',
  red: '#ff2a44',
  violet: '#b46bff',
  amber: '#ffb547',
}

// palavras genéricas (nada de marcas de lojas)
const WORDS = [
  'カラオケ',
  'ラーメン',
  'カメラ',
  '酒場',
  'ネオン',
  '東京',
  '夜',
  '喫茶',
  'レコード',
  'ゲーム',
  '寿司',
  'バー',
]

interface Sign {
  x: number
  y: number
  w: number
  h: number
  word: string
  color: Color
  // segunda cor (letreiro que troca de cor) e variações de animação
  alt?: Color
  // placa iluminada por inteiro (texto escuro) ou letras de neon
  panel: boolean
  buzz: boolean
  // fica aceso a noite toda (apaga só no fim do amanhecer)
  late: boolean
  delay: number
}

interface Side {
  walls: [string, string]
  fronts: string
  edges: string
  winWarm: string
  winBlink: string
  winTv: string
  winDark: string
  sidewalk: string
  curb: string
  signs: Sign[]
  spill: { x: number; y: number; r: number; color: Color }[]
}

const quad = (pts: [number, number][]) =>
  `M${pts.map(([x, y]) => `${r1(x)} ${r1(y)}`).join('L')}Z`

const buildSide = (seed: number, mirror: boolean): Side => {
  const rand = seeded(seed)
  const pick = <T,>(list: T[]) => list[Math.floor(rand() * list.length)]
  const deck: string[] = []
  // espelha só a geometria; os textos continuam legíveis
  const X = (x: number) => (mirror ? VW - x : x)
  const P = (pts: [number, number][]) =>
    quad(pts.map(([x, y]) => [X(x), y] as [number, number]))

  const walls: [string, string] = ['', '']
  let fronts = ''
  let edges = ''
  let winWarm = ''
  let winBlink = ''
  let winTv = ''
  let winDark = ''

  // prédios do fundo para a frente (o da frente cobre o de trás)
  const blocks: { z: number; len: number; h: number }[] = []
  for (let z = 0; xAt(z) < VW + 30; ) {
    const len = 170 + rand() * 170
    const near = z < 300
    const h = near ? 820 + rand() * 360 : 480 + rand() * 520
    blocks.push({ z, len, h })
    z += len
  }
  blocks.reverse().forEach(({ z, len, h }, i) => {
    const x0 = xAt(z)
    const x1 = xAt(z + len)
    const s0 = sAt(x0)
    // fachada da frente (só aparece acima do prédio mais próximo)
    fronts += P([
      [x0 - 520 * s0, yAt(x0, h)],
      [x0, yAt(x0, h)],
      [x0, groundY(x0)],
      [x0 - 520 * s0, groundY(x0)],
    ])
    // parede lateral, voltada para a rua
    walls[i % 2] += P([
      [x0, yAt(x0, h)],
      [x1, yAt(x1, h)],
      [x1, groundY(x1)],
      [x0, groundY(x0)],
    ])
    // quina e beiral iluminados pelo neon
    edges += `M${r1(X(x0))} ${r1(groundY(x0))}L${r1(X(x0))} ${r1(yAt(x0, h))}L${r1(X(x1))} ${r1(yAt(x1, h))}`

    // janelas: andares inteiros acesos ou apagados (como escritórios),
    // em faixas regulares; quadriláteros em perspectiva na parede
    const floorKind = () => {
      const r = rand()
      return r < 0.22 ? 'warm' : r < 0.32 ? 'blink' : r < 0.36 ? 'tv' : 'dark'
    }
    const addWin = (kind: string, win: string) => {
      if (kind === 'warm') winWarm += win
      else if (kind === 'blink') winBlink += win
      else if (kind === 'tv') winTv += win
      else winDark += win
    }
    for (let fy = 80; fy < h - 60; fy += 52) {
      const kind = floorKind()
      for (let zz = z + 24; zz < z + len - 40; zz += 46) {
        const a = xAt(zz)
        const b = xAt(zz + 30)
        addWin(
          kind !== 'dark' && rand() < 0.2 ? 'dark' : kind,
          P([
            [a, yAt(a, fy + 24)],
            [b, yAt(b, fy + 24)],
            [b, yAt(b, fy)],
            [a, yAt(a, fy)],
          ]),
        )
      }
      // fachada da frente (retângulos simples)
      const front = floorKind()
      for (let k = 1; k <= 5; k++) {
        const wx = x0 - k * 92 * s0
        addWin(
          front !== 'dark' && rand() < 0.25 ? 'dark' : front,
          P([
            [wx, yAt(x0, fy + 24)],
            [wx + 60 * s0, yAt(x0, fy + 24)],
            [wx + 60 * s0, yAt(x0, fy)],
            [wx, yAt(x0, fy)],
          ]),
        )
      }
    }
  })

  // calçada: entre o pé das paredes e o meio-fio, até o ponto de fuga
  const atY = (u: number, y: number) => {
    const s = (y - VPY) / (BASE - VPY)
    return VPX * (1 - s) + u * s
  }
  const sidewalk = P([
    [atY(0, 1000), 1000],
    [VPX, VPY],
    [atY(250, 1000), 1000],
  ])
  const curb = `M${r1(X(atY(250, 1000)))} 1000L${r1(X(VPX))} ${VPY}`

  // letreiros verticais em pilhas, saindo da parede em direção à rua
  const signs: Sign[] = []
  const spill: Side['spill'] = []
  const palette: Color[] = [
    'pink',
    'cyan',
    'pink',
    'red',
    'cyan',
    'violet',
    'amber',
  ]
  const depths = [40, 170, 300, 450, 620, 830, 1100]
  depths.forEach((dz, k) => {
    const xa = xAt(dz)
    const s = sAt(xa)
    // pilha de 1 a 3 letreiros, um acima do outro
    let h0 = 150 + rand() * 60
    const stack = k < 2 ? 3 : k < 3 ? 2 : 1
    const gap = 26 + rand() * 30
    for (let j = 0; j < stack; j++) {
      // baralho embaralhado: evita palavras repetidas lado a lado
      if (!deck.length) deck.push(...[...WORDS].sort(() => rand() - 0.5))
      const word = deck.pop() as string
      const w = 78 + rand() * 18
      const hh = word.length * w * 0.74 + 46
      const color = pick(palette)
      const out = gap + j * (rand() < 0.5 ? 0 : 14)
      const left = xa + out * s
      const right = left + w * s
      const top = yAt(xa, h0 + hh)
      const bottom = yAt(xa, h0)
      signs.push({
        x: r1(mirror ? VW - right : left),
        y: r1(top),
        w: r1(w * s),
        h: r1(bottom - top),
        word,
        color,
        alt: rand() < 0.22 ? (color === 'cyan' ? 'pink' : 'cyan') : undefined,
        panel: rand() < 0.4,
        buzz: rand() < 0.3,
        late: signs.length % 4 === 1,
        delay: r1(rand() * 0.07 * 1000) / 1000,
      })
      if (j === 0)
        spill.push({
          x: r1(X(xa + 10 * s)),
          y: r1(yAt(xa, h0 + hh * 0.6)),
          r: r1(230 * s),
          color,
        })
      h0 += hh + 18 + rand() * 30
    }
  })

  return {
    walls,
    fronts,
    edges,
    winWarm,
    winBlink,
    winTv,
    winDark,
    sidewalk,
    curb,
    signs,
    spill,
  }
}

const LEFT = buildSide(1987, false)
const RIGHT = buildSide(1979, true)

const vars = (v: Record<string, string | number>) => v as CSSProperties

// letreiro: placa apagada por baixo + camada acesa (que liga/pisca/troca de cor)
function SignView({ sign, mirror }: { sign: Sign; mirror: boolean }) {
  const { x, y, w, h, word, color, alt, panel, buzz, late, delay } = sign
  const font = w * 0.6
  const tx = x + w / 2
  const ty = y + (h - word.length * font * 1.08) / 2
  const text = (cls: string) => (
    <text
      className={cls}
      x={r1(tx)}
      y={r1(ty)}
      fontSize={r1(font)}
      style={{ writingMode: 'vertical-rl' }}
    >
      {word}
    </text>
  )
  const lit = (c: Color, cls: string) => (
    <g className={cls} style={vars({ '--neon': NEON[c] })}>
      <rect
        className="cp-sign-face"
        x={x}
        y={y}
        width={w}
        height={h}
        rx={r1(w * 0.08)}
      />
      {text('cp-sign-text')}
    </g>
  )
  return (
    <g
      className={`cp-sign${panel ? 'cp-panel' : ''}${buzz ? 'cp-buzz' : ''}${late ? 'cp-late' : ''}${mirror ? 'cp-r' : ''}`}
      style={vars({ '--d': delay })}
    >
      <rect
        className="cp-sign-off"
        x={x}
        y={y}
        width={w}
        height={h}
        rx={r1(w * 0.08)}
      />
      <g className="cp-sign-power">
        {lit(color, 'cp-sign-lit')}
        {alt && lit(alt, 'cp-sign-lit cp-sign-alt')}
      </g>
    </g>
  )
}

function SideView({ side, mirror }: { side: Side; mirror: boolean }) {
  return (
    <svg
      className={`cp-side ${mirror ? 'cp-side-r' : 'cp-side-l'}`}
      viewBox={`0 0 ${VW} 1000`}
      preserveAspectRatio={mirror ? 'xMaxYMax slice' : 'xMinYMax slice'}
    >
      <path className="cp-front" d={side.fronts} />
      <path className="cp-wall-a" d={side.walls[0]} />
      <path className="cp-wall-b" d={side.walls[1]} />
      <path className="cp-win-dark" d={side.winDark} />
      <path className="cp-win-warm" d={side.winWarm} />
      <path className="cp-win-blink" d={side.winBlink} />
      <path className="cp-win-tv" d={side.winTv} />
      <path className="cp-edge" d={side.edges} />
      <path className="cp-sidewalk" d={side.sidewalk} />
      <path className="cp-curb" d={side.curb} />
      {/* luz dos letreiros espirrando na parede */}
      <g className="cp-spill">
        {side.spill.map(({ x, y, r, color }, i) => (
          <ellipse
            key={i}
            cx={x}
            cy={y}
            rx={r}
            ry={r * 1.5}
            fill={`url(#cp-glow-${color})`}
          />
        ))}
      </g>
      {/* reflexo dos letreiros na calçada molhada */}
      <g className="cp-wet" mask="url(#cp-ripple)">
        <g className="cp-shimmer">
          {/* só os letreiros próximos: os do fundo ficam atrás da interface */}
          {side.signs.slice(0, 8).map((s, i) => (
            <rect
              key={i}
              x={r1(s.x + s.w * 0.15)}
              y={r1(groundY(mirror ? VW - s.x - s.w : s.x) - 6)}
              width={r1(s.w * 0.7)}
              height={r1(s.h * 0.9)}
              fill={`url(#cp-refl-${s.color})`}
            />
          ))}
        </g>
      </g>
      {side.signs.map((s, i) => (
        <SignView key={i} sign={s} mirror={mirror} />
      ))}
    </svg>
  )
}

// poste de luz: a cabeça aparece na faixa livre do alto da tela (o poste
// desce por trás da interface)
function Lamp() {
  return (
    <svg
      className="cp-lamp"
      viewBox="0 0 240 700"
      preserveAspectRatio="xMidYMin meet"
    >
      <circle
        className="cp-lamp-bloom"
        cx="70"
        cy="62"
        r="110"
        fill="url(#cp-glow-lamp)"
      />
      <path className="cp-lamp-pole" d="M190 700V80q0-34-40-38H96" />
      <path className="cp-lamp-hood" d="M44 50q26-20 52-8l4 12H40z" />
      <ellipse className="cp-lamp-head" cx="70" cy="56" rx="26" ry="6" />
    </svg>
  )
}

// ---- Rua (SVG esticado na largura; ponto de fuga em 800,0) -----------------
const SW = 1600
const SH = 450
const svx = SW / 2
// ponto da rua a uma "distância" p (0 = ponto de fuga, 1 = borda de baixo)
const road = (bx: number, p: number): [number, number] => [
  svx + (bx - svx) * p,
  SH * p,
]
const P_STOPS = [0.04, 0.06, 0.09, 0.13, 0.19, 0.27, 0.38, 0.53, 0.73, 1]

const streetPaths = () => {
  let dashes = ''
  for (const bx of [-260, 800, 1860]) {
    // faixas: tracejado que cresce com a perspectiva
    for (let i = 0; i < P_STOPS.length - 1; i++) {
      const a = P_STOPS[i]
      const b = a + (P_STOPS[i + 1] - a) * 0.5
      const w = 7
      dashes += quad([
        road(bx - w, a),
        road(bx + w, a),
        road(bx + w, b),
        road(bx - w, b),
      ])
    }
  }
  // faixa de pedestres no primeiro plano
  let zebra = ''
  for (let bx = -1300; bx < 2900; bx += 150)
    zebra += quad([
      road(bx, 0.82),
      road(bx + 80, 0.82),
      road(bx + 80, 0.95),
      road(bx, 0.95),
    ])
  const edges =
    `M${road(-1500, 1).join(' ')}L${svx} 0` +
    `M${road(3100, 1).join(' ')}L${svx} 0`
  return { dashes, zebra, edges }
}
const STREET = streetPaths()

// trânsito: faróis que vêm (pista da esquerda) e lanternas que vão (direita)
const TRAFFIC = (() => {
  const rand = seeded(88)
  const cars: {
    kind: 'in' | 'out'
    lx: number
    dur: number
    delay: number
  }[] = []
  for (let i = 0; i < 9; i++) {
    const kind = i % 2 ? 'out' : 'in'
    const lane = kind === 'in' ? -520 - rand() * 380 : 520 + rand() * 380
    cars.push({
      kind,
      lx: Math.round(lane),
      dur: r1(6 + rand() * 6),
      delay: r1(-rand() * 12),
    })
  }
  return cars
})()

// respingos de chuva no asfalto
const SPLASHES = (() => {
  const rand = seeded(7)
  return Array.from({ length: 16 }, () => {
    const side = rand() < 0.5 ? -1 : 1
    const p = 0.35 + rand() * 0.65
    const bx = svx + side * (350 + rand() * 900)
    const [x, y] = road(bx, p)
    return {
      x: r1(x),
      y: r1(y),
      r: r1(4 + p * 10),
      dur: r1(0.7 + rand() * 0.6),
      delay: r1(-rand() * 2),
    }
  })
})()

function Street() {
  return (
    <svg
      className="cp-street"
      viewBox={`0 0 ${SW} ${SH}`}
      preserveAspectRatio="none"
    >
      <rect width={SW} height={SH} fill="url(#cp-asphalt)" />
      {/* céu e prédios refletidos no asfalto molhado */}
      <rect
        className="cp-street-sky"
        width={SW}
        height={SH * 0.55}
        fill="url(#cp-street-glow)"
      />
      <g className="cp-wet" mask="url(#cp-ripple)">
        <g className="cp-shimmer cp-shimmer-b">
          <rect x="40" y="0" width="90" height={SH} fill="url(#cp-refl-pink)" />
          <rect
            x="170"
            y="10"
            width="50"
            height={SH}
            fill="url(#cp-refl-cyan)"
          />
          <rect
            x="300"
            y="20"
            width="70"
            height={SH}
            fill="url(#cp-refl-red)"
          />
          <rect
            x="1230"
            y="20"
            width="70"
            height={SH}
            fill="url(#cp-refl-cyan)"
          />
          <rect
            x="1380"
            y="10"
            width="50"
            height={SH}
            fill="url(#cp-refl-pink)"
          />
          <rect
            x="1480"
            y="0"
            width="90"
            height={SH}
            fill="url(#cp-refl-violet)"
          />
        </g>
      </g>
      <path className="cp-road-edge" d={STREET.edges} />
      <path className="cp-dash" d={STREET.dashes} />
      <path className="cp-zebra" d={STREET.zebra} />
      {/* rastros de luz de longa exposição */}
      <path
        className="cp-trail cp-trail-in"
        d={`M${svx - 4} 2Q${svx - 120} ${SH * 0.6} ${svx - 620} ${SH}`}
      />
      <path
        className="cp-trail cp-trail-out"
        d={`M${svx + 4} 2Q${svx + 120} ${SH * 0.6} ${svx + 640} ${SH}`}
      />
      <g transform={`translate(${svx} 0)`}>
        {TRAFFIC.map(({ kind, lx, dur, delay }, i) => (
          <g
            key={i}
            className={`cp-car cp-car-${kind}`}
            style={vars({
              '--lx': `${lx}px`,
              animationDuration: `${dur}s`,
              animationDelay: `${delay}s`,
            })}
          >
            <rect
              className="cp-car-refl"
              x="-30"
              y="6"
              width="60"
              height="150"
              fill={`url(#cp-refl-${kind === 'in' ? 'head' : 'red'})`}
            />
            <ellipse
              rx="70"
              ry="22"
              fill={`url(#cp-glow-${kind === 'in' ? 'head' : 'red'})`}
            />
            <path
              className={kind === 'in' ? 'cp-headlights' : 'cp-taillights'}
              d="M-34 -4h18v8h-18zM16 -4h18v8h-18z"
            />
          </g>
        ))}
      </g>
      <g className="cp-splashes">
        {SPLASHES.map(({ x, y, r, dur, delay }, i) => (
          <ellipse
            key={i}
            cx={x}
            cy={y}
            rx={r}
            ry={r1(r * 0.28)}
            style={{
              animationDuration: `${dur}s`,
              animationDelay: `${delay}s`,
            }}
          />
        ))}
      </g>
    </svg>
  )
}

// silhueta distante no ponto de fuga (atrás da interface no desktop)
const FAR = (() => {
  const rand = seeded(5)
  let d = ''
  let lights = ''
  for (let x = 0; x < 600; ) {
    const w = 18 + rand() * 40
    const h = 40 + rand() * 120
    d += quad([
      [x, 200 - h],
      [x + w, 200 - h],
      [x + w, 200],
      [x, 200],
    ])
    for (let y = 200 - h + 8; y < 196; y += 9)
      for (let wx = x + 4; wx < x + w - 4; wx += 7)
        if (rand() < 0.14) lights += `M${r1(wx)} ${r1(y)}h3v3h-3z`
    x += w + 2
  }
  return { d, lights }
})()

// fios de poste cruzando o alto da rua
const WIRES = [
  'M330 0Q560 200 1600 70',
  'M420 0Q700 230 1600 98',
  'M0 250Q900 250 1340 0',
  'M0 190Q760 210 1240 0',
]

// janela de chuva: duas camadas (perto/longe) em velocidades diferentes
export default function CityPopScene() {
  return (
    <>
      <svg className="cp-defs" width="0" height="0" aria-hidden="true">
        <defs>
          {Object.entries(NEON).map(([name, c]) => (
            <radialGradient key={name} id={`cp-glow-${name}`}>
              <stop offset="0" stopColor={c} stopOpacity="0.55" />
              <stop offset="0.45" stopColor={c} stopOpacity="0.18" />
              <stop offset="1" stopColor={c} stopOpacity="0" />
            </radialGradient>
          ))}
          {Object.entries(NEON).map(([name, c]) => (
            <linearGradient
              key={name}
              id={`cp-refl-${name}`}
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop offset="0" stopColor={c} stopOpacity="0.7" />
              <stop offset="0.35" stopColor={c} stopOpacity="0.25" />
              <stop offset="1" stopColor={c} stopOpacity="0" />
            </linearGradient>
          ))}
          {/* ondulação da água: listras horizontais que recortam os reflexos */}
          <pattern
            id="cp-ripple-pat"
            width="64"
            height="9"
            patternUnits="userSpaceOnUse"
          >
            <rect width="64" height="9" fill="#444" />
            <rect y="1" width="64" height="5" fill="#fff" />
            <rect x="10" y="3" width="30" height="4" fill="#000" />
          </pattern>
          <mask id="cp-ripple">
            <rect
              x="-4000"
              y="-4000"
              width="9000"
              height="9000"
              fill="url(#cp-ripple-pat)"
            />
          </mask>
          <radialGradient id="cp-glow-lamp">
            <stop offset="0" stopColor="#fff1c9" stopOpacity="0.9" />
            <stop offset="0.25" stopColor="#ffc98a" stopOpacity="0.35" />
            <stop offset="1" stopColor="#ff8ac4" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="cp-glow-head">
            <stop offset="0" stopColor="#fff6dc" stopOpacity="0.8" />
            <stop offset="0.4" stopColor="#ffe2a8" stopOpacity="0.2" />
            <stop offset="1" stopColor="#ffe2a8" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="cp-refl-head" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fff2cc" stopOpacity="0.6" />
            <stop offset="1" stopColor="#fff2cc" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="cp-asphalt" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#1c0f3a" />
            <stop offset="0.35" stopColor="#120a28" />
            <stop offset="1" stopColor="#07040f" />
          </linearGradient>
          <linearGradient id="cp-street-glow" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#ff5fae" stopOpacity="0.45" />
            <stop offset="0.4" stopColor="#7a3cff" stopOpacity="0.16" />
            <stop offset="1" stopColor="#7a3cff" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>

      {/* céus que se cruzam ao longo do ciclo (a noite é o fundo) */}
      <div className="cp-sky cp-sky-dusk" />
      <div className="cp-sky cp-sky-dawn" />
      <div className="cp-sky cp-sky-storm" />
      <div className="cp-moon" />
      <div className="cp-clouds">
        <span />
        <span />
      </div>

      <svg
        className="cp-far"
        viewBox="0 0 600 200"
        preserveAspectRatio="xMidYMax meet"
      >
        <path className="cp-far-city" d={FAR.d} />
        <path className="cp-far-lights" d={FAR.lights} />
      </svg>

      <Lamp />
      <Street />
      <SideView side={LEFT} mirror={false} />
      <SideView side={RIGHT} mirror />

      <svg
        className="cp-wires"
        viewBox="0 0 1600 300"
        preserveAspectRatio="none"
      >
        <path d={WIRES.join('')} />
      </svg>

      <div className="cp-rain">
        <span className="cp-rain-far" />
        <span className="cp-rain-near" />
      </div>
      <div className="cp-fog" />
      <div className="cp-tint cp-tint-dusk" />
      <div className="cp-tint cp-tint-dawn" />
      <div className="cp-flash" />
      <div className="cp-vignette" />
    </>
  )
}
