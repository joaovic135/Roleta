import type { CSSProperties, ReactNode } from 'react'
import {
  SHORT_BOX,
  TOWERS,
  TRACK_Y,
  TowerSpec,
  dot,
  r1,
  rect,
  seeded,
  towerLedges,
} from './geo'

// Cidade em camadas (de trás para a frente): megaestruturas no horizonte
// (só aparecem de verdade quando um relâmpago acende o céu atrás delas),
// skyline distante com a arcologia no centro e as torres coladas nas
// bordas. Formas estáticas de uma cor viram um <path> só; o que pisca ou
// apaga no apagão fica em grupos (um <svg> ou um <div> por grupo), então o
// navegador só compõe camadas em vez de redesenhar janelas.

export const vars = (v: Record<string, string | number>) => v as CSSProperties
export const cx = (...c: (string | false | undefined)[]) =>
  c.filter(Boolean).join(' ')

// ---- camadas: far = 2400×1000 (corta nas laterais); tl/tr = torres
// 400×1000 coladas na borda esquerda/direita (--cy-tu por unidade)
type Frame = 'far' | 'tl' | 'tr'
const FRAMES: Record<Frame, [string, string]> = {
  far: ['0 0 2400 1000', 'xMidYMax slice'],
  tl: ['0 0 400 1000', 'xMinYMax meet'],
  tr: ['0 0 400 1000', 'xMaxYMax meet'],
}

export function Layer({
  frame,
  className,
  style,
  flip = frame === 'tr',
  children,
}: {
  frame: Frame
  className?: string
  style?: CSSProperties
  flip?: boolean
  children: ReactNode
}) {
  const [vb, par] = FRAMES[frame]
  return (
    <svg
      className={cx('cy-L', `cy-L-${frame}`, className)}
      viewBox={vb}
      preserveAspectRatio={par}
      style={style}
      aria-hidden="true"
    >
      {flip ? <g transform="matrix(-1 0 0 1 400 0)">{children}</g> : children}
    </svg>
  )
}

// ---- janelas: agrupadas por cor e por "turno" do apagão
type WinKey = 'a0' | 'a1' | 'c0' | 'sw' | 'bl' | 'dk'
type Win = Record<WinKey, string>
const newWin = (): Win => ({ a0: '', a1: '', c0: '', sw: '', bl: '', dk: '' })
const pickKey = (k: number, far: boolean): WinKey => {
  if (k < 0.36) return 'a0'
  if (k < 0.62) return 'a1'
  if (k < 0.88 || far) return 'c0'
  if (k < 0.95) return 'sw'
  return 'bl'
}

const fillWindows = (
  W: Win,
  rand: () => number,
  box: [number, number, number, number],
  step: [number, number],
  size: [number, number],
  p: number,
  far: boolean,
  skip?: (x: number, y: number) => boolean,
) => {
  const [x0, y0, x1, y1] = box
  for (let y = y0; y + size[1] <= y1; y += step[1]) {
    // andares inteiros tendem a estar acesos ou apagados (escritórios)
    const floor = rand() < 0.6 ? 1.35 : 0.35
    for (let x = x0; x + size[0] <= x1; x += step[0]) {
      if (skip && skip(x, y)) continue
      const d = rect(x, y, size[0], size[1])
      if (rand() > p * floor) {
        if (rand() < 0.55) W.dk += d
        continue
      }
      W[pickKey(rand(), far)] += d
    }
  }
}

// estrelas (poucas: só aparecem na estiada)
export const STARS = (() => {
  const rand = seeded(404)
  let a = ''
  let b = ''
  for (let i = 0; i < 46; i++) {
    const s = dot(rand() * 2000, rand() * 360, rand() < 0.2 ? 2.2 : 1.3)
    if (i % 2) a += s
    else b += s
  }
  return { a, b }
})()

