import { RouletteOption } from '@/app/types'
import React, { useState } from 'react'

interface OptionsEditorProps {
  textInput: string
  setTextInput: (text: string) => void
  options: RouletteOption[]
  updateQuantity: (index: number, quantity: number) => void
}

const OptionsEditor: React.FC<OptionsEditorProps> = ({
  textInput,
  setTextInput,
  options,
  updateQuantity,
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
    </div>
  )
}

export default OptionsEditor
