import type { CSSProperties } from 'react'

// Cena de fundo do tema Uma Musume (só aparece com data-theme="uma-musume").
// Uma pista de corrida de idols viva: céu com nuvens em parallax, varal de
// bandeirinhas, pista de grama em perspectiva com cerca branca, poste de
// chegada com bandeira quadriculada, torres de refletores e arquibancada.
// O ciclo (--um-cycle, 4 min) vai de manhã de sol → chuva rápida + arco-íris
// → tarde dourada → pôr do sol → corrida noturna com refletores, holofotes de
// palco, lightsticks, flashes e fogos → amanhecer. Tudo é estático aqui; as
// animações (só transform/opacity) ficam em theme.css. Formas iguais viram um
// <path> por cor e os sorteios usam semente fixa (igual no servidor e no
// navegador). Motivos genéricos: nada de personagens nem logos.

const seeded = (seed: number) => () => {
  seed = (seed + 0x6d2b79f5) | 0
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}
const n1 = (v: number) => Math.round(v * 10) / 10
const vars = (o: Record<string, string | number>) => o as CSSProperties

const circle = (cx: number, cy: number, r: number) =>
  `M${n1(cx - r)} ${n1(cy)}a${n1(r)} ${n1(r)} 0 1 0 ${n1(2 * r)} 0` +
  `a${n1(r)} ${n1(r)} 0 1 0 ${n1(-2 * r)} 0z`

// ---- Nuvens fofinhas: bolhas sobrepostas, com a sombra azulada embaixo ----
const PUFFS = [
  [0, 0, 0.8],
  [0.8, -0.45, 1.05],
  [1.75, -0.2, 0.95],
  [2.5, 0.15, 0.7],
  [1.2, 0.3, 0.85],
]
const cloud = (x: number, y: number, s: number) =>
  PUFFS.map(([px, py, pr]) =>
    circle(x + px * 30 * s, y + py * 30 * s, pr * 30 * s),
  ).join('')

// Faixa de 1600 de largura repetida 3 vezes (-1600, 0, +1600): ao deslizar
// meia largura (-50%) o desenho volta ao ponto de partida sem emenda
const cloudLayer = (
  seed: number,
  count: number,
  [yMin, yMax]: [number, number],
  [sMin, sMax]: [number, number],
) => {
  const rand = seeded(seed)
  const items = Array.from({ length: count }, (_, i) => ({
    x: ((i + rand() * 0.55) * 1600) / count,
    y: yMin + rand() * (yMax - yMin),
    s: sMin + rand() * (sMax - sMin),
  }))
  let light = ''
  let shade = ''
  for (const off of [-1600, 0, 1600])
    for (const c of items) {
      shade += cloud(c.x + off, c.y + 9 * c.s, c.s)
      light += cloud(c.x + off, c.y, c.s)
    }
  return { light, shade }
}
const CLOUDS = {
  far: cloudLayer(11, 7, [40, 110], [0.5, 0.8]),
  near: cloudLayer(23, 5, [70, 150], [1, 1.45]),
  rain: cloudLayer(37, 9, [30, 120], [1.15, 1.6]),
}

// ---- Varal de bandeirinhas (4 curvas, 6 bandeiras cada) ----
const GARLAND = (() => {
  const rand = seeded(5)
  let string = ''
  const flags: { d: string; c: number; delay: number }[] = []
  for (let sw = 0; sw < 4; sw++) {
    const x0 = sw * 200
    string += `M${x0} 3Q${x0 + 100} 50 ${x0 + 200} 3`
    for (let k = 1; k <= 6; k++) {
      const t = k / 7
      const x = x0 + 200 * t
      const y = (1 - t) ** 2 * 3 + 2 * (1 - t) * t * 50 + t * t * 3
      flags.push({
        d: `M${n1(x - 11)} ${n1(y)}h22l-11 27z`,
        c: (sw * 6 + k) % 6,
        delay: -n1(rand() * 2.6),
      })
    }
  }
  return { string, flags }
})()

