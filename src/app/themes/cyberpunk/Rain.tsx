'use client'

import { useRef } from 'react'
import { useCanvasFit } from '../_kit/canvas'
import { useSceneLoop } from '../_kit/loop'
import { wheelPhase } from '../_kit/wheel'
import {
  SHORT_AT,
  SHORT_BOX,
  SHORT_DELAY,
  SHORT_PERIOD,
  TOWERS,
  TOWER_U,
  TRACK_Y,
  cyclePhase,
  rainAt,
  seeded,
  towerLedges,
} from './geo'

// Camada em canvas 2D (a única com laço em JS): chuva em três
// profundidades (as de perto mais longas, rápidas e claras), respingos na
// rua, nos beirais das torres e no trilho do maglev, carros voadores com
// rastro de luz em seis faixas de profundidades diferentes, faíscas do
// letreiro que entra em curto e, quando a roleta para, os rastros ganham a
// cor da fatia vencedora e os telões soltam uma chuva de faíscas dessa cor.
//
// Tudo é função do tempo t (sem estado por gota): cada gota tem fase e
// velocidade sorteadas uma vez, então qualquer instante pode ser desenhado
// direto (o roteiro de capturas congela t). Sprites (carro, rastro, brilho)
// são pré-renderizados uma vez; no quadro só há moveTo/lineTo em lote e
// drawImage, sem alocar nada.

const TAU = Math.PI * 2

// ---- chuva -----------------------------------------------------------------
interface RainLayer {
  max: number // gotas em 1920×1080 com chuva forte
  speed: number // px/s em 1080 de altura
  len: number
  width: number
  slant: number // dx por dy (vento vindo da direita)
  alpha: number
  colors: [string, string, string] // esquerda (ciano), meio, direita (rosa)
}
const LAYERS: RainLayer[] = [
  {
    max: 420,
    speed: 640,
    len: 10,
    width: 1,
    slant: -0.1,
    alpha: 0.26,
    colors: ['#7fb9c8', '#8fa3b8', '#b897b0'],
  },
  {
    max: 230,
    speed: 1080,
    len: 21,
    width: 1,
    slant: -0.13,
    alpha: 0.36,
    colors: ['#a6f3ff', '#b9cbe0', '#ffb6d2'],
  },
  {
    max: 96,
    speed: 1580,
    len: 44,
    width: 1.6,
    slant: -0.16,
    alpha: 0.5,
    colors: ['#c8fbff', '#dfe9f6', '#ffd0e2'],
  },
]
const AREA_MAX = 1.7
const SPLASH = 0.32 // s de vida de um respingo

const DROPS = LAYERS.map((L, li) => {
  const n = Math.ceil(L.max * AREA_MAX)
  const rand = seeded(500 + li * 31)
  const fx = new Float32Array(n)
  const ph = new Float32Array(n)
  const sp = new Float32Array(n)
  const ln = new Float32Array(n)
  for (let i = 0; i < n; i++) {
    fx[i] = rand()
    ph[i] = rand()
    sp[i] = 0.82 + rand() * 0.36
    ln[i] = 0.7 + rand() * 0.6
  }
  return {
    n,
    fx,
    ph,
    sp,
    ln,
    // em px, refeitos a cada redimensionamento
    x: new Float32Array(n),
    floor: new Float32Array(n),
    v: new Float32Array(n),
    len: new Float32Array(n),
    bucket: new Uint8Array(n),
    // 0 = cai fora da tela, 1 = rua (coroa + anel), 2 = beiral/trilho
    kind: new Uint8Array(n),
  }
})
const SPL_MAX = DROPS[1].n + DROPS[2].n
const splX = new Float32Array(SPL_MAX)
const splY = new Float32Array(SPL_MAX)
const splA = new Float32Array(SPL_MAX)
const splK = new Uint8Array(SPL_MAX)

