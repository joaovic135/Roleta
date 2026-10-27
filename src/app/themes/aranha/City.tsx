import type { CSSProperties, ReactNode } from 'react'
import {
  AWNING,
  BOARD,
  BULBS,
  CAT,
  CROWN,
  DECO,
  GROUND,
  PERCH,
  H,
  LANE_FAR,
  LANE_NEAR,
  SIGNS,
  VB,
  W,
  buildCity,
  buildStreet,
  bus,
  getaway,
  rect,
  sedan,
  type Car,
} from './geo'

// Cidade, rua e carros: a mesma caixa 1600 x 500 presa ao chão (largura
// max(100%, 200vh)), então nada desalinha em tela nenhuma. Camadas grandes
// ficam paradas; só mexem opacity/transform das <svg>/<div> de fora.

export const CITY = buildCity()
const STREET = buildStreet()
const NEAR_COLORS = ['#b4533c', '#4b67b4', '#d6a65f', '#7a62a6']
// cada grupo de janelas acende num momento (fração do ciclo, negativa =
// mais tarde); o 3º apaga de madrugada, o 4º é luz de TV, o 5º pisca
const WIN = [
  { k: 0, fill: '#ffd84a', cls: 'hq-win' },
  { k: -0.012, fill: '#ffe98a', cls: 'hq-win' },
  { k: -0.02, fill: '#ffc23d', cls: 'hq-win-late' },
  { k: -0.03, fill: '#8fdcff', cls: 'hq-win' },
  { k: -0.045, fill: '#ffd84a', cls: 'hq-win' },
]

export const phase = (k: number) =>
  ({ '--hq-k': k.toFixed(4) }) as CSSProperties
const pct = (v: number, of: number) => `${((v / of) * 100).toFixed(4)}%`

// <svg> pequeno num recorte da caixa: a camada animada fica do tamanho do
// detalhe, não da cidade inteira
function Patch({
  x,
  y,
  w,
  h,
  className,
  style,
  children,
}: {
  x: number
  y: number
  w: number
  h: number
  className: string
  style?: CSSProperties
  children: ReactNode
}) {
  return (
    <svg
      className={'hq-patch ' + className}
      style={{
        left: pct(x, W),
        top: pct(y, H),
        width: pct(w, W),
        height: pct(h, H),
        ...style,
      }}
      viewBox={`${x} ${y} ${w} ${h}`}
    >
      {children}
    </svg>
  )
}

// letras empilhadas dos letreiros verticais (uma <tspan> por letra)
type Sign = (typeof SIGNS)[number]
const STEP = 28
function SignText({
  s,
  lit,
  only,
  skip,
}: {
  s: Sign
  lit?: boolean
  only?: number
  skip?: number
}) {
  return (
    <text className={lit ? 'hq-sign-text hq-neon' : 'hq-sign-text'}>
      {s.text.split('').map((ch, i) =>
        (only !== undefined && i !== only) || i === skip ? null : (
          <tspan key={i} x={s.x + s.w / 2} y={s.y + 26 + i * STEP}>
            {ch}
          </tspan>
        ),
      )}
    </text>
  )
}

// ------------------------------------------------------------------ carros
function CarArt({ car }: { car: Car }) {
  return (
    <svg viewBox={`0 ${-car.tall} ${car.len} ${car.tall + 2}`}>
      <path className="hq-car-body" d={car.body} fill={car.color} />
      <path className="hq-car-glass" d={car.glass} />
      <path className="hq-car-ink" d={car.ink} />
      <path className="hq-car-light" d={car.light} />
    </svg>
  )
}

// posição na caixa e laço de ida (só translateX, em % da própria largura)
const carBox = (car: Car, lane: number): CSSProperties => ({
  left: 0,
  top: pct(lane - car.tall, H),
  width: pct(car.len, W),
  height: pct(car.tall + 2, H),
})
const TRAFFIC: {
  car: Car
  flip: boolean
  dur: number
  delay: number
}[] = [
  { car: sedan('#ffcf1f', true), flip: false, dur: 20, delay: -2 },
  { car: sedan('#d63a3a', false), flip: false, dur: 20, delay: -9 },
  { car: sedan('#ffcf1f', true), flip: false, dur: 20, delay: -15 },
  { car: bus(), flip: true, dur: 26, delay: -13 },
  { car: sedan('#ffcf1f', true), flip: true, dur: 26, delay: -21 },
]
const driveVars = (car: Car, flip: boolean, dur: number, delay: number) => {
  const from = (-(car.len + 20) / car.len) * 100
  const to = ((W + 20) / car.len) * 100
  const [a, b] = flip ? [to, from] : [from, to]
  // parado (reduced motion) = onde o carro estaria no instante 0
  const p = -delay / dur
  return {
    '--hq-x0': `${a.toFixed(1)}%`,
    '--hq-x1': `${b.toFixed(1)}%`,
    '--hq-x': `${(a + (b - a) * p).toFixed(1)}%`,
    animationDuration: `${dur}s`,
    animationDelay: `${delay}s`,
  } as CSSProperties
}

