import type { CSSProperties } from 'react'

// Brinquedos 3D do bulevar (CSS preserve-3d, só transform/opacity):
// - dados vermelhos translúcidos no alto da torre da esquerda: cubos de 6
//   faces que pulam e capotam a cada ~23 s (ciclo --cs-dice, 46 s);
// - duas pilhas de fichas no terraço do pódio, com a ficha de cima jogada
//   para o alto e girando antes de cair de volta na pilha;
// - truque de cartas na faixa do céu: um sequência real de copas sai de um
//   estalo dourado, voa virando (frente e verso) e some em outro estalo
//   (ciclo --cs-cards, 54 s);
// - dirigível com letreiro de LED passando devagar pelo alto (160 s).

const n = (v: number) => Math.round(v * 100) / 100

// ---------------------------------------------------------------------
// Dados: faces opostas somam 7 (frente 5, trás 2, direita 4, esquerda 3,
// cima 6, baixo 1); pips são gradientes no CSS (.cs-pip-N)
// ---------------------------------------------------------------------
const FACES: [number, string][] = [
  [5, 'translateZ(var(--cs-half))'],
  [2, 'rotateY(180deg) translateZ(var(--cs-half))'],
  [4, 'rotateY(90deg) translateZ(var(--cs-half))'],
  [3, 'rotateY(-90deg) translateZ(var(--cs-half))'],
  [6, 'rotateX(90deg) translateZ(var(--cs-half))'],
  [1, 'rotateX(-90deg) translateZ(var(--cs-half))'],
]

