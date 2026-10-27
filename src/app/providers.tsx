'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React, { useEffect, useState } from 'react'

// Versão da aplicação - atualize a cada deploy importante
const APP_VERSION = '1.0.0'

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000,
            gcTime: 30 * 60 * 1000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      }),
  )

  useEffect(() => {
    if (localStorage.getItem('appVersion') === APP_VERSION) return

    // Limpa o localStorage preservando os dados da roleta. Não recarrega a
    // página: o HTML/JS desta visita já é o do deploy atual.
    const preserved = Object.keys(localStorage)
      .filter((key) => key.startsWith('roleta.'))
      .map((key) => [key, localStorage.getItem(key) ?? ''] as const)
    localStorage.clear()
    preserved.forEach(([key, value]) => localStorage.setItem(key, value))
    localStorage.setItem('appVersion', APP_VERSION)
  }, [])

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}
