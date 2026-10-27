import {
  Bus,
  Coupe,
  Kei,
  Taxi,
  TrainSvg,
  WalkerStrip,
  BlimpSvg,
} from './Actors'
import type { WalkerKind } from './Actors'
import { Cat, Cup, Decal, Doodle, Lamp, Walkman } from './Cafe'
import {
  BackLeft,
  BackRight,
  Defs,
  FarCity,
  FrontLeft,
  FrontRight,
  MidRow,
  NearRight,
  Reflections,
  Tower,
  Wires,
} from './City'
import { r1, seeded, vars } from './util'

// Cena do tema City Pop: "喫茶 月光" (Kissa Gekkō), um café de Tóquio numa
// noite de chuva, como capa de disco dos anos 80. A câmera está DENTRO do
// café olhando pela janela:
// - primeiro plano: batentes de madeira (laterais e travessa de cima),
//   balcão com xícara fumegando, walkman com fones vazando notinhas,
//   luminária pendente incandescente com uma mariposa rodando e a gata da
//   casa dormindo (com "z" subindo); no vidro, o nome do café em folha de
//   ouro ao contrário (estamos do lado de dentro), gotas que grudam e
//   escorregam, miçangas d'água, embaçado com um 相合傘 desenhado com o dedo;
// - lá fora, em camadas (parallax de profundidade): céu com lua, estrelas,
//   nuvens, holofotes, dirigível, avião e fogos; cidade distante com luzes
//   de aviação; torre de TV; outdoor da rádio (que alterna com um anúncio
//   de disco) e torre de vidro; viaduto com trens passando; as lojas do
//   outro lado da rua (lámen com noren e lanternas, karaokê, snack "夜光",
//   máquinas de bebida, loja de discos com disco de neon, loja 24H) e os
//   fregueses saindo delas; táxis, cupê, kei van e ônibus com faróis,
//   lanternas e o risco de luz deles no asfalto; pedestres de guarda-chuva;
//   reflexos no asfalto molhado (cópia espelhada recortada em faixas que
//   ondulam); poste com semáforo, sinal de pedestre e 止まれ.
// Só CSS/SVG, sem laço JS: o desenho é estático e cada ator anima o seu
// elemento HTML (ou o <svg> de fora) só em transform/opacity.
//
// Linha do tempo (segundos depois de abrir; ciclo do clima de 240 s que
// começa em 12 s, --cp-at):
// - ambiente (segundos): chuva lá fora, gotas no vidro (9–25 s), ondas nas
//   poças, vapor do café e do lámen, letreiros tremendo, luzes de aviação,
//   holofotes (19/27 s), nuvens (190/260 s), gata respirando e roncando,
//   notinhas do walkman (7–12 s), mariposa;
// - eventos (20–60 s): trem → a cada 48 s (1º em 8 s), trem ← a cada 71 s
//   (1º em 22 s), ônibus a cada 61 s, táxis e carros a cada 13–29 s,
//   pedestres a cada 33–60 s, freguês da loja 24H a cada 37 s (1º em 17 s),
//   freguês do lámen a cada 43 s (1º em 37 s), outdoor trocando de anúncio
//   a cada 46 s, avião a cada 63 s, rabo da gata 21 s, orelha 13 s,
//   letreiro "夜光" falhando a cada 31 s, loja 24H piscando a cada 23 s;
// - raros (minutos): dirigível com letreiro correndo (180 s, 1º em 15 s),
//   temporal de ~70 s a ~125 s com relâmpagos em ~94 s e ~110 s (a estrela
//   dourada do vidro reluz e, logo depois do 1º, a rua tem uma queda de
//   energia: escurece, pisca e volta), fogos sobre a baía em ~142–150 s,
//   estrela cadente em ~199 s; e o ciclo recomeça.
// Roleta (theme.css, html[data-wheel]): girando = o semáforo abre (verde) e
// o boneco de pedestre fica vermelho, carros passam zunindo, o coração 恋 do
// telhado acende piscando, o outdoor vira letreiro "ルーレット回転中",
// holofotes aceleram, torre acesa em rosa e ciano, disco gira mais rápido,
// o walkman toca (rolos, LED, mais notinhas) e a gata acorda; vencedor =
// fogos na cor da fatia sobre a cidade (uma vez só), reflexo deles no
// asfalto, a estrela dourada reluz, o outdoor mostra "当たり！" (pulsa três
// vezes e fica aceso), torre e céu tingidos que ficam brilhando calmos e a
// gata olhando o céu com os olhos na cor vencedora.

