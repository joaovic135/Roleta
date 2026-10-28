import type { CSSProperties } from 'react'
import {
  ARCS_SIDE,
  ARCS_TOP,
  GuideLights,
  HlDefs,
  StaticTunnel,
  TUNNEL_VIEW,
} from './Art'
import Hud from './Hud'
import TramSpeed from './Speed'
import { MOTES, RIB_VIEW, SPARKS, loop, r1 } from './geo'

// Cena de fundo do tema Half-Life (só aparece com data-theme="half-life").
//
// Primeira pessoa num bonde de monotrilho atravessando os túneis de trânsito
// do Complexo de Pesquisa Pedra Funda, nível -3. Perspectiva CSS 3D de
// verdade (perspective: 74vh, ponto de fuga em 50% 45%, atrás da roda):
// - túnel fixo em SVG: paredes, canos, cabos, faixas pintadas e as guias de
//   LED verdes. Tudo isso corre AO LONGO do túnel, então não muda quando o
//   bonde anda: vira triângulos fixos saindo do ponto de fuga;
// - cambotas de aço (8, com 3 variantes: telefone SOS + placa de saída,
//   hidrante + quadro elétrico, e uma com a luminária queimada piscando)
//   vêm do fundo com translateZ, trazendo braçadeiras, lâmpadas âmbar e as
//   luminárias fluorescentes cuja luz desliza pelo teto e paredes;
// - poeira em 3D que vira bokeh perto da câmera; comporta blindada "07" que
//   se abre quando o bonde chega (a cada 95 s);
// - cabine: letreiro de LED com o itinerário, alças balançando, giroflex,
//   console com faixa zebrada, reflexos no vidro; o drone de carga ZC-3
//   acompanha o bonde pela esquerda com uma caixa radioativa pendurada;
// - HUD do traje nos cantos (saúde, traje, velocidade, hodômetro rolando).
//
// Ciclo do complexo (--hl-cycle, 180 s; 1% = 1,8 s), em theme.css:
//    0–36%  viagem normal
//   36–38%  as lâmpadas piscam e apagam
//   38–52%  apagão: só as guias verdes, lâmpadas vermelhas da cabine e o
//           brilho distante da câmara de ressonância
//   52–70%  tempestade de ressonância: surtos e arcos verdes, faíscas
//   70–74%  energia volta piscando
//   74–100% viagem normal
// Laços próprios: cambotas a cada 2,5 s (20 s do fundo até a câmera),
// luminária queimada a cada 20 s, comporta a cada 95 s, drone (bob 4,7 s,
// deriva 31 s, olhar 9 s, varredura com o holofote a cada 47 s), letreiro
// (34 s), hodômetro (1,2 s por metro).
// Cambotas e comporta são bitmaps WebP desenhados a partir da arte vetorial
// de Art.tsx (camadas grandes em SVG eram rasterizadas de novo a cada
// mudança de estilo da página); a aceleração usa playbackRate (Speed.tsx).
// Roleta (data-wheel no <html>): girando = modo alarme (giroflex âmbar,
// "ANOMALIA DETECTADA", túnel 5× mais rápido com rastros de luz, vagão
// trepidando, drone assustado); vencedor = anel de ressonância na cor da
// fatia (--win-color) atravessando o túnel, clarão suave, "+1 SORTEIO" no
// HUD; enquanto o modal fica aberto, as guias de LED e o brilho do fundo
// ficam na cor vencedora (calmo, sem piscar).

const RIBS = 8
const RUN = 20 // s: do fundo (z = -190vh) até passar da câmera (z = +18vh)
const Z0 = -190
const Z1 = 18
const VARIANTS = [
  'rib-a',
  'rib-b',
  'rib-a',
  'rib-c',
  'rib-b',
  'rib-a',
  'rib-b',
  'rib-a',
]

