'use client'

import { useEffect, useRef } from 'react'
import { seeded, vars } from './geo'

// Luz e textura de projeção:
// - Facho do projetor: entra pelo canto de cima à direita (a cabine fica
//   atrás e acima da plateia) e abre na direção da tela. Cone em
//   conic-gradient (estático), raios finos piscando, poeira em suspensão
//   (três camadas de pontos em tile deslizando devagar, recortadas pelo
//   cone), fumaça de cigarro dos anos 50 e uma mariposa voando na luz.
// - Granulação: um tile de ruído gerado uma vez ao montar (canvas ->
//   data URL), tremido com steps(); riscos verticais e a "marca de troca
//   de rolo" (bolinha no canto) piscando por 4 quadros.
// - Surpresa rara (a cada 263 s): o filme engasga e queima no alto da
//   tela, um buraco branco de bordas em brasa que se alastra até o
//   projecionista cortar (um clarão suave e pronto).

export function Beam() {
  return (
    <div className="cn-beam">
      <div className="cn-beam-cyc">
        <i className="cn-beam-haze" />
        <i className="cn-beam-rays" />
        <i className="cn-beam-hot" />
        <div className="cn-dust">
          <i className="cn-mote cn-mote-a" />
          <i className="cn-mote cn-mote-b" />
          <i className="cn-mote cn-mote-c" />
          <i className="cn-smoke cn-smoke-a" />
          <i className="cn-smoke cn-smoke-b" />
          <div className="cn-moth">
            <i />
          </div>
        </div>
        <i className="cn-lens" />
      </div>
    </div>
  )
}

// tile de ruído: grãos claros e escuros esparsos (alfa ao cubo)
const noiseTile = (size: number) => {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  if (!ctx) return ''
  const img = ctx.createImageData(size, size)
  const rand = seeded(1895)
  for (let i = 0; i < size * size; i++) {
    const v = rand() * 2 - 1
    const c = v > 0 ? 255 : 0
    img.data[i * 4] = c
    img.data[i * 4 + 1] = c * 0.94
    img.data[i * 4 + 2] = c * 0.86
    img.data[i * 4 + 3] = Math.round(Math.abs(v) ** 3 * 255)
  }
  ctx.putImageData(img, 0, 0)
  return canvas.toDataURL('image/png')
}

export function Grain() {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const url = noiseTile(160)
    if (url) el.style.backgroundImage = `url(${url})`
  }, [])
  return <div ref={ref} className="cn-grain" />
}

// riscos de película (posições sorteadas; o CSS acende em quadros soltos)
const SCRATCHES = (() => {
  const rand = seeded(1927)
  return Array.from({ length: 4 }, (_, i) => ({
    x: 4 + rand() * 92,
    dark: i % 2 === 1,
  }))
})()

export function FilmWear() {
  return (
    <>
      <div className="cn-scratches">
        {SCRATCHES.map((s, i) => (
          <i
            key={i}
            className={s.dark ? 'cn-scratch cn-scratch-dark' : 'cn-scratch'}
            style={vars({ left: `${s.x.toFixed(1)}%`, '--cn-i': i })}
          />
        ))}
      </div>
      <i className="cn-hair" />
      <i className="cn-cue" />
      {/* surpresa rara: o filme engasga e queima no projetor */}
      <i className="cn-burn" />
      <i className="cn-burn-flash" />
    </>
  )
}