type Zone = 'l' | 'r' | 't' | 'z' | 'wl' | 'wr'
interface Drop {
  z: Zone
  x: number
  y: number
  s: number
  k: 'a' | 'b' | 'c'
  d: number
  o: number
  t: 'p' | 'c' | 'w'
}

// gotas no vidro: concentradas onde a cena aparece (margens, faixa do
// título e o canto de baixo à esquerda); "w*" só em telas bem largas
const DROPS = (() => {
  const rand = seeded(2024)
  const list: Drop[] = []
  const add = (
    z: Zone,
    n: number,
    [x0, x1]: [number, number],
    [y0, y1]: [number, number],
  ) => {
    for (let i = 0; i < n; i++)
      list.push({
        z,
        x: r1(x0 + ((i + rand()) / n) * (x1 - x0)),
        y: r1(y0 + rand() * (y1 - y0)),
        s: r1(0.95 + rand() * 0.75),
        k: (['a', 'b', 'c'] as const)[(i + list.length) % 3],
        d: r1(9 + rand() * 16),
        o: r1(-rand() * 25),
        t: (['p', 'c', 'w'] as const)[Math.floor(rand() * 3)],
      })
  }
  add('l', 6, [3.4, 15], [6, 66])
  add('r', 6, [3.4, 15], [6, 66])
  add('t', 6, [23, 82], [0.3, 2.6])
  add('z', 3, [17.5, 28], [52, 68])
  add('wl', 3, [18, 32], [8, 70])
  add('wr', 3, [18, 32], [8, 70])
  return list
})()

// rastro deixado por cada gota (fixo): um gradiente de 1px na camada das
// miçangas, nas zonas sempre visíveis (as gotas extras não deixam rastro)
const TRAIL = { a: 9, b: 15, c: 22 }
const TRACKS = (() => {
  const list = DROPS.filter((d) => !d.z.startsWith('w'))
  const at = (d: Drop) => {
    const x = r1(d.x + d.s * 0.46)
    if (d.z === 't') return `left ${x}vw top ${d.y + 0.7}vh`
    if (d.z === 'r') return `right ${r1(d.x + d.s * 0.54)}vh top ${d.y + 0.7}vh`
    return `left ${x}vh top ${d.y + 0.7}vh`
  }
  const line =
    'linear-gradient(rgba(226, 232, 255, 0.3), rgba(226, 232, 255, 0.04))'
  return {
    backgroundImage: [...list.map(() => line), 'var(--cp-beads)'].join(','),
    backgroundPosition: [...list.map(at), 'var(--cp-beads-at)'].join(','),
    backgroundSize: [
      ...list.map((d) => `1px ${TRAIL[d.k]}vh`),
      'var(--cp-beads-size)',
    ].join(','),
    backgroundRepeat: [
      ...list.map(() => 'no-repeat'),
      'var(--cp-beads-rep)',
    ].join(','),
  }
})()

const dropPos = ({ z, x, y }: Drop): Record<string, string> => {
  const top = `${y}vh`
  if (z === 't') return { left: `${x}vw`, top }
  if (z === 'r' || z === 'wr') return { right: `${x}vh`, top }
  return { left: `${x}vh`, top }
}

