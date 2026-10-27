import type { CSSProperties, ReactNode } from 'react'
import {
  CASS,
  CLOUDS,
  DAY,
  DROPS_FAR,
  DROPS_NEAR,
  EQ,
  FAR,
  GRAIN,
  GROUND,
  INK,
  LATTICE,
  LEFT,
  LIT,
  NIGHT,
  RIGHT,
  SPHERE,
  STARS,
  STREAKS,
  STREAKS_THIN,
  SW,
  TH,
  TRACK,
  TW,
  VINYL,
  circle,
  heart,
  n,
  rect,
  rrect,
  sparkle,
  trainPaths,
  type Board,
  type Side,
} from './art'
import {
  CAR,
  CAR_H,
  CAR_W,
  GIRL_BASE,
  GIRL_EYE,
  GIRL_H,
  GIRL_LOCKS,
  GIRL_NIGHT,
  GIRL_SIDE_LOCK,
  GIRL_W,
  PALM_BACK,
  PALM_FRONT,
  PALM_H,
  PALM_TRUNK,
  PALM_W,
  type Part,
  type Shape,
} from './cast'

// Cena do tema Future Funk: um clipe de anime dos anos 80 tocando numa fita
// VHS. A cidade pop em rosa-chiclete e amarelo vive um dia inteiro em
// --ff-cycle (4 min); por cima dela corre a fita: linhas de varredura,
// grão, faixa clara rolando, chiado de troca de cabeça no rodapé, tropeços
// de tracking e o OSD do videocassete ("▶ PLAY" e o contador de fita).
//
// Elenco: a garota de fones no canto de baixo à esquerda (olhos fechados,
// cabelo ao vento, balança no ritmo; abre os olhos de vez em quando), o
// gatinho preto no telhado, o coqueiro na direita, vinil girando, rajadas
// de vento com pétalas de cerejeira, fita cassete gigante com
// carretéis, telão de equalizador, outdoors que rolam palavras, dirigível,
// trem na via elevada, conversível com um casal, pássaros, avião,
// estrelas cadentes, garoa de sol com arco-íris e garoa com relâmpago rosa.
//
// Linha do tempo (ver o cabeçalho do theme.css): dia de 240 s; legendas da
// música a cada 120 s; tropeço de tracking a cada 37 s; conversível a cada
// 97 s; trem a cada 30 s; a garota abre os olhos a cada 61 s; rajada de
// pétalas a cada 71 s; "◀◀ REW" raro a cada 293 s.
//
// Roleta (CSS, html[data-wheel]): girando = modo "▶▶ FF" (OSD piscando,
// contador disparado, faixas de tracking, telão enlouquecido, vinil e
// carretéis acelerados, cabelo chicoteando, ela abre os olhos); venceu =
// "☆ SORTE ☆" na cor da fatia, estouro de brilhos e corações, um flash
// suave e uma piscadela; depois fica só o letreiro aceso, parado.
//
// Componente sem estado: tudo é calculado uma vez (art.ts / cast.ts) e
// anima só transform/opacity em elementos HTML ou no <svg> de fora.

const vars = (v: Record<string, string | number>) => v as CSSProperties
// fase no ciclo do dia: a camada roda adiantada k (fração)
const phase = (k: number, extra: Record<string, string | number> = {}) =>
  vars({ '--ff-k': ((k + 1) % 1).toFixed(3), ...extra })
const cls = (...c: (string | false | undefined)[]) =>
  c.filter(Boolean).join(' ')
const pct = (v: number) => `${n(v * 100)}%`
// posição no palco lateral, em unidades de --ff-u
const at = (x: number, y: number, w: number, h: number) =>
  vars({
    left: `calc(${n(x)} * var(--ff-u))`,
    top: `calc(${n(y)} * var(--ff-u))`,
    width: `calc(${n(w)} * var(--ff-u))`,
    height: `calc(${n(h)} * var(--ff-u))`,
  })

function Shapes({ list }: { list: Shape[] }) {
  return (
    <>
      {list.map((s, i) => (
        <path
          key={i}
          d={s.d}
          fill={s.fill ?? 'none'}
          stroke={s.stroke}
          strokeWidth={s.stroke ? s.w : undefined}
          strokeLinecap={s.stroke ? 'round' : undefined}
          strokeLinejoin="round"
          opacity={s.o}
          transform={s.dx ? `translate(${s.dx} 0)` : undefined}
        />
      ))}
    </>
  )
}

// peça recortada pela própria caixa, girando em volta do pivô
function PartSvg({
  part,
  className,
  w,
  h,
}: {
  part: Part
  className: string
  w: number
  h: number
}) {
  const [x, y, bw, bh] = part.box
  return (
    <svg
      className={className}
      viewBox={`${x} ${y} ${bw} ${bh}`}
      style={vars({
        left: pct(x / w),
        top: pct(y / h),
        width: pct(bw / w),
        height: pct(bh / h),
        transformOrigin: `${pct((part.pivot[0] - x) / bw)} ${pct((part.pivot[1] - y) / bh)}`,
      })}
    >
      <Shapes list={part.shapes} />
    </svg>
  )
}

// ============ Elenco ============
const NOTE =
  'M10 4.5h2.2v12.2a3.6 2.9 -20 1 1 -2.2 -2.6zM12.2 4.5c2.6 1 6 2.6 5.6 7.2c-.8-2.6-2.8-3.6-5.6-3.8z'
const NOTES2 =
  'M8 6.5l11-3v12.3a3.3 2.7 -20 1 1 -2-2.4V8.3l-7 1.9v8.6a3.3 2.7 -20 1 1 -2-2.4z'

