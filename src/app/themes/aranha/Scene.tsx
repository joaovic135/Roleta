import { CITY, City, phase } from './City'
import { Page, Reactions } from './Comic'
import {
  BOLT,
  DEW,
  HERO,
  RAYS,
  STORM_CLOUDS,
  WEB,
  buildClouds,
  buildStars,
  burst,
  circ,
  flock,
  rainTile,
} from './geo'
import {
  HeroInset,
  InsetDefs,
  Narration,
  VillainInset,
  Zeppelin,
} from './Story'

// Cena do tema Homem-Aranha (HQ): uma página de gibi viva, "TEIA RUBRA
// Nº 57". A cidade de Nova York em cores chapadas, nanquim grosso e
// retícula Ben-Day é o quadro principal; por cima, a moldura de papel com
// requadro, legendas amarelas de narrador, balões nas janelas, quadros de
// detalhe que se desenham (lápis → nanquim → cor) e onomatopeias.
//
// Ciclo de --hq-cycle (5 min, linha do tempo completa em theme.css):
// fim de tarde → noite (perseguição policial, ataque do Dr. Engrenagem)
// → tempestade de nanquim (KRA-KOOM!) → amanhecer → manhã de céu azul
// pontilhado → a página vira (a folha cobre a tela e a cena volta ao fim
// de tarde por baixo dela). Laços próprios: herói balançando na teia
// (50 s, THWIP! a cada ancoragem), trânsito, holofotes, neon com mau
// contato, outdoor de lâmpadas, vapor dos bueiros, aranha no fio.
// Detalhes de vida: gente, gatos e vasos nas janelas acesas, um gato de
// olhos acesos no outdoor da pizzaria, e o herói (capuz azul-noite, lentes
// que brilham, cachecol vermelho) agachado na coroa da torre déco: salta
// quando a perseguição começa, no instante em que o balanço entra (50 s
// divide os 300 s do ciclo, então o encontro se repete a cada volta), e
// volta ao amanhecer para ver o sol nascer.
// Roleta: girando, linhas de velocidade + VUUUSH!; vencedor, KAPOW! na
// cor da fatia (--win-color), teia atirada e estouros nas margens, que
// assentam num brilho calmo enquanto o modal estiver aberto.
//
// Tudo é SVG/CSS desenhado aqui (personagens originais), gerado com
// semente fixa; só transform/opacity animam, sempre nas <div>/<svg> de
// fora, nunca em elementos dentro de um <svg>.

const STARS = buildStars()
const CLOUDS_FAR = buildClouds(31, 5, 0.7)
const CLOUDS_NEAR = buildClouds(57, 4, 1.05)
const RAIN_FAR = rainTile(160, 600, 18, false)
const RAIN_NEAR = rainTile(240, 900, 11, true)
const BURSTS = [
  { text: 'KRA-KOOM!', d: burst(3, 160, 85, 150, 78), k: 0, cls: 'hq-boom-a' },
  {
    text: 'BRA-DOOM!',
    d: burst(8, 160, 85, 150, 78),
    k: -0.05,
    cls: 'hq-boom-b',
  },
  {
    text: 'KA-BLAM!',
    d: burst(13, 160, 85, 150, 78),
    k: -0.1,
    cls: 'hq-boom-c',
  },
]
const THWIP = burst(52, 60, 30, 56, 28, 11)
const SPIDER_BODY =
  'M32 17a6 7 0 1 1 0 14a6 7 0 1 1 0-14zM32 28a8 11 0 1 1 0 22a8 11 0 1 1 0-22z'
const SPIDER_LEGS =
  'M27 22L16 12L8 16M37 22L48 12L56 16M26 28L12 26L4 32M38 28L52 26L60 32' +
  'M26 34L12 40L6 50M38 34L52 40L58 50M28 40L18 52L16 62M36 40L46 52L48 62'

