import {
  Cat,
  Drones,
  GroundLights,
  Koi,
  Ship,
  Spire,
  Street,
  Track,
} from './Actors'
import {
  Bolts,
  FarCity,
  Flare,
  Megas,
  NeonSigns,
  STARS,
  TowerSigns,
  Towers,
  vars,
} from './City'
import Rain from './Rain'
import { Billboards, TowerScreens } from './Screens'
import { Shops } from './Shops'

// Cena de fundo do tema Cyberpunk: NEO-SAMPA 2088, a "terra da garoa" do
// futuro. Megacidade sempre de noite, em camadas 2.5D com névoa entre elas:
// megaestruturas no horizonte (só aparecem contra o clarão dos raios),
// skyline distante com a arcologia, torres nas bordas e, na frente, o
// trilho elevado do maglev e a rua molhada de Liberdade.
//
// Vida da cidade
// - carpa holográfica (koi tancho) nadando na faixa livre do topo, com
//   cauda, sobe-e-desce e falhas de RGB; some no apagão;
// - telões com anúncios (夜市, pastel, 義体 em 12x, guaraná, 노래방...)
//   trocando com glitch a cada 6 s; a cada 197 s hackers tomam todos por
//   ~5 s ("SINAL INVADIDO"); letreiro 酒場 que entra em curto a cada 43 s
//   com faíscas (canvas); 薬 zumbindo; janelas de TV piscando;
// - drones com holofote, viatura-drone perseguindo um carro em fuga (a
//   cada 64 s), dirigível com letreiro corrido (~a cada 2,5 min), maglev a
//   cada 46 s, gato no beiral;
// - rua: lojas debaixo do trilho (konbini, lan house, padaria, bar,
//   máquinas de bebida...), barraca de lamen com vapor e lanternas,
//   pedestres de guarda-chuva LED, bueiros soltando vapor;
// - canvas (Rain.tsx): chuva em 3 profundidades com respingos na rua, nos
//   beirais e no trilho; carros voadores com rastro de luz em 6 faixas.
//
// Ciclo do clima/energia (--cy-cycle 240 s; a página abre em 16%):
//   0–24%   garoa, cidade normal
//   24–34%  vento: nuvens fecham, a chuva engrossa
//   34–56%  tempestade: raios em 38%, 44,5%, 50% e 53,5% acendem o céu
//           atrás das megaestruturas
//   56,2%   raio na agulha da arcologia: apagão em cascata (luz de
//           emergência vermelha, só balizas e drones acesos)
//   64–66%  a energia volta setor por setor, piscando
//   66–80%  a chuva afina e a neblina sobe da rua
//   80–94%  estiada: lua, estrelas e uma estrela cadente (88%)
//   94–100% a garoa volta
// Roleta: girando = pico de energia (neon estoura, telões em "GIRANDO",
// a carpa rodopia, holofotes aceleram, tráfego dispara); vencedor = 当
// gigante na cor da fatia em todos os telões, holofotes de rua e dos
// drones convergem sobre a roleta, rastros dos carros e faíscas na cor
// sorteada; depois assenta num brilho calmo enquanto o resultado estiver
// aberto (nada fica piscando).
// Sem animação (prefers-reduced-motion) fica um quadro parado de garoa.

export default function CyberpunkScene() {
  return (
    <>
      {/* céu: tempestade, estrelas da estiada, lua, clarão dos raios */}
      <div className="cy-storm" />
      <svg
        className="cy-stars"
        viewBox="0 0 2000 400"
        preserveAspectRatio="xMidYMin slice"
        aria-hidden="true"
      >
        <path className="cy-stars-a" d={STARS.a} />
        <path className="cy-stars-b" d={STARS.b} />
      </svg>
      <div className="cy-moon" />
      <i className="cy-meteor" />
      <div className="cy-clouds">
        <span />
        <span />
      </div>
      {/* o clarão fica na frente das nuvens e atrás das megaestruturas */}
      <div className="cy-bflash cy-bflash-l" />
      <div className="cy-bflash cy-bflash-r" />
      <Megas />
      <Ship />
      <Bolts />
      <div className="cy-glow" />

      {/* skyline distante (com névoa por cima), telões, carpa e holofotes */}
      <FarCity />
      <div className="cy-haze-far" />
      <div className="cy-box cy-power" style={vars({ '--cy-d': 0.0025 })}>
        <Spire />
        <Billboards />
        <Koi />
      </div>
      <div className="cy-haze" />

      {/* torres das bordas */}
      <Towers />
      <div className="cy-box cy-power" style={vars({ '--cy-d': 0.0055 })}>
        <TowerSigns />
        <NeonSigns />
        <TowerScreens />
      </div>
      <Flare />
      <Cat />
      <Drones />

      {/* trilho elevado, maglev, lojas debaixo do trilho e a rua */}
      <Track />
      <Shops />
      <Street />
      <GroundLights />

      <div className="cy-dark" />
      <Rain />
      <div className="cy-fog" />
      <div className="cy-surge" />
      <div className="cy-wonglow" />
      <div className="cy-flash" />
      <div className="cy-vignette" />
    </>
  )
}