function Girl() {
  const box = `0 0 ${GIRL_W} ${GIRL_H}`
  return (
    <div
      className="ff-girl"
      style={{
        ...at(-20, 440, GIRL_W, GIRL_H),
        // em telas baixas ela desce: o rosto fica sempre abaixo da coluna
        // de temas (que termina perto de 560 px)
        top: 'max(calc(440 * var(--ff-u)), calc(560px - 100vh + 890 * var(--ff-u)))',
      }}
    >
      <div className="ff-locks">
        {GIRL_LOCKS.map((p, i) => (
          <PartSvg
            key={i}
            part={p}
            className={'ff-lock ff-lock-' + i}
            w={GIRL_W}
            h={GIRL_H}
          />
        ))}
      </div>
      <svg className="ff-fill" viewBox={box}>
        <Shapes list={GIRL_BASE} />
      </svg>
      <PartSvg
        part={GIRL_SIDE_LOCK}
        className="ff-lock ff-lock-s"
        w={GIRL_W}
        h={GIRL_H}
      />
      <svg className="ff-fill ff-girl-eye" viewBox={box}>
        <Shapes list={GIRL_EYE} />
        <path d={sparkle(238, 196, 9)} fill="#ffffff" />
      </svg>
      <svg className="ff-fill ff-c ff-cnight" viewBox={box}>
        <Shapes list={GIRL_NIGHT} />
      </svg>
      <span className="ff-led" />
      {[NOTE, NOTES2, NOTE].map((d, i) => (
        <span key={i} className={'ff-note ff-note-' + i}>
          <svg viewBox="0 0 24 24">
            <path
              d={d}
              fill={['#ffe14d', '#7ff3ff', '#ff8fd0'][i]}
              stroke={INK}
              strokeWidth="1.4"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      ))}
      {/* vitória: corações saltando do fone */}
      {[0, 1, 2, 3].map((i) => (
        <span key={i} className={'ff-love ff-love-' + i}>
          <svg viewBox="0 0 24 24">
            <path
              d={heart(12, 12, 9.5)}
              fill={i % 2 ? '#ffe14d' : '#ff4fa3'}
              stroke={INK}
              strokeWidth="1.6"
            />
          </svg>
        </span>
      ))}
    </div>
  )
}

function Palm() {
  return (
    <div className="ff-palm" style={at(214, 540, PALM_W, PALM_H)}>
      <PartSvg
        part={PALM_BACK}
        className="ff-frond ff-frond-b"
        w={PALM_W}
        h={PALM_H}
      />
      <svg className="ff-fill" viewBox={`0 0 ${PALM_W} ${PALM_H}`}>
        <Shapes list={PALM_TRUNK} />
      </svg>
      <PartSvg
        part={PALM_FRONT}
        className="ff-frond ff-frond-f"
        w={PALM_W}
        h={PALM_H}
      />
    </div>
  )
}

// ============ Bordas da cidade ============
function Vinyl() {
  const { x, y, r } = VINYL
  return (
    <div className="ff-vinyl-wrap" style={at(x - r, y - r, 2 * r, 2 * r)}>
      <svg className="ff-vinyl" viewBox={`${-r} ${-r} ${2 * r} ${2 * r}`}>
        <circle r={r - 2} fill="#1d0b33" stroke={INK} strokeWidth="4" />
        <path
          d={
            circle(0, 0, r * 0.82) +
            circle(0, 0, r * 0.66) +
            circle(0, 0, r * 0.5)
          }
          fill="none"
          stroke="#4a2b78"
          strokeWidth="1.6"
        />
        {/* reflexo em cunha (gira junto e denuncia o giro) */}
        <path
          d={`M0 0L${n(r * 0.92)} ${n(-r * 0.3)}A${n(r * 0.92)} ${n(r * 0.92)} 0 0 1 ${n(r * 0.92)} ${n(r * 0.3)}ZM0 0L${n(-r * 0.92)} ${n(r * 0.3)}A${n(r * 0.92)} ${n(r * 0.92)} 0 0 1 ${n(-r * 0.92)} ${n(-r * 0.3)}Z`}
          fill="#ffffff"
          opacity="0.16"
        />
        <circle r={r * 0.34} fill="#ff4fa3" stroke={INK} strokeWidth="2" />
        <path d={heart(0, -1, 9)} fill="#ffe14d" />
        <circle r="3.2" fill={INK} />
      </svg>
    </div>
  )
}

// gatinho preto no telhado, ao lado do vinil: rabo balançando e piscadas
const CAT_BODY =
  'M13 47C9 38 11 27 19 23C15 20 13 15 14 10L12 2L19 7C21 6 25 6 27 7L33 2L32 11C33 16 31 20 28 23C34 27 36 38 32 47Z'
function Cat() {
  return (
    <div className="ff-cat" style={at(96, 233, 44, 50)}>
      <svg className="ff-cat-tail" viewBox="0 0 44 50">
        <path
          d="M15 45C4 46 1 36 6 29C8 26 6 22 3 21"
          fill="none"
          stroke={INK}
          strokeWidth="4.5"
          strokeLinecap="round"
        />
      </svg>
      <svg className="ff-fill" viewBox="0 0 44 50">
        <path d={CAT_BODY} fill={INK} />
        <path
          d="M28 23C34 27 36 38 32 47M27 7L33 2L32 11"
          fill="none"
          stroke="#ff8fd0"
          strokeWidth="1.6"
          strokeLinecap="round"
          opacity="0.9"
        />
        <path d={rrect(17, 21.5, 13, 3, 1.5)} fill="#ff4fa3" />
        <path
          d={circle(23.5, 26, 2.2)}
          fill="#ffe14d"
          stroke="#2b1055"
          strokeWidth="0.8"
        />
        <path
          d="M18.5 14a1.8 2.4 0 1 0 3.6 0a1.8 2.4 0 1 0 -3.6 0ZM25 14a1.8 2.4 0 1 0 3.6 0a1.8 2.4 0 1 0 -3.6 0Z"
          fill="#fff27a"
        />
        <path d={circle(23.6, 17.6, 0.9)} fill="#ff8fd0" />
      </svg>
      <svg className="ff-fill ff-cat-blink" viewBox="0 0 44 50">
        <path d="M18 13.2h11v2h-11z" fill={INK} />
      </svg>
    </div>
  )
}