function Defs() {
  return (
    <svg className="hq-defs" aria-hidden="true">
      <defs>
        {/* retícula de pontos usada por várias camadas */}
        <pattern
          id="hq-ht"
          width="7"
          height="7"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(45)"
        >
          <circle cx="3.5" cy="3.5" r="1.7" fill="#000" fillOpacity="0.3" />
        </pattern>
        <radialGradient id="hq-eyeglow">
          <stop offset="0" stopColor="#b5fbff" stopOpacity="0.95" />
          <stop offset="0.45" stopColor="#58d9ff" stopOpacity="0.45" />
          <stop offset="1" stopColor="#58d9ff" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="hq-glow-y">
          <stop offset="0" stopColor="#fff2b0" stopOpacity="0.5" />
          <stop offset="0.55" stopColor="#ffd84a" stopOpacity="0.16" />
          <stop offset="1" stopColor="#ffd84a" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="hq-glow-r">
          <stop offset="0" stopColor="#ff4257" stopOpacity="0.55" />
          <stop offset="0.55" stopColor="#ff4257" stopOpacity="0.16" />
          <stop offset="1" stopColor="#ff4257" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="hq-glow-p">
          <stop offset="0" stopColor="#ff5fcf" stopOpacity="0.55" />
          <stop offset="0.55" stopColor="#ff5fcf" stopOpacity="0.16" />
          <stop offset="1" stopColor="#ff5fcf" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="hq-cateye">
          <stop offset="0" stopColor="#ffe14d" stopOpacity="0.7" />
          <stop offset="1" stopColor="#ffe14d" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="hq-redglow">
          <stop offset="0" stopColor="#ff8a7a" stopOpacity="0.95" />
          <stop offset="0.45" stopColor="#ff3b3b" stopOpacity="0.4" />
          <stop offset="1" stopColor="#ff3b3b" stopOpacity="0" />
        </radialGradient>
        {/* geometria usada em várias cópias de cor (uma vez só no HTML) */}
        <path id="hq-cf" d={CLOUDS_FAR} />
        <path id="hq-cn" d={CLOUDS_NEAR} />
        <path id="hq-cs" d={STORM_CLOUDS} />
        <path id="hq-far" d={CITY.far} />
        <path id="hq-sil" d={CITY.sil} />
        <path id="hq-web" d={WEB} />
        <InsetDefs />
      </defs>
    </svg>
  )
}

function CloudBand({ id, cls }: { id: string; cls: string }) {
  return (
    <div className={`hq-clouds ${cls}`}>
      <div className="hq-cloudband">
        <svg viewBox="0 0 3200 300" preserveAspectRatio="none">
          <use href={id} className="hq-cloud-ink" />
          <use href={id} className="hq-cloud-night" />
        </svg>
        <svg
          className="hq-cyc hq-c-warm"
          viewBox="0 0 3200 300"
          preserveAspectRatio="none"
        >
          <use href={id} className="hq-cloud-ink" />
          <use href={id} className="hq-cloud-warm" />
        </svg>
        <svg
          className="hq-cyc hq-c-day"
          viewBox="0 0 3200 300"
          preserveAspectRatio="none"
        >
          <use href={id} className="hq-cloud-ink" />
          <use href={id} className="hq-cloud-day" />
        </svg>
      </div>
    </div>
  )
}

