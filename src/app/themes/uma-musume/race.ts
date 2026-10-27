// Coreografia das corridas, gerada uma vez como CSS (@keyframes com nomes
// um-*, injetados num <style> pela cena). Cada corredora tem dois
// keyframes próprios: posição (translate) e linha da folha de sprites
// (corrida / comemoração / trote / largada, trocando "em degrau").
//
// Um "páreo" dura RACE_SLOT segundos e o laço tem 3 páreos com histórias
// diferentes (216 s; o dia tem 240 s, então as corridas caem em horas
// diferentes a cada volta):
//   0,5–7 s   as corredoras entram trotando no portão (de trás p/ frente)
//   7,5–10 s  luzes de largada (vermelha, vermelha, verde), juiz ergue a
//             bandeira
//   10 s      portões abrem (CSS 3D) e a corrida começa
//   ~19 s     chegada; a vencedora pula de alegria, as outras trotam
//   ~27 s     todas saem pela direita; portões fecham em ~31 s
// Páreo 1: Morango lidera de ponta a ponta e segura a Menta no focinho.
// Páreo 2: Menta vem de último e passa todo mundo na reta final.
// Páreo 3: Nuvem dá o bote no meio da corrida; Anis chega colada.
//
// Unidades: px (a faixa de baixo da tela tem altura fixa). --um-gx é o x do
// portão, --um-fx o x da linha de chegada (theme.css calcula pelas margens).

export const RACE_SLOT = 72
const RACES = 3
export const RACE_PERIOD = RACE_SLOT * RACES
export const S = 48 // quadro da corredora na tela (px)
const NOSE = 36 // do canto esquerdo do quadro até o focinho
const START = 10 // largada (s dentro do páreo)
const DUR = 8.4 // tempo da vencedora do portão até a chegada (s)

// baia k (0 = mais perto da tela): x relativo ao portão e altura do chão
export const stallX = (k: number) => 132 - 24 * k
export const stallY = (k: number) => 5 + 11 * k
// raia durante a corrida (quase coladas, as de trás um pouco acima)
const laneY = (k: number) => 3 + 3.2 * k

// progresso em frações do tempo da vencedora (0, 12%, 30%, 50%, ...)
const CHECK = [0, 0.12, 0.3, 0.5, 0.7, 0.85, 1]
// atraso de cada corredora em cada ponto (negativo = na frente do ritmo)
const STORY: number[][][] = [
  [
    [0, -0.07, -0.06, -0.05, -0.04, -0.02, 0],
    [0, 0.02, 0.03, 0.04, 0.05, 0.06, 0.07],
    [0, 0.05, 0.07, 0.06, 0.03, 0.012, 0.006],
    [0, 0, 0.01, 0.02, 0.04, 0.05, 0.05],
    [0, 0.03, 0.04, 0.05, 0.06, 0.08, 0.1],
  ],
  [
    [0, -0.03, -0.02, 0, 0.02, 0.03, 0.04],
    [0, 0, -0.01, -0.02, -0.01, 0.01, 0.025],
    [0, 0.06, 0.09, 0.08, 0.04, 0.004, 0],
    [0, -0.02, -0.03, -0.02, 0, 0.02, 0.05],
    [0, 0.02, 0.03, 0.04, 0.05, 0.06, 0.085],
  ],
  [
    [0, 0, 0.01, 0.03, 0.05, 0.07, 0.09],
    [0, 0.03, 0.02, -0.01, -0.02, -0.01, 0],
    [0, 0.05, 0.06, 0.06, 0.07, 0.07, 0.075],
    [0, -0.04, -0.04, -0.02, 0, 0.01, 0.03],
    [0, 0.01, 0, 0, 0, 0, 0.012],
  ],
]
// vencedora de cada páreo (índice da corredora)
export const WINNERS = STORY.map((race) =>
  race.reduce((best, g, i) => (g[6] < race[best][6] ? i : best), 0),
)

