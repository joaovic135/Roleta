# Hearts of Iron: prompts de imagem de fundo

O tema já tem uma cena viva feita em SVG/CSS (`Scene.tsx` e `theme.css`). Ela mostra
uma carta topográfica sépia/oliva sobre a mesa de uma sala de guerra, com setas de
frente, alfinetes, radar, papéis presos com fita e um ciclo de dia e noite de 4 minutos.
Se quiser trocar o terreno desenhado por uma ilustração, gere uma das imagens abaixo e
salve como `public/themes/hearts-of-iron/bg.webp`. Depois descomente o bloco no fim do
`theme.css`. A luz do ciclo, o clima, o radar e as luzes das cidades continuam por cima.

Regras para todas as imagens:

- **Centro calmo:** a roleta e os cards cobrem o meio da tela. Os detalhes ficam nas
  bordas, numa faixa no topo e embaixo.
- **Tudo genérico:** nada de bandeiras, brasões, símbolos políticos, logos ou texto
  legível. As setas vermelhas e azuis não representam nenhum país.
- **Paleta:**
  - mar `#1a221f` / `#2b3834`
  - terra `#37361f` / `#4a452b` / `#554d31`
  - curvas de nível `#dec484`
  - latão `#c9a24a`
  - tijolo `#b8432f`
  - azul de campanha `#5b7ea6`
  - papel `#e2d4ab`

## 1. Mesa da sala de guerra (desktop, 2560×1440)

```
Top-down view of an old wartime strategy map spread on a dark wooden war-room table,
2560x1440. Sepia and olive topographic map with soft contour lines, irregular coastlines,
a dark navy-grey sea and a faint latitude/longitude grid. Generic thick red and blue
front-line arrows, small map pins and dashed supply lines, placed only near the left
and right edges and along a thin strip at the top. The center of the image is calm and
low-detail: just faded terrain and contour lines, because UI will cover it. Folded paper
creases, a couple of coffee-cup rings and an ink blot, warm desk-lamp light falling from
above, subtle vignette. Painterly yet crisp, muted 1940s cartography style.
Palette: #1a221f, #2b3834, #37361f, #4a452b, #554d31, #dec484, #c9a24a, #b8432f,
#5b7ea6, #e2d4ab. No text, no logos, no flags, no political symbols, no emblems,
no people.
```

## 2. Carta noturna sob lâmpada fria (desktop, 2560×1440)

```
Night version of a vintage strategy map on a war-room table, 2560x1440, seen from
directly above. A cold blue desk-lamp pool lights the middle softly and the edges fall
into darkness. Olive-sepia terrain with contour lines, navy-grey sea, tiny warm
city-light dots scattered near the edges, a round green phosphor radar screen in a
brass bezel cropped in the bottom-right corner, a few brass map pins and dashed supply
lines near the borders. Keep the center calm and uncluttered. Subtle paper fold creases,
light grain, cinematic but restrained. Palette: #0e1418, #1a221f, #37361f, #4a452b,
#dec484, #c9a24a, #b8432f, #5b7ea6, #7fdc9a. No text, no logos, no flags,
no political symbols, no emblems, no people.
```

## 3. Versão retrato (celular, 1080×1920)

```
Vertical 1080x1920 top-down view of a sepia and olive topographic war map on a dark
table. Contour lines, winding coastlines and a faint coordinate grid. Generic red and
blue front arrows and map pins only in the top 20% and bottom 20% of the frame. The
middle 60% is quiet, low-contrast terrain for UI overlay. Paper creases, one coffee
ring, warm lamp light, muted vintage cartography look. Palette: #1a221f, #2b3834,
#37361f, #4a452b, #dec484, #c9a24a, #b8432f, #5b7ea6, #e2d4ab. No text, no logos,
no flags, no political symbols, no emblems, no people.
```
