'use client'

import { RefObject, useEffect, useRef } from 'react'

// Mantém o canvas do tamanho que ele ocupa na tela:
// - scale < 1: fração dos pixels CSS, ignorando a densidade da tela (barato;
//   para pixel art use ex.: 1/4 e image-rendering: pixelated no CSS, o
//   navegador amplia sem suavizar);
// - scale >= 1: pixels CSS × scale × devicePixelRatio (limitado a maxDpr).
// Devolve uma ref com a largura/altura atuais do canvas (em pixels dele) e
// chama onResize depois de cada mudança (o canvas é limpo ao redimensionar).
export function useCanvasFit(
  ref: RefObject<HTMLCanvasElement | null>,
  { scale = 1, maxDpr = 1.5 }: { scale?: number; maxDpr?: number } = {},
  onResize?: (w: number, h: number) => void,
) {
  const size = useRef({ w: 0, h: 0 })
  const onResizeRef = useRef(onResize)
  useEffect(() => {
    onResizeRef.current = onResize
  })

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const fit = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, maxDpr)
      const k = scale < 1 ? scale : scale * dpr
      const w = Math.max(1, Math.round(canvas.clientWidth * k))
      const h = Math.max(1, Math.round(canvas.clientHeight * k))
      if (w === canvas.width && h === canvas.height) return
      canvas.width = w
      canvas.height = h
      size.current = { w, h }
      onResizeRef.current?.(w, h)
    }
    fit()
    const observer = new ResizeObserver(fit)
    observer.observe(canvas)
    return () => observer.disconnect()
  }, [ref, scale, maxDpr])

  return size
}
