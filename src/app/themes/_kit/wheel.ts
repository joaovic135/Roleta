'use client'

import { useEffect, useState } from 'react'

// Estado da roleta exposto às cenas. O RoletaMain grava no <html>:
// - data-wheel="idle" | "spinning" | "won" (girando / parou no vencedor,
//   até o modal fechar);
// - --win-color: cor da fatia vencedora (vale a partir do primeiro giro);
// - data-dialog="open" enquanto o modal do vencedor está aberto: as animações
//   CSS da cena ficam pausadas (themes.css) e o useSceneLoop para junto.
// No CSS: html[data-wheel='spinning'] .minha-camada { ... } e
// var(--win-color, #fff). No JS: as funções abaixo.

export type WheelPhase = 'idle' | 'spinning' | 'won'

export const wheelPhase = (): WheelPhase => {
  const v = document.documentElement.dataset.wheel
  return v === 'spinning' || v === 'won' ? v : 'idle'
}

// Energia suavizada para laços de animação (canvas/WebGL): spin sobe em
// ~0,5 s ao girar e desce em ~1,5 s ao parar; win salta para 1 quando a roda
// para no vencedor e some em ~4 s. Chame a cada quadro com o dt em ms.
// Devolve sempre o mesmo objeto (nada alocado por quadro): leia os valores
// na hora, com const { spin, win } = energy(dt).
export const createWheelEnergy = () => {
  const energy = { spin: 0, win: 0 }
  let last: WheelPhase = 'idle'
  return (dt: number) => {
    const phase = wheelPhase()
    if (phase === 'won' && last !== 'won') energy.win = 1
    last = phase
    const s = Math.min(Math.max(dt, 0), 250) / 1000
    const target = phase === 'spinning' ? 1 : 0
    const rate = target > energy.spin ? 4 : 1.5
    energy.spin += (target - energy.spin) * (1 - Math.exp(-s * rate))
    energy.win *= Math.exp(-s / 1.3)
    return energy
  }
}

// Fase atual como estado React (re-renderiza só quando ela muda)
export function useWheelPhase(): WheelPhase {
  const [phase, setPhase] = useState<WheelPhase>('idle')
  useEffect(() => {
    setPhase(wheelPhase())
    const observer = new MutationObserver(() => setPhase(wheelPhase()))
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-wheel'],
    })
    return () => observer.disconnect()
  }, [])
  return phase
}
