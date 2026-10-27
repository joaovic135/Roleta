import { CLAMPS, CLAMP_BOLTS, DOOR, RIB, RIB_VIEW, TUNNEL, zigzag } from './geo'

// Arte estática do tema Half-Life: definições compartilhadas (gradientes e
// listras de perigo), o desenho vetorial das cambotas/comporta (fonte dos
// bitmaps em public/themes/half-life), o túnel fixo (paredes e tudo que
// corre ao longo dele) e as guias de LED.
// Nada aqui é animado por dentro: as animações ficam nos <div> que envolvem
// cada peça (transform/opacity), então cada SVG é rasterizado uma vez só.

const font = (name: string) => ({ fontFamily: `var(${name}), sans-serif` })

// lâmpadas âmbar nos pilares: bulbo + grade de proteção
const BULBS =
  'M86 640a12 12 0 1 0 24 0a12 12 0 1 0-24 0ZM1730 640a12 12 0 1 0 24 0a12 12 0 1 0-24 0Z'
const CAGES =
  'M86 640h24M98 627v26M90 630l16 20M1730 640h24M1742 627v26M1734 630l16 20'

export function HlDefs() {
  return (
    <svg className="hl-defs" aria-hidden="true">
      <defs>
        <linearGradient id="hl-g-steel" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#46534f" />
          <stop offset="0.12" stopColor="#323c39" />
          <stop offset="0.45" stopColor="#242c2a" />
          <stop offset="1" stopColor="#101413" />
        </linearGradient>
        <linearGradient id="hl-g-door" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#4a5652" />
          <stop offset="0.5" stopColor="#323b38" />
          <stop offset="1" stopColor="#1a201e" />
        </linearGradient>
        <radialGradient id="hl-g-halo">
          <stop offset="0" stopColor="#efffef" stopOpacity="0.62" />
          <stop offset="0.18" stopColor="#d2ffd8" stopOpacity="0.26" />
          <stop offset="0.5" stopColor="#b8ffc8" stopOpacity="0.07" />
          <stop offset="1" stopColor="#b8ffc8" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="hl-g-amber">
          <stop offset="0" stopColor="#ffc35a" stopOpacity="0.85" />
          <stop offset="0.22" stopColor="#ff9b00" stopOpacity="0.3" />
          <stop offset="1" stopColor="#ff9b00" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="hl-g-green">
          <stop offset="0" stopColor="#7dff6a" stopOpacity="0.7" />
          <stop offset="0.3" stopColor="#3dff4a" stopOpacity="0.22" />
          <stop offset="1" stopColor="#3dff4a" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="hl-g-red">
          <stop offset="0" stopColor="#ff6a4a" stopOpacity="0.9" />
          <stop offset="0.3" stopColor="#ff3b1f" stopOpacity="0.3" />
          <stop offset="1" stopColor="#ff3b1f" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="hl-g-beam" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#ffc35a" stopOpacity="0.4" />
          <stop offset="0.35" stopColor="#ff9b00" stopOpacity="0.16" />
          <stop offset="1" stopColor="#ff9b00" stopOpacity="0" />
        </linearGradient>
        <pattern
          id="hl-p-haz"
          width="48"
          height="48"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(45)"
        >
          <rect width="24" height="48" fill="#d9a400" />
          <rect x="24" width="24" height="48" fill="#141414" />
        </pattern>
      </defs>
    </svg>
  )
}

