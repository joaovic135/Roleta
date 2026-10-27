import { dot, n, rect, seeded } from './geo'

// Laterais da sala: parede verde-petróleo com frisos dourados e a cortina
// de veludo carmim presa por um cordão (abraçadeira). A cortina é gerada:
// cada dobra é uma faixa entre duas curvas que descem do varão, se juntam
// na abraçadeira e abrem de novo até o chão. Cores lisas por dobra +
// cristas claras e vales escuros desenhados como traços ao longo da dobra
// (o brilho do veludo segue o tecido). Tudo estático: só o invólucro HTML
// balança (transform), então o SVG é rasterizado uma vez.
//
// Caixa de 420 x 1080 unidades (1 u = 1/1080 da altura da tela), presa à
// beirada; o lado direito é o mesmo desenho espelhado no CSS.

export const SIDE_W = 420
const H = 1080
const TOP_W = 236
const TIE_X = 50
export const TIE_Y = 590
const FLOOR_W = 92
const FOLDS = 11

type Line = { d: string; back: string }

// curva de uma dobra (t = 0 na beirada, 1 na borda interna da cortina)
const foldLine = (t: number, wob: number): Line => {
  const xt = TOP_W * t + wob * 6
  const xk = TIE_X * t
  const xf = FLOOR_W * t + wob * 4
  const c1 = [xt + wob * 3, 230]
  const c2 = [xk + (xt - xk) * 0.3, 470]
  const c4 = [xk + 6 * t, TIE_Y + 150]
  const c5 = [xf, H - 260]
  const p = (q: number[]) => `${n(q[0])} ${n(q[1])}`
  return {
    d: `M${n(xt)} 0C${p(c1)} ${p(c2)} ${n(xk)} ${TIE_Y}C${p(c4)} ${p(c5)} ${n(xf)} ${H}`,
    back: `L${n(xf)} ${H}C${p(c5)} ${p(c4)} ${n(xk)} ${TIE_Y}C${p(c2)} ${p(c1)} ${n(xt)} 0`,
  }
}

// tons das faixas: escuro na beirada (sombra) e mais vivo perto da tela
const FOLD_TONES = [
  '#1c0206',
  '#2a030a',
  '#36040d',
  '#3f0610',
  '#4a0713',
  '#550916',
  '#5f0a19',
  '#6a0c1c',
  '#740e1f',
  '#7d1022',
  '#861325',
]

const buildDrape = () => {
  const rand = seeded(1931)
  const ts = Array.from({ length: FOLDS + 1 }, (_, k) =>
    k === 0 || k === FOLDS ? k / FOLDS : k / FOLDS + (rand() - 0.5) * 0.035,
  )
  const wobs = ts.map((_, k) => (k === 0 || k === FOLDS ? 0 : rand() - 0.5))
  const lines = ts.map((t, k) => foldLine(t, wobs[k]))
  // faixas (cada uma alterna levemente o tom: dobra para fora / para dentro)
  const bands = lines.slice(0, -1).map((a, k) => {
    const b = lines[k + 1]
    return {
      d: a.d + b.back + 'Z',
      fill: FOLD_TONES[Math.min(FOLD_TONES.length - 1, k + (k % 2))],
    }
  })
  // cristas (meio de cada faixa) e vales (as divisas)
  let ridges = ''
  for (let k = 0; k < FOLDS; k++)
    ridges += foldLine((ts[k] + ts[k + 1]) / 2, (wobs[k] + wobs[k + 1]) / 2).d
  let valleys = ''
  for (let k = 1; k < FOLDS; k++) valleys += lines[k].d
  const edge = lines[FOLDS].d
  const outline =
    `M0 0L${n(TOP_W)} 0` + edge.slice(edge.indexOf('C')) + 'L0 1080Z'
  return { bands, ridges, valleys, edge, outline }
}
const DRAPE = buildDrape()

