import {
  CYAN,
  HOT,
  INK,
  LILAC,
  MINT,
  PEACH,
  PINK,
  SKY,
  YELLOW,
  burst,
  r1,
  seeded,
} from './art'

// Eventos com relógio próprio (aviãozinho, bola de praia, balão, fogos) e
// a festa da vitória (lança-confetes, adesivo "GOOD TIMES!" e flash suave).

// ---- Aviãozinho puxando faixa (faixa de cima) ------------------------------

export const Plane = () => (
  <div className="gt-plane">
    <div className="gt-plane-bob">
      <svg className="gt-plane-body" viewBox="0 0 130 64" aria-hidden="true">
        <path
          d="M44 14h34v-8h-34zM40 48h42v6h-42z"
          fill={INK}
          transform="translate(3 3)"
        />
        <path
          d="M12 34q4-12 22-12h62l18-10h8l-6 24-18 4H34q-18 0-22-6z"
          fill={INK}
          transform="translate(4 4)"
        />
        <path
          d="M12 34q4-12 22-12h62l18-10h8l-6 24-18 4H34q-18 0-22-6z"
          fill={YELLOW}
          stroke={INK}
          strokeWidth="3"
          strokeLinejoin="round"
        />
        <path
          d="M100 18l16-8h6l-4 14z"
          fill={HOT}
          stroke={INK}
          strokeWidth="2.5"
        />
        <path
          d="M52 22v-8M70 22v-8M50 40v8M74 40v8"
          stroke={INK}
          strokeWidth="2.5"
        />
        <path
          d="M44 14h34v-8h-34z"
          fill={LILAC}
          stroke={INK}
          strokeWidth="2.5"
        />
        <path
          d="M40 48h42v6h-42z"
          fill={LILAC}
          stroke={INK}
          strokeWidth="2.5"
        />
        <circle
          cx="36"
          cy="29"
          r="5"
          fill={SKY}
          stroke={INK}
          strokeWidth="2.5"
        />
        <path d="M22 36h70" stroke={HOT} strokeWidth="3" />
        <circle cx="56" cy="58" r="4" fill={INK} />
      </svg>
      <i className="gt-prop" />
      <svg className="gt-tow" viewBox="0 0 60 30" aria-hidden="true">
        <path
          d="M0 14L60 3M0 14L60 27"
          stroke={INK}
          strokeWidth="1.5"
          fill="none"
        />
      </svg>
      <div className="gt-banner">
        <span>GOOD TIMES ✦ 良い時 ✦ BOA SORTE!</span>
      </div>
    </div>
  </div>
)

// ---- Bola de praia quicando pela pista --------------------------------------

export const BeachBall = () => (
  <div className="gt-ball-run">
    <i className="gt-ball-shadow" />
    <div className="gt-ball-hop">
      <i className="gt-ball" />
    </div>
  </div>
)

// ---- Balão de ar quente listrado (surpresa rara) ---------------------------

export const Balloon = () => (
  <div className="gt-balloon">
    <svg viewBox="0 0 100 140" aria-hidden="true">
      <path d="M38 100l6 18M62 100l-6 18" stroke={INK} strokeWidth="2" />
      <path
        d="M50 4C22 4 6 26 6 50c0 26 22 40 32 52h24c10-12 32-26 32-52C94 26 78 4 50 4z"
        fill={PINK}
        stroke={INK}
        strokeWidth="3"
      />
      <path
        d="M50 4C38 18 34 36 36 56c2 20 2 34 2 46h24c0-12 0-26 2-46C66 36 62 18 50 4z"
        fill={YELLOW}
        stroke={INK}
        strokeWidth="2.5"
      />
      <path
        d="M48 6c-4 30-4 64 0 96h4c4-32 4-66 0-96z"
        fill={CYAN}
        stroke={INK}
        strokeWidth="2"
      />
      <path
        d="M8 44h84M10 62h80"
        stroke={INK}
        strokeWidth="2"
        strokeDasharray="0 7"
        strokeLinecap="round"
      />
      <rect
        x="40"
        y="118"
        width="20"
        height="14"
        rx="2"
        fill={PEACH}
        stroke={INK}
        strokeWidth="2.5"
      />
      <path d="M40 124h20" stroke={INK} strokeWidth="1.5" />
    </svg>
  </div>
)

// ---- Fogos Memphis (noite de festa) -----------------------------------------

const BURSTS = [burst(5, 24), burst(9, 18), burst(13, 21)]

