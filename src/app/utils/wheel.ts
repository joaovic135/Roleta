import { RouletteOption } from '../types'
import { pickColor } from './colors'

export const uid = (): string =>
  Math.random().toString(36).slice(2, 10) + Date.now().toString(36)

// Aleatoriedade criptográfica para um sorteio justo
export const random = (): number =>
  crypto.getRandomValues(new Uint32Array(1))[0] / 4294967296

export const easeOutQuart = (t: number): number => 1 - Math.pow(1 - t, 4)

export const createOption = (
  text: string,
  existing: RouletteOption[],
  extra: Partial<RouletteOption> = {},
): RouletteOption => ({
  id: uid(),
  text,
  color: pickColor(existing.map((o) => o.color)),
  quantity: 1,
  ...extra,
})

// Total de fatias que o modo automático mira na roda
const AUTO_TARGET_SLICES = 12
// Máximo de fatias por opção no modo automático (no manual vai até 10)
const AUTO_MAX_PER_OPTION = 6
export const MIN_SEGMENTS_PER_OPTION = 1
export const MAX_SEGMENTS_PER_OPTION = 10

// Fatias por opção no modo automático: inverso à quantidade de opções.
// Poucas opções ganham várias fatias; muitas opções ficam com uma só.
// Depende só de quantas opções existem, para que ajustar uma opção no
// seletor não mude as fatias das outras.
export const autoSegmentsPerOption = (options: RouletteOption[]): number => {
  if (options.length === 0) return AUTO_MAX_PER_OPTION
  return Math.min(
    AUTO_MAX_PER_OPTION,
    Math.max(
      MIN_SEGMENTS_PER_OPTION,
      Math.round(AUTO_TARGET_SLICES / options.length),
    ),
  )
}

// Limite de fatias de uma opção pelo seletor − / +
export const MAX_SLICES_PER_OPTION = 60

// Fatias de uma opção na roda: o ponto de partida (automático ou
// "Repetições") mais o ajuste do seletor − / + da opção. `quantity` guarda
// esse ajuste: 1 = sem ajuste, 2 = uma fatia a mais, 0 = uma a menos...
export const optionSlices = (
  option: RouletteOption,
  segmentsPerOption: number,
): number =>
  Math.min(
    MAX_SLICES_PER_OPTION,
    Math.max(1, segmentsPerOption + option.quantity - 1),
  )

// Valor de `quantity` que deixa a opção com `slices` fatias
export const quantityForSlices = (slices: number, segmentsPerOption: number) =>
  slices - segmentsPerOption + 1

// Monta as fatias da roda. Cada opção aparece `optionSlices` vezes, e as
// cópias são espalhadas uniformemente pela roda para que fatias da mesma
// opção não fiquem grudadas.
export const buildSegments = (
  options: RouletteOption[],
  segmentsPerOption: number,
): RouletteOption[] => {
  const n = options.length
  const placed: { option: RouletteOption; position: number; order: number }[] =
    []

  options.forEach((option, i) => {
    const copies = optionSlices(option, segmentsPerOption)
    for (let k = 0; k < copies; k++) {
      placed.push({ option, position: (k + (i + 0.5) / n) / copies, order: i })
    }
  })

  return placed
    .sort((a, b) => a.position - b.position || a.order - b.order)
    .map((p) => p.option)
}

// Índice da fatia sob o ponteiro (no topo) para uma rotação em graus.
// A fatia 0 começa no topo e as fatias seguem no sentido horário.
export const segmentIndexAt = (rotation: number, count: number): number => {
  if (count === 0) return 0
  const angle = (((-rotation % 360) + 360) % 360) / (360 / count)
  return Math.floor(angle) % count
}

// Converte o texto do editor (uma opção por linha) em opções, preservando
// cor, quantidade e vínculo com filme das opções que já existiam.
export const parseOptionsText = (
  text: string,
  previous: RouletteOption[],
): RouletteOption[] => {
  const lines = text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
  const pool = [...previous]
  const result: (RouletteOption | null)[] = lines.map(() => null)

  // 1ª passada: mesmo texto
  lines.forEach((line, i) => {
    const match = pool.findIndex((o) => o.text === line)
    if (match >= 0) {
      result[i] = pool[match]
      pool.splice(match, 1)
    }
  })

  // 2ª passada: linha editada no lugar mantém a cor/quantidade da original
  lines.forEach((line, i) => {
    if (result[i]) return
    const samePosition = previous[i]
    const match = samePosition ? pool.indexOf(samePosition) : -1
    if (match >= 0) {
      result[i] = { ...pool[match], text: line }
      pool.splice(match, 1)
    }
  })

  const final: RouletteOption[] = []
  lines.forEach((line, i) => {
    final.push(result[i] ?? createOption(line, final))
  })
  return final
}
