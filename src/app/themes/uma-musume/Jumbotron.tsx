import type { CSSProperties } from 'react'
import { circle, heart, ruffle, sparkle, star } from './geo'
import { Sheet } from './Runners'
import { RUNNERS } from './sprites'

// Telão do hipódromo (CSS 3D), pendurado por cabos no alto da tela, no meio
// da faixa livre entre o título e o volume. A tela é um prisma de 3 faces
// que gira em rotateX a cada 11 s (perspectiva no pai):
//   A) RANKING: pódio da temporada com as cores das corredoras;
//   B) AO VIVO: câmera seguindo a líder (de dia) ou o Winning Live com três
//      idols dançando (à noite, troca junto com o ciclo do céu);
//   C) GRANDE PRÊMIO ESTRELA DOCE / Winning Live hoje à noite.
// Por cima da tela (planos, opacidade): "GIRANDO!" enquanto a roleta gira
// e "1º LUGAR!" na cor da fatia vencedora; uma roseta desce ao lado.
// O telão é fonte de luz: halo atrás dele e lâmpadas na moldura à noite.

const vars = (o: Record<string, string | number>) => o as CSSProperties

// moldura com lâmpadas (viewBox 440×100; tela em x 18–422, y 27–81)
const BULBS = (() => {
  let d = ''
  for (let x = 24; x <= 416; x += 16) d += circle(x, 18, 2.6)
  for (let x = 24; x <= 416; x += 16) d += circle(x, 90, 2.6)
  return d
})()

const TOP3 = [0, 2, 4]

export default function Jumbotron() {
  return (
    <div className="um-jumbo" aria-hidden="true">
      <div className="um-jumbo-glow" />
      <div className="um-jumbo-sway">
        <svg className="um-jumbo-rig" viewBox="0 0 440 100">
          <path className="um-j-cable" d="M60 -40L80 12M380 -40L360 12" />
          <path
            className="um-j-frame"
            d="M14 12h412a10 10 0 0 1 10 10v64a10 10 0 0 1 -10 10H14a10 10 0 0 1 -10 -10V22a10 10 0 0 1 10 -10z"
          />
          <path className="um-j-frame-in" d="M16 24h408v60H16z" />
          <path className="um-j-bulb" d={BULBS} />
          {/* coroa com estrela e ferradura em cima do telão */}
          <path className="um-j-crown" d="M188 12q32 -22 64 0z" />
          <path className="um-j-star" d={star(220, 6, 5.5, 2.5)} />
          <path
            className="um-j-heart"
            d={heart(200, 8, 2.6) + heart(240, 8, 2.6)}
          />
        </svg>
        <div className="um-jumbo-lit" />
        <div className="um-jumbo-screen">
          <div className="um-prism">
            <div className="um-face um-face-a">
              <span className="um-j-tag">RANKING ★ G1</span>
              <ol className="um-j-rank">
                {TOP3.map((k, i) => (
                  <li key={k} style={vars({ '--um-c': RUNNERS[k].silk })}>
                    <em>{i + 1}º</em>
                    <i />
                    {RUNNERS[k].short}
                  </li>
                ))}
              </ol>
            </div>
            <div className="um-face um-face-b">
              <div className="um-live-day">
                <div className="um-live-rail" />
                <div
                  className="um-live-runner"
                  style={vars({
                    '--um-hair': RUNNERS[0].hair,
                    '--um-silk': RUNNERS[0].silk,
                    '--um-acc': RUNNERS[0].acc,
                  })}
                >
                  <div className="um-r-win">
                    <div className="um-r-row">
                      <Sheet />
                    </div>
                  </div>
                </div>
                <div
                  className="um-live-runner um-live-runner-2"
                  style={vars({
                    '--um-hair': RUNNERS[2].hair,
                    '--um-silk': RUNNERS[2].silk,
                    '--um-acc': RUNNERS[2].acc,
                  })}
                >
                  <div className="um-r-win">
                    <div className="um-r-row">
                      <Sheet />
                    </div>
                  </div>
                </div>
              </div>
              <div className="um-live-night">
                {[1, 0, 3].map((k, i) => (
                  <div
                    key={k}
                    className={`um-idol um-idol-${i}`}
                    style={vars({
                      '--um-hair': RUNNERS[k].hair,
                      '--um-silk': RUNNERS[k].silk,
                      '--um-acc': RUNNERS[k].acc,
                    })}
                  >
                    <Sheet idol />
                  </div>
                ))}
              </div>
              <span className="um-j-live">● AO VIVO</span>
            </div>
            <div className="um-face um-face-c">
              <svg className="um-j-logo" viewBox="0 0 40 40">
                <path
                  className="um-j-shoe"
                  d="M7 6h8v14a5 5 0 0 0 10 0V6h8v14a13 13 0 0 1 -26 0z"
                />
                <path className="um-j-star" d={star(20, 21, 7, 3)} />
              </svg>
              <span className="um-j-title">
                GRANDE PRÊMIO
                <b>ESTRELA DOCE</b>
              </span>
              <span className="um-j-note">♪ WINNING LIVE HOJE À NOITE</span>
            </div>
          </div>
        </div>
        <div className="um-jumbo-dots" />
        {/* reações da roleta (só opacidade/transform) */}
        <div className="um-over um-over-spin">
          <span className="um-over-chev">»»»</span>
          <b>GIRANDO!</b>
          <span className="um-over-chev um-over-chev-r">«««</span>
        </div>
        <div className="um-over um-over-won">
          <svg className="um-over-spark" viewBox="0 0 400 70">
            <path
              d={
                sparkle(40, 20, 9) +
                sparkle(362, 48, 8) +
                sparkle(80, 54, 5) +
                sparkle(322, 16, 6)
              }
            />
          </svg>
          <b>
            1<small>º</small> LUGAR!
          </b>
        </div>
      </div>
      <div className="um-rosette">
        <svg viewBox="0 0 80 120">
          <path className="um-ro-tail" d="M28 54L14 116L26 108L34 118L40 60z" />
          <path className="um-ro-tail" d="M52 54L66 116L54 108L46 118L40 60z" />
          <path className="um-ro-ruffle" d={ruffle(40, 40, 37, 31, 18)} />
          <path className="um-ro-ring" d={circle(40, 40, 26)} />
          <path className="um-ro-core" d={circle(40, 40, 20)} />
          <text className="um-ro-text" x="40" y="47">
            1º
          </text>
        </svg>
      </div>
    </div>
  )
}
