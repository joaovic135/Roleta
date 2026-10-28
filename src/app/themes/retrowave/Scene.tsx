'use client'

import { useEffect, useRef, useState } from 'react'
import type { RefObject } from 'react'
import ShaderCanvas from '../_kit/ShaderCanvas'
import { createWheelEnergy, useWheelPhase } from '../_kit/wheel'
import { FRAG } from './shader'

// Cena de fundo do tema Retrowave (só aparece com data-theme="retrowave").
// Estrada Outrun ao vivo: um fragment shader (shader.ts) desenha o mundo 3D
// — céu, sol listrado, estrelas, cordilheiras em wireframe, cidade, grade
// neon em perspectiva, duas estradas, postes de luz e o tráfego — e
// camadas nítidas em CSS/SVG por cima: palmeiras e a placa do motel
// passando nas margens (escala a partir do ponto de fuga, com a mesma
// projeção do shader), o nosso carro esportivo visto de trás no canto
// inferior direito, jato com rastro e dirigível no cabeçalho, nuvens em
// faixas e a fita VHS (OSD, data, tracking, interferência).
//
// Ciclo de 240 s (u_cyc no shader, --rw-cycle no CSS, mesma origem):
//   0–30%    pôr do sol: o sol listrado afunda devagar na grade
//   27–33%   crepúsculo: os postes acendem em cascata, estrelas surgem,
//            a cidade acende as janelas
//   42–70%   noite: lua subindo na margem esquerda, estrelas cadentes
//            (a cada 8 s e 12 s), dirigível com letreiro (45–62%),
//            chuva de meteoros (≈ 50–58%) e relâmpagos nas montanhas
//            distantes (≈ 52–64%)
//   70–90%   alvorada neon: céu turquesa, sol branco-ciano nascendo,
//            postes apagando (86–91%)
//   90–100%  o sol esquenta de novo para o pôr do sol
// Laços curtos: grade, faixas e postes correndo, carros na contramão
// (≈ 4 s), palmeiras (uma a cada ≈ 4 s por lado), suspensão do carro,
// cintilação, neon da placa falhando.
// Eventos: carro nos ultrapassando (≈ 30 s), placa do motel (47,6 s),
// troca de faixa (50 s), jato cruzando o céu (70 s), barras de VHS
// (17/23/31 s), tracking (41 s).
// Roleta: girando = turbo (grade 3x, palmeiras aceleram, linhas de
// velocidade, flare no sol, escapamento soltando fogo, OSD "FF ▶▶");
// vencedor = onda neon na cor da fatia saindo do horizonte (uma vez), luz
// de freio do carro e um brilho calmo na cor vencedora até o modal fechar.
//
// Sorteios com semente fixa (iguais no servidor e no navegador) e formas
// iguais agrupadas num <path> por cor.

const seeded = (seed: number) => () => {
  seed = (seed + 0x6d2b79f5) | 0
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}
const n = (v: number) => +v.toFixed(1)

// ---------- Relógio do mundo ----------
const CYCLE = 240
// fração do ciclo na montagem: pôr do sol com o sol ainda alto
const START = 0.04
// instante do quadro parado (prefers-reduced-motion), em segundos
const STILL = 10
// velocidade de cruzeiro e o extra do turbo (unidades do mundo por s)
const SPEED = 2.2
const TURBO = 4.6
// relâmpagos distantes: [segundo do ciclo, x em fração da largura]
const BOLTS = [
  [126, 0.95],
  [129.4, 0.93],
  [139.5, 0.04],
  [149, 0.97],
  [152.6, 0.91],
]

type Uniforms = Record<string, number | number[]>