function Sky() {
  return (
    <>
      {/* céus que cruzam a opacidade por cima da noite (fundo do tema) */}
      <div className="hq-sky hq-sky-dusk hq-cyc" />
      <div className="hq-sky hq-sky-dawn hq-cyc" />
      <div className="hq-sky hq-sky-day hq-cyc" />
      <div className="hq-dots hq-dots-dusk hq-cyc" />
      <div className="hq-dots hq-dots-day hq-cyc" />

      <div className="hq-stars hq-cyc">
        <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMin slice">
          <path d={STARS.dots} />
        </svg>
        <svg
          className="hq-tw"
          viewBox="0 0 1600 900"
          preserveAspectRatio="xMidYMin slice"
        >
          <path d={STARS.twA} />
        </svg>
        <svg
          className="hq-tw hq-tw-b"
          viewBox="0 0 1600 900"
          preserveAspectRatio="xMidYMin slice"
        >
          <path d={STARS.twB} />
        </svg>
      </div>
      <div className="hq-shoot hq-shoot-1">
        <i className="hq-cyc" />
      </div>
      <div className="hq-shoot hq-shoot-2">
        <i className="hq-cyc" style={phase(-0.17)} />
      </div>

      {/* sol do fim de tarde: laranja listrado, desce atrás do hotel */}
      <div className="hq-sun hq-sun-dusk hq-cyc">
        <svg viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="40" fill="#ff6a2b" />
          <path
            d="M14 58h72v5h-72zM18 68h64v5h-64zM25 78h50v4h-50z"
            fill="#ffb347"
          />
          <path
            d="M50 10A40 40 0 0 1 50 90A26 40 0 0 0 50 10Z"
            fill="url(#hq-ht)"
          />
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="#05060c"
            strokeWidth="3"
          />
        </svg>
      </div>
      {/* sol da manhã: amarelo, com raios de HQ girando */}
      <div className="hq-sun hq-sun-day hq-cyc">
        <div className="hq-flare">
          <svg className="hq-flare-rays" viewBox="0 0 600 600">
            <path d={RAYS} />
          </svg>
        </div>
        <svg viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="36" fill="#ffd23f" />
          <path
            d="M86 50A36 36 0 0 1 50 86A44 44 0 0 0 86 50Z"
            fill="url(#hq-ht)"
          />
          <circle
            cx="50"
            cy="50"
            r="36"
            fill="none"
            stroke="#05060c"
            strokeWidth="3"
          />
        </svg>
      </div>

      {/* lua cheia de gibi na margem direita */}
      <div className="hq-moon hq-cyc">
        <svg viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="40" fill="#fff1c4" />
          <path
            d={
              circ(36, 38, 7) +
              circ(60, 30, 4.5) +
              circ(58, 62, 9) +
              circ(34, 66, 4)
            }
            fill="#e6cf8e"
          />
          <path
            d="M50 10A40 40 0 0 1 50 90A26 40 0 0 0 50 10Z"
            fill="url(#hq-ht)"
          />
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="#05060c"
            strokeWidth="2.6"
          />
        </svg>
      </div>

      {/* holofotes varrendo as nuvens à noite */}
      <div className="hq-search hq-cyc">
        <i className="hq-beam hq-beam-a" />
        <i className="hq-beam hq-beam-b" />
      </div>

      <CloudBand id="#hq-cf" cls="hq-clouds-far" />

      {/* dirigível de propaganda (fim de tarde e manhã) */}
      <div className="hq-blimp hq-cyc">
        <svg viewBox="0 0 240 92">
          <path
            d="M30 44L4 18L18 18L42 36ZM30 46L4 72L18 72L42 54Z"
            fill="#e23636"
            stroke="#05060c"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          <ellipse
            cx="124"
            cy="45"
            rx="98"
            ry="32"
            fill="#dfe4ee"
            stroke="#05060c"
            strokeWidth="3"
          />
          <path d="M26 45A98 32 0 0 0 222 45Z" fill="url(#hq-ht)" />
          <path
            d="M110 76h30v10h-30z"
            fill="#3a4258"
            stroke="#05060c"
            strokeWidth="2.5"
          />
          <path
            d="M70 30h108v30h-108z"
            fill="#ffd23f"
            stroke="#05060c"
            strokeWidth="2.5"
          />
          <text className="hq-blimp-text" x="124" y="54">
            GIRE JÁ!
          </text>
        </svg>
      </div>

      <CloudBand id="#hq-cn" cls="hq-clouds-near" />

      {/* pombos cruzando o cabeçalho de manhã */}
      <div className="hq-birds hq-cyc">
        <svg viewBox="0 0 130 40">
          <path d={flock(true)} />
        </svg>
        <svg className="hq-birds-down" viewBox="0 0 130 40">
          <path d={flock(false)} />
        </svg>
      </div>
    </>
  )
}