function Traffic() {
  return (
    <>
      {TRAFFIC.map(({ car, flip, dur, delay }, i) => (
        <div
          key={i}
          className="hq-car"
          style={{
            ...carBox(car, flip ? LANE_FAR : LANE_NEAR),
            ...driveVars(car, flip, dur, delay),
          }}
        >
          <div className={flip ? 'hq-car-in hq-flip' : 'hq-car-in'}>
            <i className="hq-car-beam hq-cyc hq-lamps" />
            <CarArt car={car} />
          </div>
        </div>
      ))}
    </>
  )
}

// Perseguição: carro de fuga na frente, viatura atrás com giroflex (uma
// passagem por ciclo, numa faixa à frente do trânsito)
const POLICE = sedan('#f1f3fa', false, true)
const GETAWAY = getaway()
const CHASE_LEN = 214
function Chase() {
  return (
    <div
      className="hq-chase hq-cyc"
      style={{
        left: 0,
        top: pct(506 - 44, H),
        width: pct(CHASE_LEN, W),
        height: pct(46, H),
      }}
    >
      <svg viewBox={`0 -44 ${CHASE_LEN} 46`}>
        {/* traços de velocidade atrás dos dois carros */}
        <path
          className="hq-speedline"
          d="M-30 -24h26M-40 -16h34M-24 -9h20M108 -22h22M100 -14h30M112 -8h18"
        />
        <g transform="translate(138 0)">
          <path className="hq-car-body" d={GETAWAY.body} fill={GETAWAY.color} />
          <path className="hq-car-glass hq-glass-dark" d={GETAWAY.glass} />
          <path className="hq-car-ink" d={GETAWAY.ink} />
          <path className="hq-car-light" d={GETAWAY.light} />
        </g>
        <g transform="translate(14 0)">
          <path className="hq-car-body" d={POLICE.body} fill={POLICE.color} />
          <path className="hq-car-glass" d={POLICE.glass} />
          <path className="hq-car-ink" d={POLICE.ink} />
          <path className="hq-car-light" d={POLICE.light} />
          <path className="hq-police-door" d={rect(26, -16, 22, 8)} />
          {/* giroflex: metade vermelha, metade azul (o brilho pisca por cima) */}
          <path d={rect(31, -36.5, 7, 4)} fill="#ff2a2a" stroke="#05060c" />
          <path d={rect(38, -36.5, 7, 4)} fill="#2a6bff" stroke="#05060c" />
        </g>
      </svg>
      <i className="hq-siren hq-siren-r" />
      <i className="hq-siren hq-siren-b" />
      <span className="hq-sfx hq-uoo">UÓÓ-UÓÓ!</span>
    </div>
  )
}

