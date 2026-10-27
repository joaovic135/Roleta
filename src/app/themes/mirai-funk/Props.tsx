import type { CSSProperties } from 'react'
import {
  BURST_A,
  BURST_B,
  EQ_COLS,
  FLOCK_A,
  FLOCK_B,
  TOWER,
  TOWER_H,
  TOWER_W,
} from './geometry'

// Peças da margem direita e atores do céu.
// - Torre da rádio MIRAI FM: a fachada é um equalizador (cada coluna de
//   janelas é uma barra que sobe e desce aos saltos, de linha em linha),
//   letreiro vertical ラジオ em neon que acende ao entardecer, farol no
//   mastro e lâmpada ON AIR que acende enquanto a roleta gira.
// - Toca-discos: um LP meio para fora da tela girando devagar; na troca de
//   lado (SIDE A ↔ SIDE B) o braço levanta, o disco vira em 3D e o braço
//   desce de novo. Girando a roleta, entra um disco borrado bem rápido.
// - Gaivotas em V (dois bandos, batida de asa em quadros), carro voador
//   raro com rastro de luz e fogos chapados.

const v = (name: string, value: number) =>
  ({ [`--mf-${name}`]: value }) as CSSProperties

export function RadioTower() {
  return (
    <div className="mf-tower">
      <i className="mf-tower-glow" />
      <svg
        className="mf-tower-body"
        viewBox={`0 0 ${TOWER_W} ${TOWER_H}`}
        shapeRendering="crispEdges"
      >
        <path className="mf-tower-black" d={TOWER.body} />
        <path className="mf-tower-dim" d={TOWER.dim} />
        <path className="mf-tower-lobby" d={TOWER.lobby} />
      </svg>
      <div className="mf-eq">
        {Array.from({ length: EQ_COLS }, (_, c) => (
          <i key={c} className="mf-eq-col" style={v('c', c)}>
            <b />
          </i>
        ))}
      </div>
      <b className="mf-tower-sign">FM 88.6</b>
      <b className="mf-onair">ON AIR</b>
      <span className="mf-neon">
        <i className="mf-neon-halo" />
        <b>ラジオ</b>
      </span>
      <i className="mf-beacon" />
    </div>
  )
}

export function RecordDeck() {
  return (
    <div className="mf-deck">
      <div className="mf-record">
        <div className="mf-disc">
          <div className="mf-side mf-side-a">
            <span className="mf-label">
              <b>未来</b>
              <i>SIDE A · 33⅓</i>
            </span>
          </div>
          <div className="mf-side mf-side-b">
            <span className="mf-label">
              <b>ファンク</b>
              <i>SIDE B · 33⅓</i>
            </span>
          </div>
        </div>
        <i className="mf-sheen" />
        <i className="mf-sheen mf-sheen-b" />
      </div>
      <div className="mf-disc-blur" />
      <svg className="mf-arm" viewBox="0 0 200 200">
        <circle className="mf-arm-base" cx="186" cy="10" r="13" />
        <path
          className="mf-arm-rod"
          d="M186 10L58 72"
          fill="none"
          strokeLinecap="round"
        />
        <path className="mf-arm-head" d="M60 64l-16 7 5 11 16-7z" />
      </svg>
    </div>
  )
}

export function Birds() {
  return (
    <div className="mf-birds">
      <div className="mf-flock">
        <svg className="mf-flap" viewBox="0 0 440 80">
          <path d={FLOCK_A} />
        </svg>
      </div>
      <div className="mf-flock mf-flock-b">
        <svg className="mf-flap" viewBox="0 0 440 80">
          <path d={FLOCK_B} />
        </svg>
      </div>
    </div>
  )
}

// carro voador retrofuturista: silhueta preta, cabine clara, luz de baixo
// e um rastro longo de exposição
export function FlyingCar() {
  return (
    <div className="mf-car mf-cyc">
      <i className="mf-car-trail" />
      <svg viewBox="0 0 160 44">
        <ellipse className="mf-car-under" cx="84" cy="36" rx="58" ry="5" />
        <path
          className="mf-car-body"
          d="M18 25Q30 12 62 10L96 10Q116 11 130 19L152 23Q156 30 142 32L26 32Q12 31 18 25Z"
        />
        <path className="mf-car-glass" d="M60 12Q73 3 92 5Q103 7 108 12Z" />
        <path className="mf-car-light" d="M146 24h8v3h-8z" />
      </svg>
    </div>
  )
}

// halo chapado em dois degraus (dois círculos translúcidos sobrepostos)
const HALO =
  'M4 100a96 96 0 1 0 192 0a96 96 0 1 0-192 0M38 100a62 62 0 1 0 124 0a62 62 0 1 0-124 0'

export function Fireworks({ win = false }: { win?: boolean }) {
  const cls = win ? 'mf-fw mf-fw-win' : 'mf-fw mf-cyc'
  const bursts = win ? [BURST_A, BURST_B] : [BURST_A, BURST_B, BURST_A]
  return (
    <>
      {bursts.map((d, i) => (
        <svg key={i} className={`${cls} mf-fw-${i + 1}`} viewBox="0 0 200 200">
          <path className="mf-fw-halo" d={HALO} />
          <path d={d} />
        </svg>
      ))}
    </>
  )
}
