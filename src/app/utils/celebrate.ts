import confetti from 'canvas-confetti'

// Comemoração do vencedor: uma explosão central e dois "canhões" laterais.
// Tudo é desenhado num único canvas, animado num Web Worker (fora da thread
// principal), e desligado para quem pede "reduzir movimento" no sistema.
// Os canhões disparam por tempo e não a cada quadro: a quantidade de confete é
// a mesma numa tela de 60 Hz ou de 144 Hz.
export function celebrate(canvas: HTMLCanvasElement, color: string) {
  const fire = confetti.create(canvas, {
    resize: true,
    useWorker: true,
    disableForReducedMotion: true,
  })
  const colors = [color, '#fbbf24', '#fde68a', '#ffffff']

  fire({
    particleCount: 110,
    spread: 100,
    startVelocity: 50,
    scalar: 1.1,
    ticks: 240,
    origin: { y: 0.4 },
    colors,
  })

  // um disparo de cada lado a cada 34 ms, por ~1,2 s
  let shots = 36
  const cannons = window.setInterval(() => {
    fire({
      particleCount: 4,
      angle: 60,
      spread: 55,
      startVelocity: 62,
      origin: { x: 0, y: 0.75 },
      colors,
    })
    fire({
      particleCount: 4,
      angle: 120,
      spread: 55,
      startVelocity: 62,
      origin: { x: 1, y: 0.75 },
      colors,
    })
    if (--shots <= 0) window.clearInterval(cannons)
  }, 34)

  return () => {
    window.clearInterval(cannons)
    fire.reset()
  }
}
