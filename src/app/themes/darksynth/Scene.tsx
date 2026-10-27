'use client'

import { useMemo, type CSSProperties } from 'react'
import ShaderCanvas from '../_kit/ShaderCanvas'
import { wheelPhase } from '../_kit/wheel'
import { FRAG } from './shader'

// Cena de fundo do tema Darksynth: "O VIGIA".
// Uma sonda em pane (SONDA K-13) voa rasante e rápido por um vale de
// montanhas serrilhadas, desenhadas como curvas de nível vermelhas
// incandescentes, dentro de uma tempestade eterna, rumo a uma pirâmide negra
// colossal. A ponta some nas nuvens, uma lua de sangue enorme fica atrás
// dela (só os "chifres" aparecem no alto) e, logo abaixo da ponta, arde um
// olho de fenda vertical que vigia a roleta.
//
// Camadas (de trás para a frente):
//   1. WebGL (shader.ts, ShaderCanvas a 30 fps e meia resolução): céu,
//      lua, nuvens com relâmpagos, raios, pirâmide (com milhares de janelas
//      acesas), relevo em voo, névoa, fachos do olho, varredura, brasas,
//      granulação. Reserva em CSS (.ds-fallback) se não houver WebGL.
//   2. CSS/SVG: brasas grandes e cinzas perto da câmera, drones de
//      patrulha, fragmento em chamas, o olho (pálpebras, íris, pupila, halo),
//      lasers, HUD da sonda (altímetro, distância ao alvo, sinal, radar,
//      mensagens), OSD de fita VHS, scanlines e falhas de tracking.
// O olho do CSS e o do shader ficam no mesmo ponto: centro em x (72% no
// celular, onde o título ocupa a esquerda) e top clamp(32px, 5.6vh, 64px).
//
// Linha do tempo (segundos desde a montagem; tudo em laços desencontrados):
//   segundos   brasas, cinzas, névoa, fachos do olho, contadores do HUD,
//              radar (4,8 s), luzes dos drones, scanlines rolando (9 s)
//   ~9 s       relâmpago nas nuvens das bordas (janelas de 2,7 s, ~35% de
//              chance; 60% descem do alto da tela como raio até o vale;
//              o primeiro cai aos 10,8 s)
//   ~12 s      pulso de energia sobe pelas juntas da pirâmide até o olho
//   13,7 s     falha de tracking da fita; rasgos de 7,3 e 11,9 s
//   17 s       o olho passeia o olhar (sacadas rápidas, pausas longas)
//   20,5 s     piscada (duas por ciclo de 41 s)
//   37 s       esquadrilha de 3 drones cruza o topo da tela
//   47 s       varredura: o olho dispara 5 lasers e uma onda de luz rola
//              pelo vale do horizonte até a câmera (HUD: "VARREDURA")
//   64 s       mensagens do HUD (4 × 16 s)
//   97 s       raro: um fragmento em chamas risca o cabeçalho (aos 26 s)
//   149 s/240  raro: "ELE TE VIU" (o olho cresce, a pupila dilata, a tela
//              fecha em vermelho)
//   183 s/210  raro: sinal perdido (a imagem cai, faixas de ruído)
// Roleta: girando, o voo acelera (u_travel), o olho se arregala, trava na
// roleta e dispara lasers pelas laterais, o HUD avisa "ALVO TRAVADO";
// vencedor: um raio cai na pirâmide (2 clarões suaves, tela ≤ 0,22), o
// olho solta um clarão na cor da fatia vencedora e fica num brilho calmo.

const seeded = (seed: number) => () => {
  seed = (seed + 0x6d2b79f5) | 0
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}
const n = (v: number) => +v.toFixed(1)

// ---------- Voo: fatias do relevo percorridas (vai para o shader) ----------

const RATE = 5.2 // fatias por segundo, parado
const RUSH = 13 // fatias por segundo a mais com a roleta girando
const PERIOD = 256 // o relevo se repete a cada 256 fatias (ver shader.ts)
// quadro do prefers-reduced-motion: um raio descendo pela margem esquerda
const STILL = 10.86