const HUB = (() => {
  let d = circle(0, 0, 10)
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2
    d += circle(Math.cos(a) * 6.4, Math.sin(a) * 6.4, 1.6)
  }
  return d
})()

function Cassette() {
  const { x, y, w, h } = CASS
  const reels = [44, 88]
  return (
    <div className="ff-cass" style={at(x, y, w, h)}>
      <svg className="ff-fill" viewBox={`0 0 ${w} ${h}`}>
        <path
          d={rrect(2, 2, w - 4, h - 4, 9)}
          fill="#ffe14d"
          stroke={INK}
          strokeWidth="3.5"
        />
        <path
          d={rrect(10, 8, w - 20, 52, 6)}
          fill="#ffffff"
          stroke={INK}
          strokeWidth="2.5"
        />
        <path d={rect(12, 10, w - 24, 10)} fill="#ff4fa3" />
        <text
          x="16"
          y="18"
          fill="#ffffff"
          fontSize="8.5"
          style={vars({ fontFamily: 'var(--font-silkscreen), monospace' })}
        >
          SIDE A · MIX
        </text>
        {/* janela com a fita enrolada (mais fita no carretel da esquerda) */}
        <path
          d={rrect(26, 26, w - 52, 26, 12)}
          fill="#3a1a6e"
          stroke={INK}
          strokeWidth="2.5"
        />
        <path d={circle(44, 39, 12.5)} fill="#7a3b2e" />
        <path d={circle(88, 39, 9)} fill="#7a3b2e" />
        <path d={rect(44, 50, 44, 2.5)} fill="#7a3b2e" />
        <path
          d="M30 86L38 66H94L102 86Z"
          fill="#ffd23f"
          stroke={INK}
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        <path d={circle(48, 76, 3) + circle(84, 76, 3)} fill={INK} />
        <path d={rect(14, 24, 6, 30)} fill="#ffffff" opacity="0.5" />
      </svg>
      {reels.map((cx, i) => (
        <span
          key={i}
          className="ff-reel"
          style={vars({
            left: pct((cx - 10) / w),
            top: pct((39 - 10) / h),
            width: pct(20 / w),
            height: pct(20 / h),
          })}
        >
          <svg className="ff-hub" viewBox="-10 -10 20 20">
            <path d={HUB} fill="#ffffff" fillRule="evenodd" />
          </svg>
        </span>
      ))}
    </div>
  )
}

// telão de LED: barras fixas em degradê; tampas escuras sobem e descem
const EQ_COLS = 8
function Equalizer() {
  const { x, y, w, h } = EQ
  const caps = (k: string) => (
    <div className={'ff-eq-caps ff-eq-' + k}>
      {Array.from({ length: EQ_COLS }, (_, i) => (
        <span key={i} style={vars({ left: pct(i / EQ_COLS) })} />
      ))}
    </div>
  )
  return (
    <div className="ff-eq" style={at(x, y, w, h)}>
      <div className="ff-eq-screen">
        {caps('calm')}
        {caps('wild')}
        <span className="ff-eq-grid" />
      </div>
      <span className="ff-eq-label">サウンド</span>
    </div>
  )
}

// outdoor: as palavras rolam numa fita (uma camada só por outdoor)
function BoardWords({ b }: { b: Board }) {
  const words = [...b.words, b.words[0]]
  return (
    <div
      className="ff-board"
      style={{ ...at(b.x + 4, b.y + 4, b.w - 8, b.h - 8), color: b.text }}
    >
      <div className="ff-roll" style={vars({ animationDelay: `${b.delay}s` })}>
        {words.map((word, i) => (
          <span
            key={i}
            style={vars({
              fontSize: `calc(${n(Math.min(30, (b.w - 18) / word.length))} * var(--ff-u))`,
            })}
          >
            {word}
          </span>
        ))}
      </div>
    </div>
  )
}

function BoardFrame({ b }: { b: Board }) {
  return (
    <>
      <path d={rrect(b.x - 6, b.y - 6, b.w + 12, b.h + 12, 10)} fill={INK} />
      <path d={rrect(b.x, b.y, b.w, b.h, 6)} fill={b.panel} />
      <path
        d={rrect(b.x + 4, b.y + 4, b.w - 8, 6, 3)}
        fill="#ffffff"
        opacity="0.55"
      />
    </>
  )
}

