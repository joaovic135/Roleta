'use client'

import { useCallback, useEffect, useRef } from 'react'
import type { CSSProperties } from 'react'
import ShaderCanvas from '../_kit/ShaderCanvas'
import { FRAG, STILL, createChrome } from './chrome'

// Cena de fundo do tema Y2K (só aparece com data-theme="y2k").
// "Sonho Cromado 2000": céu de vidro da virada do milênio emoldurado por
// METAL LÍQUIDO — gotas de cromo (WebGL, ver chrome.ts) que escorrem pelas
// margens, cantos, cabeçalho e rodapé, fundem e se separam, refletem a
// hora do dia e ganham bordas de arco-íris (filme fino). Uma delas é a
// GOTINHA, mascote de cromo com olhos que piscam e acompanham a roleta. O
// centro, atrás da roleta, fica calmo.
//
// Atrás do cromo, em CSS: céus que se cruzam, nuvens em parallax, sol com
// reflexo de lente, aurora, estrelas e planeta. Por cima: CDs iridescentes
// girando, globo 3D de arame (a "www" da época) no vão abaixo do seletor
// de temas, bolhas Aero subindo, borboletas holográficas, janelinhas pop-up
// e o aparelho de som "CromoSystem 2000" no alto, com CD girando,
// equalizador, letreiro e a CONTAGEM PARA O ANO 2000. Sem WebGL, gotas
// cromadas paradas em CSS ficam no lugar do metal líquido.
//
// Ciclo único de --y2-cycle (4 min, ver theme.css): manhã cromada → céu
// azul com sol e reflexo de lente (download da "sorte") → chuva de bolhas →
// pôr do sol holográfico com aurora (pop-up do visitante nº 999.999) →
// noite de protetor de tela com estrelas e planeta → 00:00, VIRADA DO
// MILÊNIO: fogos cromados e as gotas em festa → o BUG DO MILÊNIO (relógio
// volta para 1900, gotas com falha digital, janela de erro) → amanhecer
// cintilante, e a contagem recomeça.
//
// Roleta: girando, as gotas disparam em volta da moldura como a bolinha da
// roleta (a Gotinha corre junto, de olho rodando), o CD e o equalizador
// aceleram e o LCD mostra GIRANDO…; vencedor, duas ondas saem da roda e
// incham as gotas num lampejo iridescente na cor da fatia, que assenta num
// brilho calmo enquanto o resultado fica aberto (Gotinha sorrindo, LCD
// aceso na cor e o pop-up do visitante nº 1.000.000).
//
// Sorteios com semente fixa, formas iguais num só <path>, e cada camada
// animada num elemento próprio (opacidade e movimento na GPU).

const seeded = (seed: number) => () => {
  seed = (seed + 0x6d2b79f5) | 0
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}
const n = (v: number) => +v.toFixed(1)
const css = (v: Record<string, string | number>) => v as CSSProperties
// atraso no ciclo (fração): a camada vive "d" depois do relógio global
const lag = (d: number, extra: Record<string, string | number> = {}) =>
  css({ '--y2-d': d.toFixed(4), ...extra })
const cx = (...names: (string | false)[]) => names.filter(Boolean).join(' ')

const dot = (x: number, y: number, r: number) =>
  `M${n(x - r)} ${n(y)}a${n(r)} ${n(r)} 0 1 0 ${n(r * 2)} 0a${n(r)} ${n(r)} 0 1 0 ${n(-r * 2)} 0`
const oval = (x: number, y: number, rx: number, ry: number) =>
  `M${n(x - rx)} ${n(y)}a${n(rx)} ${n(ry)} 0 1 0 ${n(rx * 2)} 0a${n(rx)} ${n(ry)} 0 1 0 ${n(-rx * 2)} 0`
const sparkle = (x: number, y: number, s: number) =>
  `M${n(x)} ${n(y - s)}Q${n(x)} ${n(y)} ${n(x + s)} ${n(y)}Q${n(x)} ${n(y)} ${n(x)} ${n(y + s)}Q${n(x)} ${n(y)} ${n(x - s)} ${n(y)}Q${n(x)} ${n(y)} ${n(x)} ${n(y - s)}Z`

