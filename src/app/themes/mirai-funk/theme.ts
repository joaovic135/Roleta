import { WheelTheme, build, neutralRamp } from '@/app/utils/themeKit'

// Mirai Funk (未来のファンク): pôster duotone verde-água, cidade preta com
// janelinhas e tipografia branca enorme em itálico.
//
// - Neutros: escala tingida de verde-água escuro (o "chão" do pôster, perto
//   de #164039 no tom 800).
// - Destaque: escala feita à mão em torno do verde-água do pôster (#00a79d no
//   tom 500), em vez de accentRamp, que deixaria o tom 400 neon demais.
// - Fatias: verde-água ↔ coral (matizes opostos na roda de cores), alternados
//   e todos com a mesma luminância relativa (0,16), então o rótulo branco tem
//   contraste ≥ 4,5:1 em qualquer fatia.
export const miraiFunkTheme: WheelTheme = {
  id: 'mirai-funk',
  name: 'Mirai Funk',
  harmony: 'Pôster duotone verde-água, cidade preta e 未来のファンク',
  mode: 'dark',
  neutral: neutralRamp(171, 0.5),
  accent: [
    '#e8fbf8',
    '#c4f3ec',
    '#93e6da',
    '#5cd3c3',
    '#2bb3a3',
    '#00a79d',
    '#008c84',
    '#007069',
    '#0b5751',
    '#0c4540',
    '#062723',
  ],
  // botão de girar: preto e branco (o CSS do tema desenha o botão)
  cta: ['#00a79d', '#0a0a0a'],
  // brilhos discretos: o pôster é chapado, sem degradês fortes
  glow: ['#2bb3a3', '#0a0a0a'],
  // verde-água ↔ coral, ciano ↔ laranja-vermelho, verde ↔ rosa-coral
  palette: build([174, 354, 190, 12, 158, 338], 0.78, 0.16),
}
