import { box, dot } from './util'

// Dentro do café (primeiro plano): luminária pendente, xícara fumegando,
// walkman com fones e a gata da casa dormindo no balcão da janela.

// luminária de esmalte verde-água com lâmpada incandescente
export function Lamp() {
  return (
    <div className="cp-lamp">
      <span className="cp-lamp-bloom" />
      <svg viewBox="0 0 100 90" aria-hidden="true">
        <path d="M50 0V34" stroke="#0b0710" strokeWidth="1.6" />
        <path d={box(46, 29, 8, 7)} fill="#2a1c14" />
        <path
          d="M50 35C37 35 29 44 25 59H75C71 44 63 35 50 35Z"
          fill="#17565a"
        />
        <path
          d="M50 35C44 35 39 39 35 46C40 41 45 39 50 39Z"
          fill="#7fd6cc"
          opacity="0.55"
        />
        <path
          d="M66 41C70 46 73 52 75 59H71C69 52 67 46 66 41Z"
          fill="#ff6fb5"
          opacity="0.5"
        />
        <ellipse cx="50" cy="59" rx="25" ry="4" fill="#ffd79a" />
        <ellipse
          cx="50"
          cy="62"
          rx="9"
          ry="7"
          fill="#fff3cf"
          filter="url(#cp-bloom-s)"
        />
        <ellipse cx="50" cy="62" rx="6.5" ry="5.5" fill="#fffaf0" />
      </svg>
      {/* mariposa rodando a lâmpada: a órbita (achatada em elipse pelo
          pai parado) gira e a mariposa bate as asas e muda de raio */}
      <span className="cp-moth-path">
        <span className="cp-moth-orbit">
          <span className="cp-moth" />
        </span>
      </span>
    </div>
  )
}

// nome do café em folha de ouro pintado no vidro: visto de dentro fica ao
// contrário (o CSS espelha o <svg> inteiro)
export function Decal() {
  const sparkle = (x: number, y: number, r: number) =>
    `M${x} ${y - r}L${x + r * 0.22} ${y - r * 0.22}L${x + r} ${y}L${x + r * 0.22} ${y + r * 0.22}L${x} ${y + r}L${x - r * 0.22} ${y + r * 0.22}L${x - r} ${y}L${x - r * 0.22} ${y - r * 0.22}Z`
  return (
    <svg className="cp-decal" viewBox="0 0 360 100" aria-hidden="true">
      <defs>
        <linearGradient id="cp-gold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff5d2" />
          <stop offset="0.46" stopColor="#f2c46a" />
          <stop offset="0.54" stopColor="#c58a35" />
          <stop offset="1" stopColor="#ffe2a0" />
        </linearGradient>
        <path id="cp-decal-arc" d="M62 62Q180 -8 298 62" />
      </defs>
      <text className="cp-decal-arc">
        <textPath href="#cp-decal-arc" startOffset="50%">
          COFFEE · RECORDS · JAZZ
        </textPath>
      </text>
      <text className="cp-decal-name" x="164" y="80" textAnchor="end">
        喫茶
      </text>
      <text className="cp-decal-name" x="196" y="80">
        月光
      </text>
      {/* lua crescente entre as palavras e filetes dourados */}
      <path
        className="cp-decal-ink"
        d={
          'M179.7 58A10 10 0 1 0 189.1 72.2A8.5 8.5 0 0 1 179.7 58Z' +
          sparkle(76, 74, 7) +
          sparkle(284, 74, 7) +
          sparkle(93, 58, 3.4) +
          sparkle(267, 58, 3.4)
        }
      />
      <path
        className="cp-decal-line"
        d="M112 91H146M214 91H248M104 86H160M200 86H256"
      />
      <text className="cp-decal-est" x="180" y="96">
        since 1984
      </text>
    </svg>
  )
}