const makeWorld = () => {
  const drift = [0, 0]
  const carL = [62, 44, 27, 10]
  const carR = [2.2, 38]
  const wcol = [1, 0.18, 0.53]
  const bolt = [0.9, 0, 0]
  const out: Uniforms = {
    u_t: 0,
    u_cyc: START,
    u_scroll: 0,
    u_drift: drift,
    u_carL: carL,
    u_carR: carR,
    u_wcol: wcol,
    u_after: 0,
    u_bolt: bolt,
  }
  const energy = createWheelEnergy()
  let prev = -1
  let dist = 0
  let after = 0
  const world = {
    won: 0,
    wcol,
    // chamado a cada quadro pelo ShaderCanvas (t em s); sem alocar nada
    frame(s: number): Uniforms {
      let dt = prev < 0 ? 0 : s - prev
      prev = s
      if (dt < 0 || dt > 0.25) dt = 0
      const { spin } = energy(dt * 1000)
      const v = SPEED + TURBO * spin
      dist = (dist + v * dt) % 9.6
      for (let i = 0; i < 4; i++) {
        carL[i] -= (v + 3.2) * dt
        if (carL[i] < 1.2) carL[i] += 72
      }
      for (let i = 0; i < 2; i++) {
        carR[i] += (3.2 + i * 0.4 - v) * dt
        if (carR[i] > 72) carR[i] = 1.3
        else if (carR[i] < 1.2) carR[i] = 71
      }
      after += (world.won - after) * (1 - Math.exp(-dt / 1.4))
      const cs = (((s + START * CYCLE) % CYCLE) + CYCLE) % CYCLE
      let b = 0
      for (let i = 0; i < BOLTS.length; i++) {
        const k = cs - BOLTS[i][0]
        if (k < 0 || k > 0.8) continue
        const e =
          Math.exp(-k * 9) + (k > 0.16 ? 0.7 * Math.exp(-(k - 0.16) * 11) : 0)
        if (e > b) {
          b = e
          bolt[0] = BOLTS[i][1]
          bolt[2] = i * 1.7
        }
      }
      bolt[1] = Math.min(b, 1)
      const w = (s / 96) * Math.PI * 2
      drift[0] = 0.035 * Math.sin(w)
      drift[1] = 0.09 * Math.sin(w + 0.4)
      out.u_t = ((s % CYCLE) + CYCLE) % CYCLE
      out.u_cyc = cs / CYCLE
      out.u_scroll = dist
      out.u_after = after
      return out
    },
  }
  return world
}
type World = ReturnType<typeof makeWorld>

// cor CSS (#rgb, #rrggbb ou rgb()) para 0..1
const parseColor = (v: string): number[] | null => {
  const s = v.trim()
  const hex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(s)
  if (hex) {
    let h = hex[1]
    if (h.length === 3) h = h.replace(/./g, '$&$&')
    const x = parseInt(h, 16)
    return [((x >> 16) & 255) / 255, ((x >> 8) & 255) / 255, (x & 255) / 255]
  }
  const rgb = /^rgba?\(([^)]+)\)/i.exec(s)
  if (rgb) {
    const [r, g, b] = rgb[1].split(/[\s,/]+/).map(Number)
    if ([r, g, b].every(Number.isFinite)) return [r / 255, g / 255, b / 255]
  }
  return null
}

// liga a cena à roleta: cor do vencedor (lida uma vez por mudança de fase)
// e o turbo das camadas em CSS (playbackRate, sem saltar a animação)
function WheelLink({
  world,
  road,
}: {
  world: World
  road: RefObject<HTMLDivElement | null>
}) {
  const phase = useWheelPhase()
  const last = useRef(phase)
  useEffect(() => {
    world.won = phase === 'won' ? 1 : 0
    if (phase === 'won') {
      const c = parseColor(
        getComputedStyle(document.documentElement).getPropertyValue(
          '--win-color',
        ),
      )
      if (c) for (let i = 0; i < 3; i++) world.wcol[i] = c[i]
    }
    const from = last.current
    last.current = phase
    const root = road.current
    if (!root || (phase !== 'spinning' && from !== 'spinning')) return
    const up = phase === 'spinning'
    const steps = up ? [1.5, 2.1, 2.7] : [2.1, 1.5, 1]
    const timers = steps.map((rate, i) =>
      window.setTimeout(
        () => {
          root
            .querySelectorAll('.rw-pass')
            .forEach((el) =>
              el.getAnimations().forEach((a) => a.updatePlaybackRate(rate)),
            )
        },
        i * (up ? 160 : 500),
      ),
    )
    return () => timers.forEach((t) => window.clearTimeout(t))
  }, [phase, world, road])
  return null
}

