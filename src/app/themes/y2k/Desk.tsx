import type { CSSProperties, ReactNode } from 'react'

// "Área de trabalho pastel" do tema Y2K: o lado retrô-sistema-operacional
// (Windows 98 em tons pastel) que se mistura ao Sonho Cromado. Janelas com
// barra de título rosa/lilás/menta/amarela e botões _ □ X, traço fino
// azul-marinho, cores chapadas, adesivos fofos.
//
// Só entra onde a cena aparece em volta da interface (ver theme.css):
//  - cabeçalho: as janelinhas que se revezam ao lado do aparelho de som
//    (Scene.tsx, .y2-wins) ganham o cursor que passeia e clica; à esquerda
//    o balão "Você é amado(a)!", à direita os ícones da área de trabalho;
//  - faixa de baixo: o joguinho do monstrinho pulando cactos e o player de
//    mídia com a onda correndo, entre corações, controle e setas;
//  - margens largas (telas de 1880 px ou mais): busca "Me encontre",
//    equalizador "Escolha a alegria" e o Paint com o coração que pisca,
//    que minimizam e voltam de tempos em tempos.
// Tudo anima só transform/opacity; as formas são <svg> com traço que não
// escala (vector-effect), então o contorno fica fino em qualquer tamanho.

const css = (v: Record<string, string | number>) => v as CSSProperties
const n = (v: number) => +v.toFixed(1)
const sparkle = (x: number, y: number, s: number) =>
  `M${n(x)} ${n(y - s)}Q${n(x + s * 0.12)} ${n(y - s * 0.12)} ${n(x + s)} ${n(y)}Q${n(x + s * 0.12)} ${n(y + s * 0.12)} ${n(x)} ${n(y + s)}Q${n(x - s * 0.12)} ${n(y + s * 0.12)} ${n(x - s)} ${n(y)}Q${n(x - s * 0.12)} ${n(y - s * 0.12)} ${n(x)} ${n(y - s)}Z`

export const HEART =
  'M12 20.5C5 15.3 1.2 11.6 1.2 7.2A5.3 5.3 0 0 1 12 4.6A5.3 5.3 0 0 1 22.8 7.2C22.8 11.6 19 15.3 12 20.5Z'

// ---- adesivos ----
export const Sparkle = ({
  tone,
  className = '',
  style,
}: {
  tone: 'pink' | 'yellow' | 'blue' | 'white'
  className?: string
  style?: CSSProperties
}) => (
  <svg
    className={`y2-stk y2-spk y2-f-${tone} ${className}`}
    viewBox="0 0 24 24"
    style={style}
  >
    <path d={sparkle(12, 12, 11)} />
  </svg>
)

export const Heart = ({
  tone,
  style,
}: {
  tone: 'pink' | 'yellow' | 'blue' | 'white' | 'mint'
  style?: CSSProperties
}) => (
  <svg className={`y2-heart y2-f-${tone}`} viewBox="0 0 24 22" style={style}>
    <path d={HEART} />
  </svg>
)

const Smiley = ({ className = '' }: { className?: string }) => (
  <svg className={`y2-smile ${className}`} viewBox="0 0 24 24">
    <circle className="y2-f-pinkish" cx="12" cy="12" r="10.5" />
    <path
      className="y2-ink-f"
      d="M8.2 8.2h1.6v3.4H8.2zM14.2 8.2h1.6v3.4h-1.6z"
    />
    <path className="y2-ink-l" d="M7 13.6Q12 19.4 17 13.6" />
  </svg>
)

const Hourglass = ({ className = '' }: { className?: string }) => (
  <svg className={`y2-hg ${className}`} viewBox="0 0 16 22">
    <path
      className="y2-f-white"
      d="M3.5 2.5h9Q12.5 8 8.8 10.2v1.6Q12.5 14 12.5 19.5h-9Q3.5 14 7.2 11.8v-1.6Q3.5 8 3.5 2.5Z"
    />
    <path
      className="y2-f-yellow y2-hg-sand"
      d="M5.4 5h5.2Q10 8 8 9.5Q6 8 5.4 5ZM8 13.5l3.2 5H4.8Z"
    />
    <path className="y2-f-blue" d="M1.5 1h13v2h-13zM1.5 19h13v2h-13z" />
  </svg>
)