function Storm() {
  return (
    <>
      {/* tempestade: nuvens pesadas, chuva de nanquim, raios e estouros */}
      <div className="hq-storm hq-cyc">
        <div className="hq-stormband">
          <svg viewBox="0 0 3200 300" preserveAspectRatio="none">
            <use href="#hq-cs" className="hq-cloud-ink" />
            <use href="#hq-cs" className="hq-cloud-storm" />
          </svg>
        </div>
      </div>
      <div className="hq-rain hq-cyc">
        <div className="hq-rain-far" style={{ backgroundImage: RAIN_FAR }} />
        <div className="hq-rain-near" style={{ backgroundImage: RAIN_NEAR }} />
      </div>
      {BURSTS.map(({ cls, k }) => (
        <svg
          key={cls}
          className={`hq-bolt hq-cyc ${cls}`}
          viewBox="0 0 60 240"
          style={phase(k)}
        >
          <path d={BOLT} />
        </svg>
      ))}
      <div className="hq-flash hq-cyc" />
      {BURSTS.map(({ text, d, k, cls }) => (
        <div key={text} className={`hq-burst hq-cyc ${cls}`} style={phase(k)}>
          <svg viewBox="0 0 320 170">
            <path d={d} transform="translate(9 9)" fill="#e23636" />
            <path
              d={d}
              fill="#ffe14d"
              stroke="#05060c"
              strokeWidth="4"
              strokeLinejoin="round"
            />
            <text x="160" y="104">
              {text}
            </text>
          </svg>
        </div>
      ))}
    </>
  )
}

// Herói da teia: âncora → rotor (gira a teia) → linha + herói
function Hero() {
  return (
    <div className="hq-swing">
      <div className="hq-swing-anchor">
        <div className="hq-swing-rotor">
          <i className="hq-swing-line" />
          <svg className="hq-hero" viewBox="-40 -6 80 110">
            <circle cx="-3.5" cy="18.5" r="11" fill="url(#hq-eyeglow)" />
            <path
              d={HERO.speed}
              fill="none"
              stroke="#05060c"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
            <path
              d={HERO.scarf}
              fill="#e23636"
              stroke="#05060c"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            <path
              d={HERO.limbs}
              fill="none"
              stroke="#05060c"
              strokeWidth="13"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d={HERO.torso}
              fill="#1b2350"
              stroke="#05060c"
              strokeWidth="3"
              strokeLinejoin="round"
            />
            <g
              fill="none"
              strokeWidth="8.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d={HERO.suit} stroke="#1b2350" />
              <path d={HERO.red} stroke="#e23636" />
            </g>
            <path
              d={HERO.rim}
              fill="none"
              stroke="#5b8cff"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
            <circle
              cx="-6"
              cy="19"
              r="8.6"
              fill="#1d2658"
              stroke="#05060c"
              strokeWidth="2.6"
            />
            <path
              d={HERO.eyes}
              fill="#eafcff"
              stroke="#05060c"
              strokeWidth="1.4"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        {/* THWIP! onde a mão agarra a teia, a cada balanço */}
        <div className="hq-thwip">
          <div className="hq-thwip-flip">
            <svg viewBox="0 0 120 60">
              <path
                d={THWIP}
                fill="#fff6d8"
                stroke="#05060c"
                strokeWidth="3"
                strokeLinejoin="round"
              />
              <text x="60" y="39">
                THWIP!
              </text>
            </svg>
          </div>
        </div>
      </div>
    </div>
  )
}

function Webs() {
  return (
    <>
      <svg className="hq-web hq-web-tl" viewBox="0 0 300 300">
        <use href="#hq-web" />
      </svg>
      <svg className="hq-web hq-web-br" viewBox="0 0 300 300">
        <use href="#hq-web" />
      </svg>
      {/* orvalho brilhando nas teias ao amanhecer */}
      <div className="hq-dew hq-cyc">
        <svg className="hq-tw hq-dew-tl" viewBox="0 0 300 300">
          <path d={DEW[0]} />
        </svg>
        <svg className="hq-tw hq-tw-b hq-dew-tl" viewBox="0 0 300 300">
          <path d={DEW[1]} />
        </svg>
        <svg className="hq-dew-br" viewBox="0 0 300 300">
          <path d={DEW[0] + DEW[1]} />
        </svg>
      </div>
      {/* aranha pendurada no fio, no espaço livre do cabeçalho */}
      <div className="hq-spider">
        <svg viewBox="0 0 64 64">
          <path className="hq-spider-legs" d={SPIDER_LEGS} />
          <path className="hq-spider-body" d={SPIDER_BODY} />
        </svg>
      </div>
    </>
  )
}

export default function AranhaScene() {
  return (
    <>
      <Defs />
      <Sky />
      <City />
      <Zeppelin />
      <Storm />
      <Hero />
      <Webs />
      <Narration />
      <HeroInset />
      <VillainInset />
      <Reactions />
      <Page />
    </>
  )
}
