import type { CSSProperties } from 'react'

// Cena de fundo do tema Hearts of Iron (só aparece com data-theme="hearts-of-iron").
// Uma mesa de sala de guerra: carta topográfica sépia/oliva com curvas de nível,
// litoral, grade de latitude/longitude, setas de frente, alfinetes, linhas de
// suprimento e contadores de unidades genéricos; papéis presos com fita, um
// radar e, por cima, a luz do ciclo dia/noite e o clima (ver theme.css).
// Tudo estático no servidor: formas sorteadas com semente fixa e agrupadas em
// poucos <path> por cor. As animações (só transform/opacity) ficam no CSS.

const seeded = (seed: number) => () => {
  seed = (seed + 0x6d2b79f5) | 0
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}
const n1 = (v: number) => Math.round(v * 10) / 10
type Pt = [number, number]
const pt = ([x, y]: Pt) => `${n1(x)} ${n1(y)}`

// Carta em 1600×800 (recorte "slice": as bordas laterais/topo são as que
// sobram visíveis em volta da interface)
const W = 1600
const H = 800

// ---- Terra: manchas orgânicas com harmônicos sorteados ----
interface Land {
  cx: number
  cy: number
  rx: number
  ry: number
  // deslocamento do "pico" (curvas internas não são concêntricas)
  dx: number
  dy: number
  coast: { k: number; a: number; p: number }[]
  inner: { k: number; a: number; p: number }[]
}
const LANDS: Land[] = (
  [
    [150, 120, 430, 250, 11],
    [1520, 250, 330, 360, 23],
    [210, 820, 400, 210, 37],
    [1200, 860, 330, 160, 41],
    [800, 430, 380, 240, 53],
    [985, 70, 80, 44, 67],
    [1330, 640, 70, 46, 71],
    [600, 790, 60, 36, 83],
    [520, 70, 70, 34, 97],
    [40, 470, 90, 120, 101],
  ] as const
).map(([cx, cy, rx, ry, seed]) => {
  const rand = seeded(seed)
  const harm = (from: number, to: number, amp: number) =>
    Array.from({ length: to - from + 1 }, (_, i) => ({
      k: from + i,
      a: (rand() * amp) / Math.sqrt(from + i),
      p: rand() * Math.PI * 2,
    }))
  return {
    cx,
    cy,
    rx,
    ry,
    dx: (rand() - 0.5) * rx * 0.5,
    dy: (rand() - 0.5) * ry * 0.5,
    coast: [...harm(2, 5, 0.26), ...harm(9, 15, 0.05)],
    inner: harm(2, 4, 0.3),
  }
})

const landPath = (l: Land, s: number) => {
  const N = 96
  const pts: Pt[] = []
  const cx = l.cx + l.dx * (1 - s)
  const cy = l.cy + l.dy * (1 - s)
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2
    let r = 1
    for (const h of l.coast) r += h.a * Math.sin(h.k * a + h.p)
    for (const h of l.inner) r += h.a * (1 - s) * Math.sin(h.k * a + h.p)
    pts.push([cx + Math.cos(a) * l.rx * s * r, cy + Math.sin(a) * l.ry * s * r])
  }
  const mid = (a: Pt, b: Pt): Pt => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]
  let d = `M${pt(mid(pts[N - 1], pts[0]))}`
  for (let i = 0; i < N; i++)
    d += `Q${pt(pts[i])} ${pt(mid(pts[i], pts[(i + 1) % N]))}`
  return d + 'Z'
}
const lands = (s: number) => LANDS.map((l) => landPath(l, s)).join('')
const TINTS = [lands(1), lands(0.7), lands(0.44), lands(0.2)]
const CONTOURS = [0.86, 0.78, 0.62, 0.53, 0.36, 0.28, 0.12].map(lands).join('')
const SHALLOW = lands(1.07)

// ---- Grade de coordenadas ----
const GRID =
  Array.from({ length: 15 }, (_, i) => `M${(i + 1) * 100} 0V${H}`).join('') +
  Array.from({ length: 7 }, (_, i) => `M0 ${(i + 1) * 100}H${W}`).join('')
