import { n } from './lib'

// Pôster luminoso de anime dos anos 90 (arte original): garota de jaqueta
// esportiva retrô segurando um teclado mecânico, sol listrado rosa atrás.
// O <svg> é estático; por cima ficam as pálpebras (outro <svg> que só muda
// de opacidade para ela piscar), as linhas de varredura, o reflexo que
// passa no vidro e as faixas do glitch, todos animando o elemento inteiro.

// teclas do teclado: 4 fileiras de 13 + barra de espaço
const KEYS = (() => {
  let base = ''
  let pink = ''
  let cyan = ''
  for (let row = 0; row < 4; row++)
    for (let col = 0; col < 13; col++) {
      const x = 41 + col * 11.4 + (row % 2) * 2.4
      const y = 219 + row * 10.6
      if (row === 3 && col > 3 && col < 10) continue
      const d = `M${n(x)} ${n(y)}h9.6v8.8h-9.6z`
      if ((row === 0 && col === 0) || (row === 2 && col === 12)) pink += d
      else if ((row === 1 && col === 12) || (row === 3 && col === 12)) cyan += d
      else base += d
    }
  base += 'M89.6 250.8h66v8.8h-66z'
  return { base, pink, cyan }
})()

// um olho: branco, íris em degradê, pupila, brilhos e cílios
const Eye = ({ x, y, k = 1 }: { x: number; y: number; k?: number }) => (
  <g transform={`translate(${x} ${y}) scale(${k} 1)`}>
    <ellipse rx="6.6" ry="7.6" fill="#fff" />
    <ellipse cy="0.6" rx="5" ry="7" fill="url(#nn-iris)" />
    <ellipse cy="1.2" rx="2.3" ry="3.4" fill="#140a30" />
    <circle cx="-2" cy="-2.6" r="1.9" fill="#fff" />
    <circle cx="2.1" cy="3.4" r="0.9" fill="#fff" />
    <path
      d="M-8.5-4.5Q0-12 8.6-4.6L9.6-6.6 8.4-2.4Q0-9.2-7.6-2.6Z"
      fill="#140a30"
    />
    <path
      d="M-6 7.6Q0 9.4 6 7.4"
      stroke="#7a3f6c"
      strokeWidth="0.8"
      fill="none"
    />
  </g>
)

