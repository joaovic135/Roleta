import type { ReactNode } from 'react'
import { sprite, vars } from './lib'
import Pet from './pet'
import { Px } from './px'

// Camada "área de trabalho" do Vaporwave: ícones, janelas do Windows 95,
// cursor de pixel, barra de tarefas e as janelas que reagem à roleta.
// Tudo estático aqui; o CSS (theme.css) cuida da coreografia.

const INK = '#1d0f3d'
const WHITE = '#ffffff'

// ------------------------------------------------------------- sprites

export const ARROW = sprite(
  [
    'B...........',
    'BB..........',
    'BWB.........',
    'BWWB........',
    'BWWWB.......',
    'BWWWWB......',
    'BWWWWWB.....',
    'BWWWWWWB....',
    'BWWWWWWWB...',
    'BWWWWWWWWB..',
    'BWWWWWWWWWB.',
    'BWWWWWWBBBBB',
    'BWWWBWWB....',
    'BWWBBWWB....',
    'BWB..BWWB...',
    'BB...BWWB...',
    'B.....BWWB..',
    '......BWWB..',
    '.......BB...',
  ],
  { B: INK, W: WHITE },
)

export const HOURGLASS = sprite(
  [
    'BBBBBBBBBBBB',
    'BLLLLLLLLLLB',
    '.BWWWWWWWWB.',
    '.BWPPPPPPWB.',
    '..BWPPPPWB..',
    '...BWPPWB...',
    '....BWWB....',
    '....BWWB....',
    '...BWWPWB...',
    '..BWWWPWWB..',
    '.BWWWPPPWWB.',
    '.BWPPPPPPWB.',
    'BLLLLLLLLLLB',
    'BBBBBBBBBBBB',
  ],
  { B: INK, W: WHITE, L: '#b47cff', P: '#ff71ce' },
)

const ICON_PC = sprite(
  [
    '................',
    '.BBBBBBBBBBBBBB.',
    '.BGGGGGGGGGGGGB.',
    '.BGBBBBBBBBBBGB.',
    '.BGBCCCCCCCCBGB.',
    '.BGBCCPPCCCCBGB.',
    '.BGBCCPPCCCCBGB.',
    '.BGBCCCCCCCCBGB.',
    '.BGBBBBBBBBBBGB.',
    '.BGGGGGGGGGGGGB.',
    '.BBBBBBBBBBBBBB.',
    '......BGGB......',
    '...BBBBBBBBBB...',
    '..BGGGGGGGGGGB..',
    '..BGGGGGGGPPGB..',
    '..BBBBBBBBBBBB..',
  ],
  { B: INK, G: '#efe3ce', C: '#7fe6ff', P: '#ff71ce' },
)

const ICON_BIN = sprite(
  [
    '................',
    '......BBBB......',
    '.....BLLLLB.....',
    '..BBBBBBBBBBBB..',
    '..BLLLLLLLLLLB..',
    '..BBBBBBBBBBBB..',
    '...BWLWLWLWLB...',
    '...BWLWLWLWLB...',
    '...BWLWLWLWLB...',
    '...BWLWLWLWLB...',
    '...BWLWLWLWLB...',
    '...BWLWLWLWLB...',
    '...BWLWLWLWLB...',
    '...BWWWWWWWWB...',
    '....BBBBBBBB....',
    '................',
  ],
  { B: INK, W: WHITE, L: '#c9a7ff' },
)

const ICON_EXE = sprite(
  [
    '................',
    'BBBBBBBBBBBBBBBB',
    'BNNNNNNNPPPPPWWB',
    'BBBBBBBBBBBBBBBB',
    'BKKKKKKKKKKKKKKB',
    'BKKKKKYYYYKKKKKB',
    'BKKKKYYYYYYKKKKB',
    'BLLLLOOOOOOLLLLB',
    'BLLLLLLLLLLLLLLB',
    'BLLLLLOOOOLLLLLB',
    'BCCCCCCCCCCCCCCB',
    'BWCWCWCWCWCWCWCB',
    'BCWCWCWCWCWCWCWB',
    'BBBBBBBBBBBBBBBB',
    '................',
    '................',
  ],
  {
    B: INK,
    W: WHITE,
    N: '#000080',
    P: '#ff71ce',
    K: '#ff9ad5',
    Y: '#fff6a8',
    O: '#ff71ce',
    L: '#c9a7ff',
    C: '#01cdfe',
  },
)

