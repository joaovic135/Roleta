'use client'

import { useEffect, useRef } from 'react'
import { useCanvasFit } from './canvas'
import { useSceneLoop } from './loop'
import { createWheelEnergy } from './wheel'

// Camada de fundo em WebGL: um triângulo cobrindo o canvas e um fragment
// shader. Custo baixo por padrão: metade da resolução CSS (sem multiplicar
// pela densidade da tela; o CSS amplia suavizando) e 30 fps; pausa com a
// aba oculta e, com prefers-reduced-motion, desenha um quadro só (no
// instante `still`, em segundos).
//
// O shader é escrito em GLSL ES 1.0 (gl_FragColor, texture2D). Com WebGL2
// ele é convertido para GLSL ES 3.00 (#version 300 es, out fragColor) e
// pode usar trechos só de lá com #if __VERSION__ >= 300. Reservas, nesta
// ordem: WebGL2 com a fonte convertida, WebGL2 com a fonte original (o
// WebGL2 também aceita GLSL ES 1.0), WebGL1. O canvas ganha data-glv com
// o caminho em uso: "2", "2-es1" ou "1". localStorage 'roleta.gl' = '1'
// força WebGL1 (para testar a reserva).
//
// Uniforms prontos (declare no shader só os que usar):
//   uniform float u_time;  // segundos desde a montagem
//   uniform vec2  u_res;   // tamanho do canvas em pixels
//   uniform float u_css;   // px CSS por px do canvas (2 com scale 0,5)
//   uniform float u_spin;  // 0..1, sobe enquanto a roleta gira
//   uniform float u_win;   // 1 quando a roleta para no vencedor, decai em ~4 s
// Extras: prop `uniforms`, chamada a cada quadro com (t em s) e devolvendo
// { nome: número | [x, y] | [x, y, z] | [x, y, z, w] }.
//
// O contexto usa alpha pré-multiplicado: devolva gl_FragColor com rgb já
// multiplicado por a (ou a = 1 para camada opaca).
// Sem WebGL (ou com o contexto perdido) o canvas fica vazio e ganha
// data-gl="off": deixe uma camada CSS por baixo como reserva. Ao voltar o
// contexto (webglcontextrestored) tudo é recriado e o desenho continua.
// Ao desmontar, o programa e o buffer são apagados e, se o canvas saiu da
// página, o contexto é liberado na hora (WEBGL_lose_context) em vez de
// esperar o coletor de lixo (o navegador limita os contextos vivos).

type Uniform = number | number[]
type GL = WebGLRenderingContext | WebGL2RenderingContext

interface ShaderCanvasProps {
  frag: string
  className?: string
  // fração da resolução CSS (padrão 0,5; o CSS amplia suavizando)
  scale?: number
  fps?: number
  still?: number
  uniforms?: (t: number) => Record<string, Uniform>
}

const VERT1 = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}'
const VERT3 =
  '#version 300 es\nin vec2 p;void main(){gl_Position=vec4(p,0.,1.);}'

// GLSL ES 1.0 -> 3.00: a saída é declarada logo antes do main (depois da
// precisão padrão do shader) e os nomes antigos viram os novos
const toES3 = (src: string) =>
  '#version 300 es\n' +
  src
    .replace(/\bgl_FragColor\b/g, 'fragColor')
    .replace(/\btexture2D\b/g, 'texture')
    .replace(/\bvarying\b/g, 'in')
    .replace(/\bvoid\s+main\s*\(/, 'out highp vec4 fragColor;\nvoid main(')

const forceGL1 = () => {
  try {
    return window.localStorage.getItem('roleta.gl') === '1'
  } catch {
    return false
  }
}

const ATTRS: WebGLContextAttributes = {
  alpha: true,
  premultipliedAlpha: true,
  antialias: false,
  depth: false,
  stencil: false,
  powerPreference: 'low-power',
}

// compila e liga; devolve null (com o log no console) se falhar
const build = (ctx: GL, vert: string, frag: string, quiet: boolean) => {
  const shader = (type: number, src: string) => {
    const s = ctx.createShader(type)
    if (!s) return null
    ctx.shaderSource(s, src)
    ctx.compileShader(s)
    if (!ctx.getShaderParameter(s, ctx.COMPILE_STATUS)) {
      if (!quiet) console.error('[ShaderCanvas]', ctx.getShaderInfoLog(s))
      ctx.deleteShader(s)
      return null
    }
    return s
  }
  const vs = shader(ctx.VERTEX_SHADER, vert)
  const fs = vs && shader(ctx.FRAGMENT_SHADER, frag)
  const program = fs && ctx.createProgram()
  if (!vs || !fs || !program) {
    ctx.deleteShader(vs)
    ctx.deleteShader(fs)
    return null
  }
  ctx.attachShader(program, vs)
  ctx.attachShader(program, fs)
  ctx.bindAttribLocation(program, 0, 'p')
  ctx.linkProgram(program)
  // ligado, o programa guarda o binário: os shaders podem ir embora
  ctx.detachShader(program, vs)
  ctx.detachShader(program, fs)
  ctx.deleteShader(vs)
  ctx.deleteShader(fs)
  if (!ctx.getProgramParameter(program, ctx.LINK_STATUS)) {
    if (!quiet) console.error('[ShaderCanvas]', ctx.getProgramInfoLog(program))
    ctx.deleteProgram(program)
    return null
  }
  return program
}

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
    ctx: GL
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

    // o tipo de contexto fica preso ao canvas: o primeiro que vingar vale
    // para sempre (inclusive depois de perdido e restaurado)
    const context = (): GL | null => {
      if (!forceGL1()) {
        const c2 = canvas.getContext('webgl2', ATTRS)
        if (c2) return c2
      }
      return canvas.getContext('webgl', ATTRS)
    }

    const init = () => {
      gl.current = null
      const ctx = context()
      if (!ctx || ctx.isContextLost()) return fail()
      const v2 =
        typeof WebGL2RenderingContext !== 'undefined' &&
        ctx instanceof WebGL2RenderingContext
      let program = v2 ? build(ctx, VERT3, toES3(frag), true) : null
      // "2" = GLSL ES 3.00; "2-es1" = WebGL2 com a fonte original; "1"
      let glv = '2'
      if (!program) {
        if (v2)
          console.warn('[ShaderCanvas] GLSL ES 3.00 falhou, usando a fonte 1.0')
        program = build(ctx, VERT1, frag, false)
        glv = v2 ? '2-es1' : '1'
      }
      if (!program) return fail()
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
      canvas.dataset.glv = glv
      window.dispatchEvent(new Event('scene:redraw'))
    }
    const fail = () => {
      gl.current = null
      buffer = null
      canvas.dataset.gl = 'off'
    }
    // preventDefault avisa que queremos o contexto de volta
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
      gl.current = null
      if (!g || g.ctx.isContextLost()) return
      g.ctx.deleteBuffer(buffer)
      g.ctx.deleteProgram(g.program)
      // desmontou de vez (troca de tema): libera o contexto já. No
      // StrictMode e na troca de `frag` o mesmo canvas segue na página e o
      // efeito roda de novo com ele, então só depois de conferir.
      const ctx = g.ctx
      setTimeout(() => {
        if (!canvas.isConnected && !ctx.isContextLost())
          ctx.getExtension('WEBGL_lose_context')?.loseContext()
      }, 0)
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
      // mesma conta do useCanvasFit (scale < 1 ignora a densidade da tela)
      const css =
        scale < 1
          ? 1 / scale
          : 1 / (scale * Math.min(window.devicePixelRatio || 1, 1.5))
      set('u_css', css)
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
