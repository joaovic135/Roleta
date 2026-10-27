'use client'

import dynamic from 'next/dynamic'
import { ComponentType, useEffect, useState } from 'react'

// Cada cena é um pedaço de JS separado, baixado só quando o tema dela é
// escolhido (e guardado em cache). Assim o HTML não carrega as cenas de
// todos os temas, só a do tema ativo aparece.
const SCENES: Record<string, ComponentType> = {
  'half-life': dynamic(() => import('@/app/themes/half-life/Scene'), {
    ssr: false,
  }),
  'hearts-of-iron': dynamic(() => import('@/app/themes/hearts-of-iron/Scene'), {
    ssr: false,
  }),
  'uma-musume': dynamic(() => import('@/app/themes/uma-musume/Scene'), {
    ssr: false,
  }),
  'mirai-funk': dynamic(() => import('@/app/themes/mirai-funk/Scene'), {
    ssr: false,
  }),
  'good-times': dynamic(() => import('@/app/themes/good-times/Scene'), {
    ssr: false,
  }),
  'aranha-pixel': dynamic(() => import('@/app/themes/aranha-pixel/Scene'), {
    ssr: false,
  }),
  'city-pop': dynamic(() => import('@/app/themes/city-pop/Scene'), {
    ssr: false,
  }),
}

const currentTheme = () => document.documentElement.dataset.theme ?? ''

export default function ThemeScene() {
  // O tema vem do atributo data-theme no <html> (aplicado antes do React
  // pelo script do layout e trocado pelo seletor de temas)
  const [theme, setTheme] = useState('')

  useEffect(() => {
    setTheme(currentTheme())
    const observer = new MutationObserver(() => setTheme(currentTheme()))
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    })
    return () => observer.disconnect()
  }, [])

  const Scene = SCENES[theme]
  if (!Scene) return null
  return (
    <div className={'scene scene-' + theme}>
      <Scene />
    </div>
  )
}
