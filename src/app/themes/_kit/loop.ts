'use client'

import { useEffect, useRef } from 'react'

// Laço de animação para camadas desenhadas em JS (canvas 2D ou WebGL).
// Regras que ele garante para todas as cenas:
// - limite de quadros por segundo (fps), sem acumular atraso;
// - pausa com a aba oculta;
// - pausa com o modal do vencedor aberto (data-dialog no <html>); o relógio
//   para junto, como as animações CSS da cena, e as duas seguem em sincronia;
// - com prefers-reduced-motion desenha um quadro só, no instante `still`, e
//   redesenha quando a fase da roleta (data-wheel) muda;
// - tempo em ms desde a montagem, ou window.__sceneTime quando definido
//   (o roteiro de capturas usa para fotografar um instante exato do ciclo;
//   o evento 'scene:redraw' força o redesenho).
// Mantenha o draw barato: nada de alocar objetos por quadro.

declare global {
  interface Window {
    __sceneTime?: number
  }
}

export interface SceneLoopOptions {
  // quadros por segundo (padrão 30; pixel art fica bem com 12–24)
  fps?: number
  // instante (ms) desenhado quando o usuário prefere menos movimento
  still?: number
}

export function useSceneLoop(
  draw: (t: number, dt: number) => void,
  { fps = 30, still = 0 }: SceneLoopOptions = {},
) {
  const drawRef = useRef(draw)
  useEffect(() => {
    drawRef.current = draw
  })

  useEffect(() => {
    const root = document.documentElement
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const origin = performance.now()
    const step = 1000 / fps
    let pausedAt: number | null = null
    let pausedFor = 0
    const now = () =>
      window.__sceneTime ?? performance.now() - origin - pausedFor
    let raf = 0
    let last = 0
    let prev = 0

    const frame = (ts: number) => {
      raf = requestAnimationFrame(frame)
      const gap = ts - last
      if (gap < step - 1) return
      // mantém a cadência média sem disparar quadros em rajada
      last = gap > step * 4 ? ts : ts - (gap % step)
      const t = now()
      drawRef.current(t, Math.min(Math.max(t - prev, 0), 250))
      prev = t
    }
    const sync = () => {
      cancelAnimationFrame(raf)
      raf = 0
      const dialog = root.dataset.dialog === 'open'
      if (dialog && pausedAt === null) pausedAt = performance.now()
      if (!dialog && pausedAt !== null) {
        pausedFor += performance.now() - pausedAt
        pausedAt = null
      }
      if (motion.matches) {
        drawRef.current(window.__sceneTime ?? still, 0)
        return
      }
      if (document.hidden || dialog) return
      prev = now()
      last = 0
      raf = requestAnimationFrame(frame)
    }

    sync()
    const observer = new MutationObserver(sync)
    observer.observe(root, {
      attributes: true,
      attributeFilter: ['data-wheel', 'data-dialog'],
    })
    document.addEventListener('visibilitychange', sync)
    motion.addEventListener('change', sync)
    window.addEventListener('scene:redraw', sync)
    return () => {
      cancelAnimationFrame(raf)
      observer.disconnect()
      document.removeEventListener('visibilitychange', sync)
      motion.removeEventListener('change', sync)
      window.removeEventListener('scene:redraw', sync)
    }
  }, [fps, still])
}
