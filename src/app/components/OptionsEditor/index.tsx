import { RouletteOption } from '@/app/types'
import { toHex } from '@/app/utils/colors'
import {
  MAX_SLICES_PER_OPTION,
  optionSlices,
  quantityForSlices,
} from '@/app/utils/wheel'
import { Movie } from '@/app/utils/tmdbApi'
import React, { useState } from 'react'
import AddOptionInput from '../AddOptionInput'
import TmdbImage from '../TmdbImage'

interface OptionsEditorProps {
  options: RouletteOption[]
  textInput: string
  onTextChange: (text: string) => void
  onAdd: (text: string) => void
  onAddMovie: (movie: Movie) => void
  addedMovieIds: Set<number>
  onRemove: (id: string) => void
  onQuantityChange: (id: string, quantity: number) => void
  onColorChange: (id: string, color: string) => void
  onShuffle: () => void
  onClear: () => void
  movies: Movie[]
  segmentsPerOption: number
  disabled: boolean
}

const OptionsEditor: React.FC<OptionsEditorProps> = ({
  options,
  textInput,
  onTextChange,
  onAdd,
  onAddMovie,
  addedMovieIds,
  onRemove,
  onQuantityChange,
  onColorChange,
  onShuffle,
  onClear,
  movies,
  segmentsPerOption,
  disabled,
}) => {
  const [tab, setTab] = useState<'list' | 'text'>('list')

  // O seletor de cada opção mostra quantas fatias ela tem na roda
  const slicesOf = (option: RouletteOption) =>
    optionSlices(option, segmentsPerOption)
  const totalSlices = options.reduce((sum, o) => sum + slicesOf(o), 0)
  const setSlices = (option: RouletteOption, slices: number) =>
    onQuantityChange(option.id, quantityForSlices(slices, segmentsPerOption))
  const movieById = new Map(movies.map((m) => [m.id, m]))

  const tabClass = (active: boolean) =>
    `rounded-md px-3 py-1 text-sm font-medium transition ${
      active ? 'bg-white/15 text-white' : 'text-slate-400 hover:text-slate-200'
    }`

  return (
    <section className="ui-card flex flex-col rounded-2xl border border-white/10 bg-slate-900/80 p-5 shadow-xl lg:min-h-0 lg:flex-1">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="ui-card-title text-lg font-bold">Opções</h2>
          <p className="text-xs text-slate-400">
            {options.length} {options.length === 1 ? 'opção' : 'opções'}
          </p>
        </div>
        <div className="flex rounded-lg bg-white/5 p-1" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'list'}
            className={tabClass(tab === 'list')}
            onClick={() => setTab('list')}
          >
            Lista
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'text'}
            className={tabClass(tab === 'text')}
            onClick={() => setTab('text')}
          >
            Texto
          </button>
        </div>
      </div>

      {tab === 'list' ? (
        <>
          <AddOptionInput
            onAdd={onAdd}
            onAddMovie={onAddMovie}
            addedMovieIds={addedMovieIds}
            disabled={disabled}
          />

          {options.length === 0 ? (
            <p className="rounded-lg border border-dashed border-white/10 py-8 text-center text-sm text-slate-400">
              Nenhuma opção ainda. Digite acima uma opção ou o nome de um filme.
            </p>
          ) : (
            <ul className="-mr-2 max-h-[26rem] space-y-2 overflow-y-auto pr-2 lg:max-h-none lg:min-h-0 lg:flex-1">
              {options.map((option) => {
                const movie = option.movieId
                  ? movieById.get(option.movieId)
                  : undefined
                const slices = slicesOf(option)
                const chance = (slices / totalSlices) * 100
                return (
                  <li
                    key={option.id}
                    className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.03] px-3 py-2 transition hover:bg-white/[0.06]"
                  >
                    <label
                      className="relative h-7 w-7 shrink-0 cursor-pointer rounded-full shadow ring-2 ring-white/20"
                      style={{ backgroundColor: option.color }}
                      title="Mudar cor"
                    >
                      <span className="sr-only">Cor de {option.text}</span>
                      <input
                        type="color"
                        value={toHex(option.color)}
                        disabled={disabled}
                        onChange={(e) =>
                          onColorChange(option.id, e.target.value)
                        }
                        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                      />
                    </label>

                    {movie?.poster_path && (
                      <div className="relative h-11 w-8 shrink-0 overflow-hidden rounded">
                        <TmdbImage
                          path={movie.poster_path}
                          alt=""
                          fill
                          sizes="32px"
                          className="object-cover"
                        />
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {option.text}
                      </p>
                      <div className="flex items-center gap-2 overflow-hidden whitespace-nowrap text-xs text-slate-400">
                        <span className="tabular-nums">
                          {chance.toFixed(chance < 10 ? 1 : 0)}%
                        </span>
                        {movie?.release_date && (
                          <span className="shrink-0">
                            · {movie.release_date.slice(0, 4)}
                          </span>
                        )}
                        {movie?.watchProviders
                          ?.slice(0, 4)
                          .map((p) => (
                            <TmdbImage
                              key={p.provider_id}
                              path={p.logo_path}
                              kind="logo"
                              alt={p.provider_name}
                              title={p.provider_name}
                              width={16}
                              height={16}
                              className="rounded-sm"
                            />
                          ))}
                      </div>
                    </div>

                    <div
                      className="flex items-center rounded-lg border border-white/10"
                      title="Fatias desta opção na roda"
                    >
                      <button
                        type="button"
                        onClick={() => setSlices(option, slices - 1)}
                        disabled={disabled || slices <= 1}
                        aria-label={`Menos fatias de ${option.text}`}
                        className="h-7 w-7 text-slate-300 hover:bg-white/10 disabled:opacity-30"
                      >
                        −
                      </button>
                      <span className="w-7 text-center text-sm tabular-nums">
                        {slices}
                      </span>
                      <button
                        type="button"
                        onClick={() => setSlices(option, slices + 1)}
                        disabled={disabled || slices >= MAX_SLICES_PER_OPTION}
                        aria-label={`Mais fatias de ${option.text}`}
                        className="h-7 w-7 text-slate-300 hover:bg-white/10 disabled:opacity-30"
                      >
                        +
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => onRemove(option.id)}
                      disabled={disabled}
                      aria-label={`Remover ${option.text}`}
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-slate-500 transition hover:bg-rose-500/15 hover:text-rose-400 disabled:opacity-30"
                    >
                      ✕
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </>
      ) : (
        <div>
          <label
            htmlFor="options"
            className="mb-2 block text-xs text-slate-400"
          >
            Uma opção por linha — ótimo para colar uma lista inteira.
          </label>
          <textarea
            id="options"
            rows={12}
            value={textInput}
            readOnly={disabled}
            onChange={(e) => onTextChange(e.target.value)}
            className="ui-input w-full resize-y rounded-lg border border-white/10 bg-white/5 p-3 font-mono text-sm leading-relaxed placeholder:text-slate-500 focus:border-amber-400/60 focus:outline-none focus:ring-2 focus:ring-amber-400/30"
            placeholder={'Pizza\nHambúrguer\nSushi'}
          />
        </div>
      )}

      <div className="mt-4 flex shrink-0 gap-2">
        <button
          type="button"
          onClick={onShuffle}
          disabled={disabled || options.length < 2}
          className="flex-1 rounded-lg border border-white/10 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/10 disabled:opacity-40"
        >
          🔀 Embaralhar
        </button>
        <button
          type="button"
          onClick={() => {
            if (window.confirm('Remover todas as opções da roleta?')) onClear()
          }}
          disabled={disabled || options.length === 0}
          className="flex-1 rounded-lg border border-white/10 py-2 text-sm font-medium text-slate-200 transition hover:border-rose-500/40 hover:bg-rose-500/10 hover:text-rose-300 disabled:opacity-40"
        >
          🗑️ Limpar tudo
        </button>
      </div>
    </section>
  )
}

export default OptionsEditor
