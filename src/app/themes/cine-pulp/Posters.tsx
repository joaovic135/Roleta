import type { ReactNode } from 'react'
import { dot, n, oval, poly, rect, seeded, sparkle, star } from './geo'

// Cartazes pulp nas paredes laterais (ilustrações originais, títulos
// inventados), 100 x 150 cada. Formas grandes e tintas chapadas, retícula
// de impressão por cima e vinheta de papel. Cada moldura tem dois cartazes
// (frente e verso) e vira de tempos em tempos (CSS 3D).

const FONT_TITLE = 'var(--font-bungee)'
const FONT_TAG = 'var(--font-special-elite)'

// estrelas espalhadas (sorteio fixo) num só path
const starfield = (seed: number, count: number, maxY: number) => {
  const rand = seeded(seed)
  let d = ''
  for (let i = 0; i < count; i++)
    d += dot(rand() * 100, rand() * maxY, rand() < 0.2 ? 0.7 : 0.35)
  return d
}

// retícula + vinheta + vinco de papel (por cima de tudo)
function Print({ id }: { id: string }) {
  return (
    <>
      <defs>
        <pattern
          id={`cn-ht-${id}`}
          width="2.6"
          height="2.6"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(30)"
        >
          <circle cx="1.3" cy="1.3" r="0.55" fill="#000" fillOpacity="0.2" />
        </pattern>
        <radialGradient id={`cn-vg-${id}`} cx="0.5" cy="0.45" r="0.75">
          <stop offset="0.6" stopColor="#3a2410" stopOpacity="0" />
          <stop offset="1" stopColor="#3a2410" stopOpacity="0.45" />
        </radialGradient>
      </defs>
      <rect width="100" height="150" fill={`url(#cn-ht-${id})`} />
      <rect width="100" height="150" fill={`url(#cn-vg-${id})`} />
      <path
        d="M0 75.5h100"
        stroke="rgba(255, 245, 220, 0.12)"
        strokeWidth="0.6"
      />
    </>
  )
}

function Title({
  y,
  size,
  fill,
  stroke,
  children,
  fit = 92,
  font = FONT_TITLE,
}: {
  y: number
  size: number
  fill: string
  stroke?: string
  children: ReactNode
  fit?: number
  font?: string
}) {
  return (
    <text
      x="50"
      y={y}
      textAnchor="middle"
      fontSize={size}
      fill={fill}
      stroke={stroke}
      strokeWidth={stroke ? size * 0.09 : undefined}
      paintOrder="stroke"
      textLength={fit}
      lengthAdjust="spacingAndGlyphs"
      style={{ fontFamily: font }}
    >
      {children}
    </text>
  )
}

function Tag({
  children,
  fill = '#f6efd2',
}: {
  children: ReactNode
  fill?: string
}) {
  return (
    <text
      x="50"
      y="9"
      textAnchor="middle"
      fontSize="5.4"
      fill={fill}
      style={{ fontFamily: FONT_TAG, letterSpacing: '0.04em' }}
    >
      {children}
    </text>
  )
}

// ---------------------------------------------------------------- 1
const P1_CITY = (() => {
  const rand = seeded(77)
  let city = ''
  let lit = ''
  for (let x = -2; x < 102; ) {
    const w = 5 + rand() * 8
    const h = 8 + rand() * 18
    city += rect(x, 124 - h, w, h)
    for (let yy = 124 - h + 2; yy < 122; yy += 3)
      for (let xx = x + 1.2; xx < x + w - 1.5; xx += 2.4)
        if (rand() < 0.28) lit += rect(xx, yy, 1, 1.3)
    x += w + rand() * 1.5
  }
  return { city, lit }
})()
const P1_LIGHTS = Array.from({ length: 9 }, (_, i) => {
  const a = Math.PI * (0.08 + (i / 8) * 0.84)
  return dot(50 - Math.cos(a) * 27, 55.5 + Math.sin(a) * 2.2, 0.9)
}).join('')

