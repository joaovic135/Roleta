import { burst, circ, focusLines, gear } from './geo'

// A história da página (uma por ciclo, ver theme.css): legendas amarelas
// de narrador, balões de fala nas janelas das margens e o ataque do
// Dr. Engrenagem (vilão original): o dirigível dele cruza o cabeçalho com
// um holofote, dois quadros de detalhe se desenham nas margens (lápis azul
// → nanquim → cor), a teia acerta o dirigível (THWIP! POW!) e ele foge
// soltando fumaça.

// ---------------------------------------------------------- legendas
const CAPTIONS = [
  'ENQUANTO ISSO, NO FIM DA TARDE...',
  'MAIS TARDE, NAQUELA NOITE...',
  'DE REPENTE... O DR. ENGRENAGEM ATACA!',
  'UMA TEMPESTADE SE APROXIMA...',
  'NA MANHÃ SEGUINTE...',
]
// balões nas janelas (margens; só aparecem em telas largas)
const BALLOONS = [
  { text: 'FINALMENTE, SEXTA-FEIRA!', side: 'l' },
  { text: 'PEGA LADRÃO!', side: 'l' },
  { text: 'OLHA LÁ! É A TEIA RUBRA!', side: 'r' },
  { text: 'GIRA LOGO ESSA ROLETA!', side: 'r' },
  { text: 'QUE TEMPORAL!', side: 'l' },
  { text: 'BOM DIA, CIDADE!', side: 'r' },
]

export function Narration() {
  return (
    <>
      {CAPTIONS.map((text, i) => (
        <div key={i} className={`hq-cap hq-cap-${i + 1} hq-cyc`}>
          {text}
        </div>
      ))}
      {BALLOONS.map(({ text, side }, i) => (
        <div key={i} className={`hq-bal hq-bal-${side} hq-bal-${i + 1} hq-cyc`}>
          {text}
        </div>
      ))}
    </>
  )
}

// ---------------------------------------------------------- dirigível
const ZEP_GEAR = gear(128, 33, 14, 10)
const POW = burst(21, 100, 60, 92, 54, 14)
const PUFFS = circ(30, 30, 14) + circ(52, 22, 11) + circ(70, 34, 9)

export function Zeppelin() {
  return (
    <>
      <div className="hq-zep hq-cyc">
        <div className="hq-zep-beam hq-cyc">
          <i />
        </div>
        <svg className="hq-zep-art" viewBox="0 0 260 110">
          <path
            d="M214 40L250 12L257 17L238 46ZM214 52L250 80L257 75L238 46Z"
            fill="#6b2fa0"
            stroke="#05060c"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          <ellipse
            cx="128"
            cy="46"
            rx="112"
            ry="34"
            fill="#3d4660"
            stroke="#05060c"
            strokeWidth="3"
          />
          <path d="M16 46A112 34 0 0 0 240 46Z" fill="url(#hq-ht)" />
          <path
            d="M70 15Q60 46 70 77M110 12.5Q102 46 110 79.5M150 12.5Q158 46 150 79.5M190 15Q200 46 190 77"
            fill="none"
            stroke="#05060c"
            strokeOpacity="0.6"
            strokeWidth="1.6"
          />
          <path
            d="M44 24Q92 9 172 13"
            fill="none"
            stroke="#93a8e0"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path
            d="M58 52h140v17h-140z"
            fill="#140d1c"
            stroke="#05060c"
            strokeWidth="2"
          />
          <text className="hq-zep-led" x="128" y="65">
            A ROLETA SERÁ MINHA!
          </text>
          <path d={ZEP_GEAR} fill="#9be15d" stroke="#05060c" strokeWidth="2" />
          <circle
            cx="128"
            cy="33"
            r="4.5"
            fill="#3d4660"
            stroke="#05060c"
            strokeWidth="1.6"
          />
          <circle cx="30" cy="42" r="15" fill="url(#hq-redglow)" />
          <circle
            cx="30"
            cy="42"
            r="6"
            fill="#ff3b3b"
            stroke="#05060c"
            strokeWidth="2"
          />
          <path
            d="M112 78L118 71M144 78L138 71"
            stroke="#05060c"
            strokeWidth="2"
          />
          <path
            d="M100 78h56v12q0 7-7 7h-42q-7 0-7-7z"
            fill="#262b38"
            stroke="#05060c"
            strokeWidth="2.5"
          />
          <path
            d="M106 83h9v6h-9zM121 83h9v6h-9zM136 83h9v6h-9z"
            fill="#ffd84a"
          />
          <path
            d="M122 97h12v6h-12z"
            fill="#9aa3b8"
            stroke="#05060c"
            strokeWidth="1.5"
          />
        </svg>
        <svg className="hq-zep-smoke hq-cyc" viewBox="0 0 90 50">
          <path d={PUFFS} fill="#59607a" stroke="#05060c" strokeWidth="2.5" />
        </svg>
        <div className="hq-shout hq-cyc">HA-HA-HA!</div>
      </div>
      {/* a teia vem de fora do quadro (o herói está à esquerda) */}
      <div className="hq-zep-web">
        <i className="hq-cyc" />
        <span className="hq-sfx hq-thwip-zep hq-cyc">THWIP!</span>
      </div>
      <div className="hq-pow hq-cyc">
        <svg viewBox="0 0 200 120">
          <path d={POW} transform="translate(7 7)" fill="#05060c" />
          <path
            d={POW}
            fill="#ffe14d"
            stroke="#05060c"
            strokeWidth="4"
            strokeLinejoin="round"
          />
          <text x="100" y="76">
            POW!
          </text>
        </svg>
      </div>
    </>
  )
}

