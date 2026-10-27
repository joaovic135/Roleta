import type { Config } from 'tailwindcss'

// slate (fundo, cards, texto) e amber (destaque) vêm de variáveis CSS
// definidas por tema em src/app/utils/themes.ts, então todo o site troca de
// cores junto com o tema
const STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950]
const themed = (name: string) =>
  Object.fromEntries(
    STEPS.map((step) => [step, `rgb(var(--${name}-${step}) / <alpha-value>)`]),
  )

export default {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
      },
      colors: {
        slate: themed('slate'),
        amber: themed('amber'),
        // bordas/realces: branco nos temas escuros, tinta escura nos claros
        white: 'rgb(var(--ink) / <alpha-value>)',
        // meio e fim do gradiente do botão de girar
        cta: {
          2: 'rgb(var(--cta-2) / <alpha-value>)',
          3: 'rgb(var(--cta-3) / <alpha-value>)',
        },
      },
    },
  },
  plugins: [],
} satisfies Config