// xícara de porcelana com faixa rosa, pires e colher
export function Cup() {
  return (
    <div className="cp-cup">
      <svg viewBox="0 0 100 80" aria-hidden="true">
        <defs>
          <linearGradient id="cp-porcelain" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#fff1dc" />
            <stop offset="0.45" stopColor="#d9d0e4" />
            <stop offset="0.8" stopColor="#8f84a8" />
            <stop offset="1" stopColor="#ff8fc8" />
          </linearGradient>
        </defs>
        <ellipse cx="48" cy="75" rx="40" ry="5" fill="#05020a" opacity="0.6" />
        <ellipse cx="48" cy="71" rx="40" ry="7" fill="#d8cfe2" />
        <ellipse cx="48" cy="70" rx="30" ry="4.4" fill="#b7aac8" />
        <path
          d="M70 68L93 63"
          stroke="#c9c2d8"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
        <path
          d="M71 42Q85 41 83 51Q81 60 69 60"
          stroke="#d9d0e4"
          strokeWidth="5"
          fill="none"
        />
        <path
          d="M24 36L28 64Q30 70 48 70Q66 70 68 64L72 36Z"
          fill="url(#cp-porcelain)"
        />
        <path
          d="M25.4 46Q48 52 70.6 46L70.2 49.4Q48 55 25.8 49.4Z"
          fill="#ff5fa8"
        />
        <ellipse cx="48" cy="36" rx="24" ry="6" fill="#f6f1fa" />
        <ellipse cx="48" cy="37" rx="21" ry="4.6" fill="#3b1d10" />
        <path
          d="M33 37Q40 34.4 50 34.6"
          stroke="#d29a5a"
          strokeWidth="1.4"
          fill="none"
        />
        <path
          d="M70 38L68 62"
          stroke="#ff9fd2"
          strokeWidth="1.4"
          opacity="0.8"
        />
      </svg>
    </div>
  )
}

// walkman azul com fita (os rolos giram quando a roleta gira) e fones
export function Walkman() {
  return (
    <div className="cp-walkman">
      <svg viewBox="0 0 120 50" aria-hidden="true">
        {/* fones de espuma laranja, largados ao lado */}
        <path
          d="M84 44Q100 12 116 44"
          stroke="#2b2a3c"
          strokeWidth="2.6"
          fill="none"
        />
        <path d={dot(84, 43, 7) + dot(116, 43, 7)} fill="#ff8a3d" />
        <path d={dot(84, 43, 3.4) + dot(116, 43, 3.4)} fill="#c95a22" />
        <rect x="6" y="4" width="70" height="44" rx="5" fill="#33508f" />
        <rect x="6" y="4" width="70" height="7" rx="3" fill="#b9c6e0" />
        <path
          d={box(12, 1.6, 10, 3) + box(26, 1.6, 8, 3) + box(38, 1.6, 8, 3)}
          fill="#ff8a3d"
        />
        <rect x="12" y="14" width="58" height="28" rx="3" fill="#0d1022" />
        {/* fita: etiqueta em faixas de pôr do sol */}
        <rect x="16" y="17" width="50" height="22" rx="2" fill="#efe7f6" />
        <path d={box(16, 17, 50, 3)} fill="#ff4f9e" />
        <path d={box(16, 20, 50, 3)} fill="#ff9a5a" />
        <path d={box(16, 23, 50, 2)} fill="#ffd36e" />
        <rect x="24" y="27" width="34" height="10" rx="5" fill="#241c2c" />
        <path d={dot(30, 32, 4.2) + dot(52, 32, 4.2)} fill="#f4f0fa" />
        <path d="M8 46H74" stroke="#ff8fd0" strokeWidth="1" opacity="0.6" />
        <path d="M76 8V44" stroke="#ffd6a0" strokeWidth="1" opacity="0.4" />
      </svg>
      <span className="cp-reel cp-reel-a" />
      <span className="cp-reel cp-reel-b" />
      <span className="cp-led" />
      {/* a música vaza dos fones: notinhas subindo (mais ao girar) */}
      <span className="cp-note cp-note-1">♪</span>
      <span className="cp-note cp-note-2">♫</span>
      <span className="cp-note cp-note-3">♪</span>
      <span className="cp-notes-fast">
        <span className="cp-note cp-note-4">♫</span>
        <span className="cp-note cp-note-5">♪</span>
      </span>
    </div>
  )
}