// ---------------------------------------------------------- quadros
// Cunhas de fundo (linhas de foco atrás do rosto)
const HERO_RAYS = focusLines(61, 26, 0, 0, 3, 5, 220)
const VILLAIN_RAYS = focusLines(67, 26, 0, 0, 3, 5, 220)

// contornos (o mesmo desenho vira lápis azul e depois nanquim)
const HERO_LINE =
  'M75 54C110 54 127 84 125 122C124 148 114 170 101 186L49 186C36 170 26 148 25 122C23 84 40 54 75 54Z' +
  'M75 78C98 78 108 98 107 124C106 148 93 168 75 168C57 168 44 148 43 124C42 98 52 78 75 78Z' +
  'M2 250C6 214 26 199 52 192L56 186M94 186L98 192C124 199 144 214 148 250' +
  'M44 186C62 200 88 200 106 186L110 201C90 215 60 215 40 201Z' +
  'M102 196C120 194 134 182 148 162L150 180C136 198 120 208 104 208' +
  'M6 6h100v20h-100z'
const VILLAIN_LINE =
  gear(75, 104, 64, 12) +
  'M75 62C103 62 116 86 115 116C114 146 98 170 75 170C52 170 36 146 35 116C34 86 47 62 75 62Z' +
  'M2 250C6 212 30 197 54 191L75 206L96 191C120 197 144 212 148 250' +
  'M48 76C60 60 90 60 102 76L98 90C86 80 64 80 52 90Z' +
  'M60 157C66 175 84 175 90 157Z' +
  'M50 152C58 141 69 143 75 148C81 143 92 141 100 152C91 149 83 153 75 155C67 153 59 149 50 152Z' +
  'M75 124L69 142Q74 145 80 142' +
  'M53 121a7 4.5 0 1 0 14 0a7 4.5 0 1 0 -14 0' +
  'M6 6h100v20h-100z'

export function InsetDefs() {
  return (
    <>
      <path id="hq-ih-line" d={HERO_LINE} />
      <path id="hq-iv-line" d={VILLAIN_LINE} />
    </>
  )
}

