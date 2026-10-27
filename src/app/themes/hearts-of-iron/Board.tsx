import type { CSSProperties, ReactNode } from 'react'
import { CITIES, LAT, LON, MH, MW, PROVINCE_LIST, arrow, r1 } from './map'
import { block, Kind, mapUrl, PINS, symbol } from './mapArt'

// Tabuleiro: a carta estática (imagem SVG desenhada uma vez, mapArt.ts) e,
// por cima, cada peça que se mexe num <svg> ou <div> próprio, posicionado
// em % do tabuleiro (nada animado dentro de um <svg>).

type Box = [number, number, number, number]
const place = ([x, y, w, h]: Box): CSSProperties => ({
  left: `${r1((x / MW) * 100 * 100) / 100}%`,
  top: `${r1((y / MH) * 100 * 100) / 100}%`,
  width: `${r1((w / MW) * 100 * 100) / 100}%`,
  height: `${r1((h / MH) * 100 * 100) / 100}%`,
})
const vars = (v: Record<string, string | number>) => v as CSSProperties

// recorte da carta com viewBox nas coordenadas do mapa
function Patch({
  box,
  className,
  style,
  children,
}: {
  box: Box
  className: string
  style?: CSSProperties
  children: ReactNode
}) {
  return (
    <svg
      className={className}
      viewBox={box.join(' ')}
      style={{ ...place(box), ...style }}
      aria-hidden="true"
    >
      {children}
    </svg>
  )
}

// seta revelada aos pedaços: janela (overflow hidden) desliza num sentido e
// o conteúdo no oposto, então a seta parece "desenhada" trecho a trecho
function Wipe({
  box,
  dir,
  lag,
  className,
  children,
}: {
  box: Box
  dir: 'r' | 'l' | 'u'
  lag: number
  className: string
  children: ReactNode
}) {
  const [wx, wy] =
    dir === 'r'
      ? ['-100%', '0%']
      : dir === 'l'
        ? ['100%', '0%']
        : ['0%', '100%']
  return (
    <div
      className={`hoi-wipe ${className}`}
      style={{
        ...place(box),
        ...vars({ '--hoi-wx': wx, '--hoi-wy': wy, '--hoi-lag': lag }),
      }}
    >
      <div className="hoi-wipe-o">
        <div className="hoi-wipe-i">
          <svg viewBox={box.join(' ')} aria-hidden="true">
            {children}
          </svg>
        </div>
      </div>
    </div>
  )
}

// ---- setas de ofensiva (vermelhas cercando, azuis rompendo o cerco) ----
const ARROWS: {
  id: string
  side: 'red' | 'blue'
  box: Box
  dir: 'r' | 'l' | 'u'
  lag: number
  a: ReturnType<typeof arrow>
}[] = [
  {
    id: 'a1',
    side: 'red',
    box: [548, 20, 330, 60],
    dir: 'r',
    lag: 0,
    a: arrow([556, 46], [700, 30], [866, 56], 22),
  },
  {
    id: 'a2',
    side: 'red',
    box: [1112, 18, 380, 62],
    dir: 'l',
    lag: -0.03,
    a: arrow([1484, 40], [1300, 26], [1122, 58], 22),
  },
  {
    id: 'a3',
    side: 'blue',
    box: [952, 20, 80, 150],
    dir: 'u',
    lag: -0.5,
    a: arrow([990, 160], [1004, 96], [990, 30], 20),
  },
  {
    id: 'a4',
    side: 'red',
    box: [96, 250, 150, 200],
    dir: 'r',
    lag: -0.06,
    a: arrow([104, 262], [126, 380], [236, 440], 24),
  },
  {
    id: 'a5',
    side: 'blue',
    box: [1300, 360, 200, 150],
    dir: 'r',
    lag: -0.56,
    a: arrow([1306, 494], [1380, 470], [1490, 380], 22),
  },
]

