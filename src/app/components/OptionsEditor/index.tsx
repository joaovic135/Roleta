import { RouletteOption, WatchProvider } from '@/app/types'
import { Movie } from '@/app/utils/tmdbApi'
import Image from 'next/image'
import React, { useState } from 'react'

interface OptionsEditorProps {
  textInput: string
  setTextInput: (text: string) => void
  options: RouletteOption[]
  updateQuantity: (index: number, quantity: number) => void
  selectedMovies: Movie[]
  handleRemoveMovie: (movie: Movie) => void
  watchProviders: WatchProvider[]
}

const OptionsEditor: React.FC<OptionsEditorProps> = ({
  textInput,
  setTextInput,
  options,
  updateQuantity,
  selectedMovies,
  handleRemoveMovie,
}) => {
  const [isOptionsVisible, setOptionsVisible] = useState<boolean>(false)

  return (
    <div className="flex-1 rounded-lg bg-white p-6 shadow-lg">
      <h2 className="mb-4 text-xl font-bold">Opções da Roleta</h2>

      <div className="mb-4">
        <label htmlFor="options" className="mb-2 block text-sm font-medium">
          Uma opção por linha:
        </label>
        <textarea
          id="options"
          rows={8}
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          className="w-full rounded-md border border-gray-300 p-2"
          placeholder="Digite suas opções, uma por linha"
        />
      </div>

      <div className="relative">
        <button
          className="mb-2 flex w-full items-center justify-between rounded-md bg-gray-100 px-4 py-2 font-bold hover:bg-gray-200"
          onClick={() => setOptionsVisible(!isOptionsVisible)}
        >
          <span>Configurações Avançadas</span>
          <svg
            className={`h-5 w-5 transform transition-transform duration-200 ${
              isOptionsVisible ? 'rotate-180' : ''
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {isOptionsVisible && (
          <div className="absolute z-10 mt-1 w-full rounded-md border border-gray-200 bg-white p-2 shadow-lg">
            <div className="max-h-60 overflow-y-auto">
              {options.map((option, index) => (
                <div
                  key={index}
                  className="mb-2 flex items-center rounded-md bg-gray-50 p-2 hover:bg-gray-100"
                >
                  <div
                    className="mr-2 h-6 w-6 rounded-full"
                    style={{ backgroundColor: option.color }}
                  />
                  <span className="flex-1 truncate">{option.text}</span>
                  <div className="flex items-center">
                    <button
                      onClick={() => updateQuantity(index, option.quantity - 1)}
                      className="flex h-8 w-8 items-center justify-center rounded-l-md bg-gray-200 hover:bg-gray-300"
                    >
                      -
                    </button>
                    <span className="w-8 text-center">{option.quantity}</span>
                    <button
                      onClick={() => updateQuantity(index, option.quantity + 1)}
                      className="flex h-8 w-8 items-center justify-center rounded-r-md bg-gray-200 hover:bg-gray-300"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {selectedMovies && selectedMovies.length > 0 && (
        <div className="mt-4 rounded-lg border bg-blue-50 p-4">
          <h3 className="mb-4 text-xl font-bold">Filmes na Roleta</h3>
          <div className="space-y-4">
            {selectedMovies.map((movie) => (
              <div
                key={movie.id}
                className="flex items-center border-b pb-4 last:border-b-0"
              >
                <div className="relative mr-4 h-24 w-16 flex-shrink-0">
                  {movie.poster_path ? (
                    <Image
                      src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`}
                      alt={movie.title}
                      layout="fill"
                      objectFit="cover"
                      className="rounded"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center rounded bg-gray-200 text-xs text-gray-500">
                      Sem imagem
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-center gap-6">
                  <div className="min-w-36 flex-grow">
                    <p className="text-lg font-medium">{movie.title}</p>
                    <p className="text-sm text-gray-600">
                      {movie.release_date
                        ? new Date(movie.release_date).getFullYear()
                        : 'Ano não informado'}
                    </p>
                    <div className="mt-2 flex">
                      <button
                        onClick={() => handleRemoveMovie(movie)}
                        className="text-sm text-red-600 hover:text-red-800"
                      >
                        Remover da roleta
                      </button>
                    </div>
                  </div>

                  {movie.watchProviders && movie.watchProviders.length > 0 && (
                    <div className="mt-4 border-t pt-4">
                      <h4 className="mb-2 font-semibold">Onde assistir:</h4>
                      <div className="flex flex-wrap gap-2">
                        {movie.watchProviders &&
                          movie.watchProviders.map((provider) => (
                            <div
                              key={`${provider.provider_id}-${provider.provider_id}`}
                              className="flex items-center rounded-lg border bg-white p-2 shadow-sm"
                            >
                              {provider.logo_path && (
                                <Image
                                  src={`https://image.tmdb.org/t/p/w200${provider.logo_path}`}
                                  alt={provider.provider_name}
                                  width={40}
                                  height={40}
                                  className="rounded"
                                />
                              )}
                              <span className="ml-2 text-sm">
                                {provider.provider_name}
                              </span>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default OptionsEditor