// ------------------------------------------------------------------ cidade
export function City() {
  return (
    <div className="hq-box">
      {/* fundo: silhueta azulada; cópias de cor cruzam a opacidade */}
      <svg className="hq-layer" viewBox={VB}>
        <use href="#hq-far" className="hq-far" />
      </svg>
      <svg className="hq-layer hq-cyc hq-o-warm" viewBox={VB}>
        <use href="#hq-far" className="hq-far-warm" />
      </svg>
      <svg className="hq-layer hq-cyc hq-o-night" viewBox={VB}>
        <use href="#hq-far" className="hq-far-night" />
      </svg>
      <svg className="hq-layer hq-cyc hq-win" viewBox={VB} style={phase(-0.02)}>
        <path className="hq-far-lit" d={CITY.farLit} />
      </svg>

      {/* frente: cores chapadas, retícula na sombra e nanquim por cima */}
      <svg className="hq-layer" viewBox={VB}>
        {CITY.fills.map((d, i) => (
          <path key={i} d={d} fill={NEAR_COLORS[i]} />
        ))}
        <path d={CITY.shade} fill="url(#hq-ht)" />
        <path className="hq-panes" d={CITY.panes} />
        <path className="hq-tank" d={CITY.tanks} />
        <path className="hq-tank-roof" d={CITY.tankRoofs} />
        <path className="hq-ink-fill" d={CITY.ink} />
        <path className="hq-rails" d={CITY.rails} />
        <use href="#hq-sil" className="hq-ink" />
        <path className="hq-ink" d={CITY.tankInk} />
        {/* toldo listrado do hotel */}
        <path className="hq-awning" d={AWNING.box} />
        <path className="hq-awning-red" d={AWNING.red} />
        <path className="hq-awning-red hq-ink-thin" d={AWNING.scallop} />
        <path className="hq-ink-thin" d={AWNING.box} />
        {/* letreiros verticais e outdoor, apagados */}
        {SIGNS.map((s) => (
          <g key={s.text}>
            <path className="hq-sign" d={rect(s.x, s.y, s.w, s.h)} />
            <SignText s={s} />
          </g>
        ))}
        <path
          className="hq-board"
          d={rect(BOARD.x, BOARD.y, BOARD.w, BOARD.h)}
        />
        <text className="hq-board-text" x={BOARD.x + BOARD.w / 2} y={81}>
          PIZZARIA
        </text>
        <text
          className="hq-board-text hq-board-sm"
          x={BOARD.x + BOARD.w / 2}
          y={95}
        >
          DO TONINHO
        </text>
      </svg>

      {/* rua parada: calçada, asfalto, faixas, postes, hidrante, bueiros */}
      <svg className="hq-layer" viewBox={VB}>
        <path className="hq-walk" d={rect(-10, GROUND, W + 20, 9)} />
        <path className="hq-road" d={rect(-10, GROUND + 9, W + 20, 60)} />
        <path className="hq-zebra" d={STREET.zebra} />
        <path className="hq-dash" d={STREET.dashes} />
        <path className="hq-manhole" d={STREET.manholes} />
        <path className="hq-post" d={STREET.posts} />
        <path className="hq-lamp" d={STREET.heads} />
        <path className="hq-hydrant" d={STREET.hydrant} />
      </svg>

      <svg className="hq-layer hq-cyc hq-o-warm" viewBox={VB}>
        <use href="#hq-sil" className="hq-near-warm" />
      </svg>
      <svg className="hq-layer hq-cyc hq-o-night" viewBox={VB}>
        <use href="#hq-sil" className="hq-near-night" />
        <path className="hq-street-night" d={rect(-10, GROUND, W + 20, 9)} />
        <path
          className="hq-street-night hq-road-night"
          d={rect(-10, GROUND + 9, W + 20, 60)}
        />
        <use href="#hq-sil" className="hq-ink hq-ink-night" />
      </svg>

      {/* janelas acendendo em grupos */}
      {CITY.groups.map((d, i) =>
        i === WIN.length - 1 ? (
          <div
            key={i}
            className={`hq-layer hq-cyc ${WIN[i].cls}`}
            style={phase(WIN[i].k)}
          >
            <svg className="hq-layer hq-flick" viewBox={VB}>
              <path d={d} fill={WIN[i].fill} />
              <path className="hq-win-sil" d={CITY.sils[i]} />
            </svg>
          </div>
        ) : (
          <svg
            key={i}
            className={`hq-layer hq-cyc ${WIN[i].cls}`}
            viewBox={VB}
            style={phase(WIN[i].k)}
          >
            <path d={d} fill={WIN[i].fill} />
            {CITY.sils[i] && <path className="hq-win-sil" d={CITY.sils[i]} />}
          </svg>
        ),
      )}

      {/* luzes da noite: neon, coroa déco, outdoor, postes e poças de luz */}
      <div className="hq-layer hq-cyc hq-lamps hq-lights">
        <svg className="hq-layer" viewBox={VB}>
          <path className="hq-pool" d={STREET.pools} />
          <path className="hq-cone" d={STREET.glow} />
          <path className="hq-lamp-lit" d={STREET.heads} />
          <path className="hq-crown" d={CROWN} />
          <path
            className="hq-board-glow"
            d={rect(BOARD.x - 34, BOARD.y - 30, BOARD.w + 68, BOARD.h + 64)}
          />
          <path
            className="hq-board hq-board-lit"
            d={rect(BOARD.x, BOARD.y, BOARD.w, BOARD.h)}
          />
          <text className="hq-board-text" x={BOARD.x + BOARD.w / 2} y={81}>
            PIZZARIA
          </text>
          <text
            className="hq-board-text hq-board-sm"
            x={BOARD.x + BOARD.w / 2}
            y={95}
          >
            DO TONINHO
          </text>
          {SIGNS.map((s) => (
            <g key={s.text} className={s.cls}>
              <path
                className="hq-neon-glow"
                d={rect(s.x - 32, s.y - 26, s.w + 64, s.h + 52)}
              />
              <path className="hq-sign" d={rect(s.x, s.y, s.w, s.h)} />
              <SignText s={s} lit skip={s.text === 'HOTEL' ? 2 : undefined} />
            </g>
          ))}
        </svg>
        {/* o "T" do HOTEL tem mau contato */}
        <Patch
          x={SIGNS[0].x}
          y={SIGNS[0].y + 58}
          w={SIGNS[0].w}
          h={30}
          className="hq-neon-r hq-bad"
        >
          <SignText s={SIGNS[0]} lit only={2} />
        </Patch>
        <Patch
          x={BOARD.x - 4}
          y={BOARD.y - 4}
          w={BOARD.w + 8}
          h={BOARD.h + 8}
          className="hq-bulbs"
        >
          <path d={BULBS[0]} />
        </Patch>
        <Patch
          x={BOARD.x - 4}
          y={BOARD.y - 4}
          w={BOARD.w + 8}
          h={BOARD.h + 8}
          className="hq-bulbs hq-bulbs-b"
        >
          <path d={BULBS[1]} />
        </Patch>
        <svg className="hq-layer hq-blink" viewBox={VB}>
          <path className="hq-beacon" d={CITY.beacons} />
        </svg>
        {/* gato no alto do outdoor (só à noite): olhos acesos, rabo mexendo */}
        <Patch x={176} y={46} w={20} h={22} className="hq-cat">
          <g transform={`translate(186 ${BOARD.y})`}>
            <circle cx="0" cy="-12.4" r="5" fill="url(#hq-cateye)" />
            <path d={CAT.body} />
            <path d={CAT.head} />
            <path className="hq-cat-eyes" d={CAT.eyes} />
          </g>
        </Patch>
        <Patch x={186} y={52} w={12} h={16} className="hq-cat-tail">
          <path transform={`translate(189 ${BOARD.y})`} d={CAT.tail} />
        </Patch>
      </div>

      {/* o herói agachado na coroa déco: vigia a cidade e salta quando a
          perseguição começa (o balanço de 50 s entra no mesmo instante) */}
      <div
        className="hq-perch hq-cyc"
        style={{
          left: pct(DECO.x + 12, W),
          top: pct(DECO.top - 78 - 32, H),
          width: pct(40, W),
          height: pct(36, H),
        }}
      >
        <svg viewBox="-22 -32 40 36">
          <circle cx="-8" cy="-23.6" r="8" fill="url(#hq-eyeglow)" />
          <path
            d={PERCH.limbs}
            fill="none"
            stroke="#05060c"
            strokeWidth="7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <g
            fill="none"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d={PERCH.suit} stroke="#1b2350" />
            <path d={PERCH.red} stroke="#e23636" />
          </g>
          <circle
            cx="-6"
            cy="-24"
            r="4.4"
            fill="#1d2658"
            stroke="#05060c"
            strokeWidth="1.8"
          />
          <path
            d={PERCH.eyes}
            fill="#eafcff"
            stroke="#05060c"
            strokeWidth="0.9"
          />
        </svg>
        <svg className="hq-perch-scarf" viewBox="-22 -32 40 36">
          <path
            d={PERCH.scarf}
            fill="#e23636"
            stroke="#05060c"
            strokeWidth="1.3"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <div className="hq-fog hq-cyc">
        <i />
      </div>

      {/* chuva no asfalto: poças e respingos */}
      <svg className="hq-layer hq-cyc hq-rain-on" viewBox={VB}>
        <path className="hq-wet" d={STREET.pools} />
      </svg>
      <Traffic />
      <Chase />
      <div className="hq-layer hq-cyc hq-rain-on">
        <svg className="hq-layer hq-splash" viewBox={VB}>
          <path d={STREET.splash[0]} />
        </svg>
        <svg className="hq-layer hq-splash hq-splash-b" viewBox={VB}>
          <path d={STREET.splash[1]} />
        </svg>
      </div>

      {/* vapor saindo dos bueiros */}
      <div
        className="hq-steam"
        style={{ left: pct(158, W), top: pct(420, H), width: pct(36, W) }}
      >
        <i />
      </div>
      <div
        className="hq-steam hq-steam-b"
        style={{ left: pct(1416, W), top: pct(420, H), width: pct(36, W) }}
      >
        <i />
      </div>
    </div>
  )
}
