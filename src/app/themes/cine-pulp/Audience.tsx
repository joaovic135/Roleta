import { dot, n, oval, seeded, vars } from './geo'

// Plateia em silhueta contra a luz da tela, na faixa de baixo.
// - Fileira do meio: cabeças genéricas (chapéu, coque, topete, laço...)
//   num só <path>, com o contorno de cima aceso pela luz da tela num
//   segundo <path> (a luz pisca com o filme; a fileira pula no susto).
// - Grupos nas beiradas, maiores (mais perto): pai de chapéu, o menino de
//   boné de hélice com o balde de pipoca, um casal que se aproxima; do
//   outro lado, uma senhora de penteado alto e o lanterninha, que entra
//   pelo corredor e varre as poltronas com a lanterna.
// - Roleta: girando, a fileira se ajeita na poltrona (sobe um pouco);
//   no vencedor a plateia comemora uma vez: as duas metades da fileira
//   pulam fora de fase, o menino e os vizinhos da direita também, e o pai
//   joga o chapéu para o alto e pega de volta.
// Medidas em px (a faixa de baixo tem altura fixa no layout).

type Kind =
  | 'plain'
  | 'fedora'
  | 'beehive'
  | 'bun'
  | 'bow'
  | 'curly'
  | 'beanie'
  | 'pillbox'
  | 'slick'

// arco de contorno (luz de recorte) por cima de uma elipse
const rimArc = (cx: number, cy: number, rx: number, ry: number) => {
  const a0 = (205 * Math.PI) / 180
  const a1 = (335 * Math.PI) / 180
  return `M${n(cx + Math.cos(a0) * rx)} ${n(cy + Math.sin(a0) * ry)}A${n(rx)} ${n(ry)} 0 0 1 ${n(cx + Math.cos(a1) * rx)} ${n(cy + Math.sin(a1) * ry)}`
}

// chapéu de feltro (aba + copa) com o contorno aceso; separado para o pai
// poder jogá-lo para o alto quando sai o vencedor
const fedora = (x: number, y: number, r: number) => {
  const b = y - r * 0.48
  return {
    sil:
      oval(x, b, r * 1.5, r * 0.24) +
      `M${n(x - 0.86 * r)} ${n(b)}L${n(x - 0.74 * r)} ${n(y - 1.18 * r)}Q${n(x)} ${n(y - 0.98 * r)} ${n(x + 0.74 * r)} ${n(y - 1.18 * r)}L${n(x + 0.86 * r)} ${n(b)}Z`,
    rim:
      `M${n(x - 0.75 * r)} ${n(y - 1.2 * r)}Q${n(x)} ${n(y - 1.0 * r)} ${n(x + 0.75 * r)} ${n(y - 1.2 * r)}` +
      rimArc(x, b, r * 1.5 + 0.5, r * 0.24 + 0.5),
  }
}

