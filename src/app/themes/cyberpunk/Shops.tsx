import { rect } from './geo'

// Lojas sob o trilho elevado (como as ruas debaixo dos viadutos de
// Tóquio): uma faixa estática em SVG com pilares, vitrines acesas,
// letreiros, máquinas de bebida, uma porta de aço pichada e a luz de cada
// loja derramada no chão molhado. Unidades da torre (116 = do trilho até a
// rua); "xMinYMax slice" cobre qualquer largura de tela. Nada aqui anima:
// depois do primeiro desenho sai de graça.

const W = 3600
const H = 116
const PITCH = 440 // distância entre pilares
const P0 = 214 // primeiro pilar, logo depois da barraca de lamen

type Tone = 'w' | 'a' | 'm' | 'b' | 'v' | 'g' | 'r'
const TONES: Record<Tone, string> = {
  w: '#bff8ff',
  a: '#ffbf6a',
  m: '#ff3da6',
  b: '#5aa2ff',
  v: '#b48cff',
  g: '#3dff9a',
  r: '#ff3b4c',
}

interface Shop {
  kind: 'store' | 'vend' | 'shutter'
  tone: Tone
  sign?: string
}
const SHOPS: Shop[] = [
  { kind: 'store', tone: 'w', sign: 'コンビニ 24H' },
  { kind: 'store', tone: 'b', sign: 'LAN HOUSE' },
  { kind: 'vend', tone: 'r' },
  { kind: 'store', tone: 'a', sign: 'PADARIA · パン' },
  { kind: 'store', tone: 'm', sign: 'BAR 夜' },
  { kind: 'shutter', tone: 'v' },
  { kind: 'store', tone: 'g', sign: 'IMPLANTES' },
  { kind: 'store', tone: 'v', sign: '노래방' },
]

const ART = (() => {
  const glass: Partial<Record<Tone, string>> = {}
  const neon: Partial<Record<Tone, string>> = {}
  const add = (o: Partial<Record<Tone, string>>, t: Tone, d: string) => {
    o[t] = (o[t] ?? '') + d
  }
  let dark = rect(0, 0, W, 6) + rect(0, 100, W, 16)
  let wall = ''
  let mull = ''
  let pillar = ''
  let edge = ''
  let shut = ''
  let shutLine = ''
  let vend = ''
  let screen = ''
  const signs: { x: number; tone: Tone; text: string }[] = []
  const spills: { x: number; w: number; tone: Tone }[] = []

  for (let i = 0; P0 + i * PITCH < W; i++) {
    const px = P0 + i * PITCH
    pillar += rect(px, 0, 36, H - 4)
    edge += rect(px + 32, 6, 3, H - 10)
    const x0 = px + 36
    const shop = SHOPS[i % SHOPS.length]
    const t = shop.tone
    wall += rect(x0, 6, PITCH - 36, 94)
    if (shop.kind === 'store') {
      // placa, toldo, vitrine com caixilhos e porta
      dark += rect(x0 + 96, 9, 212, 19)
      add(neon, t, rect(x0 + 96, 9, 212, 19))
      signs.push({ x: x0 + 202, tone: t, text: shop.sign ?? '' })
      dark += `M${x0 + 12} 30H${x0 + 284}L${x0 + 276} 36H${x0 + 20}Z`
      add(neon, t, `M${x0 + 12} 30H${x0 + 284}`)
      add(glass, t, rect(x0 + 20, 37, 252, 58) + rect(x0 + 294, 37, 74, 63))
      for (let k = 0; k <= 4; k++) mull += rect(x0 + 20 + k * 62, 37, 3, 58)
      mull += rect(x0 + 20, 62, 252, 2) + rect(x0 + 294, 37, 3, 63)
      mull += rect(x0 + 365, 37, 3, 63) + rect(x0 + 330, 37, 2, 63)
      // prateleiras / mesas e gente lá dentro
      for (let k = 0; k < 12; k++)
        mull += rect(x0 + 28 + k * 20, 80 + (k % 3) * 4, 12, 7)
      const who = i % 3
      mull += `M${x0 + 70 + who * 50} 95v-14c0-6 5-9 10-9s10 3 10 9v14z`
      mull += `M${x0 + 80 + who * 50} 70a6 6 0 1 0 0.1 0z`
      if (t === 'b')
        for (let k = 0; k < 8; k++)
          screen += rect(x0 + 30 + k * 30, 68 + (k % 2) * 3, 18, 11)
      spills.push({ x: x0 + 196, w: 230, tone: t })
    } else if (shop.kind === 'vend') {
      // três máquinas de bebida e um banco
      const tones: Tone[] = ['r', 'b', 'a']
      tones.forEach((vt, j) => {
        const vx = x0 + 56 + j * 96
        vend += rect(vx, 28, 76, 72)
        add(glass, vt, rect(vx + 6, 34, 64, 30))
        for (let k = 0; k < 6; k++) mull += rect(vx + 9 + k * 10, 70, 6, 4)
        mull += rect(vx + 50, 82, 16, 10)
        spills.push({ x: vx + 38, w: 90, tone: vt })
      })
      dark += rect(x0 + 340, 84, 50, 4) + rect(x0 + 344, 88, 4, 12)
      dark += rect(x0 + 382, 88, 4, 12)
    } else {
      // porta de aço baixada, pichada, com uma lâmpada só
      shut += rect(x0 + 20, 30, PITCH - 76, 70)
      for (let y = 34; y < 100; y += 5)
        shutLine += rect(x0 + 20, y, PITCH - 76, 1.4)
      add(
        neon,
        'm',
        `M${x0 + 90} 78c10-22 30-22 22 0s14 20 24-2M${x0 + 150} 66l20 22m0-22l-20 22M${x0 + 196} 84c8-16 22-16 30 0`,
      )
      add(glass, t, `M${x0 + 200} 18a5 5 0 1 0 0.1 0z`)
      spills.push({ x: x0 + 200, w: 120, tone: t })
    }
  }
  return {
    dark,
    wall,
    mull,
    pillar,
    edge,
    shut,
    shutLine,
    vend,
    screen,
    glass,
    neon,
    signs,
    spills,
  }
})()