// gata preta de meias brancas, enrolada; cabeça em 3 poses que trocam por
// opacidade (dormindo / alerta ao girar / olhando os fogos)
export function Cat() {
  return (
    <div className="cp-cat">
      <div className="cp-cat-breath">
        <svg className="cp-cat-body" viewBox="0 0 140 86" aria-hidden="true">
          <path
            d="M28 84Q14 84 18 70Q24 46 62 41Q102 37 120 60Q130 74 120 84Z"
            fill="#110a1b"
          />
          <path
            d="M42 50Q70 36 106 46Q118 51 124 64"
            stroke="#ff5fb0"
            strokeWidth="2.2"
            fill="none"
            opacity="0.75"
          />
          <path
            d="M22 70Q26 56 40 50"
            stroke="#ffb46a"
            strokeWidth="1.6"
            fill="none"
            opacity="0.5"
          />
          <path d={dot(46, 82, 5) + dot(60, 83, 5)} fill="#f1e8f5" />
        </svg>
        <div className="cp-cat-tail">
          <svg viewBox="0 0 90 30" aria-hidden="true">
            <path
              d="M88 20Q60 30 30 26Q10 24 6 12Q5 6 10 6"
              stroke="#110a1b"
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
            />
            <path
              d="M80 15Q56 22 30 20"
              stroke="#ff5fb0"
              strokeWidth="1.2"
              fill="none"
              opacity="0.5"
            />
          </svg>
        </div>
        <div className="cp-cat-head cp-cat-sleep">
          <svg viewBox="0 0 50 44" aria-hidden="true">
            <path
              d="M8 40Q4 22 14 14L12 2L22 10Q28 8 34 10L42 3L41 15Q48 24 44 40Z"
              fill="#110a1b"
            />
            <path
              d="M15 26Q19 28 22 26M30 26Q33 28 37 26"
              stroke="#ffc2e0"
              strokeWidth="1.2"
              fill="none"
              opacity="0.7"
            />
            <path d="M25 31L26.6 33L28 31Z" fill="#ff9fc4" />
            <path
              d="M14 14L12 2L22 10"
              stroke="#ff5fb0"
              strokeWidth="1"
              fill="none"
              opacity="0.6"
            />
          </svg>
          <div className="cp-cat-ear">
            <svg viewBox="0 0 12 14" aria-hidden="true">
              <path d="M1 13L9 1L11 13Z" fill="#110a1b" />
              <path
                d="M2 13L9 1"
                stroke="#ff5fb0"
                strokeWidth="0.8"
                opacity="0.6"
              />
            </svg>
          </div>
        </div>
        <div className="cp-cat-head cp-cat-alert">
          <svg viewBox="0 0 50 44" aria-hidden="true">
            <path
              d="M8 40Q4 20 14 12L11 0L22 8Q28 6 34 8L44 0L41 12Q49 22 44 40Z"
              fill="#110a1b"
            />
            <path
              d="M12 0L22 8M44 0L34 8"
              stroke="#ff5fb0"
              strokeWidth="1"
              opacity="0.6"
            />
            <ellipse cx="18" cy="23" rx="4.4" ry="3.6" fill="#d8ff6a" />
            <ellipse cx="34" cy="23" rx="4.4" ry="3.6" fill="#d8ff6a" />
            <path
              d={box(17.4, 20, 1.2, 6) + box(33.4, 20, 1.2, 6)}
              fill="#140a10"
            />
            <path d="M25 29L26.6 31L28 29Z" fill="#ff9fc4" />
          </svg>
        </div>
        <div className="cp-cat-head cp-cat-up">
          <svg viewBox="0 0 50 44" aria-hidden="true">
            <path
              d="M8 42Q2 26 10 14L6 2L18 8Q26 4 34 6L42 -2L42 12Q50 22 44 42Z"
              fill="#110a1b"
            />
            <ellipse className="cp-cat-eye" cx="17" cy="19" rx="4.6" ry="4" />
            <ellipse className="cp-cat-eye" cx="33" cy="17" rx="4.6" ry="4" />
            <path d={dot(16, 18, 1.8) + dot(32, 16, 1.8)} fill="#120810" />
            <path d="M24 26L26 28L28 26Z" fill="#ff9fc4" />
          </svg>
        </div>
      </div>
      {/* roncos de gata (somem quando ela acorda) */}
      <span className="cp-zzz">
        <span className="cp-zz">z</span>
        <span className="cp-zz cp-zz-2">z</span>
      </span>
    </div>
  )
}

// 相合傘 desenhado com o dedo no vidro embaçado (nomes inventados)
export function Doodle() {
  const lines =
    'M45 6C41 0 33 4 38 10L45 16L52 10C57 4 49 0 45 6Z' +
    'M45 18L12 52H78ZM45 18V92Q45 98 39 96'
  return (
    <svg className="cp-doodle" viewBox="0 0 90 100" aria-hidden="true">
      <g fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path
          d={lines}
          stroke="#0c0618"
          strokeOpacity="0.55"
          strokeWidth="3.4"
        />
        <path
          d={lines}
          stroke="#ffd1ea"
          strokeOpacity="0.28"
          strokeWidth="1"
          transform="translate(-0.8 -0.8)"
        />
        <path
          d="M12 52V60M78 52V57M45 92V99M30 36V41"
          stroke="#0c0618"
          strokeOpacity="0.45"
          strokeWidth="1.6"
        />
      </g>
      <text
        className="cp-jp cp-doodle-txt"
        x="30"
        y="58"
        fontSize="12"
        style={{ writingMode: 'vertical-rl' }}
      >
        ハル
      </text>
      <text
        className="cp-jp cp-doodle-txt"
        x="60"
        y="58"
        fontSize="12"
        style={{ writingMode: 'vertical-rl' }}
      >
        ユキ
      </text>
    </svg>
  )
}
