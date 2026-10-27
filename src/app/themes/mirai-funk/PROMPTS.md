# Mirai Funk: prompts de arte

O tema já funciona só com CSS/SVG (céu duotone, cidade com janelinhas, ciclo
de dia e noite). Estes prompts geram arte opcional para deixar o fundo mais
parecido com uma capa de Future Funk. Os prompts ficam em inglês porque os
geradores de imagem entendem melhor.

**Paleta do tema** (use as mesmas cores para a arte casar com a interface):

| Uso | Hex |
| --- | --- |
| Verde-água claro (céu) | `#1fb0a2` / `#00a79d` |
| Verde-água escuro (chão) | `#1b4d45` / `#164039` |
| Preto (cidade, contornos) | `#040807` |
| Branco / menta (tipografia, estrelas) | `#ffffff` / `#e8fbf8` |

**Onde a interface fica:** cabeçalho no topo (título à esquerda, volume à
direita) e três colunas de cards no meio. No desktop sobram as bordas
laterais, a faixa do cabeçalho e o rodapé. Por isso o centro de cada imagem
deve ser calmo (cor chapada, sem detalhe importante), com a arte nas bordas.

## Como usar

1. Gere a imagem e exporte em WebP (qualidade 80–85).
2. Salve em `public/themes/mirai-funk/` com o nome indicado.
3. No fim de `theme.css` há um bloco comentado que mostra como ligar a imagem
   (`bg.webp` como fundo inteiro, ou `art.webp` só com a personagem, presa à
   direita). Descomente o que quiser usar.

---

## 1. Fundo completo: `bg.webp`

Substitui o céu e o chão chapados; a cidade, as estrelas e o ciclo continuam
por cima (ou esconda a cena, ver o bloco comentado).

```
Flat two-tone poster background in the style of 1980s Japanese city pop and
future funk album covers. Upper 58% is a flat light teal sky (#1fb0a2), lower
42% is a flat dark green-teal ground (#1b4d45), separated by a crisp straight
horizon line in black (#040807). Along the horizon, a black city skyline
silhouette with tiny square teal windows in neat grids, low on the left and
right edges, very low and sparse in the middle. A few thin white horizontal
rule lines near the top edge, like graphic design guides. Subtle starry
speckle texture (tiny white dots and four-point sparkles) scattered on the
dark ground and lightly in the corners of the sky. The center of the image
must stay calm and empty, flat color only, because a user interface covers
it. Strictly flat vector style, sharp edges, no gradients, no glow, no
texture noise, no people. No text, no letters, no logos, no watermark.
Size 2560x1440 (16:9). Palette only: #1fb0a2, #00a79d, #1b4d45, #164039,
#040807, #ffffff.
```

Versão em pé (celular), mesmo prompt trocando o final por: `Vertical
composition, size 1080x1920 (9:16), horizon at 60% of the height, skyline
along the bottom edge, top 30% empty flat sky.`

## 2. Personagem à direita: `art.webp` (fundo transparente)

Ilustração original no estilo anime dos anos 80, para a borda direita. Não é
nenhuma personagem existente.

```
Original character illustration in 1980s Japanese anime style (cel shading,
clean ink lines, soft retro eyes), strictly duotone teal: a young woman seen
in three-quarter profile from the shoulders up, looking up and to the left,
calm and dreamy expression, with very long flowing hair that sweeps
dramatically upward and to the left like a wave. Her hair is filled with a
starry night sky texture: tiny white dots and four-point sparkles inside the
dark teal hair. Rendered only in flat light teal (#1fb0a2), dark teal
(#1b4d45), black (#040807) and white (#ffffff) highlights, like a two-color
screen print. Placed on the right third of the frame, cropped by the right
and bottom edges; the left two thirds of the image are completely empty and
transparent. Sharp poster-like edges, no gradients, no glow. Original
character, not based on any existing anime, manga or celebrity. No text, no
letters, no logos, no watermark. Transparent background (PNG). Size 2560x1440
(16:9).
```

Versão celular: `Size 1080x1920 (9:16), the character occupies the bottom
40% of the frame, hair flowing up the right edge; top 60% empty and
transparent.`

## 3. Variante noturna (opcional): `bg-night.webp`

Para quem quiser trocar a arte pela versão de noite. Ela não cruza com o
ciclo sozinha: precisa de uma regra extra no CSS.

```
Same flat two-tone poster composition as a 1980s future funk album cover, at
night: upper sky near-black teal (#072220), lower ground almost black teal
(#051311), crisp black horizon line. Black city skyline along the horizon
with tiny square windows lit in pale mint (#dcfbf5), irregular so the city
feels alive, low and sparse in the middle. A thin white crescent moon in the
upper right corner. Many tiny white stars and four-point sparkles in the sky,
and a striped flat reflection of the skyline on the ground. Center of the
image calm and empty for the user interface. Flat vector style, sharp edges,
no gradients, no glow. No text, no letters, no logos, no watermark. Size
2560x1440 (16:9).
```