// ---- tráfego aéreo -----------------------------------------------------------
interface Lane {
  y: number // fração da altura
  s: number // escala (profundidade)
  dir: 1 | -1
  cross: number // s para atravessar a tela
  cars: number
  tilt: number
  clip: boolean // passa atrás das torres das bordas
  seed: number
}
const LANES: Lane[] = [
  {
    y: 0.011,
    s: 0.42,
    dir: 1,
    cross: 30,
    cars: 3,
    tilt: -0.004,
    clip: false,
    seed: 3,
  },
  {
    y: 0.046,
    s: 0.62,
    dir: -1,
    cross: 19,
    cars: 3,
    tilt: 0.006,
    clip: false,
    seed: 5,
  },
  {
    y: 0.079,
    s: 0.84,
    dir: 1,
    cross: 12.5,
    cars: 2,
    tilt: -0.008,
    clip: false,
    seed: 8,
  },
  {
    y: 0.33,
    s: 0.5,
    dir: -1,
    cross: 24,
    cars: 3,
    tilt: 0.012,
    clip: true,
    seed: 13,
  },
  {
    y: 0.6,
    s: 1.15,
    dir: 1,
    cross: 7.4,
    cars: 2,
    tilt: -0.02,
    clip: false,
    seed: 21,
  },
  {
    y: 0.785,
    s: 0.95,
    dir: -1,
    cross: 10.6,
    cars: 2,
    tilt: 0.014,
    clip: false,
    seed: 34,
  },
]
const NEON = ['#fcee0a', '#00f0ff', '#ff3da6', '#ff003c']
const CARS = LANES.map((lane) => {
  const rand = seeded(lane.seed * 97)
  return Array.from({ length: lane.cars }, (_, i) => ({
    off: (i + rand() * 0.55) / lane.cars,
    color: Math.floor(rand() * NEON.length),
  }))
})

// ---- faíscas (curto no letreiro) e chuva de faíscas da vitória -------------
const SPARK_N = 30
const SPARK = (() => {
  const rand = seeded(77)
  const vx = new Float32Array(SPARK_N)
  const vy = new Float32Array(SPARK_N)
  const life = new Float32Array(SPARK_N)
  for (let i = 0; i < SPARK_N; i++) {
    vx[i] = -200 + rand() * 250
    vy[i] = -230 + rand() * 280
    life[i] = 0.45 + rand() * 0.85
  }
  return { vx, vy, life }
})()
const CONF_N = 56
const CONF = (() => {
  const rand = seeded(91)
  const vx = new Float32Array(CONF_N)
  const vy = new Float32Array(CONF_N)
  const life = new Float32Array(CONF_N)
  const delay = new Float32Array(CONF_N)
  for (let i = 0; i < CONF_N; i++) {
    const a = rand() * TAU
    const v = 90 + rand() * 260
    vx[i] = Math.cos(a) * v
    vy[i] = Math.sin(a) * v * 0.8 - 120
    life[i] = 1.4 + rand() * 1.6
    delay[i] = (i % 3) * 0.35 + rand() * 0.1
  }
  return { vx, vy, life, delay }
})()

// ---- sprites (pré-renderizados uma vez) --------------------------------------
const CAR_W = 96
const CAR_H = 36
const TRAIL_W = 256
const TRAIL_H = 18
const DOT = 24

