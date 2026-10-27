'use client'

import { useRef } from 'react'
import { useSceneLoop } from '../_kit/loop'
import { createWheelEnergy } from '../_kit/wheel'
import Board from './Board'
import {
  Ashtray,
  Compass,
  Dossier,
  Lamp,
  Legend,
  Mug,
  Phone,
  Radar,
  Stamp,
  Teletype,
} from './Props'

// Cena de fundo do tema Hearts of Iron (só aparece com data-theme=
// "hearts-of-iron"): a mesa da sala de guerra vista de cima, inclinada em
// perspectiva CSS 3D (rotateX), como a câmera de um jogo de estratégia.
//
// Camadas (de baixo para cima):
// - tabuleiro (Board.tsx): carta pintada de um continente inventado — a
//   República de Kessária (vermelho) cercando a Liga de Vandrel (azul) — com
//   relevo, baía do Mar de Ferro, rios, matas, ferrovia e cidades. Por cima,
//   as peças vivas: 13 províncias que trocam de dono uma a uma (borrão de
//   lápis + hachura + nova linha de frente), 5 setas de ofensiva desenhadas
//   trecho a trecho, blocos de madeira deslizando, alfinetes pulsando, um
//   rodo de plotagem que entra pela borda e empurra um bloco, comboio e navio;
// - luz: luminária pendente (fora da tela) com poça de luz quente; o pêndulo
//   é física de verdade em JS (abaixo): balança à toa, entra em ressonância
//   quando a roleta gira e amortece sozinho quando ela para;
// - objetos nas margens (Props.tsx, telas ≥ 1700 px): abajur de banqueiro
//   com cúpula esmeralda, dossiê, caneca, cinzeiro com fumaça, bússola e
//   compasso, legenda, teletipo imprimindo despachos, telefone e radar;
// - ciclo do dia pela janela (fora da tela, à direita) e clima;
// - por cima de tudo, o que emite luz: luzes das cidades, clarões de combate,
//   cúpula do abajur, radar, brasa do cigarro, lâmpada do teletipo.
//
// Escalas de tempo (theme.css):
// - segundos: radar (6 s), teletipo (uma linha a cada 3,5 s), fumaça,
//   tremulação das lâmpadas, alfinetes, bússola;
// - dezenas de segundos: rodo (60 s), aviões passando (52 s, de dia), blocos;
// - minutos: a guerra (200 s: pinça vermelha fecha o cerco de Velmora,
//   província por província; à noite os azuis rompem o cerco) e o dia
//   (240 s: amanhecer com neblina, sol pela persiana, entardecer, noite com
//   chuva, holofotes e relâmpagos). Como 200 ≠ 240, a combinação só se
//   repete a cada 20 minutos.
//
// Roleta (data-wheel no <html>): girando, a sirene gira luz vermelha pela
// sala, o telefone toca, o teletipo dispara, o radar acelera, a luminária
// balança e a frente acende em combate; na vitória um carimbo "VITÓRIA" bate
// na cor vencedora (--win-color) sobre o dossiê (ou no topo, em telas
// menores), a mesa treme, a frente avança acesa e tudo assenta numa brasa
// calma enquanto o modal estiver aberto.

const SWING_PERIOD = 2.6

// relógio do teatro: 05:00 → 04:00, uma volta por ciclo do dia (CSS)
const HOURS = Array.from(
  { length: 24 },
  (_, i) => `${String((i + 5) % 24).padStart(2, '0')}:00`,
)

