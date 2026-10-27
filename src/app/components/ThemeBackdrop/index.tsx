import ThemeScene from './ThemeScene'

// Cena de fundo dos temas (estrelas, sol listrado, montanhas em wireframe,
// cidade, grade neon, chuva, bolhas, CDs...). Tudo em CSS/SVG estático, sem
// imagens: cada camada fica oculta por padrão e src/app/themes.css mostra
// só as do tema ativo. As animações mexem apenas em transform/opacity.

// Montanhas em wireframe: picos fixos, triangulados até a base
const PEAKS = [
  [0, 150],
  [60, 95],
  [120, 140],
  [190, 55],
  [260, 125],
  [330, 80],
  [400, 135],
  [470, 40],
  [550, 120],
  [620, 70],
  [700, 130],
  [770, 50],
  [850, 115],
  [920, 75],
  [1000, 140],
  [1070, 60],
  [1140, 120],
  [1200, 90],
]
const BASE = 200

const mountainLines = () => {
  const lines: string[] = []
  for (let i = 0; i < PEAKS.length - 1; i++) {
    const [x1, y1] = PEAKS[i]
    const [x2, y2] = PEAKS[i + 1]
    const mid = (x1 + x2) / 2
    lines.push(`M${x1} ${y1}L${mid} ${BASE}L${x2} ${y2}`)
    lines.push(`M${x1} ${y1}L${x1 + (mid - x1) / 2} ${(y1 + BASE) / 2 + 20}`)
  }
  return lines.join('')
}
const mountainOutline = `M0 ${BASE}L${PEAKS.map(([x, y]) => `${x} ${y}`).join('L')}L1200 ${BASE}Z`

// Cidade: prédios de alturas fixas, com algumas janelas e letreiros
const BUILDINGS = [
  [0, 60, 150],
  [55, 45, 210],
  [95, 70, 120],
  [160, 40, 250],
  [195, 85, 170],
  [275, 50, 230],
  [320, 65, 140],
  [380, 35, 280],
  [410, 80, 190],
  [485, 55, 240],
  [535, 70, 160],
  [600, 45, 270],
  [640, 90, 200],
  [725, 50, 150],
  [770, 60, 260],
  [825, 40, 180],
  [860, 85, 230],
  [940, 55, 140],
  [990, 70, 290],
  [1055, 45, 200],
  [1095, 60, 160],
  [1150, 50, 220],
]
const SIGNS = [
  [170, 110, 'var(--sign-1)'],
  [420, 160, 'var(--sign-2)'],
  [650, 130, 'var(--sign-3)'],
  [870, 120, 'var(--sign-1)'],
  [1000, 70, 'var(--sign-2)'],
] as const

// Teia de canto: fios radiais saindo do canto e anéis que "cedem" entre
// um fio e outro (curva puxada para o centro)
const webPath = (radius: number, spokes: number, rings: number) => {
  const angles = Array.from(
    { length: spokes },
    (_, i) => (i / (spokes - 1)) * (Math.PI / 2),
  )
  const at = (r: number, a: number) =>
    `${(Math.cos(a) * r).toFixed(1)} ${(Math.sin(a) * r).toFixed(1)}`
  const parts = angles.map((a) => `M0 0L${at(radius, a)}`)
  for (let k = 1; k <= rings; k++) {
    const r = (radius * k) / rings
    let d = `M${at(r, angles[0])}`
    for (let i = 1; i < angles.length; i++) {
      const mid = (angles[i - 1] + angles[i]) / 2
      d += `Q${at(r * 0.86, mid)} ${at(r, angles[i])}`
    }
    parts.push(d)
  }
  return parts.join('')
}
const WEB = webPath(300, 9, 8)

// Aranha genérica (silhueta própria, não é o logo de nenhum personagem)
export const SPIDER_BODY =
  'M32 17a6 7 0 1 1 0 14a6 7 0 1 1 0-14zM32 28a8 11 0 1 1 0 22a8 11 0 1 1 0-22z'
export const SPIDER_LEGS =
  'M27 22L16 12L8 16M37 22L48 12L56 16M26 28L12 26L4 32M38 28L52 26L60 32' +
  'M26 34L12 40L6 50M38 34L52 40L58 50M28 40L18 52L16 62M36 40L46 52L48 62'

export default function ThemeBackdrop() {
  return (
    <div className="theme-backdrop" aria-hidden="true">
      <ThemeScene />
      <div className="bd-stars" />
      <div className="bd-sun-glow" />
      <div className="bd-sun" />
      <svg
        className="bd-city"
        viewBox="0 0 1200 300"
        preserveAspectRatio="none"
      >
        {BUILDINGS.map(([x, w, h]) => (
          <rect key={x} x={x} y={300 - h} width={w} height={h} />
        ))}
        {SIGNS.map(([x, y, color]) => (
          <rect
            key={x}
            className="bd-sign"
            x={x}
            y={300 - y}
            width="10"
            height="46"
            style={{ fill: color }}
          />
        ))}
      </svg>
      <svg
        className="bd-mountains"
        viewBox="0 0 1200 200"
        preserveAspectRatio="none"
      >
        <path d={mountainOutline} className="bd-mountains-fill" />
        <path d={mountainLines()} className="bd-mountains-lines" />
        <path
          d={mountainOutline.replace(/Z$/, '')}
          className="bd-mountains-lines"
        />
      </svg>
      <div className="bd-floor">
        <div className="bd-grid" />
      </div>
      <div className="bd-rain" />
      <div className="bd-halftone" />
      <div className="bd-cds">
        <span />
        <span />
        <span />
      </div>
      <div className="bd-bubbles">
        {Array.from({ length: 9 }, (_, i) => (
          <span key={i} />
        ))}
      </div>
      <div className="bd-scanlines" />
      <svg className="bd-web bd-web-tl" viewBox="0 0 300 300">
        <path d={WEB} />
      </svg>
      <svg className="bd-web bd-web-br" viewBox="0 0 300 300">
        <path d={WEB} />
      </svg>
      <div className="bd-spider">
        <svg viewBox="0 0 64 64">
          <path className="bd-spider-body" d={SPIDER_BODY} />
          <path className="bd-spider-legs" d={SPIDER_LEGS} />
        </svg>
      </div>
    </div>
  )
}
