import type { CSSProperties } from 'react'

// Cena de fundo do tema Half-Life (só aparece com data-theme="half-life").
// Complexo de pesquisa subterrâneo: teto com lâmpadas fluorescentes, canos e
// placas de perigo nas laterais, feixe verde de ressonância descendo até a
// câmara de testes (atrás da roda), piso com faixa zebrada e leituras de HUD.
//
// Cena viva: um "turno" do complexo em ciclo (--hl-cycle, em theme.css):
//   0–28%  turno normal
//  28–48%  alarme: violação de contenção (giroflex vermelho, luz vermelha)
//  48–64%  queda de energia (lâmpadas apagam, iluminação de emergência)
//  64–82%  tempestade de portal (surtos verdes, arcos e clarões)
//  82–100% volta ao normal
// Cada camada tem sua animação no mesmo ciclo; o HUD troca de leitura em cada
// fase. Tudo em CSS (transform/opacity). Componente de servidor: sorteios com
// semente fixa, para o HTML do servidor e do navegador ser igual.

// Gerador pseudoaleatório com semente (mulberry32)
const seeded = (seed: number) => () => {
  seed |= 0
  seed = (seed + 0x6d2b79f5) | 0
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}
const rand = seeded(1998)
const r1 = (n: number) => Math.round(n * 10) / 10

const rect = (x: number, y: number, w: number, h: number) =>
  `M${x} ${y}h${w}v${h}h${-w}Z`

const pt = (cx: number, cy: number, r: number, deg: number) => {
  const a = (deg * Math.PI) / 180
  return `${r1(cx + r * Math.cos(a))} ${r1(cy + r * Math.sin(a))}`
}

// Trevo de radiação genérico (centro + 3 pás de 60°)
const trefoil = (cx: number, cy: number, s: number) => {
  const r0 = r1(s * 0.2)
  const a = r1(s * 0.3)
  let d = `M${cx - r0} ${cy}a${r0} ${r0} 0 1 0 ${2 * r0} 0a${r0} ${r0} 0 1 0 ${-2 * r0} 0Z`
  for (const c of [90, 210, 330]) {
    d += `M${pt(cx, cy, a, c - 30)}L${pt(cx, cy, s, c - 30)}A${s} ${s} 0 0 1 ${pt(cx, cy, s, c + 30)}L${pt(cx, cy, a, c + 30)}A${a} ${a} 0 0 0 ${pt(cx, cy, a, c - 30)}Z`
  }
  return d
}

// ---------- Teto (viewBox 1920×70, esticado na largura) ----------

const FIXTURES = [150, 430, 700, 1220, 1490, 1770]
const ceilingSteel =
  rect(0, 0, 1920, 9) +
  FIXTURES.map(
    (x) =>
      rect(x - 52, 9, 2, 6) + rect(x + 50, 9, 2, 6) + rect(x - 72, 14, 144, 7),
  ).join('') +
  // emissor central
  'M900 0H1020L1000 30H920Z'
const ceilingBolts = Array.from({ length: 32 }, (_, i) =>
  rect(30 + i * 60, 3, 3, 3),
).join('')
const tubeFlicker = FIXTURES.map(() => ({
  animationDuration: `${r1(5 + rand() * 9)}s`,
  animationDelay: `${-r1(rand() * 12)}s`,
}))

// Arcos de energia em volta do emissor (só na tempestade)
const zigzag = (x0: number, y0: number, x1: number, y1: number, steps = 7) => {
  let d = `M${x0} ${y0}`
  for (let i = 1; i < steps; i++) {
    const t = i / steps
    d += `L${r1(x0 + (x1 - x0) * t + (rand() - 0.5) * 26)} ${r1(y0 + (y1 - y0) * t + (rand() - 0.5) * 22)}`
  }
  return `${d}L${x1} ${y1}`
}
const ARCS_A =
  zigzag(300, 32, 70, 8) + zigzag(300, 32, 470, 96) + zigzag(300, 32, 560, 14)
const ARCS_B =
  zigzag(300, 32, 40, 70) + zigzag(300, 32, 150, 104) + zigzag(300, 32, 520, 60)

// ---------- Parede esquerda (viewBox 300×914, ancorada embaixo) ----------

const flanges = (x: number, w: number, ys: number[]) =>
  ys.map((y) => rect(x - 4, y, w + 8, 12)).join('')
const LEFT_DARK =
  flanges(14, 24, [120, 360, 600, 840]) +
  flanges(48, 12, [60, 300, 540]) +
  // grade de ventilação
  rect(78, 140, 74, 104) +
  // caixa de junção
  rect(92, 410, 50, 58) +
  rect(112, 468, 8, 40) +
  // placa grande de perigo (moldura preta)
  rect(26, 516, 238, 214)