function SideView({ side, right }: { side: Side; right: boolean }) {
  const box = `0 0 ${SW} ${GROUND}`
  return (
    <div className={cls('ff-stage', right ? 'ff-stage-r' : 'ff-stage-l')}>
      {/* dia: fachadas pastel com janelas que refletem o céu */}
      <svg className="ff-fill" viewBox={box}>
        {side.dayFill.map((d, i) => d && <path key={i} d={d} fill={DAY[i]} />)}
        <path d={side.bands} fill="#ffe14d" />
        <path d={side.winDay} fill="#9fe6ff" />
        <path d={side.winGlint} fill="#ffffff" />
      </svg>
      {/* noite: as mesmas formas em roxo, cruzando a opacidade */}
      <svg className="ff-fill ff-c ff-cnight" viewBox={box}>
        {side.nightFill.map(
          (d, i) => d && <path key={i} d={d} fill={NIGHT[i]} />,
        )}
        <path d={side.bands} fill="#ff4fa3" opacity="0.8" />
        <path d={side.winDark} fill="#25104a" />
      </svg>
      {/* janelas acesas em dois grupos (acendem fora de ordem) */}
      <svg className="ff-fill ff-c ff-win" style={phase(0)} viewBox={box}>
        {side.litA.map((d, i) => d && <path key={i} d={d} fill={LIT[i]} />)}
      </svg>
      <svg className="ff-fill ff-c ff-win" style={phase(0.03)} viewBox={box}>
        {side.litB.map((d, i) => d && <path key={i} d={d} fill={LIT[i]} />)}
      </svg>
      {/* luz da noite: halos, neon das quinas, lâmpadas dos outdoors */}
      <svg className="ff-fill ff-c ff-glow" viewBox={box}>
        {side.boards.map((b, i) => (
          <ellipse
            key={i}
            cx={n(b.x + b.w / 2)}
            cy={n(b.y + b.h / 2)}
            rx={n(b.w * 0.95)}
            ry={n(b.h * 1.5)}
            fill={`url(#ff-halo-${right ? 'pink' : 'yellow'})`}
          />
        ))}
        {right ? (
          <>
            <ellipse
              cx={EQ.x + EQ.w / 2}
              cy={EQ.y + EQ.h / 2}
              rx={EQ.w * 0.95}
              ry={EQ.h * 0.95}
              fill="url(#ff-halo-cyan)"
            />
            <ellipse
              cx={CASS.x + CASS.w / 2}
              cy={CASS.y + CASS.h / 2}
              rx={CASS.w * 0.9}
              ry={CASS.h * 1.1}
              fill="url(#ff-halo-yellow)"
            />
          </>
        ) : (
          <circle
            cx={VINYL.x}
            cy={VINYL.y}
            r={VINYL.r * 1.9}
            fill="url(#ff-halo-pink)"
          />
        )}
        {side.neon.map((s, i) => (
          <g key={i}>
            <path d={s.d} stroke={s.color} strokeWidth="12" opacity="0.25" />
            <path
              d={s.d}
              stroke={s.color}
              strokeWidth="4"
              strokeLinecap="round"
            />
            <path
              d={s.d}
              stroke="#ffffff"
              strokeWidth="1.4"
              strokeLinecap="round"
            />
          </g>
        ))}
        <path d={side.bulbs} fill="#fff6b0" />
      </svg>
      {/* traço de HQ e molduras por cima de tudo */}
      <svg className="ff-fill" viewBox={box}>
        <path
          d={side.outline}
          fill="none"
          stroke={INK}
          strokeWidth="4"
          strokeLinejoin="round"
        />
        {side.boards.map((b, i) => (
          <BoardFrame key={i} b={b} />
        ))}
        {right ? (
          <path
            d={
              rect(CASS.x + 30, CASS.y + CASS.h - 2, 8, 20) +
              rect(CASS.x + CASS.w - 38, CASS.y + CASS.h - 2, 8, 20)
            }
            fill="#ff6fb5"
            stroke={INK}
            strokeWidth="2.5"
          />
        ) : (
          <path
            d={
              rect(
                VINYL.x - 7,
                VINYL.y + VINYL.r - 6,
                14,
                282 - (VINYL.y + VINYL.r - 6),
              ) + rect(VINYL.x - 26, 272, 52, 10)
            }
            fill="#ff6fb5"
            stroke={INK}
            strokeWidth="3"
          />
        )}
      </svg>
      {side.boards.map((b, i) => (
        <BoardWords key={i} b={b} />
      ))}
      {right ? (
        <>
          <Cassette />
          <Equalizer />
          <Palm />
        </>
      ) : (
        <>
          <Vinyl />
          <Cat />
          <Girl />
        </>
      )}
    </div>
  )
}

// ============ Torres que espiam por cima dos cartões ============
function Towers() {
  return (
    <>
      <svg
        className="ff-tower ff-tower-lattice"
        viewBox="0 0 200 1000"
        preserveAspectRatio="xMidYMax meet"
      >
        <path d={LATTICE.legs} fill="#ff5fa2" stroke={INK} strokeWidth="2.5" />
        <path d={LATTICE.brace} fill="none" stroke="#ff5fa2" strokeWidth="3" />
        <path d={LATTICE.antenna} fill="#ffffff" stroke={INK} strokeWidth="2" />
        <path d={LATTICE.antBands} fill="#ff5fa2" />
        <path
          d={LATTICE.deckBig + LATTICE.deckTop}
          fill="#ffffff"
          stroke={INK}
          strokeWidth="3"
        />
        <path d={LATTICE.deckWin} fill="#9fe6ff" />
      </svg>
      <svg
        className="ff-tower ff-tower-lattice ff-c ff-cnight"
        viewBox="0 0 200 1000"
        preserveAspectRatio="xMidYMax meet"
      >
        <path
          d={LATTICE.silhouette}
          fill="#4a2183"
          stroke={INK}
          strokeWidth="2.5"
        />
        <path d={LATTICE.deckWin} fill="#ffe14d" />
        <path d={LATTICE.edge} fill="#ffb3dc" />
      </svg>
      <span className="ff-beacon ff-beacon-a ff-c" />
      <svg
        className="ff-tower ff-tower-sphere"
        viewBox="0 0 200 1000"
        preserveAspectRatio="xMidYMax meet"
      >
        <path d={SPHERE.antenna} fill="#ffffff" stroke={INK} strokeWidth="2" />
        <path d={SPHERE.body} fill="#ffffff" stroke={INK} strokeWidth="3" />
        <path d={SPHERE.bands} fill="#ff8fd0" />
        <path d={SPHERE.deck} fill="#cfb6ff" stroke={INK} strokeWidth="3" />
        <path d={SPHERE.deckWin} fill="#9fe6ff" />
        <path d={SPHERE.sphere} fill="#ffe14d" stroke={INK} strokeWidth="3" />
        <path d={circle(89, 61, 8)} fill="#ffffff" opacity="0.85" />
        <path d={SPHERE.ring} fill="none" stroke="#ff4fa3" strokeWidth="5" />
      </svg>
      <svg
        className="ff-tower ff-tower-sphere ff-c ff-cnight"
        viewBox="0 0 200 1000"
        preserveAspectRatio="xMidYMax meet"
      >
        <path
          d={SPHERE.silhouette}
          fill="#4a2183"
          stroke={INK}
          strokeWidth="3"
        />
        <path d={SPHERE.sphere} fill="#ff8fd0" stroke={INK} strokeWidth="3" />
        <path d={circle(89, 61, 8)} fill="#ffd6ee" />
        <path d={SPHERE.ring} fill="none" stroke="#7ff3ff" strokeWidth="4" />
        <path d={SPHERE.deckWin} fill="#ffe14d" />
        <path d={SPHERE.dots} fill="#fff6b0" />
      </svg>
      <span className="ff-beacon ff-beacon-b ff-c" />
    </>
  )
}