const TONE_KEYS = Object.keys(TONES) as Tone[]

export function Shops() {
  return (
    <div className="cy-shops">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="xMinYMax slice"
        aria-hidden="true"
      >
        <defs>
          {TONE_KEYS.map((t) => (
            <radialGradient key={t} id={`cy-spill-${t}`}>
              <stop offset="0" stopColor={TONES[t]} stopOpacity="0.5" />
              <stop offset="1" stopColor={TONES[t]} stopOpacity="0" />
            </radialGradient>
          ))}
        </defs>
        <path className="cy-sh-wall" d={ART.wall} />
        {TONE_KEYS.map(
          (t) =>
            ART.glass[t] && (
              <path
                key={t}
                d={ART.glass[t]}
                fill={TONES[t]}
                fillOpacity={t === 'w' ? 0.5 : 0.36}
              />
            ),
        )}
        <path className="cy-sh-screen" d={ART.screen} />
        <path className="cy-sh-vend" d={ART.vend} />
        <path className="cy-sh-mull" d={ART.mull} />
        <path className="cy-sh-shut" d={ART.shut} />
        <path className="cy-sh-shutline" d={ART.shutLine} />
        <path className="cy-sh-dark" d={ART.dark} />
        {TONE_KEYS.map(
          (t) =>
            ART.neon[t] && (
              <path
                key={t}
                className="cy-sh-neon"
                d={ART.neon[t]}
                stroke={TONES[t]}
              />
            ),
        )}
        {ART.signs.map((s) => (
          <text
            key={s.x}
            className="cy-sh-sign"
            x={s.x}
            y={22.5}
            fill={TONES[s.tone]}
          >
            {s.text}
          </text>
        ))}
        {ART.spills.map((s) => (
          <ellipse
            key={s.x}
            cx={s.x}
            cy={106}
            rx={s.w / 2}
            ry={9}
            fill={`url(#cy-spill-${s.tone})`}
          />
        ))}
        <path className="cy-sh-pillar" d={ART.pillar} />
        <path className="cy-sh-edge" d={ART.edge} />
      </svg>
    </div>
  )
}
