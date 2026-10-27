'use client'

import { useRef } from 'react'
import { useCanvasFit } from '../_kit/canvas'
import { useSceneLoop } from '../_kit/loop'
import { createWheelEnergy, wheelPhase } from '../_kit/wheel'
import { seeded } from './lib'

// Único canvas da cena: chuva em duas profundidades (riscos em lote, tons
// de lilás que puxam para o rosa à esquerda e o ciano à direita, como a luz
// dos letreiros), respingos e anéis nas poças do chão molhado.
//
// A intensidade segue o ciclo do clima (mesmo relógio e ponto de partida
// das animações CSS: --nn-cycle e --nn-at no theme.css). A posição das
// gotas vem de um relógio próprio que corre mais rápido com a roleta
// girando; tudo é função desse relógio (sem estado por gota), então
// qualquer instante pode ser desenhado direto. Com a roleta parada no
// vencedor, os respingos ganham a cor da fatia.

export const CYCLE = 180_000 // ms (= --nn-cycle)
export const AT = 0.06 // fração do ciclo em que a página abre (= --nn-at)

// intensidade da chuva (0…1) na fração f do ciclo
const KEYS: [number, number][] = [
  [0, 0.32],
  [0.28, 0.36],
  [0.36, 0.78],
  [0.4, 1],
  [0.6, 1],
  [0.66, 0.25],
  [0.69, 0],
  [0.94, 0],
  [0.97, 0.3],
  [1, 0.32],
]
export const rainAt = (f: number) => {
  for (let i = 1; i < KEYS.length; i++) {
    const [f1, v1] = KEYS[i]
    if (f <= f1) {
      const [f0, v0] = KEYS[i - 1]
      return v0 + ((v1 - v0) * (f - f0)) / (f1 - f0)
    }
  }
  return KEYS[0][1]
}

type Layer = {
  max: number // gotas em 1920×1080 com chuva forte
  speed: number // px/s em 1080 de altura
  len: number
  width: number
  alpha: number
}
const LAYERS: Layer[] = [
  { max: 360, speed: 760, len: 12, width: 1, alpha: 0.3 },
  { max: 150, speed: 1300, len: 30, width: 1.4, alpha: 0.45 },
]
const SLANT = 0.14 // vento da esquerda
const TINTS = ['#ffa6e4', '#d9c8ff', '#a6f6ff'] // esquerda, meio, direita

const DROPS = LAYERS.map((L, li) => {
  const r = seeded(900 + li * 17)
  const count = Math.ceil(L.max * 1.6)
  const x = new Float32Array(count)
  const p = new Float32Array(count)
  const v = new Float32Array(count)
  for (let i = 0; i < count; i++) {
    x[i] = r()
    p[i] = r()
    v[i] = 0.8 + r() * 0.4
  }
  return { x, p, v, count }
})

// respingos e anéis: pontos fixos no chão (fração da largura, fundo da
// tela), cada um com período e fase próprios
const SPLASHES = (() => {
  const r = seeded(4242)
  const count = 90
  const x = new Float32Array(count)
  const y = new Float32Array(count)
  const per = new Float32Array(count)
  const ph = new Float32Array(count)
  for (let i = 0; i < count; i++) {
    x[i] = r()
    // chão: a faixa de baixo (perto) até a calçada das laterais
    y[i] = 0.905 + Math.pow(r(), 0.7) * 0.09
    per[i] = 0.7 + r() * 1.4
    ph[i] = r()
  }
  return { x, y, per, ph, count }
})()
const SPLASH_LIFE = 0.42 // s

