// Tira a cena de fundo do caminho enquanto o modal do vencedor está aberto.
//
// 1. Esconde a cena (opacidade 0 no contêiner) no quadro em que o modal
//    abre, por trás do fundo escuro dele. Com opacidade 0 a GPU deixa de
//    compor as centenas de camadas e filtros da cena: em temas pesados
//    (Good Times, Cine Pulp...) era isso que engasgava a entrada do modal,
//    enquanto os temas leves (Retrowave) abriam lisos. Uma animação só no
//    contêiner, sem recalcular estilo.
// 2. Depois da entrada do modal, congela as animações CSS da cena pela Web
//    Animations API (pausar força um cálculo de estilo: fora da entrada) e
//    traz a cena de volta, parada, atrás do fundo translúcido.
//
// Antes a pausa era uma regra `html[data-dialog='open'] .theme-backdrop *,
// ::before, ::after { animation-play-state: paused !important }`: trocar o
// atributo no <html> obrigava o navegador a recalcular o estilo de toda a
// cena (~600–1000 elementos contra todas as folhas de tema) bem no primeiro
// quadro do modal, 30–100 ms de travada. Pausar cada Animation direto custa
// quase nada.
//
// Só pausa o que está rodando e cujo CSS não mexe em animation-play-state:
// depois de pause()/play() por script o navegador passa a ignorar
// animation-play-state daquela animação, e alguns temas usam essa
// propriedade para ligar/desligar camadas conforme a roleta gira.

// a pausa e a volta da cena esperam a entrada do modal terminar
const PAUSE_AT_MS = 900
const RETURN_MS = 450

export function pauseSceneAnimations(): () => void {
  const backdrop = document.querySelector<HTMLElement>('.theme-backdrop')
  if (!backdrop || typeof backdrop.animate !== 'function') return () => {}

  // sai de uma vez, no quadro em que o modal abre: um degradê de opacidade
  // no contêiner obrigaria a GPU a compor a cena inteira numa superfície à
  // parte a cada quadro, justo durante a entrada (medido: engasgava igual)
  const hide = backdrop.animate([{ opacity: 0 }, { opacity: 0 }], {
    duration: 1,
    fill: 'forwards',
  })

  const paused: Animation[] = []
  let back: Animation | null = null
  const timer = window.setTimeout(() => {
    for (const animation of backdrop.getAnimations({ subtree: true })) {
      if (animation === hide || animation.playState !== 'running') continue
      const effect = animation.effect
      if (effect instanceof KeyframeEffect && effect.target) {
        const state = getComputedStyle(
          effect.target,
          effect.pseudoElement,
        ).animationPlayState
        if (state.includes('paused')) continue
      }
      animation.pause()
      paused.push(animation)
    }
    back = backdrop.animate([{ opacity: 0 }, { opacity: 1 }], {
      duration: RETURN_MS,
      easing: 'ease-out',
      fill: 'forwards',
    })
    hide.cancel()
  }, PAUSE_AT_MS)

  return () => {
    window.clearTimeout(timer)
    // as que o CSS removeu nesse meio tempo (fase da roleta mudou) já foram
    // canceladas e ficam como estão
    for (const animation of paused)
      if (animation.playState === 'paused') animation.play()
    // fechou antes da volta: a cena volta junto com o fechamento
    hide.cancel()
    back?.cancel()
  }
}
