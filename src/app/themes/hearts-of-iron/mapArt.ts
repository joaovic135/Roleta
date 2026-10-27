import {
  CITY_MARKS,
  COASTLINE,
  CONTOURS,
  CONTOURS_MAJOR,
  FRONT_BASE,
  GRID,
  HACHURE,
  ISLE_HILLS,
  ISLES,
  LAKES,
  MARSH,
  MH,
  MW,
  PENCIL,
  PROVINCES,
  RAILWAY,
  RAIL_TICKS,
  RIVERS,
  ROADS,
  SEA,
  STAINS,
  TINTS,
  TREES,
  WATER,
} from './map'

// A parte estática da carta vira uma imagem SVG (Blob URL usada como
// background): o navegador desenha uma vez e guarda. Assim nenhuma troca de
// estilo do documento (ex.: data-wheel no <html>) obriga a regravar milhares
// de segmentos de caminho na thread principal. Os textos ficam fora, num
// <svg> normal, porque uma imagem não enxerga as fontes da página.

// ---- contadores de unidade (blocos de madeira com símbolo genérico) ----
export type Kind = 'inf' | 'arm' | 'art'
export const symbol = (x: number, y: number, k: Kind) => {
  // corpo 22 × 13; símbolo dentro de um retângulo 14 × 9
  const sx = x + 4
  const sy = y + 2
  const frame = `M${sx} ${sy}h14v9h-14z`
  if (k === 'inf') return frame + `M${sx} ${sy}l14 9M${sx + 14} ${sy}l-14 9`
  if (k === 'arm')
    return (
      frame + `M${sx + 4} ${sy + 2}h6a2.5 2.5 0 0 1 0 5h-6a2.5 2.5 0 0 1 0-5z`
    )
  return frame + `M${sx + 7} ${sy + 3}a1.6 1.6 0 1 0 0.1 0z`
}
export const block = (x: number, y: number) => ({
  shadow: `M${x + 2} ${y + 3}h22v16h-22z`,
  side: `M${x} ${y + 12}h22v4h-22z`,
  top: `M${x} ${y}h22v13h-22z`,
})
const STATIC_UNITS: [number, number, 'red' | 'blue', Kind][] = [
  [600, 40, 'red', 'inf'],
  [742, 42, 'red', 'art'],
  [1306, 40, 'red', 'inf'],
  [640, 96, 'blue', 'inf'],
  [1176, 92, 'blue', 'art'],
  [972, 28, 'blue', 'inf'],
  [128, 230, 'red', 'arm'],
  [150, 520, 'red', 'inf'],
  [248, 300, 'blue', 'inf'],
  [1440, 420, 'red', 'art'],
  [1420, 600, 'red', 'inf'],
  [1330, 380, 'blue', 'arm'],
]
const units = (() => {
  const out = { shadow: '', side: '', red: '', blue: '', sym: '' }
  for (const [x, y, c, k] of STATIC_UNITS) {
    const b = block(x, y)
    out.shadow += b.shadow
    out.side += b.side
    out[c] += b.top
    out.sym += symbol(x, y, k)
  }
  return out
})()

// alfinetes de cabeça de vidro nos objetivos
export const PINS: [number, number, 'red' | 'blue' | 'brass'][] = [
  [774, 66, 'brass'],
  [990, 44, 'red'],
  [1262, 26, 'blue'],
  [552, 98, 'brass'],
  [178, 296, 'red'],
  [1424, 286, 'blue'],
]
const PIN_COLOR = { red: '#e0472e', blue: '#5f8fd0', brass: '#e3bd5f' }

// ---- montagem do SVG (atributos de apresentação embutidos) ----
type Attrs = Record<string, string | number>
const attr = (a: Attrs) =>
  Object.entries(a)
    .map(([k, v]) => `${k}="${v}"`)
    .join(' ')
const path = (d: string, a: Attrs) => `<path d="${d}" ${attr(a)}/>`
const line = (stroke: string, w: number, more: Attrs = {}) => ({
  fill: 'none',
  stroke,
  'stroke-width': w,
  ...more,
})
const circle = (cx: number, cy: number, r: number, a: Attrs) =>
  `<circle cx="${cx}" cy="${cy}" r="${r}" ${attr(a)}/>`

const front = (k: 'counter' | 'line' | 'teeth') =>
  FRONT_BASE.map((f) => f[k]).join('')

