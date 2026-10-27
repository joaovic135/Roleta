import type { ReactNode } from 'react'
import { box, dot } from './util'

// Atores que atravessam a tela. O desenho é estático; quem anda é o
// elemento HTML de fora (classe com animação em theme.css).

// ---------------------------------------------------------------- trem
// Trem de 8 vagões (padrão repetido) com janelas fluorescentes acesas.
// Desenhado indo para a direita; o que vem no outro sentido é espelhado.
const WIN = [
  [8, 16],
  [44, 26],
  [92, 26],
  [136, 16],
]
const DOORS = [28, 76, 124]

export function TrainSvg({
  id,
  stripe,
  far = false,
}: {
  id: string
  stripe: string
  far?: boolean
}) {
  const body = `url(#cp-tb-${id})`
  const wins = WIN.map(([x, w]) => box(x, 21, w, 14)).join('')
  const doorWins = DOORS.map((x) => box(x + 2, 22, 8, 12)).join('')
  return (
    <svg
      className="cp-train-svg"
      viewBox="0 0 1280 60"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`cp-tb-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={far ? '#7b80a2' : '#a9afcc'} />
          <stop offset="1" stopColor={far ? '#363a58' : '#4f5476'} />
        </linearGradient>
        <pattern
          id={`cp-car-${id}`}
          width="160"
          height="60"
          patternUnits="userSpaceOnUse"
        >
          <rect x="0" y="16" width="3" height="40" fill="#0b0614" />
          <rect x="3" y="12" width="154" height="5" rx="2" fill="#45405f" />
          <path
            d="M64 12L72 3H88L96 12M70 3H90"
            stroke="#1d1830"
            strokeWidth="1.4"
            fill="none"
          />
          <rect x="3" y="15" width="154" height="40" fill={body} />
          <rect x="3" y="15" width="154" height="1.4" fill="#ff9ccf" />
          <path d={wins + doorWins} fill="#e9ffd6" filter="url(#cp-bloom-s)" />
          <path
            d={DOORS.map((x) => box(x, 19, 12, 35)).join('')}
            fill="#474b6a"
          />
          <path d={wins + doorWins} fill="#f3ffe9" />
          {/* passageiros */}
          <path
            d={
              dot(50, 33, 3) +
              dot(61, 32, 3.2) +
              dot(101, 33, 3) +
              dot(112, 31, 3.3) +
              dot(144, 33, 2.8) +
              dot(14, 32, 3) +
              box(78, 25, 4, 9) +
              dot(80, 24, 2.2)
            }
            fill="#5d6a74"
          />
          <rect x="3" y="41" width="154" height="4" fill={stripe} />
          <rect x="6" y="55" width="148" height="4" fill="#120a20" />
          <rect x="14" y="53" width="28" height="7" rx="2" fill="#0d0818" />
          <rect x="118" y="53" width="28" height="7" rx="2" fill="#0d0818" />
        </pattern>
      </defs>
      <rect width="1280" height="60" fill={`url(#cp-car-${id})`} />
      {/* cabine da frente */}
      <path d="M1258 15H1270Q1279 16 1280 26V55H1258Z" fill={body} />
      <path d="M1264 19H1272Q1277 20 1278 27V34H1264Z" fill="#101a32" />
      <rect x="1262" y="16" width="10" height="3" fill="#ffb547" />
      <path d={dot(1276, 47, 2.4)} fill="#fffbe0" />
      <rect x="1258" y="41" width="22" height="4" fill={stripe} />
      <path d={box(0, 44, 3, 5)} fill="#ff2a44" />
    </svg>
  )
}

// ---------------------------------------------------------------- carros
type Flip = { flip?: boolean }
// moldura comum: na contramão o desenho é espelhado dentro do próprio SVG
function VehSvg({
  w,
  h,
  flip,
  children,
}: {
  w: number
  h: number
  flip?: boolean
  children: ReactNode
}) {
  return (
    <svg className="cp-veh-svg" viewBox={`0 0 ${w} ${h}`} aria-hidden="true">
      <g transform={flip ? `matrix(-1 0 0 1 ${w} 0)` : undefined}>{children}</g>
    </svg>
  )
}
// Vistos de lado, indo para a direita (150 × 60 u; rodas em y = 52)
const wheels = (a: number, b: number, r = 7.5) => (
  <>
    <path d={dot(a, 52, r) + dot(b, 52, r)} fill="#09060f" />
    <path d={dot(a, 52, r * 0.42) + dot(b, 52, r * 0.42)} fill="#6d6688" />
  </>
)

export function Taxi({ flip }: Flip) {
  return (
    <VehSvg w={150} h={60} flip={flip}>
      <rect
        x="64"
        y="8"
        width="32"
        height="14"
        fill="#ffd88a"
        opacity="0.55"
        filter="url(#cp-bloom-s)"
      />
      <path
        d="M4 46Q4 38 12 37L40 35L52 22Q55 19 60 19H96Q101 19 105 23L117 35L140 37Q147 38 147 45V49Q147 52 143 52H8Q4 52 4 48Z"
        fill="#211936"
      />
      <path d={box(6, 41, 140, 2.4)} fill="#ffb547" />
      <path
        d="M57 23Q58 22 61 22H78V34H47ZM82 22H98Q101 22 103 25L112 34H82Z"
        fill="#0e0a1c"
      />
      <path
        d="M60 24L54 34M67 22L59 34M89 22L85 34"
        stroke="#ff6fb5"
        strokeWidth="1"
        opacity="0.4"
      />
      <path
        d={dot(95, 28, 3) + 'M89 34Q89 31 95 31Q101 31 101 34Z'}
        fill="#05030b"
      />
      <path d="M70 19L72 13H88L90 19Z" fill="#fff1c6" />
      <rect
        x="102"
        y="28"
        width="10"
        height="6"
        fill="#ff3a3a"
        opacity="0.7"
        filter="url(#cp-bloom-s)"
      />
      <path d={box(103, 29, 8, 4)} fill="#ff6a6a" />
      <path
        d="M12 37L40 35L52 22Q55 19 60 19H96Q101 19 105 23L117 35L140 37"
        stroke="#ff8fd0"
        strokeWidth="1.2"
        fill="none"
        opacity="0.75"
      />
      <path d={box(6, 45, 138, 1)} fill="#2de2e6" opacity="0.35" />
      <path d={box(143, 39, 4, 4)} fill="#fffbe3" />
      <path d={box(4, 39, 3, 5)} fill="#ff2a44" />
      <path d={box(3, 47, 6, 3) + box(142, 47, 6, 3)} fill="#3a3550" />
      {wheels(34, 120)}
    </VehSvg>
  )
}

// cupê branco dos anos 80, faróis escamoteáveis levantados
export function Coupe({ flip }: Flip) {
  return (
    <VehSvg w={150} h={60} flip={flip}>
      <path
        d="M3 46Q3 40 10 39L46 36L60 26Q63 24 68 24H94Q99 24 103 27L114 35L144 39Q148 40 148 45V49Q148 52 144 52H7Q3 52 3 48Z"
        fill="#d9d2ea"
      />
      <path d={box(6, 44, 140, 2.4)} fill="#2a2440" />
      <path
        d="M64 28L70 26H84V35H57ZM88 26H97Q100 26 102 28L109 35H88Z"
        fill="#17112b"
      />
      <path
        d="M66 29L62 35M70 28L66 35M74 28L70 35"
        stroke="#2a2440"
        strokeWidth="1.2"
      />
      <path d={box(127, 33, 10, 4)} fill="#d9d2ea" />
      <path d={box(136, 33, 2, 4)} fill="#fffbe3" />
      <path d={box(3, 40, 6, 3)} fill="#ff2a44" />
      <path
        d="M10 39L46 36L60 26Q63 24 68 24H94Q99 24 103 27L114 35L144 39"
        stroke="#ff8fd0"
        strokeWidth="1.4"
        fill="none"
        opacity="0.85"
      />
      <path d={box(8, 47, 136, 3)} fill="#7fe8ff" opacity="0.3" />
      {wheels(32, 122, 7)}
    </VehSvg>
  )
}

// kei van verde-menta, pequenininha
export function Kei({ flip }: Flip) {
  return (
    <VehSvg w={150} h={60} flip={flip}>
      <path
        d="M24 52V24Q24 16 32 16H100Q110 16 114 26L120 38Q124 40 124 46V50Q124 52 120 52Z"
        fill="#3c8b82"
      />
      <path
        d="M30 20H52V34H30ZM56 20H78V34H56ZM82 20H102Q107 20 109 26L112 34H82Z"
        fill="#0f1a26"
      />
      <path
        d="M34 22L30 32M60 22L56 32M86 22L82 32"
        stroke="#ffffff"
        strokeWidth="1"
        opacity="0.25"
      />
      <path
        d="M32 16H100Q110 16 114 26"
        stroke="#ff8fd0"
        strokeWidth="1.2"
        fill="none"
        opacity="0.7"
      />
      <path d={box(119, 40, 4, 4)} fill="#fffbe3" />
      <path d={box(24, 38, 3, 6)} fill="#ff2a44" />
      <path d={box(26, 44, 96, 2)} fill="#1e4a45" />
      {wheels(44, 106, 6.5)}
    </VehSvg>
  )
}

// ônibus noturno com janelas acesas e letreiro "駅前" (320 × 92 u)
export function Bus({ flip }: Flip) {
  return (
    <VehSvg w={320} h={92} flip={flip}>
      <rect x="4" y="8" width="312" height="74" rx="9" fill="#d6d0e6" />
      <rect x="12" y="3" width="290" height="7" rx="3" fill="#a9a2c0" />
      <rect x="4" y="60" width="312" height="6" fill="#ff4f9e" />
      <rect x="4" y="68" width="312" height="2" fill="#2de2e6" />
      <path
        d={[66, 98, 130, 162, 194, 226, 258]
          .map((x) => box(x, 18, 28, 28))
          .join('')}
        fill="#fff1cf"
        filter="url(#cp-bloom-s)"
      />
      <path
        d={[66, 98, 130, 162, 194, 226, 258]
          .map((x) => box(x, 18, 28, 28))
          .join('')}
        fill="#fff6dd"
      />
      <path
        d={
          dot(76, 38, 4) +
          dot(108, 37, 4.2) +
          dot(150, 38, 4) +
          dot(204, 37, 4.2) +
          dot(236, 38, 4) +
          box(170, 30, 6, 16) +
          dot(173, 28, 3)
        }
        fill="#6b6170"
      />
      <path d="M20 18H54V76H20Z" fill="#2a2440" />
      <path d="M24 22H35V56H24ZM39 22H50V56H39Z" fill="#ffe9c0" opacity="0.8" />
      <path d="M296 14H308Q316 16 316 28V54H296Z" fill="#141228" />
      <path
        d={dot(302, 30, 3.4) + 'M296 40Q296 36 302 36Q308 36 308 40V44H296Z'}
        fill="#05030b"
      />
      <rect x="262" y="9" width="34" height="8" fill="#120a10" />
      <text className="cp-jp cp-bus-dest" x="279" y="16" fontSize="7">
        駅前
      </text>
      <path d="M8 10H312" stroke="#ff8fd0" strokeWidth="1.4" opacity="0.7" />
      <path d={box(311, 62, 5, 5)} fill="#fffbe3" />
      <path d={box(4, 60, 3, 8)} fill="#ff2a44" />
      <path d={dot(66, 82, 10) + dot(262, 82, 10)} fill="#09060f" />
      <path d={dot(66, 82, 4) + dot(262, 82, 4)} fill="#6d6688" />
    </VehSvg>
  )
}

// ---------------------------------------------------------------- pedestres
// Silhuetas de guarda-chuva em 2 quadros (passo aberto / pernas juntas); a
// faixa com os quadros anda em steps(2) dentro de uma janela do tamanho de
// um quadro. Todos desenhados indo para a direita.
type Frame = (bob: number, open: boolean) => ReactNode

const scallop = (x0: number, x1: number, y: number, n: number) => {
  const w = (x1 - x0) / n
  let d = ''
  for (let i = n - 1; i >= 0; i--)
    d += `Q${x0 + w * i + w / 2} ${y - 3.5} ${x0 + w * i} ${y}`
  return d
}
const canopy = (x0: number, x1: number, y: number, top: number, n = 4) =>
  `M${x0} ${y}Q${(x0 + x1) / 2} ${top} ${x1} ${y}${scallop(x0, x1, y, n)}Z`

const SUIT: Frame = (b, open) => (
  <>
    <path d={canopy(3, 47, 20 + b, -1 + b)} fill="#140b22" />
    <path
      d={`M3 ${20 + b}Q25 ${-1 + b} 47 ${20 + b}`}
      stroke="#ff6fb5"
      strokeWidth="1.2"
      fill="none"
    />
    <path d={`M25 ${20 + b}V${40 + b}`} stroke="#140b22" strokeWidth="1.6" />
    <path
      d={
        dot(25, 31 + b, 5) +
        `M19 ${37 + b}Q25 ${34 + b} 31 ${37 + b}L33 ${59 + b}H17Z` +
        box(12, 52 + b, 9, 7)
      }
      fill="#0d0718"
    />
    <path
      d={
        open
          ? `M21 ${58 + b}L14 77M29 ${58 + b}L36 77`
          : `M23 ${58 + b}L22 77M27 ${58 + b}L29 77`
      }
      stroke="#0d0718"
      strokeWidth="3.6"
      strokeLinecap="round"
    />
  </>
)

const CLEAR: Frame = (b, open) => (
  <>
    <path
      d={
        dot(25, 31 + b, 4.8) +
        `M20 ${31 + b}Q20 ${24 + b} 25 ${24 + b}Q30 ${24 + b} 30 ${31 + b}L31 ${41 + b}H19Z` +
        `M18 ${38 + b}Q25 ${35 + b} 32 ${38 + b}L34 ${60 + b}H16Z`
      }
      fill="#180d28"
    />
    <path d={box(31, 46 + b, 8, 10)} fill="#ff6fb5" />
    <path
      d={`M32 ${46 + b}Q35 ${41 + b} 38 ${46 + b}`}
      stroke="#ff6fb5"
      strokeWidth="1"
      fill="none"
    />
    <path
      d={
        open
          ? `M22 ${59 + b}L16 77M28 ${59 + b}L34 77`
          : `M24 ${59 + b}L23 77M27 ${59 + b}L29 77`
      }
      stroke="#180d28"
      strokeWidth="3"
      strokeLinecap="round"
    />
    <path d={`M24 ${22 + b}V${42 + b}`} stroke="#d8eaff" strokeWidth="1.2" />
    <path
      d={canopy(2, 48, 22 + b, -2 + b)}
      fill="#d2ecff"
      fillOpacity="0.2"
      stroke="#ecf8ff"
      strokeOpacity="0.8"
      strokeWidth="1"
    />
    <path
      d={`M25 ${1 + b}L13 ${22 + b}M25 ${1 + b}L37 ${22 + b}M25 ${1 + b}V${22 + b}`}
      stroke="#ecf8ff"
      strokeOpacity="0.4"
      strokeWidth="0.8"
    />
  </>
)

const COUPLE: Frame = (b, open) => (
  <>
    <path d={canopy(4, 66, 22 + b, -4 + b, 6)} fill="#ff4f9e" />
    <path
      d={`M14 ${12 + b}Q35 ${-1 + b} 56 ${12 + b}`}
      stroke="#ffc2e0"
      strokeWidth="2"
      fill="none"
      opacity="0.7"
    />
    <path d={`M35 ${22 + b}V${40 + b}`} stroke="#140b22" strokeWidth="1.6" />
    <path
      d={
        dot(26, 31 + b, 5) +
        `M20 ${37 + b}Q26 ${34 + b} 32 ${37 + b}L34 ${59 + b}H18Z` +
        dot(45, 33 + b, 4.4) +
        `M41 ${33 + b}Q41 ${27 + b} 45 ${27 + b}Q50 ${27 + b} 50 ${34 + b}L50 ${40 + b}H41Z` +
        `M39 ${39 + b}Q45 ${36 + b} 51 ${39 + b}L53 ${58 + b}H37Z`
      }
      fill="#0d0718"
    />
    <path
      d={
        open
          ? `M23 ${58 + b}L16 77M29 ${58 + b}L36 77M42 ${57 + b}L37 77M48 ${57 + b}L53 77`
          : `M25 ${58 + b}L24 77M28 ${58 + b}L30 77M44 ${57 + b}L43 77M47 ${57 + b}L48 77`
      }
      stroke="#0d0718"
      strokeWidth="3.2"
      strokeLinecap="round"
    />
  </>
)

const CYCLIST: Frame = (b, open) => (
  <>
    <g fill="none" stroke="#120a1e" strokeWidth="2.4">
      <circle cx="16" cy="68" r="10" />
      <circle cx="54" cy="68" r="10" />
      <path d="M16 68L30 55H47L54 68M30 55L36 68H16M47 55L45 47M27 51H34" />
    </g>
    <path
      d="M6 68A10 10 0 0 1 26 68M44 68A10 10 0 0 1 64 68"
      stroke="#2de2e6"
      strokeWidth="1"
      fill="none"
      opacity="0.6"
    />
    <path
      d={canopy(16, 58, 16 + b, -6 + b)}
      fill="#2de2e6"
      fillOpacity="0.85"
    />
    <path d={`M37 ${16 + b}V${36 + b}`} stroke="#120a1e" strokeWidth="1.6" />
    <path
      d={
        dot(32, 30 + b, 5) +
        `M27 ${36 + b}Q32 ${33 + b} 37 ${36 + b}L38 ${52 + b}H27Z`
      }
      fill="#0d0718"
    />
    <path
      d={`M36 ${40 + b}L45 ${47}`}
      stroke="#0d0718"
      strokeWidth="2.6"
      strokeLinecap="round"
    />
    <path
      d={
        open
          ? 'M31 51L28 61L33 68M34 51L41 58L39 64'
          : 'M31 51L36 60L39 65M34 51L30 59L33 66'
      }
      stroke="#0d0718"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </>
)

const KINDS = {
  suit: [SUIT, 50],
  clear: [CLEAR, 50],
  couple: [COUPLE, 70],
  cyclist: [CYCLIST, 70],
} as const
export type WalkerKind = keyof typeof KINDS

export function WalkerStrip({
  kind,
  flip,
}: {
  kind: WalkerKind
  flip?: boolean
}) {
  const [frame, w] = KINDS[kind]
  // espelha cada quadro no lugar (x → w − x) quando anda para a esquerda
  const at = (ox: number) =>
    flip ? `matrix(-1 0 0 1 ${ox + w} 0)` : `translate(${ox} 0)`
  return (
    <svg className="cp-strip" viewBox={`0 0 ${w * 2} 80`} aria-hidden="true">
      <g transform={at(0)}>{frame(0, true)}</g>
      <g transform={at(w)}>{frame(-1, false)}</g>
    </svg>
  )
}

// ---------------------------------------------------------------- céu
export function BlimpSvg() {
  return (
    <svg className="cp-blimp-svg" viewBox="0 0 200 64" aria-hidden="true">
      <ellipse cx="96" cy="26" rx="86" ry="22" fill="#241a44" />
      <path
        d="M14 30Q96 58 178 30Q170 44 96 48Q22 44 14 30Z"
        fill="#ff6fb5"
        opacity="0.45"
      />
      <path
        d="M18 18Q96 -6 176 18"
        stroke="#9ed8ff"
        strokeWidth="1.4"
        fill="none"
        opacity="0.5"
      />
      <path
        d="M168 14L194 4L196 26L170 30ZM168 38L192 48L194 34L170 32Z"
        fill="#1c1438"
      />
      <path d="M80 46H112L108 56H84Z" fill="#1c1438" />
      <path
        d={box(86, 49, 4, 3) + box(94, 49, 4, 3) + box(102, 49, 4, 3)}
        fill="#ffe4a8"
      />
      <rect x="34" y="18" width="124" height="16" rx="3" fill="#0c0716" />
    </svg>
  )
}
