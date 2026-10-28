import type { ReactNode, SVGProps } from 'react'
import { NEON, type Neon, box, dot, r1, seeded, vars, vh } from './util'

// Cidade lá fora (tudo estático: SVG desenhado uma vez). As partes que
// mexem ficam em elementos HTML próprios (ou no <svg> de fora), nunca dentro
// do SVG. Coordenadas em u (1000 u = altura da tela).

// ---------------------------------------------------------------- defs
export function Defs() {
  return (
    <svg className="cp-defs" width="0" height="0" aria-hidden="true">
      <defs>
        <filter id="cp-bloom" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="7" />
        </filter>
        <filter id="cp-bloom-s" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="2.4" />
        </filter>
        <filter id="cp-bloom-l" x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="16" />
        </filter>
        <linearGradient id="cp-wall-g" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1a0b35" />
          <stop offset="1" stopColor="#2b1251" />
        </linearGradient>
        <linearGradient id="cp-wall-g2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#150930" />
          <stop offset="1" stopColor="#231046" />
        </linearGradient>
        <linearGradient id="cp-warm-in" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffe3ad" />
          <stop offset="1" stopColor="#ff9450" />
        </linearGradient>
        <linearGradient id="cp-shop-in" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffd6a4" />
          <stop offset="1" stopColor="#ff8e8a" />
        </linearGradient>
        <linearGradient id="cp-konbini-in" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f6feff" />
          <stop offset="1" stopColor="#bdeeff" />
        </linearGradient>
        <linearGradient id="cp-vend" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f3fbff" />
          <stop offset="1" stopColor="#c6e4ff" />
        </linearGradient>
        <linearGradient id="cp-sunset" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#5b2bb0" />
          <stop offset="0.35" stopColor="#ff4f9e" />
          <stop offset="0.75" stopColor="#ff9a5a" />
          <stop offset="1" stopColor="#ffd77a" />
        </linearGradient>
        <linearGradient
          id="cp-far-g"
          x1="0"
          y1="150"
          x2="0"
          y2="480"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#100726" />
          <stop offset="1" stopColor="#1f0d3c" />
        </linearGradient>
        <linearGradient
          id="cp-far-h"
          x1="0"
          y1="250"
          x2="0"
          y2="480"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#3f1a66" />
          <stop offset="1" stopColor="#6a2676" />
        </linearGradient>
        <linearGradient id="cp-glass-tower" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#1c1446" />
          <stop offset="0.6" stopColor="#261a58" />
          <stop offset="1" stopColor="#3a1d5e" />
        </linearGradient>
        <pattern
          id="cp-shutter"
          width="8"
          height="5"
          patternUnits="userSpaceOnUse"
        >
          <rect width="8" height="5" fill="#231933" />
          <rect width="8" height="1.2" fill="#3a2c52" />
        </pattern>
        <radialGradient id="cp-lamp-r">
          <stop offset="0" stopColor="#fff" />
          <stop offset="0.35" stopColor="#ff4b4b" />
          <stop offset="1" stopColor="#c0102a" />
        </radialGradient>
      </defs>
    </svg>
  )
}

// ---------------------------------------------------------------- peças
type SideKey = 'l' | 'r'

// recorte animável: um <svg> próprio (o elemento de fora é que anima) na
// mesma escala das laterais; x/y/w/h em u da caixa 600 × 1000
export function Patch({
  side,
  x,
  y,
  w,
  h,
  className,
  children,
}: {
  side: SideKey
  x: number
  y: number
  w: number
  h: number
  className: string
  children: ReactNode
}) {
  return (
    <svg
      className={`cp-patch ${className}`}
      style={vars({
        [side === 'l' ? 'left' : 'right']: vh(side === 'l' ? x : 600 - x - w),
        top: vh(y),
        width: vh(w),
        height: vh(h),
      })}
      viewBox={`${x} ${y} ${w} ${h}`}
      aria-hidden="true"
    >
      {children}
    </svg>
  )
}

type TextProps = SVGProps<SVGTextElement>

// letreiro vertical (tate-kanban): placa acesa, letras de neon ou apagado
export function VSign({
  x,
  y,
  w,
  h,
  text,
  color,
  size,
  mode,
}: {
  x: number
  y: number
  w: number
  h: number
  text: string
  color: Neon
  size: number
  mode: 'panel' | 'tube' | 'off'
}) {
  const c = NEON[color]
  const n = [...text].length
  const label = (props: TextProps) => (
    <text
      className="cp-jp"
      x={r1(x + w / 2)}
      y={r1(y + (h - n * size * 1.02) / 2)}
      fontSize={size}
      style={{ writingMode: 'vertical-rl' }}
      {...props}
    >
      {text}
    </text>
  )
  if (mode === 'off')
    return (
      <g>
        <rect className="cp-sign-off" x={x} y={y} width={w} height={h} rx={4} />
        {label({ className: 'cp-jp cp-sign-dim' })}
      </g>
    )
  const panel = mode === 'panel'
  return (
    <g>
      <rect
        x={x - 5}
        y={y - 5}
        width={w + 10}
        height={h + 10}
        rx={9}
        fill={c}
        opacity={panel ? 0.75 : 0.55}
        filter="url(#cp-bloom)"
      />
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={4}
        fill={panel ? c : '#12071f'}
        stroke={panel ? '#ffeaf3' : c}
        strokeWidth={2.4}
      />
      {!panel && label({ fill: c, filter: 'url(#cp-bloom-s)' })}
      {label({
        fill: panel ? '#fffafd' : '#fff4fb',
        stroke: panel ? 'none' : c,
        strokeWidth: 0.8,
      })}
    </g>
  )
}

// janelas acesas em grade dentro de um retângulo (escritórios)
const grid = (
  rand: () => number,
  x: number,
  y: number,
  w: number,
  h: number,
  cw: number,
  ch: number,
  gx: number,
  gy: number,
  odds: number,
) => {
  let warm = ''
  let cool = ''
  let dark = ''
  for (let yy = y; yy + ch <= y + h; yy += gy) {
    const lit = rand() < 0.2 ? 0.9 : odds
    for (let xx = x; xx + cw <= x + w; xx += gx) {
      const r = rand()
      if (r < lit) {
        if (rand() < 0.62) warm += box(xx, yy, cw, ch)
        else cool += box(xx, yy, cw, ch)
      } else dark += box(xx, yy, cw, ch)
    }
  }
  return { warm, cool, dark }
}