// ============ Céu ============
function Cloud({ c }: { c: (typeof CLOUDS)[number] }) {
  return (
    <svg
      className="ff-cloud"
      viewBox="0 0 240 104"
      style={vars({
        top: c.top,
        width: c.w,
        animationDuration: `${c.dur}s`,
        animationDelay: `${c.delay}s`,
      })}
    >
      <path
        d={c.all}
        fill="#ffc2e2"
        stroke="#b03a8a"
        strokeWidth="5"
        strokeLinejoin="round"
      />
      <path d={c.top} fill="#ffffff" />
    </svg>
  )
}

const BIRD = 'M2 8q5-6 10 0q5-6 10 0'
function Bird({ d }: { d: number }) {
  return (
    <svg
      className="ff-bird"
      viewBox="0 0 24 14"
      style={vars({ animationDelay: `${d}s` })}
    >
      <path
        d={BIRD}
        fill="none"
        stroke={INK}
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

const BLIMP_WORDS = ['ファンク', 'ポップ', '夏', 'ファンク']

// ============ Trilho: via elevada, trens, conversível ============
const TRAIN_A = trainPaths(4)
const TRAIN_B = trainPaths(3)

function Train({
  t,
  bodyFill,
  stripeFill,
  stripe2Fill,
  className,
}: {
  t: ReturnType<typeof trainPaths>
  bodyFill: string
  stripeFill: string
  stripe2Fill: string
  className: string
}) {
  return (
    <svg className={className} viewBox={`0 12 ${t.len} 32`}>
      <path d={t.gaps} fill={INK} />
      <path
        d={t.body}
        fill={bodyFill}
        stroke={INK}
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <path d={t.stripe} fill={stripeFill} />
      <path d={t.stripe2} fill={stripe2Fill} />
      <path d={t.windows} fill="#fff4b8" stroke={INK} strokeWidth="1.2" />
    </svg>
  )
}

function Rail() {
  return (
    <div className="ff-rail">
      <Train
        t={TRAIN_A}
        bodyFill="#ffffff"
        stripeFill="#ff4fa3"
        stripe2Fill="#ffe14d"
        className="ff-train ff-train-a"
      />
      <Train
        t={TRAIN_B}
        bodyFill="#ffb3dc"
        stripeFill="#ffffff"
        stripe2Fill="#7ff3ff"
        className="ff-train ff-train-b"
      />
      <svg
        className="ff-track"
        viewBox={`0 40 ${TW} ${TH - 30}`}
        preserveAspectRatio="xMidYMax slice"
      >
        <path
          d={rect(-10, 42, TW + 20, 16)}
          fill="#ff8fd0"
          stroke={INK}
          strokeWidth="3"
        />
        <path d={rect(-10, 42, TW + 20, 3)} fill="#ffe14d" />
        <path d={TRACK.seams} stroke={INK} strokeWidth="1.5" opacity="0.5" />
        <path d={TRACK.rivets} fill={INK} opacity="0.35" />
        <path d={TRACK.posts} fill="#c84f9a" stroke={INK} strokeWidth="2" />
      </svg>
      <svg
        className="ff-track ff-c ff-cnight"
        viewBox={`0 40 ${TW} ${TH - 30}`}
        preserveAspectRatio="xMidYMax slice"
      >
        <path d={rect(-10, 45, TW + 20, 13)} fill="#4a2183" />
        <path d={rect(-10, 42, TW + 20, 3)} fill="#ff6fd0" />
      </svg>
      <div className="ff-car">
        <svg viewBox={`0 0 ${CAR_W} ${CAR_H}`}>
          <Shapes list={CAR} />
        </svg>
        <span className="ff-car-beam" />
      </div>
    </div>
  )
}

// ============ Coisinhas flutuando: corações, notas, estrelas ============
const FLOAT_SHAPES: Record<string, ReactNode> = {
  heart: (
    <path
      d={heart(12, 12, 9.5)}
      fill="#ff4fa3"
      stroke={INK}
      strokeWidth="1.6"
    />
  ),
  heart2: (
    <path
      d={heart(12, 12, 9.5)}
      fill="#ffe14d"
      stroke={INK}
      strokeWidth="1.6"
    />
  ),
  note: (
    <path
      d={NOTE}
      fill="#7ff3ff"
      stroke={INK}
      strokeWidth="1.4"
      strokeLinejoin="round"
    />
  ),
  notes: (
    <path
      d={NOTES2}
      fill="#ff8fd0"
      stroke={INK}
      strokeWidth="1.4"
      strokeLinejoin="round"
    />
  ),
  star: (
    <path
      d={sparkle(12, 12, 10)}
      fill="#ffffff"
      stroke={INK}
      strokeWidth="1.3"
    />
  ),
}
// nas bordas e no vão embaixo da coluna de temas
const FLOATS = [
  {
    kind: 'heart',
    left: 2.5,
    size: 30,
    dur: 19,
    delay: -3,
    sw: '3vw',
    rot: '-20deg',
  },
  {
    kind: 'note',
    left: 7.5,
    size: 26,
    dur: 23,
    delay: -14,
    sw: '-2vw',
    rot: '18deg',
  },
  {
    kind: 'star',
    left: 93.5,
    size: 28,
    dur: 21,
    delay: -8,
    sw: '-3vw',
    rot: '25deg',
  },
  {
    kind: 'heart2',
    left: 97,
    size: 24,
    dur: 26,
    delay: -19,
    sw: '2vw',
    rot: '-15deg',
  },
  {
    kind: 'notes',
    left: 12.5,
    size: 26,
    dur: 24,
    delay: -1,
    sw: '2.5vw',
    rot: '12deg',
  },
]
// rajada de vento: pétalas atravessam da direita para a esquerda
const PETAL = 'M10 3L8 0C3 4 2 11 10 19C18 11 17 4 12 0Z'
const PETALS = [
  { top: 4, size: 26, delay: 0 },
  { top: 22, size: 30, delay: -0.5 },
  { top: 38, size: 22, delay: -1.1 },
  { top: 9, size: 28, delay: -1.6 },
  { top: 58, size: 32, delay: -0.8 },
  { top: 74, size: 24, delay: -2.1 },
  { top: 30, size: 20, delay: -2.6 },
  { top: 88, size: 28, delay: -1.4 },
]
const SPARKS = [
  { left: 3, top: 30, size: 26, dur: 3.1, delay: -0.4 },
  { left: 8.5, top: 63, size: 20, dur: 4.3, delay: -2.1 },
  { left: 95.5, top: 36, size: 24, dur: 3.7, delay: -1.2 },
  { left: 40, top: 2.5, size: 22, dur: 4.9, delay: -3.3 },
  { left: 71, top: 5, size: 18, dur: 3.4, delay: -0.9 },
]

// ============ Fita: OSD, legendas, vitória ============
const LYRICS: [string, string][] = [
  ['♪ ルーレット・ラブ ♪', 'Roleta do Amor · lado A'],
  ['回せ 回せ 恋のルーレット', 'gira, gira, roleta do amor'],
  ['ネオンの街で 君を待つ', 'te espero na cidade neon'],
  ['夢は ピンクと イエロー', 'o sonho é rosa e amarelo'],
  ['今夜は きっと ラッキー', 'hoje à noite a sorte é minha'],
]

// algarismo do contador: fita vertical 0–9 andando em degraus
function Digit({ k, top = 9 }: { k: string; top?: number }) {
  return (
    <span className="ff-dg">
      <span className={'ff-dg-strip ff-dg-' + k}>
        {Array.from({ length: top + 1 }, (_, i) => (
          <span key={i}>{i}</span>
        ))}
      </span>
    </span>
  )
}

const TRI = 'M0 0L10 6L0 12Z'
function Glyph({ d, w = 10 }: { d: string; w?: number }) {
  return (
    <svg className="ff-glyph" viewBox={`-1 -1 ${w + 2} 14`}>
      <path d={d} fill="#ffffff" stroke={INK} strokeWidth="1.4" />
    </svg>
  )
}

const BURST = Array.from({ length: 12 }, (_, i) => {
  const a = (i / 12) * Math.PI * 2 + 0.2
  const r = i % 2 ? 150 : 230
  return {
    x: `${Math.round(Math.cos(a) * r)}px`,
    y: `${Math.round(Math.sin(a) * r * 0.55)}px`,
    rot: `${(i % 2 ? 1 : -1) * (90 + i * 20)}deg`,
    kind: i % 3,
    delay: `${(i % 4) * 0.05}s`,
  }
})

function Vhs() {
  return (
    <>
      {/* fita: varredura, faixa clara rolando, grão, chiado do rodapé */}
      <div className="ff-vhs">
        <span className="ff-vhs-roll" />
        <span
          className="ff-vhs-grain"
          style={vars({ backgroundImage: GRAIN })}
        />
        <span className="ff-vhs-lines" />
        <span
          className="ff-vhs-glitch"
          style={vars({ backgroundImage: STREAKS })}
        />
        <span
          className="ff-vhs-rew"
          style={vars({ backgroundImage: STREAKS })}
        />
        <span
          className="ff-vhs-ff ff-vhs-ff-a"
          style={vars({ backgroundImage: STREAKS })}
        />
        <span
          className="ff-vhs-ff ff-vhs-ff-b"
          style={vars({ backgroundImage: STREAKS })}
        />
        <span
          className="ff-vhs-head"
          style={vars({ backgroundImage: STREAKS_THIN })}
        />
      </div>

      {/* vitória: letreiro na cor da fatia, estouro de brilhos, flash */}
      <span className="ff-won-flash" />
      <div className="ff-sorte">
        <div className="ff-burst">
          {BURST.map((b, i) => (
            <span
              key={i}
              className={'ff-bit ff-bit-' + b.kind}
              style={vars({
                '--ff-bx': b.x,
                '--ff-by': b.y,
                '--ff-br': b.rot,
                animationDelay: b.delay,
              })}
            >
              <svg viewBox="0 0 24 24">
                <path
                  d={b.kind === 1 ? heart(12, 12, 9.5) : sparkle(12, 12, 11)}
                  stroke={INK}
                  strokeWidth="1.4"
                />
              </svg>
            </span>
          ))}
        </div>
        <div className="ff-sorte-word">
          <svg className="ff-sorte-star" viewBox="0 0 24 24">
            <path d={sparkle(12, 12, 11)} stroke={INK} strokeWidth="1.5" />
          </svg>
          <span>SORTE</span>
          <svg className="ff-sorte-star" viewBox="0 0 24 24">
            <path d={sparkle(12, 12, 11)} stroke={INK} strokeWidth="1.5" />
          </svg>
        </div>
      </div>

      {/* OSD do videocassete (por cima do ruído, como no aparelho) */}
      <div className="ff-osd">
        <div className="ff-osd-mode">
          <span className="ff-osd-play">
            <Glyph d={TRI} />
            PLAY
          </span>
          <span className="ff-osd-ff">
            <Glyph d={TRI + 'M10 0L20 6L10 12Z'} w={20} />
            FF ×8
          </span>
          <span className="ff-osd-rew">
            <Glyph d="M20 0L10 6L20 12ZM10 0L0 6L10 12Z" w={20} />
            REW
          </span>
        </div>
        <div className="ff-osd-count">
          <small>SP</small>
          <span className="ff-count ff-count-play">
            0:1
            <Digit k="m" />:
            <Digit k="st" top={5} />
            <Digit k="s" />
          </span>
          <span className="ff-count ff-count-ff">
            0:1
            <Digit k="m" />:
            <Digit k="fst" top={5} />
            <Digit k="fs" />
          </span>
        </div>
      </div>
    </>
  )
}

// ============ Cena ============
export default function FutureFunkScene() {
  return (
    <>
      <svg className="ff-defs" width="0" height="0" aria-hidden="true">
        <defs>
          <radialGradient id="ff-halo-pink">
            <stop offset="0" stopColor="#ff4fa3" stopOpacity="0.75" />
            <stop offset="0.5" stopColor="#ff4fa3" stopOpacity="0.22" />
            <stop offset="1" stopColor="#ff4fa3" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="ff-halo-cyan">
            <stop offset="0" stopColor="#5ef0ff" stopOpacity="0.7" />
            <stop offset="0.5" stopColor="#5ef0ff" stopOpacity="0.2" />
            <stop offset="1" stopColor="#5ef0ff" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="ff-halo-yellow">
            <stop offset="0" stopColor="#ffe14d" stopOpacity="0.7" />
            <stop offset="0.5" stopColor="#ffe14d" stopOpacity="0.2" />
            <stop offset="1" stopColor="#ffe14d" stopOpacity="0" />
          </radialGradient>
        </defs>
      </svg>

      <div className="ff-world">
        {/* céus que se cruzam (o meio-dia rosa é o fundo do tema) */}
        <div className="ff-sky ff-c ff-sky-dawn" />
        <div className="ff-sky ff-c ff-sky-sunset" />
        <div className="ff-sky ff-c ff-sky-night" />
        <div className="ff-dots ff-c" />

        <div className="ff-stars ff-c">
          <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMin slice">
            <path d={STARS.dots} fill="#fff6d6" />
          </svg>
          <svg
            className="ff-twinkle"
            viewBox="0 0 1600 900"
            preserveAspectRatio="xMidYMin slice"
          >
            <path d={STARS.a} fill="#ffffff" />
          </svg>
          <svg
            className="ff-twinkle ff-twinkle-b"
            viewBox="0 0 1600 900"
            preserveAspectRatio="xMidYMin slice"
          >
            <path d={STARS.b} fill="#ffe9a8" />
          </svg>
        </div>
        {[
          { g: 0.66, top: '5vh', left: '58vw' },
          { g: 0.79, top: '3vh', left: '84vw' },
        ].map((s, i) => (
          <div
            key={i}
            className="ff-shoot-wrap"
            style={vars({ top: s.top, left: s.left })}
          >
            <span className="ff-shoot ff-c" style={phase(-s.g)} />
          </div>
        ))}

        <div className="ff-rainbow ff-c" />

        {/* sol: nasce na esquerda, passa no alto, afunda atrás da cidade */}
        <div className="ff-sun ff-c" style={phase(0.08)}>
          <span className="ff-sun-rays" />
          <span className="ff-sun-glow" />
          <span className="ff-sun-disc" />
          <span className="ff-sun-hot ff-c" />
          <span className="ff-sun-shine" />
          <div className="ff-flare ff-c">
            <span className="ff-flare-streak" />
            <span className="ff-flare-streak ff-flare-thin" />
            <svg className="ff-flare-star" viewBox="0 0 100 100">
              <path d={sparkle(50, 50, 50)} fill="#ffffff" />
            </svg>
            <span className="ff-flare-ghost" />
            <span className="ff-flare-ghost ff-g2" />
            <span className="ff-flare-ghost ff-g3" />
          </div>
        </div>
        {/* lua grande de anime */}
        <div className="ff-moon ff-c" style={phase(0.45)}>
          <span className="ff-moon-halo" />
          <span className="ff-moon-disc" />
        </div>

        <div className="ff-clouds ff-c">
          {CLOUDS.filter((c) => c.far).map((c) => (
            <Cloud key={c.seed} c={c} />
          ))}
        </div>

        <Towers />

        <svg
          className="ff-far"
          viewBox="0 0 1600 400"
          preserveAspectRatio="xMidYMax slice"
        >
          <path d={FAR.day[0]} fill="#ffb8de" stroke={INK} strokeWidth="2" />
          <path d={FAR.day[1]} fill="#e7cbff" stroke={INK} strokeWidth="2" />
        </svg>
        <svg
          className="ff-far ff-c ff-cnight"
          viewBox="0 0 1600 400"
          preserveAspectRatio="xMidYMax slice"
        >
          <path
            d={FAR.day[0] + FAR.day[1]}
            fill="#2f1564"
            stroke={INK}
            strokeWidth="2"
          />
          <path d={FAR.lights} fill="#ffe14d" />
        </svg>

        <div className="ff-birds ff-c" style={phase(-0.07)}>
          <Bird d={0} />
          <Bird d={-0.15} />
          <Bird d={-0.3} />
        </div>
        <div className="ff-plane ff-c" style={phase(-0.62)}>
          <svg viewBox="0 0 70 24">
            <path
              d="M4 12q0-3 6-3h44l10-7h4l-5 10q0 3-5 3H10q-6 0-6-3z"
              fill="#e9dcff"
              stroke={INK}
              strokeWidth="1.6"
            />
            <path
              d="M30 12l-8 9h6l12-9z"
              fill="#cdb4ff"
              stroke={INK}
              strokeWidth="1.4"
            />
            <path d={rect(16, 10, 30, 2)} fill="#ffe14d" />
          </svg>
          <span className="ff-plane-light" />
        </div>

        <div className="ff-clouds ff-c">
          {CLOUDS.filter((c) => !c.far).map((c) => (
            <Cloud key={c.seed} c={c} />
          ))}
        </div>

        {/* dirigível com letreiro rolando palavras */}
        <div className="ff-blimp">
          <div className="ff-blimp-bob">
            <svg viewBox="0 0 220 96">
              <path
                d="M200 40l14-22h-14l-16 18zM200 52l14 22h-14l-16-18z"
                fill="#ff4fa3"
                stroke={INK}
                strokeWidth="3"
                strokeLinejoin="round"
              />
              <path
                d="M192 46c0-22-46-36-96-36s-88 14-88 36 38 36 88 36 96-14 96-36z"
                fill="#ffffff"
                stroke={INK}
                strokeWidth="3.5"
              />
              <path
                d="M180 30c-30-12-120-14-160-2"
                fill="none"
                stroke="#ff8fd0"
                strokeWidth="6"
                strokeLinecap="round"
              />
              <path
                d={rrect(86, 80, 40, 12, 5)}
                fill="#ffe14d"
                stroke={INK}
                strokeWidth="2.5"
              />
              <path d={rrect(38, 36, 112, 26, 7)} fill="#2b1055" />
            </svg>
            <div className="ff-blimp-sign">
              <div className="ff-roll ff-roll-blimp">
                {BLIMP_WORDS.map((w, i) => (
                  <span
                    key={i}
                    style={vars({
                      color: ['#ff8fd0', '#7ff3ff', '#ffe14d', '#ff8fd0'][i],
                    })}
                  >
                    {w}
                  </span>
                ))}
              </div>
            </div>
            <span className="ff-blimp-light" />
          </div>
        </div>

        <SideView side={LEFT} right={false} />
        <SideView side={RIGHT} right />

        <div className="ff-tint ff-c" />
        <div className="ff-fog ff-c" />

        <Rail />

        {/* garoa de sol: gotas brilhantes em duas camadas */}
        <div className="ff-rain ff-c">
          <span
            className="ff-drops ff-drops-far"
            style={vars({ backgroundImage: DROPS_FAR })}
          />
          <span
            className="ff-drops ff-drops-near"
            style={vars({ backgroundImage: DROPS_NEAR })}
          />
        </div>

        {FLOATS.map((f, i) => (
          <div
            key={i}
            className="ff-float"
            style={vars({
              left: `${f.left}vw`,
              width: `${f.size}px`,
              animationDuration: `${f.dur}s`,
              animationDelay: `${f.delay}s`,
              '--ff-sw': f.sw,
              '--ff-rot': f.rot,
            })}
          >
            <svg viewBox="0 0 24 24">{FLOAT_SHAPES[f.kind]}</svg>
          </div>
        ))}
        {PETALS.map((p, i) => (
          <span
            key={i}
            className="ff-petal"
            style={vars({
              top: `${p.top}vh`,
              width: `${p.size}px`,
              '--ff-pd': `${p.delay}s`,
            })}
          >
            <svg viewBox="0 0 20 20">
              <path
                d={PETAL}
                fill={i % 3 ? '#ffb3d9' : '#ffffff'}
                stroke={INK}
                strokeWidth="1.3"
                strokeLinejoin="round"
              />
              <path
                d="M10 4.5Q8.6 10 10 15"
                fill="none"
                stroke="#ff4fa3"
                strokeWidth="1.2"
                strokeLinecap="round"
              />
            </svg>
          </span>
        ))}
        {SPARKS.map((s, i) => (
          <svg
            key={i}
            className="ff-spark"
            viewBox="0 0 40 40"
            style={vars({
              left: `${s.left}vw`,
              top: `${s.top}vh`,
              width: `${s.size}px`,
              animationDuration: `${s.dur}s`,
              animationDelay: `${s.delay}s`,
            })}
          >
            <path d={sparkle(20, 20, 19)} fill="#ffffff" />
            <path d={sparkle(20, 20, 8)} fill="#fff27a" />
          </svg>
        ))}

        <svg className="ff-bolt ff-c" viewBox="0 0 80 200">
          <path
            d="M46 0L18 92h22L10 200l58-120H44L64 0z"
            fill="#fff27a"
            stroke="#ff4fa3"
            strokeWidth="5"
            strokeLinejoin="round"
          />
        </svg>
        <div className="ff-flash ff-c" />

        {/* legendas do clipe (queimadas na fita) */}
        <div className="ff-lyrics">
          <div className="ff-lyrics-roll">
            {LYRICS.map(([jp, pt], i) => (
              <p key={i}>
                <span className="ff-jp">{jp}</span>
                <span className="ff-pt">{pt}</span>
              </p>
            ))}
          </div>
        </div>
      </div>

      <Vhs />
    </>
  )
}