// silhueta de costas: cabeça, orelhas, pescoço e ombros + o que vai em cima
export const figure = (
  kind: Kind,
  x: number,
  y: number,
  r: number,
  shoulders = true,
) => {
  let sil = oval(x, y, r * 0.86, r)
  sil += oval(x - r * 0.84, y + r * 0.08, r * 0.17, r * 0.27)
  sil += oval(x + r * 0.84, y + r * 0.08, r * 0.17, r * 0.27)
  if (shoulders)
    sil +=
      `M${n(x - 2.4 * r)} ${n(y + 3.4 * r)}L${n(x - 2.1 * r)} ${n(y + 1.6 * r)}` +
      `Q${n(x - 1.7 * r)} ${n(y + 1.05 * r)} ${n(x - 0.5 * r)} ${n(y + 0.98 * r)}` +
      `L${n(x - 0.42 * r)} ${n(y + 0.6 * r)}L${n(x + 0.42 * r)} ${n(y + 0.6 * r)}` +
      `L${n(x + 0.5 * r)} ${n(y + 0.98 * r)}Q${n(x + 1.7 * r)} ${n(y + 1.05 * r)} ${n(x + 2.1 * r)} ${n(y + 1.6 * r)}` +
      `L${n(x + 2.4 * r)} ${n(y + 3.4 * r)}Z`
  let rim = rimArc(x, y, r * 0.86 + 0.6, r + 0.6)
  switch (kind) {
    case 'fedora': {
      const hat = fedora(x, y, r)
      sil += hat.sil
      rim = hat.rim
      break
    }
    case 'beehive':
      sil += oval(x, y - r * 0.82, r * 0.8, r * 0.9)
      rim = rimArc(x, y - r * 0.82, r * 0.8 + 0.6, r * 0.9 + 0.6)
      break
    case 'bun':
      sil += dot(x, y - r * 0.95, r * 0.4)
      rim += rimArc(x, y - r * 0.95, r * 0.4 + 0.6, r * 0.4 + 0.6)
      break
    case 'bow':
      sil += `M${n(x + 0.35 * r)} ${n(y - 0.86 * r)}l${n(0.42 * r)} ${n(-0.34 * r)}l${n(0.06 * r)} ${n(0.62 * r)}zM${n(x + 0.35 * r)} ${n(y - 0.86 * r)}l${n(-0.3 * r)} ${n(-0.42 * r)}l${n(-0.12 * r)} ${n(0.56 * r)}z`
      break
    case 'curly':
      for (let i = 0; i < 7; i++) {
        const a = Math.PI + (i / 6) * Math.PI
        sil += dot(
          x + Math.cos(a) * r * 0.86,
          y - r * 0.1 + Math.sin(a) * r * 0.98,
          r * 0.36,
        )
      }
      rim = rimArc(x, y - r * 0.12, r * 1.18, r * 1.32)
      break
    case 'slick':
      sil += `M${n(x - 0.8 * r)} ${n(y - 0.5 * r)}Q${n(x - 0.2 * r)} ${n(y - 1.45 * r)} ${n(x + 0.9 * r)} ${n(y - 0.75 * r)}Q${n(x + 0.2 * r)} ${n(y - 1.05 * r)} ${n(x - 0.8 * r)} ${n(y - 0.5 * r)}Z`
      rim = rimArc(x, y - r * 0.08, r * 0.9, r * 1.08)
      break
    case 'beanie':
      sil += `M${n(x - 0.9 * r)} ${n(y - 0.2 * r)}Q${n(x - 0.9 * r)} ${n(y - 1.12 * r)} ${n(x)} ${n(y - 1.12 * r)}Q${n(x + 0.9 * r)} ${n(y - 1.12 * r)} ${n(x + 0.9 * r)} ${n(y - 0.2 * r)}Z`
      rim = rimArc(x, y - 0.22 * r, r * 0.92, r * 0.92)
      break
    case 'pillbox':
      sil += `M${n(x - 0.62 * r)} ${n(y - 0.62 * r)}L${n(x - 0.56 * r)} ${n(y - 1.28 * r)}L${n(x + 0.56 * r)} ${n(y - 1.28 * r)}L${n(x + 0.62 * r)} ${n(y - 0.62 * r)}Z`
      rim = `M${n(x - 0.56 * r)} ${n(y - 1.3 * r)}L${n(x + 0.56 * r)} ${n(y - 1.3 * r)}`
      break
  }
  return { sil, rim }
}

// ---------- fileira do meio (2560 px de largura, centrada e cortada) ----------
const ROW_W = 2560
const ROW_H = 150
const KINDS: Kind[] = [
  'plain',
  'fedora',
  'bun',
  'plain',
  'beehive',
  'slick',
  'bow',
  'curly',
  'fedora',
  'plain',
  'beanie',
  'slick',
]
// duas metades intercaladas (cabeças pares e ímpares): na comemoração
// pulam fora de fase, como uma plateia de verdade
const buildRow = () => {
  const rand = seeded(1956)
  const half = [
    { sil: '', rim: '' },
    { sil: '', rim: '' },
  ]
  let x = 20
  for (let i = 0; x < ROW_W; i++) {
    const kind = KINDS[Math.floor(rand() * KINDS.length)]
    const kid = kind === 'beanie' || rand() < 0.1
    const r = kid ? 14 + rand() * 2 : 18 + rand() * 4
    // topo da cabeça (ou do chapéu) logo acima da borda dos cards
    const lift = kind === 'beehive' ? 1.7 : kind === 'fedora' ? 1.2 : 1
    const y = 116 + rand() * 10 + r * lift + (kid ? 10 : 0)
    const f = figure(kind, x, y, r)
    half[i % 2].sil += f.sil
    half[i % 2].rim += f.rim
    x += 58 + rand() * 30
  }
  return half
}
const ROW = buildRow()

