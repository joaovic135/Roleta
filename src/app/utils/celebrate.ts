import confetti from 'canvas-confetti'

// Comemoração do vencedor: uma explosão central e dois "canhões" laterais.
// Tudo é desenhado num único canvas, animado num Web Worker (fora da thread
// principal), e desligado para quem pede "reduzir movimento" no sistema.
export function celebrate(canvas: HTMLCanvasElement, color: string) {
  const fire = confetti.create(canvas, {
    resize: true,
    useWorker: true,
    disableForReducedMotion: true,
  })
  const colors = [color, '#fbbf24', '#fde68a', '#ffffff']

  fire({
    particleCount: 140,
    spread: 100,
    startVelocity: 50,
    scalar: 1.1,
    ticks: 260,
    origin: { y: 0.4 },
    colors,
  })

  const end = performance.now() + 1600
  let raf = 0
  const cannons = () => {
    fire({
      particleCount: 3,
      angle: 60,
      spread: 55,
      startVelocity: 62,
      origin: { x: 0, y: 0.75 },
      colors,
    })
    fire({
      particleCount: 3,
      angle: 120,
      spread: 55,
      startVelocity: 62,
      origin: { x: 1, y: 0.75 },
      colors,
    })
    if (performance.now() < end) raf = requestAnimationFrame(cannons)
  }
  raf = requestAnimationFrame(cannons)

  return () => {
    cancelAnimationFrame(raf)
    fire.reset()
  }
}
