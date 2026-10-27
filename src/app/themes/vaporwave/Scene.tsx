import {
  BustDefs,
  Cloud,
  CloudDefs,
  Dolphin,
  Floppy,
  Glints,
  Mountains,
  Palm,
  Plane,
  Reflection,
  SUN_MASK,
  Sparkles,
  TvBody,
} from './art'
import Desk from './desk'
import { vars } from './lib'
import { Prim } from './prims'

// Cena do tema Vaporwave: "夢の楽園 — VAPOR OS 95". Um papel de parede de
// Windows 95 que ganhou vida: pôr do sol eterno em tons pastel, sol listrado
// com raios girando, nuvens, montanhas de wireframe, mar com golfinhos e um
// píer xadrez correndo em direção à tela (CSS 3D). No ar flutuam sólidos em
// CSS 3D (pirâmide em wireframe, cubo, esfera e toro de anéis); no chão, um
// busto de mármore numa coluna grega (com glitch de VHS), uma TV de tubo
// trocando de canal, palmeiras e um letreiro neon vertical. Por cima, a
// "área de trabalho": ícones, cursor de pixel que clica sozinho, janelas
// que abrem e fecham, menu Iniciar, barra de tarefas e ネコ.exe, um gatinho
// de pixel que mora no telhado da janela roleta.exe (pet.tsx).
//
// Composição (os cards da interface cobrem o meio da tela): o topo mostra
// a calota do sol "nascendo" atrás das janelas, nuvens, estrelas cadentes,
// as janelas pop-up, o gatinho andando sobre a borda do card da roleta, o
// avião com faixa, disquete, CD e o cubo; a margem esquerda tem os ícones e
// o cursor e, embaixo, palmeira, pirâmide, busto, TV e o menu Iniciar; a
// direita tem toro, esfera, letreiro 夢の楽園, golfinhos e palmeira; o
// rodapé vira a barra de tarefas. Mundo medido pela altura da tela (em),
// área de trabalho em px.
//
// Ritmos (tudo em theme.css, só transform/opacity):
//   segundos   piso xadrez (2,4 s), brilhos do mar, palmeiras balançando,
//              sólidos girando e flutuando, núcleo da esfera pulsando,
//              estática da TV, brilho do sol respirando, passos do gato
//   20–75 s    golfinhos (21/29/37 s), glitch do busto (23 s), canais da TV
//              (36 s), estrelas cadentes (47/71 s), tracking de VHS (53 s),
//              avião com faixa (75 s), disquete (90 s) e CD (110 s)
//   96 s       coreografia da área de trabalho (--vw-desk):
//                0–12 s  o gato dorme (zz) no telhado
//                3–7 s   cursor dá duplo clique em vapor.exe
//                7–15 s  "Carregando…" com barra em blocos (steps)
//                15–19 s "vaporwave.exe parou de responder" → Fechar
//                19–46 s o gato anda, se lambe e assiste ao Bloco de Notas
//                29–46 s duplo clique em 夢.txt, Bloco de Notas digitando,
//                        o cursor atravessa o topo e fecha a janela
//                52–61 s ERROR; clicar em OK abre mais 4 erros em cascata;
//                        o gato leva um susto (!) e pula para trás da janela
//                66–71 s menu Iniciar → Programas → ＶＡＰＯＲ ＴＶ: a TV
//                        troca para esse canal até 84 s
//                72–77 s o gato sobe de volta e anda até o meio
//                78–81 s o cursor faz carinho (♥); o gato deita e dorme
//                82–96 s cursor volta para os ícones e descansa
//   raros      óculos de pixel no busto (157 s), protetor de tela
//              "janelas voadoras" (240 s, entre 187 s e 206 s)
// Roleta (html[data-wheel]): girando = janela "Girando…" com barra
// correndo, sólidos, raios e piso aceleram (animações extras pausadas que
// passam a rodar), cursor vira ampulheta, sol brilha mais, o gato acorda
// (?!) e o protetor de tela some; vencedor = janela PARABÉNS.exe com a
// barra de título na cor vencedora, confete pastel (uma vez), halo no sol
// pulsando 3× e ficando aceso, TV mostra ★ parabéns ★ e o gato ganha um ♥
// na cor vencedora. Depois tudo fica calmo até o modal fechar.
// Sem animação (prefers-reduced-motion) fica um quadro montado: golfinho no
// alto do salto, avião com faixa no céu, a janela "Carregando…" e o gato
// sentado no telhado.