// ---- megaestruturas do horizonte (silhuetas que o relâmpago revela) -----
// Ficam entre as torres das bordas e furam a faixa livre do topo: o
// zigurate colossal à esquerda da arcologia e a agulha com anéis à direita.
const MEGA = (() => {
  const rand = seeded(1999)
  const body =
    'M560 1000V560H600V430H650V310H700V210H750V130H790V70H890V130H930V210H980V310H1030V430H1080V560H1120V1000Z' +
    rect(838, 0, 4, 70) +
    rect(822, 30, 36, 3) +
    'M1488 1000L1510 330L1522 120L1530 6L1538 120L1550 330L1572 1000Z' +
    // anéis da agulha e passarelas de serviço do zigurate
    'M1440 200a90 11 0 1 0 180 0a90 11 0 1 0 -180 0z' +
    'M1400 420a130 15 0 1 0 260 0a130 15 0 1 0 -260 0z' +
    rect(700, 214, 330, 4) +
    rect(650, 434, 430, 4)
  let lit = ''
  for (let i = 0; i < 90; i++) {
    const zig = rand() < 0.7
    const y = zig ? 80 + rand() * 600 : 140 + rand() * 600
    // meia largura do zigurate naquela altura
    const half = zig ? 50 + Math.min(230, Math.max(0, (y - 70) * 0.48)) : 8
    const x = zig
      ? 840 + (rand() * 2 - 1) * (half - 14)
      : 1530 + (rand() - 0.5) * 16
    lit += rect(x, y, zig ? 7 : 4, 2)
  }
  const beacons = dot(840, 2, 5) + dot(1530, 6, 5) + dot(1440, 200, 4)
  // contorno claro: o relâmpago bate de trás
  const rim =
    'M600 560V430H650V310H700V210H750V130H790V70H890V130H930V210H980V310H1030V430H1080V560' +
    'M1510 330L1522 120L1530 6L1538 120L1550 330'
  return { body, lit, beacons, rim }
})()

export function Megas() {
  return (
    <>
      <Layer frame="far" className="cy-mega">
        <path className="cy-mega-body" d={MEGA.body} />
        <path className="cy-mega-rim" d={MEGA.rim} />
        <path className="cy-mega-lit" d={MEGA.lit} />
      </Layer>
      <Layer frame="far" className="cy-beacon cy-beacon-m">
        <path d={MEGA.beacons} />
      </Layer>
    </>
  )
}

// ---- skyline distante ------------------------------------------------------
const FW = 2400
const FH = 1000
// arcologia central: degraus até a agulha, que fica na faixa livre do topo
const ARCO =
  'M1000 1000V650H1050V480H1100V280H1140V170H1166V112H1190V22H1210V112H1234V170H1260V280H1300V480H1350V650H1400V1000Z'
const ARCO_EDGES =
  rect(1050, 648, 300, 3) +
  rect(1100, 478, 200, 3) +
  rect(1140, 278, 120, 3) +
  rect(1166, 168, 68, 3) +
  rect(1190, 110, 20, 3)
// vigas que prendem os telões do topo à agulha
const GIRDERS =
  rect(1150, 36, 40, 4) +
  rect(1150, 66, 40, 4) +
  rect(1210, 36, 40, 4) +
  rect(1210, 66, 40, 4) +
  'M1150 40L1190 66v4L1150 44z' +
  'M1250 40L1210 66v4L1250 44z'
// faixas vermelhas de emergência (acendem só no apagão)
const EMERG =
  rect(1046, 652, 4, 340) +
  rect(1350, 652, 4, 340) +
  rect(1096, 482, 4, 160) +
  rect(1300, 482, 4, 160) +
  rect(1136, 282, 4, 190) +
  rect(1260, 282, 4, 190) +
  rect(1100, 470, 200, 2) +
  rect(1050, 640, 300, 2)
// torres altas que furam a faixa do topo: [x, largura, topo]
const TALL: [number, number, number][] = [
  [250, 70, 120],
  [560, 60, 64],
  [790, 54, 96],
  [1560, 66, 84],
  [1830, 58, 58],
  [2120, 76, 110],
]

