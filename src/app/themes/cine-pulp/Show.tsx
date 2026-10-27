import { dot, n, oval, seeded, vars } from './geo'

// Reações e surpresas:
// - Estreia (roda parou no vencedor): canhões seguidores varrem as
//   cortinas e pousam no letreiro, flashes de fotógrafo nas beiradas, um
//   halo na cor do vencedor em volta do letreiro, uma rajada de confete
//   saindo dele e uma chuva de ingressos, confete e lantejoulas descendo
//   pelas duas margens (onde a sala aparece). Tudo toca uma vez (o CSS só
//   liga as animações com data-wheel="won") e assenta num brilho quente.
// - Disco voador de filme B, pendurado num fio (!), cruzando o alto de
//   tempos em tempos; a criatura do brejo espiando atrás da cortina.

// pedaços: t = ingresso, 0 = ouro, 1 = cor do vencedor, 2 = lantejoula
const BITS = ['t', '0', '1', '2', '1', '0']

// rajada do letreiro (cai por trás dos cards; aparece no alto e nos vãos)
const CONFETTI = (() => {
  const rand = seeded(1950)
  return Array.from({ length: 12 }, (_, i) => {
    const side = i % 2 ? 1 : -1
    const spread = 80 + rand() * 520
    return {
      k: BITS[i % BITS.length],
      dx: n(side * spread),
      up: n(-20 - rand() * 70),
      dy: n(260 + rand() * 520),
      r: n((rand() - 0.5) * 1440),
      d: n(rand() * 0.35),
    }
  })
})()

// chuva nas margens: cada pedaço desce a tela toda balançando e girando
const RAIN = (() => {
  const rand = seeded(1939)
  return Array.from({ length: 20 }, (_, i) => ({
    side: i % 2 ? 'r' : 'l',
    k: BITS[(i >> 1) % BITS.length],
    x: n(4 + rand() * 88),
    sw: n((rand() < 0.5 ? -1 : 1) * (10 + rand() * 26)),
    r: n((rand() < 0.5 ? -1 : 1) * (240 + rand() * 600)),
    t: n(3.4 + rand() * 2.2),
    d: n(0.1 + (i >> 1) * 0.17 + rand() * 0.25),
  }))
})()

const FLASHES = [
  { x: '6%', y: '18%', d: 0.15 },
  { x: '94%', y: '30%', d: 0.6 },
  { x: '11%', y: '58%', d: 1.1 },
  { x: '90%', y: '74%', d: 1.6 },
  { x: '36%', y: '5%', d: 2.3 },
]

export function Premiere() {
  return (
    <div className="cn-premiere">
      <i className="cn-winglow" />
      <i className="cn-spot cn-spot-l" />
      <i className="cn-spot cn-spot-r" />
      {FLASHES.map((f, i) => (
        <i
          key={i}
          className="cn-flash"
          style={vars({ left: f.x, top: f.y, '--cn-d': `${f.d}s` })}
        />
      ))}
      <div className="cn-confetti">
        {CONFETTI.map((c, i) => (
          <i
            key={i}
            className={`cn-conf cn-bit-${c.k}`}
            style={vars({
              '--cn-dx': `${c.dx}px`,
              '--cn-up': `${c.up}px`,
              '--cn-dy': `${c.dy}px`,
              '--cn-r': `${c.r}deg`,
              '--cn-d': `${c.d}s`,
            })}
          />
        ))}
      </div>
      {(['l', 'r'] as const).map((side) => (
        <div key={side} className={`cn-rain cn-rain-${side}`}>
          {RAIN.filter((c) => c.side === side).map((c, i) => (
            <i
              key={i}
              className={`cn-drop cn-bit-${c.k}`}
              style={vars({
                left: `${c.x}%`,
                '--cn-sw': `${c.sw}px`,
                '--cn-r': `${c.r}deg`,
                '--cn-t': `${c.t}s`,
                '--cn-d': `${c.d}s`,
              })}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

// disco voador de lata com luzes no aro
const SAUCER_LIGHTS = Array.from({ length: 7 }, (_, i) =>
  dot(14 + i * 6, 27.6, 1.3),
).join('')

export function Saucer() {
  return (
    <div className="cn-saucer">
      <div className="cn-saucer-bob">
        <i className="cn-saucer-wire" />
        <svg className="cn-saucer-art" viewBox="0 0 76 40">
          <defs>
            <linearGradient id="cn-saucer-g" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#f4f7f9" />
              <stop offset="0.5" stopColor="#9aa8b4" />
              <stop offset="1" stopColor="#3a4652" />
            </linearGradient>
          </defs>
          <path
            d="M26 24Q26 10 38 10Q50 10 50 24Z"
            fill="#7fe8ff"
            fillOpacity="0.85"
          />
          <path
            d="M30 18Q32 13 37 12.4"
            stroke="#fff"
            strokeWidth="1.4"
            fill="none"
          />
          <path d={oval(38, 26, 34, 7.5)} fill="url(#cn-saucer-g)" />
          <path d={oval(38, 29.5, 20, 3)} fill="#28323c" />
          <path d={SAUCER_LIGHTS} fill="#ffe36b" />
          <path d="M37 10v-4" stroke="#c9d3da" strokeWidth="1.4" />
        </svg>
        <i className="cn-sparks" />
      </div>
    </div>
  )
}

// criatura do brejo espiando (cabeça com barbatanas e olhos de neon)
export function Creature() {
  return (
    <div className="cn-creature">
      <svg className="cn-creature-art" viewBox="0 0 80 120">
        <path
          d="M80 34C70 22 52 20 42 30C34 38 34 50 38 58C30 62 24 72 22 86L18 120H80Z"
          fill="#0a2a14"
        />
        <path
          d="M44 28L40 14L50 24L52 8L58 22L64 10L66 24L74 16L72 30Z"
          fill="#0e3a1c"
        />
        <path
          d="M38 58C30 62 24 72 22 86M42 30C34 38 34 50 38 58"
          fill="none"
          stroke="#7dff5a"
          strokeWidth="1.6"
          strokeOpacity="0.7"
        />
        <path d={oval(48, 42, 4, 2.6) + oval(62, 41, 4, 2.6)} fill="#b6ff4a" />
        <path d={dot(48, 42, 1.2) + dot(62, 41, 1.2)} fill="#031008" />
        <path
          d="M44 52Q52 56 60 52"
          stroke="#031008"
          strokeWidth="1.8"
          fill="none"
        />
        <path d="M24 80l-8 -4l2 6l-6 0l8 6Z" fill="#0a2a14" />
      </svg>
    </div>
  )
}