// ---------------------------------------------------------------- longe
// Silhueta da cidade distante (300vh de largura, centrada): duas fileiras
// enevoadas, janelinhas e luzes vermelhas de aviação nos prédios altos.
const FAR = (() => {
  const rand = seeded(1985)
  let haze = ''
  let body = ''
  let warm = ''
  let cool = ''
  const beacons: [string, string] = ['', '']
  for (let x = -20; x < 3020; ) {
    const w = 34 + rand() * 66
    const top = 262 + rand() * 120
    haze += box(x, top, w, 500 - top)
    if (rand() < 0.3) haze += box(x + w / 2 - 1, top - 18, 2, 18)
    x += w
  }
  for (let x = -10, k = 0; x < 3010; k++) {
    const w = 50 + rand() * 82
    const tall = rand() < 0.3
    const top = tall ? 150 + rand() * 80 : 236 + rand() * 110
    body += box(x, top, w, 500 - top)
    if (tall) {
      const ax = x + w * (0.3 + rand() * 0.4)
      body += box(ax - 1.2, top - 26, 2.4, 26)
      beacons[k % 2] += dot(ax, top - 28, 3.2)
      // coroa iluminada em alguns
      if (rand() < 0.5) body += box(x + 4, top - 6, w - 8, 6)
    }
    for (let y = top + 12; y < 480; y += 11) {
      const lit = rand() < 0.14 ? 0.85 : 0.08
      for (let wx = x + 6; wx < x + w - 9; wx += 9) {
        if (rand() > lit) continue
        if (rand() < 0.7) warm += box(wx, y, 4, 5)
        else cool += box(wx, y, 4, 5)
      }
    }
    x += w + 3 + rand() * 12
  }
  return { haze, body, warm, cool, beacons }
})()

export function FarCity() {
  return (
    <div className="cp-far">
      <svg
        className="cp-far-svg"
        viewBox="0 100 3000 400"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path d={FAR.haze} fill="url(#cp-far-h)" />
        <path d={FAR.body} fill="url(#cp-far-g)" />
        <path d={FAR.warm} fill="#ffcf9e" opacity="0.78" />
        <path d={FAR.cool} fill="#a8e2ff" opacity="0.62" />
        <path d={FAR.beacons[0] + FAR.beacons[1]} fill="#5a1630" />
      </svg>
      {FAR.beacons.map((d, i) => (
        <svg
          key={i}
          className={`cp-far-blink cp-far-blink-${i}`}
          viewBox="0 100 3000 200"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path d={d} fill="#ff3b4e" filter="url(#cp-bloom-s)" />
          <path d={d} fill="#ffd0d6" />
        </svg>
      ))}
    </div>
  )
}

// torre de TV genérica (treliça), acesa em âmbar; o pisca fica num <span>
const towerPath = (() => {
  const lx = (y: number, x0: number, x1: number, y0: number, y1: number) =>
    x0 + ((x1 - x0) * (y - y0)) / (y1 - y0)
  let d = 'M110 4V46'
  // parte de cima
  const up = [58, 82, 106, 130, 152]
  d += 'M102 58L92 152M118 58L128 152'
  for (let i = 0; i < up.length - 1; i++) {
    const a = up[i]
    const b = up[i + 1]
    d += `M${r1(lx(a, 102, 92, 58, 152))} ${a}L${r1(lx(b, 118, 128, 58, 152))} ${b}`
    d += `M${r1(lx(a, 118, 128, 58, 152))} ${a}L${r1(lx(b, 102, 92, 58, 152))} ${b}`
  }
  // parte de baixo, pernas abrindo
  const low = [172, 214, 262, 318, 384, 470]
  d += 'M88 172L22 480M132 172L198 480M100 172L72 480M120 172L148 480'
  for (let i = 0; i < low.length - 1; i++) {
    const a = low[i]
    const b = low[i + 1]
    const L = (y: number) => r1(lx(y, 88, 22, 172, 480))
    const R = (y: number) => r1(lx(y, 132, 198, 172, 480))
    d += `M${L(a)} ${a}L${R(b)} ${b}M${R(a)} ${a}L${L(b)} ${b}M${L(b)} ${b}H${R(b)}`
  }
  return d
})()

export function Tower() {
  return (
    <div className="cp-tower">
      <svg viewBox="0 0 220 480" aria-hidden="true">
        <path
          d={towerPath}
          stroke="#ff8a3d"
          strokeWidth="5"
          fill="none"
          opacity="0.55"
          filter="url(#cp-bloom)"
        />
        <path d={towerPath} stroke="#ffb27a" strokeWidth="1.6" fill="none" />
        {/* mirantes */}
        <path
          d={box(98, 46, 24, 12) + box(80, 152, 60, 12) + box(86, 164, 48, 8)}
          fill="#3a1d3c"
        />
        <path
          d={box(100, 50, 20, 3) + box(83, 156, 54, 3) + box(89, 166, 42, 2.4)}
          fill="#fff1c9"
        />
        <path d={dot(110, 4, 2.6) + dot(110, 46, 2)} fill="#ff6d6d" />
      </svg>
      {/* iluminação especial: rosa e ciano ao girar, cor da fatia ao vencer
          (o <svg> inteiro aparece por opacidade) */}
      <svg
        className="cp-tower-lit cp-tower-spin"
        viewBox="0 0 220 480"
        aria-hidden="true"
      >
        <path
          d={towerPath}
          stroke="#ff3d9a"
          strokeWidth="6"
          fill="none"
          opacity="0.7"
          filter="url(#cp-bloom)"
        />
        <path d={towerPath} stroke="#ffd0ea" strokeWidth="2.2" fill="none" />
        <path
          d={towerPath}
          stroke="#5ff6ff"
          strokeWidth="2.4"
          strokeDasharray="6 10"
          fill="none"
        />
      </svg>
      <svg
        className="cp-tower-lit cp-tower-win"
        viewBox="0 0 220 480"
        aria-hidden="true"
      >
        <path
          d={towerPath}
          strokeWidth="6"
          fill="none"
          opacity="0.6"
          filter="url(#cp-bloom)"
        />
        <path d={towerPath} strokeWidth="2.2" fill="none" />
      </svg>
      <span className="cp-tower-beacon" />
    </div>
  )
}

// ---------------------------------------------------------------- fundo
// Prédios entre a cidade distante e o viaduto, colados nas bordas: outdoor
// "rádio da madrugada" (esq.) e torre de escritórios (dir.)
const BACK_L = (() => {
  const rand = seeded(31)
  const office = grid(rand, 192, 162, 64, 300, 7, 6, 11, 10, 0.25)
  const mid = grid(rand, 300, 330, 280, 140, 10, 8, 18, 16, 0.18)
  return { office, mid }
})()