export function PosterArt() {
  return (
    <svg
      className="nn-poster-art"
      viewBox="0 0 200 300"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="nn-p-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#24104f" />
          <stop offset="0.48" stopColor="#7b2394" />
          <stop offset="0.8" stopColor="#ff4f9a" />
          <stop offset="1" stopColor="#ff9a8a" />
        </linearGradient>
        <linearGradient id="nn-p-sun" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff1fb" />
          <stop offset="0.5" stopColor="#ff8ccb" />
          <stop offset="1" stopColor="#ff4f86" />
        </linearGradient>
        <linearGradient id="nn-iris" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2a1670" />
          <stop offset="0.55" stopColor="#6a3cff" />
          <stop offset="1" stopColor="#5ff3ff" />
        </linearGradient>
        <linearGradient id="nn-p-hair" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#24407e" />
          <stop offset="1" stopColor="#0e1638" />
        </linearGradient>
      </defs>

      {/* fundo: céu do pôr do sol, sol listrado e grade no chão */}
      <rect width="200" height="300" fill="url(#nn-p-sky)" />
      <circle cx="122" cy="112" r="66" fill="url(#nn-p-sun)" />
      <path
        d="M50 128h150v3H50zM50 141h150v4H50zM50 155h150v5H50zM50 170h150v6H50z"
        fill="#9a2a8f"
      />
      <path
        d="M0 236H200M0 252H200M0 272H200M100 228L-40 300M100 228L20 300M100 228L100 300M100 228L180 300M100 228L240 300"
        stroke="#5ff3ff"
        strokeOpacity="0.5"
        strokeWidth="1"
      />
      {/* estrelinhas */}
      <path
        d="M24 30l1.5 4 4 1.5-4 1.5-1.5 4-1.5-4-4-1.5 4-1.5zM176 22l1 3 3 1-3 1-1 3-1-3-3-1 3-1zM40 76l1 2.6 2.6 1-2.6 1-1 2.6-1-2.6-2.6-1 2.6-1z"
        fill="#fff"
      />

      {/* cabelo de trás, ao vento */}
      <path
        d="M76 74C70 40 100 20 126 24C156 28 170 56 164 92C170 120 182 150 198 178L184 180C178 168 172 160 166 154C168 172 170 190 174 206L150 196 150 150 84 150C80 170 74 186 64 198C68 172 70 152 72 134C70 116 74 96 76 74Z"
        fill="url(#nn-p-hair)"
      />
      <path
        d="M158 86C164 116 176 144 190 170M152 120C158 150 162 176 168 198M80 110C78 140 74 166 70 186"
        stroke="#3fd0e8"
        strokeWidth="1.6"
        fill="none"
        strokeLinecap="round"
      />

      {/* pescoço e rosto */}
      <path d="M110 118L111 150H133L131 116Z" fill="#e7a596" />
      <path d="M111 130Q122 140 132 128V138Q122 146 111 140Z" fill="#c9837a" />
      <path
        d="M90 72C88 98 94 118 108 128C114 132 120 132 126 127C137 117 143 100 143 76Z"
        fill="#ffdccb"
      />
      <ellipse cx="143" cy="98" rx="5" ry="8" fill="#f6bfae" />
      <path
        d="M141 94Q145 98 142 104"
        stroke="#d98a80"
        strokeWidth="1"
        fill="none"
      />

      {/* olhos, sobrancelhas, nariz, boca e blush */}
      <Eye x={104} y={96} />
      <Eye x={130} y={95} k={0.88} />
      <path
        d="M95 81Q103 76 112 79M124 78Q131 75 139 78"
        stroke="#1c2f63"
        strokeWidth="1.7"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M118 103L115.6 109H118.8"
        stroke="#d98a80"
        strokeWidth="1"
        fill="none"
      />
      <path
        d="M110 116Q116 120 121 115Q116 118.5 110 116Z"
        fill="#c4505e"
        stroke="#b8505c"
        strokeWidth="0.8"
      />
      <ellipse
        cx="99"
        cy="108"
        rx="5.5"
        ry="2.2"
        fill="#ff6fa3"
        opacity="0.5"
      />
      <ellipse cx="134" cy="107" rx="4.5" ry="2" fill="#ff6fa3" opacity="0.5" />

      {/* franja e mechas da frente */}
      <path
        d="M84 84C80 50 104 32 128 34C152 36 162 58 155 94L149 76 145 92 138 68 131 88 124 62 116 86 110 64 102 88 97 70 91 94Z"
        fill="url(#nn-p-hair)"
      />
      <path
        d="M88 76C83 100 85 126 92 148L99 143C94 122 94 100 97 82ZM152 80C158 104 158 130 151 152L145 148C149 128 149 104 147 86Z"
        fill="url(#nn-p-hair)"
      />
      <path
        d="M104 42Q118 36 134 42M98 52Q106 46 114 46"
        stroke="#5fdcf0"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />

      {/* jaqueta esportiva: roxo, ombros ciano, faixa rosa, gola branca */}
      <path
        d="M56 300L59 196C61 170 80 154 108 148H136C164 154 183 172 185 198L188 300Z"
        fill="#5b2bd6"
      />
      <path
        d="M59 196C61 170 80 154 108 148H136C164 154 183 172 185 198L177 206 122 190 67 206Z"
        fill="#3fe0ff"
      />
      <path d="M63 214L122 198 181 214V227L122 211 63 227Z" fill="#ff4fb4" />
      <path
        d="M65 206L122 190 179 206"
        stroke="#fff"
        strokeWidth="2.4"
        fill="none"
      />
      <path
        d="M103 146L110 163 122 169 134 163 141 146 134 139 122 151 110 139Z"
        fill="#f4f0ff"
        stroke="#b6a8ff"
        strokeWidth="1"
      />
      <path d="M122 169V300" stroke="#d8d0ff" strokeWidth="1.6" />
      <path d="M120 172h4v9h-4z" fill="#ff4fb4" />

      {/* braços e o teclado mecânico (com luz RGB por baixo) */}
      <path
        d="M59 198C46 220 39 240 37 258L61 264C63 246 69 232 76 218Z"
        fill="#5b2bd6"
      />
      <path d="M48 222L71 230M44 236L66 244" stroke="#3fe0ff" strokeWidth="3" />
      <path
        d="M185 196C192 204 196 210 194 216L170 218C170 210 170 205 166 200Z"
        fill="#5b2bd6"
      />
      <g transform="rotate(-14 112 238)">
        <rect
          x="34"
          y="262"
          width="158"
          height="6"
          rx="3"
          fill="#5ff3ff"
          opacity="0.55"
        />
        <rect
          x="35"
          y="213"
          width="158"
          height="52"
          rx="5"
          fill="#241a4c"
          stroke="#ff4fc8"
          strokeWidth="1.6"
        />
        <path d={KEYS.base} fill="#ece6ff" />
        <path d={KEYS.pink} fill="#ff4fb4" />
        <path d={KEYS.cyan} fill="#3fe0ff" />
        <path d="M37 266h154" stroke="#140a30" strokeWidth="1" />
      </g>
      <path
        d="M37 252C31 262 35 276 46 277C57 278 63 270 60 259Z"
        fill="#ffdccb"
        stroke="#d98a80"
        strokeWidth="0.8"
      />
      <path
        d="M42 262L52 264M41 268L52 270"
        stroke="#d98a80"
        strokeWidth="0.8"
      />
      <path
        d="M171 203C180 196 194 201 193 213C192 223 180 224 172 217Z"
        fill="#ffdccb"
        stroke="#d98a80"
        strokeWidth="0.8"
      />
    </svg>
  )
}

// pálpebras fechadas (o <svg> inteiro pisca)
export function PosterBlink() {
  return (
    <svg
      className="nn-poster-blink"
      viewBox="0 0 200 300"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <path d="M95 88h19v16h-19zM122 87h17v16h-17z" fill="#ffdccb" />
      <path
        d="M95.5 96Q104 101 113 95M122.5 95Q130 100 138 94"
        stroke="#140a30"
        strokeWidth="1.8"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  )
}
