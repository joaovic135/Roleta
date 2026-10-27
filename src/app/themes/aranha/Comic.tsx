import { burst, focusLines } from './geo'

// Camadas de "página de gibi" por cima da cena: moldura de papel com o
// requadro em nanquim, fólio, a página virando no fim do ciclo e as
// reações à roleta (linhas de velocidade + VUUUSH! ao girar; KAPOW! na cor
// vencedora, teia atirada e estouros nas margens quando para).

const SPEED_LIGHT = focusLines(83, 96, 56, 26, 0.3, 1.05)
const SPEED_INK = focusLines(89, 72, 64, 30, 0.1, 0.4)
const KAPOW = burst(34, 180, 100, 170, 92, 18)
const KAPOW_IN = burst(35, 180, 100, 128, 64, 18)
const SIDE = burst(42, 80, 50, 74, 44, 12)

export function Reactions() {
  return (
    <>
      <div className="hq-speed">
        <svg viewBox="-100 -100 200 200" preserveAspectRatio="xMidYMid slice">
          <path className="hq-speed-light" d={SPEED_LIGHT} />
          <path className="hq-speed-ink" d={SPEED_INK} />
        </svg>
      </div>
      <div className="hq-vush">
        <span className="hq-sfx">VUUUSH!</span>
      </div>
      <div className="hq-winwash" />
      <div className="hq-kapow-rays" />
      <div className="hq-webshot">
        <span className="hq-sfx">THWIP!</span>
      </div>
      <div className="hq-kapow">
        <svg viewBox="0 0 360 200">
          <path d={KAPOW} transform="translate(10 11)" fill="#05060c" />
          <path className="hq-kapow-fill" d={KAPOW} />
          <path className="hq-kapow-in" d={KAPOW_IN} />
          <text x="180" y="126">
            KAPOW!
          </text>
        </svg>
      </div>
      <div className="hq-side hq-side-l">
        <svg viewBox="0 0 160 100">
          <path className="hq-kapow-fill" d={SIDE} />
          <text x="80" y="64">
            POW!
          </text>
        </svg>
      </div>
      <div className="hq-side hq-side-r">
        <svg viewBox="0 0 160 100">
          <path className="hq-kapow-fill" d={SIDE} />
          <text x="80" y="64">
            BAM!
          </text>
        </svg>
      </div>
    </>
  )
}

export function Page() {
  return (
    <>
      <div className="hq-page" />
      <div className="hq-folio hq-folio-l">
        TEIA RUBRA Nº 57 · ROLETA COMICS
      </div>
      <div className="hq-folio hq-folio-r">57</div>
      {/* a página vira: a folha (verso com a impressão vazada) cobre a tela
          e a cena troca de capítulo por baixo dela */}
      <div className="hq-turn">
        <div className="hq-sheet hq-cyc" />
      </div>
    </>
  )
}