const BACK_R = (() => {
  const rand = seeded(47)
  const mid = grid(rand, 352, 292, 92, 170, 8, 7, 14, 13, 0.22)
  const far = grid(rand, 40, 330, 300, 130, 9, 7, 16, 14, 0.16)
  // torre de vidro: andares inteiros acesos em faixas
  let floors = ''
  let floorsCool = ''
  for (let y = 132; y < 466; y += 9) {
    const r = rand()
    if (r < 0.28) floors += box(458, y, 78, 4)
    else if (r < 0.42) floorsCool += box(458, y, 78, 4)
  }
  return { mid, far, floors, floorsCool }
})()

export function BackLeft() {
  const { office, mid } = BACK_L
  return (
    <div className="cp-side cp-back cp-back-l">
      <svg className="cp-back-svg" viewBox="0 100 600 370" aria-hidden="true">
        {/* torre de escritórios */}
        <path
          d={box(186, 150, 76, 330) + box(222, 118, 3, 32)}
          fill="#1b0f3d"
        />
        <path d={office.warm} fill="#ffd2a1" opacity="0.7" />
        <path d={office.cool} fill="#bfe6ff" opacity="0.6" />
        {/* prédio do outdoor */}
        <path d={box(0, 300, 300, 180)} fill="#1d0e3c" />
        <path d={box(300, 322, 300, 160)} fill="#190c36" />
        <path d={mid.warm} fill="#ffca8e" opacity="0.55" />
        <path d={mid.cool} fill="#9fd8ff" opacity="0.45" />
        <path d={box(0, 296, 300, 4)} fill="#ff6fb5" opacity="0.4" />
        {/* outdoor: pôr do sol, palmeira e o nome da rádio */}
        <g>
          <rect
            x="34"
            y="206"
            width="148"
            height="80"
            fill="#ff6fa8"
            opacity="0.6"
            filter="url(#cp-bloom)"
          />
          <path
            d="M50 286V298M166 286V298M40 298H176"
            stroke="#120822"
            strokeWidth="3"
          />
          <rect x="38" y="210" width="140" height="72" fill="url(#cp-sunset)" />
          <circle cx="146" cy="262" r="15" fill="#fff0b8" />
          <path d={box(38, 262, 140, 20)} fill="#24206e" />
          <path
            d={
              box(108, 266, 70, 2) + box(118, 271, 50, 2) + box(128, 276, 30, 2)
            }
            fill="#ffd7a0"
            opacity="0.8"
          />
          <path
            d="M58 282C60 266 62 252 66 240M66 240C58 236 50 238 44 244M66 240C62 232 56 230 48 232M66 240C72 232 80 232 86 236M66 240C74 238 80 242 84 248M66 240C66 232 70 226 76 224"
            stroke="#1b0b2e"
            strokeWidth="3.2"
            fill="none"
            strokeLinecap="round"
          />
          <text className="cp-jp cp-bb-title" x="112" y="236">
            ナイトFM
          </text>
          <text className="cp-bb-freq" x="112" y="254">
            87.6 ♪
          </text>
          <rect
            x="38"
            y="210"
            width="140"
            height="72"
            fill="none"
            stroke="#ffe4f2"
            strokeWidth="1.5"
          />
          {/* refletores */}
          <path
            d="M60 300L48 292M108 300L108 292M156 300L168 292"
            stroke="#120822"
            strokeWidth="2"
          />
          <path
            d={dot(48, 291, 2.4) + dot(108, 291, 2.4) + dot(168, 291, 2.4)}
            fill="#fff6d8"
          />
        </g>
      </svg>
      {/* telão do outdoor: um anúncio de disco que alterna com o da rádio
          e os recados da roleta (girando / vencedor) por cima */}
      <div className="cp-bb cp-bb-ad">
        <b>新譜</b>
        <span>ミッドナイト東京</span>
      </div>
      <div className="cp-bb cp-bb-spin">
        <span className="cp-bb-run">
          <span>♪ ルーレット回転中 ♪ 回転中</span>
          <span>♪ ルーレット回転中 ♪ 回転中</span>
        </span>
      </div>
      <div className="cp-bb cp-bb-win">
        <b className="cp-bb-word">当たり！</b>
        <span>おめでとう</span>
      </div>
    </div>
  )
}

export function BackRight() {
  const { mid, far, floors, floorsCool } = BACK_R
  return (
    <div className="cp-side cp-back cp-back-r">
      <svg className="cp-back-svg" viewBox="0 60 600 410" aria-hidden="true">
        <path d={box(20, 320, 330, 160)} fill="#170b33" />
        <path d={far.warm} fill="#ffcf9a" opacity="0.5" />
        <path d={far.cool} fill="#a6dcff" opacity="0.4" />
        <path d={box(346, 282, 104, 200)} fill="#1e0f40" />
        <path d={mid.warm} fill="#ffd2a1" opacity="0.6" />
        <path d={mid.cool} fill="#bde5ff" opacity="0.5" />
        {/* torre de vidro com coroa ciano */}
        <path d={box(452, 118, 90, 362)} fill="url(#cp-glass-tower)" />
        <path d={box(494, 72, 3, 46) + box(470, 104, 54, 14)} fill="#22164a" />
        <path d={floors} fill="#ffe0b0" opacity="0.62" />
        <path d={floorsCool} fill="#c6f1ff" opacity="0.55" />
        <path
          d={
            box(458, 118, 1.2, 352) +
            box(478, 118, 1.2, 352) +
            box(498, 118, 1.2, 352) +
            box(518, 118, 1.2, 352)
          }
          fill="#0e0828"
          opacity="0.7"
        />
        <rect
          x="452"
          y="118"
          width="90"
          height="6"
          fill="#2de2e6"
          filter="url(#cp-bloom-s)"
        />
        <path d={box(452, 119, 90, 3)} fill="#c8feff" />
        <path d={box(540, 118, 2, 362)} fill="#ff6fb5" opacity="0.45" />
        <path d={dot(495.5, 70, 3)} fill="#5a1630" />
      </svg>
      <span className="cp-tower-beacon cp-beacon-r" />
    </div>
  )
}

// ---------------------------------------------------------------- rua (meio)
// retângulo aceso que vira mancha no reflexo: x, y, w, h, cor
type Lit = [number, number, number, number, string]