function PosterSaucers({ id }: { id: string }) {
  return (
    <svg className="cn-poster-art" viewBox="0 0 100 150">
      <defs>
        <linearGradient id={`cn-p1s-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#06182a" />
          <stop offset="0.5" stopColor="#0d4a63" />
          <stop offset="0.74" stopColor="#3f6e69" />
          <stop offset="0.86" stopColor="#e98b2a" />
        </linearGradient>
        <linearGradient id={`cn-p1b-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff7b0" stopOpacity="0.95" />
          <stop offset="1" stopColor="#ffd23f" stopOpacity="0.12" />
        </linearGradient>
        <linearGradient id={`cn-p1d-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f2f6f8" />
          <stop offset="0.5" stopColor="#9aa8b4" />
          <stop offset="1" stopColor="#2f3a46" />
        </linearGradient>
      </defs>
      <rect width="100" height="150" fill={`url(#cn-p1s-${id})`} />
      <path d={starfield(11, 40, 90)} fill="#f6f0c8" />
      <path d={dot(80, 20, 8)} fill="#f6f0c8" />
      <path d={dot(77, 18, 1.6) + dot(83, 23, 1.1)} fill="#d8cf9e" />
      <path
        d={poly([
          [43, 58],
          [57, 58],
          [82, 124],
          [18, 124],
        ])}
        fill={`url(#cn-p1b-${id})`}
      />
      <path d={P1_CITY.city} fill="#070a12" />
      <path d={P1_CITY.lit} fill="#ffd86b" />
      {/* disco grande */}
      <path d={oval(50, 54, 30, 7)} fill={`url(#cn-p1d-${id})`} />
      <path
        d="M38 52Q38 40 50 40Q62 40 62 52Z"
        fill="#7fe8ff"
        fillOpacity="0.85"
      />
      <path
        d="M42 48Q43 43 48 42"
        stroke="#fff"
        strokeWidth="1.2"
        fill="none"
      />
      <path d={oval(50, 56.5, 18, 2.6)} fill="#28323c" />
      <path d={P1_LIGHTS} fill="#ffe36b" />
      {/* discos pequenos */}
      <path d={oval(20, 30, 9, 2.4) + oval(84, 78, 7, 2)} fill="#b9c6d0" />
      <path
        d="M16 29.5Q16 25.5 20 25.5Q24 25.5 24 29.5ZM81 77.6Q81 74.6 84 74.6Q87 74.6 87 77.6Z"
        fill="#7fe8ff"
      />
      <Tag>ELES VIERAM DO CÉU!</Tag>
      <Title y={134} size={7.5} fill="#ffd23f" stroke="#7a0d12" fit={62}>
        A NOITE DOS
      </Title>
      <Title y={146} size={10} fill="#ffd23f" stroke="#7a0d12">
        DISCOS VOADORES
      </Title>
      <Print id={`p1${id}`} />
    </svg>
  )
}

// ---------------------------------------------------------------- 2
function PosterRobot({ id }: { id: string }) {
  return (
    <svg className="cn-poster-art" viewBox="0 0 100 150">
      <defs>
        <linearGradient id={`cn-p2s-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2a0505" />
          <stop offset="0.55" stopColor="#a0221a" />
          <stop offset="0.8" stopColor="#f07a22" />
        </linearGradient>
        <linearGradient id={`cn-p2m-${id}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#5d6a76" />
          <stop offset="0.35" stopColor="#dfe6ea" />
          <stop offset="0.7" stopColor="#8d99a4" />
          <stop offset="1" stopColor="#3a434c" />
        </linearGradient>
      </defs>
      <rect width="100" height="150" fill={`url(#cn-p2s-${id})`} />
      <path d={starfield(23, 18, 50)} fill="#ffd9b0" />
      {/* planeta com anel */}
      <path d={dot(24, 28, 12)} fill="#f3c06a" />
      <path
        d="M14 22Q24 18 34 25"
        stroke="#c98a3a"
        strokeWidth="2"
        fill="none"
      />
      <path
        d={oval(24, 29, 21, 4.5)}
        fill="none"
        stroke="#ffe2a0"
        strokeWidth="1.8"
        transform="rotate(-18 24 29)"
      />
      <path d={dot(84, 16, 3.5) + dot(92, 30, 2)} fill="#ffd2a8" />
      {/* chão marciano */}
      <path
        d="M0 108L14 98L26 104L40 94L54 103L70 92L86 102L100 96V124H0Z"
        fill="#4a0d08"
      />
      <path d="M0 116L20 110L44 116L70 108L100 114V124H0Z" fill="#2a0604" />
      {/* robô */}
      <path d="M44 92h9v24h-11zM60 92h9v24h-11z" fill={`url(#cn-p2m-${id})`} />
      <path d="M39 116h15v5h-17zM58 116h15v5h-17z" fill="#2a3138" />
      <path d="M37 56h40v38h-40z" fill={`url(#cn-p2m-${id})`} />
      <path d={dot(57, 70, 6)} fill="#2a3138" />
      <path d={dot(57, 70, 3.6)} fill="#ff5a3a" />
      <path d="M41 84h32v3h-32z" fill="#2a3138" />
      <path d="M47 38h21v16h-21z" fill={`url(#cn-p2m-${id})`} />
      <path d="M57.5 38v-8" stroke="#dfe6ea" strokeWidth="1.2" />
      <path d={dot(57.5, 29, 2)} fill="#ff5a3a" />
      <path d={dot(52, 45, 2.4) + dot(63, 45, 2.4)} fill="#fff36b" />
      <path d="M50 50h15v2h-15z" fill="#2a3138" />
      {/* braço erguido com garra e braço da arma */}
      <path d="M37 60L28 48L22 36l4 -2l7 11l8 9z" fill={`url(#cn-p2m-${id})`} />
      <path d="M20 34l-4 -5l3 -1l3 4l1 -6l3 1l-2 7z" fill="#dfe6ea" />
      <path d="M77 60l8 14l-3 2l-8 -12z" fill={`url(#cn-p2m-${id})`} />
      <path d="M80 74h9v4h-9z" fill="#2a3138" />
      <path d="M89 76l4 6l-3 0l3 8l-6 -9l3 0l-3 -5z" fill="#fff36b" />
      {/* gente fugindo */}
      <path
        d="M12 118l2 -6l2 0l1 6zM12.4 110.6a1.6 1.6 0 1 0 0.1 0zM20 119l1.6 -5l1.8 0l1 5zM20.6 112.4a1.4 1.4 0 1 0 0.1 0z"
        fill="#140302"
      />
      <Tag>INVASÃO DE AÇO!</Tag>
      <Title y={139} size={16} fill="#f6efd2" stroke="#1a0606" fit={76}>
        ROBÔS
      </Title>
      <Title y={148} size={7} fill="#ffd23f" stroke="#1a0606" fit={52}>
        DE MARTE
      </Title>
      <Print id={`p2${id}`} />
    </svg>
  )
}

// ---------------------------------------------------------------- 3
const CREATURE =
  'M50 46C42 46 38 52 38 60L34 64L22 50L18 52L24 46L18 44L20 41L27 46L32 58L36 62' +
  'C33 68 32 76 32 88L30 126H70L68 88C68 76 67 68 64 62L68 58L73 46L80 41L82 44L76 46L82 52L78 50L66 64L62 60C62 52 58 46 50 46Z' +
  'M44 46L46 38L50 44L54 37L56 46Z'

function PosterSwamp({ id }: { id: string }) {
  return (
    <svg className="cn-poster-art" viewBox="0 0 100 150">
      <defs>
        <linearGradient id={`cn-p3s-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#020d08" />
          <stop offset="0.6" stopColor="#0b3a22" />
          <stop offset="0.85" stopColor="#1f7a3e" />
        </linearGradient>
        <radialGradient id={`cn-p3m-${id}`}>
          <stop offset="0.5" stopColor="#e4ffd8" />
          <stop offset="0.62" stopColor="#9dff86" stopOpacity="0.5" />
          <stop offset="1" stopColor="#4cff6a" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="100" height="150" fill={`url(#cn-p3s-${id})`} />
      <path d={dot(66, 34, 26)} fill={`url(#cn-p3m-${id})`} />
      <path d={starfield(31, 16, 40)} fill="#cfffc4" />
      <path d={CREATURE} fill="#031008" />
      <path
        d="M38 60C35 66 33 76 33 88M62 60C65 66 67 76 67 88M44 46L46 38L50 44L54 37L56 46"
        fill="none"
        stroke="#7dff5a"
        strokeWidth="0.9"
        strokeOpacity="0.8"
      />
      <path
        d={oval(45.5, 53, 2.2, 1.4) + oval(54.5, 53, 2.2, 1.4)}
        fill="#b6ff4a"
      />
      {/* água e reflexos de neon */}
      <path d="M0 104H100V126H0Z" fill="#06261a" />
      <path
        d="M4 108q6 -2 12 0t12 0M40 110q6 -2 12 0t12 0M70 107q6 -2 12 0t12 0M10 116q6 -2 12 0t12 0M56 118q6 -2 12 0t12 0"
        fill="none"
        stroke="#7dff5a"
        strokeWidth="0.9"
      />
      {/* juncos e taboas */}
      <path
        d="M6 126L8 84M10 126L13 92M90 126L88 80M94 126L92 90M84 126L83 96"
        stroke="#020a05"
        strokeWidth="1.4"
      />
      <path
        d={
          oval(8, 84, 1.6, 4.5) +
          oval(88, 80, 1.6, 4.5) +
          oval(13, 92, 1.4, 3.6)
        }
        fill="#020a05"
      />
      <Tag fill="#cfffc4">ELA BRILHA NO ESCURO!</Tag>
      <Title y={136} size={10} fill="#7dff5a" stroke="#021006" fit={74}>
        A CRIATURA
      </Title>
      <Title y={147} size={7.4} fill="#e4ffd8" stroke="#021006">
        DO BREJO DE NEON
      </Title>
      <Print id={`p3${id}`} />
    </svg>
  )
}

// ---------------------------------------------------------------- 4
const P4_RAYS = Array.from({ length: 18 }, (_, i) => {
  const a0 = (i / 18) * Math.PI * 2
  const a1 = a0 + Math.PI / 18
  return poly([
    [70, 44],
    [70 + Math.cos(a0) * 140, 44 + Math.sin(a0) * 140],
    [70 + Math.cos(a1) * 140, 44 + Math.sin(a1) * 140],
  ])
}).join('')

function PosterRocket({ id }: { id: string }) {
  return (
    <svg className="cn-poster-art" viewBox="0 0 100 150">
      <defs>
        <linearGradient id={`cn-p4f-${id}`} x1="1" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fffbe0" />
          <stop offset="0.35" stopColor="#ffd23f" />
          <stop offset="1" stopColor="#e3242b" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect width="100" height="150" fill="#f2b632" />
      <path d={P4_RAYS} fill="#f7d35c" />
      <path d={dot(70, 44, 12)} fill="#fff4c4" />
      <path d="M0 0H100V18Q50 30 0 18Z" fill="#0e5a66" />
      <path d={starfield(41, 10, 16)} fill="#fff4c4" />
      {/* rastro de fogo do foguete */}
      <path d="M38 78L4 122L14 124L46 86Z" fill={`url(#cn-p4f-${id})`} />
      {/* heroína voando (silhueta com traje vermelho) */}
      <path
        d="M40 76L48 70L62 56L70 50L74 54L66 62L56 76L48 84Z"
        fill="#c81d2e"
      />
      <path d="M56 76L62 92L58 94L50 82Z" fill="#c81d2e" />
      <path d="M48 84L44 98L40 97L42 82Z" fill="#9e1424" />
      <path d="M62 56L80 44L82 47L66 60Z" fill="#c81d2e" />
      <path d={dot(75, 48, 5.6)} fill="#1a1a24" />
      <path d="M72 42L77 36L79 43Z" fill="#1a1a24" />
      <path d={oval(77, 47, 2.6, 1.6)} fill="#7fe8ff" />
      <path d="M40 70l8 -6l6 8l-8 6z" fill="#5d6a76" />
      <path d="M41 71l6 -4.5" stroke="#dfe6ea" strokeWidth="1" />
      {/* nave ao longe */}
      <path d="M16 46l4 -10l4 10l-2 0l-2 3l-2 -3z" fill="#e3242b" />
      <path d="M19 50l1 4l1 -4z" fill="#ffd23f" />
      <path
        d={sparkle(30, 30, 3) + sparkle(88, 70, 2.5) + sparkle(10, 66, 2)}
        fill="#fffbe0"
      />
      <Tag fill="#fff4c4">MAIS RÁPIDA QUE A LUZ!</Tag>
      <Title y={135} size={9} fill="#c81d2e" stroke="#fff4c4" fit={66}>
        A MULHER-
      </Title>
      <Title y={148} size={13} fill="#c81d2e" stroke="#fff4c4" fit={86}>
        FOGUETE
      </Title>
      <Print id={`p4${id}`} />
    </svg>
  )
}

// ---------------------------------------------------------------- 5
const RAIN = (() => {
  const rand = seeded(91)
  let d = ''
  for (let i = 0; i < 46; i++) {
    const x = rand() * 110 - 5
    const y = rand() * 120
    d += `M${n(x)} ${n(y)}l-2 7`
  }
  return d
})()

function PosterNoir({ id }: { id: string }) {
  return (
    <svg className="cn-poster-art" viewBox="0 0 100 150">
      <defs>
        <linearGradient id={`cn-p5l-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff2c0" stopOpacity="0.85" />
          <stop offset="1" stopColor="#ffe9a8" stopOpacity="0.08" />
        </linearGradient>
      </defs>
      <rect width="100" height="150" fill="#0b1020" />
      <path d="M0 0H100V124H0Z" fill="#131b33" />
      <path
        d={poly([
          [68, 34],
          [76, 34],
          [96, 118],
          [40, 118],
        ])}
        fill={`url(#cn-p5l-${id})`}
      />
      <path d={RAIN} stroke="#9fb4d8" strokeWidth="0.5" strokeOpacity="0.6" />
      {/* poste */}
      <path d="M78 34V124h2V34z" fill="#05070d" />
      <path d="M64 30h18l-3 5h-12z" fill="#05070d" />
      <path d={oval(72, 35, 5, 1.6)} fill="#fff6d0" />
      {/* detetive de capa e chapéu */}
      <path
        d="M58 120L60 92Q60 84 63 82L64 78Q61 74 63 70Q66 66 70 70Q72 74 69 78L70 82Q74 84 74 92L76 120Z"
        fill="#05070d"
      />
      <path d={oval(66.5, 69.5, 7, 1.6)} fill="#05070d" />
      <path d="M62 69.5L63.5 64Q66.5 63 69.5 64L71 69.5Z" fill="#05070d" />
      <path d="M58 120h18" stroke="#05070d" strokeWidth="2" />
      <path d={oval(67, 122, 16, 2.2)} fill="#ffe9a8" fillOpacity="0.25" />
      <path d="M0 124H100V150H0Z" fill="#06080f" />
      <Tag fill="#cfd8ea">UM CRIME. UMA NOITE.</Tag>
      <Title
        y={139}
        size={15}
        fill="#e3242b"
        fit={84}
        font="var(--font-abril-fatface)"
      >
        SOMBRAS
      </Title>
      <Title
        y={148}
        size={7}
        fill="#f6efd2"
        fit={44}
        font="var(--font-abril-fatface)"
      >
        NA CHUVA
      </Title>
      <Print id={`p5${id}`} />
    </svg>
  )
}

// ---------------------------------------------------------------- tabela
const PRICES: [string, string][] = [
  ['PIPOCA', '2,00'],
  ['REFRIGERANTE', '1,50'],
  ['CACHORRO-QUENTE', '3,00'],
  ['BALAS E CHICLETES', '0,50'],
  ['INGRESSO', '5,00'],
]

function PriceBoard() {
  return (
    <svg className="cn-poster-art" viewBox="0 0 100 150">
      <rect width="100" height="150" fill="#161214" />
      <path
        d={Array.from({ length: 22 }, (_, i) =>
          rect(4, 26 + i * 5, 92, 0.5),
        ).join('')}
        fill="#2a2326"
      />
      <path d={star(50, 12, 5)} fill="#e3b55a" />
      <text
        x="50"
        y="27"
        textAnchor="middle"
        fontSize="11"
        fill="#f3cf7a"
        style={{ fontFamily: 'var(--font-limelight)' }}
      >
        Bombonière
      </text>
      {PRICES.map(([item, price], i) => (
        <g
          key={item}
          style={{ fontFamily: 'var(--font-bebas-neue)' }}
          fontSize="8.2"
          fill="#f4ecdc"
        >
          <text x="7" y={46 + i * 17}>
            {item}
          </text>
          <text x="93" y={46 + i * 17} textAnchor="end" fill="#ffd56b">
            Cr$ {price}
          </text>
          <path
            d={`M7 ${49 + i * 17}h86`}
            stroke="#4a3d42"
            strokeWidth="0.5"
            strokeDasharray="1 1.4"
          />
        </g>
      ))}
      <text
        x="50"
        y="140"
        textAnchor="middle"
        fontSize="5.4"
        fill="#b89c8a"
        style={{ fontFamily: FONT_TAG }}
      >
        PROIBIDO FUMAR NA SALA
      </text>
    </svg>
  )
}

export const POSTERS = {
  saucers: PosterSaucers,
  robot: PosterRobot,
  swamp: PosterSwamp,
  rocket: PosterRocket,
  noir: PosterNoir,
  prices: PriceBoard,
}
export type PosterId = keyof typeof POSTERS

// moldura de vitrine com lâmpadas; com `back` o cartaz vira (frente/verso)
export function PosterCase({
  front,
  back,
  id,
  className,
}: {
  front: PosterId
  back?: PosterId
  id: string
  className: string
}) {
  const Front = POSTERS[front]
  const Back = back ? POSTERS[back] : null
  return (
    <div className={`cn-case ${className}`}>
      <i className="cn-case-glow" />
      <div className="cn-case-frame">
        <div className={Back ? 'cn-card cn-card-flip' : 'cn-card'}>
          <div className="cn-card-face">
            <Front id={id + 'f'} />
          </div>
          {Back && (
            <div className="cn-card-face cn-card-back">
              <Back id={id + 'b'} />
            </div>
          )}
        </div>
        <i className="cn-case-glass" />
      </div>
      <i className="cn-case-bulbs cn-case-b0" />
      <i className="cn-case-bulbs cn-case-b1" />
    </div>
  )
}
