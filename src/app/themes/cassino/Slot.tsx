import type { CSSProperties } from 'react'

// Caça-níquel gigante na fachada da torre da direita (cassino JACKPOT).
// Os rolos são cilindros de verdade em CSS 3D: 8 faces por rolo
// (rotateX(i·45°) translateZ(r)), com os símbolos desenhados uma vez num
// sprite SVG (data URI) e recortados por background-position. Só o rolo
// inteiro gira (transform), então nada repinta.
//
// Ciclo próprio de --cs-slot (210 s, ver theme.css): seis jogadas, cada uma
// com a alavanca puxada e os rolos parando um a um — perde, dois sinos,
// três cerejas (paga, a linha acende), perde, 7-7-uva (o terceiro rolo se
// arrasta e para um antes do 7) e, no fim, 7-7-7: JACKPOT com moedas
// saltando da bandeja. O ciclo volta ao 7-7-7 parado, sem emenda.
//
// Roleta: girando, cada rolo ganha um giro extra num invólucro (com rastro
// de movimento) e a alavanca é puxada; no vencedor os rolos param em 7-7-7
// um a um, o JACKPOT pisca na cor vencedora e sai uma fonte de moedas.

const n = (v: number) => Math.round(v * 100) / 100
const u = (v: number) => `calc(var(--cs-u) * ${n(v)})`
const dot = (x: number, y: number, r: number) =>
  `M${n(x - r)} ${n(y)}a${n(r)} ${n(r)} 0 1 0 ${n(r * 2)} 0a${n(r)} ${n(r)} 0 1 0 ${n(-r * 2)} 0z`
const seeded = (seed: number) => () => {
  seed = (seed + 0x6d2b79f5) | 0
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}

// ---------------------------------------------------------------------
// Símbolos (60 x 64 cada, empilhados num sprite 60 x 512)
// ---------------------------------------------------------------------
const GLYPHS: Record<string, string[]> = {
  B: ['##.', '#.#', '##.', '#.#', '##.'],
  A: ['.#.', '#.#', '###', '#.#', '#.#'],
  R: ['##.', '#.#', '##.', '#.#', '#.#'],
}
const pixelWord = (word: string, x: number, y: number, c: number) => {
  let d = ''
  word.split('').forEach((ch, i) =>
    GLYPHS[ch].forEach((row, r) => {
      for (let k = 0; k < 3; k++)
        if (row[k] === '#')
          d += `M${n(x + i * (c * 4) + k * c)} ${n(y + r * c)}h${c}v${c}h${-c}z`
    }),
  )
  return d
}
const starPath = (cx: number, cy: number, R: number, r: number) =>
  'M' +
  Array.from({ length: 10 }, (_, k) => {
    const a = ((-90 + k * 36) * Math.PI) / 180
    const rr = k % 2 ? r : R
    return `${n(cx + Math.cos(a) * rr)} ${n(cy + Math.sin(a) * rr)}`
  }).join('L') +
  'Z'