const ICON_TXT = sprite(
  [
    '..BBBBBBBBBB....',
    '..BWWWWWWWWBB...',
    '..BWKKKKWWWBWB..',
    '..BWWWWWWWWBBBB.',
    '..BWKKKKKKWWWWB.',
    '..BWWWWWWWWWWWB.',
    '..BWKKKKKWWWWWB.',
    '..BWWWWWWWWWWWB.',
    '..BWKKKKKKKKWWB.',
    '..BWWWWWWWWWWWB.',
    '..BWKKKKWWWWWWB.',
    '..BWWWWWWWWWWWB.',
    '..BWKKKKKKKWWWB.',
    '..BWWWWWWWWWWWB.',
    '..BBBBBBBBBBBBB.',
    '................',
  ],
  { B: INK, W: WHITE, K: '#7a5cc7' },
)

const ICON_WARN = sprite(
  [
    '.......BB.......',
    '......BYYB......',
    '......BYYB......',
    '.....BYYYYB.....',
    '.....BYBBYB.....',
    '....BYYBBYYB....',
    '....BYYBBYYB....',
    '...BYYYBBYYYB...',
    '...BYYYBBYYYB...',
    '..BYYYYBBYYYYB..',
    '..BYYYYYYYYYYB..',
    '.BYYYYYBBYYYYYB.',
    '.BYYYYYBBYYYYYB.',
    'BYYYYYYYYYYYYYYB',
    'BBBBBBBBBBBBBBBB',
  ],
  { B: INK, Y: '#ffe66b' },
)

const ICON_ERR = sprite(
  [
    '.....BBBBBB.....',
    '...BBRRRRRRBB...',
    '..BRRRRRRRRRRB..',
    '.BRRWWRRRRWWRRB.',
    '.BRRWWWRRWWWRRB.',
    'BRRRRWWWWWWRRRRB',
    'BRRRRRWWWWRRRRRB',
    'BRRRRRWWWWRRRRRB',
    'BRRRRWWWWWWRRRRB',
    '.BRRWWWRRWWWRRB.',
    '.BRRWWRRRRWWRRB.',
    '..BRRRRRRRRRRB..',
    '...BBRRRRRRBB...',
    '.....BBBBBB.....',
  ],
  { B: INK, W: WHITE, R: '#ff4f7b' },
)

// "logo" do botão Iniciar: um sol listrado de pixel (nada de marcas)
const LOGO_SUN = sprite(
  [
    '...YYYY...',
    '.YYYYYYYY.',
    '.YYYYYYYY.',
    'YYYYYYYYYY',
    '..........',
    'PPPPPPPPPP',
    '..........',
    '.PPPPPPPP.',
    '..........',
    '...PPPP...',
  ],
  { Y: '#ffb52e', P: '#ff4fb8' },
)

const SPEAKER = sprite(
  [
    '....B...',
    '...BB.B.',
    'BBBWB..B',
    'BWWWB.B.',
    'BWWWB..B',
    'BBBWB.B.',
    '...BB...',
    '....B...',
  ],
  { B: INK, W: WHITE },
)

