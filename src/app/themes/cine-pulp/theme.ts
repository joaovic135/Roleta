import { WheelTheme, accentRamp, build } from '@/app/utils/themeKit'

// Cine Pulp: palácio de cinema art déco em noite de sessão dupla. Veludo
// carmim, ouro déco, creme de marfim e verde-petróleo; letreiro de
// lâmpadas incandescentes e cartazes pulp nas paredes.
//
// Neutros feitos à mão: os claros são marfim (texto creme, como o papel
// dos ingressos) e os escuros são vinho quase preto (sala às escuras).
// O 500 fica claro o bastante para o rodapé passar de 4,5:1 sobre o 900.
const NEUTRAL = [
  '#fdf7ec',
  '#f7ecd9',
  '#ecdcc2',
  '#dbc3a3',
  '#b89c8a',
  '#9d7e71',
  '#6b4048',
  '#4f2a33',
  '#36161f',
  '#230b12',
  '#12050a',
]

export const cinePulpTheme: WheelTheme = {
  id: 'cine-pulp',
  name: 'Cine Pulp',
  harmony: 'Palácio de cinema: letreiro de lâmpadas, veludo e cartazes pulp',
  mode: 'dark',
  neutral: NEUTRAL,
  // ouro velho das molduras e das lâmpadas
  accent: accentRamp(40, 0.9),
  cta: ['#e8a33a', '#b3122e'],
  glow: ['#ffcf6b', '#b3122e'],
  // Tintas de cartaz pulp com a mesma luminância (0,16, rótulo branco a
  // ~5:1), vizinhas sempre opostas: carmim ↔ petróleo, ocre ↔ azul
  // royal, laranja ↔ ciano, magenta ↔ verde-monstro. As três primeiras
  // (carmim, petróleo, ocre) são a cara do cinema: veludo, parede, ouro;
  // o ocre puxa para o laranja (38°) para não virar oliva no escuro.
  palette: build([352, 176, 38, 216, 16, 192, 298, 108], 0.92, 0.16),
}