const LON = Array.from({ length: 15 }, (_, i) => ({
  x: (i + 1) * 100,
  label: `${Math.abs(i * 4 - 24)}°${i * 4 - 24 < 0 ? 'O' : 'L'}`,
}))
const LAT = Array.from({ length: 7 }, (_, i) => ({
  y: (i + 1) * 100,
  label: `${62 - i * 4}°N`,
}))

// ---- Setas de frente: curva quadrática engrossando até a ponta ----
const arrow = (p0: Pt, c: Pt, p2: Pt, w: number) => {
  const N = 14
  const neck = 0.8
  const at = (t: number): Pt => [
    (1 - t) ** 2 * p0[0] + 2 * (1 - t) * t * c[0] + t * t * p2[0],
    (1 - t) ** 2 * p0[1] + 2 * (1 - t) * t * c[1] + t * t * p2[1],
  ]
  const normal = (t: number): Pt => {
    const tx = 2 * (1 - t) * (c[0] - p0[0]) + 2 * t * (p2[0] - c[0])
    const ty = 2 * (1 - t) * (c[1] - p0[1]) + 2 * t * (p2[1] - c[1])
    const len = Math.hypot(tx, ty) || 1
    return [-ty / len, tx / len]
  }
  const left: Pt[] = []
  const right: Pt[] = []
  for (let i = 0; i <= N; i++) {
    const t = (i / N) * neck
    const [x, y] = at(t)
    const [nx, ny] = normal(t)
    const half = (w * (0.35 + (0.65 * t) / neck)) / 2
    left.push([x + nx * half, y + ny * half])
    right.push([x - nx * half, y - ny * half])
  }
  const [bx, by] = at(neck)
  const [nx, ny] = normal(neck)
  const head = w * 1.05
  return (
    `M${left.map(pt).join('L')}` +
    `L${pt([bx + nx * head, by + ny * head])}L${pt(p2)}` +
    `L${pt([bx - nx * head, by - ny * head])}` +
    `L${right.reverse().map(pt).join('L')}Z`
  )
}

// cada seta avança (--ax, --ay) e recua ao longo do ciclo
const ARROWS: {
  side: 'red' | 'blue'
  d: string
  ax: number
  ay: number
}[] = [
  {
    side: 'red',
    d: arrow([40, 700], [130, 590], [70, 430], 30),
    ax: 4,
    ay: -26,
  },
  {
    side: 'blue',
    d: arrow([30, 150], [118, 220], [84, 350], 26),
    ax: 2,
    ay: 22,
  },
  { side: 'red', d: arrow([560, 96], [700, 46], [860, 82], 22), ax: 24, ay: 2 },
  {
    side: 'blue',
    d: arrow([1250, 62], [1150, 104], [1010, 86], 20),
    ax: -22,
    ay: 0,
  },
  {
    side: 'blue',
    d: arrow([1580, 760], [1470, 660], [1530, 500], 30),
    ax: -4,
    ay: -24,
  },
  {
    side: 'red',
    d: arrow([1490, 70], [1590, 170], [1530, 320], 26),
    ax: 3,
    ay: 22,
  },
]

// ---- Linhas de frente com "dentes" (triângulos ou semicírculos) ----
const frontLine = (pts: Pt[], kind: 'tri' | 'arc', side: 1 | -1) => {
  let line = `M${pt(pts[0])}`
  let teeth = ''
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1]
    const [x1, y1] = pts[i]
    line += `L${pt(pts[i])}`
    const len = Math.hypot(x1 - x0, y1 - y0)
    const ux = (x1 - x0) / len
    const uy = (y1 - y0) / len
    const nx = -uy * side
    const ny = ux * side
    for (let s = 6; s + 12 < len; s += 30) {
      const a: Pt = [x0 + ux * s, y0 + uy * s]
      const b: Pt = [a[0] + ux * 12, a[1] + uy * 12]
      if (kind === 'tri')
        teeth += `M${pt(a)}L${pt([a[0] + ux * 6 + nx * 10, a[1] + uy * 6 + ny * 10])}L${pt(b)}Z`
      else teeth += `M${pt(a)}A6 6 0 0 ${side > 0 ? 0 : 1} ${pt(b)}Z`
    }
  }
  return { line, teeth }
}
const wavy = (x: number, y0: number, y1: number, amp: number, seed: number) => {
  const rand = seeded(seed)
  const pts: Pt[] = []
  for (let y = y0; y <= y1; y += 40) pts.push([x + (rand() - 0.5) * amp, y])
  return pts
}
const FRONT_RED = frontLine(wavy(104, 90, 780, 34, 5), 'tri', -1)
const FRONT_BLUE = frontLine(wavy(1494, 360, 780, 30, 9), 'arc', 1)