// Arte vetorial das cambotas e da comporta. A cena usa bitmaps feitos a
// partir dela (public/themes/half-life/*.webp, 2048 px de largura, fundo
// transparente): camadas grandes em SVG eram rasterizadas de novo a cada
// mudança de estilo da página. Para refazer um bitmap depois de mudar o
// desenho: renderize <RibArt id="..." /> (ou <LeafArt />) numa caixa de
// 2048 × 1269 px (folhas: 1024 × 1269) sobre fundo transparente, com as
// HlDefs na página (gradientes e listras), capture e salve como WebP.
// cambota: perfil em I com rebites, braçadeiras e lâmpadas âmbar
const RibCore = () => (
  <>
    <path d={RIB.frame} fill="url(#hl-g-steel)" fillRule="evenodd" />
    <path d={RIB.web} fill="#0c1110" fillRule="evenodd" opacity="0.8" />
    <path d={RIB.outer} fill="none" stroke="#040606" strokeWidth="5" />
    <path
      d={RIB.rim}
      fill="none"
      stroke="#94a8a1"
      strokeWidth="3"
      opacity="0.6"
    />
    <path d={RIB.rivets} fill="#5f6d69" />
    <path d={CLAMPS} fill="#3c4845" stroke="#070a09" strokeWidth="3" />
    <path d={CLAMP_BOLTS} fill="#8d9c97" />
    <path d="M0 990h66v150H0ZM1774 990h66v150h-66Z" fill="url(#hl-p-haz)" />
    <circle cx="98" cy="640" r="130" fill="url(#hl-g-amber)" />
    <circle cx="1742" cy="640" r="130" fill="url(#hl-g-amber)" />
    <path d="M64 632h24v16H64ZM1752 632h24v16h-24Z" fill="#1a201e" />
    <path d={BULBS} fill="#ffd98c" />
    <path d={CAGES} fill="none" stroke="#3a2406" strokeWidth="2.5" />
    <rect
      x="372"
      y="14"
      width="138"
      height="36"
      fill="#0b0f0e"
      stroke="#c79a12"
      strokeWidth="2"
    />
    <text
      x="441"
      y="42"
      textAnchor="middle"
      fontSize="28"
      fill="#e0ad1a"
      style={font('--font-black-ops')}
    >
      L3
    </text>
  </>
)

// luminária fluorescente do teto (acesa)
const RibLamp = () => (
  <>
    <rect
      x="846"
      y="66"
      width="148"
      height="26"
      fill="#0a0e0d"
      stroke="#4a5753"
      strokeWidth="2"
    />
    <ellipse cx="920" cy="120" rx="430" ry="280" fill="url(#hl-g-halo)" />
    <rect x="858" y="84" width="124" height="9" fill="#f6fff7" />
  </>
)

// variante A: telefone de emergência e placa de saída verde
const RibA = () => (
  <>
    <RibCore />
    <RibLamp />
    <rect
      x="8"
      y="760"
      width="52"
      height="74"
      rx="4"
      fill="#8c1c12"
      stroke="#250604"
      strokeWidth="3"
    />
    <text
      x="34"
      y="806"
      textAnchor="middle"
      fontSize="20"
      fill="#ffe9e2"
      style={font('--font-saira-condensed')}
    >
      SOS
    </text>
    <circle cx="1808" cy="716" r="90" fill="url(#hl-g-green)" />
    <rect
      x="1778"
      y="698"
      width="60"
      height="36"
      rx="3"
      fill="#16a23a"
      stroke="#04310f"
      strokeWidth="3"
    />
    <path
      d="M1790 716h26M1806 706l10 10l-10 10"
      fill="none"
      stroke="#eaffea"
      strokeWidth="5"
    />
  </>
)

// variante B: hidrante de parede e quadro elétrico
const RibB = () => (
  <>
    <RibCore />
    <RibLamp />
    <circle
      cx="34"
      cy="800"
      r="27"
      fill="#a3241a"
      stroke="#2c0805"
      strokeWidth="4"
    />
    <circle cx="34" cy="800" r="10" fill="#2c0805" />
    <rect
      x="1782"
      y="760"
      width="52"
      height="74"
      fill="#283130"
      stroke="#080b0a"
      strokeWidth="3"
    />
    <path d="M1812 772l-12 22h10l-6 20l16-26h-10l6-16Z" fill="#e0ad1a" />
    <circle cx="1824" cy="824" r="26" fill="url(#hl-g-amber)" />
    <circle cx="1824" cy="824" r="4" fill="#ffcf7a" />
  </>
)

// variante C: luminária queimada (o pisca fica num div por cima)
const RibC = () => (
  <>
    <RibCore />
    <rect
      x="846"
      y="66"
      width="148"
      height="26"
      fill="#0a0e0d"
      stroke="#4a5753"
      strokeWidth="2"
    />
    <rect x="858" y="84" width="124" height="9" fill="#55625c" />
    <path d="M930 93l-8 22l14-8l-6 20" fill="none" stroke="#2c3533" />
  </>
)

