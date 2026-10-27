import { useCallback, useEffect, useRef } from 'react'

type WindowWithWebkit = typeof window & {
  webkitAudioContext?: typeof AudioContext
}

// O "tic" fica abaixo da música do giro
const TICK_GAIN = 0.15

// Duração de spinning-sound.mp3 (medida: 20,05 s). O giro mais longo
// possível toca a música inteira.
const SPIN_MUSIC_SECONDS = 20.05
export const MAX_SPIN_SECONDS = Math.floor(SPIN_MUSIC_SECONDS)

// Quanto esperar a música começar antes de soltar a roda mesmo assim
const MAX_AUDIO_WAIT_MS = 400

const play = (
  audio: HTMLAudioElement | null,
  { volume, muted }: { volume: number; muted: boolean },
) => {
  if (!audio) return
  audio.volume = volume
  audio.muted = muted
  audio.currentTime = 0
  audio.play().catch(() => {})
}

// Sons da roleta: a música do giro (sincronizada para acabar junto com a roda), um "tic" sintetizado a cada
// fatia que passa pelo ponteiro e a música de vitória.
export function useWheelSound(volume: number, muted: boolean) {
  const ctxRef = useRef<AudioContext | null>(null)
  const spinRef = useRef<HTMLAudioElement | null>(null)
  const winRef = useRef<HTMLAudioElement | null>(null)
  const settingsRef = useRef({ volume, muted })

  useEffect(() => {
    settingsRef.current = { volume, muted }
    for (const audio of [spinRef.current, winRef.current]) {
      if (!audio) continue
      audio.volume = volume
      audio.muted = muted
    }
  }, [volume, muted])

  useEffect(() => {
    const spin = new Audio()
    spin.preload = 'none'
    spin.src = '/spinning-sound.mp3'
    const win = new Audio()
    win.preload = 'none'
    win.src = '/winner.mp3'
    spinRef.current = spin
    winRef.current = win

    // Os áudios só são baixados com o navegador ocioso, fora do carregamento
    const preload = () => {
      spin.preload = 'auto'
      win.preload = 'auto'
      spin.load()
      win.load()
    }
    // Safari não tem requestIdleCallback
    const hasIdle = typeof window.requestIdleCallback === 'function'
    const idle = hasIdle
      ? window.requestIdleCallback(preload, { timeout: 4000 })
      : setTimeout(preload, 2000)

    return () => {
      if (hasIdle) window.cancelIdleCallback(idle as number)
      else clearTimeout(idle)
      spin.pause()
      win.pause()
      spinRef.current = null
      winRef.current = null
      ctxRef.current?.close()
      ctxRef.current = null
    }
  }, [])

  // Precisa ser chamado a partir de um gesto do usuário (clique/tecla)
  const unlock = useCallback(() => {
    if (!ctxRef.current) {
      const w = window as WindowWithWebkit
      const AudioCtx = w.AudioContext || w.webkitAudioContext
      if (AudioCtx) ctxRef.current = new AudioCtx()
    }
    ctxRef.current?.resume()
  }, [])

  // Toca o trecho final da música com a mesma duração do giro, para ela
  // terminar exatamente quando a roda para. Resolve com o instante em que a
  // roda deve começar a girar.
  const startSpin = useCallback(async (seconds: number) => {
    winRef.current?.pause()
    const audio = spinRef.current
    if (!audio) return performance.now()

    const length = Number.isFinite(audio.duration)
      ? audio.duration
      : SPIN_MUSIC_SECONDS
    const offset = Math.max(0, length - seconds)
    let wheelStartedAt = 0

    // Se o áudio demorar a carregar e começar depois da roda, pula o
    // atraso para continuar terminando junto com ela
    audio.addEventListener(
      'playing',
      () => {
        if (!wheelStartedAt) return
        const lag = (performance.now() - wheelStartedAt) / 1000
        if (lag > 0.05) audio.currentTime = offset + lag
      },
      { once: true },
    )

    audio.volume = settingsRef.current.volume
    audio.muted = settingsRef.current.muted
    audio.currentTime = offset
    await Promise.race([
      audio.play().catch(() => {}),
      new Promise((resolve) => setTimeout(resolve, MAX_AUDIO_WAIT_MS)),
    ])
    wheelStartedAt = performance.now()
    return wheelStartedAt
  }, [])

  const stopSpin = useCallback(() => {
    spinRef.current?.pause()
  }, [])

  const tick = useCallback(() => {
    const ctx = ctxRef.current
    const { volume, muted } = settingsRef.current
    if (!ctx || muted || volume <= 0) return

    const t = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'triangle'
    osc.frequency.setValueAtTime(1600, t)
    osc.frequency.exponentialRampToValueAtTime(500, t + 0.04)
    gain.gain.setValueAtTime(0.0001, t)
    gain.gain.exponentialRampToValueAtTime(TICK_GAIN * volume, t + 0.003)
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.05)
    osc.connect(gain).connect(ctx.destination)
    osc.start(t)
    osc.stop(t + 0.06)
  }, [])

  const win = useCallback(() => {
    spinRef.current?.pause()
    play(winRef.current, settingsRef.current)
  }, [])

  return { unlock, startSpin, stopSpin, tick, win }
}