// fração do percurso de cada cambota no instante 0 (e no quadro parado)
const phase = (i: number) => (i + 0.5) / RIBS
const ribStyle = (i: number, run: number): CSSProperties => {
  const f = phase(i)
  return {
    transform: `translateZ(${r1(Z0 + (Z1 - Z0) * f)}vh)`,
    opacity: Math.min(1, Math.round((f / 0.45) * 100) / 100),
    animationDelay: `${-r1(f * run * 100) / 100}s`,
  }
}

// rastros de luz nas paredes (só com a roleta girando)
const STREAKS = [
  [-90, -30, 0],
  [-90, 4, -0.45],
  [-90, 31, -0.8],
  [90, -26, -0.25],
  [90, 8, -0.65],
  [90, 34, -0.95],
].map(([x, y, d]) => ({
  left: `calc(50% + ${x}vh)`,
  top: `calc(45% + ${y}vh)`,
  animationDelay: `${d}s`,
}))

const RING = loop(30) // contorno da seção do túnel

// criatura de ressonância (desenho original): sino com borda recortada,
// núcleo brilhante e tentáculos ondulados
const BELL =
  'M10 62C8 22 112 22 110 62C108 72 98 70 92 77C86 71 76 74 68 79C60 74 ' +
  '52 74 46 79C38 73 30 72 26 77C20 70 12 72 10 62Z'
const CORE = 'M38 54C38 36 82 36 82 54C82 64 38 64 38 54Z'
const TENTACLES = Array.from({ length: 7 }, (_, i) => {
  const x = 22 + i * 12.6
  const w = i % 2 ? 7 : -7
  return `M${r1(x)} 74C${r1(x + w)} 94 ${r1(x - w)} 112 ${r1(x + w / 2)} ${
    128 + (i % 3) * 7
  }`
}).join('')

const LED_TEXT =
  'LINHA 3 · TRÂNSITO INTERNO ▸ PRÓXIMA ESTAÇÃO: SETOR C — MATERIAIS ' +
  'ANÔMALOS ▸ MANTENHA BRAÇOS E PERNAS DENTRO DO VAGÃO ▸ COMPLEXO DE ' +
  'PESQUISA PEDRA FUNDA · NÍVEL -3 ▸ '

// arcos: um SVG de tela cheia no mesmo sistema do túnel
const ArcSvg = ({ d }: { d: string }) => (
  <svg
    className="hl-tunnel"
    viewBox={TUNNEL_VIEW}
    preserveAspectRatio="xMidYMid meet"
    aria-hidden="true"
  >
    <path className="hl-arc-glow" d={d} />
    <path className="hl-arc-core" d={d} />
  </svg>
)

// facho do giroflex: cunha com gradiente CSS (gira inteira)
const Beam = () => <i className="hl-beacon-beam" />

// drone de carga ZC-3 (corpo em SVG; olho, luzes e caixa em HTML para
// poderem se mexer sem animar nada dentro do SVG)
function Drone() {
  return (
    <div className="hl-drone" aria-hidden="true">
      <div className="hl-drone-react">
        <div className="hl-drone-bob">
          <i className="hl-drone-beam" />
          <div className="hl-crate" />
          <svg viewBox="0 0 160 110">
            <defs>
              <linearGradient id="hl-g-drone" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#5b6a65" />
                <stop offset="0.45" stopColor="#2e3836" />
                <stop offset="1" stopColor="#121716" />
              </linearGradient>
              <pattern
                id="hl-p-haz-s"
                width="8"
                height="8"
                patternUnits="userSpaceOnUse"
                patternTransform="rotate(45)"
              >
                <rect width="4" height="8" fill="#e0ad1a" />
                <rect x="4" width="4" height="8" fill="#141414" />
              </pattern>
            </defs>
            <path
              d="M56 40L24 24M104 40L136 24M100 32l8-14"
              stroke="#2b3432"
              strokeWidth="5"
              strokeLinecap="round"
            />
            <ellipse cx="24" cy="19" rx="27" ry="4.5" fill="#d4e8e0" />
            <ellipse cx="136" cy="19" rx="27" ry="4.5" fill="#d4e8e0" />
            <path
              d="M19 23h10v6H19ZM131 23h10v6h-10Z"
              fill="#1a201e"
              stroke="#060807"
            />
            <path
              d="M74 72v9l-7 9M86 72v9l7 9"
              fill="none"
              stroke="#2b3432"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            <rect
              x="44"
              y="30"
              width="72"
              height="44"
              rx="20"
              fill="url(#hl-g-drone)"
              stroke="#070908"
              strokeWidth="2"
            />
            <rect x="50" y="62" width="60" height="6" fill="url(#hl-p-haz-s)" />
            <circle
              cx="80"
              cy="47"
              r="13"
              fill="#040605"
              stroke="#51605b"
              strokeWidth="2.5"
            />
            <text
              x="58"
              y="44"
              fontSize="7"
              fill="#e0ad1a"
              style={{ fontFamily: 'var(--font-black-ops), sans-serif' }}
            >
              ZC-3
            </text>
          </svg>
          <i className="hl-drone-eye" />
          <i className="hl-nav hl-nav-l" />
          <i className="hl-nav hl-nav-r" />
          <b className="hl-drone-say hl-say-spin">!?</b>
          <b className="hl-drone-say hl-say-won">♥</b>
        </div>
      </div>
    </div>
  )
}