// cordão dourado da abraçadeira: sai do gancho na parede e abraça o maço
const ROPE =
  `M0 ${TIE_Y - 22}C${TIE_X * 0.5} ${TIE_Y - 26} ${TIE_X + 10} ${TIE_Y - 16} ${TIE_X + 8} ${TIE_Y - 2}` +
  `C${TIE_X + 6} ${TIE_Y + 12} ${TIE_X * 0.4} ${TIE_Y + 14} 0 ${TIE_Y + 8}`

// parede: frisos verticais finos, friso de rodapé com chevrons
const buildWall = () => {
  let stripes = ''
  for (let x = 14; x < SIDE_W; x += 26) stripes += rect(x, 0, 1.4, H)
  let chevrons = ''
  for (let x = 0; x < SIDE_W; x += 18)
    chevrons += `M${x} 902l9 -9l9 9l-3 0l-6 -6l-6 6z`
  let rivets = ''
  for (let x = 9; x < SIDE_W; x += 36) rivets += dot(x, 879, 1.6)
  return { stripes, chevrons, rivets }
}
const WALL = buildWall()

// grade do órgão (detalhe clássico dos palácios de cinema): nicho em arco
// com treliça dourada, sol nascente no arco, frisos em zigue-zague e uma
// luz de serviço escondida no pé. Fica no alto da parede, onde ela só
// aparece em telas largas (nas outras, fica atrás dos cards).
const GX = 285
const GR = 50
const GTOP = 150
const GBOT = 476
const buildGrille = () => {
  const arch = (r: number, inset: number) =>
    `M${GX - r} ${GBOT - inset}V${GTOP}A${r} ${r} 0 0 1 ${GX + r} ${GTOP}V${GBOT - inset}`
  // treliça: barras verticais que param na curva do arco
  let lattice = ''
  for (let x = GX - 41; x <= GX + 41; x += 8.2) {
    const top = GTOP - Math.sqrt(Math.max(0, 41 * 41 - (x - GX) ** 2)) + 4
    lattice += rect(x - 0.7, top, 1.4, GBOT - 10 - top)
  }
  // sol nascente no arco (raios finos)
  for (let i = 0; i < 9; i++) {
    const a = Math.PI + ((i + 0.5) / 9) * Math.PI
    const b = 0.05
    lattice += `M${GX} ${GTOP}L${n(GX + Math.cos(a - b) * 40)} ${n(GTOP + Math.sin(a - b) * 40)}L${n(GX + Math.cos(a + b) * 40)} ${n(GTOP + Math.sin(a + b) * 40)}Z`
  }
  // peças maciças: travessas, meio-sol, pedra-chave e base
  let solid =
    dot(GX, GTOP, 9) +
    rect(GX - 45, GTOP, 90, 2.6) +
    rect(GX - 45, 252, 90, 2.4) +
    rect(GX - 45, 352, 90, 2.4) +
    rect(GX - 45, 436, 90, 2.4) +
    `M${GX - 7} ${GTOP - GR - 4}h14l-2.4 11h-9.2z` +
    rect(GX - 58, GBOT, 116, 9)
  // frisos em zigue-zague entre as travessas
  let zig = ''
  for (const y of [302, 394]) {
    zig += `M${GX - 44} ${y}`
    for (let k = 1; k <= 10; k++)
      zig += `L${n(GX - 44 + k * 8.8)} ${y + (k % 2 ? -7 : 7)}`
  }
  solid += rect(GX - 62, GBOT + 9, 124, 3)
  return {
    niche: arch(GR, 0) + 'Z',
    frame: arch(GR, 0),
    inner: arch(GR - 5, 6),
    lattice,
    solid,
    zig,
  }
}
const GRILLE = buildGrille()