const r3 = (n: number) => Math.round(n * 1000) / 1000
const pct = (t: number) => `${r3((t / RACE_PERIOD) * 100)}%`

const OFF_L = '-70px'
const OFF_R = 'calc(100vw + 40px)'
const xRace = (k: number, p: number) =>
  `calc(var(--um-gx) + ${stallX(k)}px + ` +
  `(var(--um-fx) - var(--um-gx) - ${stallX(k) + NOSE}px) * ${r3(p)})`
const xStall = (k: number) => `calc(var(--um-gx) + ${stallX(k)}px)`

type Key = [number, string]
const block = (name: string, keys: Key[]) =>
  `@keyframes ${name}{` +
  keys
    .sort((a, b) => a[0] - b[0])
    .map(([t, v]) => `${pct(t)}{${v}}`)
    .join('') +
  '}'
const at = (x: string, y: number) => `transform:translate(${x},${r3(-y)}px)`
const row = (n: number) => `transform:translateY(${-25 * n}%)`

const runnerKeys = (k: number) => {
  const pos: Key[] = []
  const rows: Key[] = []
  for (let r = 0; r < RACES; r++) {
    const t0 = r * RACE_SLOT
    const g = STORY[r][k]
    const win = WINNERS[r] === k
    // entrada trotando: as de trás entram primeiro
    const enter = t0 + 0.5 + (4 - k) * 0.95
    const arrive = enter + 2.6
    pos.push([t0, at(OFF_L, stallY(k))])
    pos.push([enter, at(OFF_L, stallY(k))])
    pos.push([arrive, at(xStall(k), stallY(k))])
    pos.push([t0 + START, at(xStall(k), stallY(k))])
    rows.push([t0, row(2)], [arrive, row(3)], [t0 + START, row(0)])
    // corrida: pontos de controle; já na 1ª parcial está na raia
    CHECK.forEach((c, i) => {
      if (i === 0) return
      const y = i === 1 ? (laneY(k) + stallY(k)) / 2 : laneY(k)
      pos.push([t0 + START + c * DUR, at(xRace(k, c * (1 - g[i])), y)])
    })
    const finish = t0 + START + DUR * (1 + g[6])
    pos.push([finish, at(xRace(k, 1), laneY(k))])
    if (win) {
      // freia logo depois da linha e comemora
      pos.push([finish + 0.9, at(xRace(k, 1.035), laneY(k))])
      pos.push([finish + 4.2, at(xRace(k, 1.035), laneY(k))])
      rows.push([finish + 0.9, row(1)], [finish + 4.2, row(2)])
      pos.push([finish + 7.6, at(OFF_R, laneY(k))])
    } else {
      pos.push([finish + 1.1, at(xRace(k, 1.07), laneY(k))])
      rows.push([finish + 1.1, row(2)])
      pos.push([finish + 5.4 + k * 0.4, at(OFF_R, laneY(k))])
    }
    // fora da tela até o próximo páreo; volta para a esquerda por baixo
    // da tela (invisível), sem atravessar a pista
    const end = t0 + RACE_SLOT
    pos.push([end - 1, at(OFF_R, laneY(k))])
    pos.push([end - 0.9, at(OFF_R, -90)])
    pos.push([end - 0.2, at(OFF_L, -90)])
    pos.push([end - 0.1, at(OFF_L, stallY(k))])
  }
  pos.push([RACE_PERIOD, at(OFF_L, stallY(k))])
  rows.push([RACE_PERIOD, row(2)])
  return { pos, rows }
}

