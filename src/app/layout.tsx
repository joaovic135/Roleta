import type { Metadata, Viewport } from 'next'
import {
  Audiowide,
  Bangers,
  Bungee,
  Geist,
  Michroma,
  Orbitron,
  Pixelify_Sans,
  Press_Start_2P,
  Share_Tech_Mono,
  VT323,
  Saira_Condensed,
  Special_Elite,
  Black_Ops_One,
  Mochiy_Pop_One,
  M_PLUS_Rounded_1c,
  Archivo_Black,
  Yellowtail,
  Righteous,
  Bungee_Inline,
  Limelight,
  Rye,
  Monoton,
  Bebas_Neue,
  Alfa_Slab_One,
  Abril_Fatface,
  Silkscreen,
} from 'next/font/google'
import Providers from './providers'
import { themeBootScript, themeCss } from './utils/themes'
import './globals.css'
import './themes.css'
import './themes/index.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  display: 'swap',
})

// Fontes de display dos temas. Sem preload: o navegador só baixa a fonte
// quando o tema que a usa está ativo.
// (o next/font exige as opções escritas literalmente em cada chamada)
const orbitron = Orbitron({
  subsets: ['latin'],
  display: 'swap',
  preload: false,
  variable: '--font-orbitron',
})
const vt323 = VT323({
  subsets: ['latin'],
  display: 'swap',
  preload: false,
  weight: '400',
  variable: '--font-vt323',
})
const shareTech = Share_Tech_Mono({
  subsets: ['latin'],
  display: 'swap',
  preload: false,
  weight: '400',
  variable: '--font-share-tech',
})
const audiowide = Audiowide({
  subsets: ['latin'],
  display: 'swap',
  preload: false,
  weight: '400',
  variable: '--font-audiowide',
})
const michroma = Michroma({
  subsets: ['latin'],
  display: 'swap',
  preload: false,
  weight: '400',
  variable: '--font-michroma',
})
const bungee = Bungee({
  subsets: ['latin'],
  display: 'swap',
  preload: false,
  weight: '400',
  variable: '--font-bungee',
})
const bangers = Bangers({
  subsets: ['latin'],
  display: 'swap',
  preload: false,
  weight: '400',
  variable: '--font-bangers',
})
const pressStart = Press_Start_2P({
  subsets: ['latin'],
  display: 'swap',
  preload: false,
  weight: '400',
  variable: '--font-press-start',
})
const pixelify = Pixelify_Sans({
  subsets: ['latin'],
  display: 'swap',
  preload: false,
  variable: '--font-pixelify',
})
const sairaCondensed = Saira_Condensed({
  subsets: ['latin'],
  display: 'swap',
  preload: false,
  weight: ['500', '700', '800'],
  variable: '--font-saira-condensed',
})
const specialElite = Special_Elite({
  subsets: ['latin'],
  display: 'swap',
  preload: false,
  weight: '400',
  variable: '--font-special-elite',
})
const blackOps = Black_Ops_One({
  subsets: ['latin'],
  display: 'swap',
  preload: false,
  weight: '400',
  variable: '--font-black-ops',
})
const mochiy = Mochiy_Pop_One({
  subsets: ['latin'],
  display: 'swap',
  preload: false,
  weight: '400',
  variable: '--font-mochiy',
})
const mplusRounded = M_PLUS_Rounded_1c({
  subsets: ['latin'],
  display: 'swap',
  preload: false,
  weight: ['500', '800'],
  variable: '--font-mplus-rounded',
})
const archivoBlack = Archivo_Black({
  subsets: ['latin'],
  display: 'swap',
  preload: false,
  weight: '400',
  variable: '--font-archivo-black',
})
const yellowtail = Yellowtail({
  subsets: ['latin'],
  display: 'swap',
  preload: false,
  weight: '400',
  variable: '--font-yellowtail',
})
const righteous = Righteous({
  subsets: ['latin'],
  display: 'swap',
  preload: false,
  weight: '400',
  variable: '--font-righteous',
})
const bungeeInline = Bungee_Inline({
  subsets: ['latin'],
  display: 'swap',
  preload: false,
  weight: '400',
  variable: '--font-bungee-inline',
})
const limelight = Limelight({
  subsets: ['latin'],
  display: 'swap',
  preload: false,
  weight: '400',
  variable: '--font-limelight',
})
const rye = Rye({
  subsets: ['latin'],
  display: 'swap',
  preload: false,
  weight: '400',
  variable: '--font-rye',
})
const monoton = Monoton({
  subsets: ['latin'],
  display: 'swap',
  preload: false,
  weight: '400',
  variable: '--font-monoton',
})
const bebasNeue = Bebas_Neue({
  subsets: ['latin'],
  display: 'swap',
  preload: false,
  weight: '400',
  variable: '--font-bebas-neue',
})
const alfaSlab = Alfa_Slab_One({
  subsets: ['latin'],
  display: 'swap',
  preload: false,
  weight: '400',
  variable: '--font-alfa-slab',
})
const abrilFatface = Abril_Fatface({
  subsets: ['latin'],
  display: 'swap',
  preload: false,
  weight: '400',
  variable: '--font-abril-fatface',
})
const silkscreen = Silkscreen({
  subsets: ['latin'],
  display: 'swap',
  preload: false,
  weight: ['400', '700'],
  variable: '--font-silkscreen',
})
const fontVars = [
  geistSans,
  orbitron,
  vt323,
  shareTech,
  audiowide,
  michroma,
  bungee,
  bangers,
  pressStart,
  pixelify,
  sairaCondensed,
  specialElite,
  blackOps,
  mochiy,
  mplusRounded,
  archivoBlack,
  yellowtail,
  righteous,
  bungeeInline,
  limelight,
  rye,
  monoton,
  bebasNeue,
  alfaSlab,
  abrilFatface,
  silkscreen,
]
  .map((f) => f.variable)
  .join(' ')

export const metadata: Metadata = {
  title: 'Roleta',
  description: 'Roleta online para sortear opções e filmes',
}

export const viewport: Viewport = {
  themeColor: '#020617',
  colorScheme: 'dark',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    // suppressHydrationWarning: o data-theme é aplicado antes do React
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <style dangerouslySetInnerHTML={{ __html: themeCss() }} />
        <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
        <link rel="preconnect" href="https://image.tmdb.org" />
        <link rel="preconnect" href="https://api.themoviedb.org" />
      </head>
      <body className={`${fontVars} font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