// botões da barra de título (_ □ X) vêm do CSS; aqui só o texto
const Win = ({
  title,
  className,
  style,
  children,
}: {
  title: string
  className: string
  style?: CSSProperties
  children: ReactNode
}) => (
  <div className={`y2-pw ${className}`} style={style}>
    <div className="y2-pw-bar">{title}</div>
    <div className="y2-pw-body">{children}</div>
  </div>
)

const Folder = () => (
  <svg className="y2-folder" viewBox="0 0 26 20">
    <path className="y2-f-yellow2" d="M1 2.5h8l2 2.2h13.5V19H1Z" />
    <path className="y2-f-yellow" d="M1 7.5h23.5V19H1Z" />
  </svg>
)

// ---- onda do player (dois períodos por largura, ladrilho que se repete) ----
const wave = (w: number, h: number, periods: number, amp: number, ph = 0) => {
  let d = ''
  const steps = 96
  for (let i = 0; i <= steps; i++) {
    const x = (i / steps) * w * 2
    const t = (x / w) * periods * Math.PI * 2 + ph
    const y = h / 2 + Math.sin(t) * amp * (0.75 + 0.25 * Math.sin(t * 0.5))
    d += `${i ? 'L' : 'M'}${n(x)} ${n(y)}`
  }
  return d
}
const WAVE_W = 128
const WAVES = {
  a: wave(WAVE_W, 30, 2, 10),
  b: wave(WAVE_W, 30, 3, 6, 1.4),
  fa: wave(WAVE_W, 30, 6, 12),
  fb: wave(WAVE_W, 30, 8, 7, 0.8),
}

// ---- joguinho: cactos a cada 114 px numa faixa de 2 telas (ver theme.css
// .y2-game: o monstrinho pula no instante em que cada cacto passa) ----
const CACTUS = (x: number, h: number) =>
  `M${x} 40V${40 - h}a2 2 0 0 1 4 0V40ZM${x} ${40 - h * 0.5}h-3v-${n(h * 0.35)}a1.5 1.5 0 0 1 3 0ZM${x + 4} ${40 - h * 0.65}h3v-${n(h * 0.3)}a1.5 1.5 0 0 1-3 0Z`
const CACTI = [90, 204, 318, 432]
  .map((x, i) => CACTUS(x, i % 2 ? 11 : 15))
  .join('')
const GAME_CLOUD = (x: number, y: number) =>
  `M${x} ${y}a4 4 0 0 1 6-3a5 5 0 0 1 9 1a3 3 0 0 1 2 5h-17a3 3 0 0 1 0-3Z`
const GAME_CLOUDS =
  GAME_CLOUD(20, 10) +
  GAME_CLOUD(120, 6) +
  GAME_CLOUD(248, 10) +
  GAME_CLOUD(348, 6)

// ---- equalizador: posição-base e amplitude de cada controle ----
const SLIDERS = [
  [10, 4, 1.3],
  [4, 16, 1.7],
  [14, 2, 1.1],
  [6, 18, 2.1],
  [16, 6, 1.5],
  [2, 12, 1.9],
  [12, 3, 1.2],
  [8, 17, 1.6],
].map(([a, b, t], i) =>
  css({
    '--y2-a': `${a}px`,
    '--y2-b': `${b}px`,
    '--y2-t': `${t}s`,
    '--y2-dl': `${-i * 0.37}s`,
  }),
)

