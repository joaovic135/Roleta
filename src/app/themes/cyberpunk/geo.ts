// Geometria e linha do tempo da cena cyberpunk, compartilhadas entre as
// camadas em SVG/HTML (Scene.tsx e companhia) e o canvas da chuva
// (Rain.tsx). Tudo sorteado com semente fixa: igual a cada visita.

export const seeded = (seed: number) => () => {
  seed = (seed + 0x6d2b79f5) | 0
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}

export const r1 = (n: number) => Math.round(n * 10) / 10
export const rect = (x: number, y: number, w: number, h: number) =>
  `M${r1(x)} ${r1(y)}h${r1(w)}v${r1(h)}h${r1(-w)}z`
export const dot = (x: number, y: number, r: number) =>
  `M${r1(x - r)} ${r1(y)}a${r} ${r} 0 1 0 ${r * 2} 0a${r} ${r} 0 1 0 ${-r * 2} 0z`

// ---- ciclo do clima/energia (mesmos números de theme.css) ----------------
// --cy-cycle = 240 s; a página abre em 16% do ciclo (--cy-at = -0.16)
export const CYCLE = 240
export const CYCLE_AT = 0.16

// fase do ciclo (0..1) no instante t (ms desde a montagem)
export const cyclePhase = (t: number) =>
  (((t / 1000 / CYCLE + CYCLE_AT) % 1) + 1) % 1

// intensidade da chuva ao longo do ciclo: garoa, vento, tempestade,
// apagão, neblina, estiada e a garoa de volta
const RAIN: [number, number][] = [
  [0, 0.32],
  [0.24, 0.32],
  [0.34, 0.78],
  [0.37, 1],
  [0.56, 1],
  [0.6, 0.85],
  [0.66, 0.7],
  [0.8, 0.22],
  [0.83, 0.05],
  [0.93, 0.05],
  [0.97, 0.32],
  [1, 0.32],
]
export const rainAt = (p: number) => {
  for (let i = 1; i < RAIN.length; i++) {
    const [p1, v1] = RAIN[i]
    if (p <= p1) {
      const [p0, v0] = RAIN[i - 1]
      return v0 + ((v1 - v0) * (p - p0)) / (p1 - p0 || 1)
    }
  }
  return RAIN[0][1]
}

// ---- torres das bordas -----------------------------------------------------
// Unidades da torre: 1000 = altura da tela no desktop (--cy-tu = 0,1cqh);
// em telas em pé (≤ 3/4) as torres encolhem para 70% (--cy-tu = 0,07cqh).
// Tudo no referencial da torre esquerda; a direita é espelhada.
export const TOWER_U = (w: number, h: number) =>
  (w / h <= 0.75 ? 0.0007 : 0.001) * h

// trilho elevado do maglev (na frente das torres, de ponta a ponta)
export const TRACK_Y = 868
export const TRACK_H = 16

export interface Box {
  x: number
  y: number
  w: number
  h: number
}

export interface TowerSpec {
  frame: 'tl' | 'tr'
  seed: number
  top: number
  backTop: number
  mast: number
  bridge: number
  ledge: number
  // telão vertical e letreiro de neon vermelho
  screen: Box
  sign: Box & { word: string }
}

export const TOWERS: TowerSpec[] = [
  {
    frame: 'tl',
    seed: 731,
    top: 110,
    backTop: 250,
    mast: 14,
    bridge: 412,
    ledge: 548,
    screen: { x: 22, y: 590, w: 124, h: 236 },
    sign: { x: 124, y: 214, w: 36, h: 128, word: '薬' },
  },
  {
    frame: 'tr',
    seed: 977,
    top: 64,
    backTop: 330,
    mast: 6,
    bridge: 470,
    ledge: 590,
    screen: { x: 30, y: 128, w: 118, h: 372 },
    sign: { x: 52, y: 628, w: 78, h: 212, word: '酒場' },
  },
]

// beirais da torre (onde a chuva respinga); semente própria
export const towerLedges = (t: TowerSpec) => {
  const rand = seeded(t.seed + 1)
  const ys: number[] = []
  for (let y = t.top + 120; y < TRACK_Y - 60; y += 150 + rand() * 60)
    if (
      Math.abs(y - t.ledge) > 40 &&
      !inside(y, t.screen) &&
      !inside(y, t.sign)
    )
      ys.push(Math.round(y))
  return ys
}
const inside = (y: number, b: Box) => y > b.y - 12 && y < b.y + b.h + 12

// ---- letreiro que entra em curto (torre da direita) ------------------------
// laço de 43 s; pane aos 72% (faíscas no canvas no mesmo instante)
export const SHORT_PERIOD = 43
export const SHORT_AT = 0.72
export const SHORT_DELAY = -12
// caixa de força do letreiro, de onde saem as faíscas
export const SHORT_BOX = { x: 136, y: 640 }