// --------------------------------------------------- menu Iniciar
// Ícones 10 × 10 do menu numa coluna só (um <svg> para todos): um item a
// cada 14 unidades (28 px em 2×); "Desligar" desce mais 4 (o separador).
const MENU_ICONS = [
  [
    // Programas: pasta
    '..........',
    '.OOOO.....',
    'OYYYYOOOO.',
    'OYYYYYYYYO',
    'OOOOOOOOOO',
    'OYYYYYYYYO',
    'OYYYYYYYYO',
    'OYYYYYYYYO',
    'OYYYYYYYYO',
    'OOOOOOOOOO',
  ],
  [
    // Documentos: folha com linhas
    '.OOOOOO...',
    '.OWWWWOWO.',
    '.OWKKWOOOO',
    '.OWWWWWWWO',
    '.OWKKKKKWO',
    '.OWWWWWWWO',
    '.OWKKKKKWO',
    '.OWWWWWWWO',
    '.OWKKKWWWO',
    '.OOOOOOOOO',
  ],
  [
    // Configurações: engrenagem
    '....OO....',
    '.O.OCCO.O.',
    '.OOCCCCOO.',
    '..OCOOCO..',
    'OOCO..OCOO',
    'OOCO..OCOO',
    '..OCOOCO..',
    '.OOCCCCOO.',
    '.O.OCCO.O.',
    '....OO....',
  ],
  [
    // Localizar: lupa
    '..OOOO....',
    '.OWCCWO...',
    'OWCWWCWO..',
    'OCWWWWCO..',
    'OCWWWWCO..',
    'OWCWWCWO..',
    '.OWCCWOO..',
    '..OOOOOOO.',
    '.......OOO',
    '........OO',
  ],
  [
    // Ajuda: livro com "?"
    '.OOOOOOOO.',
    'OKKKKKKKKO',
    'OKKOOOOKKO',
    'OKKKKKOKKO',
    'OKKKKOOKKO',
    'OKKKOOKKKO',
    'OKKKKKKKKO',
    'OKKKOOKKKO',
    'OKKKKKKKKO',
    '.OOOOOOOO.',
  ],
  [
    // Executar: janela com seta
    'OOOOOOOOOO',
    'OCCCCCCCCO',
    'OOOOOOOOOO',
    'OWWWWWWWWO',
    'OWWWWPWWWO',
    'OWPPPPPWWO',
    'OWWWWPWWWO',
    'OWWWWWWWWO',
    'OWWWWWWWWO',
    'OOOOOOOOOO',
  ],
  [
    // Desligar: computador com a lua
    '.OOOOOOOO.',
    '.ONNNNNNO.',
    '.ONNNYYNO.',
    '.ONNNNYNO.',
    '.OOOOOOOO.',
    '....OO....',
    '..OOOOOO..',
    '.OLLLLLLO.',
    '.OOOOOOOO.',
    '..........',
  ],
]
const MENU_COL = (() => {
  const rows = Array.from({ length: 100 }, () => '..........')
  MENU_ICONS.forEach((icon, k) => {
    const top = k * 14 + (k === 6 ? 4 : 0) + 2
    icon.forEach((row, y) => (rows[top + y] = row))
  })
  return sprite(rows, {
    O: INK,
    W: WHITE,
    Y: '#ffd86b',
    K: '#c9a7ff',
    C: '#01cdfe',
    P: '#ff71ce',
    N: '#000080',
    L: '#b7a9d9',
  })
})()

const MENU = [
  'Programas',
  'Documentos',
  'Configurações',
  'Localizar',
  'Ajuda',
  'Executar...',
  'Desligar...',
]
const SUBMENU = ['夢の楽園', 'VAPOR TV', 'Notas', 'Paint 95']

// --------------------------------------------------------------- janela

const Win = ({
  title,
  className,
  children,
  close = true,
}: {
  title: ReactNode
  className?: string
  children: ReactNode
  close?: boolean
}) => (
  <div className={'vw-win ' + (className ?? '')}>
    <div className="vw-win-bar">
      <span className="vw-win-title">{title}</span>
      {close && <span className="vw-win-x">✕</span>}
    </div>
    {children}
  </div>
)

// ------------------------------------------------------------- confete