const FAR = (() => {
  const rand = seeded(2088)
  let back = ''
  let mid = ''
  let tall = ''
  let masts = GIRDERS
  let beaconA = ''
  let beaconB = ''
  const signs = { y: ARCO_EDGES, c: '', r: '' }
  const W = newWin()

  // fundo enevoado
  for (let x = -20; x < FW; ) {
    const w = 46 + rand() * 90
    const top = 300 + rand() * 300
    back += rect(x, top, w, FH - top)
    if (rand() < 0.3) back += rect(x + w * 0.45, top - 50 - rand() * 50, 3, 60)
    x += w + rand() * 8
  }
  // arcologia: faixas de luz horizontais
  for (let y = 300; y < 1000; y += 34) {
    const half = y < 480 ? 100 : y < 650 ? 150 : 200
    fillWindows(
      W,
      rand,
      [1210 - half, y, 1190 + half, y + 6],
      [26, 34],
      [18, 5],
      0.55,
      true,
    )
  }
  fillWindows(W, rand, [1148, 186, 1252, 276], [14, 18], [8, 9], 0.6, true)
  // prédios do meio
  for (let x = -30; x < FW; ) {
    const w = 60 + rand() * 100
    const nearArco = x + w > 960 && x < 1440
    const top = nearArco ? 640 + rand() * 160 : 360 + rand() * 380
    mid += rect(x, top, w, FH - top)
    const roof = rand()
    if (roof < 0.3) mid += rect(x + w * 0.2, top - 22, w * 0.5, 22)
    else if (roof < 0.5)
      mid +=
        rect(x + w * 0.6, top - 14, 16, 14) +
        rect(x + w * 0.62, top - 40, 2, 26)
    else if (roof < 0.62)
      mid += `M${r1(x)} ${r1(top)}L${r1(x + w / 2)} ${r1(top - 30)}L${r1(x + w)} ${r1(top)}Z`
    fillWindows(
      W,
      rand,
      [x + 8, top + 18, x + w - 8, FH],
      [15, 21],
      [7, 10],
      0.3,
      true,
    )
    // tiras de neon nas quinas
    if (rand() < 0.35) {
      const k = rand()
      const strip = rect(
        x + (rand() < 0.5 ? 2 : w - 6),
        top + 30,
        4,
        90 + rand() * 160,
      )
      if (k < 0.45) signs.y += strip
      else if (k < 0.75) signs.c += strip
      else signs.r += strip
    }
    x += w + 4 + rand() * 10
  }
  // torres altas com antenas e balizas
  TALL.forEach(([x, w, top], i) => {
    tall += `M${x} 1000V${top + 24}L${x + 12} ${top}H${x + w - 12}L${x + w} ${top + 24}V1000Z`
    fillWindows(
      W,
      rand,
      [x + 8, top + 40, x + w - 8, FH],
      [13, 19],
      [6, 9],
      0.34,
      true,
    )
    const mx = x + w / 2
    const mh = 40 + rand() * 40
    masts +=
      rect(mx - 1.5, top - mh, 3, mh) + rect(mx - 9, top - mh * 0.55, 18, 2)
    if (i % 2) beaconA += dot(mx, top - mh - 4, 6)
    else beaconB += dot(mx, top - mh - 4, 6)
  })
  beaconA += dot(1200, 16, 7)
  return { back, mid, tall, masts, beaconA, beaconB, signs, W }
})()