const createFlight = () => {
  let prev = -1
  let spin = 0
  let boost = 0
  const out = { u_travel: 0 }
  return (t: number) => {
    const dt = prev < 0 ? 0 : Math.min(Math.max(t - prev, 0), 0.25)
    prev = t
    const target = wheelPhase() === 'spinning' ? 1 : 0
    spin += (target - spin) * (1 - Math.exp(-dt * (target > spin ? 3 : 1.2)))
    boost = (boost + dt * RUSH * spin) % PERIOD
    // ritmo base com rajadas lentas (sempre para a frente)
    const base = RATE * t + (0.8 / 0.09) * Math.sin(t * 0.09)
    out.u_travel = (((base + boost) % PERIOD) + PERIOD) % PERIOD
    return out
  }
}

// ---------- O olho (caixa 200 × 100) ----------

const bez = (
  a: [number, number],
  c: [number, number],
  b: [number, number],
  steps: number,
) =>
  Array.from({ length: steps }, (_, i) => {
    const t = i / steps
    const u = 1 - t
    return [
      u * u * a[0] + 2 * u * t * c[0] + t * t * b[0],
      u * u * a[1] + 2 * u * t * c[1] + t * t * b[1],
    ]
  })
const ALMOND = 'M2 50Q100-16 198 50Q100 116 2 50Z'
const ALMOND_CLIP = `polygon(${[
  ...bez([2, 50], [100, -16], [198, 50], 14),
  ...bez([198, 50], [100, 116], [2, 50], 14),
]
  .map(([x, y]) => `${n(x / 2)}% ${n(y)}%`)
  .join(',')})`

// veias escuras saindo dos cantos
const VEINS = (() => {
  const rand = seeded(1313)
  let d = ''
  for (let i = 0; i < 10; i++) {
    const left = i % 2 === 0
    let x = left ? 6 + rand() * 14 : 194 - rand() * 14
    let y = 38 + rand() * 24
    d += `M${n(x)} ${n(y)}`
    for (let k = 0; k < 5; k++) {
      x += (left ? 1 : -1) * (6 + rand() * 7)
      y += (rand() - 0.5) * 9
      d += `L${n(x)} ${n(y)}`
    }
  }
  return d
})()

// estrias da íris (caixa 100 × 100)
const IRIS_RAYS = (() => {
  const rand = seeded(777)
  let d = ''
  for (let i = 0; i < 44; i++) {
    const a = (i / 44) * Math.PI * 2 + rand() * 0.08
    const r0 = 13 + rand() * 4
    const r1 = 44 - rand() * (i % 2 ? 12 : 4)
    d += `M${n(50 + Math.cos(a) * r0)} ${n(50 + Math.sin(a) * r0)}L${n(50 + Math.cos(a) * r1)} ${n(50 + Math.sin(a) * r1)}`
  }
  return d
})()

