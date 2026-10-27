import type { CSSProperties, ReactNode } from 'react'

// Cena de fundo do tema Mirai Funk (só aparece com data-theme="mirai-funk").
// Pôster duotone vivo: céu verde-água claro, cidade preta com grades de
// janelinhas, reflexo listrado no chão verde-escuro e poeira de estrelas.
//
// Ciclo de --mf-cycle (4 min, ver theme.css): dia com flare gráfico → sol
// se pondo atrás da cidade → entardecer verde-água profundo com as janelas
// acendendo uma a uma → noite quase preta, lua, estrelas cintilando, estrela
// cadente, avião, garoa em traços chapados → amanhecer. Um trem passa pela
// via elevada duas vezes por ciclo (dia e noite).
//
// Sorteios com semente fixa (iguais no servidor e no navegador), formas
// iguais agrupadas num <path> por cor e janelas desenhadas com <pattern>.
// Cada camada animada é um <svg>/<div> próprio, para a opacidade e o
// movimento rodarem na GPU sem repintar a cidade.

const seeded = (seed: number) => () => {
  seed = (seed + 0x6d2b79f5) | 0
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}
const rect = (x: number, y: number, w: number, h: number) =>
  `M${x} ${y}h${w}v${h}h${-w}z`
const n = (v: number) => +v.toFixed(1)
// atraso no ciclo (fração), lido pelo CSS em --mf-k
const phase = (k: number) => ({ '--mf-k': k.toFixed(3) }) as CSSProperties

// ---- Cidade ----
// Grade de 8 x 10 unidades: prédios e janelas alinhados a ela, assim o
// padrão de janelas nunca fica cortado na beira de um prédio.
const CITY_W = 2400
const CITY_H = 360
const PX = 8
const PY = 10
const RAIL_Y = CITY_H - 34

// Ladrilhos de janelas: de dia (verde-água refletindo o céu) e de noite
// (acesas em branco-água), cada um com o seu sorteio
const TILES = [
  { cols: 6, rows: 6 },
  { cols: 7, rows: 7 },
  { cols: 5, rows: 8 },
]
const tile = (cols: number, rows: number, seed: number, on: number) => {
  const rand = seeded(seed)
  let lit = ''
  let dim = ''
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++) {
      const v = rand()
      const w = rect(c * PX + 2, r * PY + 3, 4, 5)
      if (v < on) lit += w
      else if (v < on + 0.3) dim += w
    }
  return { lit, dim }
}
const NIGHT_GROUPS = 8
// quanto cada grupo de janelas se adianta no ciclo (acendem fora de ordem)
const STAGGER = [0, 0.034, 0.012, 0.051, 0.022, 0.06, 0.006, 0.043]

const skyline = () => {
  const rand = seeded(1986)
  let front = ''
  let far = ''
  let antenna = ''
  const day: string[] = TILES.map(() => '')
  const night: string[] = Array.from({ length: NIGHT_GROUPS }, () => '')
  const nightTile: number[] = Array.from(
    { length: NIGHT_GROUPS },
    (_, i) => i % 3,
  )
  let blink = ''
  // fundo: blocos baixos e largos em verde-escuro
  for (let x = -PX * 2; x < CITY_W; ) {
    const w = PX * (8 + Math.floor(rand() * 14))
    const h = PY * (12 + Math.floor(rand() * 16))
    far += rect(x, CITY_H - h, w, h)
    x += w
  }
  // frente: prédios pretos de alturas variadas, alguns com recuo no topo
  for (let x = -PX; x < CITY_W; ) {
    const w = PX * (5 + Math.floor(rand() * 11))
    const tall = rand() < 0.18
    const h =
      PY * (tall ? 22 + Math.floor(rand() * 10) : 7 + Math.floor(rand() * 15))
    const top = CITY_H - h
    front += rect(x, top, w, h)
    if (w >= PX * 9 && rand() < 0.45) {
      const sw = PX * Math.max(3, Math.floor(w / PX / 2) - 1)
      const sh = PY * (2 + Math.floor(rand() * 3))
      const sx = x + PX * Math.floor((w - sw) / PX / 2)
      front += rect(sx, top - sh, sw, sh)
      if (rand() < 0.6) {
        antenna += rect(sx + sw / 2 - 1, top - sh - 26, 2, 26)
        blink += rect(sx + sw / 2 - 2, top - sh - 30, 4, 4)
      }
    } else if (rand() < 0.22) {
      antenna += rect(x + PX * 2, top - 18, 2, 18)
    }
    // janelas: área interna do prédio (acima da via do trem)
    const bottom = Math.min(CITY_H - PY, RAIL_Y - 6)
    const area =
      w >= PX * 4 && bottom - top > PY * 3
        ? rect(x + PX, top + PY, w - PX * 2, bottom - top - PY)
        : ''
    const kind = Math.floor(rand() * 7) % 4
    if (area && kind < 3) {
      day[kind] += area
      night[Math.floor(rand() * NIGHT_GROUPS)] += area
    }
    x += w + (rand() < 0.3 ? PX : 0)
  }
  // via elevada: viga e pilares
  let rail = rect(0, RAIL_Y + 8, CITY_W, 5)
  for (let x = 30; x < CITY_W; x += 120) rail += rect(x, RAIL_Y + 13, 6, 21)
  return { front, far, antenna, day, night, nightTile, blink, rail }
}
const CITY = skyline()

