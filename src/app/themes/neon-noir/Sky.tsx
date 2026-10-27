import { CLOUDS, PLANET, SKYLINE, STARS, WIRES } from './art'
import { Px } from './px'

// Céu e fundo do beco (camada central, em unidades da tela): estrelas em
// pixel, planeta anelado gigante, nuvens rosa à deriva, raio, estrela
// cadente, carro voador e o trem do céu, os arranha-céus do fim do beco,
// fios atravessando e o letreiro do salão de jogos pendurado no alto, que
// vira "大当たり JACKPOT" quando a roleta para no vencedor.

export function Sky() {
  return (
    <>
      <div className="nn-horizon" />
      <div className="nn-starfield">
        <svg
          className="nn-stars"
          viewBox="0 0 1000 320"
          preserveAspectRatio="xMidYMin slice"
          aria-hidden="true"
        >
          <path d={STARS.dim} fill="#b9a6ff" opacity="0.55" />
        </svg>
        <svg
          className="nn-stars nn-stars-a"
          viewBox="0 0 1000 320"
          preserveAspectRatio="xMidYMin slice"
          aria-hidden="true"
        >
          <path d={STARS.a} fill="#fff" />
          <path d={STARS.sparkA} fill="#ffc2ec" />
        </svg>
        <svg
          className="nn-stars nn-stars-b"
          viewBox="0 0 1000 320"
          preserveAspectRatio="xMidYMin slice"
          aria-hidden="true"
        >
          <path d={STARS.b} fill="#d6fdff" />
          <path d={STARS.sparkB} fill="#a6f6ff" />
        </svg>
        <i className="nn-meteor nn-meteor-1" />
        <i className="nn-meteor nn-meteor-2" />
      </div>

      <div className="nn-planet">
        <i className="nn-planet-halo" />
        <Px s={PLANET} />
      </div>

      <div className="nn-clouds nn-clouds-back">
        <Px s={CLOUDS[2]} className="nn-cloud nn-cloud-1" />
        <Px s={CLOUDS[3]} className="nn-cloud nn-cloud-2" />
      </div>
      <div className="nn-storm" />
      <svg className="nn-bolt" viewBox="0 0 60 200" aria-hidden="true">
        <path
          d="M34 0L22 60 36 64 14 130 28 132 8 200 46 112 30 110 52 52 38 50 50 0Z"
          fill="#f4e8ff"
        />
      </svg>

      <div className="nn-far">
        <Px s={SKYLINE} className="nn-skyline" />
        <div className="nn-spire">
          <i className="nn-spire-beacon" />
        </div>
      </div>
      <div className="nn-clouds nn-clouds-front">
        <Px s={CLOUDS[0]} className="nn-cloud nn-cloud-3" />
        <Px s={CLOUDS[1]} className="nn-cloud nn-cloud-4" />
      </div>

      <div className="nn-train">
        <i />
      </div>
      <div className="nn-car" />

      <svg
        className="nn-wires"
        viewBox="0 0 1778 1000"
        preserveAspectRatio="xMidYMin slice"
        aria-hidden="true"
      >
        <path d={WIRES} stroke="#05020c" strokeWidth="2.4" fill="none" />
      </svg>

      <div className="nn-jackpot">
        <span className="nn-jp-idle">
          <b>夜光</b> ARCADE <b>★</b> 24H
        </span>
        <span className="nn-jp-spin">▶ SPIN ◀</span>
        <span className="nn-jp-win">
          <b>大当たり</b> JACKPOT
        </span>
      </div>
    </>
  )
}

// Rua molhada: chão em perspectiva com reflexos e brilho trêmulo
export function Street() {
  return (
    <>
      <svg
        className="nn-floor"
        viewBox="0 0 1778 1000"
        preserveAspectRatio="xMidYMax slice"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="nn-floor-g" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#1a0b36" />
            <stop offset="0.5" stopColor="#0d0620" />
            <stop offset="1" stopColor="#07030f" />
          </linearGradient>
        </defs>
        <path d="M0 930L889 500 1778 930V1000H0Z" fill="url(#nn-floor-g)" />
        {/* juntas do calçamento em perspectiva */}
        <path
          d="M889 500L0 1000M889 500L444 1000M889 500L889 1000M889 500L1334 1000M889 500L1778 1000M300 1000H1478M640 760H1138M740 680H1038"
          stroke="#2a1656"
          strokeWidth="1.4"
          fill="none"
        />
      </svg>
      <div className="nn-puddles" />
      <div className="nn-wet" />
    </>
  )
}