// ---- Alfinetes e contadores de unidades (símbolos genéricos de carta) ----
const PINS: [number, number, 'red' | 'blue' | 'brass'][] = [
  [70, 520, 'red'],
  [52, 260, 'blue'],
  [640, 70, 'brass'],
  [920, 92, 'red'],
  [1180, 76, 'blue'],
  [1540, 420, 'blue'],
  [1556, 610, 'brass'],
  [1520, 210, 'red'],
  [36, 640, 'brass'],
]
const COUNTERS: [number, number, 'red' | 'blue', 'inf' | 'arm' | 'art'][] = [
  [22, 560, 'red', 'inf'],
  [64, 600, 'red', 'arm'],
  [24, 380, 'blue', 'inf'],
  [1510, 540, 'blue', 'arm'],
  [1548, 700, 'blue', 'inf'],
  [1500, 150, 'red', 'art'],
  [760, 60, 'red', 'inf'],
  [1090, 64, 'blue', 'art'],
]
const counterSymbol = (x: number, y: number, k: 'inf' | 'arm' | 'art') =>
  k === 'inf'
    ? `M${x + 3} ${y + 3}L${x + 23} ${y + 13}M${x + 23} ${y + 3}L${x + 3} ${y + 13}`
    : k === 'arm'
      ? `M${x + 9} ${y + 4}h8a4 4 0 0 1 0 8h-8a4 4 0 0 1 0-8z`
      : `M${x + 13} ${y + 5.5}a2.5 2.5 0 1 0 0.1 0z`

// ---- Linhas de suprimento tracejadas (marcham ao longo do próprio eixo) ----
const SUPPLY: [number, number, number, number][] = [
  [20, 760, 150, -48],
  [430, 84, 120, 10],
  [1262, 100, 110, -8],
  [1450, 330, 140, 64],
]
const DASH = 18

// ---- Luzes de cidades (acendem à noite, em três grupos defasados) ----
const lightsPath = (seed: number) => {
  const rand = seeded(seed)
  const zones: [number, number, number, number][] = [
    [8, 90, 120, 700],
    [1470, 90, 125, 700],
    [420, 40, 800, 64],
  ]
  let core = ''
  let halo = ''
  for (const [x, y, w, h] of zones)
    for (let i = 0; i < 9; i++) {
      const px = n1(x + rand() * w)
      const py = n1(y + rand() * h)
      core += `M${px - 1.6} ${py}a1.6 1.6 0 1 0 3.2 0a1.6 1.6 0 1 0 -3.2 0`
      halo += `M${px - 6} ${py}a6 6 0 1 0 12 0a6 6 0 1 0 -12 0`
    }
  return { core, halo }
}
const LIGHTS = [lightsPath(301), lightsPath(302), lightsPath(303)]

// ---- Chuva: gotas inclinadas num ladrilho que desce em loop ----
const RAIN_TILE = 140
const RAIN = (() => {
  const rand = seeded(777)
  let d = ''
  for (let i = 0; i < 26; i++) {
    const x = n1(rand() * RAIN_TILE)
    const y = n1(rand() * RAIN_TILE)
    const l = n1(10 + rand() * 12)
    d += `M${x} ${y}l${n1(-l * 0.22)} ${l}`
  }
  return d
})()