// ---------- Nuvens em faixas ----------
const capsule = (x: number, y: number, w: number, h: number) =>
  `M${n(x + h / 2)} ${n(y)}h${n(w - h)}a${n(h / 2)} ${n(h / 2)} 0 0 1 0 ${n(h)}h${n(h - w)}a${n(h / 2)} ${n(h / 2)} 0 0 1 0 ${n(-h)}z`
const clouds = (seed: number, count: number, scale: number, top: number) => {
  const rand = seeded(seed)
  const W = 2000
  let d = ''
  for (let i = 0; i < count; i++) {
    const cx = (i + rand() * 0.6) * (W / count)
    const cy = top + rand() * 150
    const cw = (180 + rand() * 260) * scale
    const bars = 3 + Math.floor(rand() * 3)
    for (let b = 0; b < bars; b++) {
      const w = cw * (1 - b * 0.2) * (0.85 + rand() * 0.25)
      const h = (7 - b * 0.8) * scale
      const x = cx - w / 2 + (rand() - 0.5) * 40 * scale
      const y = cy - b * h * 1.55
      for (const off of [0, W]) d += capsule(x + off, y, w, h)
    }
  }
  return d
}
const CLOUDS_FAR = clouds(31, 6, 0.8, 40)
const CLOUDS_NEAR = clouds(57, 4, 1.25, 30)

// ---------- Palmeiras (silhueta própria) ----------
const leaf = (
  cx: number,
  cy: number,
  deg: number,
  len: number,
  droop: number,
) => {
  const a = (deg * Math.PI) / 180
  const tip = [cx + Math.cos(a) * len, cy + Math.sin(a) * len + droop]
  const ctl = [
    cx + Math.cos(a) * len * 0.5,
    cy + Math.sin(a) * len * 0.5 - len * 0.22,
  ]
  const at = (t: number) => {
    const u = 1 - t
    return [
      u * u * cx + 2 * u * t * ctl[0] + t * t * tip[0],
      u * u * cy + 2 * u * t * ctl[1] + t * t * tip[1],
    ]
  }
  const top: string[] = []
  const bottom: string[] = []
  const steps = 14
  for (let i = 0; i <= steps; i++) {
    const t = i / steps
    const [x, y] = at(t)
    const [x2, y2] = at(Math.min(1, t + 0.01))
    const [x1, y1] = at(Math.max(0, t - 0.01))
    const dx = x2 - x1
    const dy = y2 - y1
    const l = Math.hypot(dx, dy) || 1
    const nx = -dy / l
    const ny = dx / l
    const w = Math.sin(Math.PI * Math.min(1, t * 1.05)) * len * 0.07 + 1
    top.push(`${n(x + nx * w * 0.5)} ${n(y + ny * w * 0.5)}`)
    // folíolos: dentes compridos apontando para trás, na borda de baixo
    const tooth = i % 2 ? 2.6 : 0.6
    const back = i % 2 ? 1.2 : 0
    bottom.push(
      `${n(x - nx * w * tooth - (dx / l) * w * back)} ${n(y - ny * w * tooth - (dy / l) * w * back)}`,
    )
  }
  return `M${top.join('L')}L${bottom.reverse().join('L')}Z`
}
const PALM_CX = 232
const PALM_CY = 172
const PALM_TRUNK = (() => {
  let d = 'M92 800Q112 420 226 176L240 170Q148 432 128 800Z'
  // anéis do tronco
  for (let i = 1; i < 16; i++) {
    const t = i / 16
    const u = 1 - t
    const x = u * u * 110 + 2 * u * t * 128 + t * t * 233
    const y = u * u * 800 + 2 * u * t * 426 + t * t * 173
    const w = 18 * u + 7 * t
    d += `M${n(x - w)} ${n(y)}l${n(w * 2)} -3l0 2.4l${n(-w * 2)} 3z`
  }
  return d
})()
const PALM_CROWN =
  [
    [-172, 170, 40],
    [-148, 190, 70],
    [-118, 150, 50],
    [-84, 140, 34],
    [-52, 170, 46],
    [-22, 196, 76],
    [8, 180, 96],
    [150, 150, 96],
    [196, 160, 90],
  ]
    .map(([deg, len, droop]) => leaf(PALM_CX, PALM_CY, deg, len, droop))
    .join('') +
  `M${PALM_CX - 12} ${PALM_CY + 4}a7 7 0 1 0 14 0a7 7 0 1 0 -14 0M${PALM_CX} ${PALM_CY + 8}a7 7 0 1 0 14 0a7 7 0 1 0 -14 0`