const SEVEN = 'M12 10H49V19L33 55H20L35 20H12Z'
const SYMBOLS = [
  // 0: sete
  `<path d="${SEVEN}" fill="#f59e0b" stroke="#f59e0b" stroke-width="6" stroke-linejoin="round"/>` +
    `<path d="${SEVEN}" fill="#dc2626" stroke="#7f1d1d" stroke-width="1.6" stroke-linejoin="round"/>` +
    '<path d="M14 12h33v3H14z" fill="#fecaca" opacity=".7"/>',
  // 1: cerejas
  '<path d="M22 42Q25 26 37 13M39 43Q40 27 37 13" fill="none" stroke="#166534" stroke-width="2.8" stroke-linecap="round"/>' +
    '<path d="M37 13q8-7 16-2q-8 6-16 2z" fill="#22c55e" stroke="#166534"/>' +
    '<circle cx="21" cy="45" r="9.5" fill="#dc2626" stroke="#7f1d1d" stroke-width="1.2"/>' +
    '<circle cx="40" cy="46" r="9.5" fill="#b91c1c" stroke="#7f1d1d" stroke-width="1.2"/>' +
    '<circle cx="18" cy="41.5" r="2.6" fill="#fecaca"/><circle cx="37" cy="42.5" r="2.6" fill="#fecaca"/>',
  // 2: BAR
  '<rect x="6" y="20" width="48" height="24" rx="4" fill="#111827" stroke="#d97706" stroke-width="2"/>' +
    `<path d="${pixelWord('BAR', 12.6, 24.5, 3)}" fill="#fff7e0"/>`,
  // 3: sino
  '<path d="M30 9a3 3 0 0 0-3 3v1.5C19 15.5 15 22 15 31c0 6.5-2.5 10.5-6 13h42c-3.5-2.5-6-6.5-6-13c0-9-4-15.5-12-17.5V12a3 3 0 0 0-3-3z" fill="#fbbf24" stroke="#92400e" stroke-width="1.6"/>' +
    '<rect x="8" y="43" width="44" height="6" rx="3" fill="#f59e0b" stroke="#92400e" stroke-width="1.4"/>' +
    '<circle cx="30" cy="53" r="4.5" fill="#b45309" stroke="#78350f"/>' +
    '<path d="M22 21q-3 6-3 15" fill="none" stroke="#fef3c7" stroke-width="2.6" stroke-linecap="round"/>',
  // 4: diamante
  '<path d="M17 14h26l11 13-24 28L6 27z" fill="#38bdf8" stroke="#0c4a6e" stroke-width="1.6" stroke-linejoin="round"/>' +
    '<path d="M17 14l7 13H6z" fill="#e0f2fe"/><path d="M30 14l6 13H24z" fill="#7dd3fc"/>' +
    '<path d="M6 27h48M17 14l7 13 6-13 6 13 7-13M24 27l6 28 6-28" fill="none" stroke="#0c4a6e" stroke-width="1.1" stroke-linejoin="round"/>',
  // 5: ferradura
  '<path d="M11 10h11v20c0 7 3.5 11 8 11s8-4 8-11V10h11v21c0 13-8.5 22-19 22S11 44 11 31z" fill="#f59e0b" stroke="#78350f" stroke-width="1.6" stroke-linejoin="round"/>' +
    '<path d="M11 10h11v5H11zM38 10h11v5H38z" fill="#fde68a"/>' +
    `<path d="${[
      [16.5, 22],
      [16.5, 32],
      [20.5, 42],
      [43.5, 22],
      [43.5, 32],
      [39.5, 42],
    ]
      .map(([x, y]) => dot(x, y, 1.5))
      .join('')}" fill="#78350f"/>`,
  // 6: estrela
  `<path d="${starPath(30, 34, 22, 9.5)}" fill="#facc15" stroke="#b45309" stroke-width="1.8" stroke-linejoin="round"/>` +
    `<path d="${starPath(28.5, 31.5, 9, 4)}" fill="#fef9c3" opacity=".75"/>`,
  // 7: uvas
  '<path d="M30 18Q31 11 36 7" fill="none" stroke="#166534" stroke-width="2.6" stroke-linecap="round"/>' +
    '<path d="M31 15q-10-9-17-2q8 5 17 2z" fill="#22c55e" stroke="#166534"/>' +
    [
      [20, 25],
      [30, 24],
      [40, 25],
      [25, 34],
      [35, 34],
      [30, 43],
      [20, 43],
      [40, 43],
      [30, 52],
    ]
      .map(
        ([x, y]) =>
          `<circle cx="${x}" cy="${y}" r="6" fill="#7c3aed" stroke="#4c1d95" stroke-width="1.1"/><circle cx="${x - 2}" cy="${y - 2}" r="1.7" fill="#ddd6fe"/>`,
      )
      .join(''),
]
const STRIP =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 512">' +
  SYMBOLS.map((s, i) => `<g transform="translate(0 ${i * 64})">${s}</g>`).join(
    '',
  ) +
  '</svg>'
const STRIP_URL = `url("data:image/svg+xml,${encodeURIComponent(STRIP)}")`

// ---------------------------------------------------------------------
// Gabinete (viewBox 120 x 342; a alavanca fica do lado direito)
// ---------------------------------------------------------------------
const VW = 120
const VH = 342
const REEL_X = 14
const REEL_Y = 76
const REEL_W = 26
const REEL_GAP = 5
const REEL_H = 74
// face do rolo: 26 x 30; raio = 30 / (2 tan 22,5°)
const FACE_H = 30
const RADIUS = FACE_H / (2 * Math.tan(Math.PI / 8))

