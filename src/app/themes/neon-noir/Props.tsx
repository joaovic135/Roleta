import { CAT_A, CAT_B, COIN, INVADER_A, INVADER_B, SHIP } from './art'
import { at, atR } from './lib'
import { PosterArt, PosterBlink } from './Poster'
import { Px } from './px'

// Adereços do beco: fliperama, TV de tubo com um joguinho de navinha,
// walkman, máquina de bebidas, bueiro soltando vapor, o gato que atravessa
// a rua e o pôster luminoso de anime.

// Fliperama: gabinete em SVG; letreiro, tela e botões são HTML por cima
export function Arcade() {
  return (
    <div className="nn-arcade" style={at(10, 676, 128, 290)}>
      <svg viewBox="0 0 128 290" aria-hidden="true" preserveAspectRatio="none">
        <defs>
          <linearGradient id="nn-cab" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#2a0f52" />
            <stop offset="0.5" stopColor="#1a0938" />
            <stop offset="1" stopColor="#0d0520" />
          </linearGradient>
        </defs>
        {/* corpo, laterais com arte (raios rosa/ciano) */}
        <path
          d="M8 6H120L124 120 116 150 122 284H6L12 150 4 120Z"
          fill="url(#nn-cab)"
        />
        <path
          d="M8 6H120L124 120 116 150 122 284H6L12 150 4 120Z"
          fill="none"
          stroke="#ff3fd0"
          strokeWidth="2"
        />
        <path
          d="M6 200L40 170 30 206 70 176M122 230L94 204 102 236 64 210"
          stroke="#5ff3ff"
          strokeWidth="2"
          fill="none"
        />
        {/* moldura da tela e painel de controle */}
        <path d="M16 46H112V128H16Z" fill="#05020c" />
        <path
          d="M4 150H124L120 172H8Z"
          fill="#311462"
          stroke="#5ff3ff"
          strokeWidth="1.5"
        />
        <path
          d="M30 154v-10"
          stroke="#d6fdff"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <circle cx="30" cy="142" r="5" fill="#ff3fd0" />
        <path d="M44 270h40v8H44z" fill="#05020c" />
        <path d="M54 252h20v10H54z" fill="#ff9a4f" opacity="0.8" />
      </svg>
      <div className="nn-arcade-marquee">
        <b>未来ゲーム</b>
      </div>
      <div className="nn-arcade-screen">
        <Px s={COIN} className="nn-arcade-coin" />
        <span className="nn-arcade-insert">INSERT COIN</span>
        <span className="nn-arcade-win">大当たり</span>
      </div>
      <i className="nn-arcade-btn nn-arcade-btn-a" />
      <i className="nn-arcade-btn nn-arcade-btn-b" />
    </div>
  )
}

// TV de tubo com um shmup em pixel art e o walkman em cima
export function Crt() {
  return (
    <div className="nn-crt" style={at(150, 818, 118, 112)}>
      <div className="nn-crt-screen">
        <div className="nn-crt-stars" />
        <div className="nn-crt-inv">
          <Px s={INVADER_A} />
          <Px s={INVADER_B} />
          <Px s={INVADER_A} />
        </div>
        <i className="nn-crt-shot" />
        <Px s={SHIP} className="nn-crt-ship" />
        <span className="nn-crt-hud">1UP 04200</span>
        <span className="nn-crt-msg nn-crt-spin">SPIN!!</span>
        <span className="nn-crt-msg nn-crt-win">★WIN★</span>
        <i className="nn-crt-roll" />
      </div>
      <i className="nn-crt-knob" />
      <i className="nn-crt-knob nn-crt-knob-2" />
      <div className="nn-walkman">
        <i className="nn-reel" />
        <i className="nn-reel nn-reel-2" />
      </div>
      <i className="nn-phones" />
    </div>
  )
}

// bueiro com vapor (três baforadas defasadas)
export function Steam() {
  return (
    <div className="nn-steam" style={at(186, 936, 90, 60)}>
      <i className="nn-manhole" />
      <i className="nn-puff nn-puff-1" />
      <i className="nn-puff nn-puff-2" />
      <i className="nn-puff nn-puff-3" />
    </div>
  )
}

// máquina de bebidas (lado direito, embaixo)
export function Vending() {
  return (
    <div className="nn-vend" style={atR(14, 700, 104, 250)}>
      <div className="nn-vend-face">
        <span className="nn-vend-tag">ドリンク</span>
        <div className="nn-vend-cans" />
        <div className="nn-vend-cans nn-vend-cans-2" />
        <i className="nn-vend-slot" />
      </div>
      <i className="nn-vend-glow" />
    </div>
  )
}

export function Poster() {
  return (
    <div className="nn-poster" style={atR(12, 300, 156, 268)}>
      <div className="nn-poster-glass">
        <PosterArt />
        <PosterBlink />
        <span className="nn-poster-title">夜間飛行</span>
        <span className="nn-poster-band">SIGNAL // 199X</span>
        <i className="nn-poster-scan" />
        <i className="nn-poster-sweep" />
        <i className="nn-poster-glitch" />
      </div>
    </div>
  )
}

// gato que atravessa a rua (dois quadros de passo) com o reflexo embaixo
export function Cat() {
  return (
    <div className="nn-cat">
      <div className="nn-cat-body">
        <Px s={CAT_A} className="nn-cat-a" />
        <Px s={CAT_B} className="nn-cat-b" />
      </div>
      <div className="nn-cat-body nn-cat-refl">
        <Px s={CAT_A} className="nn-cat-a" />
        <Px s={CAT_B} className="nn-cat-b" />
      </div>
    </div>
  )
}