const CONFETTI = [
  // [x (%), atraso (s), duração (s), variante, cor]
  [3, 0.05, 3.1, 'a', '#ff9ad5'],
  [6, 0.4, 3.6, 'b', '#8ef0ff'],
  [9, 0.15, 2.9, 'c', 'var(--win-color, #ff71ce)'],
  [12, 0.6, 3.4, 'd', '#fff6a8'],
  [26, 0.1, 3.0, 'b', '#c9a7ff'],
  [31, 0.5, 3.5, 'a', 'var(--win-color, #ff71ce)'],
  [38, 0.25, 2.8, 'd', '#8ef0ff'],
  [44, 0.7, 3.3, 'c', '#ff9ad5'],
  [50, 0.0, 3.0, 'a', '#fff6a8'],
  [56, 0.45, 3.4, 'b', 'var(--win-color, #ff71ce)'],
  [62, 0.2, 2.9, 'c', '#c9a7ff'],
  [68, 0.65, 3.6, 'd', '#8ef0ff'],
  [74, 0.3, 3.1, 'a', '#ff9ad5'],
  [88, 0.1, 3.2, 'c', '#fff6a8'],
  [91, 0.55, 2.8, 'a', 'var(--win-color, #ff71ce)'],
  [94, 0.25, 3.5, 'd', '#c9a7ff'],
  [97, 0.7, 3.0, 'b', '#8ef0ff'],
  [99, 0.35, 3.3, 'c', '#ff9ad5'],
] as const

// ----------------------------------------------------------------- cena

const ICONS = [
  { s: ICON_PC, label: 'Meu Computador' },
  { s: ICON_BIN, label: 'Lixeira' },
  { s: ICON_EXE, label: 'vapor.exe', hit: 'a' },
  { s: ICON_TXT, label: '夢.txt', hit: 'b' },
]

