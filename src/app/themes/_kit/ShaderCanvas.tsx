'use client'

import { useEffect, useRef } from 'react'
import { useCanvasFit } from './canvas'
import { useSceneLoop } from './loop'
import { createWheelEnergy } from './wheel'

// Camada de fundo em WebGL: um triângulo cobrindo o canvas e um fragment
// shader (GLSL ES 1.0). Custo baixo por padrão: metade da resolução CSS e
// 30 fps; pausa com a aba oculta e, com prefers-reduced-motion, desenha um
// quadro só (no instante `still`, em segundos).
//
// Uniforms prontos (declare no shader só os que usar):
//   uniform float u_time;  // segundos desde a montagem
//   uniform vec2  u_res;   // tamanho do canvas em pixels
//   uniform float u_spin;  // 0..1, sobe enquanto a roleta gira
//   uniform float u_win;   // 1 quando a roleta para no vencedor, decai em ~4 s
// Extras: prop `uniforms`, chamada a cada quadro com (t em s) e devolvendo
// { nome: número | [x, y] | [x, y, z] | [x, y, z, w] }.
//
// O contexto usa alpha pré-multiplicado: devolva gl_FragColor com rgb já
// multiplicado por a (ou a = 1 para camada opaca).
// Sem WebGL (ou com o contexto perdido) o canvas fica vazio e ganha
// data-gl="off": deixe uma camada CSS por baixo como reserva.

type Uniform = number | number[]

interface ShaderCanvasProps {
  frag: string
  className?: string
  // fração da resolução CSS (padrão 0,5; o CSS amplia suavizando)
  scale?: number
  fps?: number
  still?: number
  uniforms?: (t: number) => Record<string, Uniform>
}

const VERT = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}'

export default function ShaderCanvas({
  frag,
  className,
  scale = 0.5,
  fps = 30,
  still = 0,
  uniforms,
}: ShaderCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const gl = useRef<{
    ctx: WebGLRenderingContext
    program: WebGLProgram
    loc: Map<string, WebGLUniformLocation | null>
  } | null>(null)
  const energy = useRef(createWheelEnergy())
  const extra = useRef(uniforms)
  useEffect(() => {
    extra.current = uniforms
  })
  // redimensionar limpa o canvas: redesenha já (importa com reduced motion)
  useCanvasFit(canvasRef, { scale }, () =>
    window.dispatchEvent(new Event('scene:redraw')),
  )

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    let buffer: WebGLBuffer | null = null

    const init = () => {
      const ctx = canvas.getContext('webgl', {
        alpha: true,
        premultipliedAlpha: true,
        antialias: false,
        depth: false,
        stencil: false,
        powerPreference: 'low-power',
      })
      if (!ctx || ctx.isContextLost()) return fail()
      const shader = (type: number, src: string) => {
        const s = ctx.createShader(type)!
        ctx.shaderSource(s, src)
        ctx.compileShader(s)
        if (!ctx.getShaderParameter(s, ctx.COMPILE_STATUS))
          console.error('[ShaderCanvas]', ctx.getShaderInfoLog(s))
        return s
      }
      const program = ctx.createProgram()!
      ctx.attachShader(program, shader(ctx.VERTEX_SHADER, VERT))
      ctx.attachShader(program, shader(ctx.FRAGMENT_SHADER, frag))
      ctx.bindAttribLocation(program, 0, 'p')
      ctx.linkProgram(program)
      if (!ctx.getProgramParameter(program, ctx.LINK_STATUS)) {
        console.error('[ShaderCanvas]', ctx.getProgramInfoLog(program))
        return fail()
      }
      ctx.useProgram(program)
      buffer = ctx.createBuffer()
      ctx.bindBuffer(ctx.ARRAY_BUFFER, buffer)
      ctx.bufferData(
        ctx.ARRAY_BUFFER,
        new Float32Array([-1, -1, 3, -1, -1, 3]),
        ctx.STATIC_DRAW,
      )
      ctx.enableVertexAttribArray(0)
      ctx.vertexAttribPointer(0, 2, ctx.FLOAT, false, 0, 0)
      gl.current = { ctx, program, loc: new Map() }
      delete canvas.dataset.gl
      window.dispatchEvent(new Event('scene:redraw'))
    }
    const fail = () => {
      gl.current = null
      canvas.dataset.gl = 'off'
    }
    const lost = (e: Event) => {
      e.preventDefault()
      fail()
    }

    init()
    canvas.addEventListener('webglcontextlost', lost)
    canvas.addEventListener('webglcontextrestored', init)
    return () => {
      canvas.removeEventListener('webglcontextlost', lost)
      canvas.removeEventListener('webglcontextrestored', init)
      const g = gl.current
      if (g) {
        g.ctx.deleteBuffer(buffer)
        g.ctx.deleteProgram(g.program)
      }
      gl.current = null
    }
  }, [frag])

  useSceneLoop(
    (t, dt) => {
      const g = gl.current
      const canvas = canvasRef.current
      if (!g || !canvas) return
      const { ctx, program, loc } = g
      const at = (name: string) => {
        if (!loc.has(name)) loc.set(name, ctx.getUniformLocation(program, name))
        return loc.get(name)
      }
      const set = (name: string, v: Uniform) => {
        const l = at(name)
        if (!l) return
        if (typeof v === 'number') ctx.uniform1f(l, v)
        else if (v.length === 2) ctx.uniform2f(l, v[0], v[1])
        else if (v.length === 3) ctx.uniform3f(l, v[0], v[1], v[2])
        else ctx.uniform4f(l, v[0], v[1], v[2], v[3])
      }
      const seconds = t / 1000
      const { spin, win } = energy.current(dt)
      ctx.viewport(0, 0, canvas.width, canvas.height)
      set('u_time', seconds)
      const res = at('u_res')
      if (res) ctx.uniform2f(res, canvas.width, canvas.height)
      set('u_spin', spin)
      set('u_win', win)
      const more = extra.current?.(seconds)
      if (more) for (const name in more) set(name, more[name])
      ctx.drawArrays(ctx.TRIANGLES, 0, 3)
    },
    { fps, still: still * 1000 },
  )

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />
}
