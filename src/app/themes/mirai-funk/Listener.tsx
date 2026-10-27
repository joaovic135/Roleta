// Personagem do cais (canto de baixo da margem esquerda): alguém sentado
// na ponta de um pier de madeira, de costas para a tela, olhando a cidade,
// com um rádio portátil do lado e um poste de luz que acende à noite.
// - parado: as pernas balançam por cima da água e o rádio pulsa na batida;
// - girando a roleta: levanta e dança (tira de 4 quadros em steps);
// - vencedor: pula de braços para cima, três vezes, e fica comemorando.
// Silhueta chapada em traços grossos (viewBox 160 x 110, deque em y = 60).
// Cada parte que se mexe é um <svg> próprio dentro de uma <div>.

// quadros da dança: cabeça, tronco, braços e pernas (centro em 20 + 40k)
const DANCE = [
  { arms: [-11, 6, 11, 6], legs: 'M0 34L-9 56M0 34L9 56' },
  { arms: [10, 5, -10, 30], legs: 'M0 34L-5 56M0 34L10 44L6 54' },
  { arms: [-14, 20, 14, 16], legs: 'M0 34L6 56M0 34L-6 56' },
  { arms: [-10, 5, 10, 30], legs: 'M0 34L5 56M0 34L-10 44L-6 54' },
]
const pose = (k: number) => {
  const cx = 20 + 40 * k
  const { arms, legs } = DANCE[k]
  const shift = (d: string) =>
    d.replace(/([ML])(-?\d+) (-?\d+)/g, (_, c, x, y) => `${c}${+x + cx} ${y}`)
  return (
    `M${cx} 19L${cx + arms[0]} ${arms[1]}M${cx} 19L${cx + arms[2]} ${arms[3]}` +
    `M${cx} 17L${cx} 34` +
    shift(legs)
  )
}
const DANCE_PATH = DANCE.map((_, k) => pose(k)).join('')
const DANCE_HEADS = DANCE.map(
  (_, k) => `M${15 + 40 * k} 10a5 5 0 1 0 10 0a5 5 0 1 0-10 0`,
).join('')

export default function Listener() {
  return (
    <div className="mf-pier">
      {/* poste: halo chapado e poça de luz no deque (só à noite) */}
      <i className="mf-lamp-light mf-cyc" />
      <svg className="mf-pier-base" viewBox="0 0 160 110">
        <path
          className="mf-pier-wood"
          d="M0 60h64v5H0zM6 65h4v45H6zM28 65h4v45h-4zM52 65h4v45h-4zM0 72h64v2H0z"
        />
        <path className="mf-pier-edge" d="M0 59h64v1.4H0z" />
        <path
          className="mf-pier-post"
          d="M11 14h2v46h-2zM6 12h12v4H6zM8 58h8v2H8z"
        />
        <path className="mf-pier-bulb" d="M8 16h8v2.4H8z" />
      </svg>
      {/* sentado de costas, olhando a cidade */}
      <svg className="mf-pier-sit" viewBox="0 0 160 110">
        <path
          className="mf-pier-rim"
          d="M44 37L41 57M43 41L49 51L54 55M41 57L58 58"
        />
        <path
          className="mf-pier-ink"
          d="M44 37L41 57M43 41L49 51L54 55M41 57L58 58"
        />
        <path
          className="mf-pier-fill"
          d="M38 30a5.5 5.5 0 1 0 11 0a5.5 5.5 0 1 0-11 0"
        />
      </svg>
      <div className="mf-pier-legs">
        <svg viewBox="0 0 20 30">
          <path className="mf-pier-rim" d="M4 2L7 21L12 22" />
          <path className="mf-pier-ink" d="M4 2L7 21L12 22" />
        </svg>
      </div>
      {/* rádio portátil: alça, caixa e dois alto-falantes */}
      <div className="mf-pier-box">
        <svg viewBox="0 0 24 16">
          <path className="mf-pier-boxbody" d="M5 0h14v2H5zM1 3h22v13H1z" />
          <path
            className="mf-pier-speaker"
            d="M3 9.5a3.5 3.5 0 1 0 7 0a3.5 3.5 0 1 0-7 0M14 9.5a3.5 3.5 0 1 0 7 0a3.5 3.5 0 1 0-7 0"
          />
          <path className="mf-pier-boxlight" d="M10.5 5h3v1.6h-3z" />
        </svg>
      </div>
      {/* girando: dança em 4 quadros */}
      <div className="mf-pier-dance">
        <svg viewBox="0 0 160 60">
          <path className="mf-pier-rim" d={DANCE_PATH} />
          <path className="mf-pier-ink" d={DANCE_PATH} />
          <path className="mf-pier-fill" d={DANCE_HEADS} />
        </svg>
      </div>
      {/* vencedor: pulo de braços para cima */}
      <div className="mf-pier-cheer">
        <svg viewBox="0 0 40 60">
          <path
            className="mf-pier-rim"
            d="M20 19L8 3M20 19L32 3M20 17L20 34M20 34L12 56M20 34L28 56"
          />
          <path
            className="mf-pier-ink"
            d="M20 19L8 3M20 19L32 3M20 17L20 34M20 34L12 56M20 34L28 56"
          />
          <path
            className="mf-pier-fill"
            d="M15 10a5 5 0 1 0 10 0a5 5 0 1 0-10 0"
          />
        </svg>
      </div>
    </div>
  )
}