const Eye = () => (
  <div className="ds-eye">
    <div className="ds-eye-halo" />
    <div className="ds-eye-halo ds-eye-halo-hot" />
    <div className="ds-eye-stare">
      <div className="ds-eye-clip" style={{ clipPath: ALMOND_CLIP }}>
        <svg
          className="ds-eye-sclera"
          viewBox="0 0 200 100"
          preserveAspectRatio="none"
        >
          <defs>
            <radialGradient id="ds-sclera-g" cx="0.5" cy="0.5" r="0.62">
              <stop offset="0" stopColor="#ffc066" />
              <stop offset="0.3" stopColor="#ff4a12" />
              <stop offset="0.62" stopColor="#b50f08" />
              <stop offset="1" stopColor="#2a0202" />
            </radialGradient>
          </defs>
          <rect width="200" height="100" fill="url(#ds-sclera-g)" />
          <path className="ds-eye-veins" d={VEINS} />
        </svg>
        <div className="ds-eye-focus">
          <div className="ds-eye-look">
            <svg className="ds-eye-iris" viewBox="0 0 100 100">
              <defs>
                <radialGradient id="ds-iris-g">
                  <stop offset="0" stopColor="#fff2b0" />
                  <stop offset="0.3" stopColor="#ffb02e" />
                  <stop offset="0.62" stopColor="#ff3a0a" />
                  <stop offset="0.9" stopColor="#8a0602" />
                  <stop offset="1" stopColor="#230000" />
                </radialGradient>
              </defs>
              <circle cx="50" cy="50" r="48" fill="url(#ds-iris-g)" />
              <path className="ds-iris-rays" d={IRIS_RAYS} />
              <circle className="ds-iris-limbus" cx="50" cy="50" r="46.5" />
              <circle className="ds-iris-fire" cx="50" cy="50" r="21" />
            </svg>
            <div className="ds-eye-pupil">
              <div className="ds-eye-dilate">
                <i className="ds-eye-slit" />
              </div>
            </div>
            <i className="ds-eye-glint" />
          </div>
        </div>
        <div className="ds-lid ds-lid-top">
          <i />
        </div>
        <div className="ds-lid ds-lid-bot">
          <i />
        </div>
      </div>
      <svg
        className="ds-eye-rim"
        viewBox="0 0 200 100"
        preserveAspectRatio="none"
      >
        <path d={ALMOND} />
      </svg>
    </div>
    {/* vencedor: clarão na cor da fatia, depois um brilho calmo */}
    <div className="ds-eye-win">
      <div className="ds-eye-after" />
      <div className="ds-eye-flare">
        <i className="ds-flare-glow" />
        <i className="ds-flare-streak" />
        <i className="ds-flare-cross" />
      </div>
    </div>
    {/* mira travando no olho enquanto a roleta gira */}
    <div className="ds-eye-lock" />
  </div>
)

// lasers do olho (girando): ângulos em graus, 0 = para a direita
const LASERS = [146, 134, 46, 34].map(
  (a, i) =>
    ({
      '--ds-a': `${a}deg`,
      animationDuration: `${[0.83, 1.07, 0.97, 0.71][i]}s`,
      animationDelay: `${[-0.1, -0.5, -0.3, -0.6][i]}s`,
    }) as CSSProperties,
)

// ---------- Drones de patrulha (64 × 26, silhueta própria) ----------

const DRONE_HULL =
  'M2 11L18 6L27 2H37L46 6L62 11L47 14L41 18H23L17 14Z' +
  'M23 18L19 25L21 25L26 18ZM41 18L45 25L43 25L38 18Z'
const DRONE_LIT = 'M28 12h8v2.4h-8zM8 10.6h5v1.2h-5zM51 10.6h5v1.2h-5z'
const DRONES = [
  { top: '0px', left: '0px', w: 'clamp(40px, 3.6vh, 54px)', bob: 2.3 },
  { top: '26px', left: '-74px', w: 'clamp(52px, 4.8vh, 70px)', bob: 2.9 },
  { top: '6px', left: '-150px', w: 'clamp(30px, 2.8vh, 42px)', bob: 1.9 },
]

const Drone = ({ i }: { i: number }) => {
  const d = DRONES[i]
  return (
    <div
      className="ds-drone"
      style={{ top: d.top, left: d.left, width: d.w } as CSSProperties}
    >
      <div
        className="ds-drone-bob"
        style={{
          animationDuration: `${d.bob}s`,
          animationDelay: `${-i * 0.7}s`,
        }}
      >
        <svg viewBox="0 0 64 26">
          <path className="ds-drone-hull" d={DRONE_HULL} />
          <path className="ds-drone-lit" d={DRONE_LIT} />
        </svg>
        <i
          className="ds-drone-light"
          style={{ animationDelay: `${-i * 0.43}s` }}
        />
      </div>
    </div>
  )
}

// ---------- Brasas grandes e cinzas (1600 × 1800, laço vertical) ----------