export default function HeartsOfIronScene() {
  const swing = useRef<HTMLDivElement>(null)
  const energy = useRef(createWheelEnergy())
  const pend = useRef({ a: 0, v: 0, win: 0, shown: 0 })

  // Pêndulo amortecido: brisa leve sempre, empurrão ressonante enquanto a
  // roleta gira e um coice quando o carimbo bate. Nada de estado React por
  // quadro: só o transform de um <div> (com will-change).
  useSceneLoop(
    (t, dt) => {
      const el = swing.current
      if (!el) return
      const { spin, win } = energy.current(dt)
      const p = pend.current
      const h = Math.min(dt, 100) / 1000
      const w = (2 * Math.PI) / SWING_PERIOD
      const sec = t / 1000
      const force = 0.35 * Math.sin(sec * 0.83) + 2.6 * spin * Math.sin(sec * w)
      if (win > p.win + 0.5) p.v += 6
      p.win = win
      p.v += (-w * w * p.a - 0.42 * p.v + force) * h
      p.a += p.v * h
      if (Math.abs(p.a - p.shown) > 0.002) {
        p.shown = p.a
        el.style.transform = `rotate(${p.a.toFixed(3)}deg)`
      }
    },
    { fps: 30 },
  )

  return (
    <div className="hoi-cam">
      <Board />

      {/* luminária pendente: escuridão da noite com o "furo" da poça de
          luz e o brilho quente, juntos no mesmo pêndulo */}
      <div className="hoi-swing" ref={swing}>
        <div className="hoi-dark" />
        <div className="hoi-pool" />
      </div>

      {/* objetos da mesa */}
      <div className="hoi-props">
        <Dossier />
        <Mug />
        <Ashtray />
        <Compass />
        <Legend />
        <Teletype />
        <Phone />
      </div>
      <div className="hoi-fx hoi-dark2" />

      {/* dia: sol quente, persiana, entardecer, neblina, aviões, poeira */}
      <div className="hoi-fx hoi-sun" />
      <svg
        className="hoi-blinds"
        viewBox="0 0 1000 1000"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="hoi-sunfall" x1="1" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="rgba(255,226,160,0)" />
            <stop offset="0.25" stopColor="rgba(255,224,156,0.55)" />
            <stop offset="0.6" stopColor="rgba(255,210,140,0.32)" />
            <stop offset="1" stopColor="rgba(255,200,130,0)" />
          </linearGradient>
          <filter id="hoi-blur8" x="-10%" y="-10%" width="120%" height="120%">
            <feGaussianBlur stdDeviation="6" />
          </filter>
        </defs>
        <path
          fill="url(#hoi-sunfall)"
          filter="url(#hoi-blur8)"
          d={Array.from({ length: 11 }, (_, i) => {
            const y = 40 + i * 78
            return `M1000 ${y}L1000 ${y + 50}L0 ${y + 330}L0 ${y + 280}Z`
          }).join('')}
        />
      </svg>
      <div className="hoi-fx hoi-dusk" />
      <div className="hoi-fx hoi-fog" />
      <div className="hoi-dayonly">
        <div className="hoi-planes">
          <svg viewBox="0 0 260 120" aria-hidden="true">
            <defs>
              <filter
                id="hoi-pblur"
                x="-20%"
                y="-20%"
                width="140%"
                height="140%"
              >
                <feGaussianBlur stdDeviation="2.2" />
              </filter>
            </defs>
            <g filter="url(#hoi-pblur)" className="hoi-plane-shadow">
              {[
                [40, 30],
                [120, 64],
                [200, 34],
              ].map(([x, y]) => (
                <path
                  key={x}
                  d={`M${x} ${y - 22}l3 14l26 4v5l-26 3l-2 14l8 3v3l-11 -1l-11 1v-3l8 -3l-2 -14l-26 -3v-5l26 -4z`}
                  transform={`rotate(-90 ${x} ${y})`}
                />
              ))}
            </g>
          </svg>
        </div>
        <span className="hoi-mote" />
        <span className="hoi-mote" />
        <span className="hoi-mote" />
        <span className="hoi-mote" />
      </div>

      {/* noite: luar pela persiana com gotas, chuva, holofotes, relâmpagos */}
      <div className="hoi-nightonly">
        <div className="hoi-moon" />
        <div className="hoi-rain" />
        <div className="hoi-search">
          <span />
          <span />
        </div>
        <div className="hoi-flak" />
      </div>
      <div className="hoi-fx hoi-lightning" />
      <div className="hoi-fx hoi-vignette" />

      {/* o que emite luz fica acima da escuridão */}
      <Board glow />
      <div className="hoi-emit">
        <div className="hoi-lamp-pool" />
        <Lamp />
        <span className="hoi-lamp-glow" />
        <span className="hoi-glow hoi-glow-ember" />
        <span className="hoi-glow hoi-glow-tty" />
        <Radar />
        <span className="hoi-moth" />
      </div>

      {/* relógio de cartões (hora do teatro de operações, como no topo de
          um jogo de estratégia) */}
      <div className="hoi-clock" aria-hidden="true">
        <div className="hoi-clock-win">
          <div className="hoi-clock-strip">
            {HOURS.map((h) => (
              <b key={h}>{h}</b>
            ))}
          </div>
        </div>
        <i>hora do teatro</i>
      </div>

      {/* sirene: aparece com a roleta girando */}
      <div className="hoi-alarm" aria-hidden="true">
        <div className="hoi-alarm-beams">
          <span />
          <span />
        </div>
        <svg className="hoi-alarm-lamp" viewBox="0 0 80 50">
          <defs>
            <radialGradient id="hoi-redglass" cx="45%" cy="30%" r="70%">
              <stop offset="0" stopColor="#ff9a8a" />
              <stop offset="0.45" stopColor="#c0201a" />
              <stop offset="1" stopColor="#4a0806" />
            </radialGradient>
          </defs>
          <rect x="8" y="0" width="64" height="10" rx="2" fill="#6e521c" />
          <path d="M16 8h48v6a24 24 0 0 1 -48 0z" fill="url(#hoi-redglass)" />
          <path
            d="M24 10v14M32 10v22M40 10v24M48 10v22M56 10v14M18 20h44"
            stroke="#c9a24a"
            strokeWidth="1.6"
            fill="none"
          />
        </svg>
        <span className="hoi-alarm-glow" />
      </div>

      {/* vitória */}
      <div className="hoi-winflash" />
      <Stamp />
    </div>
  )
}