// manchas de café (anéis) e borrão de tinta
const STAINS: [number, number, number][] = [
  [1440, 120, 46],
  [150, 700, 38],
  [1060, 760, 30],
]
const INK =
  'M1405 742c10-8 24-6 28 4s-4 18 2 26-6 16-16 12-20 4-24-6 0-14 4-20-4-12 6-16z' +
  'M1446 760a3 3 0 1 0 0.1 0zM1392 728a2 2 0 1 0 0.1 0zM1452 734a1.6 1.6 0 1 0 0.1 0z'

const vars = (v: Record<string, string | number>) => v as CSSProperties

export default function HeartsOfIronScene() {
  return (
    <>
      {/* ---- carta topográfica ---- */}
      <svg
        className="hoi-map"
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="xMidYMid slice"
      >
        <path className="hoi-shallow" d={SHALLOW} />
        <path className="hoi-land-1" d={TINTS[0]} />
        <path className="hoi-land-2" d={TINTS[1]} />
        <path className="hoi-land-3" d={TINTS[2]} />
        <path className="hoi-land-4" d={TINTS[3]} />
        <path className="hoi-contour" d={CONTOURS} />
        <path className="hoi-coast" d={TINTS[0]} />
        <path className="hoi-grid" d={GRID} />
        <g className="hoi-coords">
          {LON.map(({ x, label }) => (
            <text key={x} x={x + 4} y={H - 8}>
              {label}
            </text>
          ))}
          {LAT.map(({ y, label }) => (
            <text key={y} x={W - 40} y={y - 4}>
              {label}
            </text>
          ))}
        </g>

        {STAINS.map(([x, y, r]) => (
          <g key={x} className="hoi-stain">
            <circle cx={x} cy={y} r={r} />
            <circle cx={x + 3} cy={y - 2} r={r - 4} className="hoi-stain-in" />
          </g>
        ))}
        <path className="hoi-ink" d={INK} />

        {/* linhas de frente */}
        <path className="hoi-front hoi-front-red" d={FRONT_RED.line} />
        <path className="hoi-teeth hoi-teeth-red" d={FRONT_RED.teeth} />
        <path className="hoi-front hoi-front-blue" d={FRONT_BLUE.line} />
        <path className="hoi-teeth hoi-teeth-blue" d={FRONT_BLUE.teeth} />

        {/* suprimentos */}
        <defs>
          {SUPPLY.map(([, , len], i) => (
            <clipPath key={i} id={`hoi-supply-${i}`}>
              <rect x="0" y="-4" width={len} height="8" />
            </clipPath>
          ))}
        </defs>
        {SUPPLY.map(([x, y, len, angle], i) => (
          <g
            key={i}
            transform={`translate(${x} ${y}) rotate(${angle})`}
            clipPath={`url(#hoi-supply-${i})`}
          >
            <path
              className="hoi-supply"
              d={`M${-DASH * 2} 0H${len}`}
              style={vars({ animationDelay: `${-i * 0.7}s` })}
            />
          </g>
        ))}

        {/* setas de avanço */}
        {ARROWS.map(({ side, d, ax, ay }, i) => (
          <g
            key={i}
            className={`hoi-arrow hoi-arrow-${side}`}
            style={vars({ '--ax': `${ax}px`, '--ay': `${ay}px` })}
          >
            <path d={d} />
          </g>
        ))}

        {/* contadores de unidade */}
        {COUNTERS.map(([x, y, side, kind]) => (
          <g key={`${x}-${y}`} className={`hoi-counter hoi-counter-${side}`}>
            <rect x={x} y={y} width="26" height="16" rx="1.5" />
            <path d={counterSymbol(x, y, kind)} />
          </g>
        ))}

        {/* alfinetes com pulso */}
        {PINS.map(([x, y, color], i) => (
          <g key={`${x}-${y}`} className={`hoi-pin hoi-pin-${color}`}>
            <circle
              className="hoi-pin-pulse"
              cx={x}
              cy={y}
              r="7"
              style={vars({ animationDelay: `${-((i * 1.37) % 4)}s` })}
            />
            <path d={`M${x} ${y}l5 9`} className="hoi-pin-needle" />
            <circle cx={x} cy={y} r="5" />
            <circle
              cx={x - 1.5}
              cy={y - 1.5}
              r="1.6"
              className="hoi-pin-shine"
            />
          </g>
        ))}
      </svg>

      {/* ---- papéis presos na mesa (tremulam de leve) ---- */}
      <div className="hoi-paper hoi-legend">
        <span className="hoi-tape" />
        <b>Legenda</b>
        <svg viewBox="0 0 120 92">
          <path d="M4 10h22" className="hoi-lg-red" />
          <path d="M8 10l4-6 4 6M18 10l4-6 4 6" className="hoi-lg-redfill" />
          <path d="M4 32h22" className="hoi-lg-blue" />
          <path
            d="M8 32a4 4 0 0 1 8 0M18 32a4 4 0 0 1 8 0"
            className="hoi-lg-bluefill"
          />
          <path d="M4 54h24" className="hoi-lg-supply" />
          <rect x="6" y="68" width="20" height="12" className="hoi-lg-unit" />
          <path d="M8 70l16 8M24 70l-16 8" className="hoi-lg-unitx" />
          <text x="36" y="13">
            Frente A
          </text>
          <text x="36" y="35">
            Frente B
          </text>
          <text x="36" y="57">
            Suprimento
          </text>
          <text x="36" y="79">
            Infantaria
          </text>
        </svg>
        <i>Escala 1:250.000</i>
        <span className="hoi-scale" />
      </div>

      <div className="hoi-paper hoi-memo">
        <span className="hoi-tape" />
        <b>Relatório de campo</b>
        <p>Nº 0417 · Setor 7</p>
        <p>Situação: estável</p>
        <p>Reforços: a caminho</p>
        <p>Clima: variável</p>
        <em>Confidencial</em>
      </div>

      <div className="hoi-banner">
        Carta operacional nº 7 · Folha 3/12 · Uso restrito do estado-maior
      </div>

      {/* ---- luz do ciclo dia/noite e clima ---- */}
      <div className="hoi-fx hoi-day" />
      <div className="hoi-fx hoi-shafts" />
      <div className="hoi-fx hoi-flare">
        <span />
        <span />
        <span />
      </div>
      <div className="hoi-fx hoi-fog" />
      <div className="hoi-fx hoi-dusk" />
      <div className="hoi-fx hoi-clouds">
        <span />
        <span />
        <span />
        <span />
      </div>
      <div className="hoi-fx hoi-night" />
      <div className="hoi-fx hoi-nightlamp" />
      <svg
        className="hoi-map hoi-map-lights"
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="xMidYMid slice"
      >
        {/* luzes de cidade (noite) */}
        {LIGHTS.map(({ core, halo }, i) => (
          <g key={i} className={`hoi-lights hoi-lights-${i + 1}`}>
            <path className="hoi-light-halo" d={halo} />
            <path className="hoi-light-core" d={core} />
          </g>
        ))}
      </svg>
      <div className="hoi-fx hoi-search">
        <span />
        <span />
      </div>
      <div className="hoi-fx hoi-flak">
        <span />
        <span />
        <span />
      </div>
      <div className="hoi-fx hoi-rain">
        <svg className="hoi-rain-sheet">
          <defs>
            <pattern
              id="hoi-rain-tile"
              width={RAIN_TILE}
              height={RAIN_TILE}
              patternUnits="userSpaceOnUse"
            >
              <path d={RAIN} />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hoi-rain-tile)" />
        </svg>
      </div>
      <div className="hoi-fx hoi-lightning" />

      {/* ---- radar no canto ---- */}
      <div className="hoi-radar">
        <span className="hoi-radar-sweep" />
        <span className="hoi-blip" />
        <span className="hoi-blip" />
        <span className="hoi-blip" />
      </div>

      {/* ---- dobras do papel e vinheta ---- */}
      <div className="hoi-creases" />
    </>
  )
}