// palmeira na beira da estrada: o elemento externo faz a viagem (escala a
// partir do ponto de fuga), o interno espelha e varia o tamanho
const Palm = ({ side, i }: { side: 'l' | 'r'; i: number }) => (
  <div className={`rw-pass rw-palm rw-palm-${side} rw-palm-${side}${i}`}>
    <div className="rw-palm-in">
      <div className="rw-sway">
        <svg viewBox="0 0 400 800">
          <path className="rw-palm-trunk" d={PALM_TRUNK} />
        </svg>
        <svg className="rw-palm-crown" viewBox="0 0 400 800">
          <path className="rw-palm-leaf" d={PALM_CROWN} />
        </svg>
      </div>
    </div>
  </div>
)

// ---------- Nosso carro (esportivo genérico, sem marca, visto de trás) ----
// desenhado em -80..80 x -66..4, com o chão em y = 0
const CAR = {
  tires: 'M-67 -17h21v17h-21zM46 -17h21v17h-21z',
  under: 'M-72 -12L-70 -21L70 -21L72 -12Q72 -6 67 -6L-67 -6Q-72 -6 -72 -12z',
  body: 'M-72 -19L-75 -34L-63 -40L-41 -42L-30 -54L30 -54L41 -42L63 -40L75 -34L72 -19z',
  shade: 'M-72 -19L-73 -27L73 -27L72 -19z',
  hips: 'M-75 -34L-63 -40L-41 -42L-38 -39L-62 -37L-73 -32zM75 -34L63 -40L41 -42L38 -39L62 -37L73 -32z',
  glass: 'M-28 -52L28 -52L37 -42L-37 -42z',
  louver:
    'M-29.5 -50h59v1.5h-59zM-31.5 -47.5h63v1.5h-63zM-33.5 -45h67v1.5h-67z',
  roof: 'M-30 -54L30 -54L28.5 -52.4L-28.5 -52.4z',
  wing: 'M-71 -49h142v5h-142zM-52 -44h4v6h-4zM48 -44h4v6h-4z',
  chrome: 'M-71 -49h142v1.3h-142zM-74 -36h148v1.5h-148z',
  housing: 'M-69 -33.5h138v9h-138z',
  lamps: 'M-67 -32.5h38v7h-38zM29 -32.5h38v7h-38z',
  cores: 'M-65 -30.5h34v2.2h-34zM31 -30.5h34v2.2h-34z',
  reverse: 'M-26 -32h52v5.5h-52z',
  brake: 'M-13 -53.6h26v1.6h-26z',
  plate: 'M-14 -23h28v10h-28z',
  pipes:
    'M-34 -9a3.4 3.4 0 1 0 6.8 0a3.4 3.4 0 1 0 -6.8 0M27.2 -9a3.4 3.4 0 1 0 6.8 0a3.4 3.4 0 1 0 -6.8 0',
}

