import type { ReactNode } from 'react'
import {
  STAGE_W,
  WALL_L,
  WALL_R,
  WALL_X,
  wallBase,
  wallTop,
  type Wall,
} from './art'
import { at, atR, n } from './lib'

// As duas paredes do beco (palcos laterais presos nas bordas da tela, em
// unidades --nn-u) com os letreiros néon espetados para fora, de frente
// para quem olha, e os reflexos deles no chão molhado.

type Side = 'l' | 'r'
const place = (side: Side) => (side === 'l' ? at : atR)

// fachada em perspectiva (o palco da direita é o mesmo desenho espelhado)
function Facade({ w, side }: { w: Wall; side: Side }) {
  return (
    <svg
      className={`nn-wall nn-wall-${side}`}
      viewBox={`0 0 ${STAGE_W} 1000`}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`nn-wall-g-${side}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#1d0d3a" />
          <stop offset="0.55" stopColor="#120827" />
          <stop offset="1" stopColor="#0a0519" />
        </linearGradient>
        <linearGradient id={`nn-wall-v-${side}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#000" stopOpacity="0.55" />
          <stop offset="0.5" stopColor="#000" stopOpacity="0" />
          <stop offset="0.85" stopColor="#ff2bd6" stopOpacity="0.08" />
        </linearGradient>
      </defs>
      <path d={w.face} fill={`url(#nn-wall-g-${side})`} />
      <path d={w.face} fill={`url(#nn-wall-v-${side})`} />
      <path d={w.ledges} fill="#2b1552" />
      <path d={w.dark} fill="#0b0518" />
      {w.lit.map(([c, d]) => (
        <path key={c} d={d} fill={c} opacity="0.55" />
      ))}
      <path d={w.ac} fill="#3a2a5e" />
      <path d={w.pipes} stroke="#2a1850" strokeWidth="5" fill="none" />
      <path d={w.pipes} stroke="#4c2f86" strokeWidth="1.2" fill="none" />
      <path d={w.shop} fill="#07030f" />
      <path d={w.shopLit} fill="#5ff3ff" opacity="0.35" />
      {/* quina da parede e rodapé */}
      <path
        d={`M${WALL_X} ${n(wallTop(WALL_X))}V${n(wallBase(WALL_X))}`}
        stroke="#ff4fc8"
        strokeOpacity="0.5"
        strokeWidth="1.5"
      />
      <path
        d={`M0 ${n(wallBase(0))}L${WALL_X} ${n(wallBase(WALL_X))}`}
        stroke="#5ff3ff"
        strokeOpacity="0.45"
        strokeWidth="2"
      />
    </svg>
  )
}

// Letreiro de tubo: camada apagada (o vidro sem luz) e camada acesa por
// cima, que pisca/zumbe (opacidade). `fx` escolhe o laço de falha.
export type SignSpec = {
  side: Side
  x: number
  y: number
  w: number
  h: number
  text: string
  color: string
  fx: string
  vertical?: boolean
  size?: number
  sub?: string
  // reflexo no chão (altura em unidades)
  refl?: number
}
function Sign({ s }: { s: SignSpec }) {
  const style = place(s.side)(s.x, s.y, s.w, s.h, {
    '--c': s.color,
    fontSize: `calc(${s.size ?? s.w * 0.62} * var(--nn-u))`,
  })
  const body = (
    <>
      <b>{s.text}</b>
      {s.sub && <small>{s.sub}</small>}
    </>
  )
  return (
    <div className={`nn-sign${s.vertical ? 'nn-v' : ''}`} style={style}>
      <div className="nn-sign-off">{body}</div>
      <div className={`nn-sign-on ${s.fx}`}>{body}</div>
    </div>
  )
}
function Reflection({ s }: { s: SignSpec }) {
  if (!s.refl) return null
  const x = s.x + s.w * 0.1
  return (
    <i
      className={`nn-refl ${s.fx}`}
      style={place(s.side)(x, 1000 - s.refl, s.w * 0.8, s.refl, {
        '--c': s.color,
      })}
    />
  )
}