const LEFT_SLATS = Array.from({ length: 8 }, (_, i) =>
  rect(84, 148 + i * 12, 62, 5),
).join('')

// ---------- Parede direita (viewBox 170×914, ancorada embaixo) ----------

const RIGHT_DARK =
  flanges(130, 24, [80, 320, 560, 800]) +
  flanges(112, 10, [200, 440, 680]) +
  // placa do setor
  rect(10, 96, 92, 86) +
  // painel de status
  rect(14, 398, 84, 120) +
  // medidor
  rect(22, 566, 72, 72)
const LED_GREEN = [0, 1, 2, 3]
  .flatMap((r) => [0, 1, 2].map((c) => [c, r]))
  .filter(() => rand() > 0.3)
  .map(([c, r]) => rect(26 + c * 24, 412 + r * 18, 10, 6))
  .join('')
const valveSpokes = [0, 60, 120]
  .map((a) => `M${pt(56, 300, 28, a)}L${pt(56, 300, 28, a + 180)}`)
  .join('')

// ---------- Partículas verdes subindo (nas bordas) ----------

const MOTES = Array.from({ length: 12 }, (_, i) => {
  const side = i % 2 === 0
  return {
    left: `${r1(side ? 1 + rand() * 11 : 88 + rand() * 11)}%`,
    top: `${r1(40 + rand() * 55)}%`,
    animationDuration: `${r1(9 + rand() * 9)}s`,
    animationDelay: `${-r1(rand() * 18)}s`,
  } as CSSProperties
})

// Faíscas perto das lâmpadas (posição em % da largura do teto)
const SPARKS = [430, 1220, 1770].map((x, i) => ({
  left: `${r1((x / 1920) * 100)}%`,
  animationDuration: `${[7.3, 11.7, 16.1][i]}s`,
  animationDelay: `${-r1(rand() * 10)}s`,
}))
const SPARK_RAYS = Array.from({ length: 7 }, (_, i) => {
  const a = 20 + i * 23 + rand() * 10
  return `M${pt(20, 8, 3, a)}L${pt(20, 8, 9 + rand() * 9, a)}`
}).join('')

// Gradiente de cano e listras zebradas (cada SVG tem os seus ids)
const PipeDefs = ({ id, stripe }: { id: string; stripe: number }) => (
  <defs>
    <linearGradient id={`hl-pipe-${id}`} x1="0" x2="1">
      <stop offset="0" stopColor="#151918" />
      <stop offset="0.35" stopColor="#56605c" />
      <stop offset="0.55" stopColor="#2b3230" />
      <stop offset="1" stopColor="#0e1110" />
    </linearGradient>
    <pattern
      id={`hl-haz-${id}`}
      width={stripe * 2}
      height={stripe * 2}
      patternUnits="userSpaceOnUse"
      patternTransform="rotate(45)"
    >
      <rect width={stripe} height={stripe * 2} fill="#f2b800" />
      <rect x={stripe} width={stripe} height={stripe * 2} fill="#121212" />
    </pattern>
  </defs>
)

const RedGlow = ({ id, cx, cy }: { id: string; cx: number; cy: number }) => (
  <defs>
    <radialGradient id={`hl-red-${id}`}>
      <stop offset="0" stopColor="#ff3b1f" stopOpacity="0.85" />
      <stop offset="0.45" stopColor="#ff3b1f" stopOpacity="0.25" />
      <stop offset="1" stopColor="#ff3b1f" stopOpacity="0" />
    </radialGradient>
    <radialGradient
      id={`hl-cone-${id}`}
      gradientUnits="userSpaceOnUse"
      cx={cx}
      cy={cy}
      r="230"
    >
      <stop offset="0" stopColor="#ff5a3a" stopOpacity="0.6" />
      <stop offset="0.5" stopColor="#ff4a2a" stopOpacity="0.2" />
      <stop offset="1" stopColor="#ff4a2a" stopOpacity="0" />
    </radialGradient>
  </defs>
)