// Fileira de lojas do outro lado da rua no centro (fica atrás dos cards):
// calma, poucas luzes. Também alimenta o reflexo do asfalto (cp-lit-m).
const MID = (() => {
  const rand = seeded(77)
  let wa = ''
  let wb = ''
  let warm = ''
  let cool = ''
  let shopW = ''
  let shopC = ''
  let signs = ''
  let awn = ''
  const lit: Lit[] = []
  for (let x = 0, i = 0; x < 3000; i++) {
    const w = 120 + rand() * 120
    const top = 430 + rand() * 70
    if (i % 2) wa += box(x, top, w, 700 - top)
    else wb += box(x, top, w, 700 - top)
    // vitrine
    if (rand() < 0.6) {
      shopW += box(x + 10, 622, w - 20, 78)
      lit.push([x + 10, 640, w - 20, 60, 'rgba(255, 184, 119, 0.3)'])
    } else {
      shopC += box(x + 10, 622, w - 20, 78)
      lit.push([x + 10, 640, w - 20, 60, 'rgba(159, 232, 255, 0.24)'])
    }
    awn += box(x + 6, 612, w - 12, 8)
    // janelas do 2º andar
    for (let wx = x + 14; wx < x + w - 30; wx += 38) {
      const r = rand()
      if (r < 0.35) warm += box(wx, top + 28, 24, 30)
      else if (r < 0.5) cool += box(wx, top + 28, 24, 30)
    }
    if (rand() < 0.55) {
      signs += box(x + w * 0.2, top + 72, w * 0.6, 24)
      lit.push([x + w * 0.3, top + 72, w * 0.4, 24, 'rgba(255, 95, 174, 0.22)'])
    }
    x += w + 4
  }
  return { wa, wb, warm, cool, shopW, shopC, signs, awn, lit }
})()

export function MidRow() {
  return (
    <div className="cp-mid">
      <svg
        viewBox="0 400 3000 310"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path d={MID.wa} fill="#1a0c36" />
        <path d={MID.wb} fill="#200f40" />
        <path d={MID.warm} fill="#ffc98c" opacity="0.4" />
        <path d={MID.cool} fill="#a8dcff" opacity="0.32" />
        <path d={MID.shopW} fill="#ffbf80" opacity="0.42" />
        <path d={MID.shopC} fill="#aeeaff" opacity="0.36" />
        <path d={MID.awn} fill="#12081f" />
        <path d={MID.signs} fill="#3a1a52" />
      </svg>
    </div>
  )
}

// ---------------------------------------------------------------- frente
// Lateral esquerda do outro lado da rua: lámen com noren e lanternas,
// karaokê, snack bar "夜光", máquinas de bebida e uma bicicleta
const LITE_L = (() => {
  const rand = seeded(5)
  return grid(rand, 452, 456, 140, 120, 14, 12, 26, 22, 0.25)
})()

const yen = (t: string, x: number, y: number, s: number, cls: string) => (
  <text className={`cp-jp ${cls}`} x={x} y={y} fontSize={s}>
    {t}
  </text>
)

const heartD =
  'M85 438C56 420 54 398 68 392C77 388 84 394 85 400C86 394 93 388 102 392C116 398 114 420 85 438Z'

