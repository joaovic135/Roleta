'use client'

import { useEffect, useRef } from 'react'

// Laço de animação para camadas desenhadas em JS (canvas 2D ou WebGL).
// Regras que ele garante para todas as cenas:
// - limite de quadros por segundo (fps), sem acumular atraso;
// - entre um quadro e outro o laço espera num timer e só pede o
//   requestAnimationFrame perto da hora: um rAF pendente obriga o navegador
//   a rodar o quadro inteiro no main thread (recalcular o estilo de todas as
//   animações CSS da cena, pintar, commit) em cada vsync, mesmo quando o
//   draw pula o quadro. A 30 fps numa tela de 120 Hz eram 4 quadros do main
//   thread para cada desenho;
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

// folga para o timer acordar antes do vsync em que o quadro cai (timers
// atrasam alguns ms; se perder o vsync, o quadro sai no seguinte)
const WAKE_EARLY = 8

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
    let timer = 0
    let last = 0
    let prev = 0

    const stop = () => {
      cancelAnimationFrame(raf)
      clearTimeout(timer)
      raf = 0
      timer = 0
    }
    // pede o próximo quadro: dorme no timer até perto da hora e só então
    // pede o rAF (que alinha o desenho ao vsync)
    const schedule = () => {
      const wait = last + step - performance.now() - WAKE_EARLY
      if (wait > 4) {
        timer = window.setTimeout(() => {
          timer = 0
          raf = requestAnimationFrame(frame)
        }, wait)
      } else raf = requestAnimationFrame(frame)
    }
    const frame = (ts: number) => {
      raf = 0
      const gap = ts - last
      if (gap >= step - 1) {
        // mantém a cadência média sem disparar quadros em rajada
        last = gap > step * 4 ? ts : ts - (gap % step)
        const t = now()
        drawRef.current(t, Math.min(Math.max(t - prev, 0), 250))
        prev = t
      }
      schedule()
    }
    const sync = () => {
      stop()
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
      stop()
      observer.disconnect()
      document.removeEventListener('visibilitychange', sync)
      motion.removeEventListener('change', sync)
      window.removeEventListener('scene:redraw', sync)
    }
  }, [fps, still])
}