// x sorteado puxado para as bordas (o centro fica atrás da interface)
const edgeX = (rand: () => number, w: number) => {
  const v = rand()
  if (v < 0.45) return rand() * w * 0.16
  if (v < 0.9) return w - rand() * w * 0.16
  return rand() * w
}
const specks = (seed: number, count: number, flake: boolean) => {
  const rand = seeded(seed)
  let d = ''
  for (let i = 0; i < count; i++) {
    const x = n(edgeX(rand, 1600))
    const y = n(rand() * 900)
    const seg = flake ? `l${n(2 + rand() * 5)} ${n(rand() * 4 - 2)}` : 'h0.1'
    d += `M${x} ${y}${seg}M${x} ${n(y + 900)}${seg}`
  }
  return d
}
const EMBERS_NEAR = specks(57, 40, false)
const ASH = specks(127, 56, true)

const Fall = ({ className, d }: { className: string; d: string }) => (
  <div className={className}>
    <svg viewBox="0 0 1600 1800" preserveAspectRatio="none">
      <path d={d} />
    </svg>
  </div>
)

// ---------- HUD ----------

// contadores: tiras de dígitos que sobem em degraus (uma animação cada)
const UP = '0123456789'
const DOWN = '9876543210'
const MESS = '7302948165'
const Dig = ({ c, seq }: { c: string; seq: string }) => (
  <span className={`ds-dig ${c}`}>
    <span>{seq.split('').join('\n')}</span>
  </span>
)

// radar: ângulo de cada eco (horário, a partir do topo) pisca quando o
// feixe passa
const RADAR_SWEEP = 4.8
const BLIPS = [
  [68, 30],
  [30, 62],
  [74, 70],
  [40, 34],
].map(([x, y]) => {
  const a = ((Math.atan2(x - 50, 50 - y) * 180) / Math.PI + 360) % 360
  return {
    left: `${x}%`,
    top: `${y}%`,
    animationDuration: `${RADAR_SWEEP}s`,
    animationDelay: `${n((a / 360) * RADAR_SWEEP - RADAR_SWEEP)}s`,
  } as CSSProperties
})

const Radar = () => (
  <div className="ds-radar">
    <svg className="ds-radar-grid" viewBox="0 0 100 100">
      <path d="M50 2V98M2 50H98M16 16L84 84M84 16L16 84" />
      <circle cx="50" cy="50" r="48" />
      <circle cx="50" cy="50" r="32" />
      <circle cx="50" cy="50" r="16" />
    </svg>
    <div
      className="ds-radar-sweep"
      style={{ animationDuration: `${RADAR_SWEEP}s` }}
    />
    {BLIPS.map((style, i) => (
      <span key={i} className="ds-blip" style={style} />
    ))}
    <span className="ds-radar-label">Setor 7 · contato</span>
  </div>
)