const PALMS = {
  l: { h: 470, lean: 0.12, size: 120, seed: 4 },
  r: { h: 480, lean: -0.04, size: 132, seed: 7 },
}

// salto do golfinho: uma animação só (parábola em 8 trechos com giro) e um
// respingo que aparece na saída e na volta para a água
const Jump = ({ spot, pair }: { spot: string; pair?: boolean }) => (
  <div className={'vw-jump vw-jump-' + spot}>
    <div className="vw-dol">
      <Dolphin />
      {pair && (
        <span className="vw-dol-2">
          <Dolphin />
        </span>
      )}
    </div>
    <span className="vw-splash" />
  </div>
)

// janelinhas do protetor de tela: direção (graus) e atraso (s)
const FLY = [
  [8, 0],
  [38, -2.7],
  [68, -0.6],
  [98, -3.3],
  [128, -1.8],
  [158, -0.9],
  [188, -2.4],
  [218, -1.5],
  [248, -1.2],
  [278, -3.0],
  [308, -0.3],
  [338, -2.1],
]

export default function Scene() {
  return (
    <>
      <CloudDefs />
      <BustDefs />
      <div className="vw-world">
        <div className="vw-sky" />
        <Sparkles group={0} />
        <Sparkles group={1} />
        {/* estrelas cadentes cruzando o topo (47 s e 71 s) */}
        <span className="vw-star vw-star-0" />
        <span className="vw-star vw-star-1" />
        <div className="vw-rays-boost">
          <div className="vw-rays" />
        </div>
        <div className="vw-sunglow" />
        <div className="vw-sunglow vw-sunglow-hot" />
        <div className="vw-winhalo" />
        <div
          className="vw-sun"
          style={{ maskImage: SUN_MASK, WebkitMaskImage: SUN_MASK }}
        />
        {[0, 1, 2, 3].map((k) => (
          <div key={k} className={`vw-cloud vw-cloud-${k}`}>
            <Cloud k={k} />
          </div>
        ))}
        <Mountains side={0} />
        <Mountains side={1} />
        <div className="vw-haze" />

        <div className="vw-sea">
          <Reflection />
          <Glints k={0} />
          <Glints k={1} />
        </div>
        <Jump spot="l" />
        <Jump spot="r" pair />
        <Jump spot="c" />

        {/* píer xadrez: um plano CSS 3D com bordas neon; os ladrilhos
            correm dentro dele (e um segundo invólucro acelera no giro) */}
        <div className="vw-floor">
          <div className="vw-deck">
            <div className="vw-deck-boost">
              <div className="vw-tiles" />
            </div>
            <div className="vw-deck-fog" />
            <div className="vw-bulbs vw-bulbs-a" />
            <div className="vw-bulbs vw-bulbs-b" />
          </div>
        </div>

        <Palm spec={PALMS.l} className="vw-palm-l" />

        {/* letreiro vertical num poste do píer */}
        <div className="vw-neon">
          <span className="vw-neon-pole" />
          <div className="vw-neon-box">
            <span className="vw-neon-text">夢の楽園</span>
            <span className="vw-neon-text vw-neon-hot">夢の楽園</span>
          </div>
        </div>

        <Palm spec={PALMS.r} className="vw-palm-r" />

        <Prim kind="pyr" />
        <Prim kind="sphere" />
        <Prim kind="torus" />

        {/* busto de mármore na coluna, com fatias de glitch e óculos */}
        <div className="vw-bust">
          <svg viewBox="0 0 160 404">
            <use href="#vw-bust" />
          </svg>
          <div className="vw-bust-rgb">
            <svg viewBox="0 0 160 404" className="vw-rgb-c">
              <use href="#vw-bust-sil" />
            </svg>
            <svg viewBox="0 0 160 404" className="vw-rgb-m">
              <use href="#vw-bust-sil" />
            </svg>
          </div>
          <div className="vw-bust-slice vw-bust-slice-1">
            <svg viewBox="0 0 160 404">
              <use href="#vw-bust" />
            </svg>
          </div>
          <div className="vw-bust-slice vw-bust-slice-2">
            <svg viewBox="0 0 160 404">
              <use href="#vw-bust" />
            </svg>
          </div>
          <svg
            className="vw-shades"
            viewBox="0 0 24 5"
            shapeRendering="crispEdges"
          >
            <path
              d="M0 0h24v1h-24zM11 1h13v1h-13zM11 2h1v1h-1zM13 2h10v1h-10zM11 3h2v1h-2zM14 3h8v1h-8zM12 4h8v1h-8z"
              fill="#140a2e"
            />
            <path d="M12 2h1v1h-1zM13 3h1v1h-1z" fill="#ffffff" />
          </svg>
        </div>

        {/* TV de tubo no chão: canais trocando e luz derramada no piso */}
        <div className="vw-tv-pool" />
        <div className="vw-tv">
          <span className="vw-tv-bloom" />
          <TvBody />
          <div className="vw-tv-screen">
            <span className="vw-ch vw-ch-sunset" />
            {/* canais em fita: vazio (pôr do sol por baixo), barras, azul */}
            <span className="vw-ch-strip">
              <i />
              <i className="vw-ch-bars" />
              <i className="vw-ch-blue">
                <b>▶ PLAY</b>
                <em>ビデオ１</em>
              </i>
            </span>
            {/* canal ligado pelo menu Iniciar (ciclo --vw-desk) */}
            <span className="vw-ch vw-ch-desk">
              <b>VAPOR TV</b>
              <em>♪ 夢の楽園 ♪</em>
            </span>
            <span className="vw-ch vw-ch-won">★ PARABÉNS ★</span>
            <span className="vw-ch vw-ch-noise">
              <svg className="vw-noise" viewBox="0 0 120 120">
                <filter id="vw-noise-f">
                  <feTurbulence
                    type="fractalNoise"
                    baseFrequency="0.85"
                    numOctaves="2"
                    seed="7"
                  />
                  <feColorMatrix
                    type="matrix"
                    values="0.7 0.7 0.7 0 -0.2 0.7 0.7 0.7 0 -0.2 0.7 0.7 0.7 0 -0.2 0 0 0 0 1"
                  />
                </filter>
                <rect width="120" height="120" filter="url(#vw-noise-f)" />
              </svg>
            </span>
            <span className="vw-tv-lines" />
          </div>
        </div>

        {/* coisas voando pelo topo */}
        <div className="vw-plane">
          <span className="vw-banner">
            ＡＥＳＴＨＥＴＩＣ ☆ 夢の楽園 ☆ ＲＯＬＥＴＡ
          </span>
          <span className="vw-rope" />
          <Plane />
        </div>
        <div className="vw-flop">
          <Floppy c="#ff9ad5" />
        </div>
        <div className="vw-cd">
          <span className="vw-cd-disc" />
        </div>
        <Prim kind="cube" />

        {/* passada de tracking de VHS */}
        <div className="vw-vhs" />

        {/* raro: protetor de tela com janelas voando da tela para fora e
            um letreiro no topo; mexer na roleta o "acorda" (some) */}
        <div className="vw-saver-wake">
          <div className="vw-saver">
            <span className="vw-saver-dim" />
            <span className="vw-saver-tick">
              <span className="vw-saver-text">
                ☆ ＶＡＰＯＲ ＯＳ ９５ ☆ 夢の楽園 ☆ ＡＥＳＴＨＥＴＩＣ ☆
              </span>
            </span>
            {FLY.map(([deg, delay], i) => (
              <span
                key={i}
                className="vw-fly-dir"
                style={vars({ transform: `rotate(${deg}deg)` })}
              >
                <span
                  className="vw-fly"
                  style={vars({ animationDelay: `${delay}s` })}
                >
                  <span
                    className="vw-fly-win"
                    style={vars({ transform: `rotate(${-deg}deg)` })}
                  />
                </span>
              </span>
            ))}
          </div>
        </div>
      </div>
      <Desk />
    </>
  )
}
