'use client'

import { tmdbLoader } from '@/app/utils/tmdbApi'
import Image, { ImageProps, getImageProps } from 'next/image'

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

// Baixa e decodifica antes de a imagem entrar na tela (ex.: o pôster do
// vencedor durante o giro). Recebe os mesmos tamanhos do <TmdbImage> para o
// navegador escolher a mesma URL do srcset e o modal abrir com ela no cache.
export function preloadTmdbImage({
  path,
  kind = 'poster',
  ...props
}: Omit<TmdbImageProps, 'alt'>) {
  const { props: img } = getImageProps({
    ...props,
    alt: '',
    src: `${kind}:${path}`,
    loader: tmdbLoader,
  })
  const pre = new window.Image()
  if (img.sizes) pre.sizes = img.sizes
  if (img.srcSet) pre.srcset = img.srcSet
  pre.src = img.src
  pre.decode().catch(() => {})
}
