'use client'

import React, { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ImportItem, queueRouletteImport } from '@/app/utils/rouletteImport'
import { random } from '@/app/utils/wheel'

interface SendToRouletteProps {
  source: string
  items: ImportItem[]
  streamingIds?: number[]
  label?: string
}

const SIZES = [8, 12, 20]

type Size = number | 'all'

// Sorteia `n` itens sem repetição (Fisher-Yates parcial)
const sample = <T,>(list: T[], n: number): T[] => {
  const pool = [...list]
  const count = Math.min(n, pool.length)
  for (let i = 0; i < count; i++) {
    const j = i + Math.floor(random() * (pool.length - i))
    ;[pool[i], pool[j]] = [pool[j], pool[i]]
  }
  return pool.slice(0, count)
}

const focusRing =
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300'

const SendToRoulette: React.FC<SendToRouletteProps> = ({
  source,
  items,
  streamingIds,
  label,
}) => {
  const router = useRouter()
  const [size, setSize] = useState<Size>(12)
  const [onlyStreaming, setOnlyStreaming] = useState(false)
  const [sending, setSending] = useState(false)

  const streamingSet = useMemo(
    () => new Set(streamingIds ?? []),
    [streamingIds],
  )
  const streamingCount = useMemo(
    () =>
      items.filter((item) => item.movie && streamingSet.has(item.movie.id))
        .length,
    [items, streamingSet],
  )
  const hasStreaming = streamingSet.size > 0

  const pool = useMemo(
    () =>
      hasStreaming && onlyStreaming
        ? items.filter((item) => item.movie && streamingSet.has(item.movie.id))
        : items,
    [items, hasStreaming, onlyStreaming, streamingSet],
  )

  const sizes = SIZES.filter((n) => n < pool.length)
  // Tamanho escolhido que não cabe mais (ex.: filtro de streaming) vira Todos
  const activeSize: Size = size !== 'all' && sizes.includes(size) ? size : 'all'
  const count = activeSize === 'all' ? pool.length : activeSize
  const disabled = count === 0 || sending

  const send = () => {
    if (disabled) return
    setSending(true)
    queueRouletteImport({ source, items: sample(pool, count) })
    router.push('/')
  }

  const chipClass = (active: boolean) =>
    `rounded-full border px-3 py-1 text-xs font-semibold tabular-nums transition ${focusRing} ${
      active
        ? 'border-amber-400/60 bg-amber-400/15 text-amber-200'
        : 'border-white/10 text-slate-300 hover:bg-white/10'
    }`

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
      {label && (
        <p className="w-full text-xs font-medium text-slate-400">{label}</p>
      )}

      {pool.length > 0 && (
        <div
          role="group"
          aria-label="Quantidade de filmes"
          className="flex flex-wrap gap-1.5"
        >
          {sizes.map((n) => (
            <button
              key={n}
              type="button"
              aria-pressed={activeSize === n}
              onClick={() => setSize(n)}
              className={chipClass(activeSize === n)}
            >
              {n}
            </button>
          ))}
          <button
            type="button"
            aria-pressed={activeSize === 'all'}
            onClick={() => setSize('all')}
            className={chipClass(activeSize === 'all')}
          >
            Todos ({pool.length})
          </button>
        </div>
      )}

      {hasStreaming && (
        <label className="flex cursor-pointer items-center gap-2 text-xs font-medium text-slate-300">
          <input
            type="checkbox"
            checked={onlyStreaming}
            onChange={(e) => setOnlyStreaming(e.target.checked)}
            className="peer sr-only"
          />
          <span className="relative h-5 w-9 shrink-0 rounded-full bg-slate-600 transition after:absolute after:left-0.5 after:top-0.5 after:h-4 after:w-4 after:rounded-full after:bg-white after:shadow after:transition peer-checked:bg-amber-500 peer-checked:after:translate-x-4 peer-focus-visible:ring-2 peer-focus-visible:ring-amber-300" />
          Só no streaming ({streamingCount})
        </label>
      )}

      <button
        type="button"
        onClick={send}
        disabled={disabled}
        className={`ui-btn rounded-lg bg-amber-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-40 ${focusRing}`}
      >
        {sending
          ? 'Abrindo a roleta…'
          : count === 0
            ? 'Nenhum filme para levar'
            : `Levar ${count} para a roleta`}
      </button>
    </div>
  )
}

export default SendToRoulette
