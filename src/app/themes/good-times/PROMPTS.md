# Good Times: prompts para arte gerada

O tema já funciona só com a cena em SVG/CSS (papel quadriculado, blocos
pastel, sol listrado, palmeiras, formas Memphis e o ciclo dia → pôr do sol →
noite lilás → amanhecer). Se você quiser uma ilustração de fundo mais rica, gere
uma imagem com um dos prompts abaixo (em inglês, que os geradores entendem
melhor), salve como `public/themes/good-times/bg.webp` e descomente o bloco
"Arte gerada" no fim de `theme.css`.

Dicas:

- **Centro calmo.** A interface (roda e cards) cobre o meio da tela, então os
  prompts pedem os detalhes nas bordas, na faixa de cima e na de baixo.
- **Tamanhos.** Gere em 2560×1440 para desktop. Para celular, gere uma versão
  em 1080×1920 e use-a com `@media (max-aspect-ratio: 3/4)`.
- **Formato.** Exporte em WebP (qualidade ~80) para manter o arquivo leve.
- **Originalidade.** Os prompts pedem personagens, carros e marcas originais.
  Se aparecer texto ou logotipo na imagem, gere de novo.

Paleta usada no tema: rosa-chiclete `#ff9ad5`, rosa forte `#ff6fbf`, ciano-céu
`#bdf3ff`, ciano `#7fe3ff`, amarelo `#fff36b`, lilás `#c4a6ff`, menta `#8ff0c1`,
papel `#efedf3` e contorno `#1b1726`.

---

## 1. Personagem anos 80 com conversível (fundo principal)

```
Original 1980s Japanese anime-style illustration, city pop / future funk party
poster aesthetic. An original young woman character (not based on any existing
character) with big voluminous wavy hair, large sunglasses pushed up on her head,
oversized pastel windbreaker, high-waisted shorts and white sneakers, standing
relaxed and smiling, leaning against a generic red retro convertible sports car
with pop-up headlights (completely unbranded, no badges, no logos, no license
plate text). Background: light grey graph paper grid with thin dark lines, 80s
Memphis design geometry — squiggles, zigzags, triangles, dotted circles,
half-circles and confetti dashes — pastel color blocks with thick black
outlines, a striped pastel sunset sun fading from yellow to pink, palm tree
silhouettes in pastel pink and lilac.
Composition: 2560x1440, wide landscape; the character and car sit on the far
LEFT third, palms and a big striped sun on the far RIGHT edge; Memphis shapes
along the top and bottom strips; the CENTER area is calm, mostly plain graph
paper with very few small shapes, so UI cards can sit on top of it.
Style: clean cel shading, bold black ink outlines, flat pastel colors, subtle
screen-tone halftone dots, crisp vector-like finish, cheerful sunny mood.
Palette: #ff9ad5, #ff6fbf, #bdf3ff, #7fe3ff, #fff36b, #c4a6ff, #8ff0c1,
background #efedf3, outlines #1b1726, car red #e8384f.
No text, no letters, no Japanese characters, no logos, no watermarks, no
signatures.
```

Versão vertical (celular): troque a composição por
`1080x1920, tall portrait; the character and car at the BOTTOM, sun and palms at
the TOP; calm empty graph paper in the middle 60% of the height.`

## 2. Só o cenário Memphis (sem personagem)

```
Flat vector-style 1980s Memphis design poster background, future funk /
vaporwave party flyer vibe. Light grey graph paper with a thin dark grid.
Large tilted pastel color blocks with thick black outlines and hard offset
black shadows (sky cyan, bubblegum pink, lemon yellow, lilac). A big striped
sunset sun with a yellow-to-pink gradient, half hidden behind a horizon band of
thin pastel stripes. Pastel pink and lilac palm tree silhouettes with black
outlines. Scattered Memphis shapes: wavy squiggles, zigzags, triangles with
stripes, dotted circles, half-circles, plus signs and confetti dashes.
Composition: 2560x1440; dense decoration on the left and right edges and along
the top and bottom strips; the CENTER 60% is calm plain graph paper.
Style: crisp flat colors, bold black outlines, no gradients except the sun,
playful and clean.
Palette: #ff9ad5, #ff6fbf, #bdf3ff, #7fe3ff, #fff36b, #c4a6ff, #8ff0c1,
#efedf3, #1b1726.
No text, no letters, no logos, no people, no watermark.
```

## 3. Noite lilás (para alternar com o dia)

```
1980s anime background art, future funk night scene in pastel colors. Lilac
twilight sky over light graph paper texture, a pale yellow crescent moon with a
black outline, small twinkling four-point stars, pastel palm silhouettes
swaying, a generic unbranded red retro convertible parked on the far right
with its pop-up headlights glowing softly, Memphis squiggles, triangles and
confetti floating along the edges. Composition: 2560x1440; details on the left
and right edges and the top strip; the CENTER is calm and uncluttered. Style:
cel-shaded, bold black outlines, soft halftone dots, dreamy and nostalgic.
Palette: sky #6a58c2 to #9a84df to #e3a8e4, accents #ff9ad5, #7fe3ff,
#fff36b, #c4a6ff, outlines #1b1726.
No text, no letters, no logos, no characters from existing works, no watermark.
```