export const Fireworks = () =>
  BURSTS.map((b, i) => (
    <svg
      key={i}
      viewBox="0 0 100 100"
      className={`gt-fw gt-fw-${i}`}
      aria-hidden="true"
    >
      <path
        d={b.dash}
        fill="none"
        stroke={CYAN}
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d={b.tri}
        fill={YELLOW}
        stroke={INK}
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d={b.dot}
        fill="none"
        stroke={HOT}
        strokeWidth="5"
        strokeLinecap="round"
      />
    </svg>
  ))

// ---- Lança-confetes (no chão, um em cada margem) ----------------------------
// O cone é um adereço fixo; na vitória ele dá um tranco e três camadas de
// confete saem da boca (cada camada é um SVG estático que só escala, sobe,
// cai e some).

const POP_COLORS = [HOT, CYAN, YELLOW, MINT, LILAC, PINK]
const popPieces = (seed: number, n: number, spread: number) => {
  const rand = seeded(seed)
  const byColor: Record<string, string> = {}
  for (let i = 0; i < n; i++) {
    // leque para cima a partir da boca (50, 100)
    const a = -Math.PI / 2 + (rand() - 0.5) * spread
    const d = 30 + rand() * 66
    const x = 50 + Math.cos(a) * d * 0.5
    const y = 100 + Math.sin(a) * d
    const c = POP_COLORS[i % POP_COLORS.length]
    const t = rand() * Math.PI
    const l = 2.5 + rand() * 3
    byColor[c] =
      (byColor[c] ?? '') +
      `M${r1(x)} ${r1(y)}l${r1(Math.cos(t) * l)} ${r1(Math.sin(t) * l)}`
  }
  return Object.entries(byColor)
}
const POP_LAYERS = [
  popPieces(71, 26, 1.1),
  popPieces(72, 20, 1.6),
  popPieces(73, 16, 0.8),
]
const STREAMERS =
  'M50 96c-6-10 6-16 0-26s6-16 0-26M44 94c-12-8-4-18-16-26s-4-20-14-28M56 94c12-8 4-18 16-26s4-20 14-28'

const Popper = ({ side }: { side: 'l' | 'r' }) => (
  <div className={`gt-popper gt-popper-${side}`}>
    {POP_LAYERS.map((pieces, i) => (
      <svg
        key={i}
        viewBox="0 0 100 100"
        className={`gt-pop gt-pop-${i}`}
        aria-hidden="true"
      >
        {pieces.map(([c, d]) => (
          <path
            key={c}
            d={d}
            stroke={c}
            strokeWidth="3.2"
            strokeLinecap="round"
            fill="none"
          />
        ))}
      </svg>
    ))}
    <svg
      viewBox="0 0 100 100"
      className="gt-pop gt-pop-ribbons"
      aria-hidden="true"
    >
      <path
        d={STREAMERS}
        fill="none"
        stroke={HOT}
        strokeWidth="2.6"
        strokeLinecap="round"
      />
    </svg>
    <div className="gt-popper-cone">
      <svg viewBox="0 0 40 60" aria-hidden="true">
        <path d="M6 6h28L22 58h-4z" fill={INK} transform="translate(3 2)" />
        <path
          d="M6 6h28L22 58h-4z"
          fill={YELLOW}
          stroke={INK}
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        <path
          d="M10 18l20-4M13 31l15-3M16 44l9-2"
          stroke={HOT}
          strokeWidth="3.5"
        />
        <ellipse
          cx="20"
          cy="6"
          rx="14"
          ry="4"
          fill={PINK}
          stroke={INK}
          strokeWidth="2.5"
        />
        <path d="M20 58v-2" stroke={INK} strokeWidth="2" />
      </svg>
    </div>
  </div>
)

export const Poppers = () => (
  <>
    <Popper side="l" />
    <Popper side="r" />
  </>
)

// ---- Vitória: adesivo "GOOD TIMES!" batido na cor da fatia -----------------

const RAYS = (() => {
  let d = ''
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2
    const c = Math.cos(a)
    const s = Math.sin(a)
    d += `M${r1(50 + c * 30)} ${r1(50 + s * 20)}L${r1(50 + c * 48)} ${r1(50 + s * 46)}`
  }
  return d
})()

export const WinSlap = () => (
  <div className="gt-win">
    <i className="gt-win-flash" />
    <i className="gt-win-glow" />
    <div className="gt-slap">
      <svg viewBox="0 0 100 100" className="gt-slap-rays" aria-hidden="true">
        <path
          d={RAYS}
          fill="none"
          stroke={INK}
          strokeWidth="2.4"
          strokeLinecap="round"
        />
      </svg>
      <div className="gt-slap-card">
        <b>GOOD TIMES!</b>
        <small>良い時 ✦ deu sorte!</small>
        <i className="gt-slap-shine" />
      </div>
    </div>
  </div>
)
