import type { CSSProperties, ReactNode } from 'react'
import {
  CYAN,
  DOT_DISC,
  INK,
  LILAC,
  MINT,
  PINK,
  SPARKLE,
  YELLOW,
  confetti,
  r1,
  seeded,
  stars,
  vars,
} from './art'
import {
  Balloon,
  BeachBall,
  Fireworks,
  Plane,
  Poppers,
  WinSlap,
} from './Events'
import {
  Boombox,
  Cassette,
  DiscoBall,
  Flecks,
  Floor,
  Palm,
  StringLights,
  Stickers,
  Sun,
} from './Props'
import { Solid } from './Solids'

// Cena de fundo do tema Good Times (良い時): um pôster Memphis de festa que
// ganhou vida sobre papel quadriculado. Um rádio toca a 120 BPM (batida de
// 0,5 s) e tudo dança junto: alto-falantes pulsam, o equalizador pula, as
// notas sobem, os ladrilhos da pista acendem alternados, as formas Memphis
// trocam de pose. Sólidos em CSS 3D (cubo, pirâmide, prisma) giram devagar
// com a sombra dura em tinta acompanhando. Um sol listrado de óculos
// escuros se põe atrás da pista; à noite o varal de lâmpadas e o letreiro
// neon acendem e o globo espelhado desce espalhando reflexos coloridos.
//
// Composição (1920×1080): a interface cobre o meio; a vida fica na faixa
// de cima (varal, globo, prisma, fita cassete, aviãozinho, fogos), nas
// margens (esquerda: cubo, adesivos, sol, palmeira; direita: letreiro 良い時,
// pirâmide, rádio) e na faixa de baixo (pista xadrez, bola de praia,
// lança-confetes). Atrás da roda fica só o papel.
//
// Relógios (o ciclo do dia está no theme.css, --gt-cycle = 200 s):
//   0,5 s   batida: cones, LED, notas, ladrilhos (1 s), poses das formas
//   22–34 s giros 3D dos sólidos; flutuação de 6–9 s
//   11 s    brilho nos óculos do sol; 3,7/5,3 s brilhos no globo
//   29 s    a etiqueta "BOA SORTE" descola a ponta e volta
//   37 s    a bola de praia atravessa a pista quicando
//   61 s    aviãozinho com faixa "GOOD TIMES ✦ 良い時" cruza o alto
//   173 s   balão de ar quente sobe pela margem esquerda (raro)
// Roleta: girando = as luzes da festa ligam mesmo de dia (varal, neon,
// visor, reflexos), batida dobrada (cones e equalizador acelerados, notas
// extras, formas pulando, pista correndo), reflexos rápidos do globo, o sol
// abaixa os óculos e os sólidos dão dois giros e se afastam da sombra;
// venceu = lança-confetes disparam (um no chão, outro em cima do rádio), o
// adesivo "GOOD TIMES!" é batido na faixa de cima na cor da fatia
// (--win-color), flash suave, globo brilha na cor e os sólidos pulam uma
// vez; ~3 s depois as luzes piscam de volta ao ciclo e fica só o adesivo e
// um brilho calmo até o modal fechar.
// Arte toda original: formas genéricas, sem marcas nem personagens.

// ---- Formas Memphis planas ---------------------------------------------------

const SHAPES: Record<string, (color: string) => ReactNode> = {
  squiggle: (c) => (
    <>
      <path
        d="M8 54q10-24 21 0t21 0t21 0t21 0"
        fill="none"
        stroke={INK}
        strokeWidth="9"
      />
      <path
        d="M5 50q10-24 21 0t21 0t21 0t21 0"
        fill="none"
        stroke={c}
        strokeWidth="9"
      />
    </>
  ),
  zigzag: (c) => (
    <>
      <path
        d="M9 66l14-24l14 24l14-24l14 24l14-24l14 24"
        fill="none"
        stroke={INK}
        strokeWidth="8"
      />
      <path
        d="M6 62l14-24l14 24l14-24l14 24l14-24l14 24"
        fill="none"
        stroke={c}
        strokeWidth="8"
      />
    </>
  ),
  tri: (c) => (
    <>
      <path fill={INK} d="M56 16L94 88H18Z" />
      <path d="M50 10L88 82H12Z" fill={c} stroke={INK} strokeWidth="4.5" />
      <path d="M34 64h32M42 50h16" fill="none" stroke={INK} strokeWidth="4" />
    </>
  ),
  ring: (c) => (
    <>
      <circle
        cx="50"
        cy="50"
        r="36"
        fill="none"
        stroke={c}
        strokeWidth="9"
        strokeDasharray="0 15"
      />
      <circle cx="50" cy="50" r="18" fill={c} stroke={INK} strokeWidth="4.5" />
    </>
  ),
  dots: (c) => <path d={DOT_DISC} fill="none" stroke={c} strokeWidth="6" />,
  half: (c) => (
    <>
      <path fill={INK} d="M14 66A38 38 0 0 1 90 66Z" />
      <path
        d="M10 62A38 38 0 0 1 86 62Z"
        fill={c}
        stroke={INK}
        strokeWidth="4.5"
      />
      <path
        d="M28 62A20 20 0 0 1 68 62"
        fill="none"
        stroke={INK}
        strokeWidth="4"
      />
    </>
  ),
  cross: (c) => (
    <>
      <path d="M54 24v60M24 54h60" fill="none" stroke={INK} strokeWidth="14" />
      <path d="M50 20v60M20 50h60" fill="none" stroke={c} strokeWidth="14" />
    </>
  ),
}

