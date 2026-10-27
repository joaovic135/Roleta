import { useEffect, useState } from 'react'

// Estado salvo no localStorage. A leitura acontece só após montar o
// componente para evitar diferença entre o HTML do servidor e do cliente.
export function usePersistentState<T>(
  key: string,
  initial: T,
  fallback?: () => T | undefined,
) {
  const [value, setValue] = useState<T>(initial)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(key)
      if (raw !== null) {
        setValue(JSON.parse(raw))
      } else {
        const legacy = fallback?.()
        if (legacy !== undefined) setValue(legacy)
      }
    } catch (e) {
      console.error(`Erro ao carregar "${key}":`, e)
    }
    setLoaded(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  useEffect(() => {
    if (!loaded) return
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (e) {
      console.error(`Erro ao salvar "${key}":`, e)
    }
  }, [key, value, loaded])

  return [value, setValue, loaded] as const
}