export default function HalfLifeScene() {
  return (
    <>
      {/* câmara de testes: brilho verde atrás da roda */}
      <div className="hl-chamber-wrap">
        <div className="hl-chamber" />
      </div>

      {/* teto com lâmpadas fluorescentes */}
      <svg
        className="hl-ceiling"
        viewBox="0 0 1920 70"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <radialGradient id="hl-tube-glow" cx="0.5" cy="0" r="1">
            <stop offset="0" stopColor="#e9fff0" stopOpacity="0.6" />
            <stop offset="0.6" stopColor="#bfffd0" stopOpacity="0.07" />
            <stop offset="1" stopColor="#bfffd0" stopOpacity="0" />
          </radialGradient>
        </defs>
        <g className="hl-lights">
          {FIXTURES.map((x, i) => (
            <g key={x} className="hl-tube" style={tubeFlicker[i]}>
              <ellipse
                cx={x}
                cy="22"
                rx="180"
                ry="70"
                fill="url(#hl-tube-glow)"
              />
              <rect x={x - 66} y="21" width="132" height="3.5" fill="#f2fff4" />
            </g>
          ))}
        </g>
        <path className="hl-steel" d={ceilingSteel} />
        <path className="hl-bolts" d={ceilingBolts} />
        <path className="hl-coil" d="M928 8h64v4h-64zM932 18h56v4h-56z" />
        <rect className="hl-lens" x="932" y="29" width="56" height="4" />
      </svg>

      {/* parede esquerda: canos, ventilação, caixa de junção e placa */}
      <svg
        className="hl-side hl-side-l"
        viewBox="0 0 300 914"
        preserveAspectRatio="xMinYMax slice"
        aria-hidden="true"
      >
        <PipeDefs id="l" stripe={9} />
        <path
          className="hl-cable"
          d="M84 0C80 60 98 90 90 140M150 250C170 300 150 340 132 410M72 0C66 120 74 240 70 360S62 700 74 914"
        />
        <rect x="14" y="0" width="24" height="914" fill="url(#hl-pipe-l)" />
        <rect x="48" y="0" width="12" height="914" fill="url(#hl-pipe-l)" />
        <rect
          className="hl-paint-green"
          x="48"
          y="190"
          width="12"
          height="34"
        />
        <rect x="14" y="440" width="24" height="44" fill="url(#hl-haz-l)" />
        <path className="hl-steel" d={LEFT_DARK} />
        <path className="hl-slat" d={LEFT_SLATS} />
        <path className="hl-steel" d="M104 330h28v10h-28zM28 774h24v10h-24z" />
        <path className="hl-beacon" d="M106 330a12 14 0 0 1 24 0z" />
        <path className="hl-led-amber" d="M110 420h8v5h-8z" />

        {/* placa de perigo: moldura zebrada + trevo */}
        <rect x="32" y="522" width="226" height="202" fill="url(#hl-haz-l)" />
        <rect className="hl-plate" x="46" y="536" width="198" height="174" />
        <circle className="hl-sign-yellow" cx="145" cy="600" r="46" />
        <path className="hl-sign-ink" d={trefoil(145, 600, 38)} />
        <text className="hl-sign-big" x="145" y="676" textAnchor="middle">
          PERIGO
        </text>
        <text className="hl-sign-small" x="145" y="697" textAnchor="middle">
          RADIAÇÃO · NÍVEL 3
        </text>
      </svg>

      {/* parede direita: placa do setor, válvula, painel e medidor */}
      <svg
        className="hl-side hl-side-r"
        viewBox="0 0 170 914"
        preserveAspectRatio="xMaxYMax slice"
        aria-hidden="true"
      >
        <PipeDefs id="r" stripe={7} />
        <rect x="130" y="0" width="24" height="914" fill="url(#hl-pipe-r)" />
        <rect x="112" y="0" width="10" height="914" fill="url(#hl-pipe-r)" />
        <rect x="130" y="660" width="24" height="40" fill="url(#hl-haz-r)" />
        <path className="hl-steel" d={RIGHT_DARK} />
        <path className="hl-steel" d="M44 248h24v8h-24zM118 754h24v10h-24z" />
        <path className="hl-beacon" d="M45 248a11 13 0 0 1 22 0z" />
        <rect x="10" y="168" width="92" height="14" fill="url(#hl-haz-r)" />
        <text className="hl-sign-label" x="56" y="120" textAnchor="middle">
          SETOR
        </text>
        <text className="hl-sign-sector" x="56" y="160" textAnchor="middle">
          C
        </text>
        <circle className="hl-valve" cx="56" cy="300" r="28" />
        <path className="hl-valve" d={valveSpokes} />
        <circle className="hl-valve-hub" cx="56" cy="300" r="6" />
        <path className="hl-led-green" d={LED_GREEN} />
        <circle className="hl-gauge" cx="58" cy="602" r="26" />
      </svg>

      {/* piso: grade metálica com faixa zebrada */}
      <div className="hl-floor" />

      {/* apagão: escurece teto, paredes e piso */}
      <div className="hl-blackout" />

      {/* feixe de ressonância (continua aceso no apagão) */}
      <div className="hl-beam-wrap">
        <div className="hl-beam" />
      </div>
      <div className="hl-lens-glow" />

      {/* efeitos das paredes: LEDs, ponteiro, giroflex e luz de emergência */}
      <svg
        className="hl-side hl-side-l"
        viewBox="0 0 300 914"
        preserveAspectRatio="xMinYMax slice"
        aria-hidden="true"
      >
        <RedGlow id="l" cx={118} cy={324} />
        <path className="hl-led-green hl-blink" d="M98 420h8v5h-8z" />
        <g className="hl-alarm">
          <path
            className="hl-cone"
            style={{ transformOrigin: '118px 324px' }}
            d="M118 324L350 270V378Z"
            fill="url(#hl-cone-l)"
          />
          <circle cx="118" cy="324" r="40" fill="url(#hl-red-l)" />
          <path className="hl-beacon-lit" d="M106 330a12 14 0 0 1 24 0z" />
        </g>
        <g className="hl-emerg">
          <circle cx="40" cy="790" r="90" fill="url(#hl-red-l)" />
          <path className="hl-emerg-lamp" d="M30 784h20v6h-20z" />
        </g>
      </svg>
      <svg
        className="hl-side hl-side-r"
        viewBox="0 0 170 914"
        preserveAspectRatio="xMaxYMax slice"
        aria-hidden="true"
      >
        <RedGlow id="r" cx={56} cy={242} />
        <rect
          className="hl-led-amber hl-blink"
          x="74"
          y="484"
          width="10"
          height="6"
        />
        <rect
          className="hl-led-red hl-blink-alt"
          x="26"
          y="502"
          width="10"
          height="6"
        />
        <path
          className="hl-needle"
          style={{ transformOrigin: '58px 602px' }}
          d="M58 604V580"
        />
        <g className="hl-alarm">
          <path
            className="hl-cone hl-cone-rev"
            style={{ transformOrigin: '56px 242px' }}
            d="M56 242L-180 188V296Z"
            fill="url(#hl-cone-r)"
          />
          <circle cx="56" cy="242" r="36" fill="url(#hl-red-r)" />
          <path className="hl-beacon-lit" d="M45 248a11 13 0 0 1 22 0z" />
        </g>
        <g className="hl-emerg">
          <circle cx="130" cy="770" r="80" fill="url(#hl-red-r)" />
          <path className="hl-emerg-lamp" d="M120 764h20v6h-20z" />
        </g>
      </svg>

      {/* partículas verdes */}
      <div className="hl-motes">
        {MOTES.map((style, i) => (
          <span key={i} style={style} />
        ))}
      </div>

      {/* faíscas ocasionais nas lâmpadas */}
      {SPARKS.map((s, i) => (
        <svg
          key={i}
          className="hl-spark"
          style={s}
          viewBox="0 0 40 30"
          aria-hidden="true"
        >
          <path d={SPARK_RAYS} />
          <circle cx="20" cy="8" r="2.5" />
        </svg>
      ))}

      {/* luzes de emergência no piso */}
      <div className="hl-floor-lights" />

      {/* camadas do ciclo: luz vermelha do alarme e surtos verdes */}
      <div className="hl-redwash">
        <div />
      </div>
      <div className="hl-storm">
        <div />
      </div>

      {/* arcos elétricos da tempestade de portal */}
      <svg className="hl-arcs" viewBox="0 0 600 110" aria-hidden="true">
        <path className="hl-arc hl-arc-a" d={ARCS_A} />
        <path className="hl-arc hl-arc-b" d={ARCS_B} />
      </svg>

      {/* HUD do traje */}
      <div className="hl-hud hl-hud-l" aria-hidden="true">
        <div className="hl-status">
          <span className="hl-ph-normal">● SISTEMAS NOMINAIS</span>
          <span className="hl-ph-alarm">▲ VIOLAÇÃO DE CONTENÇÃO</span>
          <span className="hl-ph-dark">▼ ENERGIA AUXILIAR</span>
          <span className="hl-ph-storm">◆ ANOMALIA DE RESSONÂNCIA</span>
        </div>
        <div className="hl-readouts">
          <div className="hl-readout">
            <small>SAÚDE</small>
            <b className="hl-cross" />
            <span className="hl-num">
              <span className="hl-ph-calm">100</span>
              <span className="hl-ph-storm">73</span>
            </span>
          </div>
          <div className="hl-readout">
            <small>TRAJE</small>
            <b className="hl-shield" />
            <span className="hl-num">
              <span className="hl-ph-calm">100</span>
              <span className="hl-ph-storm">41</span>
            </span>
          </div>
        </div>
      </div>
      <div className="hl-hud hl-hud-r" aria-hidden="true">
        <small>ENERGIA</small>
        <span className="hl-num">
          <span className="hl-ph-normal">100%</span>
          <span className="hl-ph-alarm">97%</span>
          <span className="hl-ph-dark">12%</span>
          <span className="hl-ph-storm">240%</span>
        </span>
        <span className="hl-bar">
          <i className="hl-ph-normal" />
          <i className="hl-ph-alarm" />
          <i className="hl-ph-dark" />
          <i className="hl-ph-storm" />
        </span>
      </div>

      <div className="hl-sweep" />
    </>
  )
}