const Hud = () => (
  <>
    <div className="ds-hud ds-hud-l">
      <div className="ds-panel">
        <b className="ds-ptitle">Sonda K-13</b>
        <div className="ds-row">
          <span>ALT</span>
          <span className="ds-num">
            0<Dig c="ds-alt1" seq={MESS} />
            <Dig c="ds-alt0" seq={MESS} />
            <small>m</small>
          </span>
        </div>
        <div className="ds-ladder">
          <i className="ds-ladder-a" />
          <i className="ds-ladder-b" />
          <b />
        </div>
        <div className="ds-row">
          <span>VEL</span>
          <span className="ds-bars ds-vel">
            <i />
            <i />
            <i />
            <i />
            <span>
              <i />
              <i />
            </span>
          </span>
        </div>
      </div>
      <div className="ds-alert">
        <i />
        Erro 0x666
      </div>
      <Radar />
    </div>

    <div className="ds-hud ds-hud-r">
      <div className="ds-panel">
        <b className="ds-ptitle">Alvo</b>
        <div className="ds-row">
          <span>DIST</span>
          <span className="ds-num">
            <Dig c="ds-d2" seq={DOWN} />
            <Dig c="ds-d1" seq={DOWN} />,<Dig c="ds-d0" seq={DOWN} />
            <small>km</small>
          </span>
        </div>
        <div className="ds-row">
          <span>SINAL</span>
          <span className="ds-bars ds-sig">
            <i />
            <i />
            <span>
              <i />
              <i />
              <i />
            </span>
          </span>
        </div>
      </div>
      <div className="ds-log">
        <p className="ds-msg">
          Sinal perdido<small>restabelecendo…</small>
        </p>
        <p className="ds-msg">
          Erro 0x666<small>núcleo corrompido</small>
        </p>
        <p className="ds-msg">
          Entidade detectada<small>tamanho: colossal</small>
        </p>
        <p className="ds-msg">
          Não olhe<small>para o olho</small>
        </p>
        <span className="ds-cursor">&gt;_</span>
      </div>
      <div className="ds-scanlbl">Varredura</div>
    </div>

    {/* OSD de fita VHS na faixa de baixo */}
    <div className="ds-osd ds-osd-l">
      <span className="ds-play">
        <i />
        PLAY
      </span>
      <span>SP</span>
      <span className="ds-clock">
        03:33:
        <Dig c="ds-s1" seq={'012345'} />
        <Dig c="ds-s0" seq={UP} />
      </span>
    </div>
    <div className="ds-osd ds-osd-r">
      <span>CANAL 06</span>
      <span className="ds-trk">
        TRACKING
        <i />
      </span>
    </div>

    {/* legendas ao lado do olho */}
    <div className="ds-cap ds-cap-lock">Alvo travado</div>
    <div className="ds-cap ds-cap-won">O Vigia escolheu</div>
    <div className="ds-cap ds-cap-seen">Ele te viu</div>
    <div className="ds-cap ds-cap-lost">Sem sinal</div>
  </>
)

// ---------- Reserva sem WebGL: paisagem parada ----------

const RIDGE = (() => {
  const rand = seeded(2049)
  const pts: string[] = []
  for (let x = 0; x <= 1600; x += 40) {
    const u = Math.abs(x / 1600 - 0.5) * 2
    const h = 10 + Math.pow(u, 1.6) * 230 * (0.55 + rand() * 0.45)
    pts.push(`${x} ${n(300 - h)}`)
  }
  return `M0 300L${pts.join('L')}L1600 300Z`
})()

export default function DarksynthScene() {
  const uniforms = useMemo(createFlight, [])
  return (
    <>
      <ShaderCanvas
        className="ds-gl"
        frag={FRAG}
        scale={0.5}
        fps={30}
        still={STILL}
        uniforms={uniforms}
      />
      <div className="ds-fallback">
        <div className="ds-fb-moon" />
        <div className="ds-fb-pyr" />
        <div className="ds-fb-glow" />
        <svg viewBox="0 0 1600 300" preserveAspectRatio="none">
          <path d={RIDGE} />
        </svg>
      </div>

      {/* brasas grandes e cinzas passando perto da câmera */}
      <div className="ds-motes">
        <Fall className="ds-fall ds-ash" d={ASH} />
        <Fall className="ds-fall ds-ember" d={EMBERS_NEAR} />
      </div>

      {/* lasers saem do olho (só girando) */}
      <div className="ds-lasers">
        {LASERS.map((style, i) => (
          <span key={i} className="ds-laser" style={style} />
        ))}
      </div>

      <Eye />

      {/* esquadrilha cruzando o topo, na frente da pirâmide */}
      <div className="ds-squad">
        {DRONES.map((_, i) => (
          <Drone key={i} i={i} />
        ))}
      </div>
      {/* raro: um fragmento em chamas risca o céu do cabeçalho */}
      <div className="ds-meteor">
        <i />
      </div>

      <Hud />

      {/* VHS: scanlines, faixa rolando, falha de tracking, ruído da cabeça */}
      <div className="ds-scan" />
      <div className="ds-roll" />
      <div className="ds-track">
        <i />
      </div>
      <div className="ds-tear ds-tear-1" />
      <div className="ds-tear ds-tear-2" />
      <div className="ds-headnoise" />

      {/* eventos raros e vitória */}
      <div className="ds-seen" />
      <div className="ds-lost">
        <i />
      </div>
      <div className="ds-winflash" />
    </>
  )
}
