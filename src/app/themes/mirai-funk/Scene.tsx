import type { CSSProperties, ReactNode } from 'react'
import {
  CITY,
  CITY_H,
  CITY_W,
  CLOUD_BELLY,
  CLOUD_TOP,
  FLARE_RAYS,
  LANE_EAST,
  LANE_WEST,
  PX,
  PY,
  RAIN,
  SPEED_LINES,
  STAGGER,
  STARS,
  TILES,
  TRAIN,
  tile,
} from './geometry'
import { SideColumn, TrackTitle } from './Kinetic'
import Listener from './Listener'
import { Birds, Fireworks, FlyingCar, RadioTower, RecordDeck } from './Props'

// Cena de fundo do tema Mirai Funk (só aparece com data-theme="mirai-funk").
// Um videoclipe de future funk que nunca acaba, desenhado como pôster
// duotone: céu verde-água chapado, cidade preta com grades de janelinhas,
// água listrada, tipografia branca enorme em itálico que vira em CSS 3D.
//
// O disco tem 6 faixas de 40 s (ciclo de --mf-cycle = 4 min, theme.css):
//   A1 未来のファンク  dia, gaivotas, sol listrado, nuvens na frente do sol
//   A2 恋のルーレット  dia, flare gráfico, trem-bala branco passando
//   A3 夕焼けシティ    pôr do sol, janelas acendendo em grupos, neon ラジオ
//                      e poste do cais ligando, carro voador (raro)
//   — troca de lado: o braço levanta, o LP vira, a faixa do céu inverte
//   B1 月面ディスコ    noite, lua com retícula, fogos, avião, trem com rastro
//   B2 雨のメモリー    garoa chapada, relâmpagos suaves, estrela cadente
//   B3 夜明けのビート  amanhecer; o LP volta para o lado A
// Laços curtos o tempo todo: equalizador na fachada da rádio, batida e
// cronômetro da faixa no cabeçalho, LP girando, carros na via expressa,
// rádio portátil pulsando e pernas balançando no cais, estrelas
// cintilando; a coluna vertical gira a cada 22 s, gaivotas a cada 73 s,
// nuvens em 170–260 s.
//
// Onde fica cada coisa (1920 x 1080): o título cinético e o letreiro da
// faixa no meio do cabeçalho; a coluna de letras gigantes (tategaki) e o
// ouvinte no cais na margem esquerda; sol/lua, torre da rádio e o
// toca-discos na margem direita; trem, via expressa, nuvens e reflexos
// atravessando a tela toda (vistos nas margens e entre os cards). Atrás da
// roleta fica só céu e cidade, sem nada piscando.
//
// Roleta: girando, o título dá lugar a faixas de texto correndo, entram
// linhas de concentração de mangá, as janelas pulsam na batida, ON AIR
// acende, o LP vira um borrão e o ouvinte levanta e dança. No vencedor:
// clarão duotone suave (inverte as cores por um instante, 2 pulsos),
// 大当たり bate letra por letra na cor vencedora (--win-color), dois anéis
// e dois fogos nessa cor uma vez, o ouvinte pula de braços para cima, e
// fica só um brilho calmo enquanto o resultado estiver aberto.
//
// Sorteios com semente fixa (geometry.ts); formas iguais num <path> por
// cor e janelas com <pattern>. Cada camada animada é um <svg>/<div>
// próprio, para opacidade e movimento rodarem na GPU sem repintar.

// atraso no ciclo (fração), lido pelo CSS em --mf-k
const phase = (k: number) => ({ '--mf-k': k.toFixed(3) }) as CSSProperties

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

// padrões de janelas (dia e noite), definidos uma vez na camada da cidade
const WINDOW_PATTERNS = TILES.map(({ cols, rows }, i) => {
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
    // todas as janelas acesas: pulso da batida enquanto a roleta gira
    <pattern key={`b${i}`} id={`mf-win-beat-${i}`} {...box}>
      <path className="mf-win-on" d={nightTile.lit + dayTile.lit} />
    </pattern>,
  ]
})
const ALL_NIGHT = CITY.night.join('')