export default function Rain() {
  const ref = useRef<HTMLCanvasElement>(null)
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null)
  const state = useRef({
    clock: 0,
    energy: createWheelEnergy(),
    win: '#ff2bd6',
    phase: 'idle' as string,
    grads: [] as CanvasGradient[],
  })

  const size = useCanvasFit(ref, { scale: 0.5 }, (w) => {
    const ctx = ref.current?.getContext('2d') ?? null
    ctxRef.current = ctx
    if (!ctx) return
    // tom das gotas varia da esquerda (rosa) para a direita (ciano)
    state.current.grads = LAYERS.map(() => {
      const g = ctx.createLinearGradient(0, 0, w, 0)
      g.addColorStop(0, TINTS[0])
      g.addColorStop(0.5, TINTS[1])
      g.addColorStop(1, TINTS[2])
      return g
    })
  })

  useSceneLoop(
    (t, dt) => {
      const ctx = ctxRef.current ?? ref.current?.getContext('2d') ?? null
      ctxRef.current = ctx
      const { w, h } = size.current
      if (!ctx || !w || !h) return
      const s = state.current
      const e = s.energy(dt)
      const phase = wheelPhase()
      if (phase !== s.phase) {
        s.phase = phase
        if (phase === 'won')
          s.win =
            getComputedStyle(document.documentElement)
              .getPropertyValue('--win-color')
              .trim() || '#ff2bd6'
      }
      // o relógio das gotas acelera até 1,8× com a roleta girando
      s.clock += (dt / 1000) * (1 + e.spin * 0.8)
      const f = (((t / CYCLE + AT) % 1) + 1) % 1
      // girando, a chuva engrossa um pouco mesmo na garoa
      const amount = Math.min(1, rainAt(f) + e.spin * 0.35)

      ctx.clearRect(0, 0, w, h)
      if (amount <= 0.01) return
      if (!s.grads.length) return
      const k = h / 1080 // escala (canvas em meia resolução)
      const area = Math.min(2.2, (w * h) / (960 * 540))
      ctx.lineCap = 'round'

      for (let li = 0; li < LAYERS.length; li++) {
        const L = LAYERS[li]
        const D = DROPS[li]
        const count = Math.min(D.count, Math.round(L.max * area * amount))
        const len = L.len * k * (1 + e.spin * 0.6)
        const span = h + len
        ctx.strokeStyle = s.grads[li]
        ctx.globalAlpha = L.alpha * (0.75 + amount * 0.25)
        ctx.lineWidth = Math.max(0.6, L.width * k * 2)
        ctx.beginPath()
        for (let i = 0; i < count; i++) {
          const y =
            ((D.p[i] * span + s.clock * L.speed * k * D.v[i]) % span) - len
          const x = D.x[i] * (w + h * SLANT) - y * SLANT
          ctx.moveTo(x, y)
          ctx.lineTo(x - len * SLANT, y + len)
        }
        ctx.stroke()
      }

      // respingos (dois risquinhos que sobem) e anéis achatados nas poças
      const won = s.phase === 'won'
      ctx.globalAlpha = won ? 0.8 : 0.5
      ctx.strokeStyle = won ? s.win : '#e6dcff'
      ctx.lineWidth = Math.max(0.6, k * 1.6)
      const splashes = Math.round(SPLASHES.count * Math.min(1, amount * 1.2))
      ctx.beginPath()
      for (let i = 0; i < splashes; i++) {
        const per = SPLASHES.per[i]
        const age = (s.clock + SPLASHES.ph[i] * per) % per
        if (age > SPLASH_LIFE) continue
        const a = age / SPLASH_LIFE
        const x = SPLASHES.x[i] * w
        const y = SPLASHES.y[i] * h
        const r = (2 + a * 9) * k * 2
        // anel: elipse achatada (perspectiva do chão)
        ctx.moveTo(x + r, y)
        ctx.ellipse(x, y, r, r * 0.28, 0, 0, Math.PI * 2)
        if (a < 0.45) {
          const up = (1 - a * 2) * 7 * k * 2
          ctx.moveTo(x - 2 * k, y - 1 * k)
          ctx.lineTo(x - 5 * k, y - up)
          ctx.moveTo(x + 2 * k, y - 1 * k)
          ctx.lineTo(x + 5 * k, y - up)
        }
      }
      ctx.stroke()
      ctx.globalAlpha = 1
    },
    { fps: 30, still: 4000 },
  )

  return <canvas ref={ref} className="nn-rain" aria-hidden="true" />
}
