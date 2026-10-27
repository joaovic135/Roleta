'use client'

import { useEffect } from 'react'
import { useWheelPhase } from '../_kit/wheel'

// Velocidade do bonde. Com a roleta girando, as animações CSS do túnel
// (cambotas, comporta, poeira, vapor e o aviso do letreiro) ganham
// playbackRate 5: o mesmo túnel acelera sem pular de posição e sem uma
// segunda cópia de camadas. A troca é feita em poucos degraus com
// setTimeout (rampa de aceleração e freada), só quando a fase muda: não é
// um laço por quadro. Com prefers-reduced-motion não há animações e nada
// acontece. Renderiza nada (fica isolado para a cena não re-renderizar).

const BOOSTED = new Set([
  'hl-run',
  'hl-door-z',
  'hl-leaf-l',
  'hl-leaf-r',
  'hl-mote',
  'hl-steam-r',
  'hl-steam-l',
  'hl-led-route',
  'hl-led-door',
])
const FAST = 5
// aceleração rápida; freada mais longa quando a roda para
const RAMP_UP = [0.3, 0.65, 1]
const RAMP_DOWN = [0.35, 0.6, 0.8, 0.93, 1]

export default function TramSpeed() {
  const phase = useWheelPhase()

  useEffect(() => {
    const root = document.querySelector('.scene-half-life')
    if (!root) return
    const anims = root
      .getAnimations({ subtree: true })
      .filter(
        (a): a is CSSAnimation =>
          a instanceof CSSAnimation && BOOSTED.has(a.animationName),
      )
    if (!anims.length) return
    const from = anims[0].playbackRate
    const to = phase === 'spinning' ? FAST : 1
    if (from === to) return
    const steps = to > from ? RAMP_UP : RAMP_DOWN
    const gap = to > from ? 120 : 300
    const timers = steps.map((k, i) =>
      window.setTimeout(() => {
        const rate = from + (to - from) * k
        for (const a of anims) a.updatePlaybackRate(rate)
      }, i * gap),
    )
    return () => timers.forEach((t) => window.clearTimeout(t))
  }, [phase])

  return null
}