export function Dice() {
  return (
    <div className="cs-dice">
      <i className="cs-dice-light" />
      {[0, 1].map((k) => (
        // pulo + inclinação de 3/4 num só elemento; o cubo capota dentro
        <div key={k} className={`cs-die cs-die-${k}`}>
          <div className="cs-die-cube">
            {FACES.map(([v, t]) => (
              <i key={v} className={`cs-pip-${v}`} style={{ transform: t }} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------
// Fichas: pilhas desenhadas de lado (SVG estático) e a ficha do topo em 3D
// ---------------------------------------------------------------------
type ChipTone = { body: string; edge: string; spot: string }
const TONES: Record<string, ChipTone> = {
  red: { body: '#b91c1c', edge: '#7f1d1d', spot: '#fef2f2' },
  black: { body: '#111827', edge: '#020617', spot: '#fbbf24' },
  violet: { body: '#6d28d9', edge: '#3b0764', spot: '#f5f3ff' },
  gold: { body: '#d97706', edge: '#78350f', spot: '#fffbeb' },
}
// pilha: de baixo para cima; cada ficha = faixa lateral com listras +
// elipse do topo (só a de cima aparece inteira)
const stack = (tones: string[], cx: number, base: number) => {
  const rx = 24
  const ry = 6.5
  const th = 6
  const parts: { d: string; fill: string }[] = []
  tones.forEach((name, i) => {
    const t = TONES[name]
    const y = base - i * th
    const ox = cx + ((i * 37) % 5) - 2
    parts.push({
      d: `M${ox - rx} ${y - th}v${th}a${rx} ${ry} 0 0 0 ${rx * 2} 0v${-th}z`,
      fill: t.edge,
    })
    let spots = ''
    for (let k = -2; k <= 2; k++) {
      const x = ox + k * 10.5
      spots += `M${n(x - 2.4)} ${n(y - th + 1 + Math.abs(k) * -0.2)}h4.8v${th - 1}h-4.8z`
    }
    parts.push({ d: spots, fill: t.spot })
    parts.push({
      d: `M${ox - rx} ${y - th}a${rx} ${ry} 0 0 0 ${rx * 2} 0a${rx} ${ry} 0 0 0 ${-rx * 2} 0z`,
      fill: t.body,
    })
    // a ficha de cima mostra o anel e o miolo
    if (i === tones.length - 1)
      for (const [k, fill] of [
        [0.62, t.spot],
        [0.52, t.body],
      ] as const)
        parts.push({
          d: `M${n(ox - rx * k)} ${y - th}a${n(rx * k)} ${n(ry * k)} 0 0 0 ${n(rx * k * 2)} 0a${n(rx * k)} ${n(ry * k)} 0 0 0 ${n(-rx * k * 2)} 0z`,
          fill,
        })
  })
  return parts
}
const STACKS = [
  { tones: ['red', 'black', 'red', 'violet', 'red', 'black'], cx: 30 },
  { tones: ['black', 'gold', 'black', 'gold'], cx: 82 },
]

export function Chips() {
  return (
    <div className="cs-chips">
      <i className="cs-chips-glow" />
      <svg className="cs-chips-stack" viewBox="0 0 112 70">
        {STACKS.flatMap((s, si) =>
          stack(s.tones, s.cx, 64).map((p, i) => (
            <path key={`${si}-${i}`} d={p.d} fill={p.fill} />
          )),
        )}
      </svg>
      {(['red', 'gold'] as const).map((tone, k) => (
        // ficha em 3D: face de cima, borda e face de baixo (sobe girando)
        <div key={tone} className={`cs-chip cs-chip-${tone} cs-toss-${k}`}>
          <i />
          <i />
          <i />
        </div>
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------
// Cartas voando na faixa do céu
// ---------------------------------------------------------------------
const HAND = ['A', 'K', 'Q', 'J', '10']
const HEART =
  'M10 17.5C4 13 1 9.6 1 6.2C1 3.4 3.2 1.4 5.8 1.4C7.6 1.4 9.1 2.4 10 3.9C10.9 2.4 12.4 1.4 14.2 1.4C16.8 1.4 19 3.4 19 6.2C19 9.6 16 13 10 17.5Z'

export function Cards() {
  return (
    <div className="cs-cards">
      <i className="cs-poof cs-poof-in" />
      <i className="cs-poof cs-poof-out" />
      {HAND.map((rank, k) => (
        <div
          key={rank}
          className="cs-card"
          style={{ '--cs-k': `${k * 0.42}s` } as CSSProperties}
        >
          <div className="cs-card-front">
            <svg viewBox="0 0 30 42">
              <text className="cs-card-rank" x="4" y="10.5">
                {rank}
              </text>
              <path d={HEART} transform="translate(9.5 15) scale(0.55)" />
              <path d={HEART} transform="translate(3.3 12.2) scale(0.22)" />
            </svg>
          </div>
          <div className="cs-card-back" />
        </div>
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------
// Dirigível com letreiro de LED
// ---------------------------------------------------------------------
const LED = '★ GIRE A ROLETA ★ HOJE É DIA DE SORTE ★ JACKPOT 777 ★ '

export function Blimp() {
  return (
    <div className="cs-blimp">
      <svg viewBox="0 0 240 84">
        <defs>
          <linearGradient id="cs-blimp-body" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#64748b" />
            <stop offset="0.45" stopColor="#334155" />
            <stop offset="1" stopColor="#0f172a" />
          </linearGradient>
        </defs>
        {/* lemes da cauda (à direita: ele anda para a esquerda) */}
        <path
          d="M196 34L236 8h4l-6 28zM196 36L236 62h4l-6-26z"
          fill="#1e293b"
          stroke="#e8b84a"
          strokeWidth="1"
        />
        <ellipse cx="118" cy="36" rx="110" ry="27" fill="url(#cs-blimp-body)" />
        <path
          d="M14 36Q118 6 222 36"
          fill="none"
          stroke="#cbd5e1"
          strokeOpacity="0.35"
          strokeWidth="2"
        />
        <path
          d="M10 40Q118 70 226 40"
          fill="none"
          stroke="#e8b84a"
          strokeWidth="1.6"
        />
        {/* gôndola com janelas acesas */}
        <path d="M98 61h42l-4 9h-34z" fill="#0f172a" stroke="#e8b84a" />
        <path
          d="M104 63.5h4v3h-4zM111 63.5h4v3h-4zM118 63.5h4v3h-4zM125 63.5h4v3h-4zM132 63.5h3v3h-3z"
          fill="#fde68a"
        />
        <rect
          x="46"
          y="24"
          width="140"
          height="22"
          rx="4"
          fill="#05060c"
          stroke="#e8b84a"
          strokeWidth="1.4"
        />
      </svg>
      <div className="cs-blimp-led">
        <span>
          {LED}
          {LED}
        </span>
      </div>
      <i className="cs-blimp-nav" />
    </div>
  )
}