// portões (todas as portas juntas, laço de um páreo)
const door = (deg: number) => `transform:perspective(220px) rotateY(${deg}deg)`
const doorKeys: Key[] = [
  [0, door(0)],
  [START, door(0)],
  [START + 0.35, door(-112)],
  [START + 0.62, door(-98)],
  [START + 0.85, door(-104)],
  [START + 20, door(-104)],
  [START + 21.6, door(0)],
  [RACE_SLOT, door(0)],
]
const lamp = (on: number, off: number): Key[] => [
  [0, 'opacity:0'],
  [on, 'opacity:0'],
  [on + 0.08, 'opacity:1'],
  [off, 'opacity:1'],
  [off + 0.25, 'opacity:0'],
  [RACE_SLOT, 'opacity:0'],
]
// bandeira do juiz: erguida antes da largada, baixa de uma vez no "vai"
const flagKeys: Key[] = [
  [0, 'transform:rotate(-70deg)'],
  [START - 3, 'transform:rotate(-70deg)'],
  [START - 2.4, 'transform:rotate(16deg)'],
  [START - 0.05, 'transform:rotate(16deg)'],
  [START + 0.25, 'transform:rotate(-96deg)'],
  [START + 1.4, 'transform:rotate(-70deg)'],
  [RACE_SLOT, 'transform:rotate(-70deg)'],
]
// foto da chegada: flash duplo no poste quando a vencedora cruza a linha
const photoKeys: Key[] = [
  [0, 'opacity:0;transform:scale(0.5)'],
  [START + DUR - 0.03, 'opacity:0;transform:scale(0.5)'],
  [START + DUR + 0.05, 'opacity:1;transform:scale(1)'],
  [START + DUR + 0.2, 'opacity:0.1;transform:scale(1.1)'],
  [START + DUR + 0.36, 'opacity:0.9;transform:scale(1.15)'],
  [START + DUR + 0.7, 'opacity:0;transform:scale(1.4)'],
  [RACE_SLOT, 'opacity:0;transform:scale(1.4)'],
]
// balões de jogo: VAI! na largada e CHEGADA! no poste
const pop = (at: number, hold: number): Key[] => [
  [0, 'opacity:0;transform:scale(0.3) rotate(-12deg)'],
  [at - 0.02, 'opacity:0;transform:scale(0.3) rotate(-12deg)'],
  [at + 0.25, 'opacity:1;transform:scale(1.15) rotate(4deg)'],
  [at + 0.45, 'opacity:1;transform:scale(1) rotate(0deg)'],
  [at + hold, 'opacity:1;transform:scale(1) rotate(0deg)'],
  [at + hold + 0.4, 'opacity:0;transform:scale(0.8) rotate(0deg)'],
  [RACE_SLOT, 'opacity:0;transform:scale(0.8) rotate(0deg)'],
]
// torcida pulando durante a corrida (laço de um páreo)
const hopKeys: Key[] = [[0, 'transform:translateY(0)']]
for (let t = START + 0.4; t < START + DUR + 4; t += 0.5) {
  hopKeys.push([t, 'transform:translateY(0)'])
  hopKeys.push([t + 0.22, 'transform:translateY(-3px)'])
}
hopKeys.push([START + DUR + 4.6, 'transform:translateY(0)'])
hopKeys.push([RACE_SLOT, 'transform:translateY(0)'])

const slot = (name: string, keys: Key[]) =>
  block(
    name,
    keys.map(([t, v]) => [(t / RACE_SLOT) * RACE_PERIOD, v] as Key),
  )

export const RACE_CSS =
  Array.from({ length: 5 }, (_, k) => {
    const { pos, rows } = runnerKeys(k)
    return block(`um-race-${k}`, pos) + block(`um-row-${k}`, rows)
  }).join('') +
  slot('um-door', doorKeys) +
  slot('um-lamp-1', lamp(START - 2.6, START)) +
  slot('um-lamp-2', lamp(START - 1.4, START)) +
  slot('um-lamp-3', lamp(START, START + 3)) +
  slot('um-starter', flagKeys) +
  slot('um-cheer', hopKeys) +
  slot('um-photo', photoKeys) +
  slot('um-go', pop(START, 1.3)) +
  slot('um-goal-pop', pop(START + DUR + 0.2, 3.6))