const HeroCar = () => (
  <div className="rw-hero">
    <div className="rw-hero-boost">
      <div className="rw-hero-bob">
        <i className="rw-hero-under" />
        <i className="rw-hero-pool" />
        <svg viewBox="-80 -66 160 70" aria-hidden="true">
          <defs>
            <linearGradient
              id="rw-car-paint"
              x1="0"
              y1="-54"
              x2="0"
              y2="-6"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0" stopColor="#ff5aa6" />
              <stop offset="0.45" stopColor="#c3175c" />
              <stop offset="1" stopColor="#5a0630" />
            </linearGradient>
            <linearGradient id="rw-car-chrome" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#e8fbff" />
              <stop offset="0.45" stopColor="#8fd8ff" />
              <stop offset="0.55" stopColor="#3a2a7e" />
              <stop offset="1" stopColor="#ff8ad8" />
            </linearGradient>
          </defs>
          <path className="rw-car-tire" d={CAR.tires} />
          <path className="rw-car-under" d={CAR.under} />
          <path fill="url(#rw-car-paint)" d={CAR.body} />
          <path className="rw-car-shade" d={CAR.shade} />
          <path className="rw-car-hips" d={CAR.hips} />
          <path className="rw-car-glass" d={CAR.glass} />
          <path fill="url(#rw-car-paint)" d={CAR.louver} />
          <path className="rw-car-roof" d={CAR.roof} />
          <path className="rw-car-wing" d={CAR.wing} />
          <path fill="url(#rw-car-chrome)" d={CAR.chrome} />
          <path className="rw-car-housing" d={CAR.housing} />
          <path className="rw-car-lamp" d={CAR.lamps} />
          <path className="rw-car-core" d={CAR.cores} />
          <path className="rw-car-reverse" d={CAR.reverse} />
          <path className="rw-car-lamp" d={CAR.brake} />
          <path className="rw-car-plate" d={CAR.plate} />
          <text className="rw-car-tag" x="0" y="-15.4" textAnchor="middle">
            RLT·86
          </text>
          <path className="rw-car-pipe" d={CAR.pipes} />
        </svg>
        <i className="rw-hero-tail" />
        <i className="rw-hero-brake" />
        <i className="rw-hero-fire rw-hero-fire-l" />
        <i className="rw-hero-fire rw-hero-fire-r" />
      </div>
    </div>
  </div>
)

// ---------- Jato cruzando o céu (silhueta genérica) ----------
const JET =
  'M2 9Q0 9 1 7.6L6 6.6L44 5.4Q52 5.2 56 7Q58 8.4 54 9.2L8 10Q4 10.2 2 9Z' +
  'M24 7L36 0.6L40 0.6L33 7.4ZM26 9L37 15.6L41 15.6L33 9.4Z' +
  'M47 5.6L53.5 0L56.5 0L54 6.4Z'

// letreiro do dirigível (duas cópias: o laço anda exatamente uma)
const TICKER = '★ BEM-VINDO A NEON CITY ★ RÁDIO 86,6 FM ★ DIRIJA COM ESTILO '
// dirigível: corpo, borda iluminada por baixo, lemes e a gôndola
const BLIMP = {
  body: 'M18 30C18 12 70 4 120 4C176 4 214 16 222 30C214 44 176 56 120 56C70 56 18 48 18 30Z',
  rim: 'M30 40C60 52 92 55 120 55C160 55 196 47 214 38C200 50 166 58 120 58C82 58 50 52 30 40Z',
  fins: 'M30 22L4 6L12 26ZM30 38L4 54L12 34ZM6 28L26 30L6 32ZM104 55h32v7q0 4 -4 4h-24q-4 0 -4 -4Z',
}

// linhas de velocidade irradiando do ponto de fuga (só no turbo)
const SPEED_LINES = (() => {
  const rand = seeded(86)
  let d = ''
  for (let i = 0; i < 44; i++) {
    const a = (i / 44) * Math.PI * 2 + (rand() - 0.5) * 0.1
    const r0 = 560 + rand() * 260
    const r1 = r0 + 260 + rand() * 420
    const w = 0.006 + rand() * 0.008
    const p = (r: number, s: number) =>
      `${n(1000 + Math.cos(a + s) * r)} ${n(1000 + Math.sin(a + s) * r * 0.62)}`
    d += `M${p(r0, 0)}L${p(r1, -w)}L${p(r1, w)}Z`
  }
  return d
})()