// ---- Pista em perspectiva (viewBox 1600×360, esticada na largura) ----
type Pt = [number, number]
const quad = (p0: Pt, c: Pt, p1: Pt, t: number): Pt => [
  (1 - t) ** 2 * p0[0] + 2 * (1 - t) * t * c[0] + t * t * p1[0],
  (1 - t) ** 2 * p0[1] + 2 * (1 - t) * t * c[1] + t * t * p1[1],
]
const FAR: [Pt, Pt, Pt] = [
  [-40, 200],
  [600, 104],
  [1640, 96],
]
const NEAR: [Pt, Pt, Pt] = [
  [-40, 400],
  [700, 160],
  [1640, 128],
]
const far = (t: number) => quad(...FAR, t)
const near = (t: number) => quad(...NEAR, t)
// largura da pista no ponto t, usada como escala da perspectiva
const depth = (t: number) => (near(t)[1] - far(t)[1]) / 200
const pt = ([x, y]: Pt) => `${n1(x)} ${n1(y)}`
// passos mais largos perto (esquerda) e mais curtos ao fundo (direita)
const persp = (k: number, n: number) => 1 - (1 - k / n) ** 1.8

const TRACK = (() => {
  const band =
    `M${pt(FAR[0])}Q${pt(FAR[1])} ${pt(FAR[2])}` +
    `L${pt(NEAR[2])}Q${pt(NEAR[1])} ${pt(NEAR[0])}Z`
  const outer = `M${pt(NEAR[0])}Q${pt(NEAR[1])} ${pt(NEAR[2])}L1640 400Z`
  // faixas da grama cortada
  let stripes = ''
  const N = 18
  for (let k = 0; k < N; k += 2) {
    const a = persp(k, N)
    const b = persp(k + 1, N)
    stripes += `M${pt(far(a))}L${pt(far(b))}L${pt(near(b))}L${pt(near(a))}Z`
  }
  // cerca: trilho + mourões, encolhendo com a distância
  const rail = (edge: (t: number) => Pt) => {
    const top: string[] = []
    const bottom: string[] = []
    for (let i = 0; i <= 40; i++) {
      const t = i / 40
      const [x, y] = edge(t)
      const s = depth(t)
      top.push(pt([x, y - 22 * s]))
      bottom.unshift(pt([x, y - 16 * s]))
    }
    let posts = ''
    for (let j = 0; j <= 30; j++) {
      const t = persp(j, 30)
      const [x, y] = edge(t)
      const s = depth(t)
      posts += `M${n1(x - 2.4 * s)} ${n1(y - 22 * s)}h${n1(4.8 * s)}v${n1(22 * s)}h${n1(-4.8 * s)}z`
    }
    return { bar: `M${top.join('L')}L${bottom.join('L')}Z`, posts }
  }
  // linha de chegada atravessando a pista
  const fa = far(0.085)
  const fb = far(0.1)
  const na = near(0.085)
  const nb = near(0.1)
  const finish = `M${pt(fa)}L${pt(fb)}L${pt(nb)}L${pt(na)}Z`
  return { band, outer, stripes, far: rail(far), near: rail(near), finish }
})()

const TREES = (() => {
  const rand = seeded(77)
  let d = ''
  for (let x = -10; x < 1620; x += 26 + rand() * 22)
    d += circle(x, 74 - rand() * 8, 14 + rand() * 12)
  return d
})()

// ---- Arquibancada (lado direito, viewBox 200×740) ----
const STAND_ROWS = [522, 552, 582, 612, 642, 672]
const CROWD_COLORS = ['#ff8fc8', '#7fe3c8', '#9ecbff', '#ffc27a', '#c9a2ff']
const STAND = (() => {
  const rand = seeded(303)
  const heads: string[] = CROWD_COLORS.map(() => '')
  const lights: string[] = CROWD_COLORS.map(() => '')
  const spots: Pt[] = []
  STAND_ROWS.forEach((y, row) => {
    for (let x = 6 + (row % 2) * 6; x < 196; x += 12) {
      const c = Math.floor(rand() * CROWD_COLORS.length)
      const hy = y + 10 - rand() * 3
      heads[c] += circle(x, hy, 4.2)
      // lightstick de cada fã: um traço acima da cabeça
      if (rand() < 0.55)
        lights[c] += `M${n1(x)} ${n1(hy - 6)}l${n1(rand() * 6 - 3)} -11`
      if (rand() < 0.08) spots.push([x, hy - 2])
    }
  })
  return { heads, lights, flashes: spots.slice(0, 9) }
})()