export default function Desk() {
  return (
    <div className="vw-desk">
      {/* ícones da área de trabalho (coluna da esquerda, como no 95) */}
      <div className="vw-icons">
        {ICONS.map(({ s, label, hit }) => (
          <div key={label} className="vw-icon">
            <Px s={s} className="vw-icon-img" />
            <span className="vw-icon-label">{label}</span>
            {hit && (
              <span className={'vw-icon-sel vw-icon-sel-' + hit}>
                <span>{label}</span>
              </span>
            )}
          </div>
        ))}
      </div>

      {/* janelas que abrem e fecham sozinhas (ciclo --vw-desk) */}
      <div className="vw-pops">
        <Win title="ｖａｐｏｒ．ｅｘｅ" className="vw-pop vw-pop-a">
          <div className="vw-win-body">
            <Px s={HOURGLASS} className="vw-win-ico vw-win-ico-sm" />
            <p>
              Ｃａｒｒｅｇａｎｄｏ
              <br />
              ＡＥＳＴＨＥＴＩＣＡ…
            </p>
          </div>
          <div className="vw-bar">
            <span className="vw-bar-fill" />
            <span className="vw-bar-cover" />
          </div>
        </Win>

        <Win title="ｖａｐｏｒ．ｅｘｅ" className="vw-pop vw-pop-b">
          <div className="vw-win-body">
            <Px s={ICON_WARN} className="vw-win-ico" />
            <p>
              ｖａｐｏｒｗａｖｅ．ｅｘｅ
              <br />
              parou de responder.
            </p>
          </div>
          <div className="vw-btns">
            <span className="vw-btn">
              Fechar
              <span className="vw-btn-down vw-btn-down-b">Fechar</span>
            </span>
            <span className="vw-btn">Esperar</span>
          </div>
        </Win>

        <Win title="夢．ｔｘｔ － Bloco de Notas" className="vw-pop vw-pop-c">
          <div className="vw-menu">
            <span>Arquivo</span>
            <span>Editar</span>
            <span>Ajuda</span>
          </div>
          <div className="vw-note">
            <p>
              o verão de 1995 nunca acabou.
              <span className="vw-type vw-type-1" />
            </p>
            <p>
              volte sempre ☆ 夢の楽園
              <span className="vw-type vw-type-2" />
            </p>
          </div>
        </Win>

        {/* erro em cascata: clicar em OK só abre mais erros */}
        {[0, 1, 2, 3, 4].map((i) => (
          <Win
            key={i}
            title="ＥＲＲＯＲ"
            className={`vw-pop vw-pop-d vw-pop-d${i}`}
          >
            <div className="vw-win-body">
              <Px s={ICON_ERR} className="vw-win-ico" />
              <p>
                Erro fatal de ＡＥＳＴＨＥＴＩＣＡ.
                <br />
                Reinicie o pôr do sol.
              </p>
            </div>
            <div className="vw-btns">
              <span className="vw-btn vw-btn-ok">
                OK
                {i === 0 && (
                  <span className="vw-btn-down vw-btn-down-d">OK</span>
                )}
              </span>
            </div>
          </Win>
        ))}
      </div>

      {/* reação à roleta: carregando enquanto gira, parabéns no vencedor */}
      <Win title="ｒｏｌｅｔａ．ｅｘｅ" className="vw-wheelwin vw-spinwin">
        <div className="vw-win-body">
          <Px s={HOURGLASS} className="vw-win-ico vw-win-ico-sm vw-flip" />
          <p>
            Ｇｉｒａｎｄｏ．．．
            <br />
            sorteando o seu destino
          </p>
        </div>
        <div className="vw-bar vw-bar-run">
          <span className="vw-bar-run-strip" />
        </div>
      </Win>
      <Win title="ＰＡＲＡＢÉＮＳ．ｅｘｅ" className="vw-wheelwin vw-wonwin">
        <div className="vw-win-body vw-won-body">
          <p className="vw-won-big">★ ＧＡＮＨＯＵ！ ★</p>
          <p>夢が叶った · o sonho se realizou</p>
        </div>
        <div className="vw-btns">
          <span className="vw-btn vw-btn-ok">OK</span>
        </div>
      </Win>
      <div className="vw-confetti">
        {CONFETTI.map(([x, delay, dur, k, color], i) => (
          <i
            key={i}
            className={'vw-conf vw-conf-' + k}
            style={vars({
              left: `${x}%`,
              animationDelay: `${delay}s`,
              animationDuration: `${dur}s`,
              background: color,
            })}
          />
        ))}
      </div>

      {/* o gatinho que mora no telhado da janela roleta.exe */}
      <Pet />

      {/* menu Iniciar: o cursor abre, entra em Programas e liga a
          ＶＡＰＯＲ ＴＶ (a TV da cena troca de canal) */}
      <div className="vw-smenu">
        <span className="vw-smenu-band">
          <b>vapor</b> OS 95
        </span>
        <span className="vw-smenu-hi" />
        <Px s={MENU_COL} className="vw-smenu-ico" />
        {MENU.map((label, i) => (
          <span
            key={label}
            className={
              'vw-smenu-item' +
              (i < 4 ? ' vw-smenu-more' : '') +
              (i === 6 ? ' vw-smenu-off' : '')
            }
          >
            {label}
          </span>
        ))}
      </div>
      <div className="vw-submenu">
        <span className="vw-submenu-hi" />
        {SUBMENU.map((label) => (
          <span key={label} className="vw-smenu-item">
            ☆ {label}
          </span>
        ))}
      </div>

      {/* barra de tarefas (o rodapé da página fica por cima dela) */}
      <div className="vw-taskbar">
        <span className="vw-start">
          <Px s={LOGO_SUN} className="vw-start-logo" />
          Iniciar
          <i className="vw-start-down" />
        </span>
        <span className="vw-task vw-task-on">roleta.exe</span>
        <span className="vw-task vw-task-slot">
          <i className="vw-task-a">vapor.exe</i>
          <i className="vw-task-b">夢.txt</i>
        </span>
        <span className="vw-tray">
          <Px s={SPEAKER} className="vw-tray-ico" />
          <span>16:44</span>
        </span>
      </div>

      {/* cursor: seta normal, ampulheta enquanto a roleta gira */}
      <div className="vw-cursor">
        <Px s={ARROW} className="vw-cur vw-cur-arrow" />
        <Px s={HOURGLASS} className="vw-cur vw-cur-wait" />
      </div>
    </div>
  )
}
