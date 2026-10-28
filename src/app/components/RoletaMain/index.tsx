'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import RouletteWheel from '../RouletteWheel'
import SpinSettings, { SpinButton } from '../SpinControl'
import SpinRail from '../SpinRail'
import ThemePicker from '../ThemePicker'
import {
  DEFAULT_THEME_ID,
  RANDOM_THEME_ID,
  applyTheme,
  currentRandomTheme,
  isKnownTheme,
  getTheme,
  rollRandomTheme,
} from '@/app/utils/themes'
import OptionsEditor from '../OptionsEditor'
import HistoryPanel from '../HistoryPanel'
import ImportBanner from '../ImportBanner'
import { preloadTmdbImage } from '../TmdbImage'
import CardTable, { CardTableHandle, cardSeconds } from '../CardTable'
import ModeToggle from '../ModeToggle'
import { HistoryEntry, RouletteOption, RouletteSettings } from '@/app/types'
import { RouletteImport, takeRouletteImport } from '@/app/utils/rouletteImport'
import { Movie } from '@/app/utils/tmdbApi'
import { PALETTE, isLegacyColor, pickColor } from '@/app/utils/colors'
import { usePersistentState } from '@/app/hooks/usePersistentState'
import { MAX_SPIN_SECONDS, useWheelSound } from '@/app/hooks/useWheelSound'
import {
  buildSegments,
  createOption,
  parseOptionsText,
  random,
  autoSegmentsPerOption,
  segmentIndexAt,
  spinTarget,
  uid,
} from '@/app/utils/wheel'
import { spinWheel } from '@/app/utils/spinMotion'
import { pauseSceneAnimations } from '@/app/utils/scenePause'

const DEFAULT_SETTINGS: RouletteSettings = {
  spinTime: 10,
  segmentsPerOption: 3,
  volume: 0.4,
  muted: false,
  eliminationMode: false,
  autoSegments: true,
  theme: DEFAULT_THEME_ID,
  mode: 'wheel',
}

const DEFAULT_OPTIONS: RouletteOption[] = [
  { id: 'default-1', text: 'Opção 1', color: PALETTE[0], quantity: 1 },
  { id: 'default-2', text: 'Opção 2', color: PALETTE[1], quantity: 1 },
  { id: 'default-3', text: 'Opção 3', color: PALETTE[2], quantity: 1 },
]

const MAX_HISTORY = 50

// O modal (e a lib de confete) só é baixado quando a roleta gira
const loadWinnerDialog = () => import('../WinnerDialog')
const WinnerDialog = dynamic(loadWinnerDialog, { ssr: false })

// Migra as opções salvas no cookie pela versão anterior
const loadLegacyOptions = (): RouletteOption[] | undefined => {
  const saved = document.cookie
    .split('; ')
    .find((c) => c.startsWith('rouletteOptions='))
  if (!saved) return undefined
  try {
    const parsed: Omit<RouletteOption, 'id'>[] = JSON.parse(
      decodeURIComponent(saved.slice('rouletteOptions='.length)),
    )
    document.cookie = 'rouletteOptions=; path=/; max-age=0'
    return parsed.map((o) => ({
      id: uid(),
      text: o.text,
      color: o.color,
      quantity: Math.max(1, o.quantity || 1),
    }))
  } catch {
    return undefined
  }
}

const optionsToText = (options: RouletteOption[]) =>
  options.map((o) => o.text).join('\n')