// ---- Torres de refletores (12 lâmpadas) ----
const lampGrid = (x0: number, y0: number) => {
  let d = ''
  for (let r = 0; r < 3; r++)
    for (let c = 0; c < 4; c++)
      d += circle(x0 + 9 + c * 14, y0 + 10 + r * 14, 5)
  return d
}
const tower = (cx: number) => {
  const legs =
    `M${cx - 22} 560L${cx - 7} 96h5L${cx - 15} 560z` +
    `M${cx + 22} 560L${cx + 7} 96h-5L${cx + 15} 560z`
  let braces = ''
  for (let y = 120; y < 550; y += 36) {
    const w1 = 7 + ((y - 96) / 464) * 15
    const w2 = 7 + ((y + 36 - 96) / 464) * 15
    braces += `M${n1(cx - w1)} ${y}L${n1(cx + w2)} ${y + 36}M${n1(cx + w1)} ${y}L${n1(cx - w2)} ${y + 36}`
  }
  return {
    legs,
    braces,
    lamps: lampGrid(cx - 32, 44),
    box: `M${cx - 34} 40h68v48h-68z`,
  }
}
const TOWER_L = tower(38)
const TOWER_R = tower(162)

// ---- Bandeira quadriculada do poste de chegada ----
const CHECKER = (() => {
  let d = ''
  for (let r = 0; r < 4; r++)
    for (let c = 0; c < 7; c++)
      if ((r + c) % 2 === 0)
        d += `M${88 + c * 8.3} ${318 + r * 11}h8.3v11h-8.3z`
  return d
})()
// estrela de 5 pontas
const star = (cx: number, cy: number, R: number, r: number) =>
  Array.from({ length: 10 }, (_, i) => {
    const a = (Math.PI / 5) * i - Math.PI / 2
    const rr = i % 2 ? r : R
    return `${i ? 'L' : 'M'}${n1(cx + Math.cos(a) * rr)} ${n1(cy + Math.sin(a) * rr)}`
  }).join('') + 'Z'
// listras do poste (como um poste de barbeiro em rosa)
const POLE_STRIPES = Array.from(
  { length: 12 },
  (_, i) => `M146 ${312 + i * 21}l8 -7v9l-8 7z`,
).join('')

// ---- Fogos de artifício ----
const burst = (n: number, r0: number, r1: number, off = 0) =>
  Array.from({ length: n }, (_, i) => {
    const a = ((i + off) / n) * Math.PI * 2
    const c = Math.cos(a)
    const s = Math.sin(a)
    return `M${n1(50 + c * r0)} ${n1(50 + s * r0)}L${n1(50 + c * r1)} ${n1(50 + s * r1)}`
  }).join('')
const BURST_RAYS = burst(14, 10, 40)
const BURST_DOTS = burst(14, 44, 45, 0.5)
// no alto, entre o título e o varal, e nas faixas laterais
const FIREWORKS = [
  { x: 21, y: -4, size: 15, a: '#ff8fc8', b: '#fff3a8', dur: 2.9, delay: -0.4 },
  { x: 74, y: -3, size: 13, a: '#7fe3c8', b: '#ffffff', dur: 3.4, delay: -1.9 },
  {
    x: 0.5,
    y: 11,
    size: 14,
    a: '#ffd36b',
    b: '#ff8fc8',
    dur: 3.1,
    delay: -1.2,
  },
  { x: 90, y: 20, size: 15, a: '#c9a2ff', b: '#7fe3c8', dur: 3.6, delay: -2.6 },
  { x: 2, y: 38, size: 11, a: '#ff6fae', b: '#ffd36b', dur: 3.3, delay: -0.8 },
  { x: 93, y: 45, size: 10, a: '#9ecbff', b: '#ffffff', dur: 2.7, delay: -2.1 },
]

// ---- Confete caindo nas laterais e canhões de confete nos cantos ----
const CONFETTI = (() => {
  const rand = seeded(91)
  return Array.from({ length: 14 }, (_, i) => {
    // metade na faixa da esquerda, metade na da direita
    const left = i % 2 ? 91 + rand() * 8 : 0.5 + rand() * 8
    return vars({
      left: `${n1(left)}vw`,
      '--c': `var(--um-c${i % 6})`,
      '--sway': `${n1(rand() * 8 - 4)}vw`,
      '--spin': `${Math.round(360 + rand() * 540)}deg`,
      animationDuration: `${n1(8 + rand() * 7)}s`,
      animationDelay: `${-n1(rand() * 15)}s`,
    })
  })
})()
const cannon = (seed: number, dir: 1 | -1) => {
  const rand = seeded(seed)
  return Array.from({ length: 9 }, (_, i) =>
    vars({
      '--c': `var(--um-c${i % 6})`,
      '--dx': `${n1(dir * (4 + rand() * 16))}vw`,
      '--dy': `${-n1(28 + rand() * 30)}vh`,
      '--spin': `${Math.round(dir * (200 + rand() * 500))}deg`,
    }),
  )
}
const CANNON_L = cannon(17, 1)
const CANNON_R = cannon(29, -1)