export function FrontLeft() {
  return (
    <div className="cp-side cp-front cp-front-l">
      <svg className="cp-front-svg" viewBox="0 370 600 340" aria-hidden="true">
        {/* L3: izakaya (fica atrás dos cards) */}
        <path d={box(440, 436, 160, 264)} fill="url(#cp-wall-g2)" />
        <path d={box(436, 430, 164, 7)} fill="#2a1450" />
        <path d={LITE_L.warm} fill="#ffc98a" opacity="0.5" />
        <path d={LITE_L.cool} fill="#a8dcff" opacity="0.35" />
        <path d={box(452, 620, 136, 80)} fill="#ffb070" opacity="0.5" />
        <path d={box(448, 598, 144, 14)} fill="#2a1410" />
        <path
          d={
            dot(462, 616, 6) +
            dot(492, 616, 6) +
            dot(522, 616, 6) +
            dot(552, 616, 6) +
            dot(582, 616, 6)
          }
          fill="#ff4a4a"
          opacity="0.75"
        />
        {yen('居酒屋', 486, 609, 11, 'cp-dim-txt')}

        {/* L2: snack bar em cima, máquinas de bebida embaixo */}
        <path d={box(232, 468, 208, 232)} fill="url(#cp-wall-g)" />
        <path d={box(232, 462, 208, 7)} fill="#2c1656" />
        <path d={box(232, 462, 208, 1.4)} fill="#ff6fb5" opacity="0.45" />
        <rect
          x="244"
          y="486"
          width="184"
          height="44"
          rx="6"
          fill="#b46bff"
          opacity="0.5"
          filter="url(#cp-bloom)"
        />
        <rect
          x="248"
          y="490"
          width="176"
          height="36"
          rx="4"
          fill="#150a26"
          stroke="#b46bff"
          strokeWidth="2"
        />
        <text className="cp-jp cp-tube-violet" x="258" y="517" fontSize="22">
          スナック
        </text>
        <text className="cp-jp cp-sign-dim" x="364" y="517" fontSize="22">
          夜光
        </text>
        <path d={box(256, 540, 66, 40)} fill="#ffbf86" opacity="0.55" />
        <path d={box(342, 540, 66, 40)} fill="#3b2d6b" opacity="0.7" />
        <path
          d={
            box(256, 552, 66, 1.5) +
            box(256, 562, 66, 1.5) +
            box(256, 572, 66, 1.5)
          }
          fill="#1a0c2a"
          opacity="0.55"
        />
        <path d={box(232, 588, 208, 10)} fill="#1c0e30" />
        {/* máquinas de bebida */}
        <rect
          x="240"
          y="636"
          width="76"
          height="68"
          fill="#bfe6ff"
          opacity="0.55"
          filter="url(#cp-bloom)"
        />
        <path
          d={box(244, 640, 32, 60) + box(280, 640, 32, 60)}
          fill="url(#cp-vend)"
        />
        <path
          d={box(247, 645, 26, 30) + box(283, 645, 26, 30)}
          fill="#e9f7ff"
        />
        <path
          d={
            box(249, 648, 4, 7) +
            box(256, 648, 4, 7) +
            box(263, 648, 4, 7) +
            box(285, 658, 4, 7) +
            box(292, 658, 4, 7) +
            box(299, 658, 4, 7)
          }
          fill="#ff4f7a"
        />
        <path
          d={
            box(249, 658, 4, 7) +
            box(256, 658, 4, 7) +
            box(263, 668, 4, 7) +
            box(285, 648, 4, 7) +
            box(299, 648, 4, 7) +
            box(292, 668, 4, 7)
          }
          fill="#36b8ff"
        />
        <path
          d={
            box(263, 648, 4, 7) +
            box(249, 668, 4, 7) +
            box(256, 668, 4, 7) +
            box(292, 648, 4, 7) +
            box(285, 668, 4, 7) +
            box(299, 668, 4, 7)
          }
          fill="#ffc23d"
        />
        <path d={box(249, 684, 22, 8) + box(285, 684, 22, 8)} fill="#1b1430" />
        <path d={box(266, 678, 5, 3) + box(302, 678, 5, 3)} fill="#3dffc5" />
        <path d={box(316, 680, 11, 20)} fill="#3a66b0" />
        <path d={box(329, 680, 11, 20)} fill="#2d8f72" />
        <path d={box(316, 680, 24, 3)} fill="#e9eef8" />
        {/* bicicleta encostada */}
        <g fill="none" stroke="#2c2244" strokeWidth="2.2">
          <circle cx="356" cy="690" r="9" />
          <circle cx="390" cy="690" r="9" />
          <path d="M356 690L368 677H383L390 690M368 677L375 690H356M383 677L381 671M364 675H371M381 671H388" />
        </g>
        <path
          d="M347 690A9 9 0 0 1 365 690M381 690A9 9 0 0 1 399 690"
          stroke="#ff6fb5"
          strokeWidth="1"
          fill="none"
          opacity="0.6"
        />
        <path d={box(404, 606, 36, 94)} fill="url(#cp-shutter)" />

        {/* L1: lámen embaixo, apartamento em cima, caixa d'água no teto */}
        <path d={box(0, 452, 236, 248)} fill="url(#cp-wall-g)" />
        <path d={box(0, 444, 240, 9)} fill="#2c1656" />
        <path d={box(0, 444, 240, 1.4)} fill="#ff6fb5" opacity="0.5" />
        <path
          d={box(150, 404, 44, 38) + box(154, 442, 3, 4) + box(187, 442, 3, 4)}
          fill="#1f1140"
        />
        <ellipse cx="172" cy="404" rx="22" ry="5" fill="#2b1852" />
        <path
          d={box(150, 416, 44, 1.4) + box(150, 430, 44, 1.4)}
          fill="#140a2c"
        />
        <path d={box(192, 404, 2, 38)} fill="#ff6fb5" opacity="0.55" />
        {/* placa de coração no telhado (acende quando a roleta gira) */}
        <path
          d={box(48, 392, 3, 54) + box(118, 392, 3, 54) + box(46, 440, 78, 3)}
          fill="#1a0f30"
        />
        <path d={heartD} fill="none" stroke="#3a2152" strokeWidth="3.4" />
        {yen('恋', 75, 424, 20, 'cp-sign-dim')}
        {/* janelas do apartamento */}
        <path d={box(30, 474, 64, 66)} fill="#ffc27d" opacity="0.8" />
        <path
          d={
            box(30, 482, 64, 2) +
            box(30, 492, 64, 2) +
            box(30, 502, 64, 2) +
            box(30, 512, 64, 2)
          }
          fill="#7a3a2a"
          opacity="0.55"
        />
        <path
          d="M44 540C44 528 50 522 56 520C52 528 52 534 56 540Z M60 540C62 530 70 526 76 526C70 532 68 536 70 540Z"
          fill="#2a1a20"
        />
        <path d={box(150, 474, 70, 66)} fill="#3d4cc0" opacity="0.55" />
        <path d={box(156, 498, 30, 42)} fill="#7f8dff" opacity="0.35" />
        <path d={box(26, 540, 72, 4) + box(146, 540, 78, 4)} fill="#2a1650" />
        {/* ar-condicionado */}
        <path d={box(94, 548, 40, 28)} fill="#3a2e58" />
        <circle
          cx="114"
          cy="562"
          r="9"
          fill="none"
          stroke="#1d1434"
          strokeWidth="2"
        />
        <path
          d="M134 556H146V590"
          stroke="#1d1434"
          strokeWidth="2"
          fill="none"
        />
        {/* letreiros verticais */}
        <path
          d={
            box(76, 472, 12, 3) +
            box(76, 568, 12, 3) +
            box(144, 476, 12, 3) +
            box(144, 562, 12, 3)
          }
          fill="#120a20"
        />
        <VSign
          x={40}
          y={456}
          w={36}
          h={128}
          text="カラオケ"
          color="cyan"
          size={25}
          mode="off"
        />
        <VSign
          x={108}
          y={462}
          w={36}
          h={120}
          text="ラーメン"
          color="red"
          size={24}
          mode="panel"
        />
        {/* lámen */}
        <path d={box(20, 588, 216, 112)} fill="#22101c" />
        <path d={box(30, 594, 196, 16)} fill="#120814" />
        {yen('中華そば', 128, 607, 12, 'cp-ramen-name')}
        <path d={box(32, 612, 192, 88)} fill="url(#cp-warm-in)" />
        <path d={box(32, 664, 192, 7)} fill="#4a2214" />
        <path d={box(32, 671, 192, 29)} fill="#7a3a1c" opacity="0.6" />
        {/* clientes de costas e o cozinheiro */}
        <path
          d={
            dot(78, 646, 7) +
            'M68 664C68 654 72 652 78 652C84 652 88 654 88 664Z' +
            dot(122, 644, 7.4) +
            'M111 664C111 653 116 651 122 651C128 651 133 653 133 664Z' +
            dot(176, 632, 6) +
            'M168 664V648C168 642 172 640 176 640C180 640 184 642 184 648V664Z'
          }
          fill="#3a1520"
        />
        <path d={box(170, 628, 12, 3)} fill="#fff4e6" />
        <path
          d="M76 671V700M80 671V700M120 671V700M124 671V700"
          stroke="#3a1520"
          strokeWidth="2"
        />
        {/* noren */}
        <path
          d={
            box(40, 612, 44, 38) +
            box(86, 612, 44, 38) +
            box(132, 612, 44, 38) +
            box(178, 612, 44, 38)
          }
          fill="#1f2b6e"
        />
        <path d={box(32, 610, 192, 3)} fill="#0b0814" />
        {yen('ら', 52, 638, 18, 'cp-noren')}
        {yen('ー', 98, 638, 18, 'cp-noren')}
        {yen('め', 144, 638, 18, 'cp-noren')}
        {yen('ん', 190, 638, 18, 'cp-noren')}
        {/* lanternas vermelhas (chōchin) */}
        <path
          d={dot(36, 606, 18) + dot(222, 606, 18)}
          fill="#ff3b3b"
          opacity="0.5"
          filter="url(#cp-bloom)"
        />
        <ellipse cx="36" cy="606" rx="10" ry="14" fill="url(#cp-lamp-r)" />
        <ellipse cx="222" cy="606" rx="10" ry="14" fill="url(#cp-lamp-r)" />
        <path
          d={
            box(30, 590, 12, 3) +
            box(30, 619, 12, 3) +
            box(216, 590, 12, 3) +
            box(216, 619, 12, 3)
          }
          fill="#1a0a0e"
        />
        <path
          d="M27 602H45M27 610H45M213 602H231M213 610H231"
          stroke="#9b1020"
          strokeWidth="0.8"
          opacity="0.6"
        />
        {/* cavalete "aberto" na calçada */}
        <path d="M190 700L196 674H210L216 700Z" fill="#efe6da" />
        <text
          className="cp-jp cp-easel"
          x="203"
          y="678"
          fontSize="7"
          style={{ writingMode: 'vertical-rl' }}
        >
          営業中
        </text>
      </svg>

      {/* partes que piscam / acendem: cada uma num <svg> próprio */}
      <Patch side="l" x={20} y={436} w={76} h={168} className="cp-flk cp-flk-a">
        <VSign
          x={40}
          y={456}
          w={36}
          h={128}
          text="カラオケ"
          color="cyan"
          size={25}
          mode="tube"
        />
      </Patch>
      <Patch side="l" x={354} y={496} w={72} h={30} className="cp-flk cp-flk-b">
        <text className="cp-jp cp-tube-violet" x="364" y="517" fontSize="22">
          夜光
        </text>
      </Patch>
      <Patch side="l" x={36} y={372} w={98} h={84} className="cp-spin-on">
        <path
          d={heartD}
          fill="none"
          stroke="#ff3d9a"
          strokeWidth="9"
          opacity="0.6"
          filter="url(#cp-bloom-s)"
        />
        <path d={heartD} fill="none" stroke="#ffd2ea" strokeWidth="3" />
        {yen('恋', 75, 424, 20, 'cp-heart-txt')}
      </Patch>
      <span className="cp-ramen-steam cp-rs-1" />
      <span className="cp-ramen-steam cp-rs-2" />
    </div>
  )
}