function Pencil({ href }: { href: string }) {
  return (
    <svg className="hq-ins-pencil hq-cyc" viewBox="0 0 150 250">
      <use href={href} transform="translate(1.6 -1.2)" />
      <path
        d={'M75 50V200M24 122H126' + circ(75, 120, 52) + 'M3 3h144v244h-144z'}
      />
    </svg>
  )
}

export function HeroInset() {
  return (
    <div className="hq-inset hq-inset-l hq-cyc">
      <div className="hq-ins-box">
        <svg className="hq-ins-color hq-cyc" viewBox="0 0 150 250">
          <path d="M0 0h150v250h-150z" fill="#c62a35" />
          <path d={HERO_RAYS} transform="translate(75 122)" fill="#e2474e" />
          <path d="M0 0h150v250h-150z" fill="url(#hq-ht)" />
          <circle cx="60" cy="128" r="30" fill="url(#hq-eyeglow)" />
          <circle cx="90" cy="128" r="30" fill="url(#hq-eyeglow)" />
          <path
            d="M2 250C6 214 26 199 52 192L62 180L88 180L98 192C124 199 144 214 148 250Z"
            fill="#1b2350"
          />
          <path
            d="M120 204C134 212 143 226 146 250L138 250C136 232 130 218 120 204Z"
            fill="#3f63d8"
          />
          <path
            d="M75 196V250M40 204L54 250M110 204L96 250M18 234Q75 220 132 234"
            fill="none"
            stroke="#a52234"
            strokeWidth="1.4"
          />
          {/* capuz de tecido com luz de contorno e o rosto na sombra */}
          <path
            d="M75 54C110 54 127 84 125 122C124 148 114 170 101 186L49 186C36 170 26 148 25 122C23 84 40 54 75 54Z"
            fill="#1d2658"
          />
          <path
            d="M106 66C120 80 127 100 125 122C124 146 115 168 102 184L97 182C109 166 117 146 118 122C119 100 114 80 106 66Z"
            fill="#3f63d8"
          />
          <path
            d="M75 54V78M58 58Q48 66 44 80"
            fill="none"
            stroke="#a52234"
            strokeWidth="1.6"
          />
          <path
            d="M75 78C98 78 108 98 107 124C106 148 93 168 75 168C57 168 44 148 43 124C42 98 52 78 75 78Z"
            fill="#0e1330"
          />
          <path
            d="M44 186C62 200 88 200 106 186L110 201C90 215 60 215 40 201Z"
            fill="#e23636"
          />
          <path
            d="M102 196C120 194 134 182 148 162L150 180C136 198 120 208 104 208Z"
            fill="#e23636"
          />
          <path
            d="M105 201C119 200 131 191 143 177L145 186C133 199 119 206 107 206Z"
            fill="#9c1b26"
          />
          <path d="M6 6h100v20h-100z" fill="#ffe14d" />
          <text className="hq-ins-cap" x="56" y="21">
            ALGO ESTÁ ERRADO...
          </text>
        </svg>
        <Pencil href="#hq-ih-line" />
        <svg className="hq-ins-ink hq-cyc" viewBox="0 0 150 250">
          <use href="#hq-ih-line" />
          <path
            className="hq-ins-alert"
            d="M17 96q-8 13 0 28M8 88q-11 20 0 44M133 96q8 13 0 28M142 88q11 20 0 44"
          />
          <path className="hq-ins-frame" d="M0 0h150v250h-150z" />
        </svg>
        <svg className="hq-ins-eyes hq-cyc" viewBox="0 0 150 250">
          <path
            d="M48 112L70 121L66 139C56 138 49 128 48 112ZM102 112L80 121L84 139C94 138 101 128 102 112Z"
            fill="#eafcff"
            stroke="#05060c"
            strokeWidth="3.2"
            strokeLinejoin="round"
          />
          <path
            d="M53 119L63 123.5M97 119L87 123.5"
            stroke="#ffffff"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </div>
      <div className="hq-bal hq-bal-ins hq-cyc">NÃO NESTA PÁGINA, DOUTOR!</div>
    </div>
  )
}

