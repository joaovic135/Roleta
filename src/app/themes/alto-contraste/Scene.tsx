// Cena do tema Alto contraste (só aparece com data-theme="alto-contraste").
// Uma parede de sinalização acessível à noite, em minimalismo suíço: preto
// puro, amarelo-sinal e branco, formas grandes só nas beiradas e nada atrás
// dos cards. Quase tudo é estático; a vida vem de poucos gestos lentos.
// - cabeçalho: placa em braille com a palavra "roleta" (pontos em relevo
//   acesos, posições vazias gravadas) presa num trilho amarelo;
// - margem esquerda: piso tátil (alerta no topo, direcional descendo) que
//   termina num ladrilho de alerta cercado por anéis de sonar, com uma
//   varredura lenta de radar (24 s) e um eco; nas telas bem largas, uma
//   tabela de acuidade visual ao lado;
// - margem direita: o emblema de contraste (◐), o monumento "21:1" (a
//   maior razão de contraste possível, preto sobre branco) e o
//   pictograma de som, cujas ondas pulsam enquanto a roleta gira;
// - a personagem é o FOCO DO TECLADO: quatro cantoneiras amarelas que
//   "dão Tab" de placa em placa, e cada placa reage quando recebe o foco.
//
// Ciclo de 40 s (theme.css tem a linha do tempo completa):
//   0–8 s  foco na placa: um dedo de luz lê o braille (1,5–6,5 s)
//   8–16   foco no emblema: anel pulsa e o ◐ inverte (gira 180°)
//   16–24  foco no 21:1: uma linha de varredura desce o monumento
//   24–32  foco no ladrilho de cima: uma pessoa (ponto) desce o piso tátil
//   32–40  foco no ladrilho de baixo: o sonar dá um ping
// Raro (160 s): na 4ª visita a placa vira (3D) e mostra a tradução ROLETA.
// Roleta: girando, um único cometa amarelo dá a volta nas bordas da tela,
// os trilhos acendem em crescendo, a faixa zebrada do rodapé marcha e o som
// solta ondas; no vencedor, um anel na cor vencedora pulsa uma vez nas
// bordas, o sonar responde, e fica um contorno calmo até o modal fechar.
//
// Sem JS por quadro: tudo é CSS. Formas de uma mesma cor ficam num só
// <path>; só elementos HTML animam (transform/opacity), nunca o que está
// dentro de um <svg>, e nenhum elemento animado tem filter (o brilho vem de
// box-shadow), senão a animação sai do compositor.

// Braille de "roleta": pontos 1-2-3 na coluna da esquerda, 4-5-6 na direita
const CELLS = [
  [1, 2, 3, 5], // r
  [1, 3, 5], // o
  [1, 2, 3], // l
  [1, 5], // e
  [2, 3, 4, 5], // t
  [1], // a
]
const WORD = 'ROLETA'
// placa de 284 x 68: células a cada 44, pontos a cada 14
const PITCH = 44
const X0 = 25
const DX = 14
const ROWS = [20, 34, 48]

const n = (v: number) => Math.round(v * 10) / 10
const dot = (x: number, y: number, r: number) =>
  `M${n(x - r)} ${n(y)}a${r} ${r} 0 1 0 ${n(2 * r)} 0a${r} ${r} 0 1 0 ${n(-2 * r)} 0z`
const at = (cell: number, d: number) => [
  X0 + cell * PITCH + (d > 3 ? DX : 0),
  ROWS[(d - 1) % 3],
]
const ALL_DOTS = [1, 2, 3, 4, 5, 6]

const RAISED = CELLS.flatMap((dots, c) =>
  dots.map((d) => {
    const [x, y] = at(c, d)
    return dot(x, y, 5.2)
  }),
).join('')
// brilho do relevo (luz vindo de cima, à esquerda)
const SHINE = CELLS.flatMap((dots, c) =>
  dots.map((d) => {
    const [x, y] = at(c, d)
    return dot(x - 1.6, y - 1.8, 1.5)
  }),
).join('')
const FLAT = CELLS.flatMap((dots, c) =>
  ALL_DOTS.filter((d) => !dots.includes(d)).map((d) => {
    const [x, y] = at(c, d)
    return dot(x, y, 1.7)
  }),
).join('')

