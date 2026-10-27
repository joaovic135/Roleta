import { Fragment, type CSSProperties } from 'react'
import { circle, rect } from './geo'
import { RACE_CSS, stallX, stallY } from './race'
import {
  IDOL_SHEET,
  IDOL_VIEW,
  RUNNERS,
  RUNNER_SHEET,
  RUNNER_VIEW,
} from './sprites'

// Corredoras, portão de largada e o pelotão que entra quando a roleta gira.
// Cada corredora: .um-r (posição, keyframes um-race-k) > janela de 1 quadro
// > .um-r-row (linha da folha, um-row-k) > <svg> da folha (quadros em
// degraus). Só transform anima; o <svg> é o elemento externo (nada anima
// dentro dele).

const vars = (o: Record<string, string | number>) => o as CSSProperties
const colors = (k: number) =>
  vars({
    '--um-hair': RUNNERS[k].hair,
    '--um-silk': RUNNERS[k].silk,
    '--um-acc': RUNNERS[k].acc,
    '--um-leg': `-${((k * 0.07) % 0.36).toFixed(2)}s`,
  })

// tintas da folha: estilo inline no próprio path, porque o seletor do tema
// (html[data-theme] .x) não entra na árvore-sombra do <use>; as cores da
// corredora chegam por herança das variáveis do pai do <use>
const PAINT: Record<string, CSSProperties> = {
  'um-rO': {
    fill: '#4a2d5e',
    stroke: '#4a2d5e',
    strokeWidth: 2.2,
    strokeLinejoin: 'round',
  },
  'um-rH': { fill: 'var(--um-hair)' },
  'um-rS': { fill: 'var(--um-silk)' },
  'um-rA': { fill: 'var(--um-acc)' },
  'um-rK': { fill: '#ffe5d6' },
  'um-rB': { fill: '#5a3f74' },
  'um-rW': { fill: '#ffffff' },
  'um-rD': { fill: '#3d2b56' },
  'um-rP': { fill: '#ff9dbb' },
  'um-rX': { fill: 'rgba(70, 30, 110, 0.22)' },
  'um-rL': { fill: 'rgba(255, 255, 255, 0.4)' },
  'um-rDust': { fill: '#f3f9e4' },
}

// <symbol>s das folhas: uma vez na cena, usados por todas as corredoras
export function SpriteDefs() {
  return (
    <svg className="um-defs" width="0" height="0" aria-hidden="true">
      <symbol id="um-sheet" viewBox={RUNNER_VIEW}>
        {RUNNER_SHEET.map((l, i) => (
          <path key={i} d={l.d} style={PAINT[l.k]} />
        ))}
      </symbol>
      <symbol id="um-idol" viewBox={IDOL_VIEW}>
        {IDOL_SHEET.map((l, i) => (
          <path key={i} d={l.d} style={PAINT[l.k]} />
        ))}
      </symbol>
    </svg>
  )
}

export function Sheet({ idol = false }: { idol?: boolean }) {
  return (
    <svg
      className={idol ? 'um-i-sheet' : 'um-r-sheet'}
      viewBox={idol ? IDOL_VIEW : RUNNER_VIEW}
    >
      <use href={idol ? '#um-idol' : '#um-sheet'} />
    </svg>
  )
}

export function Runner({
  k,
  className,
  style,
  race = false,
}: {
  k: number
  className: string
  style?: CSSProperties
  race?: boolean
}) {
  return (
    <div className={className} style={{ ...colors(k), ...style }}>
      <div className="um-r-win">
        <div
          className="um-r-row"
          style={race ? { animationName: `um-row-${k}` } : undefined}
        >
          <Sheet />
        </div>
      </div>
    </div>
  )
}

// ---- portão de largada (viewBox 230×150, px; base no chão) ----
// o SVG começa 30 px antes de --um-gx (espaço do pódio do juiz)
const GH = 150
const gy = (b: number) => GH - b // altura acima do chão -> y do SVG
const GATE = (() => {
  let posts = ''
  let pads = ''
  let roof = ''
  let roofPad = ''
  let shade = ''
  let back = ''
  const plates: { x: number; y: number; n: number }[] = []
  for (let k = 4; k >= 0; k--) {
    const x = stallX(k) + 30
    const b = stallY(k)
    // sombra no chão e parede do fundo da baia (translúcida)
    shade += `M${x - 4} ${gy(b) + 1}h60l-8 -6h-46z`
    back += rect(x + 4, gy(b + 60), 44, 58)
    // mastros de trás e da frente, com espuma colorida
    posts += rect(x + 1, gy(b + 64), 5, 64) + rect(x + 47, gy(b + 64), 5, 64)
    pads += rect(x, gy(b + 42), 7, 13) + rect(x + 46, gy(b + 42), 7, 13)
    roof += rect(x - 3, gy(b + 72), 59, 10)
    roofPad += rect(x + 1, gy(b + 70), 51, 3)
    plates.push({ x: x + 26, y: gy(b + 80), n: k + 1 })
  }
  // treliça que liga as baias por cima (diagonal de trás para a frente)
  const x4 = stallX(4) + 30
  const x0 = stallX(0) + 30
  const truss =
    `M${x4 - 3} ${gy(stallY(4) + 86)}L${x0 + 56} ${gy(stallY(0) + 86)}` +
    `L${x0 + 56} ${gy(stallY(0) + 80)}L${x4 - 3} ${gy(stallY(4) + 80)}Z`
  return { posts, pads, roof, roofPad, shade, back, plates, truss }
})()
// placa de largada com as luzes, em cima da baia da frente
const LAMP_X = stallX(0) + 54
const LAMP_Y = gy(stallY(0) + 104)