// lâmpadas: lado esquerdo de baixo para cima, arco, lado direito descendo
const bulbs = (() => {
  const pts: number[][] = []
  for (let y = 306; y >= 64; y -= 11) pts.push([6.5, y])
  pts.push([12, 51], [12, 43])
  const q = (p0: number[], p1: number[], p2: number[], t: number) => [
    (1 - t) ** 2 * p0[0] + 2 * (1 - t) * t * p1[0] + t * t * p2[0],
    (1 - t) ** 2 * p0[1] + 2 * (1 - t) * t * p1[1] + t * t * p2[1],
  ]
  for (let k = 0; k < 11; k++)
    pts.push(q([12, 37], [12, 8.5], [58, 7.5], (k + 0.5) / 11))
  for (let k = 0; k < 11; k++)
    pts.push(q([58, 7.5], [104, 8.5], [104, 37], (k + 0.5) / 11))
  pts.push([104, 43], [104, 51])
  for (let y = 64; y <= 306; y += 11) pts.push([109.5, y])
  const phases = ['', '', '']
  const halos = ['', '', '']
  let all = ''
  let allHalo = ''
  let off = ''
  pts.forEach(([x, y], i) => {
    phases[i % 3] += dot(x, y, 1.9)
    halos[i % 3] += dot(x, y, 4.2)
    all += dot(x, y, 2)
    allHalo += dot(x, y, 4.6)
    off += dot(x, y, 1.7)
  })
  return { phases, halos, all, allHalo, off }
})()

// raios do painel de baixo (art déco)
const SUNBURST = Array.from({ length: 15 }, (_, i) => {
  const a0 = Math.PI + (i / 15) * Math.PI
  const a1 = a0 + Math.PI / 30
  const r = 80
  return `M58 284L${n(58 + Math.cos(a0) * r)} ${n(284 + Math.sin(a0) * r)}L${n(58 + Math.cos(a1) * r)} ${n(284 + Math.sin(a1) * r)}Z`
}).join('')

// moedas: arco balístico até a avenida (y = d + p·s² + q·s, s de 0 a 1)
const COINS = Array.from({ length: 14 }, (_, i) => {
  const r = seeded(70 + i * 13)
  const h = 95 + r() * 150
  const fall = 420 + r() * 40
  const a = 1 / (1 + Math.sqrt((fall + h) / h))
  const burst = i < 7 ? 0 : 1
  return {
    dx: -125 + r() * 165,
    p: h / (a * a),
    q: (-2 * h) / a,
    spin: (2 + Math.floor(r() * 3)) * 360 * (r() < 0.5 ? -1 : 1),
    // atraso na jogada do 777 da máquina (só as 4 primeiras)
    d: i * 0.13,
    // atraso na vitória da roleta: duas rajadas
    wd: 1.85 + burst * 0.85 + (i % 7) * 0.075 + r() * 0.05,
  }
})

const reelStyle = (j: number): CSSProperties => ({
  left: u(REEL_X + j * (REEL_W + REEL_GAP)),
  top: u(REEL_Y),
  width: u(REEL_W),
  height: u(REEL_H),
})

