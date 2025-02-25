export interface RouletteOption {
  text: string
  color: string
  quantity: number
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