export const SIGNS: SignSpec[] = [
  // esquerda (perto da borda: o que aparece ao lado da interface)
  {
    side: 'l',
    x: 14,
    y: 110,
    w: 50,
    h: 228,
    text: 'ゲーム',
    color: '#ff3fd0',
    fx: 'nn-fk1',
    vertical: true,
    refl: 92,
  },
  {
    side: 'l',
    x: 78,
    y: 300,
    w: 46,
    h: 150,
    text: '電気',
    color: '#4fb8ff',
    fx: 'nn-fk2',
    vertical: true,
    refl: 70,
  },
  {
    side: 'l',
    x: 16,
    y: 380,
    w: 52,
    h: 58,
    text: '薬',
    color: '#ff4f7a',
    fx: 'nn-fail',
    refl: 60,
  },
  {
    side: 'l',
    x: 184,
    y: 236,
    w: 34,
    h: 110,
    text: '夢',
    color: '#c56bff',
    fx: 'nn-fk3',
    vertical: true,
    size: 24,
  },
  {
    side: 'l',
    x: 238,
    y: 300,
    w: 22,
    h: 74,
    text: '未来',
    color: '#5ff3ff',
    fx: 'nn-fk4',
    vertical: true,
    size: 13,
  },
  // direita
  {
    side: 'r',
    x: 122,
    y: 120,
    w: 40,
    h: 170,
    text: 'ネオン',
    color: '#5ff3ff',
    fx: 'nn-fk2',
    vertical: true,
  },
  {
    side: 'r',
    x: 18,
    y: 214,
    w: 96,
    h: 44,
    text: '夜',
    color: '#ff3fd0',
    fx: 'nn-fk4',
    sub: 'OPEN 24H',
    size: 26,
  },
  {
    side: 'r',
    x: 122,
    y: 620,
    w: 42,
    h: 140,
    text: '電脳',
    color: '#ff3fd0',
    fx: 'nn-fk3',
    vertical: true,
    refl: 80,
  },
  {
    side: 'r',
    x: 196,
    y: 260,
    w: 30,
    h: 96,
    text: '酒',
    color: '#ff9a4f',
    fx: 'nn-fail2',
    vertical: true,
    size: 20,
  },
  {
    side: 'r',
    x: 246,
    y: 330,
    w: 20,
    h: 64,
    text: '光',
    color: '#8f7bff',
    fx: 'nn-fk1',
    vertical: true,
    size: 13,
  },
]

// caveira e lótus de néon (o <svg> inteiro pisca)
function Skull() {
  return (
    <div className="nn-icon nn-skull" style={at(84, 168, 74, 84)}>
      <svg viewBox="0 0 60 68" aria-hidden="true">
        <g fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path
            d="M30 4C16 4 7 14 7 27C7 36 12 41 17 44V54H43V44C48 41 53 36 53 27C53 14 44 4 30 4ZM24 54V61M30 54V61M36 54V61M17 61H43"
            stroke="#5ff3ff"
            strokeOpacity="0.35"
            strokeWidth="7"
          />
          <path
            d="M30 4C16 4 7 14 7 27C7 36 12 41 17 44V54H43V44C48 41 53 36 53 27C53 14 44 4 30 4ZM24 54V61M30 54V61M36 54V61M17 61H43"
            stroke="#d6fdff"
            strokeWidth="2.4"
          />
          <path d="M28 40L30 35 32 40" stroke="#d6fdff" strokeWidth="2" />
          <circle cx="21" cy="28" r="6" stroke="#d6fdff" strokeWidth="2" />
          <circle cx="39" cy="28" r="6" stroke="#d6fdff" strokeWidth="2" />
        </g>
      </svg>
      {/* olhos (piscam em vermelho de vez em quando) */}
      <svg className="nn-skull-eyes" viewBox="0 0 60 68" aria-hidden="true">
        <circle cx="21" cy="28" r="6" fill="#ff3f8a" />
        <circle cx="39" cy="28" r="6" fill="#ff3f8a" />
      </svg>
    </div>
  )
}
function Lotus() {
  return (
    <div className="nn-icon nn-lotus" style={atR(24, 86, 92, 86)}>
      <svg viewBox="0 0 80 70" aria-hidden="true">
        <g fill="none" strokeLinejoin="round" strokeLinecap="round">
          {[
            ['#ff3fd0', 0.3, 8],
            ['#ffd0f4', 1, 2.2],
          ].map(([c, o, w]) => (
            <path
              key={String(c)}
              d="M40 8C33 18 32 34 40 46C48 34 47 18 40 8ZM40 46C30 40 20 30 15 20C14 32 22 44 40 46ZM40 46C50 40 60 30 65 20C66 32 58 44 40 46ZM40 46C28 46 14 42 6 36C10 48 24 54 40 46ZM40 46C52 46 66 42 74 36C70 48 56 54 40 46ZM16 60H64M26 66H54"
              stroke={String(c)}
              strokeOpacity={Number(o)}
              strokeWidth={Number(w)}
            />
          ))}
        </g>
      </svg>
    </div>
  )
}

export function Stage({
  side,
  children,
}: {
  side: Side
  children?: ReactNode
}) {
  return (
    <div className={`nn-stage nn-stage-${side}`}>
      <Facade w={side === 'l' ? WALL_L : WALL_R} side={side} />
      {/* cabos e luminárias na parede */}
      <div className="nn-signs">
        {SIGNS.filter((s) => s.side === side).map((s, i) => (
          <Sign key={i} s={s} />
        ))}
        {side === 'l' ? <Skull /> : <Lotus />}
      </div>
      {SIGNS.filter((s) => s.side === side).map((s, i) => (
        <Reflection key={i} s={s} />
      ))}
      {children}
    </div>
  )
}
