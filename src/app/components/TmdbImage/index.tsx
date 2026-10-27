'use client'

import { tmdbLoader } from '@/app/utils/tmdbApi'
import Image, { ImageProps } from 'next/image'

type TmdbImageProps = Omit<ImageProps, 'src' | 'loader'> & {
  path: string
  kind?: 'poster' | 'logo'
}

// Imagem do TMDB servida direto do CDN deles, no tamanho certo para a tela
export default function TmdbImage({
  path,
  kind = 'poster',
  alt,
  ...props
}: TmdbImageProps) {
  return (
    <Image {...props} alt={alt} src={`${kind}:${path}`} loader={tmdbLoader} />
  )
}
