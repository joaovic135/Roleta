// Movimento do giro da roda, com física de roleta de verdade:
// - recuo curto antes de arrancar (a mão puxa a roda para trás);
// - arrancada suave (a roda tem inércia: a velocidade sobe em ~0,35 s);
// - atrito + resistência do ar: a velocidade cai como (1 − t)^p, devagar
//   no começo e se arrastando nas últimas fatias;
// - no fim a roda passa um pouco do ponto e o pino do ponteiro a empurra
//   de volta (o "balanço" nunca sai da fatia sorteada);
// - o ponteiro é uma mola: cada pino o empurra enquanto passa por baixo e o
//   solta com um estalo; em alta velocidade ele fica tremulando;
// - desfoque de movimento: uma cópia borrada da roda (desenhada uma vez)
//   aparece por cima conforme a velocidade.
//
// O rotor e o desfoque andam por WAAPI (no compositor: a roda não engasga
// se a thread principal travar); o ponteiro e os estalos seguem por rAF,
// lendo o mesmo relógio da animação.

import { random } from './wheel'

interface SpinOptions {
  rotor: HTMLElement
  pointer: HTMLElement | null
  start: number
  end: number
  durationMs: number
  // instante (relógio do performance.now) em que a roda deve sair
  startAt: Promise<number>
  count: number
  onTick: () => void
  onDone: () => void
}

const SAMPLES = 2048
const smoothstep = (x: number) => {
  const t = Math.min(1, Math.max(0, x))
  return t * t * (3 - 2 * t)
}

// Curva do giro: ângulo em função do tempo (ms desde a saída)
const buildProfile = (
  start: number,
  end: number,
  durationMs: number,
  slice: number,
  calm: boolean,
) => {
  // folga até a borda da próxima fatia: o balanço final cabe nela
  const angle = (((-end % 360) + 360) % 360) % slice
  const overshoot = calm ? 0 : Math.min(2.4, slice * 0.22, angle * 0.6)
  const windMs = calm ? 0 : Math.min(320, durationMs * 0.07)
  const windDeg = calm ? 0 : 5 + random() * 3
  const settleMs = overshoot > 0 ? Math.min(650, durationMs * 0.1) : 0
  const mainMs = durationMs - windMs - settleMs
  const ramp = Math.min(0.14, 380 / mainMs)
  const power = 1.4

  // posição acumulada da fase principal (0 → 1), por integração numérica
  const cum = new Float64Array(SAMPLES + 1)
  for (let i = 1; i <= SAMPLES; i++) {
    const t = (i - 0.5) / SAMPLES
    cum[i] = cum[i - 1] + smoothstep(t / ramp) * Math.pow(1 - t, power)
  }
  const total = cum[SAMPLES]
  const from = start - windDeg
  const travel = end + overshoot - from

  return (ms: number): number => {
    if (ms <= 0) return start
    if (ms < windMs) {
      // recuo: sai devagar, para e fica pronto para arrancar
      return start - windDeg * smoothstep(ms / windMs)
    }
    ms -= windMs
    if (ms < mainMs) {
      const x = (ms / mainMs) * SAMPLES
      const i = Math.floor(x)
      const p = cum[i] + (cum[Math.min(SAMPLES, i + 1)] - cum[i]) * (x - i)
      return from + (travel * p) / total
    }
    ms -= mainMs
    if (ms < settleMs) {
      // o pino empurra de volta: cosseno sem tranco nas pontas
      return end + (overshoot * (1 + Math.cos((Math.PI * ms) / settleMs))) / 2
    }
    return end
  }
}