// ---------- grupos das beiradas ----------
// poltronas (encosto de veludo com friso dourado) vistas de trás
const seats = (xs: number[], top: number, w: number, h: number) =>
  xs
    .map(
      (x) =>
        `M${x} ${top + h}V${top + 10}Q${x} ${top} ${x + 10} ${top}H${x + w - 10}Q${x + w} ${top} ${x + w} ${top + 10}V${top + h}Z`,
    )
    .join('')
const seatTrim = (xs: number[], top: number, w: number) =>
  xs
    .map(
      (x) =>
        `M${x + 1} ${top + 10}Q${x + 1} ${top + 1} ${x + 10} ${top + 1}H${x + w - 10}Q${x + w - 1} ${top + 1} ${x + w - 1} ${top + 10}`,
    )
    .join('')

const L_SEATS = [0, 92, 184, 276]
// o pai e o chapéu dele (num SVG à parte, por cima da cabeça)
const DAD = figure('plain', 52, 146, 25)
const HAT = fedora(52, 146, 25)
const KID = figure('beanie', 30, 44, 18)
// casal: cada um num SVG próprio (inclinam um para o outro)
const LOVER_A = figure('bun', 30, 34, 21)
const LOVER_B = figure('slick', 34, 30, 23)

const R_SEATS = [62, 154]
const RIGHT = (() => {
  const lady = figure('beehive', 197, 158, 21)
  const old = figure('plain', 105, 150, 23)
  return { sil: lady.sil + old.sil, rim: lady.rim + old.rim }
})()
const USHER = figure('pillbox', 46, 62, 17)

const POP = Array.from({ length: 7 }, (_, i) => i)
const RIM = 'rgba(255, 214, 170, 0.55)'

