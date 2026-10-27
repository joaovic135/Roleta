# Half-Life: prompts para a arte de fundo

A cena atual é toda em SVG/CSS (teto com lâmpadas fluorescentes, canos, placas
de perigo, feixe verde e HUD) e roda o ciclo do complexo: turno normal, alarme,
queda de energia e tempestade de portal. Uma imagem gerada pode entrar **por
baixo** dessa cena, como textura de parede e profundidade, sem substituí-la.

Como a interface cobre quase todo o centro da tela, os prompts pedem o centro
mais calmo e escuro. Os detalhes ficam nas bordas, no alto e no piso.

Para usar a imagem:

1. Gere em 2560×1440 e, se quiser, uma versão vertical 1080×1920 para celular.
2. Converta para WebP com qualidade de 75 a 80. O arquivo deve ficar com menos
   de 400 KB.
3. Salve em `public/themes/half-life/bg.webp`.
4. Descomente o bloco no fim de `theme.css`.

Evite imagens com texto, logotipos ou personagens. A ideia é um laboratório
original no mesmo clima.

---

## 1. Câmara de testes (principal, desktop)

Este é o fundo principal. A parede de concreto e metal fica atrás da roda, e um
brilho verde vem da câmara no centro.

```
Wide 2560x1440 background illustration of an underground research facility
test chamber, seen from inside. Dark industrial concrete walls with riveted
grey-green metal panels, thick pipes and cable trays running vertically along
the far left and right edges, a row of long fluorescent tube fixtures on the
ceiling strip at the top, yellow and black hazard stripes along the floor edge
at the bottom. In the center, deep in the background, a circular test chamber
emits a soft green resonance glow and a thin vertical energy beam from a
ceiling emitter. Keep the central 60% of the image calm, dark and low in
detail (it will be covered by the interface); put the interesting details at
the edges, the top strip and the floor. Moody cinematic lighting, subtle
volumetric haze, slight CRT scanline feel, realistic but painterly,
late-1990s sci-fi game atmosphere. Palette: concrete #131716 #1b201f
#2b3230, metal highlights #56605c, hazard yellow #f2b800, HUD orange
#ff9b00, resonance green #6dff3a #b6ff7a, alarm red #ff3b1f used sparingly.
No text, no logos, no letters, no symbols of real brands, no people, no
characters.
```

## 2. Corredor de manutenção (variação)

Esta variação é mais fria. É um corredor visto de frente, com mais
profundidade.

```
Wide 2560x1440 background of a long underground maintenance corridor in a
secret research complex, one-point perspective with the vanishing point at
the center. Concrete walls with metal panel seams, rusty pipes, valve wheels,
small warning lamps and a radiation trefoil warning plate on the side walls,
flickering fluorescent tubes on the ceiling, wet floor grating with yellow and
black hazard stripes. Far away at the end of the corridor a faint green glow
leaks through a blast door. The center of the image is dark, blurred and
nearly empty (the interface sits on top of it); details only near the left
and right edges, the ceiling and the floor. Gritty, cinematic, low saturation
except for accents. Palette: #0a0c0c #131716 #2b3230 #56605c, accents
#ff9b00 #f2b800 #6dff3a. No text, no logos, no letters, no people, no
characters.
```

## 3. Versão vertical para celular

```
Vertical 1080x1920 background of an underground research facility shaft:
concrete and riveted metal panel walls, vertical pipes and cables along both
side edges, fluorescent tube fixtures at the very top, a hazard-striped
yellow and black floor edge at the very bottom, and a soft green energy glow
rising from a test chamber far below. The middle 70% of the image stays dark,
calm and low in detail because the interface covers it. Moody cinematic
lighting, light haze, subtle scanlines. Palette: #131716 #1b201f #56605c,
#ff9b00 #f2b800 #6dff3a. No text, no logos, no letters, no people, no
characters.
```