// Trem: carros pretos com janelas acesas (só as janelas aparecem de noite)
const train = () => {
  let body = ''
  let windows = ''
  for (let c = 0; c < 6; c++) {
    // no meio da cidade: o CSS desliza a camada inteira de -100% a +100%
    const x = 1000 + c * 66
    body += rect(x, RAIL_Y - 8, 62, 16)
    for (let wx = x + 6; wx < x + 56; wx += 9)
      windows += rect(wx, RAIL_Y - 4, 5, 5)
  }
  return { body, windows }
}
const TRAIN = train()

// ---- Estrelas e chuva ----
// Tela de 1600 x 900 (cobre a página). Poeira fina no chão escuro, poucas
// estrelas no céu de dia e um céu cheio só de noite.
const sparkle = (x: number, y: number, s: number) =>
  `M${n(x)} ${n(y - s)}Q${n(x)} ${n(y)} ${n(x + s)} ${n(y)}Q${n(x)} ${n(y)} ${n(x)} ${n(y + s)}Q${n(x)} ${n(y)} ${n(x - s)} ${n(y)}Q${n(x)} ${n(y)} ${n(x)} ${n(y - s)}Z`
const dot = (x: number, y: number, r: number) =>
  `M${n(x - r)} ${n(y)}a${n(r)} ${n(r)} 0 1 0 ${n(r * 2)} 0a${n(r)} ${n(r)} 0 1 0 ${n(-r * 2)} 0`

const starfield = () => {
  const rand = seeded(7)
  let dust = ''
  let glints = ''
  let sky = ''
  let night = ''
  let twinkleA = ''
  let twinkleB = ''
  for (let i = 0; i < 160; i++)
    dust += dot(rand() * 1600, 545 + rand() * 355, 0.6 + rand() * 1.3)
  for (let i = 0; i < 18; i++)
    glints += sparkle(rand() * 1600, 560 + rand() * 330, 4 + rand() * 7)
  for (let i = 0; i < 30; i++) {
    const x = rand() * 1600
    const y = 20 + rand() * 300
    sky += i % 5 ? dot(x, y, 0.8 + rand()) : sparkle(x, y, 3 + rand() * 4)
  }
  for (let i = 0; i < 110; i++)
    night += dot(rand() * 1600, rand() * 470, 0.5 + rand() * 1.1)
  for (let i = 0; i < 26; i++) {
    const s = sparkle(rand() * 1600, 10 + rand() * 450, 3 + rand() * 6)
    if (i % 2) twinkleA += s
    else twinkleB += s
  }
  return { dust, glints, sky, night, twinkleA, twinkleB }
}
const STARS = starfield()

// Garoa: traços retos e chapados, repetidos duas vezes na vertical para o
// laço de queda não ter emenda
const rain = () => {
  const rand = seeded(404)
  let d = ''
  for (let i = 0; i < 90; i++) {
    const x = n(rand() * 1600)
    const y = n(rand() * 900)
    const len = n(24 + rand() * 40)
    d += `M${x} ${y}v${len}M${x} ${n(y + 900)}v${len}`
  }
  return d
}
const RAIN = rain()

// Flare gráfico: raios finos, anéis e "fantasmas" chapados
const flareRays = () => {
  let d = ''
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2
    const r = i % 2 ? 230 : 300
    const s = 0.035
    d += `M300 300L${n(300 + Math.cos(a - s) * r)} ${n(300 + Math.sin(a - s) * r)}L${n(300 + Math.cos(a + s) * r)} ${n(300 + Math.sin(a + s) * r)}Z`
  }
  return d
}
const FLARE_RAYS = flareRays()

const CityLayer = ({
  className,
  style,
  children,
}: {
  className: string
  style?: CSSProperties
  children: ReactNode
}) => (
  <svg
    className={`mf-city ${className}`}
    style={style}
    viewBox={`0 0 ${CITY_W} ${CITY_H}`}
    preserveAspectRatio="xMidYMax slice"
    shapeRendering="crispEdges"
  >
    {children}
  </svg>
)