export default function RetrowaveScene() {
  const [world] = useState(makeWorld)
  const road = useRef<HTMLDivElement>(null)
  return (
    <>
      <WheelLink world={world} road={road} />

      {/* o mundo 3D: shader em tela cheia (opaco) */}
      <ShaderCanvas
        className="rw-gl"
        frag={FRAG}
        scale={0.5}
        fps={30}
        still={STILL}
        uniforms={world.frame}
      />
      {/* reserva sem WebGL: pôr do sol parado em CSS */}
      <div className="rw-fb">
        <i className="rw-fb-sun" />
        <div className="rw-fb-floor">
          <i className="rw-fb-grid" />
        </div>
      </div>

      <div className="rw-clouds rw-clouds-far rw-cyc">
        <svg viewBox="0 0 4000 300" preserveAspectRatio="none">
          <path d={CLOUDS_FAR} />
        </svg>
      </div>
      <div className="rw-clouds rw-clouds-near rw-cyc">
        <svg viewBox="0 0 4000 300" preserveAspectRatio="none">
          <path d={CLOUDS_NEAR} />
        </svg>
      </div>

      {/* surpresa da noite: dirigível com letreiro de LED (1 vez por ciclo) */}
      <div className="rw-blimp rw-cyc">
        <svg viewBox="0 0 240 70">
          <path className="rw-blimp-body" d={BLIMP.body} />
          <path className="rw-blimp-rim" d={BLIMP.rim} />
          <path className="rw-blimp-body" d={BLIMP.fins} />
        </svg>
        <div className="rw-blimp-screen">
          <span>{TICKER + TICKER}</span>
        </div>
        <i className="rw-blimp-nav" />
      </div>

      <i className="rw-trail" />
      <div className="rw-jet">
        <svg viewBox="0 0 58 16">
          <path d={JET} />
        </svg>
        <i className="rw-jet-nav" />
      </div>

      {/* beira da estrada: placa do motel, palmeiras e o nosso carro */}
      <div className="rw-road" ref={road}>
        <div className="rw-pass rw-sign">
          <div className="rw-sign-box">
            <i className="rw-sign-star">★</i>
            <b>M</b>
            <b>O</b>
            <b>T</b>
            <b className="rw-sign-e">E</b>
            <b>L</b>
            <span className="rw-sign-name">MIRAGEM</span>
            <span className="rw-sign-vagas">VAGAS</span>
          </div>
          <i className="rw-sign-arrow">➜</i>
          <i className="rw-sign-pole" />
        </div>
        {[0, 1, 2].map((i) => (
          <Palm key={`l${i}`} side="l" i={i} />
        ))}
        {[0, 1, 2].map((i) => (
          <Palm key={`r${i}`} side="r" i={i} />
        ))}
        <HeroCar />
      </div>

      <div className="rw-speed">
        <svg
          className="rw-speed-art"
          viewBox="0 0 2000 2000"
          preserveAspectRatio="xMidYMid slice"
        >
          <path d={SPEED_LINES} />
        </svg>
        <svg
          className="rw-speed-art rw-speed-b"
          viewBox="0 0 2000 2000"
          preserveAspectRatio="xMidYMid slice"
        >
          <path d={SPEED_LINES} />
        </svg>
      </div>

      {/* fita VHS: barras de interferência, tracking e o OSD */}
      <div className="rw-glitch rw-glitch-1" />
      <div className="rw-glitch rw-glitch-2" />
      <div className="rw-glitch rw-glitch-3" />
      <div className="rw-tracking" />
      <div className="rw-scan" />
      <div className="rw-osd">
        <span className="rw-osd-track">TRACKING</span>
        <span className="rw-osd-state">
          <b className="rw-osd-play">PLAY ▶</b>
          <b className="rw-osd-ff">FF ▶▶</b>
          <b className="rw-osd-pause">PAUSE ❚❚</b>
        </span>
      </div>
      <div className="rw-date">
        <span>SÁB 27 OUT 1986</span>
        <span>SP 23:47</span>
      </div>
    </>
  )
}
