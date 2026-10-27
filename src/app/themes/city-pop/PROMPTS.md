# City Pop: prompts para imagens de fundo

O tema já funciona só com a cena desenhada em SVG/CSS (`Scene.tsx` +
`theme.css`), que é animada: anoitecer, noite, chuva de madrugada e amanhecer
num ciclo de 4 minutos. Se quiser trocar o cenário por uma imagem gerada por
IA, use um dos prompts abaixo (em inglês, que é como os geradores entendem
melhor), salve o resultado como `public/themes/city-pop/bg.webp` (de
preferência em WebP, qualidade ~80, abaixo de ~600 KB) e descomente o bloco no
fim do `theme.css`. A chuva, o relâmpago e a vinheta continuam por cima.

Dicas:

- A interface ocupa o centro da tela; peça sempre um **centro mais calmo e
  escuro** e deixe os letreiros e prédios nas bordas esquerda e direita.
- Os textos dos letreiros devem ser **genéricos** (カラオケ, ラーメン, 酒場,
  東京, 夜, ネオン…). Geradores costumam inventar marcas: refaça a imagem se
  aparecer qualquer nome de loja real ou logotipo.
- Paleta do tema: rosa neon `#ff3d9a`, ciano `#2de2e6`, vermelho `#ff2a44`,
  violeta `#b46bff`, âmbar `#ffb547`, céu `#0f0838` → `#4d1670`, asfalto
  `#120a28`, título rosa-pastel `#f8c8dc`.
- Versão de celular: gere também em 1080×1920 e use uma media query
  `(orientation: portrait)` apontando para `bg-portrait.webp`.

## 1. Rua de Tóquio à noite (fotorrealista / cinematográfica)

```text
Cinematic night photograph of a narrow street in a generic Tokyo-like
entertainment district after rain, one-point perspective looking straight
down the street to a vanishing point in the center. Tall buildings frame the
left and right edges, each covered with stacks of vertical neon signboards in
hot pink, red and cyan with generic vertical Japanese words like カラオケ,
ラーメン, 酒場, 東京, 夜 (no store names). Wet black asphalt with long
mirror-like reflections of the neon, puddles, faint light trails of distant
car headlights and red taillights, a single glowing street lamp with soft
bloom, overhead power lines, light drizzle, pink and cyan light spilling on
the walls, slight haze. The center of the frame is calmer and darker (deep
blue-purple sky and distant street) so UI can sit on top. 35mm, f/1.8,
shallow depth of field, anamorphic bokeh, high dynamic range.
Palette: #ff3d9a, #2de2e6, #ff2a44, #b46bff, #ffb547, sky #0f0838 to #4d1670,
asphalt #120a28.
Size 2560x1440 (also 1080x1920 portrait version).
No legible brand names, no logos, no real store names, no people's faces in
focus (only small blurred silhouettes with umbrellas at most), no text
overlays, no watermark.
```

## 2. Ilustração city pop anos 80 (capa de disco)

```text
1980s Japanese city pop album cover illustration, flat airbrushed gradients
and clean lines in the style of retro anime backgrounds. A night street in a
generic Tokyo-like district seen in one-point perspective: buildings with
vertical neon signboards on both sides (generic katakana words like ネオン,
カメラ, カラオケ, 喫茶), a pastel pink crescent moon in a deep blue-violet sky,
overhead wires, a glowing street lamp, a wet road reflecting pink and cyan
light, tiny car light trails at the vanishing point. Calm, empty center area
for a UI overlay; the busy details stay on the left and right edges.
Palette: pastel pink #f8c8dc, neon pink #ff3d9a, cyan #2de2e6, violet #b46bff,
amber #ffb547, night sky #0f0838 to #4d1670.
Size 2560x1440. Soft film grain, subtle bloom.
No legible brand names, no logos, no characters, no text other than the
generic sign words, no watermark.
```

## 3. Textura abstrata de reflexos (alternativa leve)

```text
Abstract close-up of rain-soaked asphalt at night reflecting out-of-focus neon
signs: long vertical streaks and bokeh circles in hot pink, cyan, red and
violet, rippled by small raindrops, heavy blur, dark calm center fading to
near-black, colorful edges. Minimal, moody, cinematic.
Palette: #ff3d9a, #2de2e6, #ff2a44, #b46bff on #08040f.
Size 2560x1440 (also 1080x1920).
No legible text, no brand names, no logos, no people, no watermark.
```