// Lateral direita: loja de discos (disco de neon girando), loja 24H com
// gente lendo revista e, na calçada de cá, poste com semáforo
const LITE_R = (() => {
  const rand = seeded(9)
  return grid(rand, 184, 520, 150, 60, 14, 12, 26, 22, 0.3)
})()

export function FrontRight() {
  return (
    <div className="cp-side cp-front cp-front-r">
      <svg className="cp-front-svg" viewBox="0 370 600 340" aria-hidden="true">
        {/* R3 e R2 (atrás dos cards) */}
        <path d={box(0, 470, 172, 230)} fill="url(#cp-wall-g2)" />
        <path d={box(172, 450, 180, 250)} fill="url(#cp-wall-g)" />
        <path d={box(168, 444, 188, 7)} fill="#2c1656" />
        <path d={LITE_R.warm} fill="#ffc98a" opacity="0.5" />
        <path d={LITE_R.cool} fill="#a8dcff" opacity="0.4" />
        <rect
          x="186"
          y="476"
          width="150"
          height="30"
          rx="4"
          fill="#0f1a30"
          stroke="#2de2e6"
          strokeOpacity="0.5"
          strokeWidth="1.6"
        />
        {yen('カラオケ 3F', 200, 498, 18, 'cp-dim-cyan')}
        <path d={box(190, 620, 140, 80)} fill="#ff9be0" opacity="0.32" />
        <path d={box(184, 606, 152, 12)} fill="#2a1240" />
        <path d={box(20, 630, 140, 70)} fill="#ffc98a" opacity="0.28" />

        {/* R1: loja de discos + loja 24H */}
        <path d={box(352, 428, 248, 272)} fill="url(#cp-wall-g)" />
        <path d={box(348, 421, 252, 8)} fill="#2c1656" />
        <path d={box(348, 421, 252, 1.4)} fill="#ff6fb5" opacity="0.5" />
        <path
          d={box(380, 406, 30, 15) + box(560, 410, 24, 11)}
          fill="#1d1238"
        />
        <path
          d="M352 410H600M364 410V421M400 410V421M436 410V421M472 410V421M508 410V421M544 410V421"
          stroke="#1d1238"
          strokeWidth="1.6"
        />
        {/* disco de neon (o brilho que gira é um <span>) */}
        <circle
          cx="452"
          cy="466"
          r="36"
          fill="#ff3d9a"
          opacity="0.45"
          filter="url(#cp-bloom)"
        />
        <circle cx="452" cy="466" r="31" fill="#14061f" />
        <g fill="none" stroke="#ff5fae" strokeWidth="1.6">
          <circle cx="452" cy="466" r="30" />
          <circle cx="452" cy="466" r="25" />
          <circle cx="452" cy="466" r="20.5" opacity="0.7" />
          <circle cx="452" cy="466" r="16" opacity="0.7" />
        </g>
        <circle cx="452" cy="466" r="10" fill="#2de2e6" />
        <circle cx="452" cy="466" r="1.8" fill="#14061f" />
        <path d={box(482, 464, 30, 3)} fill="#120a20" />
        {/* vitrine da loja de discos */}
        <path d={box(366, 500, 132, 74)} fill="url(#cp-shop-in)" />
        <path
          d={
            box(372, 506, 18, 24) +
            box(394, 506, 18, 24) +
            box(416, 506, 18, 24)
          }
          fill="#ff5fae"
          opacity="0.55"
        />
        <path d={box(394, 506, 18, 24)} fill="#2de2e6" opacity="0.6" />
        <path d={box(438, 506, 18, 24)} fill="#ffd36e" opacity="0.7" />
        <path
          d={
            'M370 574V556H426V574Z' +
            dot(446, 540, 6) +
            'M438 574C438 556 441 550 446 550C451 550 454 556 454 574Z'
          }
          fill="#3a1a34"
        />
        <path d={box(372, 552, 50, 2) + box(366, 572, 132, 2)} fill="#24101e" />
        <text className="cp-open" x="462" y="528" fontSize="15">
          open
        </text>
        <path
          d={box(366, 498, 132, 3) + box(366, 574, 132, 4)}
          fill="#170b28"
        />
        {/* placa vertical */}
        <path d={box(548, 452, 12, 3) + box(548, 590, 12, 3)} fill="#120a20" />
        <VSign
          x={512}
          y={440}
          w={36}
          h={168}
          text="レコード"
          color="pink"
          size={26}
          mode="tube"
        />

        {/* loja 24H */}
        <rect
          x="352"
          y="584"
          width="248"
          height="30"
          fill="#f2f0ff"
          opacity="0.45"
          filter="url(#cp-bloom-s)"
        />
        <path d={box(352, 588, 248, 22)} fill="#f6f2ff" />
        <path d={box(352, 588, 248, 4)} fill="#ff3d9a" />
        <path d={box(352, 606, 248, 4)} fill="#2de2e6" />
        <text className="cp-24h" x="547" y="605" fontSize="15">
          24H
        </text>
        {yen('ナイトマート', 372, 604, 12, 'cp-mart')}
        <rect
          x="360"
          y="608"
          width="244"
          height="96"
          fill="#cff4ff"
          opacity="0.5"
          filter="url(#cp-bloom)"
        />
        <path d={box(364, 612, 236, 88)} fill="url(#cp-konbini-in)" />
        <path
          d={
            box(370, 616, 50, 3) +
            box(436, 616, 50, 3) +
            box(502, 616, 50, 3) +
            box(568, 616, 30, 3)
          }
          fill="#ffffff"
        />
        {/* prateleiras */}
        <path
          d={box(372, 640, 90, 3) + box(372, 660, 90, 3) + box(372, 680, 90, 3)}
          fill="#8fb2c8"
        />
        <path
          d={
            box(374, 632, 6, 8) +
            box(384, 632, 6, 8) +
            box(398, 652, 6, 8) +
            box(412, 632, 6, 8) +
            box(430, 672, 6, 8) +
            box(446, 652, 6, 8) +
            box(376, 672, 6, 8) +
            box(420, 652, 6, 8) +
            box(452, 632, 6, 8)
          }
          fill="#ff7aa8"
        />
        <path
          d={
            box(392, 632, 6, 8) +
            box(404, 632, 6, 8) +
            box(376, 652, 6, 8) +
            box(386, 652, 6, 8) +
            box(438, 632, 6, 8) +
            box(410, 672, 6, 8) +
            box(394, 672, 6, 8) +
            box(440, 672, 6, 8)
          }
          fill="#ffd36e"
        />
        <path
          d={
            box(422, 632, 6, 8) +
            box(430, 652, 6, 8) +
            box(452, 672, 6, 8) +
            box(404, 652, 6, 8)
          }
          fill="#56c8ff"
        />
        {/* revistas e o leitor na janela */}
        <path d={box(470, 676, 92, 24)} fill="#7a8fb0" />
        <path
          d={
            box(474, 668, 9, 10) +
            box(486, 668, 9, 10) +
            box(498, 668, 9, 10) +
            box(536, 668, 9, 10) +
            box(548, 668, 9, 10)
          }
          fill="#ff9ec8"
        />
        <path d={box(480, 668, 4, 10) + box(542, 668, 6, 10)} fill="#ffe08a" />
        <path
          d={
            dot(519, 632, 7) +
            'M508 676V652C508 644 512 641 519 641C526 641 530 644 530 652V676Z'
          }
          fill="#2b2a4a"
        />
        <path d={box(512, 648, 18, 12)} fill="#ffffff" opacity="0.85" />
        <path
          d={
            box(410, 612, 2.4, 88) +
            box(456, 612, 2.4, 88) +
            box(504, 612, 2.4, 88) +
            box(552, 612, 2.4, 88)
          }
          fill="#5d7690"
        />
        <path d={box(530, 618, 20, 22)} fill="#ffe36b" />
        {yen('おでん', 532, 632, 6.5, 'cp-oden')}
        <path
          d="M380 690L420 620M470 690L500 640"
          stroke="#ffffff"
          strokeWidth="2"
          opacity="0.25"
        />
      </svg>
      <Patch side="r" x={364} y={612} w={236} h={88} className="cp-konbini-flk">
        <path d={box(364, 612, 236, 88)} fill="#0b1830" opacity="0.55" />
      </Patch>
      <span className="cp-disc-shine" />
      <span className="cp-disc-shine cp-disc-fast" />
    </div>
  )
}