// ondinhas nas poças e na beira da rua
const RIPPLES: [string, number, number, number, number, number][] = [
  // lado, x (vh da borda), y (vh), largura (vh), duração, atraso
  ['l', 6, 88.8, 2.8, 1.7, -0.3],
  ['l', 11.5, 89.6, 3.2, 2.2, -1.1],
  ['l', 21.5, 88.6, 2.6, 1.5, -0.8],
  ['l', 9, 84.6, 2.2, 1.3, -0.5],
  ['r', 6, 88.8, 2.8, 1.9, -0.9],
  ['r', 12, 89.6, 2.4, 1.4, -0.2],
  ['r', 7.5, 85, 2.2, 1.6, -1.3],
]

// fogos: x em vw, y em vh (centro), s = diâmetro em vh, at = atraso (s)
const FW_IDLE = [
  { x: 39, y: 6.5, s: 15, c: '#ff5fb0', k: 'peony', at: 0 },
  { x: 58, y: 4.6, s: 12, c: '#5ff3ff', k: 'ring', at: 1.4 },
  { x: 48, y: 8, s: 19, c: '#ffc4ec', k: 'willow', at: 2.6 },
  { x: 66, y: 7, s: 13, c: '#c39bff', k: 'peony', at: 4.1 },
  { x: 29, y: 5.2, s: 11, c: '#f2f6ff', k: 'ring', at: 5.3 },
]
// vitória: estouros na cor da fatia, um atrás do outro (~3 s) e o grande
// salgueiro no fim; dois deles nas margens, onde a cena aparece inteira
const FW_WIN = [
  { x: 50, y: 6, s: 26, k: 'peony', at: 0 },
  { x: 30, y: 7, s: 16, k: 'ring', at: 0.35 },
  { x: 69, y: 5.5, s: 18, k: 'peony', at: 0.7 },
  { x: 4.6, y: 15, s: 13, k: 'ring', at: 1.1 },
  { x: 95.4, y: 12, s: 13, k: 'peony', at: 1.5 },
  { x: 41, y: 3, s: 22, k: 'willow', at: 1.9 },
  { x: 60, y: 4, s: 16, k: 'peony', at: 2.4 },
  { x: 52, y: 2.5, s: 30, k: 'willow', at: 3 },
]

// letreiro do dirigível (rádio inventada): duas cópias iguais rolando
const TICKER = '♪ ナイトFM 87.6 · シティポップ特集 · 雨の夜にようこそ'

type Lane = 'far' | 'near'
const CARS: {
  kind: 'taxi' | 'coupe' | 'kei' | 'bus'
  lane: Lane
  d: number
  o: number
  k: 'a' | 'b' | 'c'
}[] = [
  { kind: 'taxi', lane: 'near', d: 13, o: -3, k: 'a' },
  { kind: 'coupe', lane: 'far', d: 17, o: -11, k: 'b' },
  { kind: 'kei', lane: 'far', d: 29, o: -4, k: 'c' },
  { kind: 'taxi', lane: 'far', d: 23, o: -16, k: 'a' },
  { kind: 'bus', lane: 'near', d: 61, o: -38, k: 'c' },
  { kind: 'coupe', lane: 'near', d: 37, o: -21, k: 'b' },
]
const VEH = { taxi: Taxi, coupe: Coupe, kei: Kei, bus: Bus }

const WALKERS: { kind: WalkerKind; lane: Lane; d: number; o: number }[] = [
  { kind: 'suit', lane: 'far', d: 54, o: -14 },
  { kind: 'couple', lane: 'far', d: 60, o: -47 },
  { kind: 'clear', lane: 'near', d: 38, o: -9 },
  { kind: 'cyclist', lane: 'near', d: 33, o: -26 },
]