// ---- Nuvens fofas (ladrilho que se repete na horizontal) ----
const puff = (rand: () => number, x: number, by: number, w: number) => {
  const k = 3 + Math.floor(rand() * 3)
  let d = oval(x, by, w / 2, w * 0.13)
  for (let j = 0; j < k; j++) {
    const t = (j + 0.5) / k
    const r =
      (w / k) * (0.5 + rand() * 0.3) * (1 + 0.55 * Math.sin(Math.PI * t))
    d += dot(x - w / 2 + t * w, by - r * 0.5, r)
  }
  return d
}
const cloudTile = (
  seed: number,
  count: number,
  [wMin, wMax]: [number, number],
  [yMin, yMax]: [number, number],
  floor = '',
) => {
  const rand = seeded(seed)
  const slot = 3200 / count
  let d = floor
  for (let i = 0; i < count; i++) {
    const w = Math.min(slot * 0.92, wMin + rand() * (wMax - wMin))
    const x = slot * (i + 0.5) + (rand() - 0.5) * (slot - w) * 0.8
    const y = yMin + rand() * (yMax - yMin)
    // os sorteios da nuvem ficam gravados: a que passa da borda do ladrilho
    // é repetida do outro lado (±3200), senão a emenda das cópias mostra a
    // nuvem cortada reto
    const draws: number[] = []
    d += puff(
      () => {
        const v = rand()
        draws.push(v)
        return v
      },
      x,
      y,
      w,
    )
    const wrap = x - w < 0 ? 3200 : x + w > 3200 ? -3200 : 0
    let j = 0
    if (wrap) d += puff(() => draws[j++], x + wrap, y, w)
  }
  return d
}
const CLOUDS_SKY = cloudTile(77, 7, [190, 360], [118, 168])
const CLOUDS_FLOOR = cloudTile(
  2000,
  10,
  [260, 420],
  [206, 236],
  // faixa do chão no mesmo sentido dos círculos (anti-horário): sentidos
  // opostos abriam buracos onde se sobrepunham (regra nonzero)
  'M0 196v60h3200v-60z',
)

// ---- Estrelas e cintilantes (tela de 1600 x 900) ----
const STARS = (() => {
  const rand = seeded(1999)
  let base = ''
  let twA = ''
  let twB = ''
  for (let i = 0; i < 140; i++)
    base += dot(rand() * 1600, rand() * 900, 0.6 + rand() * 1.2)
  for (let i = 0; i < 26; i++) {
    const s = sparkle(rand() * 1600, rand() * 900, 3 + rand() * 6)
    if (i % 2) twA += s
    else twB += s
  }
  return { base, twA, twB }
})()

// brilhos do amanhecer, só nas bordas (o centro fica calmo)
const SPARKLES = (() => {
  const rand = seeded(88)
  const groups = ['', '', '']
  for (let i = 0; i < 36; i++) {
    const side = i % 4
    const x =
      side === 0
        ? rand() * 150
        : side === 1
          ? 1450 + rand() * 150
          : rand() * 1600
    const y =
      side === 2 ? rand() * 80 : side === 3 ? 830 + rand() * 70 : rand() * 900
    groups[i % 3] += sparkle(x, y, 4 + rand() * 9)
  }
  return groups
})()

// ---- Aurora: fitas holográficas onduladas ----
const ribbon = (seed: number, base: number, amp: number, thick: number) => {
  const rand = seeded(seed)
  const f1 = 1 + rand() * 1.5
  const f2 = 2 + rand() * 2
  const p1 = rand() * 6
  const p2 = rand() * 6
  const top: [number, number][] = []
  const bot: [number, number][] = []
  for (let i = 0; i <= 32; i++) {
    const x = i * 50
    const t = x / 1600
    const y =
      base +
      amp * Math.sin(t * Math.PI * 2 * f1 + p1) +
      amp * 0.4 * Math.sin(t * Math.PI * 2 * f2 + p2)
    const w = thick * (0.45 + 0.55 * Math.abs(Math.sin(t * Math.PI * 1.6 + p2)))
    top.push([x, y])
    bot.push([x, y + w])
  }
  const curve = (pts: [number, number][]) =>
    pts
      .slice(1)
      .map(([x, y], i) => {
        const [px, py] = pts[i]
        return `Q${px + 25} ${n(py)} ${n((px + x) / 2 + 12.5)} ${n((py + y) / 2)}`
      })
      .join('')
  const edge = `M${top[0][0]} ${n(top[0][1])}${curve(top)}`
  const back = [...bot].reverse()
  const fill = `${edge}L${back[0][0]} ${n(back[0][1])}${curve(back)}Z`
  return { fill, edge }
}
const RIBBONS = [
  ribbon(5, 90, 46, 70),
  ribbon(9, 150, 56, 58),
  ribbon(13, 60, 38, 84),
]