export const spinWheel = ({
  rotor,
  pointer,
  start,
  end,
  durationMs,
  startAt,
  count,
  onTick,
  onDone,
}: SpinOptions) => {
  const calm =
    typeof matchMedia === 'function' &&
    matchMedia('(prefers-reduced-motion: reduce)').matches
  const slice = 360 / Math.max(1, count)
  const at = buildProfile(start, end, durationMs, slice, calm)
  const blur = rotor.querySelector<HTMLCanvasElement>('.wheel-blur')
  const face = rotor.querySelector<HTMLCanvasElement>('.wheel-face')

  let raf = 0
  let cancelled = false
  let rotorAnim: Animation | null = null
  let blurAnim: Animation | null = null

  // velocidade (graus/s) → opacidade do desfoque
  const blurFor = (speed: number) =>
    Math.min(0.9, Math.max(0, (speed - 240) / 900))

  const paintBlur = () => {
    if (!blur || !face || calm) return false
    const size = face.width
    if (blur.width !== size) {
      blur.width = size
      blur.height = size
    }
    const ctx = blur.getContext('2d')
    if (!ctx) return false
    ctx.clearRect(0, 0, size, size)
    // média de cópias giradas: alpha 1/(k+1) mantém a média exata
    const copies = 15
    const spread = Math.min(14, slice * 0.9)
    for (let k = 0; k < copies; k++) {
      const a = ((k / (copies - 1) - 0.5) * spread * Math.PI) / 180
      ctx.save()
      ctx.globalAlpha = 1 / (k + 1)
      ctx.translate(size / 2, size / 2)
      ctx.rotate(a)
      ctx.drawImage(face, -size / 2, -size / 2)
      ctx.restore()
    }
    return true
  }

  startAt.then((t0) => {
    if (cancelled) return
    // uma chave a cada ~16 ms: o compositor interpola linear entre elas
    const steps = Math.max(2, Math.round(durationMs / 16))
    const frames: Keyframe[] = []
    const blurFrames: Keyframe[] = []
    let prev = at(0)
    for (let i = 0; i <= steps; i++) {
      const ms = (i / steps) * durationMs
      const deg = at(ms)
      frames.push({ transform: `rotate(${deg.toFixed(3)}deg)` })
      const speed = i ? Math.abs(deg - prev) / (durationMs / steps / 1000) : 0
      blurFrames.push({ opacity: blurFor(speed).toFixed(3) })
      prev = deg
    }
    blurFrames[blurFrames.length - 1] = { opacity: 0 }

    const timing: KeyframeAnimationOptions = {
      duration: durationMs,
      easing: 'linear',
      fill: 'forwards',
    }
    rotorAnim = rotor.animate(frames, timing)
    rotorAnim.startTime = t0
    if (paintBlur() && blur) {
      blurAnim = blur.animate(blurFrames, timing)
      blurAnim.startTime = t0
    }

    // ---- ponteiro: mola amortecida + pinos nas bordas das fatias
    const MAX_DEFLECT = -26
    const contact = Math.min(slice * 0.45, 6)
    const stiffness = Math.pow(2 * Math.PI * 8.5, 2)
    const damping = 2 * 0.28 * Math.sqrt(stiffness)
    let phi = 0
    let omega = 0
    let lastNow = t0
    let lastAngle = at(0)
    let lastTickAt = 0
    let finished = false
    let restFrames = 0

    // quanto falta para o próximo pino chegar à ponta do ponteiro
    const ahead = (deg: number) => (((-deg % 360) + 360) % 360) % slice
    // ponteiro empurrado pelo pino que se aproxima (0 se longe)
    const pushed = (deg: number) => {
      const d = ahead(deg)
      return d < contact ? MAX_DEFLECT * (1 - d / contact) : 0
    }

    const frame = (now: number) => {
      if (cancelled) return
      const elapsed = Math.min(durationMs, Math.max(0, now - t0))
      const angle = at(elapsed)

      // passos curtos: em alta velocidade vários pinos passam por quadro
      const dt = Math.min(0.05, Math.max(0, (now - lastNow) / 1000))
      const sub = Math.max(1, Math.ceil(dt / 0.004))
      let prevA = lastAngle
      for (let s = 1; s <= sub; s++) {
        const a = lastAngle + ((angle - lastAngle) * s) / sub
        const h = dt / sub
        // passou um pino pela ponta: estalo
        if (
          Math.floor(a / slice) !== Math.floor(prevA / slice) &&
          now - lastTickAt > 35
        ) {
          lastTickAt = now
          onTick()
        }
        prevA = a
        omega += (-stiffness * phi - damping * omega) * h
        phi += omega * h
        const push = pushed(a)
        if (phi > push) {
          // o pino arrasta o ponteiro junto
          if (h > 0) omega = Math.min(omega, (push - phi) / h)
          phi = push
        }
        phi = Math.min(12, Math.max(-34, phi))
      }
      lastAngle = angle
      lastNow = now
      if (pointer) pointer.style.transform = `rotate(${phi.toFixed(2)}deg)`

      if (elapsed >= durationMs && !finished) {
        finished = true
        // fixa o ângulo final no estilo e solta as animações
        rotor.style.transform = `rotate(${(end % 360).toFixed(3)}deg)`
        rotorAnim?.cancel()
        blurAnim?.cancel()
        onDone()
      }
      // depois que a roda para, a mola ainda assenta o ponteiro
      if (finished) {
        restFrames =
          Math.abs(omega) < 2 && Math.abs(phi - pushed(angle)) < 0.2
            ? restFrames + 1
            : 0
        if (restFrames > 3) return
      }
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)
  })

  return {
    cancel: () => {
      cancelled = true
      cancelAnimationFrame(raf)
      rotorAnim?.cancel()
      blurAnim?.cancel()
    },
  }
}