// [forma, cor, posição, tamanho (vh), giro base, gira sem parar?]
type Shape = {
  kind: keyof typeof SHAPES
  color: string
  pos: CSSProperties
  size: number
  rot: number
  spin?: boolean
}

const FAR: Shape[] = [
  {
    kind: 'dots',
    color: INK,
    pos: { left: '44vw', top: '0.5vh' },
    size: 7,
    rot: 0,
  },
  {
    kind: 'ring',
    color: CYAN,
    pos: { left: '0.4vw', top: '29vh' },
    size: 6.5,
    rot: 0,
    spin: true,
  },
  {
    kind: 'dots',
    color: LILAC,
    pos: { right: '0.6vw', top: '50vh' },
    size: 8,
    rot: 0,
  },
  {
    kind: 'half',
    color: MINT,
    pos: { left: '34vw', top: '6.5vh' },
    size: 4,
    rot: 180,
  },
  {
    kind: 'cross',
    color: YELLOW,
    pos: { left: '6.2vw', top: '31vh' },
    size: 4,
    rot: 20,
  },
]
const NEAR: Shape[] = [
  {
    kind: 'squiggle',
    color: PINK,
    pos: { left: '29.5vw', top: '2.6vh' },
    size: 7.5,
    rot: -6,
  },
  {
    kind: 'zigzag',
    color: CYAN,
    pos: { left: '51vw', top: '4.6vh' },
    size: 7.5,
    rot: 8,
  },
  {
    kind: 'half',
    color: LILAC,
    pos: { left: '69.4vw', top: '4.4vh' },
    size: 5.5,
    rot: -14,
  },
  {
    kind: 'tri',
    color: YELLOW,
    pos: { left: '56.5vw', top: '0.6vh' },
    size: 5,
    rot: 12,
    spin: true,
  },
  {
    kind: 'half',
    color: PINK,
    pos: { right: '0.8vw', top: '1.2vh' },
    size: 6,
    rot: 24,
  },
  {
    kind: 'squiggle',
    color: YELLOW,
    pos: { right: '0.2vw', top: '51vh' },
    size: 7,
    rot: 74,
  },
  {
    kind: 'tri',
    color: PINK,
    pos: { left: '7vw', top: '57vh' },
    size: 4.5,
    rot: -18,
    spin: true,
  },
]

const ShapeLayer = ({
  shapes,
  seed,
  still,
}: {
  shapes: Shape[]
  seed: number
  still?: boolean
}) => {
  const rand = seeded(seed)
  return shapes.map((s, i) => (
    <div
      key={i}
      className={still ? 'gt-shape gt-shape-still' : 'gt-shape'}
      style={{
        ...s.pos,
        width: `${s.size}vh`,
        ...vars({
          '--gt-r': `${s.rot}deg`,
          '--gt-d': `${r1(6 + rand() * 6)}s`,
          '--gt-dl': `-${r1(rand() * 12)}s`,
          '--gt-a': `${Math.round(4 + rand() * 6)}px`,
          '--gt-pz': `-${(i % 2) * 0.5}s`,
        }),
      }}
    >
      <svg
        viewBox="0 0 100 100"
        className={s.spin ? 'gt-spin' : 'gt-pose'}
        style={
          s.spin
            ? vars({ '--gt-sd': `${Math.round(30 + rand() * 40)}s` })
            : undefined
        }
        aria-hidden="true"
      >
        {SHAPES[s.kind](s.color)}
      </svg>
    </div>
  ))
}

const Confetti = ({
  seed,
  count,
  len,
}: {
  seed: number
  count: number
  len: number
}) => (
  <svg
    className="gt-confetti"
    viewBox="0 0 1000 1000"
    preserveAspectRatio="none"
    aria-hidden="true"
  >
    {confetti(seed, count, len).map(([color, d]) => (
      <path key={color} className={`gt-c-${color}`} d={d} />
    ))}
  </svg>
)

