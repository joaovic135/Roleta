import {
  BULBS,
  CYAN,
  FACETS,
  FLECKS_FAST,
  FLECKS_SLOW,
  FLOOR,
  HOT,
  INK,
  LILAC,
  MINT,
  PALM_LEAVES,
  PALM_NUTS,
  PALM_RINGS,
  PALM_TRUNK,
  PINK,
  SKY,
  SPARKLE,
  WIRES,
  YELLOW,
  r1,
  vars,
} from './art'

// Objetos da festa: todos estáticos no SVG; o que se mexe é sempre um
// elemento HTML próprio (cone do alto-falante, carretel, barra do
// equalizador, nota musical), animado só em transform/opacity.

// ---- Rádio boombox (margem direita, no chão) -------------------------------
// viewBox 200×130: cones em (45,84) e (151,84), visor em x 83–113.

// Equalizador: 4 quadros empilhados (6 barras cada) numa tira só, que
// desce um quadro por vez com steps(4): uma animação em vez de seis.
const EQ_H = [
  [0.9, 0.5, 0.75, 0.45, 0.95, 0.6],
  [0.45, 1, 0.3, 0.85, 0.4, 0.9],
  [1, 0.65, 0.55, 1, 0.7, 0.35],
  [0.3, 0.85, 1, 0.6, 0.25, 0.75],
]
const EQ = (() => {
  const seg = ['', '', '']
  EQ_H.forEach((row, f) =>
    row.forEach((h, b) => {
      const x = b * 10 + 1.5
      const base = f * 20 + 19
      // 0–45% menta, 45–75% amarelo, 75–100% rosa
      const cuts = [0, 0.45, 0.75, 1]
      for (let k = 0; k < 3; k++) {
        const lo = cuts[k] * 18
        const hi = Math.min(cuts[k + 1], h) * 18
        if (hi > lo) seg[k] += `M${x} ${r1(base - lo)}h7v${r1(lo - hi)}h-7z`
      }
    }),
  )
  return seg
})()

export const Boombox = () => (
  <div className="gt-boombox">
    <svg viewBox="0 0 200 130" aria-hidden="true">
      <path d="M166 31L188 6" stroke={INK} strokeWidth="3" />
      <circle cx="189" cy="5" r="3.6" fill={HOT} stroke={INK} strokeWidth="2" />
      <path
        d="M52 30V17q0-8 8-8h76q8 0 8 8v13"
        fill="none"
        stroke={INK}
        strokeWidth="10"
        strokeLinecap="round"
      />
      <path
        d="M52 30V17q0-8 8-8h76q8 0 8 8v13"
        fill="none"
        stroke={CYAN}
        strokeWidth="4.5"
        strokeLinecap="round"
      />
      <rect x="12" y="34" width="186" height="94" rx="13" fill={INK} />
      <rect
        x="5"
        y="27"
        width="186"
        height="94"
        rx="13"
        fill={PINK}
        stroke={INK}
        strokeWidth="3.5"
      />
      <path
        d="M14 106q8-6 16 0t16 0M150 106q8-6 16 0t16 0"
        fill="none"
        stroke="#fff"
        strokeWidth="2.5"
        strokeLinecap="round"
        opacity=".7"
      />
      <rect
        x="12"
        y="32"
        width="172"
        height="15"
        rx="5"
        fill={LILAC}
        stroke={INK}
        strokeWidth="2.5"
      />
      <path
        d="M70 35h10v9h-10zM96 35h10v9h-10z"
        fill={YELLOW}
        stroke={INK}
        strokeWidth="2"
      />
      <path
        d="M83 35h10v9h-10zM109 35h10v9h-10z"
        fill={CYAN}
        stroke={INK}
        strokeWidth="2"
      />
      <path d="M20 39h36M140 39h36" stroke={INK} strokeWidth="2" />
      <circle cx="45" cy="84" r="33" fill={INK} />
      <circle cx="151" cy="84" r="33" fill={INK} />
      <circle cx="45" cy="84" r="30" fill={SKY} />
      <circle cx="151" cy="84" r="30" fill={SKY} />
      <rect
        x="82"
        y="51"
        width="32"
        height="19"
        rx="3"
        fill="#2a2140"
        stroke={INK}
        strokeWidth="2.5"
      />
      <rect
        x="82"
        y="74"
        width="32"
        height="23"
        rx="3"
        fill={SKY}
        stroke={INK}
        strokeWidth="2.5"
      />
      <path d="M86 92h24" stroke={INK} strokeWidth="1.6" />
      <circle
        cx="90"
        cy="109"
        r="5"
        fill={YELLOW}
        stroke={INK}
        strokeWidth="2"
      />
      <circle
        cx="106"
        cy="109"
        r="5"
        fill={MINT}
        stroke={INK}
        strokeWidth="2"
      />
      <path d="M90 105v4M106 105v4" stroke={INK} strokeWidth="1.6" />
    </svg>
    {/* luz do visor (acende à noite e no giro) */}
    <i className="gt-bb-lcd" />
    <div className="gt-eq">
      <svg className="gt-eq-strip" viewBox="0 0 60 80" aria-hidden="true">
        <path d={EQ[0]} fill="#8ff0c1" />
        <path d={EQ[1]} fill="#fff36b" />
        <path d={EQ[2]} fill="#ff6fbf" />
      </svg>
    </div>
    <i className="gt-reel gt-reel-l" />
    <i className="gt-reel gt-reel-r" />
    <div className="gt-cone-wrap gt-cone-l">
      <i className="gt-cone" />
    </div>
    <div className="gt-cone-wrap gt-cone-r">
      <i className="gt-cone" />
    </div>
    <i className="gt-bb-led" />
    <div className="gt-notes">
      <i className="gt-note gt-note-1">♪</i>
      <i className="gt-note gt-note-2">♫</i>
      <i className="gt-note gt-note-3">♪</i>
    </div>
    {/* notas extras só enquanto a roleta gira */}
    <div className="gt-notes gt-notes-wild">
      <i className="gt-note gt-note-1">♫</i>
      <i className="gt-note gt-note-2">♪</i>
      <i className="gt-note gt-note-3">♫</i>
    </div>
  </div>
)

