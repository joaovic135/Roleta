'use client'

import Audience from './Audience'
import { Beam, FilmWear, Grain } from './Film'
import Marquee from './Marquee'
import { PosterCase } from './Posters'
import { Creature, Premiere, Saucer } from './Show'
import { Drape, Sconce, Tassel, Wall } from './Sides'
import { Valance } from './Top'

// Cena do tema Cine Pulp: um palácio de cinema art déco em noite de sessão
// dupla, visto da plateia. A interface é a tela; em volta dela a sala vive
// o filme: letreiro de lâmpadas com o tambor de títulos, cortinas de
// veludo, cartazes pulp e grades de órgão douradas nas paredes, a plateia
// em silhueta (que comemora o vencedor), o facho do projetor cheio de
// poeira e a película gasta por cima de tudo (que às vezes queima).
// Linha do tempo (ciclo de 180 s) e reações à roleta: ver theme.css.
//
// Tudo é desenhado aqui (SVG gerado com sorteio de semente fixa) e
// animado só por CSS em transform/opacity; o único JS é o tile de ruído
// da granulação, gerado uma vez ao montar.

function Side({ side }: { side: 'l' | 'r' }) {
  return (
    <div className={`cn-side cn-side-${side}`}>
      <div className="cn-flip">
        <Wall side={side} />
      </div>
      {side === 'r' && <Creature />}
      <PosterCase
        front={side === 'l' ? 'saucers' : 'robot'}
        back={side === 'l' ? 'swamp' : 'rocket'}
        id={side + '1'}
        className="cn-case-1"
      />
      <PosterCase
        front={side === 'l' ? 'noir' : 'prices'}
        id={side + '2'}
        className="cn-case-2"
      />
      <div className="cn-sconce cn-sconce-a">
        <i className="cn-sconce-pool" />
        <Sconce id={side + 'a'} />
      </div>
      <div className="cn-sconce cn-sconce-b">
        <i className="cn-sconce-pool" />
        <Sconce id={side + 'b'} />
      </div>
      {side === 'l' && <span className="cn-exit">SAÍDA</span>}
      <div className="cn-flip">
        <div className="cn-drape">
          <Drape side={side} />
          <div className="cn-tassel">
            <Tassel />
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Scene() {
  return (
    <>
      <div className="cn-room" />
      <div className="cn-rays">
        <i className="cn-rays-back" />
        <i className="cn-rays-front" />
      </div>
      <Side side="l" />
      <Side side="r" />
      <div className="cn-valance">
        <Valance />
      </div>
      <div className="cn-moods">
        <i className="cn-mood cn-mood-a" />
        <i className="cn-mood cn-mood-b" />
        <i className="cn-mood cn-mood-c" />
        <i className="cn-mood cn-mood-d" />
      </div>
      <i className="cn-house" />
      <i className="cn-dim" />
      <Marquee />
      <Audience />
      <Beam />
      <Saucer />
      <i className="cn-scare" />
      <Premiere />
      <div className="cn-vignette" />
      <FilmWear />
      <Grain />
    </>
  )
}
