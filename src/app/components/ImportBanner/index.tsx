import React from 'react'
import { RouletteImport } from '@/app/utils/rouletteImport'

interface ImportBannerProps {
  data: RouletteImport
  disabled: boolean
  onReplace: () => void
  onAdd: () => void
  onDiscard: () => void
}

const PREVIEW_COUNT = 3

const focusRing =
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300'

const ImportBanner: React.FC<ImportBannerProps> = ({
  data,
  disabled,
  onReplace,
  onAdd,
  onDiscard,
}) => {
  const count = data.items.length
  const preview = data.items.slice(0, PREVIEW_COUNT).map((i) => i.title)
  const rest = count - preview.length

  return (
    <div
      role="region"
      aria-label="Importação para a roleta"
      className="flex shrink-0 flex-col gap-3 rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 sm:flex-row sm:items-center"
    >
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-amber-100">
          {count} {count === 1 ? 'filme' : 'filmes'} de {data.source}{' '}
          {count === 1 ? 'pronto' : 'prontos'} para a roleta
        </p>
        <p className="truncate text-xs text-slate-400">
          {preview.join(', ')}
          {rest > 0 && ` e mais ${rest}`}
        </p>
      </div>
      <div className="flex shrink-0 flex-wrap gap-2">
        <button
          type="button"
          onClick={onReplace}
          disabled={disabled}
          className={`ui-btn rounded-lg bg-amber-400 px-3 py-1.5 text-xs font-semibold text-slate-950 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-40 ${focusRing}`}
        >
          Substituir opções
        </button>
        <button
          type="button"
          onClick={onAdd}
          disabled={disabled}
          className={`rounded-lg border border-white/10 px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40 ${focusRing}`}
        >
          Adicionar às atuais
        </button>
        <button
          type="button"
          onClick={onDiscard}
          className={`rounded-lg px-3 py-1.5 text-xs font-medium text-slate-400 transition hover:text-rose-300 ${focusRing}`}
        >
          Descartar
        </button>
      </div>
    </div>
  )
}

export default ImportBanner