function Burst({
  x,
  y,
  s,
  k,
  c,
  at,
  win,
}: {
  x: number
  y: number
  s: number
  k: string
  c?: string
  at: number
  win?: boolean
}) {
  return (
    <span
      className={`cp-fw-b cp-fw-${k}`}
      style={vars({
        left: `${x}vw`,
        top: `${y}vh`,
        '--cp-s': `${s}vh`,
        '--cp-fw-c': win ? 'var(--win-color, #ff2e88)' : (c ?? '#fff'),
        '--cp-fw-at': `${at}s`,
      })}
    >
      <i />
    </span>
  )
}

export default function CityPopScene() {
  return (
    <>
      <Defs />

      {/* ---------- céu ---------- */}
      <div className="cp-stars" />
      <div className="cp-stars cp-stars-tw" />
      <div className="cp-halo" />
      <div className="cp-moon" />
      <div className="cp-beams">
        <span className="cp-beam cp-beam-a" />
        <span className="cp-beam cp-beam-b" />
        <span className="cp-beam cp-beam-a cp-beam-fast" />
        <span className="cp-beam cp-beam-b cp-beam-fast" />
      </div>
      <div className="cp-fw cp-fw-idle">
        {FW_IDLE.map((b, i) => (
          <Burst key={i} {...b} />
        ))}
      </div>
      <div className="cp-clouds">
        <span className="cp-cloud cp-cloud-a" />
        <span className="cp-cloud cp-cloud-b" />
      </div>
      <span className="cp-meteor" />
      <div className="cp-plane">
        <span className="cp-plane-lights" />
      </div>
      <div className="cp-blimp">
        <BlimpSvg />
        <div className="cp-blimp-led">
          <div className="cp-blimp-text">
            <span>{TICKER}</span>
            <span>{TICKER}</span>
          </div>
        </div>
      </div>
      <div className="cp-flash" />

      {/* ---------- longe ---------- */}
      <FarCity />
      <Tower />
      <div className="cp-haze" />
      <BackLeft />
      <BackRight />
      <div className="cp-fw cp-fw-win">
        {FW_WIN.map((b, i) => (
          <Burst key={i} {...b} win />
        ))}
      </div>
      <div className="cp-afterglow" />

      {/* ---------- viaduto e trens ---------- */}
      <div className="cp-ocs" />
      {/* trilho de trás (mais alto e escuro) e trilho da frente */}
      <div className="cp-train cp-train-b">
        <TrainSvg id="b" stripe="#2de2e6" far />
        <span className="cp-spark" />
      </div>
      <div className="cp-train cp-train-a">
        <TrainSvg id="a" stripe="#ff4f9e" />
        <span className="cp-spark" />
      </div>
      <div className="cp-viaduct" />

      {/* ---------- outro lado da rua ---------- */}
      <MidRow />
      <FrontLeft />
      <FrontRight />
      <Wires />

      {/* ---------- rua molhada ---------- */}
      <div className="cp-street" />
      <div className="cp-spill" />
      <Reflections />
      <div className="cp-sigrefl">
        <span className="cp-sigrefl-stop" />
        <span className="cp-sigrefl-go" />
      </div>
      <div className="cp-win-refl" />
      {/* queda de energia logo depois do relâmpago: a rua escurece, pisca e
          volta (carros e semáforo continuam acesos, ficam por cima) */}
      <div className="cp-dip" />
      {WALKERS.filter((w) => w.lane === 'far').map((w, i) => (
        <Walker key={i} {...w} />
      ))}
      {/* fregueses saindo do lámen (para a esquerda) e da loja 24H (para a
          direita), cada um no seu tempo */}
      <Shopper kind="suit" where="ramen" flip />
      <Shopper kind="clear" where="mart" />
      <div className="cp-rail" />
      {CARS.filter((c) => c.lane === 'far').map((c, i) => (
        <Vehicle key={i} {...c} />
      ))}
      {CARS.filter((c) => c.lane === 'near').map((c, i) => (
        <Vehicle key={i} {...c} />
      ))}
      <div className="cp-zooms">
        <span className="cp-zoom cp-zoom-1" />
        <span className="cp-zoom cp-zoom-2" />
        <span className="cp-zoom cp-zoom-3" />
        <span className="cp-zoom cp-zoom-4" />
      </div>
      <div className="cp-puddles" />
      {RIPPLES.map(([side, x, y, w, d, o], i) => (
        <span
          key={i}
          className="cp-ripple"
          style={vars({
            [side === 'l' ? 'left' : 'right']: `${x}vh`,
            top: `${y}vh`,
            width: `${w}vh`,
            animationDuration: `${d}s`,
            animationDelay: `${o}s`,
          })}
        />
      ))}
      {WALKERS.filter((w) => w.lane === 'near').map((w, i) => (
        <Walker key={i} {...w} />
      ))}
      <NearRight />

      {/* ---------- chuva e vidro ---------- */}
      <div className="cp-rain">
        <span className="cp-rain-far" />
        <span className="cp-rain-near" />
      </div>
      <div className="cp-rain cp-rain-heavy">
        <span className="cp-rain-near" />
      </div>
      {/* miçangas, rastros das gotas e reflexo do café no vidro: uma
          camada parada só; as gotas que escorregam vêm por cima */}
      <div className="cp-beads" style={TRACKS} />
      <div className="cp-fog cp-fog-l">
        <Doodle />
      </div>
      <div className="cp-fog cp-fog-r" />
      <Decal />
      <span className="cp-glint" />
      {DROPS.map((d, i) => (
        <span
          key={i}
          className={`cp-drop cp-drop-${d.t} cp-dk-${d.k} cp-z-${d.z}`}
          style={vars({
            ...dropPos(d),
            '--cp-ds': d.s,
            animationDuration: `${d.d}s`,
            animationDelay: `${d.o}s`,
          })}
        />
      ))}

      {/* ---------- dentro do café ---------- */}
      <div className="cp-frame cp-frame-t" />
      <div className="cp-frame cp-frame-l" />
      <div className="cp-frame cp-frame-r" />
      <div className="cp-counter" />
      <Cup />
      <span className="cp-steam cp-steam-1" />
      <span className="cp-steam cp-steam-2" />
      <Walkman />
      <Cat />
      <Lamp />
      <div className="cp-vignette" />
    </>
  )
}

