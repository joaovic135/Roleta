# Prompt: cena animada viva para um tema

Copie o texto abaixo, troque `<TEMA>` pelo nome do tema (por exemplo "Retrowave"
ou "Cyberpunk") e mande para o Claude. O Vaporwave fica de fora: ele já está do
jeito certo.

---

Anime o fundo do tema **<TEMA>** com uma **cena viva**, no mesmo nível do tema
Homem-Aranha Pixel. Mantenha a estética, as cores e os componentes do tema; mude
só a cena de fundo (e, se fizer sentido, detalhes que reagem a ela).

**1. Ciclo do tempo contínuo** (um loop de 3 a 5 minutos)
- Madrugada → amanhecer → dia → entardecer/pôr do sol → noite, e de volta.
- Céu, luz ambiente e cores da cena mudando aos poucos, com camadas de céu
  cruzando a opacidade.
- Sol e lua atravessando o céu. Estrelas aparecem e cintilam à noite, e de vez
  em quando passa uma estrela cadente.

**2. Clima que alterna sozinho**
- Períodos de chuva, com gotas no estilo do tema, respingos ou reflexos no chão
  e um relâmpago ocasional que ilumina a cena por um instante.
- Períodos de sol forte com lens flare (reflexo de lente) no estilo do tema.
- Nuvens em camadas, com velocidades diferentes (parallax). Neblina leve no
  amanhecer.

**3. Vida na cena**
- Janelas acendendo ao anoitecer e apagando de manhã, cada uma no seu tempo, e
  algumas piscando ou trocando de cor.
- Luzes, letreiros ou sinais que ligam à noite, e pequenos movimentos de vez em
  quando: carros, pássaros, morcegos, fumaça…
- Elementos próprios do tema reagindo ao ciclo (ex.: teias brilhando com o
  orvalho de manhã, neon ligando à noite).

**4. Regras técnicas** (desempenho e acessibilidade)
- Tudo em CSS `@keyframes` animando só `transform` e `opacity`, sem JavaScript
  rodando a cada quadro e sem `backdrop-filter`.
- Variedade com `animation-delay` negativos e durações diferentes, para não
  parecer tudo sincronizado. Sorteios com semente fixa, nada de `Math.random`
  na renderização.
- Poucos elementos: agrupar formas iguais em um `<path>` por cor.
- Com `prefers-reduced-motion`, a cena fica parada num momento bonito do ciclo.
- O centro da tela continua calmo para não atrapalhar a leitura da interface.
- Rodar liso, sem quedas de quadros visíveis.

**5. Entrega**
- Prints da cena em pelo menos 4 momentos do ciclo (dia, pôr do sol, noite com
  chuva, sol com flare), com o tempo da animação acelerado para capturar cada
  momento.
- Uma frase explicando a duração do ciclo e quando cada clima aparece.