export default function MiraiFunkScene() {
  return (
    <>
      {/* paletas duotone do entardecer e da noite, por cima da do dia */}
      <div className="mf-sky mf-sky-dusk mf-cyc" />
      <div className="mf-sky mf-sky-night mf-cyc" />
      {/* retícula de impressão nos cantos do céu */}
      <div className="mf-halftone" />

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
        <i className="mf-cyc" style={phase(0.16)} />
      </div>

      {/* sol listrado com halos chapados; lua com retícula à noite */}
      <div className="mf-sunbox">
        <div className="mf-sun mf-cyc">
          <i className="mf-sun-halo" />
          <i className="mf-sun-disc" />
        </div>
        <div className="mf-moon mf-cyc">
          <i className="mf-moon-halo" />
          <i className="mf-moon-disc" />
        </div>
      </div>
      {/* fantasmas parados antes dos raios que giram: pintam na camada do
          próprio flare (branco sobre branco, a ordem não muda a cor) */}
      <div className="mf-flare mf-cyc">
        <svg className="mf-flare-ghosts" viewBox="0 0 600 600">
          <circle className="mf-flare-ring" cx="300" cy="300" r="118" />
          <circle className="mf-flare-ring" cx="300" cy="300" r="150" />
          <circle cx="214" cy="392" r="22" />
          <circle cx="168" cy="444" r="10" />
          <path d="M120 498l14-24h28l14 24-14 24h-28z" />
        </svg>
        <svg className="mf-flare-rays" viewBox="0 0 600 600">
          <path d={FLARE_RAYS} />
        </svg>
      </div>

      {/* nuvens chapadas atravessando devagar (passam na frente do sol) */}
      <div className="mf-clouds mf-cyc">
        {[1, 2, 3].map((k) => (
          <svg
            key={k}
            className={`mf-cloud mf-cloud-${k}`}
            viewBox="0 0 200 64"
          >
            <path className="mf-cloud-top" d={CLOUD_TOP} />
            <path className="mf-cloud-belly" d={CLOUD_BELLY} />
          </svg>
        ))}
      </div>

      {/* atores do céu */}
      <Birds />
      <div className="mf-plane mf-cyc">
        <i />
      </div>
      <FlyingCar />
      <Fireworks />

      {/* cidade: fundo, contorno claro desalinhado (impressão), frente com
          janelas de dia, janelas de noite em grupos que acendem cada um no
          seu tempo, brilho das janelas, luzes de antena e trem */}
      <CityLayer className="mf-city-far mf-cyc">
        <path d={CITY.far} />
      </CityLayer>
      {/* névoa clara no pé da cidade do fundo (de noite vira o clarão das
          luzes da cidade no horizonte) */}
      <div className="mf-haze" />
      <CityLayer className="mf-city-misreg">
        <path d={CITY.front + CITY.antenna} />
      </CityLayer>
      <CityLayer className="mf-city-front">
        <defs>{WINDOW_PATTERNS}</defs>
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
      <CityLayer className="mf-city-bloom mf-cyc">
        <path d={ALL_NIGHT} fill="url(#mf-win-night-0)" />
      </CityLayer>
      <CityLayer className="mf-city-beat">
        {CITY.night.map((d, i) => (
          <path key={i} d={d} fill={`url(#mf-win-beat-${i % 3})`} />
        ))}
      </CityLayer>
      <div className="mf-beacons mf-cyc">
        <CityLayer className="mf-beacon-blink">
          <path d={CITY.blink} />
        </CityLayer>
      </div>

      {/* trem-bala na via elevada: 4 passagens por ciclo; à noite as
          janelas acendem e as pontas deixam rastros de luz */}
      <div className="mf-train mf-cyc">
        <CityLayer className="mf-train-body">
          <path d={TRAIN.body} />
          <path className="mf-train-stripe" d={TRAIN.stripe} />
          <path className="mf-train-win" d={TRAIN.windows} />
        </CityLayer>
        <div className="mf-train-lit mf-cyc">
          <CityLayer className="mf-train-glow">
            {/* à noite a carroceria escurece e as janelas acendem */}
            <path className="mf-train-shade" d={TRAIN.body} />
            <defs>
              <linearGradient id="mf-trail-l" x1="1" x2="0">
                <stop offset="0" stopColor="#e8fbf8" stopOpacity="0.9" />
                <stop offset="1" stopColor="#e8fbf8" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="mf-trail-r" x1="0" x2="1">
                <stop offset="0" stopColor="#e8fbf8" stopOpacity="0.9" />
                <stop offset="1" stopColor="#e8fbf8" stopOpacity="0" />
              </linearGradient>
            </defs>
            <rect
              x={TRAIN.x0 - 420}
              y={TRAIN.y + 8}
              width="420"
              height="3"
              fill="url(#mf-trail-l)"
            />
            <rect
              x={TRAIN.x1}
              y={TRAIN.y + 8}
              width="420"
              height="3"
              fill="url(#mf-trail-r)"
            />
            <path d={TRAIN.windows + TRAIN.lights} />
          </CityLayer>
        </div>
      </div>

      {/* torre da rádio (margem direita, na frente da cidade) */}
      <RadioTower />

      {/* via expressa na beira d'água: faixas de luz indo e vindo */}
      <div className="mf-highway">
        <div className="mf-lanes mf-cyc">
          <svg
            className="mf-lane mf-lane-e"
            viewBox="0 0 2000 8"
            preserveAspectRatio="none"
          >
            <path d={LANE_EAST} />
          </svg>
          <svg
            className="mf-lane mf-lane-w"
            viewBox="0 0 2000 8"
            preserveAspectRatio="none"
          >
            <path d={LANE_WEST} />
          </svg>
        </div>
      </div>

      {/* reflexo da cidade no chão escuro, em faixas horizontais, e as
          colunas de luz das janelas e da lua na água */}
      <svg
        className="mf-reflection mf-cyc"
        viewBox={`0 0 ${CITY_W} ${CITY_H}`}
        preserveAspectRatio="xMidYMin slice"
        shapeRendering="crispEdges"
      >
        <path d={CITY.front} transform={`matrix(1 0 0 -1 0 ${CITY_H})`} />
      </svg>
      <svg
        className="mf-reflection-lit mf-cyc"
        viewBox={`0 0 ${CITY_W} ${CITY_H}`}
        preserveAspectRatio="xMidYMin slice"
        shapeRendering="crispEdges"
      >
        <path
          d={ALL_NIGHT}
          fill="url(#mf-win-night-1)"
          transform={`matrix(1 0 0 -1 0 ${CITY_H})`}
        />
      </svg>
      <div className="mf-moonpath mf-cyc">
        <i />
      </div>
      <div className="mf-ground" />

      {/* toca-discos na água (margem direita) */}
      <RecordDeck />

      {/* ouvinte sentado no cais (margem esquerda, embaixo) */}
      <Listener />

      {/* garoa em traços diagonais chapados, com clarão de relâmpago */}
      <div className="mf-rain mf-cyc">
        <div className="mf-rain-fall">
          <svg viewBox="0 0 1600 1800" preserveAspectRatio="none">
            <path d={RAIN} />
          </svg>
        </div>
      </div>
      <div className="mf-flash mf-cyc" />

      {/* girando: linhas de concentração em volta da roleta */}
      <div className="mf-lines">
        <svg className="mf-lines-art" viewBox="-1000 -1000 2000 2000">
          <path d={SPEED_LINES} />
        </svg>
      </div>

      {/* moldura do pôster: filetes, marcas de corte, ficha técnica (filete
          e marcas numa caixa só = uma camada na GPU, não cinco) */}
      <div className="mf-frame">
        <div className="mf-rules" />
        <div className="mf-crop mf-crop-tl" />
        <div className="mf-crop mf-crop-tr" />
        <div className="mf-crop mf-crop-bl" />
        <div className="mf-crop mf-crop-br" />
      </div>
      <div className="mf-notes mf-notes-l">
        <span className="mf-swatches">
          <i />
          <i />
          <i />
          <i />
        </span>
        LP · ESTÉREO · MF-1986 · 未来レコード
      </div>
      <div className="mf-notes mf-notes-r">
        33⅓ RPM · LADO A / LADO B · ℗ 1986 MIRAI RECORDS
        <i className="mf-barcode" />
      </div>

      {/* tipografia cinética: coluna vertical e título da faixa */}
      <SideColumn />
      <TrackTitle />

      {/* vencedor: anéis e fogos na cor vencedora, clarão duotone */}
      <div className="mf-win-rings">
        <i className="mf-win-ring" />
        <i className="mf-win-ring" />
      </div>
      <Fireworks win />
      <div className="mf-win-glow" />
      <div className="mf-drop mf-cyc" />
      <div className="mf-invert" />
    </>
  )
}