// blocos que se mexem: [id, x, y, cor, tipo]
const MOVERS: [string, number, number, 'red' | 'blue', Kind][] = [
  ['m1', 640, 52, 'red', 'arm'],
  ['m2', 1420, 30, 'red', 'arm'],
  ['m3', 1000, 66, 'blue', 'inf'],
  ['m4', 1206, 36, 'red', 'arm'],
]

// clarões de combate na frente (só de noite ou com a roleta girando)
const FLASHES: [number, number][] = [
  [720, 70],
  [1040, 74],
  [1330, 66],
  [868, 46],
  [214, 470],
  [1396, 520],
]

export default function Board({ glow = false }: { glow?: boolean }) {
  // segunda camada, por cima da escuridão da noite: só o que emite luz
  if (glow)
    return (
      <div className="hoi-plane hoi-plane-glow">
        <div className="hoi-board">
          <div className="hoi-citylights">
            <Patch box={[0, 0, MW, MH]} className="hoi-lights">
              <path
                className="hoi-light-halo"
                d={CITIES.map(
                  (c) => `M${c.x - 9} ${c.y}a9 9 0 1 0 18 0a9 9 0 1 0 -18 0`,
                ).join('')}
              />
              <path
                className="hoi-light-core"
                d={CITIES.map(
                  (c) => `M${c.x - 2} ${c.y}a2 2 0 1 0 4 0a2 2 0 1 0 -4 0`,
                ).join('')}
              />
            </Patch>
          </div>
          <div className="hoi-battle">
            {FLASHES.map(([x, y], i) => (
              <span
                key={i}
                className="hoi-flash"
                style={{
                  left: `${(x / MW) * 100}%`,
                  top: `${(y / MH) * 100}%`,
                  ...vars({ '--hoi-i': i }),
                }}
              />
            ))}
          </div>
          {/* contorno da frente aceso durante a vitória */}
          <Patch box={[520, 30, 1000, 110]} className="hoi-surge">
            <path
              d={PROVINCE_LIST.filter((p) => p.id[0] === 't' && p.id !== 't7')
                .map((p) => p.line)
                .join('')}
            />
          </Patch>
        </div>
      </div>
    )

  return (
    <div className="hoi-plane">
      <div className="hoi-board">
        {/* carta estática: imagem desenhada uma vez (ver mapArt.ts) */}
        <div
          className="hoi-map"
          style={{ backgroundImage: `url(${mapUrl()})` }}
        />
        {/* textos da carta (fontes da página) e hachuras das províncias */}
        <svg
          className="hoi-map hoi-labels"
          viewBox={`0 0 ${MW} ${MH}`}
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <defs>
            <pattern
              id="hoi-hatch"
              width="7"
              height="7"
              patternUnits="userSpaceOnUse"
              patternTransform="rotate(40)"
            >
              <path d="M0 0V7" className="hoi-hatch-line" />
            </pattern>
            <pattern
              id="hoi-hatch-blue"
              width="6"
              height="6"
              patternUnits="userSpaceOnUse"
              patternTransform="rotate(-40)"
            >
              <path d="M0 0V6" className="hoi-hatch-blue" />
            </pattern>
          </defs>
          <text className="hoi-sea-name" x="150" y="168">
            M A R · D E · F E R R O
          </text>
          <text className="hoi-note" x="1034" y="22">
            obj. 1
          </text>
          <text className="hoi-note" x="790" y="98">
            ponte!
          </text>
          <g className="hoi-city-names">
            {CITIES.map((c) => (
              <text
                key={c.name}
                x={c.x + c.dx}
                y={c.y + c.dy}
                textAnchor={c.anchor}
                className={c.size === 3 ? 'hoi-city-3' : undefined}
              >
                {c.name}
              </text>
            ))}
          </g>
          <g className="hoi-coords">
            {LON.map(({ x, label }) => (
              <text key={x} x={x + 4} y="40">
                {label}
              </text>
            ))}
            {LAT.map(({ y, label }) => (
              <text key={y} x="112" y={y - 5}>
                {label}
              </text>
            ))}
            {LAT.map(({ y, label }) => (
              <text key={-y} x="1490" y={y - 5} textAnchor="end">
                {label}
              </text>
            ))}
          </g>
          <text className="hoi-sheet" x="180" y="748">
            CARTA OPERACIONAL Nº 7 · TEATRO NORTE · FOLHA 3/12
          </text>
          <text className="hoi-sheet" x="1420" y="748" textAnchor="end">
            ESCALA 1:250.000 · USO RESTRITO DO ESTADO-MAIOR
          </text>
        </svg>

        {/* províncias que mudam de dono ao longo da guerra */}
        {PROVINCE_LIST.map((p) => (
          <Patch
            key={p.id}
            box={p.box}
            className={`hoi-prov-flip hoi-p-${p.id}`}
          >
            {p.erase && <path className="hoi-erase" d={p.erase} />}
            {p.band && <path className="hoi-band" d={p.band} />}
            <path className="hoi-front-counter" d={p.counter} />
            <path className="hoi-front-line" d={p.line} />
            <path className="hoi-front-teeth" d={p.teeth} />
            {p.id === 't4' && (
              <>
                <path
                  className="hoi-pocket"
                  d="M948 50a42 24 0 1 0 84 0a42 24 0 1 0 -84 0"
                />
                <text className="hoi-cercada" x="1032" y="78">
                  CERCADA
                </text>
              </>
            )}
          </Patch>
        ))}

        {/* setas */}
        {ARROWS.map(({ id, side, box, dir, lag, a }) => (
          <Wipe
            key={id}
            box={box}
            dir={dir}
            lag={lag}
            className={`hoi-arrow hoi-arrow-${side} hoi-${id}`}
          >
            <path className="hoi-arrow-shadow" d={a.body} />
            <path className="hoi-arrow-body" d={a.body} />
            <path className="hoi-arrow-stripes" d={a.stripes} />
          </Wipe>
        ))}

        {/* blocos em movimento */}
        {MOVERS.map(([id, x, y, c, k]) => {
          const b = block(x, y)
          return (
            <Patch
              key={id}
              box={[x - 2, y - 2, 28, 22]}
              className={`hoi-mover hoi-${id}`}
            >
              <path className="hoi-unit-shadow" d={b.shadow} />
              <path className="hoi-unit-side" d={b.side} />
              <path className={`hoi-unit-${c}`} d={b.top} />
              <path className="hoi-unit-sym" d={symbol(x, y, k)} />
            </Patch>
          )
        })}

        {/* rodo de plotagem: entra pela borda de cima e empurra um bloco */}
        <Patch box={[1188, -150, 60, 220]} className="hoi-rake">
          <path className="hoi-rake-shadow" d="M1222 -150L1226 32M1204 40h40" />
          <path className="hoi-rake-pole" d="M1216 -150L1218 30" />
          <path className="hoi-rake-head" d="M1197 28h42v6h-42z" />
          <path className="hoi-rake-cap" d="M1211 22h14v8h-14z" />
        </Patch>

        {/* pulsos dos objetivos */}
        {PINS.slice(0, 4).map(([x, y], i) => (
          <span
            key={i}
            className="hoi-pulse"
            style={{
              left: `${(x / MW) * 100}%`,
              top: `${(y / MH) * 100}%`,
              ...vars({ '--hoi-i': i }),
            }}
          />
        ))}

        {/* comboio de suprimentos na estrada e navio na baía */}
        <Patch box={[700, 54, 22, 12]} className="hoi-truck">
          <path
            className="hoi-truck-body"
            d="M702 57h12v7h-12zM714 59h5l2 3v2h-7z"
          />
        </Patch>
        <Patch box={[60, 80, 60, 26]} className="hoi-ship">
          <path className="hoi-ship-wake" d="M62 93q14 -5 26 -1q-12 4 -26 1z" />
          <path className="hoi-ship-hull" d="M84 89h26l6 4l-6 4h-26l-3 -4z" />
          <path className="hoi-ship-deck" d="M92 91h8v4h-8zM102 92h4v2h-4z" />
        </Patch>
      </div>
      {/* papel: grão, dobras e vinheta (estático, por cima da carta) */}
      <div className="hoi-grain" />
    </div>
  )
}