const DOOR_COLORS = ['#ff8fc8', '#7fe3c8', '#c9a2ff', '#ffc08a', '#8fd0ff']

function Gate() {
  return (
    <svg className="um-gate" viewBox={`0 0 230 ${GH}`} aria-hidden="true">
      <path className="um-g-shade" d={GATE.shade} />
      <path className="um-g-back" d={GATE.back} />
      <path className="um-g-truss" d={GATE.truss} />
      <path className="um-g-post" d={GATE.posts} />
      <path className="um-g-pad" d={GATE.pads} />
      <path className="um-g-roof" d={GATE.roof} />
      <path className="um-g-roofpad" d={GATE.roofPad} />
      {GATE.plates.map((p) => (
        <g key={p.n}>
          <path
            className="um-g-plate"
            d={circle(p.x, p.y, 6.5)}
            style={{ fill: DOOR_COLORS[p.n - 1] }}
          />
          <text className="um-g-num" x={p.x} y={p.y + 3.2}>
            {p.n}
          </text>
        </g>
      ))}
      {/* juiz de largada no pódio, à esquerda */}
      <path className="um-g-podium" d="M4 150V104h34v46z" />
      <path className="um-g-podium-top" d="M0 100h42v6H0z" />
      <path className="um-g-stripe" d="M4 118h34v5H4zM4 132h34v5H4z" />
      <path className="um-g-judge" d="M12 101q0 -18 9 -18q9 0 9 18z" />
      <path className="um-g-skin" d={circle(21, 76, 6.8)} />
      <path
        className="um-g-cap"
        d="M14 75q0 -9.5 7 -9.5q7 0 7 9.5zM26 73h6.5v2.6H26z"
      />
      <path className="um-g-dark" d={circle(24, 77.4, 1)} />
    </svg>
  )
}

function GateFront() {
  return (
    <svg
      className="um-gate um-gate-front"
      viewBox={`0 0 230 ${GH}`}
      aria-hidden="true"
    >
      <path className="um-g-post" d={rect(LAMP_X + 25, LAMP_Y + 16, 4, 22)} />
      <path
        className="um-g-sign"
        d={`M${LAMP_X} ${LAMP_Y}h54a5 5 0 0 1 5 5v8a5 5 0 0 1 -5 5h-54a5 5 0 0 1 -5 -5v-8a5 5 0 0 1 5 -5z`}
      />
      <path
        className="um-g-lampoff"
        d={
          circle(LAMP_X + 11, LAMP_Y + 9, 4.4) +
          circle(LAMP_X + 27, LAMP_Y + 9, 4.4) +
          circle(LAMP_X + 43, LAMP_Y + 9, 4.4)
        }
      />
    </svg>
  )
}

// luzes de largada acesas (HTML por cima do SVG, só opacidade anima)
const lampStyle = (i: number) =>
  vars({ left: LAMP_X + 11 + i * 16, bottom: GH - (LAMP_Y + 9) })

export function Race() {
  return (
    <div className="um-race">
      <style>{RACE_CSS}</style>
      <div className="um-gate-wrap">
        <Gate />
      </div>
      {[4, 3, 2, 1, 0].map((k) => (
        <Fragment key={k}>
          <Runner
            k={k}
            race
            className="um-r um-rr"
            style={{
              animationName: `um-race-${k}`,
              transform: `translate(calc(var(--um-gx) + ${stallX(k)}px), ${-stallY(k)}px)`,
            }}
          />
          <div
            className="um-door"
            style={vars({
              left: `calc(var(--um-gx) + ${stallX(k) + 5}px)`,
              bottom: stallY(k) + 2,
              '--um-door': DOOR_COLORS[k],
            })}
          >
            <b>{k + 1}</b>
          </div>
        </Fragment>
      ))}
      <i className="um-photo" />
      <b className="um-bubble um-bubble-go">VAI!</b>
      <b className="um-bubble um-bubble-goal">CHEGADA!</b>
      <div className="um-gate-wrap um-gate-wrap-front">
        <GateFront />
        <i className="um-lamp um-lamp-1" style={lampStyle(0)} />
        <i className="um-lamp um-lamp-2" style={lampStyle(1)} />
        <i className="um-lamp um-lamp-3" style={lampStyle(2)} />
        <div className="um-starter-flag">
          <svg viewBox="0 0 30 30">
            <path className="um-g-stick" d="M3 28V3" />
            <path className="um-g-flag" d="M4 3h20l-4 6l4 6H4z" />
          </svg>
        </div>
      </div>
    </div>
  )
}

// pelotão da roleta: entra correndo enquanto gira; no vencedor faz a
// chegada e comemora (a da frente veste a cor da fatia vencedora)
const DASH = [
  { d: 3.1, dl: -0.4, y: 3 },
  { d: 3.5, dl: -1.9, y: 9 },
  { d: 2.9, dl: -1.1, y: 6 },
  { d: 3.3, dl: -2.6, y: 12 },
  { d: 3.7, dl: -0.9, y: 0 },
]
export function DashPack() {
  return (
    <div className="um-dash">
      {DASH.map((p, k) => (
        <Runner
          key={k}
          k={k}
          className={`um-r um-d um-d-${k}`}
          style={vars({
            '--um-d': `${p.d}s`,
            '--um-dl': `${p.dl}s`,
            '--um-y': `${-p.y}px`,
            '--um-wx': `calc(var(--um-fx) - ${40 + 30 * k}px)`,
            '--um-wl': `${(k * 0.16).toFixed(2)}s`,
            zIndex: 5 - Math.round(p.y / 3),
          })}
        />
      ))}
    </div>
  )
}