function Vehicle({
  kind,
  lane,
  d,
  o,
  k,
}: {
  kind: keyof typeof VEH
  lane: Lane
  d: number
  o: number
  k: string
}) {
  const Svg = VEH[kind]
  return (
    <div
      className={`cp-veh cp-veh-${kind} cp-lane-${lane} cp-drive-${k}`}
      style={{ animationDuration: `${d}s`, animationDelay: `${o}s` }}
    >
      {/* faróis, lanternas e reflexo no asfalto: vão junto com o carro */}
      <span className="cp-veh-fx" />
      <Svg flip={lane === 'near'} />
    </div>
  )
}

function Walker({
  kind,
  lane,
  d,
  o,
}: {
  kind: WalkerKind
  lane: Lane
  d: number
  o: number
}) {
  return (
    <div
      className={`cp-walker cp-walker-${kind} cp-lane-${lane}`}
      style={{ animationDuration: `${d}s`, animationDelay: `${o}s` }}
    >
      <div className="cp-walker-win">
        <WalkerStrip
          kind={kind}
          flip={kind === 'couple' || kind === 'cyclist'}
        />
      </div>
    </div>
  )
}

// freguês que sai de uma loja da margem e vai embora (evento curto)
function Shopper({
  kind,
  where,
  flip,
}: {
  kind: WalkerKind
  where: 'ramen' | 'mart'
  flip?: boolean
}) {
  return (
    <div className={`cp-shopper cp-shopper-${where} cp-walker-${kind}`}>
      <div className="cp-walker-win">
        <WalkerStrip kind={kind} flip={flip} />
      </div>
    </div>
  )
}