export default function MiraiFunkScene() {
  return (
    <>
      {/* paletas duotone do entardecer e da noite, por cima da do dia */}
      <div className="mf-sky mf-sky-dusk mf-cyc" />
      <div className="mf-sky mf-sky-night mf-cyc" />

      {/* faixas finas do pôster e tipografia de fundo (no cabeçalho) */}
      <div className="mf-rules" />
      <div className="mf-type">
        <span className="mf-type-jp">未来のファンク</span>
        <span className="mf-type-thin">mirai no fanku · roleta do futuro</span>
      </div>

      <svg
        className="mf-stars"
        viewBox="0 0 1600 900"
        preserveAspectRatio="xMidYMid slice"
      >
        <path className="mf-star-sky" d={STARS.sky} />
        <path className="mf-star-dust" d={STARS.dust} />
        <path className="mf-star-glint" d={STARS.glints} />
      </svg>
      <div className="mf-night-stars mf-cyc">
        <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice">
          <path d={STARS.night} />
        </svg>
        <svg
          className="mf-twinkle"
          viewBox="0 0 1600 900"
          preserveAspectRatio="xMidYMid slice"
        >
          <path d={STARS.twinkleA} />
        </svg>
        <svg
          className="mf-twinkle mf-twinkle-b"
          viewBox="0 0 1600 900"
          preserveAspectRatio="xMidYMid slice"
        >
          <path d={STARS.twinkleB} />
        </svg>
      </div>
      <div className="mf-shooting mf-shooting-1">
        <i className="mf-cyc" />
      </div>
      <div className="mf-shooting mf-shooting-2">
        <i className="mf-cyc" style={phase(0.86)} />
      </div>

      {/* sol chapado com flare gráfico; lua crescente à noite */}
      <div className="mf-sunbox">
        <div className="mf-sun mf-cyc" />
        <div className="mf-moon mf-cyc" />
      </div>
      <div className="mf-flare mf-cyc">
        <svg className="mf-flare-rays" viewBox="0 0 600 600">
          <path d={FLARE_RAYS} />
        </svg>
        <svg className="mf-flare-ghosts" viewBox="0 0 600 600">
          <circle className="mf-flare-ring" cx="300" cy="300" r="118" />
          <circle className="mf-flare-ring" cx="300" cy="300" r="150" />
          <circle cx="214" cy="392" r="22" />
          <circle cx="168" cy="444" r="10" />
          <path d="M120 498l14-24h28l14 24-14 24h-28z" />
        </svg>
      </div>
      <div className="mf-plane mf-cyc">
        <i />
      </div>

      {/* cidade: fundo, frente com janelas de dia, janelas de noite em
          grupos que acendem cada um no seu tempo, luzes de antena e trem */}
      <CityLayer className="mf-city-far mf-cyc">
        <path d={CITY.far} />
      </CityLayer>
      <CityLayer className="mf-city-front">
        <defs>
          {TILES.map(({ cols, rows }, i) => {
            const dayTile = tile(cols, rows, 11 + i * 12, 0.42)
            const nightTile = tile(cols, rows, 101 + i * 7, 0.34)
            const box = {
              width: cols * PX,
              height: rows * PY,
              patternUnits: 'userSpaceOnUse',
              y: CITY_H % (rows * PY),
            }
            return [
              <pattern key={`d${i}`} id={`mf-win-day-${i}`} {...box}>
                <path className="mf-win-dim" d={dayTile.dim} />
                <path className="mf-win-lit" d={dayTile.lit} />
              </pattern>,
              <pattern key={`n${i}`} id={`mf-win-night-${i}`} {...box}>
                <path className="mf-win-on" d={nightTile.lit} />
              </pattern>,
            ]
          })}
        </defs>
        <path
          className="mf-city-black"
          d={CITY.front + CITY.antenna + CITY.rail}
        />
      </CityLayer>
      <CityLayer className="mf-city-daywin mf-cyc">
        {CITY.day.map((d, i) => (
          <path key={i} d={d} fill={`url(#mf-win-day-${i})`} />
        ))}
      </CityLayer>
      {CITY.night.map((d, i) => (
        <CityLayer
          key={i}
          className={['mf-city-nightwin', 'mf-cyc', i % 3 === 1 && 'mf-flicker']
            .filter(Boolean)
            .join(' ')}
          style={phase(STAGGER[i])}
        >
          <path d={d} fill={`url(#mf-win-night-${CITY.nightTile[i]})`} />
        </CityLayer>
      ))}
      <div className="mf-beacons mf-cyc">
        <CityLayer className="mf-beacon-blink">
          <path d={CITY.blink} />
        </CityLayer>
      </div>
      <div className="mf-train-track">
        <CityLayer className="mf-train mf-cyc">
          <path className="mf-train-body" d={TRAIN.body} />
          <path className="mf-train-win" d={TRAIN.windows} />
        </CityLayer>
      </div>

      {/* reflexo da cidade no chão escuro, em faixas horizontais */}
      <svg
        className="mf-reflection mf-cyc"
        viewBox={`0 0 ${CITY_W} ${CITY_H}`}
        preserveAspectRatio="xMidYMin slice"
        shapeRendering="crispEdges"
      >
        <path d={CITY.front} transform={`matrix(1 0 0 -1 0 ${CITY_H})`} />
      </svg>
      <div className="mf-ground" />

      {/* garoa em traços diagonais chapados, com clarão de relâmpago */}
      <div className="mf-rain mf-cyc">
        <div className="mf-rain-fall">
          <svg viewBox="0 0 1600 1800" preserveAspectRatio="none">
            <path d={RAIN} />
          </svg>
        </div>
      </div>
      <div className="mf-flash mf-cyc" />
    </>
  )
}