// comporta blindada: folhas e moldura
const DoorLeafL = () => (
  <>
    <rect width="920" height="1140" fill="url(#hl-g-door)" />
    <path d="M0 286h920v34H0ZM0 590h920v34H0ZM0 894h920v34H0Z" fill="#1a201f" />
    <path d="M0 286h920v5H0ZM0 590h920v5H0ZM0 894h920v5H0Z" fill="#6d7c77" />
    <path d="M300 0v1140M600 0v1140" stroke="#151a19" strokeWidth="6" />
    <rect x="852" width="68" height="1140" fill="url(#hl-p-haz)" />
    <text
      x="828"
      y="780"
      textAnchor="end"
      fontSize="430"
      fill="#c79a12"
      opacity="0.92"
      style={font('--font-black-ops')}
    >
      0
    </text>
    <text
      x="420"
      y="200"
      textAnchor="middle"
      fontSize="40"
      fill="#c79a12"
      style={font('--font-saira-condensed')}
    >
      PORTA BLINDADA · NÃO OBSTRUIR
    </text>
  </>
)

const DoorLeafR = () => (
  <>
    <rect width="920" height="1140" fill="url(#hl-g-door)" />
    <path d="M0 286h920v34H0ZM0 590h920v34H0ZM0 894h920v34H0Z" fill="#1a201f" />
    <path d="M0 286h920v5H0ZM0 590h920v5H0ZM0 894h920v5H0Z" fill="#6d7c77" />
    <path d="M320 0v1140M620 0v1140" stroke="#151a19" strokeWidth="6" />
    <rect width="68" height="1140" fill="url(#hl-p-haz)" />
    <text
      x="92"
      y="780"
      fontSize="430"
      fill="#c79a12"
      opacity="0.92"
      style={font('--font-black-ops')}
    >
      7
    </text>
    <text
      x="500"
      y="200"
      textAnchor="middle"
      fontSize="40"
      fill="#c79a12"
      style={font('--font-saira-condensed')}
    >
      SETOR C · ACESSO RESTRITO
    </text>
  </>
)

const DoorFrame = () => (
  <>
    <path d={DOOR.frame} fill="url(#hl-g-steel)" fillRule="evenodd" />
    <path d={DOOR.hazard} fill="url(#hl-p-haz)" fillRule="evenodd" />
    <path d={DOOR.rim} fill="none" stroke="#050706" strokeWidth="6" />
    <path d={DOOR.rivets} fill="#66746f" />
    <circle cx="200" cy="200" r="150" fill="url(#hl-g-red)" />
    <circle cx="1640" cy="200" r="150" fill="url(#hl-g-red)" />
    <path
      d="M182 200a18 18 0 1 0 36 0a18 18 0 1 0-36 0ZM1622 200a18 18 0 1 0 36 0a18 18 0 1 0-36 0Z"
      fill="#ff6a4a"
    />
    <rect
      x="700"
      y="24"
      width="440"
      height="84"
      fill="#0a0d0c"
      stroke="#c79a12"
      strokeWidth="4"
    />
    <text
      x="920"
      y="86"
      textAnchor="middle"
      fontSize="54"
      fill="#f2b800"
      style={font('--font-black-ops')}
    >
      COMPORTA 07
    </text>
  </>
)

const ART = {
  'hl-rib-a': RibA,
  'hl-rib-b': RibB,
  'hl-rib-c': RibC,
  'hl-door-frame': DoorFrame,
}
export type ArtId = keyof typeof ART

// cambota / moldura da comporta (caixa da seção do túnel)
export const RibArt = ({ id }: { id: ArtId }) => {
  const Art = ART[id]
  return (
    <svg viewBox={RIB_VIEW} preserveAspectRatio="none" aria-hidden="true">
      <Art />
    </svg>
  )
}

// folha da comporta (metade da seção)
export const LeafArt = ({ side }: { side: 'l' | 'r' }) => (
  <svg viewBox="0 0 920 1140" preserveAspectRatio="none" aria-hidden="true">
    {side === 'l' ? <DoorLeafL /> : <DoorLeafR />}
  </svg>
)

