import type { CSSProperties } from 'react'

// Tipografia cinética do tema (abertura de videoclipe em CSS 3D).
//
// - Título do cabeçalho: número da faixa + 7 letras; cada casa é um prisma
//   hexagonal (6 faces = as 6 faixas do disco). A cada faixa os prismas
//   giram 60° em rotateX, um depois do outro (onda da esquerda para a
//   direita), com um repique no fim. A linha toda tem uma perspectiva só
//   (ponto de fuga no meio, como câmera de clipe) e recorta acima e abaixo
//   da face da frente, então só ela aparece parada.
// - Linha fina de baixo (romaji · tradução · BPM): fita 2D que desliza uma
//   linha por faixa, cronômetro da faixa (zera junto da virada) e batida.
// - Coluna vertical da margem esquerda (tategaki): 7 prismas triangulares
//   em rotateY, como um painel "trivision" de outdoor, girando em cascata
//   de cima para baixo entre três frases (branca, ladrilho, contorno).
// - Girando a roleta: as letras paradas somem e entram faixas correndo
//   (marquise horizontal no cabeçalho, vertical na margem).
// - Vencedor: 大当たり bate letra por letra na cor vencedora e fica.
//
// Cada prisma é um único elemento animado (só transform); as faces são
// estáticas e faces vazias nem são desenhadas (cada face 3D vira uma camada
// na GPU). Custo: 8 + 3 animações no cabeçalho e 7 na coluna.

export const TRACKS = [
  {
    no: 'A1',
    jp: '未来のファンク',
    ro: 'Mirai no Fanku',
    pt: 'o funk do futuro',
    bpm: 118,
  },
  {
    no: 'A2',
    jp: '恋のルーレット',
    ro: 'Koi no Rūretto',
    pt: 'roleta do amor',
    bpm: 124,
  },
  {
    no: 'A3',
    jp: '夕焼けシティ',
    ro: 'Yūyake Shiti',
    pt: 'cidade ao pôr do sol',
    bpm: 102,
  },
  {
    no: 'B1',
    jp: '月面ディスコ',
    ro: 'Getsumen Disuko',
    pt: 'discoteca na lua',
    bpm: 128,
  },
  {
    no: 'B2',
    jp: '雨のメモリー',
    ro: 'Ame no Memorī',
    pt: 'memórias da chuva',
    bpm: 92,
  },
  {
    no: 'B3',
    jp: '夜明けのビート',
    ro: 'Yoake no Bīto',
    pt: 'a batida do amanhecer',
    bpm: 110,
  },
]
const SLOTS = 7
// faixas em ladrilho branco com letra preta (pôster invertido)
const INVERTED = new Set([1, 4])

// frases da coluna vertical (uma por face do prisma triangular)
const COLUMN = ['未来のファンク', 'ルーレット回る', '夢見るシティ★']

const v = (name: string, value: number) =>
  ({ [`--mf-${name}`]: value }) as CSSProperties

export function TrackTitle() {
  const chars = TRACKS.map((t) => [...t.jp])
  return (
    <div className="mf-title">
      <div className="mf-title-row">
        <span className="mf-reel mf-reel-no" style={v('j', -1)}>
          {TRACKS.map((t, i) => (
            <b key={i} className="mf-face" style={v('i', i)}>
              {t.no}
            </b>
          ))}
        </span>
        {Array.from({ length: SLOTS }, (_, j) => (
          <span key={j} className="mf-reel" style={v('j', j)}>
            {chars.map((c, i) =>
              c[j] ? (
                <b
                  key={i}
                  className={
                    INVERTED.has(i) ? 'mf-face mf-face-inv' : 'mf-face'
                  }
                  style={v('i', i)}
                >
                  {c[j]}
                </b>
              ) : null,
            )}
          </span>
        ))}
      </div>
      <div className="mf-ticker">
        {/* cronômetro da faixa (zera a cada 40 s, junto da virada) */}
        <span className="mf-time">
          <i className="mf-play" />
          0:
          <span className="mf-odo mf-odo-10">
            <span>0 1 2 3</span>
          </span>
          <span className="mf-odo mf-odo-1">
            <span>0 1 2 3 4 5 6 7 8 9</span>
          </span>
        </span>
        <span className="mf-sub">
          <span className="mf-sub-strip">
            {TRACKS.map((t, i) => (
              <b key={i}>
                {t.ro} · {t.pt} · {t.bpm} BPM
              </b>
            ))}
          </span>
        </span>
        <span className="mf-beat">
          <i />
        </span>
      </div>
      {/* girando: faixa correndo no lugar do título */}
      <div className="mf-race">
        <div className="mf-race-track">
          {[0, 1].map((k) => (
            <span key={k}>
              ルーレット回転中 ✦ GIRANDO ✦ ルーレット回転中 ✦ GIRANDO ✦{' '}
            </span>
          ))}
        </div>
      </div>
      {/* vencedor: 大当たり batendo letra por letra */}
      <div className="mf-jackpot">
        {[...'大当たり！'].map((c, i) => (
          <b key={i} style={v('i', i)}>
            {c}
          </b>
        ))}
      </div>
    </div>
  )
}

export function SideColumn() {
  const chars = COLUMN.map((s) => [...s])
  return (
    <div className="mf-column">
      <div className="mf-column-type">
        {Array.from({ length: SLOTS }, (_, j) => (
          <span key={j} className="mf-tri" style={v('j', j)}>
            {chars.map((c, i) => (
              <b
                key={i}
                className={`mf-tri-face mf-tri-${i}`}
                style={v('i', i)}
              >
                {c[j]}
              </b>
            ))}
          </span>
        ))}
      </div>
      {/* girando: coluna de letras subindo depressa */}
      <div className="mf-column-race">
        <div className="mf-column-race-track">
          {[0, 1].map((k) => (
            <span key={k}>回転回転回転回転</span>
          ))}
        </div>
      </div>
      {/* vencedor: 大当たり na vertical */}
      <div className="mf-column-win">
        {[...'大当たり'].map((c, i) => (
          <b key={i} style={v('i', i)}>
            {c}
          </b>
        ))}
      </div>
    </div>
  )
}