// ---- Globo espelhado (faixa de cima) e reflexos ----------------------------

export const DiscoBall = () => (
  <div className="gt-disco">
    <div className="gt-disco-drop">
      <i className="gt-disco-cord" />
      <i className="gt-disco-halo" />
      <i className="gt-disco-win" />
      <div className="gt-disco-ball">
        <i
          className="gt-disco-facets"
          style={vars({ '--gt-facets': FACETS })}
        />
        <i className="gt-disco-shade" />
      </div>
      <svg viewBox="0 0 100 100" className="gt-disco-glint gt-dg-1">
        <path d={SPARKLE} />
      </svg>
      <svg viewBox="0 0 100 100" className="gt-disco-glint gt-dg-2">
        <path d={SPARKLE} />
      </svg>
    </div>
  </div>
)

export const Flecks = () => (
  <div
    className="gt-flecks"
    style={vars({ '--gt-flecks': FLECKS_SLOW, '--gt-flecks-2': FLECKS_FAST })}
  >
    <i className="gt-flecks-disc gt-flecks-slow" />
    <i className="gt-flecks-disc gt-flecks-fast" />
  </div>
)

// ---- Varal de lâmpadas ------------------------------------------------------

export const StringLights = () => (
  <div className="gt-lights">
    <svg
      className="gt-wires"
      viewBox="0 0 1000 100"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path d={WIRES} />
    </svg>
    {BULBS.map((b, i) => (
      <i
        key={i}
        className="gt-bulb"
        style={{
          left: `${b.x}%`,
          top: `calc(${r1(b.y * 0.12)} * var(--gt-vh))`,
          ...vars({ '--gt-c': b.color }),
        }}
      />
    ))}
    <div className="gt-glows">
      {[0, 1, 2].map((g) => (
        <div key={g} className={`gt-glow-g gt-glow-g${g}`}>
          {BULBS.filter((b) => b.group === g).map((b, i) => (
            <i
              key={i}
              className="gt-glow"
              style={{
                left: `${b.x}%`,
                top: `calc(${r1(b.y * 0.12)} * var(--gt-vh))`,
                ...vars({ '--gt-c': b.color }),
              }}
            />
          ))}
        </div>
      ))}
    </div>
  </div>
)

// ---- Pista de dança xadrez (faixa de baixo) --------------------------------

export const Floor = () => (
  <div className="gt-floor">
    <svg viewBox="0 0 1000 100" preserveAspectRatio="none" aria-hidden="true">
      <rect x="-10" y="0" width="1020" height="100" fill="#fbf7ff" />
      <path d={FLOOR.pink} fill="#f7b5dc" />
      <path className="gt-floor-lines" d={FLOOR.lines} />
    </svg>
    <svg
      className="gt-floor-lit gt-floor-a"
      viewBox="0 0 1000 100"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path d={FLOOR.litA} />
    </svg>
    <svg
      className="gt-floor-lit gt-floor-b"
      viewBox="0 0 1000 100"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path d={FLOOR.litB} />
    </svg>
  </div>
)

// ---- Sol listrado de óculos escuros ----------------------------------------

export const Sun = () => (
  <div className="gt-sun-path">
    <i className="gt-sun-rays" />
    <i className="gt-sun-glow" />
    <i className="gt-sun" />
    <i className="gt-sun gt-sun-hot" />
    <i className="gt-sun-eyes" />
    <div className="gt-shades">
      <svg viewBox="0 0 120 40" aria-hidden="true">
        <path
          d="M4 8h112v5h-4q-3 21-22 21H74q-12 0-13-15h-2q-1 15-13 15H30Q11 34 8 13H4z"
          fill={INK}
        />
        <path
          d="M14 12h38q0 18-12 18H28Q15 30 14 12zM68 12h38q-1 18-14 18H80Q68 30 68 12z"
          fill="url(#gt-lens)"
        />
        <path d="M20 15l10 0M74 15l10 0" stroke="#fff" strokeWidth="3" />
        <defs>
          <linearGradient id="gt-lens" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={HOT} />
            <stop offset=".55" stopColor="#9a7cf0" />
            <stop offset="1" stopColor={CYAN} />
          </linearGradient>
        </defs>
      </svg>
      <div className="gt-shades-clip">
        <i className="gt-shades-glint" />
      </div>
    </div>
  </div>
)