// Sonar: anéis concêntricos, marcas de grau e mira (centro em 0,0)
const RINGS = [56, 96, 144, 200, 264, 336]
const polar = (r: number, deg: number) => {
  const a = (deg * Math.PI) / 180
  return `${n(Math.cos(a) * r)} ${n(Math.sin(a) * r)}`
}
const TICKS = Array.from({ length: 36 }, (_, i) => {
  const major = i % 3 === 0
  return `M${polar(major ? 186 : 193, i * 10)}L${polar(major ? 214 : 207, i * 10)}`
}).join('')
const CROSS = 'M-336 0H-72M72 0H336M0 -336V-72M0 72V336'

// Tabela de acuidade visual (letras de optotipo, sem repetir linhas)
const CHART = ['E', 'FP', 'TOZ', 'LPED', 'PECFD', 'EDFCZP', 'FELOPZD']

function Braille({ className }: { className: string }) {
  return (
    <svg className={className} viewBox="0 0 284 68" aria-hidden="true">
      <path className="ac-bd-flat" d={FLAT} />
      <path className="ac-bd-dot" d={RAISED} />
      <path className="ac-bd-shine" d={SHINE} />
    </svg>
  )
}

export default function AltoContrasteScene() {
  return (
    <>
      <div className="ac-wall" />

      {/* cabeçalho: placa em braille no trilho */}
      <div className="ac-plate">
        <i className="ac-pool" />
        <i className="ac-rail ac-rail-l" />
        <i className="ac-rail ac-rail-r" />
        <div className="ac-card">
          <div className="ac-face ac-front">
            <Braille className="ac-bd" />
          </div>
          <div className="ac-face ac-back">
            {WORD.split('').map((letter, i) => (
              <span key={i}>{letter}</span>
            ))}
          </div>
        </div>
        <div className="ac-read">
          <div className="ac-read-in">
            <Braille className="ac-bd ac-bd-lit" />
          </div>
        </div>
      </div>

      {/* margem esquerda: piso tátil descendo até o sonar (e, nas telas
          bem largas, a tabela de acuidade visual ao lado) */}
      <div className="ac-chart">
        {CHART.map((row) => (
          <p key={row}>{row}</p>
        ))}
      </div>
      <div className="ac-path">
        <i className="ac-tile" />
        <i className="ac-dir" />
        <i className="ac-bead" />
      </div>
      <div className="ac-sonar">
        <svg viewBox="-360 -360 720 720" aria-hidden="true">
          {RINGS.map((r, i) => (
            <circle key={r} className={`ac-ring ac-ring-${i}`} r={r} />
          ))}
          <circle className="ac-ring-y" r={144} />
          <path className="ac-ticks" d={TICKS + CROSS} />
        </svg>
        <i className="ac-sweep" />
        <i className="ac-blip" />
        <i className="ac-ping" />
        <i className="ac-ping ac-ping-win" />
        <i className="ac-tile ac-tile-sonar" />
      </div>

      {/* margem direita: emblema ◐ e monumento 21:1 */}
      <div className="ac-em">
        <i className="ac-em-dash" />
        <i className="ac-em-ping" />
        <div className="ac-em-disc">
          <i className="ac-em-half" />
        </div>
      </div>
      <div className="ac-mono">
        <svg viewBox="0 0 460 160" aria-hidden="true">
          <text
            className="ac-mono-t"
            x="6"
            y="122"
            textLength="448"
            lengthAdjust="spacingAndGlyphs"
          >
            <tspan className="ac-mono-o">21</tspan>:1
          </text>
          <text
            className="ac-mono-c"
            x="8"
            y="152"
            textLength="444"
            lengthAdjust="spacing"
          >
            RAZÃO DE CONTRASTE MÁXIMA
          </text>
        </svg>
        <i className="ac-scan" />
      </div>
      <div className="ac-spk">
        <i className="ac-spk-body" />
        <i className="ac-wave" />
        <i className="ac-wave" />
        <i className="ac-wave" />
      </div>
      <i className="ac-corner" />

      {/* a personagem: o foco do teclado */}
      <div className="ac-rt">
        <i className="ac-rt-tl" />
        <i className="ac-rt-tr" />
        <i className="ac-rt-bl" />
        <i className="ac-rt-br" />
      </div>

      {/* bordas da tela: filete, faixa zebrada e trilhos do cometa */}
      <i className="ac-top" />
      <div className="ac-haz">
        <i />
      </div>
      <div className="ac-trk ac-trk-t">
        <i />
      </div>
      <div className="ac-trk ac-trk-r">
        <i />
      </div>
      <div className="ac-trk ac-trk-b">
        <i />
      </div>
      <div className="ac-trk ac-trk-l">
        <i />
      </div>
      <i className="ac-win" />
      <i className="ac-win-ring" />
    </>
  )
}