// Túnel fixo. viewBox estreito + "meet": 1 unidade = 0,1vh em qualquer
// proporção de tela, com o ponto de fuga em (50%, 45%) da tela (o SVG passa
// 4vh de cada lado por causa do balanço do vagão). Só cores chapadas: a
// névoa e a luz que cresce para as bordas ficam num <div> com gradiente CSS
// por cima (.hl-fog), porque SVG com gradiente é repintado a cada recálculo
// de estilo da página (e o túnel ocupa a tela toda).
export const TUNNEL_VIEW = '-200 -490 400 1080'

export function StaticTunnel() {
  const T = TUNNEL
  return (
    <svg
      className="hl-tunnel"
      viewBox={TUNNEL_VIEW}
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
    >
      <path d={T.ceil} fill="#182120" />
      <path d={T.cham} fill="#1b2423" />
      <path d={T.wall} fill="#222d2b" />
      <path d={T.floor} fill="#131a19" />
      <path d={T.walkways} fill="#0c100f" opacity="0.7" />
      <path d={T.seams} fill="#050807" />
      <path d={T.bevels} fill="#33403c" opacity="0.7" />
      <path d={T.edges} fill="#3f4d49" opacity="0.8" />
      <path d={T.ceilRails} fill="#34413e" />
      <path d={T.trayCeil} fill="#0b100f" />
      <path d={T.trayCeilEdge} fill="#45534f" />
      <path d={T.cablesDark} fill="#080a0a" />
      <path d={T.cablesRed} fill="#4a1410" />
      <path d={T.pipeShadow} fill="#000" opacity="0.45" />
      <path d={T.pipeBase} fill="#2a3331" />
      <path d={T.pipeGreen} fill="#2c5528" />
      <path d={T.pipeYellow} fill="#8a6a10" />
      <path d={T.pipeLo} fill="#070909" opacity="0.75" />
      <path d={T.pipeHi} fill="#a9b8b2" opacity="0.38" />
      <path d={T.trayTop} fill="#1f2826" />
      <path d={T.trayCables} fill="#060707" />
      <path d={T.trayLip} fill="#303b38" />
      <path d={T.trayHi} fill="#6a7a75" />
      <path d={T.ductTop} fill="#3a4743" />
      <path d={T.ductFront} fill="#1b2321" />
      <path d={T.ductLines} fill="#0a0e0d" />
      <path d={T.paint} fill="#9a7610" opacity="0.75" />
      <path d={T.gutter} fill="#020303" />
      <path d={T.beamTop} fill="#28312f" />
      <path d={T.beamEdge} fill="#56645f" />
    </svg>
  )
}

// Guias de LED verdes no pé das paredes: ficam acima do apagão (luz de
// emergência) e esmaecem para o fundo em degraus (FADE em geo.ts). A
// variante `win` pinta as guias com a cor da fatia vencedora (fill pelo
// CSS, com var(--win-color)) e só aparece com o modal do vencedor aberto.
export function GuideLights({ win = false }: { win?: boolean }) {
  return (
    <svg
      className={win ? 'hl-tunnel hl-guides-win' : 'hl-tunnel hl-guides'}
      viewBox={TUNNEL_VIEW}
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
    >
      {TUNNEL.guideGlow.map(({ d, o }) => (
        <path
          key={`g${o}`}
          className="hl-guide-glow"
          d={d}
          opacity={Math.round(o * (win ? 0.45 : 0.24) * 100) / 100}
        />
      ))}
      {TUNNEL.guide.map(({ d, o }) => (
        <path key={`c${o}`} className="hl-guide-core" d={d} opacity={o} />
      ))}
    </svg>
  )
}

// arcos verdes da tempestade (um SVG por grupo; o pisca é no wrapper)
// (faixa do cabeçalho: y de -450 a -362; margens: |x| > 600)
export const ARCS_TOP = [
  zigzag(-500, -400, -110, -436, 9, 30) + zigzag(-380, -412, -280, -372, 5, 24),
  zigzag(-260, -440, 40, -395, 8, 30) + zigzag(-120, -420, -60, -370, 5, 22),
]
export const ARCS_SIDE = [
  zigzag(-880, -300, -700, 120, 10, 34) + zigzag(-860, -60, -680, 40, 6, 28),
  zigzag(870, -280, 760, 160, 10, 34) + zigzag(850, 0, 740, -60, 6, 28),
]