export function RoletaMain() {
  const [options, setOptions, optionsLoaded] = usePersistentState<
    RouletteOption[]
  >('roleta.options', DEFAULT_OPTIONS, loadLegacyOptions)
  const [movies, setMovies, moviesLoaded] = usePersistentState<Movie[]>(
    'roleta.movies',
    [],
  )
  const [history, setHistory] = usePersistentState<HistoryEntry[]>(
    'roleta.history',
    [],
  )
  const [storedSettings, setStoredSettings, settingsLoaded] =
    usePersistentState<Partial<RouletteSettings>>('roleta.settings', {})
  const settings = { ...DEFAULT_SETTINGS, ...storedSettings }
  const updateSettings = (patch: Partial<RouletteSettings>) =>
    setStoredSettings((prev) => ({ ...prev, ...patch }))

  const [textInput, setTextInput] = useState(optionsToText(DEFAULT_OPTIONS))
  const [isSpinning, setIsSpinning] = useState(false)
  const [winner, setWinner] = useState<RouletteOption | null>(null)
  const [winnerIndex, setWinnerIndex] = useState<number | null>(null)
  // Destaque do vencedor na roda (escurece as outras fatias) só enquanto o
  // resultado é revelado; some ao fechar o modal
  const [celebrating, setCelebrating] = useState(false)
  const [showWinner, setShowWinner] = useState(false)
  // Vencedor já sorteado no começo do giro: o modal monta escondido com ele,
  // e abrir é só ligar a animação (nada de montar a árvore no último quadro)
  const [primedWinner, setPrimedWinner] = useState<RouletteOption | null>(null)
  const [spinRequest, setSpinRequest] = useState(0)
  const [pendingImport, setPendingImport] = useState<RouletteImport | null>(
    null,
  )
  const importCheckedRef = useRef(false)

  const rotorRef = useRef<HTMLDivElement>(null)
  const pointerRef = useRef<HTMLDivElement>(null)
  const rotationRef = useRef(0)
  const spinRef = useRef<ReturnType<typeof spinWheel> | null>(null)
  const revealTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const cardsRef = useRef<CardTableHandle>(null)

  const sound = useWheelSound(settings.volume, settings.muted)

  const segmentsPerOption = settings.autoSegments
    ? autoSegmentsPerOption(options)
    : settings.segmentsPerOption
  // Cores vêm do tema (pares complementares lado a lado), exceto as
  // escolhidas à mão
  // "Aleatório": o tema efetivo é o sorteado neste carregamento (pelo script
  // de boot no layout). Só é lido após montar, como o resto do estado salvo
  const isRandomTheme =
    settings.theme === RANDOM_THEME_ID || !isKnownTheme(settings.theme)
  const [randomThemeId, setRandomThemeId] = useState<string | null>(null)
  useEffect(() => {
    if (settingsLoaded && isRandomTheme && !randomThemeId)
      setRandomThemeId(currentRandomTheme())
  }, [settingsLoaded, isRandomTheme, randomThemeId])
  const theme = getTheme(isRandomTheme ? (randomThemeId ?? '') : settings.theme)
  // O tema também pinta o site inteiro (variáveis CSS por data-theme). Espera
  // o tema salvo/sorteado para não sobrescrever o que o script de boot aplicou
  const themeReady = settingsLoaded && (!isRandomTheme || !!randomThemeId)
  useEffect(() => {
    if (themeReady) document.documentElement.dataset.theme = theme.id
  }, [theme.id, themeReady])

  // As cenas de fundo reagem à roleta: data-wheel no <html> (girando /
  // vencedor em destaque) e --win-color com a cor da fatia vencedora.
  // A cor vai já no começo do giro, junto com data-wheel='spinning': mudar
  // uma variável no <html> recalcula o estilo da página inteira (40 ms nos
  // temas pesados), e na parada da roda isso engasgava a entrada do modal.
  // Nenhum tema mostra a --win-color fora do estado 'won' (conferido em
  // todos, com a roda girando).
  const wheelPhase = isSpinning ? 'spinning' : celebrating ? 'won' : 'idle'
  const winColor = (primedWinner ?? winner)?.color
  useEffect(() => {
    if (winColor)
      document.documentElement.style.setProperty('--win-color', winColor)
    document.documentElement.dataset.wheel = wheelPhase
  }, [wheelPhase, winColor])
  // Com o modal do vencedor aberto a cena para atrás do fundo escuro e libera
  // a GPU para a entrada do modal e o confete: data-dialog para os laços em
  // canvas/WebGL (useSceneLoop) e as animações CSS pausadas pela Web
  // Animations API (uma regra CSS no atributo recalculava o estilo da cena
  // inteira no primeiro quadro do modal)
  useEffect(() => {
    if (!showWinner) return
    const root = document.documentElement
    root.dataset.dialog = 'open'
    const resume = pauseSceneAnimations()
    return () => {
      delete root.dataset.dialog
      resume()
    }
  }, [showWinner])

  const coloredOptions = useMemo(
    () => applyTheme(options, theme),
    [options, theme],
  )
  const segments = useMemo(
    () => buildSegments(coloredOptions, segmentsPerOption),
    [coloredOptions, segmentsPerOption],
  )
  const movieById = useMemo(
    () => new Map(movies.map((m) => [m.id, m])),
    [movies],
  )
  const addedMovieIds = useMemo(
    () => new Set(options.flatMap((o) => (o.movieId ? [o.movieId] : []))),
    [options],
  )

  // Sincroniza o texto do editor depois de carregar as opções salvas
  useEffect(() => {
    if (!optionsLoaded) return
    setTextInput(optionsToText(options))
    if (options.some((o) => isLegacyColor(o.color))) {
      const recolored: RouletteOption[] = []
      options.forEach((o) =>
        recolored.push(
          isLegacyColor(o.color)
            ? { ...o, color: pickColor(recolored.map((r) => r.color)) }
            : o,
        ),
      )
      setOptions(recolored)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [optionsLoaded])

  // Remove dados de filmes que não estão mais na roleta
  useEffect(() => {
    if (!optionsLoaded || !moviesLoaded) return
    if (movies.some((m) => !addedMovieIds.has(m.id))) {
      setMovies((prev) => prev.filter((m) => addedMovieIds.has(m.id)))
    }
  }, [addedMovieIds, movies, optionsLoaded, moviesLoaded, setMovies])

  // Filmes enviados por outra página (ex.: /letterboxd). Lê uma vez só,
  // depois do estado salvo: o ref segura o efeito duplo do StrictMode, e o
  // import fica em memória até o usuário aplicar ou descartar
  useEffect(() => {
    if (!optionsLoaded || !moviesLoaded || importCheckedRef.current) return
    importCheckedRef.current = true
    const data = takeRouletteImport()
    if (data) setPendingImport(data)
  }, [optionsLoaded, moviesLoaded])

  // Qualquer mudança na roda apaga o destaque do último vencedor
  useEffect(() => {
    setWinnerIndex(null)
  }, [segments])

  useEffect(
    () => () => {
      spinRef.current?.cancel()
      if (revealTimeoutRef.current) clearTimeout(revealTimeoutRef.current)
    },
    [],
  )

  const commitOptions = (next: RouletteOption[]) => {
    setOptions(next)
    setTextInput(optionsToText(next))
  }

  const handleTextChange = (text: string) => {
    setTextInput(text)
    setOptions((prev) => parseOptionsText(text, prev))
  }

  const updateOption = (id: string, patch: Partial<RouletteOption>) =>
    commitOptions(options.map((o) => (o.id === id ? { ...o, ...patch } : o)))

  const removeOption = (id: string) =>
    commitOptions(options.filter((o) => o.id !== id))

  // Trocar de tema repinta tudo, inclusive cores escolhidas à mão
  // "Aleatório" sorteia na hora (de novo a cada clique), sem repetir o atual
  const changeTheme = (id: string) => {
    let applied = id
    if (id === RANDOM_THEME_ID) {
      applied = rollRandomTheme()
      setRandomThemeId(applied)
    }
    // Aplica já no clique: a roda redesenha (nos efeitos) lendo a fonte do
    // tema novo, e os efeitos dela rodam antes dos deste componente
    document.documentElement.dataset.theme = applied
    updateSettings({ theme: id })
    if (options.some((o) => o.customColor))
      setOptions(options.map((o) => ({ ...o, customColor: false })))
  }

  const shuffleOptions = () => {
    const next = [...options]
    for (let i = next.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1))
      ;[next[i], next[j]] = [next[j], next[i]]
    }
    commitOptions(next)
  }

  const handleAddMovie = (movie: Movie) => {
    if (addedMovieIds.has(movie.id)) return
    setMovies((prev) => [...prev.filter((m) => m.id !== movie.id), movie])
    commitOptions([
      ...options,
      createOption(movie.title, options, { movieId: movie.id }),
    ])
  }

  const applyImport = (mode: 'replace' | 'add') => {
    if (!pendingImport || isSpinning) return
    const next = mode === 'replace' ? [] : [...options]
    const seenIds = new Set(next.flatMap((o) => (o.movieId ? [o.movieId] : [])))
    const seenTexts = new Set(next.map((o) => o.text.toLowerCase()))
    const imported = new Map<number, Movie>()

    pendingImport.items.forEach(({ title, movie }) => {
      // Uma linha só: o editor de texto separa opções por quebra de linha
      const text = title.replace(/\s+/g, ' ').trim()
      const key = text.toLowerCase()
      if (!text || seenTexts.has(key) || (movie && seenIds.has(movie.id)))
        return
      seenTexts.add(key)
      if (movie) {
        seenIds.add(movie.id)
        imported.set(movie.id, movie)
      }
      // Acumula em `next` para cada opção nova pegar uma cor diferente
      next.push(createOption(text, next, movie ? { movieId: movie.id } : {}))
    })

    setPendingImport(null)
    if (imported.size > 0)
      setMovies((prev) => [
        ...prev.filter((m) => !imported.has(m.id)),
        ...imported.values(),
      ])
    commitOptions(next)
  }

  // O vencedor já está decidido: as imagens dele baixam durante o giro (ou
  // as cartas) e o modal abre sem esperar a rede
  const preloadWinner = (next: RouletteOption | undefined) => {
    setPrimedWinner(next ?? null)
    const nextMovie = next?.movieId ? movieById.get(next.movieId) : undefined
    if (nextMovie?.poster_path)
      preloadTmdbImage({
        path: nextMovie.poster_path,
        fill: true,
        sizes: '160px',
      })
    nextMovie?.watchProviders?.forEach((p) =>
      preloadTmdbImage({
        path: p.logo_path,
        kind: 'logo',
        width: 22,
        height: 22,
      }),
    )
  }

  // Fim do sorteio (roda ou cartas): resultado, histórico e modal
  const finishRound = (won: RouletteOption, index: number) => {
    setIsSpinning(false)
    setWinner(won)
    setWinnerIndex(index)
    setCelebrating(true)
    setHistory((prev) =>
      [
        {
          id: uid(),
          text: won.text,
          color: won.color,
          movieId: won.movieId,
          at: Date.now(),
        },
        ...prev,
      ].slice(0, MAX_HISTORY),
    )
    revealTimeoutRef.current = setTimeout(() => {
      setShowWinner(true)
      sound.win()
    }, 280)
  }

  const spin = () => {
    const cardsMode = settings.mode === 'cards'
    const rotor = rotorRef.current
    const table = cardsRef.current
    if (isSpinning || segments.length === 0) return
    if (cardsMode ? !table : !rotor) return

    const spinSeconds = Math.min(settings.spinTime, MAX_SPIN_SECONDS)
    sound.unlock()
    loadWinnerDialog()
    setShowWinner(false)
    setWinnerIndex(null)
    setCelebrating(false)
    setIsSpinning(true)

    const snapshot = segments
    const count = snapshot.length
    const start = rotationRef.current
    const end = spinTarget(start, spinSeconds)

    // Modo cartas: o mesmo sorteio da roda (a fatia sob o ponteiro no ângulo
    // final); o dealer só encena o resultado
    if (cardsMode && table) {
      const index = segmentIndexAt(end, count)
      const won = snapshot[index]
      preloadWinner(won)
      const seconds = cardSeconds(spinSeconds)
      table.play({
        segments: snapshot,
        winnerIndex: index,
        seconds,
        // as cartas começam junto com a música, para acabarem juntas
        start: sound.startSpin(seconds),
        onTick: sound.tick,
        onDone: () => finishRound(won, index),
      })
      return
    }
    if (!rotor) return

    // A roda só sai quando a música começa, para as duas acabarem juntas
    const index = segmentIndexAt(end, count)
    preloadWinner(snapshot[index])
    spinRef.current?.cancel()
    spinRef.current = spinWheel({
      rotor,
      pointer: pointerRef.current,
      start,
      end,
      durationMs: spinSeconds * 1000,
      startAt: sound.startSpin(spinSeconds),
      count,
      onTick: sound.tick,
      onDone: () => {
        rotationRef.current = end % 360
        finishRound(snapshot[index], index)
      },
    })
  }

  // "Girar de novo" espera a roda ser atualizada (ex.: vencedor removido)
  useEffect(() => {
    if (spinRequest > 0) spin()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spinRequest])

  const closeWinner = useCallback(
    (remove = settings.eliminationMode) => {
      setShowWinner(false)
      setCelebrating(false)
      if (remove && winner) {
        const next = options.filter((o) => o.id !== winner.id)
        setOptions(next)
        setTextInput(optionsToText(next))
      }
    },
    [settings.eliminationMode, winner, options, setOptions],
  )

  const handleClose = useCallback(() => closeWinner(), [closeWinner])

  // Espaço gira a roleta (fora de campos de texto e botões)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code !== 'Space' || e.repeat || showWinner) return
      const target = e.target as HTMLElement
      if (target.closest('input, textarea, select, button, [contenteditable]'))
        return
      e.preventDefault()
      spin()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const spinSettingsProps = {
    spinTime: settings.spinTime,
    setSpinTime: (spinTime: number) => updateSettings({ spinTime }),
    segmentsPerOption,
    setSegmentsPerOption: (segmentsPerOption: number) =>
      updateSettings({ segmentsPerOption }),
    autoSegments: settings.autoSegments,
    setAutoSegments: (autoSegments: boolean) =>
      updateSettings({ autoSegments }),
    eliminationMode: settings.eliminationMode,
    setEliminationMode: (eliminationMode: boolean) =>
      updateSettings({ eliminationMode }),
    isSpinning,
  }

  const lastResult = history[0]
  const canSpin = !isSpinning && segments.length > 0

  const dialogWinner = showWinner ? winner : (primedWinner ?? winner)

  return (
    // No desktop os cards terminam antes do pé da tela: a faixa de baixo fica
    // livre para a cena animada do tema aparecer
    <main className="mx-auto flex w-full max-w-7xl flex-col px-4 py-6 sm:py-8 lg:min-h-0 lg:max-w-[1600px] lg:flex-1 lg:pb-[clamp(2.5rem,16vh_-_4rem,8rem)] lg:pt-4">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-4 lg:mb-4">
        <div>
          <h1
            aria-label="Roleta"
            className="ui-title bg-gradient-to-r from-amber-200 via-amber-400 to-cta-2 bg-clip-text text-4xl font-black tracking-tight text-transparent sm:text-5xl lg:text-4xl"
          >
            <span className="ui-title-text">Roleta</span>
            {/* Variante do Vaporwave (letras largas + japonês) */}
            <span className="ui-title-vapor" aria-hidden="true">
              ＲＯＬＥＴＡ<small>ルーレット</small>
            </span>
          </h1>
          <p className="ui-subtitle mt-1 text-sm text-slate-400">
            <span className="ui-subtitle-text">
              Sorteie qualquer coisa — inclusive o filme da noite.
            </span>
            <span className="ui-subtitle-spider">
              Com grandes poderes vêm grandes sorteios.
            </span>
          </p>
        </div>

        <div className="ui-chip flex items-center gap-3 rounded-full border border-white/10 bg-slate-900/60 px-3 py-2">
          <button
            type="button"
            onClick={() => updateSettings({ muted: !settings.muted })}
            aria-label={settings.muted ? 'Ativar som' : 'Silenciar'}
            className="text-lg leading-none"
          >
            {settings.muted || settings.volume === 0 ? '🔇' : '🔊'}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={settings.muted ? 0 : settings.volume}
            onChange={(e) =>
              updateSettings({
                volume: parseFloat(e.target.value),
                muted: false,
              })
            }
            aria-label="Volume"
            className="w-24 cursor-pointer accent-amber-400"
          />
        </div>
      </header>

      <div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:min-h-0 lg:flex-1 lg:grid-cols-[auto_minmax(0,1fr)_320px] lg:grid-rows-[minmax(0,1fr)] xl:grid-cols-[auto_minmax(0,1fr)_440px]">
        {/* Temas: card separado à esquerda, só com as cores */}
        <ThemePicker
          themeId={theme.id}
          random={isRandomTheme}
          onChange={changeTheme}
          disabled={isSpinning}
        />

        <section className="ui-card flex flex-col gap-4 rounded-3xl border border-white/10 bg-slate-900/70 p-5 shadow-2xl sm:p-6 lg:min-h-0 lg:flex-row lg:gap-5 lg:p-5">
          {/* Configurações: barra à esquerda no desktop, abaixo da roda no celular */}
          {/* Configurações: trilho de ícones no desktop, painel no celular */}
          <aside className="order-last lg:order-first lg:shrink-0">
            <div className="lg:hidden">
              <SpinSettings {...spinSettingsProps} />
            </div>
            <div className="hidden lg:block">
              <SpinRail {...spinSettingsProps} />
            </div>
          </aside>

          <div className="flex flex-col gap-4 lg:min-h-0 lg:min-w-0 lg:flex-1 lg:gap-3">
            {pendingImport && (
              <ImportBanner
                data={pendingImport}
                disabled={isSpinning}
                onReplace={() => applyImport('replace')}
                onAdd={() => applyImport('add')}
                onDiscard={() => setPendingImport(null)}
              />
            )}
            {/* No desktop a roda ocupa o espaço que sobrar, limitada pela
              largura e pela altura (container query), para tudo caber na tela */}
            <div className="pt-4 lg:min-h-0 lg:flex-1">
              <div className="flex items-center justify-center lg:h-full lg:[container-type:size]">
                {settings.mode === 'cards' ? (
                  <CardTable
                    handleRef={cardsRef}
                    optionCount={coloredOptions.length}
                    active={isSpinning || celebrating}
                    canPlay={canSpin}
                    onPlay={spin}
                    movieById={movieById}
                  />
                ) : (
                  <RouletteWheel
                    segments={segments}
                    highlightIndex={celebrating ? winnerIndex : null}
                    isSpinning={isSpinning}
                    canSpin={canSpin}
                    onSpin={spin}
                    rotorRef={rotorRef}
                    pointerRef={pointerRef}
                    rotationRef={rotationRef}
                    movieById={movieById}
                  />
                )}
              </div>
            </div>

            <div className="flex h-9 shrink-0 items-center justify-center text-center">
              {isSpinning ? (
                <p className="animate-pulse text-sm font-medium text-slate-400">
                  Boa sorte…
                </p>
              ) : lastResult && winnerIndex !== null ? (
                <p className="flex items-center justify-center gap-2 text-lg">
                  <span className="text-slate-400">Resultado:</span>
                  <span
                    className="rounded-lg px-3 py-1 font-bold"
                    style={{
                      backgroundColor: `${lastResult.color}33`,
                      boxShadow: `inset 0 0 0 1px ${lastResult.color}88`,
                    }}
                  >
                    {lastResult.text}
                  </span>
                </p>
              ) : null}
            </div>

            {/* Modo do sorteio (roda ou cartas) ao lado do botão principal */}
            <div className="flex shrink-0 gap-2">
              <ModeToggle
                mode={settings.mode}
                onChange={(mode) => updateSettings({ mode })}
                disabled={isSpinning}
              />
              <div className="min-w-0 flex-1">
                <SpinButton
                  spinRoulette={spin}
                  isSpinning={isSpinning}
                  hasOptions={segments.length > 0}
                  mode={settings.mode}
                />
              </div>
            </div>
          </div>
        </section>

        <div className="flex flex-col gap-6 lg:min-h-0">
          <OptionsEditor
            options={coloredOptions}
            onAddMovie={handleAddMovie}
            addedMovieIds={addedMovieIds}
            textInput={textInput}
            onTextChange={handleTextChange}
            onAdd={(text) =>
              commitOptions([...options, createOption(text, options)])
            }
            onRemove={removeOption}
            onQuantityChange={(id, quantity) => updateOption(id, { quantity })}
            onColorChange={(id, color) =>
              updateOption(id, { color, customColor: true })
            }
            onShuffle={shuffleOptions}
            onClear={() => commitOptions([])}
            movies={movies}
            segmentsPerOption={segmentsPerOption}
            disabled={isSpinning}
          />
          <HistoryPanel history={history} onClear={() => setHistory([])} />
        </div>
      </div>

      {dialogWinner && (
        <WinnerDialog
          isOpen={showWinner}
          winner={dialogWinner}
          movie={
            dialogWinner.movieId
              ? movieById.get(dialogWinner.movieId)
              : undefined
          }
          eliminationMode={settings.eliminationMode}
          onClose={handleClose}
          onRemove={() => closeWinner(true)}
          onSpinAgain={() => {
            closeWinner()
            setSpinRequest((n) => n + 1)
          }}
        />
      )}
    </main>
  )
}

export default RoletaMain