// raio em zigue-zague com um galho
const bolt = (seed: number, x: number, y0: number, y1: number) => {
  const rand = seeded(seed)
  let d = `M${x} ${y0}`
  let px = x
  let branch = ''
  const steps = 9
  for (let i = 1; i <= steps; i++) {
    const y = y0 + ((y1 - y0) * i) / steps
    px += (rand() - 0.5) * 70
    d += `L${r1(px)} ${r1(y)}`
    if (i === 3) {
      let bx = px
      branch = `M${r1(px)} ${r1(y)}`
      for (let j = 1; j <= 3; j++) {
        bx += 24 + rand() * 30
        branch += `L${r1(bx)} ${r1(y + j * 34)}`
      }
    }
  }
  return d + branch
}
const BOLTS: [string, string][] = [
  ['cy-bolt-a', bolt(11, 700, -20, 520)],
  ['cy-bolt-b', bolt(23, 1660, -20, 470)],
  ['cy-bolt-c', 'M1420 -20L1380 0L1330 -2L1290 12L1250 8L1222 20L1203 16'],
]

export function Bolts() {
  return (
    <>
      {BOLTS.map(([cls, d]) => (
        <Layer key={cls} frame="far" className={cx('cy-bolt', cls)}>
          <path d={d} />
        </Layer>
      ))}
    </>
  )
}

// atraso (fração do ciclo) de cada grupo de janelas no apagão em cascata
const WIN_D: Record<'a0' | 'a1' | 'c0', number> = {
  a0: 0,
  a1: 0.0035,
  c0: 0.0075,
}

export function FarCity() {
  return (
    <>
      <Layer frame="far" className="cy-far">
        <path className="cy-far-back" d={FAR.back} />
        <path className="cy-far-arco" d={ARCO} />
        <path className="cy-far-mid" d={FAR.mid} />
        <path className="cy-far-tall" d={FAR.tall} />
        <path className="cy-far-mast" d={FAR.masts} />
        <path className="cy-win-dk" d={FAR.W.dk} />
      </Layer>
      <Layer frame="far" className="cy-emerg">
        <path d={EMERG} />
      </Layer>
      {(['a0', 'a1', 'c0'] as const).map((k) => (
        <Layer
          key={k}
          frame="far"
          className={cx('cy-win', `cy-win-${k}`)}
          style={vars({ '--cy-d': WIN_D[k] })}
        >
          <path d={FAR.W[k]} />
        </Layer>
      ))}
      <Layer
        frame="far"
        className="cy-power cy-far-signs"
        style={vars({ '--cy-d': 0.002 })}
      >
        <path className="cy-sign-y" d={FAR.signs.y} />
        <path className="cy-sign-c" d={FAR.signs.c} />
        <path className="cy-sign-r" d={FAR.signs.r} />
      </Layer>
      <Layer frame="far" className="cy-beacon cy-beacon-a">
        <path d={FAR.beaconA} />
      </Layer>
      <Layer frame="far" className="cy-beacon cy-beacon-b">
        <path d={FAR.beaconB} />
      </Layer>
    </>
  )
}