// corações, ferraduras e estrelas subindo pelas laterais
const FLOATERS = (() => {
  const rand = seeded(55)
  const kinds = ['heart', 'shoe', 'star']
  return Array.from({ length: 8 }, (_, i) => ({
    kind: kinds[i % 3],
    style: vars({
      left: `${n1(i % 2 ? 92 + rand() * 6 : 1 + rand() * 6)}vw`,
      animationDuration: `${n1(14 + rand() * 10)}s`,
      animationDelay: `${-n1(rand() * 24)}s`,
    }),
  }))
})()

const BIRD = 'M0 6q6 -7 12 0q6 -7 12 0'
const FLOCKS = [
  {
    top: 13,
    dur: 38,
    delay: -6,
    birds: [
      [0, 0],
      [30, 12],
      [56, 4],
      [22, -14],
    ],
  },
  {
    top: 27,
    dur: 52,
    delay: -30,
    birds: [
      [0, 0],
      [26, 9],
      [48, -6],
    ],
  },
]

export default function UmaMusumeScene() {
  return (
    <div className="um-scene">
      {/* céu: camadas que cruzam a opacidade ao longo do ciclo */}
      <div className="um-sky um-sky-gold" />
      <div className="um-sky um-sky-sunset" />
      <div className="um-sky um-sky-night" />
      <div className="um-sky um-sky-dawn" />
      <div className="um-sky um-sky-rain" />

      <div className="um-rainbow" />

      {/* sol (com raios e reflexo de lente) girando num arco pelo céu */}
      <div className="um-orbit um-sun-orbit">
        <div className="um-sun">
          <div className="um-sun-rays" />
          <div className="um-sun-disc" />
          <div className="um-flare">
            <i />
            <i />
            <i />
            <i />
          </div>
        </div>
      </div>

      <div className="um-clouds um-clouds-far">
        <svg viewBox="0 0 3200 220" preserveAspectRatio="none">
          <path className="um-cloud-shade" d={CLOUDS.far.shade} />
          <path className="um-cloud-light" d={CLOUDS.far.light} />
        </svg>
      </div>
      <div className="um-clouds um-clouds-near">
        <svg viewBox="0 0 3200 220" preserveAspectRatio="none">
          <path className="um-cloud-shade" d={CLOUDS.near.shade} />
          <path className="um-cloud-light" d={CLOUDS.near.light} />
        </svg>
      </div>
      <div className="um-clouds um-clouds-rain">
        <svg viewBox="0 0 3200 220" preserveAspectRatio="none">
          <path className="um-cloud-shade" d={CLOUDS.rain.shade} />
          <path className="um-cloud-light" d={CLOUDS.rain.light} />
        </svg>
      </div>

      {/* passarinhos de dia */}
      <div className="um-birds">
        {FLOCKS.map((flock, i) => (
          <div
            key={i}
            className="um-flock"
            style={vars({
              top: `${flock.top}vh`,
              animationDuration: `${flock.dur}s`,
              animationDelay: `${flock.delay}s`,
            })}
          >
            <svg viewBox="-10 -24 100 50">
              {/* o <g> posiciona; o CSS bate as asas no <path> */}
              {flock.birds.map(([x, y], j) => (
                <g key={j} transform={`translate(${x} ${y})`}>
                  <path
                    className="um-bird"
                    d={BIRD}
                    style={{ animationDelay: `${-j * 0.17}s` }}
                  />
                </g>
              ))}
            </svg>
          </div>
        ))}
      </div>

      {/* pista de grama com cerca branca e linha de chegada */}
      <svg
        className="um-track"
        viewBox="0 0 1600 360"
        preserveAspectRatio="none"
      >
        <path
          className="um-hills"
          d="M0 76Q120 40 260 66T560 60T880 70T1200 54T1600 66V360H0Z"
        />
        <path className="um-trees" d={TREES} />
        <path className="um-field" d="M0 84Q800 70 1600 82V360H0Z" />
        <path className="um-outer" d={TRACK.outer} />
        <path className="um-turf" d={TRACK.band} />
        <path className="um-turf-stripes" d={TRACK.stripes} />
        <path className="um-finish-line" d={TRACK.finish} />
        <path className="um-rail-post" d={TRACK.far.posts} />
        <path className="um-rail" d={TRACK.far.bar} />
        <path className="um-rail-post" d={TRACK.near.posts} />
        <path className="um-rail" d={TRACK.near.bar} />
      </svg>
      <div className="um-wet" />
      <div className="um-fog" />

      {/* lateral esquerda: torre de refletores + poste de chegada */}
      <svg className="um-side um-side-l" viewBox="0 0 200 740">
        <path className="um-tower" d={TOWER_L.legs} />
        <path className="um-tower-brace" d={TOWER_L.braces} />
        <path className="um-tower-box" d={TOWER_L.box} />
        <path className="um-tower-lamp" d={TOWER_L.lamps} />
        <ellipse className="um-shadow" cx="150" cy="562" rx="22" ry="5" />
        <path className="um-pole" d="M146 300h8v262h-8z" />
        <path className="um-pole-stripe" d={POLE_STRIPES} />
        <g className="um-checker">
          <path className="um-checker-white" d="M88 318h58v44h-58z" />
          <path className="um-checker-dark" d={CHECKER} />
        </g>
        <circle className="um-goal-disc" cx="150" cy="268" r="32" />
        <path className="um-goal-star" d={star(150, 269, 19, 8)} />
        <path className="um-pole-cap" d={circle(150, 230, 6)} />
      </svg>

      {/* lateral direita: torre de refletores + arquibancada com toldo */}
      <svg className="um-side um-side-r" viewBox="0 0 200 740">
        <path className="um-tower" d={TOWER_R.legs} />
        <path className="um-tower-brace" d={TOWER_R.braces} />
        <path className="um-tower-box" d={TOWER_R.box} />
        <path className="um-tower-lamp" d={TOWER_R.lamps} />
        <path className="um-stand" d="M0 500H200V740H0Z" />
        <path
          className="um-stand-rows"
          d={STAND_ROWS.map((y) => `M0 ${y + 16}h200v6h-200z`).join('')}
        />
        {STAND.heads.map((d, i) => (
          <path key={i} d={d} style={{ fill: CROWD_COLORS[i] }} />
        ))}
        <path className="um-stand-wall" d="M0 694H200V740H0Z" />
        <path className="um-stand-wall-stripe" d="M0 704H200V712H0Z" />
        <path className="um-awning" d="M-4 470H204V500H-4Z" />
        <path
          className="um-awning-stripe"
          d={Array.from(
            { length: 9 },
            (_, i) => `M${i * 26} 470h13v30h-13z`,
          ).join('')}
        />
        <path
          className="um-awning-scallop"
          d={Array.from({ length: 16 }, (_, i) =>
            circle(i * 13 + 6.5, 500, 6.5),
          ).join('')}
        />
        <path
          className="um-stand-post"
          d="M8 506h5v188h-5zM100 506h5v188h-5zM188 506h5v188h-5z"
        />
      </svg>

      {/* tom da luz do ambiente (pôr do sol / noite) sobre a cena */}
      <div className="um-tint um-tint-warm" />
      <div className="um-tint um-tint-night" />

      {/* noite: estrelas, lua e estrela cadente */}
      <div className="um-stars" />
      <div className="um-orbit um-moon-orbit">
        <svg className="um-moon" viewBox="0 0 100 100">
          <path d="M58 8A42 42 0 1 0 94 70A34 34 0 1 1 58 8Z" />
        </svg>
      </div>
      <div className="um-shooting" />

      {/* holofotes de palco varrendo o céu à noite */}
      <div className="um-spot um-spot-1" />
      <div className="um-spot um-spot-2" />
      <div className="um-spot um-spot-3" />
      <div className="um-spot um-spot-4" />

      {/* luzes das laterais (por cima do tom da noite) */}
      <svg className="um-side um-lights um-lights-l" viewBox="0 0 200 740">
        <defs>
          <linearGradient
            id="um-beam-l"
            gradientUnits="userSpaceOnUse"
            x1="38"
            y1="64"
            x2="520"
            y2="700"
          >
            <stop offset="0" stopColor="#fffbe6" stopOpacity="0.75" />
            <stop offset="1" stopColor="#fffbe6" stopOpacity="0" />
          </linearGradient>
          <radialGradient id="um-glow">
            <stop offset="0" stopColor="#ffffff" />
            <stop offset="0.35" stopColor="#fff6c8" stopOpacity="0.8" />
            <stop offset="1" stopColor="#fff6c8" stopOpacity="0" />
          </radialGradient>
        </defs>
        <path
          className="um-beam"
          d="M18 70L60 58L640 640L120 740Z"
          fill="url(#um-beam-l)"
        />
        <circle
          className="um-lamp-glow"
          cx="38"
          cy="64"
          r="58"
          fill="url(#um-glow)"
        />
        <path className="um-lamp-on" d={TOWER_L.lamps} />
        <circle
          className="um-disc-glow"
          cx="150"
          cy="268"
          r="46"
          fill="url(#um-glow)"
        />
      </svg>
      <svg className="um-side um-lights um-lights-r" viewBox="0 0 200 740">
        <defs>
          <linearGradient
            id="um-beam-r"
            gradientUnits="userSpaceOnUse"
            x1="162"
            y1="64"
            x2="-320"
            y2="700"
          >
            <stop offset="0" stopColor="#fffbe6" stopOpacity="0.75" />
            <stop offset="1" stopColor="#fffbe6" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          className="um-beam"
          d="M182 70L140 58L-440 640L80 740Z"
          fill="url(#um-beam-r)"
        />
        <circle
          className="um-lamp-glow"
          cx="162"
          cy="64"
          r="58"
          fill="url(#um-glow)"
        />
        <path className="um-lamp-on" d={TOWER_R.lamps} />
        <g className="um-penlights">
          {STAND.lights.map((d, i) => (
            <path key={i} d={d} style={{ stroke: CROWD_COLORS[i] }} />
          ))}
        </g>
        {STAND.flashes.map(([x, y], i) => (
          <circle
            key={i}
            className="um-camera"
            cx={x}
            cy={y}
            r="7"
            fill="url(#um-glow)"
            style={{
              animationDuration: `${(2.3 + ((i * 1.37) % 3.4)).toFixed(2)}s`,
              animationDelay: `${(-i * 0.83).toFixed(2)}s`,
            }}
          />
        ))}
      </svg>

      {/* fogos de artifício à noite (no alto e nas laterais) */}
      <div className="um-fireworks">
        {FIREWORKS.map((fw, i) => (
          <svg
            key={i}
            className="um-firework"
            viewBox="0 0 100 100"
            style={vars({
              left: `${fw.x}vw`,
              top: `${fw.y}vh`,
              width: `${fw.size}vh`,
              animationDuration: `${fw.dur}s`,
              animationDelay: `${fw.delay}s`,
            })}
          >
            <path d={BURST_RAYS} style={{ stroke: fw.a }} />
            <path d={BURST_DOTS} style={{ stroke: fw.b }} />
          </svg>
        ))}
      </div>

      {/* chuva rápida, respingos e relâmpago */}
      <div className="um-rain">
        <div className="um-rain-a" />
        <div className="um-rain-b" />
        <div className="um-splash" />
      </div>
      <div className="um-flash" />

      {/* brilhos, confete e corações */}
      <div className="um-sparkles" />
      <div className="um-garland">
        <svg viewBox="0 0 800 64">
          <path className="um-garland-string" d={GARLAND.string} />
          {GARLAND.flags.map((flag, i) => (
            <path
              key={i}
              className={`um-flag um-f${flag.c}`}
              d={flag.d}
              style={{ animationDelay: `${flag.delay}s` }}
            />
          ))}
        </svg>
      </div>
      <div className="um-confetti">
        {CONFETTI.map((style, i) => (
          <i key={i} style={style} />
        ))}
      </div>
      <div className="um-cannon um-cannon-l">
        {CANNON_L.map((style, i) => (
          <i key={i} style={style} />
        ))}
      </div>
      <div className="um-cannon um-cannon-r">
        {CANNON_R.map((style, i) => (
          <i key={i} style={style} />
        ))}
      </div>
      <div className="um-floaters">
        {FLOATERS.map((f, i) => (
          <i key={i} className={`um-${f.kind}`} style={f.style} />
        ))}
      </div>
    </div>
  )
}
