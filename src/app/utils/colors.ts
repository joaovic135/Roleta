// Tons profundos que combinam com o aro dourado e seguram texto branco.
// A ordem alterna cores distantes, então fatias vizinhas sempre contrastam.
export const PALETTE = [
  '#E11D48',
  '#2563EB',
  '#D97706',
  '#059669',
  '#7C3AED',
  '#EA580C',
  '#0891B2',
  '#C026D3',
  '#65A30D',
  '#4F46E5',
]

// Paleta da versão anterior, migrada automaticamente para a atual
const LEGACY_PALETTE = [
  '#ef4444',
  '#f97316',
  '#f59e0b',
  '#eab308',
  '#84cc16',
  '#22c55e',
  '#14b8a6',
  '#06b6d4',
  '#3b82f6',
  '#6366f1',
  '#a855f7',
  '#ec4899',
]

// Escolhe a próxima cor da paleta menos usada, evitando repetir as vizinhas
// (última e primeira, já que a roda é circular)
export const pickColor = (usedColors: string[]): string => {
  const used = usedColors.map((c) => c.toLowerCase())
  const neighbors = [used[used.length - 1], used[0]]
  const count = (color: string) =>
    used.filter((c) => c === color.toLowerCase()).length
  const min = Math.min(...PALETTE.map(count))

  return (
    PALETTE.find(
      (color) =>
        count(color) === min && !neighbors.includes(color.toLowerCase()),
    ) ??
    PALETTE.find((color) => !neighbors.includes(color.toLowerCase())) ??
    PALETTE[0]
  )
}

// Recolore opções que ainda usam cores geradas pela versão anterior
// (paleta antiga ou hsl aleatório), mantendo cores escolhidas pelo usuário
export const isLegacyColor = (color: string): boolean =>
  color.startsWith('hsl') || LEGACY_PALETTE.includes(color.toLowerCase())

let colorCtx: CanvasRenderingContext2D | null = null

// Normaliza qualquer cor CSS (hsl, nomes, etc.) para #rrggbb
export const toHex = (color: string): string => {
  if (/^#[0-9a-f]{6}$/i.test(color)) return color
  if (typeof document === 'undefined') return '#000000'
  if (!colorCtx) colorCtx = document.createElement('canvas').getContext('2d')
  if (!colorCtx) return '#000000'
  colorCtx.fillStyle = '#000000'
  colorCtx.fillStyle = color
  return colorCtx.fillStyle
}

export const luminance = (hex: string): number => {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

// Texto branco sempre que for legível (texto grande e em negrito na roda);
// escuro só sobre cores claras escolhidas pelo usuário
export const contrastText = (background: string): string => {
  const l = luminance(toHex(background))
  return 1.05 / (l + 0.05) >= 2.5 ? '#ffffff' : '#0f172a'
}