// janelinhas do cabeçalho que entram no rodízio de Scene.tsx
export function SlotWindows({ lag }: { lag: (d: number) => CSSProperties }) {
  return (
    <>
      <div className="y2-win y2-tone-yellow y2-win-9 y2-cyc" style={lag(0.005)}>
        <div className="y2-win-bar">bom_humor.exe</div>
        <div className="y2-win-text y2-win-row">
          <Smiley className="y2-win-smile" />
          Carregando bom humor!
        </div>
        <div className="y2-win-track y2-track-pastel y2-track-short">
          <i />
        </div>
        <div className="y2-win-btn y2-press">Cancelar</div>
      </div>
      <div className="y2-win y2-tone-lilac y2-win-9 y2-cyc" style={lag(0.285)}>
        <div className="y2-win-bar">paisagem.jpg</div>
        <div className="y2-win-split">
          <svg className="y2-scape" viewBox="0 0 72 46">
            <path className="y2-f-sky" d="M0 0h72v46H0z" />
            <circle
              className="y2-f-yellow y2-scape-sun"
              cx="55"
              cy="13"
              r="6.5"
            />
            <path
              className="y2-f-mint"
              d="M0 46V34l14-12 12 10 14-15 17 15 15-10v24Z"
            />
            <path className="y2-f-blue" d="M0 46V40l20-9 18 8 18-6 16 5v8Z" />
            <path
              className="y2-f-white y2-scape-cloud"
              d="M10 14a4 4 0 0 1 6-3a5 5 0 0 1 9 1a3 3 0 0 1 2 5H11a3 3 0 0 1-1-3Z"
            />
          </svg>
          <div className="y2-win-col">
            <div className="y2-drop">
              Boas vibrações!<b>▾</b>
            </div>
          </div>
        </div>
        <div className="y2-win-btn y2-press">Ir!</div>
      </div>
      <div className="y2-win y2-tone-pink y2-win-9 y2-cyc" style={lag(0.535)}>
        <div className="y2-win-bar">aviso</div>
        <div className="y2-win-split y2-win-alert">
          <span className="y2-alert-ico">
            <Heart tone="pink" />
            <svg className="y2-warn" viewBox="0 0 26 23">
              <path className="y2-f-yellow" d="M13 1.5 25 21.5H1Z" />
              <path
                className="y2-ink-f"
                d="M11.8 7.5h2.4l-.4 8h-1.6zM11.8 17.3h2.4v2.2h-2.4z"
              />
            </svg>
            <Heart tone="pink" />
          </span>
          <span className="y2-win-text">Vamos iluminar o céu!</span>
        </div>
        <div className="y2-win-btn y2-press">OK</div>
      </div>
      <div className="y2-win y2-tone-mint y2-win-9 y2-cyc" style={lag(0.8)}>
        <div className="y2-win-bar">afazeres.txt</div>
        <ul className="y2-check">
          <li>
            <b />
            Escolher a alegria
          </li>
          <li>
            <b />
            Mantenha o astral
          </li>
          <li>
            <b />
            Seguir o coração
          </li>
        </ul>
        <div className="y2-win-btn y2-press">OK</div>
      </div>
    </>
  )
}

// janela do giro (aparece por cima do rodízio enquanto a roleta gira)
export function SpinWindow() {
  return (
    <div className="y2-win y2-tone-sky y2-win-spin">
      <div className="y2-win-bar">sorteando.exe</div>
      <div className="y2-win-text y2-win-row">
        <Hourglass className="y2-hg-flip" />
        Sorteando… aguarde!
      </div>
      <div className="y2-win-track y2-track-pastel y2-track-fast">
        <i />
      </div>
    </div>
  )
}

// cursor que passeia pela janelinha do cabeçalho e clica no botão; girando,
// vira a ampulheta de "aguarde"
export function Cursor() {
  return (
    <div className="y2-cur">
      <svg className="y2-cur-arrow" viewBox="0 0 16 24">
        <path
          className="y2-f-white"
          d="M1 1v18.5l4.6-4.3 3.3 7.2 3.1-1.5-3.3-7H15Z"
        />
      </svg>
      <svg className="y2-cur-hand" viewBox="0 0 20 24">
        <path
          className="y2-f-white"
          d="M6 12V3a1.6 1.6 0 0 1 3.2 0v7.5V8.6a1.6 1.6 0 0 1 3.2 0v2.2a1.6 1.6 0 0 1 3.2 0v1.4a1.6 1.6 0 0 1 3.2 0V17q0 5.5-5.5 5.5H9.8Q6.8 22.5 4.6 19L1.5 14a1.6 1.6 0 0 1 2.7-1.6Z"
        />
      </svg>
      <Hourglass className="y2-cur-wait" />
      <i className="y2-cur-ring" />
    </div>
  )
}

