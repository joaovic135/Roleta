import {
  WheelTheme,
  accentRamp,
  build,
  neutralRamp,
} from '@/app/utils/themeKit'

// Uma Musume: corrida de idols num dia de sol. Tema claro: fundo branco
// rosado, texto ameixa-escuro e destaque rosa-chiclete. As fatias são doces
// pastel (mas saturados) em pares complementares, todos com a mesma
// luminância alta (0.55), então o rótulo sai sempre escuro e legível.
// Menta, pêssego e lima usam saturação menor: com a mesma luminância e
// saturação alta o verde vira neon (ele já é muito luminoso por natureza)
const VIVID = build([340, 205, 262], 0.9, 0.55)
const SOFT = build([160, 22, 82], 0.74, 0.55)

export const umaMusumeTheme: WheelTheme = {
  id: 'uma-musume',
  name: 'Uma Musume',
  harmony: 'Pista de corrida ensolarada, palco de idol e doces pastel',
  mode: 'light',
  // neutros levemente rosados: cards brancos e texto ameixa
  neutral: neutralRamp(322, 0.5),
  // rosa-chiclete: botões, ponteiro, controles
  accent: accentRamp(334, 0.92),
  cta: ['#c58bff', '#5cc8ff'],
  glow: ['#ff8fc8', '#7fe3c8'],
  // rosa ↔ menta, céu ↔ pêssego, lilás ↔ lima (vizinhas sempre opostas)
  palette: VIVID.flatMap((color, i) => [color, SOFT[i]]),
}