export default function HalfLifeScene() {
  return (
    <>
      <HlDefs />

      {/* mundo: balança junto com o vagão */}
      <div className="hl-view">
        <StaticTunnel />
        {/* névoa do fundo e luz das bordas (gradiente CSS, não repinta) */}
        <i className="hl-fog" />
        {/* câmara de ressonância lá no fundo (atrás da roda) */}
        <div className="hl-far-wrap">
          <i className="hl-far" />
        </div>
        <i className="hl-winglow" />

        <div className="hl-rumble">
          <div className="hl-set hl-set-slow">
            {/* cambotas: bitmaps (public/themes/half-life) desenhados a partir
                da arte vetorial de Art.tsx; ver o comentário lá */}
            {VARIANTS.map((v, i) => (
              <div
                key={i}
                className={`hl-rib hl-${v}`}
                style={ribStyle(i, RUN)}
              >
                {v === 'rib-c' && <i className="hl-fault" />}
              </div>
            ))}

            {/* comporta blindada 07: as folhas correm para dentro das
                paredes (a caixa corta o que sai da seção do túnel) */}
            <div className="hl-door">
              <i className="hl-leaf hl-leaf-l" />
              <i className="hl-leaf hl-leaf-r" />
              <i className="hl-door-frame" />
            </div>

            {/* vapor escapando de uma válvula (fica parado no túnel e
                cresce enquanto o bonde passa) */}
            <i className="hl-steam hl-steam-r" />
            <i className="hl-steam hl-steam-l" />

            {MOTES.map((m, i) => (
              <i
                key={i}
                className="hl-mote"
                style={{
                  left: `calc(50% + ${m.x}vh)`,
                  top: `calc(45% + ${m.y}vh)`,
                  animationDuration: `${m.dur}s`,
                  animationDelay: `${m.delay}s`,
                }}
              />
            ))}
          </div>

          {/* rastros de luz nas paredes (só com a roleta girando; o túnel
              em si acelera via playbackRate, em Speed.tsx) */}
          <div className="hl-set hl-set-streaks">
            {STREAKS.map((s, i) => (
              <i key={i} className="hl-streak" style={s} />
            ))}
          </div>
        </div>
      </div>

      {/* apagão e luzes que sobrevivem a ele (as guias também acendem na
          cor da fatia vencedora enquanto o modal fica aberto) */}
      <i className="hl-dark" />
      <GuideLights />
      <GuideLights win />
      <div className="hl-emerg">
        <i />
      </div>

      {/* tempestade de ressonância: um só invólucro liga e desliga tudo */}
      <div className="hl-stormfx">
        <div className="hl-storm">
          <i />
        </div>
        <div className="hl-arcs">
          {[...ARCS_TOP, ...ARCS_SIDE].map((d, i) => (
            <div key={i} className={`hl-arc hl-arc-${i}`}>
              <ArcSvg d={d} />
            </div>
          ))}
        </div>
        <div className="hl-set hl-set-storm">
          {SPARKS.map((s, i) => (
            <i
              key={i}
              className="hl-spark"
              style={{
                left: `calc(50% + ${s.x}vh)`,
                top: `calc(45% + ${s.y}vh)`,
                animationDuration: `${s.dur}s`,
                animationDelay: `${s.delay}s`,
              }}
            />
          ))}
          {/* criatura de ressonância: água-viva luminosa que atravessou o
              portal e flutua rente à parede esquerda */}
          <div className="hl-critter">
            <div className="hl-critter-body">
              <svg viewBox="0 0 120 150" aria-hidden="true">
                <path className="hl-critter-tent" d={TENTACLES} />
                <path className="hl-critter-bell" d={BELL} />
                <path className="hl-critter-core" d={CORE} />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* roleta: alarme (girando) e ressonância (vencedor) */}
      <div className="hl-alarm">
        <i className="hl-alarm-lamp" />
      </div>
      <div className="hl-set hl-set-fx">
        <div className="hl-ring hl-ring-1">
          <svg viewBox={RIB_VIEW} preserveAspectRatio="none">
            <path className="hl-ring-glow" d={RING} />
            <path className="hl-ring-core" d={RING} />
            <path className="hl-ring-hot" d={RING} />
          </svg>
        </div>
        <div className="hl-ring hl-ring-2">
          <svg viewBox={RIB_VIEW} preserveAspectRatio="none">
            <path className="hl-ring-glow" d={RING} />
            <path className="hl-ring-core" d={RING} />
            <path className="hl-ring-hot" d={RING} />
          </svg>
        </div>
      </div>
      <i className="hl-winflash" />

      {/* cabine do bonde */}
      <i className="hl-glass" />
      <div className="hl-cab-top">
        <i className="hl-elamp hl-elamp-l" />
        <i className="hl-elamp hl-elamp-r" />
        {/* as duas lâmpadas acesas num invólucro só (uma animação) */}
        <div className="hl-elamps-lit">
          <i className="hl-elamp hl-elamp-l" />
          <i className="hl-elamp hl-elamp-r" />
        </div>
      </div>
      <div className="hl-beacon hl-beacon-l">
        <Beam />
        <b className="hl-beacon-lamp" />
      </div>
      <div className="hl-beacon hl-beacon-r">
        <Beam />
        <b className="hl-beacon-lamp" />
      </div>
      <div className="hl-handle hl-handle-l">
        <i className="hl-handle-grip" />
      </div>
      <div className="hl-handle hl-handle-r">
        <i className="hl-handle-grip" />
      </div>

      <div className="hl-led" aria-hidden="true">
        <div className="hl-led-screen">
          <div className="hl-stack hl-led-rows">
            {/* fita do ciclo: itinerário / apagão / tempestade */}
            <div className="hl-cyc hl-led-flip">
              <div className="hl-flip-strip hl-flip-3">
                <div className="hl-stack">
                  <div className="hl-led-marquee hl-led-route">
                    <span className="hl-led-track">
                      <span>{LED_TEXT}</span>
                      <span>{LED_TEXT}</span>
                    </span>
                  </div>
                  {/* aviso sincronizado com a comporta 07 */}
                  <div className="hl-led-door">
                    <span>COMPORTA 07 · ABRINDO</span>
                  </div>
                </div>
                <div className="hl-led-dark">
                  <span className="hl-led-blink">ENERGIA AUXILIAR</span>
                </div>
                <div className="hl-led-red">
                  <span>◆ RESSONÂNCIA INSTÁVEL</span>
                </div>
              </div>
            </div>
            <div className="hl-v-spin">
              <span className="hl-led-blink">▲ ANOMALIA DETECTADA ▲</span>
            </div>
            <div className="hl-v-won">
              <span>✓ +1 SORTEIO REGISTRADO</span>
            </div>
          </div>
          <i className="hl-led-dots" />
        </div>
      </div>

      <i className="hl-dash" />

      <Drone />
      <Hud />
      <TramSpeed />
    </>
  )
}