const hexA = (hex: string, a: number) => {
  const n = parseInt(hex.slice(1), 16)
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`
}
const surface = (w: number, h: number, dir: 1 | -1 = 1) => {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  const g = c.getContext('2d')!
  if (dir < 0) {
    g.translate(w, 0)
    g.scale(-1, 1)
  }
  return { c, g }
}

const carSprite = (color: string, dir: 1 | -1) => {
  const { c, g } = surface(CAR_W, CAR_H, dir)
  // brilho de neon por baixo do carro
  g.shadowColor = color
  g.shadowBlur = 12
  g.fillStyle = hexA(color, 0.6)
  g.beginPath()
  g.ellipse(48, 25, 30, 3.2, 0, 0, TAU)
  g.fill()
  // facho do farol à frente
  g.shadowBlur = 0
  const beam = g.createLinearGradient(80, 0, CAR_W, 0)
  beam.addColorStop(0, 'rgba(255,250,225,0.5)')
  beam.addColorStop(1, 'rgba(255,250,225,0)')
  g.fillStyle = beam
  g.beginPath()
  g.moveTo(80, 16)
  g.lineTo(CAR_W, 12)
  g.lineTo(CAR_W, 22)
  g.lineTo(80, 18)
  g.fill()
  // carroceria: cápsula escura com teto inclinado
  g.fillStyle = '#0a0e18'
  g.beginPath()
  g.moveTo(16, 23)
  g.lineTo(14, 15)
  g.lineTo(30, 12)
  g.lineTo(37, 6)
  g.lineTo(60, 6)
  g.lineTo(70, 12)
  g.lineTo(82, 14)
  g.lineTo(84, 19)
  g.lineTo(78, 23)
  g.closePath()
  g.fill()
  g.strokeStyle = '#3c4a66'
  g.lineWidth = 1
  g.beginPath()
  g.moveTo(14, 15)
  g.lineTo(30, 12)
  g.lineTo(37, 6)
  g.lineTo(60, 6)
  g.lineTo(70, 12)
  g.lineTo(82, 14)
  g.stroke()
  // janelas na cor do carro
  g.shadowColor = color
  g.shadowBlur = 6
  g.fillStyle = color
  g.beginPath()
  g.moveTo(39, 8)
  g.lineTo(58, 8)
  g.lineTo(65, 12)
  g.lineTo(37, 12)
  g.fill()
  // farol e lanterna
  g.shadowColor = '#ffffff'
  g.shadowBlur = 8
  g.fillStyle = '#fffbe8'
  g.fillRect(79, 15, 5, 3)
  g.shadowColor = '#ff2a3c'
  g.fillStyle = '#ff3b4c'
  g.fillRect(13, 15, 4, 3)
  return c
}

const trailSprite = (color: string, dir: 1 | -1) => {
  const { c, g } = surface(TRAIL_W, TRAIL_H, dir)
  const body = g.createLinearGradient(0, 0, TRAIL_W, 0)
  body.addColorStop(0, hexA(color, 0))
  body.addColorStop(0.65, hexA(color, 0.4))
  body.addColorStop(1, hexA(color, 1))
  g.shadowColor = color
  g.shadowBlur = 9
  g.fillStyle = body
  g.fillRect(2, 7, TRAIL_W - 4, 4)
  const core = g.createLinearGradient(TRAIL_W * 0.35, 0, TRAIL_W, 0)
  core.addColorStop(0, 'rgba(255,255,255,0)')
  core.addColorStop(1, 'rgba(255,255,255,0.9)')
  g.shadowBlur = 0
  g.fillStyle = core
  g.fillRect(TRAIL_W * 0.35, 8.5, TRAIL_W * 0.65 - 3, 1)
  return c
}

const dotSprite = (color: string) => {
  const { c, g } = surface(DOT, DOT)
  const r = DOT / 2
  const grd = g.createRadialGradient(r, r, 0, r, r, r)
  grd.addColorStop(0, 'rgba(255,255,255,1)')
  grd.addColorStop(0.25, hexA(color, 0.9))
  grd.addColorStop(1, hexA(color, 0))
  g.fillStyle = grd
  g.fillRect(0, 0, DOT, DOT)
  return c
}

interface Sprites {
  car: HTMLCanvasElement[][] // [sentido][cor]
  trail: HTMLCanvasElement[][]
  dot: HTMLCanvasElement[]
  spark: HTMLCanvasElement
}
let SPR: Sprites | null = null
const sprites = () =>
  (SPR ??= {
    car: [1, -1].map((d) => NEON.map((c) => carSprite(c, d as 1 | -1))),
    trail: [1, -1].map((d) => NEON.map((c) => trailSprite(c, d as 1 | -1))),
    dot: NEON.map(dotSprite),
    spark: dotSprite('#ffd36a'),
  })

// ---- componente ----------------------------------------------------------
export default function Rain() {
  const ref = useRef<HTMLCanvasElement>(null)
  const ctx = useRef<CanvasRenderingContext2D | null>(null)
  // medidas em px refeitas ao redimensionar
  const geo = useRef({ k: 1, area: 1, tu: 1, w: 1, h: 1, clip0: 0, clip1: 0 })
  // estado mínimo: energia da roleta (mesma suavização de createWheelEnergy,
  // sem criar objeto por quadro), tráfego acelerado e a vitória em curso
  const run = useRef({
    spin: 0,
    win: 0,
    boost: 0,
    phase: 'idle' as string,
    winAt: -1e9,
    winTrail: [] as HTMLCanvasElement[],
    winDot: null as HTMLCanvasElement | null,
  })

  const size = useCanvasFit(ref, { scale: 1, maxDpr: 1 }, (w, h) => {
    const k = h / 1080
    const tu = TOWER_U(w, h)
    const ground = (y: number) => h - (1000 - y) * tu
    geo.current = {
      k,
      area: Math.min(Math.max((w * h) / (1920 * 1080), 0.3), AREA_MAX),
      tu,
      w,
      h,
      clip0: 400 * tu,
      clip1: w - 400 * tu,
    }
    // superfícies onde a chuva do meio respinga: beirais das torres e o
    // trilho (que cruza a tela toda)
    const ledges: number[][] = []
    for (const t of TOWERS) {
      const right = t.frame === 'tr'
      const span = (a: number, b: number) =>
        right ? [w - b * tu, w - a * tu] : [a * tu, b * tu]
      for (const y of towerLedges(t)) ledges.push([ground(y), ...span(0, 200)])
      ledges.push([ground(t.ledge), ...span(0, 206)])
    }
    const track = ground(TRACK_Y)
    DROPS.forEach((D, li) => {
      const L = LAYERS[li]
      const reach = -L.slant * h
      for (let i = 0; i < D.n; i++) {
        const x = D.fx[i] * (w + reach)
        D.x[i] = x
        D.v[i] = L.speed * k * D.sp[i]
        D.len[i] = Math.max(3, L.len * k * D.ln[i])
        const mid = (x + L.slant * h * 0.5) / w
        D.bucket[i] = mid < 0.22 ? 0 : mid > 0.78 ? 2 : 1
        if (li === 0) {
          D.floor[i] = h + D.len[i]
          D.kind[i] = 0
        } else if (li === 2) {
          D.floor[i] = h - 3 * k
          D.kind[i] = 1
        } else {
          let floor = track
          for (const [ly, a, b] of ledges) {
            const lx = x + L.slant * ly
            if (ly < floor && lx >= a && lx <= b) floor = ly
          }
          D.floor[i] = floor
          D.kind[i] = 2
        }
      }
    })
    window.dispatchEvent(new Event('scene:redraw'))
  })

  useSceneLoop(
    (t, dt) => {
      const canvas = ref.current
      if (!canvas) return
      const g = (ctx.current ??= canvas.getContext('2d'))
      if (!g) return
      const { w, h } = size.current
      if (!w || !h) return
      const { k, area, tu, clip0, clip1 } = geo.current
      const S = sprites()
      const R = run.current
      const ts = t / 1000

      // energia: sobe em ~0,5 s ao girar, desce em ~1,5 s; vitória decai
      const phase = wheelPhase()
      const sec = Math.min(Math.max(dt, 0), 250) / 1000
      const target = phase === 'spinning' ? 1 : 0
      R.spin +=
        (target - R.spin) * (1 - Math.exp(-sec * (target > R.spin ? 4 : 1.5)))
      R.win *= Math.exp(-sec / 1.3)
      // vitória: guarda o instante e prepara os sprites na cor sorteada
      if (phase === 'won' && R.phase !== 'won') {
        R.win = 1
        R.winAt = ts
        const css = document.documentElement.style
        const probe = surface(1, 1).g
        probe.fillStyle = '#ff2e88'
        probe.fillStyle =
          css.getPropertyValue('--win-color').trim() || '#ff2e88'
        const hex = String(probe.fillStyle)
        const color = /^#[0-9a-f]{6}$/i.test(hex) ? hex : '#ff2e88'
        R.winTrail = [trailSprite(color, 1), trailSprite(color, -1)]
        R.winDot = dotSprite(color)
      }
      R.phase = phase
      R.boost += (2.6 * R.spin * dt) / 1000

      g.clearRect(0, 0, w, h)

      // ---- chuva e respingos
      const amount = rainAt(cyclePhase(t))
      let ns = 0
      for (let li = 0; li < 3; li++) {
        const L = LAYERS[li]
        const D = DROPS[li]
        const n = Math.min(D.n, Math.round(L.max * area * amount))
        g.globalAlpha = L.alpha * (0.6 + 0.4 * amount)
        g.lineWidth = L.width * Math.max(k, 0.8)
        for (let b = 0; b < 3; b++) {
          g.beginPath()
          for (let i = 0; i < n; i++) {
            if (D.bucket[i] !== b) continue
            const fall = D.floor[i]
            const period = fall / D.v[i]
            const u = (ts / period + D.ph[i]) % 1
            const y = u * fall
            const x = D.x[i] + L.slant * y
            const len = D.len[i]
            g.moveTo(x - L.slant * len, y - len)
            g.lineTo(x, y)
            const age = u * period
            if (D.kind[i] && age < SPLASH && ns < SPL_MAX) {
              splX[ns] = D.x[i] + L.slant * fall
              splY[ns] = fall
              splA[ns] = age / SPLASH
              splK[ns] = D.kind[i]
              ns++
            }
          }
          g.strokeStyle = L.colors[b]
          g.stroke()
        }
      }
      if (ns) {
        g.strokeStyle = '#d8f4ff'
        g.lineWidth = Math.max(k, 0.8)
        for (let pass = 0; pass < 2; pass++) {
          g.globalAlpha = pass ? 0.22 : 0.5
          g.beginPath()
          for (let i = 0; i < ns; i++) {
            const a = splA[i]
            if (a < 0.45 !== !pass) continue
            const x = splX[i]
            const y = splY[i]
            const s = splK[i] === 1 ? k : k * 0.6
            const up = (1 - (2 * a - 1) ** 2) * 7 * s
            const out = (2 + a * 8) * s
            g.moveTo(x - out * 0.35, y)
            g.lineTo(x - out, y - up)
            g.moveTo(x + out * 0.35, y)
            g.lineTo(x + out, y - up)
            if (splK[i] === 1) {
              const rx = (2 + a * 15) * s
              g.moveTo(x + rx, y)
              g.ellipse(x, y, rx, rx * 0.22, 0, 0, TAU)
            }
          }
          g.stroke()
        }
      }
      g.globalAlpha = 1

      // ---- carros voadores
      const tau = ts + R.boost
      const stretch = 1 + 1.5 * R.spin
      const win = R.win
      for (let li = 0; li < LANES.length; li++) {
        const lane = LANES[li]
        const s = lane.s * Math.max(k, 0.55)
        const trail = 190 * s * stretch
        const M = trail + CAR_W * s
        const span = w + 2 * M
        const d = lane.dir > 0 ? 0 : 1
        if (lane.clip) {
          g.save()
          g.beginPath()
          g.rect(clip0, 0, clip1 - clip0, h)
          g.clip()
        }
        const cars = CARS[li]
        for (let ci = 0; ci < cars.length; ci++) {
          const car = cars[ci]
          let x = ((car.off + tau / lane.cross) % 1) * span - M
          if (d) x = w - x
          const y = lane.y * h + (x - w / 2) * lane.tilt
          const tx = d ? x : x - trail
          const th = TRAIL_H * s
          g.drawImage(S.trail[d][car.color], tx, y - th / 2, trail, th)
          if (win > 0.02 && R.winTrail.length) {
            g.globalAlpha = Math.min(1, win * 1.2)
            g.drawImage(R.winTrail[d], tx, y - th / 2, trail, th * 1.3)
            g.globalAlpha = 1
          }
          if (lane.s >= 0.6) {
            const cw = CAR_W * s
            const ch = CAR_H * s
            g.drawImage(S.car[d][car.color], x - cw / 2, y - ch * 0.55, cw, ch)
          } else {
            const r = DOT * s * 0.5
            g.drawImage(S.dot[car.color], x - r, y - r, r * 2, r * 2)
          }
        }
        if (lane.clip) g.restore()
      }

      // ---- perseguição: um carro foge na frente da viatura-drone (mesmo
      // relógio do CSS: cy-police, 64 s, atraso -40 s, cruza em 20%)
      const chase = (((ts + 40) % 64) + 64) % 64
      if (chase < 12.8) {
        const p = chase / 12.8
        const s = 0.78 * Math.max(k, 0.55)
        const x =
          w * (-0.12 + 1.24 * p) + w * 0.085 + Math.sin(chase * 2.3) * 14 * s
        const y = h * 0.052 + Math.sin(chase * 3.1) * 6 * s
        const trail = 300 * s
        const th = TRAIL_H * s * 1.2
        g.drawImage(S.trail[0][2], x - trail, y - th / 2, trail, th)
        const cw = CAR_W * s
        const ch = CAR_H * s
        g.drawImage(S.car[0][2], x - cw / 2, y - ch * 0.55, cw, ch)
      }

      // ---- curto no letreiro da torre da direita: duas rajadas de faíscas
      const local = ts - SHORT_DELAY
      const cyc = ((local % SHORT_PERIOD) + SHORT_PERIOD) % SHORT_PERIOD
      const a0 = cyc - SHORT_AT * SHORT_PERIOD
      if (a0 >= 0 && a0 < 2.4) {
        const ox = w - SHORT_BOX.x * tu
        const oy = h - (1000 - SHORT_BOX.y) * tu
        const gk = Math.max(k, 0.6)
        g.strokeStyle = '#fff1b0'
        g.lineWidth = 1.4 * gk
        for (let b = 0; b < 2; b++) {
          const a = a0 - b * 0.62
          if (a < 0) continue
          if (a < 0.14) {
            g.globalAlpha = 1 - a / 0.14
            const r = 26 * gk
            g.drawImage(S.spark, ox - r, oy - r, r * 2, r * 2)
          }
          g.globalAlpha = 1
          g.beginPath()
          for (let i = b; i < SPARK_N; i += b + 1) {
            if (a > SPARK.life[i]) continue
            const p = Math.max(0, a - 0.045)
            const vx = SPARK.vx[i] * gk
            const vy = SPARK.vy[i] * gk
            const G = 1150 * gk
            g.moveTo(ox + vx * p, oy + vy * p + 0.5 * G * p * p)
            g.lineTo(ox + vx * a, oy + vy * a + 0.5 * G * a * a)
          }
          g.stroke()
        }
      }

      // ---- vitória: os telões do topo soltam faíscas na cor sorteada
      const wa = ts - R.winAt
      if (R.winDot && wa >= 0 && wa < 4.6) {
        const kf = Math.max(w / 2400, h / 1000)
        const gk = Math.max(k, 0.6)
        for (let i = 0; i < CONF_N; i++) {
          const a = wa - CONF.delay[i]
          if (a < 0 || a > CONF.life[i]) continue
          const src = i % 2 ? 1350 : 1050
          const sx = w / 2 + (src - 1200) * kf
          const sy = h - (1000 - 52) * kf
          const x = sx + CONF.vx[i] * gk * a
          const y = sy + (CONF.vy[i] * a + 0.5 * 260 * a * a) * gk
          g.globalAlpha = 1 - a / CONF.life[i]
          const r = 9 * gk
          g.drawImage(R.winDot, x - r, y - r, r * 2, r * 2)
        }
        g.globalAlpha = 1
      }
    },
    { fps: 30, still: 26000 },
  )

  return <canvas ref={ref} className="cy-rain" aria-hidden="true" />
}