export default function SlotMachine() {
  return (
    <div
      className="cs-slot"
      style={{ '--cs-strip': STRIP_URL } as CSSProperties}
    >
      <i className="cs-slot-halo" />
      <svg className="cs-slot-body" viewBox={`0 0 ${VW} ${VH}`}>
        <defs>
          <linearGradient id="cs-slot-cab" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#a3212b" />
            <stop offset="0.55" stopColor="#6b0f18" />
            <stop offset="1" stopColor="#3b070c" />
          </linearGradient>
          <linearGradient id="cs-slot-side" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" stopColor="#7a5418" />
            <stop offset="0.45" stopColor="#ffe8a3" />
            <stop offset="1" stopColor="#a8761f" />
          </linearGradient>
          <linearGradient id="cs-slot-gold" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#fff1c1" />
            <stop offset="0.5" stopColor="#e2a93b" />
            <stop offset="1" stopColor="#8a5a14" />
          </linearGradient>
          <linearGradient id="cs-slot-chrome" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" stopColor="#475569" />
            <stop offset="0.5" stopColor="#f1f5f9" />
            <stop offset="1" stopColor="#64748b" />
          </linearGradient>
          <radialGradient id="cs-slot-top" cx="0.5" cy="0.9" r="0.8">
            <stop offset="0" stopColor="#2a2f6b" />
            <stop offset="1" stopColor="#0b1030" />
          </radialGradient>
          <linearGradient id="cs-slot-base" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#5b0d14" />
            <stop offset="1" stopColor="#1c0306" />
          </linearGradient>
          <clipPath id="cs-slot-panel">
            <rect x="14" y="198" width="88" height="86" rx="5" />
          </clipPath>
        </defs>
        {/* base com frisos e pés dourados */}
        <path d="M2 318h112l-3 18H5z" fill="url(#cs-slot-base)" />
        <rect
          x="0"
          y="316"
          width="116"
          height="4"
          rx="1"
          fill="url(#cs-slot-gold)"
        />
        <path
          d="M12 327h92"
          stroke="#e8b84a"
          strokeOpacity="0.5"
          strokeWidth="0.8"
          strokeDasharray="3 3"
        />
        <path d="M5 336h16v5H5zM95 336h16v5H95z" fill="url(#cs-slot-gold)" />
        <rect
          x="4"
          y="52"
          width="108"
          height="266"
          rx="6"
          fill="url(#cs-slot-cab)"
          stroke="#e8b84a"
          strokeWidth="1.4"
        />
        <path
          d="M4 58h6v254H4zM106 58h6v254h-6z"
          fill="url(#cs-slot-side)"
          opacity="0.85"
        />
        {/* topo em arco com o letreiro */}
        <path
          d="M8 57V38Q8 4 58 3Q108 4 108 38V57Z"
          fill="url(#cs-slot-top)"
          stroke="#e8b84a"
          strokeWidth="2"
        />
        <path
          d="M18 50V39Q18 15 58 13Q98 15 98 39V50Z"
          fill="none"
          stroke="#e8b84a"
          strokeOpacity="0.35"
          strokeWidth="0.8"
        />
        <path className="cs-slot-bulb-off" d={bulbs.off} />
        <text className="cs-slot-word cs-slot-word-off" x="58" y="40">
          JACKPOT
        </text>
        {/* moldura da janela dos rolos e setas da linha */}
        <rect
          x="9"
          y="69"
          width="98"
          height="88"
          rx="7"
          fill="#07070c"
          stroke="url(#cs-slot-gold)"
          strokeWidth="3"
        />
        <path d="M7 108l6 5-6 5zM109 108l-6 5 6 5z" fill="#f43f5e" />
        {/* visor de créditos e botões */}
        <rect
          x="18"
          y="162"
          width="80"
          height="15"
          rx="3"
          fill="#160709"
          stroke="#b8862f"
        />
        <text className="cs-slot-led" x="58" y="172.6">
          CRÉDITO 0777
        </text>
        <path
          d="M18 183h17v8H18zM39 183h17v8H39zM60 183h17v8H60zM81 183h17v8H81z"
          fill="#1a0507"
        />
        <rect x="19" y="184" width="15" height="6" rx="2.5" fill="#ef4444" />
        <rect x="40" y="184" width="15" height="6" rx="2.5" fill="#f59e0b" />
        <rect x="61" y="184" width="15" height="6" rx="2.5" fill="#22c55e" />
        <rect x="82" y="184" width="15" height="6" rx="2.5" fill="#38bdf8" />
        <path
          d="M21 185h11v1.6H21zM42 185h11v1.6H42zM63 185h11v1.6H63zM84 185h11v1.6H84z"
          fill="#fff"
          opacity="0.55"
        />
        {/* painel de baixo: raios art déco e o nome da casa */}
        <rect
          x="14"
          y="198"
          width="88"
          height="86"
          rx="5"
          fill="#0b1030"
          stroke="#e8b84a"
          strokeWidth="1.2"
        />
        <path
          d={SUNBURST}
          fill="#e8b84a"
          opacity="0.16"
          clipPath="url(#cs-slot-panel)"
        />
        <path
          d={
            starPath(37, 214, 4, 1.8) +
            starPath(58, 211, 5, 2.2) +
            starPath(79, 214, 4, 1.8)
          }
          fill="#fbbf24"
        />
        <text className="cs-slot-name" x="58" y="244">
          Sorte
        </text>
        <text className="cs-slot-sub" x="58" y="259">
          GRANDE
        </text>
        <path
          d="M30 266h56"
          stroke="#e8b84a"
          strokeOpacity="0.6"
          strokeWidth="0.8"
        />
        {/* bandeja de moedas */}
        <rect x="34" y="288" width="48" height="10" rx="3" fill="#020203" />
        <path
          d="M28 297h60l-5 11H33z"
          fill="url(#cs-slot-gold)"
          stroke="#7a5418"
          strokeWidth="0.8"
        />
        <path
          d={dot(52, 302, 2.6) + dot(60, 303, 2.6) + dot(67, 301.5, 2.4)}
          fill="#fde68a"
        />
        {/* rebites e eixo da alavanca */}
        <path
          d={[
            [10, 62],
            [106, 62],
            [10, 310],
            [106, 310],
          ]
            .map(([x, y]) => dot(x, y, 1.3))
            .join('')}
          fill="#fde68a"
        />
        <rect
          x="110"
          y="141"
          width="10"
          height="20"
          rx="3"
          fill="url(#cs-slot-chrome)"
          stroke="#334155"
          strokeWidth="0.8"
        />
      </svg>

      {/* janela dos rolos: três cilindros 3D */}
      {[0, 1, 2].map((j) => (
        <div key={j} className="cs-reelbox" style={reelStyle(j)}>
          <div className={`cs-whirl cs-whirl-${j + 1}`}>
            <div className={`cs-reel cs-reel-${j + 1} cs-scyc`}>
              {Array.from({ length: 8 }, (_, i) => (
                <i
                  key={i}
                  style={{
                    transform: `rotateX(${i * 45}deg) translateZ(${u(RADIUS)})`,
                    backgroundPosition: `50% ${n((i / 7) * 100)}%, 0 0`,
                  }}
                />
              ))}
            </div>
          </div>
          <i className={`cs-blur cs-blur-${j + 1}`} />
        </div>
      ))}
      {/* curvatura (sombra em cima e embaixo), vidro e linha de pagamento */}
      <i
        className="cs-reelglass"
        style={{
          left: u(REEL_X - 2),
          top: u(REEL_Y),
          width: u(REEL_W * 3 + REEL_GAP * 2 + 4),
          height: u(REEL_H),
        }}
      />
      <i
        className="cs-payline cs-scyc"
        style={{ top: u(REEL_Y + REEL_H / 2 - 1.5) }}
      />

      {/* lâmpadas correndo em 3 fases e a camada da cor vencedora */}
      {bulbs.phases.map((d, i) => (
        <svg
          key={i}
          className={`cs-slot-chase cs-chase cs-chase-${i}`}
          viewBox={`0 0 ${VW} ${VH}`}
        >
          <path className="cs-bulb-halo" d={bulbs.halos[i]} />
          <path className="cs-bulb" d={d} />
        </svg>
      ))}
      <svg className="cs-slot-winbulbs" viewBox={`0 0 ${VW} ${VH}`}>
        <path className="cs-winbulb-halo" d={bulbs.allHalo} />
        <path className="cs-winbulb" d={bulbs.all} />
      </svg>

      {/* letreiro JACKPOT: neon fixo, clarão do 777 e a cor vencedora */}
      <svg className="cs-slot-neon" viewBox={`0 0 ${VW} ${VH}`}>
        <text className="cs-slot-word" x="58" y="40">
          JACKPOT
        </text>
      </svg>
      <svg className="cs-slot-flash cs-scyc" viewBox={`0 0 ${VW} ${VH}`}>
        <text className="cs-slot-word" x="58" y="40">
          JACKPOT
        </text>
      </svg>
      <svg className="cs-slot-winword" viewBox={`0 0 ${VW} ${VH}`}>
        <text className="cs-slot-word" x="58" y="40">
          JACKPOT
        </text>
      </svg>

      {/* alavanca: haste cromada e bola vermelha (dois discos cruzados) */}
      <div className="cs-lever">
        <div className="cs-lever-arm cs-scyc">
          <i className="cs-lever-rod" />
          <b className="cs-lever-knob">
            <i />
            <i />
          </b>
        </div>
      </div>

      {/* moedas: saem da bandeja */}
      {COINS.map((c, i) => (
        <i
          key={i}
          className={i < 4 ? 'cs-coin cs-coin-j cs-scyc' : 'cs-coin'}
          style={
            {
              '--cs-dx': u(c.dx),
              '--cs-p': u(c.p),
              '--cs-q': u(c.q),
              '--cs-spin': `${c.spin}deg`,
              '--cs-d': `${n(c.d)}s`,
              '--cs-wd': `${n(c.wd)}s`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  )
}
