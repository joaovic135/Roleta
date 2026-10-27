export interface RouletteOption {
  id: string
  text: string
  color: string
  // Ajuste de fatias pelo seletor − / +: 1 = sem ajuste, 2 = +1 fatia...
  quantity: number
  movieId?: number
  // Cor escolhida à mão (senão a cor vem do tema)
  customColor?: boolean
}

export interface HistoryEntry {
  id: string
  text: string
  color: string
  movieId?: number
  at: number
}

export interface RouletteSettings {
  spinTime: number
  segmentsPerOption: number
  volume: number
  muted: boolean
  eliminationMode: boolean
  // Fatias por opção calculadas pela quantidade de opções
  autoSegments: boolean
  // Tema de cores da roda
  theme: string
}

export interface WatchProvider {
  logo_path: string
  provider_id: number
  provider_name: string
  display_priority: number
}

export interface WatchProvidersResponse {
  id: number
  results: {
    [countryCode: string]: {
      link: string
      flatrate?: WatchProvider[]
      rent?: WatchProvider[]
      buy?: WatchProvider[]
      ads?: WatchProvider[]
    }
  }
}