// poste da calçada de cá (na frente dos carros): semáforo horizontal,
// sinal de pedestre, placa "止まれ" e transformadores
const walkMan =
  'M555 621a2.6 2.6 0 1 0 0.01 0zM553 626l-3 7 2 1 2-4 1 3-2 6h2.4l2-5 2 5h2.4l-3-7-1-5 3 3 2-1-4-4z'
const stopMan =
  'M555 593a2.6 2.6 0 1 0 0.01 0zM551 598h8v9h-2v8h-1.6v-7h-0.8v7H553v-8h-2z'

export function NearRight() {
  return (
    <div className="cp-side cp-near-r">
      <svg className="cp-near-svg" viewBox="430 0 170 910" aria-hidden="true">
        {/* poste e cruzeta */}
        <path d={box(556, 0, 12, 910)} fill="#1c1630" />
        <path d={box(556, 0, 2, 910)} fill="#2de2e6" opacity="0.32" />
        <path d={box(566, 0, 2, 910)} fill="#ff3d9a" opacity="0.3" />
        <path d={box(488, 38, 112, 6) + box(500, 64, 100, 5)} fill="#1c1630" />
        <path
          d={
            box(494, 29, 6, 9) +
            box(520, 29, 6, 9) +
            box(584, 29, 6, 9) +
            box(508, 56, 6, 8) +
            box(586, 56, 6, 8)
          }
          fill="#cfe2d8"
        />
        <rect x="530" y="98" width="24" height="46" rx="6" fill="#2a2440" />
        <rect x="530" y="152" width="24" height="40" rx="6" fill="#2a2440" />
        <path d={box(530, 106, 24, 2) + box(530, 160, 24, 2)} fill="#1a1530" />
        <path d={box(552, 98, 2, 94)} fill="#ff6fb5" opacity="0.4" />
        {/* braço do semáforo */}
        <path d="M556 258H436" stroke="#1c1630" strokeWidth="4" />
        <rect x="438" y="246" width="114" height="34" rx="6" fill="#26213a" />
        <path d={box(438, 246, 114, 1.4)} fill="#7b6fa0" opacity="0.6" />
        <path
          d={dot(458, 263, 12) + dot(495, 263, 12) + dot(532, 263, 12)}
          fill="#3b3449"
        />
        <path
          d="M444 254A14 14 0 0 1 472 254V249H444ZM481 254A14 14 0 0 1 509 254V249H481ZM518 254A14 14 0 0 1 546 254V249H518Z"
          fill="#191427"
        />
        <path d={dot(495, 263, 10)} fill="#5a4a28" opacity="0.6" />
        {/* sinal de pedestre */}
        <rect x="540" y="586" width="30" height="62" rx="3" fill="#26213a" />
        <path d={stopMan + walkMan} fill="#3d3650" />
        {/* placa de parada */}
        <path d="M534 662H590L562 708Z" fill="#ffffff" />
        <path d="M539 665H585L562 703Z" fill="#e3203a" />
        {yen('止まれ', 547, 678, 10, 'cp-tomare')}
        <path
          d={box(556, 840, 12, 6) + box(556, 852, 12, 6) + box(556, 864, 12, 6)}
          fill="#ffd23b"
        />
      </svg>
      <span className="cp-sig cp-sig-stop" />
      <span className="cp-sig cp-sig-go" />
      <Patch
        side="r"
        x={540}
        y={586}
        w={30}
        h={62}
        className="cp-ped cp-ped-walk"
      >
        <path d={walkMan} fill="#3dffc5" filter="url(#cp-bloom-s)" />
        <path d={walkMan} fill="#c8fff0" />
      </Patch>
      <Patch
        side="r"
        x={540}
        y={586}
        w={30}
        h={62}
        className="cp-ped cp-ped-stop"
      >
        <path d={stopMan} fill="#ff3a3a" filter="url(#cp-bloom-s)" />
        <path d={stopMan} fill="#ffd6d6" />
      </Patch>
    </div>
  )
}