export const MAP_SVG =
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${MW} ${MH}" ` +
  `width="${MW * 2}" height="${MH * 2}" preserveAspectRatio="none">` +
  '<defs>' +
  '<radialGradient id="p" cx="50%" cy="38%" r="75%">' +
  '<stop offset="0" stop-color="#6c5d39"/>' +
  '<stop offset="0.55" stop-color="#5a4d2f"/>' +
  '<stop offset="1" stop-color="#3d3420"/></radialGradient>' +
  '<linearGradient id="s" x1="0" y1="0" x2="0.9" y2="0.5">' +
  '<stop offset="0" stop-color="#141c1c"/>' +
  '<stop offset="1" stop-color="#24302e"/></linearGradient>' +
  '<filter id="b" x="-5%" y="-5%" width="110%" height="110%">' +
  '<feGaussianBlur stdDeviation="3"/></filter>' +
  '</defs>' +
  // papel e relevo pintado (tintas hipsométricas suavizadas)
  `<rect width="${MW}" height="${MH}" fill="url(#p)"/>` +
  '<g filter="url(#b)">' +
  ['#6a5b38', '#75653e', '#827046', '#917c4f']
    .map((fill, i) => path(TINTS[i], { fill }))
    .join('') +
  '</g>' +
  path(CONTOURS, line('rgba(240,214,150,0.2)', 0.8)) +
  path(CONTOURS_MAJOR, line('rgba(54,40,18,0.45)', 1.4)) +
  path(HACHURE, line('rgba(46,32,14,0.55)', 1)) +
  // baía do Mar de Ferro
  path(
    COASTLINE,
    line('rgba(10,16,16,0.35)', 16, { 'stroke-linejoin': 'round' }),
  ) +
  path(SEA, { fill: 'url(#s)' }) +
  WATER.map((d, i) =>
    path(d, line(`rgba(150,196,186,${[0.3, 0.17, 0.08][i]})`, 1)),
  ).join('') +
  path(ISLES, { fill: '#5d5032' }) +
  path(ISLE_HILLS, { fill: '#6f5f3b' }) +
  path(COASTLINE, line('rgba(226,204,146,0.75)', 1.6)) +
  path(ISLES, line('rgba(226,204,146,0.75)', 1.6)) +
  // águas, matas, brejos
  path(LAKES, {
    fill: '#2d4446',
    stroke: 'rgba(150,196,186,0.5)',
    'stroke-width': 1,
  }) +
  path(RIVERS, line('#263a3c', 3.6, { 'stroke-linecap': 'round' })) +
  path(RIVERS, line('#5f8c90', 1.6, { 'stroke-linecap': 'round' })) +
  path(MARSH, line('rgba(130,170,150,0.5)', 0.9)) +
  path(TREES.shade, { fill: 'rgba(0,0,0,0.3)' }) +
  path(TREES.crown, {
    fill: '#3f4626',
    stroke: 'rgba(20,22,10,0.5)',
    'stroke-width': 0.5,
  }) +
  // grade, províncias, estradas, ferrovia
  path(
    GRID,
    line('rgba(236,214,160,0.14)', 0.8, { 'stroke-dasharray': '2 4' }),
  ) +
  path(
    PROVINCES,
    line('rgba(236,214,160,0.38)', 1, {
      'stroke-dasharray': '1 3',
      'stroke-linecap': 'round',
    }),
  ) +
  path(ROADS, line('rgba(150,58,36,0.8)', 1.3)) +
  path(RAILWAY, line('#1d1910', 1.6)) +
  path(RAIL_TICKS, line('#1d1910', 1)) +
  // manchas de café e lápis de cera
  STAINS.map(
    ([x, y, r]) =>
      circle(x, y, r, line('rgba(70,40,12,0.35)', 4)) +
      circle(x + 3, y - 2, r - 4, line('rgba(70,40,12,0.2)', 1.5)),
  ).join('') +
  path(
    PENCIL,
    line('rgba(240,206,74,0.7)', 2.2, {
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round',
    }),
  ) +
  // frente no estado inicial
  path(front('counter'), line('#6e9ccc', 1.3, { 'stroke-dasharray': '5 3' })) +
  path(front('line'), line('#d2482e', 2.2, { 'stroke-linejoin': 'round' })) +
  path(front('teeth'), { fill: '#d2482e' }) +
  // cidades
  path(CITY_MARKS.big, {
    fill: '#1c1810',
    stroke: '#e7d6a8',
    'stroke-width': 1.2,
  }) +
  path(CITY_MARKS.small, {
    fill: '#1c1810',
    stroke: '#e7d6a8',
    'stroke-width': 0.9,
  }) +
  // contadores parados
  path(units.shadow, { fill: 'rgba(0,0,0,0.45)' }) +
  path(units.side, { fill: '#5a3d1c' }) +
  path(units.red, { fill: '#a83a24', stroke: '#e8b48a', 'stroke-width': 0.6 }) +
  path(units.blue, {
    fill: '#3f6390',
    stroke: '#b4cce6',
    'stroke-width': 0.6,
  }) +
  path(units.sym, line('#f0e2bc', 0.9)) +
  // alfinetes
  PINS.map(
    ([x, y, c]) =>
      path(
        `M${x} ${y}l4 8`,
        line('rgba(10,8,4,0.8)', 1.3, { 'stroke-linecap': 'round' }),
      ) +
      circle(x, y, 4.6, {
        fill: PIN_COLOR[c],
        stroke: 'rgba(0,0,0,0.6)',
        'stroke-width': 0.8,
      }) +
      circle(x - 1.4, y - 1.5, 1.5, { fill: 'rgba(255,255,255,0.75)' }),
  ).join('') +
  '</svg>'

// URL criada uma vez (a cena só roda no navegador)
let url = ''
export const mapUrl = () => {
  if (!url)
    url = URL.createObjectURL(new Blob([MAP_SVG], { type: 'image/svg+xml' }))
  return url
}
