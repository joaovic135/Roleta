import { WheelTheme, accentRamp, build } from '@/app/utils/themeKit'

// Neon Noir: beco de fliperamas numa Tóquio de 199X, de noite e na chuva.
// Fundo violeta quase preto, néon magenta e ciano, nada de amarelo.
//
// Neutros feitos à mão: claros lavanda (texto) e escuros entre o roxo e o
// azul meia-noite (painéis). O 500 fica claro o bastante para o rodapé
// passar de 4,5:1 sobre o 900.
const NEUTRAL = [
  '#f7f1ff',
  '#ece2ff',
  '#d9c9fb',
  '#bfa9f0',
  '#9d86d4',
  '#8a72c2',
  '#4a3477',
  '#33215a',
  '#211340',
  '#140a2b',
  '#0a0518',
]

export const neonNoirTheme: WheelTheme = {
  id: 'neon-noir',
  name: 'Neon Noir',
  harmony: 'Beco de fliperama em 199X: néon magenta e ciano na chuva',
  mode: 'dark',
  neutral: NEUTRAL,
  // magenta dos tubos de néon
  accent: accentRamp(318, 1),
  cta: ['#ff2bd6', '#19e6ff'],
  glow: ['#ff2bd6', '#19e6ff'],
  // Tubos de néon com a mesma luminância (rótulo branco legível),
  // vizinhas sempre opostas: magenta ↔ ciano-turquesa, violeta ↔ verde
  // ácido, vermelho-coral ↔ azul elétrico
  palette: build([322, 178, 268, 96, 352, 205], 1, 0.19),
}