// ---- Palmeira ---------------------------------------------------------------

export const Palm = ({ className }: { className: string }) => (
  <div className={`gt-palm ${className}`}>
    <svg viewBox="0 0 240 320" preserveAspectRatio="xMidYMax meet">
      <path className="gt-palm-trunk" d={PALM_TRUNK} />
      <path className="gt-palm-rings" d={PALM_RINGS} />
      <path className="gt-palm-leaves" d={PALM_LEAVES} />
      <path className="gt-palm-nuts" d={PALM_NUTS} />
    </svg>
  </div>
)

// ---- Adesivos colados no papel (margem esquerda) ---------------------------
// Corte branco em volta (stroke grosso por baixo do contorno preto).
// A etiqueta lilás descola a ponta de vez em quando (dobra em 3D).

// estrela de 12 pontas (selo)
const STARBURST = (() => {
  const pts: string[] = []
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * Math.PI * 2 - Math.PI / 2
    const r = i % 2 ? 36 : 47
    pts.push(`${r1(50 + Math.cos(a) * r)} ${r1(50 + Math.sin(a) * r)}`)
  }
  return `M${pts.join('L')}Z`
})()
const BOLT = 'M34 4L8 56h18L16 96l38-58H34L46 4Z'

export const Stickers = () => (
  <div className="gt-stickers">
    <div className="gt-stk gt-stk-smile">
      <svg viewBox="0 0 100 100" aria-hidden="true">
        <circle cx="50" cy="50" r="44" fill="#fff" />
        <circle
          cx="50"
          cy="50"
          r="38"
          fill={YELLOW}
          stroke={INK}
          strokeWidth="4"
        />
        <path
          d="M36 36v10M64 36v10"
          stroke={INK}
          strokeWidth="6"
          strokeLinecap="round"
        />
        <path
          d="M31 58q19 20 38 0"
          fill="none"
          stroke={INK}
          strokeWidth="5"
          strokeLinecap="round"
        />
        <path
          d="M26 54l-4 3M74 54l4 3"
          stroke={HOT}
          strokeWidth="4"
          strokeLinecap="round"
        />
      </svg>
    </div>
    <div className="gt-stk gt-stk-star">
      <svg viewBox="0 0 100 100" aria-hidden="true">
        <path className="gt-stk-cut" d={STARBURST} />
        <path d={STARBURST} fill={HOT} stroke={INK} strokeWidth="3.5" />
      </svg>
      <b>
        100%
        <br />
        FUNK
      </b>
    </div>
    <div className="gt-stk gt-stk-bolt">
      <svg viewBox="0 0 60 100" aria-hidden="true">
        <path className="gt-stk-cut" d={BOLT} />
        <path d={BOLT} fill={CYAN} stroke={INK} strokeWidth="3.5" />
      </svg>
    </div>
    <div className="gt-stk gt-stk-label">
      <div className="gt-label-body">
        <b>BOA SORTE</b>
        <small>♪ edição limitada ♪</small>
      </div>
      <div className="gt-peel">
        <i className="gt-peel-front" />
        <i className="gt-peel-back" />
      </div>
    </div>
  </div>
)

// ---- Fita cassete flutuando (faixa de cima) --------------------------------

export const Cassette = () => (
  <div className="gt-cassette">
    <svg viewBox="0 0 120 76" aria-hidden="true">
      <rect x="8" y="8" width="110" height="66" rx="7" fill={INK} />
      <rect
        x="3"
        y="3"
        width="110"
        height="66"
        rx="7"
        fill={LILAC}
        stroke={INK}
        strokeWidth="3"
      />
      <rect
        x="12"
        y="10"
        width="92"
        height="34"
        rx="4"
        fill="#fff"
        stroke={INK}
        strokeWidth="2.5"
      />
      <path d="M12 18h92" stroke={HOT} strokeWidth="5" />
      <path d="M12 23h92" stroke={CYAN} strokeWidth="3" />
      <rect
        x="34"
        y="27"
        width="48"
        height="14"
        rx="7"
        fill="#2a2140"
        stroke={INK}
        strokeWidth="2"
      />
      <path
        d="M26 69l6-13h52l6 13"
        fill={PINK}
        stroke={INK}
        strokeWidth="2.5"
      />
      <circle cx="40" cy="62" r="2.5" fill={INK} />
      <circle cx="76" cy="62" r="2.5" fill={INK} />
    </svg>
    <i className="gt-creel gt-creel-l" />
    <i className="gt-creel gt-creel-r" />
  </div>
)