export function VillainInset() {
  return (
    <div className="hq-inset hq-inset-r hq-cyc">
      <div className="hq-ins-box">
        <svg className="hq-ins-color hq-cyc" viewBox="0 0 150 250">
          <path d="M0 0h150v250h-150z" fill="#2b7a49" />
          <path d={VILLAIN_RAYS} transform="translate(75 112)" fill="#3e9b60" />
          <path d="M0 0h150v250h-150z" fill="url(#hq-ht)" />
          <path d={gear(75, 104, 64, 12)} fill="#454d62" />
          <circle cx="75" cy="104" r="42" fill="#353c4e" />
          <path
            d="M2 250C6 212 30 197 54 191L75 206L96 191C120 197 144 212 148 250Z"
            fill="#eef0f6"
          />
          <path
            d="M2 250C6 212 30 197 54 191L60 197C40 206 26 222 22 250Z"
            fill="url(#hq-ht)"
          />
          <path d="M62 196L75 236L88 196L75 206Z" fill="#2a2f3d" />
          <path
            d="M75 62C103 62 116 86 115 116C114 146 98 170 75 170C52 170 36 146 35 116C34 86 47 62 75 62Z"
            fill="#f0c9a0"
          />
          <path
            d="M44 90C38 104 37 124 42 142C48 158 60 168 75 170C60 160 50 144 48 124C47 110 48 98 44 90Z"
            fill="#d9a77c"
          />
          <path
            d="M48 76C60 60 90 60 102 76L98 90C86 80 64 80 52 90Z"
            fill="#8d96ab"
          />
          <path
            d={
              circ(56, 80, 1.8) +
              circ(67, 71, 1.8) +
              circ(83, 71, 1.8) +
              circ(94, 80, 1.8)
            }
            fill="#4b5266"
          />
          <path d="M53 121a7 4.5 0 1 0 14 0a7 4.5 0 1 0 -14 0" fill="#ffffff" />
          <circle cx="62" cy="121" r="2.4" fill="#05060c" />
          <circle cx="90" cy="120" r="24" fill="url(#hq-redglow)" />
          <path d="M75 124L69 142Q74 145 80 142Z" fill="#d9a77c" />
          <path
            d="M50 152C58 141 69 143 75 148C81 143 92 141 100 152C91 149 83 153 75 155C67 153 59 149 50 152Z"
            fill="#3a2a22"
          />
          <path d="M60 157C66 175 84 175 90 157Z" fill="#5a0f18" />
          <path d="M62 158h26v4h-26z" fill="#ffffff" />
          <path d="M6 6h100v20h-100z" fill="#ffe14d" />
          <text className="hq-ins-cap" x="56" y="21">
            DR. ENGRENAGEM
          </text>
        </svg>
        <Pencil href="#hq-iv-line" />
        <svg className="hq-ins-ink hq-cyc" viewBox="0 0 150 250">
          <use href="#hq-iv-line" />
          <path
            className="hq-ins-solid"
            d="M45 104L70 112L68 117L44 109ZM105 104L80 112L82 117L106 109Z"
          />
          <circle
            cx="90"
            cy="120"
            r="9.5"
            fill="#ff3b3b"
            stroke="#05060c"
            strokeWidth="3"
          />
          <path
            d="M86 115.5l3 2"
            stroke="#ffffff"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          <path className="hq-ins-thin" d="M99 124Q112 150 104 192" />
          <path className="hq-ins-frame" d="M0 0h150v250h-150z" />
        </svg>
        <svg className="hq-ins-glint hq-cyc" viewBox="0 0 150 250">
          <path
            d="M94 104Q94 116 106 116Q94 116 94 128Q94 116 82 116Q94 116 94 104Z"
            fill="#ffffff"
            stroke="#05060c"
            strokeWidth="1.2"
          />
        </svg>
      </div>
      <div className="hq-bal hq-bal-ins hq-cyc">
        TREMA, CIDADE! A ROLETA SERÁ MINHA!
      </div>
    </div>
  )
}
