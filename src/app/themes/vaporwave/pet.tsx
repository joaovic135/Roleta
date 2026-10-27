import { sprite } from './lib'
import { Px } from './px'

// ネコ.exe: o "bichinho de estimação" da área de trabalho, um gatinho de
// pixel que mora no telhado da janela roleta.exe (a borda de cima dos
// cards fica em y = 102 px em qualquer tela larga). Segue o ciclo
// --vw-desk (96 s) e conversa com o resto da coreografia:
//   0–12 s   dorme (zz) onde o cursor o deixou no ciclo anterior
//   12–19 s  acorda e assiste ao vapor.exe travar
//   19–46 s  anda até a direita, se lambe e "lê" o Bloco de Notas
//   46–55 s  volta para a esquerda; os ERROS em cascata o assustam (!)
//   56–57 s  pula e some atrás da janela
//   72–77 s  sobe de novo pelo outro lado e anda até o meio
//   78–81 s  o cursor faz carinho (♥) e ele deita para dormir
// Folha de sprites 2 × 4 (colunas = passo A/B, linhas = pose): o
// invólucro .vw-cat-step alterna as colunas sem parar e .vw-cat-pose
// escolhe a linha; nas poses paradas as duas colunas são iguais.

const PAL = {
  O: '#3b1f6b',
  W: '#ffffff',
  L: '#d9c8ff',
  P: '#ff71ce',
  K: '#ffc2e6',
  C: '#01cdfe',
  Y: '#ffe66b',
}

const WALK_A = [
  '............O....O..',
  '...........OPO..OPO.',
  '.OO........OWWOOWWO.',
  'OWWO.......OWWWWWWO.',
  'OWO........OWOWWOWO.',
  '.OWO.......OKWPPWKO.',
  '..OWOOOOOOOOWWWWWWO.',
  '...OWWWWWWWWCCCYCO..',
  '...OWWWWWWWWWWWWO...',
  '...OWLLWWWWWWWWWO...',
  '...OLLLLLLLLLLLLO...',
  '..OWO..OWO.OWO..OWO.',
  '..OO...OO...OO...OO.',
]
const WALK_B = [
  '............O....O..',
  '...........OPO..OPO.',
  '..OO.......OWWOOWWO.',
  '.OWWO......OWWWWWWO.',
  '.OWO.......OWOWWOWO.',
  '..OWO......OKWPPWKO.',
  '..OWOOOOOOOOWWWWWWO.',
  '...OWWWWWWWWCCCYCO..',
  '...OWWWWWWWWWWWWO...',
  '...OWLLWWWWWWWWWO...',
  '...OLLLLLLLLLLLLO...',
  '...OWOOWO...OWOOWO..',
  '...OO.OO....OO.OO...',
]
const SIT = [
  '............O....O..',
  '...........OPO..OPO.',
  '...........OWWOOWWO.',
  '...........OWWWWWWO.',
  '...........OWOWWOWO.',
  '...........OKWPPWKO.',
  '.........OOOWWWWWWO.',
  '........OWWWCCCYCO..',
  '.......OWWWWWWWWO...',
  '.......OWLLWWWWWO...',
  '......OWLLLWWOWWO...',
  '.OOOOOWLLLLWWOWWO...',
  'OWWWWWOOOOOOOOOOO...',
]
const GROOM_A = [
  '............O....O..',
  '...........OPO..OPO.',
  '...........OWWOOWWO.',
  '...........OWWWWWWO.',
  '...........OWOWWOWO.',
  '...........OKWPPWKO.',
  '.........OOOWWWOWWO.',
  '........OWWWCCOWO...',
  '.......OWWWWWWOWO...',
  '.......OWLLWWWOWO...',
  '......OWLLLWWWWWO...',
  '.OOOOOWLLLLWWWWWO...',
  'OWWWWWOOOOOOOOOOO...',
]
const GROOM_B = [
  '............O....O..',
  '...........OPO..OPO.',
  '...........OWWOOWWO.',
  '...........OWWWWWWO.',
  '...........OWOWWOWO.',
  '...........OKWPOWKO.',
  '.........OOOWWOWOWO.',
  '........OWWWCCOWO...',
  '.......OWWWWWWOWO...',
  '.......OWLLWWWOWO...',
  '......OWLLLWWWWWO...',
  '.OOOOOWLLLLWWWWWO...',
  'OWWWWWOOOOOOOOOOO...',
]
const SLEEP = [
  '....................',
  '....................',
  '....................',
  '....................',
  '..............O..O..',
  '.............OPOOPO.',
  '......OOOOOOOOWWWWWO',
  '....OOWWWWWWWOWWWWWO',
  '...OWWLLWWWWWOOWWOWO',
  '..OWWLLLWWWWWOKWPWKO',
  '.OWWWWWWWWWWWWOOOOO.',
  'OWLLLLLLLLLLLLLLLO..',
  '.OOOOOOOOOOOOOOOO...',
]

// linhas da folha: andar, sentar, lamber, dormir (quadro A | quadro B)
const SHEET = sprite(
  [
    [WALK_A, WALK_B],
    [SIT, SIT],
    [GROOM_A, GROOM_B],
    [SLEEP, SLEEP],
  ].flatMap(([a, b]) => a.map((row, y) => row + b[y])),
  PAL,
)

export default function Pet() {
  return (
    <div className="vw-cat" aria-hidden="true">
      <div className="vw-cat-flip">
        <div className="vw-cat-view">
          <div className="vw-cat-pose">
            <div className="vw-cat-step">
              <Px s={SHEET} className="vw-cat-sheet" />
            </div>
          </div>
        </div>
      </div>
      {/* balões: zz (dormindo), ! (susto), ♥ (carinho); ?! enquanto a
          roleta gira e ♥ na cor vencedora (theme.css, reações à roleta) */}
      <span className="vw-cat-zz">
        <i>z</i>
        <i>z</i>
      </span>
      <span className="vw-cat-bang">!</span>
      <span className="vw-cat-heart">♥</span>
      <span className="vw-cat-q">?!</span>
      <span className="vw-cat-love">♥</span>
    </div>
  )
}