// raios finos do sol forte
const SUN_RAYS = (() => {
  let d = ''
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2
    const r = i % 2 ? 210 : 290
    const s = 0.03
    d += `M300 300L${n(300 + Math.cos(a - s) * r)} ${n(300 + Math.sin(a - s) * r)}L${n(300 + Math.cos(a + s) * r)} ${n(300 + Math.sin(a + s) * r)}Z`
  }
  return d
})()

const BUTTERFLY_WINGS =
  'M20 15C12 0 1 1 3 12C4 17 13 18 20 16ZM20 15C28 0 39 1 37 12C36 17 27 18 20 16Z' +
  'M20 17C13 19 6 29 12 30C16 31 19 24 20 17ZM20 17C27 19 34 29 28 30C24 31 21 24 20 17Z'

// ---- Bolhas Aero subindo nas margens ----
const BUBBLES = [
  { x: '2.5vw', s: '8vh', t: '26s', dl: '-3s', sw: '2vw' },
  { x: '7vw', s: '4.6vh', t: '19s', dl: '-11s', sw: '-1.5vw' },
  { x: '4vw', s: '3vh', t: '15s', dl: '-6s', sw: '1vw' },
  { x: '96vw', s: '7vh', t: '24s', dl: '-15s', sw: '-2vw' },
  { x: '91.5vw', s: '4vh', t: '17s', dl: '-2s', sw: '1.5vw' },
  { x: '98vw', s: '3.2vh', t: '21s', dl: '-9s', sw: '-1vw' },
].map(({ x, s, t, dl, sw }) =>
  css({ '--y2-x': x, '--y2-s': s, '--y2-t': t, '--y2-dl': dl, '--y2-sx': sw }),
)

// chuva de bolhas (evento): três camadas altas atravessam a tela subindo,
// quase todas nas margens (camada 0 = longe: bolhas pequenas e lentas;
// 2 = perto: grandes e rápidas)
const SHOWER = [0, 1, 2].map((k) => {
  const rand = seeded(404 + k * 31)
  const count = 24
  return Array.from({ length: count }, (_, i) => {
    const side = i % 5
    const x =
      side < 2 ? rand() * 9.5 : side < 4 ? 90.5 + rand() * 9.5 : rand() * 100
    return css({
      left: `${n(x - 1)}vw`,
      top: `${n((i / count) * 300 + rand() * 10)}vh`,
      '--y2-s': `${n(2.2 + k * 1.4 + rand() * (2 + k * 1.6))}vh`,
    })
  })
})

// ---- Fogos cromados da virada (posição, tamanho, atraso em segundos) ----
const FIREWORK = (() => {
  let ray = ''
  let tip = ''
  for (let i = 0; i < 18; i++) {
    const a = (i / 18) * Math.PI * 2
    const r0 = i % 2 ? 26 : 18
    const r1 = i % 2 ? 84 : 66
    const c = Math.cos(a)
    const s = Math.sin(a)
    ray += `M${n(100 + c * r0)} ${n(100 + s * r0)}L${n(100 + c * r1)} ${n(100 + s * r1)}`
    tip += sparkle(100 + c * (r1 + 9), 100 + s * (r1 + 9), i % 2 ? 7 : 4)
  }
  return { ray, tip }
})()
const FIREWORKS = [
  { left: '31vw', top: '7vh', s: '13vh', d: 0 },
  { left: '4vw', top: '24vh', s: '15vh', d: 1.1 },
  { left: '73vw', top: '5vh', s: '12vh', d: 1.9 },
  { left: '93vw', top: '30vh', s: '16vh', d: 2.8 },
  { left: '20vw', top: '4vh', s: '10vh', d: 3.6 },
].map(({ left, top, s, d }) => lag(0.625 + d / 240, { left, top, '--y2-s': s }))

