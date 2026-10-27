# Tema Uma Musume: prompts para o fundo pintado

O tema já funciona só com a cena em SVG/CSS (`Scene.tsx` + `theme.css`): céu
azul, nuvens em parallax, varal de bandeirinhas, pista de grama com cerca
branca, poste de chegada com bandeira quadriculada, torres de refletores e
arquibancada. A cena é **viva**: um ciclo de 4 minutos passa por manhã de sol,
chuva rápida com arco-íris, tarde dourada, pôr do sol, corrida noturna com
refletores, holofotes, fogos e lightsticks na arquibancada, e amanhecer.

Se quiser um fundo pintado (mais detalhado), gere uma imagem com um dos
prompts abaixo, salve como `public/themes/uma-musume/bg.webp` (WebP, qualidade
~80) e descomente o bloco no fim de `theme.css`. A imagem substitui a pista,
as torres e a arquibancada; céu, luz do ciclo e efeitos continuam por cima.

Regras para qualquer variação:

- **Centro calmo**: a interface (roleta e cards) cobre o meio da tela. Os
  detalhes devem ficar nas bordas, na faixa de cima e na faixa de baixo.
- **Nada de personagens, logos ou arte de franquia.** Só pista genérica e
  palco de idol genérico.
- **Sem texto** na imagem (nem placas, nem números).
- Paleta do tema: céu `#4FB3FF` / `#8FD3FF` / `#CDEEFF`, grama `#62C36A` /
  `#79D27C` / `#9DDF92`, rosa `#FF6FAE` / `#FF8FC8`, menta `#7FE3C8`, dourado
  `#FFC93C` / `#FFD34D`, lilás `#C9A2FF`, branco `#FFFFFF`.

Os prompts ficam em inglês porque os geradores de imagem respondem melhor
assim.

## 1. Pista ensolarada (principal, 2560×1440)

```
Wide anime-style background illustration, 2560x1440, 16:9. A bright sunny
horse racing track seen from the grandstand side, drawn in a cute, energetic
idol-anime style. Low horizon in the bottom third: a lush green turf oval
curving away in perspective from the bottom-left corner toward the right
horizon, crisp white plastic rails with small posts, mowing stripes in two
greens. On the far left edge a tall white finish-line post striped in pink
with a round white sign and a small checkered flag; on the far right edge a
pastel grandstand with a pink-and-white striped awning and a tiny colorful
crowd (no faces, just dots of color). Two slim stadium floodlight towers at
the extreme left and right edges. Big fluffy white cumulus clouds with soft
blue undersides along the top, a string of pastel triangle bunting flags
across the top edge, scattered four-point sparkles and tiny hearts near the
corners. The CENTER of the image is calm and simple: open blue sky fading to
pale near the horizon, no objects in the middle 60% of the width, because a UI
will cover it. Soft cel shading, clean lineless shapes, high saturation pastel
candy colors. Palette: sky #4FB3FF #8FD3FF #CDEEFF, turf #62C36A #79D27C
#9DDF92, pink #FF6FAE #FF8FC8, mint #7FE3C8, gold #FFC93C, lilac #C9A2FF,
white. No characters, no people in focus, no animals, no text, no letters, no
numbers, no logos, no watermark.
```

## 2. Corrida noturna com palco de idol (2560×1440)

```
Wide anime-style background illustration, 2560x1440, 16:9. A racetrack at
night turned into an idol concert venue. Deep navy-to-violet night sky
(#070B2A, #141A52, #2C2A74) full of small twinkling stars and a thin crescent
moon near the top-right corner. Pastel fireworks bursting in the upper-left
and upper-right corners in pink #FF8FC8, mint #7FE3C8 and gold #FFD34D.
Stadium floodlight towers on the far left and far right edges with glowing
warm-white lamp banks and soft light cones falling onto the green turf.
Colored stage spotlight beams (pink, mint, lilac #C9A2FF) sweeping up from the
bottom corners. A grandstand on the right edge with a crowd shown only as
hundreds of tiny glowing penlights in pastel colors and a few camera-flash
sparkles. White rails and a striped pink finish-line post on the left edge,
bunting flags along the top edge. Keep the CENTER calm and dark: plain night
sky and empty turf in the middle 60% of the width, because a UI will cover
it. Soft glow, clean cel shading, cute and energetic mood. No characters, no
visible faces, no text, no letters, no numbers, no logos, no watermark.
```

## 3. Versão vertical para celular (1080×1920)

```
Vertical anime-style background illustration, 1080x1920, 9:16. Bright sunny
horse racing venue in a cute idol-anime style. Top 20%: blue sky #4FB3FF with
fluffy white clouds, a pastel rainbow arc in the upper-left, pastel triangle
bunting flags across the very top, small four-point sparkles. Bottom 25%:
green turf track in perspective (#62C36A, #79D27C) with white rails, a white
finish-line post with pink stripes and a checkered flag on the left edge, a
pink-and-white awning grandstand peeking in on the right edge. The middle 55%
of the image is calm open sky fading to pale #CDEEFF, with no objects, because
a UI will cover it. Pastel candy palette: pink #FF8FC8, mint #7FE3C8, gold
#FFC93C, lilac #C9A2FF, white. Clean cel shading. No characters, no people in
focus, no text, no letters, no numbers, no logos, no watermark.
```