// fios de poste saindo da cruzeta para a esquerda, cruzando o céu e a lua
export function Wires() {
  return (
    <svg
      className="cp-wires"
      viewBox="0 0 4000 300"
      preserveAspectRatio="xMaxYMin meet"
      aria-hidden="true"
    >
      <g fill="none" stroke="#06030e" strokeLinecap="round">
        <path
          strokeWidth="2.4"
          d="M3897 32C3600 150 3100 170 2700 120S2050 30 1500 50 600 90 0 60"
        />
        <path
          strokeWidth="2"
          d="M3923 32C3640 120 3200 140 2800 96S2150 12 1500 24 500 40 0 20"
        />
        <path
          strokeWidth="2"
          d="M3987 32C3700 180 3150 230 2650 170S1900 70 1300 90 500 120 0 100"
        />
        <path
          strokeWidth="1.6"
          d="M3911 60C3650 110 3300 128 2950 108S2300 60 1800 70 700 110 0 92"
        />
        <path
          strokeWidth="4.2"
          d="M3986 60C3760 210 3300 260 2900 230S2200 150 1500 170 600 200 0 180"
        />
      </g>
      {/* gotas presas nos fios, brilhando */}
      <path
        d={
          dot(3640, 136, 2) +
          dot(3420, 162, 2) +
          dot(3260, 155, 1.6) +
          dot(3760, 96, 1.6) +
          dot(3540, 118, 1.8)
        }
        fill="#ffc6e6"
        opacity="0.8"
      />
    </svg>
  )
}

// ---------------------------------------------------------------- reflexo
// Asfalto molhado: o que brilha do outro lado da rua, espelhado na linha da
// calçada (y' = 1142 − 0,6·y) e esticado na vertical. Cada mancha é um
// radial-gradient numa <div> (nada de SVG nem filtro); duas cópias
// recortadas em faixas alternadas balançam em sentidos opostos (ondas).
const LIT_L: Lit[] = [
  [44, 460, 28, 120, 'rgba(45, 226, 230, 0.55)'],
  [112, 466, 28, 112, 'rgba(255, 42, 68, 0.75)'],
  [34, 480, 56, 54, 'rgba(255, 194, 125, 0.28)'],
  [44, 644, 168, 56, 'rgba(255, 173, 98, 0.45)'],
  [28, 594, 16, 24, 'rgba(255, 59, 59, 0.9)'],
  [214, 594, 16, 24, 'rgba(255, 59, 59, 0.9)'],
  [252, 494, 168, 28, 'rgba(180, 107, 255, 0.42)'],
  [248, 646, 60, 54, 'rgba(223, 243, 255, 0.62)'],
  [458, 640, 124, 60, 'rgba(255, 176, 112, 0.26)'],
]
const LIT_R: Lit[] = [
  [430, 444, 44, 44, 'rgba(255, 61, 154, 0.5)'],
  [516, 446, 28, 156, 'rgba(255, 61, 154, 0.6)'],
  [372, 506, 120, 62, 'rgba(255, 191, 142, 0.36)'],
  [360, 590, 232, 16, 'rgba(255, 255, 255, 0.5)'],
  [372, 640, 220, 60, 'rgba(214, 246, 255, 0.62)'],
  [192, 480, 138, 22, 'rgba(45, 226, 230, 0.2)'],
  [196, 640, 128, 60, 'rgba(255, 155, 224, 0.2)'],
]
// mancha espelhada (coordenadas relativas ao topo da faixa do asfalto)
const spot = ([x, y, w, h, c]: Lit) => {
  const cx = x + w / 2
  const cy = 420 - 0.6 * (y + h / 2)
  const rx = w / 2 + 8
  const ry = h * 0.3 + 24
  return `radial-gradient(${vh(rx)} ${vh(ry)} at ${vh(cx)} ${vh(cy)}, ${c}, transparent)`
}
const REFL = {
  l: LIT_L.map(spot).join(','),
  r: LIT_R.map(spot).join(','),
  m: MID.lit.map(spot).join(','),
}

function ReflCopies() {
  return (
    <div className="cp-refl-in">
      <div className="cp-refl-l" style={{ background: REFL.l }} />
      <div className="cp-refl-m" style={{ background: REFL.m }} />
      <div className="cp-refl-r" style={{ background: REFL.r }} />
    </div>
  )
}

export function Reflections() {
  return (
    <div className="cp-refl">
      <div className="cp-refl-band cp-refl-a">
        <ReflCopies />
      </div>
      <div className="cp-refl-band cp-refl-b">
        <ReflCopies />
      </div>
    </div>
  )
}
