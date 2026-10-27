import { Stage } from './Alley'
import { Arcade, Cat, Crt, Poster, Steam, Vending } from './Props'
import Rain from './Rain'
import { Sky, Street } from './Sky'

// Cena de fundo do tema Neon Noir: um beco estreito de fliperamas numa
// Tóquio de 199X que nunca existiu. Ponto de fuga atrás da roleta, paredes
// dos dois lados cheias de letreiros de tubo (ゲーム, 電気, 薬, 夢, ネオン,
// 電脳...), caveira e lótus de néon, chão molhado refletindo tudo, e no
// alto um céu em pixel art: estrelas densas, planeta anelado gigante e
// nuvens de algodão-doce.
//
// Vida do beco
// - letreiros zumbem e falham cada um no seu ritmo (薬 morre e volta a
//   cada 37 s, 酒 a cada 53 s); a caveira pisca os olhos;
// - pôster de anime (garota de jaqueta esportiva com teclado mecânico)
//   com varredura, reflexo no vidro, piscadela e glitch;
// - TV de tubo com um joguinho de navinha; fliperama com moeda girando e
//   "INSERT COIN"; walkman com os carretéis rodando;
// - vapor do bueiro, gato atravessando a rua (a cada 53 s), carro voador
//   (29 s) e o trem do céu (47 s) passando no alto;
// - canvas (Rain.tsx): chuva com respingos e anéis nas poças.
//
// Ciclo do clima (--nn-cycle 180 s; a página abre em 6%):
//   0–28%   garoa, nuvens rosa
//   28–40%  a chuva engrossa, nuvens de tempestade fecham o céu
//   40–60%  temporal: relâmpagos em 43%, 50% e 56% (no de 50% os
//           letreiros caem e voltam piscando)
//   60–69%  a chuva afina e para
//   69–94%  céu limpo: estrelas no máximo, planeta aceso, estrelas
//           cadentes em 75% e 86%
//   94–100% a garoa volta
// Roleta: girando = néons no talo pulsando, chuva acelera, telas em
// "SPIN"; vencedor = explosão na cor da fatia, todos os letreiros acesos,
// "大当たり JACKPOT" no alto e no fliperama, respingos na cor sorteada;
// depois assenta aceso e parado.
// Sem animação (prefers-reduced-motion) fica um quadro parado de garoa.

export default function NeonNoirScene() {
  return (
    <>
      <Sky />
      <Street />
      <Stage side="l">
        <Steam />
        <Arcade />
        <Crt />
      </Stage>
      <Stage side="r">
        <Poster />
        <Vending />
      </Stage>
      <Cat />
      <Rain />
      <div className="nn-surge" />
      <div className="nn-burst" />
      <div className="nn-winglow" />
      <div className="nn-flash" />
      <div className="nn-vignette" />
    </>
  )
}