// ---- Equalizador: tira de 8 quadros (12 barras de LEDs cada) ----
const EQ = (() => {
  const rand = seeded(2000)
  const make = (hot: number) => {
    const rows = ['', '', '']
    for (let f = 0; f < 8; f++)
      for (let b = 0; b < 12; b++) {
        const shape = 1 - Math.abs(b - 4.5) / 9
        const h = Math.max(
          1,
          Math.min(8, Math.round((shape * 6 + rand() * hot) * 0.75)),
        )
        for (let k = 0; k < h; k++) {
          const row = k < 5 ? 0 : k < 7 ? 1 : 2
          rows[row] += `M${b * 5} ${f * 22 + 19 - k * 2.6}h4v1.8h-4z`
        }
      }
    return rows
  }
  return { calm: make(5), wild: make(9) }
})()

// ---- Globo de arame (CSS 3D) ----
const MERIDIANS = [0, 30, 60, 90, 120, 150].map((a) =>
  css({ '--y2-a': `${a}deg` }),
)
const LATITUDES = [-60, -30, 0, 30, 60].map((lat) => {
  const r = Math.cos((lat * Math.PI) / 180)
  return css({
    '--y2-y': `${n(-Math.sin((lat * Math.PI) / 180) * 50)}px`,
    '--y2-i': `${n(50 * (1 - r))}px`,
  })
})

// contagem regressiva: tiras de dígitos (de cima para baixo)
const Digits = ({ list, k }: { list: string; k: string }) => (
  <span className={cx('y2-dg', `y2-dg-${k}`)}>
    <span className="y2-dg-strip">{list.split('').join('\n')}</span>
  </span>
)