export default function Y2kDesk() {
  return (
    <div className="y2-desk">
      {/* cabeçalho, à esquerda do aparelho: "Você é amado(a)!" */}
      <div className="y2-love">
        <div className="y2-bubble">
          <svg viewBox="0 0 132 46" preserveAspectRatio="none">
            <path
              className="y2-f-yellow"
              d="M8 1.5h116a6.5 6.5 0 0 1 6.5 6.5v20a6.5 6.5 0 0 1-6.5 6.5H74l-8 9-8-9H8A6.5 6.5 0 0 1 1.5 28V8A6.5 6.5 0 0 1 8 1.5Z"
            />
          </svg>
          <span>Você é amado(a)!</span>
        </div>
        <Sparkle tone="pink" className="y2-love-s1" />
        <Sparkle tone="blue" className="y2-love-s2" />
        <Sparkle tone="yellow" className="y2-love-s3" />
      </div>

      {/* cabeçalho, à direita: ícones da área de trabalho */}
      <div className="y2-icons">
        <div className="y2-ico y2-ico-pc">
          <svg viewBox="0 0 32 30">
            <path className="y2-f-white" d="M3 2h26v18H3z" />
            <path className="y2-f-sky" d="M6 5h20v12H6z" />
            <path className="y2-pc-rgb" d="M6 5h20v12H6z" />
            <path className="y2-f-white" d="M12 20h8v4h-8zM6 24h20v4H6z" />
          </svg>
          <span>Meu PC</span>
        </div>
        <div className="y2-ico y2-ico-floppy">
          <svg viewBox="0 0 30 30">
            <path className="y2-f-navy" d="M2 2h21l5 5v21H2Z" />
            <path className="y2-f-blue" d="M8 2h12v8H8z" />
            <path className="y2-f-white" d="M6 16h18v12H6z" />
            <path className="y2-ink-l" d="M9 20h12M9 24h9" />
          </svg>
          <span>Disquete</span>
        </div>
        <div className="y2-ico y2-ico-bin">
          <svg viewBox="0 0 30 32">
            <path className="y2-f-white" d="M6 9h18l-2 21H8Z" />
            <path className="y2-ink-l" d="M11 13l1 13M15 13v13M19 13l-1 13" />
            <g className="y2-bin-lid">
              <path className="y2-f-blue" d="M4 5.5h22V9H4zM12 5.5V3h6v2.5" />
            </g>
          </svg>
          <span>Lixeira</span>
        </div>
      </div>

      {/* faixa de baixo, à esquerda: o joguinho */}
      <Win title="monstrinho.exe" className="y2-tone-mint y2-game">
        <div className="y2-game-view">
          <div className="y2-game-clouds">
            <svg viewBox="0 0 456 44" preserveAspectRatio="none">
              <path className="y2-f-white" d={GAME_CLOUDS} />
            </svg>
          </div>
          <div className="y2-game-floor" />
          <div className="y2-game-cacti">
            <svg viewBox="0 0 456 44" preserveAspectRatio="none">
              <path className="y2-f-mint" d={CACTI} />
            </svg>
          </div>
          <div className="y2-game-mon">
            <svg viewBox="0 0 20 22">
              <path
                className="y2-f-navy"
                d="M3 19V9.5a7 7 0 0 1 14 0V19ZM4.5 19v2.5h3V19ZM12.5 19v2.5h3V19ZM2.8 3.5 5 7 2 6.5ZM17.2 3.5 15 7l3-.5Z"
              />
              <circle className="y2-f-white" cx="10" cy="10" r="4.3" />
              <circle className="y2-mon-eye" cx="11" cy="10.4" r="1.9" />
            </svg>
          </div>
          <span className="y2-game-score">PONTOS 0002000</span>
        </div>
      </Win>
      <svg className="y2-stk y2-marks y2-marks-plus" viewBox="0 0 70 10">
        <path
          className="y2-ink-l"
          d="M1 5h8M5 1v8M15 5h8M19 1v8M29 5h8M33 1v8M43 5h8M47 1v8M57 5h8M61 1v8"
        />
      </svg>
      <Smiley className="y2-stk y2-smile-big" />
      <Sparkle tone="yellow" className="y2-bot-s1" />
      <Sparkle tone="pink" className="y2-bot-s2" />

      {/* faixa de baixo, à direita: player de mídia com a onda */}
      <Win title="alegria.mp3" className="y2-tone-pink y2-media">
        <div className="y2-media-screen">
          <div className="y2-wave">
            <svg viewBox={`0 0 ${WAVE_W * 2} 30`} preserveAspectRatio="none">
              <path className="y2-wave-b" d={WAVES.b} />
              <path className="y2-wave-a" d={WAVES.a} />
            </svg>
          </div>
          <div className="y2-wave y2-wave-fast">
            <svg viewBox={`0 0 ${WAVE_W * 2} 30`} preserveAspectRatio="none">
              <path className="y2-wave-b" d={WAVES.fb} />
              <path className="y2-wave-a" d={WAVES.fa} />
            </svg>
          </div>
        </div>
        <div className="y2-media-seek">
          <i />
        </div>
        <div className="y2-media-keys">
          <b>◀◀</b>
          <b className="y2-media-play">▶</b>
          <b>❚❚</b>
          <b>▶▶</b>
        </div>
      </Win>
      <div className="y2-hearts">
        <Heart tone="pink" />
        <Heart tone="yellow" />
        <Heart tone="blue" />
        <Heart tone="white" />
      </div>
      <svg className="y2-stk y2-pad" viewBox="0 0 50 28">
        <path
          className="y2-f-white"
          d="M11 3h28a10 10 0 0 1 10 10v1.5a10 10 0 0 1-17 7.5l-2.5-2.5h-9L18 22a10 10 0 0 1-17-7.5V13A10 10 0 0 1 11 3Z"
        />
        <path className="y2-f-navy" d="M9.5 9h3v3h3v3h-3v3h-3v-3h-3v-3h3Z" />
        <circle className="y2-f-pink" cx="36" cy="10.5" r="2.4" />
        <circle className="y2-f-yellow" cx="40.5" cy="14.5" r="2.4" />
        <circle className="y2-f-mint" cx="31.5" cy="14.5" r="2.4" />
        <circle className="y2-f-blue" cx="36" cy="18.5" r="2.4" />
      </svg>
      <svg className="y2-stk y2-marks y2-marks-arrows" viewBox="0 0 64 12">
        <path
          className="y2-ink-l"
          d="M2 2l4 4-4 4M12 2l4 4-4 4M22 2l4 4-4 4M32 2l4 4-4 4M42 2l4 4-4 4M52 2l4 4-4 4"
        />
      </svg>
      <Sparkle tone="blue" className="y2-bot-s3" />

      {/* margens largas: busca, equalizador e Paint */}
      <Win title="Me encontre" className="y2-tone-sky y2-side y2-find">
        <div className="y2-find-bar">
          <span className="y2-find-input">
            sorte
            <i />
          </span>
          <b>Ir!</b>
        </div>
        <div className="y2-find-files">
          <Folder />
          <Folder />
          <Folder />
        </div>
      </Win>
      <Win title="equalizador" className="y2-tone-lilac y2-side y2-eqwin">
        <div className="y2-sliders">
          {SLIDERS.map((style, i) => (
            <span key={i} className="y2-slider">
              <i style={style} />
            </span>
          ))}
        </div>
        <p>Escolha a alegria todo dia.</p>
      </Win>
      <Win title="coração.bmp" className="y2-tone-yellow y2-side y2-paint">
        <div className="y2-paint-tools">
          <i />
          <i />
          <i />
          <i />
        </div>
        <div className="y2-paint-canvas">
          <svg viewBox="0 0 40 36" className="y2-paint-heart">
            <path
              className="y2-f-yellow"
              d="M20 34C8 25.5 2 19.5 2 12A8.8 8.8 0 0 1 20 7.5A8.8 8.8 0 0 1 38 12C38 19.5 32 25.5 20 34Z"
            />
            <path className="y2-ink-l" d="M13 14q2-2.5 4 0" />
            <path
              className="y2-ink-l y2-wink-open"
              d="M23 13.5a1.6 1.6 0 1 0 3.2 0a1.6 1.6 0 1 0-3.2 0"
            />
            <path className="y2-ink-l y2-wink-shut" d="M22.8 14h3.6" />
            <path className="y2-ink-l" d="M13.5 20q6.5 6 13 0" />
          </svg>
        </div>
      </Win>
      <div className="y2-side y2-side-stk">
        <Sparkle tone="pink" className="y2-side-s1" />
        <Sparkle tone="yellow" className="y2-side-s2" />
        <Sparkle tone="blue" className="y2-side-s3" />
        <svg className="y2-stk y2-eye" viewBox="0 0 34 20">
          <path className="y2-f-white" d="M1.5 10Q17-6 32.5 10Q17 26 1.5 10Z" />
          <circle className="y2-f-blue" cx="17" cy="10" r="5.5" />
          <circle className="y2-f-navy" cx="17" cy="10" r="2.3" />
          <path
            className="y2-eye-lid y2-f-sky"
            d="M1.5 10Q17-6 32.5 10Q17 26 1.5 10Z"
          />
        </svg>
        <div className="y2-cube">
          <div className="y2-cube-spin">
            {[0, 1, 2, 3, 4, 5].map((k) => (
              <i key={k} className={`y2-cube-f y2-cube-${k}`} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