// ---- torres das bordas -----------------------------------------------------
// tudo no referencial da torre esquerda; a da direita é espelhada no SVG
const buildTower = (t: TowerSpec) => {
  const rand = seeded(t.seed)
  const main = `M-40 1000V${t.top + 30}H0L30 ${t.top}H150L200 ${t.top + 50}V1000Z`
  const back = rect(196, t.backTop, 204, 1000 - t.backTop)
  let ledges = ''
  let rails = ''
  for (const y of towerLedges(t)) {
    ledges += rect(-40, y, 240, 5)
    // guarda-corpo do beiral
    for (let x = 6; x < 196; x += 12) rails += rect(x, y - 9, 1.4, 9)
    rails += rect(0, y - 10, 200, 1.6)
  }
  ledges += rect(-40, t.ledge, 246, 9) + rect(150, t.ledge - 30, 16, 30)
  // canos na fachada, aparelhos de ar e caixas
  let props =
    rect(4, t.top + 40, 5, 960 - t.top) + rect(188, t.top + 70, 4, 900)
  for (let i = 0; i < 9; i++) {
    const y = t.top + 140 + rand() * (TRACK_Y - t.top - 220)
    const x = 14 + rand() * 150
    props +=
      rect(x, y, 22, 13) +
      rect(x + 2, y + 13, 3, 4) +
      rect(x + 17, y + 13, 3, 4)
  }
  const grills = (() => {
    let d = ''
    const r = seeded(t.seed + 9)
    for (let i = 0; i < 9; i++) {
      const y = t.top + 140 + r() * (TRACK_Y - t.top - 220)
      const x = 14 + r() * 150
      for (let j = 0; j < 4; j++) d += rect(x + 3 + j * 5, y + 3, 2.4, 7)
    }
    return d
  })()
  const mast =
    rect(110, t.mast, 4, t.top - t.mast + 2) +
    rect(96, t.mast + 30, 32, 3) +
    rect(102, t.mast + 54, 20, 3) +
    rect(60, t.top - 26, 6, 26) +
    rect(48, t.top - 30, 30, 5) +
    // antena parabólica e caixa d'água no telhado
    `M130 ${t.top - 4}a16 9 -25 0 1 30 -14l-6 18z` +
    rect(143, t.top - 12, 3, 12) +
    rect(20, t.top - 2, 26, 4)
  const W = newWin()
  const covered = (
    x: number,
    y: number,
    b: { x: number; y: number; w: number; h: number },
  ) => x > b.x - 14 && x < b.x + b.w + 4 && y > b.y - 18 && y < b.y + b.h + 4
  fillWindows(
    W,
    rand,
    [14, t.top + 64, 186, TRACK_Y - 30],
    [18, 25],
    [10, 13],
    0.36,
    false,
    (x, y) =>
      covered(x, y, t.screen) ||
      covered(x, y, t.sign) ||
      Math.abs(y - t.ledge) < 26,
  )
  fillWindows(
    W,
    rand,
    [212, t.backTop + 30, 394, TRACK_Y - 20],
    [16, 22],
    [8, 11],
    0.3,
    false,
    (_, y) => Math.abs(y - t.bridge - 8) < 24,
  )
  return {
    main,
    back,
    ledges,
    rails,
    props,
    grills,
    mast,
    bridge: rect(190, t.bridge, 210, 22),
    lit: rect(190, t.bridge + 17, 210, 2.5),
    edge: rect(194, t.top + 60, 4, TRACK_Y - 60 - t.top),
    beacon: dot(112, t.mast - 4, 7) + dot(63, t.top - 33, 5),
    // suportes do telão e do letreiro
    mounts:
      rect(t.screen.x - 8, t.screen.y + 20, 8, 4) +
      rect(t.screen.x - 8, t.screen.y + t.screen.h - 24, 8, 4) +
      rect(t.sign.x - 6, t.sign.y + 14, 6, 3) +
      rect(t.sign.x - 6, t.sign.y + t.sign.h - 18, 6, 3),
    W,
  }
}

const TW = TOWERS.map(buildTower)
// caixa de força do letreiro que dá curto (torre da direita) + cabo
const JBOX =
  rect(SHORT_BOX.x - 8, SHORT_BOX.y - 10, 18, 22) +
  rect(SHORT_BOX.x - 2, SHORT_BOX.y + 12, 2, 40)

const TW_D: Record<'a0' | 'a1' | 'c0', number> = {
  a0: 0.0012,
  a1: 0.0048,
  c0: 0.009,
}

// as duas torres de um grupo de janelas animam juntas (um <div> só)
function TowerWin({ k, cls }: { k: WinKey; cls?: string }) {
  return (
    <>
      <Layer frame="tl" className={cls}>
        <path d={TW[0].W[k]} />
      </Layer>
      <Layer frame="tr" className={cls}>
        <path d={TW[1].W[k]} />
      </Layer>
    </>
  )
}