export default function Y2kScene() {
  // metal líquido: o movimento das gotas é calculado em chrome.ts
  const chrome = useRef<ReturnType<typeof createChrome> | null>(null)
  useEffect(
    () => () => {
      chrome.current?.dispose()
      chrome.current = null
    },
    [],
  )
  const uniforms = useCallback((t: number) => {
    if (!chrome.current) chrome.current = createChrome()
    return chrome.current.frame(t)
  }, [])

  return (
    <>
      {/* gradientes compartilhados (não pode ser display:none) */}
      <svg className="y2-defs" width="0" height="0" aria-hidden="true">
        <defs>
          <linearGradient id="y2-holo" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#ff9ad5" />
            <stop offset="0.25" stopColor="#9ef0ff" />
            <stop offset="0.5" stopColor="#d8ff9e" />
            <stop offset="0.75" stopColor="#c7a6ff" />
            <stop offset="1" stopColor="#ff9ad5" />
          </linearGradient>
          {/* só das nuvens furta-cor: medido no ladrilho (0–3200), para a
              cor fechar igual nas duas pontas da emenda */}
          <linearGradient
            id="y2-holo-soft"
            gradientUnits="userSpaceOnUse"
            x1="0"
            y1="0"
            x2="3200"
            y2="0"
          >
            <stop offset="0" stopColor="#ffc9ea" />
            <stop offset="0.25" stopColor="#ffe3cf" />
            <stop offset="0.5" stopColor="#dccfff" />
            <stop offset="0.75" stopColor="#cdf3ff" />
            <stop offset="1" stopColor="#ffc9ea" />
          </linearGradient>
          <linearGradient id="y2-cloud" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0.3" stopColor="#ffffff" />
            <stop offset="1" stopColor="#d5e1f0" />
          </linearGradient>
          <radialGradient id="y2-fw" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0.2" stopColor="#ffffff" />
            <stop offset="0.55" stopColor="#9ef0ff" />
            <stop offset="0.8" stopColor="#ff9ad5" />
            <stop offset="1" stopColor="#d8ff9e" />
          </radialGradient>
        </defs>
      </svg>

      {/* céus que cruzam a opacidade por cima do prata da manhã */}
      <div className="y2-sky y2-sky-day y2-cyc" />
      <div className="y2-sky y2-sky-sunset y2-cyc" />
      <div className="y2-sheen-wrap y2-cyc">
        <div className="y2-sheen" />
      </div>
      <div className="y2-sky y2-sky-night y2-cyc" />
      <div className="y2-sky y2-sky-dawn y2-cyc" />

      {/* noite: estrelas cintilando e estrelas cadentes */}
      <div className="y2-stars y2-cyc">
        <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice">
          <path d={STARS.base} />
        </svg>
        <svg
          className="y2-twinkle"
          viewBox="0 0 1600 900"
          preserveAspectRatio="xMidYMid slice"
        >
          <path d={STARS.twA} />
        </svg>
        <svg
          className="y2-twinkle y2-twinkle-b"
          viewBox="0 0 1600 900"
          preserveAspectRatio="xMidYMid slice"
        >
          <path d={STARS.twB} />
        </svg>
      </div>
      <div className="y2-shoot y2-shoot-1">
        <i className="y2-cyc" style={lag(0.585)} />
      </div>
      <div className="y2-shoot y2-shoot-2">
        <i className="y2-cyc" style={lag(0.735)} />
      </div>

      {/* aurora de fitas holográficas (pôr do sol → noite) */}
      <div className="y2-aurora y2-cyc">
        {RIBBONS.map(({ fill, edge }, i) => (
          <svg
            key={i}
            viewBox="0 0 1600 400"
            preserveAspectRatio="none"
            style={css({
              '--y2-dl': `${-i * 8}s`,
              '--y2-sw': `${15 + i * 4}s`,
            })}
          >
            <path className="y2-ribbon" d={fill} />
            <path className="y2-ribbon-edge" d={edge} />
          </svg>
        ))}
      </div>

      {/* planeta cromado com anéis, cruzando o céu à noite */}
      <div className="y2-orbit y2-orbit-planet y2-cyc" style={lag(0.42)}>
        <div className="y2-arm y2-planet">
          <svg className="y2-planet-ring" viewBox="0 0 200 80">
            <path d="M8 40A92 24 0 0 1 192 40" />
          </svg>
          <div className="y2-planet-ball" />
          <svg
            className="y2-planet-ring y2-planet-ring-front"
            viewBox="0 0 200 80"
          >
            <path d="M192 40A92 24 0 0 1 8 40" />
          </svg>
          <div className="y2-moon-x">
            <div className="y2-moon-y">
              <i />
            </div>
          </div>
        </div>
      </div>

      {/* nuvens do alto: uma trilha só, com versões branca e furta-cor */}
      <div className="y2-clouds y2-clouds-sky">
        <div className="y2-cloud-track">
          {(['white', 'holo'] as const).map((v) => (
            <div
              key={v}
              className={cx('y2-cloud-tint', 'y2-cyc', `y2-cl-${v}`)}
            >
              {[0, 1].map((k) => (
                <svg key={k} viewBox="0 0 3200 200" preserveAspectRatio="none">
                  <path d={CLOUDS_SKY} />
                </svg>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* sol cromado num arco (nasce à esquerda, se põe à direita), com
          reflexo de lente */}
      <div className="y2-orbit y2-orbit-sun y2-cyc" style={lag(0.88)}>
        <div className="y2-arm y2-sun-arm">
          <div className="y2-sun-glow" />
          <div className="y2-sun" />
          <div className="y2-sun-warm y2-cyc" />
          <div className="y2-flare y2-cyc">
            <svg className="y2-flare-rays" viewBox="0 0 600 600">
              <path d={SUN_RAYS} />
            </svg>
            <i className="y2-flare-streak" />
            <svg className="y2-flare-ghosts" viewBox="0 0 200 700">
              <circle className="y2-flare-ring" cx="100" cy="0" r="62" />
              <path
                d={`${dot(100, 190, 20)}${dot(100, 330, 9)}${dot(100, 560, 36)}`}
              />
              <path
                className="y2-flare-hex"
                d="M100 420l26 15v30l-26 15l-26-15v-30z"
              />
            </svg>
          </div>
        </div>
      </div>

      <div className="y2-clouds y2-clouds-floor">
        <div className="y2-cloud-track">
          {(['white', 'holo'] as const).map((v) => (
            <div
              key={v}
              className={cx('y2-cloud-tint', 'y2-cyc', `y2-fl-${v}`)}
            >
              {[0, 1].map((k) => (
                <svg key={k} viewBox="0 0 3200 240" preserveAspectRatio="none">
                  <path d={CLOUDS_FLOOR} />
                </svg>
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="y2-mist y2-cyc" />

      {/* METAL LÍQUIDO (WebGL) e, sem WebGL, gotas cromadas paradas */}
      <ShaderCanvas
        className="y2-gl"
        frag={FRAG}
        scale={0.5}
        fps={30}
        still={STILL}
        uniforms={uniforms}
      />
      <div className="y2-gl-off">
        {[1, 2, 3, 4, 5, 6].map((k) => (
          <i key={k} className={`y2-blob-${k}`} />
        ))}
      </div>

      {/* CDs iridescentes girando nas beiradas (aceleram com a roleta) */}
      {[1, 2].map((k) => (
        <div key={k} className={cx('y2-cd', `y2-cd-${k}`)}>
          <i className="y2-cd-disc" />
          <i className="y2-cd-disc y2-cd-fast" />
          <i className="y2-cd-shine" />
        </div>
      ))}

      {/* globo de arame 3D no vão abaixo do seletor de temas */}
      <div className="y2-globe">
        <div className="y2-globe-glass" />
        <div className="y2-globe-tilt">
          <div className="y2-globe-spin">
            {MERIDIANS.map((style, i) => (
              <i key={i} className="y2-mer" style={style} />
            ))}
          </div>
          {LATITUDES.map((style, i) => (
            <i key={i} className="y2-lat" style={style} />
          ))}
        </div>
        <div className="y2-globe-shine" />
        <div className="y2-globe-orbit" />
        <i className="y2-globe-sat" />
        <div className="y2-globe-tag">
          <b /> conectado · 56k
        </div>
      </div>

      {/* bolhas Aero subindo devagar nas margens */}
      <div className="y2-bubbles">
        {BUBBLES.map((style, i) => (
          <i key={i} className="y2-bub" style={style} />
        ))}
      </div>
      {/* chuva de bolhas (evento do fim da manhã) */}
      <div className="y2-shower">
        {SHOWER.map((list, k) => (
          <div
            key={k}
            className={cx('y2-shower-l', 'y2-cyc', `y2-shower-${k}`)}
            style={lag(0.2 + k * 0.012)}
          >
            {list.map((style, i) => (
              <i key={i} className="y2-bub" style={style} />
            ))}
          </div>
        ))}
      </div>

      {/* borboletas holográficas (de dia) */}
      <div className="y2-butterflies y2-cyc">
        {[1, 2].map((k) => (
          <div key={k} className={cx('y2-bf', `y2-bf-${k}`)}>
            <div className="y2-bf-flap">
              <svg viewBox="0 0 40 32">
                <path d={BUTTERFLY_WINGS} fill="url(#y2-holo)" />
                <path className="y2-bf-body" d="M19 11h2v12h-2z" />
              </svg>
            </div>
          </div>
        ))}
      </div>

      {/* brilhinhos nas bordas (fortes no amanhecer) */}
      <div className="y2-sparkles y2-cyc">
        {SPARKLES.map((d, i) => (
          <svg
            key={i}
            viewBox="0 0 1600 900"
            preserveAspectRatio="xMidYMid slice"
            style={css({
              '--y2-dl': `${-i * 0.9}s`,
              '--y2-tw': `${2.4 + i * 0.7}s`,
            })}
          >
            <path d={d} />
          </svg>
        ))}
      </div>

      {/* fogos cromados da virada do milênio */}
      {FIREWORKS.map((style, i) => (
        <div key={i} className="y2-fw y2-cyc" style={style}>
          <svg viewBox="0 0 200 200">
            <path className="y2-fw-glow" d={FIREWORK.ray} />
            <path className="y2-fw-ray" d={FIREWORK.ray} />
            <path className="y2-fw-tip" d={FIREWORK.tip} />
          </svg>
        </div>
      ))}

      {/* janelinhas pop-up (uma de cada vez, ao lado do aparelho) */}
      <div className="y2-wins">
        <div className="y2-wins-cyc">
          <div className="y2-win y2-win-a y2-cyc" style={lag(0.1)}>
            <div className="y2-win-bar">sorte_2000.exe</div>
            <div className="y2-win-text">Baixando sorte… 5,6 KB/s</div>
            <div className="y2-win-track">
              <i className="y2-cyc" style={lag(0.1)} />
            </div>
          </div>
          <div className="y2-win y2-win-b y2-cyc" style={lag(0.38)}>
            <div className="y2-win-bar">PARABÉNS!!!</div>
            <div className="y2-win-text">
              Você é o visitante nº <b>999.999</b>!
            </div>
            <div className="y2-win-btn">Gire para ganhar ✦</div>
          </div>
          <div className="y2-win y2-win-c y2-cyc" style={lag(0.66)}>
            <div className="y2-win-bar">Erro do Milênio</div>
            <div className="y2-win-text">
              <b className="y2-win-ico">!</b> destino.dat: data 01/01/1900
            </div>
            <div className="y2-win-text y2-win-fix">Corrigindo o relógio…</div>
          </div>
        </div>
        <div className="y2-win y2-win-won">
          <div className="y2-win-bar">★ SORTEADO! ★</div>
          <div className="y2-win-text">
            Você é o visitante nº <b>1.000.000</b>!
          </div>
          <div className="y2-win-track">
            <i />
          </div>
        </div>
      </div>

      {/* aparelho de som "CromoSystem 2000" com a contagem para 2000 */}
      <div className="y2-player">
        <div className="y2-pl-body">
          <div className="y2-pl-cd">
            <i className="y2-cd-disc" />
            <i className="y2-cd-disc y2-cd-fast" />
            <i className="y2-pl-dome" />
          </div>
          <div className="y2-lcd">
            <div className="y2-lcd-ticker">
              <span>
                ♪ Tocando: Sonho Cromado (Mix do Milênio) ✦ 128 kbps ✦ estéreo ✦
                faixa 01/12 ✦ ♪ Tocando: Sonho Cromado (Mix do Milênio) ✦ 128
                kbps ✦ estéreo ✦ faixa 01/12 ✦
              </span>
            </div>
            <div className="y2-lcd-main">
              <div className="y2-lcd-cyc">
                <div className="y2-lcd-count y2-cyc">
                  <small>
                    contagem
                    <br />
                    p/ 2000
                  </small>
                  <span className="y2-lcd-digits">
                    0<Digits list="3210" k="m" />:
                    <Digits list="543210" k="t" />
                    <Digits list="9876543210" k="u" />
                  </span>
                </div>
                <div className="y2-lcd-party y2-cyc">★ FELIZ 2000! ★</div>
                <div className="y2-lcd-bug y2-cyc">01·01·1900 ?!</div>
              </div>
              <div className="y2-lcd-spin">GIRANDO…</div>
              <div className="y2-lcd-won">★ SORTEADO ★</div>
              <div className="y2-eq">
                <svg className="y2-eq-strip" viewBox="0 0 60 176">
                  <path className="y2-eq-lo" d={EQ.calm[0]} />
                  <path className="y2-eq-mid" d={EQ.calm[1]} />
                  <path className="y2-eq-hi" d={EQ.calm[2]} />
                </svg>
                <svg className="y2-eq-strip y2-eq-wild" viewBox="0 0 60 176">
                  <path className="y2-eq-lo" d={EQ.wild[0]} />
                  <path className="y2-eq-mid" d={EQ.wild[1]} />
                  <path className="y2-eq-hi" d={EQ.wild[2]} />
                </svg>
              </div>
            </div>
          </div>
          <div className="y2-pl-side">
            <i className="y2-pl-spk" />
            <i className="y2-pl-led" />
          </div>
        </div>
      </div>
    </>
  )
}
