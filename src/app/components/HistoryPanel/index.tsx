import { HistoryEntry } from '@/app/types'
import React, { useEffect, useRef } from 'react'

interface HistoryPanelProps {
  history: HistoryEntry[]
  onClear: () => void
}

const formatTime = (timestamp: number) => {
  const date = new Date(timestamp)
  const isToday = date.toDateString() === new Date().toDateString()
  return date.toLocaleString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    ...(isToday ? {} : { day: '2-digit', month: '2-digit' }),
  })
}

const HistoryPanel: React.FC<HistoryPanelProps> = ({ history, onClear }) => {
  const listRef = useRef<HTMLOListElement>(null)
  const latestId = history[0]?.id

  // Resultado novo entra no topo: volta a lista para ele ficar visível
  useEffect(() => {
    listRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
  }, [latestId])

  return (
    <section className="ui-card shrink-0 rounded-2xl border border-white/10 bg-slate-900/80 p-5 shadow-xl">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="ui-card-title text-lg font-bold">Histórico</h2>
        {history.length > 0 && (
          <button
            type="button"
            onClick={onClear}
            className="text-xs font-medium text-slate-400 transition hover:text-rose-300"
          >
            Limpar
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <p className="text-sm text-slate-400">
          Os resultados dos giros aparecem aqui.
        </p>
      ) : (
        <ol
          ref={listRef}
          className="-mr-2 max-h-64 space-y-1.5 overflow-y-auto pr-2 [overflow-anchor:none] lg:max-h-[18vh]"
        >
          {history.map((entry, i) => (
            <li
              key={entry.id}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm ${
                i === 0 ? 'bg-amber-400/10 ring-1 ring-amber-400/30' : ''
              }`}
            >
              <span className="w-6 shrink-0 text-right text-xs tabular-nums text-slate-500">
                {history.length - i}
              </span>
              <span
                className="h-3 w-3 shrink-0 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="min-w-0 flex-1 truncate font-medium">
                {entry.text}
              </span>
              <time className="shrink-0 text-xs tabular-nums text-slate-500">
                {formatTime(entry.at)}
              </time>
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}

export default HistoryPanel
