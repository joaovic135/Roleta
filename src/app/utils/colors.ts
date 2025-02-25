export const generateRandomColor = (): string => {
  // Primary and secondary colors hues:
  // Red: 0°
  // Orange: 30°
  // Yellow: 60°
  // Green: 120°
  // Blue: 240°
  // Purple: 300°
  const colorHues = [0, 30, 60, 120, 240, 300]
  const variance = 15 // Smaller variance for more consistent colors
  const selectedBase = colorHues[Math.floor(Math.random() * colorHues.length)]
  const hue = selectedBase + Math.floor(Math.random() * variance * 2) - variance

  // Saturation: 65-85% (cores mais vibrantes)
  const saturation = Math.floor(Math.random() * 21) + 65
  // Lightness: 50-60% (melhor contraste)
  const lightness = Math.floor(Math.random() * 11) + 50

  return `hsl(${hue}, ${saturation}%, ${lightness}%)`
}
