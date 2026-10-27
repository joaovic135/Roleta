// Geometria da cidade em pixel art (compartilhada pelo SVG da cena e pela
// camada de atores no canvas): 760 x 160 "pixels" de cena, gerados com
// semente fixa. Telhados, postes e o viaduto do metrô ficam aqui para que
// pombos, herói, trem e pedestres pisem exatamente onde a arte desenhou.

export const seeded = (seed: number) => () => {
  seed = (seed + 0x6d2b79f5) | 0
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}
export const block = (x: number, y: number, w: number, h: number) =>
  `M${x} ${y}h${w}v${h}h-${w}z`

// Caixa da cidade: 760 x 160 "pixels", sempre com pixels quadrados
export const W = 760
export const H = 160
export const STREET = 144

// viaduto do metrô elevado: trilho em VIA_Y, tabuleiro logo abaixo e
// pilares descendo até a calçada (passa na frente dos prédios próximos)
export const VIA_Y = 112
export const VIA_PILLARS = Array.from({ length: 11 }, (_, i) => 14 + i * 76)
const onViaduct = (x: number, y: number, w: number, h: number) =>
  (y + h > VIA_Y - 1 && y < VIA_Y + 6) ||
  (y + h > VIA_Y + 5 && VIA_PILLARS.some((px) => x + w > px - 2 && x < px + 6))

const WIN_COLORS = ['#fcd25d', '#f8873b']
export type Win = { x: number; y: number; c: string; g: string }

const buildCity = () => {
  const rand = seeded(2024)
  const s = {
    far: '',
    farWin: '',
    near: '',
    rim: '',
    shade: '',
    glass: '',
    walk: block(0, STREET, W, 3),
    road: block(0, STREET + 3, W, H - STREET - 3),
    dash: '',
    via: '',
    viaDark: '',
    rail: '',
  }
  const wins: Win[] = []
  const roofs: [number, number, number][] = []
  const masts: [number, number][] = []
  // caixas d'água (telhados onde pombos gostam de pousar)
  const tanks: [number, number][] = []

  // prédios distantes: silhueta contínua, janelinhas de 1 pixel
  let x = -2
  while (x < W) {
    const w = 12 + Math.floor(rand() * 20)
    const h = 58 + Math.floor(rand() * 72)
    const top = STREET - h
    s.far += block(x, top, w, h)
    for (let wy = top + 3; wy < STREET - 2; wy += 4)
      for (let wx = x + 2; wx < x + w - 2; wx += 3)
        if (rand() < 0.13) s.farWin += block(wx, wy, 1, 1)
    x += w
  }

  // prédios próximos: mais altos nas bordas (o meio fica atrás dos cards)
  x = -3
  while (x < W) {
    const w = 12 + Math.floor(rand() * 17)
    const cx = x + w / 2
    const edge = Math.max(0, 1 - Math.min(cx, W - cx) / 210)
    const h = Math.floor(26 + rand() * 46 + edge * (20 + rand() * 40))
    const top = STREET - h
    s.near += block(x, top, w, h)
    s.rim += block(x, top, 1, h) + block(x, top, w, 1)
    s.shade += block(x + w - 2, top + 1, 2, h - 1)
    roofs.push([x, w, top])
    const roll = rand()
    if (roll < 0.3) {
      const mx = x + Math.floor(w / 2)
      s.near += block(mx, top - 9, 1, 9) + block(mx - 1, top - 3, 3, 3)
      masts.push([mx, top - 10])
    } else if (roll < 0.48 && w >= 13) {
      // caixa d'água no telhado
      const tx = x + 3
      s.near += block(tx, top - 9, 7, 6) + block(tx + 1, top - 10, 5, 1)
      s.shade += block(tx + 1, top - 3, 1, 3) + block(tx + 5, top - 3, 1, 3)
      s.rim += block(tx, top - 9, 1, 6)
      tanks.push([tx, top - 10])
    }
    // janelas
    const region = cx < 200 ? 'L' : cx >= 560 ? 'R' : 'C'
    const density = region === 'C' ? 0.24 : 0.4
    const baseG = Math.floor(rand() * 3)
    for (let wy = top + 4; wy < STREET - 5; wy += 5)
      for (let wx = x + 3; wx < x + w - 4; wx += 4) {
        if (rand() >= density) continue
        const r = rand()
        const c = WIN_COLORS[r < 0.66 ? 0 : 1]
        let g: string
        if (region !== 'C' && rand() < 0.13)
          g = ['flick', 'blink1', 'blink2', 'tv', 'tv'][Math.floor(rand() * 5)]
        else if (region === 'C') g = `C${rand() < 0.5 ? 0 : 1}`
        else g = `${region}${rand() < 0.7 ? baseG : Math.floor(rand() * 3)}`
        // janelas escondidas pelo viaduto ficam de fora (o sorteio segue
        // igual, então o resto da cidade não muda)
        if (onViaduct(wx, wy, 2, 2)) continue
        wins.push({ x: wx, y: wy, c, g })
        s.glass += block(wx, wy, 2, 2)
      }
    x += w + Math.floor(rand() * 3)
  }

  // rua: faixa tracejada e postes
  for (let dx = 4; dx < W; dx += 18) s.dash += block(dx, 153, 9, 1)
  const lamps: number[] = []
  for (let lx = 22; lx < W; lx += 84) {
    s.shade += block(lx, 131, 1, 13) + block(lx, 131, 4, 1)
    s.shade += block(lx + 3, 132, 3, 1)
    lamps.push(lx)
  }

  // chaminés: uma em cada borda (fumaça visível fora dos cards)
  const chimneys: [number, number][] = []
  for (const [lo, hi] of [
    [24, 90],
    [672, 740],
  ]) {
    const roof = roofs.find(
      ([rx, rw]) => rx + rw / 2 >= lo && rx + rw / 2 <= hi,
    )
    if (!roof) continue
    const [rx, rw, rt] = roof
    const chx = rx + rw - 6
    s.near += block(chx, rt - 6, 3, 6)
    s.rim += block(chx, rt - 6, 3, 1)
    chimneys.push([chx, rt - 7])
  }

  // viaduto: trilho claro, tabuleiro com treliça em X e pilares com
  // capitel; a sombra do tabuleiro cai na fachada logo abaixo
  s.rail += block(0, VIA_Y, W, 1)
  s.via += block(0, VIA_Y + 1, W, 4)
  s.viaDark += block(0, VIA_Y + 5, W, 1)
  for (let tx = 0; tx < W; tx += 8)
    s.viaDark +=
      block(tx + 1, VIA_Y + 2, 1, 1) +
      block(tx + 2, VIA_Y + 3, 2, 1) +
      block(tx + 4, VIA_Y + 2, 1, 1) +
      block(tx + 6, VIA_Y + 1, 1, 3)
  for (const px of VIA_PILLARS) {
    s.via += block(px - 1, VIA_Y + 6, 6, 2) + block(px, VIA_Y + 8, 4, 24)
    s.viaDark +=
      block(px + 3, VIA_Y + 8, 1, 24) + block(px - 1, VIA_Y + 7, 6, 1)
    s.rail += block(px, VIA_Y + 8, 1, 24)
  }
  return { s, wins, roofs, masts, lamps, chimneys, tanks }
}
export const CITY = buildCity()