// ---- Brilhos -----------------------------------------------------------------

const NIGHT_SPARKS: [string, string, string][] = [
  ['34vw', '8vh', '2.6vh'],
  ['3vw', '7vh', '2.6vh'],
  ['94vw', '55vh', '2.4vh'],
]
const GLINTS: [string, string, string][] = [
  ['11vw', '61vh', '3.4vh'],
  ['90vw', '33vh', '3vh'],
  ['96.5vw', '76vh', '2.6vh'],
]

const Sparkles = ({
  list,
  className,
  seed,
}: {
  list: [string, string, string][]
  className: string
  seed: number
}) => {
  const rand = seeded(seed)
  return list.map(([left, top, size]) => (
    <svg
      key={left + top}
      viewBox="0 0 100 100"
      className={className}
      style={{
        left,
        top,
        width: size,
        ...vars({
          '--gt-d': `${r1(5 + rand() * 9)}s`,
          '--gt-dl': `-${r1(rand() * 14)}s`,
        }),
      }}
      aria-hidden="true"
    >
      <path d={SPARKLE} />
    </svg>
  ))
}

const STARS_A = stars(3, 36)
const STARS_B = stars(9, 30)

export default function GoodTimesScene() {
  return (
    <>
      {/* céu: entardecer e noite cruzam a opacidade sobre o papel */}
      <div className="gt-sky gt-sky-dusk" />
      <div className="gt-sky gt-sky-night" />
      <div className="gt-grid" />

      {/* blocos de cor pastel com contorno preto */}
      <div className="gt-block gt-block-yellow" />
      <div className="gt-block gt-block-cyan" />
      <div className="gt-block gt-block-pink" />
      <div className="gt-block gt-block-lilac" />

      {/* noite: estrelas, brilhos e lua (acima dos blocos) */}
      <div className="gt-night">
        <svg
          className="gt-stars gt-stars-a"
          viewBox="0 0 1000 1000"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path d={STARS_A} />
        </svg>
        <svg
          className="gt-stars gt-stars-b"
          viewBox="0 0 1000 1000"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path d={STARS_B} />
        </svg>
        <Sparkles list={NIGHT_SPARKS} className="gt-twinkle" seed={21} />
      </div>
      <div className="gt-moon">
        <svg viewBox="0 0 100 100" aria-hidden="true">
          <path d="M58 8A42 42 0 1 0 92 70A34 34 0 1 1 58 8Z" />
        </svg>
      </div>
      <Fireworks />

      <div className="gt-layer gt-layer-far">
        <Confetti seed={77} count={70} len={14} />
        <ShapeLayer shapes={FAR} seed={5} still />
      </div>
      <Balloon />

      {/* sol listrado de óculos: se põe atrás da pista e volta no amanhecer */}
      <Sun />
      <p className="gt-kanji" lang="ja">
        良い時
      </p>
      <Palm className="gt-palm-1" />
      <Palm className="gt-palm-2" />

      {/* véu lilás da noite: escurece o fundo; a festa fica por cima */}
      <div className="gt-shade" />
      <Flecks />
      <p className="gt-kanji gt-kanji-neon" lang="ja" aria-hidden="true">
        良い時
      </p>

      <StringLights />
      <DiscoBall />
      <Solid kind="cube" className="gt-solid-cube" />
      <Solid kind="pyramid" className="gt-solid-pyr" />
      <Solid kind="prism" className="gt-solid-prism" />

      <div className="gt-layer gt-layer-near">
        <Confetti seed={1984} count={40} len={22} />
        <ShapeLayer shapes={NEAR} seed={11} />
      </div>
      <Stickers />
      <Cassette />
      <Plane />

      {/* lens flare de anime sobre o sol (só de dia) */}
      <div className="gt-flare">
        <i className="gt-flare-streak" />
        <i className="gt-flare-ghost" />
        <i className="gt-flare-ghost" />
      </div>

      <Floor />
      <Poppers />
      <Boombox />
      <BeachBall />
      <div className="gt-script-wrap">
        <p className="gt-script">Yoi Toki</p>
        <p className="gt-script gt-script-neon" aria-hidden="true">
          Yoi Toki
        </p>
      </div>

      {/* chuva rápida de confete pastel, duas vezes por ciclo */}
      <div className="gt-rain">
        <div className="gt-rain-fall" />
      </div>
      <Sparkles list={GLINTS} className="gt-glint" seed={42} />

      <WinSlap />
    </>
  )
}