export function Towers() {
  return (
    <>
      {TOWERS.map((t, i) => (
        <Layer key={t.frame} frame={t.frame} className="cy-tower">
          <path className="cy-tw-back" d={TW[i].back} />
          <path className="cy-tw-bridge" d={TW[i].bridge} />
          <path className="cy-tw-main" d={TW[i].main} />
          <path className="cy-tw-props" d={TW[i].props + TW[i].mounts} />
          <path className="cy-tw-grill" d={TW[i].grills} />
          <path className="cy-tw-ledge" d={TW[i].ledges} />
          <path className="cy-tw-rail" d={TW[i].rails} />
          <path className="cy-tw-mast" d={TW[i].mast + (i ? JBOX : '')} />
          <path className="cy-win-dk" d={TW[i].W.dk} />
        </Layer>
      ))}
      {(['a0', 'a1', 'c0'] as const).map((k) => (
        <div
          key={k}
          className={cx('cy-box cy-win', `cy-win-${k}`)}
          style={vars({ '--cy-d': TW_D[k] })}
        >
          <TowerWin k={k} />
        </div>
      ))}
      {/* janelas que trocam de cor (magenta ↔ ciano) */}
      <div className="cy-box cy-win" style={vars({ '--cy-d': 0.006 })}>
        <TowerWin k="sw" cls="cy-win-sa" />
        <div className="cy-box cy-win-sb">
          <TowerWin k="sw" />
        </div>
      </div>
      {/* janelas com TV piscando */}
      <div className="cy-box cy-win" style={vars({ '--cy-d': 0.0105 })}>
        <div className="cy-box cy-win-bl">
          <TowerWin k="bl" />
        </div>
      </div>
      <div className="cy-box cy-beacon cy-beacon-t">
        <Layer frame="tl">
          <path d={TW[0].beacon} />
        </Layer>
        <Layer frame="tr">
          <path d={TW[1].beacon} />
        </Layer>
      </div>
    </>
  )
}

// letreiros das torres (quinas amarelas e passarela acesa)
export function TowerSigns() {
  return (
    <>
      {TOWERS.map((t, i) => (
        <Layer key={t.frame} frame={t.frame} className="cy-tw-signs">
          <path className="cy-sign-y" d={TW[i].edge} />
          <path className="cy-sign-c" d={TW[i].lit} />
        </Layer>
      ))}
    </>
  )
}

// cópia das tiras de neon com brilho forte: aparece quando a roleta gira
// (pico de energia); o filtro é fixo, só a opacidade muda
export function Flare() {
  return (
    <div className="cy-box cy-flare">
      <Layer frame="far">
        <path className="cy-sign-y" d={FAR.signs.y} />
        <path className="cy-sign-c" d={FAR.signs.c} />
      </Layer>
      <TowerSigns />
    </div>
  )
}

// letreiros de neon vermelho: 薬 zumbe; 酒場 entra em curto de tempos em
// tempos (as faíscas saem no canvas, no mesmo instante). Cada letra que
// pisca sozinha é um <svg> próprio.
export function NeonSigns() {
  return (
    <>
      {TOWERS.map((t) => {
        const { sign, frame } = t
        const sx = frame === 'tr' ? 400 - sign.x - sign.w : sign.x
        const chars = [...sign.word]
        const fs = sign.w * 0.66
        const glyph = (i: number) => (
          <text
            className="cy-neon-text"
            x={r1(sx + sign.w / 2)}
            y={r1(sign.y + sign.h * ((i + 0.5) / chars.length))}
            fontSize={r1(fs)}
          >
            {chars[i]}
          </text>
        )
        return chars.map((_, i) => (
          <Layer
            key={frame + i}
            frame={frame}
            flip={false}
            className={cx('cy-neon', `cy-neon-${frame}${i}`)}
          >
            {i === 0 && (
              <rect
                className="cy-neon-box"
                x={sx}
                y={sign.y}
                width={sign.w}
                height={sign.h}
              />
            )}
            {glyph(i)}
          </Layer>
        ))
      })}
    </>
  )
}
