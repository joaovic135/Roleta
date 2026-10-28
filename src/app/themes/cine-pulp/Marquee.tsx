import { dot, vars } from './geo'

// Letreiro do cinema, no alto e no meio (o espaço livre do cabeçalho).
// - Lâmpadas: fileiras em gradiente CSS repetido; três camadas acesas em
//   fases que se revezam (perseguição) por cima das apagadas. Girando, uma
//   cópia mais rápida aparece por cima (não dá para mudar a duração de uma
//   animação em andamento sem pulo).
// - Títulos: um tambor 3D de 4 faces (prisma girando em X), fatiado em
//   segmentos que viram um depois do outro, como placas mecânicas. Cada
//   segmento mostra a sua fatia do texto inteiro.
// - Painéis por cima do tambor: contagem regressiva da ponta do filme
//   (uma cópia segue o ciclo da sessão, a outra aparece quando a roleta
//   gira e recomeça do 8), INTERVALO (com a pipoca e o refrigerante
//   sapateando) e SUCESSO! (vencedor, com um halo na cor dele).
// - Rolos de filme nas pontas, girando em perspectiva.
//
// Títulos inventados (nenhum filme de verdade).

export const TITLES: [string, string][] = [
  ['HOJE ★ SESSÃO DUPLA', 'A NOITE DOS DISCOS VOADORES'],
  ['EM CARTAZ ★ EM CORES!', 'ROBÔS DE MARTE'],
  ['SÓ PARA OS CORAJOSOS', 'A CRIATURA DO BREJO DE NEON'],
  ['SÁBADO ★ SESSÃO DRIVE-IN', 'A MULHER-FOGUETE'],
]
const SEGS = 5

// rolo de filme: flange com 5 furos (evenodd), filme enrolado no cubo
const reelHoles = Array.from({ length: 5 }, (_, i) => {
  const a = (i / 5) * Math.PI * 2 - Math.PI / 2
  return dot(Math.cos(a) * 27, Math.sin(a) * 27, 11.5)
}).join('')
const REEL_PLATE = dot(0, 0, 47) + reelHoles + dot(0, 0, 5)
const reelRivets = Array.from({ length: 5 }, (_, i) => {
  const a = (i / 5) * Math.PI * 2 - Math.PI / 2 + Math.PI / 5
  return dot(Math.cos(a) * 36, Math.sin(a) * 36, 2)
}).join('')