function Seats({ xs, id }: { xs: number[]; id: string }) {
  const w = 86
  return (
    <svg className="cn-group-art" viewBox="0 0 340 266">
      <defs>
        <linearGradient id={`cn-seat-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#5a0a18" />
          <stop offset="0.35" stopColor="#3a0610" />
          <stop offset="1" stopColor="#140205" />
        </linearGradient>
      </defs>
      <path d={seats(xs, 196, w, 70)} fill={`url(#cn-seat-${id})`} />
      <path
        d={seatTrim(xs, 196, w)}
        fill="none"
        stroke="#c9953e"
        strokeWidth="2"
      />
      <path
        d={xs.map((x) => dot(x + w / 2, 214, 2.4)).join('')}
        fill="#e8c26e"
      />
    </svg>
  )
}

function Sil({
  f,
  box,
  className,
}: {
  f: { sil: string; rim: string }
  box: string
  className: string
}) {
  return (
    <svg className={className} viewBox={box}>
      <path d={f.sil} fill="#060102" />
      <path
        d={f.rim}
        fill="none"
        stroke={RIM}
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  )
}

export default function Audience() {
  return (
    <div className="cn-crowd">
      <div className="cn-row">
        {ROW.map((h, i) => (
          <div key={i} className={`cn-cheer cn-row-h cn-row-h${i}`}>
            <svg
              viewBox={`0 0 ${ROW_W} ${ROW_H}`}
              preserveAspectRatio="xMidYMax slice"
            >
              <path d={h.sil} fill="#060102" />
            </svg>
            <svg
              className="cn-row-rim"
              viewBox={`0 0 ${ROW_W} ${ROW_H}`}
              preserveAspectRatio="xMidYMax slice"
            >
              <path
                d={h.rim}
                fill="none"
                stroke="rgba(255, 214, 170, 0.5)"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          </div>
        ))}
      </div>

      <div className="cn-group cn-group-l">
        <Sil f={DAD} box="0 0 340 266" className="cn-group-art" />
        {/* o chapéu do pai: vai para o alto no vencedor e volta à cabeça */}
        <div className="cn-hat">
          <svg className="cn-hat-art" viewBox="12 112 80 30">
            <path d={HAT.sil} fill="#060102" />
            <path
              d={HAT.rim}
              fill="none"
              stroke={RIM}
              strokeWidth="1.7"
              strokeLinecap="round"
            />
          </svg>
        </div>
        {/* menino de boné de hélice: pula no susto e a pipoca voa */}
        <div className="cn-kid">
          <div className="cn-cheer cn-kid-cheer">
            <svg className="cn-kid-art" viewBox="0 0 70 120">
              <path d={KID.sil} fill="#060102" />
              <path
                d={KID.rim}
                fill="none"
                stroke={RIM}
                strokeWidth="1.6"
                strokeLinecap="round"
              />
              {/* braço erguido e o balde listrado */}
              <path d="M44 72Q52 58 54 44l6 1Q60 60 50 76Z" fill="#060102" />
              <path d="M44 22h24l-3 26h-18z" fill="#f4ead0" />
              <path
                d="M48 22h4l-1 26h-3zM56 22h4l-0.5 26h-3zM64 22h4l-2 26h-2.5z"
                fill="#c81d2e"
              />
              <path
                d={
                  dot(48, 21, 4) +
                  dot(55, 18, 4.5) +
                  dot(62, 20, 4.2) +
                  dot(67, 22, 3.4) +
                  dot(51, 16, 3.2)
                }
                fill="#fff3c8"
              />
              <path d="M44 22h24" stroke="#b8862e" strokeWidth="1.2" />
            </svg>
            <i className="cn-prop" />
          </div>
        </div>
        <div className="cn-lover cn-lover-a">
          <Sil f={LOVER_A} box="0 0 64 110" className="cn-lover-art" />
        </div>
        <div className="cn-lover cn-lover-b">
          <Sil f={LOVER_B} box="0 0 68 110" className="cn-lover-art" />
        </div>
        <Seats xs={L_SEATS} id="l" />
        <div className="cn-pops">
          {POP.map((i) => (
            <i key={i} className="cn-pop" style={vars({ '--cn-i': i })} />
          ))}
        </div>
      </div>

      <div className="cn-group cn-group-r">
        <svg className="cn-group-art cn-cheer cn-fans" viewBox="0 0 340 266">
          <path d={RIGHT.sil} fill="#060102" />
          <path
            d={RIGHT.rim}
            fill="none"
            stroke={RIM}
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
        <Seats xs={R_SEATS} id="r" />
        {/* lanterninha: entra pelo corredor e varre as poltronas */}
        <div className="cn-usher">
          <div className="cn-torch" />
          <svg className="cn-usher-art" viewBox="0 0 92 266">
            <path d={USHER.sil} fill="#080204" />
            <path
              d="M16 96Q14 150 22 266H76Q82 150 76 96Q62 84 46 84Q30 84 16 96Z"
              fill="#14060a"
            />
            <path d="M18 100Q8 112 2 128l7 5Q16 120 26 108Z" fill="#14060a" />
            <path d="M-4 124l10 -4l4 9l-10 4z" fill="#3a3a40" />
            <path
              d="M16 96Q30 86 46 86M47 86Q62 86 76 96"
              fill="none"
              stroke="#d9a64a"
              strokeWidth="3"
            />
            <path d="M24 92h10v3h-10zM58 92h10v3h-10z" fill="#f0c36a" />
            <path d={USHER.rim} fill="none" stroke={RIM} strokeWidth="1.6" />
            <path d="M40 46h12v4h-12z" fill="#d9a64a" />
            <path
              d="M76 100Q84 180 78 266"
              fill="none"
              stroke="rgba(255, 190, 140, 0.3)"
              strokeWidth="2"
            />
          </svg>
        </div>
      </div>
    </div>
  )
}