export function Wall({ side }: { side: string }) {
  return (
    <svg
      className="cn-wall-art"
      viewBox={`0 0 ${SIDE_W} ${H}`}
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id={`cn-wall-g-${side}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#040d0e" />
          <stop offset="0.45" stopColor="#0a2426" />
          <stop offset="0.8" stopColor="#081c1e" />
          <stop offset="1" stopColor="#040b0c" />
        </linearGradient>
        <linearGradient id={`cn-dado-g-${side}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e9c06a" />
          <stop offset="0.5" stopColor="#a8742a" />
          <stop offset="1" stopColor="#5a3a12" />
        </linearGradient>
        <radialGradient id={`cn-grille-glow-${side}`} cx="0.5" cy="1" r="0.8">
          <stop offset="0" stopColor="#ffc777" stopOpacity="0.8" />
          <stop offset="1" stopColor="#ff9a40" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width={SIDE_W} height={H} fill={`url(#cn-wall-g-${side})`} />
      <path d={WALL.stripes} fill="rgba(214, 170, 90, 0.07)" />
      {/* grade do órgão com a luz de serviço subindo do pé (o CSS só
          mostra em telas largas) */}
      <g className="cn-grille">
        <path d={GRILLE.niche} fill="#041312" />
        <path d={GRILLE.niche} fill={`url(#cn-grille-glow-${side})`} />
        <path d={GRILLE.lattice} fill="rgba(222, 176, 92, 0.5)" />
        <path
          d={GRILLE.zig}
          fill="none"
          stroke="rgba(233, 192, 106, 0.6)"
          strokeWidth="1.6"
        />
        <path d={GRILLE.solid} fill="#c9953e" />
        <path d={GRILLE.frame} fill="none" stroke="#d9a64a" strokeWidth="3.6" />
        <path d={GRILLE.inner} fill="none" stroke="#6b4513" strokeWidth="1.2" />
      </g>
      {/* lambri escuro abaixo do friso */}
      <path d={rect(0, 884, SIDE_W, H - 884)} fill="#1a0609" />
      <path d={rect(0, 874, SIDE_W, 10)} fill={`url(#cn-dado-g-${side})`} />
      <path d={WALL.rivets} fill="#2a1505" />
      <path d={WALL.chevrons} fill="rgba(233, 192, 106, 0.55)" />
      <path d={rect(0, 906, SIDE_W, 3)} fill="#8a5c1e" />
    </svg>
  )
}

export function Drape({ side }: { side: string }) {
  return (
    <svg
      className="cn-drape-art"
      viewBox={`0 0 ${SIDE_W} ${H}`}
      preserveAspectRatio="none"
    >
      <defs>
        {/* luz geral: mais escura no varão e na abraçadeira */}
        <linearGradient
          id={`cn-drape-shade-${side}`}
          x1="0"
          y1="0"
          x2="0"
          y2="1"
        >
          <stop offset="0" stopColor="#000" stopOpacity="0.55" />
          <stop offset="0.12" stopColor="#000" stopOpacity="0.05" />
          <stop offset="0.42" stopColor="#000" stopOpacity="0" />
          <stop offset="0.55" stopColor="#000" stopOpacity="0.35" />
          <stop offset="0.7" stopColor="#000" stopOpacity="0.08" />
          <stop offset="1" stopColor="#000" stopOpacity="0.5" />
        </linearGradient>
        <linearGradient
          id={`cn-ridge-${side}`}
          gradientUnits="userSpaceOnUse"
          x1="0"
          y1="0"
          x2="0"
          y2={H}
        >
          <stop offset="0" stopColor="#ff8a8a" stopOpacity="0" />
          <stop offset="0.2" stopColor="#ff7a7a" stopOpacity="0.3" />
          <stop offset="0.48" stopColor="#ff6a6a" stopOpacity="0.12" />
          <stop offset="0.54" stopColor="#ff6a6a" stopOpacity="0.02" />
          <stop offset="0.72" stopColor="#ff7a7a" stopOpacity="0.24" />
          <stop offset="1" stopColor="#ff7a7a" stopOpacity="0.04" />
        </linearGradient>
        <linearGradient
          id={`cn-sheen-${side}`}
          gradientUnits="userSpaceOnUse"
          x1="0"
          y1="0"
          x2="0"
          y2={H}
        >
          <stop offset="0" stopColor="#ffc2b0" stopOpacity="0" />
          <stop offset="0.24" stopColor="#ffc2b0" stopOpacity="0.32" />
          <stop offset="0.5" stopColor="#ffc2b0" stopOpacity="0.04" />
          <stop offset="0.74" stopColor="#ffc2b0" stopOpacity="0.22" />
          <stop offset="1" stopColor="#ffc2b0" stopOpacity="0" />
        </linearGradient>
      </defs>
      {DRAPE.bands.map((b, i) => (
        <path key={i} d={b.d} fill={b.fill} />
      ))}
      <path
        d={DRAPE.valleys}
        fill="none"
        stroke="rgba(8, 0, 2, 0.5)"
        strokeWidth="9"
      />
      <path
        d={DRAPE.valleys}
        fill="none"
        stroke="rgba(8, 0, 2, 0.55)"
        strokeWidth="2.5"
      />
      <path
        d={DRAPE.ridges}
        fill="none"
        stroke={`url(#cn-ridge-${side})`}
        strokeWidth="11"
      />
      <path
        d={DRAPE.ridges}
        fill="none"
        stroke={`url(#cn-sheen-${side})`}
        strokeWidth="2.2"
      />
      <path d={DRAPE.outline} fill={`url(#cn-drape-shade-${side})`} />
      {/* borda interna: luz da tela batendo no veludo + galão dourado */}
      <path
        d={DRAPE.edge}
        fill="none"
        stroke="rgba(255, 150, 120, 0.3)"
        strokeWidth="10"
      />
      <path d={DRAPE.edge} fill="none" stroke="#6b4513" strokeWidth="5" />
      <path
        d={DRAPE.edge}
        fill="none"
        stroke="#f0c36a"
        strokeWidth="3.2"
        strokeDasharray="3 2.4"
      />
      {/* abraçadeira: cordão trançado e o gancho na parede */}
      <path d={ROPE} fill="none" stroke="#4a2c08" strokeWidth="9" />
      <path
        d={ROPE}
        fill="none"
        stroke="#e2b053"
        strokeWidth="6"
        strokeDasharray="4 3"
      />
      <path d={dot(TIE_X + 8, TIE_Y - 2, 6)} fill="#f3cf7a" />
      <path d={dot(TIE_X + 9, TIE_Y - 3, 2.2)} fill="#fff1c4" />
    </svg>
  )
}

// arandela art déco (leque de vidro fosco com nervuras douradas)
export function Sconce({ id }: { id: string }) {
  return (
    <svg className="cn-sconce-art" viewBox="-30 -26 60 44">
      <defs>
        <radialGradient id={`cn-sconce-glass-${id}`} cx="0.5" cy="0.95" r="0.9">
          <stop offset="0" stopColor="#fffbea" />
          <stop offset="0.45" stopColor="#ffe3a0" />
          <stop offset="1" stopColor="#e09a3a" />
        </radialGradient>
      </defs>
      <path d="M-24 2A24 24 0 0 1 24 2Z" fill={`url(#cn-sconce-glass-${id})`} />
      <path
        d="M0 2L0 -22M0 2L-12 -19M0 2L12 -19M0 2L-20 -11M0 2L20 -11M0 2L-24 0M0 2L24 0"
        stroke="#b07a26"
        strokeWidth="1.6"
      />
      <path d="M-27 2h54v4h-54z" fill="#e5b75c" />
      <path d="M-27 6h54v1.6h-54z" fill="#6b4513" />
      <path d="M-6 7.6h12l-3 9h-6z" fill="#c9953e" />
    </svg>
  )
}

// borla pendurada na abraçadeira (balança no CSS)
export function Tassel() {
  return (
    <svg className="cn-tassel-art" viewBox="-10 0 20 46">
      <path d="M-1 0h2v8h-2z" fill="#c9953e" />
      <path d={dot(0, 10, 4.5)} fill="#f0c36a" />
      <path d="M-4 13h8l3 25h-14z" fill="#d6a13f" />
      <path
        d="M-5 16v22M-2.5 16v23M0 16v23M2.5 16v23M5 16v22"
        stroke="#7a4d12"
        strokeWidth="0.8"
      />
      <path d="M-7.5 37h15v3h-15z" fill="#8a5a18" />
    </svg>
  )
}