function Reel({ id }: { id: string }) {
  return (
    <svg className="cn-reel-art" viewBox="-50 -50 100 100">
      <defs>
        <linearGradient id={`cn-reel-${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff2c9" />
          <stop offset="0.35" stopColor="#d9a84e" />
          <stop offset="0.6" stopColor="#8a5a1c" />
          <stop offset="1" stopColor="#f0cf80" />
        </linearGradient>
      </defs>
      <circle r="44" fill="#120607" />
      <circle r="31" fill="#3a2414" />
      <circle r="31" fill="none" stroke="#5b3a20" strokeWidth="1.4" />
      <circle r="24" fill="none" stroke="#2a180d" strokeWidth="1" />
      <path d={REEL_PLATE} fill={`url(#cn-reel-${id})`} fillRule="evenodd" />
      <circle r="46" fill="none" stroke="#5a3a10" strokeWidth="1.6" />
      <circle r="9" fill="none" stroke="#fff3cf" strokeWidth="1.2" />
      <path d={reelRivets} fill="#fff3cf" />
      <path
        d="M-34 -30A46 46 0 0 1 10 -45"
        fill="none"
        stroke="#fffbe8"
        strokeWidth="2.4"
        strokeLinecap="round"
        opacity="0.8"
      />
    </svg>
  )
}

// mascotes do intervalo (tradição do drive-in): pipoca e refrigerante
// sapateando dos dois lados do INTERVALO
function Popcorn() {
  return (
    <svg className="cn-snack-art" viewBox="0 0 30 40">
      <path
        d={
          dot(9, 12, 4) +
          dot(15, 9.5, 4.6) +
          dot(21, 12, 4) +
          dot(12, 7, 3.2) +
          dot(19, 7.4, 3)
        }
        fill="#fff3c8"
      />
      <path d="M5 13h20l-2.6 21h-14.8z" fill="#f6ecd2" />
      <path
        d="M8.6 13h3.4l-0.6 21h-2.6zM18 13h3.4l-1.6 21h-2.4z"
        fill="#c81d2e"
      />
      <path d={dot(12, 21, 1.6) + dot(18.4, 21, 1.6)} fill="#1e0a08" />
      <path
        d="M11.4 25.6q3.6 3 7.4 0"
        fill="none"
        stroke="#1e0a08"
        strokeWidth="1.2"
      />
      <path
        d="M5.6 19l-4 -5M24.4 19l4 -5M11 34l-2.4 5h-2.4M19 34l2.4 5h2.4"
        fill="none"
        stroke="#1e0a08"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  )
}

function Soda() {
  return (
    <svg className="cn-snack-art" viewBox="0 0 30 40">
      <path d="M18 9l3 -8" stroke="#c81d2e" strokeWidth="2" />
      <path d="M6 8h18v3h-18z" fill="#e8dcc0" />
      <path d="M7 11h16l-2.4 23h-11.2z" fill="#f6ecd2" />
      <path d="M7.6 17h14.8l-0.5 5h-13.8z" fill="#1d6fd1" />
      <path d={dot(12.4, 26.4, 1.5) + dot(17.6, 26.4, 1.5)} fill="#1e0a08" />
      <path
        d="M12.6 29.6q2.4 2 4.8 0"
        fill="none"
        stroke="#1e0a08"
        strokeWidth="1.1"
      />
      <path
        d="M7.6 20l-5 -4M22.4 20l5 -4M12 34l-2 5h-2.6M18 34l2 5h2.6"
        fill="none"
        stroke="#1e0a08"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  )
}

// numerais da ponta do filme (8 → 3), empilhados; o CSS desce de 1 em 1 s
const COUNT = [8, 7, 6, 5, 4, 3]

function Leader({ className }: { className: string }) {
  return (
    <div className={`cn-leader ${className}`}>
      <div className="cn-leader-weave">
        <i className="cn-leader-ring" />
        <div className="cn-leader-sweep" />
        <div className="cn-leader-win">
          <div className="cn-leader-col">
            {COUNT.map((c) => (
              <span key={c}>{c}</span>
            ))}
          </div>
        </div>
        <span className="cn-leader-tag cn-leader-tag-l">
          INÍCIO DA PROJEÇÃO
        </span>
        <span className="cn-leader-tag cn-leader-tag-r">ROLO 1</span>
      </div>
    </div>
  )
}

export default function Marquee() {
  return (
    <div className="cn-mq">
      <i className="cn-mq-halo" />
      <div className="cn-mq-bloom" />
      <div className="cn-mq-board">
        <div className="cn-mq-panel">
          <div className="cn-drum">
            {Array.from({ length: SEGS }, (_, s) => (
              <div key={s} className="cn-seg" style={vars({ '--cn-s': s })}>
                {TITLES.map(([small, big], f) => (
                  <div
                    key={f}
                    className="cn-face"
                    style={vars({ '--cn-f': f })}
                  >
                    <div className="cn-face-text">
                      <small>{small}</small>
                      <b>{big}</b>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div className="cn-interval">
            <small>★ VISITE A BOMBONIÈRE ★</small>
            <b>INTERVALO</b>
            <div className="cn-snack cn-snack-a">
              <Popcorn />
            </div>
            <div className="cn-snack cn-snack-b">
              <Soda />
            </div>
          </div>
          <Leader className="cn-leader-cyc" />
          <Leader className="cn-leader-spin" />
          <div className="cn-win">
            <small>★ ESTREIA DA NOITE ★</small>
            <b className="cn-win-word">SUCESSO!</b>
          </div>
          <div className="cn-panel-glass" />
        </div>
        <i className="cn-bulbs cn-bulbs-dim" />
        <div className="cn-bulbs-slow">
          <i className="cn-bulbs cn-bulbs-p cn-bulbs-p0" />
          <i className="cn-bulbs cn-bulbs-p cn-bulbs-p1" />
          <i className="cn-bulbs cn-bulbs-p cn-bulbs-p2" />
        </div>
        <div className="cn-bulbs-fast">
          <i className="cn-bulbs cn-bulbs-f cn-bulbs-f0" />
          <i className="cn-bulbs cn-bulbs-f cn-bulbs-f1" />
          <i className="cn-bulbs cn-bulbs-f cn-bulbs-f2" />
        </div>
        <i className="cn-bulbs cn-bulbs-all" />
      </div>
      <div className="cn-reel cn-reel-l">
        <div className="cn-reel-spin">
          <div className="cn-reel-fast">
            <Reel id="l" />
          </div>
        </div>
      </div>
      <div className="cn-reel cn-reel-r">
        <div className="cn-reel-spin">
          <div className="cn-reel-fast">
            <Reel id="r" />
          </div>
        </div>
      </div>
    </div>
  )
}
